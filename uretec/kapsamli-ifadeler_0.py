tutarlar = [1200, 350, 4800, 90]

# Klasik yol
kdvli = []
for t in tutarlar:
    kdvli.append(round(t * 1.20, 2))
print(kdvli)

# Comprehension
kdvli2 = [round(t * 1.20, 2) for t in tutarlar]
print(kdvli2)
print(kdvli == kdvli2)