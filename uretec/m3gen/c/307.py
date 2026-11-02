import random

class APIHatasi(Exception):
    def __init__(self, durum, retry_after=None):
        super().__init__(durum)
        self.durum, self.retry_after = durum, retry_after

TEKRAR_EDILEBILIR = {408, 429, 500, 502, 503, 529}

def cagir_tekrarli(fn, uyu, rng, deneme=5, taban=1.0, tavan=20.0):
    for i in range(deneme):
        try:
            return fn()
        except APIHatasi as e:
            if e.durum not in TEKRAR_EDILEBILIR or i == deneme - 1:
                raise
            if e.retry_after is not None:
                bekle = float(e.retry_after)                         # sunucunun dediği
            else:
                bekle = rng.uniform(0, min(tavan, taban * 2 ** i))   # tam jitter
            uyu(round(bekle, 2))

def senaryo(hatalar):
    kuyruk = list(hatalar)
    def fn():
        if kuyruk:
            raise kuyruk.pop(0)
        return "yanıt"
    return fn

rng = random.Random(7)
for ad, hatalar in [
    ("aşırı yük", [APIHatasi(529), APIHatasi(529), APIHatasi(500)]),
    ("hız sınırı", [APIHatasi(429, retry_after="3")]),
    ("kötü istek", [APIHatasi(400)]),
]:
    beklemeler = []
    try:
        sonuc = cagir_tekrarli(senaryo(hatalar), beklemeler.append, rng)
    except APIHatasi as e:
        sonuc = f"vazgeçildi ({e.durum})"
    print(ad, "->", sonuc, beklemeler)
