/* Kesit Python — standart-kutuphane uzantısı (Derinleş) */
(function (W) {
'use strict';
const X = W.PY_EXT = W.PY_EXT || [];
X.push({
  id: 'standart-kutuphane',
  min: 30,
  html: `<h2>Derinleş: Standart kütüphanenin "gizli kahramanları"</h2>
<p>İlk turda dosya sistemi, argparse, Decimal ve hashlib gibi büyük modülleri gördün. Ama iş yerinde en çok zaman kazandıran modüller çoğu zaman daha küçükler: sıralama anahtarını tek satırda veren <code>operator</code>, pahalı hesabı önbelleğe alan <code>functools.lru_cache</code>, eşik tablosunda arama yapan <code>bisect</code>, kopyalama tuzağını çözen <code>copy</code>, yazım hatasını düzelten <code>difflib</code>. PCAP sınavında ve mülakatlarda da sıkça çıkarlar. (collections ve itertools için ayrı bir ders var; tarih için <i>tarih-saat</i>, regex için <i>regex</i> dersine bak.)</p>
<div class="tbl-wrap"><table><tr><th>İhtiyaç</th><th>Modül</th><th>Anahtar araç</th></tr><tr><td>Sözlük/nesne listesini alana göre sırala</td><td>operator</td><td>itemgetter, attrgetter</td></tr><tr><td>Aynı girdiyle tekrar tekrar çağrılan pahalı hesap</td><td>functools</td><td>lru_cache, cache, cached_property</td></tr><tr><td>Eşik/kademe tablosu (kargo, vergi dilimi)</td><td>bisect</td><td>bisect_right, bisect_left, insort</td></tr><tr><td>İç içe veriyi bağımsız kopyala</td><td>copy</td><td>copy, deepcopy</td></tr><tr><td>Benzer metni bul, iki metni karşılaştır</td><td>difflib</td><td>get_close_matches, unified_diff</td></tr><tr><td>Basit ve güvenli metin şablonu</td><td>string</td><td>Template, safe_substitute</td></tr><tr><td>Benzersiz kimlik, ikili veriyi metne çevirme, sıkıştırma</td><td>uuid, base64, zlib, gzip</td><td>uuid4, b64encode, compress</td></tr><tr><td>Okunur döküm, hatayı bilinçli yutma</td><td>pprint, contextlib</td><td>pprint, suppress</td></tr><tr><td>Dış komut çalıştırma</td><td>subprocess, shlex</td><td>run, split, quote</td></tr></table></div>
<h3>operator ve functools: kısa ve hızlı fonksiyonlar</h3>
<p><code>itemgetter("sehir", "tutar")</code>, <code>lambda s: (s["sehir"], s["tutar"])</code> ile aynı işi yapar ama daha okunur ve biraz daha hızlıdır. <code>lru_cache</code> ise bir fonksiyonun sonuçlarını argümanlara göre saklar; aynı argümanla ikinci çağrı hesap yapmadan döner. Yalnızca <b>saf</b> (pure) fonksiyonlarda kullan: sonucu saate, veritabanına ya da dış duruma bağlı fonksiyonu önbelleğe almak bayat veri döndürür. Argümanlar hashlenebilir olmalıdır (liste değil, demet).</p>
<pre class="py">from operator import itemgetter, attrgetter
from functools import lru_cache
from dataclasses import dataclass

siparisler = [
    {"no": "S-3", "sehir": "İzmir", "tutar": 80},
    {"no": "S-1", "sehir": "Ankara", "tutar": 120},
    {"no": "S-2", "sehir": "Ankara", "tutar": 45},
]
for s in sorted(siparisler, key=itemgetter("sehir", "tutar")):
    print(s["no"], s["sehir"], s["tutar"])

@dataclass
class Musteri:
    ad: str
    puan: int
print([m.ad for m in sorted([Musteri("Can", 3), Musteri("Ayşe", 9)], key=attrgetter("puan"), reverse=True)])

@lru_cache(maxsize=128)
def taksit_tablosu(tutar_kurus: int, ay: int) -&gt; tuple:
    print("  hesaplanıyor:", tutar_kurus, ay)
    taksit = tutar_kurus // ay
    return tuple([taksit] * (ay - 1) + [tutar_kurus - taksit * (ay - 1)])

taksit_tablosu(100000, 3)
print(taksit_tablosu(100000, 3))      # ikinci çağrı önbellekten
print(taksit_tablosu.cache_info())</pre>
<div class="tip"><b>cache ve cached_property</b>Python 3.9+ <code>@functools.cache</code> sınırsız <code>lru_cache</code>'tir. Sınıflarda bir kez hesaplanıp saklanacak özellik için <code>@functools.cached_property</code> kullan (ör. raporun toplamı). Önbelleği boşaltmak için <code>fonk.cache_clear()</code>.</div>
<h3>bisect: kademeli tablolarda arama</h3>
<p>Kargo ücreti desiye, indirim sepet tutarına, vergi dilimi gelire göre değişir. Uzun bir if/elif zinciri yerine sıralı sınır listesi ve <code>bisect</code> kullanırsın: O(log n) arama yapar ve tablo değişince yalnızca listeyi güncellersin. <code>bisect_right</code> eşit değeri sağdaki dilime, <code>bisect_left</code> soldakine koyar; "1000 TL <b>ve üzeri</b>" gibi kurallarda fark burada çıkar.</p>
<pre class="py">from bisect import bisect_right, bisect_left, insort

sinirlar = [500, 1000, 2500]          # TL
oranlar = [0, 5, 10, 15]              # yüzde
for sepet in (499, 500, 999, 1000, 3000):
    print(sepet, "TL -&gt; %", oranlar[bisect_right(sinirlar, sepet)])

print("bisect_left(1000):", bisect_left(sinirlar, 1000), "| bisect_right(1000):", bisect_right(sinirlar, 1000))

kuyruk = [10, 30, 50]
insort(kuyruk, 35)                    # sıralı listeye sırayı bozmadan ekle
print(kuyruk)</pre>
<h3>copy: yüzeysel ve derin kopya</h3>
<p><code>copy.copy</code> (ya da <code>list.copy()</code>, <code>dict.copy()</code>) yalnızca dış kabı kopyalar; içteki liste ve sözlükler <b>paylaşılır</b>. Şablon bir sepetten yeni sepet üretirken bu, bir müşterinin ürününün diğerinin sepetine düşmesi demektir. <code>copy.deepcopy</code> her seviyeyi kopyalar.</p>
<pre class="py">import copy

sablon = {"musteri": None, "kalemler": [], "kargo": {"firma": "Anadolu Kargo"}}
s1 = copy.copy(sablon)
s1["kalemler"].append("laptop")
print("yüzeysel kopya sonrası şablon:", sablon["kalemler"])

sablon["kalemler"].clear()
s2 = copy.deepcopy(sablon)
s2["kalemler"].append("mouse")
s2["kargo"]["firma"] = "Hızlı Kargo"
print("derin kopya sonrası şablon:", sablon)</pre>
<h3>difflib, string.Template, uuid, base64, zlib</h3>
<p>Müşteri formuna "Ankra" yazdı; <code>difflib.get_close_matches</code> en yakın şehri önerir. <code>string.Template</code> kullanıcıların düzenleyebileceği e-posta şablonları için f-string'ten güvenlidir: şablon metni kod çalıştıramaz, yalnızca <code>$ad</code> gibi yer tutucuları doldurur. <code>uuid4</code> tahmin edilemeyen benzersiz kimlik üretir; <code>zlib</code> + <code>base64</code> ise ikili veriyi sıkıştırıp JSON'a ya da URL'ye konabilecek metne çevirir.</p>
<pre class="py">import difflib, uuid, base64, zlib
from string import Template

sehirler = ["Ankara", "Antalya", "Adana", "İzmir", "İstanbul"]
print(difflib.get_close_matches("Ankra", sehirler, n=1))
print(difflib.get_close_matches("Istanbul", sehirler, n=1, cutoff=0.6))

t = Template("Sayın $ad, $no numaralı siparişiniz $gun gün içinde teslim edilecek.")
print(t.substitute(ad="Ayşe Yılmaz", no="S-1001", gun=3))
print(t.safe_substitute(ad="Can"))     # eksik alanı olduğu gibi bırakır

kimlik = uuid.uuid4()
print("uuid uzunluğu:", len(str(kimlik)), "| sürüm:", kimlik.version)

rapor = ("Ankara;120\\n" * 200).encode("utf-8")
paket = base64.b64encode(zlib.compress(rapor)).decode("ascii")
print(len(rapor), "bayt -&gt;", len(paket), "karakter")
print(zlib.decompress(base64.b64decode(paket)) == rapor)

eski = ["Ankara;120", "İzmir;80"]
yeni = ["Ankara;125", "İzmir;80"]
print("\\n".join(difflib.unified_diff(eski, yeni, "dun.csv", "bugun.csv", lineterm="")))</pre>
<div class="warn"><b>base64 şifreleme değildir</b>base64 yalnızca bir kodlamadır; herkes geri çözer. Gizli veriyi korumak için şifreleme (ör. <code>cryptography</code> paketi) gerekir. Benzer şekilde <code>uuid1</code> makinenin MAC adresini ve zamanı içerir; dışarıya açık kimliklerde <code>uuid4</code> kullan.</div>
<h3>subprocess ve shlex: dış komut çalıştırmak</h3>
<p>Betikten <code>git</code>, <code>pg_dump</code> ya da başka bir program çalıştırman gerekir. <code>subprocess.run</code> doğru araçtır; tarayıcıda alt süreç açılamadığı için aşağıdaki kodu kendi bilgisayarında dene. Komutu her zaman <b>liste</b> olarak ver; <code>shell=True</code> ile kullanıcı girdisi birleştirmek komut enjeksiyonuna kapı açar.</p>
<pre class="code">import subprocess, shlex

sonuc = subprocess.run(["git", "log", "-1", "--format=%h %s"],
                       capture_output=True, text=True, check=True, timeout=10)
print(sonuc.stdout.strip())

print(shlex.split('rapor.py --sehir "Kahramanmaraş Merkez" --limit 5'))
print(shlex.quote("dosya adı; rm -rf /"))   # kabuğa güvenli metin</pre>
<p>Kendi bilgisayarında dene: <code>check=True</code> sıfır dışı çıkış kodunda <code>CalledProcessError</code> fırlatır, <code>timeout</code> asılı kalan komutu keser. Komut bulunamazsa <code>FileNotFoundError</code> alırsın; çoğu zaman program PATH'te değildir.</p>
<div class="note"><b>Gerçek işte</b>Anadolu Market'in gece çalışan rapor betiği tamamen standart kütüphaneyle yazılmıştır: <code>argparse</code> ile tarih alır, <code>subprocess</code> ile veritabanı yedeği tetikler, <code>bisect</code> ile kargo kademesini hesaplar, <code>lru_cache</code> ile döviz kurunu tek sefer çeker, sonucu <code>gzip</code> ile sıkıştırıp <code>uuid4</code> adlı dosyaya yazar. Sunucuya hiç paket kurmadan çalıştığı için güvenlik ekibinin onayı da çabuk alınmıştır. İlk soru hep şudur: "Bu iş için standart kütüphanede bir şey var mı?"</div>
`,
  ex: [
    {
      t: 'mc',
      stage: 'Isınma',
      q: 'Aşağıdaki fonksiyonlardan hangisine <code>@lru_cache</code> eklemek <b>hatalı</b> olur?',
      o: ['kdv(tutar_kurus, oran) — yalnız argümanlara bağlı', 'fibonacci(n) — özyinelemeli saf hesap', 'guncel_bakiye(hesap_no) — veritabanından okur', 'sehir_kodu(sehir_adi) — sabit sözlükten okur'],
      a: 2,
      why: 'lru_cache sonucu argümana göre saklar. guncel_bakiye aynı argümanla farklı zamanlarda farklı sonuç vermelidir; önbelleğe alınırsa bayat bakiye döner. Diğerleri saf fonksiyonlardır: aynı girdi her zaman aynı çıktı.'
    },
    {
      t: 'predict',
      stage: 'Kodu oku',
      q: 'Bu kod ne yazdırır?',
      code: 'from bisect import bisect_right\nsinirlar = [50, 70, 85]\nharfler = "FCBA"\nprint([harfler[bisect_right(sinirlar, p)] for p in (49, 50, 84, 85, 100)])\n',
      o: ['[\'F\', \'C\', \'B\', \'A\', \'A\']', '[\'F\', \'F\', \'C\', \'B\', \'A\']', '[\'F\', \'C\', \'B\', \'B\', \'A\']', 'IndexError'],
      a: 0,
      why: 'bisect_right eşit değeri sağdaki dilime yerleştirir: 50 → indeks 1 (C), 85 → indeks 3 (A). 100 de 3\'tür; harfler 4 elemanlı olduğu için IndexError olmaz.'
    },
    {
      t: 'predict',
      stage: 'Kodu oku',
      q: 'Bu kod ne yazdırır?',
      code: 'import copy\na = [[1], [2]]\nb = copy.copy(a)\nb[0].append(9)\nb.append([3])\nprint(a, len(b))\n',
      o: ['[[1], [2]] 3', '[[1, 9], [2], [3]] 3', '[[1, 9], [2]] 3', '[[1, 9], [2]] 2'],
      a: 2,
      why: 'Yüzeysel kopyada dış liste yenidir (b.append a\'yı etkilemez) ama iç listeler paylaşılır; b[0].append(9) a[0]\'ı da değiştirir.'
    },
    {
      t: 'predict',
      stage: 'Kodu oku',
      q: 'Bu kod ne yazdırır?',
      code: 'from string import Template\nt = Template("$ad: $tutar TL")\nprint(t.safe_substitute(ad="Ayşe"))\n',
      o: ['Ayşe:  TL', 'KeyError: \'tutar\'', 'Ayşe: $tutar TL', 'Ayşe: None TL'],
      a: 2,
      why: 'safe_substitute eksik yer tutucuyu hata vermeden olduğu gibi bırakır. substitute kullanılsaydı KeyError fırlatırdı.'
    },
    {
      t: 'order',
      stage: 'Kodu oku',
      q: '<p>Siparişleri önce şehre, sonra tutara göre sıralayıp numaralarını döndüren <code>sirala</code> fonksiyonunun satırlarını sırala.</p>',
      lines: ['from operator import itemgetter', 'def sirala(siparisler):', '    anahtar = itemgetter("sehir", "tutar")', '    sirali = sorted(siparisler, key=anahtar)', '    return [s["no"] for s in sirali]'],
      tests: 'assert sirala([{"no": 1, "sehir": "Van", "tutar": 5}, {"no": 2, "sehir": "Bursa", "tutar": 9}, {"no": 3, "sehir": "Bursa", "tutar": 4}]) == [3, 2, 1], "önce şehir, sonra tutar"\n',
      hint: 'Önce import ve fonksiyon başlığı; anahtar olmadan sıralama, sıralama olmadan sonuç olmaz.',
      why: 'itemgetter birden çok alanla demet döndürür; sorted önce şehre (Bursa &lt; Van), eşitlikte tutara bakar.'
    },
    {
      t: 'code',
      stage: 'Rehberli',
      id: 'standart-kutuphane-x1',
      diff: 2,
      q: '<p>Anadolu Kargo ücret tablosu: desi <b>1\'e kadar (1 dahil)</b> 30 TL, <b>5\'e kadar</b> 45 TL, <b>10\'a kadar</b> 60 TL, <b>20\'ye kadar</b> 90 TL, 20\'den fazlası 150 TL. <code>kargo_ucreti(desi)</code> fonksiyonunu if/elif zinciri yerine <code>bisect</code> ile yaz. Desi 0 ya da negatifse <code>ValueError</code> fırlat.</p>',
      guide: ['Sınırları sıralı bir listeye koy: [1, 5, 10, 20].', 'Ücretleri bir fazla elemanlı listeye koy: [30, 45, 60, 90, 150].', '"x\'e kadar (dahil)" kuralında sınır değer SOLDAKİ dilime düşmeli: bisect_left.', 'Önce desi &lt;= 0 kontrolü yap.'],
      example: 'from bisect import bisect_right\n# Benzer teknik: yaşa göre bilet (12 ve üzeri tam)\nsinir, fiyat = [12, 65], ["çocuk", "tam", "emekli"]\nfor yas in (11, 12, 70):\n    print(yas, fiyat[bisect_right(sinir, yas)])\n',
      start: 'from bisect import bisect_left\n\nSINIRLAR = [1, 5, 10, 20]\nUCRETLER = [30, 45, 60, 90, 150]\n\ndef kargo_ucreti(desi):\n    # TODO: geçersiz desi kontrolü\n    # TODO: bisect_left ile dilim indeksini bul ve ücreti döndür\n    pass\n',
      sol: 'from bisect import bisect_left\n\nSINIRLAR = [1, 5, 10, 20]\nUCRETLER = [30, 45, 60, 90, 150]\n\ndef kargo_ucreti(desi):\n    if desi <= 0:\n        raise ValueError("desi pozitif olmalı")\n    return UCRETLER[bisect_left(SINIRLAR, desi)]\n',
      tests: '_b = {0.5: 30, 1: 30, 1.1: 45, 5: 45, 7: 60, 10: 60, 10.5: 90, 20: 90, 21: 150, 300: 150}\nfor _d, _u in _b.items():\n    assert kargo_ucreti(_d) == _u, f"{_d} desi için {_u} TL beklenir, gelen {kargo_ucreti(_d)}"\nfor _bad in (0, -3):\n    try:\n        kargo_ucreti(_bad)\n    except ValueError:\n        pass\n    else:\n        raise AssertionError(f"{_bad} desi ValueError vermeli")\n',
      hints: ['Sınır değerin (1, 5, 10, 20) hangi dilime düştüğüne dikkat et: "dahil".', 'bisect_left(SINIRLAR, desi) eşit değeri soldaki dilime koyar.', 'return UCRETLER[bisect_left(SINIRLAR, desi)]'],
      why: 'Kademe tabloları veriyle kodu ayırır: tarife değişince yalnızca listeler güncellenir. "x\'e kadar dahil" için bisect_left, "x ve üzeri" için bisect_right doğru seçimdir.'
    },
    {
      t: 'code',
      stage: 'Rehberli',
      id: 'standart-kutuphane-x2',
      diff: 2,
      q: '<p>Pazarlama ekibi e-posta şablonlarını kendisi yazıyor. <code>toplu_mesaj(sablon, kayitlar)</code> fonksiyonunu <code>string.Template</code> ile yaz. <code>(mesajlar, eksikler)</code> demeti döndürsün: <code>mesajlar</code> başarıyla doldurulan metinler, <code>eksikler</code> ise şablondaki bir alanı eksik olan kayıtların <b>indeksleri</b>. Eksik alanlı kayıt için yarım mesaj üretme.</p>',
      guide: ['Template(sablon) nesnesini döngüden önce bir kez oluştur.', 'enumerate ile kayıtlarda dön.', 'substitute(kayit) eksik alanda KeyError fırlatır; try/except ile yakala.', 'Başarılıysa mesajlar\'a, değilse indeksi eksikler\'e ekle.'],
      example: 'from string import Template\nt = Template("$urun stokta $adet adet")\nprint(t.substitute({"urun": "kalem", "adet": 4}))\ntry:\n    t.substitute({"urun": "silgi"})\nexcept KeyError as e:\n    print("eksik alan:", e)\n',
      start: 'from string import Template\n\ndef toplu_mesaj(sablon, kayitlar):\n    mesajlar, eksikler = [], []\n    # TODO: Template oluştur, her kaydı substitute ile doldur, KeyError\'u yakala\n    return mesajlar, eksikler\n',
      sol: 'from string import Template\n\ndef toplu_mesaj(sablon, kayitlar):\n    mesajlar, eksikler = [], []\n    t = Template(sablon)\n    for i, kayit in enumerate(kayitlar):\n        try:\n            mesajlar.append(t.substitute(kayit))\n        except KeyError:\n            eksikler.append(i)\n    return mesajlar, eksikler\n',
      tests: '_s = "Merhaba $ad, ${puan} puanınız var."\n_m, _e = toplu_mesaj(_s, [{"ad": "Ayşe", "puan": 120}, {"ad": "Can"}, {"ad": "Ece", "puan": 5, "sehir": "Van"}])\nassert _m == ["Merhaba Ayşe, 120 puanınız var.", "Merhaba Ece, 5 puanınız var."], f"mesajlar yanlış: {_m}"\nassert _e == [1], "puanı eksik olan 1. kayıt eksikler listesinde olmalı"\nassert toplu_mesaj("Sabit metin", [{}]) == (["Sabit metin"], []), "yer tutucusuz şablon her kayıtta aynen dönmeli"\n',
      hints: ['safe_substitute değil substitute kullan: eksik alanı yakalaman gerekiyor.', 'Fazla anahtarlar sorun değildir; yalnızca eksikler KeyError verir.', 'try: mesajlar.append(t.substitute(kayit)) except KeyError: eksikler.append(i)'],
      why: 'Template yalnızca $ad biçimindeki yer tutucuları doldurur; f-string ya da format\'ın aksine şablon metni nesne özniteliğine erişemez, bu yüzden kullanıcıya açık şablonlarda güvenlidir. substitute eksik alanı KeyError ile bildirir.'
    },
    {
      t: 'code',
      stage: 'Rehberli',
      id: 'standart-kutuphane-x3',
      diff: 2,
      q: '<p>Kur servisi yavaş: <code>_servisten_kur(doviz)</code> her çağrıda sayaç artırıyor. Bunu saran <code>kur(doviz)</code> fonksiyonunu yaz ve <code>functools.lru_cache(maxsize=32)</code> ile önbelleğe al. Aynı döviz için servis yalnızca <b>bir kez</b> çağrılmalı. Ayrıca <code>onbellegi_sifirla()</code> yaz: önbelleği temizlesin (gün sonunda yeni kurlar için).</p>',
      guide: ['functools\'tan lru_cache\'i içe aktar.', 'kur fonksiyonunun üstüne @lru_cache(maxsize=32) koy.', 'kur içinde _servisten_kur(doviz) sonucunu döndür.', 'onbellegi_sifirla içinde kur.cache_clear() çağır.'],
      example: 'from functools import lru_cache\n\n@lru_cache(maxsize=None)\ndef kare(n):\n    print("hesap", n)\n    return n * n\nkare(4); kare(4)\nprint(kare.cache_info().hits)   # 1\n',
      start: 'SAYAC = {"n": 0}\nKURLAR = {"USD": 32.5, "EUR": 35.1}\n\ndef _servisten_kur(doviz):\n    SAYAC["n"] += 1\n    return KURLAR[doviz]\n\n# TODO: lru_cache ile süsle\ndef kur(doviz):\n    return _servisten_kur(doviz)\n\ndef onbellegi_sifirla():\n    # TODO: önbelleği temizle\n    pass\n',
      sol: 'from functools import lru_cache\n\nSAYAC = {"n": 0}\nKURLAR = {"USD": 32.5, "EUR": 35.1}\n\ndef _servisten_kur(doviz):\n    SAYAC["n"] += 1\n    return KURLAR[doviz]\n\n@lru_cache(maxsize=32)\ndef kur(doviz):\n    return _servisten_kur(doviz)\n\ndef onbellegi_sifirla():\n    kur.cache_clear()\n',
      tests: 'SAYAC["n"] = 0\nassert kur("USD") == 32.5 and kur("USD") == 32.5 and kur("EUR") == 35.1, "kurlar doğru dönmeli"\nassert SAYAC["n"] == 2, f"USD ve EUR için servis toplam 2 kez çağrılmalı, {SAYAC[\'n\']} kez çağrıldı"\nassert kur.cache_info().hits == 1, "ikinci USD çağrısı önbellekten gelmeli"\nKURLAR["USD"] = 33.0\nonbellegi_sifirla()\nassert kur("USD") == 33.0, "önbellek sıfırlanınca yeni kur okunmalı"\n',
      hints: ['Dekoratör def satırının hemen üstüne yazılır.', '@lru_cache(maxsize=32)', 'lru_cache ile süslenen fonksiyonun cache_clear() metodu vardır.'],
      why: 'lru_cache argümanı anahtar yapan bir sözlük gibi çalışır; ikinci çağrıda servis hiç çağrılmaz. Dış veriye bağlı değerleri önbelleğe alıyorsan geçersiz kılma (invalidation) yolunu da birlikte tasarlamalısın: cache_clear bunu sağlar.'
    },
    {
      t: 'code',
      stage: 'Kendin yaz',
      id: 'standart-kutuphane-x4',
      diff: 2,
      q: '<p>Adres formunda şehir adı yanlış yazılabiliyor. <code>sehir_duzelt(girdi, sehirler)</code> fonksiyonunu <code>difflib.get_close_matches</code> ile yaz: girdi baştaki/sondaki boşluklardan arındırılsın; listede <b>birebir</b> varsa onu döndür; yoksa <code>cutoff=0.7</code> ile en yakın tek eşleşmeyi döndür; hiç yoksa <code>None</code>.</p>',
      start: 'import difflib\n\ndef sehir_duzelt(girdi, sehirler):\n    pass\n',
      sol: 'import difflib\n\ndef sehir_duzelt(girdi, sehirler):\n    girdi = girdi.strip()\n    if girdi in sehirler:\n        return girdi\n    adaylar = difflib.get_close_matches(girdi, sehirler, n=1, cutoff=0.7)\n    return adaylar[0] if adaylar else None\n',
      tests: '_s = ["Ankara", "Antalya", "Adana", "İzmir", "Eskişehir"]\nassert sehir_duzelt("  Ankara ", _s) == "Ankara", "boşluklar kırpılıp birebir eşleşme dönmeli"\nassert sehir_duzelt("Ankra", _s) == "Ankara", "Ankra -> Ankara"\nassert sehir_duzelt("Eskisehir", _s) == "Eskişehir", "Eskisehir -> Eskişehir"\nassert sehir_duzelt("Trabzon", _s) is None, "benzeri olmayan şehir None dönmeli"\n',
      hints: ['get_close_matches(kelime, olasiliklar, n=1, cutoff=0.7) bir LİSTE döndürür.', 'Boş liste gelirse None dön.'],
      why: 'get_close_matches benzerlik oranına (SequenceMatcher.ratio) göre sıralı bir liste döndürür; cutoff çok alakasız önerileri eler. Önce birebir eşleşmeye bakmak hem hızlı hem de kesin sonuç verir.'
    },
    {
      t: 'code',
      stage: 'Kendin yaz',
      id: 'standart-kutuphane-x5',
      diff: 2,
      q: '<p>Büyük rapor metnini JSON içinde taşımak için <code>paketle(metin)</code> ve <code>ac(paket)</code> yaz. <code>paketle</code>: metni UTF-8 baytlarına çevir, <code>zlib.compress</code> ile sıkıştır, <code>base64.b64encode</code> ile kodla ve ASCII <b>str</b> döndür. <code>ac</code>: tersini yapıp orijinal metni döndürsün.</p>',
      start: 'import base64, zlib\n\ndef paketle(metin):\n    pass\n\ndef ac(paket):\n    pass\n',
      sol: 'import base64, zlib\n\ndef paketle(metin):\n    return base64.b64encode(zlib.compress(metin.encode("utf-8"))).decode("ascii")\n\ndef ac(paket):\n    return zlib.decompress(base64.b64decode(paket)).decode("utf-8")\n',
      tests: '_r = "Kadıköy;1250\\n" * 300\n_p = paketle(_r)\nassert isinstance(_p, str), "paketle str döndürmeli (bytes değil)"\nassert len(_p) < len(_r) / 5, "tekrarlı metin belirgin biçimde küçülmeli"\nassert ac(_p) == _r, "ac(paketle(x)) == x olmalı, Türkçe karakterler dahil"\nassert ac(paketle("")) == "", "boş metin de gidip dönebilmeli"\n',
      hints: ['Sıra: str -> encode -> compress -> b64encode -> decode("ascii").', 'Açarken tam tersi: b64decode -> decompress -> decode("utf-8").'],
      why: 'zlib baytlarla çalışır ve çıktısı yazdırılamaz baytlar içerir; base64 bunları JSON ve URL\'de güvenle taşınabilen ASCII karakterlere çevirir. Her katman bir öncekinin tersidir.'
    },
    {
      t: 'code',
      stage: 'Hata avı',
      kind: 'bug',
      id: 'standart-kutuphane-x6',
      diff: 2,
      q: '<p>Kampanya kuralı: sepet <b>1000 TL ve üzeri</b> ise %10, <b>2500 TL ve üzeri</b> ise %15 indirim; altı %0. Müşteriler tam 1000 TL\'lik sepette indirim alamadıklarını şikâyet ediyor. <code>indirim_orani(tutar)</code> fonksiyonundaki <b>hatayı bul ve düzelt.</b></p>',
      start: 'from bisect import bisect_left\n\nSINIRLAR = [1000, 2500]\nORANLAR = [0, 10, 15]\n\ndef indirim_orani(tutar):\n    return ORANLAR[bisect_left(SINIRLAR, tutar)]\n',
      sol: 'from bisect import bisect_right\n\nSINIRLAR = [1000, 2500]\nORANLAR = [0, 10, 15]\n\ndef indirim_orani(tutar):\n    return ORANLAR[bisect_right(SINIRLAR, tutar)]\n',
      tests: 'for _t, _o in {999.99: 0, 1000: 10, 1500: 10, 2499: 10, 2500: 15, 9000: 15, 0: 0}.items():\n    assert indirim_orani(_t) == _o, f"{_t} TL için %{_o} beklenir, gelen %{indirim_orani(_t)}"\n',
      hints: ['Sorun yalnızca tam sınır değerlerinde (1000, 2500) çıkıyor.', 'bisect_left eşit değeri sola, bisect_right sağa yerleştirir.', '"ve üzeri" kuralında sınır değer üst dilime aittir: bisect_right.'],
      why: 'bisect_left(SINIRLAR, 1000) 0 döndürür ve sepet alt dilime düşer. "x ve üzeri" kuralında sınırın kendisi üst dilime ait olmalı; bisect_right bunu sağlar. Sınır değerleri her zaman ayrı ayrı test et.'
    },
    {
      t: 'code',
      stage: 'Hata avı',
      kind: 'bug',
      id: 'standart-kutuphane-x7',
      diff: 2,
      q: '<p>Hızlanma için önbellek eklendi ama artık <code>TypeError: unhashable type: \'list\'</code> alınıyor. <code>sepet_toplam(fiyatlar)</code> çağıranlar <b>liste</b> göndermeye devam edecek; fonksiyonun imzası ve dönüş değeri değişmemeli, önbellek de çalışmalı. <b>Hatayı bul ve düzelt.</b></p>',
      start: 'from functools import lru_cache\n\n@lru_cache(maxsize=256)\ndef sepet_toplam(fiyatlar):\n    return round(sum(fiyatlar) * 1.20, 2)\n',
      sol: 'from functools import lru_cache\n\n@lru_cache(maxsize=256)\ndef _toplam(fiyatlar):\n    return round(sum(fiyatlar) * 1.20, 2)\n\ndef sepet_toplam(fiyatlar):\n    return _toplam(tuple(fiyatlar))\n',
      tests: 'assert sepet_toplam([100, 50]) == 180.0, "KDV dahil toplam 180.0 olmalı"\nassert sepet_toplam([100, 50]) == 180.0, "ikinci çağrı da çalışmalı"\nassert sepet_toplam([]) == 0, "boş sepet 0"\n_f = [k for k, v in globals().items() if hasattr(v, "cache_info")]\nassert _f, "bir fonksiyon hâlâ lru_cache ile önbelleklenmeli"\nassert any(globals()[k].cache_info().hits >= 1 for k in _f), "aynı sepet ikinci kez önbellekten gelmeli"\n',
      hints: ['lru_cache argümanları sözlük anahtarı olarak kullanır; liste hashlenemez.', 'Önbelleği iç bir yardımcı fonksiyona taşı, dıştaki fonksiyon listeyi demete çevirsin.', 'def sepet_toplam(fiyatlar): return _toplam(tuple(fiyatlar))'],
      why: 'Önbellek argümanları hash ile saklar; değiştirilebilir liste bunu desteklemez. Dış API\'yi bozmadan içeride değişmez bir temsile (tuple) çevirmek standart çözümdür.'
    },
    {
      t: 'code',
      stage: 'Meydan okuma',
      id: 'standart-kutuphane-x8',
      diff: 3,
      q: '<p><code>coklu_sirala(kayitlar, kurallar)</code> fonksiyonunu yaz. <code>kurallar</code>, <code>[("sehir", False), ("tutar", True)]</code> gibi <code>(alan, azalan_mi)</code> çiftlerinin listesidir: önce şehre göre artan, eşitlikte tutara göre azalan. Alanlar metin de olabilir (metinde eksiyle ters çeviremezsin). Orijinal liste değişmesin; yeni liste döndür.</p>',
      start: 'def coklu_sirala(kayitlar, kurallar):\n    return kayitlar\n',
      sol: 'from operator import itemgetter\n\ndef coklu_sirala(kayitlar, kurallar):\n    sonuc = list(kayitlar)\n    for alan, azalan in reversed(kurallar):\n        sonuc.sort(key=itemgetter(alan), reverse=azalan)\n    return sonuc\n',
      tests: '_k = [{"no": 1, "sehir": "Van", "tutar": 5}, {"no": 2, "sehir": "Bursa", "tutar": 9}, {"no": 3, "sehir": "Bursa", "tutar": 40}, {"no": 4, "sehir": "Van", "tutar": 5}]\n_yedek = list(_k)\nassert [x["no"] for x in coklu_sirala(_k, [("sehir", False), ("tutar", True)])] == [3, 2, 1, 4], "Bursa önce, tutar azalan; eşitlerde ilk sıra korunmalı"\nassert [x["no"] for x in coklu_sirala(_k, [("sehir", True), ("no", False)])] == [1, 4, 2, 3], "şehir azalan (metin), no artan"\nassert _k == _yedek, "orijinal liste değişmemeli"\nassert coklu_sirala([], [("a", True)]) == [], "boş liste"\n',
      hints: ['Python\'un sıralaması kararlıdır (stable): eşit anahtarlar önceki sırasını korur.', 'Kuralları SONDAN başa uygula; her adımda tek anahtarla ve kendi reverse değeriyle sırala.', 'reverse=True kararlılığı bozmaz; eşit öğeler yine özgün sırayla kalır.'],
      why: 'Kararlı sıralamada en önemsiz anahtardan en önemliye doğru art arda sıralamak çok anahtarlı sıralamayı verir. Bu sayede metin alanlarını da azalan sıralayabilirsin; eksi işaret hilesi yalnızca sayılarda çalışır.'
    }
  ],
  faq: [
    {
      q: 'lru_cache ile kendi sözlük önbelleğim arasında fark var mı?',
      a: 'Mantık aynıdır ama lru_cache iş parçacığı güvenlidir, boyut sınırı (en az kullanılanı atar) ve cache_info/cache_clear gibi araçlar sunar. Sınır koymazsan (cache ya da maxsize=None) önbellek sonsuza büyür; uzun çalışan sunucularda maxsize ver.'
    },
    {
      q: 'subprocess yerine os.system kullanabilir miyim?',
      a: 'Kullanma. os.system çıktıyı yakalayamaz, hata kodunu zor yönetir ve komutu kabuk üzerinden çalıştırdığı için enjeksiyona açıktır. subprocess.run(["komut", "arg"], capture_output=True, text=True, check=True) modern ve güvenli yoldur.'
    }
  ],
  mistakes: [
    {
      bad: 'yeni = sablon.copy()\nyeni["kalemler"].append(u)',
      good: 'import copy\nyeni = copy.deepcopy(sablon)\nyeni["kalemler"].append(u)',
      why: 'Yüzeysel kopya iç listeyi paylaşır; şablon da değişir. İç içe veride deepcopy kullan.'
    },
    {
      bad: '@lru_cache\ndef bakiye(hesap):\n    return db.oku(hesap)',
      good: 'def bakiye(hesap):\n    return db.oku(hesap)   # dış duruma bağlı: önbellekleme',
      why: 'Sonucu zamanla değişen fonksiyonu önbelleğe almak bayat veri döndürür; lru_cache yalnızca saf fonksiyonlar içindir.'
    }
  ]
});
})(window);
