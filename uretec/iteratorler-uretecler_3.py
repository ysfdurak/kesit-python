LOG = """2024-03-01 09:12 OK EFT 500
2024-03-01 09:15 HATA Havale 1200
2024-03-01 09:20 OK Kart 90

2024-03-01 09:31 HATA EFT 2500
2024-03-01 09:40 OK Havale 300
"""

def satirlar(metin):
    """Ham satırları üret; boşları at."""
    for satir in metin.splitlines():
        satir = satir.strip()
        if satir:
            yield satir

def ayristir(satirlar):
    """Her satırı sözlüğe çevir."""
    for s in satirlar:
        tarih, saat, durum, tur, tutar = s.split()
        yield {"saat": saat, "durum": durum, "tur": tur, "tutar": int(tutar)}

def hatalar(kayitlar):
    for k in kayitlar:
        if k["durum"] == "HATA":
            yield k

boru = hatalar(ayristir(satirlar(LOG)))
print(type(boru).__name__)   # henüz tek satır bile okunmadı

toplam = 0
for k in boru:
    print(k["saat"], k["tur"], k["tutar"])
    toplam += k["tutar"]
print("Hatalı işlem toplamı:", toplam)