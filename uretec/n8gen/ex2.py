E = []

# 0: BPE oyuncak, gerçek yorumlarla
E.append(r'''import re
from collections import Counter
import veri

def tr_kucuk(s):
    return s.replace("I", "ı").replace("İ", "i").lower()

yorumlar = [r["comment"] for r in veri.kayitlar("lezzet_kurye", "lk_ratings") if r["comment"]]
frek = Counter(k for y in yorumlar for k in re.findall(r"\w+", tr_kucuk(y)))
sozcukler = {tuple(k) + ("_",): n for k, n in frek.items()}     # "_" = kelime sonu

def cift_say(sozcukler):
    say = Counter()
    for semboller, n in sozcukler.items():
        for a, b in zip(semboller, semboller[1:]):
            say[a, b] += n
    return say

def birlestir(sozcukler, cift):
    yeni = {}
    for semboller, n in sozcukler.items():
        s, i = [], 0
        while i < len(semboller):
            if i + 1 < len(semboller) and (semboller[i], semboller[i + 1]) == cift:
                s.append(semboller[i] + semboller[i + 1]); i += 2
            else:
                s.append(semboller[i]); i += 1
        yeni[tuple(s)] = n
    return yeni

birlesimler = []
for _ in range(30):
    say = cift_say(sozcukler)
    cift = min(say, key=lambda c: (-say[c], c))      # en sık; eşitlikte alfabetik küçük
    birlesimler.append(cift)
    sozcukler = birlestir(sozcukler, cift)
print(len(birlesimler), birlesimler[:8])
print(sorted(sozcukler, key=sozcukler.get, reverse=True)[:4])''')

# 1: tokenle
E.append(r'''def tokenle(kelime, birlesimler):
    semboller = tuple(tr_kucuk(kelime)) + ("_",)
    for cift in birlesimler:
        semboller = next(iter(birlestir({semboller: 1}, cift)))
    return list(semboller)

for k in ["geldi", "lezzetliydi", "sıcacıktı", "gelmedi"]:
    print(k, tokenle(k, birlesimler))''')

# 2: bellek
E.append(r'''def agirlik_gb(param_milyar, bit):
    return param_milyar * 1e9 * bit / 8 / 1024**3

print(f"{'model':>6} {'fp16':>7} {'int8':>7} {'4-bit':>7}")
for p in [1, 3, 8, 14, 70]:
    print(f"{p:>5}B " + " ".join(f"{agirlik_gb(p, b):>6.1f}G" for b in (16, 8, 4)))''')

# 3: nicemleme
E.append(r'''import numpy as np

rng = np.random.default_rng(0)
w = rng.normal(0, 0.02, size=4096).astype(np.float32)
w[7] = 0.9                                     # tek bir aykırı ağırlık

def nicemle(w, bit=8):
    qmax = 2 ** (bit - 1) - 1                  # int8 için 127, 4 bit için 7
    olcek = np.abs(w).max() / qmax
    q = np.clip(np.round(w / olcek), -qmax, qmax).astype(np.int8)
    return q, olcek

def grup_nicemle(w, bit=4, grup=64):
    qmax = 2 ** (bit - 1) - 1
    g = w.reshape(-1, grup)
    olcek = np.abs(g).max(axis=1, keepdims=True) / qmax
    q = np.clip(np.round(g / olcek), -qmax, qmax).astype(np.int8)
    return q, olcek

for ad, (q, s) in [("int8 tek ölçek", nicemle(w, 8)), ("4 bit tek ölçek", nicemle(w, 4)),
                   ("4 bit 64'lük grup", grup_nicemle(w, 4, 64))]:
    geri = (q * s).reshape(-1)
    print(f"{ad:<18} ortalama hata {np.abs(w - geri).mean():.5f}  sıfıra düşen: {(q == 0).mean():.0%}")''')

# 4: LoRA
E.append(r'''d, r, alfa = 4096, 8, 16
tam = d * d
lora = r * d + d * r
print(f"tam ince ayar: {tam:,} parametre, LoRA r={r}: {lora:,} ({lora / tam:.2%})")

rng = np.random.default_rng(1)
W = rng.normal(size=(6, 5))                    # dondurulmuş ağırlık (çıktı × girdi)
A = rng.normal(size=(2, 5)) * 0.1              # r × girdi, eğitilir
B = np.zeros((6, 2))                           # çıktı × r, sıfırla başlar
x = rng.normal(size=(3, 5))
print(np.allclose(x @ W.T + (alfa / r) * (x @ A.T) @ B.T, x @ W.T))   # başlangıçta model değişmez
B = rng.normal(size=(6, 2)) * 0.1              # eğitimden sonra
W_birlesik = W + (alfa / r) * B @ A            # adaptörü ağırlığa göm: çıkarımda ek maliyet yok
print(np.allclose(x @ W_birlesik.T, x @ W.T + (alfa / r) * (x @ A.T) @ B.T))''')

# 5: sklearn temel çizgi
E.append(r'''from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, f1_score

kayit = [r for r in veri.kayitlar("lezzet_kurye", "lk_ratings") if r["comment"]]

def etiket(r):
    ort = (r["food_score"] + r["courier_score"]) / 2
    return "olumlu" if ort >= 4 else ("olumsuz" if ort < 3 else "notr")

X = [r["comment"] for r in kayit]
y = [etiket(r) for r in kayit]
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.25, random_state=42, stratify=y)
model = make_pipeline(TfidfVectorizer(preprocessor=tr_kucuk), LogisticRegression(max_iter=1000))
model.fit(X_tr, y_tr)
tahmin = model.predict(X_te)
print(len(X), Counter(y).most_common())
print(f"çoğunluk sınıfı: {Counter(y_te).most_common(1)[0][1] / len(y_te):.3f}  "
      f"doğruluk: {accuracy_score(y_te, tahmin):.3f}  makro F1: {f1_score(y_te, tahmin, average='macro'):.3f}")''')

# 6: genelleme
E.append(r'''yeni = ["Buz gibiydi", "Bayıldım", "Bir saat bekledim", "İdare eder"]
print([str(t) for t in model.predict(yeni)])
print(model.named_steps["tfidfvectorizer"].transform(yeni).nnz, "bilinen kelime")''')
