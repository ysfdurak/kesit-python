import sys; sys.path.insert(0,'/home/claude/py/tools/pylib'); import veri, pandas as pd, numpy as np, time
from sklearn.pipeline import make_pipeline
from sklearn.compose import make_column_transformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_val_score, StratifiedKFold
t=time.time()
islem = veri.oku("ilgaz_bank", "bank_txns", usecols=["account_id", "txn_time", "amount", "txn_type"], parse_dates=["txn_time"])
hesap = veri.oku("ilgaz_bank", "bank_accounts")
musteri = veri.oku("ilgaz_bank", "bank_customers", parse_dates=["birth_date", "joined_date"])
KESIM = pd.Timestamp("2024-07-01")
d = islem.merge(hesap[["account_id", "customer_id"]], on="account_id")
once = d[d.txn_time < KESIM]; sonra = d[d.txn_time >= KESIM]
hedef_tl = sonra[sonra.txn_type == "kart_harcama"].groupby("customer_id")["amount"].sum().abs()
m = musteri.set_index("customer_id")
tab = pd.DataFrame(index=sorted(once.customer_id.unique()))
tab["risk_score"] = m.risk_score; tab["segment"] = m.segment
tab["yas"] = ((KESIM - m.birth_date).dt.days // 365)
tab["kidem_gun"] = (KESIM - m.joined_date).dt.days
g = once.groupby("customer_id")
kart = once[once.txn_type=="kart_harcama"]
tab["islem_sayisi"] = g.size()
tab["kart_toplam"] = kart.groupby("customer_id")["amount"].sum().abs()
tab["kart_toplam"] = tab.kart_toplam.fillna(0)
tab["maas_toplam"] = once[once.txn_type=="maas"].groupby("customer_id")["amount"].sum()
tab["maas_toplam"] = tab.maas_toplam.fillna(0)
tab["maas_var"] = (tab.maas_toplam>0).astype(int)
tab["kart_maas_orani"] = tab.kart_toplam / (tab.maas_toplam + 1)
tab["log_kart"] = np.log1p(tab.kart_toplam)
tab["son_islem_gun"] = (KESIM - g.txn_time.max()).dt.days
tab["son90_kart"] = kart[kart.txn_time >= KESIM - pd.Timedelta(days=90)].groupby("customer_id")["amount"].sum().abs()
tab["son90_kart"] = tab.son90_kart.fillna(0)
tab["hedef_tl"] = hedef_tl.reindex(tab.index).fillna(0)
esik = tab.hedef_tl.median()
tab["y"] = (tab.hedef_tl >= esik).astype(int)
print(len(tab), esik, tab.y.mean())
cv = StratifiedKFold(5, shuffle=True, random_state=0)
def auc(cols):
    num=[c for c in cols if c!="segment"]; cat=[c for c in cols if c=="segment"]
    ct = make_column_transformer((StandardScaler(), num), *( [(OneHotEncoder(handle_unknown="ignore"), cat)] if cat else []))
    p = make_pipeline(ct, LogisticRegression(max_iter=1000))
    return cross_val_score(p, tab[cols], tab.y, cv=cv, scoring="roc_auc").mean()
print('demo', auc(["risk_score","segment","yas","kidem_gun"]))
print('ham', auc(["risk_score","segment","yas","kidem_gun","islem_sayisi","kart_toplam"]))
print('muh', auc(["risk_score","segment","yas","kidem_gun","islem_sayisi","log_kart","maas_var","kart_maas_orani","son_islem_gun","son90_kart"]))
print(time.time()-t)
tab["kart_adet"] = kart.groupby("customer_id").size().reindex(tab.index).fillna(0)
hk = hesap.groupby("customer_id").agg(kart_hesap=("account_type", lambda s:(s=="kredi_karti").sum()), limit=("credit_limit","sum"))
tab = tab.join(hk)
tab["kart_hesap_var"]=(tab.kart_hesap>0).astype(int)
print(tab[["kart_adet","kart_toplam","log_kart","kart_hesap","limit","son90_kart","islem_sayisi","maas_toplam","risk_score","hedef_tl"]].corr()["hedef_tl"])
base=["risk_score","segment","yas","kidem_gun"]
for extra in [["kart_adet"],["kart_adet","log_kart"],["kart_adet","log_kart","son90_kart","kart_hesap"],["log_kart","kart_hesap_var","limit"],["kart_adet","log_kart","kart_hesap","limit","son90_kart"]]:
    print(extra, auc(base+extra))
print(tab.groupby("segment").hedef_tl.mean())
