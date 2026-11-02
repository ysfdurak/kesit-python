import numpy as np

rng = np.random.default_rng(1)
n = 2000
onceki = rng.gamma(2.0, 50.0, size=2 * n)          # deney öncesi harcama
grup = np.repeat([0, 1], n)                         # 0: kontrol, 1: yeni özellik
sonraki = 0.8 * onceki + rng.normal(0, 30, size=2 * n) + 5 * grup

theta = np.cov(onceki, sonraki)[0, 1] / np.var(onceki, ddof=1)
ayarli = sonraki - theta * (onceki - onceki.mean())

for ad, y in [("ham", sonraki), ("CUPED", ayarli)]:
    fark = y[grup == 1].mean() - y[grup == 0].mean()
    se = np.sqrt(y[grup == 1].var(ddof=1) / n + y[grup == 0].var(ddof=1) / n)
    print(ad, round(fark, 1), round(se, 2))
print(round(theta, 2), round(np.var(ayarli) / np.var(sonraki), 2))
