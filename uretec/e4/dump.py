import json,subprocess,sys
DUMP="const fs=require('fs');const window={console};for(const f of ['c_temel.js','c_orta.js','c_ileri.js'])new Function('window',fs.readFileSync(f,'utf8'))(window);const L=window.PY_LESSONS;process.stdout.write(JSON.stringify(L.find(l=>l.id===process.argv[1])))"
l=json.loads(subprocess.run(['node','-e',DUMP,sys.argv[1]],capture_output=True,text=True,cwd='/home/claude/py').stdout)
print('min',l['min'])
for e in l['ex']:
    print(json.dumps({k:e[k] for k in e if k in('t','id','q')},ensure_ascii=False)[:500])
for f in l['faq']: print('FAQ',f['q'])
for m in l['mistakes']: print('MIS',m['bad'][:80].replace('\n','|'))
