import sys, os
sys.path.insert(0,'/home/claude/py/tools/pylib'); os.environ['PP_VERI']='/home/claude/py/data'
import veri, pandas as pd, numpy as np
s=veri.oku('kesit_bi','Satislar'); u=veri.oku('kesit_bi','Urunler')
s=s.merge(u[['UrunNo','Kategori']],on='UrunNo')
print(s.IndirimBandi.value_counts())
s['iade']=(s.Durum=='İade').astype(int); s['bir']=1
w=s[s.Kanal.isin(['Web','Mobil'])]
print(w.groupby('Kanal').iade.mean().round(4)); print(w.groupby(['Kategori','Kanal']).iade.mean().unstack().round(4))
s['marj']=s.Tutar-s.Maliyet
k=s[s.Durum!='İptal'].groupby('Kanal')[['marj','Tutar']].sum(); print((k.marj/k.Tutar).round(4))
print(s[s.Durum!='İptal'].assign(r=lambda d:d.marj/d.Tutar).groupby('Kanal').r.mean().round(4))
print(s.Tarih.min(), s.Tarih.max(), round(s.Tutar.sum(),2))
