def fatura_hesapla(sepet, kdv_orani=0.20):
    """sepet: (urun, adet, birim_fiyat) demetlerinin listesi"""
    ara_toplam = 0
    for urun, adet, fiyat in sepet:
        ara_toplam += adet * fiyat
    kdv = round(ara_toplam * kdv_orani, 2)
    return ara_toplam, kdv, round(ara_toplam + kdv, 2)

sepet = [("Kahve Makinesi", 1, 1500), ("Filtre", 3, 45.5), ("Fincan", 6, 30)]
ara, kdv, toplam = fatura_hesapla(sepet)
print("Ara toplam:", ara)
print("KDV:", kdv)
print("Genel toplam:", toplam)
print(type(fatura_hesapla(sepet)))