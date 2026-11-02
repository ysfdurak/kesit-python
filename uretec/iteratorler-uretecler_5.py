def ist_siparisleri():
    yield from ["IST-1", "IST-2"]

def ank_siparisleri():
    yield "ANK-1"

def tum_siparisler():
    yield from ist_siparisleri()
    yield from ank_siparisleri()
    yield "MANUEL-1"

print(list(tum_siparisler()))

# Kategori ağacını düzleştir
kategoriler = {
    "ad": "Elektronik",
    "alt": [
        {"ad": "Telefon", "alt": []},
        {"ad": "Bilgisayar", "alt": [{"ad": "Dizüstü", "alt": []}]},
    ],
}

def adlar(kat):
    yield kat["ad"]
    for alt in kat["alt"]:
        yield from adlar(alt)

print(list(adlar(kategoriler)))