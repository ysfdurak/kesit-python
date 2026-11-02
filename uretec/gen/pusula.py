DS = 'pusula_ik'
TOPIC = 'Veri seti: Pusula İK'
TITLE = 'Pusula İK (b-481 … b-498)'

TASKS = [
# ---------------------------------------------------------------- TEMEL
{
'id': 'b-481', 'lv': 'temel', 'diff': 1, 'kind': 'rehberli', 'min': 8,
'title': 'Şehirlere göre aktif çalışan sayısı',
'q': '''<p>Pusula A.Ş.'nin İK direktörü yeni ofis kiralama kararından önce soruyor: <b>"Hangi şehirde şu an kaç kişi çalışıyor?"</b></p>
<p><code>ik_employees</code> tablosunda <code>term_date</code> doluysa kişi ayrılmıştır; boşsa (<code>None</code>) hâlâ çalışıyordur.</p>
<p><code>aktif_sehir_sayilari(calisanlar)</code> fonksiyonunu yaz: çalışan kayıtları listesini (sözlükler) alsın, yalnız <b>aktif</b> çalışanları sayıp <code>{şehir: kişi_sayısı}</code> sözlüğü döndürsün.</p>''',
'start': '''
import veri

calisanlar = veri.kayitlar('pusula_ik', 'ik_employees')


def aktif_sehir_sayilari(calisanlar):
    sayilar = {}
    for c in calisanlar:
        # TODO: term_date doluysa (None değilse) bu kişiyi atla
        # TODO: c['city'] anahtarının sayacını 1 artır (get ile)
        pass
    return sayilar


print(aktif_sehir_sayilari(calisanlar))
''',
'sol': '''
import veri

calisanlar = veri.kayitlar('pusula_ik', 'ik_employees')


def aktif_sehir_sayilari(calisanlar):
    sayilar = {}
    for c in calisanlar:
        if c['term_date'] is not None:
            continue
        sayilar[c['city']] = sayilar.get(c['city'], 0) + 1
    return sayilar


print(aktif_sehir_sayilari(calisanlar))
''',
'tests': '''
_c = veri.kayitlar('pusula_ik', 'ik_employees')
_s = aktif_sehir_sayilari(_c)
assert isinstance(_s, dict), "Fonksiyon {şehir: sayı} biçiminde bir sözlük döndürmeli"
assert aktif_sehir_sayilari([{'city': 'Bursa', 'term_date': None}, {'city': 'Bursa', 'term_date': '2023-01-05'}]) == {'Bursa': 1}, "Ayrılmış çalışan (term_date dolu) sayılmamalı: iki kayıttan yalnız biri aktif"
assert aktif_sehir_sayilari([]) == {}, "Boş listede boş sözlük dönmeli"
assert sum(_s.values()) == ⟨sum(_s.values())⟩, "Toplam aktif çalışan «sum(_s.values())» olmalı (2199 kişiden ayrılanlar düşülünce)"
assert _s.get('İstanbul') == ⟨_s.get('İstanbul')⟩, "İstanbul'da «_s.get('İstanbul')» aktif çalışan olmalı"
assert _s == ⟨_s⟩, "Şehir sayıları beklenenle aynı değil"
''',
'guide': ['Boş bir sözlükle başla (iskelette hazır).', 'Döngüde her kaydın term_date alanına bak: None değilse continue ile atla.', 'Kalan kişinin şehrini anahtar yap; sayilar.get(sehir, 0) + 1 ile sayacı artır.', 'Döngü bitince sözlüğü döndür.'],
'example': '''
# Benzer teknik: yalnız açık siparişleri duruma göre say
siparisler = [
    {'kanal': 'web', 'iptal_tarihi': None},
    {'kanal': 'mobil', 'iptal_tarihi': '2024-05-02'},
    {'kanal': 'web', 'iptal_tarihi': None},
]
sayac = {}
for s in siparisler:
    if s['iptal_tarihi'] is not None:
        continue
    sayac[s['kanal']] = sayac.get(s['kanal'], 0) + 1
print(sayac)  # {'web': 2}
''',
'hints': ['Filtre + sayım: önce koşulla ele, sonra sözlükte say.', 'if c[\'term_date\'] is not None: continue', 'sayilar[c[\'city\']] = sayilar.get(c[\'city\'], 0) + 1'],
'why': '''Bu, İK raporlamasının en temel kalıbı: <b>filtrele, sonra grupla-say</b>. veri.kayitlar boş hücreleri None yaptığı için "aktif" koşulu <code>term_date is None</code> olur. <code>== None</code> yerine <code>is None</code> kullan; None tekil bir nesnedir. Tek geçiş olduğu için karmaşıklık O(n). Alternatif: <code>collections.Counter(c['city'] for c in calisanlar if c['term_date'] is None)</code> tek satırda aynı işi yapar. Sık hata: ayrılanları da sayıp "toplam personel" ile "aktif personel"i karıştırmak; kira kararı gibi işlerde bu fark büyük maliyet demektir.''',
'tags': ['dict', 'sayım', 'filtre', 'None'],
},
{
'id': 'b-482', 'lv': 'temel', 'diff': 1, 'kind': 'yaz', 'min': 8,
'title': 'Çalışma modu payları (ofis / hibrit / uzaktan)',
'q': '''<p>Yönetim kurulu sunumu için soru: <b>"Aktif çalışanların yüzde kaçı ofiste, hibritte, uzaktan?"</b></p>
<p><code>calisma_modu_payi(calisanlar)</code> fonksiyonunu yaz. Yalnız aktif çalışanları (<code>term_date</code> boş) dikkate al ve <code>{mod: yüzde}</code> sözlüğü döndür. Yüzdeleri <code>round(..., 1)</code> ile 1 ondalığa yuvarla. Aktif çalışan yoksa boş sözlük döndür.</p>''',
'start': '''
import veri

calisanlar = veri.kayitlar('pusula_ik', 'ik_employees')


def calisma_modu_payi(calisanlar):
    # buraya yaz
    pass


print(calisma_modu_payi(calisanlar))
''',
'sol': '''
import veri

calisanlar = veri.kayitlar('pusula_ik', 'ik_employees')


def calisma_modu_payi(calisanlar):
    sayac = {}
    toplam = 0
    for c in calisanlar:
        if c['term_date'] is None:
            sayac[c['work_mode']] = sayac.get(c['work_mode'], 0) + 1
            toplam += 1
    if toplam == 0:
        return {}
    return {mod: round(100 * n / toplam, 1) for mod, n in sayac.items()}


print(calisma_modu_payi(calisanlar))
''',
'tests': '''
_p = calisma_modu_payi(veri.kayitlar('pusula_ik', 'ik_employees'))
assert isinstance(_p, dict), "Sonuç {mod: yüzde} sözlüğü olmalı"
assert set(_p) == {'ofis', 'hibrit', 'uzaktan'}, "Üç çalışma modu da sözlükte olmalı"
assert abs(_p['ofis'] - ⟨_p['ofis']⟩) < 0.05, "Ofis payı yaklaşık «_p['ofis']» olmalı; yalnız aktif çalışanlara böldün mü?"
assert abs(_p['uzaktan'] - ⟨_p['uzaktan']⟩) < 0.05, "Uzaktan payı yaklaşık «_p['uzaktan']» olmalı"
assert abs(sum(_p.values()) - 100) < 0.2, "Yüzdelerin toplamı (yuvarlama payıyla) 100 olmalı"
assert calisma_modu_payi([{'work_mode': 'ofis', 'term_date': '2022-01-01'}]) == {}, "Aktif çalışan yoksa boş sözlük dönmeli (sıfıra bölme olmamalı)"
''',
'hints': ['Önce aktifleri modlarına göre say, aynı döngüde aktif toplamı da tut.', 'Payda 2199 değil, aktif çalışan sayısıdır.', 'Sözlük comprehension: {m: round(100 * n / toplam, 1) for m, n in sayac.items()}'],
'why': '''İki adımlı bir hesap: önce sayım, sonra oran. En sık hata paydayı yanlış seçmek: tüm kayıtlarla (ayrılanlar dahil) bölersen yüzdeler 100'e ulaşmaz. Yüzdeyi en sonda yuvarla; ara adımda yuvarlamak toplamı bozar. Boş girdi için sıfıra bölme kontrolü (<code>if toplam == 0</code>) savunmacı programlamanın (defensive programming) parçasıdır. pandas ile aynı iş: <code>df[df.term_date.isna()].work_mode.value_counts(normalize=True) * 100</code>.''',
'tags': ['dict comprehension', 'yüzde', 'round'],
},
{
'id': 'b-483', 'lv': 'temel', 'diff': 1, 'kind': 'bug', 'min': 7,
'title': 'Yıl içinde ayrılan kişi sayısı (hatayı bul)',
'q': '''<p>Bordro uzmanı yıllık ayrılan sayısını raporlayan bir fonksiyon yazmış ama kod <b>önce hata veriyor</b>, o düzelince de <b>her yıl için 0</b> döndürüyor. Hatayı bul ve düzelt.</p>
<p><code>ayrilan_sayisi(calisanlar, yil)</code>: <code>term_date</code> değeri verilen yılın içinde olan (ör. <code>yil=2023</code> → <code>'2023-…'</code>) çalışan sayısını döndürmeli. <code>yil</code> bir tam sayıdır.</p>''',
'start': '''
import veri

calisanlar = veri.kayitlar('pusula_ik', 'ik_employees')


def ayrilan_sayisi(calisanlar, yil):
    adet = 0
    for c in calisanlar:
        if c['term_date'][:4] == yil:
            adet += 1
    return adet


print(ayrilan_sayisi(calisanlar, 2023))
''',
'sol': '''
import veri

calisanlar = veri.kayitlar('pusula_ik', 'ik_employees')


def ayrilan_sayisi(calisanlar, yil):
    adet = 0
    for c in calisanlar:
        if c['term_date'] is not None and c['term_date'][:4] == str(yil):
            adet += 1
    return adet


print(ayrilan_sayisi(calisanlar, 2023))
''',
'tests': '''
_c = veri.kayitlar('pusula_ik', 'ik_employees')
assert ayrilan_sayisi(_c, 2023) == ⟨ayrilan_sayisi(_c, 2023)⟩, "2023'te «ayrilan_sayisi(_c, 2023)» kişi ayrılmış olmalı"
assert ayrilan_sayisi(_c, 2019) == ⟨ayrilan_sayisi(_c, 2019)⟩, "2019 için «ayrilan_sayisi(_c, 2019)» bekleniyor"
assert ayrilan_sayisi(_c, 2018) == 0, "2018'de ayrılış kaydı yok, 0 dönmeli"
assert ayrilan_sayisi([{'term_date': None}, {'term_date': '2024-03-01'}], 2024) == 1, "Çalışmaya devam eden (None) kişi hata vermeden atlanmalı"
''',
'hints': ['İki ayrı sorun var: biri TypeError, biri her zaman False olan karşılaştırma.', 'Aktif çalışanlarda term_date None; None[:4] çalışmaz. Önce None kontrolü yap.', '\'2023\' == 2023 her zaman False: metni metinle karşılaştır, str(yil).'],
'why': '''İki klasik hata bir arada: (1) <b>None üzerinde işlem</b>: boş tarih None olduğundan dilimleme TypeError verir; <code>is not None and ...</code> kısa devre (short-circuit) sayesinde ikinci koşul hiç çalışmaz. (2) <b>Tür uyuşmazlığı</b>: Python'da <code>'2023' == 2023</code> hata vermez, sessizce False döner; bu yüzden kod "çalışıyor ama 0 diyor". Sessiz hatalar en tehlikelisidir: rapor yanlış ama kimse fark etmez. Alternatif: <code>int(c['term_date'][:4]) == yil</code> ya da <code>date.fromisoformat(...).year</code>.''',
'tags': ['None', 'tür uyuşmazlığı', 'dilimleme', 'hata avı'],
},
{
'id': 'b-484', 'lv': 'temel', 'diff': 2, 'kind': 'rehberli', 'min': 10,
'title': 'Gönüllü ayrılmaların ilk 3 nedeni',
'q': '''<p>Bağlılık programı bütçesi için İK direktörü soruyor: <b>"İnsanlar kendi isteğiyle neden ayrılıyor? En sık 3 neden ne?"</b></p>
<p><code>gonullu_nedenler(calisanlar, n=3)</code> fonksiyonunu yaz. <code>term_type</code> değeri <code>'gönüllü'</code> olanların <code>term_reason</code> alanını say; en sık <code>n</code> nedeni <code>[(neden, sayı), ...]</code> listesi olarak <b>sayıya göre azalan</b> sırada döndür. Eşit sayılarda nedeni alfabetik sırala.</p>''',
'start': '''
import veri

calisanlar = veri.kayitlar('pusula_ik', 'ik_employees')


def gonullu_nedenler(calisanlar, n=3):
    sayac = {}
    # TODO: yalnız term_type == 'gönüllü' olanların nedenini say
    # TODO: sayac.items() listesini (-sayı, neden) anahtarıyla sırala
    # TODO: ilk n tanesini döndür
    return []


print(gonullu_nedenler(calisanlar))
''',
'sol': '''
import veri

calisanlar = veri.kayitlar('pusula_ik', 'ik_employees')


def gonullu_nedenler(calisanlar, n=3):
    sayac = {}
    for c in calisanlar:
        if c['term_type'] == 'gönüllü':
            sayac[c['term_reason']] = sayac.get(c['term_reason'], 0) + 1
    sirali = sorted(sayac.items(), key=lambda kv: (-kv[1], kv[0]))
    return sirali[:n]


print(gonullu_nedenler(calisanlar))
''',
'tests': '''
_c = veri.kayitlar('pusula_ik', 'ik_employees')
_r = gonullu_nedenler(_c)
assert isinstance(_r, list) and len(_r) == 3, "Varsayılan n=3: üç elemanlı liste dönmeli"
assert _r[0] == ⟨_r[0]⟩, "En sık gönüllü ayrılma nedeni «_r[0]» olmalı"
assert _r == ⟨_r⟩, "İlk 3 neden ve sayıları beklenenden farklı; gönülsüz ayrılmaları (performans, yeniden yapılanma) da saymış olabilir misin?"
assert gonullu_nedenler(_c, 1) == ⟨gonullu_nedenler(_c, 1)⟩, "n=1 verilince yalnız ilk neden dönmeli"
assert gonullu_nedenler([{'term_type': 'gönüllü', 'term_reason': 'b'}, {'term_type': 'gönüllü', 'term_reason': 'a'}], 2) == [('a', 1), ('b', 1)], "Eşit sayıda alfabetik sıra kullanılmalı"
''',
'guide': ['Döngüde yalnız term_type değeri \'gönüllü\' olan kayıtları ele.', 'Nedeni sözlükte say (get ile).', 'sorted(sayac.items(), key=lambda kv: (-kv[1], kv[0])) ile sırala: eksi işaret sayıyı azalan yapar.', 'Dilimleme ile ilk n elemanı döndür.'],
'example': '''
# Benzer teknik: en çok şikâyet alan 2 kategori (eşitlikte alfabetik)
sikayetler = ['kargo', 'iade', 'kargo', 'fiyat', 'iade', 'kargo']
sayac = {}
for s in sikayetler:
    sayac[s] = sayac.get(s, 0) + 1
print(sorted(sayac.items(), key=lambda kv: (-kv[1], kv[0]))[:2])
''',
'hints': ['Sayım sözlüğü + sıralama kalıbı.', 'key=lambda kv: (-kv[1], kv[0]) iki ölçütlü sıralama yapar.', 'return sorted(sayac.items(), key=lambda kv: (-kv[1], kv[0]))[:n]'],
'why': '''"En sık N" sorusu iş analizinde her gün çıkar. Demet (tuple) anahtarıyla sıralama iki ölçütü birden uygular: önce <code>-sayı</code> (azalan), eşitlikte <code>neden</code> (artan). Eşitlik kuralı koymazsan sonuç sırası girişe bağlı kalır ve rapor her çalıştırmada değişebilir. <code>collections.Counter(...).most_common(n)</code> daha kısadır ama eşitlikte alfabetik sıra garanti etmez. İş yorumu: gönüllü ayrılmanın başı ücret ve rakip firma; ikisi de piyasa ücret karşılaştırmasına (benchmark) işaret eder.''',
'tags': ['sorted', 'lambda', 'çok ölçütlü sıralama', 'sayım'],
},
{
'id': 'b-485', 'lv': 'temel', 'diff': 1, 'kind': 'tamamla', 'min': 6,
'title': 'Performans puanı dağılımı',
'q': '''<p>Kalibrasyon toplantısı öncesi soru: <b>"Bu yıl verilen 1–5 puanların yüzde kaçı hangi puan?"</b> (Çan eğrisine uyuyor mu?)</p>
<p><code>puan_dagilimi(degerlendirmeler, yil)</code> verilen yılın (<code>review_year</code>) puanlarını sayıp <code>{1: yüzde, 2: yüzde, ..., 5: yüzde}</code> döndürmeli; hiç verilmemiş puan 0.0 olsun, yüzdeler 1 ondalık. Boşlukları (<code>___</code>) doldur.</p>''',
'start': '''
import veri

degerlendirmeler = veri.kayitlar('pusula_ik', 'ik_reviews')


def puan_dagilimi(degerlendirmeler, yil):
    sayac = {p: 0 for p in range(1, ___)}
    toplam = 0
    for d in degerlendirmeler:
        if d['review_year'] == ___:
            sayac[d['rating']] += 1
            toplam += 1
    return {p: round(100 * n / ___, 1) for p, n in sayac.items()}


print(puan_dagilimi(degerlendirmeler, 2024))
''',
'sol': '''
import veri

degerlendirmeler = veri.kayitlar('pusula_ik', 'ik_reviews')


def puan_dagilimi(degerlendirmeler, yil):
    sayac = {p: 0 for p in range(1, 6)}
    toplam = 0
    for d in degerlendirmeler:
        if d['review_year'] == yil:
            sayac[d['rating']] += 1
            toplam += 1
    return {p: round(100 * n / toplam, 1) for p, n in sayac.items()}


print(puan_dagilimi(degerlendirmeler, 2024))
''',
'tests': '''
_d = veri.kayitlar('pusula_ik', 'ik_reviews')
_p = puan_dagilimi(_d, 2024)
assert list(_p) == [1, 2, 3, 4, 5], "Anahtarlar 1'den 5'e kadar olmalı: range(1, 6)"
assert _p == ⟨_p⟩, "2024 dağılımı beklenenden farklı"
assert puan_dagilimi(_d, 2019)[3] == ⟨puan_dagilimi(_d, 2019)[3]⟩, "2019'da 3 puanın payı «puan_dagilimi(_d, 2019)[3]» olmalı; yıl filtresi parametreyi kullanıyor mu?"
assert puan_dagilimi([{'review_year': 2020, 'rating': 5}], 2020) == {1: 0.0, 2: 0.0, 3: 0.0, 4: 0.0, 5: 100.0}, "Hiç verilmeyen puan 0.0 görünmeli"
''',
'hints': ['range(1, n) n\'yi dahil etmez.', 'Yıl filtresinde sabit sayı değil parametre kullan.', 'Payda o yılın toplam değerlendirme sayısı: toplam.'],
'why': '''Sözlüğü tüm puanlarla önceden doldurmak (<code>{p: 0 for p in range(1, 6)}</code>) iki işe yarar: hiç verilmeyen puan da raporda 0 olarak görünür ve beklenmedik bir puan (ör. 6) KeyError ile hemen yakalanır. Dağılım ortada (3–4) yığılıyor; 5 puan az. Kalibrasyonda "zorunlu dağılım" (forced distribution) tartışmasına bu tabloyla girilir. pandas karşılığı: <code>df[df.review_year == 2024].rating.value_counts(normalize=True).sort_index()</code>.''',
'tags': ['range', 'dict comprehension', 'dağılım'],
},
# ---------------------------------------------------------------- ORTA
{
'id': 'b-486', 'lv': 'orta', 'diff': 2, 'kind': 'rehberli', 'min': 14,
'title': 'Yıllık ayrılma oranı (turnover)',
'q': '''<p>CFO yıllık bütçe toplantısında soruyor: <b>"Personel devir hızımız (turnover) yıllara göre nasıl?"</b></p>
<p>İK'da standart formül: <code>ayrılma oranı = yıl içinde ayrılan / ortalama çalışan × 100</code>, ortalama çalışan = (yıl başı aktif + yıl sonu aktif) / 2.</p>
<ul><li>Yıl başı aktif: <code>hire_date &lt; 1 Ocak</code> ve (çalışıyor ya da <code>term_date ≥ 1 Ocak</code>)</li>
<li>Yıl sonu aktif: <code>hire_date ≤ 31 Aralık</code> ve (çalışıyor ya da <code>term_date &gt; 31 Aralık</code>)</li>
<li>Ayrılan: <code>term_date</code> o yıl içinde</li></ul>
<p><code>ayrilma_orani(calisanlar, yil)</code> fonksiyonunu <code>datetime.date</code> kullanarak yaz; sonucu 1 ondalığa yuvarla.</p>''',
'start': '''
from datetime import date
import veri

calisanlar = veri.kayitlar('pusula_ik', 'ik_employees')


def ayrilma_orani(calisanlar, yil):
    bas, son = date(yil, 1, 1), date(yil, 12, 31)
    bas_aktif = son_aktif = ayrilan = 0
    for c in calisanlar:
        giris = date.fromisoformat(c['hire_date'])
        cikis = date.fromisoformat(c['term_date']) if c['term_date'] else None
        # TODO: yıl başında aktif miydi? (giris < bas ve (cikis yok ya da cikis >= bas))
        # TODO: yıl sonunda aktif mi? (giris <= son ve (cikis yok ya da cikis > son))
        # TODO: yıl içinde mi ayrıldı?
    # TODO: ortalama çalışanı bul, oranı 1 ondalıkla döndür
    pass


for y in range(2019, 2025):
    print(y, ayrilma_orani(calisanlar, y))
''',
'sol': '''
from datetime import date
import veri

calisanlar = veri.kayitlar('pusula_ik', 'ik_employees')


def ayrilma_orani(calisanlar, yil):
    bas, son = date(yil, 1, 1), date(yil, 12, 31)
    bas_aktif = son_aktif = ayrilan = 0
    for c in calisanlar:
        giris = date.fromisoformat(c['hire_date'])
        cikis = date.fromisoformat(c['term_date']) if c['term_date'] else None
        if giris < bas and (cikis is None or cikis >= bas):
            bas_aktif += 1
        if giris <= son and (cikis is None or cikis > son):
            son_aktif += 1
        if cikis is not None and cikis.year == yil:
            ayrilan += 1
    ortalama = (bas_aktif + son_aktif) / 2
    return round(100 * ayrilan / ortalama, 1)


for y in range(2019, 2025):
    print(y, ayrilma_orani(calisanlar, y))
''',
'tests': '''
_c = veri.kayitlar('pusula_ik', 'ik_employees')
assert ayrilma_orani(_c, 2023) is not None, "Fonksiyon bir sayı döndürmeli"
assert abs(ayrilma_orani(_c, 2023) - ⟨ayrilma_orani(_c, 2023)⟩) < 0.05, "2023 ayrılma oranı «ayrilma_orani(_c, 2023)» olmalı"
assert abs(ayrilma_orani(_c, 2020) - ⟨ayrilma_orani(_c, 2020)⟩) < 0.05, "2020 için «ayrilma_orani(_c, 2020)» bekleniyor; yıl başı/yıl sonu koşullarını kontrol et"
assert abs(ayrilma_orani(_c, 2024) - ⟨ayrilma_orani(_c, 2024)⟩) < 0.05, "2024 için «ayrilma_orani(_c, 2024)» bekleniyor"
_k = [{'hire_date': '2020-05-01', 'term_date': None}, {'hire_date': '2021-03-01', 'term_date': '2022-06-30'}]
assert abs(ayrilma_orani(_k, 2022) - 66.7) < 0.05, "Küçük örnek: yıl başı 2, yıl sonu 1 aktif → ortalama 1.5; 1 ayrılan → %66.7"
''',
'guide': ['Metin tarihleri date.fromisoformat ile date nesnesine çevir (iskelette hazır).', 'Üç sayaç tut: yıl başı aktif, yıl sonu aktif, yıl içinde ayrılan.', 'Koşulları sınır günlerine dikkat ederek yaz: 1 Ocak\'ta ayrılan yıl başında aktif sayılır.', 'ortalama = (bas_aktif + son_aktif) / 2; oran = 100 * ayrilan / ortalama.', 'round(..., 1) ile döndür.'],
'example': '''
from datetime import date
# Benzer teknik: bir kiralık aracın belirli bir günde filoda olup olmadığı
araclar = [('34 AB 12', '2023-02-01', None), ('06 CD 34', '2022-07-10', '2024-01-15')]
gun = date(2024, 1, 1)
for plaka, giris, cikis in araclar:
    g = date.fromisoformat(giris)
    c = date.fromisoformat(cikis) if cikis else None
    print(plaka, g <= gun and (c is None or c > gun))
''',
'hints': ['Tarih karşılaştırması için date nesneleri kullan; metin karşılaştırması da ISO biçimde çalışır ama niyet belirsizleşir.', 'cikis None olabilir: (cikis is None or cikis >= bas) biçiminde yaz.', 'return round(100 * ayrilan / ((bas_aktif + son_aktif) / 2), 1)'],
'why': '''Ayrılma oranının paydası "şu anki çalışan sayısı" değil, <b>dönem ortalamasıdır</b>; büyüyen bir şirkette yıl sonu sayısıyla bölmek oranı olduğundan düşük gösterir. Sınır günleri (1 Ocak'ta ayrılan, 31 Aralık'ta giren) bu hesaplarda en sık hata kaynağıdır; koşulları kâğıda yazıp küçük örnekle (testteki iki kişilik liste gibi) denetle. Karmaşıklık O(n) ve her yıl için ayrı geçiş yapılır; çok yıl için tek geçişte sözlükle toplamak daha verimli olur. Not: aylık turnover için aynı fonksiyon ay başı/ay sonu ile genellenebilir.''',
'tags': ['datetime', 'date.fromisoformat', 'turnover', 'İK metriği'],
},
{
'id': 'b-487', 'lv': 'orta', 'diff': 2, 'kind': 'yaz', 'min': 12,
'title': 'İlk yıl ayrılma oranı (erken kayıp)',
'q': '''<p>İşe alım müdürü soruyor: <b>"Aldığımız insanların kaçı ilk yılını doldurmadan gidiyor?"</b> Bu metrik işe alım ve oryantasyon kalitesinin göstergesidir.</p>
<p><code>ilk_yil_ayrilma(calisanlar, yil)</code> fonksiyonunu yaz: <code>hire_date</code> değeri verilen yılda olan çalışanlar arasından, işe girişten sonraki <b>365 gün içinde</b> (<code>(term_date - hire_date).days &lt;= 365</code>) ayrılanların yüzdesini 1 ondalıkla döndür. O yıl kimse alınmadıysa <code>0.0</code> döndür.</p>''',
'start': '''
from datetime import date
import veri

calisanlar = veri.kayitlar('pusula_ik', 'ik_employees')


def ilk_yil_ayrilma(calisanlar, yil):
    # buraya yaz
    pass


for y in range(2019, 2024):
    print(y, ilk_yil_ayrilma(calisanlar, y))
''',
'sol': '''
from datetime import date
import veri

calisanlar = veri.kayitlar('pusula_ik', 'ik_employees')


def ilk_yil_ayrilma(calisanlar, yil):
    alinan = erken = 0
    for c in calisanlar:
        giris = date.fromisoformat(c['hire_date'])
        if giris.year != yil:
            continue
        alinan += 1
        if c['term_date']:
            cikis = date.fromisoformat(c['term_date'])
            if (cikis - giris).days <= 365:
                erken += 1
    if alinan == 0:
        return 0.0
    return round(100 * erken / alinan, 1)


for y in range(2019, 2024):
    print(y, ilk_yil_ayrilma(calisanlar, y))
''',
'tests': '''
_c = veri.kayitlar('pusula_ik', 'ik_employees')
assert abs(ilk_yil_ayrilma(_c, 2022) - ⟨ilk_yil_ayrilma(_c, 2022)⟩) < 0.05, "2022 işe alımlarında ilk yıl ayrılma «ilk_yil_ayrilma(_c, 2022)» olmalı"
assert abs(ilk_yil_ayrilma(_c, 2019) - ⟨ilk_yil_ayrilma(_c, 2019)⟩) < 0.05, "2019 için «ilk_yil_ayrilma(_c, 2019)» bekleniyor"
assert ilk_yil_ayrilma(_c, 2005) == 0.0, "O yıl işe alım yoksa 0.0 dönmeli (sıfıra bölme olmamalı)"
_k = [{'hire_date': '2021-01-10', 'term_date': '2022-01-10'}, {'hire_date': '2021-03-01', 'term_date': '2022-03-02'}, {'hire_date': '2021-06-01', 'term_date': None}]
assert abs(ilk_yil_ayrilma(_k, 2021) - 33.3) < 0.05, "365. gün dahil (ilk kişi), 366. gün hariç (ikinci kişi): 3 kişiden 1'i → %33.3"
''',
'hints': ['Payda: o yıl işe girenlerin hepsi; pay: 365 gün içinde ayrılanlar.', 'İki date nesnesinin farkı timedelta verir; .days ile gün sayısını al.', 'term_date None ise kişi hâlâ çalışıyor, erken ayrılan değildir.'],
'why': '''İlk yıl ayrılması (first-year attrition) genel turnover'dan farklı bir soruya cevap verir: işe alım doğru kişiyi mi seçiyor? Kohort mantığı kullanılır: payda "o yıl girenler"dir, takvim yılı değil. 2024 girişleri için bir yıllık pencere henüz kapanmadığından oran yapay olarak düşük çıkar (sansürlü veri, right-censoring); bu yüzden döngü 2023'te bitiyor. <code>(cikis - giris).days</code> timedelta'nın gün sayısıdır; ay ya da yıl için doğrudan özellik yoktur. Sınır (365 dahil mi?) iş tanımıdır; raporun altına yaz.''',
'tags': ['datetime', 'timedelta', 'kohort', 'İK metriği'],
},
{
'id': 'b-488', 'lv': 'orta', 'diff': 2, 'kind': 'rehberli', 'min': 15,
'title': 'Maaş bandının altında kalan çalışanlar',
'q': '''<p>Ücret yöneticisi 2025 bütçesini hazırlıyor: <b>"Güncel maaşı pozisyonunun bant alt sınırının altında kalan aktif çalışanlar kimler?"</b></p>
<p>Tablolar: <code>ik_salaries</code> (her maaş değişikliği bir satır; <b>güncel maaş = en son effective_date'li kayıt</b>), <code>ik_positions</code> (<code>band_min</code>), <code>ik_employees</code> (<code>position_id</code>, <code>term_date</code>).</p>
<p><code>bant_alti(calisanlar, maaslar, pozisyonlar)</code> fonksiyonunu yaz; band_min'in altında maaş alan <b>aktif</b> çalışanların <code>emp_id</code> listesini küçükten büyüğe döndür.</p>''',
'start': '''
import veri

calisanlar = veri.kayitlar('pusula_ik', 'ik_employees')
maaslar = veri.kayitlar('pusula_ik', 'ik_salaries')
pozisyonlar = veri.kayitlar('pusula_ik', 'ik_positions')


def bant_alti(calisanlar, maaslar, pozisyonlar):
    # 1) Her çalışanın güncel maaşı: {emp_id: (tarih, maaş)}
    guncel = {}
    for m in maaslar:
        # TODO: bu kayıt, sözlükteki kayıttan daha yeniyse güncelle
        pass
    # 2) Pozisyon → bant alt sınırı sözlüğü
    alt = {p['position_id']: p['band_min'] for p in pozisyonlar}
    # 3) TODO: aktif çalışanlarda maaş < alt sınır olanların emp_id'lerini topla
    sonuc = []
    return sorted(sonuc)


liste = bant_alti(calisanlar, maaslar, pozisyonlar)
print(len(liste), liste[:10])
''',
'sol': '''
import veri

calisanlar = veri.kayitlar('pusula_ik', 'ik_employees')
maaslar = veri.kayitlar('pusula_ik', 'ik_salaries')
pozisyonlar = veri.kayitlar('pusula_ik', 'ik_positions')


def bant_alti(calisanlar, maaslar, pozisyonlar):
    guncel = {}
    for m in maaslar:
        e = m['emp_id']
        if e not in guncel or m['effective_date'] > guncel[e][0]:
            guncel[e] = (m['effective_date'], m['monthly_gross'])
    alt = {p['position_id']: p['band_min'] for p in pozisyonlar}
    sonuc = []
    for c in calisanlar:
        if c['term_date'] is None and c['emp_id'] in guncel:
            if guncel[c['emp_id']][1] < alt[c['position_id']]:
                sonuc.append(c['emp_id'])
    return sorted(sonuc)


liste = bant_alti(calisanlar, maaslar, pozisyonlar)
print(len(liste), liste[:10])
''',
'tests': '''
_c = veri.kayitlar('pusula_ik', 'ik_employees')
_m = veri.kayitlar('pusula_ik', 'ik_salaries')
_p = veri.kayitlar('pusula_ik', 'ik_positions')
_r = bant_alti(_c, _m, _p)
assert isinstance(_r, list), "Sonuç emp_id listesi olmalı"
assert len(_r) == ⟨len(_r)⟩, "Bant altında «len(_r)» aktif çalışan bekleniyor; güncel maaşı en son tarihli kayıttan aldın mı?"
assert _r[:5] == ⟨_r[:5]⟩, "İlk beş emp_id beklenenden farklı (sıralı olmalı)"
_km = [{'emp_id': 1, 'effective_date': '2024-01-01', 'monthly_gross': 90.0}, {'emp_id': 1, 'effective_date': '2022-01-01', 'monthly_gross': 50.0}]
assert bant_alti([{'emp_id': 1, 'term_date': None, 'position_id': 7}], _km, [{'position_id': 7, 'band_min': 80.0}]) == [], "Kayıtlar tarih sırasında gelmeyebilir: güncel maaş 90 (2024), eski 50 değil"
assert bant_alti([{'emp_id': 1, 'term_date': '2024-05-01', 'position_id': 7}], _km, [{'position_id': 7, 'band_min': 100.0}]) == [], "Ayrılmış çalışan listede olmamalı"
''',
'guide': ['Maaş kayıtlarını gez; her emp_id için en büyük effective_date\'li kaydı (tarih, maaş) olarak sakla.', 'ISO tarih metinleri (YYYY-MM-DD) doğrudan > ile karşılaştırılabilir.', 'Pozisyon → band_min sözlüğü kur (iskelette hazır).', 'Aktif çalışanları gez; maaşları alt sınırdan küçükse emp_id\'yi listeye ekle.', 'Listeyi sıralı döndür.'],
'example': '''
# Benzer teknik: her ürünün en son fiyatını bul (kayıtlar karışık sırada)
fiyatlar = [('kalem', '2024-03-01', 12), ('kalem', '2023-01-01', 9), ('defter', '2024-02-10', 40)]
son = {}
for urun, tarih, fiyat in fiyatlar:
    if urun not in son or tarih > son[urun][0]:
        son[urun] = (tarih, fiyat)
print({u: f for u, (t, f) in son.items()})
''',
'hints': ['"En son kayıt" = grup başına maksimum tarih. Sözlükte (tarih, değer) tut.', 'if e not in guncel or m[\'effective_date\'] > guncel[e][0]: guncel[e] = (...)', 'Karşılaştırma: guncel[c[\'emp_id\']][1] < alt[c[\'position_id\']]'],
'why': '''Bu görev "yavaş değişen boyut" (slowly changing dimension) verisinin klasik sorusu: geçmişli bir tablodan <b>bugünkü durumu</b> çıkarmak. Kayıtların sıralı geldiğine güvenme; açıkça maksimum tarihi seç. ISO 8601 metinleri sözlük sırasıyla da doğru karşılaştırılır, ama başka biçimde (GG.AA.YYYY) bu çalışmaz. Karmaşıklık O(maaş + çalışan) ve sözlükler sayesinde iç içe döngü yok; iç içe döngüyle her çalışan için maaşları taramak O(n·m) olurdu. İş yorumu: bant altı kişiler hem adalet hem elde tutma (retention) riski taşır; "ücret" neden gönüllü ayrılmanın başında geliyordu.''',
'tags': ['sözlükle join', 'en son kayıt', 'maaş bandı'],
},
{
'id': 'b-489', 'lv': 'orta', 'diff': 2, 'kind': 'yaz', 'min': 12,
'title': 'Pazartesi hastalık izni örüntüsü',
'q': '''<p>İK analisti bir söylentiyi veriyle sınamak istiyor: <b>"Hastalık izinleri gerçekten Pazartesi'ye mi yığılıyor?"</b> İzinler yalnız iş günlerinde başlar; rastgele olsaydı her gün ≈ %20 olurdu.</p>
<p><code>hastalik_gun_dagilimi(izinler)</code> fonksiyonunu yaz: <code>leave_type == 'hastalık'</code> olan kayıtları <code>start_date</code>'in haftanın gününe göre say ve <code>{'Pazartesi': n, 'Salı': n, 'Çarşamba': n, 'Perşembe': n, 'Cuma': n}</code> sözlüğünü bu sırayla döndür.</p>''',
'start': '''
from datetime import date
import veri

izinler = veri.kayitlar('pusula_ik', 'ik_leaves')
GUNLER = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar']


def hastalik_gun_dagilimi(izinler):
    # buraya yaz
    pass


d = hastalik_gun_dagilimi(izinler)
print(d)
''',
'sol': '''
from datetime import date
import veri

izinler = veri.kayitlar('pusula_ik', 'ik_leaves')
GUNLER = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar']


def hastalik_gun_dagilimi(izinler):
    sayac = {g: 0 for g in GUNLER[:5]}
    for i in izinler:
        if i['leave_type'] == 'hastalık':
            gun = GUNLER[date.fromisoformat(i['start_date']).weekday()]
            sayac[gun] += 1
    return sayac


d = hastalik_gun_dagilimi(izinler)
print(d)
toplam = sum(d.values())
for g, n in d.items():
    print(f'{g:<10} {n:>5}  %{100 * n / toplam:.1f}')
''',
'tests': '''
_d = hastalik_gun_dagilimi(veri.kayitlar('pusula_ik', 'ik_leaves'))
assert list(_d) == ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma'], "Anahtarlar Pazartesi'den Cuma'ya sırayla olmalı"
assert _d['Pazartesi'] == ⟨_d['Pazartesi']⟩, "Pazartesi başlayan hastalık izni «_d['Pazartesi']» olmalı; weekday() Pazartesi için 0 döndürür"
assert _d == ⟨_d⟩, "Gün dağılımı beklenenden farklı; yalnız hastalık iznini mi saydın?"
assert hastalik_gun_dagilimi([{'leave_type': 'hastalık', 'start_date': '2024-11-04'}, {'leave_type': 'yıllık', 'start_date': '2024-11-05'}])['Pazartesi'] == 1, "4 Kasım 2024 Pazartesi; yıllık izin sayılmamalı"
''',
'hints': ['date.fromisoformat(...).weekday(): Pazartesi=0 … Pazar=6.', 'Sözlüğü beş iş günüyle önceden kur: {g: 0 for g in GUNLER[:5]} sırayı da korur.', 'Sonuçta Pazartesi payını hesapla: %20 beklentisinin ne kadar üstünde?'],
'why': '''Pazartesi hastalık izinleri ≈ %32 ile beklenen %20'nin belirgin üstünde; aynı veride yıllık izin günlere neredeyse eşit dağılıyor. Bu karşılaştırma (kontrol grubu) önemli: yalnız hastalık verisine bakıp "Pazartesi yüksek" demek yetmez, başka izin türünde aynı yığılma yoksa örüntü anlamlıdır. <code>weekday()</code> 0 tabanlıdır (<code>isoweekday()</code> 1 tabanlı); en sık hata buradaki kaymadır. İş yorumu: bu bir suçlama değil, sinyaldir; ekip bazında kırılım ve yönetici puanıyla birlikte değerlendirilir. İleride ki-kare testi (scipy.stats.chisquare) ile istatistiksel anlamlılık sınanabilir.''',
'tags': ['weekday', 'datetime', 'örüntü', 'İK analitiği'],
},
{
'id': 'b-490', 'lv': 'orta', 'diff': 2, 'kind': 'bug', 'min': 12,
'title': 'İşe alım hunisi yanlış sayıyor (hatayı bul)',
'q': '''<p>İşe alım ekibinin huni (funnel) raporu tuhaf: <b>"mülakat"</b> sayısı <b>"teklif"</b>ten küçük çıkabiliyor, toplam başvuru da eksik. Oysa huni her adımda daralmalı.</p>
<p><code>ik_candidates.stage</code> adayın <b>ulaştığı son aşamadır</b>. Sıra: başvuru → ön eleme → mülakat → teklif → işe alındı. <code>'teklif reddedildi'</code> olan aday teklif aşamasına ulaşmıştır (ama işe alınmamıştır).</p>
<p><code>huni(adaylar)</code> her aşamaya <b>ulaşan</b> (o aşamada ya da daha ileride biten) aday sayısını döndürmeli. Kodu düzelt.</p>''',
'start': '''
import veri

adaylar = veri.kayitlar('pusula_ik', 'ik_candidates')
ASAMALAR = ['başvuru', 'ön eleme', 'mülakat', 'teklif', 'işe alındı']


def huni(adaylar):
    sayac = {a: 0 for a in ASAMALAR}
    for a in adaylar:
        if a['stage'] in sayac:
            sayac[a['stage']] += 1
    return sayac


print(huni(adaylar))
''',
'sol': '''
import veri

adaylar = veri.kayitlar('pusula_ik', 'ik_candidates')
ASAMALAR = ['başvuru', 'ön eleme', 'mülakat', 'teklif', 'işe alındı']


def huni(adaylar):
    sira = {a: i for i, a in enumerate(ASAMALAR)}
    sira['teklif reddedildi'] = sira['teklif']
    sayac = {a: 0 for a in ASAMALAR}
    for a in adaylar:
        for asama in ASAMALAR[:sira[a['stage']] + 1]:
            sayac[asama] += 1
    return sayac


h = huni(adaylar)
for asama, n in h.items():
    print(f'{asama:<12} {n:>6}  %{100 * n / h["başvuru"]:.1f}')
''',
'tests': '''
_a = veri.kayitlar('pusula_ik', 'ik_candidates')
_h = huni(_a)
assert _h['başvuru'] == len(_a), "Her aday en azından başvuru aşamasına ulaşmıştır: başvuru = toplam aday sayısı"
assert _h['teklif'] == ⟨_h['teklif']⟩, "Teklif aşamasına «_h['teklif']» aday ulaşmalı ('teklif reddedildi' dahil)"
assert _h == ⟨_h⟩, "Huni sayıları beklenenden farklı"
assert all(x >= y for x, y in zip(list(_h.values()), list(_h.values())[1:])), "Huni her adımda daralmalı (ya da eşit kalmalı)"
assert huni([{'stage': 'teklif reddedildi'}]) == {'başvuru': 1, 'ön eleme': 1, 'mülakat': 1, 'teklif': 1, 'işe alındı': 0}, "Teklifi reddeden aday teklif dahil önceki tüm aşamalarda sayılmalı"
''',
'hints': ['Kod "son aşamada kaç kişi bitti" sayıyor; soru "bu aşamaya kaç kişi ulaştı".', 'Her aşamaya bir sıra numarası ver; aday, kendi sıra numarasına kadar olan tüm aşamalarda sayılmalı.', '\'teklif reddedildi\' ASAMALAR listesinde yok: onu teklifin sıra numarasına eşle.'],
'why': '''Hatalı kod <b>son durum dağılımını</b> veriyordu; huni ise <b>kümülatif</b> bir sayımdır. Sonuçta adayların çoğu başvuru aşamasında elendiği için "başvuru" sayısı tüm adaylar yerine yalnız orada kalanları gösteriyor, 'teklif reddedildi' ise hiç sayılmıyordu. Düzeltme: aşamalara sıra numarası verip her adayı kendi aşamasına kadar her basamakta saymak. Alternatif: son durum sayımını yapıp sondan başa kümülatif toplam almak (O(aşama) ek iş). Kontrol testi: huni her adımda daralmalı; bu tür değişmez (invariant) kontrolleri raporlarına ekle.''',
'tags': ['huni', 'kümülatif sayım', 'enumerate', 'hata avı'],
},
{
'id': 'b-491', 'lv': 'orta', 'diff': 2, 'kind': 'yaz', 'needs': ['sqlite3'], 'min': 12,
'title': 'İşe alım kaynağına göre başarı oranı (SQL)',
'q': '''<p>Pazarlama bütçesi dağıtılacak: <b>"Hangi aday kaynağı (kariyer sitesi, LinkedIn, referans...) gerçekten işe alımla sonuçlanıyor?"</b></p>
<p><code>kaynak_kalitesi(con)</code> fonksiyonunu yaz. <code>con</code>, <code>veri.baglan('pusula_ik')</code> bağlantısıdır. <code>ik_candidates</code> tablosundan her <code>source</code> için <code>(kaynak, başvuru_sayısı, işe_alınan, oran)</code> demetleri döndür; oran = işe alınan / başvuru × 100, 1 ondalık. Oran büyükten küçüğe sırala.</p>''',
'start': '''
import veri

con = veri.baglan('pusula_ik')


def kaynak_kalitesi(con):
    sorgu = """
    -- buraya SQL yaz
    """
    pass


for satir in kaynak_kalitesi(con):
    print(satir)
''',
'sol': '''
import veri

con = veri.baglan('pusula_ik')


def kaynak_kalitesi(con):
    sorgu = """
    SELECT source,
           COUNT(*) AS basvuru,
           SUM(stage = 'işe alındı') AS alinan,
           ROUND(100.0 * SUM(stage = 'işe alındı') / COUNT(*), 1) AS oran
    FROM ik_candidates
    GROUP BY source
    ORDER BY oran DESC
    """
    return con.execute(sorgu).fetchall()


for satir in kaynak_kalitesi(con):
    print(satir)
''',
'tests': '''
_r = kaynak_kalitesi(veri.baglan('pusula_ik'))
assert _r is not None and len(_r) == 6, "Altı kaynak için altı satır dönmeli"
assert _r[0][0] == ⟨_r[0][0]⟩, "En yüksek işe alım oranı «_r[0][0]» kaynağında olmalı"
assert [s[0] for s in _r] == ⟨[s[0] for s in _r]⟩, "Kaynak sırası (orana göre azalan) beklenenden farklı"
assert _r[0][1:3] == ⟨tuple(_r[0][1:3])⟩, "İlk satırın başvuru ve işe alınan sayıları beklenenden farklı"
assert abs(_r[-1][3] - ⟨_r[-1][3]⟩) < 0.05, "En düşük oran «_r[-1][3]» olmalı; 100.0 ile çarpıp tam sayı bölmesinden kaçındın mı?"
''',
'hints': ['GROUP BY source ile her kaynağı bir satıra indir.', 'SQLite\'ta koşul 1/0 döner: SUM(stage = \'işe alındı\') işe alınanları sayar.', '100 yerine 100.0 yaz; yoksa tam sayı bölmesi 0 verebilir.'],
'why': '''SQL'de koşullu sayım iki yoldan yapılır: <code>SUM(CASE WHEN stage = 'işe alındı' THEN 1 ELSE 0 END)</code> (her veritabanında çalışır) ya da SQLite/PostgreSQL'de doğrudan <code>SUM(stage = '...')</code>. SQLite'ta tam sayı / tam sayı tam sayı bölmesidir; <code>100.0 *</code> bunu önler. İş yorumu: referans kaynağı en az başvuruyu getirip en yüksek dönüşümü sağlıyor; kariyer sitesi ise çok başvuru, düşük oran demek. Ama "kalite" yalnız dönüşüm değildir: işe alınanların ilk yıl kalma oranı ve performansı da bakılmalı (bkz. ileri seviye huni görevi).''',
'tags': ['sqlite3', 'GROUP BY', 'koşullu sayım', 'işe alım'],
},
{
'id': 'b-492', 'lv': 'orta', 'diff': 2, 'kind': 'tamamla', 'needs': ['sqlite3'], 'min': 8,
'title': 'Bölümlere göre aktif kadro (SQL JOIN)',
'q': '''<p>Organizasyon şeması güncellenecek: <b>"Her bölümde şu an kaç kişi var?"</b> Çalışan → pozisyon → bölüm zincirini birleştirmen gerek.</p>
<p><code>bolum_kadrosu(con)</code> fonksiyonundaki SQL'de boşlukları (<code>___</code>) doldur: <code>ik_employees.position_id = ik_positions.position_id</code>, <code>ik_positions.dept_id = ik_departments.dept_id</code>, yalnız aktif çalışanlar. Sonuç <code>(bölüm_adı, kişi)</code> demetleri, kişi sayısına göre azalan.</p>''',
'start': '''
import veri

con = veri.baglan('pusula_ik')


def bolum_kadrosu(con):
    sorgu = """
    SELECT d.name, COUNT(*) AS kisi
    FROM ik_employees e
    JOIN ik_positions p ON ___
    JOIN ik_departments d ON ___
    WHERE ___
    GROUP BY d.name
    ORDER BY kisi DESC
    """
    return con.execute(sorgu).fetchall()


for satir in bolum_kadrosu(con):
    print(satir)
''',
'sol': '''
import veri

con = veri.baglan('pusula_ik')


def bolum_kadrosu(con):
    sorgu = """
    SELECT d.name, COUNT(*) AS kisi
    FROM ik_employees e
    JOIN ik_positions p ON e.position_id = p.position_id
    JOIN ik_departments d ON p.dept_id = d.dept_id
    WHERE e.term_date IS NULL
    GROUP BY d.name
    ORDER BY kisi DESC
    """
    return con.execute(sorgu).fetchall()


for satir in bolum_kadrosu(con):
    print(satir)
''',
'tests': '''
_r = bolum_kadrosu(veri.baglan('pusula_ik'))
assert sum(n for _, n in _r) == ⟨sum(n for _, n in _r)⟩, "Toplam aktif kişi «sum(n for _, n in _r)» olmalı; WHERE e.term_date IS NULL koşulunu yazdın mı?"
assert _r[0] == ⟨tuple(_r[0])⟩, "En kalabalık bölüm «_r[0][0]» olmalı"
assert _r == ⟨[tuple(x) for x in _r]⟩, "Bölüm kadroları beklenenden farklı"
''',
'hints': ['JOIN koşulu iki tablodaki ortak anahtarı eşitler: e.position_id = p.position_id', 'SQL\'de boş değer = NULL ile değil, IS NULL ile sınanır.', 'WHERE e.term_date IS NULL'],
'why': '''<code>term_date = NULL</code> SQL'de hiçbir zaman doğru olmaz (NULL ile karşılaştırma bilinmeyen döner); bu yüzden <code>IS NULL</code> şarttır. Python'daki <code>is None</code> ile birebir aynı fikir. veri.baglan boş CSV hücrelerini NULL olarak yükler. İki JOIN zinciri yıldız şemadaki "boyut üzerinden boyuta" geçişin örneğidir. INNER JOIN eşleşmeyen satırı düşürür: pozisyonu tabloda olmayan çalışan olsaydı sayımdan sessizce çıkardı; bunu LEFT JOIN ile sınamak iyi bir alışkanlıktır.''',
'tags': ['sqlite3', 'JOIN', 'IS NULL', 'tamamla'],
},
{
'id': 'b-493', 'lv': 'orta', 'diff': 2, 'kind': 'rehberli', 'min': 12,
'title': 'Kadro doldurma süresi (time-to-fill) medyanı',
'q': '''<p>Yöneticiler "açtığımız kadro çok geç doluyor" diyor. İK sorusu: <b>"Doldurulan kadro taleplerinde açılıştan kapanışa kaç gün geçiyor, yıllara göre medyan nedir?"</b></p>
<p><code>doldurma_suresi(talepler)</code> fonksiyonunu yaz: <code>ik_requisitions</code> tablosunda <code>status == 'dolduruldu'</code> olan talepler için <code>closed_date - opened_date</code> gün farkını hesapla, açılış yılına göre grupla ve <code>{yıl: medyan_gün}</code> döndür (<code>statistics.median</code>).</p>''',
'start': '''
from datetime import date
from statistics import median
import veri

talepler = veri.kayitlar('pusula_ik', 'ik_requisitions')


def doldurma_suresi(talepler):
    gunler = {}  # {yıl: [gün, gün, ...]}
    for t in talepler:
        # TODO: yalnız doldurulan talepler
        # TODO: açılış ve kapanışı date'e çevir, farkın gününü al
        # TODO: açılış yılının listesine ekle (setdefault)
        pass
    # TODO: her yıl için medyanı hesapla
    return {}


print(doldurma_suresi(talepler))
''',
'sol': '''
from datetime import date
from statistics import median
import veri

talepler = veri.kayitlar('pusula_ik', 'ik_requisitions')


def doldurma_suresi(talepler):
    gunler = {}
    for t in talepler:
        if t['status'] != 'dolduruldu':
            continue
        acilis = date.fromisoformat(t['opened_date'])
        kapanis = date.fromisoformat(t['closed_date'])
        gunler.setdefault(acilis.year, []).append((kapanis - acilis).days)
    return {yil: median(liste) for yil, liste in sorted(gunler.items())}


print(doldurma_suresi(talepler))
''',
'tests': '''
_d = doldurma_suresi(veri.kayitlar('pusula_ik', 'ik_requisitions'))
assert set(_d) == ⟨set(_d)⟩, "Yıllar beklenenden farklı"
assert _d == ⟨_d⟩, "Yıllık medyan doldurma süreleri beklenenden farklı; yalnız 'dolduruldu' durumundakileri aldın mı?"
assert doldurma_suresi([{'status': 'iptal', 'opened_date': '2023-01-01', 'closed_date': '2023-02-01'}]) == {}, "İptal edilen talep hesaba katılmamalı"
assert doldurma_suresi([{'status': 'dolduruldu', 'opened_date': '2023-12-20', 'closed_date': '2024-01-09'}]) == {2023: 20}, "Yıl, açılış tarihinden alınır; 20 Aralık → 9 Ocak = 20 gün"
''',
'guide': ['Durumu \'dolduruldu\' olmayanı continue ile atla (açık talebin kapanış tarihi zaten boş).', 'İki tarihi date.fromisoformat ile çevir; (kapanis - acilis).days gün farkıdır.', 'gunler.setdefault(yil, []).append(gun) ile yıla göre listele.', '{yil: median(liste) for ...} ile medyanları hesapla.'],
'example': '''
from statistics import median
# Benzer teknik: kategoriye göre teslim sürelerinin medyanı
kayitlar = [('elektronik', 3), ('giyim', 1), ('elektronik', 9), ('elektronik', 2), ('giyim', 4)]
gruplar = {}
for kat, gun in kayitlar:
    gruplar.setdefault(kat, []).append(gun)
print({k: median(v) for k, v in gruplar.items()})
''',
'hints': ['Grupla-listele-özetle kalıbı: setdefault ile liste sözlüğü.', 'Ortalama yerine medyan: birkaç çok uzun süren talep ortalamayı şişirir.', 'return {yil: median(liste) for yil, liste in sorted(gunler.items())}'],
'why': '''Süre verileri sağa çarpıktır (right-skewed): birkaç kadro aylarca açık kalır ve ortalamayı yukarı çeker; "tipik" talep için medyan daha dürüst bir özettir. <code>setdefault(k, [])</code> anahtar yoksa boş liste koyar ve onu döndürür; <code>collections.defaultdict(list)</code> aynı işi yapar. Açık talepler (closed_date boş) burada dışarıda kalıyor; bu bir yanlılık (bias) kaynağıdır çünkü en uzun sürenler tam da onlar olabilir. İleri analizde sağkalım analizi (survival analysis) bu durumu doğru ele alır.''',
'tags': ['statistics.median', 'setdefault', 'timedelta', 'işe alım'],
},
# ---------------------------------------------------------------- İLERİ
{
'id': 'b-494', 'lv': 'ileri', 'diff': 3, 'kind': 'yaz', 'needs': ['pandas'], 'min': 15,
'title': 'Bölümlere göre compa-ratio (pandas)',
'q': '''<p>Ücret komitesi soruyor: <b>"Hangi bölüm piyasa bandının ortasına göre düşük ödüyor?"</b> Bunun ölçüsü <b>compa-ratio</b>'dur: <code>güncel maaş / bant orta noktası</code> (orta nokta = (band_min + band_max) / 2). 1.0 tam ortada, 0.9 bandın altında demektir.</p>
<p><code>compa_ratio(cal, maas, poz, bol)</code> fonksiyonunu yaz (dört DataFrame: <code>ik_employees</code>, <code>ik_salaries</code>, <code>ik_positions</code>, <code>ik_departments</code>). Aktif çalışanların güncel maaşını (en son <code>effective_date</code>) bul, compa-ratio'yu hesapla ve <b>bölüm adına</b> göre ortalamasını 3 ondalıkla, küçükten büyüğe sıralı bir <code>Series</code> olarak döndür.</p>''',
'start': '''
import pandas as pd
import veri

cal = veri.oku('pusula_ik', 'ik_employees')
maas = veri.oku('pusula_ik', 'ik_salaries')
poz = veri.oku('pusula_ik', 'ik_positions')
bol = veri.oku('pusula_ik', 'ik_departments')


def compa_ratio(cal, maas, poz, bol):
    # buraya yaz
    pass


print(compa_ratio(cal, maas, poz, bol))
''',
'sol': '''
import pandas as pd
import veri

cal = veri.oku('pusula_ik', 'ik_employees')
maas = veri.oku('pusula_ik', 'ik_salaries')
poz = veri.oku('pusula_ik', 'ik_positions')
bol = veri.oku('pusula_ik', 'ik_departments')


def compa_ratio(cal, maas, poz, bol):
    guncel = maas.sort_values('effective_date').groupby('emp_id').tail(1)
    aktif = cal[cal['term_date'].isna()]
    df = (aktif[['emp_id', 'position_id']]
          .merge(guncel[['emp_id', 'monthly_gross']], on='emp_id')
          .merge(poz[['position_id', 'dept_id', 'band_min', 'band_max']], on='position_id')
          .merge(bol[['dept_id', 'name']], on='dept_id'))
    df['compa'] = df['monthly_gross'] / ((df['band_min'] + df['band_max']) / 2)
    return df.groupby('name')['compa'].mean().round(3).sort_values()


print(compa_ratio(cal, maas, poz, bol))
''',
'tests': '''
_s = compa_ratio(veri.oku('pusula_ik', 'ik_employees'), veri.oku('pusula_ik', 'ik_salaries'), veri.oku('pusula_ik', 'ik_positions'), veri.oku('pusula_ik', 'ik_departments'))
assert isinstance(_s, pd.Series), "Sonuç bölüm adını indeks alan bir pandas Series olmalı"
assert len(_s) == ⟨len(_s)⟩, "«len(_s)» bölüm bekleniyor"
assert list(_s.index[:2]) == ⟨list(_s.index[:2])⟩, "En düşük compa-ratio'lu iki bölüm beklenenden farklı (küçükten büyüğe sırala)"
assert abs(float(_s.iloc[0]) - ⟨float(_s.iloc[0])⟩) < 0.002, "En düşük değer «float(_s.iloc[0])» olmalı; güncel maaşı en son kayıttan aldın mı?"
assert abs(float(_s.iloc[-1]) - ⟨float(_s.iloc[-1])⟩) < 0.002, "En yüksek değer «float(_s.iloc[-1])» olmalı"
''',
'hints': ['Güncel maaş: sort_values(\'effective_date\').groupby(\'emp_id\').tail(1)', 'Aktif: cal[cal[\'term_date\'].isna()]; ardından merge zinciri: maaş → pozisyon → bölüm.', 'Gerekli sütunları merge öncesi seç; aynı adlı sütun çakışmalarını (name, title) önler.'],
'why': '''<code>sort_values + groupby().tail(1)</code> "grup başına son kayıt"ın pandas deyimidir; alternatifler <code>idxmax</code> ile <code>loc</code> ya da <code>drop_duplicates('emp_id', keep='last')</code>. Merge zincirinde yalnız gereken sütunları taşımak hem belleği azaltır hem de <code>_x/_y</code> son ekli çakışmaları önler. Compa-ratio İK ücret yönetiminin temel ölçüsüdür: 0.95'in altı genellikle "düzeltme bütçesi" adayıdır. Ortalama yerine medyan ya da kişi bazlı dağılım da raporlanmalı; ortalama birkaç yüksek maaşla maskelenebilir.''',
'tags': ['pandas', 'merge', 'groupby tail', 'compa-ratio'],
},
{
'id': 'b-495', 'lv': 'ileri', 'diff': 3, 'kind': 'rehberli', 'needs': ['pandas'], 'min': 15,
'title': 'Performans puanı ve ertesi yıl gönüllü ayrılma',
'q': '''<p>CHRO'nun hipotezi: <b>"En iyi performanslılarımızı kaybediyoruz."</b> Veriyle sına.</p>
<p><code>puan_ayrilma(cal, deg)</code> fonksiyonunu yaz: 2023 yıl sonu değerlendirmesi olan ve <b>1 Ocak 2024'te hâlâ çalışan</b> kişileri al; her 2023 puanı (1–5) için 2024 içinde <b>gönüllü</b> ayrılanların yüzdesini hesapla. Puanı indeks alan, 1 ondalıklı bir <code>Series</code> döndür.</p>''',
'start': '''
import pandas as pd
import veri

cal = veri.oku('pusula_ik', 'ik_employees')
deg = veri.oku('pusula_ik', 'ik_reviews')


def puan_ayrilma(cal, deg):
    d23 = deg[deg['review_year'] == 2023][['emp_id', 'rating']]
    df = d23.merge(cal[['emp_id', 'term_date', 'term_type']], on='emp_id')
    # TODO: 1 Ocak 2024'te çalışanlar: term_date boş ya da >= '2024-01-01'
    #       (ipucu: boşları fillna('9999-12-31') ile doldurup karşılaştır)
    # TODO: 2024'te gönüllü ayrıldı mı? (bool sütun)
    # TODO: rating'e göre grupla, ortalamayı 100 ile çarp, 1 ondalık
    pass


print(puan_ayrilma(cal, deg))
''',
'sol': '''
import pandas as pd
import veri

cal = veri.oku('pusula_ik', 'ik_employees')
deg = veri.oku('pusula_ik', 'ik_reviews')


def puan_ayrilma(cal, deg):
    d23 = deg[deg['review_year'] == 2023][['emp_id', 'rating']]
    df = d23.merge(cal[['emp_id', 'term_date', 'term_type']], on='emp_id')
    df = df[df['term_date'].fillna('9999-12-31') >= '2024-01-01'].copy()
    df['gitti'] = df['term_date'].fillna('').str.startswith('2024') & (df['term_type'] == 'gönüllü')
    return (df.groupby('rating')['gitti'].mean() * 100).round(1)


print(puan_ayrilma(cal, deg))
''',
'tests': '''
_s = puan_ayrilma(veri.oku('pusula_ik', 'ik_employees'), veri.oku('pusula_ik', 'ik_reviews'))
assert isinstance(_s, pd.Series), "Sonuç puanı indeks alan Series olmalı"
assert list(_s.index) == [1, 2, 3, 4, 5], "Beş puanın hepsi indekste olmalı"
assert abs(float(_s.loc[5]) - ⟨float(_s.loc[5])⟩) < 0.05, "5 puanlıların 2024 gönüllü ayrılma oranı «float(_s.loc[5])» olmalı"
assert abs(float(_s.loc[2]) - ⟨float(_s.loc[2])⟩) < 0.05, "2 puanlılar için «float(_s.loc[2])» bekleniyor; gönülsüz ayrılmaları saymadın, değil mi?"
assert [round(float(x), 1) for x in _s] == ⟨[round(float(x), 1) for x in _s]⟩, "Puan bazında oranlar beklenenden farklı"
''',
'guide': ['2023 değerlendirmelerini çalışanlarla birleştir (iskelette hazır).', 'Paydayı doğru kur: 2023 içinde zaten ayrılmış olanları çıkar (term_date boş ya da 2024 ve sonrası).', 'Hedef sütun: term_date 2024 ile başlıyor VE term_type gönüllü.', 'Bool sütunun ortalaması = oran; groupby(\'rating\')[\'gitti\'].mean() * 100.'],
'example': '''
import pandas as pd
# Benzer teknik: segment bazında churn oranı (bool sütunun ortalaması)
df = pd.DataFrame({'segment': ['A', 'A', 'B', 'B', 'B'], 'kayip': [True, False, True, True, False]})
print((df.groupby('segment')['kayip'].mean() * 100).round(1))
''',
'hints': ['Bool sütunun ortalaması True oranını verir.', 'NaN üzerinde .str işlemleri için önce fillna(\'\') kullan.', 'df[\'gitti\'] = df[\'term_date\'].fillna(\'\').str.startswith(\'2024\') & (df[\'term_type\'] == \'gönüllü\')'],
'why': '''Doğru payda kritik: 2023 içinde ayrılmış biri 2024'te "ayrılamaz"; onu tutarsan oranlar sistematik olarak düşer (hayatta kalan yanlılığının tersi). Bool sütunun <code>mean()</code>'i oranı verir; ayrı sayım + bölme gerekmez. Operatör önceliği: pandas'ta <code>&amp;</code> ve <code>|</code> karşılaştırmalardan önce bağlar; her koşulu parantez içine al. Yorum: oranlar puanlar arasında belirgin farklıysa hipotezin yönünü gösterir, ama örneklem büyüklüklerine (özellikle 1 ve 5 puan az kişi) dikkat; küçük grupta birkaç kişi oranı çok oynatır.''',
'tags': ['pandas', 'merge', 'bool ortalama', 'elde tutma'],
},
{
'id': 'b-496', 'lv': 'ileri', 'diff': 3, 'kind': 'bug', 'needs': ['pandas'], 'min': 12,
'title': 'Pazartesi örüntüsü kişi bazında (hatayı bul)',
'q': '''<p>Analist, hastalık izinlerinin çoğunu Pazartesi başlatan çalışanları listelemek istiyor (yöneticisiyle "iyi oluş" görüşmesi için, ceza için değil). Kural: <b>en az 4 hastalık izni</b> olan ve bunların <b>en az %50'si Pazartesi</b> başlayan çalışanlar.</p>
<p>Aşağıdaki <code>pazartesi_ciler(izin)</code> hiç hata vermiyor ama listesi tamamen yanlış kişileri gösteriyor. Hatayı bul, düzelt. Sonuç: küçükten büyüğe sıralı <code>emp_id</code> listesi.</p>''',
'start': '''
import pandas as pd
import veri

izin = veri.oku('pusula_ik', 'ik_leaves', parse_dates=['start_date'])


def pazartesi_ciler(izin):
    h = izin[izin['leave_type'] == 'hastalık'].copy()
    h['pzt'] = h['start_date'].dt.dayofweek == 1
    ozet = h.groupby('emp_id')['pzt'].agg(['size', 'mean'])
    secim = ozet[(ozet['size'] >= 4) & (ozet['mean'] >= 0.5)]
    return sorted(secim.index.tolist())


print(pazartesi_ciler(izin))
''',
'sol': '''
import pandas as pd
import veri

izin = veri.oku('pusula_ik', 'ik_leaves', parse_dates=['start_date'])


def pazartesi_ciler(izin):
    h = izin[izin['leave_type'] == 'hastalık'].copy()
    h['pzt'] = h['start_date'].dt.dayofweek == 0
    ozet = h.groupby('emp_id')['pzt'].agg(['size', 'mean'])
    secim = ozet[(ozet['size'] >= 4) & (ozet['mean'] >= 0.5)]
    return sorted(secim.index.tolist())


print(pazartesi_ciler(izin))
''',
'tests': '''
_r = pazartesi_ciler(veri.oku('pusula_ik', 'ik_leaves', parse_dates=['start_date']))
assert len(_r) == ⟨len(_r)⟩, "Kurala uyan «len(_r)» çalışan bekleniyor"
assert _r[:5] == ⟨_r[:5]⟩, "İlk beş emp_id beklenenden farklı"
_k = pd.DataFrame({'emp_id': [9, 9, 9, 9], 'leave_type': ['hastalık'] * 4, 'start_date': pd.to_datetime(['2024-11-04', '2024-11-11', '2024-11-12', '2024-11-19'])})
assert pazartesi_ciler(_k) == [9], "4 iznin 2'si Pazartesi (4 ve 11 Kasım 2024) → %50, listede olmalı"
''',
'hints': ['Kod çalışıyor ama yanlış gün seçiyor olabilir.', 'pandas .dt.dayofweek: Pazartesi=0, Pazar=6.', 'Tek karakterlik düzeltme: == 1 yerine == 0.'],
'why': '''Hatalı kod Salı'yı seçiyordu: pandas <code>dayofweek</code> (ve Python <code>weekday()</code>) Pazartesi'yi 0 sayar. Bu tür "off-by-one" hatalar hiçbir uyarı üretmez; bilinen bir tarihle (4 Kasım 2024 = Pazartesi) küçük test kurmak yakalamanın en ucuz yolu. Okunurluk için <code>dt.day_name()</code> ile ad karşılaştırmak da bir seçenek (ama dil ayarına bağlıdır). <code>agg(['size', 'mean'])</code> tek geçişte hem sayıyı hem oranı verir. Etik not: bu tür listeler kişisel veri içerir; KVKK gereği amaç sınırlı ve erişim kısıtlı olmalıdır.''',
'tags': ['pandas', 'dt.dayofweek', 'agg', 'hata avı'],
},
{
'id': 'b-497', 'lv': 'ileri', 'diff': 3, 'kind': 'yaz', 'needs': ['sqlite3'], 'min': 15,
'title': 'Fonksiyon alanına göre ortalama güncel maaş (SQL pencere)',
'q': '''<p>Yönetim raporu: <b>"Ticari, Teknoloji, Operasyon... fonksiyonlarında aktif çalışanların ortalama güncel maaşı ve kişi sayısı nedir?"</b></p>
<p><code>fonksiyon_maaslari(con)</code> fonksiyonunu yaz. Güncel maaşı SQL pencere fonksiyonuyla bul: <code>ROW_NUMBER() OVER (PARTITION BY emp_id ORDER BY effective_date DESC)</code> = 1 olan satır. Aktif çalışan → pozisyon → bölüm (<code>function_area</code>) zincirini birleştir. Sonuç: <code>(function_area, kişi, ortalama_maaş)</code> demetleri; ortalama <code>ROUND(..., 0)</code>, ortalamaya göre azalan sıralı.</p>''',
'start': '''
import veri

con = veri.baglan('pusula_ik')


def fonksiyon_maaslari(con):
    sorgu = """
    -- WITH guncel AS (... ROW_NUMBER() OVER (...) ...)
    """
    pass


for satir in fonksiyon_maaslari(con):
    print(satir)
''',
'sol': '''
import veri

con = veri.baglan('pusula_ik')


def fonksiyon_maaslari(con):
    sorgu = """
    WITH sirali AS (
        SELECT emp_id, monthly_gross,
               ROW_NUMBER() OVER (PARTITION BY emp_id ORDER BY effective_date DESC) AS rn
        FROM ik_salaries
    )
    SELECT d.function_area, COUNT(*) AS kisi, ROUND(AVG(s.monthly_gross), 0) AS ort
    FROM ik_employees e
    JOIN sirali s ON s.emp_id = e.emp_id AND s.rn = 1
    JOIN ik_positions p ON p.position_id = e.position_id
    JOIN ik_departments d ON d.dept_id = p.dept_id
    WHERE e.term_date IS NULL
    GROUP BY d.function_area
    ORDER BY ort DESC
    """
    return con.execute(sorgu).fetchall()


for satir in fonksiyon_maaslari(con):
    print(satir)
''',
'tests': '''
_r = fonksiyon_maaslari(veri.baglan('pusula_ik'))
assert _r is not None and len(_r) == ⟨len(_r)⟩, "«len(_r)» fonksiyon alanı bekleniyor"
assert [x[0] for x in _r] == ⟨[x[0] for x in _r]⟩, "Sıralama (ortalama maaşa göre azalan) beklenenden farklı"
assert sum(x[1] for x in _r) == ⟨sum(x[1] for x in _r)⟩, "Toplam kişi «sum(x[1] for x in _r)» olmalı: her aktif çalışan bir kez sayılmalı (rn = 1)"
assert abs(_r[0][2] - ⟨_r[0][2]⟩) < 1, "En yüksek ortalama «_r[0][2]» olmalı"
''',
'hints': ['Önce CTE (WITH) içinde her maaş satırına çalışan bazında sıra numarası ver.', 'JOIN koşuluna s.rn = 1 ekle; yoksa her çalışan tüm maaş geçmişi kadar sayılır.', 'Sonra pozisyon ve bölüm tablolarıyla birleştirip function_area\'ya göre grupla.'],
'why': '''Pencere fonksiyonu (window function) satırları azaltmadan grup içinde sıra verir; "grup başına en son kayıt" SQL'deki en yaygın kullanımıdır. <code>rn = 1</code> filtresini unutmak klasik hatadır: COUNT şişer, ortalama geçmiş maaşlarla düşer. Alternatif: <code>effective_date = (SELECT MAX(...) ... WHERE emp_id = e.emp_id)</code> korelasyonlu alt sorgu; okunur ama büyük tabloda yavaştır. SQLite 3.25+ pencere fonksiyonlarını destekler (Python'un sqlite3 modülü ve tarayıcıdaki Pyodide de).''',
'tags': ['sqlite3', 'ROW_NUMBER', 'CTE', 'pencere fonksiyonu'],
},
{
'id': 'b-498', 'lv': 'ileri', 'diff': 3, 'kind': 'yaz', 'needs': ['pandas'], 'min': 15,
'title': 'Kaynak bazında işe alım hunisi tablosu (pandas)',
'q': '''<p>İşe alım direktörü tek bir tablo istiyor: <b>"Her aday kaynağı için, başvuranların yüzde kaçı ön eleme, mülakat, teklif ve işe alım aşamasına ulaşıyor?"</b></p>
<p><code>huni_tablosu(aday)</code> fonksiyonunu yaz. Aşama sırası: başvuru(0) → ön eleme(1) → mülakat(2) → teklif(3) → işe alındı(4); <code>'teklif reddedildi'</code> = 3. Sonuç: indeks <code>source</code>, sütunlar <code>['başvuru', 'ön eleme', 'mülakat', 'teklif', 'işe alındı']</code>, değerler o aşamaya ulaşanların başvurulara oranı (%, 1 ondalık). <code>başvuru</code> sütunu her satırda 100.0 olur.</p>''',
'start': '''
import pandas as pd
import veri

aday = veri.oku('pusula_ik', 'ik_candidates')
ASAMALAR = ['başvuru', 'ön eleme', 'mülakat', 'teklif', 'işe alındı']


def huni_tablosu(aday):
    # buraya yaz
    pass


print(huni_tablosu(aday))
''',
'sol': '''
import pandas as pd
import veri

aday = veri.oku('pusula_ik', 'ik_candidates')
ASAMALAR = ['başvuru', 'ön eleme', 'mülakat', 'teklif', 'işe alındı']


def huni_tablosu(aday):
    sira = {a: i for i, a in enumerate(ASAMALAR)}
    sira['teklif reddedildi'] = 3
    seviye = aday['stage'].map(sira)
    tablo = pd.DataFrame({a: (seviye >= i) for i, a in enumerate(ASAMALAR)})
    tablo['source'] = aday['source']
    return (tablo.groupby('source')[ASAMALAR].mean() * 100).round(1)


print(huni_tablosu(aday))
''',
'tests': '''
_t = huni_tablosu(veri.oku('pusula_ik', 'ik_candidates'))
assert isinstance(_t, pd.DataFrame), "Sonuç DataFrame olmalı"
assert list(_t.columns) == ['başvuru', 'ön eleme', 'mülakat', 'teklif', 'işe alındı'], "Sütunlar aşama sırasında olmalı"
assert (_t['başvuru'] == 100).all(), "Her kaynağın başvuru sütunu 100.0 olmalı"
assert abs(float(_t.loc['referans', 'işe alındı']) - ⟨float(_t.loc['referans', 'işe alındı'])⟩) < 0.05, "Referansta işe alınma oranı «float(_t.loc['referans', 'işe alındı'])» olmalı"
assert abs(float(_t.loc['LinkedIn', 'mülakat']) - ⟨float(_t.loc['LinkedIn', 'mülakat'])⟩) < 0.05, "LinkedIn'de mülakata ulaşma «float(_t.loc['LinkedIn', 'mülakat'])» olmalı (teklif reddedenler de mülakattan geçti)"
assert abs(float(_t.loc['üniversite', 'teklif']) - ⟨float(_t.loc['üniversite', 'teklif'])⟩) < 0.05, "Üniversite kaynağında teklife ulaşma «float(_t.loc['üniversite', 'teklif'])» olmalı"
''',
'hints': ['Aşamayı sayıya çevir: aday[\'stage\'].map(sira).', 'Her aşama için bool sütun: seviye >= i. Bir sözlükten DataFrame kurabilirsin.', 'groupby(\'source\')[ASAMALAR].mean() * 100 → her hücre oran.'],
'why': '''Kategorik aşamayı sıralı bir sayıya çevirmek (ordinal encoding) "ulaştı mı?" sorusunu basit bir <code>&gt;=</code> karşılaştırmasına indirger. Bool sütunların grup ortalaması doğrudan oranı verir; pivot ya da crosstab gerekmez. <code>map</code> bilinmeyen bir aşamada NaN üretir; NaN &gt;= i False olduğundan aday sessizce "hiçbir aşamaya ulaşmadı" sayılır. Gerçek veride önce <code>seviye.isna().sum()</code> ile denetle. Tablo okunuşu: referans kaynağı her basamakta daha az kayıp veriyor; LinkedIn ve kariyer siteleri ön elemede çok kaybediyor (hacim yüksek, uyum düşük).''',
'tags': ['pandas', 'map', 'ordinal', 'huni', 'groupby'],
},
]
