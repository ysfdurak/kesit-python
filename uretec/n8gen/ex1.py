from core1 import POLITIKA

E = []

E.append(r'''import re, html, unicodedata, hashlib
from dataclasses import dataclass, field

@dataclass
class Belge:
    id: str
    metin: str
    meta: dict = field(default_factory=dict)

    @property
    def parmak_izi(self):
        """İçerik değişti mi? Güncellemede bu özetle karşılaştırırız."""
        return hashlib.sha256(self.metin.encode("utf-8")).hexdigest()[:12]

def tr_kucuk(s):
    return s.replace("I", "ı").replace("İ", "i").lower()

ALTBILGI = re.compile(r"^(sayfa \d+ / \d+|kurum içi - gizli)$")

def temizle(ham):
    metin = re.sub(r"<[^>]+>", " ", ham)                 # HTML etiketleri
    metin = unicodedata.normalize("NFC", html.unescape(metin))
    satirlar = []
    for s in metin.splitlines():
        s = re.sub(r"\s+", " ", s).strip()               # sekme, çift boşluk
        if s and not ALTBILGI.match(tr_kucuk(s)):        # boş satır, altbilgi
            satirlar.append(s)
    return "\n".join(satirlar)

ham = "<h2>Hastalık izni</h2>\n<p>Doktor raporu   en geç 2 iş günü &amp; içinde iletilir.</p>\n\nSayfa 1 / 3\nKurum içi - Gizli\n"
temiz = temizle(ham)
print(temiz)
b = Belge("pusula-izin", temiz, {"kaynak": "izin_yonetmeligi.html", "erisim": "tum_calisanlar"})
print(b.parmak_izi, len(b.metin))''')

E.append(POLITIKA + r'''
import statistics
from collections import defaultdict
import veri

def ik_istatistik_belgeleri():
    """Gerçek ik_leaves tablosundan izin türü başına kısa bir istatistik belgesi üretir."""
    izin = defaultdict(list)
    for r in veri.kayitlar("pusula_ik", "ik_leaves"):
        izin[r["leave_type"]].append(r["days"])
    return [Belge(f"ik-izin-{tur}",
                  f"{tur.capitalize()} izin kayıtları: {len(g)} kayıt, ortalama {statistics.mean(g):.1f} gün, en uzun {max(g)} gün.",
                  {"kaynak": "ik_leaves", "tur": "istatistik", "erisim": "ik"})
            for tur, g in sorted(izin.items())]

def urun_belgeleri():
    return [Belge(f"urun-{u['product_id']}",
                  f"{u['name']} ({u['category']}): fiyat {u['price']:.0f} TL, stok {u['stock']} adet.",
                  {"kaynak": "products", "tur": "urun", "erisim": "tum_calisanlar"})
            for u in veri.kayitlar("anadolu_market", "products")]

KORPUS = [Belge("pusula-politika", POLITIKA, {"kaynak": "ik_politika.md", "tur": "politika", "erisim": "tum_calisanlar"})]
KORPUS += ik_istatistik_belgeleri() + urun_belgeleri()
print(len(KORPUS), "belge")
print(KORPUS[2].metin)
print(KORPUS[-1].metin)''')

E.append(r'''def cumleler(metin):
    return [c for c in re.split(r"(?<=[.!?])\s+", metin.strip()) if c]

def parcala(belge, max_karakter=220, ortusme=1):
    """Başlık + cümle tabanlı parçalama: her parça başlık yolunu taşır, ardışık parçalar ortusme cümle paylaşır."""
    bolumler, yol = [], {}
    for satir in belge.metin.splitlines():
        if m := re.match(r"(#+) (.+)", satir):
            seviye = len(m.group(1))
            yol = {k: v for k, v in yol.items() if k < seviye} | {seviye: m.group(2)}
        elif satir.strip():
            bolumler.append((" > ".join(yol[k] for k in sorted(yol)), satir))
    parcalar = []
    for baslik, paragraf in bolumler:
        cs, i = cumleler(paragraf), 0
        while i < len(cs):
            j = i + 1
            while j < len(cs) and len(" ".join(cs[i:j + 1])) <= max_karakter:
                j += 1
            parcalar.append({"id": f"{belge.id}#{len(parcalar)}", "belge_id": belge.id,
                             "baslik": baslik, "metin": " ".join(cs[i:j]), "meta": dict(belge.meta)})
            if j >= len(cs):
                break
            i = max(j - ortusme, i + 1)
    return parcalar

PARCALAR = [p for b in KORPUS for p in parcala(b, max_karakter=120)]
print(len(PARCALAR), "parça")
for p in PARCALAR[:3]:
    print(p["id"], "|", p["baslik"], "|", p["metin"])''')

E.append(r'''import numpy as np
import zlib
from sklearn.feature_extraction.text import TfidfVectorizer

def kok_analiz(metin):
    """Türkçe için kaba ama etkili kök: kelimenin ilk 5 harfi (izni, izin, izinler → izin)."""
    return [k[:5] for k in re.findall(r"\w+", tr_kucuk(metin))]

def sahte_embedding(metin, boyut=256):
    """Ağsız embedding taklidi: harf üçlülerini sabit bir özetle (crc32) kovalara sayar, normalize eder."""
    v = np.zeros(boyut)
    t = f" {tr_kucuk(metin)} "
    for i in range(len(t) - 2):
        v[zlib.crc32(t[i:i + 3].encode()) % boyut] += 1
    n = np.linalg.norm(v)
    return v / n if n else v

def parca_metni(p):
    return f"{p['baslik']}: {p['metin']}" if p["baslik"] else p["metin"]

class HibritIndeks:
    def __init__(self, parcalar, alfa=0.5):
        self.parcalar, self.alfa = parcalar, alfa
        metinler = [parca_metni(p) for p in parcalar]
        self.tfidf = TfidfVectorizer(analyzer=kok_analiz)
        self.X = self.tfidf.fit_transform(metinler)
        self.E = np.array([sahte_embedding(m) for m in metinler])

    def ara(self, sorgu, k=3, filtre=None):
        s_kelime = (self.X @ self.tfidf.transform([sorgu]).T).toarray().ravel()
        s_vektor = self.E @ sahte_embedding(sorgu)
        skor = self.alfa * s_kelime + (1 - self.alfa) * s_vektor
        adaylar = [i for i in np.argsort(-skor, kind="stable")
                   if filtre is None or filtre(self.parcalar[i]["meta"])]
        return [(self.parcalar[i], round(float(skor[i]), 3)) for i in adaylar[:k]]

IDX = HibritIndeks(PARCALAR)
for p, s in IDX.ara("Raporsuz hastalık izni kaç gün?"):
    print(s, p["id"], p["metin"][:60])''')

E.append(r'''def yeniden_sirala(sorgu, sonuclar):
    """Çapraz kodlayıcı (cross-encoder) taklidi: soru köklerinin parçada geçme oranı + ilk skorun yarısı."""
    q = set(kok_analiz(sorgu))
    def puan(ikili):
        p, ilk = ikili
        kapsama = len(q & set(kok_analiz(parca_metni(p)))) / len(q)
        return kapsama + 0.5 * ilk
    return sorted(sonuclar, key=puan, reverse=True)

aday = IDX.ara("Hibrit çalışan haftada kaç gün ofise gelir?", k=6)
print([p["id"] for p, _ in aday[:3]])
print([p["id"] for p, _ in yeniden_sirala("Hibrit çalışan haftada kaç gün ofise gelir?", aday)[:3]])''')

E.append(r'''import math

def token_tahmini(metin):
    return math.ceil(len(metin) / 4)

def baglam_sec(sonuclar, butce=120):
    """Skor sırasıyla parça ekle; bütçeyi aşanı atla, aynı metni iki kez koyma."""
    secilen, kullanilan, gorulen = [], 0, set()
    for p, skor in sonuclar:
        t = token_tahmini(parca_metni(p))
        if p["metin"] in gorulen or kullanilan + t > butce:
            continue
        secilen.append(p); kullanilan += t; gorulen.add(p["metin"])
    return secilen, kullanilan

secilen, t = baglam_sec(IDX.ara("Yıllık izin kaç gün ve nasıl talep edilir?", k=6), butce=90)
print([p["id"] for p in secilen], t, "token")''')

E.append(r'''def istem_kur(soru, parcalar):
    kaynak = "\n".join(f"[{i}] {parca_metni(p)}" for i, p in enumerate(parcalar, 1))
    return ("Yalnızca aşağıdaki numaralı kaynaklara dayanarak cevap ver. Her cümlenin sonuna "
            "kullandığın kaynağı [n] biçiminde yaz. Kaynaklarda cevap yoksa yalnızca 'Bilmiyorum.' de.\n"
            f"Kaynaklar:\n{kaynak}\nSoru: {soru}")

class SahteLLM:
    """Ağsız model: istemdeki kaynaklardan soruyla en çok kök paylaşanı seçip atıfla döndürür."""
    def tamamla(self, istem):
        soru = istem.rsplit("Soru:", 1)[-1]
        kaynaklar = re.findall(r"^\[(\d+)\] (.+)$", istem, re.M)
        if not kaynaklar:
            return "Bilmiyorum."
        q = set(kok_analiz(soru))
        no, metin = max(kaynaklar, key=lambda k: len(q & set(kok_analiz(k[1]))))
        return f"{metin.split(': ', 1)[-1]} [{no}]"

def atiflari_dogrula(cevap, n_kaynak):
    atif = [int(x) for x in re.findall(r"\[(\d+)\]", cevap)]
    return bool(atif) and all(1 <= a <= n_kaynak for a in atif)

def cevapla(soru, llm, esik=0.25, k=4):
    sonuclar = IDX.ara(soru, k=k)
    if not sonuclar or sonuclar[0][1] < esik:
        return {"cevap": "Bilmiyorum.", "kaynaklar": [], "neden": "düşük getirme skoru"}
    parcalar, _ = baglam_sec(sonuclar, butce=150)
    cevap = llm.tamamla(istem_kur(soru, parcalar))
    if not atiflari_dogrula(cevap, len(parcalar)):
        return {"cevap": "Bilmiyorum.", "kaynaklar": [], "neden": "atıfsız cevap"}
    nolar = sorted({int(x) for x in re.findall(r"\[(\d+)\]", cevap)})
    return {"cevap": cevap, "kaynaklar": [parcalar[n - 1]["id"] for n in nolar], "neden": "ok"}

llm = SahteLLM()
print(cevapla("Raporsuz hastalık izni kaç gün?", llm))
print(cevapla("Şirket aracı kimlere verilir?", llm))''')

E.append(r'''class OnbellekliRAG:
    def __init__(self, cevapla_fn, surum=1):
        self.fn, self.surum, self.kayit = cevapla_fn, surum, {}
        self.isabet = self.iska = 0

    def anahtar(self, soru):
        normal = " ".join(re.findall(r"\w+", tr_kucuk(soru)))
        return hashlib.sha256(f"v{self.surum}|{normal}".encode()).hexdigest()[:16]

    def sor(self, soru):
        a = self.anahtar(soru)
        if a in self.kayit:
            self.isabet += 1
        else:
            self.iska += 1
            self.kayit[a] = self.fn(soru)
        return self.kayit[a]

r = OnbellekliRAG(lambda s: cevapla(s, llm))
r.sor("Raporsuz hastalık izni kaç gün?")
r.sor("  raporsuz HASTALIK izni kaç gün ")
r.surum += 1                     # indeks güncellendi: eski kayıtlar artık eşleşmez
r.sor("Raporsuz hastalık izni kaç gün?")
print(r.isabet, r.iska)''')

E.append(r'''class CanliIndeks:
    """Belge düzeyinde ekle/güncelle/sil; değişmeyen belgeyi yeniden işlemez."""
    def __init__(self):
        self.belgeler, self.parcalar, self.surum = {}, {}, 0

    def yukle(self, belge):
        eski = self.belgeler.get(belge.id)
        if eski and eski.parmak_izi == belge.parmak_izi:
            return "değişmedi"
        self.sil(belge.id, sessiz=True)                  # önce eski parçaların hepsi gider
        self.belgeler[belge.id] = belge
        for p in parcala(belge, max_karakter=120):
            self.parcalar[p["id"]] = p
        self.surum += 1
        return "güncellendi" if eski else "eklendi"

    def sil(self, belge_id, sessiz=False):
        self.belgeler.pop(belge_id, None)
        for pid in [pid for pid, p in self.parcalar.items() if p["belge_id"] == belge_id]:
            del self.parcalar[pid]
        if not sessiz:
            self.surum += 1

c = CanliIndeks()
print(c.yukle(KORPUS[0]), len(c.parcalar), c.surum)
print(c.yukle(KORPUS[0]), c.surum)
kisa = Belge("pusula-politika", "# İzin yönetmeliği\nYıllık izin 14 gündür.", KORPUS[0].meta)
print(c.yukle(kisa), len(c.parcalar), c.surum)''')
