import veri
import numpy as np
from collections import defaultdict
from sahte import sahte_embedding

class YorumArama:
    def __init__(self, kayitlar):
        puanlar = defaultdict(list)
        for k in kayitlar:
            if k["comment"]:
                puanlar[k["comment"]].append(k["food_score"])
        self.yorumlar = sorted(puanlar)
        self.adet = [len(puanlar[y]) for y in self.yorumlar]
        self.ort = [round(sum(puanlar[y]) / len(puanlar[y]), 2) for y in self.yorumlar]
        self.M = np.array([sahte_embedding(y) for y in self.yorumlar])

    def ara(self, sorgu, k=3):
        s = self.M @ sahte_embedding(sorgu)
        sira = np.argsort(-s, kind="stable")[:k]
        return [(self.yorumlar[i], self.adet[i], self.ort[i]) for i in sira]

    def puan_tahmini(self, sorgu, k=3):
        s = self.M @ sahte_embedding(sorgu)
        sira = np.argsort(-s, kind="stable")[:k]
        w = s[sira]
        if w.sum() <= 0:
            return None
        return round(float((w * np.array(self.ort)[sira]).sum() / w.sum()), 2)
