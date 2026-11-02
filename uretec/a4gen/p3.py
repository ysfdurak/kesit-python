import sys
sys.path.insert(0, '/tmp/claude-0/-home-claude/6c066959-3fcb-54bb-bdf1-c8ae148dfc4c/scratchpad/a4gen')
from common import main

T = 'pandas'
NP = ['pandas']
P = []

# ---------------------------------------------------------------- a-216
P.append(dict(
    id='a-216', title='Kategori kâr marjı', track=T, diff='Kolay', needs=NP,
    tags=['pandas', 'groupby', 'Series'], src='pandas groupby temelleri (Kaggle Learn Pandas: Grouping and Sorting benzeri)',
    fn='marj_tablosu', ds='anadolu_market',
    statement='<p>Anadolu Market fiyatlandırma ekibi kategorilerin ortalama kâr marjını görmek istiyor. <code>veri.oku("anadolu_market", "products")</code> '
              'bir DataFrame döndürür; sütunlar: <code>product_id, name, category, price, cost, stock</code>.</p>'
              '<p><code>marj_tablosu()</code>: her ürün için marjı <code>(price - cost) / price * 100</code> olarak hesapla, kategori başına <b>ortalama</b> marjı bul ve '
              '1 ondalığa yuvarlanmış, büyükten küçüğe sıralı bir <code>pd.Series</code> döndür (indeks: kategori).</p>',
    input='<p>Parametre yok.</p>',
    output='<p><code>pd.Series</code>: indeks kategori, değer yüzde marj; azalan sırada.</p>',
    constraints='products 40 satır',
    samples=[('marj_tablosu().to_dict()', 'Kategori → ortalama marj.')],
    calls=['list(marj_tablosu().index)', 'marj_tablosu().iloc[0]', 'type(marj_tablosu()).__name__'],
    start='''
        import veri
        import pandas as pd

        def marj_tablosu():
            df = veri.oku("anadolu_market", "products")
            # kodunu yaz
            pass
        ''',
    sol='''
        import veri
        import pandas as pd

        def marj_tablosu():
            df = veri.oku("anadolu_market", "products")
            df["marj"] = (df["price"] - df["cost"]) / df["price"] * 100
            return df.groupby("category")["marj"].mean().round(1).sort_values(ascending=False)
        ''',
    editorial='<p><b>Kalıp:</b> Yeni sütun (vektörel işlem) → <code>groupby(anahtar)[sütun].agg()</code> → <code>sort_values</code>. Döngü yazmadan tüm satırlar tek ifadede hesaplanır.</p>'
              '<p><b>Dikkat:</b> Bu, ürün marjlarının basit ortalamasıdır. "Kategorinin toplam marjı" sorulsaydı <code>(Σprice − Σcost) / Σprice</code> gerekirdi; '
              'iki tanım pahalı ürünler varken belirgin şekilde ayrışır.</p>'
              '<p><b>Sık hata:</b> <code>df.groupby("category").mean()</code> tüm sayısal sütunların ortalamasını alır ve metin sütunlarında pandas 2+ hata verir; '
              'önce sütunu seç: <code>groupby(...)["marj"]</code>.</p>',
    hints=['Vektörel sütun: <code>df["marj"] = (df["price"] - df["cost"]) / df["price"] * 100</code>', '<code>.groupby("category")["marj"].mean()</code>',
           '<code>.round(1).sort_values(ascending=False)</code>'],
))

# ---------------------------------------------------------------- a-217
P.append(dict(
    id='a-217', title='Segmentin en kalabalık şehirleri', track=T, diff='Kolay', needs=NP,
    tags=['pandas', 'filtreleme', 'size', 'sort_values'], src='pandas boolean indexing + value counts',
    fn='sehir_musteri', ds='ilgaz_bank',
    statement='<p>Ilgaz Bank şube ağı ekibi, bir müşteri segmentinin en çok hangi şehirlerde yoğunlaştığını soruyor. '
              '<code>veri.oku("ilgaz_bank", "bank_customers")</code>: <code>customer_id, full_name, gender, birth_date, city, segment, …</code></p>'
              '<p><code>sehir_musteri(segment, n)</code>: <code>segment</code> sütunu verilen değere eşit olan müşterileri şehre göre say ve en kalabalık <code>n</code> şehrin adını liste olarak döndür. '
              'Sayı eşitse şehir adına göre (Python\'un varsayılan metin sıralaması) artan sırala.</p>',
    input='<p><code>segment</code>: <code>"Bireysel"</code>, <code>"Özel Bankacılık"</code> ya da <code>"KOBİ"</code>; <code>n</code>: int.</p>',
    output='<p><code>list[str]</code></p>',
    constraints='bank_customers 500 satır',
    samples=[('sehir_musteri(\'KOBİ\', 3)', 'KOBİ müşterilerinin en yoğun olduğu 3 şehir.')],
    calls=['sehir_musteri(\'Özel Bankacılık\', 2)', 'sehir_musteri(\'Bireysel\', 5)', 'sehir_musteri(\'Yok\', 3)'],
    start='''
        import veri
        import pandas as pd

        def sehir_musteri(segment, n):
            df = veri.oku("ilgaz_bank", "bank_customers")
            # kodunu yaz
            pass
        ''',
    sol='''
        import veri
        import pandas as pd

        def sehir_musteri(segment, n):
            df = veri.oku("ilgaz_bank", "bank_customers")
            sayim = df[df["segment"] == segment].groupby("city").size().reset_index(name="adet")
            sayim = sayim.sort_values(["adet", "city"], ascending=[False, True])
            return sayim["city"].head(n).tolist()
        ''',
    editorial='<p><b>Neden <code>value_counts</code> yetmez?</b> <code>value_counts()</code> sayıya göre sıralar ama eşitlikte sıra garanti değildir (pandas sürümüne göre değişebilir). '
              'Deterministik sonuç için sayımı DataFrame\'e çevir ve <b>iki anahtarla</b> sırala: <code>sort_values(["adet", "city"], ascending=[False, True])</code>.</p>'
              '<p><b>Boş sonuç:</b> Olmayan segmentte filtre boş DataFrame verir, <code>groupby().size()</code> boş Series döner ve sonuç <code>[]</code> olur; ek kontrol gerekmez.</p>'
              '<p><b>İpucu:</b> <code>.tolist()</code> NumPy/pandas tiplerini düz Python listesine çevirir — API cevabı ya da JSON için önemlidir.</p>',
    hints=['Filtre: <code>df[df["segment"] == segment]</code>', '<code>.groupby("city").size().reset_index(name="adet")</code>',
           'İki anahtarlı sıralama: <code>ascending=[False, True]</code>'],
))

# ---------------------------------------------------------------- a-218
P.append(dict(
    id='a-218', title='Bölge cirosu (CSV girdisi)', track=T, diff='Kolay', needs=NP, mode='stdin',
    tags=['pandas', 'read_csv', 'groupby', 'stdin'], src='HackerRank tarzı girdi + pandas read_csv',
    statement='<p>Anadolu Market bölge müdürleri günlük satış dökümünü CSV olarak gönderiyor. Standart girdiden gelen CSV\'yi pandas ile oku, '
              'her satırın cirosunu <code>adet * fiyat</code> olarak hesapla ve bölge başına toplam ciroyu yazdır.</p>'
              '<p>Bölgeleri ciroya göre <b>azalan</b> sırada (eşitlikte bölge adına göre artan) <code>bolge: tutar</code> biçiminde, tutar 2 ondalıkla yazdır.</p>',
    input='<p>İlk satır başlık: <code>bolge,urun,adet,fiyat</code>. Sonraki her satır bir satış kaydı.</p>',
    output='<p>Her bölge için bir satır: <code>Marmara: 1234.50</code></p>',
    constraints='1 ≤ satır sayısı ≤ 10^5; 1 ≤ adet ≤ 100; 0 &lt; fiyat ≤ 10^4',
    samples=[{'in': 'bolge,urun,adet,fiyat\nMarmara,Kulaklık,2,1299.0\nEge,Termos,3,459.5\nMarmara,Kitap,1,145.0\nİç Anadolu,Saat,1,3499.0\n',
              'why': 'Marmara: 2*1299 + 145 = 2743; İç Anadolu 3499 en yüksek.'}],
    hidden=[
        {'in': 'bolge,urun,adet,fiyat\nEge,Mat,1,100\n'},
        {'in': 'bolge,urun,adet,fiyat\nB,x,1,50\nA,y,2,25\nC,z,1,10\n'},
        {'in': 'bolge,urun,adet,fiyat\nKaradeniz,Çay,10,12.35\nKaradeniz,Fındık,4,99.99\nAkdeniz,Portakal,20,7.5\n'},
        {'gen': 'import random\nrandom.seed(218)\nb = ["Marmara", "Ege", "Akdeniz", "Karadeniz", "İç Anadolu", "Doğu Anadolu", "Güneydoğu Anadolu"]\nprint("bolge,urun,adet,fiyat")\nfor i in range(2000):\n    print(f"{random.choice(b)},U{i},{random.randint(1, 100)},{random.randint(100, 1000000) / 100}")\n'},
        {'gen': 'import random\nrandom.seed(9)\nprint("bolge,urun,adet,fiyat")\nfor i in range(20000):\n    print(f"B{random.randint(1, 30):02d},U{i % 500},{random.randint(1, 100)},{random.randint(1, 1000000) / 100}")\n'},
    ],
    start='import sys\nimport io\nimport pandas as pd\n\ndf = pd.read_csv(io.StringIO(sys.stdin.read()))\n# kodunu yaz\n',
    sol='''
        import sys
        import io
        import pandas as pd

        df = pd.read_csv(io.StringIO(sys.stdin.read()))
        df["ciro"] = df["adet"] * df["fiyat"]
        ozet = df.groupby("bolge", as_index=False)["ciro"].sum()
        ozet = ozet.sort_values(["ciro", "bolge"], ascending=[False, True])
        for b, c in zip(ozet["bolge"], ozet["ciro"]):
            print(f"{b}: {c:.2f}")
        ''',
    editorial='<p><b>Girdi:</b> <code>pd.read_csv</code> dosya benzeri her nesneyi okur; <code>io.StringIO(sys.stdin.read())</code> standart girdiyi bellekteki bir dosyaya çevirir.</p>'
              '<p><b>Çıktı:</b> <code>zip</code> ile iki sütunu birlikte gezmek <code>iterrows()</code>\'tan çok daha hızlıdır (iterrows her satır için bir Series kurar). '
              '<code>f"{c:.2f}"</code> biçimlendirmesi 2743 → <code>2743.00</code> yazar; <code>round(c, 2)</code> ise <code>2743.0</code> yazardı.</p>'
              '<p><b>Karmaşıklık:</b> O(n + k log k). 10^5 satırda vektörel çarpım milisaniyeler sürer.</p>',
    hints=['<code>df["ciro"] = df["adet"] * df["fiyat"]</code>', '<code>groupby("bolge", as_index=False)["ciro"].sum()</code>', 'Yazdırırken <code>f"{c:.2f}"</code>'],
))

# ---------------------------------------------------------------- a-219
P.append(dict(
    id='a-219', title='Yıllık izin kullanımı', track=T, diff='Kolay', needs=NP,
    tags=['pandas', 'tarih', 'groupby', 'sum'], src='İK raporu: izin türüne göre gün toplamı',
    fn='izin_gunleri', ds='pusula_ik',
    statement='<p>Pusula İK bordro ekibi her yılın izin günlerini türüne göre özetliyor. <code>veri.oku("pusula_ik", "ik_leaves")</code>: '
              '<code>leave_id, emp_id, leave_type, start_date, days</code>.</p>'
              '<p><code>izin_gunleri(yil)</code>: <code>start_date</code>\'i verilen yılda olan izinlerin <code>days</code> toplamını <code>leave_type</code>\'a göre hesapla ve '
              '<code>{tür: toplam_gün}</code> sözlüğü döndür (değerler <code>int</code>).</p>',
    input='<p><code>yil</code>: int.</p>',
    output='<p><code>dict</code>: izin türü → toplam gün.</p>',
    constraints='ik_leaves 16 577 satır',
    samples=[('izin_gunleri(2023)', '2023\'te başlayan izinlerin türe göre toplamı.')],
    calls=['izin_gunleri(2020)', 'izin_gunleri(2024)', 'izin_gunleri(1990)'],
    start='''
        import veri
        import pandas as pd

        def izin_gunleri(yil):
            df = veri.oku("pusula_ik", "ik_leaves", parse_dates=["start_date"])
            # kodunu yaz
            pass
        ''',
    sol='''
        import veri
        import pandas as pd

        def izin_gunleri(yil):
            df = veri.oku("pusula_ik", "ik_leaves", parse_dates=["start_date"])
            secili = df[df["start_date"].dt.year == yil]
            return {k: int(v) for k, v in secili.groupby("leave_type")["days"].sum().items()}
        ''',
    editorial='<p><b>Tarih sütunu:</b> <code>parse_dates=["start_date"]</code> sütunu <code>datetime64</code> yapar; böylece <code>.dt.year</code>, <code>.dt.month</code>, <code>.dt.day_name()</code> erişimcileri açılır. '
              'Metin olarak bıraksaydın <code>df["start_date"].str[:4] == str(yil)</code> da işe yarardı.</p>'
              '<p><b>Tip dönüşümü:</b> <code>groupby().sum()</code> NumPy <code>int64</code> döndürür; JSON\'a yazarken ya da başka sistemlere aktarırken <code>int(v)</code> ile düz Python tipine çevirmek güvenlidir.</p>'
              '<p><b>Not:</b> Yıl sınırını aşan izinler (28 Aralık\'ta başlayan 7 günlük izin) tamamen başladığı yıla yazılır; bordroda gün gün bölmek gerekebilir.</p>',
    hints=['<code>df["start_date"].dt.year == yil</code>', '<code>.groupby("leave_type")["days"].sum()</code>', 'Sözlüğe: <code>{k: int(v) for k, v in s.items()}</code>'],
))

# ---------------------------------------------------------------- a-220
P.append(dict(
    id='a-220', title='Sınıfa göre ortalama bilet', track=T, diff='Kolay', needs=NP,
    tags=['pandas', 'groupby', 'mean', 'round'], src='Gelir yönetimi: average fare by class',
    fn='ortalama_bilet', ds='kanat_havayollari',
    statement='<p>Kanat Havayolları gelir yönetimi ekibi bilet sınıflarına göre ortalama ücreti izliyor. '
              '<code>veri.oku("kanat_havayollari", "hv_bookings")</code>: <code>booking_id, passenger_id, flight_id, booked_at, fare_class, price, status, bags, seat</code>.</p>'
              '<p><code>ortalama_bilet(durum="flown")</code>: <code>status</code> değeri <code>durum</code> olan rezervasyonların <code>fare_class</code> başına ortalama <code>price</code> değerini '
              '2 ondalıkla sözlükte döndür.</p>',
    input='<p><code>durum</code>: <code>"flown"</code>, <code>"cancelled"</code> ya da <code>"no_show"</code>.</p>',
    output='<p><code>dict</code>: sınıf → ortalama fiyat.</p>',
    constraints='hv_bookings 5020 satır',
    samples=[('ortalama_bilet()', 'Uçulmuş biletlerde sınıf başına ortalama fiyat.')],
    calls=['ortalama_bilet(\'cancelled\')', 'ortalama_bilet(\'no_show\')'],
    start='''
        import veri
        import pandas as pd

        def ortalama_bilet(durum="flown"):
            df = veri.oku("kanat_havayollari", "hv_bookings")
            # kodunu yaz
            pass
        ''',
    sol='''
        import veri
        import pandas as pd

        def ortalama_bilet(durum="flown"):
            df = veri.oku("kanat_havayollari", "hv_bookings")
            return df[df["status"] == durum].groupby("fare_class")["price"].mean().round(2).to_dict()
        ''',
    editorial='<p><b>Tek satır zinciri:</b> filtre → <code>groupby</code> → <code>mean</code> → <code>round</code> → <code>to_dict</code>. Uzun zincirleri okunur tutmak için '
              'parantez içinde alt alta yazabilirsin (method chaining).</p>'
              '<p><b>Yorum:</b> İptal edilen biletlerin ortalaması daha yüksekse esnek (pahalı) biletlerin iptal edilebilir olduğunu düşün: veri iş kuralını yansıtır.</p>',
    hints=['<code>df[df["status"] == durum]</code>', '<code>.groupby("fare_class")["price"].mean()</code>', '<code>.round(2).to_dict()</code>'],
))

# ---------------------------------------------------------------- a-221
P.append(dict(
    id='a-221', title='Aylık ciro serisi', track=T, diff='Orta', needs=NP,
    tags=['pandas', 'merge', 'to_period', 'zaman serisi'], src='Aylık gelir raporu: merge + period grouping',
    fn='aylik_ciro', ds='anadolu_market',
    statement='<p>Finans ekibi Anadolu Market\'in aylık cirosunu istiyor. <code>order_items</code> (<code>order_id, quantity, unit_price, discount</code>) ile '
              '<code>orders</code> (<code>order_id, order_date, status</code>) tablolarını birleştir.</p>'
              '<p><code>aylik_ciro(yil)</code>: <code>status</code>\'u <code>delivered</code> ya da <code>shipped</code> olan siparişlerde satır cirosu '
              '<code>quantity * unit_price * (1 - discount)</code>; verilen yılın her ayı için toplamı <code>{"YYYY-MM": ciro}</code> sözlüğü olarak döndür (2 ondalık). '
              'Satış olmayan ay sözlükte yer almaz.</p>',
    input='<p><code>yil</code>: int.</p>',
    output='<p><code>dict</code>: <code>"YYYY-MM"</code> → float.</p>',
    constraints='order_items 1620, orders 910 satır',
    samples=[('aylik_ciro(2024)[\'2024-12\']', 'Aralık 2024 cirosu.')],
    calls=['aylik_ciro(2023)', 'aylik_ciro(2022)', 'len(aylik_ciro(2024))', 'aylik_ciro(2030)'],
    start='''
        import veri
        import pandas as pd

        def aylik_ciro(yil):
            kalem = veri.oku("anadolu_market", "order_items")
            siparis = veri.oku("anadolu_market", "orders", parse_dates=["order_date"])
            # kodunu yaz
            pass
        ''',
    sol='''
        import veri
        import pandas as pd

        def aylik_ciro(yil):
            kalem = veri.oku("anadolu_market", "order_items")
            siparis = veri.oku("anadolu_market", "orders", parse_dates=["order_date"])
            df = kalem.merge(siparis, on="order_id")
            df = df[df["status"].isin(["delivered", "shipped"]) & (df["order_date"].dt.year == yil)]
            df["ciro"] = df["quantity"] * df["unit_price"] * (1 - df["discount"])
            ay = df["order_date"].dt.strftime("%Y-%m")
            return {k: round(float(v), 2) for k, v in df.groupby(ay)["ciro"].sum().items()}
        ''',
    editorial='<p><b>merge:</b> <code>kalem.merge(siparis, on="order_id")</code> varsayılan olarak <i>inner join</i> yapar; her kaleme siparişin tarihini ve durumunu ekler. '
              'Satır sayısının değişmediğini (<code>len</code>) denetlemek, yanlış anahtarla çoğalan satırları yakalamanın en ucuz yoludur.</p>'
              '<p><b>Ay anahtarı:</b> <code>dt.strftime("%Y-%m")</code> metin anahtar üretir; <code>dt.to_period("M")</code> ise sıralanabilir <code>Period</code> nesneleri. '
              'groupby\'a sütun yerine aynı uzunlukta bir Series de verilebilir.</p>'
              '<p><b>Filtre:</b> <code>isin([...])</code> çoklu eşitlik için; koşulları <code>&amp;</code> ile birleştirirken her birini paranteze al (öncelik tuzağı).</p>',
    hints=['<code>kalem.merge(siparis, on="order_id")</code>', '<code>df["status"].isin(["delivered", "shipped"])</code>',
           'Ay anahtarı: <code>df["order_date"].dt.strftime("%Y-%m")</code>'],
))

# ---------------------------------------------------------------- a-222
P.append(dict(
    id='a-222', title='Mutfak × ödeme çapraz tablosu', track=T, diff='Orta', needs=NP,
    tags=['pandas', 'crosstab', 'merge', 'normalize'], src='pandas crosstab / pivot_table (Kaggle, DataCamp benzeri)',
    fn='mutfak_odeme', ds='lezzet_kurye',
    statement='<p>Lezzet Kurye ödeme ekibi, mutfak türüne göre ödeme alışkanlıklarını görmek istiyor. <code>lk_orders</code> (<code>restaurant_id, status, payment</code>) ile '
              '<code>lk_restaurants</code> (<code>restaurant_id, cuisine</code>) tablolarını birleştir; yalnız <code>status == "teslim"</code> siparişleri kullan.</p>'
              '<p><code>mutfak_odeme(oran=False)</code>: satırları <code>cuisine</code>, sütunları <code>payment</code> olan bir çapraz tablo (DataFrame) döndür. '
              '<code>oran=False</code> ise hücrelerde sipariş <b>sayısı</b>, <code>oran=True</code> ise <b>satır yüzdesi</b> (her mutfakta ödeme yöntemlerinin payı, toplamı 100, 1 ondalık) olsun.</p>',
    input='<p><code>oran</code>: bool.</p>',
    output='<p><code>pd.DataFrame</code>: indeks mutfak, sütunlar ödeme yöntemleri.</p>',
    constraints='lk_orders 7178, lk_restaurants 30 satır',
    samples=[('mutfak_odeme().loc[\'Pizza\', \'kart\']', 'Kartla ödenen teslim edilmiş pizza siparişleri.')],
    calls=['mutfak_odeme().shape', 'sorted(mutfak_odeme().columns)', 'mutfak_odeme().loc[\'Döner\'].to_dict()', 'mutfak_odeme(True).loc[\'Vegan\'].to_dict()',
           'round(float(mutfak_odeme(True).loc[\'Burger\'].sum()), 1)'],
    start='''
        import veri
        import pandas as pd

        def mutfak_odeme(oran=False):
            siparis = veri.oku("lezzet_kurye", "lk_orders")
            restoran = veri.oku("lezzet_kurye", "lk_restaurants")
            # kodunu yaz
            pass
        ''',
    sol='''
        import veri
        import pandas as pd

        def mutfak_odeme(oran=False):
            siparis = veri.oku("lezzet_kurye", "lk_orders")
            restoran = veri.oku("lezzet_kurye", "lk_restaurants")
            df = siparis[siparis["status"] == "teslim"].merge(restoran[["restaurant_id", "cuisine"]], on="restaurant_id")
            if oran:
                return (pd.crosstab(df["cuisine"], df["payment"], normalize="index") * 100).round(1)
            return pd.crosstab(df["cuisine"], df["payment"])
        ''',
    editorial='<p><b>crosstab:</b> İki kategorik sütunun frekans tablosunu tek satırda verir. <code>normalize="index"</code> her satırı kendi toplamına böler (satır yüzdesi), '
              '<code>"columns"</code> sütun yüzdesi, <code>True</code> genel toplam yüzdesi.</p>'
              '<p><b>Eşdeğeri:</b> <code>df.pivot_table(index="cuisine", columns="payment", values="order_id", aggfunc="count", fill_value=0)</code> ya da '
              '<code>df.groupby(["cuisine", "payment"]).size().unstack(fill_value=0)</code>.</p>'
              '<p><b>merge öncesi sütun seç:</b> <code>restoran[["restaurant_id", "cuisine"]]</code> gereksiz sütunları (ve <code>city</code> gibi çakışan adları) taşımaz.</p>',
    hints=['Önce filtrele, sonra <code>merge</code>.', '<code>pd.crosstab(df["cuisine"], df["payment"])</code>', 'Satır yüzdesi: <code>normalize="index"</code>, sonra <code>* 100</code>.'],
))

# ---------------------------------------------------------------- a-223
P.append(dict(
    id='a-223', title='Bisiklet biriken istasyonlar', track=T, diff='Orta', needs=NP,
    tags=['pandas', 'value_counts', 'hizalama', 'merge'], src='Bike-share rebalancing analizi (net akış)',
    fn='biriken_istasyonlar', ds='pedal_izmir',
    statement='<p>Pedal İzmir\'in gece ekipleri bisikletleri istasyonlar arasında yeniden dağıtıyor. Hangi istasyonlarda bisiklet <b>birikiyor</b>? '
              'Bir istasyonun net akışı = o istasyonda <b>biten</b> yolculuk sayısı − o istasyondan <b>başlayan</b> yolculuk sayısı.</p>'
              '<p><code>biriken_istasyonlar(n)</code>: yalnız kapanmış yolculukları (<code>end_station</code> dolu) kullan. Net akışı en büyük <code>n</code> istasyonu '
              '<code>(istasyon_adı, net)</code> olarak döndür; net\'e göre azalan, eşitlikte <code>station_id</code>\'ye göre artan. İstasyon adları <code>bk_stations.name</code>.</p>',
    input='<p><code>n</code>: int.</p>',
    output='<p><code>list</code> of <code>(str, int)</code>.</p>',
    constraints='bk_trips 116 517, bk_stations 62 satır',
    samples=[('biriken_istasyonlar(3)', 'En çok bisiklet biriken üç istasyon.')],
    calls=['biriken_istasyonlar(1)', 'biriken_istasyonlar(6)'],
    start='''
        import veri
        import pandas as pd

        def biriken_istasyonlar(n):
            yolculuk = veri.oku("pedal_izmir", "bk_trips")
            istasyon = veri.oku("pedal_izmir", "bk_stations")
            # kodunu yaz
            pass
        ''',
    sol='''
        import veri
        import pandas as pd

        YOLCULUK = veri.oku("pedal_izmir", "bk_trips", usecols=["start_station", "end_station"])

        def biriken_istasyonlar(n):
            yolculuk = YOLCULUK
            istasyon = veri.oku("pedal_izmir", "bk_stations")
            kapali = yolculuk.dropna(subset=["end_station"])
            giris = kapali["end_station"].astype(int).value_counts()
            cikis = kapali["start_station"].value_counts()
            net = giris.sub(cikis, fill_value=0).astype(int).rename("net")
            tablo = istasyon.set_index("station_id").join(net, how="inner").reset_index()
            tablo = tablo.sort_values(["net", "station_id"], ascending=[False, True]).head(n)
            return [(ad, int(v)) for ad, v in zip(tablo["name"], tablo["net"])]
        ''',
    editorial='<p><b>İndeks hizalaması:</b> İki <code>value_counts</code> Series\'i istasyon numarasıyla indekslidir; <code>giris - cikis</code> yazdığında pandas değerleri '
              '<i>indekse göre</i> eşler. Bir istasyon yalnız birinde varsa sonuç <code>NaN</code> olur; <code>sub(..., fill_value=0)</code> eksik tarafı 0 sayar.</p>'
              '<p><b>Tip tuzağı:</b> <code>end_station</code> sütununda boşluk olduğu için pandas onu <code>float64</code> okur (NaN tamsayı olamaz). '
              '<code>dropna</code> sonrası <code>astype(int)</code> ile düzeltmezsen 12.0 ile 12 indeksleri farklı tipte kalabilir.</p>'
              '<p><b>Yorum:</b> Net akışın toplamı her zaman 0\'dır (her yolculuk bir yerden çıkıp bir yere girer) — iyi bir doğrulama testi.</p>',
    hints=['<code>dropna(subset=["end_station"])</code>', 'İki <code>value_counts()</code> Series\'ini <code>.sub(diger, fill_value=0)</code> ile çıkar.',
           'Adları eklemek için <code>set_index("station_id").join(net)</code> ya da <code>merge</code>.'],
))

# ---------------------------------------------------------------- a-224
P.append(dict(
    id='a-224', title='Departman medyan maaşı', track=T, diff='Orta', needs=NP,
    tags=['pandas', 'drop_duplicates', 'merge', 'median'], src='Ücret analizi: latest record per group + median',
    fn='medyan_maas', ds='pusula_ik',
    statement='<p>Pusula İK ücret komitesi, departmanların <b>güncel</b> medyan brüt maaşını görmek istiyor.</p>'
              '<ul><li><code>ik_salaries</code>: maaş geçmişi (<code>emp_id, effective_date, monthly_gross</code>); güncel maaş en son <code>effective_date</code>.</li>'
              '<li><code>ik_employees</code>: aktif = <code>term_date</code> boş; <code>position_id</code>.</li>'
              '<li><code>ik_positions</code> → <code>dept_id</code>; <code>ik_departments</code> → <code>name</code>, <code>function_area</code>.</li></ul>'
              '<p><code>medyan_maas(alan=None)</code>: aktif çalışanların güncel maaşlarının departman (<code>name</code>) başına medyanını, büyükten küçüğe sıralı bir <code>pd.Series</code> olarak döndür. '
              '<code>alan</code> verilirse yalnız <code>function_area == alan</code> olan departmanlar.</p>',
    input='<p><code>alan</code>: <code>None</code> ya da ör. <code>"Teknoloji"</code>, <code>"Operasyon"</code>.</p>',
    output='<p><code>pd.Series</code>: indeks departman adı, değer medyan maaş.</p>',
    constraints='ik_salaries 11 358, ik_employees 2199 satır',
    samples=[('medyan_maas(\'Teknoloji\').to_dict()', 'Teknoloji departmanlarının medyan maaşları.')],
    calls=['list(medyan_maas().index)', 'medyan_maas()[\'Çağrı Merkezi\']', 'medyan_maas(\'Destek\').to_dict()'],
    start='''
        import veri
        import pandas as pd

        def medyan_maas(alan=None):
            maas = veri.oku("pusula_ik", "ik_salaries")
            calisan = veri.oku("pusula_ik", "ik_employees")
            pozisyon = veri.oku("pusula_ik", "ik_positions")
            departman = veri.oku("pusula_ik", "ik_departments")
            # kodunu yaz
            pass
        ''',
    sol='''
        import veri
        import pandas as pd

        def medyan_maas(alan=None):
            maas = veri.oku("pusula_ik", "ik_salaries")
            calisan = veri.oku("pusula_ik", "ik_employees")
            pozisyon = veri.oku("pusula_ik", "ik_positions")
            departman = veri.oku("pusula_ik", "ik_departments")
            guncel = maas.sort_values(["emp_id", "effective_date"]).drop_duplicates("emp_id", keep="last")
            aktif = calisan[calisan["term_date"].isna()][["emp_id", "position_id"]]
            df = (aktif.merge(guncel[["emp_id", "monthly_gross"]], on="emp_id")
                       .merge(pozisyon[["position_id", "dept_id"]], on="position_id")
                       .merge(departman[["dept_id", "name", "function_area"]], on="dept_id"))
            if alan is not None:
                df = df[df["function_area"] == alan]
            return df.groupby("name")["monthly_gross"].median().sort_values(ascending=False)
        ''',
    editorial='<p><b>Grup başına son kayıt:</b> <code>sort_values([...]).drop_duplicates("emp_id", keep="last")</code> en okunur yoldur. Alternatifler: '
              '<code>groupby("emp_id").tail(1)</code> ya da <code>loc[groupby("emp_id")["effective_date"].idxmax()]</code>.</p>'
              '<p><b>Neden medyan?</b> Maaş dağılımları sağa çarpıktır; birkaç yönetici maaşı ortalamayı şişirir, medyanı pek etkilemez.</p>'
              '<p><b>Zincirleme merge:</b> Her adımda yalnız gereken sütunları seçmek, <code>name_x</code> / <code>name_y</code> gibi çakışan sütun adlarını önler.</p>'
              '<p><b>Sık hata:</b> Ayrılmış çalışanları dahil etmek ya da tüm maaş geçmişinin medyanını almak.</p>',
    hints=['Güncel maaş: <code>sort_values(["emp_id", "effective_date"]).drop_duplicates("emp_id", keep="last")</code>',
           'Aktif: <code>calisan["term_date"].isna()</code>', 'Üç <code>merge</code> ile departman adına ulaş.'],
))

# ---------------------------------------------------------------- a-225
P.append(dict(
    id='a-225', title='7 günlük hareketli harcama', track=T, diff='Orta', needs=NP,
    tags=['pandas', 'resample', 'rolling', 'zaman serisi'], src='Zaman serisi: resample + rolling mean',
    fn='hareketli_harcama', ds='ilgaz_bank',
    statement='<p>Ilgaz Bank risk ekibi günlük kart harcamalarındaki dalgalanmayı yumuşatıp izlemek istiyor.</p>'
              '<p><code>hareketli_harcama(tarih, pencere=7)</code>: <code>bank_txns</code> tablosunda <code>txn_type == "kart_harcama"</code> olan işlemlerin <b>günlük</b> toplam harcamasını '
              '(tutarın mutlak değeri) hesapla. İşlem olmayan günler 0 sayılsın (tüm takvim günleri serinin içinde olmalı). '
              'Sonra <code>pencere</code> günlük <b>hareketli ortalamayı</b> (o gün dahil geriye doğru) al ve <code>tarih</code> (<code>"YYYY-MM-DD"</code>) günündeki değeri 2 ondalıkla döndür. '
              'Pencere dolmamışsa (ilk günler) <code>None</code> döndür.</p>',
    input='<p><code>tarih</code>: <code>"YYYY-MM-DD"</code>; <code>pencere</code>: int ≥ 1.</p>',
    output='<p><code>float</code> ya da <code>None</code>.</p>',
    constraints='bank_txns 42 284 satır (2024)',
    samples=[('hareketli_harcama(\'2024-03-15\')', '9–15 Mart arası günlük harcamaların ortalaması.')],
    calls=['hareketli_harcama(\'2024-12-31\', 30)', 'hareketli_harcama(\'2024-01-03\')', 'hareketli_harcama(\'2024-01-07\')', 'hareketli_harcama(\'2024-06-01\', 1)'],
    start='''
        import veri
        import pandas as pd

        def hareketli_harcama(tarih, pencere=7):
            df = veri.oku("ilgaz_bank", "bank_txns", parse_dates=["txn_time"])
            # kodunu yaz
            pass
        ''',
    sol='''
        import veri
        import pandas as pd

        def hareketli_harcama(tarih, pencere=7):
            df = veri.oku("ilgaz_bank", "bank_txns", parse_dates=["txn_time"])
            kart = df[df["txn_type"] == "kart_harcama"]
            gunluk = kart.set_index("txn_time")["amount"].abs().resample("D").sum()
            ortalama = gunluk.rolling(pencere).mean()
            deger = ortalama.loc[pd.Timestamp(tarih)]
            return None if pd.isna(deger) else round(float(deger), 2)
        ''',
    editorial='<p><b>resample:</b> Tarih indeksli seride <code>resample("D").sum()</code> günlük kova oluşturur ve <b>boş günleri 0 ile doldurur</b> (sum için). '
              '<code>groupby(df["txn_time"].dt.date)</code> ise yalnız işlem olan günleri verir; boş günler kaybolur ve hareketli ortalama yanlış pencereye yayılır.</p>'
              '<p><b>rolling:</b> <code>rolling(7).mean()</code> ilk 6 günde NaN üretir (pencere dolmadı). <code>min_periods=1</code> ile kısmi pencereye izin verilebilir — tanımı açıkça seç.</p>'
              '<p><b>Alternatif:</b> Zaman tabanlı pencere <code>rolling("7D")</code> düzensiz zaman damgalarında da çalışır ama ilk günlerde NaN vermez.</p>',
    hints=['<code>set_index("txn_time")["amount"].abs().resample("D").sum()</code>', '<code>.rolling(pencere).mean()</code>',
           'Değeri al: <code>seri.loc[pd.Timestamp(tarih)]</code>; NaN için <code>pd.isna</code>.'],
))

# ---------------------------------------------------------------- a-226
P.append(dict(
    id='a-226', title='Eksik satışı grup ortalamasıyla doldur', track=T, diff='Orta', needs=NP, mode='stdin',
    tags=['pandas', 'fillna', 'transform', 'eksik veri'], src='Eksik veri doldurma: groupby().transform("mean")',
    statement='<p>Anadolu Market mağazalarından gelen haftalık satış dosyasında bazı satış değerleri boş. Analist ekibi bir kural belirledi: '
              'boş bir satış değeri, <b>aynı ürün grubundaki</b> dolu değerlerin ortalamasıyla doldurulur; grubun hiç dolu değeri yoksa 0 yazılır.</p>'
              '<p>Doldurmadan sonra her mağazanın toplam satışını, mağaza adına göre artan sırada <code>magaza toplam</code> biçiminde (toplam 2 ondalık) yazdır.</p>',
    input='<p>CSV, başlık <code>magaza,urun_grubu,satis</code>. Boş satış hücresi boş bırakılır (<code>M1,Gıda,</code>).</p>',
    output='<p>Her mağaza için bir satır: <code>M1 1520.50</code></p>',
    constraints='1 ≤ satır ≤ 10^5',
    samples=[{'in': 'magaza,urun_grubu,satis\nM1,Gıda,100\nM2,Gıda,300\nM1,Temizlik,50\nM2,Gıda,\nM1,Kozmetik,\n',
              'why': 'M2\'nin boş Gıda satışı (100+300)/2 = 200 olur; Kozmetik grubunda hiç değer yok, 0 olur.'}],
    hidden=[
        {'in': 'magaza,urun_grubu,satis\nA,X,10\n'},
        {'in': 'magaza,urun_grubu,satis\nA,X,\nB,X,\n'},
        {'in': 'magaza,urun_grubu,satis\nZ,K,1.5\nA,K,\nA,L,2.25\nZ,L,\nZ,L,4.75\n'},
        {'gen': 'import random\nrandom.seed(226)\nprint("magaza,urun_grubu,satis")\nfor _ in range(3000):\n    v = "" if random.random() < 0.2 else str(random.randint(0, 50000) / 100)\n    print(f"M{random.randint(1, 12):02d},G{random.randint(1, 8)},{v}")\n'},
        {'gen': 'import random\nrandom.seed(5)\nprint("magaza,urun_grubu,satis")\nfor _ in range(20000):\n    g = random.randint(1, 40)\n    v = "" if (g == 40 or random.random() < 0.1) else str(random.randint(0, 100000) / 100)\n    print(f"S{random.randint(1, 50):03d},G{g},{v}")\n'},
    ],
    start='import sys\nimport io\nimport pandas as pd\n\ndf = pd.read_csv(io.StringIO(sys.stdin.read()))\n# kodunu yaz\n',
    sol='''
        import sys
        import io
        import pandas as pd

        df = pd.read_csv(io.StringIO(sys.stdin.read()))
        grup_ort = df.groupby("urun_grubu")["satis"].transform("mean")
        df["satis"] = df["satis"].fillna(grup_ort).fillna(0)
        toplam = df.groupby("magaza")["satis"].sum().sort_index()
        for m, t in toplam.items():
            print(f"{m} {t:.2f}")
        ''',
    editorial='<p><b>transform:</b> <code>groupby(...)["satis"].transform("mean")</code> her satıra kendi grubunun ortalamasını <i>aynı uzunlukta</i> bir Series olarak döndürür; '
              'bu yüzden <code>fillna</code>\'ya doğrudan verilebilir. <code>agg("mean")</code> ise grup başına tek satır döndürür ve hizalama gerektirir.</p>'
              '<p><b>İki aşamalı doldurma:</b> Tamamen boş grubun ortalaması da NaN\'dır; ikinci <code>fillna(0)</code> bu durumu kapatır.</p>'
              '<p><b>Dikkat:</b> <code>mean()</code> NaN\'ları atlar — ortalama yalnız dolu değerlerden hesaplanır, istenen de budur. '
              'Gerçek işte doldurulmuş değerleri bir bayrak sütunuyla (<code>doldu = df["satis"].isna()</code>) işaretlemek denetlenebilirlik sağlar.</p>',
    hints=['<code>df.groupby("urun_grubu")["satis"].transform("mean")</code>', 'Önce grup ortalamasıyla, sonra 0 ile <code>fillna</code>.',
           'Mağazaya göre <code>sum()</code>, <code>sort_index()</code>.'],
))

# ---------------------------------------------------------------- a-227
P.append(dict(
    id='a-227', title='Kanal bazında yıllık büyüme', track=T, diff='Orta', needs=NP,
    tags=['pandas', 'pct_change', 'groupby', 'yıllık büyüme'], src='YoY growth hesaplama (Power BI SAMEPERIODLASTYEAR karşılığı)',
    fn='yillik_buyume', ds='kesit_bi',
    statement='<p>Kesit BI\'ın <code>Satislar</code> tablosunda her satırın <code>Tarih</code>, <code>Kanal</code> (Web, Mobil, Mağaza), <code>Durum</code> ve <code>Tutar</code> değeri var. '
              'Yönetim, kanalların yıldan yıla büyümesini görmek istiyor (Power BI\'daki "geçen yıla göre %" ölçüsünün pandas karşılığı).</p>'
              '<p><code>yillik_buyume(kanal)</code>: <code>Durum == "İptal"</code> satırlarını at; verilen kanalın yıllık <code>Tutar</code> toplamını bul ve bir önceki yıla göre yüzde değişimi '
              '<code>{yil: yuzde}</code> olarak döndür (1 ondalık). İlk yılın önceki yılı olmadığı için sözlükte yer almaz.</p>',
    input='<p><code>kanal</code>: <code>"Web"</code>, <code>"Mobil"</code> ya da <code>"Mağaza"</code>.</p>',
    output='<p><code>dict</code>: yıl (int) → yüzde (float).</p>',
    constraints='Satislar 1620 satır (2022-06 … 2024-12)',
    samples=[('yillik_buyume(\'Web\')', 'Web kanalının 2023 ve 2024 büyümesi.')],
    calls=['yillik_buyume(\'Mobil\')', 'yillik_buyume(\'Mağaza\')'],
    start='''
        import veri
        import pandas as pd

        def yillik_buyume(kanal):
            df = veri.oku("kesit_bi", "Satislar", parse_dates=["Tarih"])
            # kodunu yaz
            pass
        ''',
    sol='''
        import veri
        import pandas as pd

        def yillik_buyume(kanal):
            df = veri.oku("kesit_bi", "Satislar", parse_dates=["Tarih"])
            df = df[(df["Durum"] != "İptal") & (df["Kanal"] == kanal)]
            yillik = df.groupby(df["Tarih"].dt.year)["Tutar"].sum()
            degisim = (yillik.pct_change() * 100).dropna().round(1)
            return {int(y): float(v) for y, v in degisim.items()}
        ''',
    editorial='<p><b>pct_change:</b> <code>(bu - önceki) / önceki</code> değerini sıralı seride tek adımda hesaplar; ilk eleman NaN olur, <code>dropna()</code> ile atılır.</p>'
              '<p><b>Dikkat — kısmi yıl:</b> Veri 2022 Haziran\'da başlıyor; 2022 yalnız 7 aylık olduğu için 2023 büyümesi abartılı görünür. '
              'Doğru kıyas için ya aynı ayları karşılaştır (YTD) ya da tam yılları kullan. Rakamı sunmadan önce dönemin tam olup olmadığını denetle.</p>'
              '<p><b>Eksik yıl:</b> Bir kanalın bir yılı hiç yoksa <code>pct_change</code> yanlış iki yılı karşılaştırır; <code>reindex(range(ilk, son+1))</code> ile boşluğu görünür kılabilirsin.</p>',
    hints=['<code>groupby(df["Tarih"].dt.year)["Tutar"].sum()</code>', '<code>.pct_change() * 100</code>', 'İlk yılın NaN\'ını <code>dropna()</code> ile at.'],
))

# ---------------------------------------------------------------- a-228
P.append(dict(
    id='a-228', title='RFM ile şampiyon müşteriler', track=T, diff='Zor', needs=NP,
    tags=['pandas', 'RFM', 'qcut', 'rank', 'segmentasyon'], src='RFM segmentasyonu (pazarlama analitiği klasik vakası)',
    fn='rfm_sampiyonlar', ds='anadolu_market',
    statement='<p>CRM ekibi RFM (Recency, Frequency, Monetary) skorlamasıyla "şampiyon" müşterileri bulmak istiyor. Yalnız <code>status == "delivered"</code> siparişleri kullan.</p>'
              '<ul><li>Referans tarih = teslim edilmiş siparişlerdeki en son <code>order_date</code> + 1 gün.</li>'
              '<li><b>R</b> = referans − müşterinin son sipariş tarihi (gün). <b>F</b> = farklı sipariş sayısı. <b>M</b> = <code>quantity*unit_price*(1-discount)</code> toplamı.</li>'
              '<li>Müşterileri <code>customer_id</code>\'ye göre sıralı tut. Her metrik için <code>rank(method="first")</code> ile sıra numarası ver ve <code>pd.qcut(sıra, 4, labels=[1, 2, 3, 4])</code> ile 1–4 skoru üret. '
              '<b>R için ters:</b> küçük R iyi olduğundan R\'nin etiketleri <code>[4, 3, 2, 1]</code>.</li>'
              '<li><b>Şampiyon</b>: R skoru 4 <b>ve</b> F skoru 4 <b>ve</b> M skoru ≥ <code>m_esik</code>.</li></ul>'
              '<p><code>rfm_sampiyonlar(m_esik=3)</code>: <code>(şampiyon_sayısı, M\'si en yüksek 3 şampiyonun customer_id listesi)</code> döndür.</p>',
    input='<p><code>m_esik</code>: 1–4.</p>',
    output='<p><code>tuple</code>: <code>(int, list[int])</code></p>',
    constraints='orders 910, order_items 1620 satır',
    samples=[('rfm_sampiyonlar()', 'R=4, F=4, M≥3 olan müşteriler.')],
    calls=['rfm_sampiyonlar(4)', 'rfm_sampiyonlar(1)[0]'],
    start='''
        import veri
        import pandas as pd

        def rfm_sampiyonlar(m_esik=3):
            siparis = veri.oku("anadolu_market", "orders", parse_dates=["order_date"])
            kalem = veri.oku("anadolu_market", "order_items")
            # kodunu yaz
            pass
        ''',
    sol='''
        import veri
        import pandas as pd

        def rfm_sampiyonlar(m_esik=3):
            siparis = veri.oku("anadolu_market", "orders", parse_dates=["order_date"])
            kalem = veri.oku("anadolu_market", "order_items")
            s = siparis[siparis["status"] == "delivered"]
            df = s.merge(kalem, on="order_id")
            df["tutar"] = df["quantity"] * df["unit_price"] * (1 - df["discount"])
            ref = s["order_date"].max() + pd.Timedelta(days=1)
            rfm = df.groupby("customer_id").agg(son=("order_date", "max"), F=("order_id", "nunique"), M=("tutar", "sum")).sort_index()
            rfm["R"] = (ref - rfm["son"]).dt.days
            rfm["r"] = pd.qcut(rfm["R"].rank(method="first"), 4, labels=[4, 3, 2, 1]).astype(int)
            rfm["f"] = pd.qcut(rfm["F"].rank(method="first"), 4, labels=[1, 2, 3, 4]).astype(int)
            rfm["m"] = pd.qcut(rfm["M"].rank(method="first"), 4, labels=[1, 2, 3, 4]).astype(int)
            samp = rfm[(rfm["r"] == 4) & (rfm["f"] == 4) & (rfm["m"] >= m_esik)]
            return (len(samp), [int(i) for i in samp.sort_values("M", ascending=False).index[:3]])
        ''',
    editorial='<p><b>Neden <code>rank(method="first")</code>?</b> F gibi az sayıda farklı değeri olan metriklerde <code>pd.qcut(F, 4)</code> kenarlar çakıştığı için '
              '<code>ValueError: Bin edges must be unique</code> verir. Önce benzersiz sıra numarası üretmek bu sorunu çözer; eşit değerler dosyadaki sıraya göre ayrılır '
              '(bu yüzden <code>customer_id</code> sırası şart koşuldu).</p>'
              '<p><b>Named aggregation:</b> <code>agg(son=("order_date", "max"), F=("order_id", "nunique"), M=("tutar", "sum"))</code> çıktı sütunlarını adlandırarak tek adımda üretir.</p>'
              '<p><b>F için nunique:</b> merge sonrası her sipariş, kalem sayısı kadar satıra çoğalır; <code>count</code> kalem sayar, <code>nunique</code> sipariş sayar.</p>'
              '<p><b>İş yorumu:</b> Şampiyonlar sadakat programına, "R düşük, F yüksek" olanlar (eski sadıklar) geri kazanım kampanyasına yönlendirilir.</p>',
    hints=['merge sonrası F için <code>("order_id", "nunique")</code>.', 'Skor: <code>pd.qcut(seri.rank(method="first"), 4, labels=[1, 2, 3, 4])</code>',
           'R için etiketleri ters çevir: <code>[4, 3, 2, 1]</code>.'],
))

# ---------------------------------------------------------------- a-229
P.append(dict(
    id='a-229', title='Sıcaklık ve yolculuk süresi', track=T, diff='Zor', needs=NP,
    tags=['pandas', 'merge_asof', 'cut', 'zaman eşleme'], src='pandas merge_asof ile zaman serisi birleştirme',
    fn='sicaklik_suresi', ds='pedal_izmir',
    statement='<p>Pedal İzmir, sıcak saatlerde yolculukların kısalıp kısalmadığını merak ediyor. Her yolculuğa, başladığı andan <b>önceki en yakın</b> hava gözlemini '
              '(<code>bk_weather.obs_hour</code>, saatlik) eşle; bunun için <code>pd.merge_asof</code> kullan.</p>'
              '<p><code>sicaklik_suresi()</code>: kapanmış yolculuklar (<code>ended_at</code> dolu) için süreyi dakika olarak hesapla; sıcaklığı '
              '<code>pd.cut(temp_c, [-inf, 25, 30, 35, inf], right=False, labels=["&lt;25", "25-30", "30-35", "35+"])</code> ile kovalara ayır. '
              'Her kova için <code>(yolculuk_sayısı, ortalama_süre)</code> döndür (ortalama 1 ondalık).</p>',
    input='<p>Parametre yok.</p>',
    output='<p><code>dict</code>: kova etiketi → <code>(int, float)</code>.</p>',
    constraints='bk_trips 116 517, bk_weather 2208 satır',
    samples=[('sicaklik_suresi()[\'35+\']', '35 °C ve üstündeki saatlerde başlayan yolculuklar.')],
    calls=['sicaklik_suresi()'],
    start='''
        import veri
        import numpy as np
        import pandas as pd

        def sicaklik_suresi():
            yolculuk = veri.oku("pedal_izmir", "bk_trips", parse_dates=["started_at", "ended_at"])
            hava = veri.oku("pedal_izmir", "bk_weather", parse_dates=["obs_hour"])
            # kodunu yaz
            pass
        ''',
    sol='''
        import veri
        import numpy as np
        import pandas as pd

        def sicaklik_suresi():
            yolculuk = veri.oku("pedal_izmir", "bk_trips", parse_dates=["started_at", "ended_at"])
            hava = veri.oku("pedal_izmir", "bk_weather", parse_dates=["obs_hour"])
            y = yolculuk.dropna(subset=["ended_at"]).sort_values("started_at")
            y["sure"] = (y["ended_at"] - y["started_at"]).dt.total_seconds() / 60
            df = pd.merge_asof(y, hava.sort_values("obs_hour"), left_on="started_at", right_on="obs_hour", direction="backward")
            df["kova"] = pd.cut(df["temp_c"], [-np.inf, 25, 30, 35, np.inf], right=False, labels=["<25", "25-30", "30-35", "35+"])
            ozet = df.groupby("kova", observed=True)["sure"].agg(["count", "mean"])
            return {str(k): (int(r["count"]), round(float(r["mean"]), 1)) for k, r in ozet.iterrows()}
        ''',
    editorial='<p><b>merge_asof:</b> Tam eşleşme yerine "en yakın önceki" anahtarla birleştirir — sensör, fiyat ve hava verilerinde vazgeçilmezdir. '
              '<b>Şart:</b> iki tablo da anahtara göre <i>sıralı</i> olmalı, yoksa <code>ValueError: left keys must be sorted</code> alırsın.</p>'
              '<p><b>Alternatif:</b> Saatlik gözlemde <code>started_at.dt.floor("h")</code> ile tam eşleşme (<code>merge</code>) da çalışır; ama gözlemler düzensiz aralıklıysa yalnız asof doğru sonuç verir.</p>'
              '<p><b>pd.cut ve kategoriler:</b> <code>right=False</code> aralıkları <code>[25, 30)</code> yapar. Kategorik sütunla gruplarken <code>observed=True</code> vermek, '
              'pandas sürümleri arasındaki varsayılan farkından (ve uyarıdan) korur.</p>'
              '<p><b>Yorum tuzağı:</b> Sıcak saatler öğleden sonraya denk gelir; fark sıcaklıktan değil günün saatinden kaynaklanıyor olabilir.</p>',
    hints=['İki tabloyu da zamana göre sırala, sonra <code>pd.merge_asof(..., left_on="started_at", right_on="obs_hour")</code>.',
           'Süre: <code>(ended_at - started_at).dt.total_seconds() / 60</code>', '<code>groupby("kova", observed=True)["sure"].agg(["count", "mean"])</code>'],
))

# ---------------------------------------------------------------- a-230
P.append(dict(
    id='a-230', title='Kohort tutma matrisi', track=T, diff='Zor', needs=NP,
    tags=['pandas', 'kohort', 'pivot_table', 'Period'], src='Retention cohort matrix (growth analytics)',
    fn='kohort_matrisi', ds='lezzet_kurye',
    statement='<p>Lezzet Kurye büyüme ekibi klasik kohort tutma matrisini istiyor. Yalnız <code>status == "teslim"</code> siparişleri kullan.</p>'
              '<ul><li><b>Kohort</b>: müşterinin ilk teslim edilmiş siparişinin ayı (<code>placed_at</code>).</li>'
              '<li><b>Ay farkı</b>: siparişin ayı − kohort ayı (0, 1, 2, …).</li>'
              '<li>Her (kohort, ay farkı) hücresi: o ay farkında <b>en az bir</b> siparişi olan <b>farklı</b> müşteri sayısının, kohort büyüklüğüne (ay farkı 0) oranı, yüzde, 1 ondalık.</li></ul>'
              '<p><code>kohort_matrisi()</code>: indeksi kohort (<code>"YYYY-MM"</code> metni), sütunları ay farkı (<code>int</code>) olan bir DataFrame döndür. '
              'Olmayan hücreler <code>NaN</code> kalsın (gelecekteki aylar).</p>',
    input='<p>Parametre yok.</p>',
    output='<p><code>pd.DataFrame</code>; <code>0</code> sütunu her satırda 100.0.</p>',
    constraints='lk_orders 7178 satır (2024-10 … 2025-01)',
    samples=[('kohort_matrisi().loc[\'2024-10\'].tolist()', 'Ekim kohortunun sonraki aylarda dönme oranları.')],
    calls=['kohort_matrisi().shape', 'list(kohort_matrisi().index)', 'kohort_matrisi()[0].tolist()', 'kohort_matrisi().loc[\'2024-11\', 1]',
           'int(kohort_matrisi().isna().sum().sum())'],
    start='''
        import veri
        import pandas as pd

        def kohort_matrisi():
            df = veri.oku("lezzet_kurye", "lk_orders", parse_dates=["placed_at"])
            # kodunu yaz
            pass
        ''',
    sol='''
        import veri
        import pandas as pd

        def kohort_matrisi():
            df = veri.oku("lezzet_kurye", "lk_orders", parse_dates=["placed_at"])
            df = df[df["status"] == "teslim"].copy()
            df["ay"] = df["placed_at"].dt.to_period("M")
            df["kohort"] = df.groupby("customer_id")["ay"].transform("min")
            df["fark"] = (df["ay"].dt.year - df["kohort"].dt.year) * 12 + (df["ay"].dt.month - df["kohort"].dt.month)
            sayim = df.pivot_table(index="kohort", columns="fark", values="customer_id", aggfunc="nunique")
            oran = sayim.div(sayim[0], axis=0).mul(100).round(1)
            oran.index = oran.index.astype(str)
            oran.columns = [int(c) for c in oran.columns]
            return oran
        ''',
    editorial='<p><b>Adımlar:</b> 1) <code>to_period("M")</code> ile ay; 2) <code>groupby("customer_id")["ay"].transform("min")</code> ile her satıra kohortu yay; '
              '3) ay farkını yıl×12 + ay ile hesapla; 4) <code>pivot_table(..., aggfunc="nunique")</code> ile farklı müşteri say; 5) <code>div(sayim[0], axis=0)</code> ile her satırı kendi kohort büyüklüğüne böl.</p>'
              '<p><b>Neden nunique?</b> Bir müşteri aynı ay 5 sipariş verebilir; tutma oranı <i>müşteri</i> sayar, sipariş değil.</p>'
              '<p><b>axis=0:</b> <code>div</code> varsayılan olarak sütun etiketleriyle hizalar; satır bazında bölmek için <code>axis=0</code> şart. Unutursan sonuç tamamen NaN olur.</p>'
              '<p><b>Okuma:</b> Matrisin köşegen altı boştur çünkü yeni kohortların henüz geleceği yoktur; aynı sütunda yukarıdan aşağı okumak, ürün değişikliklerinin tutmaya etkisini gösterir.</p>',
    hints=['<code>transform("min")</code> her satıra müşterinin ilk ayını yazar.', 'Ay farkı: <code>(yil2 - yil1) * 12 + (ay2 - ay1)</code>',
           '<code>pivot_table(index="kohort", columns="fark", values="customer_id", aggfunc="nunique")</code>, sonra <code>div(tablo[0], axis=0)</code>.'],
))

if __name__ == '__main__':
    main(P, '/home/claude/py/v3/a4/arena_03.js')
