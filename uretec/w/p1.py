import sys; sys.path.insert(0,'/home/claude/py/tools/pylib'); import veri, pandas as pd, numpy as np, time
t=time.time()
islem = veri.oku("anadolu_bank", "bank_txns", usecols=["account_id", "txn_time", "amount", "txn_type"], parse_dates=["txn_time"])
print('read', time.time()-t)
hesap = veri.oku("anadolu_bank", "bank_accounts")
musteri = veri.oku("anadolu_bank", "bank_customers")
KESIM = pd.Timestamp("2024-07-01")
def musteri_ozet(islem, hesap, kesim):
    d = islem[islem["txn_time"] < kesim].merge(hesap[["account_id", "customer_id"]], on="account_id")
    kart = d[d["txn_type"] == "kart_harcama"]
    g = d.groupby("customer_id")
    oz = pd.DataFrame({
        "islem_sayisi": g.size(),
        "kart_toplam": kart.groupby("customer_id")["amount"].sum().abs(),
        "ort_tutar": g["amount"].apply(lambda s: s.abs().mean()),
        "son_islem_gun": (kesim - g["txn_time"].max()).dt.days,
    })
    oz["kart_toplam"] = oz["kart_toplam"].fillna(0)
    return oz.round(2)
oz = musteri_ozet(islem, hesap, KESIM)
print(oz.shape); print(oz.loc[[1,2,3]]); print(oz.mean().round(2)); print(oz.son_islem_gun.max())
# time features
t2=time.time()
df = islem.copy()
df["saat"]=df.txn_time.dt.hour; df["haftasonu"]=(df.txn_time.dt.dayofweek>=5).astype(int)
df["saat_sin"]=np.sin(2*np.pi*df.saat/24).round(4); df["saat_cos"]=np.cos(2*np.pi*df.saat/24).round(4)
print(df.haftasonu.mean(), df.saat.value_counts().head(3), df.saat.min(), df.saat.max())
print(df.groupby('haftasonu').amount.apply(lambda s:s.abs().mean()))
print('t',time.time()-t2)
