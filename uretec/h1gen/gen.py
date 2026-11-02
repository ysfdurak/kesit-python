#!/usr/bin/env python3
"""Sık hatalar üreteci: partN.py içindeki kayıtları gerçek CPython ile çalıştırıp
bad_out/bad_err/good_out alanlarını doldurur ve JS dosyası yazar.
Kullanım: python3 gen.py part1 [part2 ...]   -> /home/claude/py/v3/h1/h1_XX.js
"""
import sys, os, importlib, json
sys.path.insert(0, '/home/claude/py/tools')
from verify import py, norm

OUT = '/home/claude/py/v3/h1'
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)


def js(s):
    s = str(s)
    return "'" + s.replace('\\', '\\\\').replace("'", "\\'").replace('\n', '\\n').replace('\r', '') + "'"


def build(part):
    mod = importlib.import_module(part)
    start = mod.START
    recs = []
    problems = []
    for i, e in enumerate(mod.ITEMS):
        hid = 'h-%03d' % (start + i)
        topic, lv, title, bad, good, why, rule = e
        assert lv in ('temel', 'orta', 'ileri'), hid
        rb = py(bad); rg = py(good)
        rec = {'id': hid, 'topic': topic, 'lv': lv, 'title': title, 'bad': bad}
        if rb['err']:
            rec['bad_err'] = rb['etype']
            badshow = 'ERR ' + rb['etype'] + ' | ' + rb['err'].strip().splitlines()[-1]
        else:
            rec['bad_out'] = norm(rb['out'])
            badshow = rec['bad_out']
        rec['good'] = good
        if rg['err']:
            problems.append(hid + ' good hata: ' + rg['err'][-300:])
            goodshow = 'ERR ' + rg['err'].strip().splitlines()[-1]
        else:
            rec['good_out'] = norm(rg['out'])
            goodshow = rec['good_out']
        if not rb['err'] and not rg['err'] and norm(rb['out']) == norm(rg['out']):
            problems.append(hid + ' bad ve good aynı çıktı')
        rec['why'] = why; rec['rule'] = rule
        recs.append(rec)
        print(f'--- {hid} [{lv}] {title}\n  BAD : {badshow!r}\n  GOOD: {goodshow!r}')
    keys = ['id', 'topic', 'lv', 'title', 'bad', 'bad_out', 'bad_err', 'good', 'good_out', 'why', 'rule']
    body = ',\n'.join('{ ' + ',\n  '.join(f'{k}: {js(r[k])}' for k in keys if k in r) + ' }' for r in recs)
    src = "(function (W) { 'use strict'; const M = W.PY_MISTAKES = W.PY_MISTAKES || []; M.push(\n" + body + "\n); })(window);\n"
    fn = os.path.join(OUT, 'h1_%02d.js' % int(part.replace('part', '')))
    with open(fn, 'w', encoding='utf-8') as f: f.write(src)
    print('YAZILDI', fn, len(recs), 'kayıt')
    for p in problems: print('SORUN', p)


if __name__ == '__main__':
    for p in sys.argv[1:]: build(p)
