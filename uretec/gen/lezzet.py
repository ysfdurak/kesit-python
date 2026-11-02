DS = 'lezzet_kurye'
TOPIC = 'Veri seti: Lezzet Kurye'
TITLE = 'Lezzet Kurye (b-499 … b-516)'

TASKS = [
# ---------------------------------------------------------------- TEMEL
{
'id': 'b-499', 'lv': 'temel', 'diff': 1, 'kind': 'rehberli', 'min': 8,
'title': 'Sipariş durumları ve iptal oranı',
'q': '''<p>Lezzet Kurye operasyon müdürü haftalık toplantıya şu soruyla geliyor: <b>"Ekim–Aralık siparişlerinin kaçı teslim edildi, kaçı iptal, kaçı iade? İptal oranımız yüzde kaç?"</b></p>
<p>İki fonksiyon yaz:</p>
<ul><li><code>durum_sayilari(siparisler)</code> → <code>{'teslim': n, 'iptal': n, 'iade': n}</code> gibi bir sözlük</li>
<li><code>iptal_orani(siparisler)</code> → iptal edilenlerin tüm siparişlere oranı (%, 1 ondalık); liste boşsa <code>0.0</code></li></ul>''',
'start': '''
import veri

siparisler = veri.kayitlar('lezzet_kurye', 'lk_orders')


def durum_sayilari(siparisler):
    sayac = {}
    for s in siparisler:
        # TODO: s['status'] anahtarının sayacını artır
        pass
    return sayac


def iptal_orani(siparisler):
    # TODO: boş liste kontrolü
    # TODO: durum_sayilari'ni kullanarak iptal / toplam * 100 hesapla
    pass


print(durum_sayilari(siparisler))
print(iptal_orani(siparisler))
''',
'sol': '''
import veri

siparisler = veri.kayitlar('lezzet_kurye', 'lk_orders')


def durum_sayilari(siparisler):
    sayac = {}
    for s in siparisler:
        sayac[s['status']] = sayac.get(s['status'], 0) + 1
    return sayac


def iptal_orani(siparisler):
    if not siparisler:
        return 0.0
    sayac = durum_sayilari(siparisler)
    return round(100 * sayac.get('iptal', 0) / len(siparisler), 1)


print(durum_sayilari(siparisler))
print(iptal_orani(siparisler))
''',
'tests': '''
_s = veri.kayitlar('lezzet_kurye', 'lk_orders')
assert durum_sayilari(_s) == ⟨durum_sayilari(_s)⟩, "Durum sayıları beklenenden farklı"
assert abs(iptal_orani(_s) - ⟨iptal_orani(_s)⟩) < 0.05, "İptal oranı «iptal_orani(_s)» olmalı (iptal / tüm siparişler × 100)"
assert iptal_orani([]) == 0.0, "Boş listede 0.0 dönmeli (sıfıra bölme olmamalı)"
assert iptal_orani([{'status': 'teslim'}, {'status': 'teslim'}]) == 0.0, "Hiç iptal yoksa get('iptal', 0) ile 0.0 dönmeli, KeyError değil"
''',
'guide': ['durum_sayilari: her siparişin status değerini sözlükte say.', 'iptal_orani: önce boş liste mi diye bak.', 'Sayım fonksiyonunu yeniden kullan; sayac.get(\'iptal\', 0) ile iptal adedini al.', 'Oranı 100 ile çarp, round(..., 1) ile döndür.'],
'example': '''
# Benzer teknik: çağrı merkezinde sonuç türlerini sayıp çözümsüz oranını bulmak
cagrilar = ['çözüldü', 'çözüldü', 'aktarıldı', 'çözümsüz', 'çözüldü']
sayac = {}
for c in cagrilar:
    sayac[c] = sayac.get(c, 0) + 1
print(sayac, round(100 * sayac.get('çözümsüz', 0) / len(cagrilar), 1))
''',
'hints': ['Sayım sözlüğü kalıbı: d[k] = d.get(k, 0) + 1', 'Bir fonksiyon diğerini çağırabilir; kod tekrarı yapma.', 'return round(100 * sayac.get(\'iptal\', 0) / len(siparisler), 1)'],
'why': '''Küçük, tek işi yapan fonksiyonlar yazıp birbirini çağırtmak (bileşim, composition) hem test etmeyi hem yeniden kullanmayı kolaylaştırır. <code>get('iptal', 0)</code> iptalin hiç olmadığı bir dönemde KeyError yerine 0 verir; raporlar boş dönemlerde de çalışmalı. İptal oranı tek başına yorumlanmaz: iptallerin kaçı restoran kaynaklı, kaçı kurye bulunamadığı için? Bunun için iptal edilen siparişlerde courier_id boş mu diye bakmak ilk adımdır.''',
'tags': ['dict', 'sayım', 'oran', 'fonksiyon bileşimi'],
},
{
'id': 'b-500', 'lv': 'temel', 'diff': 1, 'kind': 'yaz', 'min': 7,
'title': 'Ödeme yöntemi payları',
'q': '''<p>Finans ekibi nakit taşıyan kurye sayısını planlıyor: <b>"Teslim edilen siparişlerin yüzde kaçı kart, cüzdan ve nakit ile ödendi?"</b></p>
<p><code>odeme_paylari(siparisler)</code> fonksiyonunu yaz: yalnız <code>status == 'teslim'</code> olan siparişleri al, <code>payment</code> alanına göre yüzdeleri 1 ondalıkla <code>{yöntem: yüzde}</code> olarak döndür. Teslim yoksa boş sözlük.</p>''',
'start': '''
import veri

siparisler = veri.kayitlar('lezzet_kurye', 'lk_orders')


def odeme_paylari(siparisler):
    # buraya yaz
    pass


print(odeme_paylari(siparisler))
''',
'sol': '''
import veri

siparisler = veri.kayitlar('lezzet_kurye', 'lk_orders')


def odeme_paylari(siparisler):
    sayac = {}
    for s in siparisler:
        if s['status'] == 'teslim':
            sayac[s['payment']] = sayac.get(s['payment'], 0) + 1
    toplam = sum(sayac.values())
    if toplam == 0:
        return {}
    return {k: round(100 * v / toplam, 1) for k, v in sayac.items()}


print(odeme_paylari(siparisler))
''',
'tests': '''
_p = odeme_paylari(veri.kayitlar('lezzet_kurye', 'lk_orders'))
assert isinstance(_p, dict) and set(_p) == {'kart', 'cüzdan', 'nakit'}, "Üç ödeme yöntemi de sözlükte olmalı"
assert abs(_p['nakit'] - ⟨_p['nakit']⟩) < 0.05, "Teslimlerde nakit payı «_p['nakit']» olmalı; iptal ve iadeleri dışarıda bıraktın mı?"
assert abs(_p['kart'] - ⟨_p['kart']⟩) < 0.05, "Kart payı «_p['kart']» olmalı"
assert odeme_paylari([{'status': 'iptal', 'payment': 'kart'}]) == {}, "Teslim edilmiş sipariş yoksa boş sözlük dönmeli"
''',
'hints': ['Filtre: status == \'teslim\'.', 'Toplamı ayrı sayaçla ya da sum(sayac.values()) ile bul.', 'Sözlük comprehension ile yüzdeye çevir.'],
'why': '''Payda seçimi soruya bağlıdır: "nakit taşıma" sorusu yalnız gerçekten teslim edilen (yani parası alınan) siparişleri ilgilendirir. <code>sum(sayac.values())</code> filtrelenmiş toplamı ikinci bir döngüye gerek kalmadan verir. Yuvarlamayı en sonda yap. Gerçek işte nakit oranı kurye güvenliği, kasa kapama ve dolandırıcılık riskini doğrudan etkiler; bölge ve saat kırılımıyla birlikte izlenir.''',
'tags': ['dict comprehension', 'yüzde', 'filtre'],
},
{
'id': 'b-501', 'lv': 'temel', 'diff': 2, 'kind': 'rehberli', 'min': 14,
'title': 'En yüksek yemek puanlı 5 restoran',
'q': '''<p>Kampanya ekibi ana sayfada öne çıkaracak restoranları seçiyor: <b>"En az 50 değerlendirmesi olan restoranlar arasında yemek puanı (food_score) ortalaması en yüksek 5 restoran hangisi?"</b></p>
<p>Puanlar <code>lk_ratings</code> tablosunda sipariş bazında; restorana ulaşmak için <code>lk_orders</code> (order_id → restaurant_id), ada ulaşmak için <code>lk_restaurants</code> gerekiyor.</p>
<p><code>en_iyi_restoranlar(siparisler, puanlar, restoranlar, en_az=50)</code> → <code>[(ad, ortalama, adet), ...]</code> (ortalama 2 ondalık, ortalamaya göre azalan, en fazla 5 eleman).</p>''',
'start': '''
import veri

siparisler = veri.kayitlar('lezzet_kurye', 'lk_orders')
puanlar = veri.kayitlar('lezzet_kurye', 'lk_ratings')
restoranlar = veri.kayitlar('lezzet_kurye', 'lk_restaurants')


def en_iyi_restoranlar(siparisler, puanlar, restoranlar, en_az=50):
    siparis_restoran = {s['order_id']: s['restaurant_id'] for s in siparisler}
    adlar = {r['restaurant_id']: r['name'] for r in restoranlar}
    toplam, adet = {}, {}
    for p in puanlar:
        # TODO: puanın ait olduğu restoranı bul, toplam ve adet sözlüklerini güncelle
        pass
    sonuc = []
    # TODO: en_az koşulunu sağlayanlar için (ad, ortalama, adet) ekle
    # TODO: ortalamaya göre azalan sırala, ilk 5'i döndür
    return sonuc


for satir in en_iyi_restoranlar(siparisler, puanlar, restoranlar):
    print(satir)
''',
'sol': '''
import veri

siparisler = veri.kayitlar('lezzet_kurye', 'lk_orders')
puanlar = veri.kayitlar('lezzet_kurye', 'lk_ratings')
restoranlar = veri.kayitlar('lezzet_kurye', 'lk_restaurants')


def en_iyi_restoranlar(siparisler, puanlar, restoranlar, en_az=50):
    siparis_restoran = {s['order_id']: s['restaurant_id'] for s in siparisler}
    adlar = {r['restaurant_id']: r['name'] for r in restoranlar}
    toplam, adet = {}, {}
    for p in puanlar:
        r = siparis_restoran[p['order_id']]
        toplam[r] = toplam.get(r, 0) + p['food_score']
        adet[r] = adet.get(r, 0) + 1
    sonuc = []
    for r, n in adet.items():
        if n >= en_az:
            sonuc.append((adlar[r], round(toplam[r] / n, 2), n))
    sonuc.sort(key=lambda x: x[1], reverse=True)
    return sonuc[:5]


for satir in en_iyi_restoranlar(siparisler, puanlar, restoranlar):
    print(satir)
''',
'tests': '''
_s = veri.kayitlar('lezzet_kurye', 'lk_orders')
_p = veri.kayitlar('lezzet_kurye', 'lk_ratings')
_r = veri.kayitlar('lezzet_kurye', 'lk_restaurants')
_e = en_iyi_restoranlar(_s, _p, _r)
assert len(_e) == 5, "En fazla 5 restoran dönmeli"
assert _e[0][0] == ⟨_e[0][0]⟩, "Birinci sırada «_e[0][0]» olmalı"
assert [x[0] for x in _e] == ⟨[x[0] for x in _e]⟩, "İlk 5 restoran ve sırası beklenenden farklı"
assert all(x[2] >= 50 for x in _e), "Listedeki her restoranın en az 50 değerlendirmesi olmalı"
assert abs(_e[0][1] - ⟨_e[0][1]⟩) < 0.005, "Birincinin ortalaması «_e[0][1]» olmalı"
assert en_iyi_restoranlar(_s, _p, _r, en_az=10000) == [], "Hiçbir restoran eşiği geçmezse boş liste dönmeli"
''',
'guide': ['İki yardımcı sözlük hazır: sipariş → restoran ve restoran → ad.', 'Her puan satırında restoranı bul; toplam ve adet sözlüklerini get ile güncelle.', 'adet sözlüğünü gez; en_az eşiğini geçenler için ortalamayı hesapla ve demet ekle.', 'sort(key=lambda x: x[1], reverse=True) ile sırala, [:5] ile kes.'],
'example': '''
# Benzer teknik: kod tablosuyla eşleyip grup ortalaması (en az 2 kayıt şartı)
urun_kategori = {1: 'içecek', 2: 'tatlı', 3: 'içecek'}
yorumlar = [(1, 4), (3, 5), (2, 3), (1, 5)]
toplam, adet = {}, {}
for urun, puan in yorumlar:
    k = urun_kategori[urun]
    toplam[k] = toplam.get(k, 0) + puan
    adet[k] = adet.get(k, 0) + 1
print([(k, round(toplam[k] / adet[k], 2)) for k in adet if adet[k] >= 2])
''',
'hints': ['Join\'i sözlükle yap: siparis_restoran[p[\'order_id\']].', 'Ortalama için hem toplamı hem adedi tut.', 'sonuc.append((adlar[r], round(toplam[r] / n, 2), n))'],
'why': '''Sözlükle eşleme (lookup), SQL JOIN'in Python karşılığıdır ve her arama O(1) olduğu için toplam iş O(sipariş + puan) olur. Minimum örneklem eşiği (en_az=50) şarttır: 3 değerlendirmesi olan ve hepsi 5 olan bir restoran listenin tepesine çıkar ama bu şanstır. Daha ileri yöntem "Bayes ortalaması"dır: az değerlendirmeli restoranın puanını genel ortalamaya doğru çeker. Sık hata: ortalamayı önce yuvarlayıp sonra sıralamak eşitlikleri bozar; burada ikisi aynı sonuç verir ama hassas sıralamada yuvarlamayı en sona bırak.''',
'tags': ['sözlükle join', 'grup ortalaması', 'sıralama', 'eşik'],
},
{
'id': 'b-502', 'lv': 'temel', 'diff': 1, 'kind': 'bug', 'min': 7,
'title': 'Kurye bahşiş sıralaması yanlış (hatayı bul)',
'q': '''<p>Ay sonu "en çok bahşiş alan kurye" ödülü verilecek ama listedeki tutarlar tuhaf derecede küçük: 10, 20, 30 TL gibi. Her kuryenin <b>toplam</b> bahşişi bu kadar olamaz.</p>
<p><code>bahsis_liderleri(siparisler, n=3)</code> teslim edilen siparişlerdeki <code>tip</code> tutarlarını kurye bazında <b>toplamalı</b> ve en yüksek n kuryeyi <code>[(courier_id, toplam), ...]</code> olarak döndürmeli (toplam 2 ondalık, azalan; eşitlikte küçük courier_id önce). Hatayı bul, düzelt.</p>''',
'start': '''
import veri

siparisler = veri.kayitlar('lezzet_kurye', 'lk_orders')


def bahsis_liderleri(siparisler, n=3):
    toplam = {}
    for s in siparisler:
        if s['status'] == 'teslim':
            k = s['courier_id']
            toplam[k] = s['tip']
    sirali = sorted(toplam.items(), key=lambda x: (-x[1], x[0]))
    return [(k, round(v, 2)) for k, v in sirali[:n]]


print(bahsis_liderleri(siparisler))
''',
'sol': '''
import veri

siparisler = veri.kayitlar('lezzet_kurye', 'lk_orders')


def bahsis_liderleri(siparisler, n=3):
    toplam = {}
    for s in siparisler:
        if s['status'] == 'teslim':
            k = s['courier_id']
            toplam[k] = toplam.get(k, 0) + s['tip']
    sirali = sorted(toplam.items(), key=lambda x: (-x[1], x[0]))
    return [(k, round(v, 2)) for k, v in sirali[:n]]


print(bahsis_liderleri(siparisler))
''',
'tests': '''
_b = bahsis_liderleri(veri.kayitlar('lezzet_kurye', 'lk_orders'))
assert _b[0] == ⟨_b[0]⟩, "Lider kurye ve toplam bahşişi «_b[0]» olmalı"
assert _b == ⟨_b⟩, "İlk 3 kurye ve toplamları beklenenden farklı"
assert bahsis_liderleri([{'status': 'teslim', 'courier_id': 7, 'tip': 10.0}, {'status': 'teslim', 'courier_id': 7, 'tip': 15.0}], 1) == [(7, 25.0)], "Aynı kuryenin bahşişleri toplanmalı (10 + 15 = 25), üzerine yazılmamalı"
''',
'hints': ['Döngü her siparişte sözlükteki değeri ne yapıyor: ekliyor mu, değiştiriyor mu?', 'toplam[k] = s[\'tip\'] her seferinde öncekini siler.', 'toplam[k] = toplam.get(k, 0) + s[\'tip\']'],
'why': '''<b>Atama ile birikim karıştırılmış</b>: <code>toplam[k] = s['tip']</code> her siparişte önceki değeri ezer, sonuçta her kurye için yalnız <b>son</b> siparişin bahşişi kalır. Bu hata sessizdir; çıktı makul görünür ama anlamsızdır. Yakalamanın yolu bir "akıl sağlığı kontrolü" (sanity check): toplamların genel toplamı, tüm bahşişlerin toplamına eşit mi? Alternatif doğru yazımlar: <code>collections.defaultdict(float)</code> ile <code>toplam[k] += s['tip']</code> ya da <code>Counter</code>. Para toplamlarında küsurat birikmesine karşı <code>round</code> ya da <code>Decimal</code> kullan.''',
'tags': ['birikim', 'dict', 'hata avı', 'sanity check'],
},
{
'id': 'b-503', 'lv': 'temel', 'diff': 1, 'kind': 'tamamla', 'min': 6,
'title': 'Sepet büyüklüğü: sipariş başına ortalama ürün adedi',
'q': '''<p>Ürün ekibi "çapraz satış" (cross-sell) önerilerinin etkisini ölçmek için temel değeri istiyor: <b>"Bir siparişte ortalama kaç ürün var?"</b></p>
<p><code>lk_order_lines</code>'ta her satır bir ürün kalemi; <code>qty</code> adet. <code>ortalama_urun_adedi(satirlar)</code> önce sipariş başına toplam adedi bulmalı, sonra bunların ortalamasını 2 ondalıkla döndürmeli. Boşlukları doldur.</p>''',
'start': '''
import veri

satirlar = veri.kayitlar('lezzet_kurye', 'lk_order_lines')


def ortalama_urun_adedi(satirlar):
    adet = {}
    for s in satirlar:
        adet[s['order_id']] = adet.get(___, 0) + ___
    return round(sum(adet.values()) / ___, 2)


print(ortalama_urun_adedi(satirlar))
''',
'sol': '''
import veri

satirlar = veri.kayitlar('lezzet_kurye', 'lk_order_lines')


def ortalama_urun_adedi(satirlar):
    adet = {}
    for s in satirlar:
        adet[s['order_id']] = adet.get(s['order_id'], 0) + s['qty']
    return round(sum(adet.values()) / len(adet), 2)


print(ortalama_urun_adedi(satirlar))
''',
'tests': '''
_s = veri.kayitlar('lezzet_kurye', 'lk_order_lines')
assert abs(ortalama_urun_adedi(_s) - ⟨ortalama_urun_adedi(_s)⟩) < 0.005, "Sipariş başına ortalama ürün adedi «ortalama_urun_adedi(_s)» olmalı"
assert ortalama_urun_adedi([{'order_id': 1, 'qty': 2}, {'order_id': 1, 'qty': 1}, {'order_id': 2, 'qty': 1}]) == 2.0, "İki sipariş: 3 ve 1 adet → ortalama 2.0 (satır sayısına değil sipariş sayısına böl)"
''',
'hints': ['Anahtar sipariş numarası olmalı.', 'Satır sayısı değil qty eklenir.', 'Payda farklı sipariş sayısı: len(adet).'],
'why': '''Payda tuzağı: satır sayısına (<code>len(satirlar)</code>) bölmek "satır başına adet" verir, soru ise "sipariş başına". Önce siparişe göre toplayıp sonra ortalama almak iki aşamalı bir toplama (aggregation of aggregation) örneğidir. SQL karşılığı alt sorguyla: <code>SELECT AVG(adet) FROM (SELECT order_id, SUM(qty) AS adet FROM lk_order_lines GROUP BY order_id)</code>.''',
'tags': ['iki aşamalı toplama', 'ortalama', 'tamamla'],
},
{
'id': 'b-504', 'lv': 'temel', 'diff': 1, 'kind': 'yaz', 'min': 8,
'title': 'En yoğun sipariş saatleri',
'q': '''<p>Vardiya planlayıcısı kurye sayısını saatlere göre ayarlayacak: <b>"Gün içinde en çok sipariş hangi saatlerde geliyor?"</b></p>
<p><code>en_yogun_saatler(siparisler, n=3)</code> fonksiyonunu yaz: <code>placed_at</code> (ör. <code>'2024-10-01 19:07:01'</code>) metninden saati tam sayı olarak çıkar, siparişleri saate göre say ve en çok siparişin geldiği <code>n</code> saati sayıya göre azalan sırada <b>tam sayı listesi</b> olarak döndür.</p>''',
'start': '''
import veri

siparisler = veri.kayitlar('lezzet_kurye', 'lk_orders')


def en_yogun_saatler(siparisler, n=3):
    # buraya yaz
    pass


print(en_yogun_saatler(siparisler))
''',
'sol': '''
import veri

siparisler = veri.kayitlar('lezzet_kurye', 'lk_orders')


def en_yogun_saatler(siparisler, n=3):
    sayac = {}
    for s in siparisler:
        saat = int(s['placed_at'][11:13])
        sayac[saat] = sayac.get(saat, 0) + 1
    sirali = sorted(sayac, key=sayac.get, reverse=True)
    return sirali[:n]


print(en_yogun_saatler(siparisler))
''',
'tests': '''
_s = veri.kayitlar('lezzet_kurye', 'lk_orders')
assert en_yogun_saatler(_s) == ⟨en_yogun_saatler(_s)⟩, "En yoğun 3 saat beklenenden farklı"
assert en_yogun_saatler(_s, 1) == ⟨en_yogun_saatler(_s, 1)⟩, "Tek en yoğun saat «en_yogun_saatler(_s, 1)[0]» olmalı"
assert all(isinstance(x, int) for x in en_yogun_saatler(_s, 5)), "Saatler tam sayı (int) olmalı, '19' gibi metin değil"
''',
'hints': ['Tarih-saat metninde saat 11. ve 12. karakterlerdir: s[11:13].', 'int() ile tam sayıya çevir; yoksa sonuç \'19\' gibi metin olur.', 'sorted(sayac, key=sayac.get, reverse=True) anahtarları değere göre sıralar.'],
'why': '''Sabit biçimli metinlerde dilimleme (slicing) en hızlı ayrıştırmadır; biçim değişebilecekse <code>datetime.fromisoformat(s).hour</code> daha güvenlidir. <code>sorted(sozluk, key=sozluk.get)</code> anahtarları değerlerine göre sıralar; kısa ve okunur bir deyimdir. İş yorumu: öğle (12–13) ve akşam (19–20) iki tepe var; kurye vardiyaları bu iki tepeye göre bölünür (split shift), aradaki sakin saatlerde kurye maliyeti boşa gider.''',
'tags': ['dilimleme', 'sorted key', 'saat'],
},
# ---------------------------------------------------------------- ORTA
{
'id': 'b-505', 'lv': 'orta', 'diff': 2, 'kind': 'rehberli', 'min': 12,
'title': 'Teslim süresi: ortalama, medyan ve %90 dilimi',
'q': '''<p>Müşteri deneyimi ekibi "ortalama 38 dakika" bilgisinin yanıltıcı olabileceğini düşünüyor. Soru: <b>"Teslim süresinin ortalaması, medyanı ve müşterilerin %90'ının altında kaldığı süre (p90) nedir?"</b></p>
<p><code>teslim_suresi_ozeti(siparisler)</code>: <code>status == 'teslim'</code> siparişlerde <code>delivered_at - placed_at</code> farkını dakika olarak hesapla; <code>{'ortalama': x, 'medyan': y, 'p90': z}</code> döndür (hepsi 1 ondalık). p90 için <code>statistics.quantiles(sureler, n=10)[-1]</code> kullan.</p>''',
'start': '''
from datetime import datetime
from statistics import mean, median, quantiles
import veri

siparisler = veri.kayitlar('lezzet_kurye', 'lk_orders')


def teslim_suresi_ozeti(siparisler):
    sureler = []
    for s in siparisler:
        # TODO: yalnız teslim edilenler
        # TODO: iki zamanı datetime.fromisoformat ile çevir
        # TODO: farkın total_seconds() / 60 değerini listeye ekle
        pass
    # TODO: ortalama, medyan, p90 sözlüğünü döndür (1 ondalık)
    return {}


print(teslim_suresi_ozeti(siparisler))
''',
'sol': '''
from datetime import datetime
from statistics import mean, median, quantiles
import veri

siparisler = veri.kayitlar('lezzet_kurye', 'lk_orders')


def teslim_suresi_ozeti(siparisler):
    sureler = []
    for s in siparisler:
        if s['status'] != 'teslim':
            continue
        verilis = datetime.fromisoformat(s['placed_at'])
        teslim = datetime.fromisoformat(s['delivered_at'])
        sureler.append((teslim - verilis).total_seconds() / 60)
    return {
        'ortalama': round(mean(sureler), 1),
        'medyan': round(median(sureler), 1),
        'p90': round(quantiles(sureler, n=10)[-1], 1),
    }


print(teslim_suresi_ozeti(siparisler))
''',
'tests': '''
_o = teslim_suresi_ozeti(veri.kayitlar('lezzet_kurye', 'lk_orders'))
assert set(_o) == {'ortalama', 'medyan', 'p90'}, "Sözlükte ortalama, medyan ve p90 anahtarları olmalı"
assert abs(_o['ortalama'] - ⟨_o['ortalama']⟩) < 0.05, "Ortalama teslim süresi «_o['ortalama']» dakika olmalı (yalnız teslim edilenler)"
assert abs(_o['medyan'] - ⟨_o['medyan']⟩) < 0.05, "Medyan «_o['medyan']» dakika olmalı"
assert abs(_o['p90'] - ⟨_o['p90']⟩) < 0.05, "p90 «_o['p90']» dakika olmalı: quantiles(sureler, n=10)[-1]"
_k = [{'status': 'teslim', 'placed_at': '2024-10-01 12:00:00', 'delivered_at': '2024-10-01 12:30:30'}, {'status': 'iade', 'placed_at': '2024-10-01 12:00:00', 'delivered_at': '2024-10-01 14:00:00'}, {'status': 'teslim', 'placed_at': '2024-10-01 12:00:00', 'delivered_at': '2024-10-01 12:40:30'}]
assert teslim_suresi_ozeti(_k)['ortalama'] == 35.5, "Saniyeler de hesaba katılmalı: 30.5 ve 40.5 dk → 35.5; iade dışarıda"
''',
'guide': ['status \'teslim\' değilse atla (iptalde teslim zamanı yok, iadede süre anlamsız).', 'datetime.fromisoformat(\'2024-10-01 11:07:01\') boşluklu biçimi de okur.', 'Farkı (b - a).total_seconds() / 60 ile dakikaya çevir; .seconds kullanma.', 'mean, median ve quantiles(..., n=10)[-1] ile özetle; round(..., 1).'],
'example': '''
from datetime import datetime
from statistics import median, quantiles
# Benzer teknik: çağrı bekleme süreleri (saniye) için medyan ve p90
cagri = [('09:00:00', '09:01:10'), ('09:05:00', '09:05:20'), ('09:10:00', '09:14:00'), ('09:20:00', '09:20:40')]
sure = [(datetime.fromisoformat('2024-01-01 ' + b) - datetime.fromisoformat('2024-01-01 ' + a)).total_seconds() for a, b in cagri]
print(median(sure), round(quantiles(sure, n=10)[-1], 1))
''',
'hints': ['timedelta.total_seconds() toplam saniyeyi verir; .seconds yalnız gün içi kalan saniyedir.', 'quantiles(veri, n=10) dokuz kesim noktası döndürür; sonuncusu %90 dilimidir.', 'return {\'ortalama\': round(mean(sureler), 1), ...}'],
'why': '''Ortalama tek başına kullanıcı deneyimini anlatmaz; müşteriler en kötü siparişlerini hatırlar. Bu yüzden servis seviyesi (SLA) genellikle p90/p95 ile tanımlanır: "siparişlerin %90'ı X dakikada teslim edilir". <code>timedelta.seconds</code> bir günü aşan farklarda yanlış sonuç verir; her zaman <code>total_seconds()</code> kullan. <code>statistics.quantiles</code> varsayılan olarak "exclusive" yöntemi kullanır; numpy/pandas'ın varsayılan "linear" yöntemiyle küçük farklar çıkabilir. Hangi yöntemi kullandığını raporda belirt.''',
'tags': ['datetime', 'total_seconds', 'quantiles', 'SLA'],
},
{
'id': 'b-506', 'lv': 'orta', 'diff': 2, 'kind': 'yaz', 'min': 12,
'title': 'Gecikme oranı: öğle mi akşam mı?',
'q': '''<p>Lezzet Kurye 45 dakikayı aşan teslimatları "gecikmiş" sayıyor. Operasyon direktörü: <b>"Gecikme oranı öğle yoğunluğunda mı, akşam yoğunluğunda mı daha kötü?"</b></p>
<p><code>gecikme_orani(siparisler, esik=45)</code> fonksiyonunu yaz. Yalnız teslim edilen siparişler; süre = <code>delivered_at - placed_at</code> (dakika). Dilim <code>placed_at</code> saatine göre: <code>'öğle'</code> 11–14, <code>'akşam'</code> 17–21 (uçlar dahil), diğerleri <code>'diğer'</code>. Sonuç: <code>{'öğle': %, 'akşam': %, 'diğer': %}</code>, her dilimde süre &gt; esik olanların yüzdesi (1 ondalık).</p>''',
'start': '''
from datetime import datetime
import veri

siparisler = veri.kayitlar('lezzet_kurye', 'lk_orders')


def gecikme_orani(siparisler, esik=45):
    # buraya yaz
    pass


print(gecikme_orani(siparisler))
''',
'sol': '''
from datetime import datetime
import veri

siparisler = veri.kayitlar('lezzet_kurye', 'lk_orders')


def dilim(saat):
    if 11 <= saat <= 14:
        return 'öğle'
    if 17 <= saat <= 21:
        return 'akşam'
    return 'diğer'


def gecikme_orani(siparisler, esik=45):
    toplam = {'öğle': 0, 'akşam': 0, 'diğer': 0}
    gec = {'öğle': 0, 'akşam': 0, 'diğer': 0}
    for s in siparisler:
        if s['status'] != 'teslim':
            continue
        a = datetime.fromisoformat(s['placed_at'])
        b = datetime.fromisoformat(s['delivered_at'])
        d = dilim(a.hour)
        toplam[d] += 1
        if (b - a).total_seconds() / 60 > esik:
            gec[d] += 1
    return {d: round(100 * gec[d] / toplam[d], 1) if toplam[d] else 0.0 for d in toplam}


print(gecikme_orani(siparisler))
''',
'tests': '''
_s = veri.kayitlar('lezzet_kurye', 'lk_orders')
_g = gecikme_orani(_s)
assert set(_g) == {'öğle', 'akşam', 'diğer'}, "Üç dilim de sözlükte olmalı"
assert abs(_g['akşam'] - ⟨_g['akşam']⟩) < 0.05, "Akşam diliminde gecikme oranı «_g['akşam']» olmalı"
assert abs(_g['öğle'] - ⟨_g['öğle']⟩) < 0.05, "Öğle diliminde gecikme oranı «_g['öğle']» olmalı; 14:59'da verilen sipariş de öğle dilimidir"
assert abs(_g['diğer'] - ⟨_g['diğer']⟩) < 0.05, "Diğer dilimde «_g['diğer']» bekleniyor"
assert abs(gecikme_orani(_s, 60)['akşam'] - ⟨gecikme_orani(_s, 60)['akşam']⟩) < 0.05, "Eşik parametresi kullanılmalı: 60 dk eşiğiyle akşam «gecikme_orani(_s, 60)['akşam']»"
''',
'hints': ['Saat → dilim eşlemesini küçük bir yardımcı fonksiyona koy.', 'Her dilim için iki sayaç tut: toplam ve geciken.', 'Eşik "aşan" diyor: > esik (eşit olan gecikmiş sayılmaz).'],
'why': '''Bir oranı gruplara göre karşılaştırırken her grupta ayrı pay ve payda tutulur; tek genel oran bu farkı gizler (Simpson paradoksuna da kapı açar). Dilim eşlemesini ayrı fonksiyona koymak hem okunurluğu artırır hem de iş kuralı değişince (ör. akşam 18–22 olursa) tek yerden güncellemeyi sağlar. Sınır koşulları (11 ve 14 dahil, &gt; 45) iş tanımıdır; kodda açıkça görünmeli. Sonuç yorumu: yoğun saatlerde gecikme artıyorsa çözüm kurye sayısıdır; artmıyorsa mutfak hazırlama süresine (placed → picked) bakılmalı.''',
'tags': ['datetime', 'gruplu oran', 'yardımcı fonksiyon', 'SLA'],
},
{
'id': 'b-507', 'lv': 'orta', 'diff': 2, 'kind': 'rehberli', 'needs': ['sqlite3'], 'min': 12,
'title': 'Restoran puan tablosu (SQL)',
'q': '''<p>Aynı "en iyi restoranlar" sorusu bu kez SQL ile ve daha zengin: <b>"En az 50 değerlendirmesi olan restoranlar arasında yemek puanı ortalaması en yüksek 5 restoranın adı, mutfağı, ortalaması ve değerlendirme sayısı?"</b></p>
<p><code>puan_tablosu(con)</code> fonksiyonunu yaz (<code>con = veri.baglan('lezzet_kurye')</code>). Sonuç <code>(ad, mutfak, ortalama, adet)</code> demetleri; ortalama <code>ROUND(AVG(...), 2)</code>, ortalamaya göre azalan, en fazla 5 satır.</p>''',
'start': '''
import veri

con = veri.baglan('lezzet_kurye')


def puan_tablosu(con):
    sorgu = """
    SELECT r.name, r.cuisine,
           -- TODO: ortalama yemek puanı (2 ondalık) ve değerlendirme sayısı
    FROM lk_ratings p
    -- TODO: lk_orders ile order_id üzerinden, lk_restaurants ile restaurant_id üzerinden birleştir
    GROUP BY r.restaurant_id
    -- TODO: en az 50 değerlendirme (HAVING)
    -- TODO: sırala ve 5 satırla sınırla
    """
    return con.execute(sorgu).fetchall()


for satir in puan_tablosu(con):
    print(satir)
''',
'sol': '''
import veri

con = veri.baglan('lezzet_kurye')


def puan_tablosu(con):
    sorgu = """
    SELECT r.name, r.cuisine,
           ROUND(AVG(p.food_score), 2) AS ort,
           COUNT(*) AS adet
    FROM lk_ratings p
    JOIN lk_orders o ON o.order_id = p.order_id
    JOIN lk_restaurants r ON r.restaurant_id = o.restaurant_id
    GROUP BY r.restaurant_id
    HAVING COUNT(*) >= 50
    ORDER BY ort DESC
    LIMIT 5
    """
    return con.execute(sorgu).fetchall()


for satir in puan_tablosu(con):
    print(satir)
''',
'tests': '''
_t = puan_tablosu(veri.baglan('lezzet_kurye'))
assert len(_t) == 5, "LIMIT 5 ile tam 5 satır dönmeli"
assert [x[0] for x in _t] == ⟨[x[0] for x in _t]⟩, "Restoran sırası beklenenden farklı"
assert _t[0] == ⟨tuple(_t[0])⟩, "İlk satır (ad, mutfak, ortalama, adet) beklenenden farklı"
assert all(x[3] >= 50 for x in _t), "HAVING COUNT(*) >= 50 koşulu sağlanmalı"
''',
'guide': ['Puan tablosundan başla; önce lk_orders\'a, oradan lk_restaurants\'a JOIN yap.', 'SELECT\'e ROUND(AVG(p.food_score), 2) ve COUNT(*) ekle.', 'Grup koşulu WHERE ile değil HAVING ile yazılır: HAVING COUNT(*) >= 50.', 'ORDER BY ort DESC LIMIT 5.'],
'example': '''
import sqlite3
# Benzer teknik: JOIN + GROUP BY + HAVING (küçük bellek içi tablo)
con = sqlite3.connect(':memory:')
con.executescript("""
CREATE TABLE yorum (urun_id, puan);
CREATE TABLE urun (urun_id, ad);
INSERT INTO urun VALUES (1, 'Çay'), (2, 'Kahve');
INSERT INTO yorum VALUES (1, 5), (1, 4), (2, 3);
""")
print(con.execute("""SELECT u.ad, ROUND(AVG(y.puan), 2), COUNT(*) FROM yorum y JOIN urun u ON u.urun_id = y.urun_id
GROUP BY u.urun_id HAVING COUNT(*) >= 2""").fetchall())
''',
'hints': ['İki JOIN gerek: puan → sipariş → restoran.', 'Toplama fonksiyonu üzerindeki koşul HAVING\'e yazılır.', 'HAVING COUNT(*) >= 50 ORDER BY ort DESC LIMIT 5'],
'why': '''WHERE satırları gruplamadan <b>önce</b>, HAVING grupları <b>sonra</b> süzer; "en az 50 değerlendirme" bir grup özelliği olduğu için HAVING gerekir. Temel seviyedeki sözlük çözümüyle aynı sonucu verir; büyük veride veritabanında toplamak, veriyi Python'a taşımaktan çok daha verimlidir. <code>GROUP BY r.restaurant_id</code> ile gruplamak, aynı adlı iki restoranın yanlışlıkla birleşmesini önler. Eşit ortalamalarda sıra belirsizdir; kesin sıra gerekiyorsa <code>ORDER BY ort DESC, adet DESC</code> gibi ikinci ölçüt ekle.''',
'tags': ['sqlite3', 'JOIN', 'HAVING', 'LIMIT'],
},
{
'id': 'b-508', 'lv': 'orta', 'diff': 2, 'kind': 'yaz', 'min': 12,
'title': 'Kurye verimliliği: günlük teslimat ortalaması',
'q': '''<p>Kurye performans primleri için İK ve operasyon ortak bir ölçüt istiyor: <b>"Her kurye, çalıştığı günlerde ortalama kaç teslimat yapıyor?"</b> (Toplam teslimat, çok gün çalışan kuryeyi kayırır.)</p>
<p><code>kurye_verimliligi(siparisler, n=5)</code> fonksiyonunu yaz: teslim edilen siparişleri kuryeye göre say, kuryenin teslimat yaptığı <b>farklı gün</b> sayısını (<code>delivered_at</code> tarihinin ilk 10 karakteri) bul, <code>teslimat / gün</code> oranına göre en verimli <code>n</code> kuryeyi <code>[(courier_id, oran), ...]</code> olarak döndür (oran 2 ondalık, azalan; eşitlikte küçük id önce).</p>''',
'start': '''
from collections import defaultdict
import veri

siparisler = veri.kayitlar('lezzet_kurye', 'lk_orders')


def kurye_verimliligi(siparisler, n=5):
    # buraya yaz
    pass


print(kurye_verimliligi(siparisler))
''',
'sol': '''
from collections import defaultdict
import veri

siparisler = veri.kayitlar('lezzet_kurye', 'lk_orders')


def kurye_verimliligi(siparisler, n=5):
    adet = defaultdict(int)
    gunler = defaultdict(set)
    for s in siparisler:
        if s['status'] != 'teslim':
            continue
        k = s['courier_id']
        adet[k] += 1
        gunler[k].add(s['delivered_at'][:10])
    oran = {k: round(adet[k] / len(gunler[k]), 2) for k in adet}
    sirali = sorted(oran.items(), key=lambda x: (-x[1], x[0]))
    return sirali[:n]


print(kurye_verimliligi(siparisler))
''',
'tests': '''
_s = veri.kayitlar('lezzet_kurye', 'lk_orders')
_v = kurye_verimliligi(_s)
assert len(_v) == 5, "Varsayılan n=5"
assert _v[0] == ⟨_v[0]⟩, "En verimli kurye ve oranı «_v[0]» olmalı"
assert _v == ⟨_v⟩, "İlk 5 kurye ve oranları beklenenden farklı; gün sayısını küme (set) ile mi buldun?"
_k = [{'status': 'teslim', 'courier_id': 1, 'delivered_at': '2024-10-01 12:00:00'}, {'status': 'teslim', 'courier_id': 1, 'delivered_at': '2024-10-01 19:00:00'}, {'status': 'teslim', 'courier_id': 1, 'delivered_at': '2024-10-02 12:00:00'}]
assert kurye_verimliligi(_k) == [(1, 1.5)], "Aynı gündeki iki teslimat tek gün sayılmalı: 3 teslimat / 2 gün = 1.5"
''',
'hints': ['İki şey biriktir: teslimat sayısı ve farklı günler.', 'Farklı günler için defaultdict(set) ve .add(tarih[:10]).', 'Oran = adet[k] / len(gunler[k]).'],
'why': '''Küme (set) "farklı değer sayısı" (distinct count) için doğal veri yapısıdır; aynı tarihi ikinci kez eklemek bir şey değiştirmez. <code>defaultdict(set)</code> ve <code>defaultdict(int)</code> anahtar kontrolü yazmadan biriktirmeyi sağlar. Normalleştirme (toplam yerine gün başına) adil karşılaştırmanın temelidir; yarı zamanlı ve tam zamanlı kuryeyi aynı ölçüyle değerlendirir. Yine de "gün" kaba bir birimdir: aktif saat (vardiya) verisi olsaydı saat başına teslimat daha iyi ölçü olurdu.''',
'tags': ['defaultdict', 'set', 'distinct count', 'normalleştirme'],
},
{
'id': 'b-509', 'lv': 'orta', 'diff': 2, 'kind': 'yaz', 'min': 10,
'title': 'Sepet tutarı dilimleri ve ücretsiz teslimat eşiği',
'q': '''<p>Lezzet Kurye 400 TL ve üzeri sepetlerde teslimatı ücretsiz yapıyor. Fiyatlandırma ekibi soruyor: <b>"Siparişlerin kaçı 200 TL altında, kaçı 200–399 arasında, kaçı 400 ve üstünde?"</b></p>
<p><code>sepet_dilimleri(satirlar)</code>: önce her siparişin sepet tutarını bul (<code>qty × unit_price</code> toplamı), sonra <code>{'0-199': n, '200-399': n, '400+': n}</code> sayımını döndür. Dilim sınırı: tutar &lt; 200, 200 ≤ tutar &lt; 400, tutar ≥ 400.</p>''',
'start': '''
import veri

satirlar = veri.kayitlar('lezzet_kurye', 'lk_order_lines')


def sepet_dilimleri(satirlar):
    # buraya yaz
    pass


print(sepet_dilimleri(satirlar))
''',
'sol': '''
import veri

satirlar = veri.kayitlar('lezzet_kurye', 'lk_order_lines')


def sepet_dilimleri(satirlar):
    sepet = {}
    for s in satirlar:
        sepet[s['order_id']] = sepet.get(s['order_id'], 0) + s['qty'] * s['unit_price']
    dilim = {'0-199': 0, '200-399': 0, '400+': 0}
    for tutar in sepet.values():
        if tutar < 200:
            dilim['0-199'] += 1
        elif tutar < 400:
            dilim['200-399'] += 1
        else:
            dilim['400+'] += 1
    return dilim


print(sepet_dilimleri(satirlar))
''',
'tests': '''
_d = sepet_dilimleri(veri.kayitlar('lezzet_kurye', 'lk_order_lines'))
assert sum(_d.values()) == ⟨sum(_d.values())⟩, "Toplam sipariş sayısı «sum(_d.values())» olmalı (satır sayısı değil)"
assert _d == ⟨_d⟩, "Dilim sayıları beklenenden farklı; tutarı qty ile çarptın mı?"
assert sepet_dilimleri([{'order_id': 1, 'qty': 2, 'unit_price': 200.0}]) == {'0-199': 0, '200-399': 0, '400+': 1}, "2 × 200 = 400 TL ücretsiz teslimat dilimine girer"
assert sepet_dilimleri([{'order_id': 1, 'qty': 1, 'unit_price': 199.99}, {'order_id': 2, 'qty': 1, 'unit_price': 200.0}]) == {'0-199': 1, '200-399': 1, '400+': 0}, "199.99 ilk dilimde, 200 ikinci dilimde olmalı"
''',
'hints': ['Önce sipariş başına tutarı topla (iki aşamalı toplama).', 'Satır tutarı = qty * unit_price.', 'if / elif / else zinciri sınırları tek tek kontrol eder: < 200, < 400, gerisi.'],
'why': '''Dilimleme (binning) kararları sınır noktalarında yanlış gider; <code>if/elif</code> zincirinde sırayla <code>&lt;</code> kullanmak dilimleri çakışmasız ve boşluksuz yapar. Bu veride 400 TL eşiği güçlü bir davranış etkisi yaratır: insanlar ücretsiz teslimat için sepeti büyütür; eşiğin hemen üstünde bir yığılma görmek beklenir (ileri analizde histogramla bak). pandas karşılığı: <code>pd.cut(tutar, [0, 200, 400, float('inf')], right=False)</code>; <code>right=False</code> sol ucu dahil eder.''',
'tags': ['binning', 'if-elif', 'iki aşamalı toplama'],
},
{
'id': 'b-510', 'lv': 'orta', 'diff': 2, 'kind': 'tamamla', 'min': 8,
'title': 'Dedektif: platforma katılmadan sipariş alan restoranlar',
'q': '''<p>Veri ekibine bir ihbar geldi: <b>"Bazı restoranların platforma katılma tarihi (<code>opened_date</code>) yanlış girilmiş olabilir; katılmadan önce sipariş almış görünüyorlar."</b></p>
<p><code>katilim_oncesi(siparisler, restoranlar)</code> fonksiyonu <code>placed_at</code> tarihi (ilk 10 karakter) restoranın <code>opened_date</code> değerinden <b>önce</b> olan siparişleri restoran <b>adına</b> göre saymalı. <code>opened_date</code> boş olan restoranları atla. Boşlukları doldur.</p>''',
'start': '''
import veri

siparisler = veri.kayitlar('lezzet_kurye', 'lk_orders')
restoranlar = veri.kayitlar('lezzet_kurye', 'lk_restaurants')


def katilim_oncesi(siparisler, restoranlar):
    katilim = {r['restaurant_id']: (r['name'], r['opened_date']) for r in restoranlar}
    sonuc = {}
    for s in siparisler:
        ad, tarih = katilim[___]
        if tarih is ___:
            continue
        if s['placed_at'][:10] ___ tarih:
            sonuc[ad] = sonuc.get(ad, 0) + 1
    return sonuc


print(katilim_oncesi(siparisler, restoranlar))
''',
'sol': '''
import veri

siparisler = veri.kayitlar('lezzet_kurye', 'lk_orders')
restoranlar = veri.kayitlar('lezzet_kurye', 'lk_restaurants')


def katilim_oncesi(siparisler, restoranlar):
    katilim = {r['restaurant_id']: (r['name'], r['opened_date']) for r in restoranlar}
    sonuc = {}
    for s in siparisler:
        ad, tarih = katilim[s['restaurant_id']]
        if tarih is None:
            continue
        if s['placed_at'][:10] < tarih:
            sonuc[ad] = sonuc.get(ad, 0) + 1
    return sonuc


print(katilim_oncesi(siparisler, restoranlar))
''',
'tests': '''
_k = katilim_oncesi(veri.kayitlar('lezzet_kurye', 'lk_orders'), veri.kayitlar('lezzet_kurye', 'lk_restaurants'))
assert _k == ⟨_k⟩, "Şüpheli restoranlar ve sipariş sayıları beklenenden farklı"
assert katilim_oncesi([{'restaurant_id': 1, 'placed_at': '2024-11-05 12:00:00'}], [{'restaurant_id': 1, 'name': 'X', 'opened_date': '2024-11-05'}]) == {}, "Katılım günü verilen sipariş şüpheli değildir (önce = küçüktür)"
''',
'hints': ['Sözlükteki anahtar restaurant_id.', 'Boş tarih None\'dır.', 'ISO tarih metinleri < ile karşılaştırılabilir.'],
'why': '''İki restoranda yüzlerce sipariş katılım tarihinden önce görünüyor. Bu kadar çok kayıt "sahte sipariş"ten çok <b>ana veri (master data) hatasına</b> işaret eder: katılım tarihi muhtemelen sözleşme yenileme ya da yeniden açılış tarihiyle karıştırılmış. Dedektif ilkesi: anomaliyi bulunca önce en sıradan açıklamayı sına (veri girişi), sonra sahtekârlığı. Doğrulamak için o restoranların ilk siparişinin tarihine bak; tutarlı bir başlangıç varsa gerçek katılım tarihi odur. ISO metin karşılaştırması burada güvenlidir çünkü iki taraf da YYYY-MM-DD biçimindedir.''',
'tags': ['veri kalitesi', 'anomali', 'tarih karşılaştırma', 'tamamla'],
},
{
'id': 'b-511', 'lv': 'orta', 'diff': 2, 'kind': 'rehberli', 'min': 15,
'title': 'Şehir bazında platform komisyon geliri',
'q': '''<p>CFO yatırımcı sunumu için soruyor: <b>"Teslim edilen siparişlerden aldığımız komisyon geliri şehir bazında ne kadar?"</b></p>
<p>Komisyon = sepet tutarı (satırlardaki <code>qty × unit_price</code> toplamı) × restoranın <code>commission_pct</code> / 100. Şehir restoranın şehridir.</p>
<p><code>komisyon_geliri(siparisler, satirlar, restoranlar)</code> → <code>{şehir: tutar}</code> (2 ondalık). Yalnız <code>status == 'teslim'</code>.</p>''',
'start': '''
import veri

siparisler = veri.kayitlar('lezzet_kurye', 'lk_orders')
satirlar = veri.kayitlar('lezzet_kurye', 'lk_order_lines')
restoranlar = veri.kayitlar('lezzet_kurye', 'lk_restaurants')


def komisyon_geliri(siparisler, satirlar, restoranlar):
    # 1) Sipariş başına sepet tutarı
    sepet = {}
    # TODO: satırları gez, sepet[order_id] += qty * unit_price
    # 2) Restoran → (şehir, komisyon yüzdesi)
    rest = {r['restaurant_id']: (r['city'], r['commission_pct']) for r in restoranlar}
    # 3) TODO: teslim edilen siparişleri gez; şehre komisyonu ekle
    gelir = {}
    # TODO: tutarları 2 ondalığa yuvarlayıp döndür
    return gelir


print(komisyon_geliri(siparisler, satirlar, restoranlar))
''',
'sol': '''
import veri

siparisler = veri.kayitlar('lezzet_kurye', 'lk_orders')
satirlar = veri.kayitlar('lezzet_kurye', 'lk_order_lines')
restoranlar = veri.kayitlar('lezzet_kurye', 'lk_restaurants')


def komisyon_geliri(siparisler, satirlar, restoranlar):
    sepet = {}
    for s in satirlar:
        sepet[s['order_id']] = sepet.get(s['order_id'], 0) + s['qty'] * s['unit_price']
    rest = {r['restaurant_id']: (r['city'], r['commission_pct']) for r in restoranlar}
    gelir = {}
    for o in siparisler:
        if o['status'] != 'teslim':
            continue
        sehir, oran = rest[o['restaurant_id']]
        gelir[sehir] = gelir.get(sehir, 0) + sepet.get(o['order_id'], 0) * oran / 100
    return {k: round(v, 2) for k, v in gelir.items()}


print(komisyon_geliri(siparisler, satirlar, restoranlar))
''',
'tests': '''
_g = komisyon_geliri(veri.kayitlar('lezzet_kurye', 'lk_orders'), veri.kayitlar('lezzet_kurye', 'lk_order_lines'), veri.kayitlar('lezzet_kurye', 'lk_restaurants'))
assert set(_g) == ⟨set(_g)⟩, "Şehirler beklenenden farklı"
assert abs(_g['İstanbul'] - ⟨_g['İstanbul']⟩) < 0.05, "İstanbul komisyon geliri «_g['İstanbul']» TL olmalı"
assert abs(sum(_g.values()) - ⟨round(sum(_g.values()), 2)⟩) < 0.1, "Toplam komisyon «round(sum(_g.values()), 2)» TL olmalı; iptal ve iadeleri çıkardın mı?"
_kk = komisyon_geliri([{'order_id': 1, 'restaurant_id': 5, 'status': 'teslim'}], [{'order_id': 1, 'qty': 2, 'unit_price': 100.0}], [{'restaurant_id': 5, 'city': 'Ankara', 'commission_pct': 15.0}])
assert _kk == {'Ankara': 30.0}, "2 × 100 TL sepet, %15 komisyon → 30 TL"
''',
'guide': ['Satırlardan sipariş başına sepet tutarını topla.', 'Restoran sözlüğü (şehir, oran) hazır.', 'Teslim edilmeyen siparişleri atla; sepet × oran / 100\'ü şehrin toplamına ekle.', 'Sonda sözlük comprehension ile 2 ondalığa yuvarla.'],
'example': '''
# Benzer teknik: üç kaynaktan veriyi sözlüklerle birleştirip bölgeye göre prim hesaplamak
satislar = [('S1', 'A', 1000), ('S2', 'B', 500), ('S3', 'A', 200)]
temsilci = {'A': ('Ege', 0.05), 'B': ('Marmara', 0.08)}
prim = {}
for _, t, tutar in satislar:
    bolge, oran = temsilci[t]
    prim[bolge] = prim.get(bolge, 0) + tutar * oran
print({k: round(v, 2) for k, v in prim.items()})
''',
'hints': ['Üç tablo, iki sözlük: sepet (order_id → tutar) ve rest (restaurant_id → (şehir, oran)).', 'Demet açma: sehir, oran = rest[o[\'restaurant_id\']]', 'gelir[sehir] = gelir.get(sehir, 0) + sepet[o[\'order_id\']] * oran / 100'],
'why': '''Üç tabloyu birleştirmenin Python yolu: büyük tabloyu tek geçişte gezip küçük tabloları sözlük olarak hazırlamak. Platform geliri sepetin tamamı değildir; komisyon oranı restorana göre değişir (%12–%22), bu yüzden şehir sıralaması sepet hacmi sıralamasından farklı olabilir. Not: indirim (discount) kimin cebinden çıkıyor? Bu modelde komisyonu brüt sepetten hesapladık; gerçek sözleşmelerde indirimin platform mu restoran mı tarafından karşılandığı gelir hesabını değiştirir. Varsayımını raporda yaz.''',
'tags': ['çok tablolu join', 'sözlük', 'gelir', 'komisyon'],
},
# ---------------------------------------------------------------- İLERİ
{
'id': 'b-512', 'lv': 'ileri', 'diff': 3, 'kind': 'rehberli', 'needs': ['pandas'], 'min': 14,
'title': 'Gün × saat dilimi yoğunluk tablosu (pandas)',
'q': '''<p>Kurye vardiya planı için operasyon ekibi tek bir ısı haritası tablosu istiyor: <b>"Haftanın her günü, her saat diliminde kaç sipariş geliyor?"</b></p>
<p><code>yogunluk_tablosu(sip)</code> fonksiyonunu yaz. Satırlar Türkçe gün adları (Pazartesi … Pazar sırasıyla), sütunlar saat dilimleri: <code>gece</code> (0–10), <code>öğle</code> (11–14), <code>ikindi</code> (15–16), <code>akşam</code> (17–21), <code>geç</code> (22–23). Değerler sipariş sayısı (tüm durumlar). Hiç sipariş olmayan hücre 0 olsun.</p>''',
'start': '''
import pandas as pd
import veri

sip = veri.oku('lezzet_kurye', 'lk_orders', parse_dates=['placed_at'])
GUNLER = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar']
DILIMLER = ['gece', 'öğle', 'ikindi', 'akşam', 'geç']


def saat_dilimi(saat):
    # TODO: saat → dilim adı
    pass


def yogunluk_tablosu(sip):
    gun = sip['placed_at'].dt.dayofweek.map(dict(enumerate(GUNLER)))
    # TODO: dilim = saat sütununa saat_dilimi uygula (.map)
    # TODO: pd.crosstab(gun, dilim) ve reindex(index=GUNLER, columns=DILIMLER, fill_value=0)
    pass


print(yogunluk_tablosu(sip))
''',
'sol': '''
import pandas as pd
import veri

sip = veri.oku('lezzet_kurye', 'lk_orders', parse_dates=['placed_at'])
GUNLER = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar']
DILIMLER = ['gece', 'öğle', 'ikindi', 'akşam', 'geç']


def saat_dilimi(saat):
    if saat <= 10:
        return 'gece'
    if saat <= 14:
        return 'öğle'
    if saat <= 16:
        return 'ikindi'
    if saat <= 21:
        return 'akşam'
    return 'geç'


def yogunluk_tablosu(sip):
    gun = sip['placed_at'].dt.dayofweek.map(dict(enumerate(GUNLER)))
    dilim = sip['placed_at'].dt.hour.map(saat_dilimi)
    tablo = pd.crosstab(gun, dilim)
    return tablo.reindex(index=GUNLER, columns=DILIMLER, fill_value=0)


print(yogunluk_tablosu(sip))
''',
'tests': '''
_t = yogunluk_tablosu(veri.oku('lezzet_kurye', 'lk_orders', parse_dates=['placed_at']))
assert isinstance(_t, pd.DataFrame), "Sonuç DataFrame olmalı"
assert list(_t.index) == GUNLER and list(_t.columns) == DILIMLER, "Satırlar Pazartesi→Pazar, sütunlar gece→geç sırasında olmalı (reindex)"
assert int(_t.values.sum()) == ⟨int(_t.values.sum())⟩, "Tüm hücrelerin toplamı sipariş sayısına («int(_t.values.sum())») eşit olmalı"
assert int(_t.loc['Cumartesi', 'akşam']) == ⟨int(_t.loc['Cumartesi', 'akşam'])⟩, "Cumartesi akşam hücresi «int(_t.loc['Cumartesi', 'akşam'])» olmalı"
assert int(_t.loc['Salı', 'öğle']) == ⟨int(_t.loc['Salı', 'öğle'])⟩, "Salı öğle hücresi «int(_t.loc['Salı', 'öğle'])» olmalı"
assert _t.stack().idxmax() == ⟨tuple(_t.stack().idxmax())⟩, "En yoğun hücre «tuple(_t.stack().idxmax())» olmalı"
''',
'guide': ['saat_dilimi fonksiyonunu küçükten büyüğe if zinciriyle yaz.', 'dt.hour ile saati al, .map(saat_dilimi) ile dilime çevir.', 'pd.crosstab(gun, dilim) iki seriyi çapraz sayar.', 'reindex ile satır/sütun sırasını sabitle; eksik hücreler fill_value=0.'],
'example': '''
import pandas as pd
# Benzer teknik: kanal × ödeme türü çapraz tablosu, sabit sıra
df = pd.DataFrame({'kanal': ['web', 'mobil', 'web', 'web'], 'odeme': ['kart', 'kart', 'havale', 'kart']})
t = pd.crosstab(df['kanal'], df['odeme']).reindex(index=['mobil', 'web', 'çağrı'], columns=['kart', 'havale'], fill_value=0)
print(t)
''',
'hints': ['dt.dayofweek 0=Pazartesi; dict(enumerate(GUNLER)) ile ada çevir (iskelette hazır).', 'pd.crosstab satır ve sütunları alfabetik sıralar; reindex ile düzelt.', 'return pd.crosstab(gun, dilim).reindex(index=GUNLER, columns=DILIMLER, fill_value=0)'],
'why': '''<code>crosstab</code> iki kategorinin frekans tablosunu tek satırda kurar; <code>pivot_table(aggfunc='size')</code> ile de yapılabilir. Türkçe adlar alfabetik sıralanınca "Cuma, Cumartesi, Çarşamba..." gibi anlamsız bir düzen çıkar; <code>reindex</code> iş sırasını garanti eder ve eksik hücreyi 0 yapar. Kategorik tip (<code>pd.Categorical(..., ordered=True)</code>) başka bir çözümdür ama pandas sürümleri arasında groupby davranışı (observed) farklıdır; reindex her sürümde aynı çalışır. Tablo doğrudan ısı haritasına (heatmap) dönüştürülebilir.''',
'tags': ['pandas', 'crosstab', 'reindex', 'map', 'ısı haritası'],
},
{
'id': 'b-513', 'lv': 'ileri', 'diff': 3, 'kind': 'yaz', 'needs': ['pandas'], 'min': 18,
'title': 'Dedektif vakası: imkânsız siparişler',
'q': '''<p>İç denetim bir vaka dosyası açtı: <b>"Sistemde zaman çizelgesine göre olamayacak siparişler var mı?"</b> İki ipucu:</p>
<ol><li><b>Kayıt öncesi</b>: sipariş tarihi (<code>placed_at</code>'ın günü) müşterinin <code>signup_date</code>'inden önce.</li>
<li><b>Katılım öncesi</b>: sipariş tarihi restoranın <code>opened_date</code>'inden önce (boş katılım tarihi şüpheli değildir).</li></ol>
<p><code>supheli_siparisler(sip, mus, res)</code> fonksiyonunu yaz. Sonuç: <code>order_id</code> ve <code>neden</code> (<code>'kayıt öncesi'</code> ya da <code>'katılım öncesi'</code>) sütunlu bir DataFrame; bir sipariş iki kurala da uyuyorsa iki satır olur. <code>order_id</code>'ye, sonra <code>neden</code>'e göre sıralı ve indeksi 0'dan başlasın.</p>''',
'start': '''
import pandas as pd
import veri

sip = veri.oku('lezzet_kurye', 'lk_orders', parse_dates=['placed_at'])
mus = veri.oku('lezzet_kurye', 'lk_customers', parse_dates=['signup_date'])
res = veri.oku('lezzet_kurye', 'lk_restaurants', parse_dates=['opened_date'])


def supheli_siparisler(sip, mus, res):
    # buraya yaz
    pass


vaka = supheli_siparisler(sip, mus, res)
print(vaka['neden'].value_counts())
''',
'sol': '''
import pandas as pd
import veri

sip = veri.oku('lezzet_kurye', 'lk_orders', parse_dates=['placed_at'])
mus = veri.oku('lezzet_kurye', 'lk_customers', parse_dates=['signup_date'])
res = veri.oku('lezzet_kurye', 'lk_restaurants', parse_dates=['opened_date'])


def supheli_siparisler(sip, mus, res):
    df = (sip[['order_id', 'customer_id', 'restaurant_id', 'placed_at']]
          .merge(mus[['customer_id', 'signup_date']], on='customer_id', how='left')
          .merge(res[['restaurant_id', 'opened_date']], on='restaurant_id', how='left'))
    gun = df['placed_at'].dt.normalize()
    k1 = df.loc[gun < df['signup_date'], ['order_id']].assign(neden='kayıt öncesi')
    k2 = df.loc[gun < df['opened_date'], ['order_id']].assign(neden='katılım öncesi')
    return pd.concat([k1, k2]).sort_values(['order_id', 'neden']).reset_index(drop=True)


vaka = supheli_siparisler(sip, mus, res)
print(vaka['neden'].value_counts())
''',
'tests': '''
_v = supheli_siparisler(veri.oku('lezzet_kurye', 'lk_orders', parse_dates=['placed_at']), veri.oku('lezzet_kurye', 'lk_customers', parse_dates=['signup_date']), veri.oku('lezzet_kurye', 'lk_restaurants', parse_dates=['opened_date']))
assert isinstance(_v, pd.DataFrame) and list(_v.columns) == ['order_id', 'neden'], "Sütunlar ['order_id', 'neden'] olmalı"
assert int((_v['neden'] == 'kayıt öncesi').sum()) == ⟨int((_v['neden'] == 'kayıt öncesi').sum())⟩, "Kayıt öncesi verilmiş «int((_v['neden'] == 'kayıt öncesi').sum())» sipariş bekleniyor"
assert int((_v['neden'] == 'katılım öncesi').sum()) == ⟨int((_v['neden'] == 'katılım öncesi').sum())⟩, "Katılım öncesi «int((_v['neden'] == 'katılım öncesi').sum())» sipariş bekleniyor; boş opened_date karşılaştırmada False döner"
assert _v['order_id'].head(3).tolist() == ⟨_v['order_id'].head(3).tolist()⟩, "Sonuç order_id'ye göre sıralı olmalı"
assert list(_v.index[:3]) == [0, 1, 2], "İndeks 0'dan başlamalı (reset_index(drop=True))"
''',
'hints': ['Önce siparişe müşteri kayıt tarihini ve restoran katılım tarihini merge ile ekle.', 'Saat bilgisi karşılaştırmayı bozmasın: placed_at.dt.normalize() günün başlangıcını verir.', 'İki koşulu ayrı ayrı süz, assign(neden=...) ile etiketle, pd.concat ile alt alta koy.'],
'why': '''"İmkânsız olay" kontrolleri (impossible event checks) veri kalitesi denetiminin en güçlü aracıdır: zaman sırası bozuk kayıtlar ya veri girişi hatası ya da sahtekârlık sinyalidir. <code>normalize()</code> zamanı gece yarısına çeker; böylece kayıt günü verilen sipariş şüpheli sayılmaz. NaT (boş tarih) ile karşılaştırma False döner, yani katılım tarihi bilinmeyen restoran kendiliğinden elenir; bu davranışı bilerek kullanmak gerekir. Vaka yorumu: kayıt öncesi siparişler az ve dağınık (muhtemelen müşteri hesabı birleştirme sırasında kayıt tarihinin güncellenmesi); katılım öncesi siparişler ise iki restoranda yoğunlaşıyor, yani ana veri hatası. Farklı dağılım, farklı kök neden.''',
'tags': ['pandas', 'merge', 'veri kalitesi', 'dedektif', 'concat'],
},
{
'id': 'b-514', 'lv': 'ileri', 'diff': 3, 'kind': 'rehberli', 'needs': ['pandas'], 'min': 15,
'title': 'Aynı anda iki paket taşıyan kuryeler',
'q': '''<p>Lezzet Kurye resmi olarak "tek paket" politikası uyguluyor (yemek soğumasın diye). Operasyon şüpheleniyor: <b>"Bazı kuryeler önceki teslimatı bitmeden yeni paketi alıyor mu?"</b></p>
<p><code>cift_paket(sip)</code> fonksiyonunu yaz: <code>picked_at</code> ve <code>delivered_at</code> dolu olan siparişleri kurye ve <code>picked_at</code>'e göre sırala; bir siparişin <code>picked_at</code>'i aynı kuryenin <b>bir önceki</b> siparişinin <code>delivered_at</code>'inden önceyse "çift paket" say. Sonuç: kurye bazında çift paket sayısını gösteren, yalnız 0'dan büyükleri içeren, sayıya göre azalan (eşitlikte küçük courier_id önce) bir <code>Series</code>; indeks <code>courier_id</code> tam sayı olsun.</p>''',
'start': '''
import pandas as pd
import veri

sip = veri.oku('lezzet_kurye', 'lk_orders', parse_dates=['picked_at', 'delivered_at'])


def cift_paket(sip):
    d = sip.dropna(subset=['picked_at', 'delivered_at']).copy()
    d['courier_id'] = d['courier_id'].astype(int)
    # TODO: courier_id ve picked_at'e göre sırala
    # TODO: önceki teslim zamanı = groupby('courier_id')['delivered_at'].shift()
    # TODO: çift = picked_at < önceki teslim
    # TODO: kurye bazında topla, > 0 olanları al, sırala
    pass


s = cift_paket(sip)
print(s.head(), s.sum())
''',
'sol': '''
import pandas as pd
import veri

sip = veri.oku('lezzet_kurye', 'lk_orders', parse_dates=['picked_at', 'delivered_at'])


def cift_paket(sip):
    d = sip.dropna(subset=['picked_at', 'delivered_at']).copy()
    d['courier_id'] = d['courier_id'].astype(int)
    d = d.sort_values(['courier_id', 'picked_at'])
    onceki = d.groupby('courier_id')['delivered_at'].shift()
    d['cift'] = d['picked_at'] < onceki
    s = d.groupby('courier_id')['cift'].sum()
    s = s[s > 0].sort_index()
    return s.sort_values(ascending=False, kind='stable')


s = cift_paket(sip)
print(s.head(), s.sum())
''',
'tests': '''
_s = cift_paket(veri.oku('lezzet_kurye', 'lk_orders', parse_dates=['picked_at', 'delivered_at']))
assert isinstance(_s, pd.Series), "Sonuç Series olmalı"
assert int(_s.sum()) == ⟨int(_s.sum())⟩, "Toplam çift paket sayısı «int(_s.sum())» olmalı"
assert (_s > 0).all(), "Yalnız sıfırdan büyük değerler kalmalı"
assert [int(i) for i in _s.index[:3]] == ⟨[int(i) for i in _s.index[:3]]⟩, "İlk üç kurye beklenenden farklı (azalan, eşitlikte küçük id önce)"
assert int(_s.iloc[0]) == ⟨int(_s.iloc[0])⟩, "Lider kuryenin çift paket sayısı «int(_s.iloc[0])» olmalı"
_k = pd.DataFrame({'courier_id': [1.0, 1.0, 1.0], 'picked_at': pd.to_datetime(['2024-10-01 12:00', '2024-10-01 12:10', '2024-10-01 13:00']), 'delivered_at': pd.to_datetime(['2024-10-01 12:30', '2024-10-01 12:40', '2024-10-01 13:20'])})
assert int(cift_paket(_k).loc[1]) == 1, "12:10'da alınan paket, 12:30'da biten önceki teslimattan önce: 1 çift paket"
''',
'guide': ['Boş zamanlı satırları at, courier_id\'yi int yap (iskelette hazır).', 'sort_values([\'courier_id\', \'picked_at\']) ile her kuryenin siparişlerini zaman sırasına koy.', 'groupby(\'courier_id\')[\'delivered_at\'].shift() bir önceki siparişin teslim zamanını aynı satıra getirir.', 'Bool sütunu kurye bazında topla; > 0 süz; önce indekse sonra değere göre (kind=\'stable\') sırala.'],
'example': '''
import pandas as pd
# Benzer teknik: bir toplantı odasında çakışan rezervasyonlar
r = pd.DataFrame({'oda': ['A', 'A', 'B', 'A'],
                  'bas': pd.to_datetime(['2024-05-02 09:00', '2024-05-02 09:30', '2024-05-02 09:00', '2024-05-02 11:00']),
                  'bit': pd.to_datetime(['2024-05-02 10:00', '2024-05-02 10:30', '2024-05-02 09:45', '2024-05-02 12:00'])})
r = r.sort_values(['oda', 'bas'])
r['cakisma'] = r['bas'] < r.groupby('oda')['bit'].shift()
print(r)
''',
'hints': ['shift() grup içinde bir satır aşağı kaydırır; ilk satır NaT olur ve karşılaştırma False döner.', 'Bool sütunun toplamı True sayısıdır.', 'Eşitlikte sıra için: önce sort_index(), sonra sort_values(ascending=False, kind=\'stable\').'],
'why': '''<code>groupby().shift()</code> SQL'deki <code>LAG()</code> pencere fonksiyonunun pandas karşılığıdır ve "önceki olayla karşılaştır" sorularının standart çözümüdür (oturum analizi, çakışma tespiti). Sıralama şarttır: shift satır sırasına göre çalışır. Yalnız bir önceki siparişle karşılaştırmak, üç paketi üst üste taşıyan kuryede bazı çakışmaları kaçırabilir; tam çözüm "o ana kadarki en geç teslim" için <code>cummax()</code> kullanmaktır. <code>kind='stable'</code> eşit değerlerde önceki sırayı korur, böylece eşitlik kuralı garanti olur. İş yorumu: çift paket birkaç kuryede yoğunlaşıyorsa bu bireysel davranıştır; yaygınsa politika gerçekçi değildir.''',
'tags': ['pandas', 'groupby shift', 'LAG', 'çakışma', 'stable sort'],
},
{
'id': 'b-515', 'lv': 'ileri', 'diff': 3, 'kind': 'yaz', 'needs': ['pandas'], 'min': 15,
'title': 'Ekim kohortunun geri dönme oranı',
'q': '''<p>Büyüme ekibi soruyor: <b>"İlk siparişini Ekim 2024'te veren müşterilerin yüzde kaçı Kasım'da, yüzde kaçı Aralık'ta tekrar sipariş verdi?"</b></p>
<p><code>ekim_kohortu(sip)</code> fonksiyonunu yaz. İptal edilen siparişleri hesaba katma. Her müşterinin ilk sipariş ayı Ekim (10) olanlar kohorttur. Sonuç: <code>{'Kasım': %, 'Aralık': %}</code>, kohortta o ay en az bir siparişi olanların payı (1 ondalık).</p>''',
'start': '''
import pandas as pd
import veri

sip = veri.oku('lezzet_kurye', 'lk_orders', parse_dates=['placed_at'])


def ekim_kohortu(sip):
    # buraya yaz
    pass


print(ekim_kohortu(sip))
''',
'sol': '''
import pandas as pd
import veri

sip = veri.oku('lezzet_kurye', 'lk_orders', parse_dates=['placed_at'])


def ekim_kohortu(sip):
    d = sip[sip['status'] != 'iptal'].copy()
    d['ay'] = d['placed_at'].dt.month
    ilk = d.groupby('customer_id')['ay'].min()
    kohort = ilk[ilk == 10].index
    k = d[d['customer_id'].isin(kohort)]
    sonuc = {}
    for ad, ay in [('Kasım', 11), ('Aralık', 12)]:
        donen = k.loc[k['ay'] == ay, 'customer_id'].nunique()
        sonuc[ad] = round(100 * donen / len(kohort), 1)
    return sonuc


print(ekim_kohortu(sip))
''',
'tests': '''
_k = ekim_kohortu(veri.oku('lezzet_kurye', 'lk_orders', parse_dates=['placed_at']))
assert set(_k) == {'Kasım', 'Aralık'}, "Sözlükte Kasım ve Aralık anahtarları olmalı"
assert abs(_k['Kasım'] - ⟨_k['Kasım']⟩) < 0.05, "Kasım geri dönme oranı «_k['Kasım']» olmalı; aynı müşterinin birden çok siparişini tek say (nunique)"
assert abs(_k['Aralık'] - ⟨_k['Aralık']⟩) < 0.05, "Aralık geri dönme oranı «_k['Aralık']» olmalı"
_t = pd.DataFrame({'customer_id': [1, 1, 2, 3, 3], 'status': ['teslim', 'teslim', 'teslim', 'iptal', 'teslim'], 'placed_at': pd.to_datetime(['2024-10-02', '2024-11-05', '2024-10-09', '2024-10-01', '2024-11-03'])})
assert ekim_kohortu(_t) == {'Kasım': 50.0, 'Aralık': 0.0}, "Küçük örnek: 3 numaranın Ekim siparişi iptal, ilk ayı Kasım → kohort {1, 2}; Kasım'da 1 döndü → %50"
''',
'hints': ['Kohort = ilk sipariş ayı; groupby(\'customer_id\')[\'ay\'].min().', 'İptalleri kohortu belirlemeden önce çıkar.', 'Geri dönen müşteri sayısı nunique ile; payda kohort büyüklüğü.'],
'why': '''Kohort analizi müşterileri "başlangıç zamanına" göre gruplayıp aynı grubun zaman içindeki davranışını izler; tüm müşterilere bakan aylık aktif kullanıcı sayısı yeni gelenlerle eskilerin kaybını gizler. İptalleri kohort tanımından önce çıkarmak önemli: iptal edilmiş bir sipariş "müşteri kazanımı" değildir (testteki 3 numaralı müşteri). Payda her ay için aynı kohort büyüklüğüdür; döngü içinde değişmez. Genelleme: <code>pivot_table(index='kohort', columns='ay', values='customer_id', aggfunc='nunique')</code> tüm kohortların tutma matrisini (retention matrix) verir.''',
'tags': ['pandas', 'kohort', 'retention', 'nunique'],
},
{
'id': 'b-516', 'lv': 'ileri', 'diff': 3, 'kind': 'bug', 'needs': ['pandas'], 'min': 12,
'title': 'Gecikme yemek puanını düşürüyor mu? (hatayı bul)',
'q': '''<p>Bir analist "45 dakikayı aşan siparişlerde yemek puanı neredeyse aynı, demek ki gecikme sorun değil" diye rapor yazmış. Ama kodundaki "geç" grubu şüphe uyandıracak kadar küçük: 70 dakika süren siparişler bile "zamanında" görünüyor.</p>
<p><code>gecikme_puan(sip, puan)</code> teslim edilen ve puanlanan siparişlerde süre (<code>delivered_at - placed_at</code>, toplam dakika) 45'i aşanları <code>'geç'</code>, diğerlerini <code>'zamanında'</code> sayıp her grubun ortalama <code>food_score</code>'unu 2 ondalıkla döndürmeli (indeks: <code>['geç', 'zamanında']</code>). Hatayı bul ve düzelt.</p>''',
'start': '''
import pandas as pd
import veri

sip = veri.oku('lezzet_kurye', 'lk_orders', parse_dates=['placed_at', 'delivered_at'])
puan = veri.oku('lezzet_kurye', 'lk_ratings')


def gecikme_puan(sip, puan):
    d = sip[sip['status'] == 'teslim'].merge(puan, on='order_id')
    dakika = (d['delivered_at'] - d['placed_at']).dt.components.minutes
    d['grup'] = (dakika > 45).map({True: 'geç', False: 'zamanında'})
    return d.groupby('grup')['food_score'].mean().round(2).sort_index()


print(gecikme_puan(sip, puan))
''',
'sol': '''
import pandas as pd
import veri

sip = veri.oku('lezzet_kurye', 'lk_orders', parse_dates=['placed_at', 'delivered_at'])
puan = veri.oku('lezzet_kurye', 'lk_ratings')


def gecikme_puan(sip, puan):
    d = sip[sip['status'] == 'teslim'].merge(puan, on='order_id')
    dakika = (d['delivered_at'] - d['placed_at']).dt.total_seconds() / 60
    d['grup'] = (dakika > 45).map({True: 'geç', False: 'zamanında'})
    return d.groupby('grup')['food_score'].mean().round(2).sort_index()


print(gecikme_puan(sip, puan))
''',
'tests': '''
_g = gecikme_puan(veri.oku('lezzet_kurye', 'lk_orders', parse_dates=['placed_at', 'delivered_at']), veri.oku('lezzet_kurye', 'lk_ratings'))
assert list(_g.index) == ['geç', 'zamanında'], "İndeks ['geç', 'zamanında'] olmalı"
assert abs(float(_g['geç']) - ⟨float(_g['geç'])⟩) < 0.005, "Geç grubunun ortalama yemek puanı «float(_g['geç'])» olmalı"
assert abs(float(_g['zamanında']) - ⟨float(_g['zamanında'])⟩) < 0.005, "Zamanında grubunun ortalaması «float(_g['zamanında'])» olmalı"
_s = pd.DataFrame({'order_id': [1, 2], 'status': ['teslim', 'teslim'], 'placed_at': pd.to_datetime(['2024-10-01 12:00', '2024-10-01 12:00']), 'delivered_at': pd.to_datetime(['2024-10-01 13:10', '2024-10-01 12:20'])})
assert gecikme_puan(_s, pd.DataFrame({'order_id': [1, 2], 'food_score': [2, 5]})).to_dict() == {'geç': 2.0, 'zamanında': 5.0}, "70 dakikalık teslimat geç sayılmalı"
''',
'hints': ['Timedelta\'nın components tablosu gün, saat, dakika... alanlarını AYRI verir.', '1 saat 10 dakikanın components.minutes değeri 10\'dur, 70 değil.', '.dt.total_seconds() / 60 toplam dakikayı verir.'],
'why': '''<code>.dt.components.minutes</code> sürenin yalnız "dakika hanesini" verir (saat ayrı bir sütundadır), bu yüzden 60 dakikayı aşan her teslimat 0–25 arası bir değere düşüyor ve "geç" grubundan kaçıyordu. Sonuç olarak en kötü deneyimler "zamanında" grubuna karışıp farkı gizliyordu. Python'daki <code>timedelta.seconds</code> tuzağının pandas karşılığı budur: toplam süre için her zaman <code>total_seconds()</code>. Ders: şaşırtıcı bir "fark yok" sonucu da en az şaşırtıcı bir "fark var" kadar sınanmalı; grup büyüklüklerine (<code>value_counts</code>) bakmak bu hatayı hemen gösterirdi.''',
'tags': ['pandas', 'timedelta', 'total_seconds', 'hata avı'],
},
]
