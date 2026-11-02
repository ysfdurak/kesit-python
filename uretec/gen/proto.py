import numpy as np, pandas as pd
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score

def veri_uret(n=1000, seed=42):
    rng = np.random.default_rng(seed)
    df = pd.DataFrame({
        "yas": rng.integers(18, 75, n),
        "kidem_ay": rng.integers(1, 120, n),
        "urun_sayisi": rng.integers(1, 5, n),
        "aylik_islem": rng.poisson(12, n),
        "bakiye": np.round(rng.gamma(2.0, 15000, n), 2),
        "sehir": rng.choice(["İstanbul", "Ankara", "İzmir", "Bursa"], n, p=[0.4, 0.25, 0.2, 0.15]),
        "mobil_aktif": rng.integers(0, 2, n),
        "sikayet_sayisi": rng.poisson(0.6, n),
    })
    z = (-1.2 + 0.9 * df["sikayet_sayisi"] - 0.5 * (df["urun_sayisi"] - 1) - 0.012 * df["kidem_ay"]
         - 0.06 * (df["aylik_islem"] - 12) - 0.8 * df["mobil_aktif"] + 0.4 * (df["sehir"] == "İzmir"))
    p = 1 / (1 + np.exp(-z))
    df["churn"] = (rng.random(n) < p).astype(int)
    return df

df = veri_uret()
print(df.head()); print(df.churn.mean()); print(df.groupby("sehir")["churn"].mean().round(3))
SAY = ["yas", "kidem_ay", "urun_sayisi", "aylik_islem", "bakiye", "mobil_aktif", "sikayet_sayisi"]
KAT = ["sehir"]
pre = ColumnTransformer([("sayi", StandardScaler(), SAY), ("kat", OneHotEncoder(handle_unknown="ignore"), KAT)])
pipe = Pipeline([("hazirlik", pre), ("model", LogisticRegression(max_iter=1000))])
X, y = df[SAY + KAT], df["churn"]
cv = StratifiedKFold(5, shuffle=True, random_state=0)
print(cross_val_score(pipe, X, y, cv=cv, scoring="roc_auc").round(3))
Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.25, stratify=y, random_state=0)
pipe.fit(Xtr, ytr); p = pipe.predict_proba(Xte)[:, 1]
print("auc", roc_auc_score(yte, p))
for e in np.arange(0.1, 0.9, 0.05):
    t = p >= e; fp = ((t == 1) & (yte == 0)).sum(); fn = ((t == 0) & (yte == 1)).sum()
    print(round(e, 2), fp, fn, fp * 100 + fn * 1500)
names = pipe.named_steps["hazirlik"].get_feature_names_out()
coef = pipe.named_steps["model"].coef_[0]
print(sorted(zip(names, coef.round(2)), key=lambda x: -abs(x[1])))
