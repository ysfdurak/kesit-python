import sys; sys.path.insert(0,'/home/claude/py/tools/pylib')
import os; os.environ['PP_VERI']='/home/claude/py/data'
import veri, pandas as pd
t=veri.oku('pedal_izmir','bk_trips',parse_dates=['started_at','ended_at']); u=veri.oku('pedal_izmir','bk_users')
t=t.merge(u[['user_id','user_type']],on='user_id'); t['dk']=(t.ended_at-t.started_at).dt.total_seconds()/60
c=t.dropna(subset=['ended_at'])
print(pd.crosstab([c.user_type, c.dk<=30], c.fare==0))
x=c[(c.user_type=='abone')&(c.dk>30)]; print((x.fare/(x.dk-30)).describe())
y=c[(c.user_type=='tek seferlik')]; print((y.fare/y.dk).describe())
print(c[(c.user_type=='abone')&(c.dk<=30)&(c.fare>0)][['dk','fare']].head())
print(t.started_at.dt.date.nunique())
