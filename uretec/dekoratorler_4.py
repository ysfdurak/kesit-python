import time
from functools import wraps

def zamanla(fonk):
    @wraps(fonk)
    def sarici(*args, **kwargs):
        t0 = time.perf_counter()
        try:
            return fonk(*args, **kwargs)
        finally:
            sure = time.perf_counter() - t0
            print(f"{fonk.__name__}: {sure:.4f} sn")
    return sarici

@zamanla
def toplam_ciro(siparisler):
    return sum(s["tutar"] for s in siparisler)

veri = [{"tutar": i % 500} for i in range(200_000)]
print(toplam_ciro(veri))