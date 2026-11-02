exec(open('../h.py').read())
import re
from collections import Counter
r=veri.oku('lezzet_kurye','lk_ratings')
def tr_kucuk(m): return m.replace("I","ı").replace("İ","i").lower()
y=r.dropna(subset=['comment'])
t=y.groupby('comment').agg(adet=('order_id','size'),yemek=('food_score','mean'),kurye=('courier_score','mean')).round(2).sort_values('yemek'); print(t)
KONU={"gecikme":["geç"],"sıcaklık":["soğuk"],"hatalı sipariş":["eksik","yanlış","dökül"],"porsiyon":["porsiyon"],"lezzet":["lezzet"]}
def konular(m):
    k=tr_kucuk(m); return [ad for ad,ks in KONU.items() if any(x in k for x in ks)]
c=Counter(x for m in y.comment for x in konular(m)); print(dict(c.most_common()))
print(sum(1 for m in y.comment if not konular(m)))
D={"ve","ama","çok","biraz","hiç","vardı"}
w=Counter(x for m in y.comment for x in re.findall(r"[a-zçğıöşü]+",tr_kucuk(m)) if x not in D); print(w.most_common(5))
print(r.comment.str.contains('geç',na=False).sum(), round(r[r.comment.str.contains('geç',na=False)].courier_score.mean(),2), round(r[~r.comment.str.contains('geç',na=False)].courier_score.mean(),2))
y=y.copy(); y['etiket']=np.where(y.food_score>=4,'olumlu',np.where(y.food_score<=2,'olumsuz','notr')); 
z=y[y.etiket!='notr']; print(z.etiket.value_counts().to_dict(), len(z))
print(pd.crosstab(z.comment,z.etiket))
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline
from sklearn.model_selection import train_test_split, GroupShuffleSplit
from sklearn.metrics import accuracy_score, balanced_accuracy_score
X=z.comment; yy=z.etiket
a,b,c1,d=train_test_split(X,yy,test_size=0.3,random_state=0,stratify=yy)
m=make_pipeline(TfidfVectorizer(preprocessor=tr_kucuk),LogisticRegression(max_iter=1000,class_weight='balanced')).fit(a,c1)
print('random', round(accuracy_score(d,m.predict(b)),3), round(balanced_accuracy_score(d,m.predict(b)),3), len(set(b)-set(a)))
gss=GroupShuffleSplit(n_splits=1,test_size=0.3,random_state=0); tr,te=next(gss.split(X,yy,groups=X))
print(sorted(set(X.iloc[te])))
m.fit(X.iloc[tr],yy.iloc[tr]); p=m.predict(X.iloc[te]); print('group', round(accuracy_score(yy.iloc[te],p),3), round(balanced_accuracy_score(yy.iloc[te],p),3))
print('base', round((yy=='olumlu').mean(),3))
