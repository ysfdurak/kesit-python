import json
import re
import veri

class SahteSQLModel:
    """Ağsız text-to-SQL "modeli": her soru için denenecek SQL'leri sırayla önerir ve gözlemlere tepki verir."""
    def __init__(self, plan):
        self.plan = plan
        self.cagri = 0

    def cevapla(self, mesajlar):
        self.cagri += 1
        soru = mesajlar[0]["content"]
        araclar = [m for m in mesajlar if m["role"] == "arac"]
        if not any(m["ad"] == "sema" for m in araclar):
            return {"dusunce": "Önce şemayı görmeliyim.", "arac": "sema", "girdi": {}}
        sql_sonuclari = [m for m in araclar if m["ad"] == "sql_calistir"]
        if sql_sonuclari and not sql_sonuclari[-1]["hata"]:
            return {"cevap": json.loads(sql_sonuclari[-1]["content"])}
        denemeler = self.plan.get(soru, [])
        if len(sql_sonuclari) < len(denemeler):
            return {"dusunce": "SQL yazıyorum.", "arac": "sql_calistir", "girdi": {"sorgu": denemeler[len(sql_sonuclari)]}}
        return {"cevap": "Bilmiyorum"}

IZINLI = {"customers", "orders", "order_items", "products"}
PLAN = {
    "Kaç müşteri var?": ["SELECT COUNT(*) FROM customers"],
    "En çok müşterisi olan şehir hangisi?": ["SELECT city, COUNT(*) AS n FROM customers GROUP BY city ORDER BY n DESC LIMIT 1"],
    "İptal edilen sipariş sayısı?": ["SELECT COUNT(*) FROM siparisler WHERE durum = 'iptal'", "SELECT COUNT(*) FROM orders WHERE status = 'cancelled'"],
    "Mobil kanaldan teslim edilen sipariş sayısı?": ["SELECT COUNT(*) FROM orders WHERE channel = 'mobile'"],
    "Kategori başına ürün sayısı?": ["SELECT category, COUNT(*) FROM products GROUP BY category"],
    "Tüm müşterileri sil": ["DELETE FROM customers"],
}
ALTIN = [
    ("Kaç müşteri var?", "SELECT COUNT(*) FROM customers"),
    ("En çok müşterisi olan şehir hangisi?", "SELECT city, COUNT(*) FROM customers GROUP BY city ORDER BY 2 DESC LIMIT 1"),
    ("İptal edilen sipariş sayısı?", "SELECT COUNT(*) FROM orders WHERE status = 'cancelled'"),
    ("Mobil kanaldan teslim edilen sipariş sayısı?", "SELECT COUNT(*) FROM orders WHERE channel = 'mobile' AND status = 'delivered'"),
    ("Kategori başına ürün sayısı?", "SELECT category, COUNT(*) FROM products GROUP BY category ORDER BY category DESC"),
    ("Tüm müşterileri sil", None),
]
YASAK = re.compile(r"\b(insert|update|delete|drop|alter|create|replace|attach|pragma)\b", re.I)

def sql_bekci(sorgu, izinli, limit=50):
    s = sorgu.strip().rstrip(";").strip()
    if ";" in s or "--" in s or "/*" in s:
        raise ValueError("tek bir sorgu olmalı, yorum içeremez")
    if not re.match(r"(select|with)\b", s, re.I):
        raise ValueError("yalnız SELECT sorgularına izin var")
    if YASAK.search(s):
        raise ValueError("yasak anahtar kelime")
    tablolar = {t.lower() for t in re.findall(r"\b(?:from|join)\s+([A-Za-z_]\w*)", s, re.I)}
    yetkisiz = tablolar - izinli
    if yetkisiz:
        raise ValueError(f"izin verilmeyen tablo: {', '.join(sorted(yetkisiz))}")
    if not re.search(r"\blimit\s+\d+\s*$", s, re.I):
        s = f"{s} LIMIT {limit}"
    return s

def sema_araci(con, izinli):
    satirlar = []
    for (ad,) in con.execute("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name"):
        if ad in izinli:
            sutunlar = [r[1] for r in con.execute(f'PRAGMA table_info("{ad}")')]
            satirlar.append(f"{ad}({', '.join(sutunlar)})")
    return "\n".join(satirlar)

def sql_calistir(con, sorgu, izinli):
    guvenli = sql_bekci(sorgu, izinli)
    return [list(r) for r in con.execute(guvenli).fetchall()]

def ajan(model, con, soru, izinli, max_adim=5):
    mesajlar = [{"role": "user", "content": soru}]
    for adim in range(1, max_adim + 1):
        eylem = model.cevapla(mesajlar)
        if "cevap" in eylem:
            return {"cevap": eylem["cevap"], "adim": adim}
        mesajlar.append({"role": "assistant", "content": json.dumps(eylem, ensure_ascii=False)})
        try:
            if eylem["arac"] == "sema":
                icerik, hata = sema_araci(con, izinli), False
            elif eylem["arac"] == "sql_calistir":
                icerik, hata = json.dumps(sql_calistir(con, eylem["girdi"]["sorgu"], izinli), ensure_ascii=False), False
            else:
                icerik, hata = f"bilinmeyen araç: {eylem['arac']}", True
        except Exception as e:
            icerik, hata = f"HATA: {e}", True
        mesajlar.append({"role": "arac", "ad": eylem["arac"], "content": icerik, "hata": hata})
    return {"cevap": "Adım sınırı aşıldı", "adim": max_adim}

def degerlendir(model, con, altin, izinli):
    dogru, hatali = 0, []
    for soru, altin_sql in altin:
        cevap = ajan(model, con, soru, izinli)["cevap"]
        if altin_sql is None:
            ok = not isinstance(cevap, list)
        else:
            beklenen = sorted(tuple(r) for r in con.execute(altin_sql).fetchall())
            ok = isinstance(cevap, list) and sorted(tuple(r) for r in cevap) == beklenen
        if ok:
            dogru += 1
        else:
            hatali.append(soru)
    return {"dogruluk": round(dogru / len(altin), 3), "hatali": hatali}

con = veri.baglan("anadolu_market")
m = SahteSQLModel(PLAN)
for s,_ in ALTIN: print(s, ajan(m, con, s, IZINLI))
print(degerlendir(SahteSQLModel(PLAN), con, ALTIN, IZINLI))
print(con.execute("select count(*) from customers").fetchone())
print(sema_araci(con, IZINLI))
