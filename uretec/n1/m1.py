import sys, os
sys.path.insert(0,'/home/claude/py/tools/pylib'); os.environ['PP_VERI']='/home/claude/py/data'
import veri, pandas as pd, numpy as np
w = veri.oku('anadolu_market','web_events', parse_dates=['event_time'])
adim=['visit','product_view','add_to_cart','checkout','purchase']
u=w.groupby('event_type').user_id.nunique().reindex(adim); print(u.tolist(), (u/u.shift()).round(3).tolist(), round(u.iloc[-1]/u.iloc[0],3))
pd_=w.pivot_table(index='event_type',columns='device',values='user_id',aggfunc='nunique').reindex(adim); print(pd_)
print((pd_.loc['purchase']/pd_.loc['visit']).round(3))
# strict funnel: users must have done previous step
s=set(w[w.event_type=='visit'].user_id); out=[len(s)]
for a in adim[1:]:
    s = s & set(w[w.event_type==a].user_id); out.append(len(s))
print('strict', out)
# order check: does every purchaser have visit? 
print(w.groupby('user_id').device.nunique().max())
# avg of ratios by device vs pooled
o=veri.oku('anadolu_market','orders', parse_dates=['order_date']); it=veri.oku('anadolu_market','order_items'); p=veri.oku('anadolu_market','products')
it['net']=it.quantity*it.unit_price*(1-it.discount)
ok=o[o.status.isin(['delivered','shipped'])]
x=ok.merge(it,on='order_id')
print('yillik', x.groupby(x.order_date.dt.year).net.sum().round(2).to_dict())
y=x.groupby(x.order_date.dt.year).agg(ciro=('net','sum'),siparis=('order_id','nunique'),musteri=('customer_id','nunique'))
y['aov']=y.ciro/y.siparis; y['frek']=y.siparis/y.musteri; print(y.round(3))
# YoY monthly 2024 vs 2023
m=x.groupby([x.order_date.dt.year.rename('yil'),x.order_date.dt.month.rename('ay')]).net.sum().unstack(0); print((m[2024]/m[2023]-1).round(3).to_dict())
# YTD to Jun
print('YTD jun', round(m.loc[1:6,2024].sum(),2), round(m.loc[1:6,2023].sum(),2), round(m.loc[1:6,2024].sum()/m.loc[1:6,2023].sum()-1,4), 'full23', round(m[2023].sum(),2))
