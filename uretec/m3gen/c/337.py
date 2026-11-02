import numpy as np
from sklearn.base import BaseEstimator, TransformerMixin, clone

class AykiriKirp(BaseEstimator, TransformerMixin):
    def __init__(self, alt=0.05, ust=0.95):
        self.alt = alt                 # __init__ yalnız parametreleri saklar
        self.ust = ust
    def fit(self, X, y=None):
        X = np.asarray(X, dtype=float)
        self.sinirlar_ = np.quantile(X, [self.alt, self.ust], axis=0)   # öğrenilen durum
        return self
    def transform(self, X):
        X = np.asarray(X, dtype=float)
        return np.clip(X, self.sinirlar_[0], self.sinirlar_[1])

class HataliKirp(BaseEstimator, TransformerMixin):
    def __init__(self, ust=0.95):
        self.esik = ust                # parametre başka adla saklanıyor

k = AykiriKirp(alt=0.0, ust=0.75).fit([[1], [2], [3], [4], [100]])
print(k.sinirlar_.ravel().tolist())
print(k.transform([[0], [50], [3]]).ravel().tolist())
print(k.get_params())
print(hasattr(clone(k), "sinirlar_"))
try:
    clone(HataliKirp(ust=0.9))
except Exception as e:
    print(type(e).__name__)
