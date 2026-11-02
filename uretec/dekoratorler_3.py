from functools import wraps

def yeniden_dene(deneme):
    def dekorator(fonk):
        @wraps(fonk)
        def sarici(*args, **kwargs):
            son_hata = None
            for i in range(1, deneme + 1):
                try:
                    return fonk(*args, **kwargs)
                except ConnectionError as e:
                    son_hata = e
                    print(f"  deneme {i} başarısız: {e}")
            raise son_hata
        return sarici
    return dekorator

sayac = {"cagri": 0}

@yeniden_dene(3)
def banka_servisi():
    sayac["cagri"] += 1
    if sayac["cagri"] < 3:
        raise ConnectionError("zaman aşımı")
    return "OK"

print(banka_servisi())
print("toplam çağrı:", sayac["cagri"])