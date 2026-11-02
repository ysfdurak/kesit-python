import sys,time; sys.path.insert(0,'/home/claude/py/tools/pylib')
import os; os.environ['PP_VERI']='/home/claude/py/data'
import veri, pandas as pd
pd.set_option('display.width',200)
t=veri.oku('pedal_izmir','bk_trips',parse_dates=['started_at','ended_at'])
s=t.dropna(subset=['ended_at']).sort_values(['bike_id','started_at']); s['pe']=s.groupby('bike_id').ended_at.shift(); s['pes']=s.groupby('bike_id').end_station.shift()
ov=s[s.started_at<s.pe]; print(((ov.pe-ov.started_at).dt.total_seconds()/60).describe())
print('station mismatch overall', (s.start_station!=s.pes).mean())
print(t.groupby('bike_id').size().describe())
# by bike count overlapping
print(ov.groupby('bike_id').size().describe())
# check users simultaneous trips
s2=t.dropna(subset=['ended_at']).sort_values(['user_id','started_at']); s2['pe']=s2.groupby('user_id').ended_at.shift(); print('user overlap',(s2.started_at<s2.pe).sum())
# open trips: does bike get used afterwards?
o=t[t.ended_at.isna()]
nxt=t.merge(o[['bike_id','started_at']].rename(columns={'started_at':'os'}),on='bike_id'); print('later use after open', (nxt.started_at>nxt.os).groupby(nxt.bike_id).any().mean())
print(o.bike_id.nunique(), o.user_id.nunique())
b=veri.oku('pedal_izmir','bk_bikes'); print(t.merge(b,on='bike_id').groupby('model').size())
# trips started before bike commissioned
mb=t.merge(b,on='bike_id'); print('before comm', (mb.started_at<pd.to_datetime(mb.commissioned)).sum())
# trips during maintenance
mt=veri.oku('pedal_izmir','bk_maintenance',parse_dates=['opened_at','closed_at'])
j=t.merge(mt,on='bike_id'); print('during maint', ((j.started_at>=j.opened_at)&((j.started_at<j.closed_at)|j.closed_at.isna())).sum())
print(mt.opened_at.min(), mt.opened_at.max())
