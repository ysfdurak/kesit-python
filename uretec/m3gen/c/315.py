import hashlib

class SahteEmbedAPI:
    def __init__(self):
        self.cagri = self.metin = 0
    def embed(self, model, metinler):
        self.cagri += 1
        self.metin += len(metinler)
        return [[len(m) / 10.0] for m in metinler]

api = SahteEmbedAPI()
onbellek = {}

def anahtar(model, metin):
    temiz = " ".join(metin.split()).lower()
    return hashlib.sha256(f"{model}\x00{temiz}".encode()).hexdigest()

def embed_onbellekli(model, metinler):
    anahtarlar = [anahtar(model, m) for m in metinler]
    eksik = {a: m for a, m in zip(anahtarlar, metinler) if a not in onbellek}
    if eksik:                                   # tek toplu çağrı
        onbellek.update(zip(eksik, api.embed(model, list(eksik.values()))))
    return [onbellek[a] for a in anahtarlar]

embed_onbellekli("emb-v1", ["Kargo ücreti", "kargo  ücreti", "iade süresi"])
embed_onbellekli("emb-v1", ["Fatura", "kargo ücreti"])
embed_onbellekli("emb-v2", ["kargo ücreti"])
print(api.cagri, api.metin, len(onbellek))
print("İADE".lower() == "iade", "İADE".lower())
