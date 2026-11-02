import sys,time,warnings; sys.path.insert(0,'/home/claude/py/tools/pylib'); import veri, pandas as pd, numpy as np
yol=veri.oku("pedal_izmir","bk_trips",usecols=["started_at"],parse_dates=["started_at"])
s=yol.set_index("started_at").resample("h").size()
s=s.reindex(pd.date_range("2024-06-01","2024-08-31 23:00",freq="h"),fill_value=0).rename("talep")
g=s.resample("D").sum()
w=veri.oku("pedal_izmir","bk_weather",parse_dates=["obs_hour"]).set_index("obs_hour")
gw=pd.DataFrame({"temp":w.temp_c.resample("D").mean(),"yagis":w.rain_mm.resample("D").sum()})
tr,te=g[:-14],g[-14:]
from statsmodels.tsa.statespace.sarimax import SARIMAX
t=time.time()
with warnings.catch_warnings(record=True) as W:
    warnings.simplefilter("always")
    m=SARIMAX(tr,exog=gw[["yagis"]][:-14],order=(1,0,0),seasonal_order=(1,0,0,7),trend='c').fit(disp=False, maxiter=200)
    print([str(x.message)[:60] for x in W])
f=m.forecast(14,exog=gw[["yagis"]][-14:]); print(time.time()-t, np.mean(np.abs(f-te)), m.params.round(2).to_dict())
with warnings.catch_warnings(record=True) as W:
    warnings.simplefilter("always")
    m=SARIMAX(tr,exog=gw[["yagis"]][:-14],order=(1,0,0),trend='c').fit(disp=False)
    print([str(x.message)[:60] for x in W])
f=m.forecast(14,exog=gw[["yagis"]][-14:]); print('ar1+exog', np.mean(np.abs(f-te)), m.params.round(2).to_dict())
with warnings.catch_warnings(record=True) as W:
    warnings.simplefilter("always")
    m=SARIMAX(tr,exog=gw[["yagis"]][:-14],order=(0,0,0),seasonal_order=(1,0,0,7),trend='c').fit(disp=False)
    print([str(x.message)[:60] for x in W])
f=m.forecast(14,exog=gw[["yagis"]][-14:]); print('sar+exog', np.mean(np.abs(f-te)), m.params.round(2).to_dict())
fc=m.get_forecast(14,exog=gw[["yagis"]][-14:]); ci=fc.conf_int(alpha=0.2); print(((te>=ci.iloc[:,0])&(te<=ci.iloc[:,1])).mean())
# hourly backtest
from sklearn.linear_model import Ridge
d=pd.DataFrame({"talep":s}).join(w)
d["saat"]=d.index.hour; d["hs"]=(d.index.dayofweek>=5).astype(int)
d["lag24"]=d.talep.shift(24); d["lag168"]=d.talep.shift(168)
d=d.dropna()
X=pd.get_dummies(d.saat, prefix="s").astype(float).join(d[["hs","lag24","lag168","rain_mm","temp_c"]])
res=[]
for bas in pd.date_range("2024-08-04", "2024-08-25", freq="7D"):
    egt=d.index<bas; tst=(d.index>=bas)&(d.index<bas+pd.Timedelta(days=7))
    m=Ridge(1.0).fit(X[egt],d.talep[egt]); p=m.predict(X[tst]); y=d.talep[tst]
    res.append((str(bas.date()), round(np.mean(np.abs(p-y)),2), round(np.mean(np.abs(d.lag168[tst]-y)),2), round(np.mean(np.abs(d.lag24[tst]-y)),2)))
print(res)
