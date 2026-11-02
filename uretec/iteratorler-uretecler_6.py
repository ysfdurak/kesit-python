import itertools

def islem_no(n=1):
    while True:
        yield f"TRX-{n}"
        n += 1

# Sonsuz üreteçten güvenle ilk 3'ü al
print(list(itertools.islice(islem_no(), 3)))

# Koşul bozulana kadar al
tutarlar = [100, 250, 400, 90, 800]
print(list(itertools.takewhile(lambda t: t < 300, tutarlar)))

# Birden fazla kaynağı tek akışta gez
ist = ["IST-1", "IST-2"]
ank = ["ANK-1"]
print(list(itertools.chain(ist, ank)))

# Koşarak toplam (running total)
print(list(itertools.accumulate([100, 250, 400])))