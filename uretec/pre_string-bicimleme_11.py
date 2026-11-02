bakiye = 12500.5
print(f"[{bakiye}]")           # ham
print(f"[{bakiye:.2f}]")       # 2 ondalık
print(f"[{bakiye:,.2f}]")      # binlik ayırıcı + 2 ondalık
print(f"[{bakiye:12,.2f}]")    # 12 karakter genişlik, sağa hizalı (sayı varsayılanı)
print(f"[{bakiye:<12,.2f}]")   # sola hizalı
print(f"[{bakiye:^12,.2f}]")   # ortalı
print(f"[{bakiye:*>12,.2f}]")  # yıldızla doldur, sağa hizala