import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from h import py, pc, d

html = (
'<h2>Derinleş: JSON ve CSV\'nin ince ayarları</h2>\n'
'<p>Temel okuma-yazmayı öğrendin. Gerçek işte ise farklar ayrıntıda çıkar: muhasebe ondalık virgüllü CSV gönderir, API para tutarını float olarak yollar, log sistemi her satıra bir JSON yazar, Excel bir hücreyi formül sanıp çalıştırır. Bu bölümde <code>json</code> ve <code>csv</code> modüllerinin az bilinen ama işte çok kullanılan parametrelerini görüyoruz.</p>\n'

'<h3>Okurken tip kontrolü: parse_float ve object_hook</h3>\n'
'<p><code>json.loads</code> varsayılan olarak her ondalıklı sayıyı <code>float</code> yapar. Para için bu kabul edilemez; <code>parse_float=Decimal</code> verirsen sayı metni doğrudan <code>Decimal</code>\'e çevrilir, hiç float\'a uğramaz. <code>object_hook</code> ise her JSON nesnesi (sözlük) oluştuğunda çağrılır; tarih alanlarını <code>date</code>\'e çevirmek ya da sözlüğü bir dataclass\'a dönüştürmek için idealdir.</p>\n'
+ py('''
    import json
    from decimal import Decimal
    from datetime import date

    ham = '{"hesap": "TR01", "tutar": 0.1, "islem_tarih": "2026-03-15", "detay": {"ucret": 0.2}}'

    print(json.loads(ham)["tutar"] + 0.2)          # float hatası
    d = json.loads(ham, parse_float=Decimal)
    print(d["tutar"] + d["detay"]["ucret"])         # tam 0.3

    def tarih_coz(nesne):
        for k, v in nesne.items():
            if k.endswith("_tarih") and isinstance(v, str):
                nesne[k] = date.fromisoformat(v)
        return nesne

    k = json.loads(ham, object_hook=tarih_coz)
    print(type(k["islem_tarih"]).__name__, k["islem_tarih"].strftime("%d.%m.%Y"))
''') +

'<h3>Yazarken boyut ve kararlılık: separators, sort_keys, allow_nan</h3>\n'
'<p>API\'ye gönderilen JSON\'da her bayt önemliyse <code>separators=(",", ":")</code> boşlukları siler. <code>sort_keys=True</code> aynı veriden her zaman aynı metni üretir; imza (hash) hesaplarken ve git farklarında şarttır. <code>float("nan")</code> standart JSON değildir ama Python onu varsayılan olarak <code>NaN</code> diye yazar; karşı taraftaki JavaScript ya da Java ayrıştırıcısı patlar. <code>allow_nan=False</code> bu durumu kaynağında yakalar.</p>\n'
+ py('''
    import json, hashlib

    veri = {"tutar": 120.5, "no": "S-1", "etiket": ["hızlı"]}
    kompakt = json.dumps(veri, separators=(",", ":"), sort_keys=True, ensure_ascii=False)
    print(kompakt)
    print("imza:", hashlib.sha256(kompakt.encode("utf-8")).hexdigest()[:16])

    print(json.dumps({1: "bir", 2: "iki"}))         # int anahtarlar metne döner!
    try:
        json.dumps({"oran": float("nan")}, allow_nan=False)
    except ValueError as e:
        print("Yakalandı:", e)
''') +

'<div class="tbl-wrap"><table>'
'<tr><th>Parametre</th><th>Nerede</th><th>Ne işe yarar</th></tr>'
'<tr><td><code>ensure_ascii=False</code></td><td>dumps</td><td>Türkçe karakterleri olduğu gibi yazar</td></tr>'
'<tr><td><code>indent=2</code>, <code>sort_keys=True</code></td><td>dumps</td><td>Okunur ve kararlı çıktı (git, imza)</td></tr>'
'<tr><td><code>separators=(",", ":")</code></td><td>dumps</td><td>En küçük çıktı (ağ, önbellek anahtarı)</td></tr>'
'<tr><td><code>allow_nan=False</code></td><td>dumps</td><td>NaN/Infinity yazmaya çalışınca ValueError</td></tr>'
'<tr><td><code>default=fonk</code></td><td>dumps</td><td>Desteklenmeyen tipi çevirir (date, Decimal)</td></tr>'
'<tr><td><code>parse_float=Decimal</code></td><td>loads</td><td>Ondalıkları kayıpsız okur</td></tr>'
'<tr><td><code>object_hook=fonk</code></td><td>loads</td><td>Her sözlüğü dönüştürür (tarih, dataclass)</td></tr>'
'<tr><td><code>delimiter=";"</code>, <code>quotechar</code></td><td>csv</td><td>Türk Excel\'i ve özel biçimler</td></tr>'
'<tr><td><code>quoting=csv.QUOTE_ALL</code></td><td>csv yazma</td><td>Her hücreyi tırnağa alır</td></tr>'
'<tr><td><code>extrasaction="ignore"</code>, <code>restval=""</code></td><td>DictWriter</td><td>Fazla anahtarı atla, eksik alanı doldur</td></tr>'
'<tr><td><code>restkey</code>, <code>restval</code></td><td>DictReader</td><td>Fazla/eksik hücreli satırları yönet</td></tr>'
'</table></div>\n'

'<h3>JSON Lines: satır başına bir kayıt</h3>\n'
'<p>Log ve veri hattı dosyaları genelde <code>.jsonl</code> biçimindedir. Avantajı: dosyanın tamamını belleğe almadan satır satır işlersin ve bozuk tek satır tüm dosyayı çöpe atmaz. Bozuk satırı atlayıp numarasını raporlamak iyi pratiktir.</p>\n'
+ py('''
    import json

    jsonl = """{"no": "S-1", "tutar": 120}
    {"no": "S-2", "tutar": 80}
    {"no": "S-3", "tutar":
    {"no": "S-4", "tutar": 40}
    """
    toplam, bozuk = 0, []
    for no, satir in enumerate(jsonl.splitlines(), start=1):
        if not satir.strip():
            continue
        try:
            toplam += json.loads(satir)["tutar"]
        except json.JSONDecodeError:
            bozuk.append(no)
    print("toplam:", toplam, "bozuk satırlar:", bozuk)

    # Yazmak da kolay: her kayda bir dumps + "\\n"
    print("".join(json.dumps(k, ensure_ascii=False) + "\\n" for k in [{"şehir": "İzmir"}, {"şehir": "Van"}]), end="")
''') +

'<h3>CSV\'nin kenar durumları</h3>\n'
'<p>Gerçek CSV\'ler temiz gelmez: bazı satırlarda hücre eksik, bazılarında fazla; ayırıcı bilinmiyor; sayılar <code>1.250,50</code> biçiminde. <code>csv.Sniffer</code> bir örnekten ayırıcıyı tahmin eder; <code>DictReader</code> eksik hücreye <code>restval</code> (varsayılan None), fazla hücrelere <code>restkey</code> anahtarını verir.</p>\n'
+ py('''
    import csv, io
    from decimal import Decimal

    ham = "no;sube;tutar\\nS-1;Kadıköy;1.250,50\\nS-2;Çankaya\\nS-3;Konak;80,00;FAZLA\\n"

    lehce = csv.Sniffer().sniff(ham.splitlines()[0] + "\\n" + ham.splitlines()[1])
    print("ayırıcı:", repr(lehce.delimiter))

    def tr_sayi(metin):
        return Decimal(metin.replace(".", "").replace(",", "."))

    for k in csv.DictReader(io.StringIO(ham), delimiter=lehce.delimiter, restval="0", restkey="ekstra"):
        print(k["no"], k["sube"], tr_sayi(k["tutar"]), k.get("ekstra"))
''') +
'<div class="warn"><b>Sniffer bir tahmindir</b>Ayırıcıyı bildiğin her durumda açıkça <code>delimiter</code> ver. Sniffer yalnızca kullanıcıların farklı biçimde dosya yüklediği arayüzlerde (ör. "CSV yükle" düğmesi) işe yarar; tahmin başarısız olursa <code>csv.Error</code> fırlatır, onu yakala.</div>\n'

'<h3>DictWriter: fazla ve eksik anahtarlar</h3>\n'
'<p>Kayıt sözlüğünde <code>fieldnames</code>\'te olmayan bir anahtar varsa <code>DictWriter</code> varsayılan olarak <code>ValueError</code> fırlatır. Bu bilinçli bir güvenliktir: yanlışlıkla gizli alanı (ör. parola özeti) dışa aktarmazsın. İstediğin sütunları seçiyorsan <code>extrasaction="ignore"</code>, eksik alanları boş yazmak için <code>restval=""</code> ver.</p>\n'
+ py('''
    import csv, io

    musteriler = [
        {"ad": "Ayşe", "sehir": "İzmir", "parola_ozeti": "a1b2"},
        {"ad": "Can", "telefon": "0555"},
    ]
    c = io.StringIO()
    w = csv.DictWriter(c, fieldnames=["ad", "sehir", "telefon"], extrasaction="ignore", restval="-", quoting=csv.QUOTE_ALL)
    w.writeheader()
    w.writerows(musteriler)
    print(c.getvalue())
''') +
'<div class="tip"><b>Büyük tablo işi pandas\'ta</b>Sütun tipi çıkarımı, eksik değer ve milyonlarca satırlık CSV için <code>pandas.read_csv</code> daha uygundur; bunu <i>pandas-giris</i> dersinde göreceksin. Dosya kodlaması ve atomik yazma için <i>dosya-ileri</i>, ayar dosyaları için <i>yapilandirma</i> dersine bak. <code>csv</code> modülü ise bağımlılıksız, akış hâlinde ve tam kontrollü olduğu için betiklerde hâlâ ilk tercihtir.</div>\n'
'<p>Komut satırında JSON\'u güzelleştirmek için Python yeterli: <code>python -m json.tool siparis.json</code> girintili yazdırır, geçersiz JSON\'da satır ve sütun numarasıyla hata verir. Büyük dosyada <code>--compact</code> ve <code>--sort-keys</code> seçenekleri de vardır.</p>\n'
+ pc('''
    python -m json.tool siparis.json            # girintili göster, geçersizse hata konumu
    python -m json.tool --sort-keys a.json > b.json
    python -m json.tool --json-lines log.jsonl  # her satırı ayrı doğrula
''') +
'<div class="note"><b>Gerçek işte</b>Anadolu Bank\'ın entegrasyon ekibi dış kurumlardan gelen CSV\'leri önce bir "giriş kontrolü" fonksiyonundan geçirir: ayırıcı ve başlık doğru mu, zorunlu sütunlar var mı, tutarlar Decimal\'e çevrilebiliyor mu? Geçemeyen satırlar ayrı bir hata dosyasına satır numarasıyla yazılır, geçenler işlenir. Dışa verilen CSV\'lerde ise formül enjeksiyonuna karşı <code>=</code>, <code>+</code>, <code>-</code>, <code>@</code> ile başlayan hücreler kaçırılır ve JSON çıktılar <code>sort_keys=True</code> ile imzalanır.</div>\n'
)

ex = [
  dict(t='mc', stage='Isınma', q='<code>json.loads(json.dumps({1: "a", 2: "b"}))</code> ifadesinin sonucu nedir?',
       o=['{1: \'a\', 2: \'b\'}', '{\'1\': \'a\', \'2\': \'b\'}', 'TypeError: anahtar int olamaz', '[\'a\', \'b\']'], a=1,
       why='JSON nesnelerinin anahtarları yalnızca metin olabilir. dumps int anahtarları sessizce "1", "2" metnine çevirir; geri okuyunca int değil str anahtar alırsın. Sözlüğü JSON\'dan sonra d[1] ile aramak bu yüzden KeyError verir.'),
  dict(t='mc', stage='Isınma', q='<code>csv.DictWriter(f, fieldnames=["ad", "sehir"])</code> ile yazarken bir kayıtta <code>"parola"</code> anahtarı da varsa varsayılan davranış nedir?',
       o=['parola sütunu otomatik eklenir', 'Fazla anahtar sessizce atlanır', 'ValueError fırlatılır', 'Satır tamamen boş yazılır'], a=2,
       why='extrasaction varsayılanı "raise"\'dır: fieldnames\'te olmayan anahtar ValueError verir. Bu, gizli bir alanın yanlışlıkla dışa aktarılmasını engelleyen bilinçli bir güvenlik önlemidir; atlamak istiyorsan extrasaction="ignore" yazarsın.'),
  dict(t='predict', stage='Kodu oku', q='Bu kod ne yazdırır?',
       code=d('''
           import json
           veri = {"b": 1, "a": [1, 2], "c": None}
           print(json.dumps(veri, separators=(",", ":"), sort_keys=True))
       '''),
       o=['{"a":[1,2],"b":1,"c":null}', '{"b":1,"a":[1,2],"c":null}', '{"a": [1, 2], "b": 1, "c": null}', '{"a":[1,2],"b":1,"c":None}'], a=0,
       why='sort_keys anahtarları alfabetik sıralar, separators=(",", ":") virgül ve iki noktadan sonraki boşlukları kaldırır. None JSON\'da null olarak yazılır.'),
  dict(t='predict', stage='Kodu oku', q='Bu kod ne yazdırır?',
       code=d('''
           import json
           from decimal import Decimal
           d = json.loads('{"a": 0.1, "b": 0.2, "n": 3}', parse_float=Decimal)
           print(d["a"] + d["b"], type(d["n"]).__name__)
       '''),
       o=['0.30000000000000004 int', '0.3 Decimal', '0.3 int', 'TypeError'], a=2,
       why='parse_float yalnızca ondalık noktası olan sayılara uygulanır; 0.1 ve 0.2 Decimal olarak gelir ve toplam tam 0.3 olur. 3 tam sayıdır, parse_int verilmediği için int kalır.'),
  dict(t='predict', stage='Kodu oku', q='Bu kod ne yazdırır?',
       code=d('''
           import csv, io
           ham = "no,sehir,tutar\\nS-1,Ankara\\nS-2,İzmir,50,EK\\n"
           for k in csv.DictReader(io.StringIO(ham)):
               print(k["tutar"], k.get(None))
       '''),
       o=['None None\n50 [\'EK\']', ' None\n50 EK', 'None None\n50 None', 'ValueError'], a=0,
       why='Eksik hücreye restval (varsayılan None) yazılır. Fazla hücreler restkey anahtarı altında liste olarak toplanır; restkey varsayılanı None olduğu için k[None] == ["EK"] olur.'),
  dict(t='order', stage='Kodu oku',
       q='<p>JSON Lines metnindeki geçerli satırların <code>tutar</code> toplamını ve bozuk satır numaralarını döndüren <code>topla(jsonl)</code> fonksiyonunun satırlarını sırala.</p>',
       lines=['import json', 'def topla(jsonl):', '    toplam, bozuk = 0, []', '    for no, satir in enumerate(jsonl.splitlines(), start=1):', '        try:', '            toplam += json.loads(satir)["tutar"]', '        except json.JSONDecodeError:', '            bozuk.append(no)', '    return toplam, bozuk'],
       tests='assert topla(\'{"tutar": 10}\\n{bozuk\\n{"tutar": 5}\') == (15, [2]), "toplam 15, bozuk satır [2] olmalı"\nassert topla("") == (0, []), "boş metin"\n',
       hint='Önce import ve fonksiyon başlığı; sayaçlar döngüden önce; try gövdesi döngünün içinde, except try ile aynı girintide; return en sonda.',
       why='Her satır bağımsız bir JSON belgesidir; bozuk satır yakalanır ve numarası saklanır, diğer satırlar işlenmeye devam eder. JSON Lines\'ın asıl gücü budur.'),
  dict(t='code', stage='Rehberli', id='json-csv-x1', diff=2,
       q='<p>Anadolu Market sipariş loglarını okuyan <code>jsonl_oku(metin)</code> fonksiyonunu yaz. <code>metin</code> JSON Lines biçimindedir. Fonksiyon <code>(kayitlar, hatali)</code> demeti döndürsün: <code>kayitlar</code> geçerli satırlardan çözülen sözlüklerin listesi, <code>hatali</code> çözülemeyen satırların <b>1 tabanlı</b> satır numaraları. Boş ya da yalnızca boşluk içeren satırlar atlanır ve hatalı sayılmaz. Ayrıca bir satır geçerli JSON olsa bile sözlük (nesne) değilse hatalı sayılsın.</p>',
       guide=['İki boş liste oluştur: kayitlar ve hatali.', 'splitlines() üzerinde enumerate(..., start=1) ile dön.', 'strip() sonrası boş satırda continue.', 'json.loads\'u try içine al; JSONDecodeError\'da numarayı hatali\'ya ekle.', 'Çözülen değer dict değilse de hatali\'ya ekle; değilse kayitlar\'a.'],
       example=d('''
           # Benzer teknik: sayı satırlarını oku, bozukları say
           metin = "10\\nabc\\n\\n7"
           sayilar, bozuk = [], []
           for no, s in enumerate(metin.splitlines(), start=1):
               if not s.strip():
                   continue
               try:
                   sayilar.append(int(s))
               except ValueError:
                   bozuk.append(no)
           print(sayilar, bozuk)   # [10, 7] [2]
       '''),
       start=d('''
           import json

           def jsonl_oku(metin):
               kayitlar, hatali = [], []
               for no, satir in enumerate(metin.splitlines(), start=1):
                   # TODO: boş satırı atla
                   # TODO: json.loads ile çöz; hata ya da dict değilse no'yu hatali'ya ekle
                   pass
               return kayitlar, hatali
       '''),
       sol=d('''
           import json

           def jsonl_oku(metin):
               kayitlar, hatali = [], []
               for no, satir in enumerate(metin.splitlines(), start=1):
                   if not satir.strip():
                       continue
                   try:
                       nesne = json.loads(satir)
                   except json.JSONDecodeError:
                       hatali.append(no)
                       continue
                   if isinstance(nesne, dict):
                       kayitlar.append(nesne)
                   else:
                       hatali.append(no)
               return kayitlar, hatali
       '''),
       tests=d('''
           _m = '{"no": "S-1", "tutar": 120}\\n\\n{"no": "S-2"\\n[1, 2]\\n   \\n{"no": "S-3", "tutar": 5}\\n'
           _k, _h = jsonl_oku(_m)
           assert [x["no"] for x in _k] == ["S-1", "S-3"], f"geçerli kayıtlar S-1 ve S-3 olmalı: {_k}"
           assert _h == [3, 4], f"3. satır bozuk, 4. satır liste (nesne değil): {_h}"
           assert jsonl_oku("") == ([], []), "boş metin iki boş liste döndürmeli"
       '''),
       hints=['Her satır ayrı bir json.loads çağrısıdır; hata yakalama döngünün İÇİNDE olmalı.', 'except json.JSONDecodeError: hatali.append(no); continue', 'Çözdükten sonra isinstance(nesne, dict) ile kontrol et.'],
       why='JSON Lines\'ta her satır bağımsızdır; satır bazında try/except tek bozuk satırın tüm dosyayı düşürmesini engeller. "Geçerli JSON ama yanlış şekil" de ayrı bir hata türüdür; şemaya uymayan veriyi erken ayırmak sonraki adımları korur.'),
  dict(t='code', stage='Rehberli', id='json-csv-x2', diff=2,
       q='<p>Muhasebeden gelen Türk Excel CSV\'si noktalı virgülle ayrılmış ve tutarlar <code>1.250,50</code> biçiminde. Önce <code>tr_sayi(metin)</code> yaz: binlik noktaları silip ondalık virgülü noktaya çevirerek <code>Decimal</code> döndürsün (boşlukları da kırp). Sonra <code>sube_toplam(csv_metni)</code> yaz: başlıkları <code>sube;tutar</code> olan CSV\'yi okuyup <code>{sube: Decimal toplam}</code> sözlüğü döndürsün.</p>',
       guide=['tr_sayi: strip, ardından replace(".", "") ve replace(",", ".") sırasıyla.', 'Sonucu Decimal(...) ile oluştur (float\'a hiç çevirme).', 'sube_toplam: csv.DictReader(io.StringIO(metin), delimiter=";").', 'toplamlar.get(sube, Decimal("0")) + tutar kalıbıyla biriktir.'],
       example=d('''
           from decimal import Decimal
           # Benzer teknik: "12,5 %" gibi yüzde metnini Decimal'e çevir
           def yuzde(metin):
               return Decimal(metin.replace("%", "").strip().replace(",", ".")) / 100
           print(yuzde(" 12,5 %"))   # 0.125
       '''),
       start=d('''
           import csv, io
           from decimal import Decimal

           def tr_sayi(metin):
               # TODO: binlik noktayı sil, virgülü noktaya çevir, Decimal döndür
               pass

           def sube_toplam(csv_metni):
               toplamlar = {}
               # TODO: DictReader ile ; ayırıcılı oku ve şube başına topla
               return toplamlar
       '''),
       sol=d('''
           import csv, io
           from decimal import Decimal

           def tr_sayi(metin):
               return Decimal(metin.strip().replace(".", "").replace(",", "."))

           def sube_toplam(csv_metni):
               toplamlar = {}
               for k in csv.DictReader(io.StringIO(csv_metni), delimiter=";"):
                   toplamlar[k["sube"]] = toplamlar.get(k["sube"], Decimal("0")) + tr_sayi(k["tutar"])
               return toplamlar
       '''),
       tests=d('''
           from decimal import Decimal as _D
           assert tr_sayi("1.250,50") == _D("1250.50"), "1.250,50 -> 1250.50 olmalı"
           assert tr_sayi(" 80,00 ") == _D("80.00"), "boşluklar kırpılmalı"
           assert tr_sayi("1.000.000,01") == _D("1000000.01"), "birden çok binlik nokta silinmeli"
           assert isinstance(tr_sayi("5,5"), _D), "Decimal döndürmeli (float değil)"
           _c = "sube;tutar\\nKadıköy;1.250,50\\nÇankaya;80,00\\nKadıköy;9,50\\n"
           assert sube_toplam(_c) == {"Kadıköy": _D("1260.00"), "Çankaya": _D("80.00")}, f"şube toplamları yanlış: {sube_toplam(_c)}"
       '''),
       hints=['Önce noktaları sil, SONRA virgülü noktaya çevir; sıra ters olursa ondalık nokta da silinir.', 'Decimal(metin.strip().replace(".", "").replace(",", "."))', 'Döngüde: toplamlar[s] = toplamlar.get(s, Decimal("0")) + tr_sayi(k["tutar"])'],
       why='Türkçe yerel ayarda nokta binlik, virgül ondalık ayırıcıdır. Önce binlikleri silip sonra virgülü çevirmek doğru sırayı garanti eder; Decimal ise kuruş hassasiyetini korur.'),
  dict(t='code', stage='Rehberli', id='json-csv-x3', diff=2,
       q='<p>Anadolu Bank API yanıtını okuyan <code>yanit_coz(metin)</code> fonksiyonunu yaz. <code>json.loads</code>\'u <code>object_hook</code> ile kullan: adı <code>_tarih</code> ile biten ve değeri metin olan her alan <code>date.fromisoformat</code> ile <code>date</code>\'e çevrilsin. İç içe nesneler de çevrilmeli. Ayrıca ondalıklı sayılar <code>Decimal</code> olsun (<code>parse_float</code>).</p>',
       guide=['Bir yardımcı fonksiyon yaz: sözlük alır, değiştirilmiş sözlüğü DÖNDÜRÜR.', 'Sözlüğün öğelerinde dön; anahtar endswith("_tarih") ve değer str ise çevir.', 'json.loads(metin, object_hook=..., parse_float=Decimal) çağır.', 'object_hook iç nesnelere de otomatik uygulanır; ekstra özyineleme gerekmez.'],
       example=d('''
           import json
           # Benzer teknik: anahtarı "_tl" ile bitenleri kuruşa çevir
           def kurus(n):
               return {k: round(v * 100) if k.endswith("_tl") else v for k, v in n.items()}
           print(json.loads('{"fiyat_tl": 12.5, "ad": "x"}', object_hook=kurus))
       '''),
       start=d('''
           import json
           from datetime import date
           from decimal import Decimal

           def _hook(nesne):
               # TODO: _tarih ile biten metin alanları date'e çevir
               return nesne

           def yanit_coz(metin):
               # TODO: object_hook ve parse_float ver
               return json.loads(metin)
       '''),
       sol=d('''
           import json
           from datetime import date
           from decimal import Decimal

           def _hook(nesne):
               for k, v in nesne.items():
                   if k.endswith("_tarih") and isinstance(v, str):
                       nesne[k] = date.fromisoformat(v)
               return nesne

           def yanit_coz(metin):
               return json.loads(metin, object_hook=_hook, parse_float=Decimal)
       '''),
       tests=d('''
           from datetime import date as _d
           from decimal import Decimal as _D
           _r = yanit_coz('{"hesap": "TR01", "acilis_tarih": "2024-01-31", "islemler": [{"tutar": 10.25, "valor_tarih": "2026-03-15"}], "son_tarih": null}')
           assert _r["acilis_tarih"] == _d(2024, 1, 31), "üst düzey tarih date olmalı"
           assert _r["islemler"][0]["valor_tarih"] == _d(2026, 3, 15), "iç içe nesnedeki tarih de çevrilmeli"
           assert _r["islemler"][0]["tutar"] == _D("10.25") and isinstance(_r["islemler"][0]["tutar"], _D), "tutar Decimal olmalı"
           assert _r["son_tarih"] is None, "null olan tarih alanı None kalmalı (metin değil)"
       '''),
       hints=['object_hook her JSON nesnesi için en içten dışa doğru çağrılır.', 'isinstance(v, str) kontrolü null (None) değerleri korur.', 'return json.loads(metin, object_hook=_hook, parse_float=Decimal)'],
       why='object_hook ayrıştırıcının kendisi tarafından her sözlük için çağrıldığından iç içe yapılar için ayrıca özyinelemeye gerek kalmaz. parse_float ile para alanları float\'a hiç uğramadan Decimal olur.'),
  dict(t='code', stage='Kendin yaz', id='json-csv-x4', diff=2,
       q='<p>CSV enjeksiyonuna karşı korumalı dışa aktarım yaz. <code>guvenli_hucre(deger)</code>: değer metinse ve <code>=</code>, <code>+</code>, <code>-</code>, <code>@</code> karakterlerinden biriyle başlıyorsa başına tek tırnak (<code>\'</code>) eklesin; diğer her şeyi olduğu gibi döndürsün (sayılar dahil, negatif sayılar dokunulmaz). <code>csv_disa_aktar(kayitlar, alanlar)</code>: başlık satırıyla birlikte virgüllü CSV metni döndürsün; her hücre <code>guvenli_hucre</code>\'den geçsin, satır sonu <code>"\\n"</code> olsun.</p>',
       start=d('''
           import csv, io

           def guvenli_hucre(deger):
               pass

           def csv_disa_aktar(kayitlar, alanlar):
               pass
       '''),
       sol=d('''
           import csv, io

           def guvenli_hucre(deger):
               if isinstance(deger, str) and deger[:1] in ("=", "+", "-", "@"):
                   return "'" + deger
               return deger

           def csv_disa_aktar(kayitlar, alanlar):
               c = io.StringIO()
               w = csv.DictWriter(c, fieldnames=alanlar, lineterminator="\\n")
               w.writeheader()
               for k in kayitlar:
                   w.writerow({a: guvenli_hucre(k.get(a, "")) for a in alanlar})
               return c.getvalue()
       '''),
       tests=d('''
           assert guvenli_hucre("=HYPERLINK(1)") == "'=HYPERLINK(1)", "= ile başlayan hücre kaçırılmalı"
           assert guvenli_hucre("@SUM") == "'@SUM" and guvenli_hucre("+90") == "'+90", "@ ve + da kaçırılmalı"
           assert guvenli_hucre(-5) == -5, "sayı olan -5 değişmemeli"
           assert guvenli_hucre("") == "" and guvenli_hucre("Ayşe") == "Ayşe", "normal metin değişmemeli"
           _c = csv_disa_aktar([{"ad": "=1+1", "tutar": -5}, {"ad": "Ali, Veli", "tutar": 3}], ["ad", "tutar"])
           assert _c == "ad,tutar\\n'=1+1,-5\\n\\"Ali, Veli\\",3\\n", f"CSV çıktısı beklenenden farklı: {_c!r}"
       '''),
       hints=['deger[:1] boş metinde de hata vermez; deger[0] verir.', 'csv.DictWriter(..., lineterminator="\\n") satır sonunu sabitler (varsayılan \\r\\n).', 'writerow\'a sözlük comprehension ile temizlenmiş değerleri ver.'],
       why='Excel, = + - @ ile başlayan hücreleri formül olarak yorumlar; tek tırnak öneki onu metin olarak göstermeye zorlar. Yalnızca metinleri kaçırmak sayısal negatif değerleri bozmaz. lineterminator csv modülünün Windows tarzı \\r\\n varsayılanını değiştirir.'),
  dict(t='code', stage='Kendin yaz', id='json-csv-x5', diff=2,
       q='<p>CSV\'den JSON rapor üret. <code>sehir_raporu(csv_metni)</code> fonksiyonu başlıkları <code>no,sehir,tutar</code> olan CSV\'yi okusun ve şu yapıda bir JSON metni döndürsün: <code>{"Ankara": {"adet": 2, "siparisler": ["S-1", "S-4"]}, ...}</code>. Şehirler alfabetik sıralı (<code>sort_keys=True</code>), Türkçe karakterler okunur (<code>ensure_ascii=False</code>), girinti yok, sipariş numaraları CSV\'deki sırayla.</p>',
       start=d('''
           import csv, io, json

           def sehir_raporu(csv_metni):
               pass
       '''),
       sol=d('''
           import csv, io, json

           def sehir_raporu(csv_metni):
               rapor = {}
               for k in csv.DictReader(io.StringIO(csv_metni)):
                   s = rapor.setdefault(k["sehir"], {"adet": 0, "siparisler": []})
                   s["adet"] += 1
                   s["siparisler"].append(k["no"])
               return json.dumps(rapor, ensure_ascii=False, sort_keys=True)
       '''),
       tests=d('''
           import json as _j
           _c = "no,sehir,tutar\\nS-1,İzmir,10\\nS-2,Ankara,5\\nS-3,İzmir,7\\n"
           _r = sehir_raporu(_c)
           assert isinstance(_r, str), "JSON METNİ döndürmeli (sözlük değil)"
           assert "İzmir" in _r, "ensure_ascii=False ile İzmir okunur yazılmalı"
           assert _j.loads(_r) == {"Ankara": {"adet": 1, "siparisler": ["S-2"]}, "İzmir": {"adet": 2, "siparisler": ["S-1", "S-3"]}}, f"içerik yanlış: {_r}"
           assert _r.index("Ankara") < _r.index("İzmir"), "sort_keys=True ile Ankara önce gelmeli"
       '''),
       hints=['setdefault ile her şehir için {"adet": 0, "siparisler": []} başlat.', 'Sonda json.dumps(rapor, ensure_ascii=False, sort_keys=True).'],
       why='setdefault bir anahtarı ilk görüşte başlatıp aynı nesneyi döndürür; sayaç ve listeyi tek satırda günceller. sort_keys iç içe tüm sözlüklere uygulanır, böylece çıktı her çalıştırmada aynıdır.'),
  dict(t='code', stage='Hata avı', kind='bug', id='json-csv-x6', diff=2,
       q='<p>Stajyerin yazdığı <code>disa_aktar(kayitlar)</code> fonksiyonu JSON üretmesi gerekirken karşı sistem <i>"geçersiz JSON"</i> hatası veriyor: bazı kayıtlarda <code>None</code> ve <code>True</code> var. <b>Hatayı bul ve düzelt.</b> Çıktı geçerli JSON olmalı ve Türkçe karakterler okunur kalmalı.</p>',
       start=d('''
           def disa_aktar(kayitlar):
               return str(kayitlar).replace("'", '"')
       '''),
       sol=d('''
           import json

           def disa_aktar(kayitlar):
               return json.dumps(kayitlar, ensure_ascii=False)
       '''),
       tests=d('''
           import json as _j
           _k = [{"musteri": "Ayşe", "kupon": None, "odendi": True}, {"musteri": "O'Brien", "kupon": "YAZ10", "odendi": False}]
           _m = disa_aktar(_k)
           assert _j.loads(_m) == _k, "çıktı json.loads ile aynı veriye dönmeli (None->null, True->true)"
           assert "Ayşe" in _m, "Türkçe karakterler okunur kalmalı"
       '''),
       hints=['str() Python sözdizimi üretir: None, True, tek tırnak. JSON değildir.', 'Tırnak değiştirmek "O\'Brien" gibi değerleri de bozar.', 'json.dumps(kayitlar, ensure_ascii=False) kullan.'],
       why='Python\'un repr çıktısı JSON\'a benzer ama aynı değildir: None/True/False, tek tırnak ve kaçış kuralları farklıdır. Metin değiştirme hileleri kenar durumlarda mutlaka bozulur; serileştirmeyi her zaman json modülüne bırak.'),
  dict(t='code', stage='Hata avı', kind='bug', id='json-csv-x7', diff=2,
       q='<p>İK\'nın personel dışa aktarımı çöküyor: <code>ValueError: dict contains fields not in fieldnames</code>. Ayrıca çıktı dosyasında başlık satırı yok. <code>personel_csv(personeller)</code> yalnızca <code>ad</code>, <code>departman</code> sütunlarını yazmalı (maaş gibi diğer alanlar dışarı çıkmamalı), eksik departman boş kalmalı. <b>Hataları bul ve düzelt.</b></p>',
       start=d('''
           import csv, io

           def personel_csv(personeller):
               c = io.StringIO()
               w = csv.DictWriter(c, fieldnames=["ad", "departman"], lineterminator="\\n")
               w.writerows(personeller)
               return c.getvalue()
       '''),
       sol=d('''
           import csv, io

           def personel_csv(personeller):
               c = io.StringIO()
               w = csv.DictWriter(c, fieldnames=["ad", "departman"], lineterminator="\\n",
                                  extrasaction="ignore", restval="")
               w.writeheader()
               w.writerows(personeller)
               return c.getvalue()
       '''),
       tests=d('''
           _p = [{"ad": "Ayşe", "departman": "Finans", "maas": 50000}, {"ad": "Can", "maas": 40000}]
           _c = personel_csv(_p)
           assert _c.startswith("ad,departman\\n"), "ilk satır başlık olmalı (writeheader)"
           assert "50000" not in _c and "maas" not in _c, "maaş dışa aktarılmamalı"
           assert _c == "ad,departman\\nAyşe,Finans\\nCan,\\n", f"beklenmeyen çıktı: {_c!r}"
       '''),
       hints=['İki ayrı sorun var: biri hata, biri eksik satır.', 'extrasaction="ignore" fazla anahtarları atlar; restval eksikleri doldurur (varsayılan zaten "").', 'writerows\'tan önce w.writeheader() çağır.'],
       why='DictWriter başlığı kendiliğinden yazmaz; writeheader açıkça çağrılmalı. fieldnames dışındaki anahtarlar varsayılan olarak ValueError verir; "yalnız şu sütunlar" istiyorsan extrasaction="ignore" bilinçli bir seçimdir.'),
  dict(t='code', stage='Meydan okuma', id='json-csv-x8', diff=3,
       q='<p>Düzleştirmenin tersini yaz: <code>geri_ac(duz)</code>, <code>{"musteri.ad": "Ayşe", "musteri.adres.sehir": "İzmir", "no": "S-1"}</code> gibi noktalı anahtarlı sözlüğü iç içe sözlüğe çevirsin: <code>{"musteri": {"ad": "Ayşe", "adres": {"sehir": "İzmir"}}, "no": "S-1"}</code>. Çakışma varsa (ör. hem <code>"a": 1</code> hem <code>"a.b": 2</code>; sıra fark etmeksizin) <code>ValueError</code> fırlatsın. Giriş sözlüğü değişmemeli.</p>',
       start=d('''
           def geri_ac(duz):
               sonuc = {}
               return sonuc
       '''),
       sol=d('''
           def geri_ac(duz):
               sonuc = {}
               for anahtar, deger in duz.items():
                   *yol, son = anahtar.split(".")
                   d = sonuc
                   for parca in yol:
                       d = d.setdefault(parca, {})
                       if not isinstance(d, dict):
                           raise ValueError(f"çakışma: {anahtar}")
                   if son in d:
                       raise ValueError(f"çakışma: {anahtar}")
                   d[son] = deger
               return sonuc
       '''),
       tests=d('''
           _g = {"musteri.ad": "Ayşe", "musteri.adres.sehir": "İzmir", "no": "S-1"}
           _kopya = dict(_g)
           assert geri_ac(_g) == {"musteri": {"ad": "Ayşe", "adres": {"sehir": "İzmir"}}, "no": "S-1"}, f"yanlış: {geri_ac(_g)}"
           assert _g == _kopya, "giriş sözlüğü değişmemeli"
           assert geri_ac({}) == {}, "boş sözlük boş döner"
           for _bad in ({"a": 1, "a.b": 2}, {"a.b": 2, "a": 1}, {"a.b": 1, "a.b.c": 2}):
               try:
                   geri_ac(_bad)
               except ValueError:
                   pass
               else:
                   raise AssertionError(f"çakışma ValueError vermeli: {_bad}")
       '''),
       hints=['anahtar.split(".") ile yolu çıkar; son parça değerin yazılacağı yerdir.', 'Ara düğümlerde setdefault(parca, {}) kullan; dönen şey dict değilse çakışma var.', 'Son anahtar zaten varsa (ister değer ister sözlük) yine çakışma.'],
       why='Ara düğümü setdefault ile oluşturmak yolu adım adım kurar. İki çakışma yönü var: önce yaprak yazılıp sonra içine girilmeye çalışılması (dict değil) ve önce dal kurulup sonra üzerine yaprak yazılması (son anahtar zaten var). İkisi de veri kaybını önlemek için hata olmalı.'),
]

faq = [
  dict(q='JSON ile pickle arasında ne fark var, hangisini kullanayım?', a='JSON metin tabanlı, dilden bağımsız ve güvenlidir; yalnızca temel tipleri taşır. pickle her Python nesnesini saklar ama yalnızca Python okur ve güvenilmeyen pickle verisini açmak kod çalıştırabilir. Sistemler arası veri alışverişinde her zaman JSON (ya da CSV/Parquet) kullan.'),
  dict(q='orjson, ujson gibi paketler ne zaman gerekir?', a='Saniyede binlerce büyük JSON işleyen API\'lerde standart json modülü darboğaz olabilir; orjson birkaç kat hızlıdır ve datetime, dataclass gibi tipleri doğrudan destekler. Önce ölç (performans dersi), gerçekten JSON darboğazsa geç; orjson.dumps str değil bytes döndürür, buna dikkat et.'),
]
mistakes = [
  dict(bad='d = json.loads(json.dumps({1: "a"}))\nprint(d[1])', good='d = json.loads(json.dumps({1: "a"}))\nprint(d["1"])', why='JSON anahtarları her zaman metindir; int anahtar gidiş-dönüşte str olur ve d[1] KeyError verir.'),
  dict(bad='json.loads(metin)["tutar"]  # para float olur', good='from decimal import Decimal\njson.loads(metin, parse_float=Decimal)["tutar"]', why='Ondalık sayılar varsayılan olarak float\'a çevrilir ve kuruş hataları başlar; parse_float=Decimal metni kayıpsız okur.'),
]

EXT = dict(id='json-csv', min=30, html=html, ex=ex, faq=faq, mistakes=mistakes)
