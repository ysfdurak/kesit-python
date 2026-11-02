import sys; sys.path.insert(0,'/home/claude/py/tools/pylib')
import os; os.environ['PP_VERI']='/home/claude/py/data'
import veri, pandas as pd
pd.set_option('display.width',200)
o=veri.oku('lezzet_kurye','lk_orders',parse_dates=['placed_at','picked_at','delivered_at'])
cu=veri.oku('lezzet_kurye','lk_customers'); r=veri.oku('lezzet_kurye','lk_restaurants')
mm=o.merge(cu[['customer_id','signup_date','referred_by']],on='customer_id')
x=mm[mm.placed_at<pd.to_datetime(mm.signup_date)]; print(x[['order_id','customer_id','signup_date','placed_at','status','courier_id','discount']])
mm=o.merge(r[['restaurant_id','name','opened_date']],on='restaurant_id')
x=mm[mm.placed_at<pd.to_datetime(mm.opened_date)]; print(x.groupby(['restaurant_id','name','opened_date']).size())
print(r[['restaurant_id','opened_date','is_active','city']])
print(cu.referred_by.notna().sum())
# referral: self-referral or referrer signup after
c2=cu.merge(cu[['customer_id','signup_date']].rename(columns={'customer_id':'referred_by','signup_date':'ref_signup'}),on='referred_by',how='left')
print('ref after', (c2.ref_signup>c2.signup_date).sum(), 'self',(cu.customer_id==cu.referred_by).sum())
# discount pattern by customer
print(o[o.discount>0].groupby('customer_id').size().sort_values().tail(5))
print(o.groupby('customer_id').size().describe())
# courier ratings
rt=veri.oku('lezzet_kurye','lk_ratings')
print(rt.comment.value_counts().head(20))
