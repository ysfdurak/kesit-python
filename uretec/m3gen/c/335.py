import pickle, sys, types
import numpy as np
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import FunctionTransformer

# Şirket paketindeki bir modülü taklit et: donusumler.log_donustur
donusumler = types.ModuleType("donusumler")
exec("import numpy as np\ndef log_donustur(X):\n    return np.log1p(X)\n", donusumler.__dict__)
sys.modules["donusumler"] = donusumler

kayitlar = {}
for ad, fn in [("lambda", lambda X: np.log1p(X)), ("modül fonksiyonu", donusumler.log_donustur)]:
    pipe = make_pipeline(FunctionTransformer(fn)).fit([[1.0]])
    try:
        kayitlar[ad] = pickle.dumps(pipe)
        print(ad, "-> kaydedildi", b"donusumler" in kayitlar[ad])
    except Exception as e:
        print(ad, "->", type(e).__name__)

# Sunum ortamını taklit et: modül orada kurulu değil
del sys.modules["donusumler"]
try:
    pickle.loads(kayitlar["modül fonksiyonu"])
except ImportError as e:
    print("yükleme ->", type(e).__name__)
