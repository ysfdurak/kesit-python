import sys,time,warnings; sys.path.insert(0,'/home/claude/py/tools/pylib'); import veri, pandas as pd, numpy as np
warnings.filterwarnings("ignore")
yol=veri.oku("pedal_izmir","bk_trips",usecols=["started_at"],parse_dates=["started_at"])
s=yol.set_index("started_at").resample("h").size()
s=s.reindex(pd.date_range("2024-06-01","2024-08-31 23:00",freq="h"),fill_value=0).rename("talep")
g=s.resample("D").sum()
w=veri.oku("pedal_izmir","bk_weather",parse_dates=["obs_hour"]).set_index("obs_hour")
gw=pd.DataFrame({"temp":w.temp_c.resample("D").mean(),"yagis":w.rain_mm.resample("D").sum()})
tr,te=g[:-14],g[-14:]
from statsmodels.tsa.statespace.sarimax import SARIMAX
for exc in [None,["yagis"],["yagis","temp"]]:
    for tr_ in ['c']:
        ex=gw[exc] if exc else None
        t=time.time(); m=SARIMAX(tr,exog=None if ex is None else ex[:-14],order=(1,0,0),seasonal_order=(1,0,0,7),trend=tr_).fit(disp=False)
        f=m.forecast(14,exog=None if ex is None else ex[-14:]); print(exc,round(time.time()-t,2),np.mean(np.abs(f-te)), m.params.round(2).to_dict())
print(te.round(0).tolist()); print(gw.yagis[-14:].round(1).tolist())
# hourly ML
from sklearn.linear_model import Ridge
d=pd.DataFrame({"talep":s}); d=d.join(w)
d["saat"]=d.index.hour; d["gun"]=d.index.dayofweek
d["lag24"]=d.talep.shift(24); d["lag168"]=d.talep.shift(168)
d["ort24_lag24"]=d.talep.shift(24).rolling(24).mean()
d=d.dropna()
X=pd.get_dummies(d[["saat"]].astype(str)).astype(float).join(d[["lag24","lag168","rain_mm","temp_c","wind_kmh"]])
X["hs"]=(d.gun>=5).astype(int)
egt=d.index< "2024-08-18"; 
m=Ridge(1.0).fit(X[egt],d.talep[egt]); p=m.predict(X[~egt]); print('ridge',np.mean(np.abs(p-d.talep[~egt])), 'sn168', np.mean(np.abs(d.lag168[~egt]-d.talep[~egt])), 'sn24', np.mean(np.abs(d.lag24[~egt]-d.talep[~egt])))
X2=X.drop(columns=["rain_mm","temp_c","wind_kmh"]); m=Ridge(1.0).fit(X2[egt],d.talep[egt]); p=m.predict(X2[~egt]); print('ridge no weather',np.mean(np.abs(p-d.talep[~egt])))
# where does seasonal naive fail: rainy hours
r=d[~egt]; print(r[r.rain_mm>0].shape, np.mean(np.abs(r.lag168-r.talep)[r.rain_mm>0]))
print(d.groupby(d.rain_mm>0).talep.mean())
