komisyon_orani = 0.002          # global (modül düzeyi)

def komisyon(tutar):
    kesinti = tutar * komisyon_orani   # global okunur
    return round(kesinti, 2)

print(komisyon(15000))
print(komisyon_orani)
try:
    print(kesinti)               # yerel ad dışarıdan görünmez
except NameError as e:
    print("Hata:", e)