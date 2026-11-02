def sepet_toplami(*fiyatlar, **secenekler):
    toplam = sum(fiyatlar)
    print("gelen fiyatlar:", fiyatlar)
    print("gelen seçenekler:", secenekler)
    if secenekler.get("kargo_bedava", False) is False and toplam < 500:
        toplam += secenekler.get("kargo", 49.9)
    return round(toplam, 2)

print(sepet_toplami(120, 85.5, 60))
print(sepet_toplami(120, 85.5, 60, kargo=29.9))
print(sepet_toplami(900, 250, kargo_bedava=True))