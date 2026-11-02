import sys, os
sys.path.insert(0,'/home/claude/py/tools/pylib'); os.environ['PP_VERI']='/home/claude/py/data'
import veri, pandas as pd
o=veri.oku('anadolu_market','orders', parse_dates=['order_date']); c=veri.oku('anadolu_market','customers')
i=veri.oku('anadolu_market','order_items'); i['net']=i.quantity*i.unit_price*(1-i.discount)
x=o[o.status.isin(['delivered','shipped'])].merge(i,on='order_id')
s=x.groupby('order_id').agg(net=('net','sum'),customer_id=('customer_id','first'),order_date=('order_date','first')).reset_index()
s['pay']=s.net/s.groupby('customer_id').net.transform('sum')
print(round(s.pay.max(),4), s.groupby('customer_id').net.transform('mean').head(3).round(2).tolist())
m=s.merge(c[['customer_id','city']],on='customer_id',how='left')
print(m.groupby('city',dropna=False).net.sum().round(2).sort_values(ascending=False).head(4))
# top2 order per city
t=s.sort_values('order_date'); t['k7']=t.groupby('customer_id').order_date.diff().dt.days
print((t.k7<=7).sum())
d=s.set_index('order_date').sort_index().net.resample('D').sum()
r=d.rolling('7D').sum(); print(round(r.max(),2), r.idxmax())
p=s.assign(ay=s.order_date.dt.month, yil=s.order_date.dt.year).pivot_table(index='yil',columns='ay',values='net',aggfunc='sum',fill_value=0).round(2); print(p.loc[2024,[1,12]].tolist())
# customer with largest share of top 10%
