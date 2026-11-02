from functools import lru_cache

hesap_sayisi = {"n": 0}

@lru_cache(maxsize=128)
def kur_sorgula(para_birimi):
    hesap_sayisi["n"] += 1       # "pahalı" servis çağrısını temsil eder
    return {"USD": 32.5, "EUR": 35.1}[para_birimi]

for pb in ["USD", "EUR", "USD", "USD", "EUR"]:
    kur_sorgula(pb)
print("gerçek hesap:", hesap_sayisi["n"])
print(kur_sorgula.cache_info())
kur_sorgula.cache_clear()

@lru_cache(maxsize=None)
def fib(n):
    return n if n < 2 else fib(n - 1) + fib(n - 2)
print(fib(80))