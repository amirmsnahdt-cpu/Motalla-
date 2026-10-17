#!/usr/bin/env python3
"""Remove CSS declarations in src/css that can never take effect.

A declaration `P: v` in rule A is dead when, for EVERY selector of A, a LATER rule
with exactly the same selector, in exactly the same @media context, sets the same
property P with equal or higher importance (!important). Same selector = same
specificity and the same set of elements, so the later one always wins the cascade
and the earlier one is never used. Removing it changes nothing on screen.

Safety limits (a later rule is NOT trusted to override when a browser could drop it):
  - later rules whose selectors use newer syntax (:has, :is, :where, vendor pseudos …)
  - later values with newer units/functions (dvh, color-mix, min/max/clamp, oklch …)
  - @keyframes contents are never touched; duplicates inside one rule (fallbacks) are kept.
Rules left empty are removed; nothing else in the files is changed.

Usage: python3 tools/css_dedupe.py          # report only
       python3 tools/css_dedupe.py --write  # apply to src/css
"""
import pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
FILES = sorted((ROOT / 'src/css').glob('*.css'))
UNSAFE_SEL = re.compile(r':has\(|:is\(|:where\(|::?-webkit-|::?-moz-|:focus-visible|::backdrop|:popover|:user-')
UNSAFE_VAL = re.compile(r'\b(dvh|svh|lvh|dvw|svw|lvw|cqw|cqh|cqi)\b|color-mix|oklch|oklab|\blab\(|lch\(|light-dark|\bmin\(|\bmax\(|clamp\(|round\(|-webkit-|-moz-', re.I)


def scan(text):
    """Yield tokens: ('open', prelude, start, brace_pos), ('close', pos), ('decls', start, end) using a
    tokenizer that respects comments, strings and parentheses."""
    i, n, depth_par = 0, len(text), 0
    seg = 0
    while i < n:
        c = text[i]
        if c == '/' and text.startswith('/*', i):
            j = text.find('*/', i + 2); i = n if j < 0 else j + 2; continue
        if c in '"\'':
            j = i + 1
            while j < n and text[j] != c:
                j += 2 if text[j] == '\\' else 1
            i = j + 1; continue
        if c == '(':
            depth_par += 1
        elif c == ')':
            depth_par = max(0, depth_par - 1)
        elif depth_par == 0 and c == '{':
            yield ('open', seg, i); seg = i + 1
        elif depth_par == 0 and c == '}':
            yield ('close', seg, i); seg = i + 1
        elif depth_par == 0 and c == ';':
            yield ('semi', seg, i)
        i += 1


def strip_comments(s):
    return re.sub(r'/\*.*?\*/', '', s, flags=re.S)


def norm_sel(s):
    s = re.sub(r'\s+', ' ', strip_comments(s)).strip()
    return re.sub(r'\s*([>+~])\s*', r'\1', s)


def split_top(s, sep):
    out, d, cur, q = [], 0, '', None
    for ch in s:
        if q:
            cur += ch
            if ch == q: q = None
            continue
        if ch in '"\'': q = ch
        elif ch in '([': d += 1
        elif ch in ')]': d -= 1
        if ch == sep and d == 0:
            out.append(cur); cur = ''
        else:
            cur += ch
    out.append(cur)
    return out


def split_decls(body):
    """Split a declaration block on top-level ';' (aware of comments, strings and parentheses)."""
    out, i, n, d, start = [], 0, len(body), 0, 0
    while i < n:
        c = body[i]
        if c == '/' and body.startswith('/*', i):
            j = body.find('*/', i + 2); i = n if j < 0 else j + 2; continue
        if c in '"\'':
            j = i + 1
            while j < n and body[j] != c:
                j += 2 if body[j] == '\\' else 1
            i = j + 1; continue
        if c == '(': d += 1
        elif c == ')': d = max(0, d - 1)
        elif c == ';' and d == 0:
            out.append(body[start:i]); start = i + 1
        i += 1
    out.append(body[start:])
    return out


def parse():
    """Return list of rules in document order: dict(file, ctx, sels, unsafe, block=(start,end), decls=[...])."""
    rules = []
    for fi, f in enumerate(FILES):
        text = f.read_text(encoding='utf-8')
        stack = []   # entries: ('at', prelude) | ('rule', rule)
        for kind, a, b in scan(text):
            if kind == 'open':
                pre = text[stack[-1][2] if False else a:b]
                prelude = re.sub(r'\s+', ' ', strip_comments(pre)).strip()
                if prelude.startswith('@'):
                    stack.append(('at', prelude, b + 1))
                else:
                    ctx = tuple(p for k, p, *_ in stack if k == 'at')
                    sels = [norm_sel(x) for x in split_top(prelude, ',')]
                    r = dict(file=fi, ctx=ctx, sels=sels, unsafe=bool(UNSAFE_SEL.search(prelude)),
                             skip=any(c.startswith('@keyframes') or not c.startswith('@media') for c in ctx),
                             sel_start=a, body_start=b + 1, decls=[])
                    stack.append(('rule', r, b + 1)); rules.append(r)
            elif kind == 'close':
                if not stack: continue
                k, obj, start = stack.pop()
                if k == 'rule':
                    obj['body_end'] = b; obj['close'] = b
                    body = text[obj['body_start']:b]
                    # declarations: split on top-level ';' within body
                    pos = obj['body_start']
                    for part in split_decls(body):
                        raw = part
                        clean = strip_comments(raw).strip()
                        if ':' in clean:
                            prop, val = clean.split(':', 1)
                            imp = bool(re.search(r'!\s*important\s*$', val, re.I))
                            obj['decls'].append(dict(prop=prop.strip().lower(), val=val.strip(), imp=imp, start=pos, end=pos + len(raw)))
                        pos += len(raw) + 1
            # 'semi' outside rules (e.g. @import) ignored
        for r in rules:
            if r['file'] == fi: r['text_len'] = len(text)
    return rules


def find_dead(rules):
    dead = []   # (rule_index, decl_index)
    # for each (ctx, selector, prop) remember the latest trusted decl after a point: walk backwards
    best = {}   # (ctx, sel, prop) -> max importance seen in later trusted rules
    for ri in range(len(rules) - 1, -1, -1):
        r = rules[ri]
        if r['skip']:
            continue
        props_here = [d['prop'] for d in r['decls']]
        for di, d in enumerate(r['decls']):
            if props_here.count(d['prop']) > 1:
                continue   # fallback pattern inside one rule: keep
            if all(best.get((r['ctx'], s, d['prop']), -1) >= int(d['imp']) for s in r['sels']):
                dead.append((ri, di))
        if not r['unsafe']:
            for d in r['decls']:
                if UNSAFE_VAL.search(d['val']) or d['prop'].startswith('-') and not d['prop'].startswith('--'):
                    continue
                if props_here.count(d['prop']) > 1:
                    continue
                for s in r['sels']:
                    k = (r['ctx'], s, d['prop'])
                    best[k] = max(best.get(k, -1), int(d['imp']))
    return dead


def apply(rules, dead):
    by_file = {}
    dset = set(dead)
    for ri, r in enumerate(rules):
        gone = [di for di in range(len(r['decls'])) if (ri, di) in dset]
        if not gone: continue
        if len(gone) == len(r['decls']):
            by_file.setdefault(r['file'], []).append((r['sel_start'], r['close'] + 1, 'rule'))
        else:
            for di in gone:
                d = r['decls'][di]
                # remove the declaration and its trailing ';'
                by_file.setdefault(r['file'], []).append((d['start'], d['end'] + 1, 'decl'))
    for fi, cuts in by_file.items():
        f = FILES[fi]; text = f.read_text(encoding='utf-8')
        for a, b, kind in sorted(cuts, reverse=True):
            if kind == 'decl' and b > len(text): b = len(text)
            if kind == 'decl' and text[b - 1:b] != ';':
                b -= 1   # last declaration without ';'
            seg = text[a:b]
            if kind == 'rule':
                # keep leading whitespace/comments before the selector
                lead = re.match(r'(\s*(?:/\*.*?\*/\s*)*)', seg, re.S).group(1)
                text = text[:a] + lead + text[b:]
            else:
                text = text[:a] + text[b:]
        # drop @media blocks that became empty
        prev = None
        while prev != text:
            prev = text
            text = re.sub(r'@media[^{}]*\{\s*\}', '', text)
        f.write_text(text, encoding='utf-8')


if __name__ == '__main__':
    rules = parse()
    dead = find_dead(rules)
    nrules = sum(1 for ri, r in enumerate(rules) if r['decls'] and all((ri, di) in set(dead) for di in range(len(r['decls']))))
    print(f'{len(rules)} rules, {sum(len(r["decls"]) for r in rules)} declarations; dead declarations: {len(dead)} (whole rules emptied: {nrules})')
    if '--write' in sys.argv:
        apply(rules, dead)
        print('src/css updated')
