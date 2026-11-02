import sys, os, itertools
sys.path.insert(0,'/home/claude/py/tools/pylib'); os.environ['PP_VERI']='/home/claude/py/data'
import veri, pandas as pd, numpy as np
s=veri.oku('kesit_bi','Satislar'); m=veri.oku('kesit_bi','Musteriler'); u=veri.oku('kesit_bi','Urunler')
x=s.merge(u[['UrunNo','Kategori']],on='UrunNo').merge(m[['MusteriNo','Segment','Bolge','Cinsiyet','YasGrubu']],on='MusteriNo')
x['Yil']=x.Tarih.str[:4]; x['IndirimVar']=(x.Indirim>0).astype(int); x['Marj']=(x.Tutar-x.Maliyet)
x['Iade']=(x.Durum.isin(['İade','returned','Iade'])).astype(int)
print(x.Durum.value_counts()); print(x.Kanal.value_counts())
cats=['Kanal','Kategori','Segment','Bolge','Cinsiyet','YasGrubu','Yil','IndirimBandi']
res=[]
for g in cats:
  vals=x[g].dropna().unique()
  for a,b in itertools.combinations(vals,2):
    sub=x[x[g].isin([a,b])]
    for st in cats:
      if st==g: continue
      for metric in ['Iade','IndirimVar']:
        tot=sub.groupby(g)[metric].mean()
        by=sub.groupby([st,g])[metric].mean().unstack()
        if by.isna().any().any() or len(by)<2: continue
        d0=tot[a]-tot[b]; ds=by[a]-by[b]
        if (np.sign(ds)==-np.sign(d0)).all() and abs(d0)>0.01 and (ds.abs()>0.005).all():
          n=sub.groupby([st,g]).size().min()
          res.append((g,a,b,st,metric,round(d0,3),ds.round(3).tolist(),n))
for r in res[:30]: print(r)
print(len(res))
