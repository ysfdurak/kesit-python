import sys, os
sys.path.insert(0,'/home/claude/py/tools/pylib'); os.environ['PP_VERI']='/home/claude/py/data'
import veri, pandas as pd, numpy as np
o=veri.oku('anadolu_market','orders', parse_dates=['order_date']); it=veri.oku('anadolu_market','order_items'); p=veri.oku('anadolu_market','products')
it['net']=it.quantity*it.unit_price*(1-it.discount)
x=o[o.status.isin(['delivered','shipped'])].merge(it,on='order_id').merge(p[['product_id','cost']],on='product_id')
x['marj']=x.net-x.quantity*x.cost
for yil in [2023,2024]:
  y=x[x.order_date.dt.year==yil]
  aov=y.net.sum()/y.order_id.nunique(); fr=y.order_id.nunique()/y.customer_id.nunique(); mo=y.marj.sum()/y.net.sum()
  print(yil, round(aov,2), round(fr,3), round(mo,4), round(aov*fr*mo*3,2))
# kpi card
x['ay']=x.order_date.dt.strftime('%Y-%m')
ilk=o.groupby('customer_id').order_date.min().dt.strftime('%Y-%m')
for ay in ['2024-11','2024-10','2023-11','2024-01']:
  y=x[x.ay==ay]; print(ay, round(y.net.sum(),2), y.order_id.nunique(), round(y.net.sum()/y.order_id.nunique(),2), y.customer_id.nunique(), int((ilk==ay).sum()))
# YTD through 2024-06-15 vs 2023
def per(a,b): return round(x[(x.order_date>=a)&(x.order_date<=b)].net.sum(),2)
print(per('2024-01-01','2024-06-15'), per('2023-01-01','2023-06-15'))
print(per('2024-01-01','2024-11-15'), per('2023-01-01','2023-11-15'))
# conversion literal check: kpi tree log decomposition 2023->2024
