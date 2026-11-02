def rapor_hazirla(hesaplar):
    baslik = "Anadolu Bank Günlük Özet"     # enclosing

    def satir(ad, bakiye):
        return baslik[:12] + " | " + ad + ": " + str(bakiye)   # baslik dıştan okunur

    for ad, bakiye in hesaplar:
        print(satir(ad, bakiye))

rapor_hazirla([("Ayşe", 12500), ("Mehmet", 830)])
print(len("deneme"))      # built-in katmanı