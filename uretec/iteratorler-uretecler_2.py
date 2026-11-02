def faiz_akisi(bakiye, gunluk_oran, gun_sayisi):
    for _ in range(gun_sayisi):
        bakiye = round(bakiye * (1 + gunluk_oran), 2)
        yield bakiye

g = faiz_akisi(10000, 0.001, 3)
print(type(g).__name__)
print(list(g))

# Üreteç nerede durdu? Takip edelim
def adimli():
    print("  başladı")
    yield 1
    print("  1 ile 2 arası")
    yield 2
    print("  bitiyor")

u = adimli()
print("üreteç oluştu, henüz hiçbir şey basılmadı")
print(next(u))
print(next(u))
print(next(u, "son"))