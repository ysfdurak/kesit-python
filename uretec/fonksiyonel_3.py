from functools import reduce

tutarlar = [1200, 350, 4800, 90]

print(list(map(lambda t: t * 1.2, tutarlar)))
print(list(filter(lambda t: t > 500, tutarlar)))
print(reduce(lambda a, b: a + b, tutarlar))
print(reduce(lambda a, b: a if a > b else b, tutarlar))

# map ile hazır fonksiyon: lambda gerekmez
metin_tutarlar = ["1200", "350"]
print(list(map(int, metin_tutarlar)))
print(sum(map(int, metin_tutarlar)))

# Aynı işler comprehension ile
print([t * 1.2 for t in tutarlar])
print([t for t in tutarlar if t > 500])
print(sum(tutarlar), max(tutarlar))