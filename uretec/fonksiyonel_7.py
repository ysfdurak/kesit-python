from functools import partial

siparisler = [
    {"no": 101, "sehir": "İstanbul", "tutar": 1200, "durum": "teslim"},
    {"no": 102, "sehir": "Ankara", "tutar": 350, "durum": "iptal"},
    {"no": 103, "sehir": "İstanbul", "tutar": 4800, "durum": "kargoda"},
    {"no": 104, "sehir": "Ankara", "tutar": 2100, "durum": "teslim"},
]

def esik_ustu(esik, s):
    return s["durum"] != "iptal" and s["tutar"] >= esik

buyukler = list(filter(partial(esik_ustu, 1000), siparisler))
sirali = sorted(buyukler, key=lambda s: (s["sehir"], -s["tutar"]))
for s in sirali:
    print(f'{s["sehir"]:<10}{s["no"]:>5}{s["tutar"]:>8}')
print("Hepsi 1000 üstü mü:", all(s["tutar"] >= 1000 for s in sirali))