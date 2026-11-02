siparisler = [
    {"no": 101, "sehir": "İstanbul", "tutar": 1200},
    {"no": 102, "sehir": "Ankara", "tutar": 350},
    {"no": 103, "sehir": "İstanbul", "tutar": 4800},
    {"no": 104, "sehir": "İzmir", "tutar": 90},
]

# Sipariş no -> tutar sözlüğü
tutar_by_no = {s["no"]: s["tutar"] for s in siparisler}
print(tutar_by_no[103])

# Fiyat listesini yüzde 10 zamla yeniden kur
fiyat = {"kahve": 120, "çay": 80, "şeker": 45}
zamli = {urun: round(f * 1.10) for urun, f in fiyat.items()}
print(zamli)

# Küme: tekrarsız şehirler
sehirler = {s["sehir"] for s in siparisler}
print(sehirler, len(sehirler))