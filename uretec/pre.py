import sys, re, html, subprocess, json
f = sys.argv[1]
src = open(f).read()
body = re.search(r'body: `(.*?)`', src, re.S).group(1).replace('\\\\', '\\')
for i, m in enumerate(re.findall(r'<pre class="py">(.*?)</pre>', body, re.S)):
    code = html.unescape(m)
    p = subprocess.run([sys.executable, '-I', '-c', code], capture_output=True, text=True, timeout=30)
    print(f'--- pre {i}', 'HATA' if p.returncode else 'ok')
    if p.returncode or '-v' in sys.argv: print(p.stdout[-1500:], p.stderr[-800:])
