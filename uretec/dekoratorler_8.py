import time

class Kronometre:
    def __init__(self, etiket):
        self.etiket = etiket
        self.sure = None

    def __enter__(self):
        self.t0 = time.perf_counter()
        return self

    def __exit__(self, hata_turu, hata, iz):
        self.sure = time.perf_counter() - self.t0
        durum = "hata ile" if hata_turu else "başarıyla"
        print(f"{self.etiket} {durum} bitti")
        return False   # hatayı bastırma

with Kronometre("rapor") as k:
    toplam = sum(range(300_000))
print("süre ölçüldü mü:", k.sure is not None, "| toplam:", toplam)

try:
    with Kronometre("hatalı iş"):
        raise ValueError("beklenmedik")
except ValueError as e:
    print("dışarıda yakalandı:", e)