islemler = ["EFT 500", "Havale 1200", "Kart 90"]

it = iter(islemler)
print(type(it).__name__)
print(next(it))
print(next(it))
print(next(it))
try:
    next(it)
except StopIteration:
    print("Yineleyici tükendi")

# for döngüsü tam olarak bunu yapar:
it = iter(islemler)
while True:
    try:
        satir = next(it)
    except StopIteration:
        break
    print("işle:", satir)