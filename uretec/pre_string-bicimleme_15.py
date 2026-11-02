hesaplar = [
    ("Ayşe Yılmaz", "Vadesiz", 12500.5, 3),
    ("Mehmet Can", "Vadeli", 830, 0),
    ("Şirin Öztürk", "Vadesiz", 148200.75, 12),
    ("İlker Ağaoğlu", "Kredi", -5400, 1),
]
G_AD, G_TUR, G_BAK, G_ISL = 16, 9, 14, 6
print(f"{'Müşteri':<{G_AD}}{'Tür':<{G_TUR}}{'Bakiye (TL)':>{G_BAK}}{'İşlem':>{G_ISL}}")
print("-" * (G_AD + G_TUR + G_BAK + G_ISL))
toplam = 0
for ad, tur, bakiye, islem in hesaplar:
    print(f"{ad:<{G_AD}}{tur:<{G_TUR}}{bakiye:>{G_BAK},.2f}{islem:>{G_ISL}}")
    toplam += bakiye
print("-" * (G_AD + G_TUR + G_BAK + G_ISL))
print(f"{'TOPLAM':<{G_AD + G_TUR}}{toplam:>{G_BAK},.2f}")