import random,subprocess,sys
sys.path.insert(0,'.')
import p2
sol=[p for p in p2.P if p['id']=='a-029'][0]['sol']
for t in range(400):
    n=random.randint(1,8); a=[random.randint(-3,3) for _ in range(n)]
    best=None
    for i in range(n):
        for j in range(i,n):
            s=sum(a[i:j+1]); k=(-s,i,j)
            if best is None or k<best: best=k
    exp=f"{-best[0]} {best[1]+1} {best[2]+1}"
    out=subprocess.run([sys.executable,'-c',sol],input=f"{n}\n{' '.join(map(str,a))}\n",capture_output=True,text=True).stdout.strip()
    assert out==exp,(a,out,exp)
print('ok')
