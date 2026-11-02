import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression, LinearRegression, Ridge, Lasso
from sklearn.ensemble import RandomForestClassifier, HistGradientBoostingClassifier
from sklearn.metrics import roc_auc_score, recall_score, precision_score
def kredi_verisi(n=2000, seed=0):
    rng = np.random.default_rng(seed)
    gelir = rng.normal(35, 12, n).clip(8, None)
    borc_orani = rng.uniform(0, 0.9, n)
    gecikme = rng.poisson(0.6, n)
    yas = rng.integers(21, 66, n)
    logit = -3.6 + 3.0 * borc_orani + 0.9 * gecikme - 0.05 * (gelir - 35)
    y = (rng.random(n) < 1 / (1 + np.exp(-logit))).astype(int)
    X = np.column_stack([gelir, borc_orani, gecikme, yas])
    return X, y
X,y=kredi_verisi(); print(y.mean())
a,b,c,d=train_test_split(X,y,test_size=0.25,random_state=0,stratify=y)
for cw in [None,'balanced']:
    m=LogisticRegression(max_iter=1000,class_weight=cw).fit(a,c); p=m.predict(b)
    print(cw, roc_auc_score(d,m.predict_proba(b)[:,1]), recall_score(d,p), precision_score(d,p), m.score(b,d))
rf=RandomForestClassifier(n_estimators=100,random_state=0,class_weight='balanced',min_samples_leaf=5).fit(a,c)
print('rf', roc_auc_score(d,rf.predict_proba(b)[:,1]), rf.feature_importances_.round(3))
h=HistGradientBoostingClassifier(random_state=0).fit(a,c); print('hgb', roc_auc_score(d,h.predict_proba(b)[:,1]))
def sepet_verisi(n=500, seed=42):
    rng = np.random.default_rng(seed)
    urun = rng.integers(1, 15, n); uye = rng.integers(0, 2, n); kampanya = rng.integers(0, 2, n); mesafe = rng.uniform(1, 30, n)
    sepet = 40 + 35 * urun + 60 * uye - 25 * kampanya + rng.normal(0, 30, n)
    return np.column_stack([urun, uye, kampanya, mesafe]), sepet
X,y=sepet_verisi()
m=LinearRegression().fit(X,y); print(m.coef_.round(2), round(m.intercept_,2))
for al in [1,10]:
    print(al, Ridge(alpha=al).fit(X,y).coef_.round(2), Lasso(alpha=al).fit(X,y).coef_.round(2))
