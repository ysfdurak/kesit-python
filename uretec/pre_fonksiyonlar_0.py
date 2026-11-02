def kdv_hesapla(fiyat, oran=0.20):
    """Fiyata KDV ekler ve KDV dahil tutarı döndürür."""
    return round(fiyat * (1 + oran), 2)

print(kdv_hesapla(100))        # varsayılan oran %20
print(kdv_hesapla(100, 0.10))  # gıda ürünü, %10
print(kdv_hesapla(fiyat=250, oran=0.01))