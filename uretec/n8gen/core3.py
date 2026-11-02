TR = r'''def tr_kucuk(s):
    return s.replace("I", "ı").replace("İ", "i").lower()
'''

NIYET = r'''NIYET_VERISI = [
    ("Siparişim nerede?", "siparis"), ("1523 numaralı siparişim ne zaman gelir", "siparis"),
    ("Kurye yola çıktı mı", "siparis"), ("Siparişimin durumu nedir", "siparis"),
    ("Yemeğim hâlâ gelmedi, sipariş 88", "siparis"), ("Sipariş takibi yapmak istiyorum", "siparis"),
    ("Ne zaman teslim edilecek", "siparis"), ("Siparişim hazırlanıyor mu", "siparis"),
    ("Kuryem nerede kaldı", "siparis"), ("Sipariş no 412 durum", "siparis"),
    ("Para iadesi istiyorum", "iade"), ("Ürün eksik geldi iade alabilir miyim", "iade"),
    ("Ücretimi geri istiyorum", "iade"), ("Siparişi iade etmek istiyorum", "iade"),
    ("Yanlış ürün geldi parasını geri verin", "iade"), ("İade talebi oluşturmak istiyorum", "iade"),
    ("Yemek dökülmüş geldi, paramı iade edin", "iade"), ("Kartıma iade ne zaman yansır", "iade"),
    ("Kurye çok kaba davrandı", "sikayet"), ("Yemek buz gibi geldi", "sikayet"),
    ("Restoran siparişi yanlış hazırladı", "sikayet"), ("Hizmetinizden hiç memnun değilim", "sikayet"),
    ("Paket dağılmış halde geldi", "sikayet"), ("Kurye kapıya gelmedi aşağı çağırdı", "sikayet"),
    ("Bu kaçıncı gecikme artık yeter", "sikayet"), ("Müşteri hizmetleri hiç dönüş yapmadı", "sikayet"),
    ("Teslimat ücreti ne kadar", "bilgi"), ("Premium üyelik avantajları neler", "bilgi"),
    ("Hangi ödeme yöntemleri var", "bilgi"), ("Siparişi iptal edebilir miyim", "bilgi"),
    ("Minimum sipariş tutarı nedir", "bilgi"), ("Bahşiş verebilir miyim", "bilgi"),
    ("Kapıda nakit ödeme var mı", "bilgi"), ("Ortalama teslim süresi ne kadar", "bilgi"),
    ("Merhaba", "selam"), ("İyi akşamlar", "selam"), ("Selam nasılsınız", "selam"),
    ("Teşekkürler", "selam"), ("Günaydın", "selam"), ("Kolay gelsin", "selam"),
]
'''

SSS = r'''SSS = {
    "teslimat-ucreti": "Teslimat ücreti restorana ve mesafeye göre 0, 19,90, 24,90 ya da 29,90 TL'dir; ücret sepette gösterilir.",
    "iptal": "Restoran siparişi onaylamadan önce iptal ücretsizdir. Kurye yola çıktıktan sonra sipariş iptal edilemez.",
    "iade-kosul": "Eksik, yanlış ya da hasarlı ürünlerde teslimattan sonraki 24 saat içinde iade talebi açılır.",
    "iade-sure": "Onaylanan iade tutarı 3-5 iş günü içinde kartınıza ya da cüzdanınıza yansır.",
    "odeme": "Ödeme yöntemleri: kredi ve banka kartı, Lezzet Cüzdan ve kapıda nakit ödeme.",
    "bahsis": "Kuryeye uygulama üzerinden bahşiş verebilirsiniz; bahşişin tamamı kuryeye aktarılır.",
    "premium": "Premium üyelik aylık 49,90 TL'dir; seçili restoranlarda indirim ve öncelikli destek sağlar.",
}
'''

SURE = r'''import datetime as dt

def teslim_suresi_belgesi(siparisler):
    """Gerçek lk_orders kayıtlarından ortalama teslim süresi belgesi üretir."""
    f = "%Y-%m-%d %H:%M:%S"
    dk = [(dt.datetime.strptime(s["delivered_at"], f) - dt.datetime.strptime(s["placed_at"], f)).total_seconds() / 60
          for s in siparisler if s["delivered_at"]]
    oran = sum(d <= 45 for d in dk) / len(dk)
    return (f"Ortalama teslim süresi {sum(dk) / len(dk):.0f} dakikadır. "
            f"45 dakika içinde teslim edilen siparişlerin oranı %{oran * 100:.0f}.")
'''

KOK = r'''import re

DURAK = {"ne", "mi", "mı", "var", "kadar", "nedir", "nasıl", "ben", "bir", "ve", "ya", "da", "sipariş", "siparişi", "siparişim"}

def kok5(metin):
    return [k[:5] for k in re.findall(r"\w+", tr_kucuk(metin)) if k not in DURAK]
'''

NIYET_MODEL = r'''from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline

def niyet_modeli(ornekler):
    X = [m for m, _ in ornekler]
    y = [n for _, n in ornekler]
    return make_pipeline(TfidfVectorizer(analyzer="char_wb", ngram_range=(2, 4), preprocessor=tr_kucuk),
                         LogisticRegression(max_iter=2000, C=10)).fit(X, y)

def niyet_tahmin(model, mesaj, esik=0.45):
    p = model.predict_proba([mesaj])[0]
    i = int(p.argmax())
    return (str(model.classes_[i]) if p[i] >= esik else "belirsiz"), round(float(p[i]), 3)
'''

PII = r'''KART = re.compile(r"\b(?:\d[ -]?){15}\d\b")
TELEFON = re.compile(r"(?:\+90\s?|\b0|\b)5\d{2}[ ]?\d{3}[ ]?\d{2}[ ]?\d{2}\b")
EPOSTA = re.compile(r"[\w.+-]+@[\w-]+\.[\w.]+")

def pii_maskele(metin):
    metin = KART.sub("[KART]", metin)
    metin = EPOSTA.sub("[EPOSTA]", metin)
    return TELEFON.sub("[TELEFON]", metin)
'''

ENJ = r'''KALIPLAR = ["önceki talimat", "talimatları yok say", "ignore previous", "sistem istemi", "system prompt",
            "tüm müşteri", "yönetici gibi davran"]

def giris_bariyeri(mesaj, max_uzunluk=500):
    temiz = pii_maskele(mesaj.strip())[:max_uzunluk]
    k = tr_kucuk(temiz)
    return {"mesaj": temiz, "engel": any(p in k for p in KALIPLAR),
            "maskelendi": temiz != mesaj.strip()[:max_uzunluk]}
'''

ARAC = r'''import datetime as dt

def siparis_durumu(con, siparis_no, musteri_id):
    satir = con.execute(
        "SELECT o.status, r.name, o.placed_at, o.delivered_at FROM lk_orders o "
        "JOIN lk_restaurants r ON r.restaurant_id = o.restaurant_id "
        "WHERE o.order_id = ? AND o.customer_id = ?", (siparis_no, musteri_id)).fetchone()
    if satir is None:
        return None
    durum, restoran, verildi, teslim = satir
    dk = None
    if teslim:
        f = "%Y-%m-%d %H:%M:%S"
        dk = round((dt.datetime.strptime(teslim, f) - dt.datetime.strptime(verildi, f)).total_seconds() / 60)
    return {"siparis_no": siparis_no, "durum": durum, "restoran": restoran, "teslim_dk": dk}
'''

CEVAP = r'''from typing import Literal, Optional
from pydantic import BaseModel, Field, field_validator, model_validator

class AsistanCevabi(BaseModel):
    niyet: Literal["siparis", "iade", "sikayet", "bilgi", "selam", "belirsiz", "guvenlik"]
    metin: str = Field(min_length=1, max_length=600)
    kaynaklar: list[str] = []
    arac: Optional[str] = None
    devret: bool = False
    guven: float = Field(ge=0, le=1)

    @field_validator("metin")
    @classmethod
    def kisisel_veri_yok(cls, v):
        if KART.search(v) or EPOSTA.search(v):
            raise ValueError("cevapta kişisel veri var")
        return v

    @model_validator(mode="after")
    def bilgi_kaynakli(self):
        if self.niyet == "bilgi" and not self.devret and not self.kaynaklar:
            raise ValueError("bilgi cevabı kaynak göstermeli ya da devretmeli")
        return self
'''

LLM = r'''import json

class SahteLLM:
    """Ağsız model: istemdeki kaynaklardan soruyla en çok kök paylaşanı seçip JSON döndürür.
    bozuk=n verilirse ilk n çağrıda geçersiz çıktı üretir (yeniden deneme testleri için)."""
    def __init__(self, bozuk=0):
        self.bozuk, self.cagri = bozuk, 0

    def tamamla(self, istem):
        self.cagri += 1
        if self.cagri <= self.bozuk:
            return "Tabii! İşte cevabınız: {metin: eksik"
        soru = istem.rsplit("Soru:", 1)[-1]
        kaynaklar = re.findall(r"^\[([\w-]+)\] (.+)$", istem, re.M)
        if not kaynaklar:
            return json.dumps({"metin": "Bilmiyorum.", "kaynaklar": []}, ensure_ascii=False)
        q = set(kok5(soru))
        kid, metin = max(kaynaklar, key=lambda k: len(q & set(kok5(k[1]))))
        return json.dumps({"metin": metin, "kaynaklar": [kid]}, ensure_ascii=False)
'''
