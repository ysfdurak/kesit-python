from functools import wraps

def logla(fonk):
    @wraps(fonk)
    def sarici(*args, **kwargs):
        print(f"[LOG] {fonk.__name__} {kwargs}")
        return fonk(*args, **kwargs)
    return sarici

def yetki_gerekli(fonk):
    @wraps(fonk)
    def sarici(*args, kullanici, **kwargs):
        if kullanici.get("rol") != "yonetici":
            raise PermissionError(f"{kullanici['ad']} yetkisiz")
        return fonk(*args, kullanici=kullanici, **kwargs)
    return sarici

@logla
@yetki_gerekli
def transfer(tutar, *, kullanici):
    return f"{tutar} TL gönderildi"

print(transfer(500, kullanici={"ad": "Ayşe", "rol": "yonetici"}))
try:
    transfer(500, kullanici={"ad": "Ali", "rol": "stajyer"})
except PermissionError as e:
    print("Hata:", e)