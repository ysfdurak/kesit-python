import re

class SahteIstemci:
    """API gibi davranır: yalnızca o çağrıda gönderilen mesajları görür."""
    def create(self, system, messages):
        ad = None
        for m in messages:
            if m["role"] == "user":
                bulunan = re.search(r"adım (\w+)\.", m["content"])
                if bulunan:
                    ad = bulunan.group(1)
        if "adım ne" in messages[-1]["content"]:
            return f"Adınız {ad}." if ad else "Adınızı bilmiyorum."
        return "Memnun oldum!"

istemci = SahteIstemci()
sistem = "Kısa cevap ver."

# 1) Her çağrıda yalnızca son mesaj gönderiliyor
print(istemci.create(sistem, [{"role": "user", "content": "Merhaba, adım Elif."}]))
print(istemci.create(sistem, [{"role": "user", "content": "Benim adım ne?"}]))

# 2) Geçmiş biriktirilip her çağrıda tamamı gönderiliyor
gecmis = []
for soru in ["Merhaba, adım Elif.", "Benim adım ne?"]:
    gecmis.append({"role": "user", "content": soru})
    cevap = istemci.create(sistem, gecmis)
    gecmis.append({"role": "assistant", "content": cevap})
    print(cevap)
print(len(gecmis), [m["role"] for m in gecmis])
