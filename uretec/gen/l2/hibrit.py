import numpy as np
from bm25 import BM25
from sahte import sahte_embedding

def rrf(siralamalar, k=60):
    skor = {}
    for sira in siralamalar:
        for r, d in enumerate(sira, 1):
            skor[d] = skor.get(d, 0.0) + 1 / (k + r)
    return sorted(skor, key=lambda d: (-skor[d], d))

class HibritArama:
    def __init__(self, belgeler):
        self.belgeler = belgeler
        self.M = np.array([sahte_embedding(b["metin"]) for b in belgeler])

    def ara(self, sorgu, kullanici, k=3):
        izinli = [i for i, b in enumerate(self.belgeler) if b["sahip"] in ("herkes", kullanici)]
        if not izinli:
            return []
        alt = [self.belgeler[i]["metin"] for i in izinli]
        bm = BM25(alt).skorla(sorgu)
        vs = self.M[izinli] @ sahte_embedding(sorgu)
        ids = [self.belgeler[i]["id"] for i in izinli]
        s1 = [ids[j] for j in sorted(range(len(ids)), key=lambda j: (-bm[j], ids[j])) if bm[j] > 0]
        s2 = [ids[j] for j in sorted(range(len(ids)), key=lambda j: (-vs[j], ids[j])) if vs[j] > 0]
        return rrf([s1, s2])[:k]

    def degerlendir(self, altin, k=3):
        recall, rr = [], []
        for soru, kullanici, dogru in altin:
            sonuc = self.ara(soru, kullanici, k)
            recall.append(1.0 if dogru in sonuc else 0.0)
            rr.append(1 / (sonuc.index(dogru) + 1) if dogru in sonuc else 0.0)
        n = len(altin)
        return {"recall@k": round(sum(recall) / n, 3), "mrr": round(sum(rr) / n, 3)}
