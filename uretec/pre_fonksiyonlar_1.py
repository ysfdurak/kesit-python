def indirim_uygula(fiyat, yuzde=0, kupon=0, uye=False):
    tutar = fiyat * (1 - yuzde / 100)
    tutar -= kupon
    if uye:
        tutar *= 0.95          # üyelere ek %5
    return round(max(tutar, 0), 2)

print(indirim_uygula(1000))
print(indirim_uygula(1000, 10))
print(indirim_uygula(1000, kupon=50))
print(indirim_uygula(1000, 10, uye=True))
print(indirim_uygula(fiyat=40, kupon=100))   # eksiye düşmez