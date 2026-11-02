import numpy as np

def mmr(sorgu_v, M, k, lam=0.7):
    alaka = M @ sorgu_v
    secilen = []
    adaylar = list(range(len(M)))
    while adaylar and len(secilen) < k:
        def puan(i):
            cesit = max((float(M[i] @ M[j]) for j in secilen), default=0.0)
            return lam * float(alaka[i]) - (1 - lam) * cesit
        en_iyi = max(adaylar, key=lambda i: (puan(i), -i))
        secilen.append(en_iyi)
        adaylar.remove(en_iyi)
    return secilen
