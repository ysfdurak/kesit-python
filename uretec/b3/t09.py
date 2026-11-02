T = [
dict(id='b-391', topic='Web Mantığı', diff=2, kind='yaz',
  title='Sorgu parametresiyle sayfalama uç noktası',
  q='<p><code>GET /siparisler?sayfa=2&amp;boyut=3</code> isteğinin mantığını yaz. <code>sayfala(sorgu, kayitlar)</code>: <code>sorgu</code> URL\'nin <code>?</code> sonrasındaki metin (ör. <code>"sayfa=2&amp;boyut=3"</code>). <code>urllib.parse.parse_qs</code> ile ayrıştır; varsayılanlar <code>sayfa=1</code>, <code>boyut=10</code>. Sayı değilse ya da <code>sayfa &lt; 1</code> veya boyut 1-50 dışındaysa <code>(400, {"hata": ...})</code>; sayfa toplam sayfa sayısını aşarsa <code>(404, {"hata": ...})</code>; aksi hâlde <code>(200, {"sayfa", "boyut", "toplam_sayfa", "veri"})</code> döndür. Boş kayıt listesinde toplam sayfa 1 kabul edilir.</p>',
  start=r'''
from urllib.parse import parse_qs

def sayfala(sorgu, kayitlar):
    pass
''',
  sol=r'''
from urllib.parse import parse_qs

def sayfala(sorgu, kayitlar):
    p = parse_qs(sorgu)
    try:
        sayfa = int(p.get("sayfa", ["1"])[0])
        boyut = int(p.get("boyut", ["10"])[0])
    except ValueError:
        return 400, {"hata": "sayfa ve boyut tam sayı olmalı"}
    if sayfa < 1 or not 1 <= boyut <= 50:
        return 400, {"hata": "sayfa >= 1 ve 1 <= boyut <= 50 olmalı"}
    toplam_sayfa = max(1, -(-len(kayitlar) // boyut))
    if sayfa > toplam_sayfa:
        return 404, {"hata": "sayfa bulunamadı"}
    bas = (sayfa - 1) * boyut
    return 200, {"sayfa": sayfa, "boyut": boyut, "toplam_sayfa": toplam_sayfa,
                 "veri": kayitlar[bas:bas + boyut]}
''',
  tests=r'''
k = list(range(1, 8))
assert sayfala("sayfa=2&boyut=3", k) == (200, {"sayfa": 2, "boyut": 3, "toplam_sayfa": 3, "veri": [4, 5, 6]}), "2. sayfa [4, 5, 6]"
kod, g = sayfala("sayfa=3&boyut=3", k)
assert kod == 200 and g["veri"] == [7], "Son sayfa eksik olabilir"
kod, g = sayfala("", k)
assert kod == 200 and g["boyut"] == 10 and g["veri"] == k, "Parametre yoksa varsayılanlar (1, 10)"
for s in ("sayfa=abc", "sayfa=0", "boyut=51", "boyut=0"):
    kod, g = sayfala(s, k)
    assert kod == 400 and "hata" in g, f"'{s}' → 400 bekleniyor; gelen {kod}"
assert sayfala("sayfa=4&boyut=3", k)[0] == 404, "Olmayan sayfa → 404"
assert sayfala("", [])[0] == 200, "Boş listede 1. sayfa 200 dönmeli"
''',
  hints=['<code>parse_qs("a=1&amp;b=2")</code> → <code>{"a": ["1"], "b": ["2"]}</code>: değerler listedir.', 'Toplam sayfa = tavan(n / boyut); tam sayılarla <code>-(-n // boyut)</code> ya da <code>math.ceil</code>.', 'Dilim: <code>kayitlar[(sayfa - 1) * boyut : sayfa * boyut]</code>'],
  why='Uç nokta mantığını çerçeveden (Flask/FastAPI) bağımsız saf bir fonksiyon olarak yazmak onu kolay test edilebilir yapar; çerçeve yalnız HTTP katmanını sağlar. Girdi doğrulaması 400 (istemci hatası), var olmayan kaynak 404 ile ayrılır. Üst sınır (50) kötü niyetli dev sayfa isteklerini önler. Dilimleme O(boyut). Büyük tablolarda OFFSET tabanlı sayfalama yavaşlar; anahtar kümesi (keyset/cursor) sayfalama (WHERE id > son_id LIMIT n) tercih edilir.',
  tags=['parse_qs', 'sayfalama', 'HTTP durum kodu'], min=8),

dict(id='b-392', topic='Web Mantığı', diff=3, kind='yaz', needs=['jinja2'],
  title='Jinja2 raporu ve özel TL filtresi',
  q='<p>Günlük sipariş özetini e-posta gövdesi olarak üreteceksin. <code>tl(deger)</code> filtresini yaz: <code>1234.5</code> → <code>"1.234,50 TL"</code> (binlik ayırıcı nokta, ondalık virgül, 2 hane). <code>rapor_uret(siparisler)</code>: <code>trim_blocks=True</code> ve <code>lstrip_blocks=True</code> ile bir <code>jinja2.Environment</code> kur, <code>tl</code>\'yi filtre olarak kaydet ve verilen <code>SABLON</code>\'u <code>siparisler</code> ile render edip döndür.</p>',
  start=r'''
from jinja2 import Environment

SABLON = """Sipariş raporu
{% for s in siparisler %}
- {{ s.musteri }}: {{ s.tutar | tl }}
{% endfor %}
Toplam: {{ siparisler | sum(attribute="tutar") | tl }}"""

def tl(deger):
    pass

def rapor_uret(siparisler):
    pass
''',
  sol=r'''
from jinja2 import Environment

SABLON = """Sipariş raporu
{% for s in siparisler %}
- {{ s.musteri }}: {{ s.tutar | tl }}
{% endfor %}
Toplam: {{ siparisler | sum(attribute="tutar") | tl }}"""

def tl(deger):
    metin = f"{deger:,.2f}"                     # 1,234.50
    metin = metin.replace(",", "_").replace(".", ",").replace("_", ".")
    return metin + " TL"

def rapor_uret(siparisler):
    env = Environment(trim_blocks=True, lstrip_blocks=True)
    env.filters["tl"] = tl
    return env.from_string(SABLON).render(siparisler=siparisler)
''',
  tests=r'''
assert tl(1234.5) == "1.234,50 TL", f"tl(1234.5) → '1.234,50 TL'; gelen {tl(1234.5)!r}"
assert tl(1234567.891) == "1.234.567,89 TL", "Milyonlarda iki binlik ayırıcı"
assert tl(0) == "0,00 TL"
r = rapor_uret([{"musteri": "Ayşe", "tutar": 1234.5}, {"musteri": "Can", "tutar": 99.9}])
beklenen = "Sipariş raporu\n- Ayşe: 1.234,50 TL\n- Can: 99,90 TL\nToplam: 1.334,40 TL"
assert r == beklenen, f"Çıktı farklı.\n--- beklenen ---\n{beklenen}\n--- gelen ---\n{r}\n(trim_blocks/lstrip_blocks boş satırları siler)"
''',
  hints=['Python biçimlendirmesi <code>f"{x:,.2f}"</code> → <code>"1,234.50"</code>; virgül ve noktayı geçici bir karakterle yer değiştir.', 'Filtre kaydı: <code>env.filters["tl"] = tl</code>.', '<code>Environment(trim_blocks=True, lstrip_blocks=True)</code> blok etiketlerinin bıraktığı boş satırları ve girintiyi temizler.'],
  why='Özel filtreler biçimlendirme mantığını şablondan ayırır: şablon yalnız yapıyı, Python fonksiyonu sayı biçimini bilir ve ayrıca test edilebilir. trim_blocks bir blok etiketinden sonraki satır sonunu, lstrip_blocks etiketin önündeki boşlukları siler; olmadan döngü her satır arasına boş satır ekler. Üç adımlı yer değiştirme (",", "_") çakışmayı önler; alternatif: babel.numbers.format_currency(x, "TRY", locale="tr_TR") ya da locale modülü (sistem yerel ayarına bağlı, sunucuda güvenilmez). E-posta HTML ise autoescape=True açılmalı.',
  tags=['jinja2', 'filtre', 'trim_blocks', 'sayı biçimi'], min=12),

dict(id='b-393', topic='Güvenlik', diff=2, kind='predict',
  title='SHA-256 özeti',
  q='<p>Dosya bütünlüğünü kontrol etmek için kullanılan bu kod ne yazdırır?</p>',
  code=r'''
import hashlib

h = hashlib.sha256(b"abc").hexdigest()
print(h[:8], len(h))
''',
  o=['ba7816bf 64', 'ba7816bf 32', '90015098 32', 'ba7816bf 256'], a=0,
  hints=['SHA-256 özeti 256 bit = 32 bayttır; her bayt iki onaltılık (hex) karakterle yazılır.', '"90015098…" MD5 özetinin başıdır, SHA-256\'nın değil.'],
  why='SHA-256 her girdi için 32 baytlık sabit uzunlukta özet üretir; hexdigest bunu 64 onaltılık karakter olarak verir (digest() ise 32 bayt döndürür). Aynı girdi her zaman aynı özeti verir, tek bit değişimi özeti tamamen değiştirir: indirilen dosyanın bütünlüğü böyle kontrol edilir. Ama parola saklamak için tek başına SHA-256 uygun değildir: çok hızlıdır, kaba kuvvete açıktır; tuzlu ve yavaş PBKDF2/bcrypt/scrypt/Argon2 kullanılır. MD5 ve SHA-1 çakışmaya açık olduğu için güvenlikte kullanılmaz.',
  tags=['hashlib', 'SHA-256', 'bütünlük'], min=2),

dict(id='b-394', topic='Güvenlik', diff=2, kind='rehberli',
  title='Tuzlu PBKDF2 ile parola saklama',
  q='<p>Kullanıcı parolaları asla düz metin saklanmamalı. <code>parola_hashle(parola, tuz=None, tur=100_000)</code>: tuz verilmemişse <code>os.urandom(16)</code> üretsin, <code>hashlib.pbkdf2_hmac("sha256", ...)</code> ile özet çıkarsın ve <code>"pbkdf2_sha256$TUR$TUZ_HEX$OZET_HEX"</code> metnini döndürsün. <code>parola_dogrula(parola, kayit)</code>: kaydı <code>$</code>\'dan bölüp aynı tuz ve tur sayısıyla yeniden hesaplasın, <code>hmac.compare_digest</code> ile karşılaştırıp bool döndürsün.</p>',
  guide=['<code>tuz = tuz or os.urandom(16)</code>', '<code>ozet = hashlib.pbkdf2_hmac("sha256", parola.encode(), tuz, tur)</code>', 'Kayıt: <code>f"pbkdf2_sha256${tur}${tuz.hex()}${ozet.hex()}"</code>', 'Doğrulamada <code>algo, tur, tuz_hex, ozet_hex = kayit.split("$")</code>; <code>bytes.fromhex</code> ve <code>int(tur)</code> ile geri çevir.', 'Karşılaştırma: <code>hmac.compare_digest(yeni.hex(), ozet_hex)</code>'],
  example=r'''
import hashlib, os
tuz = bytes.fromhex("00112233445566778899aabbccddeeff")
anahtar = hashlib.pbkdf2_hmac("sha256", b"gizli", tuz, 1000)
print(len(anahtar), anahtar.hex()[:16])
print(os.urandom(4).hex())   # her çalıştırmada farklı
''',
  start=r'''
import hashlib
import hmac
import os

def parola_hashle(parola, tuz=None, tur=100_000):
    # TODO 1: tuz yoksa os.urandom(16)
    # TODO 2: pbkdf2_hmac ile özet
    # TODO 3: "pbkdf2_sha256$tur$tuz_hex$ozet_hex" döndür
    return hashlib.sha256(parola.encode()).hexdigest()

def parola_dogrula(parola, kayit):
    # TODO 4: kaydı ayrıştır, yeniden hesapla, compare_digest ile karşılaştır
    return parola_hashle(parola) == kayit
''',
  sol=r'''
import hashlib
import hmac
import os

def parola_hashle(parola, tuz=None, tur=100_000):
    tuz = tuz or os.urandom(16)
    ozet = hashlib.pbkdf2_hmac("sha256", parola.encode(), tuz, tur)
    return f"pbkdf2_sha256${tur}${tuz.hex()}${ozet.hex()}"

def parola_dogrula(parola, kayit):
    algo, tur, tuz_hex, ozet_hex = kayit.split("$")
    yeni = hashlib.pbkdf2_hmac("sha256", parola.encode(), bytes.fromhex(tuz_hex), int(tur))
    return hmac.compare_digest(yeni.hex(), ozet_hex)
''',
  tests=r'''
k = parola_hashle("Gizli*2026", tur=1000)
parcalar = k.split("$")
assert len(parcalar) == 4 and parcalar[0] == "pbkdf2_sha256" and parcalar[1] == "1000", f"Biçim 'pbkdf2_sha256$1000$tuz$ozet' olmalı; gelen {k}"
assert len(parcalar[2]) == 32, "16 baytlık tuz 32 hex karakter olmalı"
assert "Gizli" not in k, "Parola kayıtta görünmemeli"
assert parola_dogrula("Gizli*2026", k) is True, "Doğru parola doğrulanmalı"
assert parola_dogrula("gizli*2026", k) is False, "Yanlış parola reddedilmeli"
assert parola_hashle("aynı", tur=1000) != parola_hashle("aynı", tur=1000), "Rastgele tuz: aynı parola farklı kayıt üretmeli"
sabit = bytes(range(16))
assert parola_hashle("x", sabit, 1000) == parola_hashle("x", sabit, 1000), "Aynı tuz ve tur → aynı kayıt"
''',
  hints=['Tuz, aynı parolanın farklı kullanıcılarda farklı özet üretmesini sağlar; kayda açık olarak yazılır.', 'Tur sayısı da kayda yazılır ki ileride artırıldığında eski kayıtlar doğrulanabilsin.', '<code>hmac.compare_digest</code> zamanlama saldırısına karşı sabit sürede karşılaştırır.'],
  why='PBKDF2 özeti binlerce kez yineleyerek kasıtlı olarak yavaşlatır; saldırganın saniyede deneyebileceği parola sayısı aynı oranda düşer. Tuz, önceden hesaplanmış (rainbow) tabloları ve "aynı parolayı kullananları bulma"yı engeller. Kayıt biçimi algoritma/tur/tuz bilgisini taşıdığı için parametreler zamanla güçlendirilebilir (Django aynı biçimi kullanır). == karşılaştırması ilk farklı baytta durur ve süre farkı bilgi sızdırabilir; compare_digest bunu önler. Maliyet O(tur). Modern alternatifler: Argon2id (argon2-cffi), bcrypt, hashlib.scrypt.',
  tags=['PBKDF2', 'tuz', 'parola', 'compare_digest'], min=8),

dict(id='b-395', topic='Güvenlik', diff=2, kind='bug',
  title='Müşteri aramasında SQL enjeksiyonu',
  q='<p>Kodda bir güvenlik hatası var, bul ve düzelt. <code>musteri_ara(con, ad)</code> verilen ada sahip müşterilerin e-postalarını döndürüyor. Saldırgan arama kutusuna <code>\' OR \'1\'=\'1</code> yazınca <b>tüm</b> müşterilerin e-postaları geliyor; ayrıca "O\'Brien" gibi kesme işaretli adlar hata veriyor.</p>',
  start=r'''
import sqlite3

def musteri_ara(con, ad):
    sql = f"SELECT email FROM musteri WHERE ad = '{ad}' ORDER BY email"
    return [r[0] for r in con.execute(sql).fetchall()]
''',
  sol=r'''
import sqlite3

def musteri_ara(con, ad):
    sql = "SELECT email FROM musteri WHERE ad = ? ORDER BY email"
    return [r[0] for r in con.execute(sql, (ad,)).fetchall()]
''',
  tests=r'''
con = sqlite3.connect(":memory:")
con.execute("CREATE TABLE musteri (ad TEXT, email TEXT)")
con.executemany("INSERT INTO musteri VALUES (?, ?)", [("Ayşe", "ayse@ornek.com"), ("Can", "can@ornek.com"), ("O'Brien", "ob@ornek.com")])
assert musteri_ara(con, "Ayşe") == ["ayse@ornek.com"], "Normal arama çalışmalı"
assert musteri_ara(con, "' OR '1'='1") == [], "Enjeksiyon girdisi hiçbir kayıt döndürmemeli (değer SQL'e yapıştırılmamalı)"
assert musteri_ara(con, "O'Brien") == ["ob@ornek.com"], "Kesme işaretli ad sorunsuz aranmalı"
''',
  hints=['Kullanıcı girdisini f-string ile SQL metnine yapıştırmak, girdinin SQL kodu gibi yorumlanmasına izin verir.', 'sqlite3 yer tutucusu <code>?</code>; değerler ayrı bir demetle verilir.', '<code>con.execute("... WHERE ad = ?", (ad,))</code> — tek elemanlı demette virgülü unutma.'],
  why='Parametreli sorguda SQL metni ve değerler veritabanına ayrı gider; değer ne içerirse içersin veri olarak kalır, SQL’in parçası olamaz. Kaçış karakterlerini elle eklemek (replace("\'", "\'\'")) kırılgandır ve önerilmez. OWASP Top 10’un kalıcı maddesidir. Aynı kural tüm sürücülerde geçerlidir (psycopg %s, SQLAlchemy :ad). Tablo/sütun adları parametre olamaz; dinamik olmaları gerekiyorsa izinli listeden (allow-list) seçilir.',
  tags=['SQL injection', 'parametreli sorgu', 'sqlite3', 'OWASP'], min=3),

dict(id='b-396', topic='Güvenlik', diff=3, kind='yaz',
  title='Webhook imzası ve tekrar saldırısı koruması',
  q='<p>Ödeme sağlayıcısı her webhook isteğine <code>"t=1767225600,v1=&lt;hex&gt;"</code> biçiminde bir imza başlığı ekliyor; <code>v1</code>, <code>f"{t}.".encode() + govde</code> verisinin gizli anahtarla HMAC-SHA256 özetidir. <code>imza_dogrula(govde, baslik, gizli, simdi, tolerans=300)</code> fonksiyonunu yaz: başlığı ayrıştır (bozuksa <code>False</code>), zaman damgası <code>simdi</code>\'den <code>tolerans</code> saniyeden eski ya da ileri ise <code>False</code> (tekrar saldırısı), imzayı <code>hmac.compare_digest</code> ile karşılaştır, sonucu bool döndür. <code>govde</code> ve <code>gizli</code> bayt dizisidir.</p>',
  start=r'''
import hashlib
import hmac

def imza_dogrula(govde, baslik, gizli, simdi, tolerans=300):
    pass
''',
  sol=r'''
import hashlib
import hmac

def imza_dogrula(govde, baslik, gizli, simdi, tolerans=300):
    try:
        alanlar = dict(parca.split("=", 1) for parca in baslik.split(","))
        t = int(alanlar["t"])
        imza = alanlar["v1"]
    except (ValueError, KeyError):
        return False
    if abs(simdi - t) > tolerans:
        return False
    beklenen = hmac.new(gizli, f"{t}.".encode() + govde, hashlib.sha256).hexdigest()
    return hmac.compare_digest(beklenen, imza)
''',
  tests=r'''
gizli = b"whsec_test"
govde = b'{"odeme": 1500, "durum": "basarili"}'
t = 1767225600
imza = hmac.new(gizli, f"{t}.".encode() + govde, hashlib.sha256).hexdigest()
baslik = f"t={t},v1={imza}"
assert imza_dogrula(govde, baslik, gizli, simdi=t + 10) is True, "Geçerli imza ve taze zaman damgası kabul edilmeli"
assert imza_dogrula(govde.replace(b"1500", b"9500"), baslik, gizli, simdi=t) is False, "Gövde değişirse imza tutmamalı"
assert imza_dogrula(govde, baslik, b"yanlis", simdi=t) is False, "Yanlış gizli anahtar reddedilmeli"
assert imza_dogrula(govde, baslik, gizli, simdi=t + 301) is False, "301 sn eski istek tekrar saldırısı sayılmalı"
assert imza_dogrula(govde, baslik, gizli, simdi=t - 301) is False, "Gelecekten gelen zaman damgası da reddedilmeli"
for bozuk in ("", "t=abc,v1=00", "v1=00", f"t={t}"):
    assert imza_dogrula(govde, bozuk, gizli, simdi=t) is False, f"Bozuk başlık {bozuk!r} False döndürmeli, hata fırlatmamalı"
assert "compare_digest" in __source__, "İmzayı sabit sürede karşılaştır (hmac.compare_digest)"
''',
  hints=['Başlığı <code>","</code> ile, her parçayı <code>split("=", 1)</code> ile böl; <code>dict(...)</code> ile sözlüğe çevir.', 'Ayrıştırmayı <code>try/except (ValueError, KeyError)</code> içine al; bozuk girdide False dön.', 'Beklenen imza: <code>hmac.new(gizli, f"{t}.".encode() + govde, hashlib.sha256).hexdigest()</code>'],
  why='HMAC gizli anahtarı bilmeyen birinin geçerli imza üretmesini engeller; gövdenin tek baytı değişse imza tutmaz (bütünlük + kaynak doğrulama). Zaman damgası imzaya dahil edildiği için değiştirilemez, tolerans penceresi de yakalanan bir isteğin sonradan yeniden gönderilmesini (replay) sınırlar; tam koruma için olay kimlikleri ayrıca saklanıp tekrarlar reddedilir. compare_digest zamanlama yan kanalını kapatır. Bozuk girdide istisna yerine False dönmek, saldırganın hata ayrıntılarını görmesini ve servisin çökmesini önler. Maliyet O(gövde boyutu).',
  tags=['HMAC', 'webhook', 'replay', 'compare_digest'], min=12),

dict(id='b-397', topic='Güvenlik', diff=3, kind='yaz',
  title='Dizin aşımına (path traversal) karşı güvenli yol',
  q='<p>Rapor indirme servisi kullanıcıdan dosya yolu alıyor; <code>../../etc/passwd</code> gibi isteklerle kök klasörün dışına çıkılmamalı. <code>guvenli_yol(kok, istenen)</code> fonksiyonunu dosya sistemine dokunmadan (<code>posixpath</code> ile) yaz: yolu köke göre birleştirip normalleştir; sonuç kökün <b>içinde</b> değilse <code>PermissionError</code> fırlat, içindeyse normalleştirilmiş yolu döndür. Mutlak yol isteklerini ve boş bayt (<code>\\x00</code>) içeren istekleri de reddet (boş bayt için <code>ValueError</code>). Dikkat: <code>/srv/veri2</code> yolu <code>/srv/veri</code> ile başlar ama onun içinde değildir.</p>',
  start=r'''
import posixpath

def guvenli_yol(kok, istenen):
    pass
''',
  sol=r'''
import posixpath

def guvenli_yol(kok, istenen):
    if "\x00" in istenen:
        raise ValueError("Geçersiz karakter")
    if posixpath.isabs(istenen):
        raise PermissionError("Mutlak yol yasak")
    kok = posixpath.normpath(kok)
    yol = posixpath.normpath(posixpath.join(kok, istenen))
    if posixpath.commonpath([kok, yol]) != kok:
        raise PermissionError("Kök dizinin dışına çıkılamaz")
    return yol
''',
  tests=r'''
K = "/srv/veri"
assert guvenli_yol(K, "raporlar/ocak.csv") == "/srv/veri/raporlar/ocak.csv", "Normal yol"
assert guvenli_yol(K, "a/./b/../c.txt") == "/srv/veri/a/c.txt", "Normalleştirilmiş yol dönmeli"
for kotu in ("../etc/passwd", "a/../../x", "/etc/passwd", "../veri2/gizli.txt"):
    try:
        guvenli_yol(K, kotu)
        assert False, f"{kotu!r} reddedilmeliydi (PermissionError)"
    except PermissionError:
        pass
try:
    guvenli_yol(K, "rapor.csv\x00.png")
    assert False, "Boş bayt içeren yol ValueError vermeli"
except ValueError:
    pass
assert guvenli_yol("/srv/veri/", "x.txt") == "/srv/veri/x.txt", "Kökün sonundaki / sorun çıkarmamalı"
''',
  hints=['<code>posixpath.normpath</code> <code>..</code> ve <code>.</code> parçalarını çözer; önce birleştir sonra normalleştir.', '<code>yol.startswith(kok)</code> /srv/veri2 için yanılır; <code>posixpath.commonpath([kok, yol]) == kok</code> parça bazında karşılaştırır.', 'Kontrol sırası: boş bayt → mutlak yol → birleştir/normalleştir → kök kontrolü.'],
  why='Dizin aşımı, kullanıcı girdisinin dosya yoluna doğrudan eklenmesinden doğar. Doğru savunma, yolu tamamen çözüp kökün altında kaldığını parça bazında doğrulamaktır; metin öneki (startswith) /srv/veri2 gibi kardeş klasörlerde yanılır. Mutlak yol join’de kökü tamamen ezer. Gerçek dosya sisteminde sembolik bağlar (symlink) da aşım sağlayabilir; orada pathlib.Path(...).resolve() ve Path.is_relative_to (3.9+) kullanılır. En güvenlisi kullanıcıya yol değil, veritabanındaki bir dosya kimliği (ID) sordurmaktır. İşlem O(yol uzunluğu).',
  tags=['path traversal', 'posixpath', 'commonpath', 'girdi doğrulama'], min=10),

dict(id='b-398', topic='Güvenlik', diff=2, kind='yaz',
  title='Loglarda kişisel veriyi maskele',
  q='<p>KVKK gereği uygulama loglarına kart numarası ve e-posta açık yazılmamalı. <code>maskele(metin)</code> fonksiyonunu <code>re.sub</code> ile yaz: (1) 16 haneli kart numaraları (4\'lü gruplar arasında boşluk, tire ya da hiçbir şey olabilir) <code>**** **** **** 1234</code> biçimine dönsün (son 4 hane korunur); (2) e-postalar ilk harf korunup kullanıcı adının geri kalanı <code>***</code> olacak şekilde maskelensin: <code>ayse.k@ornek.com</code> → <code>a***@ornek.com</code>. Diğer metin aynen kalsın.</p>',
  start=r'''
import re

def maskele(metin):
    pass
''',
  sol=r'''
import re

KART = re.compile(r"\b(?:\d{4}[ -]?){3}(\d{4})\b")
EPOSTA = re.compile(r"\b([A-Za-z0-9])[A-Za-z0-9._%+-]*@([A-Za-z0-9.-]+\.[A-Za-z]{2,})\b")

def maskele(metin):
    metin = KART.sub(lambda m: "**** **** **** " + m.group(1), metin)
    return EPOSTA.sub(lambda m: m.group(1) + "***@" + m.group(2), metin)
''',
  tests=r'''
assert maskele("kart 4543 1234 5678 9012 onaylandı") == "kart **** **** **** 9012 onaylandı", "Boşluklu kart"
assert maskele("no=4543-1234-5678-9012;") == "no=**** **** **** 9012;", "Tireli kart"
assert maskele("4543123456789012") == "**** **** **** 9012", "Bitişik 16 hane"
assert maskele("Müşteri ayse.k@ornek.com giriş yaptı") == "Müşteri a***@ornek.com giriş yaptı", "E-posta maskeleme"
assert maskele("sipariş 12345 tutar 250") == "sipariş 12345 tutar 250", "Kısa sayılar ve normal metin değişmemeli"
assert maskele("ref 12345678901234567890") == "ref 12345678901234567890", "20 haneli referans kart sayılmamalı (\\b sınırı)"
''',
  hints=['Kart deseni: üç kez "4 rakam + isteğe bağlı ayırıcı", ardından yakalanan son 4 rakam: <code>(?:\\d{4}[ -]?){3}(\\d{4})</code>.', 'Desenin iki ucuna <code>\\b</code> koy ki daha uzun sayıların içinden parça yakalanmasın.', '<code>re.sub</code>\'a fonksiyon verirsen eşleşmeye göre değişken metin üretebilirsin: <code>lambda m: ... m.group(1)</code>.'],
  why='Loglar genellikle daha geniş bir ekip ve araç zinciri (log toplayıcı, SIEM) tarafından görülür; kişisel veri ve kart bilgisi oraya açık düşmemeli (KVKK, PCI-DSS). Maskeleme veriyi log yazılmadan önce, tek bir fonksiyonda yapar; logging.Filter içinde çağırarak tüm loglara uygulanabilir. Önceden derlenmiş regex ile O(n). Sınırlar: regex tüm biçimleri yakalayamaz; asıl çözüm hassas veriyi hiç loglamamak ve yapılandırılmış log alanlarında izinli liste kullanmaktır. Kart doğrulaması için ayrıca Luhn kontrolü eklenebilir.',
  tags=['maskeleme', 'regex', 'KVKK', 're.sub'], min=8),

dict(id='b-399', topic='ETL ve Orkestrasyon', diff=1, kind='order',
  title='CSV oku, temizle, JSON yaz',
  q='<p>Ham CSV metnini okuyup tutarı sayı olmayan satırları eleyen ve temiz kayıtları JSON olarak yazdıran küçük ETL adımının satırlarını sırala.</p>',
  lines=[
    'import csv, io, json',
    r'ham = "no,tutar\n1,100\n2,abc\n3,250.5\n"',
    'satirlar = list(csv.DictReader(io.StringIO(ham)))',
    'temiz = [{"no": int(s["no"]), "tutar": float(s["tutar"])} for s in satirlar if s["tutar"].replace(".", "", 1).isdigit()]',
    'print(json.dumps(temiz))',
  ],
  expect='[{"no": 1, "tutar": 100.0}, {"no": 3, "tutar": 250.5}]\n',
  hints=['Extract → Transform → Load: oku, dönüştür, yaz.', 'DictReader bir dosya benzeri nesne ister; metni io.StringIO ile sarmalarsın.'],
  why='Her ETL adımı bir öncekinin çıktısına dayanır: çıkarma (CSV’yi sözlüklere), dönüştürme (tür çevirme + geçersizleri eleme), yükleme (JSON’a yazma). DictReader başlık satırını anahtar yapar. "abc" gibi bozuk değer elenir; gerçek hatlarda elenen satırlar sessizce kaybolmamalı, ayrı bir "karantina" dosyasına yazılıp sayılmalı. Not: isdigit kontrolü negatif sayıları reddeder; daha sağlam yol try/float/except ile ayrıştırmaktır.',
  tags=['ETL', 'csv', 'json', 'veri temizleme'], min=3),

dict(id='b-400', topic='ETL ve Orkestrasyon', diff=2, kind='rehberli',
  title='Tekrar çalıştırılabilir (idempotent) yükleme',
  q='<p>Gece çalışan iş bazen yarıda kesilip yeniden başlatılıyor; aynı kayıtlar ikinci kez yüklenince rapor iki katı ciro gösteriyor. <code>yukle(con, kayitlar)</code> fonksiyonunu SQLite <b>upsert</b> ile yaz: <code>siparis(no PRIMARY KEY, tutar, durum)</code> tablosuna <code>INSERT ... ON CONFLICT(no) DO UPDATE</code> ile her kaydı ekle ya da güncelle, tek bir transaction içinde yap ve işlenen kayıt sayısını döndür. Aynı veriyle iki kez çalıştırmak sonucu değiştirmemeli.</p>',
  guide=['SQL: <code>INSERT INTO siparis (no, tutar, durum) VALUES (?, ?, ?) ON CONFLICT(no) DO UPDATE SET tutar = excluded.tutar, durum = excluded.durum</code>', '<code>excluded</code>, eklenmeye çalışılan (çakışan) satırın değerlerini gösterir.', '<code>with con:</code> bloğu başarıda COMMIT, hatada ROLLBACK yapar.', '<code>con.executemany(sql, [(k["no"], k["tutar"], k["durum"]) for k in kayitlar])</code> ve <code>len(kayitlar)</code> döndür.'],
  example=r'''
import sqlite3
con = sqlite3.connect(":memory:")
con.execute("CREATE TABLE sayac (ad TEXT PRIMARY KEY, n INT)")
for _ in range(3):
    con.execute("INSERT INTO sayac VALUES ('ziyaret', 1) ON CONFLICT(ad) DO UPDATE SET n = n + 1")
print(con.execute("SELECT * FROM sayac").fetchall())
''',
  start=r'''
import sqlite3

def yukle(con, kayitlar):
    sql = "INSERT INTO siparis (no, tutar, durum) VALUES (?, ?, ?)"
    # TODO 1: ON CONFLICT(no) DO UPDATE SET ... excluded ... ekle
    # TODO 2: with con: bloğu içinde executemany ile yükle
    # TODO 3: işlenen kayıt sayısını döndür
    for k in kayitlar:
        con.execute(sql, (k["no"], k["tutar"], k["durum"]))
    return len(kayitlar)
''',
  sol=r'''
import sqlite3

def yukle(con, kayitlar):
    sql = (
        "INSERT INTO siparis (no, tutar, durum) VALUES (?, ?, ?) "
        "ON CONFLICT(no) DO UPDATE SET tutar = excluded.tutar, durum = excluded.durum"
    )
    with con:
        con.executemany(sql, [(k["no"], k["tutar"], k["durum"]) for k in kayitlar])
    return len(kayitlar)
''',
  tests=r'''
con = sqlite3.connect(":memory:")
con.execute("CREATE TABLE siparis (no INTEGER PRIMARY KEY, tutar REAL, durum TEXT)")
parti = [{"no": 1, "tutar": 100.0, "durum": "yeni"}, {"no": 2, "tutar": 50.0, "durum": "yeni"}]
try:
    assert yukle(con, parti) == 2, "İşlenen kayıt sayısı 2"
    yukle(con, parti)
except sqlite3.IntegrityError:
    assert False, "Aynı partiyi ikinci kez yüklemek hata vermemeli: ON CONFLICT(no) DO UPDATE kullan"
assert con.execute("SELECT COUNT(*), SUM(tutar) FROM siparis").fetchone() == (2, 150.0), "İki kez yükleme sonucu değiştirmemeli (idempotent)"
yukle(con, [{"no": 2, "tutar": 75.0, "durum": "odendi"}, {"no": 3, "tutar": 10.0, "durum": "yeni"}])
assert con.execute("SELECT tutar, durum FROM siparis WHERE no = 2").fetchone() == (75.0, "odendi"), "Var olan kayıt güncellenmeli"
assert con.execute("SELECT COUNT(*) FROM siparis").fetchone()[0] == 3, "Yeni kayıt eklenmeli"
''',
  hints=['Çakışma birincil anahtar üzerinde: <code>ON CONFLICT(no)</code>.', 'Güncellenecek değerler <code>excluded.sutun</code> ile alınır.', 'Toplu yükleme: <code>with con: con.executemany(sql, satirlar)</code>.'],
  why='İdempotent yükleme, aynı işi kaç kez çalıştırırsan çalıştır aynı sonucu verir; yeniden deneme ve geç gelen verilerle güvenle başa çıkmanın temelidir (Airflow gibi orkestratörler görevleri otomatik yeniden dener). Upsert, "var mı?" SELECT’i + INSERT/UPDATE ikilisinin yarış durumu içermeyen tek adımlık hâlidir. Tek transaction yarıda kalan yüklemeyi tamamen geri alır. executemany tek tek execute’tan hızlıdır. PostgreSQL’de aynı sözdizimi, MySQL’de ON DUPLICATE KEY UPDATE, diğerlerinde MERGE kullanılır.',
  tags=['upsert', 'ON CONFLICT', 'idempotent', 'transaction'], min=7),
]
