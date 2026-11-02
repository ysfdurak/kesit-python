import math
from collections import Counter

belgeler = {
    "d1": "iade süresi on dört gündür",
    "d2": "kargo ücreti iade edilmez",
    "d3": "kusurlu ürünlerde kargo ücreti şirkete aittir",
    "d4": "kampanyalı ürünlerde iade süresi yedi gündür",
}
tok = {d: m.split() for d, m in belgeler.items()}
N = len(tok)
ort_uzunluk = sum(len(t) for t in tok.values()) / N
df = Counter(w for t in tok.values() for w in set(t))

def bm25(sorgu, k1=1.5, b=0.75):
    skor = {}
    for d, t in tok.items():
        tf = Counter(t)
        s = 0.0
        for w in sorgu.split():
            if w in tf:
                idf = math.log(1 + (N - df[w] + 0.5) / (df[w] + 0.5))
                s += idf * tf[w] * (k1 + 1) / (tf[w] + k1 * (1 - b + b * len(t) / ort_uzunluk))
        skor[d] = s
    return sorted(skor, key=lambda d: -skor[d]), skor

def rrf(*siralamalar, k=60):
    toplam = Counter()
    for sira in siralamalar:
        for r, d in enumerate(sira, start=1):
            toplam[d] += 1 / (k + r)
    return [d for d, _ in toplam.most_common()]

anahtar, skor = bm25("kusurlu ürün iade kargo")
vektor = ["d3", "d4", "d2", "d1"]     # embedding aramasının sırası (verilmiş)
print("BM25  :", anahtar, {d: round(s, 2) for d, s in skor.items()})
print("Vektör:", vektor)
print("RRF   :", rrf(anahtar, vektor))
