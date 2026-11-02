import sys
sys.path.insert(0, '/tmp/claude-0/-home-claude/6c066959-3fcb-54bb-bdf1-c8ae148dfc4c/scratchpad/a4gen')
from common import main

T = 'Veri seti analizi'
P = []

# ---------------------------------------------------------------- a-191
P.append(dict(
    id='a-191', title='Kanala göre sipariş sayısı', track=T, diff='Kolay',
    tags=['veri seti', 'sözlük', 'sayma'], src='HackerRank "Collections.Counter" fikri, Anadolu Market verisiyle',
    fn='kanal_dagilimi', ds='anadolu_market',
    statement='<p>Anadolu Market\'in operasyon ekibi, belirli bir durumdaki siparişlerin hangi satış kanalından geldiğini görmek istiyor. '
              '<code>veri.kayitlar("anadolu_market", "orders")</code> tablosunda her siparişin <code>status</code> (delivered, shipped, cancelled, returned) '
              've <code>channel</code> (web, mobile, store) sütunları var.</p>'
              '<p><code>kanal_dagilimi(durum)</code> fonksiyonunu yaz: durumu <code>durum</code> olan siparişleri kanala göre say ve '
              '<code>{kanal: adet}</code> sözlüğü döndür. Hiç sipariş yoksa boş sözlük döndür.</p>',
    input='<p><code>durum</code>: sipariş durumu (str), ör. <code>"delivered"</code>.</p>',
    output='<p><code>dict</code>: kanal adı → sipariş sayısı. Yalnız en az bir siparişi olan kanallar yer alır.</p>',
    constraints='orders tablosu 910 satır',
    samples=[('kanal_dagilimi(\'cancelled\')', 'İptal edilen 72 siparişin kanallara dağılımı.')],
    calls=['kanal_dagilimi(\'delivered\')', 'kanal_dagilimi(\'returned\')', 'kanal_dagilimi(\'shipped\')', 'kanal_dagilimi(\'kayip\')'],
    start='''
        import veri

        def kanal_dagilimi(durum):
            siparisler = veri.kayitlar("anadolu_market", "orders")
            # kodunu yaz
            pass
        ''',
    sol='''
        import veri
        from collections import Counter

        def kanal_dagilimi(durum):
            siparisler = veri.kayitlar("anadolu_market", "orders")
            return dict(Counter(s["channel"] for s in siparisler if s["status"] == durum))
        ''',
    editorial='<p><b>Yaklaşım:</b> Tabloyu bir kez gez, koşulu sağlayan satırların kanalını <code>Counter</code> ile say. '
              '<code>Counter</code> bir <code>dict</code> alt sınıfıdır; <code>dict(...)</code> ile düz sözlüğe çevirmek testleri ve JSON çıktısını sadeleştirir.</p>'
              '<p><b>Karmaşıklık:</b> O(n) zaman, O(k) bellek (k = kanal sayısı).</p>'
              '<p><b>Alternatif:</b> <code>d.get(k, 0) + 1</code> kalıbı ya da <code>defaultdict(int)</code>. SQL karşılığı: '
              '<code>SELECT channel, COUNT(*) FROM orders WHERE status = ? GROUP BY channel</code>.</p>'
              '<p><b>Sık hata:</b> Sıfır sayılı kanalları <code>{"web": 0}</code> gibi eklemek; görev yalnız görülen kanalları istiyor.</p>',
    hints=['Satırlar sözlük: <code>s["status"]</code>, <code>s["channel"]</code>.', '<code>collections.Counter</code> bir üreteç ifadesini doğrudan sayar.'],
))

# ---------------------------------------------------------------- a-192
P.append(dict(
    id='a-192', title='Kategori cirosu sıralaması', track=T, diff='Orta',
    tags=['veri seti', 'join', 'sıralama', 'gruplama'], src='SQL JOIN + GROUP BY kalıbının saf Python karşılığı',
    fn='en_cok_ciro', ds='anadolu_market',
    statement='<p>Kategori yöneticileri hangi kategorinin en çok ciro getirdiğini soruyor. Üç tabloyu birleştirmen gerekiyor:</p>'
              '<ul><li><code>order_items</code>: <code>order_id, product_id, quantity, unit_price, discount</code></li>'
              '<li><code>products</code>: <code>product_id, category</code></li>'
              '<li><code>orders</code>: <code>order_id, status</code></li></ul>'
              '<p>Bir satırın cirosu <code>quantity * unit_price * (1 - discount)</code>. Yalnız durumu <code>delivered</code> ya da <code>shipped</code> olan siparişleri say. '
              '<code>en_cok_ciro(n)</code> en yüksek cirolu <code>n</code> kategoriyi <code>(kategori, ciro)</code> demetleri olarak, ciroya göre azalan sırada döndürsün. '
              'Ciroyu 2 ondalığa yuvarla.</p>',
    input='<p><code>n</code>: kaç kategori döneceği (int, 1 ≤ n).</p>',
    output='<p><code>list</code> of <code>(str, float)</code>; n kategori sayısından büyükse hepsi döner.</p>',
    constraints='order_items 1620, products 40, orders 910 satır',
    samples=[('en_cok_ciro(3)', 'İlk üç kategori ve cirosu.')],
    calls=['en_cok_ciro(1)', 'en_cok_ciro(5)', 'en_cok_ciro(50)'],
    start='''
        import veri

        def en_cok_ciro(n):
            kalemler = veri.kayitlar("anadolu_market", "order_items")
            urunler = veri.kayitlar("anadolu_market", "products")
            siparisler = veri.kayitlar("anadolu_market", "orders")
            # kodunu yaz
            pass
        ''',
    sol='''
        import veri
        from collections import defaultdict

        def en_cok_ciro(n):
            kalemler = veri.kayitlar("anadolu_market", "order_items")
            urunler = veri.kayitlar("anadolu_market", "products")
            siparisler = veri.kayitlar("anadolu_market", "orders")
            kategori = {u["product_id"]: u["category"] for u in urunler}
            gecerli = {s["order_id"] for s in siparisler if s["status"] in ("delivered", "shipped")}
            ciro = defaultdict(float)
            for k in kalemler:
                if k["order_id"] in gecerli:
                    ciro[kategori[k["product_id"]]] += k["quantity"] * k["unit_price"] * (1 - k["discount"])
            sirali = sorted(ciro.items(), key=lambda x: x[1], reverse=True)
            return [(kat, round(t, 2)) for kat, t in sirali[:n]]
        ''',
    editorial='<p><b>Yaklaşım:</b> Join\'i sözlük ve küme ile yap: <code>product_id → category</code> sözlüğü (arama tablosu) ve geçerli sipariş numaralarından bir <code>set</code>. '
              'Sonra kalemleri bir kez gezip <code>defaultdict(float)</code> ile kategoriye topla. Bu, SQL\'deki hash join\'in ta kendisidir.</p>'
              '<p><b>Karmaşıklık:</b> O(n + m + k log k). İç içe döngüyle (her kalem için ürün listesini taramak) O(n·m) olurdu.</p>'
              '<p><b>Sık hata:</b> Yuvarlamayı toplamadan önce satır satır yapmak (küçük farklar birikir) ve iptal/iade siparişleri ciroya katmak.</p>',
    hints=['Önce <code>{product_id: category}</code> sözlüğü kur.', 'Geçerli sipariş numaralarını bir <code>set</code>\'e koy; <code>in</code> araması O(1) olur.',
           '<code>sorted(d.items(), key=lambda x: x[1], reverse=True)</code>'],
))

# ---------------------------------------------------------------- a-193
P.append(dict(
    id='a-193', title='Kohort: 3 ay içinde dönüş', track=T, diff='Zor',
    tags=['veri seti', 'kohort', 'tarih', 'gruplama'], src='Kohort tutma analizi (growth analytics) mülakat vakası',
    fn='kohort_tutma', ds='anadolu_market',
    statement='<p>Büyüme ekibi "ilk alışverişini yapan müşterilerin kaçı sonraki 3 ay içinde geri geliyor?" sorusunu kohort bazında yanıtlamak istiyor.</p>'
              '<p><code>orders</code> tablosunu kullan; <code>status == "cancelled"</code> olan siparişleri <b>yok say</b>. Her müşterinin <b>kohortu</b>, '
              'ilk (iptal edilmemiş) siparişinin ayıdır (<code>"YYYY-MM"</code>). Kohort ayı <code>M</code> ise, müşterinin <code>M+1</code>, <code>M+2</code> ya da <code>M+3</code> '
              'takvim aylarından birinde en az bir siparişi varsa "dönmüş" sayılır (yıl geçişine dikkat: 2023-11 → 2023-12, 2024-01, 2024-02).</p>'
              '<p><code>kohort_tutma(ay)</code> fonksiyonu <code>(kohort_buyuklugu, donen_sayisi, oran)</code> döndürsün; <code>oran</code> yüzde olarak 1 ondalık. '
              'Kohort boşsa <code>(0, 0, 0.0)</code>.</p>',
    input='<p><code>ay</code>: <code>"YYYY-MM"</code> biçiminde kohort ayı.</p>',
    output='<p><code>tuple</code>: <code>(int, int, float)</code></p>',
    constraints='orders 910 satır, tarih aralığı 2022-06 … 2024-12',
    samples=[('kohort_tutma(\'2023-03\')', 'Mart 2023 kohortu: kaç müşteri, kaçı Nisan–Haziran arasında döndü.')],
    calls=['kohort_tutma(\'2022-11\')', 'kohort_tutma(\'2023-11\')', 'kohort_tutma(\'2024-06\')', 'kohort_tutma(\'2021-01\')'],
    start='''
        import veri

        def kohort_tutma(ay):
            siparisler = veri.kayitlar("anadolu_market", "orders")
            # kodunu yaz
            pass
        ''',
    sol='''
        import veri
        from collections import defaultdict

        def ay_no(s):
            return int(s[:4]) * 12 + int(s[5:7]) - 1

        def kohort_tutma(ay):
            siparisler = veri.kayitlar("anadolu_market", "orders")
            aylar = defaultdict(set)
            for s in siparisler:
                if s["status"] != "cancelled":
                    aylar[s["customer_id"]].add(ay_no(s["order_date"]))
            hedef = ay_no(ay)
            kohort = [m for m, a in aylar.items() if min(a) == hedef]
            donen = sum(1 for m in kohort if any(hedef + k in aylar[m] for k in (1, 2, 3)))
            if not kohort:
                return (0, 0, 0.0)
            return (len(kohort), donen, round(100 * donen / len(kohort), 1))
        ''',
    editorial='<p><b>Anahtar fikir:</b> Ayları tek bir tamsayıya çevir: <code>yil*12 + ay - 1</code>. Böylece "3 ay sonra" basit toplama olur ve yıl geçişi kendiliğinden çözülür '
              '(<code>"2023-12"</code> + 1 → <code>"2024-01"</code>). Metin olarak ay karşılaştırmak ya da ay numarasına 1 ekleyip 13. aya düşmek en sık hatadır.</p>'
              '<p><b>Adımlar:</b> 1) Müşteri başına sipariş aylarının kümesi (<code>defaultdict(set)</code>), 2) kümenin <code>min</code>\'i kohort ayı, '
              '3) kohorttaki her müşteri için <code>hedef+1..hedef+3</code> aylarından biri kümede mi?</p>'
              '<p><b>Karmaşıklık:</b> O(n). <b>Genelleme:</b> Aynı yapı ile tüm kohort × ay-farkı matrisini (retention tablosu) tek geçişte çıkarabilirsin; pandas\'ta bu '
              '<code>pivot_table</code> ile yapılır.</p><p><b>Sık hata:</b> İptal siparişleri kohort belirlerken saymak; aynı ay içindeki ikinci siparişi "dönüş" saymak.</p>',
    hints=['Tarih metninin ilk 7 karakteri ay: <code>s["order_date"][:7]</code>.', 'Ayı tamsayıya çevir: <code>int(yil)*12 + int(ay) - 1</code>.',
           'Müşteri başına ay kümesi tut; kohort ayı kümenin en küçüğüdür.'],
))

# ---------------------------------------------------------------- a-194
P.append(dict(
    id='a-194', title='Döviz cinsine göre hesaplar', track=T, diff='Kolay',
    tags=['veri seti', 'filtreleme', 'sayma'], src='HackerRank "Word Order" sayma fikri, bankacılık verisiyle',
    fn='para_birimi_dagilimi', ds='anadolu_bank',
    statement='<p>Anadolu Bank hazine birimi, açık (aktif) hesapların döviz cinsine göre dağılımını istiyor. '
              '<code>veri.kayitlar("anadolu_bank", "bank_accounts")</code> tablosunda <code>account_type</code> (vadesiz, vadeli, kredi_karti), '
              '<code>currency</code> (TRY, USD, EUR) ve <code>status</code> (aktif, kapali) sütunları var.</p>'
              '<p><code>para_birimi_dagilimi(hesap_turu)</code> fonksiyonu, türü <code>hesap_turu</code> olan <b>aktif</b> hesapları döviz cinsine göre saysın ve sözlük döndürsün.</p>',
    input='<p><code>hesap_turu</code>: hesap türü (str).</p>',
    output='<p><code>dict</code>: döviz kodu → aktif hesap sayısı.</p>',
    constraints='bank_accounts 849 satır',
    samples=[('para_birimi_dagilimi(\'vadeli\')', 'Aktif vadeli hesapların döviz kırılımı.')],
    calls=['para_birimi_dagilimi(\'vadesiz\')', 'para_birimi_dagilimi(\'kredi_karti\')', 'para_birimi_dagilimi(\'yatirim\')'],
    start='''
        import veri

        def para_birimi_dagilimi(hesap_turu):
            hesaplar = veri.kayitlar("anadolu_bank", "bank_accounts")
            # kodunu yaz
            pass
        ''',
    sol='''
        import veri

        def para_birimi_dagilimi(hesap_turu):
            hesaplar = veri.kayitlar("anadolu_bank", "bank_accounts")
            sayac = {}
            for h in hesaplar:
                if h["account_type"] == hesap_turu and h["status"] == "aktif":
                    sayac[h["currency"]] = sayac.get(h["currency"], 0) + 1
            return sayac
        ''',
    editorial='<p><b>Yaklaşım:</b> İki koşullu filtre + sayma. <code>dict.get(anahtar, 0) + 1</code> kalıbı ek import gerektirmez.</p>'
              '<p><b>Karmaşıklık:</b> O(n).</p><p><b>Sık hata:</b> Kapalı hesapları da saymak; <code>status</code> filtresini unutmak raporu şişirir. '
              'Ayrıca <code>"aktif "</code> gibi boşluklu değerler olabilecek gerçek verilerde <code>.strip()</code> kullanmak iyi bir alışkanlıktır.</p>',
    hints=['İki koşulu <code>and</code> ile birleştir.', '<code>sayac.get(k, 0) + 1</code>'],
))

# ---------------------------------------------------------------- a-195
P.append(dict(
    id='a-195', title='Ayın en çok harcanan kategorileri', track=T, diff='Orta',
    tags=['veri seti', 'tarih', 'gruplama', 'sıralama'], src='Kart harcama analizi; "top-N per period" mülakat kalıbı',
    fn='aylik_harcama', ds='anadolu_bank',
    statement='<p>Pazarlama ekibi kart kampanyalarını planlarken her ayın en çok harcama yapılan sektörlerini görmek istiyor. '
              '<code>bank_txns</code> tablosunda <code>txn_time</code> (<code>"YYYY-MM-DD HH:MM:SS"</code>), <code>amount</code> (harcamalar <b>negatif</b>), '
              '<code>txn_type</code> ve <code>merchant_category</code> sütunları var.</p>'
              '<p><code>aylik_harcama(ay, n=3)</code>: <code>txn_type == "kart_harcama"</code> olan ve <code>ay</code> (<code>"YYYY-MM"</code>) ayında gerçekleşen işlemleri '
              '<code>merchant_category</code>\'ye göre topla (tutarın mutlak değeriyle). En yüksek <code>n</code> kategoriyi <code>(kategori, toplam)</code> olarak azalan sırada döndür; toplamı 2 ondalığa yuvarla.</p>',
    input='<p><code>ay</code>: <code>"YYYY-MM"</code>; <code>n</code>: kaç kategori (varsayılan 3).</p>',
    output='<p><code>list</code> of <code>(str, float)</code>. O ay işlem yoksa boş liste.</p>',
    constraints='bank_txns 42 284 satır (2024 yılı)',
    samples=[('aylik_harcama(\'2024-03\')', 'Mart 2024\'te en çok harcanan 3 sektör.')],
    calls=['aylik_harcama(\'2024-12\', 2)', 'aylik_harcama(\'2024-07\', 5)', 'aylik_harcama(\'2023-12\')'],
    start='''
        import veri

        def aylik_harcama(ay, n=3):
            islemler = veri.kayitlar("anadolu_bank", "bank_txns")
            # kodunu yaz
            pass
        ''',
    sol='''
        import veri
        from collections import defaultdict

        ISLEMLER = veri.kayitlar("anadolu_bank", "bank_txns")  # bir kez oku, her çağrıda yeniden kullan

        def aylik_harcama(ay, n=3):
            toplam = defaultdict(float)
            for i in ISLEMLER:
                if i["txn_type"] == "kart_harcama" and i["txn_time"].startswith(ay):
                    toplam[i["merchant_category"]] += abs(i["amount"])
            sirali = sorted(toplam.items(), key=lambda x: -x[1])[:n]
            return [(k, round(v, 2)) for k, v in sirali]
        ''',
    editorial='<p><b>Yaklaşım:</b> ISO tarih metinleri (<code>"2024-03-15 ..."</code>) sözlük sırasıyla da doğru sıralanır; ay filtresi için '
              '<code>str.startswith("2024-03")</code> yeterli ve <code>datetime</code> ayrıştırmasından çok daha hızlıdır.</p>'
              '<p>Harcamalar negatif tutulduğu için <code>abs()</code> ya da <code>-amount</code> kullan; aksi halde "en büyük" en küçük harcama olur.</p>'
              '<p><b>Karmaşıklık:</b> O(n + k log k). Yalnız ilk n gerekiyorsa <code>heapq.nlargest(n, d.items(), key=...)</code> O(k log n) verir.</p>'
              '<p><b>Sık hata:</b> <code>"2024-1"</code> gibi sıfırsız ay öneki; <code>"2024-1"</code> hem Ocak hem Ekim–Aralık\'la eşleşir!</p>',
    hints=['<code>i["txn_time"].startswith(ay)</code>', 'Tutarlar negatif: <code>abs(i["amount"])</code>.', 'Sıralayıp <code>[:n]</code> ile kes.'],
))

# ---------------------------------------------------------------- a-196
P.append(dict(
    id='a-196', title='Ani harcama alarmı', track=T, diff='Zor',
    tags=['veri seti', 'kayan pencere', 'iki işaretçi', 'dolandırıcılık'], src='LeetCode "sliding window" kalıbı, sahtecilik tespiti senaryosu',
    fn='ani_harcama', ds='anadolu_bank',
    statement='<p>Sahtecilik önleme ekibi basit bir kural istiyor: <b>aynı hesapta</b>, <code>dakika</code> dakikalık bir zaman penceresi içinde en az <code>adet</code> '
              'kart harcaması (<code>txn_type == "kart_harcama"</code>) varsa hesap alarma düşer. Pencere kapsayıcıdır: ilk ve son işlem arasındaki fark '
              '<code>dakika * 60</code> saniyeyi geçmemeli.</p>'
              '<p><code>ani_harcama(dakika, adet)</code> alarma düşen hesapların <code>account_id</code> listesini <b>küçükten büyüğe</b> sıralı döndürsün.</p>',
    input='<p><code>dakika</code> (int ≥ 1), <code>adet</code> (int ≥ 2).</p>',
    output='<p>Sıralı <code>list[int]</code>.</p>',
    constraints='bank_txns 42 284 satır; 1 ≤ dakika ≤ 1440; çözüm O(n log n) olmalı',
    samples=[('ani_harcama(720, 3)', '12 saat (720 dk) içinde 3+ kart harcaması olan hesaplar.')],
    calls=['ani_harcama(1440, 3)', 'ani_harcama(360, 3)', 'ani_harcama(1, 2)', 'ani_harcama(1440, 4)'],
    start='''
        import veri
        from datetime import datetime

        def ani_harcama(dakika, adet):
            islemler = veri.kayitlar("anadolu_bank", "bank_txns")
            # kodunu yaz
            pass
        ''',
    sol='''
        import veri
        from datetime import datetime
        from collections import defaultdict

        _ZAMANLAR = None

        def _zamanlar():
            # hesap -> sıralı zaman damgaları; ilk çağrıda hesaplanır, sonra önbellekten gelir
            global _ZAMANLAR
            if _ZAMANLAR is None:
                _ZAMANLAR = defaultdict(list)
                for i in veri.kayitlar("anadolu_bank", "bank_txns"):
                    if i["txn_type"] == "kart_harcama":
                        t = datetime.fromisoformat(i["txn_time"]).timestamp()
                        _ZAMANLAR[i["account_id"]].append(t)
                for z in _ZAMANLAR.values():
                    z.sort()
            return _ZAMANLAR

        def ani_harcama(dakika, adet):
            pencere = dakika * 60
            sonuc = []
            for hesap, z in _zamanlar().items():
                sol = 0
                for sag in range(len(z)):
                    while z[sag] - z[sol] > pencere:
                        sol += 1
                    if sag - sol + 1 >= adet:
                        sonuc.append(hesap)
                        break
            return sorted(sonuc)
        ''',
    editorial='<p><b>Kaba kuvvet</b> her işlem çifti/üçlüsünü denemek O(n²) ve 40 bin satırda yavaştır. <b>Kayan pencere (iki işaretçi):</b> '
              'hesap başına zamanları sırala; sağ işaretçi ilerlerken pencere <code>dakika*60</code>\'ı aşarsa sol işaretçiyi kaydır. '
              'Penceredeki eleman sayısı <code>sag - sol + 1</code> eşiğe ulaştığı an hesabı işaretle ve <code>break</code> ile o hesaptan çık.</p>'
              '<p><b>Karmaşıklık:</b> sıralama O(n log n), tarama O(n) (her işaretçi en çok n adım). Çözüm, ayrıştırılmış ve sıralanmış zamanları ilk çağrıda önbelleğe alır; '
              'farklı eşiklerle tekrar tekrar çağrıldığında 40 bin satırı yeniden ayrıştırmaz.</p>'
              '<p><b>Neden saniye?</b> <code>datetime</code> nesnelerini çıkarmak <code>timedelta</code> verir; karşılaştırma için '
              '<code>timedelta(minutes=dakika)</code> da kullanabilirsin. <code>.timestamp()</code> ile sayıya çevirmek döngüyü hızlandırır.</p>'
              '<p><b>Sık hata:</b> Farklı hesapların işlemlerini aynı pencerede karıştırmak; kapsayıcı sınırda <code>&gt;=</code>/<code>&gt;</code> karışıklığı.</p>',
    hints=['Önce hesap başına zaman listesi: <code>defaultdict(list)</code>.', 'Listeyi sırala, iki işaretçi (sol, sağ) ile gez.',
           'Pencere koşulu: <code>z[sag] - z[sol] &lt;= dakika*60</code>.'],
))

# ---------------------------------------------------------------- a-197
P.append(dict(
    id='a-197', title='Aktif çalışan dağılımı', track=T, diff='Kolay',
    tags=['veri seti', 'None', 'sayma'], src='İK raporlama: "headcount by dimension"',
    fn='aktif_dagilim', ds='pusula_ik',
    statement='<p>Pusula A.Ş. İK ekibi, şu an çalışmakta olan kişileri farklı boyutlarda kırmak istiyor. <code>ik_employees</code> tablosunda '
              'işten ayrılmamış çalışanların <code>term_date</code> değeri boştur (<code>veri.kayitlar</code> boş hücreyi <code>None</code> yapar).</p>'
              '<p><code>aktif_dagilim(alan)</code>: aktif çalışanları <code>alan</code> sütununun değerine göre say ve sözlük döndür. '
              '<code>alan</code> örneğin <code>"work_mode"</code>, <code>"education"</code>, <code>"gender"</code> olabilir.</p>',
    input='<p><code>alan</code>: <code>ik_employees</code> sütun adı (str).</p>',
    output='<p><code>dict</code>: değer → aktif çalışan sayısı.</p>',
    constraints='ik_employees 2199 satır',
    samples=[('aktif_dagilim(\'work_mode\')', 'Ofis / hibrit / uzaktan çalışan aktif kişi sayısı.')],
    calls=['aktif_dagilim(\'education\')', 'aktif_dagilim(\'gender\')', 'aktif_dagilim(\'hire_source\')'],
    start='''
        import veri

        def aktif_dagilim(alan):
            calisanlar = veri.kayitlar("pusula_ik", "ik_employees")
            # kodunu yaz
            pass
        ''',
    sol='''
        import veri
        from collections import Counter

        def aktif_dagilim(alan):
            calisanlar = veri.kayitlar("pusula_ik", "ik_employees")
            return dict(Counter(c[alan] for c in calisanlar if c["term_date"] is None))
        ''',
    editorial='<p><b>Yaklaşım:</b> Aktiflik koşulu <code>c["term_date"] is None</code>. Sütun adını parametre olarak almak, aynı fonksiyonu her boyutta yeniden kullanmanı sağlar '
              '(pandas\'taki <code>df[alan].value_counts()</code> fikri).</p>'
              '<p><b>Neden <code>is None</code>?</b> <code>None</code> bir tekildir (singleton); <code>== None</code> çalışır ama PEP 8 <code>is</code> önerir. '
              '<code>if not c["term_date"]</code> da olur ama 0 ya da boş metni de "yok" sayar.</p><p><b>Karmaşıklık:</b> O(n).</p>',
    hints=['Aktif: <code>c["term_date"] is None</code>', 'Sütunu değişkenle seç: <code>c[alan]</code>.'],
))

# ---------------------------------------------------------------- a-198
P.append(dict(
    id='a-198', title='Departmana göre ayrılma oranı', track=T, diff='Orta',
    tags=['veri seti', 'join', 'oran', 'İK analitiği'], src='İK analitiği: turnover rate by department',
    fn='ayrilma_oranlari', ds='pusula_ik',
    statement='<p>İK direktörü hangi departmanın çalışan kaybettiğini görmek istiyor. Çalışanın departmanına ulaşmak için iki adım gerekir: '
              '<code>ik_employees.position_id</code> → <code>ik_positions.dept_id</code> → <code>ik_departments.name</code>.</p>'
              '<p><code>ayrilma_oranlari(tur=None)</code>: her departman için <code>ayrılan / toplam çalışan</code> oranını yüzde olarak (1 ondalık) hesapla. '
              '"Ayrılan" = <code>term_date</code> dolu olan. <code>tur</code> verilirse yalnız <code>term_type == tur</code> olan ayrılmaları say '
              '(<code>"gönüllü"</code> ya da <code>"gönülsüz"</code>); payda yine departmanın tüm çalışanlarıdır.</p>',
    input='<p><code>tur</code>: <code>None</code>, <code>"gönüllü"</code> ya da <code>"gönülsüz"</code>.</p>',
    output='<p><code>dict</code>: departman adı → yüzde (float).</p>',
    constraints='ik_employees 2199, ik_positions 67, ik_departments 12 satır',
    samples=[('ayrilma_oranlari()[\'Çağrı Merkezi\']', 'Çağrı merkezinin toplam ayrılma oranı.')],
    calls=['ayrilma_oranlari()', 'ayrilma_oranlari(\'gönüllü\')', 'ayrilma_oranlari(\'gönülsüz\')[\'Mağaza Operasyonları\']'],
    start='''
        import veri

        def ayrilma_oranlari(tur=None):
            calisanlar = veri.kayitlar("pusula_ik", "ik_employees")
            pozisyonlar = veri.kayitlar("pusula_ik", "ik_positions")
            departmanlar = veri.kayitlar("pusula_ik", "ik_departments")
            # kodunu yaz
            pass
        ''',
    sol='''
        import veri
        from collections import Counter

        def ayrilma_oranlari(tur=None):
            calisanlar = veri.kayitlar("pusula_ik", "ik_employees")
            pozisyonlar = veri.kayitlar("pusula_ik", "ik_positions")
            departmanlar = veri.kayitlar("pusula_ik", "ik_departments")
            dep_adi = {d["dept_id"]: d["name"] for d in departmanlar}
            poz_dep = {p["position_id"]: dep_adi[p["dept_id"]] for p in pozisyonlar}
            toplam, ayrilan = Counter(), Counter()
            for c in calisanlar:
                dep = poz_dep[c["position_id"]]
                toplam[dep] += 1
                if c["term_date"] is not None and (tur is None or c["term_type"] == tur):
                    ayrilan[dep] += 1
            return {d: round(100 * ayrilan[d] / toplam[d], 1) for d in toplam}
        ''',
    editorial='<p><b>Yaklaşım:</b> İki aşamalı arama: <code>position_id → dept_id → name</code> sözlüklerini birleştirip tek bir <code>position_id → departman adı</code> sözlüğü kur. '
              'Sonra tek geçişte iki sayaç tut: payda (toplam) ve pay (ayrılan). <code>Counter</code>\'da olmayan anahtar 0 döner; bu yüzden hiç ayrılanı olmayan departman da 0.0 alır.</p>'
              '<p><b>Not:</b> Bu "dönem boyunca ayrılan / o departmanda hiç çalışmış herkes" metriğidir. Gerçek İK raporlarında yıllık turnover genellikle '
              '<i>ayrılan / ortalama çalışan sayısı</i> ile hesaplanır; metriğin tanımını raporda yazmak iyi pratiktir.</p>'
              '<p><b>Sık hata:</b> <code>tur</code> verildiğinde paydayı da daraltmak; ya da <code>tur=None</code> durumunu <code>c["term_type"] == None</code> ile karıştırmak.</p>',
    hints=['<code>{position_id: departman_adı}</code> sözlüğünü iki sözlükten türet.', 'İki ayrı <code>Counter</code>: toplam ve ayrılan.',
           'Koşul: <code>term_date is not None and (tur is None or term_type == tur)</code>'],
))

# ---------------------------------------------------------------- a-199
P.append(dict(
    id='a-199', title='İlk yılında ayrılanlar', track=T, diff='Orta',
    tags=['veri seti', 'tarih', 'datetime', 'oran'], src='İK analitiği: early attrition / kalite-işe alım kaynağı',
    fn='erken_ayrilma', ds='pusula_ik',
    statement='<p>İşe alım ekibi, hangi kaynaktan gelen çalışanların <b>ilk 365 gün içinde</b> ayrıldığını merak ediyor (kötü eşleşmenin göstergesi).</p>'
              '<p><code>erken_ayrilma(kaynak)</code>: <code>hire_source == kaynak</code> olan çalışanlar içinde, <code>term_date</code> dolu ve '
              '<code>(term_date - hire_date).days &lt; 365</code> olanların oranını yüzde olarak (1 ondalık) döndür. Kaynakta hiç çalışan yoksa <code>0.0</code>.</p>',
    input='<p><code>kaynak</code>: ör. <code>"referans"</code>, <code>"ajans"</code>, <code>"LinkedIn"</code>.</p>',
    output='<p><code>float</code> (yüzde).</p>',
    constraints='Tarihler <code>"YYYY-MM-DD"</code> metni',
    samples=[('erken_ayrilma(\'referans\')', 'Referansla gelenlerin ne kadarı ilk yılında ayrıldı.')],
    calls=['erken_ayrilma(\'ajans\')', 'erken_ayrilma(\'LinkedIn\')', 'erken_ayrilma(\'üniversite\')', 'erken_ayrilma(\'gazete ilanı\')'],
    start='''
        import veri
        from datetime import date

        def erken_ayrilma(kaynak):
            calisanlar = veri.kayitlar("pusula_ik", "ik_employees")
            # kodunu yaz
            pass
        ''',
    sol='''
        import veri
        from datetime import date

        def erken_ayrilma(kaynak):
            calisanlar = veri.kayitlar("pusula_ik", "ik_employees")
            grup = [c for c in calisanlar if c["hire_source"] == kaynak]
            if not grup:
                return 0.0
            erken = 0
            for c in grup:
                if c["term_date"]:
                    gun = (date.fromisoformat(c["term_date"]) - date.fromisoformat(c["hire_date"])).days
                    if gun < 365:
                        erken += 1
            return round(100 * erken / len(grup), 1)
        ''',
    editorial='<p><b>Yaklaşım:</b> <code>date.fromisoformat("2021-03-01")</code> ISO tarihleri en hızlı ve en okunur biçimde ayrıştırır. İki <code>date</code> farkı '
              '<code>timedelta</code> verir; <code>.days</code> tam gün sayısıdır.</p>'
              '<p><b>Sık hatalar:</b> 1) Boş <code>term_date</code> (<code>None</code>) için <code>fromisoformat</code> çağırıp <code>TypeError</code> almak; '
              '2) bölmeden önce boş grubu denetlememek (<code>ZeroDivisionError</code>); 3) "365 gün" yerine yıl farkı (<code>term.year - hire.year</code>) kullanmak — '
              '31 Aralık\'ta girip 2 Ocak\'ta çıkan biri 1 yıl görünür.</p>'
              '<p><b>Not:</b> Yakın tarihte işe girenlerin henüz 365 günü dolmadı; ciddi bir analizde bu kişiler paydadan çıkarılır (sansürleme).</p>',
    hints=['<code>date.fromisoformat(metin)</code>', 'Fark: <code>(t2 - t1).days</code>', 'Önce kaynağa göre filtrele, sonra boş grup kontrolü.'],
))

# ---------------------------------------------------------------- a-200
P.append(dict(
    id='a-200', title='Maaş bandı dışındakiler', track=T, diff='Zor',
    tags=['veri seti', 'en son kayıt', 'join', 'ücret yönetimi'], src='Ücret yönetimi vakası; "latest record per group" kalıbı',
    fn='bant_disi', ds='pusula_ik',
    statement='<p>Ücret yönetimi ekibi, <b>aktif</b> çalışanlardan güncel maaşı pozisyon bandının dışında kalanları bulmak istiyor.</p>'
              '<ul><li><code>ik_salaries</code>: bir çalışanın tüm maaş geçmişi (<code>emp_id, effective_date, monthly_gross</code>). <b>Güncel maaş</b> = en büyük <code>effective_date</code>\'li kayıt.</li>'
              '<li><code>ik_employees</code>: <code>position_id</code> çalışanın şu anki pozisyonu; aktif = <code>term_date</code> boş.</li>'
              '<li><code>ik_positions</code>: <code>band_min</code>, <code>band_max</code>.</li></ul>'
              '<p><code>bant_disi(yon)</code>: <code>yon == "alt"</code> ise güncel maaşı <code>band_min</code>\'den <b>küçük</b>, <code>yon == "ust"</code> ise <code>band_max</code>\'tan <b>büyük</b> '
              'aktif çalışanları bul. <code>(adet, ilk_bes)</code> döndür: <code>ilk_bes</code>, bu çalışanların bandın ne kadar dışında olduğuna göre (fark, mutlak TL) '
              '<b>büyükten küçüğe</b> sıralanmış ilk 5 <code>emp_id</code>; eşit farkta küçük <code>emp_id</code> önce.</p>',
    input='<p><code>yon</code>: <code>"alt"</code> ya da <code>"ust"</code>.</p>',
    output='<p><code>tuple</code>: <code>(int, list[int])</code></p>',
    constraints='ik_salaries 11 358 satır; maaş kaydı olmayan aktif çalışan yok sayılır',
    samples=[('bant_disi(\'alt\')', 'Bandın altında kalan aktif çalışan sayısı ve en uzak 5 kişi.')],
    calls=['bant_disi(\'ust\')'],
    start='''
        import veri

        def bant_disi(yon):
            calisanlar = veri.kayitlar("pusula_ik", "ik_employees")
            maaslar = veri.kayitlar("pusula_ik", "ik_salaries")
            pozisyonlar = veri.kayitlar("pusula_ik", "ik_positions")
            # kodunu yaz
            pass
        ''',
    sol='''
        import veri

        def bant_disi(yon):
            calisanlar = veri.kayitlar("pusula_ik", "ik_employees")
            maaslar = veri.kayitlar("pusula_ik", "ik_salaries")
            pozisyonlar = veri.kayitlar("pusula_ik", "ik_positions")
            guncel = {}
            for m in maaslar:
                e = m["emp_id"]
                if e not in guncel or m["effective_date"] > guncel[e][0]:
                    guncel[e] = (m["effective_date"], m["monthly_gross"])
            bant = {p["position_id"]: (p["band_min"], p["band_max"]) for p in pozisyonlar}
            disari = []
            for c in calisanlar:
                if c["term_date"] is not None or c["emp_id"] not in guncel:
                    continue
                maas = guncel[c["emp_id"]][1]
                alt, ust = bant[c["position_id"]]
                fark = alt - maas if yon == "alt" else maas - ust
                if fark > 0:
                    disari.append((-fark, c["emp_id"]))
            disari.sort()
            return (len(disari), [e for _, e in disari[:5]])
        ''',
    editorial='<p><b>"Grup başına en son kayıt"</b> veri işinin en sık kalıbıdır. Tek geçişte sözlükte <code>(tarih, değer)</code> tut ve daha yeni tarih gelince güncelle: O(n). '
              'ISO tarih metinleri (<code>"2023-01-01"</code>) metin olarak karşılaştırıldığında da doğru sıralanır.</p>'
              '<p><b>Alternatifler:</b> Listeyi <code>(emp_id, effective_date)</code>\'e göre sıralayıp sözlüğe sırayla yazmak (son yazılan kalır) — O(n log n). '
              'SQL\'de <code>ROW_NUMBER() OVER (PARTITION BY emp_id ORDER BY effective_date DESC)</code>, pandas\'ta <code>sort_values().groupby().tail(1)</code>.</p>'
              '<p><b>Sıralama hilesi:</b> <code>(-fark, emp_id)</code> demetlerini sıralamak "farka göre azalan, eşitlikte id\'ye göre artan" sırayı tek <code>sort()</code> ile verir.</p>'
              '<p><b>Sık hata:</b> İlk bulunan maaş kaydını güncel sanmak (tablo sıralı olmayabilir); ayrılmış çalışanları dahil etmek.</p>',
    hints=['Güncel maaş için sözlükte <code>(effective_date, monthly_gross)</code> tut, daha yeni tarih gelince değiştir.',
           'Fark: alt için <code>band_min - maaş</code>, üst için <code>maaş - band_max</code>; pozitifse banttan çıkmıştır.',
           '<code>(-fark, emp_id)</code> demetlerini sırala.'],
))

# ---------------------------------------------------------------- a-201
P.append(dict(
    id='a-201', title='Ödeme yöntemi payı', track=T, diff='Kolay',
    tags=['veri seti', 'oran', 'filtreleme'], src='Temel KPI hesaplama',
    fn='odeme_payi', ds='lezzet_kurye',
    statement='<p>Lezzet Kurye finans ekibi, teslim edilen siparişlerde ödeme yöntemlerinin payını izliyor. '
              '<code>lk_orders</code> tablosunda <code>status</code> (teslim, iptal, iade) ve <code>payment</code> (kart, cüzdan, nakit) sütunları var.</p>'
              '<p><code>odeme_payi(yontem)</code>: <code>status == "teslim"</code> olan siparişler içinde ödemesi <code>yontem</code> olanların yüzdesini 1 ondalıkla döndür.</p>',
    input='<p><code>yontem</code>: ödeme yöntemi (str).</p>',
    output='<p><code>float</code>: yüzde (0–100).</p>',
    constraints='lk_orders 7178 satır',
    samples=[('odeme_payi(\'nakit\')', 'Teslim edilen siparişlerde nakit ödeme yüzdesi.')],
    calls=['odeme_payi(\'kart\')', 'odeme_payi(\'cüzdan\')', 'odeme_payi(\'kripto\')'],
    start='''
        import veri

        def odeme_payi(yontem):
            siparisler = veri.kayitlar("lezzet_kurye", "lk_orders")
            # kodunu yaz
            pass
        ''',
    sol='''
        import veri

        def odeme_payi(yontem):
            siparisler = veri.kayitlar("lezzet_kurye", "lk_orders")
            teslim = [s for s in siparisler if s["status"] == "teslim"]
            uyan = sum(1 for s in teslim if s["payment"] == yontem)
            return round(100 * uyan / len(teslim), 1)
        ''',
    editorial='<p><b>Yaklaşım:</b> Önce paydayı (teslim edilenler) belirle, sonra payı say. <code>sum(1 for ... if ...)</code> ara liste kurmadan sayar.</p>'
              '<p><b>Sık hata:</b> Paydaya iptal ve iadeleri de katmak — oran sorularında <i>"neyin yüzdesi?"</i> sorusunu her zaman önce netleştir.</p>'
              '<p><b>Karmaşıklık:</b> O(n).</p>',
    hints=['Payda: teslim edilen sipariş sayısı.', '<code>round(100 * pay / payda, 1)</code>'],
))

# ---------------------------------------------------------------- a-202
P.append(dict(
    id='a-202', title='En hızlı kuryeler', track=T, diff='Orta',
    tags=['veri seti', 'datetime', 'ortalama', 'sıralama'], src='Operasyon KPI: kurye başına ortalama teslim süresi',
    fn='en_hizli_kuryeler', ds='lezzet_kurye',
    statement='<p>Lezzet Kurye operasyon müdürü ayın kuryelerini ödüllendirmek istiyor. Teslim süresi, kuryenin paketi aldığı an (<code>picked_at</code>) ile '
              'teslim ettiği an (<code>delivered_at</code>) arasındaki <b>dakika</b> farkıdır.</p>'
              '<p><code>en_hizli_kuryeler(n, min_siparis)</code>: yalnız <code>status == "teslim"</code> siparişleri kullan; en az <code>min_siparis</code> teslimatı olan kuryeler arasından '
              'ortalama teslim süresi en kısa <code>n</code> kuryeyi <code>(courier_id, ortalama_dk)</code> olarak döndür. Ortalama 1 ondalık; sıralama ortalamaya göre artan, '
              'eşitlikte küçük <code>courier_id</code> önce (yuvarlanmamış ortalamayla sırala).</p>',
    input='<p><code>n</code> (int), <code>min_siparis</code> (int).</p>',
    output='<p><code>list</code> of <code>(int, float)</code>.</p>',
    constraints='lk_orders 7178 satır, 60 kurye',
    samples=[('en_hizli_kuryeler(3, 50)', 'En az 50 teslimatı olan en hızlı 3 kurye.')],
    calls=['en_hizli_kuryeler(1, 1)', 'en_hizli_kuryeler(5, 150)', 'en_hizli_kuryeler(2, 10000)'],
    start='''
        import veri
        from datetime import datetime

        def en_hizli_kuryeler(n, min_siparis):
            siparisler = veri.kayitlar("lezzet_kurye", "lk_orders")
            # kodunu yaz
            pass
        ''',
    sol='''
        import veri
        from datetime import datetime
        from collections import defaultdict

        def en_hizli_kuryeler(n, min_siparis):
            siparisler = veri.kayitlar("lezzet_kurye", "lk_orders")
            bicim = "%Y-%m-%d %H:%M:%S"
            sureler = defaultdict(list)
            for s in siparisler:
                if s["status"] == "teslim":
                    fark = datetime.strptime(s["delivered_at"], bicim) - datetime.strptime(s["picked_at"], bicim)
                    sureler[s["courier_id"]].append(fark.total_seconds() / 60)
            ort = [(sum(v) / len(v), k) for k, v in sureler.items() if len(v) >= min_siparis]
            ort.sort()
            return [(k, round(o, 1)) for o, k in ort[:n]]
        ''',
    editorial='<p><b>Yaklaşım:</b> Kurye başına süre listesi tut, sonra eşiği geçenlerin ortalamasını al. <code>timedelta.total_seconds() / 60</code> dakikayı ondalıklı verir; '
              '<code>.seconds</code> kullanmak gün farkını yok sayar (gece yarısını geçen teslimatta hata!).</p>'
              '<p><b>Neden min_siparis?</b> 2 teslimatlı bir kuryenin ortalaması gürültülüdür; küçük örneklem sıralamaları yanıltır. Bu, iş analitiğinde "minimum hacim eşiği" pratiğidir.</p>'
              '<p><b>Sıralama:</b> <code>(ortalama, courier_id)</code> demetleri doğal olarak "ortalama artan, eşitlikte id artan" sıralanır. '
              'Yuvarlanmış değerle sıralamak eşitlik sırasını bozabilir.</p><p><b>Karmaşıklık:</b> O(n + k log k).</p>',
    hints=['<code>datetime.strptime(metin, "%Y-%m-%d %H:%M:%S")</code>', '<code>(t2 - t1).total_seconds() / 60</code>',
           'Eşiği sağlamayan kuryeleri ortalamadan önce ele.'],
))

# ---------------------------------------------------------------- a-203
P.append(dict(
    id='a-203', title='Davet ağacının büyüklüğü', track=T, diff='Zor',
    tags=['veri seti', 'graf', 'BFS', 'ağaç'], src='"Employee importance" / alt ağaç boyutu (LeetCode) fikri, referans programı senaryosu',
    fn='davet_agaci', ds='lezzet_kurye',
    statement='<p>Lezzet Kurye\'nin "arkadaşını getir" programında her müşteri <code>referred_by</code> sütununda kendisini davet eden müşterinin numarasını taşır (yoksa boş). '
              'Pazarlama ekibi, bir müşterinin <b>doğrudan ve dolaylı</b> olarak getirdiği toplam kişi sayısını (davet ağacının büyüklüğü) bilmek istiyor.</p>'
              '<p><code>davet_agaci(musteri_id)</code> <code>(dogrudan, toplam, derinlik)</code> döndürsün: <code>dogrudan</code> = doğrudan davet ettiği kişi sayısı, '
              '<code>toplam</code> = tüm alt ağaçtaki kişi sayısı (kendisi hariç), <code>derinlik</code> = en uzun davet zincirinin uzunluğu (hiç daveti yoksa 0).</p>',
    input='<p><code>musteri_id</code>: <code>lk_customers.customer_id</code>.</p>',
    output='<p><code>tuple</code>: <code>(int, int, int)</code></p>',
    constraints='lk_customers 1209 satır; veride döngü yok ama çözümün ziyaret edilenleri izlemeli',
    samples=[('davet_agaci(214)', '214 numaralı müşteri programın en etkili davetçisi.')],
    calls=['davet_agaci(60)', 'davet_agaci(57)', 'davet_agaci(2)', 'davet_agaci(1)', '[davet_agaci(m)[1] for m in (21, 54, 24, 289)]'],
    start='''
        import veri

        def davet_agaci(musteri_id):
            musteriler = veri.kayitlar("lezzet_kurye", "lk_customers")
            # kodunu yaz
            pass
        ''',
    sol='''
        import veri
        from collections import defaultdict, deque

        _COCUK = None

        def _cocuklar():
            global _COCUK
            if _COCUK is None:
                _COCUK = defaultdict(list)
                for m in veri.kayitlar("lezzet_kurye", "lk_customers"):
                    if m["referred_by"] is not None:
                        _COCUK[m["referred_by"]].append(m["customer_id"])
            return _COCUK

        def davet_agaci(musteri_id):
            cocuk = _cocuklar()
            gorulen = {musteri_id}
            kuyruk = deque([(musteri_id, 0)])
            toplam = derinlik = 0
            while kuyruk:
                m, d = kuyruk.popleft()
                derinlik = max(derinlik, d)
                for c in cocuk[m]:
                    if c not in gorulen:
                        gorulen.add(c)
                        toplam += 1
                        kuyruk.append((c, d + 1))
            return (len(cocuk[musteri_id]), toplam, derinlik)
        ''',
    editorial='<p><b>Modelleme:</b> <code>referred_by</code> her düğümün <i>ebeveynini</i> verir; aşağı doğru gezmek için ters çevir: <code>ebeveyn → [çocuklar]</code> komşuluk listesi.</p>'
              '<p><b>Gezinti:</b> <code>deque</code> ile BFS (genişlik öncelikli arama). Kuyruğa <code>(düğüm, seviye)</code> koymak derinliği bedavaya verir. '
              '<code>gorulen</code> kümesi, veride döngü olsa bile (A, B\'yi; B, A\'yı davet etmiş gibi bozuk kayıt) sonsuz döngüyü önler.</p>'
              '<p><b>Karmaşıklık:</b> komşuluk listesi O(n), her sorgu O(alt ağaç). Çözüm komşuluk listesini modül düzeyinde önbelleğe alıyor; '
              'fonksiyon bir kampanya raporunda yüzlerce müşteri için çağrılırsa tabloyu her seferinde okumak yavaş olur (önbellek = memoization fikrinin veri versiyonu).</p>'
              '<p><b>Alternatif:</b> Özyinelemeli DFS kısa yazılır ama çok derin zincirlerde Python\'un özyineleme sınırına (≈1000) takılabilir. SQL\'de <code>WITH RECURSIVE</code>.</p>',
    hints=['Ters çevir: <code>cocuk[referred_by].append(customer_id)</code>.', 'BFS: <code>collections.deque</code>, kuyrukta <code>(id, seviye)</code>.',
           'Ziyaret edilenleri bir kümede tut; bozuk veride döngü olsa bile sonsuza girmezsin.'],
))

# ---------------------------------------------------------------- a-204
P.append(dict(
    id='a-204', title='Rötar nedenlerinin payı', track=T, diff='Kolay',
    tags=['veri seti', 'oran', 'gruplama'], src='Havacılık operasyon raporu: delay cause breakdown',
    fn='rotar_payi', ds='kanat_havayollari',
    statement='<p>Kanat Havayolları operasyon kontrol merkezi, toplam rötar dakikalarının nedenlere göre dağılımını raporluyor. '
              '<code>hv_delays</code> tablosu: <code>flight_id, reason, minutes</code> (bir uçuşun birden çok nedeni olabilir).</p>'
              '<p><code>rotar_payi(min_dk=0)</code>: <code>minutes &gt;= min_dk</code> olan kayıtları al; her nedenin bu kayıtların toplam dakikası içindeki payını yüzde (1 ondalık) olarak sözlükte döndür. '
              'Kayıt kalmazsa boş sözlük.</p>',
    input='<p><code>min_dk</code>: dakika eşiği (int, varsayılan 0).</p>',
    output='<p><code>dict</code>: neden → yüzde.</p>',
    constraints='hv_delays 1350 satır',
    samples=[('rotar_payi()', 'Tüm rötar dakikalarının nedenlere dağılımı.')],
    calls=['rotar_payi(60)', 'rotar_payi(150)', 'rotar_payi(10000)'],
    start='''
        import veri

        def rotar_payi(min_dk=0):
            rotarlar = veri.kayitlar("kanat_havayollari", "hv_delays")
            # kodunu yaz
            pass
        ''',
    sol='''
        import veri
        from collections import defaultdict

        def rotar_payi(min_dk=0):
            rotarlar = [r for r in veri.kayitlar("kanat_havayollari", "hv_delays") if r["minutes"] >= min_dk]
            toplam = sum(r["minutes"] for r in rotarlar)
            dk = defaultdict(int)
            for r in rotarlar:
                dk[r["reason"]] += r["minutes"]
            return {k: round(100 * v / toplam, 1) for k, v in dk.items()}
        ''',
    editorial='<p><b>Yaklaşım:</b> Filtrele → toplam dakika → nedene göre topla → oranla. Pay hesaplarında payda tüm grubun toplamıdır, kayıt sayısı değil '
              '(kayıt sayısına göre pay "kaç kez", dakikaya göre pay "ne kadar etki" sorusunu yanıtlar; ikisi farklı hikâye anlatır).</p>'
              '<p><b>Kenar durum:</b> Filtre sonrası liste boşsa sözlük kavrayışı hiç dönmez, böylece sıfıra bölme olmaz. Yüzdelerin toplamı yuvarlama yüzünden 99.9 ya da 100.1 olabilir; bu normaldir.</p>',
    hints=['Önce filtrele, sonra toplam dakikayı hesapla.', '<code>{k: round(100*v/toplam, 1) for k, v in d.items()}</code>'],
))

# ---------------------------------------------------------------- a-205
P.append(dict(
    id='a-205', title='Rotaya göre ortalama kalkış rötarı', track=T, diff='Orta',
    tags=['veri seti', 'join', 'datetime', 'ortalama'], src='Havacılık: on-time performance by route',
    fn='rota_rotari', ds='kanat_havayollari',
    statement='<p>Ticari planlama ekibi rotaların dakiklik performansını kıyaslamak istiyor. <code>hv_routes</code> tablosu rotayı tanımlar '
              '(<code>route_id, origin, dest</code>), <code>hv_flights</code> ise her uçuşun planlanan ve gerçekleşen kalkışını (<code>sched_dep</code>, <code>actual_dep</code>) ve '
              '<code>status</code> değerini (landed, cancelled, diverted) tutar.</p>'
              '<p><code>rota_rotari(kalkis, varis)</code>: <code>origin == kalkis</code> ve <code>dest == varis</code> olan rotanın <code>status == "landed"</code> uçuşlarında ortalama kalkış rötarını '
              '(<code>actual_dep - sched_dep</code>, dakika; erken kalkış negatif sayılır) 1 ondalıkla döndür. Rota yoksa <code>None</code>.</p>',
    input='<p><code>kalkis</code>, <code>varis</code>: 3 harfli havalimanı kodları.</p>',
    output='<p><code>float</code> ya da <code>None</code>.</p>',
    constraints='hv_routes 45, hv_flights 3173 satır',
    samples=[('rota_rotari(\'IST\', \'ESB\')', 'İstanbul → Ankara uçuşlarının ortalama kalkış rötarı.')],
    calls=['rota_rotari(\'ESB\', \'IST\')', 'rota_rotari(\'IST\', \'FRA\')', 'rota_rotari(\'SAW\', \'AYT\')', 'rota_rotari(\'VAN\', \'LHR\')'],
    start='''
        import veri
        from datetime import datetime

        def rota_rotari(kalkis, varis):
            rotalar = veri.kayitlar("kanat_havayollari", "hv_routes")
            ucuslar = veri.kayitlar("kanat_havayollari", "hv_flights")
            # kodunu yaz
            pass
        ''',
    sol='''
        import veri
        from datetime import datetime

        def rota_rotari(kalkis, varis):
            rotalar = veri.kayitlar("kanat_havayollari", "hv_routes")
            ucuslar = veri.kayitlar("kanat_havayollari", "hv_flights")
            rota = [r["route_id"] for r in rotalar if r["origin"] == kalkis and r["dest"] == varis]
            if not rota:
                return None
            bicim = "%Y-%m-%d %H:%M:%S"
            farklar = [(datetime.strptime(u["actual_dep"], bicim) - datetime.strptime(u["sched_dep"], bicim)).total_seconds() / 60
                       for u in ucuslar if u["route_id"] == rota[0] and u["status"] == "landed"]
            return round(sum(farklar) / len(farklar), 1)
        ''',
    editorial='<p><b>Yaklaşım:</b> Önce rota kimliğini bul (küçük tablo), sonra uçuşları o kimlikle filtrele. Rötar, iki <code>datetime</code> farkının dakikası.</p>'
              '<p><b>Neden landed?</b> İptal uçuşların <code>actual_dep</code> değeri <code>None</code>; dahil edersen <code>strptime(None)</code> hata verir. '
              'Yönlendirilen (diverted) uçuşlar kalkmıştır ama sektörde genellikle ayrı raporlanır.</p>'
              '<p><b>Not:</b> Erken kalkışları (negatif) sıfıra kırpmak da yaygın bir tanımdır (<code>max(0, fark)</code>) — tanımı raporda açıkça yaz. '
              '<b>Sık hata:</b> <code>timedelta.seconds</code> negatif farkta 86 000 civarı bir sayı döndürür! Her zaman <code>total_seconds()</code> kullan.</p>',
    hints=['Rota yoksa erken dön: <code>return None</code>.', '<code>(gercek - plan).total_seconds() / 60</code>', 'Yalnız <code>status == "landed"</code>.'],
))

if __name__ == '__main__':
    main(P, '/home/claude/py/v3/a4/arena_01.js')
