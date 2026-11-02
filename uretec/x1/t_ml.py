exec(open('../h.py').read())
import time; T0=time.time()
A=veri.oku('anadolu_bank','bank_accounts',parse_dates=['opened_date','closed_date'])
C=veri.oku('anadolu_bank','bank_customers',parse_dates=['joined_date'])
TX=veri.oku('anadolu_bank','bank_txns',usecols=['account_id','txn_time','amount','txn_type'],parse_dates=['txn_time'])
FX=veri.oku('anadolu_bank','bank_fx',parse_dates=['rate_date'])
print('read',time.time()-T0); print(FX.head(), FX.currency.unique(), A.currency.value_counts().to_dict())
def etiket(snap, ufuk=60):
    s=pd.Timestamp(snap); acik=A[(A.opened_date<=s)&(A.closed_date.isna()|(A.closed_date>s))]
    kap=acik[(acik.closed_date>s)&(acik.closed_date<=s+pd.Timedelta(days=ufuk))]
    e=pd.DataFrame({'customer_id':sorted(acik.customer_id.unique())}); e['churn']=e.customer_id.isin(kap.customer_id).astype(int); e['snap']=s; return e
for sn in pd.date_range('2024-03-01','2024-10-01',freq='MS'):
    e=etiket(sn); print(sn.date(), len(e), e.churn.sum())
def ozellik(snap,gun=90):
    s=pd.Timestamp(snap); t=TX[(TX.txn_time<s)&(TX.txn_time>=s-pd.Timedelta(days=gun))].merge(A[['account_id','customer_id']],on='account_id')
    g=t.groupby('customer_id').agg(islem=('amount','size'),son=('txn_time','max'),maas=('txn_type',lambda x:(x=='maas').sum()),kart=('txn_type',lambda x:(x=='kart_harcama').sum()))
    g['son_islem_gun']=(s-g.son).dt.days; return g.drop(columns='son')
e=etiket('2024-07-01'); f=ozellik('2024-07-01'); d=e.merge(f,on='customer_id',how='left'); print(d.isna().sum().to_dict()); print(d.groupby('churn')[['islem','maas','kart','son_islem_gun']].mean().round(2))
print('t',time.time()-T0)
print('----')
k=A[A.closed_date.notna()]
x=TX.merge(k[['account_id','closed_date']],on='account_id'); x['gun']=(x.closed_date-x.txn_time).dt.days
print(pd.cut(x.gun,[-400,-1,30,60,90,120,180,400]).value_counts().sort_index().to_dict())
# customer-level, all accounts of churners
kc=k.groupby('customer_id').closed_date.min()
y=TX.merge(A[['account_id','customer_id']],on='account_id').merge(kc.rename('cd'),on='customer_id')
y['gun']=(y.cd-y.txn_time).dt.days
print(pd.cut(y.gun,[-400,-1,30,60,90,120,180,400]).value_counts().sort_index().to_dict(), y.customer_id.nunique())
# nonchurn baseline per customer per 30 days
n=TX.merge(A[['account_id','customer_id']],on='account_id'); print(len(n)/A.customer_id.nunique()/12.2)
# churners: per-30 day counts by window
for lo,hi in [(0,30),(30,60),(60,90),(90,180)]:
    print(lo,hi, round(((y.gun>=lo)&(y.gun<hi)).sum()/y.customer_id.nunique()/((hi-lo)/30),2))
print(C.risk_score.describe().to_dict()); cc=C.set_index('customer_id'); print(cc.loc[kc.index].risk_score.mean(), cc.risk_score.mean(), cc.loc[kc.index].segment.value_counts().to_dict(), cc.segment.value_counts().to_dict())
