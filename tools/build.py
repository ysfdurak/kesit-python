#!/usr/bin/env python3
"""Yayın paketini derler: v2/<grup>/*.js parçalarını türüne göre (ders / uzantı / pratik / sınav) birleştirir,
her birini node --check ile denetler ve index.html'deki içerik betiklerini günceller.
Kaynak: kaynak/ klasörü. Çıktı: deponun kökü (GitHub Pages: main / root). data/ kökte durur, kopyalanmaz."""
import glob, os, re, shutil, subprocess, json, sys
import os as _os
KOK = _os.path.dirname(_os.path.dirname(_os.path.abspath(__file__)))
ROOT = KOK + '/kaynak'; DIST = KOK
# yalnız önceki derlemenin ürettiği paketleri sil (kök klasörde kaynak/araç/veri de var)
for f in glob.glob(DIST + '/[nx]_*.js'): os.remove(f)

def ok(path):
    r = subprocess.run(['node', '--check', path], capture_output=True, text=True)
    return r.returncode == 0, r.stderr[-400:]

groups = {'lessons': [], 'ext': [], 'bank': [], 'exams': [], 'arena': [], 'interview': [], 'mistakes': []}
skipped = []
for f in sorted(glob.glob(ROOT + '/v2/*/*.js') + glob.glob(ROOT + '/v3/*/*.js')):
    s = open(f, encoding='utf-8').read()
    good, err = ok(f)
    if not good: skipped.append((f, err)); continue
    if 'PY_ARENA' in s: groups['arena'].append(f)
    elif 'PY_INTERVIEW' in s: groups['interview'].append(f)
    elif 'PY_MISTAKES' in s: groups['mistakes'].append(f)
    elif 'PY_EXT' in s: groups['ext'].append(f)
    elif 'PY_BANK' in s: groups['bank'].append(f)
    elif 'PY_EXAMS' in s: groups['exams'].append(f)
    elif 'PY_LESSONS' in s: groups['lessons'].append(f)
    else: skipped.append((f, 'tanınmayan içerik'))

def lv_of(f):
    s = open(f, encoding='utf-8').read(4000)
    m = re.search(r"lv:\s*'(temel|orta|ileri)'", s)
    return m.group(1) if m else 'orta'

out = []
def bundle(name, files):
    if not files: return
    with open(f'{DIST}/{name}', 'w', encoding='utf-8') as w:
        for f in files: w.write(open(f, encoding='utf-8').read().rstrip() + '\n')
    good, err = ok(f'{DIST}/{name}')
    assert good, (name, err)
    out.append(name)

for base in ['c_temel.js', 'c_orta.js', 'c_ileri.js']:
    shutil.copy(f'{ROOT}/{base}', f'{DIST}/{base}'); out.append(base)
for lv in ['temel', 'orta', 'ileri']:
    bundle(f'n_{lv}.js', [f for f in groups['lessons'] if lv_of(f) == lv])
# uzantıları ~2 MB'lık paketlere böl
cur, size, k = [], 0, 1
for f in groups['ext']:
    cur.append(f); size += os.path.getsize(f)
    if size > 2_000_000: bundle(f'x_{k}.js', cur); cur, size, k = [], 0, k + 1
bundle(f'x_{k}.js', cur)
shutil.copy(f'{ROOT}/bank.js', f'{DIST}/bank.js')
bank_extra = groups['bank']
if bank_extra:
    with open(f'{DIST}/bank.js', 'a', encoding='utf-8') as w:
        for f in bank_extra: w.write(open(f, encoding='utf-8').read().rstrip() + '\n')
assert ok(f'{DIST}/bank.js')[0]
out.append('bank.js')
shutil.copy(f'{ROOT}/exams.js', f'{DIST}/exams.js')
if groups['exams']:
    with open(f'{DIST}/exams.js', 'a', encoding='utf-8') as w:
        for f in groups['exams']: w.write(open(f, encoding='utf-8').read().rstrip() + '\n')
out.append('exams.js')
for nm, key in [('arena.js', 'arena'), ('interview.js', 'interview'), ('mistakes.js', 'mistakes')]:
    bundle(nm, groups[key])
extra = [x for x in ('arena.js', 'interview.js', 'mistakes.js') if x in out]
for f in ['recovery.js', 'levels.js', 'paths.js', 'engine.js', 'pyworker.js', 'ex_anahtar.js', 'bilinen-sinirlar.js', 'app.js', 'app2.js', 'portfolio.js', 'sync.js']:
    shutil.copy(f'{ROOT}/{f}', f'{DIST}/{f}')

html = open(f'{ROOT}/index.html', encoding='utf-8').read()
content = [x for x in out if x not in ('bank.js', 'exams.js', 'arena.js', 'interview.js', 'mistakes.js')]
tags = '\n'.join(f'<script charset="utf-8" src="{x}"></script>' for x in content)
html = re.sub(r'(<script charset="utf-8" src="paths.js"></script>\n)(?:<script charset="utf-8" src="[cnx]_[^"]+"></script>\n)*', lambda m: m.group(1) + tags + '\n', html)
html = html.replace('<!--EXTRA-->', '\n'.join(f'<script charset="utf-8" src="{x}"></script>' for x in extra))
open(f'{DIST}/index.html', 'w', encoding='utf-8').write(html)
print('paketler:', content + ['bank.js', 'exams.js'])
print('arena/mülakat/hata dosyası:', len(groups['arena']), len(groups['interview']), len(groups['mistakes']))
print('ders dosyası:', len(groups['lessons']), 'uzantı:', len(groups['ext']), 'pratik parça:', len(bank_extra), 'sınav parça:', len(groups['exams']))
for f, e in skipped: print('ATLANDI', f, e[:200])
tot = sum(os.path.getsize(f) for f in glob.glob(DIST + '/*.js') + [DIST + '/index.html'] + glob.glob(DIST + '/data/**', recursive=True) if os.path.isfile(f))
print(f'toplam boyut: {tot/1e6:.1f} MB')
