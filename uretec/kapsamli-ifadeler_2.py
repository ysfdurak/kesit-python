tutarlar = [1200, 350, 4800, 90]
etiket = ["büyük" if t >= 1000 else "küçük" for t in tutarlar]
print(etiket)

# İkisi birlikte: önce süz (sondaki if), sonra seç (baştaki if-else)
pozitif_etiket = ["büyük" if t >= 1000 else "küçük"
                  for t in tutarlar if t > 100]
print(pozitif_etiket)