import json, subprocess, sys, re, html, os
DUMP = "const fs=require('fs');const window={console};new Function('window',fs.readFileSync(process.argv[1],'utf8'))(window);process.stdout.write(JSON.stringify(window.PY_LESSONS))"
for f in sys.argv[1:]:
    L = json.loads(subprocess.run(['node','-e',DUMP,f],capture_output=True,text=True).stdout)
    for l in L:
        b = l['body']
        words = len(re.sub(r'<[^>]+>',' ',b).split())
        pres = re.findall(r'<pre class="py">(.*?)</pre>', b, re.S)
        print(l['id'], 'kelime=',words,'pre.py=',len(pres),'ex=',len(l['ex']), 'stages=', [e.get('stage') for e in l['ex']].count(None), 'faq',len(l['faq']),'mist',len(l['mistakes']), 'tbl', b.count('<table'), 'deep', 'class="deep"' in b, 'gercek', 'Gerçek işte' in b)
        for i,p in enumerate(pres):
            code = html.unescape(p)
            r = subprocess.run([sys.executable,'-c',code],capture_output=True,text=True,cwd="/tmp/claude-0/-home-claude/6c066959-3fcb-54bb-bdf1-c8ae148dfc4c/scratchpad/o1run/run", timeout=60)
            if r.returncode: print('  PRE',i,'HATA', r.stderr[-400:])
            elif not r.stdout.strip(): print('  PRE',i,'çıktı yok')
