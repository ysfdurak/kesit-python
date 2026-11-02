import json, subprocess, sys, re, html
f = sys.argv[1]
DUMP = "const fs=require('fs');const window={};new Function('window',fs.readFileSync(process.argv[1],'utf8'))(window);process.stdout.write(JSON.stringify(window.PY_LESSONS))"
L = json.loads(subprocess.run(['node', '-e', DUMP, f], capture_output=True, text=True).stdout)
for l in L:
    for i, m in enumerate(re.findall(r'<pre class="py">(.*?)</pre>', l['body'], re.S)):
        code = html.unescape(m)
        r = subprocess.run([sys.executable, '-I', '-c', code], capture_output=True, text=True, timeout=30, cwd='/tmp/claude-0/-home-claude/6c066959-3fcb-54bb-bdf1-c8ae148dfc4c/scratchpad')
        status = 'OK' if r.returncode == 0 else 'FAIL'
        print(f'--- {l["id"]} örnek {i+1}: {status}')
        print(r.stdout[-1500:] if '-v' in sys.argv else '', r.stderr[-800:])
