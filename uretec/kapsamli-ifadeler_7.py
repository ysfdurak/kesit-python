siparisler = [
    {"no": 101, "sehir": "İstanbul", "tutar": 1200, "durum": "teslim"},
    {"no": 102, "sehir": "Ankara", "tutar": 350, "durum": "iptal"},
    {"no": 103, "sehir": "İstanbul", "tutar": 4800, "durum": "kargoda"},
    {"no": 104, "sehir": "İzmir", "tutar": 90, "durum": "teslim"},
    {"no": 105, "sehir": "İstanbul", "tutar": 760, "durum": "iptal"},
    {"no": 106, "sehir": "Ankara", "tutar": 2100, "durum": "teslim"},
]

gecerli = [s for s in siparisler if s["durum"] != "iptal" and s["tutar"] > 500]
sehirler = {s["sehir"] for s in gecerli}
rapor = {sehir: sum(s["tutar"] for s in gecerli if s["sehir"] == sehir)
         for sehir in sorted(sehirler)}
print(rapor)