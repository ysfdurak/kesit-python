import sys; sys.path.insert(0,'/home/claude/py/tools/pylib')
import os; os.environ['PP_VERI']='/home/claude/py/data'
import veri, pandas as pd
pd.set_option('display.width',200)
f=veri.oku('kanat_havayollari','hv_flights',parse_dates=['sched_dep','sched_arr','actual_dep','actual_arr'])
print(f.status.value_counts()); f['gec']=(f.actual_dep-f.sched_dep).dt.total_seconds()/60
print(f.gec.describe()); print((f.gec<=15).sum(), f.gec.notna().sum())
d=veri.oku('kanat_havayollari','hv_delays'); print(d.reason.value_counts()); print(d.groupby('reason').minutes.sum()); print(d.flight_id.nunique(), len(d))
fd=f.merge(d.groupby('flight_id').minutes.sum().rename('dsum'),on='flight_id',how='left')
print(((fd.gec>15)&fd.dsum.isna()).sum(), ((fd.gec<=15)&fd.dsum.notna()).sum())
print((fd.dsum-fd.gec).describe())
a=veri.oku('kanat_havayollari','hv_airports'); print(a)
ro=veri.oku('kanat_havayollari','hv_routes'); print(ro.head(50))
ac=veri.oku('kanat_havayollari','hv_aircraft'); print(ac)
b=veri.oku('kanat_havayollari','hv_bookings'); print(b.status.value_counts(), b.fare_class.value_counts())
print(b.groupby('flight_id').size().describe())
fb=f.merge(ac,on='tail_no'); print((fb.pax/fb.seats).describe()); print((fb.pax>fb.seats).sum())
# sched_arr - sched_dep vs block_min (local times?)
fr=f.merge(ro,on='route_id'); fr['blk']=(fr.sched_arr-fr.sched_dep).dt.total_seconds()/60
fr=fr.merge(a[['airport_code','tz_offset']].rename(columns={'airport_code':'origin','tz_offset':'tzo'}),on='origin').merge(a[['airport_code','tz_offset']].rename(columns={'airport_code':'dest','tz_offset':'tzd'}),on='dest')
fr['diff']=fr.blk-fr.block_min; print(fr.groupby(['tzo','tzd'])['diff'].describe())
print(f.groupby('status').pax.describe())
print(f.flight_no.nunique(), f.tail_no.nunique())
