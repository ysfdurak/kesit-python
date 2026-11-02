import numpy as np

rng = np.random.default_rng(2024)
a = np.array([120, 95, 300, 80, 150, 110, 90, 400, 130, 100])            # eski sayfa
b = np.array([140, 105, 310, 95, 170, 125, 100, 380, 150, 115, 160, 135])  # yeni sayfa
B = 10_000

ia = rng.integers(0, a.size, size=(B, a.size))   # döngü yok: B x n indeks matrisi
ib = rng.integers(0, b.size, size=(B, b.size))
fark = np.median(b[ib], axis=1) - np.median(a[ia], axis=1)

print(fark.shape, np.median(b) - np.median(a))
alt, ust = np.percentile(fark, [2.5, 97.5])
print(round(alt, 1), round(ust, 1), round((fark <= 0).mean(), 3))
