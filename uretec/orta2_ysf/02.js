  {
    id: 'tarih-saat', lv: 'orta', mod: 'Standart Kütüphane', min: 30,
    title: 'Tarih ve saat: datetime, timedelta, biçimleme ve saat dilimi',
    sum: 'date/datetime/timedelta ile tarih aritmetiği yapar, strftime/strptime ile metne çevirir, zoneinfo ile saat dilimi ekler, ay sonu ve iş günü hesaplarını güvenle kurarsın.',
    goals: [
      'date, datetime ve timedelta nesnelerini oluşturup aralarında aritmetik yapabilirim.',
      'strftime ile Türkçe raporlara uygun biçim, strptime ile metinden tarih üretebilirim.',
      'ISO 8601 biçimini tanır, fromisoformat/isoformat ile dönüşüm yapabilirim.',
      'zoneinfo ile Europe/Istanbul gibi saat dilimlerini ve UTC dönüşümünü uygulayabilirim.',
      'Ay sonu, iş günü ve vade hesaplarını hatasız yazabilirim.'
    ],
    body: `
<h2>Neden önemli?</h2>
<p>Anadolu Bank'ta "vadesi 30 gün sonra dolan krediler", Anadolu Market'te "son 7 günün siparişleri", İK'da "deneme süresi biten çalışanlar"... Hemen her iş sorusunun içinde tarih var. Tarihler metin olarak gelir ("2026-03-15", "15.03.2026", "15 Mart 2026"), hesap yapmak için nesneye çevirmen, sonra tekrar insanın okuyacağı biçime döndürmen gerekir. Yanlış yapılan tarih hesabı sessiz hata üretir: program çökmez ama rapor yanlış çıkar. Bu ders o hataları en baştan engellemeyi öğretir.</p>

<h2>Üç temel tip</h2>
<div class="tbl-wrap"><table>
<tr><th>Tip</th><th>Ne tutar</th><th>Örnek</th></tr>
<tr><td>date</td><td>Yıl, ay, gün</td><td>date(2026, 3, 15)</td></tr>
<tr><td>datetime</td><td>Tarih + saat (+ isteğe bağlı saat dilimi)</td><td>datetime(2026, 3, 15, 14, 30)</td></tr>
<tr><td>timedelta</td><td>Süre (gün, saniye, mikrosaniye)</td><td>timedelta(days=30, hours=2)</td></tr>
<tr><td>time</td><td>Yalnızca saat</td><td>time(9, 0)</td></tr>
</table></div>
<pre class="py">from datetime import date, datetime, timedelta

basvuru = date(2026, 3, 15)
vade = basvuru + timedelta(days=30)
print("Başvuru:", basvuru, "| Vade:", vade)
print("Haftanın günü (0=Pzt):", vade.weekday(), "| ISO (1=Pzt):", vade.isoweekday())

fark = date(2026, 12, 31) - basvuru
print("Yıl sonuna kalan gün:", fark.days, "| tip:", type(fark).__name__)

t = datetime(2026, 3, 15, 14, 30)
print("2 saat 45 dk sonra:", t + timedelta(hours=2, minutes=45))
print("Parçalar:", t.year, t.month, t.day, t.hour, t.minute)
print("Yalnızca tarih:", t.date(), "| yalnızca saat:", t.time())
print("Replace ile ayın 1'i:", t.replace(day=1).date())</pre>
<div class="note"><b>timedelta neyi bilmez?</b>timedelta'da ay ve yıl yoktur; çünkü "1 ay" 28-31 gün arasında değişir. Ay eklemek için <code>replace()</code> ile yıl/ayı kendin hesaplarsın (aşağıda) ya da üçüncü parti <code>dateutil.relativedelta</code> kullanırsın.</div>

<h2>Metne çevirme: strftime ve strptime</h2>
<p><code>strftime</code> (string format time) nesneyi metne, <code>strptime</code> (string parse time) metni nesneye çevirir. İkisi de aynı biçim kodlarını kullanır. Ezberlemek yerine tabloya bak:</p>
<div class="tbl-wrap"><table>
<tr><th>Kod</th><th>Anlam</th><th>Örnek</th></tr>
<tr><td>%Y / %y</td><td>Yıl 4 / 2 hane</td><td>2026 / 26</td></tr>
<tr><td>%m / %d</td><td>Ay / gün (sıfır dolgulu)</td><td>03 / 05</td></tr>
<tr><td>%H / %M / %S</td><td>Saat / dakika / saniye</td><td>14 / 05 / 09</td></tr>
<tr><td>%B / %b</td><td>Ay adı uzun / kısa (dile bağlı)</td><td>March / Mar</td></tr>
<tr><td>%A / %a</td><td>Gün adı uzun / kısa</td><td>Sunday / Sun</td></tr>
<tr><td>%j</td><td>Yılın günü</td><td>074</td></tr>
<tr><td>%z / %Z</td><td>UTC farkı / dilim adı</td><td>+0300 / +03</td></tr>
</table></div>
<pre class="py">from datetime import datetime

t = datetime(2026, 3, 5, 9, 7)
print(t.strftime("%d.%m.%Y %H:%M"))      # Türkiye'de alışık olunan biçim
print(t.strftime("%Y-%m-%d"))            # ISO, sıralanabilir
print(t.strftime("%d/%m/%y"))

# Metinden nesneye: biçim metinle BİREBİR uyuşmalı
s = "15.03.2026 14:30"
d = datetime.strptime(s, "%d.%m.%Y %H:%M")
print(d, type(d).__name__)

# Türkçe ay adı: %B yerel dile bağlıdır, kendin eşle
AYLAR = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
         "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"]
print(f"{d.day} {AYLAR[d.month - 1]} {d.year}")</pre>
<div class="warn"><b>%B ve %A dile bağlıdır</b>Sunucunun yerel ayarına (locale) göre "March" ya da "Mart" basar; çoğu sunucuda İngilizcedir. Türkçe rapor için ay/gün adlarını kendi listenden al; strptime ile Türkçe ay adı ayrıştırmaya çalışma.</div>

<h2>ISO 8601: makineler arası ortak dil</h2>
<p><code>2026-03-15T14:30:00+03:00</code> biçimi ISO 8601'dir. API'ler, JSON ve veritabanları bunu kullanır; metin olarak sıralandığında kronolojik sıra çıkar. Python'da <code>isoformat()</code> ve <code>fromisoformat()</code> bu işi görür.</p>
<pre class="py">from datetime import datetime, date

d = datetime(2026, 3, 15, 14, 30)
print(d.isoformat())
print(d.isoformat(sep=" ", timespec="minutes"))
print(datetime.fromisoformat("2026-03-15T14:30:00"))
print(datetime.fromisoformat("2026-03-15 14:30:00+03:00"))
print(date.fromisoformat("2026-03-15"))

# Metin sıralaması = kronolojik sıralama
print(sorted(["2026-03-15", "2025-12-01", "2026-01-20"]))</pre>

<h2>Saat dilimi: naive ve aware</h2>
<p>Saat dilimi bilgisi olmayan datetime'a <b>naive</b>, olana <b>aware</b> denir. İkisini karşılaştıramaz ya da çıkaramazsın; Python <code>TypeError</code> verir. Kural: sistem içinde UTC sakla, kullanıcıya gösterirken yerel dilime çevir. <code>zoneinfo</code> (3.9+) IANA veritabanını kullanır; Türkiye için <code>"Europe/Istanbul"</code> (2016'dan beri sabit +03).</p>
<pre class="py">from datetime import datetime, timezone, timedelta
try:
    from zoneinfo import ZoneInfo
    IST = ZoneInfo("Europe/Istanbul")
except Exception:            # bazı kısıtlı ortamlarda tz veritabanı olmayabilir
    IST = timezone(timedelta(hours=3), "+03")

utc_an = datetime(2026, 3, 15, 11, 30, tzinfo=timezone.utc)
ist_an = utc_an.astimezone(IST)
print("UTC   :", utc_an.isoformat())
print("İst.  :", ist_an.isoformat())
print("Aynı an mı?", utc_an == ist_an)

# Naive'e dilim ekleme: replace (dönüştürmez, etiketler)
yerel = datetime(2026, 3, 15, 14, 30).replace(tzinfo=IST)
print("UTC'ye:", yerel.astimezone(timezone.utc).strftime("%H:%M %Z"))
print("Şu an UTC:", datetime.now(timezone.utc).tzinfo)</pre>
<div class="tip"><b>utcnow() kullanma</b><code>datetime.utcnow()</code> naive döner ve 3.12'de kullanımdan kaldırılma uyarısı verir. Doğrusu <code>datetime.now(timezone.utc)</code>; yerel saat için <code>datetime.now(IST)</code>.</div>

<h2>İş hesapları: ay sonu, iş günü, yaş</h2>
<p>Finans ve İK'da en çok şu üç hesap sorulur. Hepsini standart kütüphaneyle çözebilirsin.</p>
<pre class="py">from datetime import date, timedelta
import calendar

def ay_sonu(d: date) -&gt; date:
    son_gun = calendar.monthrange(d.year, d.month)[1]
    return d.replace(day=son_gun)

def ay_ekle(d: date, n: int) -&gt; date:
    toplam = d.year * 12 + (d.month - 1) + n
    yil, ay = divmod(toplam, 12)
    gun = min(d.day, calendar.monthrange(yil, ay + 1)[1])   # 31 Ocak + 1 ay = 28/29 Şubat
    return date(yil, ay + 1, gun)

def is_gunu_ekle(d: date, n: int) -&gt; date:
    while n &gt; 0:
        d += timedelta(days=1)
        if d.weekday() &lt; 5:        # 0-4 hafta içi
            n -= 1
    return d

print("Şubat sonu:", ay_sonu(date(2026, 2, 10)))
print("31 Ocak + 1 ay:", ay_ekle(date(2026, 1, 31), 1))
print("Cuma + 3 iş günü:", is_gunu_ekle(date(2026, 3, 13), 3))
print("Mart 2026 takvimi:", calendar.monthrange(2026, 3))   # (ilk gün, gün sayısı)

dogum = date(1998, 7, 20); bugun = date(2026, 3, 15)
yas = bugun.year - dogum.year - ((bugun.month, bugun.day) &lt; (dogum.month, dogum.day))
print("Yaş:", yas)</pre>

<h2>Pratik: son 7 gün filtresi</h2>
<pre class="py">from datetime import date, timedelta

siparisler = [
    ("S-1", "2026-03-10", 450), ("S-2", "2026-03-14", 120),
    ("S-3", "2026-03-01", 800), ("S-4", "2026-03-15", 60),
]
bugun = date(2026, 3, 15)
esik = bugun - timedelta(days=7)
son_hafta = [s for s in siparisler if date.fromisoformat(s[1]) &gt;= esik]
print("Son 7 gün:", [s[0] for s in son_hafta], "toplam", sum(s[2] for s in son_hafta))
for s in son_hafta:
    gun_once = (bugun - date.fromisoformat(s[1])).days
    print(f"{s[0]}: {gun_once} gün önce")</pre>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Üretim sistemlerinde tarih disiplini</h3>
<p>Kurumsal kodda üç kural yerleşmiştir: (1) Veritabanı ve log'da her zaman UTC ve aware datetime sakla; (2) dönüşümü yalnızca sunum katmanında yap; (3) "bugün"ü fonksiyon içinde <code>date.today()</code> ile değil, parametre olarak al. Üçüncü kural test yazarken hayat kurtarır: <code>vade_gecti(islem, bugun=date(2026,1,1))</code> deterministik test edilir, <code>date.today()</code> içeren fonksiyon ise her gün farklı sonuç verir.</p>
<p>Zaman damgası (timestamp) ile çalışırken <code>datetime.fromtimestamp(ts, tz=timezone.utc)</code> kullan; dilimsiz çağrı makinenin yerel saatini varsayar ve sunucu-geliştirici makinesi arasında fark çıkar. Yaz saati uygulayan dilimlerde (Avrupa, ABD) bir günün 23 ya da 25 saat olabileceğini unutma; "yarın aynı saat" hesabı için yerel dilimde <code>timedelta(days=1)</code> ekleyip tekrar <code>astimezone</code> yapmak gerekir. Türkiye 2016'dan beri sabit +03 kullandığı için bu sorun yerelde görünmez ama uluslararası müşteri verisinde görünür.</p>
<p>Performans ipucu: milyonlarca satırda <code>strptime</code> yavaştır; biçim sabit ISO ise <code>fromisoformat</code> birkaç kat hızlıdır. pandas'a geçtiğinde <code>pd.to_datetime(..., format=...)</code> aynı mantıkla çalışır.</p>
</section>
`,
    ex: [
      { t: 'mc', q: '<code>timedelta</code> ile aşağıdakilerden hangisi doğrudan ifade EDİLEMEZ?',
        o: ['3 gün', '1 ay', '90 dakika', '2 hafta'], a: 1,
        why: 'timedelta gün, saniye ve mikrosaniye (ve haftalar/saatler/dakikalar bunlara çevrilerek) tutar. Ay uzunluğu değişken olduğundan ay desteklenmez.' },
      { t: 'mc', q: 'Naive bir datetime ile aware bir datetime\'ı çıkarırsan ne olur?',
        o: ['UTC varsayılır', 'TypeError fırlatılır', 'Sonuç None olur', 'Yerel saat varsayılır'], a: 1,
        why: 'Python naive ve aware nesneleri karşılaştırmaya ya da çıkarmaya izin vermez; TypeError verir. Varsayım yapmaz.' },
      { t: 'code', id: 'tarih-saat-1',
        q: '<p>Anadolu Bank kredi sistemi için <code>vade_tarihi(baslangic: str, gun: int) -> str</code> fonksiyonunu yaz. <code>baslangic</code> "GG.AA.YYYY" biçiminde metin, <code>gun</code> eklenecek gün sayısıdır. Sonucu yine "GG.AA.YYYY" biçiminde döndür.</p>',
        start: 'from datetime import datetime, timedelta\n\ndef vade_tarihi(baslangic, gun):\n    # buraya yaz\n    pass\n',
        sol: 'from datetime import datetime, timedelta\n\ndef vade_tarihi(baslangic, gun):\n    d = datetime.strptime(baslangic, "%d.%m.%Y")\n    return (d + timedelta(days=gun)).strftime("%d.%m.%Y")\n',
        tests: 'assert vade_tarihi("15.03.2026", 30) == "14.04.2026", "15.03.2026 + 30 gün = 14.04.2026"\nassert vade_tarihi("25.12.2025", 10) == "04.01.2026", "Yıl geçişi doğru olmalı"\nassert vade_tarihi("28.02.2024", 1) == "29.02.2024", "Artık yıl dikkate alınmalı"\nassert vade_tarihi("01.01.2026", 0) == "01.01.2026", "0 gün aynı tarihi vermeli"\n',
        hints: ['strptime(baslangic, "%d.%m.%Y") ile nesneye çevir.', 'timedelta(days=gun) ekle, strftime ile aynı biçime döndür.'],
        why: 'strptime metni datetime yapar, timedelta ile toplanır, strftime geri metne çevirir. Artık yıl ve ay geçişlerini Python hesaplar.' },
      { t: 'code', id: 'tarih-saat-2',
        q: '<p><code>ay_sonu(d: date) -> date</code> fonksiyonu verilen tarihin bulunduğu ayın son gününü döndürsün. <code>calendar.monthrange</code> kullanabilirsin. Artık yıl Şubat\'ı doğru hesaplanmalı.</p>',
        start: 'from datetime import date\nimport calendar\n\ndef ay_sonu(d):\n    # buraya yaz\n    pass\n',
        sol: 'from datetime import date\nimport calendar\n\ndef ay_sonu(d):\n    return d.replace(day=calendar.monthrange(d.year, d.month)[1])\n',
        tests: 'from datetime import date\nassert ay_sonu(date(2026, 2, 10)) == date(2026, 2, 28), "2026 Şubat 28 gün"\nassert ay_sonu(date(2024, 2, 1)) == date(2024, 2, 29), "2024 artık yıl, Şubat 29"\nassert ay_sonu(date(2026, 12, 31)) == date(2026, 12, 31), "Zaten ay sonuysa aynı gün"\nassert ay_sonu(date(2026, 4, 5)) == date(2026, 4, 30), "Nisan 30 gün"\n',
        hints: ['calendar.monthrange(yil, ay) (ilk_gun, gun_sayisi) demeti döndürür.', 'd.replace(day=...) yeni tarih üretir.'],
        why: 'monthrange ayın gün sayısını artık yılı da hesaba katarak verir; replace ile günü o değere çekersin.' },
      { t: 'code', id: 'tarih-saat-3',
        q: '<p>Anadolu Market lojistik: <code>teslimat_gunu(siparis: date, is_gunu: int) -> date</code> fonksiyonu, siparişten itibaren <code>is_gunu</code> kadar iş günü (Pzt-Cum) sonrasını döndürsün. Hafta sonları sayılmaz; sipariş günü sayılmaz.</p>',
        start: 'from datetime import date, timedelta\n\ndef teslimat_gunu(siparis, is_gunu):\n    # buraya yaz\n    pass\n',
        sol: 'from datetime import date, timedelta\n\ndef teslimat_gunu(siparis, is_gunu):\n    d = siparis\n    while is_gunu > 0:\n        d += timedelta(days=1)\n        if d.weekday() < 5:\n            is_gunu -= 1\n    return d\n',
        tests: 'from datetime import date\nassert teslimat_gunu(date(2026, 3, 13), 1) == date(2026, 3, 16), "Cuma + 1 iş günü = Pazartesi"\nassert teslimat_gunu(date(2026, 3, 13), 3) == date(2026, 3, 18), "Cuma + 3 iş günü = Çarşamba"\nassert teslimat_gunu(date(2026, 3, 16), 5) == date(2026, 3, 23), "Pzt + 5 iş günü = sonraki Pzt"\nassert teslimat_gunu(date(2026, 3, 14), 1) == date(2026, 3, 16), "Cumartesi + 1 iş günü = Pazartesi"\nassert teslimat_gunu(date(2026, 3, 16), 0) == date(2026, 3, 16), "0 iş günü aynı gün"\n',
        hints: ['weekday() 0-4 hafta içi, 5-6 hafta sonu.', 'Gün gün ilerle; hafta içine denk gelince sayacı azalt.'],
        why: 'Her adımda bir gün ekleyip yalnızca hafta içi günlerde sayacı düşürmek en okunur çözümdür.' },
      { t: 'code', id: 'tarih-saat-4',
        q: '<p>Sunucu logları UTC ISO 8601 metinleriyle geliyor (örn. <code>"2026-03-15T11:30:00+00:00"</code>). <code>istanbul_saati(iso: str) -> str</code> fonksiyonu bu metni alıp İstanbul saatine (UTC+3) çevirsin ve <code>"GG.AA.YYYY SS:DD"</code> biçiminde döndürsün. <code>datetime.fromisoformat</code> ve <code>astimezone</code> kullan. Saat dilimi için <code>timezone(timedelta(hours=3))</code> kullanabilirsin.</p>',
        start: 'from datetime import datetime, timezone, timedelta\n\nIST = timezone(timedelta(hours=3))\n\ndef istanbul_saati(iso):\n    # buraya yaz\n    pass\n',
        sol: 'from datetime import datetime, timezone, timedelta\n\nIST = timezone(timedelta(hours=3))\n\ndef istanbul_saati(iso):\n    d = datetime.fromisoformat(iso)\n    return d.astimezone(IST).strftime("%d.%m.%Y %H:%M")\n',
        tests: 'assert istanbul_saati("2026-03-15T11:30:00+00:00") == "15.03.2026 14:30", "UTC 11:30 -> İstanbul 14:30"\nassert istanbul_saati("2026-03-15T22:30:00+00:00") == "16.03.2026 01:30", "Gün değişimi doğru olmalı"\nassert istanbul_saati("2026-01-01T00:00:00+00:00") == "01.01.2026 03:00", "Yılbaşı dönüşümü"\n',
        hints: ['fromisoformat "+00:00" sonekini okuyup aware nesne üretir.', 'astimezone(IST) dönüştürür; replace(tzinfo=...) yalnızca etiketler, kullanma.'],
        why: 'fromisoformat aware datetime verir; astimezone gerçek dönüşümü yapar; strftime istenen biçimi üretir.' },
      { t: 'code', id: 'tarih-saat-5',
        q: '<p>Raporlama: <code>gun_farki_listesi(tarihler: list[str], bugun: str) -> list[int]</code> fonksiyonu ISO biçimli ("YYYY-AA-GG") tarih listesini alsın ve her biri için <code>bugun</code>\'e kaç gün kaldığını (gelecekse pozitif, geçmişse negatif) liste olarak döndürsün.</p>',
        start: 'from datetime import date\n\ndef gun_farki_listesi(tarihler, bugun):\n    # buraya yaz\n    pass\n',
        sol: 'from datetime import date\n\ndef gun_farki_listesi(tarihler, bugun):\n    b = date.fromisoformat(bugun)\n    return [(date.fromisoformat(t) - b).days for t in tarihler]\n',
        tests: 'r = gun_farki_listesi(["2026-03-20", "2026-03-10", "2026-03-15"], "2026-03-15")\nassert r == [5, -5, 0], "Farklar [5, -5, 0] olmalı, gelen: " + str(r)\nassert gun_farki_listesi([], "2026-01-01") == [], "Boş liste boş dönmeli"\nassert gun_farki_listesi(["2027-01-01"], "2026-01-01") == [365], "2026 artık yıl değil, 365 gün"\n',
        hints: ['date.fromisoformat ile her metni tarihe çevir.', 'İki date çıkarınca timedelta gelir; .days ile tam sayı al.'],
        why: 'date çıkarması timedelta döndürür; .days işaretli gün sayısını verir. Liste comprehension işi tek satıra indirir.' },
      { t: 'mc', q: 'Aşağıdaki biçimlerden hangisi metin olarak sıralandığında kronolojik sıra verir?',
        o: ['15.03.2026', '03/15/2026', '2026-03-15', '15 Mart 2026'], a: 2,
        why: 'ISO 8601 (YYYY-MM-DD) en büyük birimden en küçüğe gittiği için metin sıralaması tarih sıralamasıyla aynıdır. Diğerleri gün ya da ayla başladığından yanlış sıralanır.' }
    ],
    faq: [
      { q: 'date.today() ile datetime.now() farkı ne?', a: 'date.today() yalnızca yıl-ay-gün döndürür; datetime.now() saat, dakika, saniye ve mikrosaniye de içerir. Saat dilimi için datetime.now(tz) kullan; date.today() dilim almaz.' },
      { q: 'Türkçe ay adıyla tarih basmak için ne yapmalıyım?', a: 'strftime %B yerel ayara bağlıdır ve çoğu sunucuda İngilizcedir. En güvenlisi kendi Türkçe ay listeni tutup d.month ile indekslemektir.' },
      { q: 'Tarihleri metin olarak saklayıp karşılaştırabilir miyim?', a: 'Yalnızca ISO biçimindeyse (YYYY-MM-DD) metin karşılaştırması doğru sonuç verir. GG.AA.YYYY gibi biçimlerde mutlaka nesneye çevir.' },
      { q: 'zoneinfo bulunamadı hatası alıyorum.', a: 'Bazı minimal sistemlerde IANA veritabanı yoktur; pip install tzdata çözer. Türkiye sabit +03 olduğundan geçici çözüm olarak timezone(timedelta(hours=3)) kullanılabilir.' }
    ],
    mistakes: [
      { bad: 'd + timedelta(months=1)', good: 'd.replace(year=d.year + (d.month == 12), month=d.month % 12 + 1)', why: 'timedelta ay parametresi almaz; ay eklemek için yıl/ayı kendin hesapla ya da dateutil.relativedelta kullan.' },
      { bad: 'datetime.strptime("15.03.2026", "%Y-%m-%d")', good: 'datetime.strptime("15.03.2026", "%d.%m.%Y")', why: 'Biçim kodu metinle birebir uyuşmalı; aksi halde ValueError alırsın.' },
      { bad: 'datetime.utcnow()', good: 'datetime.now(timezone.utc)', why: 'utcnow naive nesne döndürür ve kullanımdan kaldırılıyor; now(timezone.utc) aware nesne verir.' },
      { bad: 'yerel = naive.replace(tzinfo=IST)\nutc = naive.replace(tzinfo=timezone.utc)', good: 'yerel = naive.replace(tzinfo=IST)\nutc = yerel.astimezone(timezone.utc)', why: 'replace yalnızca etiket değiştirir, saati kaydırmaz; dönüşüm için astimezone gerekir.' }
    ]
  },
