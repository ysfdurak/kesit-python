import sys, os
sys.path.insert(0,'/home/claude/py/tools/pylib'); os.environ['PP_VERI']='/home/claude/py/data'
import veri, pandas as pd, numpy as np
f = veri.oku('kanat_havayollari','hv_flights', parse_dates=['sched_dep','sched_arr','actual_dep','actual_arr'])
a = veri.oku('kanat_havayollari','hv_aircraft'); r = veri.oku('kanat_havayollari','hv_routes'); d=veri.oku('kanat_havayollari','hv_delays')
f['dep_delay']=(f.actual_dep-f.sched_dep).dt.total_seconds()/60
print(f.groupby('status').pax.describe())
x = f.merge(a, on='tail_no')
print('pax>seats', (x.pax>x.seats).sum(), x[x.pax>x.seats][['flight_id','pax','seats','model']].head())
x['doluluk']=x.pax/x.seats
print(x[x.status=='landed'].groupby('model').doluluk.mean().round(3))
print(a)
# dur
f['sure']=(f.actual_arr-f.actual_dep).dt.total_seconds()/60
y=f.merge(r,on='route_id')
print((y.sure - y.block_min).describe())
print(y[(y.sure<=0)|(y.sure>y.block_min*2)][['flight_id','sure','block_min','status']])
# reason by month
d2=d.merge(f[['flight_id','sched_dep']],on='flight_id'); d2['ay']=d2.sched_dep.dt.month
print(pd.crosstab(d2.ay,d2.reason,values=d2.minutes,aggfunc='sum',normalize='index').round(3))
print(pd.crosstab(d2.ay,d2.reason))
# OTP by route
y['otp']=y.dep_delay<=15
g=y[y.status!='cancelled'].groupby(['origin','dest']).otp.agg(['mean','count']).sort_values('mean'); print(g.head(8)); print(g.tail(3))
# correlation
z=x[x.status=='landed']
print(z[['dep_delay','pax','doluluk']].corr().round(3)); print(z[['dep_delay','pax','doluluk']].corr(method='spearman').round(3))
y['saat']=y.sched_dep.dt.hour
print(np.corrcoef(y.dropna(subset=['dep_delay']).saat, y.dropna(subset=['dep_delay']).dep_delay))
print(y.dropna(subset=['dep_delay'])[['saat','dep_delay']].corr(method='spearman'))
print(f.duplicated(['flight_no','sched_dep']).sum())
