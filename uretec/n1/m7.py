import sys, os
sys.path.insert(0,'/home/claude/py/tools/pylib'); os.environ['PP_VERI']='/home/claude/py/data'
import veri, pandas as pd, numpy as np
w = veri.oku('anadolu_market','web_events', parse_dates=['event_time'])
w['gun']=w.event_time.dt.date
g=w.groupby('gun').apply(lambda t: pd.Series({'v':t[t.event_type=='visit'].user_id.nunique(),'p':t[t.event_type=='purchase'].user_id.nunique()}))
g=g[g.v>0]; print(len(g), round((g.p/g.v).mean(),4), round(g.p.sum()/g.v.sum(),4))
# visit and purchase on different days?
o=veri.oku('anadolu_market','orders', parse_dates=['order_date']); it=veri.oku('anadolu_market','order_items'); p=veri.oku('anadolu_market','products')
it['net']=it.quantity*it.unit_price*(1-it.discount)
ok=o[o.status.isin(['delivered','shipped'])]
x=ok.merge(it,on='order_id')
# churn
son=o.groupby('customer_id').order_date.max(); ref=pd.Timestamp('2024-12-31')
gun=(ref-son).dt.days; print('churn180', (gun>180).sum(), len(son), round((gun>180).mean(),4), 'churn90', (gun>90).sum())
# pareto 2024
y=x[x.order_date.dt.year==2024].merge(p[['product_id','name']],on='product_id').groupby('name').net.sum().sort_values(ascending=False)
c=y.cumsum()/y.sum(); 
abc=np.where(c<=0.8,'A',np.where(c<=0.95,'B','C'))
print(pd.Series(abc).value_counts().to_dict(), len(y), y.index[0], round(y.iloc[0],2), round(c.iloc[0],4))
# alternative: A includes the product that crosses 80%
prev=c.shift(fill_value=0); abc2=np.where(prev<0.8,'A',np.where(prev<0.95,'B','C')); print(pd.Series(abc2).value_counts().to_dict())
# share of top 20% products
k=int(np.ceil(len(y)*0.2)); print('top20%', k, round(y.iloc[:k].sum()/y.sum(),4))
# LTV simple: per customer total net revenue over all time (delivered/shipped), avg
pc=x.groupby('customer_id').net.sum(); print('ort musteri ciro', round(pc.mean(),2), len(pc))
# margin
x2=x.merge(p[['product_id','cost']],on='product_id'); x2['marj']=x2.net-x2.quantity*x2.cost
print('marj orani', round(x2.marj.sum()/x2.net.sum(),4))
# cohort LTV: quarterly cohort 2023Q1..Q4: cumulative net per cohort customer at 0..3 quarters
f=o.copy(); f['kq']=f.groupby('customer_id').order_date.transform('min').dt.to_period('Q')
xx=x.merge(f[['order_id','kq']],on='order_id'); xx['q']=xx.order_date.dt.to_period('Q'); xx['d']=(xx.q-xx.kq).apply(lambda d:d.n)
size=f.groupby('kq').customer_id.nunique()
rev=xx.groupby(['kq','d']).net.sum().unstack(fill_value=0)
cum=rev.cumsum(axis=1).div(size,axis=0)
print(cum.loc[:, :4].round(2))
print(size)
