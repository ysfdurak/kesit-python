import sys, os, itertools
sys.path.insert(0,'/home/claude/py/tools/pylib'); os.environ['PP_VERI']='/home/claude/py/data'
import veri, pandas as pd, numpy as np
s=veri.oku('kesit_bi','Satislar'); m=veri.oku('kesit_bi','Musteriler'); u=veri.oku('kesit_bi','Urunler')
x=s.merge(u[['UrunNo','Kategori']],on='UrunNo').merge(m[['MusteriNo','Segment','Bolge','Cinsiyet','YasGrubu']],on='MusteriNo')
x['Yil']=x.Tarih.str[:4]; x['Marj']=(x.Tutar-x.Maliyet); x['Brut']=x.Adet*x.BirimFiyat; x['Ind']=x.Brut-x.Tutar
x['Iptal']=x.Durum.isin(['İptal','İade']).astype(int); x['one']=1
x['Fiyat']=x.BirimFiyat
cats=['Kanal','Kategori','Segment','Bolge','Cinsiyet','YasGrubu','Yil','IndirimBandi']
metrics={'marj%':('Marj','Tutar'),'ind%':('Ind','Brut'),'iptal':('Iptal','one'),'aov':('Tutar','one'),'fiyat':('Fiyat','one')}
res=[]
for g in cats:
  vals=x[g].dropna().unique()
  for a,b in itertools.combinations(vals,2):
    sub=x[x[g].isin([a,b])]
    for st in cats:
      if st==g: continue
      for mn,(nu,de) in metrics.items():
        agg=sub.groupby(g)[[nu,de]].sum(); tot=agg[nu]/agg[de]
        bb=sub.groupby([st,g])[[nu,de]].sum(); by=(bb[nu]/bb[de]).unstack()
        if by.isna().any().any() or len(by)<2: continue
        d0=tot[a]-tot[b]; ds=by[a]-by[b]
        rel=abs(d0)/abs(tot).mean()
        if (np.sign(ds)==-np.sign(d0)).all() and rel>0.02:
          n=sub.groupby([st,g]).size().min()
          res.append((g,a,b,st,mn,round(d0,4),ds.round(4).tolist(),n,len(by)))
res.sort(key=lambda r:-r[7])
for r in res[:30]: print(r)
print(len(res))
