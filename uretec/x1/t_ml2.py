exec(open('../h.py').read())
import time; T0=time.time()
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import make_pipeline
from sklearn.metrics import roc_auc_score, average_precision_score
A=veri.oku('anadolu_bank','bank_accounts',parse_dates=['opened_date','closed_date'])
C=veri.oku('anadolu_bank','bank_customers',parse_dates=['joined_date'])
TX=veri.oku('anadolu_bank','bank_txns',usecols=['account_id','txn_time','amount','txn_type'],parse_dates=['txn_time'])
TX=TX.merge(A[['account_id','customer_id','currency']],on='account_id')
FX=veri.oku('anadolu_bank','bank_fx',parse_dates=['rate_date'])
def etiket(snap, ufuk=60):
    s=pd.Timestamp(snap); acik=A[(A.opened_date<=s)&(A.closed_date.isna()|(A.closed_date>s))]
    kap=acik[(acik.closed_date>s)&(acik.closed_date<=s+pd.Timedelta(days=ufuk))]
    e=pd.DataFrame({'customer_id':sorted(acik.customer_id.unique())}); e['churn']=e.customer_id.isin(kap.customer_id).astype(int); e['snap']=s; return e
def ozellik(snap,gun=90):
    s=pd.Timestamp(snap); t=TX[(TX.txn_time<s)&(TX.txn_time>=s-pd.Timedelta(days=gun))]
    son30=t.txn_time>=s-pd.Timedelta(days=30)
    g=pd.DataFrame({'islem_90':t.groupby('customer_id').size(),'islem_30':t[son30].groupby('customer_id').size(),
        'maas_90':t[t.txn_type=='maas'].groupby('customer_id').size(),'son':t.groupby('customer_id').txn_time.max()}).fillna({'islem_30':0,'maas_90':0})
    g['son_islem_gun']=(s-g.son).dt.days; g['ivme']=g.islem_30/(g.islem_90/3)
    return g.drop(columns='son')
def veri_seti(snaps):
    parcalar=[]
    for sn in snaps:
        d=etiket(sn).merge(ozellik(sn),on='customer_id',how='left').merge(C[['customer_id','segment','risk_score','joined_date']],on='customer_id')
        d['kidem_yil']=(d.snap-d.joined_date).dt.days/365.25
        d=d.fillna({'islem_90':0,'islem_30':0,'maas_90':0,'son_islem_gun':90,'ivme':0}); parcalar.append(d.drop(columns='joined_date'))
    return pd.concat(parcalar,ignore_index=True)
tr=veri_seti(pd.date_range('2024-04-01','2024-07-01',freq='MS')); te=veri_seti(pd.date_range('2024-08-01','2024-10-01',freq='MS'))
print(len(tr),tr.churn.sum(),len(te),te.churn.sum(), time.time()-T0)
SAY=['islem_90','islem_30','maas_90','son_islem_gun','ivme','risk_score','kidem_yil']; KAT=['segment']
for name,m in [('lr',LogisticRegression(max_iter=1000,class_weight='balanced')),('hgb',HistGradientBoostingClassifier(max_depth=3,learning_rate=0.05,random_state=0))]:
    p=make_pipeline(ColumnTransformer([('s',StandardScaler(),SAY),('k',OneHotEncoder(handle_unknown='ignore'),KAT)]),m).fit(tr[SAY+KAT],tr.churn)
    pr=p.predict_proba(te[SAY+KAT])[:,1]; print(name, round(roc_auc_score(te.churn,pr),3), round(average_precision_score(te.churn,pr),3))
print(tr.groupby('churn')[SAY].mean().round(2))
def psi(b,g,k=10):
    kenar=np.unique(np.quantile(b,np.linspace(0,1,k+1))); kenar[0]=-np.inf; kenar[-1]=np.inf
    pb=np.histogram(b,kenar)[0]/len(b); pg=np.histogram(g,kenar)[0]/len(g); pb=np.clip(pb,1e-4,None); pg=np.clip(pg,1e-4,None)
    return float(np.sum((pg-pb)*np.log(pg/pb)))
for c in ['islem_90','islem_30','son_islem_gun','risk_score','kidem_yil','ivme']:
    print(c, round(psi(tr[c],te[c]),4))
print('----')
mar=veri_seti(['2024-03-01']); print('mart ivme psi', round(psi(tr.ivme, mar.ivme),3), round(mar.ivme.mean(),2), round(tr.ivme.mean(),2))
dec=veri_seti(['2024-12-01']); 
for c in ['islem_90','islem_30','son_islem_gun','ivme']: print('dec',c, round(psi(tr[c],dec[c]),4))
p=make_pipeline(ColumnTransformer([('s',StandardScaler(),SAY),('k',OneHotEncoder(handle_unknown='ignore'),KAT)]),LogisticRegression(max_iter=1000,class_weight='balanced')).fit(tr[SAY+KAT],tr.churn)
ptr=p.predict_proba(tr[SAY+KAT])[:,1]; pte=p.predict_proba(te[SAY+KAT])[:,1]; pdc=p.predict_proba(dec[SAY+KAT])[:,1]
print('skor psi te', round(psi(ptr,pte),4), 'dec', round(psi(ptr,pdc),4))
# top decile lift on test
n=int(np.ceil(len(te)*0.1)); idx=np.argsort(-pte)[:n]; print('lift', round(te.churn.values[idx].mean()/te.churn.mean(),2), te.churn.values[idx].sum())
print(round(te.churn.mean()*100,2), round(tr.churn.mean()*100,2))
print('====')
f=ozellik('2024-07-01'); print(len(f), f.loc[41].round(3).to_dict(), f.loc[1].round(3).to_dict())
s=pd.Timestamp('2024-07-01'); t=TX[(TX.txn_time>=s-pd.Timedelta(days=90))]; print(t.groupby('customer_id').size().loc[[1,41]].tolist())
x=TX.merge(A[['account_id','closed_date']],on='account_id'); print((x.txn_time>x.closed_date).sum())
print(round(psi(tr.islem_90, tr.islem_90),4))
e=etiket('2024-07-01'); print(e.churn.sum(), len(e), e[e.churn==1].customer_id.tolist())
