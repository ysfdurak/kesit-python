import sys, os; sys.path.insert(0,'/home/claude/py/tools/pylib'); os.environ['PP_VERI']='/home/claude/py/data'
import veri, pandas as pd, numpy as np
from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.pipeline import make_pipeline
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.inspection import permutation_importance, partial_dependence
e = veri.oku("pusula_ik", "ik_employees")
p = veri.oku("pusula_ik", "ik_positions")
d = e.merge(p[["position_id", "level"]], on="position_id")
d["ise_giris_yasi"] = pd.to_datetime(d["hire_date"]).dt.year - d["birth_year"]
d["ayrildi"] = (d["term_type"] == "gönüllü").astype(int)
X = d[["ise_giris_yasi", "level", "education", "city", "work_mode", "hire_source"]]
y = d["ayrildi"]; g = d["gender"]
print(y.mean(), d.groupby('gender').ayrildi.mean().to_dict(), d.groupby('work_mode').ayrildi.mean().round(3).to_dict(), d.groupby('hire_source').ayrildi.mean().round(3).to_dict(), d.groupby('level').ayrildi.mean().round(3).to_dict())
Xtr, Xte, ytr, yte, gtr, gte = train_test_split(X, y, g, test_size=0.3, random_state=0, stratify=y)
on = ColumnTransformer([("kat", OneHotEncoder(handle_unknown="ignore"), ["education", "city", "work_mode", "hire_source"])], remainder="passthrough")
m = make_pipeline(on, LogisticRegression(max_iter=1000)).fit(Xtr, ytr)
print('acc', m.score(Xte, yte))
pr = m.predict_proba(Xte)[:,1]; yh=(pr>=0.3).astype(int)
for k in ['E','K']:
    s = gte==k; yt=yte[s]; yp=yh[s]
    fp=((yp==1)&(yt==0)).sum(); tn=((yp==0)&(yt==0)).sum(); fn=((yp==0)&(yt==1)).sum(); tp=((yp==1)&(yt==1)).sum()
    print(k, fp/(fp+tn), fn/(fn+tp), yp.mean())
r = permutation_importance(m, Xte, yte, n_repeats=5, random_state=0, scoring='roc_auc')
print(dict(zip(X.columns, r.importances_mean.round(4))))
pd_ = partial_dependence(m, Xtr, ["ise_giris_yasi"], grid_resolution=5)
print(pd_["grid_values"], pd_["average"])
from sklearn.metrics import roc_auc_score
print(roc_auc_score(yte, pr))
