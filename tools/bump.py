#!/usr/bin/env python3
"""Rebuild app.js/styles.css from src/, then bump the app version everywhere it must change.
Usage: python3 tools/bump.py 51.6"""
import re, sys, pathlib, subprocess
v = sys.argv[1]
# The app compares versions as plain numbers (APP_V, the githack updater, /api/status). 69.10 == 69.1 < 69.9, so a
# "x.10" version looks OLDER and phones never update (this happened with 69.10-69.13). Refuse any version that is not
# numerically greater than the current one, and refuse a trailing zero after the dot (69.10 would print as 69.1).
_cur = re.search(r'const APP_V=([0-9.]+)', (pathlib.Path(__file__).resolve().parent.parent / 'index.html').read_text(encoding='utf-8'))
if not re.fullmatch(r'\d+\.\d', v) and not re.fullmatch(r'\d+(\.0)?', v):
    sys.exit('version must be N.D (one digit after the dot, e.g. 70.1); after N.9 go to (N+1).0')
if _cur and float(v) <= float(_cur.group(1)):
    sys.exit('version %s is not greater than current %s (numbers are compared, 69.10 < 69.9)' % (v, _cur.group(1)))
subprocess.run([sys.executable, str(pathlib.Path(__file__).resolve().parent / 'build.py')], check=True)
p = pathlib.Path(__file__).resolve().parent.parent / 'index.html'
s = p.read_text(encoding='utf-8')
s, a = re.subn(r'const APP_V=[0-9.]+', 'const APP_V=' + v, s)
s, b = re.subn(r'var V=[0-9.]+,s=localStorage', 'var V=' + v + ',s=localStorage', s)
s, c = re.subn(r'(app\.js|styles\.css)\?v=[0-9.]+', r'\1?v=' + v, s)
assert (a, b, c) == (1, 1, 2), (a, b, c)
p.write_text(s, encoding='utf-8')
print('version ->', v)
