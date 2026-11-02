siparisler = [
    {"no": 101, "sehir": "istanbul ", "tutar": "1200"},
    {"no": 102, "sehir": "ANKARA", "tutar": "350"},
    {"no": 103, "sehir": " İzmir", "tutar": "4800"},
]

# Okunmaz: her şey tek satırda
kotu = {s["no"]: (s["sehir"].strip().title(), int(s["tutar"]) * 1.2) for s in siparisler if s["tutar"].isdigit() and len(s["sehir"].strip()) > 2}

# Okunur: yardımcı fonksiyon + kısa comprehension
def temizle(s):
    return (s["sehir"].strip().title(), round(int(s["tutar"]) * 1.2, 2))

def gecerli(s):
    return s["tutar"].isdigit() and len(s["sehir"].strip()) > 2

iyi = {s["no"]: temizle(s) for s in siparisler if gecerli(s)}
print(iyi)
print(kotu == iyi)