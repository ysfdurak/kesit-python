kargolar = [
    ["K-1", "K-2"],
    ["K-3"],
    ["K-4", "K-5", "K-6"],
]
duz = [k for paket in kargolar for k in paket]
print(duz)

# Aynı şeyin klasik hali; for sırası birebir aynı
duz2 = []
for paket in kargolar:
    for k in paket:
        duz2.append(k)
print(duz == duz2)

# Ürün x şehir çiftleri
urunler = ["kahve", "çay"]
sehirler = ["Ankara", "İzmir"]
print([(u, s) for u in urunler for s in sehirler])