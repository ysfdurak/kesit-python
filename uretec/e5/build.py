#!/usr/bin/env python3
"""spec.py (EXT sözlüğü) -> PY_EXT JS dosyası. Ayrıca html içindeki pre.py bloklarını çalıştırır, kelime sayar."""
import sys, re, html as H, runpy, subprocess, os

def js_str(s):
    s = s.replace('\\', '\\\\').replace("'", "\\'").replace('\r', '').replace('\n', '\\n')
    s = s.replace('\u2028', '\\u2028').replace('\u2029', '\\u2029')
    return "'" + s + "'"

def js_val(v, ind):
    pad = '  ' * ind
    if isinstance(v, bool): return 'true' if v else 'false'
    if isinstance(v, (int, float)): return str(v)
    if isinstance(v, str): return js_str(v)
    if isinstance(v, list):
        if all(isinstance(x, str) for x in v) and sum(len(x) for x in v) < 400:
            return '[' + ', '.join(js_str(x) for x in v) + ']'
        return '[\n' + ',\n'.join(pad + '  ' + js_val(x, ind + 1) for x in v) + '\n' + pad + ']'
    if isinstance(v, dict):
        return '{\n' + ',\n'.join(f"{pad}  {k}: {js_val(x, ind + 1)}" for k, x in v.items()) + '\n' + pad + '}'
    raise TypeError(type(v))

def main():
    spec, out = sys.argv[1], sys.argv[2]
    E = runpy.run_path(spec)['EXT']
    h = E['html']
    assert '`' not in h and '${' not in h, 'html içinde backtick/${ var'
    words = len(re.sub(r'<[^>]+>', ' ', h).split())
    blocks = re.findall(r'<pre class="py">(.*?)</pre>', h, re.S)
    print(f"html kelime={words} py-blok={len(blocks)} tablo={h.count('<table')} ex={len(E['ex'])}")
    for i, b in enumerate(blocks):
        code = H.unescape(b)
        p = subprocess.run([sys.executable, '-I', '-c', code], capture_output=True, text=True, timeout=60, cwd='/tmp/claude-0/-home-claude/6c066959-3fcb-54bb-bdf1-c8ae148dfc4c/scratchpad/e5/run')
        if p.returncode: print(f"BLOK {i} HATA:\n{p.stderr[-800:]}")
        elif '-v' in sys.argv: print(f"--- blok {i}\n{p.stdout}")
    hj = h.replace('\\', '\\\\')
    parts = [f"  id: {js_str(E['id'])}", f"  min: {E['min']}", '  html: `' + hj + '`']
    for k in ('ex', 'faq', 'mistakes'):
        parts.append(f"  {k}: " + js_val(E[k], 1))
    js = ("/* PythonPatika — " + E['id'] + " uzantısı (Derinleş) */\n(function (W) {\n'use strict';\nconst X = W.PY_EXT = W.PY_EXT || [];\nX.push({\n"
          + ',\n'.join(parts) + "\n});\n})(window);\n")
    open(out, 'w').write(js)
    print('yazıldı', out)

if __name__ == '__main__': main()
