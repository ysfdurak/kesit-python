import sys, os, itertools
sys.path.insert(0,'/home/claude/py/tools/pylib'); os.environ['PP_VERI']='/home/claude/py/data'
import veri, pandas as pd, numpy as np
f = veri.oku('kanat_havayollari','hv_flights', parse_dates=['sched_dep','actual_dep'])
f=f[f.status!='cancelled'].merge(veri.oku('kanat_havayollari','hv_aircraft'),on='tail_no').merge(veri.oku('kanat_havayollari','hv_routes'),on='route_id')
f['rotar']=(f.actual_dep-f.sched_dep).dt.total_seconds()/60; f['gec']=(f.rotar>15).astype(int)
h=f.sched_dep.dt.hour; f['dilim']=np.select([h<12,h<18],['sabah','ogle'],'aksam'); f['ay']=f.sched_dep.dt.month.astype(str)
f['dis']=np.where(f.origin.isin(['FRA','LHR','BAK','AMS','CDG','DXB','MUC','BER','VIE'])|f.dest.isin(['FRA','LHR','BAK','AMS','CDG','DXB','MUC','BER','VIE']),'dis','ic')
f['hub']=f.origin
cats=['model','dilim','ay','dis','origin','tail_no']
res=[]
for g in ['model','origin','dis','tail_no']:
  vals=f[g].unique()
  for a,b in itertools.combinations(vals,2):
    sub=f[f[g].isin([a,b])]
    for st in ['dilim','ay','dis','origin']:
      if st==g: continue
      tot=sub.groupby(g).gec.mean(); by=sub.groupby([st,g]).gec.mean().unstack()
      if by.isna().any().any() or len(by)<2: continue
      d0=tot[a]-tot[b]; ds=by[a]-by[b]
      if (np.sign(ds)==-np.sign(d0)).all() and abs(d0)>0.03:
        n=sub.groupby([st,g]).size().min()
        res.append((g,a,b,st,round(d0,3),ds.round(3).tolist(),n))
res.sort(key=lambda r:-r[-1])
for r in res[:20]: print(r)
print(len(res))
