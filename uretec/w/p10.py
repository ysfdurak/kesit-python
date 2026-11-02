import sys,time,warnings; sys.path.insert(0,'/home/claude/py/tools/pylib'); import veri, pandas as pd, numpy as np
warnings.filterwarnings("ignore")
from sklearn.neural_network import MLPClassifier
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score
t=time.time()
islem = veri.oku("ilgaz_bank", "bank_txns", usecols=["account_id", "txn_time", "amount", "txn_type"], parse_dates=["txn_time"])
hesap = veri.oku("ilgaz_bank", "bank_accounts")
musteri = veri.oku("ilgaz_bank", "bank_customers").set_index("customer_id")
K = pd.Timestamp("2024-07-01")
d = islem.merge(hesap[["account_id", "customer_id"]], on="account_id")
once, sonra = d[d.txn_time < K], d[d.txn_time >= K]
kart = once[once.txn_type == "kart_harcama"]
t_ = pd.DataFrame(index=sorted(once.customer_id.unique()))
t_["risk_score"] = musteri.risk_score
t_["islem_sayisi"] = once.groupby("customer_id").size()
t_["kart_adet"] = kart.groupby("customer_id").size().reindex(t_.index).fillna(0)
t_["log_kart"] = np.log1p(kart.groupby("customer_id").amount.sum().abs().reindex(t_.index).fillna(0))
t_["kart_hesap"] = hesap[hesap.account_type=="kredi_karti"].groupby("customer_id").size().reindex(t_.index).fillna(0)
h = sonra[sonra.txn_type=="kart_harcama"].groupby("customer_id").amount.sum().abs().reindex(t_.index).fillna(0)
y=(h>=h.median()).astype(int)
X=t_.to_numpy(float)
Xtr,Xte,ytr,yte=train_test_split(X,y,test_size=0.3,random_state=0,stratify=y)
for hl in [(16,),(32,16)]:
  for a in [1e-4,1e-2,1.0]:
    m=make_pipeline(StandardScaler(),MLPClassifier(hidden_layer_sizes=hl,alpha=a,max_iter=2000,random_state=0)).fit(Xtr,ytr)
    print(hl,a,round(roc_auc_score(yte,m.predict_proba(Xte)[:,1]),3), m[-1].n_iter_)
m=make_pipeline(StandardScaler(),MLPClassifier(hidden_layer_sizes=(16,),early_stopping=True,max_iter=2000,random_state=0)).fit(Xtr,ytr); print('es',round(roc_auc_score(yte,m.predict_proba(Xte)[:,1]),3),m[-1].n_iter_)
g=HistGradientBoostingClassifier(random_state=0).fit(Xtr,ytr); print('hgb',round(roc_auc_score(yte,g.predict_proba(Xte)[:,1]),3))
m=make_pipeline(StandardScaler(),MLPClassifier(hidden_layer_sizes=(16,),max_iter=2000,random_state=0)); 
mn=MLPClassifier(hidden_layer_sizes=(16,),max_iter=2000,random_state=0).fit(Xtr,ytr); print('no scale',round(roc_auc_score(yte,mn.predict_proba(Xte)[:,1]),3))
print(time.time()-t, len(y), y.sum())
