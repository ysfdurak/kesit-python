from lib import C, write

T = []

T.append(dict(
    id='b-261', topic='collections/itertools', diff=2, kind='rehberli',
    title='OrderedDict ile LRU önbellek',
    q='<p>Ürün detay sayfaları için sınırlı kapasiteli bir önbellek gerekiyor: dolduğunda <b>en uzun süredir kullanılmayan</b> (Least Recently Used) kayıt atılmalı. <code>LRU(kapasite)</code> sınıfını <code>collections.OrderedDict</code> ile yaz: <code>al(anahtar)</code> kayıt varsa değeri döndürsün ve kaydı "en yeni" yapsın, yoksa <code>None</code>; <code>koy(anahtar, deger)</code> ekleyip/güncelleyip "en yeni" yapsın, kapasite aşılırsa en eskiyi atsın.</p>',
    guide=['<code>__init__</code>\'te <code>self.veri = OrderedDict()</code> ve kapasiteyi sakla.',
           '<code>al</code>: anahtar yoksa <code>None</code>; varsa <code>move_to_end(anahtar)</code> ile sona taşı ve değeri döndür.',
           '<code>koy</code>: değeri ata, <code>move_to_end</code> ile sona taşı.',
           'Uzunluk kapasiteyi aşarsa <code>popitem(last=False)</code> ile en baştakini (en eski) at.'],
    example=C(r'''
        from collections import OrderedDict
        od = OrderedDict(a=1, b=2, c=3)
        od.move_to_end("a")          # a en sona gider
        print(list(od))              # ['b', 'c', 'a']
        print(od.popitem(last=False))  # ('b', 2) baştan çıkar
    '''),
    start=C(r'''
        from collections import OrderedDict

        class LRU:
            def __init__(self, kapasite):
                self.kapasite = kapasite
                self.veri = OrderedDict()

            def al(self, anahtar):
                # TODO 1: yoksa None, varsa sona taşı ve döndür
                return self.veri.get(anahtar)

            def koy(self, anahtar, deger):
                # TODO 2: ata ve sona taşı
                # TODO 3: kapasite aşıldıysa en eskiyi at
                self.veri[anahtar] = deger
    '''),
    sol=C(r'''
        from collections import OrderedDict

        class LRU:
            def __init__(self, kapasite):
                self.kapasite = kapasite
                self.veri = OrderedDict()

            def al(self, anahtar):
                if anahtar not in self.veri:
                    return None
                self.veri.move_to_end(anahtar)
                return self.veri[anahtar]

            def koy(self, anahtar, deger):
                self.veri[anahtar] = deger
                self.veri.move_to_end(anahtar)
                if len(self.veri) > self.kapasite:
                    self.veri.popitem(last=False)
    '''),
    tests=C(r'''
        c = LRU(2)
        c.koy("p1", "Kalem"); c.koy("p2", "Defter")
        assert c.al("p1") == "Kalem", "p1 önbellekte olmalı"
        c.koy("p3", "Silgi")
        assert c.al("p2") is None, "p1 yeni kullanıldığı için en eski p2'ydi; p3 eklenince p2 atılmalı"
        assert c.al("p1") == "Kalem" and c.al("p3") == "Silgi", "p1 ve p3 kalmalı"
        c.koy("p1", "Kalem v2"); c.koy("p4", "Cetvel")
        assert c.al("p3") is None, "güncellenen p1 en yeni olur; p4 eklenince p3 atılmalı"
        assert len(c.veri) == 2, "kapasite asla aşılmamalı"
    '''),
    hints=['"Kullanmak" = sona taşımak; en eski kayıt her zaman en baştadır.',
           '<code>self.veri.move_to_end(anahtar)</code> ve <code>self.veri.popitem(last=False)</code>.',
           'koy\'un sonu: <code>if len(self.veri) &gt; self.kapasite: self.veri.popitem(last=False)</code>'],
    why='<code>OrderedDict</code>, <code>move_to_end</code> ve <code>popitem(last=False)</code> işlemlerini O(1)\'de yapar; bu ikisi LRU\'nun tam ihtiyacıdır. Normal <code>dict</code> de ekleme sırasını korur ama "sona taşı" için silip yeniden eklemek gerekir. Fonksiyon sonuçları için hazır çözüm <code>functools.lru_cache(maxsize=...)</code>\'dir; kendi LRU\'nu ise anahtarı ve atılma politikasını kontrol etmen gerektiğinde (ör. kullanıcı oturumları) yazarsın.',
    tags=['OrderedDict', 'LRU', 'önbellek'], min=8))

T.append(dict(
    id='b-262', topic='collections/itertools', diff=1, kind='yaz',
    title='Katmanlı uygulama ayarları',
    q='<p>Uygulama ayarları üç katmandan gelir; öncelik sırası: <b>ortam değişkenleri &gt; ayar dosyası &gt; varsayılanlar</b>. <code>ayarlari_birlestir(varsayilan, dosya, ortam)</code> fonksiyonunu <code>collections.ChainMap</code> ile yaz ve ChainMap nesnesini döndür. Sözlüklerin hiçbiri kopyalanmasın; ayrıca ChainMap\'e yapılan yazma yalnızca <b>ortam</b> katmanını etkilesin.</p>',
    start=C(r'''
        from collections import ChainMap

        def ayarlari_birlestir(varsayilan, dosya, ortam):
            # buraya yaz
            pass
    '''),
    sol=C(r'''
        from collections import ChainMap

        def ayarlari_birlestir(varsayilan, dosya, ortam):
            return ChainMap(ortam, dosya, varsayilan)
    '''),
    tests=C(r'''
        v = {"port": 8000, "debug": False, "dil": "tr"}
        d = {"port": 9000}
        o = {"debug": True}
        a = ayarlari_birlestir(v, d, o)
        assert a["port"] == 9000, "port dosyadan gelmeli (ortamda yok)"
        assert a["debug"] is True, "debug ortamdan gelmeli (en yüksek öncelik)"
        assert a["dil"] == "tr", "dil varsayılandan gelmeli"
        d["port"] = 9100
        assert a["port"] == 9100, "ChainMap kopyalamaz; alttaki sözlük değişince sonuç da değişir"
        a["dil"] = "en"
        assert o["dil"] == "en" and v["dil"] == "tr", "yazma yalnızca ilk haritaya (ortam) gitmeli"
    '''),
    hints=['<code>ChainMap(a, b, c)</code> bir anahtarı önce a\'da, sonra b\'de, sonra c\'de arar.',
           'En öncelikli katman ilk argüman olmalı: <code>ChainMap(ortam, dosya, varsayilan)</code>.'],
    why='<code>ChainMap</code> sözlükleri birleştirmeden, sırayla arayan tek bir görünüm sunar; kopya olmadığı için alttaki katman güncellenince anında yansır ve yazmalar yalnızca ilk haritaya gider (varsayılanlar korunur). Alternatif <code>{**varsayilan, **dosya, **ortam}</code> tek seferlik bir kopya üretir: daha basit ama sonradan yapılan değişiklikleri görmez. CLI araçlarında "komut satırı &gt; ortam &gt; dosya &gt; varsayılan" zinciri tam olarak böyle kurulur.',
    tags=['ChainMap', 'ayar', 'öncelik'], min=4))

T.append(dict(
    id='b-263', topic='collections/itertools', diff=3, kind='yaz',
    title='Müşterinin en uzun ardışık alışveriş serisi',
    q='<p>Sadakat programı, müşterinin <b>art arda</b> kaç gün alışveriş yaptığını ödüllendiriyor. <code>en_uzun_seri(tarihler)</code> fonksiyonunu yaz: ISO tarih metinleri listesi alır (sırasız olabilir, aynı gün birden fazla kez geçebilir) ve ardışık günlerden oluşan en uzun serinin uzunluğunu döndürür. Boş listede 0. <code>itertools.groupby</code> ile "tarih sıra numarası eksi indeks" hilesini kullanmayı dene.</p>',
    start=C(r'''
        from datetime import date
        from itertools import groupby

        def en_uzun_seri(tarihler):
            # buraya yaz
            pass
    '''),
    sol=C(r'''
        from datetime import date
        from itertools import groupby

        def en_uzun_seri(tarihler):
            gunler = sorted({date.fromisoformat(t).toordinal() for t in tarihler})
            en_uzun = 0
            for _, grup in groupby(enumerate(gunler), key=lambda ig: ig[1] - ig[0]):
                en_uzun = max(en_uzun, sum(1 for _ in grup))
            return en_uzun
    '''),
    tests=C(r'''
        t = ["2026-03-05", "2026-03-01", "2026-03-02", "2026-03-02", "2026-03-03", "2026-03-06", "2026-03-10"]
        assert en_uzun_seri(t) == 3, "1-2-3 Mart serisi 3 gün; 5-6 Mart 2 gün; tekrar eden 2 Mart bir kez sayılmalı"
        assert en_uzun_seri(["2026-02-27", "2026-02-28", "2026-03-01"]) == 3, "ay geçişi de ardışık sayılmalı (2026 artık yıl değil)"
        assert en_uzun_seri(["2026-01-01"]) == 1, "tek gün 1"
        assert en_uzun_seri([]) == 0, "boş liste 0"
    '''),
    hints=['Önce tekrarları at ve sırala; tarihleri <code>toordinal()</code> ile tamsayıya çevirmek farkı kolaylaştırır.',
           'Ardışık sayılarda <code>sayi - indeks</code> sabittir: [10, 11, 12, 15] → indeks çıkarınca [10, 10, 10, 12].',
           '<code>groupby(enumerate(gunler), key=lambda ig: ig[1] - ig[0])</code> her seriyi bir grup yapar.'],
    why='Sıralı ve tekilleştirilmiş ardışık tamsayılarda değer ile indeks arasındaki fark sabit kalır; <code>groupby</code> bu farkı anahtar alarak her kesintisiz seriyi ayrı grup yapar. Tarihi <code>toordinal()</code> ile sayıya çevirmek ay/yıl geçişlerini otomatik halleder. Alternatif: sıralı listede bir sayaçla dolaşıp fark 1 ise artır, değilse sıfırla; daha açık ama aynı O(n log n) karmaşıklıkta. Küme tabanlı O(n) çözüm de vardır: yalnızca önceki günü olmayan günlerden başlayıp ileri saymak.',
    tags=['groupby', 'enumerate', 'ardışık seri', 'toordinal'], min=10))

# ---------------- Tarih-Saat ----------------
T.append(dict(
    id='b-264', topic='Tarih-Saat', diff=2, t='predict',
    title='timedelta\'nın gün ve saniye alanları',
    q='<p>Kargo takip sisteminde çıkış ve teslim anı arasındaki süre hesaplanıyor. Bu kod ne yazdırır?</p>',
    code=C(r'''
        from datetime import datetime

        cikis = datetime(2026, 3, 1, 22, 30)
        teslim = datetime(2026, 3, 3, 8, 15)
        fark = teslim - cikis
        print(fark, fark.days, fark.seconds // 3600)
    '''),
    o=['1 day, 9:45:00 1 33', '2 days, 9:45:00 2 9', '1 day, 9:45:00 1 9', '33:45:00 1 9'],
    a=2,
    hints=['<code>timedelta</code> içeride yalnızca gün, saniye ve mikrosaniye tutar.', '<code>.seconds</code> toplam saniye değil, gün dışında kalan kısımdır.'],
    why='Fark 33 saat 45 dakikadır; <code>timedelta</code> bunu 1 gün + 9:45:00 olarak saklar. <code>.days</code> 1, <code>.seconds</code> yalnızca gün dışında kalan 35100 saniyedir (9 saat). Toplam saati isteseydin <code>fark.total_seconds() / 3600</code> (33.75) kullanmalıydın. Bu ayrım SLA ve mesai hesaplarında sık yapılan bir hatadır.',
    tags=['timedelta', 'total_seconds'], min=2))

T.append(dict(
    id='b-265', topic='Tarih-Saat', diff=2, kind='rehberli',
    title='Taksit tarihi: ay ekleme',
    q='<p>Anadolu Bank kredi taksitleri her ay aynı günde ödenir; ama 31 Ocak\'tan bir ay sonrası 31 Şubat olamaz, o ayın <b>son gününe</b> çekilmelidir. <code>ay_ekle(tarih, n)</code> fonksiyonunu yaz: ISO metni alıp <code>n</code> ay sonrasını ISO metni olarak döndürsün (<code>n</code> 12\'den büyük olabilir). <code>calendar.monthrange</code> kullan. <code>timedelta</code> ay desteklemez!</p>',
    guide=['Tarihi <code>date.fromisoformat</code> ile ayrıştır.',
           'Toplam ay sayısını hesapla: <code>toplam = d.year * 12 + (d.month - 1) + n</code>; yıl = <code>toplam // 12</code>, ay = <code>toplam % 12 + 1</code>.',
           '<code>calendar.monthrange(yil, ay)[1]</code> o ayın gün sayısını verir.',
           'Gün = <code>min(d.day, ayin_son_gunu)</code>; yeni tarihi oluşturup <code>isoformat()</code> döndür.'],
    example=C(r'''
        import calendar
        # monthrange: (ayın ilk gününün haftanın günü, ayın gün sayısı)
        print(calendar.monthrange(2024, 2))   # (3, 29)  artık yıl
        print(calendar.monthrange(2026, 2))   # (6, 28)
        # yıl/ay taşmasını tek sayıyla çözmek
        toplam = 2026 * 12 + (11 - 1) + 3     # Kasım + 3 ay
        print(toplam // 12, toplam % 12 + 1)  # 2027 2
    '''),
    start=C(r'''
        import calendar
        from datetime import date

        def ay_ekle(tarih, n):
            d = date.fromisoformat(tarih)
            # TODO 1: yeni yıl ve ayı hesapla
            # TODO 2: ayın son gününü bul
            # TODO 3: günü sınırla, yeni tarihi döndür
            return d.isoformat()
    '''),
    sol=C(r'''
        import calendar
        from datetime import date

        def ay_ekle(tarih, n):
            d = date.fromisoformat(tarih)
            toplam = d.year * 12 + (d.month - 1) + n
            yil, ay = toplam // 12, toplam % 12 + 1
            son_gun = calendar.monthrange(yil, ay)[1]
            return date(yil, ay, min(d.day, son_gun)).isoformat()
    '''),
    tests=C(r'''
        assert ay_ekle("2026-01-31", 1) == "2026-02-28", "31 Ocak + 1 ay: Şubat'ın son günü (28)"
        assert ay_ekle("2028-01-31", 1) == "2028-02-29", "2028 artık yıl: 29 Şubat"
        assert ay_ekle("2026-11-15", 3) == "2027-02-15", "yıl taşması: Kasım + 3 = Şubat (ertesi yıl)"
        assert ay_ekle("2026-03-31", 13) == "2027-04-30", "13 ay sonrası Nisan; Nisan 30 gün"
        assert ay_ekle("2026-05-10", 0) == "2026-05-10", "0 ay: aynı tarih"
    '''),
    hints=['Yıl-ay ikilisini tek bir "ay sayacı"na çevirmek taşmayı kolaylaştırır.',
           'Gün sayısı: <code>calendar.monthrange(yil, ay)[1]</code>.',
           '<code>return date(yil, ay, min(d.day, son_gun)).isoformat()</code>'],
    why='Aylar farklı uzunlukta olduğu için "ay ekleme" sabit bir gün sayısı değildir; <code>timedelta(days=30)</code> taksit günlerini kaydırır. Yıl ve ayı tek sayıya çevirip <code>//</code> ve <code>%</code> ile geri açmak taşmayı (Aralık + 1) tek satırda çözer, günü ayın son gününe sınırlamak 31 Ocak sorununu giderir. Kendi bilgisayarında <code>python-dateutil</code> paketinin <code>relativedelta(months=n)</code> aracı aynı kuralı hazır uygular.',
    tags=['calendar', 'monthrange', 'ay ekleme'], min=8))

T.append(dict(
    id='b-266', topic='Tarih-Saat', diff=2, kind='yaz',
    title='UTC log zamanını Türkiye saatine çevir',
    q='<p>Sunucu log\'ları UTC zaman damgası tutuyor: <code>"2026-03-15T21:30:00+00:00"</code>. Müşteri hizmetleri ekranında Türkiye saati (UTC+3, yaz saati yok) gösterilecek. <code>tr_saati(iso)</code> fonksiyonunu yaz: zaman damgasını ayrıştırıp UTC+3\'e çevirsin ve <code>"16.03.2026 00:30"</code> biçiminde döndürsün. Saat dilimi için <code>datetime.timezone(timedelta(hours=3))</code> kullan. Girdide saat dilimi bilgisi yoksa (naive) UTC kabul et.</p>',
    start=C(r'''
        from datetime import datetime, timedelta, timezone

        def tr_saati(iso):
            # buraya yaz
            pass
    '''),
    sol=C(r'''
        from datetime import datetime, timedelta, timezone

        TR = timezone(timedelta(hours=3))

        def tr_saati(iso):
            an = datetime.fromisoformat(iso)
            if an.tzinfo is None:
                an = an.replace(tzinfo=timezone.utc)
            return an.astimezone(TR).strftime("%d.%m.%Y %H:%M")
    '''),
    tests=C(r'''
        assert tr_saati("2026-03-15T21:30:00+00:00") == "16.03.2026 00:30", "UTC 21:30 → TR ertesi gün 00:30"
        assert tr_saati("2026-03-15T10:05:00") == "15.03.2026 13:05", "saat dilimsiz zaman UTC kabul edilmeli"
        assert tr_saati("2026-03-15T10:05:00+02:00") == "15.03.2026 11:05", "UTC+2 10:05 → UTC 08:05 → TR 11:05"
    '''),
    hints=['<code>datetime.fromisoformat</code> "+00:00" kısmını okuyup farkında (aware) bir nesne üretir.',
           'Naive nesneye dilim eklemek için <code>replace(tzinfo=timezone.utc)</code>; çevirmek için <code>astimezone(TR)</code>.',
           'Biçim: <code>"%d.%m.%Y %H:%M"</code>.'],
    why='<code>astimezone</code> aynı anı başka bir dilimde ifade eder; <code>replace(tzinfo=...)</code> ise anı değiştirmeden yalnızca etiket koyar. İkisini karıştırmak en sık yapılan saat dilimi hatasıdır. Kural: sistemde her şeyi UTC ve aware sakla, yalnızca kullanıcıya gösterirken yerel saate çevir. Yaz saati uygulayan bölgeler için sabit ofset yerine <code>zoneinfo.ZoneInfo("Europe/Istanbul")</code> kullanılmalı.',
    tags=['timezone', 'astimezone', 'UTC', 'strftime'], min=6))

T.append(dict(
    id='b-267', topic='Tarih-Saat', diff=2, kind='bug',
    title='Doğum gününde yanlış yaş',
    q='<p>Hatayı bul ve düzelt. İK sistemi <code>yas(dogum, bugun)</code> ile çalışanın tam yaşını hesaplıyor (ikisi de <code>date</code>). Gün sayısını 365\'e bölmek artık yıllar yüzünden doğum günü civarında yanlış sonuç veriyor. Takvime göre doğru hesapla: yıl farkından, bu yılın doğum günü henüz gelmediyse 1 çıkar.</p>',
    start=C(r'''
        from datetime import date

        def yas(dogum, bugun):
            return (bugun - dogum).days // 365
    '''),
    sol=C(r'''
        from datetime import date

        def yas(dogum, bugun):
            fark = bugun.year - dogum.year
            if (bugun.month, bugun.day) < (dogum.month, dogum.day):
                fark -= 1
            return fark
    '''),
    tests=C(r'''
        assert yas(date(1990, 3, 15), date(2026, 3, 15)) == 36, "doğum gününde yaş tam 36 olmalı (gün/365 artık yıllar yüzünden 36'yı kaçırır)"
        assert yas(date(1990, 3, 15), date(2026, 3, 14)) == 35, "doğum gününden bir gün önce 35"
        assert yas(date(2000, 12, 31), date(2026, 1, 1)) == 25, "yıl dönümü geçmemişse bir eksik"
        assert yas(date(2000, 2, 29), date(2026, 2, 28)) == 25, "29 Şubat doğumlu, 28 Şubat'ta henüz 26 olmamıştır"
    '''),
    hints=['Yaş bir takvim kavramıdır; gün sayısı değil yıl farkı ve doğum günü geçip geçmediği önemli.',
           '<code>(ay, gün)</code> demetlerini karşılaştırmak "bu yılın doğum günü geldi mi?" sorusunu tek satırda yanıtlar.'],
    why='36 yılda 9 artık gün birikir; <code>days // 365</code> doğum gününden birkaç gün <b>önce</b> yaşı artırır ya da 365.25 kullanılınca doğum gününde artırmaz. Doğru yöntem yıl farkını alıp bu yılki doğum günü gelmemişse 1 çıkarmaktır; demet karşılaştırması ay ve günü sırasıyla kıyaslar. Benzer takvim kuralları kıdem, sigorta ve emeklilik hesaplarında da geçerlidir; <code>dateutil.relativedelta(bugun, dogum).years</code> aynı sonucu verir.',
    tags=['date', 'yaş hesabı', 'artık yıl'], min=4))

T.append(dict(
    id='b-268', topic='Tarih-Saat', diff=1, kind='tamamla',
    title='Türkçe tarih biçimi',
    q='<p>Kargo e-postalarında tarih <code>"15 Mart 2026, Pazar"</code> biçiminde yazılmalı. Sunucunun dil ayarına (locale) güvenmemek için ay ve gün adları listelerde tutuluyor. <code>tr_tarih(d)</code> fonksiyonundaki iki boşluğu tamamla. Not: <code>d.month</code> 1-12 arasıdır, <code>d.weekday()</code> 0 = Pazartesi.</p>',
    start=C(r'''
        from datetime import date

        AYLAR = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
                 "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"]
        GUNLER = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"]

        def tr_tarih(d):
            return f"{d.day} {AYLAR[___]} {d.year}, {GUNLER[___]}"
    '''),
    sol=C(r'''
        from datetime import date

        AYLAR = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
                 "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"]
        GUNLER = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"]

        def tr_tarih(d):
            return f"{d.day} {AYLAR[d.month - 1]} {d.year}, {GUNLER[d.weekday()]}"
    '''),
    tests=C(r'''
        assert tr_tarih(date(2026, 3, 15)) == "15 Mart 2026, Pazar", f"15 Mart 2026 Pazar'dır, gelen: {tr_tarih(date(2026, 3, 15))}"
        assert tr_tarih(date(2026, 1, 1)) == "1 Ocak 2026, Perşembe", "Ocak listenin 0. elemanı: ay - 1"
        assert tr_tarih(date(2026, 12, 7)) == "7 Aralık 2026, Pazartesi", "Aralık ve Pazartesi uçlarını kontrol et"
    '''),
    hints=['Liste indeksleri 0\'dan başlar ama ay numarası 1\'den.', '<code>AYLAR[d.month - 1]</code>, <code>GUNLER[d.weekday()]</code>'],
    why='<code>strftime("%B %A")</code> ay/gün adlarını sistemin locale ayarına göre verir; sunucular çoğunlukla İngilizce çalıştığı için çıktı "March Sunday" olur ve <code>locale.setlocale</code> her ortamda bulunmayabilir. Adları sabit listelerde tutmak taşınabilirdir. <code>weekday()</code> 0=Pazartesi, <code>isoweekday()</code> 1=Pazartesi döndürür; listeyi buna göre indekslemek gerekir. Çok dilli projelerde ise <code>babel</code> kütüphanesi tercih edilir.',
    tags=['date', 'weekday', 'biçimleme'], min=3))

# ---------------- Regex ----------------
T.append(dict(
    id='b-269', topic='Regex', diff=2, t='predict',
    title='Gruplu findall ne döndürür?',
    q='<p>Sipariş notlarından ürün kodu ve adet çekilmeye çalışılıyor. Bu kod ne yazdırır?</p>',
    code=C(r'''
        import re

        metin = "SKU-102 x3, SKU-77 x10"
        print(re.findall(r"SKU-(\d+) x(\d+)", metin))
        print(re.findall(r"SKU-\d+", metin))
    '''),
    o=["['SKU-102 x3', 'SKU-77 x10']\n['SKU-102', 'SKU-77']",
       "[('102', '3'), ('77', '10')]\n['SKU-102', 'SKU-77']",
       "[('102', '3'), ('77', '10')]\n['102', '77']",
       "[(102, 3), (77, 10)]\n['SKU-102', 'SKU-77']"],
    a=1,
    hints=['Desende yakalama grupları (parantez) varsa <code>findall</code> tüm eşleşmeyi değil grupları döndürür.', 'Regex her zaman metin döndürür; sayıya çevirmez.'],
    why='<code>findall</code> desende grup yoksa eşleşen metinlerin listesini, tek grup varsa o grubun listesini, birden çok grup varsa her eşleşme için grupların <b>demetini</b> döndürür. Değerler her zaman <code>str</code>\'dir; <code>int()</code> ile çevirmen gerekir. Gruplu desende tüm eşleşmeyi de istiyorsan <code>finditer</code> ile <code>m.group(0)</code> kullan ya da gruplamayan parantez <code>(?:...)</code> yaz.',
    tags=['re.findall', 'gruplar'], min=2))

T.append(dict(
    id='b-270', topic='Regex', diff=2, t='order',
    title='Özel karakterli ön ekle ürün kodu yakala',
    q='<p>Ürün kodları <code>"SKU."</code> ön ekiyle yazılıyor. Ön ekteki nokta "herhangi bir karakter" sayılmamalı. Kodları ve adetleri sözlüğe çekip toplam adedi yazdıran programı sırala.</p>',
    lines=['import re',
           'ONEK = re.escape("SKU.")',
           'desen = re.compile(ONEK + r"(\\d+)\\s*x(\\d+)")',
           'adetler = {kod: int(adet) for kod, adet in desen.findall("SKU.102 x3, SKUX55 x9, SKU.77 x10")}',
           'print(adetler)',
           'print(sum(adetler.values()))'],
    expect="{'102': 3, '77': 10}\n13\n",
    hint='re modülü ilk kullanımdan önce içe aktarılmalı; desen ön ekten, sözlük desenden üretilir.',
    hints=['re modülü ilk kullanımdan önce içe aktarılmalı; desen ön ekten, sözlük desenden üretilir.'],
    why='<code>re.escape</code> metindeki özel karakterleri (<code>.</code>, <code>+</code>, <code>(</code> ...) kaçırır; böylece "SKUX55" yanlışlıkla eşleşmez. Kullanıcıdan ya da veriden gelen bir metni desene eklerken escape şarttır, yoksa hem yanlış eşleşme hem de bozuk desen hatası (<code>re.error</code>) alırsın. İki gruplu <code>findall</code> demet listesi döndürdüğü için dict comprehension\'da doğrudan açılabilir.',
    tags=['re.escape', 're.compile', 'findall'], min=3))

write('/home/claude/py/v2/b2/bank_orta_06.js', T, 'collections/itertools, Tarih-Saat, Regex (b-261…b-270)')
