import sys, os, time; sys.path.insert(0,'/home/claude/py/tools/pylib'); os.environ['PP_VERI']='/home/claude/py/data'
import veri, pandas as pd, numpy as np
from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.experimental import enable_halving_search_cv
from sklearn.model_selection import HalvingGridSearchCV
from sklearn.inspection import partial_dependence
def ik_verisi():
    e = veri.oku("pusula_ik", "ik_employees")
    p = veri.oku("pusula_ik", "ik_positions")
    d = e.merge(p[["position_id", "level"]], on="position_id")
    d["ise_giris_yasi"] = (pd.to_datetime(d["hire_date"]).dt.year - d["birth_year"]).astype(float)
    d["level"] = d["level"].astype(float)
    y = (d["term_type"] == "gönüllü").astype(int)
    X = d[["ise_giris_yasi", "level", "education", "city", "work_mode", "hire_source"]]
    return X, y, d["gender"]
X,y,g=ik_verisi()
Xtr, Xte, ytr, yte, gtr, gte = train_test_split(X, y, g, test_size=0.3, random_state=0, stratify=y)
kat=["education", "city", "work_mode", "hire_source"]
pipe=Pipeline([("on", ColumnTransformer([("kat", OneHotEncoder(handle_unknown="ignore"), kat)], remainder="passthrough")),("model", LogisticRegression(max_iter=1000))])
t=time.time()
h=HalvingGridSearchCV(pipe, {"model__C":[0.01,0.1,1,10],"model__class_weight":[None,"balanced"]}, factor=2, scoring="roc_auc", cv=3, random_state=0).fit(Xtr,ytr)
print(time.time()-t, h.best_params_, h.n_candidates_, h.n_resources_, h.n_iterations_, round(h.best_score_,4))
pipe.fit(Xtr,ytr)
r=partial_dependence(pipe, Xtr, ["level"], kind="both")
print(r["grid_values"], r["average"].round(4), r["individual"].shape)
p=pipe.predict_proba(Xte)[:,1]; print(np.quantile(p,[.1,.5,.9]).round(3))
yh=(p>=0.3).astype(int)
df=pd.DataFrame({"y":yte.values,"yhat":yh,"g":gte.values})
print(df.groupby('g').apply(lambda s: pd.Series({'secim':s.yhat.mean(),'fpr':((s.yhat==1)&(s.y==0)).sum()/(s.y==0).sum(),'fnr':((s.yhat==0)&(s.y==1)).sum()/(s.y==1).sum()})).round(3))
# rule baseline
d=X.copy(); d['y']=y; d['yhat']=(X.level<=2).astype(int)
d['hata']=(d.y!=d.yhat)
print(d.groupby('city').agg(n=('hata','size'),h=('hata','mean')).sort_values('h',ascending=False).round(4))
print(d.groupby('work_mode').agg(n=('hata','size'),h=('hata','mean')).round(4), d.hata.mean())
