#!/usr/bin/env python3
"""Şablon dizgesi (backtick) içindeki <pre class="py"> bloklarında tek ters bölüyü ikiler:
JS'de `\n` gerçek satır sonuna dönüşür; Python örneğinde ise "\n" kaçışı kalmalıdır.
Yalnızca derlenince SyntaxError veren blokları düzeltir. Kullanım: fixesc.py dosya.js [...]"""
import re, sys, html, subprocess

def compiles(code):
    try: compile(code, '<x>', 'exec'); return True
    except SyntaxError: return False

def js_eval_block(src_block):
    # şablon dizgesindeki kaçışları JS gibi çöz
    out = subprocess.run(['node', '-e', 'process.stdout.write(eval("`" + require("fs").readFileSync(0,"utf8") + "`"))'], input=src_block, capture_output=True, text=True)
    return out.stdout

for path in sys.argv[1:]:
    s = open(path, encoding='utf-8').read()
    n = 0
    def fix(m):
        global n
        block = m.group(1)
        if '\\' not in block: return m.group(0)
        evaluated = html.unescape(js_eval_block(block)).strip('\n')
        if compiles(evaluated): return m.group(0)
        fixed = re.sub(r'\\(\\)|\\', lambda k: k.group(0) if k.group(1) else '\\\\', block)
        if compiles(html.unescape(js_eval_block(fixed)).strip('\n')):
            n += 1; return '<pre class="py">' + fixed + '</pre>'
        return m.group(0)
    s2 = re.sub(r'<pre class="py">(.*?)</pre>', fix, s, flags=re.S)
    if n:
        open(path, 'w', encoding='utf-8').write(s2)
        r = subprocess.run(['node', '--check', path], capture_output=True, text=True)
        print(path, 'düzeltilen blok:', n, 'node --check:', 'OK' if r.returncode == 0 else r.stderr[-300:])
