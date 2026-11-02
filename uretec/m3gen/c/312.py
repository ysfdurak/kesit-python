def parcala(metin, boyut=8, ortusme=3):
    if not 0 <= ortusme < boyut:
        raise ValueError("örtüşme 0 ile boyut arasında olmalı")
    kelimeler = metin.split()
    adim = boyut - ortusme
    parcalar = []
    for bas in range(0, len(kelimeler), adim):
        parcalar.append(" ".join(kelimeler[bas:bas + boyut]))
        if bas + boyut >= len(kelimeler):   # son kelime kapsandı
            break
    return parcalar

metin = ("İade talebi teslimattan itibaren on dört gün içinde yapılmalıdır. "
         "Kargo ücreti ürün kusurluysa şirkete aittir. "
         "Hijyen ürünlerinde ambalaj açıldıysa iade kabul edilmez.")
p = parcala(metin)
print(len(metin.split()), len(p))
for x in p:
    print("-", x)
