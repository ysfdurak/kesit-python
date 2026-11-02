def sepete_ekle(urun, sepet=[]):      # TUZAK
    sepet.append(urun)
    return sepet

print(sepete_ekle("Kahve"))
print(sepete_ekle("Çay"))              # Kahve hâlâ içeride!

def sepete_ekle_dogru(urun, sepet=None):
    if sepet is None:
        sepet = []
    sepet.append(urun)
    return sepet

print(sepete_ekle_dogru("Kahve"))
print(sepete_ekle_dogru("Çay"))