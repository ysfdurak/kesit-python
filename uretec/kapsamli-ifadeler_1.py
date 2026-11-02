siparisler = [
    {"no": 101, "sehir": "İstanbul", "tutar": 1200, "durum": "teslim"},
    {"no": 102, "sehir": "Ankara", "tutar": 350, "durum": "iptal"},
    {"no": 103, "sehir": "İstanbul", "tutar": 4800, "durum": "kargoda"},
    {"no": 104, "sehir": "İzmir", "tutar": 90, "durum": "teslim"},
    {"no": 105, "sehir": "İstanbul", "tutar": 760, "durum": "iptal"},
]

ist = [s["no"] for s in siparisler if s["sehir"] == "İstanbul"]
print("İstanbul siparişleri:", ist)

gecerli_tutar = [s["tutar"] for s in siparisler if s["durum"] != "iptal"]
print("İptal olmayan tutarlar:", gecerli_tutar)
print("Ciro:", sum(gecerli_tutar))

# Birden fazla koşul: and ile
buyuk_ist = [s["no"] for s in siparisler
             if s["sehir"] == "İstanbul" and s["tutar"] > 1000]
print("İstanbul ve 1000 üstü:", buyuk_ist)