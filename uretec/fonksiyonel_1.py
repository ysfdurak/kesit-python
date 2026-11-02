kare = lambda x: x * x
print(kare(7))

# Asıl kullanım: argüman olarak
siparisler = [("IST-1", 1200), ("ANK-2", 350), ("IZM-3", 4800)]
print(sorted(siparisler, key=lambda s: s[1]))
print(max(siparisler, key=lambda s: s[1]))