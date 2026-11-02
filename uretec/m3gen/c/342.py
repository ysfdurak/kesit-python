import math

def iki_oran_testi(x1, n1, x2, n2):
    p1, p2 = x1 / n1, x2 / n2
    p = (x1 + x2) / (n1 + n2)                                   # H0: oranlar eşit
    se0 = math.sqrt(p * (1 - p) * (1 / n1 + 1 / n2))
    z = (p2 - p1) / se0
    p_deger = math.erfc(abs(z) / math.sqrt(2))                  # iki yönlü
    se = math.sqrt(p1 * (1 - p1) / n1 + p2 * (1 - p2) / n2)     # aralık için
    return p2 - p1, z, p_deger, (p2 - p1 - 1.96 * se, p2 - p1 + 1.96 * se)

fark, z, p, (alt, ust) = iki_oran_testi(400, 10_000, 460, 10_000)
print(f"fark={fark:.4f} z={z:.2f} p={p:.4f}")
print(f"%95 GA: [{alt:.4f}, {ust:.4f}] göreli artış: %{100 * fark / 0.04:.0f}")
