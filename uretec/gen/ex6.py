import sys,time; sys.path.insert(0,'/home/claude/py/tools/pylib')
import os; os.environ['PP_VERI']='/home/claude/py/data'
import veri, pandas as pd
pd.set_option('display.width',200)
t0=time.time(); t=veri.oku('pedal_izmir','bk_trips',parse_dates=['started_at','ended_at']); print('read',time.time()-t0)
print(t.isna().sum()); print(t.ended_at.isna().sum())
t['dk']=(t.ended_at-t.started_at).dt.total_seconds()/60; print(t.dk.describe())
print(t.groupby(t.started_at.dt.hour).size())
u=veri.oku('pedal_izmir','bk_users'); m=t.merge(u,on='user_id'); print(m.groupby('user_type').agg(n=('trip_id','size'),dk=('dk','mean'),fare=('fare','mean')))
w=veri.oku('pedal_izmir','bk_weather',parse_dates=['obs_hour']); print(w.rain_mm.describe(), (w.rain_mm>0).sum())
h=t.groupby(t.started_at.dt.floor('h')).size().rename('n'); w=w.join(h,on='obs_hour'); w['n']=w.n.fillna(0)
w['yag']=w.rain_mm>0; print(w.groupby('yag').n.mean()); print(w.groupby([w.obs_hour.dt.hour, 'yag']).n.mean().unstack().head(24))
# overlaps per bike
s=t.dropna(subset=['ended_at']).sort_values(['bike_id','started_at']); s['pe']=s.groupby('bike_id').ended_at.shift(); ov=s[s.started_at<s.pe]; print('overlap', len(ov), ov.bike_id.nunique()); print(ov.head())
# open trips
o=t[t.ended_at.isna()]; print(o.started_at.describe()); 
st=veri.oku('pedal_izmir','bk_stations'); print(st.head(), st.capacity.sum())
dep=t.groupby('start_station').size(); arr=t.groupby('end_station').size(); net=(arr-dep).sort_values(); print(net.head(), net.tail())
print((t.start_station==t.end_station).sum())
print(t.fare.describe()); print((t.fare==0).sum())
print(m[m.dk>30].groupby('user_type').fare.describe())
mt=veri.oku('pedal_izmir','bk_maintenance'); print(mt.issue.value_counts(), mt.closed_at.isna().sum())
b=veri.oku('pedal_izmir','bk_bikes'); print(b.model.value_counts()); mb=t.merge(b,on='bike_id'); print(mb.groupby('model').agg(dk=('dk','mean'),km=('distance_km','mean')))
