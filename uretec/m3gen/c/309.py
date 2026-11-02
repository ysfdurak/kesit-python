SISTEM = 800        # sistem istemi (token)
SORU = 60           # her kullanıcı mesajı
CEVAP = 200         # her asistan cevabı
FIYAT_GIRDI = 3 / 1_000_000    # kurgusal $/token
FIYAT_CIKTI = 15 / 1_000_000

def sohbet(tur_sayisi):
    toplam_girdi = toplam_cikti = gecmis = 0
    for _ in range(tur_sayisi):
        toplam_girdi += SISTEM + gecmis + SORU   # API durumsuz: her şey yeniden gider
        toplam_cikti += CEVAP
        gecmis += SORU + CEVAP
    usd = toplam_girdi * FIYAT_GIRDI + toplam_cikti * FIYAT_CIKTI
    return toplam_girdi, toplam_cikti, usd

for n in (1, 10, 40):
    g, c, usd = sohbet(n)
    print(n, g, c, f"{usd:.4f}")
