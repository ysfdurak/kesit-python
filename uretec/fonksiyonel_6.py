from functools import partial

def fiyatla(tutar, kdv, indirim):
    return round(tutar * (1 - indirim) * (1 + kdv), 2)

standart = partial(fiyatla, kdv=0.20, indirim=0.0)
kampanya = partial(fiyatla, kdv=0.20, indirim=0.15)

print(standart(1000))
print(kampanya(1000))
print(list(map(kampanya, [100, 200])))

# Hazır fonksiyonlarla da
ikili = partial(int, base=2)
print(ikili("1010"))