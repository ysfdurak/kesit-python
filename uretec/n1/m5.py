import sys, os, itertools
sys.path.insert(0,'/home/claude/py/tools/pylib'); os.environ['PP_VERI']='/home/claude/py/data'
import veri, pandas as pd, numpy as np
o=veri.oku('anadolu_market','orders', parse_dates=['order_date']); it=veri.oku('anadolu_market','order_items'); p=veri.oku('anadolu_market','products'); c=veri.oku('anadolu_market','customers')
it['net']=it.quantity*it.unit_price*(1-it.discount)
x=o[o.status.isin(['delivered','shipped'])].merge(it,on='order_id').merge(p[['product_id','category','cost']],on='product_id').merge(c[['customer_id','segment','city','gender']],on='customer_id')
x['yil']=x.order_date.dt.year; x['q']=x.order_date.dt.quarter; x['h']=np.where(x.order_date.dt.month<=6,'H1','H2')
x['marj']=x.net-x.quantity*x.cost; x['ind']=x.quantity*x.unit_price*x.discount; x['brut']=x.quantity*x.unit_price
for g,a,b in [('yil',2023,2024),('yil',2022,2023),('yil',2022,2024),('channel','web','mobile'),('channel','store','web'),('channel','store','mobile'),('segment','Bireysel','Premium'),('segment','Kurumsal','Premium'),('segment','Bireysel','Kurumsal'),('gender','E','K'),('h','H1','H2')]:
  sub=x[x[g].isin([a,b])]
  for st in ['category','channel','segment','yil','gender']:
    if st==g: continue
    for mn,nu,de in [('marj%','marj','net'),('ind%','ind','brut'),('birimfiyat','net','quantity')]:
      A=sub.groupby(g)[[nu,de]].sum(); tot=A[nu]/A[de]
      B=sub.groupby([st,g])[[nu,de]].sum(); by=(B[nu]/B[de]).unstack()
      if by.isna().any().any(): continue
      d0=tot[a]-tot[b]; ds=by[a]-by[b]
      if (np.sign(ds)==-np.sign(d0)).all():
        print(g,a,b,st,mn,round(d0,4),ds.round(4).tolist(), sub.groupby([st,g]).size().min())
    # AOV
    A=sub.groupby(g).agg(n=('net','sum'),k=('order_id','nunique')); tot=A.n/A.k
    B=sub.groupby([st,g]).agg(n=('net','sum'),k=('order_id','nunique')); by=(B.n/B.k).unstack()
    if st!='category' and not by.isna().any().any():
      d0=tot[a]-tot[b]; ds=by[a]-by[b]
      if (np.sign(ds)==-np.sign(d0)).all(): print('AOV',g,a,b,st,round(d0,2),ds.round(2).tolist())
