import json

class TakilanModel:
    """Her adımda aynı aramayı isteyen sahte model."""
    def adim(self, gecmis):
        return {"arac": "ara", "girdi": {"q": "iade süresi"}}

class CozenModel:
    def adim(self, gecmis):
        if gecmis[-1][0] == "arac":
            return {"cevap": gecmis[-1][1]}
        return {"arac": "ara", "girdi": {"q": "iade"}}

def ajan(model, gorev, araclar, max_adim=6, max_tekrar=2):
    gecmis = [("kullanici", gorev)]
    sayac = {}
    for adim in range(1, max_adim + 1):
        karar = model.adim(gecmis)
        if "cevap" in karar:
            return f"bitti ({adim}. adım): {karar['cevap']}"
        imza = karar["arac"] + json.dumps(karar["girdi"], sort_keys=True)
        sayac[imza] = sayac.get(imza, 0) + 1
        if sayac[imza] > max_tekrar:
            return f"durduruldu ({adim}. adım): aynı çağrı {sayac[imza]}. kez"
        gecmis.append(("arac", araclar[karar["arac"]](**karar["girdi"])))
    return f"durduruldu: {max_adim} adım sınırı"

araclar = {"ara": lambda q: "14 gün" if q == "iade" else "sonuç yok"}
print(ajan(CozenModel(), "İade süresi kaç gün?", araclar))
print(ajan(TakilanModel(), "İade süresi kaç gün?", araclar))
print(ajan(TakilanModel(), "İade süresi kaç gün?", araclar, max_tekrar=10))
