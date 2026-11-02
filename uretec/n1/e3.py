import sys, os
sys.path.insert(0,'/home/claude/py/tools/pylib'); os.environ['PP_VERI']='/home/claude/py/data'
import veri, pandas as pd, numpy as np
f = veri.oku('kanat_havayollari','hv_flights', parse_dates=['sched_dep','sched_arr','actual_dep','actual_arr'])
f['dep_delay']=(f.actual_dep-f.sched_dep).dt.total_seconds()/60
f['arr_delay']=(f.actual_arr-f.sched_arr).dt.total_seconds()/60
op=f[f.status!='cancelled']
s=op.dep_delay
print('mean',round(s.mean(),2),'med',s.median(),'p90',s.quantile(.9),'>15',round((s>15).mean(),4), 'otp', round((s<=15).mean(),4))
print('fillna0 mean', round(f.dep_delay.fillna(0).mean(),2), 'otp incl cancelled', round((f.dep_delay.fillna(0)<=15).mean(),4))
q1,q3=s.quantile([.25,.75]); iqr=q3-q1; print(q1,q3,iqr, q1-1.5*iqr, q3+1.5*iqr, ((s<q1-1.5*iqr)|(s>q3+1.5*iqr)).sum())
# saat dilimi
op=op.copy(); h=op.sched_dep.dt.hour
op['dilim']=np.select([h<12,h<18],['sabah','ogle'],'aksam')
print(op.groupby('dilim').dep_delay.agg(['median', lambda x:(x>15).mean(), 'count']))
# propagation
g=f.sort_values(['tail_no','sched_dep']).copy()
g['onceki_varis']=g.groupby('tail_no').arr_delay.shift(1)
gg=g[g.status!='cancelled'].dropna(subset=['onceki_varis'])
gec=gg.onceki_varis>15
print(len(gg), round((gg[gec].dep_delay>15).mean(),3), round((gg[~gec].dep_delay>15).mean(),3), gec.sum())
print(gg[['onceki_varis','dep_delay']].corr(method='spearman').round(3))
a = veri.oku('kanat_havayollari','hv_aircraft')
x=op.merge(a,on='tail_no'); x['doluluk']=x.pax/x.seats
print(round(x[['doluluk','dep_delay']].corr(method='spearman').iloc[0,1],3), round(op.assign(saat=op.sched_dep.dt.hour)[['saat','dep_delay']].corr(method='spearman').iloc[0,1],3))
print('iptal orani', round((f.status=='cancelled').mean(),4))
print(op.groupby(op.sched_dep.dt.strftime('%Y-%m')).dep_delay.median())
print((f.pax==0).sum(), ((f.pax==0)&(f.status=='cancelled')).sum())
print(f.groupby(f.sched_dep.dt.strftime('%Y-%m')).apply(lambda t:(t.status=='cancelled').mean()))
