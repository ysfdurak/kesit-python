import re, sys, html, subprocess, tempfile
s = open(sys.argv[1]).read()
h = s[s.find('html: `')+7: s.find('`,\n  ex:')]
for i, b in enumerate(re.findall(r'<pre class="py">(.*?)</pre>', h, re.S)):
    code = html.unescape(b)
    with tempfile.TemporaryDirectory() as td:
        r = subprocess.run([sys.executable, '-I', '-c', code], capture_output=True, text=True, cwd=td, timeout=60)
    print(f'--- örnek {i} rc={r.returncode}'); print(r.stdout[-600:]); print(r.stderr[-800:])
