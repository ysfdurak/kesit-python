#!/usr/bin/env python3
"""Ders gövdelerindeki (body ve uzantı html) tüm <pre class="py"> örneklerini tarayıcının göreceği biçimde
çözüp gerçek Python ile çalıştırır. Hata verenleri listeler.
Kullanım: python3 examples.py dosya1.js [...]"""
import json, subprocess, sys, html, re, tempfile
from concurrent.futures import ThreadPoolExecutor
DUMP = r'''
const fs=require('fs');const window={console};
for(const f of process.argv.slice(1)){new Function('window',fs.readFileSync(f,'utf8'))(window);}
const out=[];(window.PY_LESSONS||[]).forEach(l=>out.push([l.id,l.body||'',l.needs||[]]));
(window.PY_EXT||[]).forEach(x=>out.push([x.id+' (uzantı)',x.html||'',[]]));
process.stdout.write(JSON.stringify(out));'''
SKIP = re.compile(r'^\s*(import|from)\s+(flask|fastapi|django|openpyxl|xlsxwriter|seaborn|plotly|requests|selenium|tkinter|streamlit|docx|pypdf|uvicorn|airflow|prefect|anthropic|openai|apscheduler|schedule|bcrypt|argon2|sentence_transformers|transformers|torch|pyspark|dotenv|pydantic_settings|typer|psycopg|celery|hypothesis|playwright|pendulum|xgboost|lightgbm)\b', re.M)
NB = r"""
import sys, json, io, contextlib, traceback, os
sys.path.insert(0, "__KOK__/tools/pylib"); os.environ["PP_VERI"] = "__KOK__/data"
try:
    import matplotlib; matplotlib.use("Agg")
except Exception: pass
blocks = json.loads(sys.stdin.read()); ns = {"__name__": "__main__"}; errs = []
for i, (code, skip) in enumerate(blocks):
    if skip: continue
    buf = io.StringIO()
    try:
        with contextlib.redirect_stdout(buf): exec(compile(code, f"<ornek{i}>", "exec"), ns)
    except BaseException as e:
        errs.append([i, (type(e).__name__ + ": " + str(e))[:300]])
print(json.dumps(errs))
"""
KOK = __import__('os').path.dirname(__import__('os').path.dirname(__import__('os').path.abspath(__file__)))
NB = NB.replace('__KOK__', KOK)

def run(item):
    lid, blocks = item
    payload = [[c, bool(SKIP.search(c) or 'input(' in c)] for c in blocks]
    with tempfile.TemporaryDirectory() as td:
        try:
            p = subprocess.run([sys.executable, '-I', '-c', NB], input=json.dumps(payload), capture_output=True, text=True, timeout=240, cwd=td)
        except subprocess.TimeoutExpired: return [(lid, -1, 'zaman aşımı (ders toplamı 240 sn)', '')]
    try: errs = json.loads(p.stdout.strip().splitlines()[-1])
    except Exception: return [(lid, -1, 'çalıştırıcı: ' + p.stderr[-300:], '')]
    return [(lid, i, e, blocks[i]) for i, e in errs]

def main():
    files = [f for f in sys.argv[1:] if not f.startswith('-')]
    data = json.loads(subprocess.run(['node', '-e', DUMP] + files, capture_output=True, text=True).stdout)
    items = []; total = 0
    for lid, body, needs in data:
        bl = [html.unescape(m).strip('\n') for m in re.findall(r'<pre class="py">(.*?)</pre>', body, re.S)]
        total += len(bl)
        if bl: items.append((lid, bl))
    with ThreadPoolExecutor(6) as tp: res = [r for rr in tp.map(run, items) for r in rr]
    for lid, i, err, code in res:
        print(f'HATA {lid} örnek#{i}: {err}' + ('\n' + '\n'.join('    ' + l for l in code.splitlines()[:8]) if '-v' in sys.argv else ''))
    print(f'örnek: {total}, hata={len(res)}')
if __name__ == '__main__': main()
