import sys, json, subprocess, time
sys.path.insert(0,'/home/claude/py/tools')
import verify
data = json.loads(subprocess.run(['node','-e',verify.DUMP]+sys.argv[1:],capture_output=True,text=True).stdout)
for a in data['arena']:
    t=time.time()
    if a.get('mode')=='func': r=verify.py(a['sol'],a['tests'],timeout=600)
    else:
        r={'err':None}
        for c in a['samples']+a['hidden']:
            inp=c.get('in') or verify.py(c['gen'])['out']; r=verify.py(a['sol'],'',None,inp,timeout=600)
    print(a['id'], round(time.time()-t,1), 'ERR' if r['err'] else '', flush=True)
