siparisler = [
    {"no": 101, "tutar": 1200, "durum": "teslim"},
    {"no": 102, "tutar": 350, "durum": "iptal"},
    {"no": 103, "tutar": 4800, "durum": "kargoda"},
]

# Liste: önce tüm tutarlar bellekte kurulur, sonra toplanır
print(sum([s["tutar"] for s in siparisler if s["durum"] != "iptal"]))

# Üreteç: öğeler sum'a aktıkça üretilir
print(sum(s["tutar"] for s in siparisler if s["durum"] != "iptal"))

# any / all ile doğal eşleşir
print(any(s["durum"] == "iptal" for s in siparisler))
print(all(s["tutar"] > 0 for s in siparisler))

g = (s["no"] for s in siparisler)
print(type(g).__name__)
print(list(g))
print(list(g))   # ikinci kez boş: üreteç tükendi