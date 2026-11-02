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
