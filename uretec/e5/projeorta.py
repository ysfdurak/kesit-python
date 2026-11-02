import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from h import py, pc, d

PRE = d('''
    import csv, io
    from dataclasses import dataclass
    from datetime import datetime
    from decimal import Decimal

    @dataclass(frozen=True)
    class Transaction:
        id: str
        kart: str
        zaman: datetime
        tutar: Decimal
        kategori: str

    def T(id, kart, zaman, tutar, kategori="market"):
        return Transaction(id, kart, datetime.fromisoformat(zaman), Decimal(tutar), kategori)
''')

html = (
'<h2>Derinleş: Projeyi üretim kalitesine taşımak</h2>\n'
'<p>Altı parçayla çalışan bir analiz aracın var. Kart operasyon ekibi aracı her gün kullanmaya başlayınca yeni istekler gelir: "Bozuk satır yüzünden tüm rapor çöktü", "Eşiği 5000\'den 7500\'e çekmek için yazılımcı mı bekleyeceğiz?", "Dünün sonuçlarını nerede saklıyoruz?", "Bunu her sabah komut satırından çalıştırmak istiyoruz". Bu bölüm, orta seviyede öğrendiğin her şeyi (doğrulama, yapılandırma, SQLite, argparse, logging, test, Git) aynı projede bir araya getirir. Alıştırmalar da bu ihtiyaçları birer birer kapatır.</p>\n'

'<h3>1. Girdiyi doğrula, hatayı topla</h3>\n'
'<p>Gerçek dosyada bazı satırlar bozuktur: tarih yanlış biçimde, tutar boş, kategori eksik. İki strateji vardır: <b>hızlı başarısız ol</b> (fail fast: ilk hatada dur) ve <b>hataları topla</b> (geçerli satırları işle, bozukları satır numarasıyla raporla). Günlük operasyon raporlarında ikincisi tercih edilir; ama bozuk satır oranı bir eşiği aşarsa (ör. %5) dosyanın tamamı reddedilir, çünkü o noktada sorun tek tük satırda değil, kaynaktadır.</p>\n'
+ py('''
    import csv, io
    from datetime import datetime
    from decimal import Decimal, InvalidOperation

    VERI = """id,kart,zaman,tutar,kategori
    T1,****1111,2024-03-15 09:12:00,245.90,market
    T2,****1111,15.03.2024 13:40,1200.00,elektronik
    T3,****2222,2024-03-15 02:15:00,,kuyumcu
    T4,****3333,2024-03-15 23:50:00,-60.00,yakit
    T5,****3333,2024-03-15 23:54:00,75.50,
    """

    gecerli, hatalar = [], []
    for no, s in enumerate(csv.DictReader(io.StringIO(VERI)), start=2):   # 1. satır başlık
        try:
            zaman = datetime.strptime(s["zaman"], "%Y-%m-%d %H:%M:%S")
            tutar = Decimal(s["tutar"])
            if tutar <= 0:
                raise ValueError("tutar pozitif olmalı")
            if not s["kategori"].strip():
                raise ValueError("kategori boş")
        except InvalidOperation:
            hatalar.append((no, s["id"], "tutar sayı değil"))
            continue
        except ValueError as e:
            hatalar.append((no, s["id"], str(e)[:30]))
            continue
        gecerli.append((s["id"], zaman.hour, tutar))

    print("geçerli:", gecerli)
    for h in hatalar:
        print("satır", *h)
    oran = len(hatalar) / (len(hatalar) + len(gecerli))
    print(f"hata oranı %{oran * 100:.0f} ->", "DOSYAYI REDDET" if oran > 0.05 else "devam")
''') +
'<div class="warn"><b>InvalidOperation bir ValueError değildir</b><code>Decimal("")</code> ve <code>Decimal("abc")</code> <code>decimal.InvalidOperation</code> fırlatır; bu sınıf <code>ArithmeticError</code>\'dan türer. Yalnızca <code>except ValueError</code> yazarsan boş tutarlı satır tüm programı düşürür.</div>\n'

'<h3>2. Kurallar veri olsun: kayıt defteri ve ayar dosyası</h3>\n'
'<p>Kural eklemek için <code>kurallari_uygula</code> fonksiyonunu her seferinde değiştirmek yerine kuralları bir <b>kayıt defterine</b> (registry) koy: ad → fonksiyon. Eşikler ise koddan çıkıp bir ayar sözlüğüne (gerçekte JSON/TOML dosyası) taşınır. Ayardan gelen değerler metin ya da float olabileceği için okurken <b>tek noktada</b> doğru tipe çevrilir.</p>\n'
+ py('''
    import json
    from datetime import datetime
    from decimal import Decimal

    AYAR_JSON = '{"yuksek_esik": "5000.00", "gece_bas": 23, "gece_bit": 6, "riskli_kategoriler": ["kuyumcu", "kripto"]}'
    ham = json.loads(AYAR_JSON)
    ayar = {**ham, "yuksek_esik": Decimal(ham["yuksek_esik"]), "riskli_kategoriler": set(ham["riskli_kategoriler"])}

    KURALLAR = {}
    def kural(ad):
        def kaydet(f):
            KURALLAR[ad] = f
            return f
        return kaydet

    @kural("gece")
    def _gece(t, a):
        return t["zaman"].hour >= a["gece_bas"] or t["zaman"].hour < a["gece_bit"]

    @kural("yuksek")
    def _yuksek(t, a):
        return t["tutar"] >= a["yuksek_esik"]

    @kural("riskli_kategori")
    def _kategori(t, a):
        return t["kategori"] in a["riskli_kategoriler"]

    islem = {"id": "T3", "zaman": datetime(2024, 3, 15, 2, 15), "tutar": Decimal("8500.00"), "kategori": "kuyumcu"}
    print(sorted(KURALLAR))
    print([ad for ad, f in KURALLAR.items() if f(islem, ayar)])
''') +

'<h3>3. Sakla: SQLite\'ta kuruş olarak</h3>\n'
'<p>Sonuçları her gün bir SQLite dosyasına yazarsan "geçen hafta kaç şüpheli işlem vardı" sorusu tek sorgu olur. Para için SQLite\'ın REAL tipi float\'tır; tutarı <b>tam sayı kuruş</b> olarak saklamak hem toplamları kesin yapar hem de Decimal\'e geri dönüşü kolaylaştırır. Zamanı ISO 8601 metni olarak yaz.</p>\n'
+ py('''
    import sqlite3
    from decimal import Decimal

    con = sqlite3.connect(":memory:")
    con.execute("CREATE TABLE islem (id TEXT PRIMARY KEY, zaman TEXT, tutar_kurus INTEGER, kategori TEXT)")
    veriler = [("T1", "2024-03-15T09:12:00", Decimal("0.10"), "market"),
               ("T2", "2024-03-15T13:40:00", Decimal("0.20"), "market")]
    con.executemany("INSERT INTO islem VALUES (?, ?, ?, ?)",
                    [(i, z, int(t * 100), k) for i, z, t, k in veriler])
    kurus = con.execute("SELECT SUM(tutar_kurus) FROM islem WHERE kategori = 'market'").fetchone()[0]
    print(Decimal(kurus) / 100, "| float olsaydı:", 0.10 + 0.20)
''') +

'<h3>4. Komut satırı aracı ve proje ağacı</h3>\n'
'<p>Son adım aracı paketlemek. Proje <i>git-proje-yapisi</i> dersindeki src yerleşimine oturur; giriş noktası argparse ile parametre alır, sonucu stdout\'a ya da dosyaya yazar, hata durumunda sıfır dışı çıkış kodu döner ki zamanlayıcı (cron, Windows Görev Zamanlayıcı) sorunu fark etsin.</p>\n'
+ pc('''
    kart-analiz/
    ├── pyproject.toml            # [project.scripts] kart-analiz = "kart_analiz.cli:main"
    ├── README.md   .gitignore   .env.example
    ├── ayar.json                 # eşikler: kod değişmeden ayarlanır
    ├── src/kart_analiz/
    │   ├── model.py              # Transaction, csv_oku, doğrulama
    │   ├── kurallar.py           # kayıt defteri + kurallar
    │   ├── rapor.py              # JSON / CSV çıktı
    │   ├── depo.py               # SQLite
    │   └── cli.py                # argparse + logging
    └── tests/  test_model.py  test_kurallar.py  test_rapor.py

    # Kendi bilgisayarında:
    python -m venv .venv && source .venv/bin/activate     # Windows: .venv\\Scripts\\Activate.ps1
    python -m pip install -e .
    kart-analiz islemler.csv --ayar ayar.json --cikti rapor.json --veritabani gecmis.db -v
    python -m unittest discover -s tests
''') +
'<div class="tbl-wrap"><table>'
'<tr><th>Üretim kontrol listesi</th><th>Bu projede karşılığı</th><th>İlgili ders</th></tr>'
'<tr><td>Bozuk veri programı düşürmüyor</td><td>Satır bazında doğrulama, hata raporu, eşik</td><td>hatalar, json-csv</td></tr>'
'<tr><td>Eşikler koddan ayrı</td><td>ayar.json + tek noktada tip dönüşümü</td><td>yapilandirma</td></tr>'
'<tr><td>Para kesin</td><td>Decimal; SQLite\'ta kuruş, JSON\'da metin</td><td>standart-kutuphane</td></tr>'
'<tr><td>Ne olduğu izlenebilir</td><td>logging: kaç satır okundu, kaç hata, kaç işaret</td><td>logging</td></tr>'
'<tr><td>Kurallar güvenilir</td><td>Sınır değer testleri, mock\'suz saf fonksiyonlar</td><td>test-yazma</td></tr>'
'<tr><td>Kurulum tekrarlanabilir</td><td>pyproject + kilit dosyası</td><td>sanal-ortam-pip</td></tr>'
'<tr><td>Değişiklikler izlenebilir</td><td>Git, PR, Conventional Commits</td><td>git-proje-yapisi</td></tr>'
'</table></div>\n'
'<div class="tip"><b>Portföy için</b>Bu projeyi GitHub\'a koyarken README\'ye bir örnek CSV, tek satırlık çalıştırma komutu, örnek çıktı ve "tasarım kararları" bölümü (neden Decimal, neden kayıt defteri, neden kuruş) ekle. Mülakatta en çok bu kararlar sorulur.</div>\n'
'<div class="note"><b>Gerçek işte</b>Bankalarda bu tür kural motorları genellikle önce basit eşiklerle başlar; kurallar ayar dosyasında risk ekibinin sorumluluğundadır, kod ise yazılım ekibinde. Her kuralın kaç işlemi işaretlediği günlük izlenir: bir kural birden bire çok fazla işaretliyorsa ya veri kaynağı bozulmuştur ya da eşik yanlış girilmiştir. İşaretlenen işlemler analistin önüne puan sırasıyla gelir; zamanla bu kuralların yanına makine öğrenmesi modelleri eklenir (ileri seviye ml dersleri), ama açıklanabilir kurallar denetim için her zaman kalır.</div>\n'
)

ex = [
  dict(t='mc', stage='Isınma', q='Günlük işlem dosyasında 10.000 satırdan 3\'ü bozuk (tarih biçimi yanlış). Operasyon raporu için en uygun davranış hangisidir?',
       o=['İlk bozuk satırda programı durdurup hiç rapor üretmemek', 'Bozuk satırları sessizce atlayıp hiçbir yere yazmamak', 'Geçerli satırları işleyip bozukları satır numarasıyla raporlamak', 'Bozuk tarihleri o günün tarihiyle doldurmak'], a=2,
       why='Hata toplama stratejisi işi durdurmadan sorunları görünür kılar; satır numarası kaynağın düzeltilmesini sağlar. Sessizce atlamak veri kaybını gizler, uydurma değer ise raporu yanlış yapar. Bozuk oranı bir eşiği aşarsa dosyanın tamamını reddetmek de bu stratejinin parçasıdır.'),
  dict(t='predict', stage='Kodu oku', q='Bu kod ne yazdırır?',
       code=d('''
           from decimal import Decimal, InvalidOperation
           sonuc = []
           for metin in ["12.50", "", "1,5", "7"]:
               try:
                   sonuc.append(Decimal(metin))
               except ValueError:
                   sonuc.append("V")
               except InvalidOperation:
                   sonuc.append("I")
           print(sonuc)
       '''),
       o=["[Decimal('12.50'), 'I', 'I', Decimal('7')]", "[Decimal('12.50'), 'V', 'V', Decimal('7')]", "[Decimal('12.50'), 'V', 'I', Decimal('7')]", "[Decimal('12.50'), 'I', Decimal('1.5'), Decimal('7')]"], a=0,
       why='Decimal geçersiz metinde ValueError değil decimal.InvalidOperation fırlatır (ArithmeticError alt sınıfı). Boş metin ve ondalık virgüllü "1,5" ikisi de geçersizdir.'),
  dict(t='predict', stage='Kodu oku', q='Bu kod ne yazdırır?',
       code=d('''
           from datetime import datetime
           a = datetime(2024, 3, 15, 23, 58)
           b = datetime(2024, 3, 17, 0, 1)
           fark = b - a
           print(fark.seconds, int(fark.total_seconds()))
       '''),
       o=['180 86580', '86580 86580', '180 180', '3 86580'], a=0,
       why='timedelta.seconds yalnızca gün dışında kalan saniyeleri verir (0–86399); 1 gün 3 dakikalık farkta 180 olur. Toplam süre için total_seconds() gerekir. Pencere kurallarında .seconds kullanmak günler arası işlemleri "3 dakika arayla" sanmaya yol açar.'),
  dict(t='predict', stage='Kodu oku', q='Bu kod ne yazdırır?',
       code=d('''
           from dataclasses import dataclass, replace, FrozenInstanceError
           @dataclass(frozen=True)
           class Islem:
               id: str
               kategori: str
           a = Islem("T1", "market")
           b = replace(a, kategori="gida")
           try:
               a.kategori = "x"
           except FrozenInstanceError:
               print("değişmez")
           print(a.kategori, b.kategori, a == b)
       '''),
       o=['değişmez\nmarket gida False', 'değişmez\ngida gida True', 'market gida False', 'değişmez\nx gida False'], a=0,
       why='frozen dataclass\'ta alan ataması FrozenInstanceError verir. dataclasses.replace orijinali değiştirmeden yeni bir nesne üretir; alanlar farklı olduğu için eşit değildir.'),
  dict(t='order', stage='Kodu oku',
       q='<p>Aracın komut satırı giriş noktası <code>main(argv)</code> fonksiyonunun satırlarını sırala: argümanları ayrıştırsın, eşiği Decimal\'e çevirsin ve sonuç sözlüğü döndürsün.</p>',
       lines=['import argparse', 'from decimal import Decimal', 'def main(argv):', '    p = argparse.ArgumentParser(prog="kart-analiz")', '    p.add_argument("dosya")', '    p.add_argument("--esik", default="5000")', '    a = p.parse_args(argv)', '    return {"dosya": a.dosya, "esik": Decimal(a.esik)}'],
       tests='from decimal import Decimal as _D\nassert main(["islem.csv"]) == {"dosya": "islem.csv", "esik": _D("5000")}, "varsayılan eşik 5000"\nassert main(["a.csv", "--esik", "7500.50"])["esik"] == _D("7500.50"), "eşik Decimal olmalı"\n',
       hint='İçe aktarmalar en üstte; ayrıştırıcı kurulmadan argüman eklenemez, argümanlar eklenmeden parse_args çağrılmaz.',
       why='argparse ayrıştırıcısı önce kurulur, argümanlar eklenir, sonra parse_args çalışır. Eşiği string varsayılanla alıp tek noktada Decimal\'e çevirmek float hatasını önler; argv parametresi de fonksiyonu test edilebilir yapar.'),
  dict(t='code', stage='Rehberli', id='proje-orta-x1', diff=2,
       q='<p>Parça 1\'in sağlam sürümü: <code>guvenli_oku(metin)</code> yaz. Başlıkları <code>id,kart,zaman,tutar,kategori</code> olan CSV\'yi okusun ve <code>(islemler, hatalar)</code> döndürsün. <code>islemler</code>: <code>Transaction</code> listesi (zaman <code>"%Y-%m-%d %H:%M:%S"</code>, tutar Decimal). <code>hatalar</code>: <code>(satir_no, id)</code> demetleri; <code>satir_no</code> dosyadaki satır numarası (başlık 1. satır, ilk veri 2). Bozuk sayılanlar: tarih çözülemiyor, tutar Decimal\'e çevrilemiyor ya da 0/negatif, kategori boş.</p>',
       guide=['enumerate(csv.DictReader(...), start=2) ile satır numarasını takip et.', 'Dönüşümleri bir try bloğuna al; except (ValueError, InvalidOperation).', 'Tutar &lt;= 0 ve boş kategori için kendin ValueError fırlat.', 'Hata olursa (no, s["id"]) ekle ve continue; olmazsa Transaction oluştur.'],
       example=d('''
           from decimal import Decimal, InvalidOperation
           for no, m in enumerate(["5", "x", "-1"], start=2):
               try:
                   v = Decimal(m)
                   if v <= 0:
                       raise ValueError("pozitif değil")
                   print(no, "tamam", v)
               except (ValueError, InvalidOperation):
                   print(no, "hatalı")
       '''),
       start=PRE + d('''
           from decimal import InvalidOperation

           def guvenli_oku(metin):
               islemler, hatalar = [], []
               for no, s in enumerate(csv.DictReader(io.StringIO(metin)), start=2):
                   # TODO: zaman, tutar ve kategoriyi doğrula; hatada (no, id) ekle
                   pass
               return islemler, hatalar
       '''),
       sol=PRE + d('''
           from decimal import InvalidOperation

           def guvenli_oku(metin):
               islemler, hatalar = [], []
               for no, s in enumerate(csv.DictReader(io.StringIO(metin)), start=2):
                   try:
                       zaman = datetime.strptime(s["zaman"], "%Y-%m-%d %H:%M:%S")
                       tutar = Decimal(s["tutar"])
                       if tutar <= 0:
                           raise ValueError("tutar pozitif olmalı")
                       if not s["kategori"].strip():
                           raise ValueError("kategori boş")
                   except (ValueError, InvalidOperation):
                       hatalar.append((no, s["id"]))
                       continue
                   islemler.append(Transaction(s["id"], s["kart"], zaman, tutar, s["kategori"]))
               return islemler, hatalar
       '''),
       tests=d('''
           _v = "id,kart,zaman,tutar,kategori\\nT1,****1111,2024-03-15 09:12:00,245.90,market\\nT2,****1111,15.03.2024 13:40,1200.00,elektronik\\nT3,****2222,2024-03-15 02:15:00,,kuyumcu\\nT4,****3333,2024-03-15 23:50:00,-60.00,yakit\\nT5,****3333,2024-03-15 23:54:00,75.50,\\nT6,****3333,2024-03-15 23:58:00,90.00,market\\nT7,****3333,2024-03-15 23:59:00,abc,market\\n"
           _i, _h = guvenli_oku(_v)
           assert [t.id for t in _i] == ["T1", "T6"], f"geçerli işlemler T1 ve T6: {[t.id for t in _i]}"
           assert _h == [(3, "T2"), (4, "T3"), (5, "T4"), (6, "T5"), (8, "T7")], f"hatalar (satır, id) yanlış: {_h}"
           assert isinstance(_i[0].tutar, Decimal) and _i[0].zaman.hour == 9, "tipler dönüştürülmeli"
       '''),
       hints=['Boş tutar ve "abc" InvalidOperation fırlatır; ValueError ile birlikte yakala.', 'satır numarası: start=2 çünkü 1. satır başlık.', 'except (ValueError, InvalidOperation): hatalar.append((no, s["id"])); continue'],
       why='Doğrulamayı okuma katmanında toplamak sonraki parçaların temiz veriyle çalışmasını garanti eder. Satır numarası kaynak sistemdeki düzeltmeyi kolaylaştırır; Decimal\'in kendi istisna türünü bilmek de gizli bir çökme noktasını kapatır.'),
  dict(t='code', stage='Rehberli', id='proje-orta-x2', diff=2,
       q='<p>Risk puanı: <code>risk_puani(t, ayar)</code> yaz. Kurallar ve puanları: gece (saat <code>ayar["gece_bas"]</code> ve üzeri ya da <code>ayar["gece_bit"]</code>\'ten küçük) 20 puan; yüksek tutar (<code>&gt;= ayar["yuksek_esik"]</code>) 40 puan; riskli kategori (<code>ayar["riskli"]</code> içinde) 30 puan. Fonksiyon <code>(puan, tetiklenenler, seviye)</code> döndürsün: <code>tetiklenenler</code> kural adlarının (<code>"gece"</code>, <code>"yuksek"</code>, <code>"kategori"</code>) bu sırayla listesi; <code>seviye</code> puan &gt;= 60 ise <code>"yüksek"</code>, &gt;= 30 ise <code>"orta"</code>, değilse <code>"düşük"</code>. <code>ayar["yuksek_esik"]</code> metin gelebilir; Decimal\'e çevir.</p>',
       guide=['Kuralları (ad, puan, koşul_fonksiyonu) üçlülerinden bir listede tut.', 'Eşiği Decimal(str(ayar["yuksek_esik"])) ile çevir.', 'Döngüde koşul sağlanırsa puanı ekle, adı listeye ekle.', 'Seviyeyi büyükten küçüğe if/elif ile belirle.'],
       example=d('''
           KURALLAR = [("uzun", 10, lambda s: len(s) > 5), ("rakam", 5, lambda s: any(c.isdigit() for c in s))]
           metin = "parola123"
           tetik = [ad for ad, p, f in KURALLAR if f(metin)]
           print(sum(p for ad, p, f in KURALLAR if f(metin)), tetik)
       '''),
       start=PRE + d('''
           def risk_puani(t, ayar):
               esik = ayar["yuksek_esik"]   # TODO: Decimal'e çevir
               kurallar = [
                   ("gece", 20, lambda: False),     # TODO: gerçek koşul
                   # TODO: yuksek (40) ve kategori (30)
               ]
               puan, tetik = 0, []
               # TODO: kuralları uygula, seviyeyi belirle
               return puan, tetik, "düşük"
       '''),
       sol=PRE + d('''
           def risk_puani(t, ayar):
               esik = Decimal(str(ayar["yuksek_esik"]))
               kurallar = [
                   ("gece", 20, lambda: t.zaman.hour >= ayar["gece_bas"] or t.zaman.hour < ayar["gece_bit"]),
                   ("yuksek", 40, lambda: t.tutar >= esik),
                   ("kategori", 30, lambda: t.kategori in ayar["riskli"]),
               ]
               puan, tetik = 0, []
               for ad, p, kosul in kurallar:
                   if kosul():
                       puan += p
                       tetik.append(ad)
               seviye = "yüksek" if puan >= 60 else "orta" if puan >= 30 else "düşük"
               return puan, tetik, seviye
       '''),
       tests=d('''
           _a = {"gece_bas": 23, "gece_bit": 6, "yuksek_esik": "5000.00", "riskli": {"kuyumcu", "kripto"}}
           assert risk_puani(T("T3", "k", "2024-03-15 02:15", "8500.00", "kuyumcu"), _a) == (90, ["gece", "yuksek", "kategori"], "yüksek"), "üç kural birden"
           assert risk_puani(T("T1", "k", "2024-03-15 09:12", "245.90"), _a) == (0, [], "düşük"), "hiç kural yok"
           assert risk_puani(T("T2", "k", "2024-03-15 12:00", "5000.00"), _a) == (40, ["yuksek"], "orta"), "eşik dahil (>=)"
           assert risk_puani(T("T4", "k", "2024-03-15 23:00", "10", "kripto"), _a) == (50, ["gece", "kategori"], "orta"), "23:00 gece sayılır"
           assert risk_puani(T("T5", "k", "2024-03-15 06:00", "10"), _a)[0] == 0, "06:00 gece değildir"
       '''),
       hints=['Decimal ile str karşılaştırması TypeError verir; eşiği önce çevir.', 'Koşulları argümansız lambda yaparsan t ve ayar\'ı kapanış (closure) ile görürler.', 'seviye = "yüksek" if puan >= 60 else "orta" if puan >= 30 else "düşük"'],
       why='Kuralları (ad, puan, koşul) verisi olarak tutmak yeni kural eklemeyi tek satıra indirir ve raporda hangi kuralların tetiklendiğini açıklanabilir kılar. Ayardan gelen eşiği tek noktada Decimal\'e çevirmek tip hatalarını önler.'),
  dict(t='code', stage='Rehberli', id='proje-orta-x3', diff=2,
       q='<p>Sonuçları sakla: <code>kaydet(con, islemler)</code> ve <code>kategori_toplam_db(con)</code> yaz. <code>kaydet</code>, yoksa <code>islem(id TEXT PRIMARY KEY, kart TEXT, zaman TEXT, tutar_kurus INTEGER, kategori TEXT)</code> tablosunu oluştursun ve işlemleri ekleyip commit etsin: zaman ISO metni (<code>isoformat()</code>), tutar <b>tam sayı kuruş</b>. Aynı id ikinci kez gelirse (dosya yeniden işlendi) hata vermesin, yok saysın. <code>kategori_toplam_db</code> SQL ile kategori → toplam sözlüğü döndürsün; değerler <code>Decimal</code> TL (ör. <code>Decimal("245.90")</code>).</p>',
       guide=['CREATE TABLE IF NOT EXISTS ile tabloyu kur.', 'Her işlem için (id, kart, zaman.isoformat(), int(tutar * 100), kategori) demeti üret.', 'INSERT OR IGNORE + executemany, ardından commit.', 'SELECT kategori, SUM(tutar_kurus) ... GROUP BY; Decimal(kurus) / 100.'],
       example=d('''
           import sqlite3
           from decimal import Decimal
           con = sqlite3.connect(":memory:")
           con.execute("CREATE TABLE IF NOT EXISTS f (no TEXT PRIMARY KEY, kurus INTEGER)")
           con.executemany("INSERT OR IGNORE INTO f VALUES (?, ?)", [("A", 1050), ("A", 999), ("B", 5)])
           print([(n, Decimal(k) / 100) for n, k in con.execute("SELECT * FROM f")])
       '''),
       start=PRE + d('''
           def kaydet(con, islemler):
               con.execute("CREATE TABLE IF NOT EXISTS islem (id TEXT PRIMARY KEY, kart TEXT, zaman TEXT, tutar_kurus INTEGER, kategori TEXT)")
               # TODO: satırları hazırla, INSERT OR IGNORE ile ekle, commit et

           def kategori_toplam_db(con):
               # TODO: GROUP BY ile topla, kuruşu Decimal TL'ye çevir
               return {}
       '''),
       sol=PRE + d('''
           def kaydet(con, islemler):
               con.execute("CREATE TABLE IF NOT EXISTS islem (id TEXT PRIMARY KEY, kart TEXT, zaman TEXT, tutar_kurus INTEGER, kategori TEXT)")
               satirlar = [(t.id, t.kart, t.zaman.isoformat(), int(t.tutar * 100), t.kategori) for t in islemler]
               con.executemany("INSERT OR IGNORE INTO islem VALUES (?, ?, ?, ?, ?)", satirlar)
               con.commit()

           def kategori_toplam_db(con):
               sql = "SELECT kategori, SUM(tutar_kurus) FROM islem GROUP BY kategori"
               return {k: Decimal(kurus) / 100 for k, kurus in con.execute(sql)}
       '''),
       tests=d('''
           import sqlite3 as _s
           _c = _s.connect(":memory:")
           _l = [T("T1", "****1", "2024-03-15 09:12", "245.90"), T("T2", "****1", "2024-03-15 10:00", "0.10"), T("T3", "****2", "2024-03-15 02:15", "8500.00", "kuyumcu")]
           kaydet(_c, _l)
           kaydet(_c, _l[:2])
           assert _c.execute("SELECT COUNT(*) FROM islem").fetchone()[0] == 3, "aynı id ikinci kez eklenmemeli"
           assert _c.execute("SELECT zaman, tutar_kurus FROM islem WHERE id='T1'").fetchone() == ("2024-03-15T09:12:00", 24590), "zaman ISO, tutar kuruş (int)"
           _t = kategori_toplam_db(_c)
           assert _t == {"market": Decimal("246.00"), "kuyumcu": Decimal("8500.00")}, f"toplamlar yanlış: {_t}"
           assert all(isinstance(v, Decimal) for v in _t.values()), "değerler Decimal olmalı"
           assert not _c.in_transaction, "commit edilmiş olmalı"
       '''),
       hints=['int(Decimal("245.90") * 100) == 24590.', 'INSERT OR IGNORE PRIMARY KEY çakışmasında satırı sessizce atlar (yeniden işlemeye dayanıklılık).', 'return {k: Decimal(kurus) / 100 for k, kurus in con.execute(sql)}'],
       why='Kuruşu tam sayı saklamak SQL\'de toplamı kesin yapar (REAL float\'tır). PRIMARY KEY + OR IGNORE, aynı dosya iki kez işlendiğinde çift kayıt oluşmasını engeller; buna idempotent (tekrar güvenli) yükleme denir.'),
  dict(t='code', stage='Kendin yaz', id='proje-orta-x4', diff=2,
       q='<p>Yönetim panosu için günlük eğilim: <code>gunluk_trend(islemler)</code>, her gün için <code>(tarih_iso, adet, toplam)</code> demetlerinin tarihe göre sıralı listesini döndürsün (<code>tarih_iso</code> <code>"2024-03-15"</code> biçiminde, <code>toplam</code> Decimal). İşlem olmayan günler de aradaki boşlukları göstermek için <code>(tarih, 0, Decimal("0"))</code> olarak yer alsın (ilk ve son işlem günü arasındaki her gün). Boş listede <code>[]</code>.</p>',
       start=PRE + d('''
           def gunluk_trend(islemler):
               pass
       '''),
       sol=PRE + d('''
           from datetime import timedelta

           def gunluk_trend(islemler):
               if not islemler:
                   return []
               gunler = {}
               for t in islemler:
                   g = t.zaman.date()
                   adet, toplam = gunler.get(g, (0, Decimal("0")))
                   gunler[g] = (adet + 1, toplam + t.tutar)
               bas, son = min(gunler), max(gunler)
               sonuc = []
               while bas <= son:
                   adet, toplam = gunler.get(bas, (0, Decimal("0")))
                   sonuc.append((bas.isoformat(), adet, toplam))
                   bas += timedelta(days=1)
               return sonuc
       '''),
       tests=d('''
           _l = [T("a", "k", "2024-03-17 10:00", "5"), T("b", "k", "2024-03-15 09:00", "100.50"), T("c", "k", "2024-03-15 23:59", "0.50"), T("d", "k", "2024-02-28 12:00", "1")]
           _r = gunluk_trend(_l[:3])
           assert _r == [("2024-03-15", 2, Decimal("101.00")), ("2024-03-16", 0, Decimal("0")), ("2024-03-17", 1, Decimal("5"))], f"yanlış: {_r}"
           assert len(gunluk_trend(_l)) == 19, "28 Şubat 2024'ten 17 Mart'a 19 gün (2024 artık yıl)"
           assert gunluk_trend([]) == [], "boş liste"
       '''),
       hints=['Önce date() ile günlere göre topla, sonra en küçük ve en büyük gün arasında timedelta(days=1) ile ilerle.', 'Ay sonu ve artık yıl hesabını timedelta senin yerine yapar.'],
       why='Eksik günleri sıfırla doldurmak grafiklerde yanıltıcı düz çizgileri önler (pandas\'ta resample/asfreq aynı işi yapar). Tarih aritmetiğini elle değil timedelta ile yapmak ay sonu ve artık yıl hatalarını ortadan kaldırır.'),
  dict(t='code', stage='Kendin yaz', id='proje-orta-x5', diff=2,
       q='<p>Analist ekibi şüpheli işlemleri Excel\'de inceleyecek. <code>supheli_csv(islemler, isaretler)</code> yaz: <code>isaretler</code> <code>{id: [kural adları]}</code> sözlüğü. Yalnızca işaretli işlemleri, <b>tutara göre azalan</b> sırada, <code>;</code> ayırıcılı CSV metni olarak döndür. Sütunlar: <code>id;kart;zaman;tutar;kurallar</code>; zaman <code>"15.03.2024 02:15"</code> biçiminde, tutar Türk biçiminde ondalık virgüllü iki basamak (<code>8500,00</code>), kurallar <code>|</code> ile birleşik. Satır sonu <code>"\\n"</code>.</p>',
       start=PRE + d('''
           def supheli_csv(islemler, isaretler):
               pass
       '''),
       sol=PRE + d('''
           def supheli_csv(islemler, isaretler):
               c = io.StringIO()
               w = csv.writer(c, delimiter=";", lineterminator="\\n")
               w.writerow(["id", "kart", "zaman", "tutar", "kurallar"])
               secili = sorted((t for t in islemler if isaretler.get(t.id)), key=lambda t: t.tutar, reverse=True)
               for t in secili:
                   w.writerow([t.id, t.kart, t.zaman.strftime("%d.%m.%Y %H:%M"), f"{t.tutar:.2f}".replace(".", ","), "|".join(isaretler[t.id])])
               return c.getvalue()
       '''),
       tests=d('''
           _l = [T("T1", "****1111", "2024-03-15 09:12", "245.9"), T("T3", "****2222", "2024-03-15 02:15", "8500"), T("T4", "****3333", "2024-03-15 23:50", "60")]
           _r = supheli_csv(_l, {"T3": ["gece", "yuksek"], "T4": ["gece"], "T1": []})
           assert _r == "id;kart;zaman;tutar;kurallar\\nT3;****2222;15.03.2024 02:15;8500,00;gece|yuksek\\nT4;****3333;15.03.2024 23:50;60,00;gece\\n", f"çıktı farklı: {_r!r}"
           assert supheli_csv(_l, {}) == "id;kart;zaman;tutar;kurallar\\n", "işaret yoksa yalnız başlık"
       '''),
       hints=['Boş kural listesi işaretsiz sayılır: isaretler.get(t.id) boş listede yanlış (falsy) olur.', 'f"{t.tutar:.2f}".replace(".", ",") Türk biçimi verir (binlik ayırıcı istenmedi).', 'csv.writer(c, delimiter=";", lineterminator="\\n")'],
       why='Raporun hedef kitlesine göre biçim seçmek (noktalı virgül, ondalık virgül, gün.ay.yıl) Excel\'de tek tıkla açılmasını sağlar. Biçimlendirme yalnızca çıktı katmanında yapılır; içerideki veri Decimal ve datetime olarak kalır.'),
  dict(t='code', stage='Hata avı', kind='bug', id='proje-orta-x6', diff=2,
       q='<p>Eşikler ayar dosyasına taşındıktan sonra araç çöküyor: <code>TypeError: \'&gt;=\' not supported between instances of \'decimal.Decimal\' and \'str\'</code>. Biri "hızlı çözüm" olarak <code>float</code>\'a çevirmeyi önerdi ama bu da kuruş farklarında yanlış sonuç veriyor. <code>yuksek_islemler(islemler, ayar_json)</code> fonksiyonundaki <b>hatayı bul ve düzelt</b>: eşik dahil, tutarı eşik ve üzeri olan işlemlerin id listesi dönmeli; ayarda eşik metin ya da sayı olabilir.</p>',
       start=PRE + d('''
           import json

           def yuksek_islemler(islemler, ayar_json):
               ayar = json.loads(ayar_json)
               esik = ayar["yuksek_esik"]
               return [t.id for t in islemler if t.tutar >= esik]
       '''),
       sol=PRE + d('''
           import json

           def yuksek_islemler(islemler, ayar_json):
               ayar = json.loads(ayar_json, parse_float=Decimal)
               esik = Decimal(str(ayar["yuksek_esik"]))
               return [t.id for t in islemler if t.tutar >= esik]
       '''),
       tests=d('''
           _l = [T("A", "k", "2024-03-15 10:00", "5000.10"), T("B", "k", "2024-03-15 10:00", "5000.09"), T("C", "k", "2024-03-15 10:00", "9000")]
           assert yuksek_islemler(_l, '{"yuksek_esik": "5000.10"}') == ["A", "C"], "metin eşik: 5000.10 dahil, 5000.09 hariç"
           assert yuksek_islemler(_l, '{"yuksek_esik": 5000.10}') == ["A", "C"], "sayı eşik de kuruş hassasiyetinde doğru çalışmalı"
           assert yuksek_islemler(_l, '{"yuksek_esik": 9000}') == ["C"], "tam sayı eşik"
       '''),
       hints=['Decimal ile str karşılaştırılamaz; Decimal ile float karşılaştırılabilir ama 5000.10 float olarak tam temsil edilemez.', 'JSON\'daki ondalık sayıyı parse_float=Decimal ile kayıpsız oku.', 'Metin ve tam sayı için Decimal(str(deger)) ikisini de karşılar.'],
       why='Ayar dosyasından gelen değerin tipi sana bağlı değildir. Decimal ile float karşılaştırması Python\'da serbesttir ama float(5000.10) aslında 5000.1000000000003638 olduğundan tam eşikteki işlem kaçırılır. Tek noktada Decimal\'e çevirmek iki sorunu birden çözer.'),
  dict(t='code', stage='Hata avı', kind='bug', id='proje-orta-x7', diff=2,
       q='<p>Sık işlem kuralının hızlı sürümü yanlış alarm veriyor: aynı kartta iki gün arayla yapılan işlemler "3 dakika arayla" görünüyor ve CSV sırası karışık geldiğinde bazı gerçek vakalar kaçıyor. <code>art_arda(islemler, dk=5)</code> aynı kartta ardışık iki işlem arası <code>dk</code> dakika veya daha az olan <b>ikinci</b> işlemlerin id\'lerini (sıralı küme olarak, <code>sorted</code> liste) döndürmeli. <b>Hataları bul ve düzelt.</b></p>',
       start=PRE + d('''
           def art_arda(islemler, dk=5):
               son = {}
               sonuc = []
               for t in islemler:
                   if t.kart in son and (t.zaman - son[t.kart]).seconds <= dk * 60:
                       sonuc.append(t.id)
                   son[t.kart] = t.zaman
               return sorted(sonuc)
       '''),
       sol=PRE + d('''
           def art_arda(islemler, dk=5):
               son = {}
               sonuc = []
               for t in sorted(islemler, key=lambda x: x.zaman):
                   if t.kart in son and (t.zaman - son[t.kart]).total_seconds() <= dk * 60:
                       sonuc.append(t.id)
                   son[t.kart] = t.zaman
               return sorted(sonuc)
       '''),
       tests=d('''
           _l = [
               T("T6", "****3", "2024-03-15 23:58", "1"), T("T4", "****3", "2024-03-15 23:50", "1"), T("T5", "****3", "2024-03-15 23:54", "1"),
               T("A1", "****9", "2024-03-15 10:00", "1"), T("A2", "****9", "2024-03-17 10:03", "1"),
               T("B1", "****7", "2024-03-15 10:00", "1"), T("B2", "****8", "2024-03-15 10:01", "1"),
           ]
           assert art_arda(_l) == ["T5", "T6"], f"yalnız T5 ve T6 (aynı kart, 4'er dakika): {art_arda(_l)}"
           assert art_arda(_l, dk=3) == [], "4 dakikalık aralar 3 dakikalık pencereye girmez"
       '''),
       hints=['İki ayrı hata var: biri sıralama, biri süre hesabı.', 'timedelta.seconds gün kısmını yok sayar; toplam süre total_seconds().', 'Döngüden önce zamana göre sırala: sorted(islemler, key=lambda x: x.zaman).'],
       why='"Önceki işlem" kavramı zamana göre sıralı veri varsayar; CSV sırasına güvenmek vakaları kaçırır. timedelta.seconds yalnızca gün içi kalan saniyeyi verdiği için 2 gün 3 dakikalık fark 180 saniye görünür; süre karşılaştırmasında her zaman total_seconds() kullan.'),
  dict(t='code', stage='Meydan okuma', id='proje-orta-x8', diff=3,
       q='<p>Kart numarası girişini güvenli hâle getir: <code>kart_maskele(no)</code> yaz. Girdideki boşluk ve tireleri at; geriye yalnızca rakam kalmalı ve uzunluk 13–19 olmalı; numara <b>Luhn</b> kontrolünden geçmeli. Geçerliyse <code>"****" + son 4 hane</code> döndür, değilse <code>ValueError</code>. Luhn: sağdan başlayarak her ikinci rakamı ikiyle çarp, sonuç 9\'dan büyükse 9 çıkar; tüm rakamların toplamı 10\'a bölünüyorsa geçerli.</p>',
       start=d('''
           def kart_maskele(no):
               return "****" + no[-4:]
       '''),
       sol=d('''
           def _luhn(rakamlar):
               toplam = 0
               for i, r in enumerate(reversed(rakamlar)):
                   n = int(r)
                   if i % 2 == 1:
                       n *= 2
                       if n > 9:
                           n -= 9
                   toplam += n
               return toplam % 10 == 0

           def kart_maskele(no):
               temiz = no.replace(" ", "").replace("-", "")
               if not (temiz.isdigit() and temiz.isascii() and 13 <= len(temiz) <= 19 and _luhn(temiz)):
                   raise ValueError("geçersiz kart numarası")
               return "****" + temiz[-4:]
       '''),
       tests=d('''
           assert kart_maskele("4111 1111 1111 1111") == "****1111", "boşluklu geçerli numara"
           assert kart_maskele("5500-0000-0000-0004") == "****0004", "tireli geçerli numara"
           assert kart_maskele("378282246310005") == "****0005", "15 haneli geçerli numara"
           for _bad in ("4111 1111 1111 1112", "4111", "4111a11111111111", "41111111111111111111", "", "٤١١١١١١١١١١١١١١١"):
               try:
                   kart_maskele(_bad)
               except ValueError:
                   pass
               else:
                   raise AssertionError(f"{_bad!r} ValueError vermeli")
       '''),
       hints=['Önce temizle, sonra üç koşul: hepsi rakam, uzunluk 13-19, Luhn.', 'Luhn\'da sağdan sayıyorsun: reversed + enumerate; tek indeksler (1, 3, ...) ikiyle çarpılır.', 'str.isdigit() Arapça-Hint rakamlarına da True der; isascii() ile birlikte kullan.'],
       why='Luhn basit yazım hatalarını (tek hane, yer değiştirme) yakalayan bir sağlama algoritmasıdır; kart numarasının gerçek olduğunu kanıtlamaz ama girişte hataları erken eler. Tam numarayı hiçbir zaman log\'a ya da rapora yazma; maskeleme okuma katmanında yapılmalıdır (PCI DSS kuralı).'),
]

faq = [
  dict(q='Bu projeyi tek dosyada mı yazmalıyım, modüllere mi bölmeliyim?', a='Öğrenirken tek dosya rahattır. Ama test yazmaya ve başkasıyla paylaşmaya başladığında model, kurallar, rapor, depo ve CLI ayrı modüller olmalı: her biri tek bir şeyden sorumlu olur, testler daha küçük olur ve bir parçayı (ör. SQLite yerine PostgreSQL) değiştirmek diğerlerini etkilemez.'),
  dict(q='Kuralları ayar dosyasına koyunca hatalı ayar nasıl yakalanır?', a='Ayarı yükler yüklemez doğrula: zorunlu anahtarlar var mı, eşik pozitif bir sayı mı, saatler 0–23 arasında mı? Hata varsa program hiç başlamadan anlaşılır bir mesajla dursun. Bunu elle yapabilir ya da pydantic ile şema tanımlayabilirsin (pydantic-dogrulama dersi).'),
]
mistakes = [
  dict(bad='try:\n    tutar = Decimal(s["tutar"])\nexcept ValueError:\n    hatalar.append(no)', good='from decimal import InvalidOperation\ntry:\n    tutar = Decimal(s["tutar"])\nexcept (ValueError, InvalidOperation):\n    hatalar.append(no)', why='Decimal geçersiz metinde InvalidOperation fırlatır; yalnız ValueError yakalamak boş tutarlı satırda programı düşürür.'),
  dict(bad='if (b.zaman - a.zaman).seconds <= 600:', good='if (b.zaman - a.zaman).total_seconds() <= 600:', why='timedelta.seconds gün kısmını yok sayar; günler arası farklar küçük görünür ve yanlış alarm üretir.'),
]

EXT = dict(id='proje-orta', min=45, html=html, ex=ex, faq=faq, mistakes=mistakes)
