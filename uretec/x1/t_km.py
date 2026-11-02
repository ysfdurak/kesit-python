exec(open('../h.py').read())
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
def rfm_tablosu():
    o = veri.oku("anadolu_market", "orders", parse_dates=["order_date"])
    oi = veri.oku("anadolu_market", "order_items")
    oi["ciro"] = oi["quantity"] * oi["unit_price"] * (1 - oi["discount"])
    tutar = oi.groupby("order_id")["ciro"].sum()
    o = o[o["status"] == "delivered"].join(tutar, on="order_id")
    bugun = pd.Timestamp("2025-01-01")
    r = o.groupby("customer_id").agg(son=("order_date", "max"), frequency=("order_id", "size"), monetary=("ciro", "sum"))
    r["recency"] = (bugun - r["son"]).dt.days
    return r[["recency", "frequency", "monetary"]]
r=rfm_tablosu(); print(len(r), r.describe().round(1)); print(r.head())
c=veri.oku('anadolu_market','customers'); print(len(c)-len(r), 'no delivered')
X=StandardScaler().fit_transform(np.log1p(r)); 
for k in range(2,7):
    km=KMeans(n_clusters=k,n_init=10,random_state=0).fit(X); print(k, round(km.inertia_,1), round(silhouette_score(X,km.labels_),3))
X2=StandardScaler().fit_transform(r)
for k in range(2,7):
    km=KMeans(n_clusters=k,n_init=10,random_state=0).fit(X2); print('raw',k, round(km.inertia_,1), round(silhouette_score(X2,km.labels_),3))
km=KMeans(n_clusters=4,n_init=10,random_state=0).fit(X2); r['kume']=km.labels_
p=r.groupby('kume').agg(n=('recency','size'),recency=('recency','mean'),frequency=('frequency','mean'),monetary=('monetary','mean')).round(1); print(p.sort_values('monetary'))
m=r.join(c.set_index('customer_id').segment); print(pd.crosstab(m.kume,m.segment))
print(r.monetary.max(), r.frequency.max(), r.recency.max(), r.recency.min())
print('----')
r=r.drop(columns='kume')
km=KMeans(n_clusters=3,n_init=10,random_state=0).fit(X2); r['kume']=km.labels_
p=r.groupby('kume').agg(n=('recency','size'),recency=('recency','mean'),frequency=('frequency','mean'),monetary=('monetary','mean')).round(1); print(p.sort_values('monetary'))
print(sorted(np.bincount(km.labels_).tolist()))
ku=KMeans(n_clusters=3,n_init=10,random_state=0).fit(r[['recency','frequency','monetary']]); print('unscaled',sorted(np.bincount(ku.labels_).tolist()), r.assign(k=ku.labels_).groupby('k')[['recency','frequency','monetary']].std().round(1))
m=r.join(c.set_index('customer_id').segment)
print((m.groupby('segment').monetary.mean()).round(1).to_dict())
print(pd.crosstab(m.kume,m.segment))
o=veri.oku('anadolu_market','orders'); print(o.groupby('customer_id').channel.agg(lambda s:(s=='mobile').mean()).describe())
# z-score anomaly on monetary
z=(r.monetary-r.monetary.mean())/r.monetary.std(ddof=0); print((z>3).sum(), r.index[z>2.5].tolist())
