import sys,time; sys.path.insert(0,'/home/claude/py/tools/pylib'); import veri, pandas as pd, numpy as np
from sklearn.compose import make_column_transformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.pipeline import make_pipeline
from sklearn.linear_model import Ridge
from sklearn.metrics import mean_absolute_error as mae
t=time.time()
tr=veri.oku("pedal_izmir","bk_trips",usecols=["started_at"],parse_dates=["started_at"])
s=tr.set_index("started_at").resample("h").size().rename("talep")
w=veri.oku("pedal_izmir","bk_weather",parse_dates=["obs_hour"]).set_index("obs_hour")
d=w.join(s).fillna({"talep":0})
d["saat"]=d.index.hour; d["haftasonu"]=(d.index.dayofweek>=5).astype(int)
X=["saat","haftasonu","temp_c","rain_mm","wind_kmh"]
egt=d[d.index<"2024-06-24"]; dog=d[(d.index>="2024-06-24")&(d.index<"2024-07-01")]
m=make_pipeline(make_column_transformer((OneHotEncoder(handle_unknown="ignore"),["saat"]),remainder="passthrough"),Ridge(alpha=1.0)).fit(egt[X],egt.talep)
print('fit',time.time()-t)
print('ref',mae(dog.talep,m.predict(dog[X])))
for a in (7,8):
    k=d[d.index.month==a]; print(a, mae(k.talep,m.predict(k[X])), m.predict(k[X]).mean(), k.talep.mean())
print(dict(zip(m[0].get_feature_names_out()[-4:], m[-1].coef_[-4:].round(2))))
