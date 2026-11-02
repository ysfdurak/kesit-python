sayac = 0

def islem_kaydet_yanlis():
    sayac_yerel = sayac + 1      # okumak sorun değil
    return sayac_yerel

def islem_kaydet_global():
    global sayac
    sayac += 1

islem_kaydet_global()
islem_kaydet_global()
print("global sayaç:", sayac)

def islem_kaydet_temiz(sayac):
    return sayac + 1             # saf: değer al, yeni değer döndür

yeni = islem_kaydet_temiz(sayac)
print("temiz yol:", yeni)