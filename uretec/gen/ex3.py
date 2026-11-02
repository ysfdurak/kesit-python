import sys; sys.path.insert(0,'/home/claude/py/tools/pylib')
import os; os.environ['PP_VERI']='/home/claude/py/data'
import veri, pandas as pd
o=veri.oku('lezzet_kurye','lk_orders',parse_dates=['placed_at','picked_at','delivered_at'])
ol=veri.oku('lezzet_kurye','lk_order_lines'); mi=veri.oku('lezzet_kurye','lk_menu_items'); rt=veri.oku('lezzet_kurye','lk_ratings'); cu=veri.oku('lezzet_kurye','lk_customers'); r=veri.oku('lezzet_kurye','lk_restaurants')
ol['t']=ol.qty*ol.unit_price
sep=ol.groupby('order_id').t.sum().rename('sepet')
o=o.join(sep,on='order_id')
print(o.sepet.describe(), o.sepet.isna().sum())
print(pd.crosstab(o.sepet>=400, o.delivery_fee))
x=o[(o.sepet>=400)&(o.delivery_fee>0)]; print(x[['order_id','restaurant_id','courier_id','sepet','delivery_fee','placed_at']])
x=o[(o.sepet<400)&(o.delivery_fee==0)]; print(len(x)); print(x[['order_id','restaurant_id','courier_id','sepet','delivery_fee','discount','placed_at']].head(20)); print(x.restaurant_id.value_counts().head(), x.courier_id.value_counts().head())
# ratings on cancelled
m=rt.merge(o[['order_id','status']],on='order_id'); print(m.status.value_counts())
# price diff
j=ol.merge(mi[['item_id','price','restaurant_id']],on='item_id'); j=j.merge(o[['order_id','restaurant_id']],on='order_id',suffixes=('_m','_o'))
print('item from other rest', (j.restaurant_id_m!=j.restaurant_id_o).sum())
print('price diff', (j.unit_price!=j.price).sum()); print((j.unit_price/j.price).describe())
d=j[j.unit_price!=j.price]; print(d.head(10)); print(d.item_id.value_counts().head())
# customer before signup
mm=o.merge(cu[['customer_id','signup_date','city','is_premium']],on='customer_id'); print('before signup', (mm.placed_at<pd.to_datetime(mm.signup_date)).sum())
mm=mm.merge(r[['restaurant_id','city','opened_date']],on='restaurant_id',suffixes=('_c','_r')); print('city diff', (mm.city_c!=mm.city_r).sum()); print('before open',(mm.placed_at<pd.to_datetime(mm.opened_date)).sum())
# courier overlap
t=o[o.status!='iptal'].dropna(subset=['courier_id']).sort_values(['courier_id','picked_at'])
t['prev_del']=t.groupby('courier_id').delivered_at.shift()
print('overlap', (t.picked_at<t.prev_del).sum())
print(o.discount[o.discount>0].describe()); print((o.discount>o.sepet).sum())
print(o[o.tip>0].payment.value_counts())
print(o.courier_id.isna().groupby(o.status).sum())
print(rt.food_score.value_counts(), rt.comment.notna().sum())
print(o.groupby('restaurant_id').size().describe())
