import numpy as np
from sklearn.feature_selection import SelectKBest, f_classif
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_val_score
from sklearn.pipeline import make_pipeline

rng = np.random.default_rng(0)
X = rng.normal(size=(60, 2000))        # tamamen gürültü
y = np.array([0, 1] * 30)              # hedefle hiçbir ilişki yok

# A) Özellik seçimi TÜM veride, sonra çapraz doğrulama
X_secili = SelectKBest(f_classif, k=20).fit_transform(X, y)
a = cross_val_score(LogisticRegression(max_iter=1000), X_secili, y, cv=5).mean()

# B) Özellik seçimi Pipeline içinde: her katta yalnız eğitim kısmına fit
pipe = make_pipeline(SelectKBest(f_classif, k=20), LogisticRegression(max_iter=1000))
b = cross_val_score(pipe, X, y, cv=5).mean()
print(round(a, 2), round(b, 2))
