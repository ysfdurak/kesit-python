DS = 'pedal_izmir'
TOPIC = 'Veri seti: Pedal İzmir'
TITLE = 'Pedal İzmir (b-534 … b-550)'

TASKS = [
# ---------------------------------------------------------------- TEMEL
{
'id': 'b-534', 'lv': 'temel', 'diff': 1, 'kind': 'rehberli', 'min': 8,
'title': 'İlçelere göre yuva kapasitesi',
'q': '''<p>Pedal İzmir belediye meclisine yatırım raporu sunacak: <b>"Hangi ilçede kaç bisiklet yuvası var ve kapasitenin yüzde kaçı sahil istasyonlarında?"</b></p>
<p>İki fonksiyon yaz (<code>bk_stations</code> kayıtlarıyla):</p>
<ul><li><code>ilce_kapasitesi(istasyonlar)</code> → <code>[(ilçe, toplam_yuva), ...]</code>, yuvaya göre azalan (eşitlikte ilçe adı alfabetik)</li>
<li><code>sahil_payi(istasyonlar)</code> → <code>is_coastal == 1</code> istasyonların toplam yuvadaki payı (%, 1 ondalık)</li></ul>''',
'start': '''
import veri

istasyonlar = veri.kayitlar('pedal_izmir', 'bk_stations')


def ilce_kapasitesi(istasyonlar):
    toplam = {}
    for s in istasyonlar:
        # TODO: s['district'] için s['capacity'] ekle
        pass
    # TODO: (-yuva, ilçe) anahtarıyla sırala, liste döndür
    return []


def sahil_payi(istasyonlar):
    # TODO: sahil yuvaları / tüm yuvalar * 100
    pass


print(ilce_kapasitesi(istasyonlar))
print(sahil_payi(istasyonlar))
''',
'sol': '''
import veri

istasyonlar = veri.kayitlar('pedal_izmir', 'bk_stations')


def ilce_kapasitesi(istasyonlar):
    toplam = {}
    for s in istasyonlar:
        toplam[s['district']] = toplam.get(s['district'], 0) + s['capacity']
    return sorted(toplam.items(), key=lambda kv: (-kv[1], kv[0]))


def sahil_payi(istasyonlar):
    hepsi = sum(s['capacity'] for s in istasyonlar)
    sahil = sum(s['capacity'] for s in istasyonlar if s['is_coastal'] == 1)
    return round(100 * sahil / hepsi, 1)


print(ilce_kapasitesi(istasyonlar))
print(sahil_payi(istasyonlar))
''',
'tests': '''
_i = veri.kayitlar('pedal_izmir', 'bk_stations')
_k = ilce_kapasitesi(_i)
assert sum(n for _, n in _k) == ⟨sum(n for _, n in _k)⟩, "Toplam yuva «sum(n for _, n in _k)» olmalı"
assert _k[0] == ⟨_k[0]⟩, "En çok yuvası olan ilçe «_k[0]» olmalı"
assert _k == ⟨_k⟩, "İlçe sıralaması beklenenden farklı (azalan, eşitlikte alfabetik)"
assert abs(sahil_payi(_i) - ⟨sahil_payi(_i)⟩) < 0.05, "Sahil istasyonlarının kapasite payı «sahil_payi(_i)» olmalı (istasyon sayısı değil yuva)"
''',
'guide': ['ilce_kapasitesi: sözlükte ilçeye göre capacity topla (sayma değil toplama).', 'sorted(..., key=lambda kv: (-kv[1], kv[0])) ile azalan yuva, eşitlikte alfabetik.', 'sahil_payi: üreteç ifadesiyle iki toplam al: tüm yuvalar ve is_coastal == 1 olanlar.', 'round(100 * sahil / hepsi, 1) döndür.'],
'example': '''
# Benzer teknik: depolara göre raf kapasitesi ve soğuk zincir payı
depolar = [('Gebze', 120, 1), ('Tuzla', 80, 0), ('Gebze', 40, 0)]
t = {}
for yer, raf, _ in depolar:
    t[yer] = t.get(yer, 0) + raf
print(sorted(t.items(), key=lambda kv: (-kv[1], kv[0])))
print(round(100 * sum(r for _, r, s in depolar if s == 1) / sum(r for _, r, _ in depolar), 1))
''',
'hints': ['Toplama: t[k] = t.get(k, 0) + değer.', 'sum(... for s in istasyonlar if koşul) filtreli toplam verir.', 'Pay, istasyon sayısı değil yuva sayısı üzerinden.'],
'why': '''Kapasite sorusu "kaç istasyon" değil "kaç yuva" sorusudur; büyük istasyonlar ağırlığı belirler. Üreteç ifadesiyle <code>sum(... if ...)</code> filtreli toplamı ara liste kurmadan hesaplar. Sahil payı yüksekse yaz akşamlarında talebin sahile kaydığını ve sabah işe gidişte iç ilçelerde bisiklet kalmadığını tahmin edebilirsin; bu, ileri seviyedeki istasyon dengesizliği analizinin arka planıdır.''',
'tags': ['dict', 'sum', 'sıralama', 'kapasite'],
},
{
'id': 'b-535', 'lv': 'temel', 'diff': 1, 'kind': 'yaz', 'min': 8,
'title': 'Yağışlı saatler ve en yağışlı gün',
'q': '''<p>Analiz ekibi yağmurun talebe etkisini incelemeden önce temel bilgiyi istiyor: <b>"Yaz boyunca kaç saat yağış oldu ve en çok yağış hangi gün düştü?"</b></p>
<p><code>yagis_ozeti(hava)</code> fonksiyonunu yaz (<code>bk_weather</code> kayıtları; <code>obs_hour</code> ör. <code>'2024-06-01 00:00:00'</code>, <code>rain_mm</code> o saatteki yağış). Döndür: <code>(yağışlı_saat_sayısı, en_yağışlı_gün, o_günün_toplam_mm)</code>; yağışlı saat <code>rain_mm &gt; 0</code>, gün <code>'YYYY-MM-DD'</code> metni, mm 1 ondalık.</p>''',
'start': '''
import veri

hava = veri.kayitlar('pedal_izmir', 'bk_weather')


def yagis_ozeti(hava):
    # buraya yaz
    pass


print(yagis_ozeti(hava))
''',
'sol': '''
import veri

hava = veri.kayitlar('pedal_izmir', 'bk_weather')


def yagis_ozeti(hava):
    saat = 0
    gunluk = {}
    for h in hava:
        if h['rain_mm'] > 0:
            saat += 1
        gun = h['obs_hour'][:10]
        gunluk[gun] = gunluk.get(gun, 0) + h['rain_mm']
    en_gun = max(gunluk, key=gunluk.get)
    return saat, en_gun, round(gunluk[en_gun], 1)


print(yagis_ozeti(hava))
''',
'tests': '''
_y = yagis_ozeti(veri.kayitlar('pedal_izmir', 'bk_weather'))
assert isinstance(_y, tuple) and len(_y) == 3, "Üç elemanlı demet dönmeli"
assert _y[0] == ⟨_y[0]⟩, "Yağışlı saat sayısı «_y[0]» olmalı"
assert _y[1] == ⟨_y[1]⟩, "En yağışlı gün «_y[1]» olmalı"
assert abs(_y[2] - ⟨_y[2]⟩) < 0.05, "O günün toplam yağışı «_y[2]» mm olmalı"
''',
'hints': ['Günü obs_hour[:10] ile al.', 'Günlük toplam için sözlük: gunluk[gun] += rain_mm.', 'max(sozluk, key=sozluk.get) en büyük değerin anahtarını verir.'],
'why': '''<code>max(d, key=d.get)</code> "en büyük değere sahip anahtar" deyimidir; değer ve anahtarı birlikte istiyorsan <code>max(d.items(), key=lambda kv: kv[1])</code>. İzmir yazı kurak geçer; yağışlı saat sayısı az olduğu için yağmur etkisi analizinde örneklem küçüktür; sonuçları yorumlarken bunu akılda tut. Fonksiyondan birden çok değer döndürmek demet (tuple) ile yapılır; çağıran taraf <code>saat, gun, mm = yagis_ozeti(hava)</code> ile açabilir.''',
'tags': ['max key', 'tuple döndürme', 'günlük toplam'],
},
{
'id': 'b-536', 'lv': 'temel', 'diff': 1, 'kind': 'bug', 'min': 6,
'title': 'Abone / tek seferlik payı %100 çıkıyor (hatayı bul)',
'q': '''<p>Pazarlama raporunda kullanıcıların <b>%100'ü abone, %0'ı tek seferlik</b> görünüyor. Oysa uygulamada tek seferlik kullanım çok yaygın. <code>kullanici_payi(kullanicilar)</code> fonksiyonunu düzelt: <code>{'abone': yüzde, 'tek seferlik': yüzde}</code> (1 ondalık) döndürmeli.</p>''',
'start': '''
import veri

kullanicilar = veri.kayitlar('pedal_izmir', 'bk_users')


def kullanici_payi(kullanicilar):
    abone = tek = 0
    for k in kullanicilar:
        if k['user_type'] == 'abone':
            abone += 1
        elif k['user_type'] == 'tek_seferlik':
            tek += 1
    toplam = abone + tek
    return {'abone': round(100 * abone / toplam, 1), 'tek seferlik': round(100 * tek / toplam, 1)}


print(kullanici_payi(kullanicilar))
''',
'sol': '''
import veri

kullanicilar = veri.kayitlar('pedal_izmir', 'bk_users')


def kullanici_payi(kullanicilar):
    abone = tek = 0
    for k in kullanicilar:
        if k['user_type'] == 'abone':
            abone += 1
        elif k['user_type'] == 'tek seferlik':
            tek += 1
    toplam = abone + tek
    return {'abone': round(100 * abone / toplam, 1), 'tek seferlik': round(100 * tek / toplam, 1)}


print(kullanici_payi(kullanicilar))
''',
'tests': '''
_p = kullanici_payi(veri.kayitlar('pedal_izmir', 'bk_users'))
assert _p['tek seferlik'] > 0, "Tek seferlik kullanıcı sayısı 0 olamaz: veride bu değer nasıl yazılmış?"
assert _p == ⟨_p⟩, "Paylar beklenenden farklı"
''',
'hints': ['Veride gerçekte hangi metinler var? print({k[\'user_type\'] for k in kullanicilar}) ile bak.', 'Değer alt çizgiyle değil boşlukla yazılmış.', '\'tek_seferlik\' → \'tek seferlik\''],
'why': '''Sabit metinlerle (magic string) karşılaştırma yapan kod, veri sözlüğündeki yazımdan en küçük sapmada sessizce yanlış sonuç verir. Korunma yolları: (1) önce veriyi keşfet: <code>set(k['user_type'] for k in kullanicilar)</code>; (2) beklenmeyen değerde hata ver (<code>else: raise ValueError(...)</code>) ki sorun gizlenmesin; (3) sabitleri bir yerde tanımla (<code>TEK = 'tek seferlik'</code>) ya da <code>enum</code> kullan. Bu koddaki <code>elif</code> zinciri else olmadan bırakıldığı için tanınmayan her kullanıcı yok sayıldı ve payda küçüldü.''',
'tags': ['magic string', 'veri keşfi', 'hata avı'],
},
{
'id': 'b-537', 'lv': 'temel', 'diff': 1, 'kind': 'tamamla', 'min': 6,
'title': 'Bakımı süren bisikletler: arıza türüne göre',
'q': '''<p>Atölye şefi sabah toplantısında soruyor: <b>"Şu an bakımı sürmekte olan kaç kayıt var, hangi arıza türünde?"</b> <code>bk_maintenance</code>'ta <code>closed_at</code> boşsa bakım sürüyor.</p>
<p><code>suren_bakimlar(bakimlar)</code> → <code>{arıza: adet}</code>. Boşlukları doldur.</p>''',
'start': '''
import veri

bakimlar = veri.kayitlar('pedal_izmir', 'bk_maintenance')


def suren_bakimlar(bakimlar):
    sonuc = {}
    for b in bakimlar:
        if b['closed_at'] is not ___:
            continue
        sonuc[b[___]] = sonuc.get(b['issue'], ___) + 1
    return sonuc


print(suren_bakimlar(bakimlar))
''',
'sol': '''
import veri

bakimlar = veri.kayitlar('pedal_izmir', 'bk_maintenance')


def suren_bakimlar(bakimlar):
    sonuc = {}
    for b in bakimlar:
        if b['closed_at'] is not None:
            continue
        sonuc[b['issue']] = sonuc.get(b['issue'], 0) + 1
    return sonuc


print(suren_bakimlar(bakimlar))
''',
'tests': '''
_s = suren_bakimlar(veri.kayitlar('pedal_izmir', 'bk_maintenance'))
assert sum(_s.values()) == ⟨sum(_s.values())⟩, "Süren bakım sayısı «sum(_s.values())» olmalı"
assert _s == ⟨_s⟩, "Arıza türü dağılımı beklenenden farklı"
''',
'hints': ['Boş hücre None olarak gelir.', 'Anahtar arıza türü sütunu: \'issue\'.', 'get\'in varsayılan değeri 0.'],
'why': '''"Kapanmamış kayıt" (open ticket) sorgusu her operasyon panosunun temelidir; boş kapanış tarihi = devam eden iş. <code>is not None</code> ile atlamak (erken continue, guard clause) döngü gövdesini sade tutar. Not: bakım süresi analizinde kapanmamış kayıtlar ortalamaya katılamaz (süre bilinmiyor) ama göz ardı da edilemez; en uzun süren işler tam da bunlar olabilir.''',
'tags': ['None', 'guard clause', 'tamamla'],
},
{
'id': 'b-538', 'lv': 'temel', 'diff': 2, 'kind': 'yaz', 'min': 10,
'title': 'Büyük dosyayı akıtarak saatlik talep',
'q': '''<p><code>bk_trips</code> yaklaşık 117 bin satır. Hepsini sözlük listesine çevirmek yavaş ve bellek dostu değil. <b>"Günün her saatinde toplam kaç yolculuk başladı?"</b> sorusunu dosyayı satır satır okuyarak cevapla.</p>
<p><code>saatlik_talep(yol)</code> fonksiyonunu yaz: <code>yol</code> CSV dosyasının yoludur (<code>veri.yol('pedal_izmir', 'bk_trips')</code>). <code>csv.reader</code> ile oku, başlık satırını atla, <code>started_at</code> sütunundan (6. sütun, indeks 5) saati al. 24 elemanlı bir liste döndür: <code>liste[h]</code> = h saatinde başlayan yolculuk sayısı.</p>''',
'start': '''
import csv
import veri

yol = veri.yol('pedal_izmir', 'bk_trips')


def saatlik_talep(yol):
    # buraya yaz
    pass


talep = saatlik_talep(yol)
for saat, n in enumerate(talep):
    print(f'{saat:02d}:00 {n:>6} ' + '#' * (n // 500))
''',
'sol': '''
import csv
import veri

yol = veri.yol('pedal_izmir', 'bk_trips')


def saatlik_talep(yol):
    sayac = [0] * 24
    with open(yol, encoding='utf-8', newline='') as f:
        okuyucu = csv.reader(f)
        next(okuyucu)
        for satir in okuyucu:
            sayac[int(satir[5][11:13])] += 1
    return sayac


talep = saatlik_talep(yol)
for saat, n in enumerate(talep):
    print(f'{saat:02d}:00 {n:>6} ' + '#' * (n // 500))
''',
'tests': '''
_t = saatlik_talep(veri.yol('pedal_izmir', 'bk_trips'))
assert isinstance(_t, list) and len(_t) == 24, "24 elemanlı liste dönmeli (saat 0–23)"
assert sum(_t) == ⟨sum(_t)⟩, "Toplam yolculuk «sum(_t)» olmalı; başlık satırını saydın mı?"
assert _t.index(max(_t)) == ⟨_t.index(max(_t))⟩, "En yoğun saat «_t.index(max(_t))» olmalı"
assert _t == ⟨_t⟩, "Saatlik dağılım beklenenden farklı"
''',
'hints': ['[0] * 24 ile sabit uzunlukta sayaç listesi kur; indeks = saat.', 'with open(...) as f: okuyucu = csv.reader(f); next(okuyucu) başlığı atlar.', 'Saat: int(satir[5][11:13])'],
'why': '''Dosyayı akıtarak (streaming) işlemek bellekte yalnız bir satır tutar; dosya 10 GB da olsa çalışır. Sözlük yerine 24 elemanlı liste kullanmak doğaldır çünkü anahtarlar 0–23 arası ardışık tam sayılardır. <code>csv.reader</code> virgül içeren tırnaklı alanları doğru ayırır; <code>line.split(',')</code> bunu yapamaz. <code>next(okuyucu)</code> başlığı atlar; unutulursa <code>int('ed')</code> hatası alırsın. Grafikte iki tepe görülür: sabah 8 ve akşam 17–18; bu, bisikletin işe gidiş-geliş (commute) aracı olarak kullanıldığını gösterir.''',
'tags': ['csv', 'streaming', 'dosya', 'liste sayaç'],
},
# ---------------------------------------------------------------- ORTA
{
'id': 'b-539', 'lv': 'orta', 'diff': 2, 'kind': 'rehberli', 'min': 12,
'title': 'Kapanmamış yolculuklar hangi bisikletlerde?',
'q': '''<p>Müşteri hizmetlerine "yolculuğumu bitirdim ama ücret işlemeye devam ediyor" şikâyetleri geliyor. <code>bk_trips</code>'te <code>ended_at</code> boş olan yolculuklar kapanmamıştır. Soru: <b>"Bu kayıtlar rastgele mi dağılıyor, yoksa belirli bisikletlerde mi yoğunlaşıyor?"</b></p>
<p><code>acik_yolculuklar(yol)</code> fonksiyonunu yaz: dosyayı <code>csv.DictReader</code> ile akıt, <code>ended_at</code> boş (<code>''</code>) olanları <code>bike_id</code>'ye göre <code>Counter</code> ile say ve <code>[(bike_id, adet), ...]</code> listesini adede göre azalan (eşitlikte küçük bike_id önce) döndür. <code>bike_id</code> tam sayı olsun.</p>''',
'start': '''
import csv
from collections import Counter
import veri

yol = veri.yol('pedal_izmir', 'bk_trips')


def acik_yolculuklar(yol):
    sayac = Counter()
    with open(yol, encoding='utf-8', newline='') as f:
        for satir in csv.DictReader(f):
            # TODO: ended_at boşsa bike_id'yi (int) say
            pass
    # TODO: (-adet, bike_id) anahtarıyla sırala
    return []


liste = acik_yolculuklar(yol)
print(len(liste), 'bisiklet,', sum(n for _, n in liste), 'açık yolculuk')
print(liste)
''',
'sol': '''
import csv
from collections import Counter
import veri

yol = veri.yol('pedal_izmir', 'bk_trips')


def acik_yolculuklar(yol):
    sayac = Counter()
    with open(yol, encoding='utf-8', newline='') as f:
        for satir in csv.DictReader(f):
            if satir['ended_at'] == '':
                sayac[int(satir['bike_id'])] += 1
    return sorted(sayac.items(), key=lambda kv: (-kv[1], kv[0]))


liste = acik_yolculuklar(yol)
print(len(liste), 'bisiklet,', sum(n for _, n in liste), 'açık yolculuk')
print(liste)
''',
'tests': '''
_a = acik_yolculuklar(veri.yol('pedal_izmir', 'bk_trips'))
assert sum(n for _, n in _a) == ⟨sum(n for _, n in _a)⟩, "Toplam kapanmamış yolculuk «sum(n for _, n in _a)» olmalı"
assert len(_a) == ⟨len(_a)⟩, "Açık yolculuk «len(_a)» farklı bisiklette toplanıyor olmalı"
assert all(isinstance(b, int) for b, _ in _a), "bike_id tam sayı olmalı: int(satir['bike_id'])"
assert _a == ⟨_a⟩, "Bisiklet listesi ve sıralama beklenenden farklı"
''',
'guide': ['csv.DictReader her satırı {sütun: metin} sözlüğü olarak verir; boş hücre \'\' (boş metin) olur, None değil.', 'ended_at == \'\' ise sayac[int(satir[\'bike_id\'])] += 1.', 'Counter bir sözlüktür; items() ile sırala.', 'Anahtar: lambda kv: (-kv[1], kv[0]).'],
'example': '''
import csv, io
from collections import Counter
# Benzer teknik: kapanmamış destek kayıtlarını personele göre say (bellekte CSV)
metin = 'id,personel,kapanis\\n1,ali,2024-01-02\\n2,ayse,\\n3,ali,\\n4,ali,\\n'
sayac = Counter(r['personel'] for r in csv.DictReader(io.StringIO(metin)) if r['kapanis'] == '')
print(sayac.most_common())
''',
'hints': ['DictReader\'da boş alan None değil boş metindir.', 'Counter\'a olmayan anahtar sorunsuz eklenir: sayac[k] += 1.', 'return sorted(sayac.items(), key=lambda kv: (-kv[1], kv[0]))'],
'why': '''316 açık yolculuk yalnız birkaç bisiklette toplanıyor; 700 bisikletlik filoda bu rastlantı olamaz. Dedektif çıkarımı: sorun kullanıcıda değil, o bisikletlerin <b>kilit/IoT modülünde</b> (kilitlenince "yolculuk bitti" sinyali gitmiyor). Eylem: bu bisikletleri bakıma çek ve kilit arızası kayıtlarıyla karşılaştır. Teknik not: <code>csv.DictReader</code> boş hücreyi <code>''</code> olarak verir (<code>veri.kayitlar</code> ise None'a çevirir); hangi okuyucuyu kullandığını bilerek kontrol yaz. Counter'ın <code>most_common()</code>'ı eşitlikte sıra garanti etmediği için açık sıralama anahtarı kullandık.''',
'tags': ['csv.DictReader', 'Counter', 'veri kalitesi', 'dedektif'],
},
{
'id': 'b-540', 'lv': 'orta', 'diff': 2, 'kind': 'yaz', 'needs': ['sqlite3'], 'min': 14,
'title': 'En çok boşalan istasyonlar (SQL net akış)',
'q': '''<p>Lojistik ekibi kamyonla bisiklet taşıyarak dengeleme (rebalancing) yapıyor: <b>"Yaz boyunca hangi istasyonlardan çıkan yolculuk, gelen yolculuktan en fazla?"</b></p>
<p><code>bosalan_istasyonlar(con, n=5)</code> fonksiyonunu yaz (<code>con = veri.baglan('pedal_izmir', tablolar=['bk_trips', 'bk_stations'])</code>). Her istasyon için çıkış = o istasyondan başlayan yolculuk sayısı, varış = o istasyonda biten yolculuk sayısı (kapanmamışlar varışa girmez), net = varış − çıkış. En negatif net'e sahip <code>n</code> istasyonu <code>(ad, çıkış, varış, net)</code> olarak döndür (net artan, eşitlikte ad).</p>''',
'start': '''
import veri

con = veri.baglan('pedal_izmir', tablolar=['bk_trips', 'bk_stations'])


def bosalan_istasyonlar(con, n=5):
    # buraya yaz
    pass


for satir in bosalan_istasyonlar(con):
    print(satir)
''',
'sol': '''
import veri

con = veri.baglan('pedal_izmir', tablolar=['bk_trips', 'bk_stations'])


def bosalan_istasyonlar(con, n=5):
    sorgu = """
    WITH cikis AS (
        SELECT start_station AS sid, COUNT(*) AS c FROM bk_trips GROUP BY start_station
    ),
    varis AS (
        SELECT end_station AS sid, COUNT(*) AS v FROM bk_trips
        WHERE end_station IS NOT NULL GROUP BY end_station
    )
    SELECT s.name, COALESCE(c.c, 0) AS cikis, COALESCE(v.v, 0) AS varis,
           COALESCE(v.v, 0) - COALESCE(c.c, 0) AS net
    FROM bk_stations s
    LEFT JOIN cikis c ON c.sid = s.station_id
    LEFT JOIN varis v ON v.sid = s.station_id
    ORDER BY net, s.name
    LIMIT ?
    """
    return con.execute(sorgu, (n,)).fetchall()


for satir in bosalan_istasyonlar(con):
    print(satir)
''',
'tests': '''
_c = globals().get('con') or veri.baglan('pedal_izmir', tablolar=['bk_trips', 'bk_stations'])
_r = bosalan_istasyonlar(_c)
assert _r is not None and len(_r) == 5, "Varsayılan n=5 satır dönmeli"
assert _r[0] == ⟨tuple(_r[0])⟩, "En çok boşalan istasyon satırı beklenenden farklı"
assert _r == ⟨[tuple(x) for x in _r]⟩, "İlk 5 istasyon beklenenden farklı"
assert len(bosalan_istasyonlar(_c, 3)) == 3, "n parametresi LIMIT'e geçmeli (parametreli sorgu: LIMIT ?)"
''',
'hints': ['Çıkış ve varışı iki ayrı GROUP BY ile say (CTE), sonra istasyon tablosuna bağla.', 'Kapanmamış yolculukta end_station NULL: varış sayımında WHERE end_station IS NOT NULL.', 'LEFT JOIN + COALESCE(x, 0) hiç yolculuğu olmayan istasyonu da 0 ile tutar; LIMIT ? ile n\'i parametre olarak geçir.'],
'why': '''Net akış iki ayrı toplamın farkıdır; tek bir JOIN ile ikisini birden saymaya çalışmak satırları çarpar (her çıkış × her varış). Doğru yol: iki toplamı ayrı CTE'lerde hesaplayıp boyut tablosuna (istasyonlar) LEFT JOIN etmek. <code>LIMIT ?</code> parametreli sorgudur; değeri f-string ile SQL'e gömmek SQL enjeksiyonuna (injection) kapı açar. İş yorumu: net akış yaz toplamıdır; gerçek dengeleme ihtiyacı saat bazında değişir (sabah iç ilçeler boşalır, akşam sahil). Bunu ileri seviyedeki saatlik dengesizlik görevinde göreceksin.''',
'tags': ['sqlite3', 'CTE', 'LEFT JOIN', 'COALESCE', 'parametreli sorgu'],
},
{
'id': 'b-541', 'lv': 'orta', 'diff': 2, 'kind': 'rehberli', 'min': 15,
'title': 'Yağmur talebi ne kadar düşürüyor?',
'q': '''<p>Belediye "yağmurlu günlerde bisiklet sayısını azaltalım mı?" diye soruyor. <b>"Yağmurlu saatlerde, kuru saatlere göre saat başına ortalama yolculuk kaç?"</b></p>
<p>Dikkat: veride yağmur yalnız 10:00–19:59 arasında yağmış. Gece saatlerini kuru gruba katarsan ortalama haksız biçimde düşer. Bu yüzden yalnız <b>10–19 saatlerini</b> karşılaştır.</p>
<p><code>yagmur_etkisi(yol, hava)</code>: <code>yol</code> bk_trips CSV yolu, <code>hava</code> bk_weather kayıtları. Her gözlem saatinde (<code>obs_hour</code>, saat 10–19) başlayan yolculuk sayısını bul (<code>started_at</code>'ın ilk 13 karakteri = <code>'YYYY-MM-DD HH'</code>). Döndür: <code>{'yağmurlu': ort, 'kuru': ort, 'düşüş_yüzde': d}</code>; d = (1 − yağmurlu/kuru) × 100. Hepsi 1 ondalık.</p>''',
'start': '''
import csv
import veri

yol = veri.yol('pedal_izmir', 'bk_trips')
hava = veri.kayitlar('pedal_izmir', 'bk_weather')


def yagmur_etkisi(yol, hava):
    # 1) Saat anahtarına göre yolculuk sayısı: {'2024-06-01 08': 37, ...}
    sayac = {}
    with open(yol, encoding='utf-8', newline='') as f:
        okuyucu = csv.reader(f)
        next(okuyucu)
        for satir in okuyucu:
            # TODO: anahtar = satir[5][:13]; sayacı artır
            pass
    # 2) Gözlem saatlerini yağmurlu / kuru diye ayır (yalnız 10–19)
    yagmurlu, kuru = [], []
    for h in hava:
        saat = int(h['obs_hour'][11:13])
        # TODO: 10 <= saat <= 19 değilse atla
        # TODO: n = sayac.get(h['obs_hour'][:13], 0); rain_mm > 0 ise yagmurlu'ya, değilse kuru'ya ekle
    # TODO: ortalamaları ve düşüş yüzdesini döndür
    return {}


print(yagmur_etkisi(yol, hava))
''',
'sol': '''
import csv
import veri

yol = veri.yol('pedal_izmir', 'bk_trips')
hava = veri.kayitlar('pedal_izmir', 'bk_weather')


def yagmur_etkisi(yol, hava):
    sayac = {}
    with open(yol, encoding='utf-8', newline='') as f:
        okuyucu = csv.reader(f)
        next(okuyucu)
        for satir in okuyucu:
            k = satir[5][:13]
            sayac[k] = sayac.get(k, 0) + 1
    yagmurlu, kuru = [], []
    for h in hava:
        saat = int(h['obs_hour'][11:13])
        if not 10 <= saat <= 19:
            continue
        n = sayac.get(h['obs_hour'][:13], 0)
        (yagmurlu if h['rain_mm'] > 0 else kuru).append(n)
    y = sum(yagmurlu) / len(yagmurlu)
    k = sum(kuru) / len(kuru)
    return {'yağmurlu': round(y, 1), 'kuru': round(k, 1), 'düşüş_yüzde': round((1 - y / k) * 100, 1)}


print(yagmur_etkisi(yol, hava))
''',
'tests': '''
_e = yagmur_etkisi(veri.yol('pedal_izmir', 'bk_trips'), veri.kayitlar('pedal_izmir', 'bk_weather'))
assert set(_e) == {'yağmurlu', 'kuru', 'düşüş_yüzde'}, "Sözlükte yağmurlu, kuru ve düşüş_yüzde anahtarları olmalı"
assert abs(_e['yağmurlu'] - ⟨_e['yağmurlu']⟩) < 0.05, "Yağmurlu saat ortalaması «_e['yağmurlu']» olmalı"
assert abs(_e['kuru'] - ⟨_e['kuru']⟩) < 0.05, "Kuru saat ortalaması (yalnız 10–19) «_e['kuru']» olmalı; gece saatlerini dahil etmedin, değil mi?"
assert abs(_e['düşüş_yüzde'] - ⟨_e['düşüş_yüzde']⟩) < 0.05, "Düşüş yüzdesi «_e['düşüş_yüzde']» olmalı"
''',
'guide': ['Önce dosyayı bir kez akıtıp \'YYYY-MM-DD HH\' anahtarına göre yolculuk say.', 'Hava kayıtlarında saati al; 10–19 dışını atla.', 'O saatin yolculuk sayısını sayac.get(anahtar, 0) ile bul (hiç yolculuk yoksa 0, bu da bir gözlemdir).', 'rain_mm > 0 ise yağmurlu listesine, değilse kuru listesine ekle; ortalamaları ve düşüşü hesapla.'],
'example': '''
# Benzer teknik: kampanyalı ve kampanyasız günlerde ortalama satış (yalnız hafta içi)
satis = {'2024-05-06': 120, '2024-05-07': 90, '2024-05-08': 150, '2024-05-11': 300}
kampanya = {'2024-05-06': False, '2024-05-07': False, '2024-05-08': True, '2024-05-11': True}
haftaici = ['2024-05-06', '2024-05-07', '2024-05-08']
var = [satis[g] for g in haftaici if kampanya[g]]
yok = [satis[g] for g in haftaici if not kampanya[g]]
print(sum(var) / len(var), sum(yok) / len(yok))
''',
'hints': ['Saat anahtarı iki kaynakta aynı biçimde olmalı: ilk 13 karakter.', 'Yolculuğu olmayan saat de bir gözlemdir: get(k, 0).', '(yagmurlu if kosul else kuru).append(n) kısa bir seçim kalıbıdır.'],
'why': '''Bu görevin asıl dersi <b>karşılaştırılabilirlik</b>: yağmur gündüz yağdıysa kuru grup da gündüz saatlerinden oluşmalı; aksi halde gece saatlerinin düşük talebi "kuru" ortalamayı aşağı çeker ve yağmurun etkisi olduğundan küçük görünür (karıştırıcı değişken, confounder: saat). Burada basit bir kontrol (saat aralığını sınırlamak) yaptık; ileri seviyede her saat dilimini kendi içinde karşılaştıracağız. Yolculuk olmayan saatleri 0 olarak saymak da önemli; yalnız sözlükteki anahtarları gezseydik sıfır talepli yağmurlu saatler kaybolurdu.''',
'tags': ['csv', 'join anahtarı', 'karıştırıcı değişken', 'karşılaştırma'],
},
{
'id': 'b-542', 'lv': 'orta', 'diff': 2, 'kind': 'yaz', 'needs': ['sqlite3'], 'min': 12,
'title': 'Abone ve tek seferlik kullanıcı karşılaştırması (SQL)',
'q': '''<p>Fiyatlandırma ekibi abonelik ücretini gözden geçiriyor: <b>"Aboneler ve tek seferlik kullanıcılar yolculuk sayısı, ortalama süre ve ortalama ücret açısından nasıl ayrışıyor?"</b></p>
<p><code>tur_karsilastirma(con)</code> fonksiyonunu yaz (<code>con = veri.baglan('pedal_izmir', tablolar=['bk_trips', 'bk_users'])</code>). Yalnız kapanmış yolculuklar (<code>ended_at IS NOT NULL</code>). Her <code>user_type</code> için <code>(tür, yolculuk, ort_dk, ort_ücret)</code> döndür; süre dakika = <code>(julianday(ended_at) - julianday(started_at)) * 1440</code>; ortalamalar 1 ve 2 ondalık (<code>ROUND</code>), türe göre alfabetik.</p>''',
'start': '''
import veri

con = veri.baglan('pedal_izmir', tablolar=['bk_trips', 'bk_users'])


def tur_karsilastirma(con):
    # buraya yaz
    pass


for satir in tur_karsilastirma(con):
    print(satir)
''',
'sol': '''
import veri

con = veri.baglan('pedal_izmir', tablolar=['bk_trips', 'bk_users'])


def tur_karsilastirma(con):
    sorgu = """
    SELECT u.user_type,
           COUNT(*) AS yolculuk,
           ROUND(AVG((julianday(t.ended_at) - julianday(t.started_at)) * 1440), 1) AS ort_dk,
           ROUND(AVG(t.fare), 2) AS ort_ucret
    FROM bk_trips t
    JOIN bk_users u ON u.user_id = t.user_id
    WHERE t.ended_at IS NOT NULL
    GROUP BY u.user_type
    ORDER BY u.user_type
    """
    return con.execute(sorgu).fetchall()


for satir in tur_karsilastirma(con):
    print(satir)
''',
'tests': '''
_c = globals().get('con') or veri.baglan('pedal_izmir', tablolar=['bk_trips', 'bk_users'])
_r = tur_karsilastirma(_c)
assert _r is not None and [x[0] for x in _r] == ['abone', 'tek seferlik'], "İki satır, türe göre alfabetik: abone, tek seferlik"
assert _r[0][1] == ⟨_r[0][1]⟩, "Abonelerin kapanmış yolculuk sayısı «_r[0][1]» olmalı"
assert abs(_r[1][3] - ⟨_r[1][3]⟩) < 0.005, "Tek seferlik ortalama ücret «_r[1][3]» TL olmalı"
assert abs(_r[0][2] - ⟨_r[0][2]⟩) < 0.05, "Abonelerin ortalama süresi «_r[0][2]» dk olmalı"
''',
'hints': ['bk_trips ile bk_users\'ı user_id üzerinden JOIN et.', 'julianday farkı gün cinsindendir; 1440 ile çarparak dakikaya çevir.', 'WHERE t.ended_at IS NOT NULL; GROUP BY u.user_type ORDER BY u.user_type'],
'why': '''<code>julianday</code> bir tarihi kesirli gün sayısına çevirir; fark × 1440 dakikayı verir. Ortalama gibi toplu hesaplarda bu kayan nokta yaklaşımı yeterlidir (sınır karşılaştırmasında ise tam sayı saniye tercih et). Sonuç yorumu: süreler neredeyse aynı, ücret ise çok farklı; yani aboneler daha az ödeyerek aynı kullanımı alıyor. Bu, aboneliğin fiyatlandırma değil sadakat aracı olduğunu düşündürür; ama abonelik ücretinin kendisi (aylık sabit) bu tabloda yok. Eksik gelir kalemini unutup "aboneler zarar ettiriyor" demek klasik bir analiz hatasıdır.''',
'tags': ['sqlite3', 'julianday', 'JOIN', 'segment karşılaştırma'],
},
{
'id': 'b-543', 'lv': 'orta', 'diff': 2, 'kind': 'bug', 'needs': ['sqlite3'], 'min': 10,
'title': 'Gece yolculuklarının ortalama süresi None çıkıyor (hatayı bul)',
'q': '''<p>Güvenlik birimi gece kullanımını inceliyor: <b>"22:00 ile 05:59 arasında başlayan (kapanmış) yolculukların ortalama süresi kaç dakika?"</b> Aşağıdaki fonksiyon <code>None</code> döndürüyor. Hatayı bul, düzelt. Sonuç 1 ondalık dakika.</p>''',
'start': '''
import veri

con = veri.baglan('pedal_izmir', tablolar=['bk_trips'])


def gece_ortalama_sure(con):
    sorgu = """
    SELECT ROUND(AVG((julianday(ended_at) - julianday(started_at)) * 1440), 1)
    FROM bk_trips
    WHERE ended_at IS NOT NULL
      AND strftime('%H', started_at) BETWEEN '22' AND '05'
    """
    return con.execute(sorgu).fetchone()[0]


print(gece_ortalama_sure(con))
''',
'sol': '''
import veri

con = veri.baglan('pedal_izmir', tablolar=['bk_trips'])


def gece_ortalama_sure(con):
    sorgu = """
    SELECT ROUND(AVG((julianday(ended_at) - julianday(started_at)) * 1440), 1)
    FROM bk_trips
    WHERE ended_at IS NOT NULL
      AND (strftime('%H', started_at) >= '22' OR strftime('%H', started_at) < '06')
    """
    return con.execute(sorgu).fetchone()[0]


print(gece_ortalama_sure(con))
''',
'tests': '''
_c = globals().get('con') or veri.baglan('pedal_izmir', tablolar=['bk_trips'])
_g = gece_ortalama_sure(_c)
assert _g is not None, "Sonuç None: hiçbir satır koşulu sağlamıyor. BETWEEN '22' AND '05' hangi aralığı arıyor?"
assert abs(_g - ⟨_g⟩) < 0.05, "Gece yolculuklarının ortalama süresi «_g» dk olmalı"
''',
'hints': ['BETWEEN a AND b, a ≤ x ≤ b demektir; a > b ise boş küme.', 'Gece aralığı gece yarısını aşar: iki ayrı koşulun VEYA\'sı gerekir.', '(saat >= \'22\' OR saat < \'06\') ve paranteze dikkat (AND ile karışmasın).'],
'why': '''<b>Gece yarısını aşan aralık</b> klasik bir tuzaktır: 22 → 05 aralığı sayı doğrusunda tek parça değildir, BETWEEN '22' AND '05' boş küme döner ve AVG boş kümede NULL (Python'da None) verir. Doğrusu iki koşulun OR'u. Parantez de şart: <code>A AND B OR C</code> ifadesi <code>(A AND B) OR C</code> olarak okunur ve kapanmamış yolculuklar sızar. Saat metin olarak karşılaştırılıyor ('06' &lt; '22'); iki haneli sabit biçim olduğu için güvenli. Python'da aynı tuzak <code>22 &lt;= saat &lt;= 5</code> yazınca karşına çıkar.''',
'tags': ['sqlite3', 'BETWEEN', 'gece aralığı', 'hata avı'],
},
{
'id': 'b-544', 'lv': 'orta', 'diff': 2, 'kind': 'tamamla', 'needs': ['sqlite3'], 'min': 8,
'title': 'Elektrikli mi klasik mi? (SQL JOIN)',
'q': '''<p>Satın alma birimi yeni bisiklet siparişi verecek: <b>"Elektrikli ve klasik bisikletlerde yolculuk başına ortalama mesafe ve süre nasıl?"</b></p>
<p><code>model_karsilastirma(con)</code>: kapanmış yolculuklarda bisikletin <code>model</code>'ine göre <code>(model, yolculuk, ort_km, ort_dk)</code> döndürmeli (km 2, dk 1 ondalık; modele göre alfabetik). Boşlukları doldur.</p>''',
'start': '''
import veri

con = veri.baglan('pedal_izmir', tablolar=['bk_trips', 'bk_bikes'])


def model_karsilastirma(con):
    sorgu = """
    SELECT b.model,
           COUNT(*) AS yolculuk,
           ROUND(AVG(t.distance_km), 2) AS ort_km,
           ROUND(AVG((julianday(t.ended_at) - julianday(t.started_at)) * ___), 1) AS ort_dk
    FROM bk_trips t
    JOIN bk_bikes b ON ___
    WHERE t.ended_at ___
    GROUP BY ___
    ORDER BY b.model
    """
    return con.execute(sorgu).fetchall()


for satir in model_karsilastirma(con):
    print(satir)
''',
'sol': '''
import veri

con = veri.baglan('pedal_izmir', tablolar=['bk_trips', 'bk_bikes'])


def model_karsilastirma(con):
    sorgu = """
    SELECT b.model,
           COUNT(*) AS yolculuk,
           ROUND(AVG(t.distance_km), 2) AS ort_km,
           ROUND(AVG((julianday(t.ended_at) - julianday(t.started_at)) * 1440), 1) AS ort_dk
    FROM bk_trips t
    JOIN bk_bikes b ON b.bike_id = t.bike_id
    WHERE t.ended_at IS NOT NULL
    GROUP BY b.model
    ORDER BY b.model
    """
    return con.execute(sorgu).fetchall()


for satir in model_karsilastirma(con):
    print(satir)
''',
'tests': '''
_c = globals().get('con') or veri.baglan('pedal_izmir', tablolar=['bk_trips', 'bk_bikes'])
_r = model_karsilastirma(_c)
assert [x[0] for x in _r] == ['elektrikli', 'klasik'], "İki model alfabetik sırada olmalı"
assert _r == ⟨[tuple(x) for x in _r]⟩, "Model karşılaştırması beklenenden farklı"
''',
'hints': ['Bir gün 1440 dakikadır.', 'JOIN koşulu: b.bike_id = t.bike_id', 'Kapanmış yolculuk: IS NOT NULL; gruplama b.model.'],
'why': '''Mesafe neredeyse aynı ama elektrikli bisiklette süre belirgin kısa: elektrikli bisiklet aynı yolu daha hızlı alıyor. Bu, filonun daha az bisikletle aynı talebi karşılayabileceği anlamına gelir (bisiklet başına daha fazla yolculuk). Ama tek başına satın alma kararı için yetmez: batarya bakımı (bk_maintenance) ve şarj altyapısı maliyeti de tabloya girmeli. Teknik: <code>WHERE ... IS NOT NULL</code> kapanmamış yolculuklarda süreyi NULL yapacağı için AVG zaten onları atlardı, ama COUNT(*) saymaya devam ederdi; filtreyi açık yazmak sayıları da tutarlı yapar.''',
'tags': ['sqlite3', 'JOIN', 'julianday', 'tamamla'],
},
# ---------------------------------------------------------------- İLERİ
{
'id': 'b-545', 'lv': 'ileri', 'diff': 3, 'kind': 'rehberli', 'needs': ['pandas'], 'min': 15,
'title': 'Aynı anda iki yolculuktaki bisiklet (veri kalitesi)',
'q': '''<p>Veri mühendisliği ekibi bir denetim yapıyor: <b>"Bir bisiklet fiziksel olarak aynı anda iki yolculukta olamaz. Kaç yolculuk, aynı bisikletin bir önceki yolculuğu bitmeden başlamış görünüyor?"</b></p>
<p><code>cakisan_yolculuklar(t)</code> fonksiyonunu yaz (<code>t</code>: bk_trips DataFrame'i, zaman sütunları datetime). Kapanmış yolculukları <code>bike_id</code> ve <code>started_at</code>'e göre sırala; bir yolculuğun <code>started_at</code>'i aynı bisikletin önceki yolculuğunun <code>ended_at</code>'inden önceyse çakışma say. Döndür: <code>(çakışan_yolculuk_sayısı, etkilenen_bisiklet_sayısı)</code>, ikisi de <code>int</code>.</p>''',
'start': '''
import pandas as pd
import veri

t = veri.oku('pedal_izmir', 'bk_trips', parse_dates=['started_at', 'ended_at'])


def cakisan_yolculuklar(t):
    k = t.dropna(subset=['ended_at'])
    # TODO: bike_id, started_at'e göre sırala
    # TODO: onceki_bitis = groupby('bike_id')['ended_at'].shift()
    # TODO: cakisma = started_at < onceki_bitis
    # TODO: (çakışma sayısı, çakışması olan farklı bisiklet sayısı)
    pass


print(cakisan_yolculuklar(t))
''',
'sol': '''
import pandas as pd
import veri

t = veri.oku('pedal_izmir', 'bk_trips', parse_dates=['started_at', 'ended_at'])


def cakisan_yolculuklar(t):
    k = t.dropna(subset=['ended_at']).sort_values(['bike_id', 'started_at'])
    onceki_bitis = k.groupby('bike_id')['ended_at'].shift()
    cakisma = k['started_at'] < onceki_bitis
    return int(cakisma.sum()), int(k.loc[cakisma, 'bike_id'].nunique())


print(cakisan_yolculuklar(t))
''',
'tests': '''
_t = t if 't' in globals() else veri.oku('pedal_izmir', 'bk_trips', parse_dates=['started_at', 'ended_at'])
_c = cakisan_yolculuklar(_t)
assert isinstance(_c, tuple) and len(_c) == 2, "(çakışan yolculuk, bisiklet) demeti dönmeli"
assert _c == ⟨_c⟩, "Çakışma sayıları beklenenden farklı; sıralamayı shift'ten önce yaptın mı?"
_k = pd.DataFrame({'bike_id': [5, 5, 5, 6], 'started_at': pd.to_datetime(['2024-06-01 10:00', '2024-06-01 09:00', '2024-06-01 12:00', '2024-06-01 09:30']), 'ended_at': pd.to_datetime(['2024-06-01 10:30', '2024-06-01 10:15', '2024-06-01 12:20', '2024-06-01 09:50'])})
assert cakisan_yolculuklar(_k) == (1, 1), "Küçük örnek: 5 numaralı bisiklet 09:00–10:15 yolculuğu bitmeden 10:00'da yeniden çıkmış → 1 çakışma; satırlar karışık sırada verildi"
''',
'guide': ['Kapanmamış yolculukları at (hazır), sonra bike_id ve started_at\'e göre sırala.', 'groupby(\'bike_id\')[\'ended_at\'].shift() her satıra aynı bisikletin önceki bitişini getirir.', 'Karşılaştırma bool seri verir; NaT ile karşılaştırma False olur (ilk yolculuk).', 'Toplam = cakisma.sum(); bisiklet sayısı = çakışan satırların bike_id\'lerinin nunique()\'i; int\'e çevir.'],
'example': '''
import pandas as pd
# Benzer teknik: aynı plakanın otoparka çıkmadan yeniden girişi (kayıt hatası)
g = pd.DataFrame({'plaka': ['A', 'A', 'B', 'A'],
                  'giris': pd.to_datetime(['2024-01-01 08:00', '2024-01-01 09:00', '2024-01-01 08:30', '2024-01-01 12:00']),
                  'cikis': pd.to_datetime(['2024-01-01 10:00', '2024-01-01 11:00', '2024-01-01 09:00', '2024-01-01 13:00'])})
g = g.sort_values(['plaka', 'giris'])
hata = g['giris'] < g.groupby('plaka')['cikis'].shift()
print(int(hata.sum()), g.loc[hata, 'plaka'].unique())
''',
'hints': ['shift() satır sırasına göre çalışır: önce sort_values.', 'İlk yolculukta shift NaT verir; karşılaştırma False olur, ayrıca işlem gerekmez.', 'return int(cakisma.sum()), int(k.loc[cakisma, \'bike_id\'].nunique())'],
'why': '''Sonuç çarpıcı: yaklaşık 18 bin yolculuk çakışıyor ve çakışmalar filonun kullanılan bisikletlerinin neredeyse tamamına yayılıyor. Bu ölçekte bir sorun tek tük sensör arızası değil, <b>sistemsel bir veri üretim hatasıdır</b>: muhtemelen bike_id bir bisikletin değil yuvanın (dock) ya da IoT modülünün numarası, ya da kayıtlar farklı sistemlerden birleştirilirken numaralar çakışmış. Dedektif kuralı: anomali her yerdeyse, kuralı değil tanımı sorgula. Bisiklet bazlı analizler (bisiklet başına kullanım, bakım aralığı) bu çözülmeden güvenilir değildir; istasyon ve kullanıcı bazlı analizler etkilenmez. Teknik not: yalnız bir önceki yolculukla karşılaştırmak, üç yolculuğun iç içe geçtiği durumları kaçırabilir; tam kontrol için önceki bitişlerin <code>cummax()</code>'ı kullanılır.''',
'tags': ['pandas', 'groupby shift', 'veri kalitesi', 'dedektif'],
},
{
'id': 'b-546', 'lv': 'ileri', 'diff': 3, 'kind': 'yaz', 'needs': ['pandas'], 'min': 15,
'title': 'Saatlik talep profili: hafta içi ve hafta sonu',
'q': '''<p>Operasyon planlaması için: <b>"Hafta içi ve hafta sonu, ortalama bir günde her saatte kaç yolculuk başlıyor?"</b> Toplam sayı yanıltır, çünkü hafta içi gün sayısı hafta sonundan fazla.</p>
<p><code>saatlik_profil(t)</code> fonksiyonunu yaz. Satırlar saat (0–23), sütunlar <code>['hafta içi', 'hafta sonu']</code>; değer = o saat ve gün türündeki yolculuk sayısı / o gün türündeki <b>farklı tarih sayısı</b> (1 ondalık). Hafta sonu = Cumartesi ve Pazar (<code>dayofweek &gt;= 5</code>).</p>''',
'start': '''
import pandas as pd
import veri

t = veri.oku('pedal_izmir', 'bk_trips', parse_dates=['started_at'])


def saatlik_profil(t):
    # buraya yaz
    pass


p = saatlik_profil(t)
print(p)
print(p.idxmax())
''',
'sol': '''
import pandas as pd
import veri

t = veri.oku('pedal_izmir', 'bk_trips', parse_dates=['started_at'])


def saatlik_profil(t):
    d = pd.DataFrame({
        'saat': t['started_at'].dt.hour,
        'tur': (t['started_at'].dt.dayofweek >= 5).map({False: 'hafta içi', True: 'hafta sonu'}),
        'tarih': t['started_at'].dt.normalize(),
    })
    sayim = d.groupby(['saat', 'tur']).size().unstack(fill_value=0)
    gun_sayisi = d.groupby('tur')['tarih'].nunique()
    return (sayim / gun_sayisi).round(1)[['hafta içi', 'hafta sonu']]


p = saatlik_profil(t)
print(p)
print(p.idxmax())
''',
'tests': '''
_t = t if 't' in globals() else veri.oku('pedal_izmir', 'bk_trips', parse_dates=['started_at'])
_p = saatlik_profil(_t)
assert isinstance(_p, pd.DataFrame) and list(_p.columns) == ['hafta içi', 'hafta sonu'], "Sütunlar ['hafta içi', 'hafta sonu'] olmalı"
assert list(_p.index) == list(range(24)), "Satırlar 0–23 saatleri olmalı"
assert int(_p['hafta içi'].idxmax()) == ⟨int(_p['hafta içi'].idxmax())⟩, "Hafta içi en yoğun saat «int(_p['hafta içi'].idxmax())» olmalı"
assert int(_p['hafta sonu'].idxmax()) == ⟨int(_p['hafta sonu'].idxmax())⟩, "Hafta sonu en yoğun saat «int(_p['hafta sonu'].idxmax())» olmalı"
assert abs(float(_p.loc[8, 'hafta içi']) - ⟨float(_p.loc[8, 'hafta içi'])⟩) < 0.05, "Hafta içi 08:00 ortalaması «float(_p.loc[8, 'hafta içi'])» olmalı; toplamı gün sayısına böldün mü?"
assert abs(float(_p.loc[8, 'hafta sonu']) - ⟨float(_p.loc[8, 'hafta sonu'])⟩) < 0.05, "Hafta sonu 08:00 ortalaması «float(_p.loc[8, 'hafta sonu'])» olmalı"
''',
'hints': ['Üç türetilmiş sütun: saat, gün türü, tarih (dt.normalize()).', 'groupby([\'saat\', \'tur\']).size().unstack(fill_value=0) saat × tür tablosunu verir.', 'Gün sayısı: groupby(\'tur\')[\'tarih\'].nunique(); DataFrame / Series sütun adlarıyla hizalanarak böler.'],
'why': '''<b>Normalleştirme</b>: hafta içinde yaklaşık 2,5 kat daha fazla gün var; toplamları karşılaştırmak hafta içini yapay olarak büyük gösterir. DataFrame'i Series'e bölmek sütun adlarıyla hizalanır (sayim['hafta içi'] / gun_sayisi['hafta içi']); bu pandas'ın gücüdür ama adlar uyuşmazsa sessizce NaN üretir. Profil iki farklı davranış gösterir: hafta içi sabah ve akşam iki keskin tepe (işe gidiş-dönüş), hafta sonu tek ve yayvan bir öğleden sonra/akşam tepesi (eğlence). Bisiklet dengeleme vardiyaları bu iki profile göre ayrı planlanmalı.''',
'tags': ['pandas', 'unstack', 'normalleştirme', 'talep profili'],
},
{
'id': 'b-547', 'lv': 'ileri', 'diff': 3, 'kind': 'rehberli', 'needs': ['pandas'], 'min': 18,
'title': 'Yağmurun etkisi: aynı saat diliminde kontrollü karşılaştırma',
'q': '''<p>Orta seviyede 10–19 saatlerini toplu karşılaştırdın. Ama 17:00'deki kuru saatle 11:00'deki yağmurlu saati karşılaştırmak hâlâ adil değil. Daha sağlam soru: <b>"Aynı saat diliminde (ör. 17:00), yağmurlu saatlerde talep kuru saatlere göre yüzde kaç düşüyor?"</b></p>
<p><code>saat_bazli_yagmur(t, hava)</code> fonksiyonunu yaz. Her gözlem saati için başlayan yolculuk sayısını bul (yolculuğu olmayan saat 0). Günün her saati (0–23) için yağmurlu (<code>rain_mm &gt; 0</code>) ve kuru gözlemlerin ortalamasını al; <b>yalnız ikisi de olan saatler</b> için düşüş = (1 − yağmurlu/kuru) × 100. Saat → düşüş (1 ondalık) Series'i döndür.</p>''',
'start': '''
import pandas as pd
import veri

t = veri.oku('pedal_izmir', 'bk_trips', parse_dates=['started_at'])
hava = veri.oku('pedal_izmir', 'bk_weather', parse_dates=['obs_hour'])


def saat_bazli_yagmur(t, hava):
    sayim = t.groupby(t['started_at'].dt.floor('h')).size()
    h = hava.copy()
    # TODO: h['n'] = obs_hour'u sayim'a eşle (map), yoksa 0
    # TODO: h['saat'] = obs_hour.dt.hour; h['yagmur'] = rain_mm > 0
    # TODO: ort = h.groupby(['saat', 'yagmur'])['n'].mean().unstack()
    # TODO: ikisi de olan saatler (dropna), düşüş yüzdesi
    pass


d = saat_bazli_yagmur(t, hava)
print(d, d.mean())
''',
'sol': '''
import pandas as pd
import veri

t = veri.oku('pedal_izmir', 'bk_trips', parse_dates=['started_at'])
hava = veri.oku('pedal_izmir', 'bk_weather', parse_dates=['obs_hour'])


def saat_bazli_yagmur(t, hava):
    sayim = t.groupby(t['started_at'].dt.floor('h')).size()
    h = hava.copy()
    h['n'] = h['obs_hour'].map(sayim).fillna(0)
    h['saat'] = h['obs_hour'].dt.hour
    h['yagmur'] = h['rain_mm'] > 0
    ort = h.groupby(['saat', 'yagmur'])['n'].mean().unstack().dropna()
    return ((1 - ort[True] / ort[False]) * 100).round(1)


d = saat_bazli_yagmur(t, hava)
print(d, d.mean())
''',
'tests': '''
_t = t if 't' in globals() else veri.oku('pedal_izmir', 'bk_trips', parse_dates=['started_at'])
_d = saat_bazli_yagmur(_t, veri.oku('pedal_izmir', 'bk_weather', parse_dates=['obs_hour']))
assert isinstance(_d, pd.Series), "Sonuç saat → düşüş Series'i olmalı"
assert [int(x) for x in _d.index] == ⟨[int(x) for x in _d.index]⟩, "Yalnız hem yağmurlu hem kuru gözlemi olan saatler kalmalı"
assert abs(float(_d.loc[17]) - ⟨float(_d.loc[17])⟩) < 0.05, "17:00'de düşüş «float(_d.loc[17])» olmalı"
assert abs(float(_d.loc[12]) - ⟨float(_d.loc[12])⟩) < 0.05, "12:00'de düşüş «float(_d.loc[12])» olmalı; yolculuğu olmayan saatleri 0 saydın mı?"
assert abs(float(_d.mean()) - ⟨round(float(_d.mean()), 2)⟩) < 0.05, "Saatlerin ortalama düşüşü yaklaşık «round(float(_d.mean()), 1)» olmalı"
''',
'guide': ['Yolculukları saat başına yuvarlayıp say: dt.floor(\'h\') (hazır).', 'Hava tablosuna her gözlem saatinin yolculuk sayısını map ile getir; eşleşmeyen saat = 0 (fillna).', 'Saat (0–23) ve yağmur (bool) ile grupla, ortalamayı unstack ile iki sütuna aç.', 'dropna() ile yalnız iki grubu da olan saatleri tut; (1 - ort[True] / ort[False]) * 100.'],
'example': '''
import pandas as pd
# Benzer teknik: aynı mağazada indirimli ve indirimsiz günlerin karşılaştırması (mağaza içi kontrol)
s = pd.DataFrame({'magaza': ['A', 'A', 'A', 'B', 'B', 'C'], 'indirim': [True, False, False, True, False, False], 'satis': [150, 100, 110, 80, 60, 70]})
o = s.groupby(['magaza', 'indirim'])['satis'].mean().unstack().dropna()
print(((o[True] / o[False] - 1) * 100).round(1))
''',
'hints': ['Series.map(başka_series) indeks eşleştirir: obs_hour → sayım.', 'unstack() ikinci düzeydeki True/False değerlerini sütun yapar; bir saatte yağmur yoksa True sütunu NaN olur.', 'return ((1 - ort[True] / ort[False]) * 100).round(1)'],
'why': '''Bu, <b>tabakalama</b> (stratification) ile karıştırıcı değişkeni kontrol etmektir: yağmurlu ve kuru saatleri aynı saat dilimi içinde karşılaştırınca "günün saati" etkisi ortadan kalkar. Sonuç, toplu karşılaştırmadan farklı (ve daha güvenilir) bir etki büyüklüğü verir. Hâlâ sınırlar var: yağmurlu gözlem sayısı her saatte çok az (birkaç gün); tek bir fırtınalı gün sonucu belirler. Bu yüzden saat bazlı düşüşlerin ortalamasını raporlarken gözlem sayısını da ver. Bir sonraki adım regresyon olurdu: talep ~ saat + gün türü + yağmur + sıcaklık.''',
'tags': ['pandas', 'map', 'unstack', 'tabakalama', 'karıştırıcı değişken'],
},
{
'id': 'b-548', 'lv': 'ileri', 'diff': 3, 'kind': 'yaz', 'needs': ['pandas'], 'min': 18,
'title': 'Hafta içi sabah zirvesinde boşalan istasyonlar',
'q': '''<p>Dengeleme kamyonları sabah 07:00'den önce yola çıkacak: <b>"Hafta içi sabah zirvesinde (07:00–09:59) hangi istasyonlar ortalama bir sabahta en çok bisiklet kaybediyor ve bu kapasitesinin ne kadarı?"</b></p>
<p><code>sabah_kaybi(t, ist, n=5)</code> fonksiyonunu yaz. Hafta içi günlerde, saat 7–9 arasında: çıkış = o istasyondan başlayan yolculuklar (<code>started_at</code>), varış = o istasyonda biten yolculuklar (<code>ended_at</code>, <code>end_station</code>; kapanmamışlar hariç). Net = varış − çıkış, toplam net'i <b>hafta içi farklı tarih sayısına</b> (<code>started_at</code> üzerinden) böl. Sonuç: <code>name</code>, <code>capacity</code>, <code>net_ort</code> (1 ondalık), <code>oran</code> (= net_ort / capacity, 2 ondalık) sütunlu, net_ort'a göre artan ilk <code>n</code> satırlık DataFrame (indeks 0'dan).</p>''',
'start': '''
import pandas as pd
import veri

t = veri.oku('pedal_izmir', 'bk_trips', parse_dates=['started_at', 'ended_at'])
ist = veri.oku('pedal_izmir', 'bk_stations')


def sabah_kaybi(t, ist, n=5):
    # buraya yaz
    pass


print(sabah_kaybi(t, ist))
''',
'sol': '''
import pandas as pd
import veri

t = veri.oku('pedal_izmir', 'bk_trips', parse_dates=['started_at', 'ended_at'])
ist = veri.oku('pedal_izmir', 'bk_stations')


def sabah_kaybi(t, ist, n=5):
    bas = t['started_at']
    c = t[(bas.dt.dayofweek < 5) & bas.dt.hour.between(7, 9)]
    gun_sayisi = c['started_at'].dt.normalize().nunique()
    k = t.dropna(subset=['ended_at'])
    bit = k['ended_at']
    v = k[(bit.dt.dayofweek < 5) & bit.dt.hour.between(7, 9)]
    cikis = c.groupby('start_station').size()
    varis = v.groupby(v['end_station'].astype(int)).size()
    net = varis.sub(cikis, fill_value=0) / gun_sayisi
    df = ist[['station_id', 'name', 'capacity']].copy()
    df['net_ort'] = df['station_id'].map(net).fillna(0).round(1)
    df['oran'] = (df['net_ort'] / df['capacity']).round(2)
    return df.sort_values(['net_ort', 'name']).head(n)[['name', 'capacity', 'net_ort', 'oran']].reset_index(drop=True)


print(sabah_kaybi(t, ist))
''',
'tests': '''
_t = t if 't' in globals() else veri.oku('pedal_izmir', 'bk_trips', parse_dates=['started_at', 'ended_at'])
_s = sabah_kaybi(_t, veri.oku('pedal_izmir', 'bk_stations'))
assert isinstance(_s, pd.DataFrame) and list(_s.columns) == ['name', 'capacity', 'net_ort', 'oran'], "Sütunlar: name, capacity, net_ort, oran"
assert len(_s) == 5 and list(_s.index) == [0, 1, 2, 3, 4], "Varsayılan 5 satır, indeks 0'dan"
assert _s['name'].tolist() == ⟨_s['name'].tolist()⟩, "En çok boşalan 5 istasyon beklenenden farklı"
assert abs(float(_s.loc[0, 'net_ort']) - ⟨float(_s.loc[0, 'net_ort'])⟩) < 0.05, "İlk istasyonun sabah net ortalaması «float(_s.loc[0, 'net_ort'])» olmalı; hafta içi gün sayısına böldün mü?"
assert abs(float(_s.loc[0, 'oran']) - ⟨float(_s.loc[0, 'oran'])⟩) < 0.005, "İlk istasyonun kapasite oranı «float(_s.loc[0, 'oran'])» olmalı"
''',
'hints': ['Çıkış ve varış farklı zaman sütunlarıyla süzülür: started_at ve ended_at.', 'Series.sub(diğer, fill_value=0) bir tarafta olmayan istasyonu 0 sayarak çıkarır.', 'İstasyon tablosuna map ile net\'i getir; olmayanı fillna(0); sort_values([\'net_ort\', \'name\']).head(n).'],
'why': '''Bu görev gerçek bir operasyon sorusunun tam zincirini içeriyor: zaman penceresi (hafta içi 7–9), iki farklı olay zamanı (çıkış başlangıca, varış bitişe göre), hizalanmamış iki seriyi güvenli çıkarma (<code>sub(..., fill_value=0)</code>; düz <code>-</code> bir tarafta olmayan istasyonu NaN yapar), normalleştirme (gün başına) ve kapasiteye oranlama. <code>oran</code> -0.5 ise istasyon ortalama bir sabahta yuvalarının yarısı kadar bisiklet kaybediyor demektir; kamyonun önce oraya gitmesi gerekir. Uyarı: ortalama, tek tek günlerdeki tepe ihtiyacını gizler; planlamada %90'lık dilim de kullanılır.''',
'tags': ['pandas', 'sub fill_value', 'zaman penceresi', 'rebalancing'],
},
{
'id': 'b-549', 'lv': 'ileri', 'diff': 3, 'kind': 'rehberli', 'needs': ['pandas'], 'min': 15,
'title': 'Abonelik ücret kuralı denetimi: ilk 30 dakika ücretsiz mi?',
'q': '''<p>İç denetim ücretlendirme motorunu test ediyor. Kural: <b>abonelerde ilk 30 dakika ücretsiz</b>, sonrası dakika başı ücretli. Sorular:</p>
<ol><li>30 dakika ve altı süren abone yolculuklarından kaçı ücretlendirilmiş (<code>fare &gt; 0</code>)?</li>
<li>30 dakikayı aşan abone yolculuklarında ücret / (süre − 30) oranının <b>medyanı</b> nedir (yani fiili dakika ücreti)?</li></ol>
<p><code>abone_denetimi(t, k)</code> fonksiyonunu yaz (<code>t</code>: bk_trips, <code>k</code>: bk_users). Kapanmış yolculuklar; süre <code>total_seconds() / 60</code>. Döndür: <code>{'ihlal': adet, 'ihlal_toplam_tl': toplam (2 ondalık), 'dakika_ucreti': medyan (2 ondalık)}</code>.</p>''',
'start': '''
import pandas as pd
import veri

t = veri.oku('pedal_izmir', 'bk_trips', parse_dates=['started_at', 'ended_at'])
k = veri.oku('pedal_izmir', 'bk_users')


def abone_denetimi(t, k):
    d = t.dropna(subset=['ended_at']).merge(k[['user_id', 'user_type']], on='user_id')
    d = d[d['user_type'] == 'abone'].copy()
    d['dk'] = (d['ended_at'] - d['started_at']).dt.total_seconds() / 60
    # TODO: ihlaller = d[(d['dk'] <= 30) & (d['fare'] > 0)]   (paranteze dikkat!)
    # TODO: uzun = d[d['dk'] > 30]; oran = fare / (dk - 30); medyan
    # TODO: sözlüğü döndür
    pass


print(abone_denetimi(t, k))
''',
'sol': '''
import pandas as pd
import veri

t = veri.oku('pedal_izmir', 'bk_trips', parse_dates=['started_at', 'ended_at'])
k = veri.oku('pedal_izmir', 'bk_users')


def abone_denetimi(t, k):
    d = t.dropna(subset=['ended_at']).merge(k[['user_id', 'user_type']], on='user_id')
    d = d[d['user_type'] == 'abone'].copy()
    d['dk'] = (d['ended_at'] - d['started_at']).dt.total_seconds() / 60
    ihlal = d[(d['dk'] <= 30) & (d['fare'] > 0)]
    uzun = d[d['dk'] > 30]
    oran = uzun['fare'] / (uzun['dk'] - 30)
    return {'ihlal': int(len(ihlal)),
            'ihlal_toplam_tl': round(float(ihlal['fare'].sum()), 2),
            'dakika_ucreti': round(float(oran.median()), 2)}


print(abone_denetimi(t, k))
''',
'tests': '''
_t = t if 't' in globals() else veri.oku('pedal_izmir', 'bk_trips', parse_dates=['started_at', 'ended_at'])
_a = abone_denetimi(_t, veri.oku('pedal_izmir', 'bk_users'))
assert set(_a) == {'ihlal', 'ihlal_toplam_tl', 'dakika_ucreti'}, "Sözlükte ihlal, ihlal_toplam_tl ve dakika_ucreti anahtarları olmalı"
assert _a['ihlal'] == ⟨_a['ihlal']⟩, "Kuralı ihlal eden «_a['ihlal']» abone yolculuğu bekleniyor"
assert abs(_a['ihlal_toplam_tl'] - ⟨_a['ihlal_toplam_tl']⟩) < 0.005, "İhlallerin toplam tutarı «_a['ihlal_toplam_tl']» TL olmalı"
assert abs(_a['dakika_ucreti'] - ⟨_a['dakika_ucreti']⟩) < 0.005, "Fiili dakika ücreti medyanı «_a['dakika_ucreti']» TL olmalı"
''',
'guide': ['Kapanmış yolculuklara kullanıcı türünü ekle, aboneleri süz, süreyi dakikaya çevir (hazır).', 'İki koşulu & ile birleştir ve HER koşulu paranteze al: (d[\'dk\'] <= 30) & (d[\'fare\'] > 0).', '30 dakikayı aşanlarda fare / (dk - 30) serisini hesapla, median() al.', 'Sonuçları int / float\'a çevirip yuvarla.'],
'example': '''
import pandas as pd
# Benzer teknik: otopark kuralı "ilk 15 dk ücretsiz" denetimi
p = pd.DataFrame({'dk': [10, 15, 40, 75], 'ucret': [0.0, 0.5, 50.0, 120.0]})
ihlal = p[(p['dk'] <= 15) & (p['ucret'] > 0)]
uzun = p[p['dk'] > 15]
print(len(ihlal), round((uzun['ucret'] / (uzun['dk'] - 15)).median(), 2))
''',
'hints': ['pandas\'ta & ve | karşılaştırmalardan önce bağlanır: parantezsiz yazım TypeError ya da yanlış sonuç verir.', 'Medyan aykırı değerlere dayanıklıdır; ortalama yerine onu kullan.', 'İhlal tutarlarına bak: kuruş düzeyindeyse bu yuvarlama, gerçek ücretlendirme değil.'],
'why': '''Denetim sonucunun yorumu tekniğin kendisi kadar önemli: kuralı "ihlal eden" az sayıda yolculuk var ve tutarları <b>kuruş düzeyinde</b>; hepsi süresi tam 30 dakikaya çok yakın yolculuklar. Bu bir ücretlendirme hatası değil, motorun süreyi saniye hassasiyetinde hesaplayıp sınırda yuvarlamasından doğan bir <b>sınır etkisi</b>. Raporda "kural ihlal ediliyor" demek yerine "sınır değerinde yuvarlama tutarsızlığı, toplam etkisi X TL" demek doğru. Dakika ücretinin medyanı ise tarifeyi tersine mühendislikle (reverse engineering) ortaya çıkarır: tarife belgesiyle karşılaştır. Operatör önceliği: <code>d['dk'] &lt;= 30 &amp; d['fare'] &gt; 0</code> yazılırsa Python önce <code>30 &amp; d['fare']</code>'yi hesaplamaya çalışır.''',
'tags': ['pandas', 'boolean maske', 'operatör önceliği', 'denetim', 'medyan'],
},
{
'id': 'b-550', 'lv': 'ileri', 'diff': 3, 'kind': 'yaz', 'needs': ['sqlite3'], 'min': 18,
'title': 'Aktivasyon: ilk yolculuktan sonraki 7 gün içinde ikinci yolculuk (SQL)',
'q': '''<p>Büyüme ekibinin "aktivasyon" tanımı: <b>kullanıcının ikinci yolculuğu, ilk yolculuğundan sonraki 7 gün (7 × 24 saat) içinde başlamışsa</b> kullanıcı aktive olmuştur. Soru: <b>"Yolculuk yapmış kullanıcıların yüzde kaçı aktive oldu, kullanıcı türüne göre?"</b></p>
<p><code>aktivasyon(con)</code> fonksiyonunu yaz (<code>con = veri.baglan('pedal_izmir', tablolar=['bk_trips', 'bk_users'])</code>). Pencere fonksiyonuyla her kullanıcının yolculuklarını <code>started_at</code>'e göre numaralandır (<code>ROW_NUMBER</code>); 1. ve 2. yolculuğun başlangıç farkını <code>julianday</code> ile gün olarak al. Sonuç: <code>[(user_type, kullanıcı_sayısı, aktivasyon_yüzdesi), ...]</code>, yüzde 1 ondalık, türe göre alfabetik. Tek yolculuğu olan kullanıcı aktive değildir ama paydada sayılır.</p>''',
'start': '''
import veri

con = veri.baglan('pedal_izmir', tablolar=['bk_trips', 'bk_users'])


def aktivasyon(con):
    # buraya yaz
    pass


for satir in aktivasyon(con):
    print(satir)
''',
'sol': '''
import veri

con = veri.baglan('pedal_izmir', tablolar=['bk_trips', 'bk_users'])


def aktivasyon(con):
    sorgu = """
    WITH sirali AS (
        SELECT user_id, started_at,
               ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY started_at, trip_id) AS rn
        FROM bk_trips
    ),
    ilk_iki AS (
        SELECT user_id,
               MAX(CASE WHEN rn = 1 THEN started_at END) AS ilk,
               MAX(CASE WHEN rn = 2 THEN started_at END) AS ikinci
        FROM sirali
        WHERE rn <= 2
        GROUP BY user_id
    )
    SELECT u.user_type,
           COUNT(*) AS kullanici,
           ROUND(100.0 * SUM(i.ikinci IS NOT NULL AND julianday(i.ikinci) - julianday(i.ilk) <= 7) / COUNT(*), 1) AS oran
    FROM ilk_iki i
    JOIN bk_users u ON u.user_id = i.user_id
    GROUP BY u.user_type
    ORDER BY u.user_type
    """
    return con.execute(sorgu).fetchall()


for satir in aktivasyon(con):
    print(satir)
''',
'tests': '''
_c = globals().get('con') or veri.baglan('pedal_izmir', tablolar=['bk_trips', 'bk_users'])
_r = aktivasyon(_c)
assert _r is not None and [x[0] for x in _r] == ['abone', 'tek seferlik'], "İki satır: abone, tek seferlik"
assert sum(x[1] for x in _r) == ⟨sum(x[1] for x in _r)⟩, "Yolculuk yapmış toplam kullanıcı «sum(x[1] for x in _r)» olmalı (her kullanıcı bir kez)"
assert abs(_r[0][2] - ⟨_r[0][2]⟩) < 0.05, "Abonelerde aktivasyon «_r[0][2]»% olmalı"
assert abs(_r[1][2] - ⟨_r[1][2]⟩) < 0.05, "Tek seferliklerde aktivasyon «_r[1][2]»% olmalı; tek yolculuklu kullanıcılar paydada mı?"
''',
'hints': ['ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY started_at) ile 1., 2. yolculuğu işaretle.', 'Koşullu toplama ile satırları sütuna çevir: MAX(CASE WHEN rn = 2 THEN started_at END).', 'İkinci yolculuk yoksa NULL; koşulda ikinci IS NOT NULL ve julianday farkı <= 7.'],
'why': '''<code>ROW_NUMBER</code> + koşullu toplama (<code>MAX(CASE WHEN ...)</code>) "her kullanıcının ilk iki olayını yan yana koy" kalıbıdır; LAG ile de çözülebilir (rn = 2 satırında LAG(started_at) ilk yolculuğu verir). ORDER BY'a <code>trip_id</code> eklemek aynı saniyede başlayan iki yolculukta sırayı deterministik yapar. Paydaya tek yolculuklu kullanıcıları katmak kritik: onları dışlarsan aktivasyon oranı yapay olarak yükselir (yalnız geri dönenlerin içinde "kaç tanesi hızlı döndü" sorusuna dönüşür). Not: veri Haziran–Ağustos ile sınırlı; 31 Ağustos'ta ilk yolculuğunu yapanın 7 günlük penceresi kapanmadı (sağ sansür), kesin analizde son 7 günün yeni kullanıcıları dışarıda tutulur.''',
'tags': ['sqlite3', 'ROW_NUMBER', 'koşullu toplama', 'aktivasyon', 'kohort'],
},
]
