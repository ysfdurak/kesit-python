import sys,time,warnings; sys.path.insert(0,'/home/claude/py/tools/pylib'); import veri, pandas as pd, numpy as np
warnings.filterwarnings("ignore")
t=time.time()
yol=veri.oku("pedal_izmir","bk_trips",usecols=["started_at"],parse_dates=["started_at"])
s=yol.set_index("started_at").resample("h").size()
s=s.reindex(pd.date_range("2024-06-01","2024-08-31 23:00",freq="h"),fill_value=0).rename("talep")
print(len(s), s.sum(), (s==0).sum(), s.max())
g=s.resample("D").sum(); print(len(g), g.describe().round(1).to_dict())
print(g.groupby(g.index.dayofweek).mean().round(1).tolist())
w=veri.oku("pedal_izmir","bk_weather",parse_dates=["obs_hour"]).set_index("obs_hour")
gw=pd.DataFrame({"temp":w.temp_c.resample("D").mean(),"yagis":w.rain_mm.resample("D").sum()})
print(pd.concat([g,gw],axis=1).corr().round(3))
print('t',time.time()-t)
from statsmodels.tsa.seasonal import STL
t=time.time(); r=STL(s,period=24).fit(); print('stl',time.time()-t)
Fs=max(0,1-np.var(r.resid)/np.var(r.seasonal+r.resid)); print('Fs',Fs)
from statsmodels.tsa.stattools import adfuller
t=time.time(); print('adf g',adfuller(g)[1], time.time()-t)
from statsmodels.tsa.holtwinters import ExponentialSmoothing
tr,te=g[:-14],g[-14:]
t=time.time(); m=ExponentialSmoothing(tr,seasonal="add",seasonal_periods=7).fit(); f=m.forecast(14); print('ets',time.time()-t, np.mean(np.abs(f-te)))
sn=np.tile(tr[-7:].values,2); print('snaive',np.mean(np.abs(sn-te.values)))
print('naive', np.mean(np.abs(tr.iloc[-1]-te.values)), 'ma7', np.mean(np.abs(tr[-7:].mean()-te.values)))
from statsmodels.tsa.statespace.sarimax import SARIMAX
ex=gw[["temp","yagis"]]
t=time.time(); m=SARIMAX(tr,exog=ex[:-14],order=(1,0,0),seasonal_order=(1,0,0,7)).fit(disp=False); f=m.forecast(14,exog=ex[-14:]); print('sarimax',time.time()-t,np.mean(np.abs(f-te)), m.params.round(3).to_dict())
# hourly ets
tr,te=s[:-168],s[-168:]
t=time.time(); m=ExponentialSmoothing(tr,seasonal="add",seasonal_periods=24).fit(); f=m.forecast(168); print('ets h',time.time()-t,np.mean(np.abs(f.values-te.values)))
print('sn24',np.mean(np.abs(np.tile(tr[-24:].values,7)-te.values)),'sn168',np.mean(np.abs(tr[-168:].values-te.values)), 'naive', np.mean(np.abs(tr.iloc[-1]-te.values)))
