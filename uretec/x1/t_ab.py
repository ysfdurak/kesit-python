exec(open('../h.py').read())
from scipy import stats
ab=veri.oku('anadolu_market','ab_test').sort_values('user_id')
def ztest(xa,na,xb,nb):
    pa,pb=xa/na,xb/nb; p=(xa+xb)/(na+nb); se=np.sqrt(p*(1-p)*(1/na+1/nb)); z=(pb-pa)/se; return z, 2*stats.norm.sf(abs(z))
ps=[]
for k in range(100,2001,100):
    s=ab.iloc[:k]; g=s.groupby('variant').converted.agg(['sum','count'])
    z,p=ztest(g.loc['A','sum'],g.loc['A','count'],g.loc['B','sum'],g.loc['B','count']); ps.append(round(p,3))
print(ps); print([i for i,p in zip(range(100,2001,100),ps) if p<0.05])
# A/A peeking sim
rng=np.random.default_rng(42); fp_once=0; fp_end=0; R=500
for r in range(R):
    a=rng.random(2000)<0.11; b=rng.random(2000)<0.11
    sig=False
    for k in range(200,2001,200):
        z,p=ztest(a[:k].sum(),k,b[:k].sum(),k)
        if p<0.05: sig=True
    fp_once+=sig; fp_end+= p<0.05
print(fp_once/R, fp_end/R)
# CI for diff
g=ab.groupby('variant').converted.agg(['sum','count']); pa=g.loc['A','sum']/g.loc['A','count']; pb=g.loc['B','sum']/g.loc['B','count']
se=np.sqrt(pa*(1-pa)/g.loc['A','count']+pb*(1-pb)/g.loc['B','count']); print(round(pb-pa,4), round(pb-pa-1.96*se,4), round(pb-pa+1.96*se,4))
print(ztest(106,975,150,1025))
# revenue per user diff ci
ra=ab[ab.variant=='A'].revenue; rb=ab[ab.variant=='B'].revenue; print(round(ra.mean(),2), round(rb.mean(),2))
# bootstrap
rng=np.random.default_rng(0); B=2000; d=[]
for _ in range(B): d.append(rng.choice(rb.values,len(rb)).mean()-rng.choice(ra.values,len(ra)).mean())
print(np.percentile(d,[2.5,97.5]).round(2))
