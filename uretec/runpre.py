import json, subprocess, sys, html, re
DUMP = r'''
const fs=require('fs');const window={};globalThis.window=window;
new Function('window', fs.readFileSync(process.argv[1],'utf8'))(window);
process.stdout.write(JSON.stringify(window.PY_LESSONS.map(l=>[l.id,l.body])));'''
for f in sys.argv[1:]:
    data = json.loads(subprocess.run(['node','-e',DUMP,f],capture_output=True,text=True).stdout)
    for lid, body in data:
        print('words', lid, len(re.sub('<[^>]+>',' ',body).split()))
        for i, m in enumerate(re.findall(r'<pre class="py">(.*?)</pre>', body, re.S)):
            code = html.unescape(m)
            p = subprocess.run([sys.executable,'-c',code],capture_output=True,text=True,timeout=60)
            status = 'OK' if p.returncode==0 else 'ERR'
            print(f'--- {lid} pre#{i} {status}')
            print(p.stdout[-600:]); 
            if p.returncode: print(p.stderr[-800:])
