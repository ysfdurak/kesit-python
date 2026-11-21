#!/usr/bin/env python3
"""Ders örneklerini (<pre class="py">) CPython'da ders başına ortak ad alanında çalıştırır, her bloğun çıktısını JSON'a yazar.
pyodide_examples.mjs (OUTJSON=...) çıktısıyla karşılaştırmak için. Kullanım: python3 cpy_outs.py cikti.json dosya1.js [...]
Ortam değişkeni ITEMS=<json> verilirse node yerine önceden dökülmüş ders listesini okur (Windows'ta node gerekmez)."""
import json, subprocess, sys, html, re, tempfile, os
from concurrent.futures import ThreadPoolExecutor
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from examples import DUMP, KOK
NB = r"""
import sys, json, io, contextlib, os, warnings
sys.path.insert(0, r"__KOK__/tools/pylib"); os.environ["PP_VERI"] = r"__KOK__/data"
try:
    import matplotlib; matplotlib.use("Agg")
except Exception: pass
blocks = json.loads(sys.stdin.buffer.read().decode("utf-8")); ns = {"__name__": "__main__"}; res = []
for i, code in enumerate(blocks):
    if code is None: res.append(None); continue
    buf = io.StringIO(); err = None; wbuf = []
    with warnings.catch_warnings(record=True) as w:
        warnings.simplefilter("always")
        try:
            with contextlib.redirect_stdout(buf): exec(compile(code, f"<ornek{i}>", "exec"), ns)
        except BaseException as e:
            err = (type(e).__name__ + ": " + str(e))[:200]
        wbuf = sorted(set(f"{x.category.__name__}: {str(x.message)[:160]}" for x in w))
    res.append([buf.getvalue(), err, wbuf])
sys.stdout.buffer.write(("\n@@JSON@@" + json.dumps(res, ensure_ascii=False)).encode("utf-8"))
""".replace('__KOK__', KOK)
SKIPRE = re.compile(r'input\(')
def run(item):
    lid, blocks = item
    payload = [None if SKIPRE.search(c) else c for c in blocks]
    with tempfile.TemporaryDirectory() as td:
        try:
            p = subprocess.run([sys.executable, '-I', '-c', NB], input=json.dumps(payload).encode('utf-8'), capture_output=True, timeout=600, cwd=td, env=dict(os.environ, PYTHONIOENCODING='utf-8'))
        except subprocess.TimeoutExpired: return lid, 'zaman aşımı'
    out = p.stdout.decode('utf-8', 'replace')
    if '@@JSON@@' not in out: return lid, 'çalıştırıcı: ' + p.stderr.decode('utf-8', 'replace')[-300:]
    return lid, json.loads(out.split('@@JSON@@')[-1])
def main():
    outp = sys.argv[1]; files = sys.argv[2:]
    if os.environ.get('ITEMS'): data = json.load(open(os.environ['ITEMS'], encoding='utf-8'))
    else: data = json.loads(subprocess.run(['node', '-e', DUMP] + files, capture_output=True, text=True).stdout)
    if os.environ.get('DUMPITEMS'): json.dump(data, open(os.environ['DUMPITEMS'], 'w', encoding='utf-8'), ensure_ascii=False); 
    items = []
    for lid, body, needs in data:
        bl = [html.unescape(m).strip('\n') for m in re.findall(r'<pre class="py">(.*?)</pre>', body, re.S)]
        if bl: items.append((lid, bl))
    with ThreadPoolExecutor(int(os.environ.get('VW', 4))) as tp: res = dict(tp.map(run, items))
    json.dump(res, open(outp, 'w', encoding='utf-8'), ensure_ascii=False)
    print('ders', len(items), 'blok', sum(len(b) for _, b in items))
if __name__ == '__main__': main()
