import pickle

class ZararsizGorunenModel:
    def __reduce__(self):
        # pickle'a "beni yüklerken şu fonksiyonu şu argümanla çağır" der
        return (print, ("!!! yükleme sırasında kod çalıştı !!!",))

veri = pickle.dumps(ZararsizGorunenModel())
print(type(veri).__name__, b"print" in veri)
nesne = pickle.loads(veri)
print("yüklenen nesne:", nesne)
