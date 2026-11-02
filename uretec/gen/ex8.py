import sys; sys.path.insert(0,'/home/claude/py/tools/pylib')
import os; os.environ['PP_VERI']='/home/claude/py/data'
import veri, pandas as pd
pd.set_option('display.width',200)
f=veri.oku('kanat_havayollari','hv_flights',parse_dates=['sched_dep']); b=veri.oku('kanat_havayollari','hv_bookings',parse_dates=['booked_at']); r=veri.oku('kanat_havayollari','hv_routes'); a=veri.oku('kanat_havayollari','hv_aircraft')
fb=b[b.status=='flown'].merge(f[['flight_id','route_id']],on='flight_id')
p=fb.groupby('route_id').price.mean()
x=f[f.status=='landed'].merge(a,on='tail_no').merge(r,on='route_id'); x['avgp']=x.route_id.map(p)
x['gelir']=x.pax*x.avgp; 
for c in [0.4,0.5,0.6,0.7]:
  x['mal']=x.seats*x.distance_km*c; g=x.groupby('route_id')[['gelir','mal']].sum(); g['kar']=g.gelir-g.mal; print(c,(g.kar<0).sum(), g.kar.sum()/1e6)
print(p.describe()); print(b.groupby('flight_id').size().describe())
bb=b.merge(f[['flight_id','sched_dep']],on='flight_id'); bb['lead']=(bb.sched_dep-bb.booked_at).dt.days; print(bb.lead.describe())
print(bb[bb.status=='flown'].groupby([pd.cut(bb.lead,[0,7,30,60,1000],right=False),'fare_class'],observed=True).price.mean().unstack())
print(x.groupby('route_id').size().describe())
print('----')
for fix in [100000,150000,200000]:
  for c in [0.5,0.8]:
    x['mal']=fix+x.seats*x.distance_km*c; g=x.groupby('route_id')[['gelir','mal']].sum(); g['kar']=g.gelir-g.mal; print(fix,c,(g.kar<0).sum(), round(g.kar.sum()/1e6,1))
x['ucusgelir']=x.gelir; print(x.groupby('route_id').gelir.mean().describe())
