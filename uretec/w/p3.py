import sys; sys.path.insert(0,'/home/claude/py/tools/pylib'); import veri, pandas as pd, numpy as np
h = veri.oku("ilgaz_bank", "bank_accounts", parse_dates=["opened_date"])
r = pd.Timestamp("2025-01-01")
yil = (r - h.opened_date).dt.days / 365
g = pd.cut(yil, bins=[0,1,3,5,100], labels=["0-1","1-3","3-5","5+"], right=False)
print(g.value_counts().sort_index().to_dict(), h.credit_limit.isna().sum(), yil.min(), yil.max())
print(h.opened_date.max())
m = veri.oku("ilgaz_bank","bank_customers")
tr = m[m.customer_id<=350]; te=m[m.customer_id>350]
f = tr.city.value_counts(normalize=True)
print(f.round(4).to_dict()); print(te.city.map(f).fillna(0).round(4).value_counts().to_dict())
i = veri.oku("ilgaz_bank","bank_txns", usecols=["account_id","txn_time","amount","txn_type"], parse_dates=["txn_time"])
k = i[i.txn_type=="kart_harcama"]
gen = k.assign(ay=k.txn_time.dt.month).groupby(["account_id","ay"])["amount"].sum().abs().unstack(fill_value=0).round(2)
print(gen.shape, gen.columns.tolist()); print(gen.head(3))
print((gen==0).sum().sum())
