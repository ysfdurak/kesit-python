DS = 'kanat_havayollari'
TOPIC = 'Veri seti: Kanat Havayolları'
TITLE = 'Kanat Havayolları (b-517 … b-533)'

TASKS = [
# ---------------------------------------------------------------- TEMEL
{
'id': 'b-517', 'lv': 'temel', 'diff': 1, 'kind': 'rehberli', 'min': 9,
'title': 'Aylara göre uçuş iptal oranı',
'q': '''<p>Kanat Havayolları operasyon kontrol merkezi aylık rapor hazırlıyor: <b>"Eylül–Aralık arasında her ay planlanan uçuşların yüzde kaçı iptal edildi?"</b></p>
<p><code>aylik_iptal(ucuslar)</code> fonksiyonunu yaz: ayı <code>sched_dep</code> metninden (<code>'2024-09-01 06:00:00'</code> → 9) al; her ay için <code>status == 'cancelled'</code> uçuşların o ayın tüm uçuşlarına oranını 2 ondalıkla <code>{ay: yüzde}</code> olarak döndür.</p>''',
'start': '''
import veri

ucuslar = veri.kayitlar('kanat_havayollari', 'hv_flights')


def aylik_iptal(ucuslar):
    toplam, iptal = {}, {}
    for u in ucuslar:
        ay = int(u['sched_dep'][5:7])
        # TODO: toplam[ay] sayacını artır
        # TODO: uçuş iptalse iptal[ay] sayacını artır
        pass
    # TODO: her ay için 100 * iptal / toplam (2 ondalık); iptali olmayan ay 0.0
    return {}


print(aylik_iptal(ucuslar))
''',
'sol': '''
import veri

ucuslar = veri.kayitlar('kanat_havayollari', 'hv_flights')


def aylik_iptal(ucuslar):
    toplam, iptal = {}, {}
    for u in ucuslar:
        ay = int(u['sched_dep'][5:7])
        toplam[ay] = toplam.get(ay, 0) + 1
        if u['status'] == 'cancelled':
            iptal[ay] = iptal.get(ay, 0) + 1
    return {ay: round(100 * iptal.get(ay, 0) / n, 2) for ay, n in sorted(toplam.items())}


print(aylik_iptal(ucuslar))
''',
'tests': '''
_a = aylik_iptal(veri.kayitlar('kanat_havayollari', 'hv_flights'))
assert list(_a) == [9, 10, 11, 12], "Anahtarlar tam sayı ay numaraları olmalı: 9, 10, 11, 12"
assert _a == ⟨_a⟩, "Aylık iptal oranları beklenenden farklı"
assert aylik_iptal([{'sched_dep': '2024-09-03 10:00:00', 'status': 'landed'}]) == {9: 0.0}, "İptali olmayan ay 0.0 olmalı (KeyError değil)"
''',
'guide': ['Ayı dilimle al ve int() ile sayıya çevir (iskelette hazır).', 'Her uçuşta toplam sayacını, iptalse iptal sayacını artır.', 'Sözlük comprehension\'da iptal.get(ay, 0) kullan; iptali olmayan ay da sonuçta görünsün.', 'sorted(toplam.items()) ile ay sırasını garanti et.'],
'example': '''
# Benzer teknik: aylara göre iade oranı (iki sayaç, get ile güvenli bölme)
satislar = [('2024-01-05', False), ('2024-01-20', True), ('2024-02-02', False)]
toplam, iade = {}, {}
for tarih, iade_mi in satislar:
    ay = int(tarih[5:7])
    toplam[ay] = toplam.get(ay, 0) + 1
    if iade_mi:
        iade[ay] = iade.get(ay, 0) + 1
print({ay: round(100 * iade.get(ay, 0) / n, 2) for ay, n in sorted(toplam.items())})
''',
'hints': ['Pay ve payda için iki ayrı sözlük.', 'iptal sözlüğünde bazı aylar hiç olmayabilir: iptal.get(ay, 0).', 'return {ay: round(100 * iptal.get(ay, 0) / n, 2) for ay, n in sorted(toplam.items())}'],
'why': '''Oran hesabında pay ve paydanın aynı filtreden geçmesi gerekir; burada payda "planlanan tüm uçuşlar", pay "iptal edilenler". Payı tutan sözlükte bazı anahtarlar hiç oluşmayabilir; <code>get(ay, 0)</code> bunu sıfır sayar. Havacılıkta iptal oranı genellikle %1–2 civarındadır; kış aylarında hava koşullarıyla artması beklenir, bu yüzden aylık kırılım tek bir yıllık sayıdan daha bilgilendiricidir.''',
'tags': ['dict', 'oran', 'dilimleme', 'aylık rapor'],
},
{
'id': 'b-518', 'lv': 'temel', 'diff': 1, 'kind': 'yaz', 'min': 6,
'title': 'Filo özeti: modele göre uçak ve koltuk',
'q': '''<p>Filo planlama müdürü soruyor: <b>"Her uçak modelinden kaç tane var ve toplam kaç koltuk sağlıyor?"</b></p>
<p><code>filo_ozeti(ucaklar)</code> fonksiyonunu yaz: <code>hv_aircraft</code> kayıtlarından <code>{model: (uçak_sayısı, toplam_koltuk)}</code> sözlüğü döndür.</p>''',
'start': '''
import veri

ucaklar = veri.kayitlar('kanat_havayollari', 'hv_aircraft')


def filo_ozeti(ucaklar):
    # buraya yaz
    pass


print(filo_ozeti(ucaklar))
''',
'sol': '''
import veri

ucaklar = veri.kayitlar('kanat_havayollari', 'hv_aircraft')


def filo_ozeti(ucaklar):
    ozet = {}
    for u in ucaklar:
        adet, koltuk = ozet.get(u['model'], (0, 0))
        ozet[u['model']] = (adet + 1, koltuk + u['seats'])
    return ozet


print(filo_ozeti(ucaklar))
''',
'tests': '''
_f = filo_ozeti(veri.kayitlar('kanat_havayollari', 'hv_aircraft'))
assert _f['A320neo'] == ⟨_f['A320neo']⟩, "A320neo için (uçak sayısı, toplam koltuk) «_f['A320neo']» olmalı"
assert _f == ⟨_f⟩, "Filo özeti beklenenden farklı"
assert sum(a for a, _ in _f.values()) == 15, "Toplam uçak sayısı 15 olmalı"
''',
'hints': ['Sözlüğün değeri bir demet (tuple): (adet, koltuk).', 'Demetler değiştirilemez; her seferinde yeni demet oluştur.', 'adet, koltuk = ozet.get(model, (0, 0)) ile başlangıç değeri al.'],
'why': '''Değeri demet olan sözlük, birden çok ölçüyü aynı anahtarda taşımanın basit yoludur. Demet değiştirilemez (immutable) olduğu için güncellemede yeni demet yazılır; alternatif olarak iki ayrı sözlük ya da değeri liste olan sözlük kullanılabilir. Koltuk kapasitesi, doluluk oranının (load factor) paydasıdır; bu tablo ileride uçuşlarla birleştirilecek.''',
'tags': ['tuple', 'dict', 'çok ölçülü toplama'],
},
{
'id': 'b-519', 'lv': 'temel', 'diff': 1, 'kind': 'rehberli', 'min': 8,
'title': 'Rötar nedenlerinin dakika payı',
'q': '''<p>Genel müdür yönetim kuruluna rötarları anlatacak: <b>"Toplam rötar dakikalarının yüzde kaçı hangi nedenden kaynaklanıyor?"</b> (<code>hv_delays</code>: bir uçuşta birden çok neden olabilir; her satır o nedene bağlanan dakika.)</p>
<p><code>rotar_paylari(rotarlar)</code> fonksiyonunu yaz: <code>{neden: yüzde}</code> döndür (1 ondalık), <b>yüzdeye göre büyükten küçüğe</b> sıralı eklenmiş olsun.</p>''',
'start': '''
import veri

rotarlar = veri.kayitlar('kanat_havayollari', 'hv_delays')


def rotar_paylari(rotarlar):
    dakika = {}
    for r in rotarlar:
        # TODO: nedenin dakikalarını topla
        pass
    toplam = sum(dakika.values())
    # TODO: dakikaya göre azalan sırala ve yüzdeye çevir
    return {}


print(rotar_paylari(rotarlar))
''',
'sol': '''
import veri

rotarlar = veri.kayitlar('kanat_havayollari', 'hv_delays')


def rotar_paylari(rotarlar):
    dakika = {}
    for r in rotarlar:
        dakika[r['reason']] = dakika.get(r['reason'], 0) + r['minutes']
    toplam = sum(dakika.values())
    sirali = sorted(dakika.items(), key=lambda kv: kv[1], reverse=True)
    return {neden: round(100 * dk / toplam, 1) for neden, dk in sirali}


print(rotar_paylari(rotarlar))
''',
'tests': '''
_p = rotar_paylari(veri.kayitlar('kanat_havayollari', 'hv_delays'))
assert list(_p)[0] == ⟨list(_p)[0]⟩, "En büyük pay «list(_p)[0]» nedeninde olmalı; dakikaları mı topladın, satırları mı saydın?"
assert list(_p) == ⟨list(_p)⟩, "Nedenler payı büyükten küçüğe sıralı olmalı"
assert _p == ⟨_p⟩, "Yüzdeler beklenenden farklı"
''',
'guide': ['Satır saymak yerine minutes alanını topla.', 'Genel toplam: sum(dakika.values()) (hazır).', 'sorted(dakika.items(), key=lambda kv: kv[1], reverse=True) ile sırala.', 'Sıralı listeden sözlük kur: Python 3.7+ sözlükleri ekleme sırasını korur.'],
'example': '''
# Benzer teknik: gider kalemlerinin bütçedeki payı, büyükten küçüğe
giderler = [('kira', 5000), ('maaş', 20000), ('kira', 1000), ('enerji', 4000)]
t = {}
for kalem, tutar in giderler:
    t[kalem] = t.get(kalem, 0) + tutar
toplam = sum(t.values())
print({k: round(100 * v / toplam, 1) for k, v in sorted(t.items(), key=lambda kv: kv[1], reverse=True)})
''',
'hints': ['Pay dakika üzerinden: satır sayısı değil minutes toplamı.', 'Sözlükler ekleme sırasını korur; sıralı listeden kurarsan sıralı kalır.', 'return {n: round(100 * d / toplam, 1) for n, d in sirali}'],
'why': '''"Kaç kez" ile "ne kadar" farklı sorulardır: hava kaynaklı rötar daha az sayıda olup daha uzun sürebilir. Burada soru dakika payı olduğu için toplanan ölçü dakikadır. Python 3.7'den beri sözlükler ekleme sırasını korur; sıralı bir rapor sözlüğü bu yüzden güvenilirdir. İş yorumu: "geç gelen uçak" (reactionary delay) en büyük pay ise sorun zincirleme rötardır; çözüm dönüş sürelerine (turnaround) tampon eklemektir, hava durumunu kontrol edemezsin ama tarifeyi edebilirsin.''',
'tags': ['dict', 'sorted', 'pay', 'rötar'],
},
{
'id': 'b-520', 'lv': 'temel', 'diff': 1, 'kind': 'bug', 'min': 8,
'title': 'Ücret sınıfına göre no-show oranı (hatayı bul)',
'q': '''<p>Gelir yönetimi ekibi fazla satış (overbooking) politikası için no-show oranlarını istiyor. Tanım: <code>no-show oranı = no_show / (flown + no_show)</code>. İptal edilen rezervasyon koltuğu zaten boşaltmıştır; paydaya <b>girmez</b>.</p>
<p>Aşağıdaki <code>noshow_orani(rezervasyonlar)</code> oranları olduğundan düşük gösteriyor. Hatayı bul, düzelt. Sonuç <code>{fare_class: yüzde}</code>, 2 ondalık.</p>''',
'start': '''
import veri

rezervasyonlar = veri.kayitlar('kanat_havayollari', 'hv_bookings')


def noshow_orani(rezervasyonlar):
    toplam, gelmeyen = {}, {}
    for r in rezervasyonlar:
        s = r['fare_class']
        toplam[s] = toplam.get(s, 0) + 1
        if r['status'] == 'no_show':
            gelmeyen[s] = gelmeyen.get(s, 0) + 1
    return {s: round(100 * gelmeyen.get(s, 0) / n, 2) for s, n in toplam.items()}


print(noshow_orani(rezervasyonlar))
''',
'sol': '''
import veri

rezervasyonlar = veri.kayitlar('kanat_havayollari', 'hv_bookings')


def noshow_orani(rezervasyonlar):
    toplam, gelmeyen = {}, {}
    for r in rezervasyonlar:
        if r['status'] == 'cancelled':
            continue
        s = r['fare_class']
        toplam[s] = toplam.get(s, 0) + 1
        if r['status'] == 'no_show':
            gelmeyen[s] = gelmeyen.get(s, 0) + 1
    return {s: round(100 * gelmeyen.get(s, 0) / n, 2) for s, n in toplam.items()}


print(noshow_orani(rezervasyonlar))
''',
'tests': '''
_n = noshow_orani(veri.kayitlar('kanat_havayollari', 'hv_bookings'))
assert abs(_n['Eko'] - ⟨_n['Eko']⟩) < 0.005, "Eko sınıfı no-show oranı «_n['Eko']» olmalı; iptaller paydadan çıkmalı"
assert _n == ⟨_n⟩, "Sınıf bazında oranlar beklenenden farklı"
assert noshow_orani([{'fare_class': 'Eko', 'status': 'cancelled'}, {'fare_class': 'Eko', 'status': 'no_show'}, {'fare_class': 'Eko', 'status': 'flown'}]) == {'Eko': 50.0}, "1 no_show, 1 flown, 1 iptal → %50 (iptal sayılmaz)"
''',
'hints': ['Kod çalışıyor; sorun tanımda: payda neyi içermeli?', 'İptal edilen rezervasyon paydaya girmemeli.', 'Döngünün başına: if r[\'status\'] == \'cancelled\': continue'],
'why': '''Hata sözdiziminde değil, <b>iş tanımında</b>: payda tüm rezervasyonları içerdiği için iptaller oranı seyreltiyordu. Bu tür hatalar kod incelemesinde (code review) en zor yakalananlardır; çözüm, metrik tanımını kodun yanına yorum olarak yazmak ve küçük elle hesaplanmış örnekle test etmektir. İş etkisi: no-show oranı olduğundan düşük ölçülürse havayolu daha az fazla satış yapar ve boş koltukla uçar; fazla ölçülürse yolcu uçaktan indirilir (denied boarding) ve tazminat ödenir.''',
'tags': ['metrik tanımı', 'payda', 'hata avı', 'overbooking'],
},
{
'id': 'b-521', 'lv': 'temel', 'diff': 2, 'kind': 'yaz', 'min': 10,
'title': 'En uzun 5 şehir çifti',
'q': '''<p>Pazarlama ekibi "en uzun hatlarımız" kampanyası hazırlıyor: <b>"Mesafeye göre en uzun 5 şehir çifti hangisi?"</b></p>
<p><code>hv_routes</code> her şehir çiftini iki yönlü tutar (IST→LHR ve LHR→IST). Her çifti <b>bir kez</b> say: iki havalimanı kodunu alfabetik sırala ve bu ikiliyi anahtar olarak kullan. <code>en_uzun_ciftler(rotalar, havalimanlari, n=5)</code> → <code>[('Dubai – İstanbul', 3028), ...]</code>: metin, alfabetik sıradaki iki kodun <b>şehir adları</b> arasında <code>' – '</code> ile; mesafeye göre azalan.</p>''',
'start': '''
import veri

rotalar = veri.kayitlar('kanat_havayollari', 'hv_routes')
havalimanlari = veri.kayitlar('kanat_havayollari', 'hv_airports')


def en_uzun_ciftler(rotalar, havalimanlari, n=5):
    # buraya yaz
    pass


for satir in en_uzun_ciftler(rotalar, havalimanlari):
    print(satir)
''',
'sol': '''
import veri

rotalar = veri.kayitlar('kanat_havayollari', 'hv_routes')
havalimanlari = veri.kayitlar('kanat_havayollari', 'hv_airports')


def en_uzun_ciftler(rotalar, havalimanlari, n=5):
    sehir = {h['airport_code']: h['city'] for h in havalimanlari}
    ciftler = {}
    for r in rotalar:
        a, b = sorted([r['origin'], r['dest']])
        ciftler[(a, b)] = r['distance_km']
    sirali = sorted(ciftler.items(), key=lambda kv: kv[1], reverse=True)
    return [(f'{sehir[a]} – {sehir[b]}', km) for (a, b), km in sirali[:n]]


for satir in en_uzun_ciftler(rotalar, havalimanlari):
    print(satir)
''',
'tests': '''
_r = en_uzun_ciftler(veri.kayitlar('kanat_havayollari', 'hv_routes'), veri.kayitlar('kanat_havayollari', 'hv_airports'))
assert len(_r) == 5, "Beş çift dönmeli"
assert _r[0] == ('Dubai – İstanbul', 3028), "En uzun çift Dubai – İstanbul (3028 km) olmalı: DXB < IST alfabetik"
assert len(set(km for _, km in _r)) == 5, "Aynı çift iki kez (gidiş-dönüş) listede olmamalı"
assert _r == ⟨_r⟩, "İlk 5 çift beklenenden farklı"
''',
'hints': ['Yönsüz çift için sorted([origin, dest]) ikilisini anahtar yap; iki yön aynı anahtara düşer.', 'Kod → şehir sözlüğü kur.', 'f-string ile metni oluştur: f\'{sehir[a]} – {sehir[b]}\''],
'why': '''Yönlü bir ilişkiyi yönsüz hale getirmenin en kısa yolu iki ucu sıralayıp demet anahtar yapmaktır (<code>frozenset</code> da kullanılabilir ama sırası olmadığı için yazdırmak zorlaşır). Aynı anahtara ikinci kez yazmak sorun değil, çünkü iki yönün mesafesi aynı. Bu ayıklamayı yapmasaydın ilk 5'in içinde aynı hattın gidiş ve dönüşü yer alırdı; yinelenen kayıtlar raporlardaki "ilk N" listelerinin en sık bozulma nedenidir.''',
'tags': ['tuple anahtar', 'yinelenen kayıt', 'sorted', 'f-string'],
},
# ---------------------------------------------------------------- ORTA
{
'id': 'b-522', 'lv': 'orta', 'diff': 2, 'kind': 'rehberli', 'min': 12,
'title': 'Zamanında kalkış oranı (OTP)',
'q': '''<p>Havacılığın vitrin metriği: <b>zamanında kalkış oranı</b> (on-time performance, OTP). Tanım: iptal edilmemiş uçuşlar arasında gerçek kalkışı planlanandan en fazla 15 dakika sonra olanların yüzdesi.</p>
<p><code>zamaninda_kalkis(ucuslar, ay=None)</code> fonksiyonunu yaz. <code>ay</code> verilirse yalnız o ayın (<code>sched_dep</code> ayı) uçuşlarını al. Sonuç 1 ondalık yüzde.</p>''',
'start': '''
from datetime import datetime
import veri

ucuslar = veri.kayitlar('kanat_havayollari', 'hv_flights')


def zamaninda_kalkis(ucuslar, ay=None):
    toplam = zamaninda = 0
    for u in ucuslar:
        if u['status'] == 'cancelled':
            continue
        plan = datetime.fromisoformat(u['sched_dep'])
        # TODO: ay verilmişse ve plan.month farklıysa atla
        # TODO: gerçek kalkışı çevir, gecikmeyi dakika olarak hesapla
        # TODO: toplam ve (gecikme <= 15 ise) zamaninda sayaçlarını artır
    # TODO: yüzdeyi 1 ondalıkla döndür
    pass


print(zamaninda_kalkis(ucuslar))
for a in (9, 10, 11, 12):
    print(a, zamaninda_kalkis(ucuslar, a))
''',
'sol': '''
from datetime import datetime
import veri

ucuslar = veri.kayitlar('kanat_havayollari', 'hv_flights')


def zamaninda_kalkis(ucuslar, ay=None):
    toplam = zamaninda = 0
    for u in ucuslar:
        if u['status'] == 'cancelled':
            continue
        plan = datetime.fromisoformat(u['sched_dep'])
        if ay is not None and plan.month != ay:
            continue
        gercek = datetime.fromisoformat(u['actual_dep'])
        gecikme = (gercek - plan).total_seconds() / 60
        toplam += 1
        if gecikme <= 15:
            zamaninda += 1
    return round(100 * zamaninda / toplam, 1)


print(zamaninda_kalkis(ucuslar))
for a in (9, 10, 11, 12):
    print(a, zamaninda_kalkis(ucuslar, a))
''',
'tests': '''
_u = veri.kayitlar('kanat_havayollari', 'hv_flights')
assert abs(zamaninda_kalkis(_u) - ⟨zamaninda_kalkis(_u)⟩) < 0.05, "Genel OTP «zamaninda_kalkis(_u)» olmalı"
assert abs(zamaninda_kalkis(_u, 12) - ⟨zamaninda_kalkis(_u, 12)⟩) < 0.05, "Aralık OTP «zamaninda_kalkis(_u, 12)» olmalı; ay filtresi çalışıyor mu?"
assert abs(zamaninda_kalkis(_u, 9) - ⟨zamaninda_kalkis(_u, 9)⟩) < 0.05, "Eylül OTP «zamaninda_kalkis(_u, 9)» olmalı"
_k = [{'status': 'landed', 'sched_dep': '2024-09-01 10:00:00', 'actual_dep': '2024-09-01 10:15:00'}, {'status': 'landed', 'sched_dep': '2024-09-01 10:00:00', 'actual_dep': '2024-09-01 10:16:00'}, {'status': 'cancelled', 'sched_dep': '2024-09-01 10:00:00', 'actual_dep': None}]
assert zamaninda_kalkis(_k) == 50.0, "15 dakika dahil zamanında, 16 dakika geç; iptal sayılmaz → %50"
''',
'guide': ['İptal edilen uçuşun gerçek kalkışı yok; döngünün başında atla (hazır).', 'ay is not None and plan.month != ay ise continue.', 'Gecikme = (gerçek - plan).total_seconds() / 60; erken kalkış eksi çıkar, o da zamanındadır.', '15 dakika dahil: gecikme <= 15.'],
'example': '''
from datetime import datetime
# Benzer teknik: kargo teslimlerinde "söz verilen saatten en çok 30 dk sonra" oranı
teslimler = [('2024-03-01 14:00:00', '2024-03-01 14:20:00'), ('2024-03-01 16:00:00', '2024-03-01 16:45:00')]
iyi = sum((datetime.fromisoformat(g) - datetime.fromisoformat(s)).total_seconds() / 60 <= 30 for s, g in teslimler)
print(round(100 * iyi / len(teslimler), 1))
''',
'hints': ['İsteğe bağlı parametre: ay=None ve "ay is not None" kontrolü.', 'timedelta.total_seconds() / 60 dakikayı verir.', 'return round(100 * zamaninda / toplam, 1)'],
'why': '''Sektör standardı (A15) 15 dakikaya kadar gecikmeyi zamanında sayar; erken kalkış da zamanındadır. <code>ay=None</code> varsayılanı fonksiyonu hem genel hem filtreli kullanmaya izin verir; <code>if ay:</code> yerine <code>if ay is not None:</code> yazmak 0 gibi "yanlış-değerli" (falsy) girdilerde hata yapmayı önler. İptaller OTP'nin dışında tutulur ve ayrı raporlanır; aksi halde iptal etmek OTP'yi "iyileştiren" bir hile olurdu. Gerçek işte varış OTP'si (arrival OTP) de ayrıca izlenir.''',
'tags': ['datetime', 'OTP', 'isteğe bağlı parametre', 'havacılık metriği'],
},
{
'id': 'b-523', 'lv': 'orta', 'diff': 2, 'kind': 'yaz', 'min': 12,
'title': 'Uçak modeline göre doluluk oranı (load factor)',
'q': '''<p>Filo planlama sorusu: <b>"Hangi uçak modelimiz daha dolu uçuyor? Büyük gövdeli A330'lar boş mu gidiyor?"</b></p>
<p>Doluluk oranı = toplam yolcu / toplam koltuk × 100. <code>doluluk_orani(ucuslar, ucaklar)</code> fonksiyonunu yaz: yalnız <code>status == 'landed'</code> uçuşlar; her uçuşun koltuk sayısını <code>tail_no</code> üzerinden <code>hv_aircraft</code>'tan bul. Sonuç: <code>{model: yüzde}</code> (1 ondalık).</p>
<p><i>Dikkat:</i> uçuş başına oranların ortalaması değil, toplamların oranı isteniyor.</p>''',
'start': '''
import veri

ucuslar = veri.kayitlar('kanat_havayollari', 'hv_flights')
ucaklar = veri.kayitlar('kanat_havayollari', 'hv_aircraft')


def doluluk_orani(ucuslar, ucaklar):
    # buraya yaz
    pass


print(doluluk_orani(ucuslar, ucaklar))
''',
'sol': '''
import veri

ucuslar = veri.kayitlar('kanat_havayollari', 'hv_flights')
ucaklar = veri.kayitlar('kanat_havayollari', 'hv_aircraft')


def doluluk_orani(ucuslar, ucaklar):
    bilgi = {u['tail_no']: (u['model'], u['seats']) for u in ucaklar}
    yolcu, koltuk = {}, {}
    for f in ucuslar:
        if f['status'] != 'landed':
            continue
        model, kol = bilgi[f['tail_no']]
        yolcu[model] = yolcu.get(model, 0) + f['pax']
        koltuk[model] = koltuk.get(model, 0) + kol
    return {m: round(100 * yolcu[m] / koltuk[m], 1) for m in yolcu}


print(doluluk_orani(ucuslar, ucaklar))
''',
'tests': '''
_d = doluluk_orani(veri.kayitlar('kanat_havayollari', 'hv_flights'), veri.kayitlar('kanat_havayollari', 'hv_aircraft'))
assert set(_d) == ⟨set(_d)⟩, "Modeller beklenenden farklı"
assert abs(_d['A330-300'] - ⟨_d['A330-300']⟩) < 0.05, "A330-300 doluluk oranı «_d['A330-300']» olmalı"
assert _d == ⟨_d⟩, "Model bazında doluluk oranları beklenenden farklı; toplam yolcu / toplam koltuk mu hesapladın?"
_k = doluluk_orani([{'status': 'landed', 'tail_no': 'X', 'pax': 100}, {'status': 'landed', 'tail_no': 'Y', 'pax': 10}, {'status': 'diverted', 'tail_no': 'X', 'pax': 5}], [{'tail_no': 'X', 'model': 'M', 'seats': 100}, {'tail_no': 'Y', 'model': 'M', 'seats': 20}])
assert _k == {'M': 91.7}, "Toplamların oranı: 110 / 120 = %91.7 (uçuş oranlarının ortalaması %75 olurdu); diverted sayılmaz"
''',
'hints': ['tail_no → (model, koltuk) sözlüğü kur.', 'Model başına iki toplam tut: yolcu ve koltuk.', 'Oranı en sonda böl; uçuş başına oranları ortalama.'],
'why': '''<b>Oranların ortalaması ≠ toplamların oranı.</b> Uçuş başına doluluk oranlarının ortalaması küçük ve boş uçuşlara büyük uçuşlarla aynı ağırlığı verir; havacılıkta load factor her zaman RPK/ASK gibi toplamlardan hesaplanır (burada mesafe olmadan yolcu/koltuk). Testteki küçük örnek farkı açıkça gösterir: %91.7'ye karşı %75. Yön değiştiren (diverted) uçuşlar varış yapmadığı için dışarıda; bu bir iş kararıdır ve raporda belirtilmelidir.''',
'tags': ['ağırlıklı oran', 'load factor', 'sözlükle join'],
},
{
'id': 'b-524', 'lv': 'orta', 'diff': 2, 'kind': 'rehberli', 'min': 15,
'title': 'Saat dilimi dönüşümü: UTC kalkış ve yerel varış',
'q': '''<p>Yolcu bilgilendirme ekranı yanlış saat gösteriyor. Veri setinde <b>tüm zamanlar Türkiye saatidir (UTC+3)</b>; ekranda kalkış <b>UTC</b> olarak, varış ise <b>varış havalimanının yerel saatiyle</b> görünmeli. Havalimanının UTC farkı <code>hv_airports.tz_offset</code>'tadır.</p>
<p><code>tarife_saatleri(ucus_id, ucuslar, rotalar, havalimanlari)</code> fonksiyonunu yaz; <code>{'kalkis_utc': 'YYYY-MM-DD HH:MM', 'varis_yerel': 'YYYY-MM-DD HH:MM'}</code> döndürsün (planlanan saatler: <code>sched_dep</code>, <code>sched_arr</code>). Saat dilimli (aware) <code>datetime</code> kullan.</p>''',
'start': '''
from datetime import datetime, timedelta, timezone
import veri

ucuslar = veri.kayitlar('kanat_havayollari', 'hv_flights')
rotalar = veri.kayitlar('kanat_havayollari', 'hv_routes')
havalimanlari = veri.kayitlar('kanat_havayollari', 'hv_airports')
TSI = timezone(timedelta(hours=3))


def tarife_saatleri(ucus_id, ucuslar, rotalar, havalimanlari):
    ucus = next(u for u in ucuslar if u['flight_id'] == ucus_id)
    rota = next(r for r in rotalar if r['route_id'] == ucus['route_id'])
    fark = {h['airport_code']: h['tz_offset'] for h in havalimanlari}
    kalkis = datetime.fromisoformat(ucus['sched_dep']).replace(tzinfo=TSI)
    # TODO: varışı da TSI ile işaretle
    # TODO: kalkışı UTC'ye çevir (astimezone(timezone.utc))
    # TODO: varışı hedef havalimanının dilimine çevir: timezone(timedelta(hours=fark[rota['dest']]))
    # TODO: strftime('%Y-%m-%d %H:%M') ile sözlüğü döndür
    pass


print(tarife_saatleri(1849, ucuslar, rotalar, havalimanlari))
''',
'sol': '''
from datetime import datetime, timedelta, timezone
import veri

ucuslar = veri.kayitlar('kanat_havayollari', 'hv_flights')
rotalar = veri.kayitlar('kanat_havayollari', 'hv_routes')
havalimanlari = veri.kayitlar('kanat_havayollari', 'hv_airports')
TSI = timezone(timedelta(hours=3))


def tarife_saatleri(ucus_id, ucuslar, rotalar, havalimanlari):
    ucus = next(u for u in ucuslar if u['flight_id'] == ucus_id)
    rota = next(r for r in rotalar if r['route_id'] == ucus['route_id'])
    fark = {h['airport_code']: h['tz_offset'] for h in havalimanlari}
    kalkis = datetime.fromisoformat(ucus['sched_dep']).replace(tzinfo=TSI)
    varis = datetime.fromisoformat(ucus['sched_arr']).replace(tzinfo=TSI)
    kalkis_utc = kalkis.astimezone(timezone.utc)
    varis_yerel = varis.astimezone(timezone(timedelta(hours=fark[rota['dest']])))
    return {'kalkis_utc': kalkis_utc.strftime('%Y-%m-%d %H:%M'),
            'varis_yerel': varis_yerel.strftime('%Y-%m-%d %H:%M')}


print(tarife_saatleri(1849, ucuslar, rotalar, havalimanlari))
''',
'tests': '''
_u = veri.kayitlar('kanat_havayollari', 'hv_flights')
_r = veri.kayitlar('kanat_havayollari', 'hv_routes')
_h = veri.kayitlar('kanat_havayollari', 'hv_airports')
assert tarife_saatleri(1849, _u, _r, _h) == {'kalkis_utc': '2024-09-01 05:30', 'varis_yerel': '2024-09-01 09:27'}, "IST→LHR: 08:30 TSİ = 05:30 UTC; 12:27 TSİ varış Londra'da (UTC+0) 09:27"
_dxb = next(u['flight_id'] for u in _u if u['route_id'] == 27)
assert tarife_saatleri(_dxb, _u, _r, _h) == ⟨tarife_saatleri(_dxb, _u, _r, _h)⟩, "IST→DXB: Dubai UTC+4, varış Türkiye saatinden 1 saat ileri olmalı"
_gece = next(u['flight_id'] for u in _u if u['sched_arr'][:10] != u['sched_dep'][:10])
assert tarife_saatleri(_gece, _u, _r, _h)['varis_yerel'] == ⟨tarife_saatleri(_gece, _u, _r, _h)['varis_yerel']⟩, "Gece yarısını geçen varışta yerel tarih de doğru olmalı (astimezone tarihi de çevirir)"
''',
'guide': ['Saf (naive) datetime\'ı TSI dilimiyle işaretle: .replace(tzinfo=TSI). Saat değişmez, yalnız "bu saat UTC+3\'tür" bilgisi eklenir.', 'Dönüşüm astimezone ile yapılır: saat ve gerekiyorsa tarih değişir.', 'Hedef dilim: timezone(timedelta(hours=fark[rota[\'dest\']])).', 'strftime(\'%Y-%m-%d %H:%M\') ile metne çevir.'],
'example': '''
from datetime import datetime, timedelta, timezone
# Benzer teknik: İstanbul'da 01:30'da başlayan toplantının New York (UTC-5) karşılığı
ist = timezone(timedelta(hours=3))
ny = timezone(timedelta(hours=-5))
t = datetime(2024, 11, 5, 1, 30).replace(tzinfo=ist)
print(t.astimezone(ny).strftime('%Y-%m-%d %H:%M'))  # bir önceki gün
''',
'hints': ['replace(tzinfo=...) etiketler, astimezone(...) çevirir; ikisini karıştırma.', 'UTC: timezone.utc; sabit fark: timezone(timedelta(hours=n)).', 'varis.astimezone(timezone(timedelta(hours=fark[rota[\'dest\']])))'],
'why': '''<code>replace(tzinfo=...)</code> saati değiştirmeden ona bir dilim "etiketi" yapıştırır; <code>astimezone</code> aynı anı başka bir dilimde ifade eder. En sık hata ikisini karıştırmaktır: saf bir saate doğrudan hedef dilimi <code>replace</code> ile vermek saati hiç dönüştürmez. Kural: sistemlerde UTC sakla, ekranda yerel göster. Not: <code>tz_offset</code> sabit bir fark (kış saati); gerçek dünyada Avrupa yaz saati uygular, bu yüzden üretimde <code>zoneinfo.ZoneInfo('Europe/London')</code> gibi dilim adları kullanılır ve fark tarihe göre otomatik belirlenir.''',
'tags': ['datetime', 'timezone', 'astimezone', 'UTC'],
},
{
'id': 'b-525', 'lv': 'orta', 'diff': 2, 'kind': 'bug', 'needs': ['sqlite3'], 'min': 14,
'title': 'Rota bazında rötar ortalaması şişiyor mu? (hatayı bul)',
'q': '''<p>Soru: <b>"Rötarlı uçuşlarda (hv_delays'te kaydı olan) uçuş başına ortalama rötar dakikası en yüksek 5 rota hangisi?"</b> Bir uçuşun birden çok neden satırı olabilir; uçuşun rötarı bu satırların <b>toplamıdır</b>.</p>
<p>Aşağıdaki sorgu hem uçuş sayısını hem ortalamayı yanlış hesaplıyor. <code>en_rotarli_rotalar(con)</code> fonksiyonunu düzelt. Beklenen satır: <code>(origin, dest, rötarlı_uçuş_sayısı, uçuş_başına_ortalama_dk)</code>, ortalama 1 ondalık, ortalamaya göre azalan, 5 satır.</p>''',
'start': '''
import veri

con = veri.baglan('kanat_havayollari')


def en_rotarli_rotalar(con):
    sorgu = """
    SELECT r.origin, r.dest, COUNT(*) AS ucus, ROUND(AVG(d.minutes), 1) AS ort
    FROM hv_delays d
    JOIN hv_flights f ON f.flight_id = d.flight_id
    JOIN hv_routes r ON r.route_id = f.route_id
    GROUP BY r.route_id
    ORDER BY ort DESC
    LIMIT 5
    """
    return con.execute(sorgu).fetchall()


for satir in en_rotarli_rotalar(con):
    print(satir)
''',
'sol': '''
import veri

con = veri.baglan('kanat_havayollari')


def en_rotarli_rotalar(con):
    sorgu = """
    WITH ucus_rotar AS (
        SELECT flight_id, SUM(minutes) AS dk
        FROM hv_delays
        GROUP BY flight_id
    )
    SELECT r.origin, r.dest, COUNT(*) AS ucus, ROUND(AVG(u.dk), 1) AS ort
    FROM ucus_rotar u
    JOIN hv_flights f ON f.flight_id = u.flight_id
    JOIN hv_routes r ON r.route_id = f.route_id
    GROUP BY r.route_id
    ORDER BY ort DESC
    LIMIT 5
    """
    return con.execute(sorgu).fetchall()


for satir in en_rotarli_rotalar(con):
    print(satir)
''',
'tests': '''
_c = veri.baglan('kanat_havayollari')
_r = en_rotarli_rotalar(_c)
assert len(_r) == 5, "Beş satır dönmeli"
assert _r[0] == ⟨tuple(_r[0])⟩, "İlk satır beklenenden farklı: önce uçuş başına toplam rötarı bul, sonra rotada ortala"
assert _r == ⟨[tuple(x) for x in _r]⟩, "En rötarlı 5 rota beklenenden farklı"
_top = _c.execute('SELECT COUNT(DISTINCT flight_id) FROM hv_delays').fetchone()[0]
assert sum(x[2] for x in en_rotarli_rotalar(_c)) <= _top, "Uçuş sayısı neden satırlarını değil farklı uçuşları saymalı"
''',
'hints': ['hv_delays\'te bir uçuş birden çok satır olabilir: JOIN satırları çoğaltır.', 'Önce uçuş başına SUM(minutes) alan bir alt sorgu ya da CTE kur.', 'Sonra o CTE\'yi rotalarla birleştirip AVG al; COUNT(*) artık uçuş sayar.'],
'why': '''<b>Ayrıntı düzeyi (grain) uyuşmazlığı</b>: hv_delays "uçuş × neden" düzeyinde, soru ise "uçuş" düzeyinde. Doğrudan JOIN edip AVG almak her neden satırını ayrı bir gözlem sayar; hem COUNT şişer hem ortalama "neden başına dakika"ya döner (birden çok nedenli, genellikle en uzun rötarlar parçalara bölündüğü için ortalama düşer). Çözüm: önce doğru düzeye topla (CTE), sonra birleştir. Bu, SQL'de en sık yapılan analiz hatalarından biridir; JOIN sonrası satır sayısını kontrol etmek (<code>COUNT(*)</code> vs <code>COUNT(DISTINCT flight_id)</code>) onu hemen ortaya çıkarır.''',
'tags': ['sqlite3', 'CTE', 'grain', 'hata avı'],
},
{
'id': 'b-526', 'lv': 'orta', 'diff': 2, 'kind': 'yaz', 'needs': ['sqlite3'], 'min': 14,
'title': 'Kalkış saatine göre zamanında kalkış (SQL)',
'q': '''<p>Tarife planlama ekibi: <b>"Gün içinde ilerledikçe rötar birikiyor mu? Kalkış saatine göre OTP nasıl değişiyor?"</b></p>
<p><code>saatlik_otp(con)</code> fonksiyonunu yaz (<code>con = veri.baglan('kanat_havayollari')</code>). İptal edilmemiş uçuşlarda planlanan kalkış saatine (0–23, tam sayı) göre grupla; her saat için <code>(saat, uçuş_sayısı, otp)</code> döndür. OTP: gecikmesi ≤ 15 dk olanların yüzdesi (1 ondalık). Gecikmeyi dakika olarak <code>(strftime('%s', actual_dep) - strftime('%s', sched_dep)) / 60</code> ile hesapla. Saate göre artan sırala.</p>''',
'start': '''
import veri

con = veri.baglan('kanat_havayollari')


def saatlik_otp(con):
    # buraya yaz
    pass


for satir in saatlik_otp(con):
    print(satir)
''',
'sol': '''
import veri

con = veri.baglan('kanat_havayollari')


def saatlik_otp(con):
    sorgu = """
    SELECT CAST(strftime('%H', sched_dep) AS INTEGER) AS saat,
           COUNT(*) AS ucus,
           ROUND(100.0 * SUM((strftime('%s', actual_dep) - strftime('%s', sched_dep)) / 60 <= 15) / COUNT(*), 1) AS otp
    FROM hv_flights
    WHERE status != 'cancelled'
    GROUP BY saat
    ORDER BY saat
    """
    return con.execute(sorgu).fetchall()


for satir in saatlik_otp(con):
    print(satir)
''',
'tests': '''
_r = saatlik_otp(veri.baglan('kanat_havayollari'))
assert all(isinstance(s, int) for s, _, _ in _r), "Saat tam sayı olmalı: CAST(strftime('%H', ...) AS INTEGER)"
assert sum(n for _, n, _ in _r) == ⟨sum(n for _, n, _ in _r)⟩, "Toplam uçuş «sum(n for _, n, _ in _r)» olmalı (iptaller hariç)"
assert _r[0] == ⟨tuple(_r[0])⟩, "İlk saat satırı beklenenden farklı"
assert [s for s, _, _ in _r] == ⟨[s for s, _, _ in _r]⟩, "Saatler artan sırada olmalı"
assert _r == ⟨[tuple(x) for x in _r]⟩, "Saatlik OTP değerleri beklenenden farklı"
''',
'hints': ['strftime(\'%H\', sched_dep) saati metin olarak verir; CAST ile tam sayı yap.', 'strftime(\'%s\', t) Unix saniyesidir; farkı 60\'a böl.', 'Koşullu sayım: SUM(gecikme <= 15); oran için 100.0 ile çarp.'],
'why': '''SQLite'ta tarih farkı için iki yol var: <code>julianday</code> farkı (gün cinsinden kayan nokta, × 1440 dakika) ya da <code>strftime('%s')</code> (tam sayı saniye). Sınır değeri (tam 15 dakika) olan karşılaştırmalarda kayan nokta hatası 14.9999 ya da 15.0001 üretebilir; tam sayı saniye bu riski kaldırır. Örüntü: sabah ilk dalga uçuşlar genellikle en dakik olanlardır (uçak gece hangardan gelir), gün ilerledikçe zincirleme rötar birikir. Tablo bu hipotezi sınar.''',
'tags': ['sqlite3', 'strftime', 'OTP', 'GROUP BY'],
},
{
'id': 'b-527', 'lv': 'orta', 'diff': 2, 'kind': 'rehberli', 'min': 12,
'title': 'Üyelik seviyesine göre no-show oranı',
'q': '''<p>Sadakat programı ekibi soruyor: <b>"Elite ve Gold üyelerimiz Classic üyelere göre daha mı az 'gelmeme' (no-show) yapıyor?"</b> Fazla satış politikası seviyeye göre farklılaştırılabilir.</p>
<p><code>seviye_noshow(rezervasyonlar, yolcular)</code> fonksiyonunu yaz: her rezervasyonun yolcusunun <code>tier</code> değerini <code>hv_passengers</code>'tan bul; iptal edilenleri dışarıda bırak; <code>no_show / (flown + no_show)</code> oranını yüzde, 2 ondalık olarak <code>{'Classic': .., 'Silver': .., 'Gold': .., 'Elite': ..}</code> sırasıyla döndür.</p>''',
'start': '''
import veri

rezervasyonlar = veri.kayitlar('kanat_havayollari', 'hv_bookings')
yolcular = veri.kayitlar('kanat_havayollari', 'hv_passengers')
SEVIYELER = ['Classic', 'Silver', 'Gold', 'Elite']


def seviye_noshow(rezervasyonlar, yolcular):
    seviye = {}  # TODO: passenger_id → tier sözlüğü
    toplam = {s: 0 for s in SEVIYELER}
    gelmeyen = {s: 0 for s in SEVIYELER}
    for r in rezervasyonlar:
        # TODO: iptali atla
        # TODO: yolcunun seviyesini bul, sayaçları artır
        pass
    # TODO: SEVIYELER sırasıyla yüzde sözlüğü döndür
    return {}


print(seviye_noshow(rezervasyonlar, yolcular))
''',
'sol': '''
import veri

rezervasyonlar = veri.kayitlar('kanat_havayollari', 'hv_bookings')
yolcular = veri.kayitlar('kanat_havayollari', 'hv_passengers')
SEVIYELER = ['Classic', 'Silver', 'Gold', 'Elite']


def seviye_noshow(rezervasyonlar, yolcular):
    seviye = {y['passenger_id']: y['tier'] for y in yolcular}
    toplam = {s: 0 for s in SEVIYELER}
    gelmeyen = {s: 0 for s in SEVIYELER}
    for r in rezervasyonlar:
        if r['status'] == 'cancelled':
            continue
        s = seviye[r['passenger_id']]
        toplam[s] += 1
        if r['status'] == 'no_show':
            gelmeyen[s] += 1
    return {s: round(100 * gelmeyen[s] / toplam[s], 2) for s in SEVIYELER}


print(seviye_noshow(rezervasyonlar, yolcular))
''',
'tests': '''
_n = seviye_noshow(veri.kayitlar('kanat_havayollari', 'hv_bookings'), veri.kayitlar('kanat_havayollari', 'hv_passengers'))
assert list(_n) == ['Classic', 'Silver', 'Gold', 'Elite'], "Sözlük Classic → Elite sırasında olmalı"
assert abs(_n['Classic'] - ⟨_n['Classic']⟩) < 0.005, "Classic no-show oranı «_n['Classic']» olmalı"
assert _n == ⟨_n⟩, "Seviye bazında oranlar beklenenden farklı; iptalleri çıkardın mı?"
''',
'guide': ['passenger_id → tier sözlüğünü comprehension ile kur.', 'Döngüde iptal edilen rezervasyonu continue ile geç.', 'Yolcunun seviyesini sözlükten bul; toplam ve (no_show ise) gelmeyen sayaçlarını artır.', 'SEVIYELER listesini gezerek sıralı sonuç sözlüğü kur.'],
'example': '''
# Benzer teknik: müşteri segmentine göre iade oranı (önce eşleme sözlüğü)
musteri_segment = {1: 'bireysel', 2: 'kurumsal', 3: 'bireysel'}
siparisler = [(1, 'iade'), (2, 'tamam'), (3, 'tamam'), (1, 'tamam')]
t, i = {}, {}
for m, durum in siparisler:
    s = musteri_segment[m]
    t[s] = t.get(s, 0) + 1
    i[s] = i.get(s, 0) + (durum == 'iade')
print({s: round(100 * i[s] / t[s], 2) for s in t})
''',
'hints': ['Eşleme sözlüğü: {y[\'passenger_id\']: y[\'tier\'] for y in yolcular}', 'Sayaçları SEVIYELER ile önceden kurmak sırayı da belirler.', 'return {s: round(100 * gelmeyen[s] / toplam[s], 2) for s in SEVIYELER}'],
'why': '''Kategorilerin iş sırasıyla (Classic → Elite) raporlanması okuyucunun işini kolaylaştırır; sözlüğü sabit bir listeyle önceden kurmak bu sırayı garanti eder ve beklenmedik bir seviye değeri KeyError ile hemen yakalanır. Yorum: seviyeler arasında fark çıkarsa fazla satış eşiği segment bazında ayarlanabilir; ama küçük segmentlerde (Elite) birkaç vaka oranı çok oynatır, güven aralığına bakmadan karar verme.''',
'tags': ['sözlükle join', 'segment', 'no-show'],
},
{
'id': 'b-528', 'lv': 'orta', 'diff': 2, 'kind': 'tamamla', 'min': 9,
'title': 'En çok bilet geliri getiren 3 rota',
'q': '''<p>Ticari direktör: <b>"Bilet gelirine göre ilk 3 rotamız hangisi?"</b> Gelir tanımı: <code>status</code> değeri <code>'flown'</code> ya da <code>'no_show'</code> olan rezervasyonların <code>price</code> toplamı (no-show bileti iade edilmez, gelirdir). Rezervasyon → uçuş → rota zincirini sözlüklerle kur.</p>
<p><code>en_gelirli_rotalar(rezervasyonlar, ucuslar, rotalar)</code> → <code>[('IST-LHR', gelir), ...]</code> (gelir 2 ondalık, azalan). Boşlukları doldur.</p>''',
'start': '''
import veri

rezervasyonlar = veri.kayitlar('kanat_havayollari', 'hv_bookings')
ucuslar = veri.kayitlar('kanat_havayollari', 'hv_flights')
rotalar = veri.kayitlar('kanat_havayollari', 'hv_routes')


def en_gelirli_rotalar(rezervasyonlar, ucuslar, rotalar):
    ucus_rota = {u['flight_id']: u['route_id'] for u in ucuslar}
    rota_ad = {r['route_id']: r['origin'] + '-' + r['dest'] for r in rotalar}
    gelir = {}
    for b in rezervasyonlar:
        if b['status'] not in ___:
            continue
        ad = rota_ad[ucus_rota[___]]
        gelir[ad] = gelir.get(ad, 0) + ___
    sirali = sorted(gelir.items(), key=___, reverse=True)
    return [(ad, round(t, 2)) for ad, t in sirali[:3]]


print(en_gelirli_rotalar(rezervasyonlar, ucuslar, rotalar))
''',
'sol': '''
import veri

rezervasyonlar = veri.kayitlar('kanat_havayollari', 'hv_bookings')
ucuslar = veri.kayitlar('kanat_havayollari', 'hv_flights')
rotalar = veri.kayitlar('kanat_havayollari', 'hv_routes')


def en_gelirli_rotalar(rezervasyonlar, ucuslar, rotalar):
    ucus_rota = {u['flight_id']: u['route_id'] for u in ucuslar}
    rota_ad = {r['route_id']: r['origin'] + '-' + r['dest'] for r in rotalar}
    gelir = {}
    for b in rezervasyonlar:
        if b['status'] not in ('flown', 'no_show'):
            continue
        ad = rota_ad[ucus_rota[b['flight_id']]]
        gelir[ad] = gelir.get(ad, 0) + b['price']
    sirali = sorted(gelir.items(), key=lambda kv: kv[1], reverse=True)
    return [(ad, round(t, 2)) for ad, t in sirali[:3]]


print(en_gelirli_rotalar(rezervasyonlar, ucuslar, rotalar))
''',
'tests': '''
_g = en_gelirli_rotalar(veri.kayitlar('kanat_havayollari', 'hv_bookings'), veri.kayitlar('kanat_havayollari', 'hv_flights'), veri.kayitlar('kanat_havayollari', 'hv_routes'))
assert len(_g) == 3, "Üç rota dönmeli"
assert _g == ⟨_g⟩, "İlk 3 rota ve gelirleri beklenenden farklı; no-show bileti de gelire dahil, iptal hariç"
''',
'hints': ['Üyelik testi için demet: (\'flown\', \'no_show\').', 'Rezervasyondan uçuşa: b[\'flight_id\'].', 'Sıralama anahtarı değeri seçmeli: lambda kv: kv[1].'],
'why': '''İki sözlükten zincirleme arama (<code>rota_ad[ucus_rota[b['flight_id']]]</code>) iki JOIN'in Python karşılığıdır. Gelir tanımı bir iş kararıdır: no-show bileti (çoğu ücret sınıfında) iade edilmediği için gelirdir; iptal edilen bilet ise ücret sınıfına göre kısmen iade edilir, burada basitlik için dışarıda. Bu tanımları raporun dipnotuna yazmak, farklı ekiplerin "gelir" rakamlarının neden tutmadığı tartışmasını baştan önler.''',
'tags': ['zincirleme lookup', 'gelir', 'tamamla'],
},
# ---------------------------------------------------------------- İLERİ
{
'id': 'b-529', 'lv': 'ileri', 'diff': 3, 'kind': 'rehberli', 'needs': ['pandas'], 'min': 18,
'title': 'Rota kârlılığı (basit maliyet modeli)',
'q': '''<p>Ağ planlama komitesi hangi hatların kapatılacağını tartışıyor: <b>"Basit bir modelle hangi rotalar zarar ediyor?"</b></p>
<p>Model (yalnız <code>landed</code> uçuşlar):</p>
<ul><li>Uçuş geliri = <code>pax</code> × rotanın ortalama bilet fiyatı (rotadaki <code>flown</code> rezervasyonların <code>price</code> ortalaması)</li>
<li>Uçuş maliyeti = 150.000 TL sabit (yakıt dışı yer, iniş, ekip) + <code>seats</code> × <code>distance_km</code> × 0,5 TL</li>
<li>Rota kârı = uçuş kârlarının toplamı</li></ul>
<p><code>rota_kari(ucus, rez, rota, ucak)</code> fonksiyonunu yaz; indeksi <code>'IST-LHR'</code> gibi rota adı olan, kâra göre <b>küçükten büyüğe</b> sıralı, TL cinsinden tam sayıya yuvarlanmış (<code>round()</code>) bir <code>Series</code> döndür.</p>''',
'start': '''
import pandas as pd
import veri

ucus = veri.oku('kanat_havayollari', 'hv_flights')
rez = veri.oku('kanat_havayollari', 'hv_bookings')
rota = veri.oku('kanat_havayollari', 'hv_routes')
ucak = veri.oku('kanat_havayollari', 'hv_aircraft')


def rota_kari(ucus, rez, rota, ucak):
    # 1) Rota başına ortalama bilet fiyatı
    ucan = rez[rez['status'] == 'flown'].merge(ucus[['flight_id', 'route_id']], on='flight_id')
    # TODO: ort_fiyat = ucan.groupby('route_id')['price'].mean()
    # 2) Landed uçuşlara koltuk ve mesafe ekle
    # TODO: df = ucus[landed].merge(ucak, ...).merge(rota, ...)
    # 3) TODO: gelir, maliyet, kar sütunları
    # 4) TODO: rota adı = origin + '-' + dest; ada göre kar topla, round, sort_values
    pass


k = rota_kari(ucus, rez, rota, ucak)
print(k.head(), (k < 0).sum())
''',
'sol': '''
import pandas as pd
import veri

ucus = veri.oku('kanat_havayollari', 'hv_flights')
rez = veri.oku('kanat_havayollari', 'hv_bookings')
rota = veri.oku('kanat_havayollari', 'hv_routes')
ucak = veri.oku('kanat_havayollari', 'hv_aircraft')


def rota_kari(ucus, rez, rota, ucak):
    ucan = rez[rez['status'] == 'flown'].merge(ucus[['flight_id', 'route_id']], on='flight_id')
    ort_fiyat = ucan.groupby('route_id')['price'].mean()
    df = (ucus[ucus['status'] == 'landed']
          .merge(ucak[['tail_no', 'seats']], on='tail_no')
          .merge(rota[['route_id', 'origin', 'dest', 'distance_km']], on='route_id'))
    df['gelir'] = df['pax'] * df['route_id'].map(ort_fiyat)
    df['maliyet'] = 150000 + df['seats'] * df['distance_km'] * 0.5
    df['kar'] = df['gelir'] - df['maliyet']
    df['rota'] = df['origin'] + '-' + df['dest']
    return df.groupby('rota')['kar'].sum().round().sort_values()


k = rota_kari(ucus, rez, rota, ucak)
print(k.head(), (k < 0).sum())
''',
'tests': '''
_k = rota_kari(veri.oku('kanat_havayollari', 'hv_flights'), veri.oku('kanat_havayollari', 'hv_bookings'), veri.oku('kanat_havayollari', 'hv_routes'), veri.oku('kanat_havayollari', 'hv_aircraft'))
assert isinstance(_k, pd.Series) and len(_k) == ⟨len(_k)⟩, "Uçuşu olan «len(_k)» rota bekleniyor (ADB-FRA planlı, uçuşu yok)"
assert int((_k < 0).sum()) == ⟨int((_k < 0).sum())⟩, "Modelde «int((_k < 0).sum())» rota zarar etmeli"
assert _k.index[0] == ⟨_k.index[0]⟩, "En çok zarar eden rota «_k.index[0]» olmalı"
assert abs(float(_k.iloc[0]) - ⟨float(_k.iloc[0])⟩) < 2, "En kötü rotanın kârı «float(_k.iloc[0])» TL olmalı"
assert _k.index[-1] == ⟨_k.index[-1]⟩, "En kârlı rota «_k.index[-1]» olmalı"
''',
'guide': ['Uçulmuş biletleri uçuşlarla birleştirip rota başına ortalama fiyatı bul.', 'Landed uçuşlara merge ile koltuk (hv_aircraft) ve mesafe (hv_routes) ekle.', 'Gelir: pax × route_id.map(ort_fiyat); maliyet: 150000 + seats × distance_km × 0.5.', 'Rota adını string birleştirmeyle kur; groupby(\'rota\')[\'kar\'].sum().round().sort_values().'],
'example': '''
import pandas as pd
# Benzer teknik: mağaza bazında basit kârlılık (sabit + değişken maliyet)
s = pd.DataFrame({'magaza': ['A', 'A', 'B'], 'adet': [100, 80, 30], 'm2': [200, 200, 50]})
fiyat = pd.Series({'A': 12.0, 'B': 20.0})
s['gelir'] = s['adet'] * s['magaza'].map(fiyat)
s['maliyet'] = 500 + s['m2'] * 2
print((s['gelir'] - s['maliyet']).groupby(s['magaza']).sum().sort_values())
''',
'hints': ['Series.map(başka_series) indeks üzerinden eşler: route_id → ortalama fiyat.', 'Merge öncesi yalnız gereken sütunları seç.', 'return df.groupby(\'rota\')[\'kar\'].sum().round().sort_values()'],
'why': '''Bu model basit ama ilkesi doğru: <b>sabit maliyet</b> kısa hatları cezalandırır (yolcu başı gelir düşük, kalkış-iniş maliyeti aynı), uzun hatlarda koltuk-km maliyeti baskın olur. Varsayımlar sonucu belirler; bu yüzden gerçek analizde duyarlılık analizi yapılır (sabit maliyeti ±%20 oynatınca kaç rota işaret değiştiriyor?). Teknik not: ortalama fiyat yalnız "üye rezervasyonlarından" geliyor; tüm yolcuların ödediği fiyatı temsil etmeyebilir (örneklem yanlılığı). Zarar eden rota hemen kapatılmaz: aktarma yolcusu getiren besleyici (feeder) hatlar ağın geri kalanını kârlı kılabilir.''',
'tags': ['pandas', 'merge', 'map', 'kârlılık', 'model varsayımı'],
},
{
'id': 'b-530', 'lv': 'ileri', 'diff': 3, 'kind': 'yaz', 'needs': ['pandas'], 'min': 14,
'title': 'Aylara göre rötar nedeni payları (pivot)',
'q': '''<p>Kalite müdürü: <b>"Hava kaynaklı rötarın payı kışa doğru artıyor mu? Her ay, rötar dakikalarının yüzde kaçı hangi nedenden?"</b></p>
<p><code>aylik_neden_payi(ucus, rotar)</code> fonksiyonunu yaz: rötar satırlarına uçuşun planlanan kalkış ayını (<code>sched_dep</code>, tam sayı ay) ekle; satırlar ay, sütunlar neden, değerler o ayın toplam rötar dakikası içindeki pay (%, 1 ondalık) olan bir DataFrame döndür. Her satırın toplamı ≈ 100 olmalı.</p>''',
'start': '''
import pandas as pd
import veri

ucus = veri.oku('kanat_havayollari', 'hv_flights', parse_dates=['sched_dep'])
rotar = veri.oku('kanat_havayollari', 'hv_delays')


def aylik_neden_payi(ucus, rotar):
    # buraya yaz
    pass


print(aylik_neden_payi(ucus, rotar))
''',
'sol': '''
import pandas as pd
import veri

ucus = veri.oku('kanat_havayollari', 'hv_flights', parse_dates=['sched_dep'])
rotar = veri.oku('kanat_havayollari', 'hv_delays')


def aylik_neden_payi(ucus, rotar):
    d = rotar.merge(ucus[['flight_id', 'sched_dep']], on='flight_id')
    d['ay'] = d['sched_dep'].dt.month
    tablo = d.pivot_table(index='ay', columns='reason', values='minutes', aggfunc='sum', fill_value=0)
    return (tablo.div(tablo.sum(axis=1), axis=0) * 100).round(1)


print(aylik_neden_payi(ucus, rotar))
''',
'tests': '''
_t = aylik_neden_payi(veri.oku('kanat_havayollari', 'hv_flights', parse_dates=['sched_dep']), veri.oku('kanat_havayollari', 'hv_delays'))
assert isinstance(_t, pd.DataFrame), "Sonuç DataFrame olmalı"
assert list(_t.index) == [9, 10, 11, 12], "Satırlar ay numaraları (9–12) olmalı"
assert all(abs(float(x) - 100) < 0.3 for x in _t.sum(axis=1)), "Her ayın payları toplamı ≈ 100 olmalı: satır toplamına bölmelisin (div(..., axis=0))"
assert abs(float(_t.loc[12, 'hava']) - ⟨float(_t.loc[12, 'hava'])⟩) < 0.05, "Aralık'ta hava payı «float(_t.loc[12, 'hava'])» olmalı"
assert abs(float(_t.loc[9, 'hava']) - ⟨float(_t.loc[9, 'hava'])⟩) < 0.05, "Eylül'de hava payı «float(_t.loc[9, 'hava'])» olmalı"
assert abs(float(_t.loc[10, 'gec_gelen_ucak']) - ⟨float(_t.loc[10, 'gec_gelen_ucak'])⟩) < 0.05, "Ekim'de geç gelen uçak payı «float(_t.loc[10, 'gec_gelen_ucak'])» olmalı"
''',
'hints': ['Önce merge ile rötar satırlarına uçuşun tarihini getir.', 'pivot_table(index=\'ay\', columns=\'reason\', values=\'minutes\', aggfunc=\'sum\')', 'Satır yüzdesi: tablo.div(tablo.sum(axis=1), axis=0) * 100'],
'why': '''<code>div(..., axis=0)</code> her satırı kendi toplamına böler; <code>tablo / tablo.sum(axis=1)</code> yazmak indeksleri sütunlarla hizalamaya çalışır ve NaN dolu bir tablo üretir (sık hata). Satır yüzdesi "bu ayın rötarı neyden oluşuyor?", sütun yüzdesi ise "bu nedenin rötarı hangi aylara dağılıyor?" sorusuna cevap verir; hangisini istediğini önce cümleyle yaz. Not: pay artışı mutlak artış demek değildir; hava dakikaları sabitken diğer nedenler azalırsa da pay artar. Mutlak dakikaları da yan yana göster.''',
'tags': ['pandas', 'pivot_table', 'div axis', 'satır yüzdesi'],
},
{
'id': 'b-531', 'lv': 'ileri', 'diff': 3, 'kind': 'bug', 'needs': ['pandas'], 'min': 14,
'title': 'Gerçek uçuş süresi sapması: saat dilimi tuzağı (hatayı bul)',
'q': '''<p>Analist, her rotada gerçek uçuş süresinin (<code>actual_arr - actual_dep</code>) planlanan blok süresinden (<code>block_min</code>) ortalama kaç dakika saptığını hesaplıyor. İç hatlarda sonuç birkaç dakika; ama Londra'da −180, Dubai'de +60 gibi saçma değerler çıkıyor.</p>
<p>Hatırla: veri setinde <b>tüm zamanlar zaten Türkiye saatidir</b>. <code>blok_sapma(ucus, rota, hl)</code> landed uçuşlar için rota adı (<code>'IST-LHR'</code>) → ortalama sapma (dk, 1 ondalık) Series'i döndürmeli. Hatayı bul ve düzelt.</p>''',
'start': '''
import pandas as pd
import veri

ucus = veri.oku('kanat_havayollari', 'hv_flights', parse_dates=['actual_dep', 'actual_arr'])
rota = veri.oku('kanat_havayollari', 'hv_routes')
hl = veri.oku('kanat_havayollari', 'hv_airports')


def blok_sapma(ucus, rota, hl):
    df = ucus[ucus['status'] == 'landed'].merge(rota, on='route_id')
    fark = hl.set_index('airport_code')['tz_offset']
    # varışı yerel saate çevir
    df['varis'] = df['actual_arr'] + pd.to_timedelta(df['dest'].map(fark) - 3, unit='h')
    sure = (df['varis'] - df['actual_dep']).dt.total_seconds() / 60
    df['sapma'] = sure - df['block_min']
    df['rota'] = df['origin'] + '-' + df['dest']
    return df.groupby('rota')['sapma'].mean().round(1)


print(blok_sapma(ucus, rota, hl).sort_values())
''',
'sol': '''
import pandas as pd
import veri

ucus = veri.oku('kanat_havayollari', 'hv_flights', parse_dates=['actual_dep', 'actual_arr'])
rota = veri.oku('kanat_havayollari', 'hv_routes')
hl = veri.oku('kanat_havayollari', 'hv_airports')


def blok_sapma(ucus, rota, hl):
    df = ucus[ucus['status'] == 'landed'].merge(rota, on='route_id')
    sure = (df['actual_arr'] - df['actual_dep']).dt.total_seconds() / 60
    df['sapma'] = sure - df['block_min']
    df['rota'] = df['origin'] + '-' + df['dest']
    return df.groupby('rota')['sapma'].mean().round(1)


print(blok_sapma(ucus, rota, hl).sort_values())
''',
'tests': '''
_s = blok_sapma(veri.oku('kanat_havayollari', 'hv_flights', parse_dates=['actual_dep', 'actual_arr']), veri.oku('kanat_havayollari', 'hv_routes'), veri.oku('kanat_havayollari', 'hv_airports'))
assert abs(float(_s['IST-LHR']) - ⟨float(_s['IST-LHR'])⟩) < 0.05, "IST-LHR sapması «float(_s['IST-LHR'])» dk olmalı; iki zaman da aynı saat diliminde, dönüşüm gerekmez"
assert abs(float(_s['IST-DXB']) - ⟨float(_s['IST-DXB'])⟩) < 0.05, "IST-DXB sapması «float(_s['IST-DXB'])» dk olmalı"
assert abs(float(_s['IST-ESB']) - ⟨float(_s['IST-ESB'])⟩) < 0.05, "IST-ESB sapması «float(_s['IST-ESB'])» dk olmalı"
assert float(_s.abs().max()) < 30, "Hiçbir rotada sapma saatlerce olmamalı"
''',
'hints': ['Süre hesabı için iki zamanın AYNI saat diliminde olması yeterli.', 'Veri zaten Türkiye saatinde; varışı yerel saate çevirmek iki farklı dilimden zamanı birbirinden çıkarmak demek.', 'Dönüşüm satırını sil; actual_arr - actual_dep doğrudan süreyi verir.'],
'why': '''Süre (duration) bir anın gösterimine bağlı değildir; yalnız iki zaman <b>aynı referansta</b> olmalı. Hatalı kod varışı yerel saate çevirip Türkiye saatindeki kalkıştan çıkardı; yani "elma - armut" yaptı ve Londra'da 3 saat eksik, Dubai'de 1 saat fazla süre üretti. Yerel saat <b>gösterim</b> içindir, aritmetik için değil. Güvenli kural: hesapları UTC'de (ya da tek bir dilimde) yap, gösterirken dönüştür. pandas'ta dilimli zamanlar için <code>tz_localize</code>/<code>tz_convert</code> kullanılır; dilimli iki seriyi çıkarmak dilim farkını otomatik hesaba katar, saf (naive) zamanlara saat eklemek ise katmaz.''',
'tags': ['pandas', 'saat dilimi', 'timedelta', 'hata avı'],
},
{
'id': 'b-532', 'lv': 'ileri', 'diff': 3, 'kind': 'yaz', 'needs': ['sqlite3'], 'min': 18,
'title': 'Rötar zinciri: önceki uçuşu geç gelen uçak (SQL LAG)',
'q': '''<p>Operasyon direktörü "rötarın çoğu zincirleme" diyor. Sınayalım: <b>"Uçağın bir önceki uçuşu 15 dakikadan fazla geç vardıysa, bir sonraki kalkış da 15 dakikadan fazla gecikiyor mu?"</b></p>
<p><code>zincir_etkisi(con)</code> fonksiyonunu yaz. İptal edilmemiş uçuşları <code>tail_no</code> içinde <code>sched_dep</code>'e göre sırala; <code>LAG</code> ile önceki uçuşun varış gecikmesini (<code>actual_arr - sched_arr</code>, dk) al. Önceki varış gecikmesi bilinmeyen (ilk uçuş ya da yön değiştirmiş) satırları at. Sonuç demeti: <code>(önceki geç geldiğinde kalkış rötar oranı, önceki zamanında geldiğinde kalkış rötar oranı)</code>, ikisi de yüzde ve 1 ondalık. Dakika hesabında <code>strftime('%s', ...)</code> kullan.</p>''',
'start': '''
import veri

con = veri.baglan('kanat_havayollari')


def zincir_etkisi(con):
    sorgu = """
    -- WITH s AS (SELECT ..., LAG(...) OVER (PARTITION BY tail_no ORDER BY sched_dep) AS onceki_varis_gec ...)
    """
    pass


print(zincir_etkisi(con))
''',
'sol': '''
import veri

con = veri.baglan('kanat_havayollari')


def zincir_etkisi(con):
    sorgu = """
    WITH g AS (
        SELECT tail_no, sched_dep,
               (strftime('%s', actual_dep) - strftime('%s', sched_dep)) / 60 AS kalkis_gec,
               (strftime('%s', actual_arr) - strftime('%s', sched_arr)) / 60 AS varis_gec
        FROM hv_flights
        WHERE status != 'cancelled'
    ),
    s AS (
        SELECT kalkis_gec,
               LAG(varis_gec) OVER (PARTITION BY tail_no ORDER BY sched_dep) AS onceki_varis_gec
        FROM g
    )
    SELECT onceki_varis_gec > 15 AS onceki_gec,
           ROUND(100.0 * SUM(kalkis_gec > 15) / COUNT(*), 1) AS oran
    FROM s
    WHERE onceki_varis_gec IS NOT NULL
    GROUP BY onceki_gec
    """
    oranlar = dict(con.execute(sorgu).fetchall())
    return (oranlar[1], oranlar[0])


print(zincir_etkisi(con))
''',
'tests': '''
_z = zincir_etkisi(veri.baglan('kanat_havayollari'))
assert isinstance(_z, tuple) and len(_z) == 2, "İki elemanlı demet dönmeli: (önceki geç, önceki zamanında)"
assert abs(_z[0] - ⟨_z[0]⟩) < 0.05, "Önceki uçuş geç vardığında kalkış rötar oranı «_z[0]» olmalı"
assert abs(_z[1] - ⟨_z[1]⟩) < 0.05, "Önceki uçuş zamanında vardığında oran «_z[1]» olmalı"
assert _z[0] > _z[1], "Zincirleme etki varsa ilk oran ikinciden büyük olmalı"
''',
'hints': ['İki CTE: önce her uçuşun kalkış ve varış gecikmesi, sonra LAG ile önceki uçuşun varış gecikmesi.', 'LAG(varis_gec) OVER (PARTITION BY tail_no ORDER BY sched_dep)', 'Son SELECT\'te onceki_varis_gec > 15 ifadesine göre grupla; NULL olanları WHERE ile at.'],
'why': '''<code>LAG</code> aynı bölümdeki (aynı uçak) bir önceki satırın değerini getirir; "önceki olay" sorularının SQL cevabıdır. İptaller uçağın günlük rotasyonundan çıkarılır, yön değiştirmiş (diverted) uçuşun varış zamanı yoktur, LAG o satırda NULL verir ve <code>WHERE ... IS NOT NULL</code> ile dışarıda kalır. Bu veride fark yalnız birkaç puan (≈ %40'a karşı ≈ %37): zincir etkisi var ama direktörün iddia ettiği kadar baskın değil. Oysa hv_delays'te en büyük dakika payı 'gec_gelen_ucak' nedeninde; iki kaynağın bu uyumsuzluğu ya rötar kodlamasının (neden atamasının) gözden geçirilmesi gerektiğini ya da önceki uçuşun ölçütünün (15 dk) fazla kaba olduğunu gösterir. İki koşullu oranın karşılaştırması nedensellik kanıtı da değildir; daha sağlamı dönüş süresini (önceki varış ile planlı kalkış arası) de hesaba katmaktır: dönüş süresi kısaysa gecikme daha kolay aktarılır. Ayrıca hv_delays'teki "gec_gelen_ucak" kodlamasıyla tutarlılığı sınamak iyi bir veri kalitesi kontrolüdür.''',
'tags': ['sqlite3', 'LAG', 'pencere fonksiyonu', 'koşullu oran'],
},
{
'id': 'b-533', 'lv': 'ileri', 'diff': 3, 'kind': 'yaz', 'needs': ['pandas'], 'min': 15,
'title': 'Erken rezervasyon gerçekten ucuz mu?',
'q': '''<p>Gelir yönetimi ekibi kampanya metnini doğrulamak istiyor: <b>"Erken alan kazanır" doğru mu?</b> Rezervasyonun uçuştan kaç gün önce yapıldığına göre ortalama fiyata bak.</p>
<p><code>erken_rezervasyon(rez, ucus, sinif='Eko')</code> fonksiyonunu yaz: yalnız <code>flown</code> ve verilen ücret sınıfındaki rezervasyonlar; gün = <code>(sched_dep - booked_at)</code>'ın gün kısmı (<code>.dt.days</code>). Dilimler <code>pd.cut(gun, [0, 7, 30, 60, 1000], right=False, labels=['0-6', '7-29', '30-59', '60+'])</code>. Dilim → ortalama fiyat (tam sayıya yuvarlanmış, <code>round()</code>) Series'i döndür. Gruplamada <code>observed=True</code> kullan.</p>''',
'start': '''
import pandas as pd
import veri

rez = veri.oku('kanat_havayollari', 'hv_bookings', parse_dates=['booked_at'])
ucus = veri.oku('kanat_havayollari', 'hv_flights', parse_dates=['sched_dep'])


def erken_rezervasyon(rez, ucus, sinif='Eko'):
    # buraya yaz
    pass


for s in ('Eko', 'EkoFlex', 'Business'):
    print(s, erken_rezervasyon(rez, ucus, s).to_dict())
''',
'sol': '''
import pandas as pd
import veri

rez = veri.oku('kanat_havayollari', 'hv_bookings', parse_dates=['booked_at'])
ucus = veri.oku('kanat_havayollari', 'hv_flights', parse_dates=['sched_dep'])


def erken_rezervasyon(rez, ucus, sinif='Eko'):
    d = rez[(rez['status'] == 'flown') & (rez['fare_class'] == sinif)]
    d = d.merge(ucus[['flight_id', 'sched_dep']], on='flight_id')
    gun = (d['sched_dep'] - d['booked_at']).dt.days
    dilim = pd.cut(gun, [0, 7, 30, 60, 1000], right=False, labels=['0-6', '7-29', '30-59', '60+'])
    return d.groupby(dilim, observed=True)['price'].mean().round()


for s in ('Eko', 'EkoFlex', 'Business'):
    print(s, erken_rezervasyon(rez, ucus, s).to_dict())
''',
'tests': '''
_r = veri.oku('kanat_havayollari', 'hv_bookings', parse_dates=['booked_at'])
_u = veri.oku('kanat_havayollari', 'hv_flights', parse_dates=['sched_dep'])
_e = erken_rezervasyon(_r, _u)
assert [str(x) for x in _e.index] == ['0-6', '7-29', '30-59', '60+'], "Dilimler 0-6, 7-29, 30-59, 60+ sırasında olmalı"
assert [float(x) for x in _e] == ⟨[float(x) for x in _e]⟩, "Eko ortalama fiyatları beklenenden farklı"
_b = erken_rezervasyon(_r, _u, 'Business')
assert float(_b.iloc[0]) == ⟨float(_b.iloc[0])⟩, "Business son 7 gün ortalaması «float(_b.iloc[0])» olmalı; sinif parametresini kullandın mı?"
assert float(_e.iloc[0]) > float(_e.iloc[-1]), "Son dakika bileti erken alınandan pahalı olmalı"
''',
'hints': ['Önce süz (flown + sınıf), sonra uçuş tarihini merge ile getir.', 'pd.cut(..., right=False): [0, 7) yani 0–6 gün.', 'd.groupby(dilim, observed=True)[\'price\'].mean().round()'],
'why': '''<code>pd.cut</code> sürekli bir değişkeni kategorilere böler; <code>right=False</code> aralıkları [sol, sağ) yapar, yani 7 gün "7-29" dilimine girer. Kategorik bir seriyle gruplarken <code>observed=True</code> yazmak boş dilimlerin sonuca NaN olarak eklenmesini önler ve pandas sürümleri arasındaki varsayılan değişikliğinden etkilenmez. Sonuç: son hafta biletleri belirgin pahalı, ama 30 günden sonra kazanç düzleşiyor; yani "erken al" mesajı aslında "son haftaya bırakma" demek. Karıştırıcı değişken uyarısı: farklı rotaların rezervasyon penceresi farklı olabilir (uzun hatlar daha erken alınır); rota içinde aynı analizi tekrarlamak daha sağlam olur.''',
'tags': ['pandas', 'pd.cut', 'observed', 'fiyatlandırma'],
},
]
