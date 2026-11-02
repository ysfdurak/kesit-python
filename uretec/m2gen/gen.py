"""PY_INTERVIEW üreteci: python3 gen.py <modul_adi> <ilk_id> <cikti.js>"""
import importlib, json, re, subprocess, sys, tempfile, textwrap

def js(s):
    return "'" + s.replace('\\', '\\\\').replace("'", "\\'").replace('\n', '\\n') + "'"

def run(code):
    with tempfile.TemporaryDirectory() as td:
        p = subprocess.run([sys.executable, '-I', '-c', code], capture_output=True, text=True, cwd=td, timeout=120)
    if p.returncode != 0:
        raise SystemExit('KOD HATASI:\n' + code + '\n' + p.stderr)
    return '\n'.join(l.rstrip() for l in p.stdout.split('\n')).strip()

def words(h):
    return len(re.sub(r'<[^>]+>', ' ', h).split())

def main(mod, first, path):
    items = importlib.import_module(mod).ITEMS
    parts = []
    for i, it in enumerate(items):
        iid = 'm-%03d' % (first + i)
        code = it.get('code')
        if code:
            code = textwrap.dedent(code).strip('\n') + '\n'
            out = run(code)
            print(f'--- {iid} out ---\n{out}')
        w = words(it['a'])
        if not 80 <= w <= 220: print(f'!! {iid} kelime={w}')
        for k in ('follow', 'flags', 'tip'): assert it.get(k), (iid, k)
        f = [f"id: {js(iid)}", f"roles: [{', '.join(js(r) for r in it['roles'])}]", f"lv: {js(it['lv'])}",
             f"topic: {js(it['topic'])}", f"kind: {js(it['kind'])}", f"q: {js(it['q'])}", f"a: {js(it['a'])}"]
        if code:
            f += [f"code: {js(code)}", f"out: {js(out)}"]
        f += [f"follow: [{', '.join(js(x) for x in it['follow'])}]", f"flags: [{', '.join(js(x) for x in it['flags'])}]", f"tip: {js(it['tip'])}"]
        parts.append('{ ' + ',\n  '.join(f) + ' }')
    src = "(function (W) { 'use strict'; const Q = W.PY_INTERVIEW = W.PY_INTERVIEW || []; Q.push(\n" + ',\n'.join(parts) + '\n); })(window);\n'
    open(path, 'w', encoding='utf-8').write(src)
    from collections import Counter
    print(path, len(items), Counter(x['kind'] for x in items), Counter(x['lv'] for x in items), Counter(x['roles'][0] for x in items))

if __name__ == '__main__':
    sys.path.insert(0, '.')
    main(sys.argv[1], int(sys.argv[2]), sys.argv[3])
