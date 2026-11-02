(function (W) {
'use strict';
const L = W.PY_LESSONS = W.PY_LESSONS || [];
L.push(
{
    id: 'json-csv', lv: 'orta', mod: 'Standart Kütüphane', min: 30,
    title: 'JSON ve CSV: veri alışverişinin iki ortak dili',
    sum: 'json ile dumps/loads, Türkçe karakter ve tarih gibi özel tipleri yönetir; csv ile reader/DictReader/DictWriter kullanır; iç içe veriyi düz tabloya çevirirsin.',
    goals: [
      'json.dumps/loads ve dump/load ile Python nesnelerini JSON\'a çevirip geri okuyabilirim.',
      'ensure_ascii, indent, sort_keys ve default parametrelerini doğru kullanabilirim.',
      'csv.reader/DictReader ile CSV okuyup DictWriter ile yazabilirim.',
      'io.StringIO ile dosya yazmadan CSV/JSON metinleriyle çalışabilirim.',
      'İç içe JSON verisini düz satırlara (CSV) çevirebilirim.'
    ],
    body: `
<h2>Neden önemli?</h2>
<p>Anadolu Market'in sipariş API'si JSON döner; muhasebe ekibi ise Excel'de açacağı CSV ister. Ilgaz Bank'ın eski sistemi CSV üretir, yeni mikroservisler JSON konuşur. Bir veri analisti ya da geliştirici olarak işinin önemli bir kısmı bu iki biçim arasında güvenle dönüşüm yapmaktır. İkisi de "düz metin" olduğu için basit görünür; ama Türkçe karakter, tarih, ondalık sayı ve iç içe yapılar en çok hatanın çıktığı yerlerdir.</p>

<h2>JSON (JavaScript Object Notation)</h2>
<p>JSON'da altı tip vardır: nesne (object, Python'da dict), dizi (array, list), metin (str), sayı (int/float), boolean (true/false) ve null (None). Demet, küme, tarih ve Decimal gibi tipler JSON'da <b>yoktur</b>; onları sen dönüştürürsün.</p>
<div class="tbl-wrap"><table>
<tr><th>Python</th><th>JSON</th><th>Geri dönüşte</th></tr>
<tr><td>dict</td><td>object { }</td><td>dict</td></tr>
<tr><td>list, tuple</td><td>array [ ]</td><td>list (demet listeye döner!)</td></tr>
<tr><td>str</td><td>string</td><td>str</td></tr>
<tr><td>int, float</td><td>number</td><td>int / float</td></tr>
<tr><td>True / False / None</td><td>true / false / null</td><td>True / False / None</td></tr>
<tr><td>datetime, Decimal, set, dataclass</td><td>desteklenmez</td><td>default= ile çevir</td></tr>
</table></div>

<h3>dumps ve loads</h3>
<p><code>dumps</code> (dump string) nesneyi JSON metnine, <code>loads</code> metni nesneye çevirir. Dosyayla çalışırken <code>dump(obj, f)</code> ve <code>load(f)</code> kullanılır.</p>
<pre class="py">import json

siparis = {
    "no": "S-1001", "musteri": "Ayşe Yılmaz", "sehir": "İzmir",
    "kalemler": [{"urun": "laptop", "adet": 1, "fiyat": 25999.9}, {"urun": "mouse", "adet": 2, "fiyat": 349.0}],
    "odendi": True, "kupon": None,
}
print(json.dumps(siparis))                      # Türkçe harfler \\u ile kaçırıldı
print(json.dumps(siparis, ensure_ascii=False))  # okunur Türkçe
print(json.dumps({"b": 1, "a": 2}, indent=2, sort_keys=True))

geri = json.loads('{"no": "S-1", "tutar": 120.5, "etiketler": ["hızlı", "kargo"], "iptal": null}')
print(geri["tutar"] + 1, geri["iptal"], type(geri["etiketler"]).__name__)</pre>
<div class="tip"><b>ensure_ascii=False</b>Varsayılan <code>ensure_ascii=True</code>, "İzmir"i <code>"\\u0130zmir"</code> yapar. Geçerli JSON'dur ama insan okuyamaz ve dosya büyür. Türkçe veri yazarken hep <code>ensure_ascii=False</code> ve dosyayı <code>encoding="utf-8"</code> ile aç.</div>

<h3>default: desteklenmeyen tipleri çevirmek</h3>
<p><code>json.dumps</code> tanımadığı bir nesneyle karşılaşınca <code>TypeError</code> verir. <code>default=fonksiyon</code> parametresi bu durumda çağrılır; sen tipi JSON'un bildiği bir şeye çevirirsin.</p>
<pre class="py">import json
from datetime import date, datetime
from decimal import Decimal
from dataclasses import dataclass, asdict

@dataclass
class Islem:
    hesap: str
    tutar: Decimal
    tarih: date

def json_uyumlu(o):
    if isinstance(o, (date, datetime)):
        return o.isoformat()
    if isinstance(o, Decimal):
        return str(o)            # para için float'a çevirme, hassasiyet kaybolur
    if isinstance(o, set):
        return sorted(o)
    if hasattr(o, "__dataclass_fields__"):
        return asdict(o)
    raise TypeError(f"JSON'a çevrilemiyor: {type(o).__name__}")

kayit = {"islem": Islem("TR01", Decimal("1250.75"), date(2026, 3, 15)), "etiketler": {"eft", "acil"}}
print(json.dumps(kayit, default=json_uyumlu, ensure_ascii=False, indent=2))

try:
    json.dumps({"t": date.today()})
except TypeError as e:
    print("default olmadan:", e)</pre>

<h3>Okurken hata yakalama</h3>
<pre class="py">import json

ham = ['{"a": 1}', "{'a': 1}", '{"a": 1,}', '']
for h in ham:
    try:
        print(repr(h), "→", json.loads(h))
    except json.JSONDecodeError as e:
        print(repr(h), "→ HATA:", e.msg, "konum", e.pos)</pre>
<div class="warn"><b>JSON Python değildir</b>Tek tırnak, sondaki virgül, yorum satırı ve <code>True</code> (büyük T) JSON'da geçersizdir. Elle JSON yazma; <code>json.dumps</code> ürettirsin.</div>

<h2>CSV (Comma-Separated Values)</h2>
<p>CSV, her satırın bir kayıt ve alanların virgülle (Türkiye'de Excel çoğu zaman noktalı virgülle) ayrıldığı düz metindir. <code>"İstanbul, Avrupa"</code> gibi virgül içeren değer tırnak içine alınır; bu yüzden <code>split(",")</code> ile ayrıştırmak <b>yanlıştır</b>, <code>csv</code> modülü tırnak kurallarını bilir.</p>
<p>Derste dosya yerine <code>io.StringIO</code> kullanıyoruz: bellekte bir "dosya gibi" nesne. Gerçek dosyada tek fark <code>open("x.csv", newline="", encoding="utf-8")</code> yazmaktır.</p>
<pre class="py">import csv, io

ham = """no,musteri,sehir,tutar
S-1,Ayşe Yılmaz,İzmir,1250.50
S-2,"Mehmet, Ali",Ankara,80
S-3,Zeynep Kaya,"İstanbul, Avrupa",349.90
"""
# reader: liste listesi
for satir in csv.reader(io.StringIO(ham)):
    print(satir)

# DictReader: başlıkları anahtar yapar
toplam = 0.0
for kayit in csv.DictReader(io.StringIO(ham)):
    toplam += float(kayit["tutar"])    # CSV'de her şey metindir!
    print(kayit["musteri"], "-", kayit["sehir"])
print("Toplam:", round(toplam, 2))

print("Yanlış yol:", 'S-2,"Mehmet, Ali",Ankara,80'.split(","))</pre>

<h3>Yazma: writer ve DictWriter</h3>
<pre class="py">import csv, io

kayitlar = [
    {"hesap": "TR01", "tutar": 1250.5, "aciklama": "Kira, Mart"},
    {"hesap": "TR02", "tutar": -80, "aciklama": "Kart ödemesi"},
]
cikti = io.StringIO()
yazici = csv.DictWriter(cikti, fieldnames=["hesap", "tutar", "aciklama"], delimiter=";")
yazici.writeheader()
yazici.writerows(kayitlar)
print(cikti.getvalue())

# Noktalı virgüllü Türkçe Excel CSV'sini geri okuma
for k in csv.DictReader(io.StringIO(cikti.getvalue()), delimiter=";"):
    print(k)

# Satır listesi için writer
c2 = io.StringIO()
w = csv.writer(c2)
w.writerow(["ad", "not"])
w.writerow(["Ali", 'Dedi ki: "tamam"'])      # tırnak otomatik kaçırılır
print(c2.getvalue())</pre>
<div class="note"><b>newline="" neden?</b>Gerçek dosya açarken <code>open(..., newline="")</code> ver; aksi halde Windows'ta her kayıt arasına boş satır girer. Excel'in Türkçe ayarları için <code>delimiter=";"</code> ve ondalık virgül gerekebilir; dosya başına BOM için <code>encoding="utf-8-sig"</code> kullanılır.</div>

<h2>İç içe veriyi düzleştirme</h2>
<p>JSON doğal olarak iç içedir (sipariş → kalemler → ürün). CSV ise düzdür. Dönüşüm için iki yaygın strateji var: (1) iç sözlükleri <code>"adres.sehir"</code> gibi noktalı anahtarlara aç; (2) listeleri her eleman bir satır olacak şekilde "patlat" (explode). İkisini birlikte gösterelim.</p>
<pre class="py">import csv, io, json

ham = json.loads("""[
  {"no": "S-1", "musteri": {"ad": "Ayşe", "sehir": "İzmir"},
   "kalemler": [{"urun": "laptop", "adet": 1}, {"urun": "mouse", "adet": 2}]},
  {"no": "S-2", "musteri": {"ad": "Ali", "sehir": "Ankara"},
   "kalemler": [{"urun": "çanta", "adet": 1}]}
]""")

def duzlestir(d, onek=""):
    """İç içe sözlüğü noktalı anahtarlarla tek seviyeye indir (listeleri olduğu gibi bırak)."""
    duz = {}
    for k, v in d.items():
        ad = f"{onek}{k}"
        if isinstance(v, dict):
            duz.update(duzlestir(v, ad + "."))
        else:
            duz[ad] = v
    return duz

satirlar = []
for s in ham:
    temel = duzlestir({k: v for k, v in s.items() if k != "kalemler"})
    for kalem in s["kalemler"]:            # her kalem ayrı satır
        satirlar.append({**temel, **kalem})

print(satirlar[0])
cikti = io.StringIO()
w = csv.DictWriter(cikti, fieldnames=list(satirlar[0].keys()))
w.writeheader(); w.writerows(satirlar)
print(cikti.getvalue())</pre>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Büyük dosyalar, şema ve güvenlik</h3>
<p><code>json.load</code> tüm dosyayı belleğe alır; yüz megabaytlık bir dışa aktarımda bu sorun olabilir. Çözüm genellikle <b>JSON Lines</b> (her satırda bir JSON nesnesi, .jsonl) biçimidir: satır satır okur, her satıra <code>json.loads</code> uygularsın; log sistemleri ve veri hatları bu biçimi sever. CSV'de ise <code>csv.reader</code> zaten tembeldir; dosyayı satır satır tüketir.</p>
<p>Şema (schema): CSV'de her alan metindir; "tutar" sütununun sayı olduğunu sen bilirsin. Üretim kodunda okuduğun her satırı bir <code>dataclass</code>'a ya da <code>pydantic</code> modeline geçirip tip dönüşümünü tek yerde yapmak, hataları (boş hücre, "1.250,50" gibi Türk biçimi) erkenden yakalar. Para için <code>float</code> yerine <code>Decimal</code> kullan; JSON'a yazarken <code>str</code> olarak çık.</p>
<p>Güvenlik: <code>json.loads</code> güvenlidir (kod çalıştırmaz) ama <code>pickle</code> ve <code>eval</code> değildir; dış kaynaktan veri alırken asla kullanma. CSV'de "CSV enjeksiyonu" diye bir şey var: <code>=HYPERLINK(...)</code> ile başlayan hücre Excel'de formül olarak çalışır. Kullanıcı girdisini CSV'ye yazarken <code>=</code>, <code>+</code>, <code>-</code>, <code>@</code> ile başlayan hücrelerin önüne tek tırnak koymak yaygın önlemdir. Son olarak, iki sistem arasında veri taşırken <code>sort_keys=True</code> ve sabit <code>indent</code> ile üretilen JSON, git farklarını okunur tutar.</p>
</section>
`,
    ex: [
      { t: 'mc', q: '<code>json.loads(json.dumps((1, 2)))</code> ifadesinin sonucu nedir?',
        o: ['(1, 2)', '[1, 2]', '"(1, 2)"', 'TypeError'], a: 1,
        why: 'JSON\'da demet yoktur; dumps demeti diziye çevirir, loads diziyi liste olarak okur. Hata vermez, sessizce tip değişir.' },
      { t: 'mc', q: 'Türkçe karakterli veriyi insanların okuyacağı JSON dosyasına yazarken hangi parametre gerekir?',
        o: ['indent=4', 'sort_keys=True', 'ensure_ascii=False', 'default=str'], a: 2,
        why: 'ensure_ascii=False Türkçe harfleri \\u kaçışı yerine olduğu gibi yazar. indent biçimlendirir, sort_keys sıralar, default desteklenmeyen tipleri çevirir.' },
      { t: 'code', id: 'json-csv-1',
        q: '<p>Anadolu Market CSV dışa aktarımından toplam ciroyu hesaplayan <code>sehir_cirosu(csv_metni: str) -> dict</code> fonksiyonunu yaz. CSV başlıkları <code>no,sehir,tutar</code>; alanlar virgülle ayrılmış, bazı değerler tırnak içinde olabilir. Şehir bazında tutar toplamını (float, 2 basamağa yuvarlanmış) sözlük olarak döndür. <code>csv.DictReader</code> ve <code>io.StringIO</code> kullan.</p>',
        start: 'import csv, io\n\ndef sehir_cirosu(csv_metni):\n    # buraya yaz\n    pass\n',
        sol: 'import csv, io\n\ndef sehir_cirosu(csv_metni):\n    toplam = {}\n    for k in csv.DictReader(io.StringIO(csv_metni)):\n        toplam[k["sehir"]] = toplam.get(k["sehir"], 0.0) + float(k["tutar"])\n    return {s: round(t, 2) for s, t in toplam.items()}\n',
        tests: 'ham = "no,sehir,tutar\\nS-1,İzmir,100.5\\nS-2,\\"İstanbul, Avrupa\\",50\\nS-3,İzmir,19.5\\n"\nr = sehir_cirosu(ham)\nassert r == {"İzmir": 120.0, "İstanbul, Avrupa": 50.0}, "Şehir ciroları yanlış: " + str(r)\nassert sehir_cirosu("no,sehir,tutar\\n") == {}, "Yalnızca başlık varsa boş sözlük"\n',
        hints: ['csv.DictReader(io.StringIO(metin)) her satırı sözlük olarak verir.', 'CSV değerleri metindir; float(k["tutar"]) ile çevir.'],
        why: 'DictReader tırnaklı alanları doğru ayrıştırır; dict.get ile toplama yapılır; sonunda yuvarlanır.' },
      { t: 'code', id: 'json-csv-2',
        q: '<p>Ilgaz Bank işlem kayıtlarını JSON\'a çeviren <code>islem_json(islemler: list[dict]) -> str</code> fonksiyonunu yaz. Her işlem sözlüğünde <code>tarih</code> alanı <code>datetime.date</code>, <code>tutar</code> alanı <code>Decimal</code> olabilir. Tarihi ISO metnine, Decimal\'i <code>str</code>\'ye çeviren bir <code>default</code> fonksiyonu kullan; çıktıda Türkçe karakterler kaçırılmasın (<code>ensure_ascii=False</code>) ve anahtarlar sıralı olsun (<code>sort_keys=True</code>). Girinti kullanma.</p>',
        start: 'import json\nfrom datetime import date\nfrom decimal import Decimal\n\ndef islem_json(islemler):\n    # buraya yaz\n    pass\n',
        sol: 'import json\nfrom datetime import date\nfrom decimal import Decimal\n\ndef _cevir(o):\n    if isinstance(o, date):\n        return o.isoformat()\n    if isinstance(o, Decimal):\n        return str(o)\n    raise TypeError(type(o).__name__)\n\ndef islem_json(islemler):\n    return json.dumps(islemler, default=_cevir, ensure_ascii=False, sort_keys=True)\n',
        tests: 'from datetime import date\nfrom decimal import Decimal\nimport json\ns = islem_json([{"tutar": Decimal("1250.75"), "hesap": "TR01", "aciklama": "Kira Şubat", "tarih": date(2026, 2, 1)}])\nassert s == \'[{"aciklama": "Kira Şubat", "hesap": "TR01", "tarih": "2026-02-01", "tutar": "1250.75"}]\', "JSON metni beklenenden farklı: " + s\nassert "\\\\u015e" not in s, "Türkçe karakter kaçırılmamalı (ensure_ascii=False)"\nassert json.loads(islem_json([])) == [], "Boş liste için [] dönmeli"\n',
        hints: ['default parametresine isinstance ile tip ayıran bir fonksiyon ver.', 'json.dumps(..., default=f, ensure_ascii=False, sort_keys=True).'],
        why: 'default fonksiyonu yalnızca JSON\'un tanımadığı tiplerde çağrılır; sort_keys deterministik çıktı, ensure_ascii=False okunur Türkçe sağlar.' },
      { t: 'code', id: 'json-csv-3',
        q: '<p>Muhasebe için CSV üreten <code>csv_uret(kayitlar: list[dict], alanlar: list[str]) -> str</code> fonksiyonunu yaz. <code>csv.DictWriter</code> ile noktalı virgül (<code>;</code>) ayırıcılı, başlık satırlı CSV metni döndür. Satır sonu olarak <code>"\\n"</code> kullan (<code>lineterminator="\\n"</code>). Kayıtlarda <code>alanlar</code> dışındaki anahtarlar yok sayılsın (<code>extrasaction="ignore"</code>).</p>',
        start: 'import csv, io\n\ndef csv_uret(kayitlar, alanlar):\n    # buraya yaz\n    pass\n',
        sol: 'import csv, io\n\ndef csv_uret(kayitlar, alanlar):\n    cikti = io.StringIO()\n    w = csv.DictWriter(cikti, fieldnames=alanlar, delimiter=";", lineterminator="\\n", extrasaction="ignore")\n    w.writeheader()\n    w.writerows(kayitlar)\n    return cikti.getvalue()\n',
        tests: 'r = csv_uret([{"hesap": "TR01", "tutar": 100, "gizli": 1}, {"hesap": "TR02", "tutar": "a;b"}], ["hesap", "tutar"])\nassert r == \'hesap;tutar\\nTR01;100\\nTR02;"a;b"\\n\', "CSV çıktısı beklenenden farklı: " + repr(r)\nassert csv_uret([], ["x"]) == "x\\n", "Kayıt yoksa yalnızca başlık"\n',
        hints: ['io.StringIO() üzerine DictWriter kur, writeheader ve writerows çağır.', 'delimiter=";", lineterminator="\\n", extrasaction="ignore" parametrelerini unutma.'],
        why: 'DictWriter başlığı ve satırları tırnak kurallarına uygun yazar; ayırıcı içeren değer otomatik tırnaklanır.' },
      { t: 'code', id: 'json-csv-4',
        q: '<p>İç içe sözlüğü düzleştiren <code>duzlestir(d: dict, onek: str = "") -> dict</code> fonksiyonunu yaz. İç sözlüklerin anahtarları noktayla birleşsin: <code>{"a": {"b": 1, "c": {"d": 2}}, "e": 3}</code> → <code>{"a.b": 1, "a.c.d": 2, "e": 3}</code>. Listeler ve diğer değerler olduğu gibi kalsın. Özyineleme (recursion) kullan.</p>',
        start: 'def duzlestir(d, onek=""):\n    # buraya yaz\n    pass\n',
        sol: 'def duzlestir(d, onek=""):\n    duz = {}\n    for k, v in d.items():\n        ad = f"{onek}{k}"\n        if isinstance(v, dict):\n            duz.update(duzlestir(v, ad + "."))\n        else:\n            duz[ad] = v\n    return duz\n',
        tests: 'assert duzlestir({"a": {"b": 1, "c": {"d": 2}}, "e": 3}) == {"a.b": 1, "a.c.d": 2, "e": 3}, "Düzleştirme yanlış"\nassert duzlestir({"musteri": {"ad": "Ayşe", "etiket": [1, 2]}}) == {"musteri.ad": "Ayşe", "musteri.etiket": [1, 2]}, "Listeler olduğu gibi kalmalı"\nassert duzlestir({}) == {}, "Boş sözlük boş dönmeli"\nassert duzlestir({"a": {}}) == {}, "Boş iç sözlük hiç anahtar üretmemeli"\n',
        hints: ['Her değer için isinstance(v, dict) kontrol et.', 'İç sözlük için duzlestir(v, ad + ".") sonucunu update ile birleştir.'],
        why: 'Özyineleme iç sözlükleri açar; onek parametresi yolu taşır; dict olmayan değerler olduğu gibi yazılır.' },
      { t: 'code', id: 'json-csv-5',
        q: '<p>Güvenli JSON okuma: <code>guvenli_yukle(metin: str, varsayilan=None)</code> fonksiyonu metni <code>json.loads</code> ile çözsün; metin geçersiz JSON ise (<code>json.JSONDecodeError</code>) ya da sonuç bir <code>dict</code> değilse <code>varsayilan</code> değerini döndürsün.</p>',
        start: 'import json\n\ndef guvenli_yukle(metin, varsayilan=None):\n    # buraya yaz\n    pass\n',
        sol: 'import json\n\ndef guvenli_yukle(metin, varsayilan=None):\n    try:\n        veri = json.loads(metin)\n    except json.JSONDecodeError:\n        return varsayilan\n    return veri if isinstance(veri, dict) else varsayilan\n',
        tests: 'assert guvenli_yukle(\'{"a": 1}\') == {"a": 1}, "Geçerli sözlük döndürülmeli"\nassert guvenli_yukle("{\'a\': 1}") is None, "Tek tırnaklı JSON geçersiz, None dönmeli"\nassert guvenli_yukle("[1, 2]", {}) == {}, "Liste dict değil, varsayılan dönmeli"\nassert guvenli_yukle("", {"bos": True}) == {"bos": True}, "Boş metin için varsayılan"\n',
        hints: ['json.JSONDecodeError yakala (ValueError alt sınıfıdır).', 'Sonucu isinstance(veri, dict) ile kontrol et.'],
        why: 'try/except çözümleme hatasını, isinstance tip kontrolünü ele alır; her iki durumda da güvenli varsayılan döner.' }
    ],
    faq: [
      { q: 'json.dump ile json.dumps farkı ne?', a: 'dumps metin (string) döndürür; dump doğrudan açık bir dosya nesnesine yazar. load/loads için de aynı ilişki geçerlidir.' },
      { q: 'CSV okurken sayılar neden metin geliyor?', a: 'CSV\'nin tip bilgisi yoktur; her hücre metindir. int()/float()/Decimal() ile kendin çevirirsin. Türk biçimli "1.250,50" için önce noktayı sil, virgülü noktaya çevir.' },
      { q: 'Neden split(",") yerine csv modülü?', a: 'Tırnak içindeki virgüller, kaçırılmış tırnaklar ve çok satırlı hücreler split ile bozulur; csv modülü RFC 4180 kurallarını uygular.' },
      { q: 'Excel CSV\'mi Türkçe karakterleri bozuk açıyor.', a: 'Dosyayı encoding="utf-8-sig" ile yaz; başa eklenen BOM Excel\'e UTF-8 olduğunu söyler. Ayrıca Türkçe Excel noktalı virgül ayırıcı bekler.' }
    ],
    mistakes: [
      { bad: 'json.loads("{\'ad\': \'Ali\'}")', good: 'json.loads(\'{"ad": "Ali"}\')', why: 'JSON yalnızca çift tırnak kabul eder; tek tırnak JSONDecodeError verir.' },
      { bad: 'satir.split(",")', good: 'next(csv.reader([satir]))', why: 'Tırnak içindeki virgüller split ile yanlış bölünür; csv modülü tırnakları anlar.' },
      { bad: 'json.dumps({"t": date.today()})', good: 'json.dumps({"t": date.today()}, default=str)', why: 'date JSON\'da yoktur; default ile çevirmezsen TypeError alırsın.' },
      { bad: 'open("rapor.csv", "w")', good: 'open("rapor.csv", "w", newline="", encoding="utf-8")', why: 'newline="" olmadan Windows\'ta boş satırlar oluşur; encoding belirtilmezse Türkçe karakter bozulabilir.' }
    ]
  }
);
})(window);
