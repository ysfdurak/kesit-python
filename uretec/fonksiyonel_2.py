siparisler = [
    {"no": 101, "sehir": "İstanbul", "tutar": 1200},
    {"no": 102, "sehir": "Ankara", "tutar": 350},
    {"no": 103, "sehir": "İstanbul", "tutar": 4800},
    {"no": 104, "sehir": "Ankara", "tutar": 2100},
    {"no": 105, "sehir": "İzmir", "tutar": 90},
]

# Tek anahtar
for s in sorted(siparisler, key=lambda s: s["tutar"], reverse=True):
    print(s["no"], s["tutar"])
print("---")

# Çok anahtar: şehir artan, sonra tutar artan
for s in sorted(siparisler, key=lambda s: (s["sehir"], s["tutar"])):
    print(s["sehir"], s["tutar"])
print("---")

# Karışık yön: şehir artan, tutar AZALAN -> sayıyı eksiyle ters çevir
for s in sorted(siparisler, key=lambda s: (s["sehir"], -s["tutar"])):
    print(s["sehir"], s["tutar"])