class FaizAkisi:
    """Her gün bakiyeye günlük faiz ekler; gun_sayisi kadar bakiye üretir."""

    def __init__(self, bakiye, gunluk_oran, gun_sayisi):
        self.bakiye = bakiye
        self.oran = gunluk_oran
        self.kalan = gun_sayisi

    def __iter__(self):
        return self

    def __next__(self):
        if self.kalan == 0:
            raise StopIteration
        self.kalan -= 1
        self.bakiye = round(self.bakiye * (1 + self.oran), 2)
        return self.bakiye

for b in FaizAkisi(10000, 0.001, 3):
    print(b)

akis = FaizAkisi(500, 0.01, 2)
print(next(akis), next(akis), next(akis, "bitti"))