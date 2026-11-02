import os

GIRDI = 3.00 / 1_000_000   # kurgusal $/token
YAZMA, OKUMA = 1.25, 0.10   # önbelleğe yazma / önbellekten okuma çarpanı
sabit, degisken, istek = 20_000, 300, 1_000

onbelleksiz = istek * (sabit + degisken) * GIRDI
onbellekli = (sabit * YAZMA * GIRDI                    # ilk istek yazar
              + (istek - 1) * sabit * OKUMA * GIRDI    # sonrakiler okur
              + istek * degisken * GIRDI)              # değişken kısım her zaman tam fiyat
print(f"{onbelleksiz:.2f} {onbellekli:.2f} tasarruf %{100 * (1 - onbellekli / onbelleksiz):.0f}")

katalog = "Ürün kataloğu: " + "; ".join(f"ürün-{i}" for i in range(300))

def istem(saat, soru, sabit_basta):
    if sabit_basta:
        return f"{katalog}\nSaat: {saat}\nSoru: {soru}"
    return f"Saat: {saat}\n{katalog}\nSoru: {soru}"

for sabit_basta in (False, True):
    a = istem("10:01", "Kettle var mı?", sabit_basta)
    b = istem("10:02", "Blender var mı?", sabit_basta)
    print(sabit_basta, len(os.path.commonprefix([a, b])), len(a))
