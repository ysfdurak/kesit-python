#!/usr/bin/env python3
"""PY_INTERVIEW üreteci: partN.py modüllerindeki Q listesini JS dosyasına yazar.
Kullanım: python3 gen.py part1 m1_01.js 1   (son argüman: başlangıç id numarası)"""
import html, importlib, json, re, subprocess, sys, os

OUT_DIR = '/home/claude/py/v3/m1'
ROLES = {'genel', 'analist', 'bilimci', 'ml', 'muhendis', 'backend', 'web', 'otomasyon', 'ai', 'davranissal'}
KINDS = {'kavram', 'kod-okuma', 'tasarim', 'davranissal', 'vaka'}
LVS = {'temel', 'orta', 'ileri'}


def js(s):
    return "'" + s.replace('\\', '\\\\').replace("'", "\\'").replace('\n', '\\n').replace('\r', '') + "'"


def run(code):
    r = subprocess.run([sys.executable, '-I', '-c', code], capture_output=True, text=True, timeout=30,
                       cwd=os.path.dirname(os.path.abspath(__file__)) + '/../m1verify')
    if r.returncode != 0:
        last = r.stderr.strip().splitlines()[-1]
        return r.stdout, last
    return r.stdout, None


def words(h):
    t = re.sub(r'<[^>]+>', ' ', h)
    return len(t.split())


def main():
    mod, fname, start = sys.argv[1], sys.argv[2], int(sys.argv[3])
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    Q = importlib.import_module(mod).Q
    parts, errs = [], []
    for i, q in enumerate(Q):
        qid = 'm-%03d' % (start + i)
        tag = f'{qid} ({q.get("topic")})'
        for k in ('roles', 'lv', 'topic', 'kind', 'q', 'a', 'follow', 'flags', 'tip'):
            if not q.get(k): errs.append(f'{tag}: {k} yok')
        if not set(q['roles']) <= ROLES: errs.append(f'{tag}: rol {q["roles"]}')
        if q['kind'] not in KINDS: errs.append(f'{tag}: kind')
        if q['lv'] not in LVS: errs.append(f'{tag}: lv')
        if not 1 <= len(q['follow']) <= 3 or not 1 <= len(q['flags']) <= 3: errs.append(f'{tag}: follow/flags sayısı')
        w = words(q['a'])
        if not 80 <= w <= 220: errs.append(f'{tag}: a {w} kelime')
        if q['kind'] == 'kod-okuma' and not q.get('code'): errs.append(f'{tag}: kod-okuma ama code yok')
        if q.get('code'):
            out, err = run(q['code'])
            got = out.rstrip() if err is None else ((out.rstrip() + '\n') if out.strip() else '') + err
            if 'out' not in q: errs.append(f'{tag}: out yok; gerçek: {got!r}')
            elif err is not None and q['out'].rstrip().startswith(out.rstrip()) and q['out'].rstrip().splitlines()[-1].startswith(err.split(':')[0]):
                pass
            elif q['out'].rstrip() != got: errs.append(f'{tag}: out farklı\n  yazılan: {q["out"]!r}\n  gerçek : {got!r}')
        fields = [f"id: {js(qid)}", 'roles: [' + ', '.join(js(r) for r in q['roles']) + ']', f"lv: {js(q['lv'])}",
                  f"topic: {js(q['topic'])}", f"kind: {js(q['kind'])}", f"q: {js(q['q'])}", f"a: {js(q['a'])}"]
        if q.get('code'):
            fields += [f"code: {js(q['code'])}", f"out: {js(q.get('out', ''))}"]
        fields += ['follow: [' + ', '.join(js(x) for x in q['follow']) + ']',
                   'flags: [' + ', '.join(js(x) for x in q['flags']) + ']', f"tip: {js(q['tip'])}"]
        parts.append('{ ' + ',\n  '.join(fields) + ' }')
    if errs:
        print('\n'.join(errs)); sys.exit(1)
    src = "(function (W) { 'use strict'; const Q = W.PY_INTERVIEW = W.PY_INTERVIEW || []; Q.push(\n" + ',\n'.join(parts) + '\n); })(window);\n'
    path = os.path.join(OUT_DIR, fname)
    open(path, 'w', encoding='utf-8').write(src)
    from collections import Counter
    print(path, len(Q), 'öğe', dict(Counter(q['kind'] for q in Q)), dict(Counter(q['lv'] for q in Q)))


if __name__ == '__main__':
    main()
