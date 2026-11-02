exec(open('../h.py').read())
from scipy import stats
ab=veri.oku('anadolu_market','ab_test')
bozuk=ab[~((ab.variant=='B')&(ab.converted==0)&(ab.user_id%5==0))]
n=bozuk.variant.value_counts(); print(n.to_dict(), stats.chisquare([n['A'],n['B']]).pvalue)
def deney(seed=7, n=2000, etki=5.0):
    rng = np.random.default_rng(seed)
    onceki = rng.gamma(2.0, 30.0, n)
    grup = rng.integers(0, 2, n)
    sonraki = 0.8 * onceki + rng.normal(0, 20, n) + etki * grup
    return onceki, grup, sonraki
x,g,y=deney()
theta=np.cov(y,x)[0,1]/np.var(x,ddof=1); yc=y-theta*(x-x.mean())
print(round(theta,4), round(np.var(y,ddof=1),1), round(np.var(yc,ddof=1),1), round(1-np.var(yc,ddof=1)/np.var(y,ddof=1),3), round(np.corrcoef(x,y)[0,1],3))
for arr in (y,yc):
    d=arr[g==1].mean()-arr[g==0].mean(); t=stats.ttest_ind(arr[g==1],arr[g==0],equal_var=False); print(round(d,3), round(t.pvalue,4))
