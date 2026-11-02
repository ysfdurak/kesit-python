import numpy as np

a = np.array([3.0, 4.0])
b = np.array([6.0, 8.0])     # a ile aynı yön, iki kat uzun
c = np.array([4.0, -3.0])    # a'ya dik

def kosinus(x, y):
    return float(x @ y / (np.linalg.norm(x) * np.linalg.norm(y)))

print("cos(a, b) =", round(kosinus(a, b), 3), " cos(a, c) =", round(kosinus(a, c), 3))
an, bn = a / np.linalg.norm(a), b / np.linalg.norm(b)
print("normalize sonrası nokta çarpımı:", round(float(an @ bn), 3))
print("L2(a, b) =", round(float(np.linalg.norm(a - b)), 3), " normalize L2:", round(float(np.linalg.norm(an - bn)), 3))
import re
import zlib
import numpy as np

def tr_kucuk(s):
    return s.replace("I", "ı").replace("İ", "i").lower()

def sahte_embedding(metin, boyut=256):
    v = np.zeros(boyut)
    for kelime in re.findall(r"\w+", tr_kucuk(metin)):
        k = f" {kelime} "
        for i in range(len(k) - 2):
            v[zlib.crc32(k[i:i + 3].encode()) % boyut] += 1
    n = np.linalg.norm(v)
    return v / n if n else v


import veri
from collections import Counter

kayitlar = veri.kayitlar("lezzet_kurye", "lk_ratings")
sayim = Counter(k["comment"] for k in kayitlar if k["comment"])
yorumlar = sorted(sayim)
M = np.array([sahte_embedding(y) for y in yorumlar])   # 13 × 256 matris
print(len(kayitlar), "puan,", len(yorumlar), "farklı yorum, matris", M.shape)
print("normlar:", np.round(np.linalg.norm(M, axis=1)[:3], 3))
def en_yakin(sorgu, k=3):
    s = M @ sahte_embedding(sorgu)
    aday = np.argpartition(-s, k)[:k]          # sırasız ilk k
    aday = aday[np.argsort(-s[aday], kind="stable")]
    return [(yorumlar[i], round(float(s[i]), 3)) for i in aday]

for soru in ["kurye geç geldi", "porsiyon az", "yemek soğuktu"]:
    print(soru, "→", en_yakin(soru))
import re

def cumlelere_bol(metin):
    return [c for c in re.split(r"(?<=[.!?])\s+", metin.strip()) if c]

politika = "İade süresi 14 gündür. Hasarlı ürünlerde kargo bizden. Kampanyalı ürünler iade edilebilir! Hediye kartı iade edilemez."
print(cumlelere_bol(politika))
import math
import re
from collections import Counter

def kelimeler(metin):
    return re.findall(r"\w+", metin.replace("I", "ı").replace("İ", "i").lower())

class BM25:
    def __init__(self, belgeler, k1=1.5, b=0.75):
        self.k1, self.b = k1, b
        self.tf = [Counter(kelimeler(d)) for d in belgeler]
        self.uzunluk = [sum(t.values()) for t in self.tf]
        self.ort = sum(self.uzunluk) / len(belgeler) if belgeler else 0
        self.df = Counter(w for t in self.tf for w in t)
        self.N = len(belgeler)

    def idf(self, w):
        n = self.df.get(w, 0)
        return math.log((self.N - n + 0.5) / (n + 0.5) + 1)

    def skorla(self, sorgu):
        q = kelimeler(sorgu)
        sonuc = []
        for tf, dl in zip(self.tf, self.uzunluk):
            s = 0.0
            for w in q:
                f = tf.get(w, 0)
                if f:
                    s += self.idf(w) * f * (self.k1 + 1) / (f + self.k1 * (1 - self.b + self.b * dl / self.ort))
            sonuc.append(s)
        return sonuc


def rrf(siralamalar, k=60):
    skor = {}
    for sira in siralamalar:
        for r, d in enumerate(sira, 1):
            skor[d] = skor.get(d, 0.0) + 1 / (k + r)
    return sorted(skor, key=lambda d: (-skor[d], d))

belgeler = ["iade süresi 14 gündür", "AM-4471 kablosuz kulaklık stokta", "kulaklık iadesinde kutu şart"]
bm = BM25(belgeler).skorla("AM-4471 kulaklık")
vek = [float(sahte_embedding(d) @ sahte_embedding("AM-4471 kulaklık")) for d in belgeler]
s_bm = sorted(range(3), key=lambda i: -bm[i])
s_vek = sorted(range(3), key=lambda i: -vek[i])
print("BM25:", [round(x, 2) for x in bm], s_bm)
print("Vektör:", [round(x, 2) for x in vek], s_vek)
print("RRF:", rrf([s_bm, s_vek]))
altin = {"iade süresi": "iade-1", "kargo ücreti": "kargo-1", "garanti": "urun-4471"}
sonuclar = {"iade süresi": ["iade-1", "iade-2", "kargo-1"],
            "kargo ücreti": ["iade-2", "kargo-1", "kargo-2"],
            "garanti": ["kargo-2", "iade-1", "iade-2"]}

def metrikler(sonuclar, altin, k):
    isabet = [altin[s] in sonuclar[s][:k] for s in altin]
    rr = [1 / (sonuclar[s].index(altin[s]) + 1) if altin[s] in sonuclar[s][:k] else 0 for s in altin]
    return round(sum(isabet) / len(altin), 3), round(sum(rr) / len(altin), 3)

for k in (1, 3):
    print(f"recall@{k}, MRR@{k} =", metrikler(sonuclar, altin, k))
bilinen = M
for yeni in ["Biraz geç geldi", "Ambalaj yırtıktı", "Kurye kapıyı çarptı"]:
    en_yuksek = float((bilinen @ sahte_embedding(yeni)).max())
    print(f"{yeni:22} en yüksek benzerlik {en_yuksek:.2f}", "→ YENİ KONU" if en_yuksek < 0.4 else "")