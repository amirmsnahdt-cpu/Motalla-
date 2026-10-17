#!/usr/bin/env python3
"""Rebuild app.js/styles.css from src/, then bump the app version everywhere it must change.
Usage: python3 tools/bump.py 51.6"""
import re, sys, pathlib, subprocess
v = sys.argv[1]
subprocess.run([sys.executable, str(pathlib.Path(__file__).resolve().parent / 'build.py')], check=True)
p = pathlib.Path(__file__).resolve().parent.parent / 'index.html'
s = p.read_text(encoding='utf-8')
s, a = re.subn(r'const APP_V=[0-9.]+', 'const APP_V=' + v, s)
s, b = re.subn(r'var V=[0-9.]+,s=localStorage', 'var V=' + v + ',s=localStorage', s)
s, c = re.subn(r'(app\.js|styles\.css)\?v=[0-9.]+', r'\1?v=' + v, s)
assert (a, b, c) == (1, 1, 2), (a, b, c)
p.write_text(s, encoding='utf-8')
print('version ->', v)
