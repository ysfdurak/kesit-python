import sys; sys.path.insert(0,'/home/claude/py/tools/pylib')
import os; os.environ['PP_VERI']='/home/claude/py/data'
import veri, pandas as pd
o=veri.oku('lezzet_kurye','lk_orders',parse_dates=['placed_at','picked_at','delivered_at'])
print(o.status.value_counts(), o.payment.value_counts())
o['dk']=(o.delivered_at-o.placed_at).dt.total_seconds()/60
print(o.dk.describe())
print(o.groupby(o.placed_at.dt.hour).size())
print(o[o.status=='iptal'].isna().sum())
print(o.sort_values('dk',ascending=False).head(10)[['order_id','courier_id','restaurant_id','placed_at','picked_at','delivered_at','dk','status']])
o['pk']=(o.picked_at-o.placed_at).dt.total_seconds()/60; o['yol']=(o.delivered_at-o.picked_at).dt.total_seconds()/60
print(o[['pk','yol']].describe())
print((o.yol<0).sum(), (o.pk<0).sum(), (o.dk<3).sum())
print(o.groupby('courier_id').yol.mean().sort_values().head(5))
print(o.groupby('courier_id').size().describe())
print(o.discount.describe(), o.tip.describe(), o.delivery_fee.value_counts())
# courier simultaneous deliveries in different cities?
c=veri.oku('lezzet_kurye','lk_couriers'); r=veri.oku('lezzet_kurye','lk_restaurants')
m=o.merge(c[['courier_id','city']],on='courier_id',how='left').merge(r[['restaurant_id','city']].rename(columns={'city':'rcity'}),on='restaurant_id')
print('city mismatch', (m.city.notna()&(m.city!=m.rcity)).sum())
print(m[m.city.notna()&(m.city!=m.rcity)][['order_id','courier_id','city','rcity','placed_at','status']].head(20))
print(r)
print(c.vehicle.value_counts(), c.rating.isna().sum())
