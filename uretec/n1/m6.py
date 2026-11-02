import sys, os
sys.path.insert(0,'/home/claude/py/tools/pylib'); os.environ['PP_VERI']='/home/claude/py/data'
import veri, pandas as pd, numpy as np
o=veri.oku('anadolu_market','orders', parse_dates=['order_date']); it=veri.oku('anadolu_market','order_items'); p=veri.oku('anadolu_market','products')
it['net']=it.quantity*it.unit_price*(1-it.discount)
x=o[o.status.isin(['delivered','shipped'])].merge(it,on='order_id').merge(p[['product_id','category','cost']],on='product_id')
x['yil']=x.order_date.dt.year
t=x[x.yil.isin([2023,2024])].groupby(['category','yil']).agg(ciro=('net','sum'),adet=('quantity','sum')).unstack()
t.columns=[f'{a}_{b}' for a,b in t.columns]; t['fiyat_2023']=t.ciro_2023/t.adet_2023; t['fiyat_2024']=t.ciro_2024/t.adet_2024
print(t.round(2))
A0=t.adet_2023.sum(); A1=t.adet_2024.sum(); P0=t.ciro_2023.sum()/A0
hacim=(A1-A0)*P0
karma=((t.adet_2024/A1 - t.adet_2023/A0)*A1*t.fiyat_2023).sum()
fiyat=((t.fiyat_2024-t.fiyat_2023)*t.adet_2024).sum()
print('toplam', t.ciro_2024.sum()-t.ciro_2023.sum(), 'hacim',hacim,'karma',karma,'fiyat',fiyat,'sum',hacim+karma+fiyat)
print(A0,A1,P0)
# monthly cohort retention pandas
f=o.copy(); f['ay']=f.order_date.dt.to_period('M'); f['kohort']=f.groupby('customer_id').ay.transform('min')
f['k']=(f.ay-f.kohort).apply(lambda d:d.n)
print(f.groupby('kohort').customer_id.nunique().tail())
# quarterly cohorts
f['kq']=f.groupby('customer_id').order_date.transform('min').dt.to_period('Q'); f['q']=f.order_date.dt.to_period('Q')
f['kqd']=(f.q-f.kq).apply(lambda d:d.n)
ct=f.groupby(['kq','kqd']).customer_id.nunique().unstack(fill_value=0); print(ct)
print((ct.div(ct[0],axis=0)).round(3).iloc[:, :5])
