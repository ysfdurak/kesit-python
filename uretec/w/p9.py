import sys,time,warnings; sys.path.insert(0,'/home/claude/py/tools/pylib'); import veri, pandas as pd, numpy as np
yol=veri.oku("pedal_izmir","bk_trips",usecols=["started_at"],parse_dates=["started_at"])
s=yol.set_index("started_at").resample("h").size()
s=s.reindex(pd.date_range("2024-06-01","2024-08-31 23:00",freq="h"),fill_value=0).rename("talep")
tr,te=s[:-168],s[-168:]
ma=np.mean(np.abs(tr[-168:].mean()-te.values)); print('ma168',ma)
def mets(y,yh,ye,m):
    y=np.asarray(y,float); yh=np.asarray(yh,float); ye=np.asarray(ye,float)
    mae=np.mean(np.abs(y-yh)); rmse=np.sqrt(np.mean((y-yh)**2))
    den=(np.abs(y)+np.abs(yh)); sm=np.mean(np.where(den==0,0,2*np.abs(y-yh)/np.where(den==0,1,den)))*100
    sc=np.mean(np.abs(ye[m:]-ye[:-m])); return mae,rmse,sm,mae/sc
print(mets(te,tr[-168:].values,tr,168), mets(te,tr[-168:].values,tr,24))
print((te==0).sum())
# residual intervals: sn168 residuals July -> Aug
d=pd.DataFrame({"y":s,"sn":s.shift(168)}).dropna(); d["e"]=d.y-d.sn
jul=d[d.index.month==7]; aug=d[d.index.month==8]
lo,hi=jul.e.quantile(0.1), jul.e.quantile(0.9); print(lo,hi, ((aug.y>=aug.sn+lo)&(aug.y<=aug.sn+hi)).mean())
q=jul.groupby(jul.index.hour).e.quantile([0.1,0.9]).unstack()
a=aug.join(q, on=aug.index.hour) if False else None
