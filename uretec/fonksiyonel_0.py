def kdv_ekle(tutar):
    return round(tutar * 1.20, 2)

def indirim_uygula(tutar):
    return round(tutar * 0.90, 2)

# Değişkene ata (parantez yok: çağırmıyoruz, işaret ediyoruz)
islem = kdv_ekle
print(islem(100))

# Listeye koy, sırayla uygula
boru = [indirim_uygula, kdv_ekle]
tutar = 1000
for f in boru:
    tutar = f(tutar)
    print(f.__name__, "->", tutar)

# Argüman olarak geçir
def uygula(fonk, degerler):
    return [fonk(d) for d in degerler]

print(uygula(kdv_ekle, [100, 250]))