import sys, os, time; sys.path.insert(0,'/home/claude/py/tools/pylib'); os.environ['PP_VERI']='/home/claude/py/data'
import veri, pandas as pd, numpy as np
t0=time.time()
o = veri.oku("lezzet_kurye", "lk_orders"); r = veri.oku("lezzet_kurye", "lk_restaurants"); k = veri.oku("lezzet_kurye", "lk_couriers")
l = veri.oku("lezzet_kurye", "lk_order_lines")
print(r.cuisine.value_counts().to_dict(), k.vehicle.value_counts().to_dict(), r.city.value_counts().to_dict())
o = o[o.status == "teslim"].copy()
o["sure_dk"] = (pd.to_datetime(o.delivered_at) - pd.to_datetime(o.placed_at)).dt.total_seconds() / 60
o["saat"] = pd.to_datetime(o.placed_at).dt.hour
o["hafta_sonu"] = (pd.to_datetime(o.placed_at).dt.dayofweek >= 5).astype(int)
adet = l.groupby("order_id")["qty"].sum().rename("adet")
d = o.merge(r[["restaurant_id","cuisine","city"]], on="restaurant_id").merge(k[["courier_id","vehicle"]], on="courier_id").merge(adet, on="order_id")
print(len(d), d.sure_dk.describe().round(1).to_dict())
print(d.groupby('vehicle').sure_dk.mean().round(1).to_dict(), d.groupby('saat').sure_dk.mean().round(1).to_dict())
print(d.groupby('cuisine').sure_dk.mean().round(1).to_dict())
X = d[["saat","hafta_sonu","adet","cuisine","city","vehicle"]].copy()
for c in ["cuisine","city","vehicle"]: X[c]=X[c].astype("category")
y = d.sure_dk
from sklearn.model_selection import train_test_split
from sklearn.ensemble import HistGradientBoostingRegressor
from sklearn.metrics import mean_absolute_error
Xtr,Xte,ytr,yte=train_test_split(X,y,test_size=0.25,random_state=0)
print('baseline', mean_absolute_error(yte, np.full(len(yte), ytr.mean())))
m=HistGradientBoostingRegressor(categorical_features=[3,4,5] if False else ["cuisine","city","vehicle"], learning_rate=0.1, max_leaf_nodes=15, early_stopping=True, validation_fraction=0.15, n_iter_no_change=10, random_state=0).fit(Xtr,ytr)
print('hgb', mean_absolute_error(yte,m.predict(Xte)), m.n_iter_)
print(time.time()-t0)
print(d.groupby('restaurant_id').sure_dk.mean().round(1).describe().to_dict())
X["restoran"]=d["restaurant_id"].astype(str).astype("category")
Xtr,Xte,ytr,yte=train_test_split(X,y,test_size=0.25,random_state=0)
m=HistGradientBoostingRegressor(categorical_features=["cuisine","city","vehicle","restoran"], learning_rate=0.1, max_leaf_nodes=15, early_stopping=True, n_iter_no_change=10, random_state=0).fit(Xtr,ytr)
print('hgb+rest', mean_absolute_error(yte,m.predict(Xte)), m.n_iter_)
d["hazir"]=(pd.to_datetime(d.picked_at)-pd.to_datetime(d.placed_at)).dt.total_seconds()/60
d["yol"]=(pd.to_datetime(d.delivered_at)-pd.to_datetime(d.picked_at)).dt.total_seconds()/60
print(d[['hazir','yol']].describe().round(1).to_dict()); print(d.groupby('vehicle').yol.mean().round(1).to_dict(), d.groupby('cuisine').hazir.mean().round(1).to_dict())
