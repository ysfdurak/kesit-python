import sys; sys.path.insert(0, '/home/claude/py/tools/pylib')
import os; os.environ['PP_VERI'] = '/home/claude/py/data'
from core1 import POLITIKA
exec(POLITIKA)
import re, statistics
from collections import defaultdict
import veri
from sklearn.feature_extraction.text import TfidfVectorizer

def tr_kucuk(s):
    return s.replace("I", "ı").replace("İ", "i").lower()

def kok5(metin):
    return [k[:5] for k in re.findall(r"\w+", tr_kucuk(metin))]

def ik_istatistik_belgeleri():
    izin = defaultdict(list)
    for r in veri.kayitlar("pusula_ik", "ik_leaves"):
        izin[r["leave_type"]].append(r["days"])
    return [{"id": f"ik-izin-{tur}", "metin": f"{tur.capitalize()} izin kayıtları: {len(g)} kayıt, ortalama {statistics.mean(g):.1f} gün, en uzun {max(g)} gün.", "meta": {"tur": "istatistik"}} for tur, g in sorted(izin.items())]

class SahteLLM:
    def __init__(self):
        self.cagri = 0
    def tamamla(self, istem):
        self.cagri += 1
        soru = istem.rsplit("Soru:", 1)[-1]
        kaynaklar = re.findall(r"^\[(\d+)\] (.+)$", istem, re.M)
        if not kaynaklar:
            return "Bilmiyorum."
        q = set(kok5(soru))
        no, metin = max(kaynaklar, key=lambda k: len(q & set(kok5(k[1]))))
        return f"{metin.split(': ', 1)[-1]} [{no}]"

ALTIN = [
    ("Raporsuz hastalık izni kaç gün?", "pusula#1"),
    ("Hibrit çalışan haftada kaç gün ofise gelir?", "pusula#4"),
    ("Tam uzaktan çalışma hangi departmanlarda mümkün?", "pusula#5"),
    ("Ücretsiz izin en fazla kaç gün?", "pusula#3"),
    ("KVKK eğitimi zorunlu mu?", "pusula#6"),
    ("Mazeret izninde en uzun kaç gün kullanılmış?", "ik-izin-mazeret#0"),
    ("Yıllık izin kayıtlarında ortalama kaç gün?", "ik-izin-yıllık#0"),
    ("Şirket aracı kimlere verilir?", None),
    ("Yemek kartı limiti ne kadar?", None),
]

def parcala_basliklar(metin, belge_id, meta):
    parcalar, yol = [], {}
    for satir in metin.splitlines():
        m = re.match(r"(#+) (.+)", satir)
        if m:
            seviye = len(m.group(1))
            yol = {k: v for k, v in yol.items() if k < seviye}
            yol[seviye] = m.group(2)
        elif satir.strip():
            parcalar.append({"id": f"{belge_id}#{len(parcalar)}", "belge_id": belge_id,
                             "baslik": " > ".join(yol[k] for k in sorted(yol)),
                             "metin": satir.strip(), "meta": dict(meta)})
    return parcalar

class Asistan:
    def __init__(self, politika, istatistikler):
        self.parcalar = parcala_basliklar(politika, "pusula", {"tur": "politika"})
        for b in istatistikler:
            self.parcalar.append({"id": b["id"] + "#0", "belge_id": b["id"], "baslik": "İzin istatistikleri",
                                  "metin": b["metin"], "meta": dict(b["meta"])})
        self.vek = TfidfVectorizer(analyzer=kok5)
        self.X = self.vek.fit_transform(f"{p['baslik']}: {p['metin']}" for p in self.parcalar)

    def ara(self, soru, k=3):
        s = (self.X @ self.vek.transform([soru]).T).toarray().ravel()
        sira = sorted(range(len(s)), key=lambda i: -s[i])[:k]
        return [(self.parcalar[i], round(float(s[i]), 3)) for i in sira if s[i] > 0]

    def sor(self, soru, llm, esik=0.3, k=3):
        sonuc = self.ara(soru, k)
        if not sonuc or sonuc[0][1] < esik:
            return {"cevap": "Bilmiyorum.", "kaynaklar": [], "durum": "bilmiyorum"}
        kaynak = "\n".join(f"[{i}] {p['baslik']}: {p['metin']}" for i, (p, _) in enumerate(sonuc, 1))
        istem = ("Yalnızca numaralı kaynaklara dayanarak cevap ver ve [n] ile atıf yap. "
                 f"Cevap yoksa 'Bilmiyorum.' de.\nKaynaklar:\n{kaynak}\nSoru: {soru}")
        cevap = llm.tamamla(istem)
        nolar = sorted({int(x) for x in re.findall(r"\[(\d+)\]", cevap)})
        if not nolar or any(n < 1 or n > len(sonuc) for n in nolar):
            return {"cevap": "Bilmiyorum.", "kaynaklar": [], "durum": "bilmiyorum"}
        return {"cevap": cevap, "kaynaklar": [sonuc[n - 1][0]["id"] for n in nolar], "durum": "ok"}

def degerlendir(asistan, llm, altin, esik=0.3):
    cevapli = [(s, b) for s, b in altin if b is not None]
    cevapsiz = [s for s, b in altin if b is None]
    isabet = yanlis_ret = 0
    for soru, beklenen in cevapli:
        r = asistan.sor(soru, llm, esik)
        if r["durum"] == "bilmiyorum":
            yanlis_ret += 1
        elif beklenen in r["kaynaklar"]:
            isabet += 1
    dogru_ret = sum(asistan.sor(s, llm, esik)["durum"] == "bilmiyorum" for s in cevapsiz)
    return {"isabet": round(isabet / len(cevapli), 3), "dogru_ret": round(dogru_ret / len(cevapsiz), 3), "yanlis_ret": yanlis_ret}

a = Asistan(POLITIKA, ik_istatistik_belgeleri())
print(len(a.parcalar), [p["id"] for p in a.parcalar])
llm = SahteLLM()
for s, b in ALTIN:
    print(s, b, [(p["id"], sc) for p, sc in a.ara(s)], a.sor(s, llm)["kaynaklar"])
for e in (0.1, 0.2, 0.3, 0.35, 0.4, 0.5):
    print(e, degerlendir(a, llm, ALTIN, e))
print(a.sor("Raporsuz hastalık izni kaç gün?", llm))
