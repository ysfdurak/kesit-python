def komisyon_hesaplayici(oran, asgari):
    def hesapla(tutar):
        return max(round(tutar * oran, 2), asgari)
    return hesapla

kadikoy = komisyon_hesaplayici(0.015, 5)
merkez = komisyon_hesaplayici(0.010, 10)

print(kadikoy(1000), kadikoy(100))
print(merkez(1000), merkez(100))

# İçteki fonksiyon neyi hatırlıyor?
print(kadikoy.__closure__[0].cell_contents, kadikoy.__closure__[1].cell_contents)

# Sayaç: durum tutan closure (nonlocal gerekir)
def sayac():
    adet = 0
    def arttir():
        nonlocal adet
        adet += 1
        return adet
    return arttir

say = sayac()
print(say(), say(), say())