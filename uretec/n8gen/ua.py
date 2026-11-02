import sys; sys.path.insert(0, '/home/claude/py/tools/pylib')
import os; os.environ['PP_VERI'] = '/home/claude/py/data'
import re, veri
from sklearn.feature_extraction.text import TfidfVectorizer
def tr_kucuk(s): return s.replace("I", "ı").replace("İ", "i").lower()
def kok5(m): return [k[:5] for k in re.findall(r"\w+", tr_kucuk(m))]
class UrunArama:
    def __init__(self, urunler):
        self.urunler = urunler
        self.vek = TfidfVectorizer(analyzer=kok5)
        self.X = self.vek.fit_transform(f"{u['name']} {u['category']}" for u in urunler)
    def ara(self, sorgu, k=3, kategori=None):
        s = (self.X @ self.vek.transform([sorgu]).T).toarray().ravel()
        aday = [i for i in range(len(self.urunler)) if s[i] > 0 and (kategori is None or self.urunler[i]["category"] == kategori)]
        aday.sort(key=lambda i: -s[i])
        return [(self.urunler[i]["product_id"], round(float(s[i]), 3)) for i in aday[:k]]
a = UrunArama(veri.kayitlar("anadolu_market", "products"))
for q, kat in [("kablosuz kulaklıklar", None), ("SQL veri analizi kitabı", None), ("veri analizi", "Kitap"), ("kahve", None), ("kahve makinesi", "Elektronik"), ("uzay gemisi", None), ("spor", None), ("Spor ayakkabı", "Giyim"),("kitap",None)]:
    print(q, kat, a.ara(q, kategori=kat))
