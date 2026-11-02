import sys
sys.path.insert(0, '/tmp/claude-0/-home-claude/6c066959-3fcb-54bb-bdf1-c8ae148dfc4c/scratchpad/a4gen')
from common import main

T = 'Veri seti analizi'
P = []

# ---------------------------------------------------------------- a-206
P.append(dict(
    id='a-206', title='Uçak tipine göre doluluk', track=T, diff='Orta',
    tags=['veri seti', 'join', 'ağırlıklı ortalama'], src='Havacılık KPI: load factor',
    fn='doluluk_orani', ds='kanat_havayollari',
    statement='<p>Filo planlama ekibi, hangi uçak tipinin daha dolu uçtuğunu (load factor) görmek istiyor. <code>hv_flights</code> her uçuşun <code>tail_no</code> ve <code>pax</code> '
              '(yolcu sayısı) değerini, <code>hv_aircraft</code> ise her uçağın <code>model</code> ve <code>seats</code> (koltuk) değerini tutar.</p>'
              '<p><code>doluluk_orani(ay=None)</code>: <code>status == "landed"</code> uçuşlar için model başına <b>ağırlıklı</b> doluluk oranını hesapla: '
              '<code>toplam pax / toplam koltuk * 100</code> (1 ondalık). <code>ay</code> verilirse (<code>"YYYY-MM"</code>) yalnız <code>sched_dep</code>\'i o ayda olan uçuşları kullan.</p>',
    input='<p><code>ay</code>: <code>None</code> ya da <code>"YYYY-MM"</code>.</p>',
    output='<p><code>dict</code>: model → yüzde. O dönemde uçuşu olmayan model yer almaz.</p>',
    constraints='hv_flights 3173, hv_aircraft 15 satır',
    samples=[('doluluk_orani()', 'Tüm dönem için uçak tipi başına doluluk.')],
    calls=['doluluk_orani(\'2024-12\')', 'doluluk_orani(\'2024-09\')[\'A330-300\']', 'doluluk_orani(\'2025-01\')'],
    start='''
        import veri

        def doluluk_orani(ay=None):
            ucuslar = veri.kayitlar("kanat_havayollari", "hv_flights")
            ucaklar = veri.kayitlar("kanat_havayollari", "hv_aircraft")
            # kodunu yaz
            pass
        ''',
    sol='''
        import veri
        from collections import defaultdict

        def doluluk_orani(ay=None):
            ucuslar = veri.kayitlar("kanat_havayollari", "hv_flights")
            ucaklar = {u["tail_no"]: u for u in veri.kayitlar("kanat_havayollari", "hv_aircraft")}
            pax, koltuk = defaultdict(int), defaultdict(int)
            for f in ucuslar:
                if f["status"] != "landed" or (ay and not f["sched_dep"].startswith(ay)):
                    continue
                u = ucaklar[f["tail_no"]]
                pax[u["model"]] += f["pax"]
                koltuk[u["model"]] += u["seats"]
            return {m: round(100 * pax[m] / koltuk[m], 1) for m in koltuk}
        ''',
    editorial='<p><b>Ağırlıklı mı, basit ortalama mı?</b> Uçuş başına doluluk oranlarının ortalaması (<i>ortalamaların ortalaması</i>) küçük ve büyük uçuşlara eşit ağırlık verir. '
              'Sektör tanımı (load factor) <code>Σ yolcu / Σ koltuk</code>\'tur: bu, her koltuğa eşit ağırlık verir. İki yöntem farklı sonuç verir; mülakatlarda sık sorulan bir tuzaktır.</p>'
              '<p><b>Yaklaşım:</b> <code>tail_no → uçak</code> sözlüğü, sonra model başına iki toplayıcı (pay ve payda). Oranı en sonda bir kez hesapla.</p>'
              '<p><b>Karmaşıklık:</b> O(n).</p>',
    hints=['<code>{tail_no: satır}</code> sözlüğüyle uçağın modeline ve koltuğuna eriş.', 'Model başına hem pax hem koltuk topla; oranı en sonda al.'],
))

# ---------------------------------------------------------------- a-207
P.append(dict(
    id='a-207', title='Riskli dönüş süreleri', track=T, diff='Zor',
    tags=['veri seti', 'sıralama', 'ardışık kayıtlar', 'datetime'], src='"Pairwise consecutive" (LAG penceresi) kalıbı; havacılık turnaround analizi',
    fn='kisa_donusler', ds='kanat_havayollari',
    statement='<p>Bir uçak indikten sonra yeniden kalkmadan önce temizlik, yakıt ve yolcu indirme-bindirme için zamana ihtiyaç duyar (turnaround). '
              'Operasyon ekibi, önceki uçuştan gerçek iniş ile bir sonraki uçuşun <b>planlanan</b> kalkışı arasındaki sürenin çok kısa kaldığı uçuşları arıyor.</p>'
              '<p><code>kisa_donusler(esik_dk)</code>: <code>hv_flights</code>\'ta <code>status == "cancelled"</code> olanları at. Her uçak (<code>tail_no</code>) için kalan uçuşları '
              '<code>sched_dep</code>\'e göre sırala. Ardışık her <code>(önceki, sonraki)</code> çifti için <code>önceki.actual_arr</code> doluysa '
              '<code>dönüş = sonraki.sched_dep - önceki.actual_arr</code> (dakika). Dönüşü <code>esik_dk</code>\'dan <b>küçük</b> olan çift sayısını ve bunlar arasında dönüşü en kısa olan '
              '<b>sonraki</b> uçuşun <code>flight_id</code>\'sini (eşitlikte küçük id) döndür: <code>(adet, flight_id)</code>. Hiç yoksa <code>(0, None)</code>.</p>',
    input='<p><code>esik_dk</code>: dakika (int).</p>',
    output='<p><code>tuple</code>: <code>(int, int | None)</code>. Dönüş negatif olabilir (önceki uçuş geç indiği için sonraki zaten rötarlı).</p>',
    constraints='hv_flights 3173 satır, 15 uçak',
    samples=[('kisa_donusler(30)', '30 dakikadan kısa dönüşlü uçuş sayısı ve en riskli uçuş.')],
    calls=['kisa_donusler(0)', 'kisa_donusler(45)', 'kisa_donusler(60)[0]', 'kisa_donusler(-500)'],
    start='''
        import veri
        from datetime import datetime

        def kisa_donusler(esik_dk):
            ucuslar = veri.kayitlar("kanat_havayollari", "hv_flights")
            # kodunu yaz
            pass
        ''',
    sol='''
        import veri
        from datetime import datetime
        from collections import defaultdict

        def kisa_donusler(esik_dk):
            ucuslar = veri.kayitlar("kanat_havayollari", "hv_flights")
            bicim = "%Y-%m-%d %H:%M:%S"
            ucak = defaultdict(list)
            for f in ucuslar:
                if f["status"] != "cancelled":
                    ucak[f["tail_no"]].append(f)
            adet, en_kisa = 0, None
            for liste in ucak.values():
                liste.sort(key=lambda f: f["sched_dep"])
                for once, sonra in zip(liste, liste[1:]):
                    if once["actual_arr"] is None:
                        continue
                    donus = (datetime.strptime(sonra["sched_dep"], bicim) - datetime.strptime(once["actual_arr"], bicim)).total_seconds() / 60
                    if donus < esik_dk:
                        adet += 1
                        aday = (donus, sonra["flight_id"])
                        if en_kisa is None or aday < en_kisa:
                            en_kisa = aday
            return (adet, en_kisa[1] if en_kisa else None)
        ''',
    editorial='<p><b>Kalıp:</b> "Grup içinde sırala, ardışık çiftleri karşılaştır." Python\'da <code>zip(liste, liste[1:])</code> ardışık çiftleri zarifçe üretir '
              '(3.10+ sürümünde <code>itertools.pairwise</code>). SQL karşılığı <code>LAG(actual_arr) OVER (PARTITION BY tail_no ORDER BY sched_dep)</code>, pandas\'ta '
              '<code>groupby("tail_no")["actual_arr"].shift()</code>.</p>'
              '<p><b>Dikkat:</b> Sıralamayı uçak bazında yapmalısın; tüm tabloyu tek seferde sıralarsan farklı uçakların uçuşları ardışık görünür. '
              'İptaller atıldıktan <i>sonra</i> çiftler kurulur; yönlendirilen (diverted) uçuşun <code>actual_arr</code>\'ı yoktur, o çift atlanır.</p>'
              '<p><b>En küçüğü izlemek:</b> <code>(donus, flight_id)</code> demetini karşılaştırmak, eşitlikte küçük id kuralını kendiliğinden uygular.</p>'
              '<p><b>Karmaşıklık:</b> O(n log n).</p>',
    hints=['Uçağa göre grupla: <code>defaultdict(list)</code>.', 'Her grubu <code>sched_dep</code>\'e göre sırala; <code>zip(l, l[1:])</code> ile ardışık çiftleri gez.',
           'Önceki uçuşun <code>actual_arr</code>\'ı <code>None</code> ise çifti atla.'],
))

# ---------------------------------------------------------------- a-208
P.append(dict(
    id='a-208', title='Abone mi, tek seferlik mi?', track=T, diff='Kolay',
    tags=['veri seti', 'join', 'büyük veri'], src='Mikromobilite KPI: kullanıcı tipine göre gelir',
    fn='tip_ozeti', ds='pedal_izmir',
    statement='<p>Pedal İzmir, abonelerle tek seferlik kullanıcıların davranışını kıyaslamak istiyor. <code>bk_trips</code> (~117 bin satır) her yolculuğun <code>user_id</code> ve '
              '<code>fare</code> (ücret, TL) değerini, <code>bk_users</code> ise kullanıcının <code>user_type</code> değerini (<code>"abone"</code>, <code>"tek seferlik"</code>) tutar.</p>'
              '<p><code>tip_ozeti(tip)</code>: kullanıcı tipi <code>tip</code> olanların <b>kapanmış</b> yolculuklarının sayısını ve yolculuk başına ortalama ücretini (2 ondalık) <code>(adet, ortalama)</code> olarak döndür. '
              'Kapanmamış yolculuklarda (bisiklet henüz iade edilmemiş) <code>ended_at</code> ve <code>fare</code> boştur (<code>None</code>); bunları hesaba katma.</p>',
    input='<p><code>tip</code>: <code>"abone"</code> ya da <code>"tek seferlik"</code>.</p>',
    output='<p><code>tuple</code>: <code>(int, float)</code></p>',
    constraints='bk_trips 116 517 satır: tabloyu bir kez gez',
    samples=[('tip_ozeti(\'abone\')', 'Abonelerin yolculuk sayısı ve ortalama ücreti.')],
    calls=['tip_ozeti(\'tek seferlik\')'],
    start='''
        import veri

        def tip_ozeti(tip):
            yolculuklar = veri.kayitlar("pedal_izmir", "bk_trips")
            kullanicilar = veri.kayitlar("pedal_izmir", "bk_users")
            # kodunu yaz
            pass
        ''',
    sol='''
        import veri

        YOLCULUKLAR = veri.kayitlar("pedal_izmir", "bk_trips")

        def tip_ozeti(tip):
            yolculuklar = YOLCULUKLAR
            kullanicilar = veri.kayitlar("pedal_izmir", "bk_users")
            uyan = {k["user_id"] for k in kullanicilar if k["user_type"] == tip}
            ucretler = [y["fare"] for y in yolculuklar if y["user_id"] in uyan and y["fare"] is not None]
            return (len(ucretler), round(sum(ucretler) / len(ucretler), 2))
        ''',
    editorial='<p><b>Yaklaşım:</b> Önce küçük tablodan (6000 kullanıcı) ilgili <code>user_id</code>\'lerin kümesini çıkar, sonra büyük tabloyu bir kez gez. '
              '<code>set</code> ile üyelik testi O(1)\'dir; aynı işi listeyle yapsaydın her yolculukta 3000 elemanlı listeyi tarardın (≈ 350 milyon karşılaştırma).</p>'
              '<p><b>Boş değer:</b> 316 yolculuk kapanmamış; <code>fare</code> değeri <code>None</code>. <code>sum()</code> içine <code>None</code> girerse <code>TypeError</code> alırsın — büyük tablolarda boşları her zaman önceden say.</p>'
              '<p><b>Not:</b> Abonelikte ilk 30 dakika ücretsizdir; bu yüzden abonelerin ortalama ücreti düşük çıkar. Bir metriği yorumlamadan önce iş modelini bil.</p>',
    hints=['İlgili kullanıcıları <code>set</code>\'e topla.', 'Ücretleri bir listeye al; <code>len</code> ve <code>sum</code> ile özetle.'],
))

# ---------------------------------------------------------------- a-209
P.append(dict(
    id='a-209', title='Günün dilimlerine göre yolculuk', track=T, diff='Orta',
    tags=['veri seti', 'datetime', 'gruplama', 'hafta sonu'], src='Zaman dilimi analizi (time-of-day bucketing)',
    fn='dilim_ozeti', ds='pedal_izmir',
    statement='<p>Pedal İzmir, bisiklet dağıtımını planlamak için yolculukların gün içindeki dağılımına bakıyor. Başlangıç saatine (<code>started_at</code>) göre dilimler:</p>'
              '<table><tr><th>Dilim</th><th>Saat</th></tr><tr><td>gece</td><td>00–05</td></tr><tr><td>sabah</td><td>06–11</td></tr>'
              '<tr><td>öğle</td><td>12–17</td></tr><tr><td>akşam</td><td>18–23</td></tr></table>'
              '<p><code>dilim_ozeti(hafta_sonu=None)</code>: her dilim için <code>(yolculuk_sayisi, ortalama_sure_dk)</code> döndür; süre <code>ended_at - started_at</code> (dakika, 1 ondalık). '
              '<code>hafta_sonu=True</code> yalnız Cumartesi–Pazar, <code>False</code> yalnız hafta içi, <code>None</code> hepsi. Kapanmamış yolculukları (<code>ended_at</code> boş) atla.</p>',
    input='<p><code>hafta_sonu</code>: <code>None</code>, <code>True</code> ya da <code>False</code>.</p>',
    output='<p><code>dict</code>: dilim adı → <code>(int, float)</code>. Dört dilim de her zaman yer alır.</p>',
    constraints='bk_trips 116 517 satır (Haziran–Ağustos 2024)',
    samples=[('dilim_ozeti()', 'Tüm günler için dilim özeti.')],
    calls=['dilim_ozeti(True)', 'dilim_ozeti(False)[\'sabah\']'],
    start='''
        import veri
        from datetime import datetime

        def dilim_ozeti(hafta_sonu=None):
            yolculuklar = veri.kayitlar("pedal_izmir", "bk_trips")
            # kodunu yaz
            pass
        ''',
    sol='''
        import veri
        from datetime import datetime

        def dilim(saat):
            if saat < 6:
                return "gece"
            if saat < 12:
                return "sabah"
            if saat < 18:
                return "öğle"
            return "akşam"

        _OZET = None

        def _hazirla():
            # (dilim, hafta_sonu_mu, süre_dk) üçlüleri; büyük tablo bir kez ayrıştırılır
            global _OZET
            if _OZET is None:
                _OZET = []
                for y in veri.kayitlar("pedal_izmir", "bk_trips"):
                    if y["ended_at"] is None:
                        continue
                    bas = datetime.fromisoformat(y["started_at"])
                    sure = (datetime.fromisoformat(y["ended_at"]) - bas).total_seconds() / 60
                    _OZET.append((dilim(bas.hour), bas.weekday() >= 5, sure))
            return _OZET

        def dilim_ozeti(hafta_sonu=None):
            adet = {d: 0 for d in ("gece", "sabah", "öğle", "akşam")}
            sure = dict.fromkeys(adet, 0.0)
            for d, hs, dk in _hazirla():
                if hafta_sonu is not None and hs != hafta_sonu:
                    continue
                adet[d] += 1
                sure[d] += dk
            return {d: (adet[d], round(sure[d] / adet[d], 1) if adet[d] else 0.0) for d in adet}
        ''',
    editorial='<p><b>Yaklaşım:</b> Saati dilime çeviren küçük bir yardımcı fonksiyon kodu okunur kılar. <code>datetime.weekday()</code> Pazartesi=0 … Pazar=6 döndürür; '
              '<code>&gt;= 5</code> hafta sonudur (<code>isoweekday()</code> ise 1–7 döndürür, karıştırma).</p>'
              '<p><b>Üç durumlu filtre:</b> <code>(bas.weekday() &gt;= 5) != hafta_sonu</code> ifadesi True/False durumlarını tek satırda çözer; <code>None</code> ise filtre hiç uygulanmaz.</p>'
              '<p><b>Performans:</b> 117 bin satırda iki <code>strptime</code> çağrısı belirgin süre alır; ISO metinlerde <code>datetime.fromisoformat</code> çok daha hızlıdır. '
              'Çözüm ayrıştırmayı bir kez yapıp <code>(dilim, hafta_sonu, süre)</code> üçlülerini önbelleğe alır; filtreli her çağrı yalnız bu küçük listeyi gezer. '
              'Süre için <code>datetime</code> farkı şarttır (gece yarısını geçen yolculuklar!).</p>'
              '<p><b>Alternatif:</b> <code>bisect</code> ile sınır listesinde arama: <code>["gece","sabah","öğle","akşam"][saat // 6]</code> — burada dilimler eşit 6 saat olduğu için tam bölme bile yeter.</p>',
    hints=['<code>saat // 6</code> dilim indeksini verir.', '<code>bas.weekday() &gt;= 5</code> → hafta sonu.', 'Süre: <code>(bitis - bas).total_seconds() / 60</code>'],
))

# ---------------------------------------------------------------- a-210
P.append(dict(
    id='a-210', title='Yağmur bisikleti durdurur mu?', track=T, diff='Orta',
    tags=['veri seti', 'join', 'saatlik', 'karşılaştırma'], src='Hava durumu × talep analizi (Citi Bike/Divvy vaka çalışmaları)',
    fn='yagmur_etkisi', ds='pedal_izmir',
    statement='<p>Pedal İzmir, yağmurun talebi ne kadar düşürdüğünü ölçmek istiyor. <code>bk_weather</code> tablosunda her saat için bir gözlem var: '
              '<code>obs_hour</code> (<code>"YYYY-MM-DD HH:00:00"</code>), <code>rain_mm</code>.</p>'
              '<p><code>yagmur_etkisi(esik_mm=0.0)</code>: <code>bk_weather</code>\'daki her saati <code>rain_mm &gt; esik_mm</code> ise <b>yağmurlu</b>, değilse <b>kuru</b> say. '
              'Her saatteki yolculuk sayısı = <code>started_at</code>\'i o saat içinde başlayan yolculuklar (hiç yolculuk yoksa 0). '
              '<code>(yagmurlu_ortalama, kuru_ortalama, yagmurlu_saat_sayisi)</code> döndür; ortalamalar saat başına yolculuk, 1 ondalık. Yağmurlu saat yoksa ortalaması <code>0.0</code>.</p>',
    input='<p><code>esik_mm</code>: float ≥ 0.</p>',
    output='<p><code>tuple</code>: <code>(float, float, int)</code></p>',
    constraints='bk_weather 2208 saat, bk_trips 116 517 satır',
    samples=[('yagmur_etkisi()', 'Herhangi bir yağış olan saatler ile kuru saatlerin karşılaştırması.')],
    calls=['yagmur_etkisi(1.0)', 'yagmur_etkisi(100)'],
    start='''
        import veri

        def yagmur_etkisi(esik_mm=0.0):
            yolculuklar = veri.kayitlar("pedal_izmir", "bk_trips")
            hava = veri.kayitlar("pedal_izmir", "bk_weather")
            # kodunu yaz
            pass
        ''',
    sol='''
        import veri
        from collections import Counter

        SAATLIK = Counter(y["started_at"][:13] for y in veri.kayitlar("pedal_izmir", "bk_trips"))

        def yagmur_etkisi(esik_mm=0.0):
            hava = veri.kayitlar("pedal_izmir", "bk_weather")
            saatlik = SAATLIK
            yagmurlu, kuru = [], []
            for h in hava:
                n = saatlik.get(h["obs_hour"][:13], 0)
                (yagmurlu if h["rain_mm"] > esik_mm else kuru).append(n)
            ort = lambda l: round(sum(l) / len(l), 1) if l else 0.0
            return (ort(yagmurlu), ort(kuru), len(yagmurlu))
        ''',
    editorial='<p><b>Anahtar:</b> İki tabloyu ortak bir "saat anahtarı" ile birleştir. <code>"2024-06-01 08:37:12"[:13]</code> → <code>"2024-06-01 08"</code>; aynı dilim '
              '<code>obs_hour</code>\'dan da alınır. <code>Counter</code> saat başına yolculuğu tek geçişte sayar.</p>'
              '<p><b>Neden hava tablosundan dönüyoruz?</b> Hiç yolculuk olmayan saatler de 0 olarak ortalamaya girmeli. Yalnız yolculuk tablosundan gruplasaydın sıfır saatler kaybolur, '
              'ortalama yukarı kayardı (<i>hayatta kalan yanlılığı</i>nın küçük bir örneği).</p>'
              '<p><b>Yorum:</b> Yağmurlu saatlerin çoğu gece ya da sabah erken ise fark yalnız yağmurdan değil saatten de gelir (karıştırıcı değişken). '
              'Daha adil bir kıyas için aynı saat dilimlerini karşılaştırmak gerekir.</p>',
    hints=['Saat anahtarı: <code>metin[:13]</code>.', 'Yolculukları <code>Counter</code> ile saate göre say.', 'Hava tablosunu gezerek her saati iki listeden birine ekle.'],
))

# ---------------------------------------------------------------- a-211
P.append(dict(
    id='a-211', title='Destek kanalı memnuniyeti', track=T, diff='Kolay',
    tags=['veri seti', 'None', 'ortalama'], src='Müşteri hizmetleri KPI: CSAT',
    fn='kanal_memnuniyet', ds='kesit_bi',
    statement='<p>Kesit BI modelindeki <code>Talepler</code> tablosu müşteri destek taleplerini tutar: <code>Kanal</code> (Telefon, E-posta, Canlı destek, Sosyal medya), '
              '<code>Memnuniyet</code> (1–5 puan; anket yanıtlanmadıysa boş).</p>'
              '<p><code>kanal_memnuniyet(kanal)</code>: verilen kanaldaki taleplerin <b>yanıtlanmış</b> memnuniyet puanlarının ortalamasını (2 ondalık) ve yanıt oranını (yüzde, 1 ondalık) '
              '<code>(ortalama, yanit_orani)</code> olarak döndür.</p>',
    input='<p><code>kanal</code>: kanal adı (str).</p>',
    output='<p><code>tuple</code>: <code>(float, float)</code></p>',
    constraints='Talepler 270 satır',
    samples=[('kanal_memnuniyet(\'Telefon\')', 'Telefon kanalının CSAT ortalaması ve anket yanıt oranı.')],
    calls=['kanal_memnuniyet(\'E-posta\')', 'kanal_memnuniyet(\'Canlı destek\')', 'kanal_memnuniyet(\'Sosyal medya\')'],
    start='''
        import veri

        def kanal_memnuniyet(kanal):
            talepler = veri.kayitlar("kesit_bi", "Talepler")
            # kodunu yaz
            pass
        ''',
    sol='''
        import veri

        def kanal_memnuniyet(kanal):
            talepler = [t for t in veri.kayitlar("kesit_bi", "Talepler") if t["Kanal"] == kanal]
            puanlar = [t["Memnuniyet"] for t in talepler if t["Memnuniyet"] is not None]
            return (round(sum(puanlar) / len(puanlar), 2), round(100 * len(puanlar) / len(talepler), 1))
        ''',
    editorial='<p><b>Boş değerler:</b> Yanıtlanmamış anketi 0 puan saymak ortalamayı haksız yere düşürür. Doğrusu boşları ortalamadan <i>çıkarmak</i> ama yanıt oranını ayrıca raporlamaktır; '
              'düşük yanıt oranlı bir ortalama güvenilmezdir.</p>'
              '<p>pandas\'taki <code>mean()</code> boşları (NaN) zaten atlar; saf Python\'da bunu kendin yaparsın. SQL\'de de <code>AVG(Memnuniyet)</code> NULL\'ları atlar ama '
              '<code>COUNT(*)</code> atlamaz — oranın iki parçası bu farktan doğar.</p>',
    hints=['Önce kanala göre filtrele.', 'Puan listesi: <code>[t["Memnuniyet"] for t in ... if t["Memnuniyet"] is not None]</code>'],
))

# ---------------------------------------------------------------- a-212
P.append(dict(
    id='a-212', title='Bütçesini aşan projeler', track=T, diff='Kolay',
    tags=['veri seti', 'filtreleme', 'sıralama'], src='PMO raporu: budget overrun',
    fn='butce_asimi', ds='kesit_bi',
    statement='<p>Proje yönetim ofisi (PMO), <code>Projeler</code> tablosundan bütçesini aşan projeleri listelemek istiyor (<code>Proje</code>, <code>Butce</code>, <code>Harcanan</code>).</p>'
              '<p><code>butce_asimi(esik=0)</code>: aşım yüzdesi <code>(Harcanan - Butce) / Butce * 100</code> değeri <code>esik</code>\'ten <b>büyük</b> olan projeleri '
              '<code>(Proje, asim_yuzdesi)</code> olarak, aşıma göre azalan sırada döndür (yüzde 1 ondalık).</p>',
    input='<p><code>esik</code>: yüzde eşiği (sayı).</p>',
    output='<p><code>list</code> of <code>(str, float)</code>.</p>',
    constraints='Projeler 14 satır',
    samples=[('butce_asimi()', 'Bütçesini herhangi bir oranda aşan projeler.')],
    calls=['butce_asimi(5)', 'butce_asimi(-10)', 'butce_asimi(1000)'],
    start='''
        import veri

        def butce_asimi(esik=0):
            projeler = veri.kayitlar("kesit_bi", "Projeler")
            # kodunu yaz
            pass
        ''',
    sol='''
        import veri

        def butce_asimi(esik=0):
            projeler = veri.kayitlar("kesit_bi", "Projeler")
            sonuc = []
            for p in projeler:
                asim = (p["Harcanan"] - p["Butce"]) / p["Butce"] * 100
                if asim > esik:
                    sonuc.append((p["Proje"], round(asim, 1)))
            return sorted(sonuc, key=lambda x: x[1], reverse=True)
        ''',
    editorial='<p><b>Yaklaşım:</b> Hesapla → filtrele → sırala. Negatif eşik "bütçenin %10\'undan fazla altında kalmayanlar" gibi soruları da yanıtlar.</p>'
              '<p><b>Sık hata:</b> Oranı <code>Harcanan / Butce</code> olarak hesaplayıp 1.08\'i "%8 aşım" yerine "108" diye raporlamak. '
              'Ayrıca devam eden projelerde harcama henüz bitmemiştir; gerçek raporda <code>Ilerleme</code>\'ye göre <i>tahmini</i> tamamlanma maliyeti (EAC) daha anlamlıdır.</p>',
    hints=['<code>(harcanan - butce) / butce * 100</code>', '<code>sorted(..., key=lambda x: x[1], reverse=True)</code>'],
))

# ---------------------------------------------------------------- a-213
P.append(dict(
    id='a-213', title='Boş hücreli hedef tablosu', track=T, diff='Kolay',
    tags=['veri seti', 'kirli veri', 'tip dönüşümü'], src='Power Query "boşları 0 ile değiştir" adımının Python karşılığı',
    fn='hedef_toplam', ds='kirli_veri',
    statement='<p><code>kirli_veri</code> setindeki <code>hedef</code> tablosu, kategori başına aylık satış hedeflerini geniş (wide) biçimde tutar: sütunlar <code>Kategori, Oca, Şub, Mar</code>. '
              'Bazı hücreler boş bırakılmış (hedef girilmemiş = 0 kabul edilir).</p>'
              '<p>Tabloyu <b>ham metin olarak</b> oku: <code>veri.kayitlar("kirli_veri", "hedef", cevir=False)</code>. <code>hedef_toplam(aylar)</code>: her kategori için '
              '<code>aylar</code> listesindeki sütunların toplamını <code>int</code> olarak sözlükte döndür.</p>',
    input='<p><code>aylar</code>: sütun adları listesi, ör. <code>["Oca", "Mar"]</code>.</p>',
    output='<p><code>dict</code>: kategori → toplam hedef (int).</p>',
    constraints='hedef 4 satır',
    samples=[('hedef_toplam([\'Oca\', \'Şub\', \'Mar\'])', 'Çeyrek toplamı; Giyim\'in Mart hedefi boş.')],
    calls=['hedef_toplam([\'Mar\'])', 'hedef_toplam([\'Şub\'])', 'hedef_toplam([])'],
    start='''
        import veri

        def hedef_toplam(aylar):
            satirlar = veri.kayitlar("kirli_veri", "hedef", cevir=False)
            # kodunu yaz
            pass
        ''',
    sol='''
        import veri

        def hedef_toplam(aylar):
            satirlar = veri.kayitlar("kirli_veri", "hedef", cevir=False)
            return {s["Kategori"]: sum(int(s[a]) if s[a].strip() else 0 for a in aylar) for s in satirlar}
        ''',
    editorial='<p><b>Ham okuma:</b> <code>cevir=False</code> ile her hücre <code>str</code> gelir; boş hücre <code>""</code> olur. <code>int("")</code> <code>ValueError</code> verir, '
              'bu yüzden önce boşluk denetimi: <code>int(x) if x.strip() else 0</code>.</p>'
              '<p><b>Neden ham?</b> Kirli veride otomatik tip çevirisi tehlikelidir: <code>"1.430"</code> gibi Türkçe binlik ayraçlı bir değer otomatik çeviride <code>1.43</code> olur! '
              'Temizlemeyi kendin, açıkça yapmak daha güvenlidir.</p>'
              '<p><b>Boş = 0 mı?</b> İş kuralına bağlı: "hedef girilmemiş" 0 demek olmayabilir. Bu görevde 0 kabul ettik; gerçek işte bunu iş birimine sor ve belgele.</p>',
    hints=['Hücreler metin: <code>s["Oca"]</code> → <code>"52000"</code> ya da <code>""</code>.', '<code>int(x) if x.strip() else 0</code>'],
))

# ---------------------------------------------------------------- a-214
P.append(dict(
    id='a-214', title='Bayi raporunu temizle', track=T, diff='Orta',
    tags=['veri seti', 'kirli veri', 'Türkçe sayı', 'tekilleştirme'], src='Power Query temizlik adımları: başlığı yükselt, boşları at, tekrarları kaldır',
    fn='sehir_toplamlari', ds='kirli_veri',
    statement='<p><code>kirli_veri</code> setindeki <code>bayi</code> tablosu Excel\'den gelmiş dağınık bir rapordur: sütun adları <code>Column1…Column5</code>; '
              '<b>ilk satır</b> rapor başlığı, <b>ikinci satır</b> gerçek sütun adları (<code>Bayi, Şehir, Tarih, Tutar, Not</code>). İçinde tamamen boş satır, tekrar eden satır, '
              '<code>" istanbul "</code> / <code>"ANKARA"</code> gibi tutarsız şehir yazımları ve Türkçe biçimli tutarlar (<code>"1.250,50"</code>, <code>"1.430"</code>, tutar yoksa <code>"-"</code>) var.</p>'
              '<p><code>veri.kayitlar("kirli_veri", "bayi", cevir=False)</code> ile oku ve <code>sehir_toplamlari(tekrarlari_at=True)</code> fonksiyonunu yaz:</p>'
              '<ol><li>İlk iki satırı atla; tüm hücreleri <code>strip()</code> ile kırp; tamamen boş satırları at.</li>'
              '<li>Şehri Türkçe kurala göre "baş harf büyük" yap: <code>"istanbul"</code> → <code>"İstanbul"</code>, <code>"ANKARA"</code> → <code>"Ankara"</code>.</li>'
              '<li>Tutarı sayıya çevir: nokta binlik, virgül ondalık ayracı; <code>"-"</code> ya da boşsa tutar yok.</li>'
              '<li><code>tekrarlari_at</code> True ise temizlenmiş <code>(bayi, şehir, tarih, tutar)</code> değerleri aynı olan satırlardan yalnız ilki kalsın.</li>'
              '<li>Şehir başına tutarları topla (tutarı olmayan satırlar katılmaz), 2 ondalık.</li></ol>',
    input='<p><code>tekrarlari_at</code>: bool (varsayılan True).</p>',
    output='<p><code>dict</code>: şehir → toplam tutar (float).</p>',
    constraints='bayi 12 satır',
    samples=[('sehir_toplamlari()', 'Temizlenmiş şehir toplamları; İzmir\'in tutarı "-" olduğu için yok.')],
    calls=['sehir_toplamlari(False)', 'sehir_toplamlari()[\'Ankara\']'],
    start='''
        import veri

        def sehir_toplamlari(tekrarlari_at=True):
            satirlar = veri.kayitlar("kirli_veri", "bayi", cevir=False)
            # kodunu yaz
            pass
        ''',
    sol='''
        import veri

        def tr_baslik(s):
            s = s.replace("I", "ı").replace("İ", "i").lower()
            ilk = {"i": "İ", "ı": "I"}.get(s[:1], s[:1].upper())
            return ilk + s[1:]

        def tr_sayi(s):
            s = s.strip()
            if s in ("", "-"):
                return None
            return float(s.replace(".", "").replace(",", "."))

        def sehir_toplamlari(tekrarlari_at=True):
            satirlar = veri.kayitlar("kirli_veri", "bayi", cevir=False)
            gorulen = set()
            toplam = {}
            for s in satirlar[2:]:
                hucre = [s[f"Column{i}"].strip() for i in range(1, 6)]
                if not any(hucre):
                    continue
                bayi, sehir, tarih, tutar = hucre[0], tr_baslik(hucre[1]), hucre[2], tr_sayi(hucre[3])
                anahtar = (bayi, sehir, tarih, tutar)
                if tekrarlari_at and anahtar in gorulen:
                    continue
                gorulen.add(anahtar)
                if tutar is not None:
                    toplam[sehir] = round(toplam.get(sehir, 0) + tutar, 2)
            return toplam
        ''',
    editorial='<p><b>Türkçe büyük/küçük harf tuzağı:</b> Python\'un <code>str.title()</code> ve <code>str.upper()</code> metotları dil kuralı bilmez: '
              '<code>"istanbul".title()</code> → <code>"Istanbul"</code> (noktasız I), <code>"İ".lower()</code> → <code>"i̇"</code> (i + birleşen nokta, 2 karakter!). '
              'Çözüm: önce <code>I→ı</code>, <code>İ→i</code> değiştirip küçült, ilk harfte <code>i→İ</code>, <code>ı→I</code> eşle.</p>'
              '<p><b>Türkçe sayı:</b> Sıra önemli: önce binlik noktaları sil, sonra virgülü noktaya çevir. Tersini yaparsan <code>"1.250,50"</code> → <code>"1.250.50"</code> olur. '
              '<code>"1.430"</code> bir binlik ayraçtır (1430), 1.43 değil; bu yüzden tabloyu <code>cevir=False</code> ile okuduk.</p>'
              '<p><b>Tekilleştirme:</b> Kirli halde <code>" istanbul "</code> ile <code>"istanbul"</code> farklı görünür; anahtarı <i>temizledikten sonra</i> kur. '
              'Sıra korunan tekilleştirme için <code>set</code> + liste kalıbı klasiktir.</p>',
    hints=['<code>satirlar[2:]</code> başlık satırlarını atlar; hücreler <code>s["Column1"]</code> … <code>s["Column5"]</code>.',
           'Türkçe sayı: <code>float(s.replace(".", "").replace(",", "."))</code>',
           'Türkçe baş harf: <code>"i"</code> → <code>"İ"</code>; küçültmeden önce <code>"I"</code> → <code>"ı"</code>.'],
))

# ---------------------------------------------------------------- a-215
P.append(dict(
    id='a-215', title='Müşteri listesini düzelt', track=T, diff='Orta',
    tags=['veri seti', 'kirli veri', 'tarih doğrulama', 'Türkçe metin'], src='Veri kalitesi kontrolleri: geçersiz tarih, tekrar kayıt, e-posta normalizasyonu',
    fn='temiz_musteriler', ds='kirli_veri',
    statement='<p><code>kirli_veri</code> setindeki <code>musteri</code> tablosu da Excel\'den gelmiş: sütunlar <code>Column1…Column4</code>, ilk satır gerçek başlıklar '
              '(<code>MusteriNo, Ad Soyad, E-posta, KayitTarihi</code>). İçinde tekrar eden müşteri, büyük/küçük harf karışık ad ve e-postalar, boş e-posta ve takvimde olmayan bir tarih var.</p>'
              '<p><code>temiz_musteriler()</code> şu kurallarla sözlük listesi döndürsün (dosyadaki sırayla):</p>'
              '<ul><li>Anahtarlar: <code>"no"</code> (int), <code>"ad"</code>, <code>"eposta"</code>, <code>"kayit"</code>.</li>'
              '<li>Aynı <code>MusteriNo</code> ikinci kez gelirse at (ilk kayıt kalır).</li>'
              '<li><code>ad</code>: her kelimenin ilk harfi büyük, kalanı küçük — <b>Türkçe kurallarıyla</b> (<code>"ALİ ŞAHİN"</code> → <code>"Ali Şahin"</code>).</li>'
              '<li><code>eposta</code>: küçük harfe çevrilmiş; boşsa <code>None</code>.</li>'
              '<li><code>kayit</code>: geçerli bir tarihse aynı <code>"YYYY-MM-DD"</code> metni, değilse (ör. 30 Şubat) <code>None</code>.</li></ul>',
    input='<p>Parametre yok.</p>',
    output='<p><code>list[dict]</code></p>',
    constraints='musteri 7 satır (1 başlık + 6 kayıt)',
    samples=[('temiz_musteriler()[1]', 'İkinci müşteri: ad düzeltilmiş, e-posta küçültülmüş.')],
    calls=['temiz_musteriler()', 'len(temiz_musteriler())'],
    start='''
        import veri

        def temiz_musteriler():
            satirlar = veri.kayitlar("kirli_veri", "musteri", cevir=False)
            # kodunu yaz
            pass
        ''',
    sol='''
        import veri
        from datetime import date

        def tr_kelime(k):
            k = k.replace("I", "ı").replace("İ", "i").lower()
            return {"i": "İ", "ı": "I"}.get(k[:1], k[:1].upper()) + k[1:]

        def gecerli_tarih(s):
            try:
                date.fromisoformat(s)
                return s
            except ValueError:
                return None

        def temiz_musteriler():
            satirlar = veri.kayitlar("kirli_veri", "musteri", cevir=False)
            sonuc, gorulen = [], set()
            for s in satirlar[1:]:
                no = int(s["Column1"])
                if no in gorulen:
                    continue
                gorulen.add(no)
                eposta = s["Column3"].strip().lower()
                sonuc.append({
                    "no": no,
                    "ad": " ".join(tr_kelime(k) for k in s["Column2"].split()),
                    "eposta": eposta or None,
                    "kayit": gecerli_tarih(s["Column4"].strip()),
                })
            return sonuc
        ''',
    editorial='<p><b>Tarih doğrulama:</b> Düzenli ifade (<code>\\d{4}-\\d{2}-\\d{2}</code>) yalnız biçimi denetler; <code>"2024-02-30"</code> bu kalıba uyar ama takvimde yoktur. '
              'Doğrusu ayrıştırmayı denemek: <code>date.fromisoformat</code> geçersiz günde <code>ValueError</code> fırlatır (EAFP: "izin değil af dile").</p>'
              '<p><b>Türkçe harf:</b> <code>"ALİ".lower()</code> → <code>"ali̇"</code> (4 karakter, birleşen nokta!). Önce <code>İ→i</code>, <code>I→ı</code> değiştir, sonra küçült.</p>'
              '<p><b>E-posta:</b> Alan adı büyük/küçük harfe duyarsızdır; yerel kısım teknik olarak duyarlı olabilir ama pratikte neredeyse tüm sistemler küçük harfe normalize eder.</p>'
              '<p><b>Tekilleştirme sırası:</b> Burada tekrar kaydı numaraya göre attık; e-postaları küçültmeden önce satır bazında karşılaştırsaydın 102 numaralı müşteri iki kez kalırdı.</p>',
    hints=['<code>satirlar[1:]</code>: ilk satır başlık.', 'Kelime kelime: <code>" ".join(f(k) for k in ad.split())</code>',
           'Geçersiz tarihi yakala: <code>try: date.fromisoformat(s) except ValueError: ...</code>'],
))

if __name__ == '__main__':
    main(P, '/home/claude/py/v3/a4/arena_02.js')
