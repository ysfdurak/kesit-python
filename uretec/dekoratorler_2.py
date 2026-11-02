from functools import wraps

def logla(fonk):
    @wraps(fonk)
    def sarici(*args, **kwargs):
        print(f"-> {fonk.__name__}")
        return fonk(*args, **kwargs)
    return sarici

@logla
def bakiye_sorgu(hesap):
    """Hesabın güncel bakiyesini döndürür."""
    return 12500

print(bakiye_sorgu.__name__)
print(bakiye_sorgu.__doc__)
print(bakiye_sorgu.__wrapped__("TR1"))   # dekoratörsüz asıl fonksiyon