import sys, os
sys.path.insert(0,'/home/claude/py/tools/pylib'); os.environ['PP_VERI']='/home/claude/py/data'
import veri, pandas as pd, numpy as np
f = veri.oku('kanat_havayollari','hv_flights')
print(f.shape); print(f.isna().sum()); print(f.status.value_counts())
print(f.nunique())
for c in ['sched_dep','sched_arr','actual_dep','actual_arr']: f[c]=pd.to_datetime(f[c])
f['dep_delay']=(f.actual_dep-f.sched_dep).dt.total_seconds()/60
f['arr_delay']=(f.actual_arr-f.sched_arr).dt.total_seconds()/60
print(f.dep_delay.describe()); print('skew', f.dep_delay.skew(), 'median', f.dep_delay.median())
print('share>15', (f.dep_delay>15).mean(), (f.dep_delay[f.status=='landed']>15).mean())
print(f.sched_dep.min(), f.sched_dep.max())
print(f.pax.describe())
d = veri.oku('kanat_havayollari','hv_delays'); print(d.shape, d.reason.value_counts(), d.groupby('reason').minutes.sum().sort_values(ascending=False))
print('flights with delays', d.flight_id.nunique())
m = f.merge(d.groupby('flight_id').minutes.sum().rename('nedenli'), left_on='flight_id', right_index=True, how='left')
print((m.nedenli - m.dep_delay).describe())
print(m[['dep_delay','nedenli']].head(20))
f['saat']=f.sched_dep.dt.hour
print(f.groupby('saat').dep_delay.agg(['mean','median','count']).round(1))
f['gun']=f.sched_dep.dt.dayofweek
print(f.groupby('gun').dep_delay.agg(['mean','median','count']).round(1))
print(f.groupby(f.sched_dep.dt.to_period('M')).dep_delay.agg(['mean','median','count']).round(1))
