from a2common import *

T = 'Tarih ve saat'
H = 'Hatalar ve istisnalar'
S = 'Sınıflar'
probs = []

# ---------------------------------------------------------------- TARİH VE SAAT
probs.append(dict(
    id='a-081', title='Kargo kaç günde geldi?', track=T, diff='Kolay', tags=['date', 'timedelta', 'fromisoformat'],
    src='HackerRank Python: Calendar/Time Delta benzeri', mode='stdin',
    statement=P('Anadolu Market müşteri hizmetleri, şikâyet eden müşterilerin siparişlerinin kaç günde teslim edildiğini kontrol ediyor. Her satırda sipariş ve teslim tarihi ISO biçiminde (`YYYY-MM-DD`) veriliyor; bazı kayıtlarda tarihler ters girilmiş olabilir.',
                'Her kayıt için iki tarih arasındaki gün farkını (mutlak değer) yaz.'),
    input='İlk satırda `q`, sonra her satırda iki tarih.',
    output='Her kayıt için bir tam sayı.',
    constraints='1 ≤ q ≤ 10^4, tarihler 1900–2100 arası geçerli tarihler',
    samples=[('3\n2026-03-01 2026-03-04\n2026-02-27 2026-03-02\n2024-02-27 2024-03-02\n', '3 gün; 2026 artık yıl değil (Şubat 28 gün): 3 gün; 2024 artık yıl: 4 gün.'),
             ('1\n2026-01-10 2026-01-01\n', 'Ters girilmiş kayıt: mutlak fark 9.')],
    hidden=['1\n2026-05-05 2026-05-05\n', '1\n2025-12-31 2026-01-01\n', '1\n1900-01-01 2100-12-31\n', '2\n2000-02-28 2000-03-01\n1900-02-28 1900-03-01\n',
            '1\n2026-03-28 2026-03-30\n', '3\n2023-01-01 2024-01-01\n2024-01-01 2025-01-01\n2026-10-29 2026-10-28\n',
            {'gen': 'import random, datetime\nrandom.seed(81)\nq = 10000\nprint(q)\nb = datetime.date(1900, 1, 1)\nfor _ in range(q):\n    x = b + datetime.timedelta(days=random.randint(0, 73000))\n    y = b + datetime.timedelta(days=random.randint(0, 73000))\n    print(x.isoformat(), y.isoformat())'}],
    start='from datetime import date\n\nq = int(input())\nfor _ in range(q):\n    a, b = input().split()\n    # kodunu yaz\n',
    sol='''
from datetime import date

q = int(input())
for _ in range(q):
    a, b = input().split()
    fark = date.fromisoformat(b) - date.fromisoformat(a)
    print(abs(fark.days))
''',
    editorial=ed('`date.fromisoformat` ISO metnini `date` nesnesine çevirir. İki `date`\'in farkı bir `timedelta`dır; `.days` gün sayısını verir. Artık yıl (leap year), ay uzunlukları gibi tüm takvim ayrıntılarını kütüphane halleder.',
                 'Kayıt başına O(1).',
                 '`datetime.strptime(a, \'%Y-%m-%d\').date()` her biçimle çalışır (ör. GG.AA.YYYY). `abs(fark).days` da olur, çünkü `timedelta` negatif olabilir ve `abs` destekler.',
                 'Tarihleri `-` ile bölüp ay × 30 gibi elle hesaplamak; 1900\'ün artık yıl <b>olmadığını</b> (100\'e bölünür, 400\'e bölünmez) gözden kaçırmak. `fark.seconds` kullanmak: gün farkını vermez.'),
    hints=['date.fromisoformat(\'2026-03-01\') bir date nesnesi döndürür.', 'İki date çıkarılınca timedelta oluşur; .days ve abs kullan.']))

probs.append(dict(
    id='a-082', title='Randevu hangi güne denk geliyor?', track=T, diff='Kolay', tags=['strptime', 'weekday'],
    src='HackerRank Python: Calendar Module benzeri', mode='func', fn='hafta_gunu',
    statement=P('Bir sağlık randevu sisteminde tarihler `GG.AA.YYYY` biçiminde giriliyor. Ekranda tarihin yanında Türkçe gün adı gösterilecek.',
                '`hafta_gunu(tarih)` fonksiyonunu yaz: Türkçe gün adını döndürsün (`Pazartesi`, `Salı`, `Çarşamba`, `Perşembe`, `Cuma`, `Cumartesi`, `Pazar`). Geçersiz bir tarih (ör. 30.02.2026) ya da yanlış biçim gelirse `ValueError` fırlatılsın.',
                'Not: `strftime(\'%A\')` sistem diline göre İngilizce dönebilir; kendi listeni kullan.'),
    constraints='Yıl 1–9999',
    samples=[("hafta_gunu('29.10.2026')", '29 Ekim 2026 bir perşembe.'), ("hafta_gunu('01.01.2000')", '')],
    checks=["hafta_gunu('02.11.2026')", "hafta_gunu('01.11.2026')", "hafta_gunu('29.02.2024')", "hafta_gunu('23.04.1920')",
            "hafta_gunu('31.12.9999')", "[hafta_gunu('0' + str(g) + '.03.2026') for g in range(2, 9)]"],
    raises=[('ValueError', "hafta_gunu('30.02.2026')", '30 Şubat'), ('ValueError', "hafta_gunu('2026-10-29')", 'yanlış biçim')],
    start='from datetime import datetime\n\nGUNLER = [\'Pazartesi\', \'Salı\', \'Çarşamba\', \'Perşembe\', \'Cuma\', \'Cumartesi\', \'Pazar\']\n\ndef hafta_gunu(tarih):\n    # kodunu yaz\n    pass\n',
    sol='''
from datetime import datetime

GUNLER = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar']

def hafta_gunu(tarih):
    d = datetime.strptime(tarih, '%d.%m.%Y')
    return GUNLER[d.weekday()]
''',
    editorial=ed('`datetime.strptime(metin, \'%d.%m.%Y\')` metni biçime göre ayrıştırır; biçim tutmazsa ya da tarih takvimde yoksa kendisi `ValueError` fırlatır — ekstra kontrol yazmana gerek yok. `weekday()` Pazartesi = 0 … Pazar = 6 döndürür; bunu Türkçe listede indeks olarak kullan.',
                 'O(1).',
                 '`isoweekday()` Pazartesi = 1 … Pazar = 7 verir (listeye `-1` ile erişirsin). `calendar.weekday(y, a, g)` da aynı sayıyı döndürür. `locale` ayarıyla `%A` Türkçe yapılabilir ama ortama bağlıdır; sunucuda güvenilmez.',
                 '`weekday()` ile `isoweekday()`\'i karıştırıp bir gün kaymak. Hatayı yakalayıp `None` döndürmek: görev hatanın yukarı iletilmesini istiyor.'),
    hints=['datetime.strptime(tarih, \'%d.%m.%Y\') geçersiz tarihte zaten ValueError fırlatır.', 'weekday() Pazartesi için 0 döndürür; GUNLER listesinde indeks olarak kullan.']))

probs.append(dict(
    id='a-083', title='Fatura son ödeme günü', track=T, diff='Kolay', tags=['timedelta', 'hafta sonu', 'strftime'],
    src='İş günü kaydırma kuralı (bankacılık vade hesabı)', mode='stdin',
    statement=P('Anadolu Bank kredi kartı ekstresinde son ödeme tarihi, kesim tarihinden <b>n gün</b> sonradır. Bu tarih cumartesi ya da pazara denk gelirse <b>sonraki pazartesiye</b> kaydırılır.',
                'Her ekstre için son ödeme tarihini `GG.AA.YYYY Gün` biçiminde yaz (gün adları: Pazartesi, Salı, Çarşamba, Perşembe, Cuma).'),
    input='İlk satırda `q`; sonra her satırda `GG.AA.YYYY n`.',
    output='Her satırda tarih ve Türkçe gün adı.',
    constraints='1 ≤ q ≤ 10^4, 0 ≤ n ≤ 400',
    samples=[('3\n01.10.2026 10\n05.10.2026 12\n20.12.2026 13\n', '11.10.2026 pazar → 12.10.2026 Pazartesi; 17.10.2026 cumartesi → 19.10; 02.01.2027 cumartesi → 04.01.2027 (yıl atladı).')],
    hidden=['1\n02.11.2026 0\n', '1\n07.11.2026 0\n', '1\n28.02.2024 1\n', '1\n31.12.2026 400\n', '2\n27.02.2026 1\n27.02.2026 2\n',
            '1\n08.11.2026 0\n', {'gen': 'import random\nrandom.seed(83)\nq = 10000\nprint(q)\nfor _ in range(q):\n    print(f"{random.randint(1, 28):02d}.{random.randint(1, 12):02d}.{random.randint(2000, 2030)}", random.randint(0, 400))'}],
    start='from datetime import datetime, timedelta\n\nGUNLER = [\'Pazartesi\', \'Salı\', \'Çarşamba\', \'Perşembe\', \'Cuma\', \'Cumartesi\', \'Pazar\']\n\nq = int(input())\nfor _ in range(q):\n    tarih, n = input().split()\n    # kodunu yaz\n',
    sol='''
from datetime import datetime, timedelta

GUNLER = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar']

q = int(input())
for _ in range(q):
    tarih, n = input().split()
    d = datetime.strptime(tarih, '%d.%m.%Y').date() + timedelta(days=int(n))
    if d.weekday() == 5:
        d += timedelta(days=2)
    elif d.weekday() == 6:
        d += timedelta(days=1)
    print(d.strftime('%d.%m.%Y'), GUNLER[d.weekday()])
''',
    editorial=ed('Tarihi `strptime` ile oku, `timedelta(days=n)` ekle. `weekday()` 5 (cumartesi) ise 2, 6 (pazar) ise 1 gün ileri al. Çıktıyı `strftime(\'%d.%m.%Y\')` ile biçimlendir; ay ve yıl geçişlerini kütüphane halleder.',
                 'Kayıt başına O(1).',
                 'Kaydırma miktarını tek ifadeyle de yazabilirsin: `d += timedelta(days=(7 - d.weekday()) % 7 if d.weekday() &gt;= 5 else 0)` — ama iki dallı `if` çok daha okunur. Resmî tatilleri de hesaba katmak gerekiyorsa bir tatil kümesi tutup `while` ile ilerlenir (a-085).',
                 '`d.day + n` gibi gün numarasıyla toplama yapıp ay sonunu taşırmak. `%d.%m.%Y` yerine `%D` gibi platforma bağlı kısaltmalar kullanmak. Cumartesiyi pazara kaydırmak.'),
    hints=['Tarihe gün eklemek için date + timedelta(days=n).', 'weekday(): 5 cumartesi, 6 pazar; sırasıyla 2 ve 1 gün ekle.']))

probs.append(dict(
    id='a-084', title='Gece vardiyası puantajı', track=T, diff='Orta', tags=['datetime', 'gece yarısı', 'gruplama'],
    src='Zaman aralığı hesabı (puantaj)', mode='stdin',
    statement=P('Pusula İK\'nın puantaj sistemine günlük kart okutma kayıtları geliyor: her satırda çalışan adı, giriş ve çıkış saati (`SS:DD`). Çıkış saati girişten küçükse vardiya <b>gece yarısını geçmiştir</b> (ör. 22:00 → 06:30, 8 saat 30 dakika). Giriş ve çıkış hiçbir zaman eşit değildir.',
                'Her çalışanın toplam çalışma süresini `SS:DD` biçiminde, çalışan adına göre alfabetik sırada yaz. Saat kısmı 24\'ü geçebilir (ör. `41:15`).'),
    input='İlk satırda `n`, sonra her satırda `ad giris cikis`.',
    output='Her çalışan için `ad SS:DD`.',
    constraints='1 ≤ n ≤ 10^5',
    samples=[('4\nayse 09:00 17:30\nmehmet 22:00 06:30\nayse 18:00 20:15\ncan 23:59 00:01\n', 'ayşe: 8:30 + 2:15 = 10:45; mehmet gece vardiyası 8:30; can 2 dakika.')],
    hidden=['1\nx 00:00 23:59\n', '1\nx 23:59 00:00\n', '2\nb 12:00 12:01\na 12:01 12:00\n', '3\nzeynep 08:00 16:00\nzeynep 08:00 16:00\nzeynep 08:00 16:00\n',
            '2\nAli 10:00 11:00\nali 10:00 12:00\n',
            {'gen': 'import random\nrandom.seed(84)\nn = 100000\nprint(n)\nad = ["calisan" + str(i) for i in range(500)]\nfor _ in range(n):\n    a = random.randint(0, 1439)\n    b = random.randint(0, 1439)\n    while b == a:\n        b = random.randint(0, 1439)\n    print(random.choice(ad), f"{a // 60:02d}:{a % 60:02d}", f"{b // 60:02d}:{b % 60:02d}")'}],
    start='import sys\nfrom collections import defaultdict\n\nsatirlar = sys.stdin.read().split(\'\\n\')\nn = int(satirlar[0])\n# kodunu yaz\n',
    sol='''
import sys
from collections import defaultdict
from datetime import datetime, timedelta

satirlar = sys.stdin.read().split('\\n')
n = int(satirlar[0])
toplam = defaultdict(int)
for satir in satirlar[1:1 + n]:
    ad, giris, cikis = satir.split()
    g = datetime.strptime(giris, '%H:%M')
    c = datetime.strptime(cikis, '%H:%M')
    if c <= g:
        c += timedelta(days=1)
    toplam[ad] += int((c - g).total_seconds()) // 60
for ad in sorted(toplam):
    s, d = divmod(toplam[ad], 60)
    print(f'{ad} {s:02d}:{d:02d}')
''',
    editorial=ed('Saatleri `datetime`e çevir; çıkış girişten küçük ya da eşitse çıkışa bir gün ekle (gece yarısı geçişi). Fark `timedelta`; `total_seconds() // 60` dakikayı verir. Kişi başı dakikaları `defaultdict(int)` ile topla, en sonda `divmod(dk, 60)` ile saat:dakikaya çevir.',
                 'O(n + k log k).',
                 'Dakikaya doğrudan çevirmek daha hızlıdır: `dk = s * 60 + d`; fark negatifse `+ 1440`. Yani `(c - g) % 1440` tek satırda gece yarısını çözer. `datetime` sürümü ise tarihli kayıtlara genişlemeye hazırdır.',
                 '`timedelta.seconds` kullanmak (gün kısmını yok sayar; burada sorun çıkmasa da çok günlü farkta yanlış). Saat kısmını 24\'te sarmak (`%H` biçimi 24\'ü geçemez, f-string ile elle biçimle). `f\'{s}:{d}\'` yazıp `10:5` gibi tek haneli dakika basmak.'),
    hints=['Çıkış girişten küçükse çıkışa 1 gün (ya da 1440 dakika) ekle.', 'Toplam dakikayı divmod(dk, 60) ile saat ve dakikaya ayır; :02d ile iki haneli yaz.']))

probs.append(dict(
    id='a-085', title='İş günü ekleme', track=T, diff='Orta', tags=['date', 'tatil', 'while'],
    src='Business day arithmetic (numpy.busday_offset benzeri)', mode='func', fn='is_gunu_ekle',
    statement=P('Kanat Havayolları\'nın iade süreci “başvurudan itibaren <b>n iş günü</b> içinde” tamamlanıyor. İş günü: hafta içi (pazartesi–cuma) ve resmî tatil olmayan gün.',
                '`is_gunu_ekle(baslangic, n, tatiller=())` fonksiyonunu yaz. `baslangic` ISO metni (`\'2026-10-27\'`), `tatiller` ISO metinlerinden oluşan bir dizi. Başlangıç gününden <b>sonraki</b> günlerden n iş günü say ve n\'inci iş gününü ISO metni olarak döndür. `n = 0` ise başlangıç tarihini aynen döndür. n negatifse `ValueError`.'),
    constraints='0 ≤ n ≤ 10^4, len(tatiller) ≤ 1000',
    samples=[("is_gunu_ekle('2026-10-27', 3, ['2026-10-29'])", '28 Ekim (1), 29 Ekim tatil, 30 Ekim (2), hafta sonu, 2 Kasım (3).'),
             ("is_gunu_ekle('2026-10-30', 1)", 'Cuma\'dan sonraki ilk iş günü pazartesi.')],
    checks=["is_gunu_ekle('2026-10-31', 0)", "is_gunu_ekle('2026-10-31', 1)", "is_gunu_ekle('2026-12-31', 1, ['2027-01-01'])",
            "is_gunu_ekle('2026-01-01', 260)", "is_gunu_ekle('2026-03-19', 2, ['2026-03-20', '2026-03-21', '2026-03-22', '2026-03-23'])",
            "is_gunu_ekle('2026-11-02', 5)", "is_gunu_ekle('2024-02-28', 1, ('2024-02-29',))", "is_gunu_ekle('2026-01-01', 10000)"],
    raises=[('ValueError', "is_gunu_ekle('2026-11-02', -1)", 'negatif n')],
    start='from datetime import date, timedelta\n\ndef is_gunu_ekle(baslangic, n, tatiller=()):\n    # kodunu yaz\n    pass\n',
    sol='''
from datetime import date, timedelta

def is_gunu_ekle(baslangic, n, tatiller=()):
    if n < 0:
        raise ValueError('n negatif olamaz')
    tatil = {date.fromisoformat(t) for t in tatiller}
    gun = date.fromisoformat(baslangic)
    kalan = n
    while kalan > 0:
        gun += timedelta(days=1)
        if gun.weekday() < 5 and gun not in tatil:
            kalan -= 1
    return gun.isoformat()
''',
    editorial=ed('Tatilleri baştan bir `set`\'e çevir (üyelik testi O(1)). Sonra günü birer birer ilerlet; hafta içi ve tatil değilse sayacı azalt. Sayaç sıfırlanınca o gün cevaptır.',
                 'O(n · 7/5 + t): her iş günü için ortalama 1,4 takvim günü gezilir.',
                 'Büyük n için tam haftaları (5 iş günü = 7 takvim günü) tek seferde atlayıp tatilleri ayrıca düzeltebilirsin. Veri biliminde `numpy.busday_offset` ve `pandas.offsets.CustomBusinessDay` bu işi hazır yapar.',
                 'Başlangıç gününü de saymak (görev “sonraki günlerden” diyor). Tatilleri liste olarak bırakıp her günde O(t) arama yapmak. Tatil metnini `date` ile karşılaştırmak (\'2026-10-29\' != date(2026, 10, 29)).'),
    hints=['Tatilleri set içinde date nesnesi olarak tut.', 'Günü timedelta(days=1) ile ilerlet; weekday() < 5 ve tatil değilse bir iş günü say.']))

probs.append(dict(
    id='a-086', title='Kıdem için tam yaş', track=T, diff='Orta', tags=['date', 'artık yıl', 'demet karşılaştırma'],
    src='Yaş hesaplama (Codewars benzeri)', mode='stdin',
    statement=P('Pusula İK, izin hakkı hesabında çalışanların bir referans tarihteki <b>tam yaşını</b> kullanıyor. Yaş, referans tarihte doğum günü gelmişse bir artar.',
                '29 Şubat\'ta doğanların doğum günü, artık olmayan yıllarda <b>1 Mart</b> kabul edilir (yani 28 Şubat\'ta henüz yaş almamışlardır). Referans tarih doğum tarihinden önceyse `HATA` yaz.'),
    input='İlk satırda `q`; sonra her satırda `dogum referans` (ISO biçimi).',
    output='Her satırda tam yaş ya da `HATA`.',
    constraints='1 ≤ q ≤ 10^4',
    samples=[('3\n1990-11-02 2026-11-02\n1990-11-03 2026-11-02\n2004-02-29 2026-02-28\n', 'Doğum günü bugün: 36. Yarın: henüz 35. 29 Şubat doğumlu, 28 Şubat\'ta henüz 21.')],
    hidden=['1\n2004-02-29 2026-03-01\n', '1\n2004-02-29 2028-02-29\n', '1\n2026-11-02 2026-11-02\n', '1\n2026-11-03 2026-11-02\n',
            '2\n2000-12-31 2001-12-30\n2000-12-31 2001-12-31\n', '1\n1900-01-01 2100-01-01\n', '1\n2025-03-01 2026-02-28\n',
            {'gen': 'import random, datetime\nrandom.seed(86)\nq = 10000\nprint(q)\nb = datetime.date(1950, 1, 1)\nfor _ in range(q):\n    x = b + datetime.timedelta(days=random.randint(0, 27000))\n    y = x + datetime.timedelta(days=random.randint(-30, 27000))\n    print(x, y)'}],
    brute='''
from datetime import date, timedelta
q = int(input())
for _ in range(q):
    a, b = input().split()
    d, r = date.fromisoformat(a), date.fromisoformat(b)
    if r < d:
        print('HATA'); continue
    yas = 0
    while True:
        y = d.year + yas + 1
        try:
            dg = date(y, d.month, d.day)
        except ValueError:
            dg = date(y, 3, 1)
        if dg <= r:
            yas += 1
        else:
            break
    print(yas)
''',
    start='from datetime import date\n\nq = int(input())\nfor _ in range(q):\n    dogum, referans = input().split()\n    # kodunu yaz\n',
    sol='''
from datetime import date

q = int(input())
for _ in range(q):
    a, b = input().split()
    d, r = date.fromisoformat(a), date.fromisoformat(b)
    if r < d:
        print('HATA')
        continue
    yas = r.year - d.year - ((r.month, r.day) < (d.month, d.day))
    print(yas)
''',
    editorial=ed('Yıl farkını al; referans tarihte doğum günü henüz gelmediyse 1 çıkar. “Gelmedi mi?” sorusu demet karşılaştırmasıyla tek ifadedir: `(r.month, r.day) &lt; (d.month, d.day)`. `True` toplamada 1, `False` 0 sayılır. 29 Şubat kuralı bu karşılaştırmayla kendiliğinden sağlanır: (2, 28) &lt; (2, 29) olduğu için 28 Şubat\'ta yaş artmaz, (3, 1) ise artırır.',
                 'O(1).',
                 'Günleri 365,25\'e bölmek yaklaşık sonuç verir ve doğum günü civarında yanılır. `dateutil.relativedelta(r, d).years` üçüncü parti kütüphaneyle aynı işi yapar.',
                 '`(r - d).days // 365` kullanmak (artık yıllar yüzünden doğum gününden önce yaş artar). `date(r.year, d.month, d.day)` kurup 29 Şubat\'ta `ValueError` almak.'),
    hints=['Yaş = yıl farkı − (doğum günü bu yıl henüz gelmediyse 1).', '(ay, gün) demetlerini karşılaştırmak hem kısa hem 29 Şubat için doğru.']))

probs.append(dict(
    id='a-087', title='Saat dilimleri arası uçuş süresi', track=T, diff='Zor', tags=['timezone', 'utcoffset', 'strptime %z'],
    src='Saat dilimi farkı (HackerRank Time Delta benzeri)', mode='stdin',
    statement=P('Kanat Havayolları\'nın uçuş planlama ekranında her uçuşun kalkış ve varış saati <b>yerel saat</b> ve UTC farkıyla birlikte yazılıyor (ör. `2026-03-14 23:40 +03:00`). Planlamacılar gerçek uçuş süresini görmek istiyor.',
                'Uçuşları gerçek süreye göre <b>azalan</b>, eşitlikte uçuş koduna göre alfabetik sırala ve `KOD SS:DD` yaz. Varışı (gerçek zamanda) kalkışından önce ya da aynı anda olan kayıtlar hatalıdır: bunları geçerli uçuşlardan <b>sonra</b>, koda göre alfabetik, `KOD HATALI` olarak yaz.'),
    input='İlk satırda `n`; sonra her satırda `KOD tarih saat ofset tarih saat ofset` (kalkış, varış).',
    output='Her uçuş için bir satır.',
    constraints='1 ≤ n ≤ 10^4, ofsetler −12:00 … +14:00',
    samples=[('3\nKH101 2026-03-14 23:40 +03:00 2026-03-15 06:05 -05:00\nKH202 2026-03-15 10:00 +03:00 2026-03-15 11:30 +01:00\nKH303 2026-03-15 08:00 +09:00 2026-03-15 08:00 +03:00\n',
              'KH101: 20:40 UTC → 11:05 UTC = 14:25. KH202: 07:00 → 10:30 UTC = 3:30. KH303: 23:00 UTC (önceki gün) → 05:00 UTC = 6:00.'),
             ('1\nKH404 2026-01-01 10:00 +00:00 2026-01-01 12:00 +03:00\n', 'Varış 09:00 UTC, kalkıştan önce: hatalı kayıt.')],
    hidden=['2\nB1 2026-06-01 00:00 +00:00 2026-06-01 01:00 +00:00\nA1 2026-06-01 03:00 +03:00 2026-06-01 01:00 +01:00\n',
            '1\nX 2026-12-31 23:30 +14:00 2026-12-30 23:30 -12:00\n', '1\nY 2026-01-01 00:00 +00:00 2026-01-01 00:00 +00:00\n',
            '2\nZ2 2026-01-01 00:00 +00:00 2026-01-01 00:00 +05:00\nZ1 2026-01-01 00:00 +00:00 2026-01-01 00:00 +05:30\n',
            '1\nLONG 2026-01-01 00:00 +00:00 2026-01-03 01:01 +00:00\n', '1\nIST 2026-07-20 01:15 +03:00 2026-07-20 07:45 +05:30\n',
            {'gen': 'import random, datetime\nrandom.seed(87)\nn = 10000\nprint(n)\nofs = ["-12:00", "-05:00", "-03:30", "+00:00", "+01:00", "+03:00", "+05:45", "+09:00", "+14:00"]\nb = datetime.datetime(2026, 1, 1)\nfor i in range(n):\n    x = b + datetime.timedelta(minutes=random.randint(0, 500000))\n    y = x + datetime.timedelta(minutes=random.randint(-600, 1200))\n    print("KH" + str(i).zfill(5), x.strftime("%Y-%m-%d %H:%M"), random.choice(ofs), y.strftime("%Y-%m-%d %H:%M"), random.choice(ofs))'}],
    start='from datetime import datetime\n\nn = int(input())\nfor _ in range(n):\n    p = input().split()\n    # p[0] kod, p[1:4] kalkış, p[4:7] varış\n    # kodunu yaz\n',
    sol='''
from datetime import datetime

n = int(input())
gecerli = []
hatali = []
for _ in range(n):
    p = input().split()
    kod = p[0]
    kalkis = datetime.strptime(' '.join(p[1:4]), '%Y-%m-%d %H:%M %z')
    varis = datetime.strptime(' '.join(p[4:7]), '%Y-%m-%d %H:%M %z')
    dakika = int((varis - kalkis).total_seconds()) // 60
    if dakika <= 0:
        hatali.append(kod)
    else:
        gecerli.append((-dakika, kod))
for eksi, kod in sorted(gecerli):
    s, d = divmod(-eksi, 60)
    print(f'{kod} {s:02d}:{d:02d}')
for kod in sorted(hatali):
    print(kod, 'HATALI')
''',
    editorial=ed('`strptime` biçimindeki `%z`, `+03:00` gibi ofsetleri okuyup <b>farkında (aware)</b> bir `datetime` üretir. İki aware `datetime`\'ın farkı otomatik olarak UTC üzerinden hesaplanır; senin ofset çıkarmana gerek kalmaz. Süreyi dakikaya çevir, sıralama anahtarı olarak `(-dakika, kod)` kullan.',
                 'O(n log n).',
                 'Her zamanı `astimezone(timezone.utc)` ile UTC\'ye çevirip karşılaştırmak da olur. Gerçek hayatta ofset yerine bölge adı (`Europe/Istanbul`) tutulur ve `zoneinfo` ile yaz saati (DST) geçişleri doğru hesaplanır; sabit ofset DST\'yi bilmez.',
                 'Saf (naive) `datetime`\'lar ile çıkarma yapıp ofsetleri yok saymak. Ofseti yanlış yöne uygulamak (UTC = yerel − ofset). Aware ile naive `datetime`\'ı karşılaştırınca `TypeError` almak. `+05:30` gibi yarım saatlik ofsetleri unutmak.'),
    hints=['strptime(..., \'%Y-%m-%d %H:%M %z\') ofsetli (aware) datetime üretir.', 'Aware datetime farkı UTC üzerinden doğru süreyi verir; sıralamada (-dakika, kod) kullan.']))

probs.append(dict(
    id='a-088', title='Toplantı odası boşlukları', track=T, diff='Zor', tags=['aralık birleştirme', 'zaman', 'sıralama'],
    src='Merge Intervals / Meeting Rooms (LeetCode 56 benzeri)', mode='func', fn='bos_araliklar',
    statement=P('Pusula İK\'nın toplantı odası için takvimdeki dolu aralıklar `(\'SS:DD\', \'SS:DD\')` demetleri olarak geliyor. Aralıklar sırasız, birbiriyle <b>çakışabilir</b> ve kısmen mesai saati dışına taşabilir.',
                '`bos_araliklar(dolu, mesai_bas, mesai_son, sure)` fonksiyonunu yaz: mesai saatleri içindeki, en az `sure` dakikalık <b>boş</b> aralıkları kronolojik sırada `(\'SS:DD\', \'SS:DD\')` demetleri listesi olarak döndürsün. Bir toplantının bittiği dakika boştur (09:00–10:00 dolu ise 10:00 itibarıyla oda boştur).'),
    constraints='len(dolu) ≤ 10^4, 1 ≤ sure ≤ 600, tüm saatler aynı gün içinde ve başlangıç < bitiş',
    samples=[("bos_araliklar([('10:00', '11:00'), ('09:00', '09:30'), ('10:30', '12:00'), ('14:00', '15:00')], '09:00', '17:00', 30)",
              '10:00–11:00 ile 10:30–12:00 birleşir. Boşluklar: 09:30–10:00, 12:00–14:00, 15:00–17:00.'),
             ("bos_araliklar([], '09:00', '18:00', 60)", 'Takvim boş: bütün gün.')],
    checks=["bos_araliklar([('09:00', '18:00')], '09:00', '18:00', 1)", "bos_araliklar([('08:00', '09:15'), ('17:30', '19:00')], '09:00', '18:00', 15)",
            "bos_araliklar([('09:30', '10:00')], '09:00', '18:00', 31)", "bos_araliklar([('11:00', '12:00'), ('11:00', '12:00'), ('11:15', '11:45')], '09:00', '13:00', 60)",
            "bos_araliklar([('09:00', '10:00'), ('10:00', '11:00')], '09:00', '12:00', 1)", "bos_araliklar([('06:00', '07:00'), ('20:00', '21:00')], '09:00', '10:00', 60)",
            "bos_araliklar([('09:10', '09:20'), ('09:25', '09:40')], '09:00', '10:00', 5)",
            "len(bos_araliklar([(f'{h:02d}:{m:02d}', f'{h:02d}:{m + 1:02d}') for h in range(9, 18) for m in range(0, 58, 3)], '09:00', '18:00', 2))"],
    start='def bos_araliklar(dolu, mesai_bas, mesai_son, sure):\n    # kodunu yaz\n    pass\n',
    sol='''
def dk(s):
    h, m = map(int, s.split(':'))
    return h * 60 + m

def saat(x):
    return f'{x // 60:02d}:{x % 60:02d}'

def bos_araliklar(dolu, mesai_bas, mesai_son, sure):
    bas, son = dk(mesai_bas), dk(mesai_son)
    araliklar = sorted((max(dk(a), bas), min(dk(b), son)) for a, b in dolu)
    sonuc = []
    imlec = bas
    for a, b in araliklar:
        if a >= b:
            continue
        if a - imlec >= sure:
            sonuc.append((saat(imlec), saat(a)))
        imlec = max(imlec, b)
    if son - imlec >= sure:
        sonuc.append((saat(imlec), saat(son)))
    return sonuc
''',
    editorial=ed('Saatleri dakikaya çevir, her dolu aralığı mesai sınırlarına kırp (dışarıda kalanlar boş aralığa dönüşür ve atlanır), başlangıca göre sırala. Bir “imleç” (şu ana kadar dolu olan en son dakika) tut: sıradaki aralık imleçten sonra başlıyorsa aradaki boşluk adaydır; sonra imleci `max(imlec, bitis)` yap. Döngü bitince mesai sonuna kadar kalan boşluğu da kontrol et.',
                 'Sıralama O(n log n), tarama O(n).',
                 'Önce çakışan aralıkları birleştirip (merge intervals) sonra aralarını taramak da olur; burada tek geçişte ikisini birden yaptık. Dakika çözünürlüğü küçükse 1440 elemanlı bir doluluk dizisi de kullanılabilir.',
                 'İmleci `max` yerine doğrudan bitişe eşitlemek: iç içe aralıkta (11:00–12:00 içinde 11:15–11:45) imleç geri gider ve sahte boşluk çıkar. Saat metinlerini string olarak karşılaştırmak (`\'9:00\' &gt; \'10:00\'`). Mesai dışına taşan aralıkları kırpmamak.'),
    hints=['Her şeyi dakikaya çevir ve dolu aralıkları başlangıca göre sırala.', 'Dolu olan en son dakikayı tutan bir imleç kullan; imleci her zaman max(imlec, bitis) ile güncelle.']))

# ---------------------------------------------------------------- HATALAR VE İSTİSNALAR
probs.append(dict(
    id='a-089', title='Kirli ölçümlerin ortalaması', track=H, diff='Kolay', tags=['try/except', 'ValueError', 'float'],
    src='Veri temizleme: hatalı değerleri atlama', mode='func', fn='guvenli_ortalama',
    statement=P('Pedal İzmir istasyonlarındaki sensörler hava sıcaklığını metin olarak gönderiyor; bazı değerler bozuk: boş, `\'yok\'`, `None`, `\'nan\'`, `\'inf\'` gibi.',
                '`guvenli_ortalama(degerler)` fonksiyonunu yaz: listedeki geçerli sayıların ortalamasını 2 ondalığa yuvarlayarak döndürsün. Kurallar:',
                '<ul><li>Baştaki/sondaki boşluklar önemsizdir; ondalık ayırıcı virgül de olabilir (`\'21,5\'`).</li><li>`float()`\'a çevrilemeyen (ValueError) ya da metin olmayan (`None` → TypeError) değerler atlanır.</li><li>`nan` ve sonsuzluk (`inf`) geçerli ölçüm sayılmaz.</li><li>Hiç geçerli değer yoksa `None` döndür.</li></ul>'),
    constraints='0 ≤ len(degerler) ≤ 10^5',
    samples=[("guvenli_ortalama(['21.5', ' 22 ', 'yok', '20,5'])", '21.5, 22 ve 20.5 geçerli: ortalama 21.33.'),
             ("guvenli_ortalama(['', None, 'nan'])", 'Geçerli değer yok.')],
    checks=["guvenli_ortalama([])", "guvenli_ortalama(['-3', '-4.5'])", "guvenli_ortalama(['inf', '-inf', '10'])",
            "guvenli_ortalama(['1e2', '0'])", "guvenli_ortalama([None, None, '7'])", "guvenli_ortalama(['1.000,5'])",
            "guvenli_ortalama(['  ', '12.345', '12.346'])", "guvenli_ortalama([str(i) for i in range(100001)])"],
    start='import math\n\ndef guvenli_ortalama(degerler):\n    # kodunu yaz\n    pass\n',
    sol='''
import math

def guvenli_ortalama(degerler):
    gecerli = []
    for d in degerler:
        try:
            x = float(d.strip().replace(',', '.'))
        except (ValueError, AttributeError, TypeError):
            continue
        if math.isfinite(x):
            gecerli.append(x)
    if not gecerli:
        return None
    return round(sum(gecerli) / len(gecerli), 2)
''',
    editorial=ed('Her değeri `try` bloğunda çevir; hata olursa `continue` ile atla. `None.strip()` bir <b>AttributeError</b> fırlatır (TypeError değil!), bu yüzden yakalanacak türleri bir demet olarak ver: `except (ValueError, AttributeError, TypeError)`. `float(\'nan\')` ve `float(\'inf\')` hata <b>vermez</b>; onları `math.isfinite` ile ayrıca ele.',
                 'O(n).',
                 '`str(d)` ile her şeyi metne çevirmek `None`\'ı `\'None\'` yapar ve sonra ValueError ile yakalanır; ama sayısal türleri de metne çevirip geri çevirmek gereksiz iştir. pandas\'ta `pd.to_numeric(s, errors=\'coerce\')` bozuk değerleri NaN yapar.',
                 'Çıplak `except:` kullanmak: `KeyboardInterrupt` gibi istemediğin hataları da yutar ve kendi hatalarını gizler. `nan`\'ı kabul edip ortalamayı `nan` yapmak. Boş listede `ZeroDivisionError` almak. `\'1.000,5\'` gibi binlik ayırıcılı metni yanlışlıkla 1.0005 diye okumamak için virgülü noktaya çevirdikten sonra çıkan `\'1.000.5\'` zaten ValueError verir — bu doğru davranış.'),
    hints=['float(...) çağrısını try içine al; except ile birden çok hata türünü bir demetle yakala.', 'None.strip() AttributeError fırlatır. nan ve inf için math.isfinite kullan.']))

probs.append(dict(
    id='a-090', title='Stoktan düşme kuralları', track=H, diff='Kolay', tags=['raise', 'KeyError', 'ValueError'],
    src='Girdi doğrulama ve hata fırlatma', mode='func', fn='stok_dus',
    statement=P('Anadolu Market\'in depo servisinde `stok` bir sözlük: `{\'urun_kodu\': adet}`. Sipariş geldiğinde stoktan düşülüyor.',
                '`stok_dus(stok, urun, adet)` fonksiyonunu yaz. Başarılı olursa sözlüğü günceller ve kalan adedi döndürür. Hatalı durumlarda <b>sözlüğe dokunmadan</b> şu hataları fırlatır:',
                '<ul><li>Ürün stokta yoksa `KeyError` (mesajda ürün kodu geçsin).</li><li>`adet` tam sayı değilse `TypeError` (bool da kabul edilmez).</li><li>`adet` ≤ 0 ise `ValueError`.</li><li>Stok yetmezse `ValueError` ve mesaj: `\'Yetersiz stok: <urun> için <var> var, <adet> istendi\'`.</li></ul>'),
    constraints='',
    samples=[("s = {'AM-1': 10}\n(stok_dus(s, 'AM-1', 3), s)", 'Kalan 7, sözlük güncellendi.')],
    checks=["s = {'AM-1': 5}\n(stok_dus(s, 'AM-1', 5), s)",
            "s = {'AM-2': 2}\ntry:\n    stok_dus(s, 'AM-2', 3)\nexcept ValueError as e:\n    mesaj = str(e)\n(mesaj, s)",
            "s = {'AM-3': 2}\ntry:\n    stok_dus(s, 'AM-9', 1)\nexcept KeyError as e:\n    ksonuc = 'AM-9' in str(e)\n(ksonuc, s)",
            "s = {'A': 4}\nstok_dus(s, 'A', 1)\nstok_dus(s, 'A', 1)\ns['A']"],
    raises=[('TypeError', "stok_dus({'A': 4}, 'A', 1.5)", 'ondalıklı adet'), ('TypeError', "stok_dus({'A': 4}, 'A', True)", 'bool adet'),
            ('ValueError', "stok_dus({'A': 4}, 'A', 0)", 'adet 0'), ('ValueError', "stok_dus({'A': 4}, 'A', -2)", 'negatif adet')],
    start='def stok_dus(stok, urun, adet):\n    # kodunu yaz\n    pass\n',
    sol='''
def stok_dus(stok, urun, adet):
    if urun not in stok:
        raise KeyError(f'Ürün bulunamadı: {urun}')
    if isinstance(adet, bool) or not isinstance(adet, int):
        raise TypeError('Adet tam sayı olmalı')
    if adet <= 0:
        raise ValueError('Adet pozitif olmalı')
    var = stok[urun]
    if adet > var:
        raise ValueError(f'Yetersiz stok: {urun} için {var} var, {adet} istendi')
    stok[urun] = var - adet
    return stok[urun]
''',
    editorial=ed('Önce <b>tüm</b> kontrolleri yap, en sonda sözlüğü değiştir (“önce doğrula, sonra değiştir”). Böylece hata durumunda veri yarım güncellenmiş kalmaz. Hata türü anlam taşır: eksik anahtar `KeyError`, yanlış tür `TypeError`, türü doğru ama değeri geçersiz `ValueError`.',
                 'O(1).',
                 'Kendi hata sınıflarını tanımlamak (`class YetersizStok(ValueError)`) çağıran tarafın hataları ayırt etmesini kolaylaştırır (bkz. a-092). Çok iş parçacıklı bir sistemde kontrol ve güncelleme arasında kilit (lock) gerekir.',
                 '`bool`\'un `int`\'in alt sınıfı olduğunu unutmak: `isinstance(True, int)` True döner. Önce düşüp sonra kontrol etmek. Hata fırlatmak yerine `False` ya da `-1` döndürmek: çağıran kontrol etmeyi unutursa hata sessizce kaybolur.'),
    hints=['Sözlüğü değiştirmeden önce bütün kontrolleri bitir.', 'isinstance(True, int) True döner; bool\'u ayrıca reddet.']))

probs.append(dict(
    id='a-091', title='Tahsilat dosyası denetimi', track=H, diff='Kolay', tags=['try/except', 'stdin', 'ayrıştırma'],
    src='Satır satır hatalı kayıt ayıklama', mode='stdin',
    statement=P('Lezzet Kurye\'nin günlük tahsilat dosyası `kurye;tutar` satırlarından oluşuyor. Dosya elle düzenlendiği için bazı satırlar bozuk: noktalı virgül yok, fazla alan var, tutar sayı değil ya da negatif.',
                'Geçerli satırlardaki tutarların toplamını 2 ondalıkla yaz; ardından hatalı satırların numaralarını (1\'den başlar) yaz. Tutar ondalık nokta kullanır.'),
    input='İlk satırda `n`, sonra `n` satır.',
    output='1. satır: `TOPLAM x.xx`. 2. satır: `HATALI` ve ardından boşlukla satır numaraları, ya da `HATALI YOK`.',
    constraints='1 ≤ n ≤ 10^5',
    samples=[('5\nali;120.50\nayse;80\nbozuk satir\nmehmet;-5\ncan;on lira\n', '1 ve 2 geçerli: 200.50. 3: ayraç yok, 4: negatif, 5: sayı değil.')],
    hidden=['1\nx;0\n', '2\na;1;2\n;\n', '3\na;1.005\nb;2.005\nc;3\n', '1\n  ali ; 10 \n', '2\na;nan\nb;inf\n',
            {'gen': 'import random\nrandom.seed(91)\nn = 100000\nprint(n)\nfor i in range(n):\n    r = random.random()\n    if r < 0.9:\n        print("kurye" + str(i % 50) + ";" + str(round(random.uniform(0, 500), 2)))\n    elif r < 0.95:\n        print("kurye;abc")\n    else:\n        print("kurye" + str(i))'},
            '3\na;10\nb;20\nc;30\n'],
    start='n = int(input())\nfor i in range(1, n + 1):\n    satir = input()\n    # kodunu yaz\n',
    sol='''
import math
import sys

satirlar = sys.stdin.read().split('\\n')
n = int(satirlar[0])
toplam = 0.0
hatali = []
for i in range(1, n + 1):
    satir = satirlar[i]
    try:
        ad, tutar_metin = satir.split(';')
        tutar = float(tutar_metin)
        if not ad.strip() or tutar < 0 or not math.isfinite(tutar):
            raise ValueError('geçersiz kayıt')
    except ValueError:
        hatali.append(i)
        continue
    toplam += tutar
print(f'TOPLAM {toplam:.2f}')
print('HATALI', ' '.join(map(str, hatali)) if hatali else 'YOK')
''',
    editorial=ed('Her satırı `try` içinde işle. `ad, tutar = satir.split(\';\')` parça sayısı 2 değilse kendiliğinden `ValueError` fırlatır (“too many/not enough values to unpack”); `float` de sayı olmayan metinde aynı hatayı verir. İş kuralı ihlallerinde (negatif, boş ad, nan/inf) aynı yola girmek için kendin `raise ValueError` yap: tek bir `except` tüm hatalı satırları toplar.',
                 'O(n).',
                 'Kontrolleri `if` ile tek tek yapmak (LBYL: “Look Before You Leap”) yerine burada denenip yakalanan (EAFP: “Easier to Ask Forgiveness than Permission”) Python\'a özgü üslup kullanıldı. Kuruş hassasiyeti gerekiyorsa `decimal.Decimal` kullan.',
                 'Hatalı satırda programın çökmesine izin vermek. Satır numarasını 0\'dan başlatmak. `except Exception` ile beklenmedik hataları da (ör. yazım hatası kaynaklı `NameError`) “hatalı satır” saymak.'),
    hints=['a, b = satir.split(\';\') parça sayısı 2 değilse ValueError fırlatır.', 'Kural ihlallerinde kendin raise ValueError yaparak tek bir except bloğunda topla.']))

probs.append(dict(
    id='a-092', title='Ödeme hata hiyerarşisi', track=H, diff='Orta', tags=['özel istisna', 'kalıtım', 'raise'],
    src='Custom exception hierarchy (gerçek ödeme servisleri)', mode='func', fn='odeme_yap',
    statement=P('Anadolu Bank\'ın mobil ödeme servisi için hata sınıfları tasarla. Çağıran taraf ister tüm ödeme hatalarını tek seferde (`except OdemeHatasi`), ister türüne göre ayrı ayrı yakalayabilmeli.',
                '<ul><li>`OdemeHatasi(Exception)` — temel sınıf.</li><li>`BakiyeYetersiz(OdemeHatasi)` — `eksik` özniteliği taşır; mesajı `\'Bakiye yetersiz: 150.00 TL eksik\'` biçiminde.</li><li>`LimitAsildi(OdemeHatasi)` — `kalan_limit` özniteliği taşır; mesajı `\'Günlük limit aşıldı: kalan 200.00 TL\'`.</li></ul>',
                '`odeme_yap(bakiye, tutar, gunluk_limit, bugun_harcanan)` yeni bakiyeyi döndürür. Kontrol sırası: tutar ≤ 0 ise `ValueError`; sonra limit (`bugun_harcanan + tutar &gt; gunluk_limit` → `LimitAsildi`); sonra bakiye (`tutar &gt; bakiye` → `BakiyeYetersiz`). Tutarlar 2 ondalığa yuvarlanmış olarak saklansın.'),
    constraints='',
    samples=[('odeme_yap(1000, 250, 5000, 0)', ''),
             ("try:\n    odeme_yap(100, 250, 5000, 0)\nexcept OdemeHatasi as e:\n    h = e\n(type(h).__name__, h.eksik, str(h))", 'BakiyeYetersiz, temel sınıfla yakalanabiliyor.')],
    checks=["try:\n    odeme_yap(10000, 300, 1000, 800)\nexcept LimitAsildi as e:\n    h = e\n(h.kalan_limit, str(h))",
            "try:\n    odeme_yap(50, 300, 1000, 800)\nexcept OdemeHatasi as e:\n    h = e\ntype(h).__name__",
            "odeme_yap(100.10, 100.10, 1000, 0)", "odeme_yap(500, 200, 1000, 800)",
            "(issubclass(BakiyeYetersiz, OdemeHatasi), issubclass(LimitAsildi, OdemeHatasi), issubclass(OdemeHatasi, Exception))",
            "try:\n    odeme_yap(0.1, 0.3, 100, 0)\nexcept BakiyeYetersiz as e:\n    h = e\n(h.eksik, str(h))",
            "issubclass(ValueError, OdemeHatasi)"],
    raises=[('ValueError', 'odeme_yap(100, 0, 1000, 0)', 'tutar 0'), ('ValueError', 'odeme_yap(100, -5, 1000, 0)', 'negatif tutar')],
    start='class OdemeHatasi(Exception):\n    pass\n\n# BakiyeYetersiz ve LimitAsildi sınıflarını yaz\n\ndef odeme_yap(bakiye, tutar, gunluk_limit, bugun_harcanan):\n    # kodunu yaz\n    pass\n',
    sol='''
class OdemeHatasi(Exception):
    pass

class BakiyeYetersiz(OdemeHatasi):
    def __init__(self, eksik):
        self.eksik = round(eksik, 2)
        super().__init__(f'Bakiye yetersiz: {self.eksik:.2f} TL eksik')

class LimitAsildi(OdemeHatasi):
    def __init__(self, kalan_limit):
        self.kalan_limit = round(kalan_limit, 2)
        super().__init__(f'Günlük limit aşıldı: kalan {self.kalan_limit:.2f} TL')

def odeme_yap(bakiye, tutar, gunluk_limit, bugun_harcanan):
    if tutar <= 0:
        raise ValueError('Tutar pozitif olmalı')
    if bugun_harcanan + tutar > gunluk_limit:
        raise LimitAsildi(gunluk_limit - bugun_harcanan)
    if tutar > bakiye:
        raise BakiyeYetersiz(tutar - bakiye)
    return round(bakiye - tutar, 2)
''',
    editorial=ed('Özel istisnalar (custom exception) bir hiyerarşi kurar: tüm ödeme hataları `OdemeHatasi`dan türer, böylece `except OdemeHatasi` hepsini, `except LimitAsildi` yalnız birini yakalar. Ek bilgiyi öznitelik olarak sakla ve `super().__init__(mesaj)` ile mesajı temel sınıfa ilet; `str(e)` bu mesajı döndürür.',
                 'O(1).',
                 'Programlama hatası sayılan durumlar (negatif tutar) için yerleşik `ValueError` kullanmak doğru tercihtir; iş kuralı hataları için kendi sınıfların. `dataclass` ile istisna tanımlamak da mümkündür. Hata zincirleme için `raise YeniHata(...) from e` kullanılır.',
                 '`super().__init__` çağırmayı unutmak: `str(e)` boş döner. Doğrudan `Exception` fırlatıp çağıranı mesaj metnine göre `if` yazmaya zorlamak. `BaseException`\'dan türetmek: `except Exception` ile yakalanmaz.'),
    hints=['class BakiyeYetersiz(OdemeHatasi): ve __init__ içinde self.eksik = ...', 'super().__init__(mesaj) mesajı str(e) için ayarlar.']))

probs.append(dict(
    id='a-093', title='Kasa hesap makinesi', track=H, diff='Orta', tags=['çoklu except', 'sözlük dağıtımı', 'stdin'],
    src='Komut yorumlayıcı (HackerRank Exceptions benzeri)', mode='stdin',
    statement=P('Anadolu Market kasasında basit bir hesap makinesi modu var. Kayıt 0\'dan başlar ve her komut kaydı günceller:',
                '<ul><li>`TOPLA x`, `CIKAR x`, `CARP x`</li><li>`BOL x` — tam bölme (`//`)</li><li>`MOD x` — kalan (`%`)</li><li>`SIFIRLA` — kaydı 0 yapar</li></ul>',
                'x bir tam sayıdır. Her komuttan sonra kaydın yeni değerini yaz. Hata olursa kayıt <b>değişmez</b> ve değer yerine şu mesajlardan biri yazılır:',
                '<ul><li>sıfıra bölme / mod: `HATA sifira bolme`</li><li>x tam sayı değil: `HATA sayi degil`</li><li>x eksik ya da fazladan argüman: `HATA arguman`</li><li>tanımsız komut: `HATA bilinmeyen komut`</li></ul>'),
    input='İlk satırda `q`, sonra `q` komut.',
    output='Her komut için bir satır.',
    constraints='1 ≤ q ≤ 10^5, |x| ≤ 10^9',
    samples=[('7\nTOPLA 10\nCARP 3\nBOL 0\nBOL 4\nKARE 2\nCIKAR on\nMOD 5\n', 'BOL 0 hatası kaydı bozmaz (30 kalır). 30 // 4 = 7. KARE tanımsız. 7 % 5 = 2.')],
    hidden=['1\nSIFIRLA\n', '3\nTOPLA\nTOPLA 1 2\nTOPLA 1\n', '2\nCIKAR 5\nBOL 2\n', '2\nMOD 0\nTOPLA 1.5\n', '3\nSIFIRLA 5\nCARP -1\nTOPLA -7\n',
            '2\ntopla 3\nTOPLA 3\n',
            {'gen': 'import random\nrandom.seed(93)\nq = 100000\nprint(q)\nk = ["TOPLA", "CIKAR", "CARP", "BOL", "MOD", "SIFIRLA", "US"]\nfor _ in range(q):\n    c = random.choice(k)\n    r = random.random()\n    if c == "SIFIRLA":\n        print(c)\n    elif r < 0.05:\n        print(c, "x")\n    else:\n        print(c, random.randint(-3, 9))'}],
    start='q = int(input())\nkayit = 0\nfor _ in range(q):\n    parca = input().split()\n    # kodunu yaz\n',
    sol='''
import operator
import sys

ISLEMLER = {
    'TOPLA': operator.add,
    'CIKAR': operator.sub,
    'CARP': operator.mul,
    'BOL': operator.floordiv,
    'MOD': operator.mod,
}

satirlar = sys.stdin.read().split('\\n')
q = int(satirlar[0])
kayit = 0
cikti = []
for satir in satirlar[1:1 + q]:
    parca = satir.split()
    try:
        komut = parca[0]
        if komut == 'SIFIRLA':
            if len(parca) != 1:
                raise IndexError
            kayit = 0
        else:
            islem = ISLEMLER[komut]
            if len(parca) != 2:
                raise IndexError
            kayit = islem(kayit, int(parca[1]))
        cikti.append(str(kayit))
    except ZeroDivisionError:
        cikti.append('HATA sifira bolme')
    except ValueError:
        cikti.append('HATA sayi degil')
    except IndexError:
        cikti.append('HATA arguman')
    except KeyError:
        cikti.append('HATA bilinmeyen komut')
print('\\n'.join(cikti))
''',
    editorial=ed('Komutları bir sözlükte işlevlere eşle (`operator.add` …). Ardından her satırı tek bir `try` içinde çalıştır ve hata türüne göre ayrı `except` blokları yaz: bilinmeyen komut sözlükte `KeyError`, eksik argüman `IndexError`, `int(\'on\')` `ValueError`, `x // 0` `ZeroDivisionError`. Kayıt yalnız işlem başarıyla biterse atanır; hata atamadan <b>önce</b> fırladığı için kayıt kendiliğinden korunur.',
                 'Komut başına O(1) (büyük sayılarda çarpma maliyeti hariç).',
                 'Uzun bir `if/elif` zinciri de çalışır ama her yeni komutta kod büyür; sözlükle dağıtım (dispatch table) daha temizdir. Python 3.10+ `match` ifadesi de iyi bir seçenektir.',
                 'Hata yakaladıktan sonra yine de kaydı güncellemek. Tek bir `except Exception` ile hepsini yakalayıp aynı mesajı yazmak. `except` sırasını önemsememek: bir üst sınıf (ör. `ArithmeticError`) önce yazılırsa alt sınıf bloğuna hiç ulaşılmaz.'),
    hints=['Komutları {\'TOPLA\': operator.add, ...} sözlüğünde tut; olmayan komut KeyError verir.', 'Her hata türü için ayrı except bloğu yaz; kayda yalnız işlem başarılıysa ata.']))

probs.append(dict(
    id='a-094', title='Kararsız servise yeniden deneme', track=H, diff='Orta', tags=['retry', 'raise', 'ConnectionError'],
    src='Retry kalıbı (tenacity/backoff kütüphaneleri benzeri)', mode='func', fn='yeniden_dene',
    statement=P('Lezzet Kurye\'nin harita servisi zaman zaman bağlantı hatası veriyor. Geçici hatalarda işlemi yeniden denemek istiyorsun, ama kalıcı hatalarda (ör. hatalı veri) hemen vazgeçmelisin.',
                '`yeniden_dene(islem, deneme=3)` fonksiyonunu yaz: argümansız `islem()` fonksiyonunu çağırır.',
                '<ul><li>Başarılı olursa `(sonuc, kacinci_denemede)` döndürür.</li><li>`ConnectionError` (ve alt sınıfları, ör. `ConnectionResetError`) fırlatırsa yeniden dener.</li><li>Tüm denemeler bağlantı hatasıyla biterse <b>son</b> hatayı olduğu gibi yeniden fırlatır.</li><li>Başka bir hata gelirse hiç yeniden denemeden onu iletir.</li><li>`deneme` 1\'den küçükse `ValueError`.</li></ul>',
                'Testlerde `bozuk(n, hata)` yardımcısı hazırdır: ilk n çağrıda verilen hatayı fırlatan, sonra `\'tamam\'` döndüren bir fonksiyon üretir; `f.cagri` kaç kez çağrıldığını tutar.'),
    constraints='',
    setup='''
def bozuk(n, hata=ConnectionError):
    def f():
        f.cagri += 1
        if f.cagri <= n:
            raise hata('deneme ' + str(f.cagri))
        return 'tamam'
    f.cagri = 0
    return f
''',
    samples=[('yeniden_dene(bozuk(2), 3)', '2 kez bağlantı hatası, 3. denemede başarılı.'), ('yeniden_dene(lambda: 42)', 'İlk denemede başarılı.')],
    checks=["f = bozuk(0)\n(yeniden_dene(f, 1), f.cagri)",
            "f = bozuk(3)\ntry:\n    yeniden_dene(f, 3)\nexcept ConnectionError as e:\n    son = str(e)\n(son, f.cagri)",
            "f = bozuk(1, ValueError)\ntry:\n    yeniden_dene(f, 5)\nexcept ValueError:\n    pass\nf.cagri",
            "f = bozuk(4, ConnectionResetError)\n(yeniden_dene(f, 5), f.cagri)",
            "f = bozuk(5, TimeoutError)\ntry:\n    yeniden_dene(f, 10)\nexcept TimeoutError:\n    pass\nf.cagri",
            "f = bozuk(9)\n(yeniden_dene(f, 10), f.cagri)"],
    raises=[('ValueError', 'yeniden_dene(lambda: 1, 0)', 'deneme 0'), ('ConnectionError', 'yeniden_dene(bozuk(1), 1)', 'tek deneme hakkı')],
    start='def yeniden_dene(islem, deneme=3):\n    # kodunu yaz\n    pass\n',
    sol='''
def yeniden_dene(islem, deneme=3):
    if deneme < 1:
        raise ValueError('deneme en az 1 olmalı')
    for i in range(1, deneme + 1):
        try:
            return islem(), i
        except ConnectionError:
            if i == deneme:
                raise
''',
    editorial=ed('Döngü içinde `try: return islem(), i`. Yalnız `ConnectionError` yakalanır; diğer türler `except` bloğuna hiç girmez ve kendiliğinden yukarı çıkar. Son denemede yakalanan hatayı argümansız `raise` ile <b>aynen</b> yeniden fırlat: orijinal iz kaydı (traceback) korunur.',
                 'O(deneme) çağrı.',
                 'Gerçek sistemlerde denemeler arasında üstel bekleme (exponential backoff: 1 s, 2 s, 4 s…) ve rastgele sapma (jitter) eklenir; `tenacity` kütüphanesi bunu dekoratörle sunar. Dekoratör sürümünü Fonksiyonel bölümünde yazacaksın.',
                 '`except Exception` ile her hatayı yeniden denemek: hatalı veriyle 5 kez boşuna servis çağrılır. `raise e` yerine `raise` tercih edilmeli; ikisi de çalışır ama `raise` niyeti daha iyi anlatır. Son denemeden sonra hatayı yutup `None` döndürmek. `TimeoutError`\'ın `ConnectionError`\'ın alt sınıfı <b>olmadığını</b> unutmak (ikisi de `OSError` altındadır).'),
    hints=['for i in range(1, deneme + 1) içinde try: return islem(), i', 'Yalnız except ConnectionError yaz; son denemede argümansız raise ile hatayı ilet.']))

probs.append(dict(
    id='a-095', title='Geri alınabilir para transferi', track=H, diff='Zor', tags=['context manager', '__exit__', 'rollback'],
    src='Veritabanı işlem (transaction) kalıbı', mode='func', fn='Hareket',
    statement=P('Anadolu Bank\'ın hesaplar arası transfer modülünde birden çok aktarım ya hep birlikte gerçekleşmeli ya da hiçbiri (atomiklik). Bunu bir <b>bağlam yöneticisi</b> (context manager) ile yapacaksın:',
                '```\nwith Hareket(hesaplar) as h:\n    h.aktar(\'A\', \'B\', 100)\n    h.aktar(\'B\', \'C\', 50)\n```',
                '<ul><li>`Hareket(hesaplar)`: `hesaplar` bir sözlük (`{\'A\': 500, ...}`), <b>yerinde</b> değiştirilir.</li><li>`aktar(kaynak, hedef, tutar)`: tutar ≤ 0 → `ValueError`; hesap yoksa `KeyError`; bakiye yetmezse `IslemIptal` (kendi istisna sınıfın).</li><li>Blok içinde <b>herhangi</b> bir hata olursa sözlük bloğa girildiği andaki hâline döner (aynı sözlük nesnesi kalır).</li><li>Hata `IslemIptal` ise <b>bastırılır</b> (with bloğundan sonra program devam eder); diğer hatalar geri alma sonrası yukarı iletilir.</li><li>`h.yapilan` o ana kadar başarılı aktarım sayısını tutar.</li></ul>'),
    constraints='',
    samples=[("h1 = {'A': 500, 'B': 0, 'C': 0}\nwith Hareket(h1) as h:\n    h.aktar('A', 'B', 100)\n    h.aktar('B', 'C', 50)\n(h1, h.yapilan)", 'İki aktarım da onaylandı.'),
             ("h2 = {'A': 100, 'B': 0}\nwith Hareket(h2) as h:\n    h.aktar('A', 'B', 60)\n    h.aktar('A', 'B', 60)\nh2", 'İkinci aktarımda bakiye yetmedi: IslemIptal bastırıldı ve ilk aktarım da geri alındı.')],
    checks=["h3 = {'A': 100, 'B': 0}\nref = h3\ntry:\n    with Hareket(h3) as h:\n        h.aktar('A', 'B', 30)\n        h.aktar('A', 'Z', 10)\nexcept KeyError:\n    yakalandi = True\n(h3, yakalandi, ref is h3)",
            "h4 = {'A': 100, 'B': 0}\ntry:\n    with Hareket(h4) as h:\n        h.aktar('A', 'B', 70)\n        1 / 0\nexcept ZeroDivisionError:\n    pass\nh4",
            "h5 = {'A': 100, 'B': 0}\ntry:\n    with Hareket(h5) as h:\n        h.aktar('A', 'B', 0)\nexcept ValueError:\n    pass\nh5",
            "h6 = {'A': 10, 'B': 5}\nwith Hareket(h6) as h:\n    h.aktar('A', 'B', 10)\n    h.aktar('B', 'A', 15)\n(h6, h.yapilan)",
            "issubclass(IslemIptal, Exception)",
            "h7 = {'A': 50, 'B': 0}\nwith Hareket(h7) as h:\n    h.aktar('A', 'B', 20)\nwith Hareket(h7) as h:\n    h.aktar('B', 'A', 5)\n    h.aktar('B', 'A', 100)\nh7",
            "h8 = {'A': 50}\nwith Hareket(h8) as h:\n    pass\n(h8, h.yapilan)",
            "h9 = {'A': 1, 'B': 1}\nhr = Hareket(h9)\n(hr.__enter__() is hr, hr.__exit__(None, None, None) in (None, False))"],
    start='class IslemIptal(Exception):\n    pass\n\nclass Hareket:\n    def __init__(self, hesaplar):\n        self.hesaplar = hesaplar\n\n    def __enter__(self):\n        pass\n\n    def aktar(self, kaynak, hedef, tutar):\n        pass\n\n    def __exit__(self, tip, deger, iz):\n        pass\n',
    sol='''
class IslemIptal(Exception):
    pass

class Hareket:
    def __init__(self, hesaplar):
        self.hesaplar = hesaplar
        self.yapilan = 0

    def __enter__(self):
        self._yedek = dict(self.hesaplar)
        self.yapilan = 0
        return self

    def aktar(self, kaynak, hedef, tutar):
        if tutar <= 0:
            raise ValueError('Tutar pozitif olmalı')
        for hesap in (kaynak, hedef):
            if hesap not in self.hesaplar:
                raise KeyError(hesap)
        if self.hesaplar[kaynak] < tutar:
            raise IslemIptal(f'{kaynak} hesabında yeterli bakiye yok')
        self.hesaplar[kaynak] -= tutar
        self.hesaplar[hedef] += tutar
        self.yapilan += 1

    def __exit__(self, tip, deger, iz):
        if tip is None:
            return False
        self.hesaplar.clear()
        self.hesaplar.update(self._yedek)
        return issubclass(tip, IslemIptal)
''',
    editorial=ed('`__enter__` bloğa girerken sözlüğün bir kopyasını (snapshot) alır ve `self`\'i döndürür (`as h` buna bağlanır). `__exit__(tip, deger, iz)` her durumda çağrılır: hata yoksa `tip` `None`dır. Hata varsa sözlüğü <b>yerinde</b> geri yükle (`clear` + `update`; `self.hesaplar = yedek` yazmak dışarıdaki referansı değiştirmez!). `__exit__`\'ten `True` döndürmek hatayı bastırır, `False` iletir.',
                 'Giriş O(h) kopya (h = hesap sayısı), her aktarım O(1).',
                 '`contextlib.contextmanager` ile üreteç tabanlı sürüm: `yield` öncesi kopya, `except IslemIptal:` geri al ve yut, `except BaseException:` geri al ve `raise`. Gerçek veritabanlarında bu iş `BEGIN/COMMIT/ROLLBACK` ile yapılır; `sqlite3` bağlantısı da bir bağlam yöneticisidir.',
                 'Geri yüklemeyi `self.hesaplar = self._yedek` ile yapmak (çağıranın sözlüğü değişmez). Her hatayı bastırmak (`return True`): `KeyError` gibi programlama hataları sessizce kaybolur. Sığ kopyanın yetmeyeceği iç içe yapılarda `copy.deepcopy` gerekir; burada değerler sayı olduğu için `dict(...)` yeterli.'),
    hints=['__enter__ içinde kopya al ve self döndür; __exit__ hata varsa geri yükler.', 'Sözlüğü clear() + update(yedek) ile yerinde geri yükle; IslemIptal ise True döndür.']))

# ---------------------------------------------------------------- SINIFLAR (096–100)
probs.append(dict(
    id='a-096', title='Ürün satırı sınıfı', track=S, diff='Kolay', tags=['__init__', '__str__', '__repr__'],
    src='HackerRank Python: Classes benzeri', mode='func', fn='Urun',
    statement=P('Anadolu Market\'in fiş yazdırma modülü için `Urun` sınıfını yaz:',
                '<ul><li>`Urun(ad, fiyat, adet=1)` — `fiyat` negatifse ya da `adet` 1\'den küçükse `ValueError`.</li><li>`toplam()` — `fiyat * adet`, 2 ondalığa yuvarlanmış.</li><li>`str(u)` — fiş satırı: `\'Çay x3 = 136.50 TL\'` (toplam her zaman iki ondalık).</li><li>`repr(u)` — geliştirici gösterimi: `\"Urun(\'Çay\', 45.5, 3)\"` (`repr` ile alanlar).</li></ul>'),
    constraints='',
    samples=[("u = Urun('Çay', 45.5, 3)\n(u.toplam(), str(u))", ''), ("repr(Urun('Simit', 15))", 'adet varsayılan 1.')],
    checks=["str(Urun('Su', 7))", "Urun('Kahve', 129.99, 2).toplam()", "repr(Urun(\"Kuzu'nun eti\", 0, 1))",
            "u = Urun('Peynir', 0.1, 3)\n(u.toplam(), str(u))", "[str(x) for x in [Urun('A', 1, 1), Urun('B', 2.5, 4)]]",
            "Urun('Elma', 12.5).adet"],
    raises=[('ValueError', "Urun('X', -1)", 'negatif fiyat'), ('ValueError', "Urun('X', 5, 0)", 'adet 0')],
    start='class Urun:\n    def __init__(self, ad, fiyat, adet=1):\n        pass\n',
    sol='''
class Urun:
    def __init__(self, ad, fiyat, adet=1):
        if fiyat < 0:
            raise ValueError('Fiyat negatif olamaz')
        if adet < 1:
            raise ValueError('Adet en az 1 olmalı')
        self.ad = ad
        self.fiyat = fiyat
        self.adet = adet

    def toplam(self):
        return round(self.fiyat * self.adet, 2)

    def __str__(self):
        return f'{self.ad} x{self.adet} = {self.toplam():.2f} TL'

    def __repr__(self):
        return f'Urun({self.ad!r}, {self.fiyat!r}, {self.adet!r})'
''',
    editorial=ed('`__init__` doğrulamayı yapıp öznitelikleri atar. `__str__` son kullanıcıya dönük okunur metindir (`print` bunu kullanır); `__repr__` geliştiriciye dönüktür ve mümkünse nesneyi yeniden üreten koda benzemelidir. f-string içinde `!r` dönüşümü değerin `repr`\'ini koyar: metinler tırnaklı ve doğru kaçışlı gelir.',
                 'Tüm metotlar O(1).',
                 '`@dataclass` `__init__` ve `__repr__`\'i otomatik üretir; doğrulamayı `__post_init__` içine koyarsın (a-103). Yalnız `__repr__` tanımlarsan `str()` da onu kullanır.',
                 '`__str__` içinde `print` yapmak (metin <b>döndürmeli</b>). `repr` yerine `\'{self.ad}\'` gibi elle tırnak koymak: adın içinde tırnak varsa bozulur. `round(x, 2)` sonucunu yazdırırken `136.5` görüp iki ondalığı unutmak (`:.2f`).'),
    hints=['__str__ ve __repr__ metin döndürür, print etmez.', 'f-string\'de {self.ad!r} değerin repr\'ini, {x:.2f} iki ondalığı verir.']))

probs.append(dict(
    id='a-097', title='Kapsüllenmiş banka hesabı', track=S, diff='Kolay', tags=['property', 'kapsülleme', 'ValueError'],
    src='OOP temel: kapsülleme (encapsulation)', mode='func', fn='Hesap',
    statement=P('Anadolu Bank için `Hesap` sınıfı yaz. Bakiye dışarıdan doğrudan değiştirilememeli; yalnız metotlarla değişmeli.',
                '<ul><li>`Hesap(sahip, bakiye=0)` — başlangıç bakiyesi negatifse `ValueError`.</li><li>`bakiye` — salt okunur <b>property</b>; `h.bakiye = 5` yazmak `AttributeError` vermeli.</li><li>`yatir(tutar)` ve `cek(tutar)` — yeni bakiyeyi döndürür. Tutar ≤ 0 ise `ValueError`; çekilecek tutar bakiyeden büyükse `ValueError`.</li><li>`hareketler` — `(\'yatir\', tutar)` / `(\'cek\', tutar)` demetlerinin listesi (yalnız başarılı işlemler).</li></ul>'),
    constraints='',
    samples=[("h = Hesap('Ayşe', 100)\nh.yatir(50)\nh.cek(30)\n(h.bakiye, h.hareketler)", '')],
    checks=["Hesap('Can').bakiye", "h = Hesap('Ece', 10)\ntry:\n    h.cek(11)\nexcept ValueError:\n    pass\n(h.bakiye, h.hareketler)",
            "h = Hesap('Ali', 0)\nh.yatir(0.1)\nh.yatir(0.2)\nround(h.bakiye, 2)", "h = Hesap('Ali', 5)\nh.cek(5)",
            "h1 = Hesap('A')\nh2 = Hesap('B')\nh1.yatir(10)\n(h1.hareketler, h2.hareketler)", "Hesap('Deniz', 3).sahip"],
    raises=[('AttributeError', "h = Hesap('X', 10)\nh.bakiye = 1000", 'bakiyeye doğrudan atama'), ('ValueError', "Hesap('X', 10).yatir(-5)", 'negatif yatırma'),
            ('ValueError', "Hesap('X', -1)", 'negatif başlangıç')],
    start='class Hesap:\n    def __init__(self, sahip, bakiye=0):\n        self.sahip = sahip\n        self.bakiye = bakiye\n',
    sol='''
class Hesap:
    def __init__(self, sahip, bakiye=0):
        if bakiye < 0:
            raise ValueError('Başlangıç bakiyesi negatif olamaz')
        self.sahip = sahip
        self._bakiye = bakiye
        self.hareketler = []

    @property
    def bakiye(self):
        return self._bakiye

    def yatir(self, tutar):
        if tutar <= 0:
            raise ValueError('Tutar pozitif olmalı')
        self._bakiye += tutar
        self.hareketler.append(('yatir', tutar))
        return self._bakiye

    def cek(self, tutar):
        if tutar <= 0:
            raise ValueError('Tutar pozitif olmalı')
        if tutar > self._bakiye:
            raise ValueError('Yetersiz bakiye')
        self._bakiye -= tutar
        self.hareketler.append(('cek', tutar))
        return self._bakiye
''',
    editorial=ed('Asıl değeri “iç kullanım” işaretli `_bakiye`de tut; `@property` ile yalnız okuma izni ver. Setter tanımlanmamış bir property\'ye atama yapılınca Python kendisi `AttributeError` fırlatır. Hareket listesini `__init__` içinde oluştur ki her hesabın kendi listesi olsun.',
                 'Her işlem O(1).',
                 'Kontrollü yazma gerekseydi `@bakiye.setter` ile doğrulamalı bir setter eklenirdi. Çift alt çizgi (`__bakiye`) isim karıştırma (name mangling) yapar ama gerçek gizlilik sağlamaz; Python\'da gelenek tek alt çizgidir.',
                 'Hareket listesini sınıf düzeyinde (`hareketler = []`) tanımlamak: tüm hesaplar aynı listeyi paylaşır. Property ile aynı adlı özniteliğe `__init__` içinde atama yapmak (`self.bakiye = ...`) → AttributeError ya da sonsuz özyineleme. Hatalı işlemi de hareketlere eklemek.'),
    hints=['Değeri self._bakiye içinde tut, @property def bakiye(self): return self._bakiye', 'Listeyi __init__ içinde oluştur; sınıf gövdesinde değil.']))

probs.append(dict(
    id='a-098', title='Soğuk zincir sıcaklık sınıfı', track=S, diff='Kolay', tags=['classmethod', 'property setter', 'doğrulama'],
    src='Klasik Temperature sınıfı (property örneği)', mode='func', fn='Sicaklik',
    statement=P('Anadolu Market\'in soğuk zincir depolarında sensörlerin bir kısmı Celsius, bir kısmı Fahrenheit ölçüyor. `Sicaklik` sınıfı değeri içeride Celsius olarak tutsun:',
                '<ul><li>`Sicaklik(celsius)` — mutlak sıfırın (−273.15) altındaysa `ValueError`.</li><li>`celsius` — property; atama yapılabilir ve aynı doğrulamadan geçer.</li><li>`fahrenheit` — property; okurken `round(c * 9 / 5 + 32, 2)`, atarken Celsius\'a çevirip saklar (`round(..., 2)`).</li><li>`Sicaklik.fahrenheitten(f)` — <b>classmethod</b>; Fahrenheit değerinden nesne üretir.</li><li>`repr` → `\'Sicaklik(4.0)\'` (Celsius değeriyle).</li></ul>'),
    constraints='',
    samples=[('Sicaklik(4).fahrenheit', ''), ('repr(Sicaklik.fahrenheitten(212))', 'Suyun kaynama noktası.')],
    checks=["Sicaklik(-40).fahrenheit", "Sicaklik.fahrenheitten(0).celsius", "s = Sicaklik(10)\ns.fahrenheit = 50\ns.celsius",
            "s = Sicaklik(0)\ns.celsius = -18\n(s.fahrenheit, repr(s))", "type(Sicaklik.fahrenheitten(32)).__name__", "Sicaklik(-273.15).fahrenheit"],
    raises=[('ValueError', 'Sicaklik(-300)', 'mutlak sıfır altı'), ('ValueError', 's = Sicaklik(5)\ns.celsius = -274', 'setter doğrulaması'),
            ('ValueError', 's = Sicaklik(5)\ns.fahrenheit = -500', 'fahrenheit setter')],
    start='class Sicaklik:\n    def __init__(self, celsius):\n        self.celsius = celsius\n',
    sol='''
class Sicaklik:
    MUTLAK_SIFIR = -273.15

    def __init__(self, celsius):
        self.celsius = celsius

    @property
    def celsius(self):
        return self._c

    @celsius.setter
    def celsius(self, deger):
        if deger < self.MUTLAK_SIFIR:
            raise ValueError('Mutlak sıfırın altında sıcaklık olmaz')
        self._c = float(deger)

    @property
    def fahrenheit(self):
        return round(self._c * 9 / 5 + 32, 2)

    @fahrenheit.setter
    def fahrenheit(self, f):
        self.celsius = round((f - 32) * 5 / 9, 2)

    @classmethod
    def fahrenheitten(cls, f):
        return cls(round((f - 32) * 5 / 9, 2))

    def __repr__(self):
        return f'Sicaklik({self._c})'
''',
    editorial=ed('Doğrulamayı tek yerde, `celsius` setter\'ında yap; `__init__` ve `fahrenheit` setter\'ı da bu setter\'ı kullanınca kural her yolda uygulanır (DRY). `@classmethod` ilk argüman olarak sınıfı (`cls`) alır; “alternatif kurucu” (alternative constructor) yazmanın Pythonca yoludur ve alt sınıflarda da doğru türü üretir.',
                 'Her işlem O(1).',
                 '`@staticmethod` ile `Sicaklik(...)` döndürmek de çalışır ama alt sınıfta yine `Sicaklik` üretir. Benzer örnek: `datetime.fromisoformat`, `dict.fromkeys` birer classmethod\'dur.',
                 '`__init__` içinde `self._c = celsius` yazıp doğrulamayı atlamak. Setter içinde `self.celsius = deger` yazıp sonsuz özyinelemeye girmek (içeride `_c` kullan). Fahrenheit\'ı ayrı bir öznitelik olarak saklayıp iki değerin tutarsız hâle gelmesi.'),
    hints=['Doğrulamayı @celsius.setter içine koy ve __init__\'te self.celsius = ... ile onu kullan.', '@classmethod def fahrenheitten(cls, f): return cls(...)']))

probs.append(dict(
    id='a-099', title='Sepet: Pythonca konteyner', track=S, diff='Kolay', tags=['__len__', '__contains__', '__iter__'],
    src='Veri modeli (data model) dunder metotları', mode='func', fn='Sepet',
    statement=P('Anadolu Market mobil uygulaması için bir `Sepet` sınıfı yaz. Sepet, yerleşik konteynerler gibi davranmalı:',
                '<ul><li>`ekle(ad, adet=1)` — adet ≥ 1 olmalı, yoksa `ValueError`. Aynı ürün eklenirse adet artar.</li><li>`cikar(ad, adet=1)` — sepette yoksa `KeyError`; adet sıfıra ya da altına inerse ürün tamamen çıkar.</li><li>`len(sepet)` — <b>farklı</b> ürün sayısı.</li><li>`\'sut\' in sepet` — ürün sepette mi.</li><li>`for ad, adet in sepet` — ürün adına göre alfabetik gezinti.</li><li>`toplam_adet()` — tüm adetlerin toplamı.</li><li>Boş sepet `bool` bağlamında `False`.</li></ul>'),
    constraints='',
    samples=[("s = Sepet()\ns.ekle('sut', 2)\ns.ekle('ekmek')\ns.ekle('sut')\n(len(s), s.toplam_adet(), list(s))", '')],
    checks=["s = Sepet()\n(len(s), bool(s), list(s))", "s = Sepet()\ns.ekle('cay', 3)\ns.cikar('cay')\n('cay' in s, list(s))",
            "s = Sepet()\ns.ekle('cay', 3)\ns.cikar('cay', 5)\n('cay' in s, len(s), bool(s))",
            "s = Sepet()\nfor u in ['zeytin', 'bal', 'peynir', 'bal']:\n    s.ekle(u)\n[ad for ad, _ in s]", "s = Sepet()\ns.ekle('su', 6)\n('su' in s, 'kola' in s)",
            "s1 = Sepet()\ns2 = Sepet()\ns1.ekle('a')\n(len(s1), len(s2))"],
    raises=[('KeyError', "s = Sepet()\ns.cikar('yok')", 'olmayan ürün'), ('ValueError', "s = Sepet()\ns.ekle('x', 0)", 'adet 0')],
    start='class Sepet:\n    def __init__(self):\n        self._urunler = {}\n\n    def ekle(self, ad, adet=1):\n        pass\n',
    sol='''
class Sepet:
    def __init__(self):
        self._urunler = {}

    def ekle(self, ad, adet=1):
        if adet < 1:
            raise ValueError('Adet en az 1 olmalı')
        self._urunler[ad] = self._urunler.get(ad, 0) + adet

    def cikar(self, ad, adet=1):
        if ad not in self._urunler:
            raise KeyError(ad)
        kalan = self._urunler[ad] - adet
        if kalan <= 0:
            del self._urunler[ad]
        else:
            self._urunler[ad] = kalan

    def toplam_adet(self):
        return sum(self._urunler.values())

    def __len__(self):
        return len(self._urunler)

    def __contains__(self, ad):
        return ad in self._urunler

    def __iter__(self):
        for ad in sorted(self._urunler):
            yield ad, self._urunler[ad]
''',
    editorial=ed('Python\'ın veri modeli: `len(x)` → `x.__len__()`, `a in x` → `x.__contains__(a)`, `for … in x` → `x.__iter__()`. `__iter__`\'i üreteç (generator) olarak `yield` ile yazmak en kısa yoldur. `__bool__` tanımlanmazsa Python `__len__`\'e bakar: 0 ise `False` — boş sepet davranışı bedavaya gelir.',
                 '`ekle`, `cikar`, `in`, `len` O(1); gezinti sıralama yüzünden O(k log k).',
                 '`collections.Counter`\'dan türetmek de olur ama tüm Counter metotlarını (ör. negatif adetlere izin veren `subtract`) miras alırsın; bileşim (composition: içeride bir sözlük tutmak) genellikle daha güvenlidir.',
                 '`__iter__`\'ten liste yerine `return self._urunler` döndürmek: yineleyici (iterator) değil, sözlük döner ve `TypeError` alırsın. `__contains__` tanımlanmazsa `in` her elemanı `__iter__` ile gezerek demetlerle karşılaştırır ve `\'sut\' in s` False olur.'),
    hints=['len, in ve for için __len__, __contains__ ve __iter__ tanımla.', '__iter__ içinde sorted(self._urunler) üzerinde yield ad, adet yaz.']))

probs.append(dict(
    id='a-100', title='Kuruş hassasiyetli Para sınıfı', track=S, diff='Orta', tags=['operatör aşırı yükleme', 'total_ordering', '__hash__'],
    src='Money pattern (Martin Fowler) / Python veri modeli', mode='func', fn='Para',
    statement=P('Float ile para hesabı `0.1 + 0.2 = 0.30000000000000004` hatası verir. Anadolu Bank için tutarı içeride <b>tam sayı kuruş</b> olarak tutan bir `Para` sınıfı yaz:',
                '<ul><li>`Para(tutar, birim=\'TL\')` → `self.kurus = round(tutar * 100)`.</li><li>`+` ve `-`: aynı birimde yeni `Para`; farklı birimde `ValueError`. `sum(liste)` çalışsın diye `0 + para` da desteklensin (`__radd__`).</li><li>`*` ve sağdan çarpma: sayı ile çarpar, kuruşa yuvarlar (`round`).</li><li>`==`: birim ve kuruş aynıysa eşit; `Para` olmayanla karşılaştırma `False`.</li><li>`&lt;`, `&lt;=`, `&gt;`, `&gt;=`: aynı birimde; farklıysa `ValueError` (`functools.total_ordering` kullanabilirsin).</li><li>Sözlük anahtarı / kümede kullanılabilsin (`__hash__`).</li><li>`str` → `\'1.234,50 TL\'` (binlik nokta, ondalık virgül, negatifte başta `-`); `repr` → `\"Para(\'1234.50\', \'TL\')\"`.</li></ul>'),
    constraints='',
    samples=[('str(Para(0.1) + Para(0.2))', 'Kuruşla çalıştığı için tam 0,30.'), ("str(sum([Para(1000), Para(234.5), Para(0.05)]))", '')],
    checks=["Para(10) == Para(10.001)", "Para(5, 'USD') == Para(5, 'TL')", "Para(3) == 3", "repr(Para(-1234.5) * 2)",
            "str(3 * Para(0.335))", "str(Para(1000000) - Para(0.01))", "sorted([Para(5), Para(1.5), Para(3)])[0] <= Para(1.5)",
            "len({Para(1), Para(1.0), Para(1, 'EUR')})", "str(Para(-0.5))"],
    raises=[('ValueError', "Para(1, 'USD') + Para(1)", 'farklı birim toplama'), ('ValueError', "Para(1, 'USD') < Para(1)", 'farklı birim karşılaştırma')],
    start='from functools import total_ordering\n\nclass Para:\n    def __init__(self, tutar, birim=\'TL\'):\n        self.kurus = round(tutar * 100)\n        self.birim = birim\n',
    sol='''
from functools import total_ordering

@total_ordering
class Para:
    def __init__(self, tutar, birim='TL'):
        self.kurus = round(tutar * 100)
        self.birim = birim

    @classmethod
    def _kurustan(cls, kurus, birim):
        p = cls(0, birim)
        p.kurus = kurus
        return p

    def _ayni_birim(self, other):
        if self.birim != other.birim:
            raise ValueError(f'Birimler farklı: {self.birim} / {other.birim}')

    def __add__(self, other):
        if not isinstance(other, Para):
            return NotImplemented
        self._ayni_birim(other)
        return Para._kurustan(self.kurus + other.kurus, self.birim)

    def __radd__(self, other):
        if other == 0:
            return self
        return NotImplemented

    def __sub__(self, other):
        if not isinstance(other, Para):
            return NotImplemented
        self._ayni_birim(other)
        return Para._kurustan(self.kurus - other.kurus, self.birim)

    def __mul__(self, k):
        if not isinstance(k, (int, float)):
            return NotImplemented
        return Para._kurustan(round(self.kurus * k), self.birim)

    __rmul__ = __mul__

    def __eq__(self, other):
        if not isinstance(other, Para):
            return False
        return (self.kurus, self.birim) == (other.kurus, other.birim)

    def __lt__(self, other):
        if not isinstance(other, Para):
            return NotImplemented
        self._ayni_birim(other)
        return self.kurus < other.kurus

    def __hash__(self):
        return hash((self.kurus, self.birim))

    def __str__(self):
        isaret = '-' if self.kurus < 0 else ''
        lira, kurus = divmod(abs(self.kurus), 100)
        return f'{isaret}{lira:,}'.replace(',', '.') + f',{kurus:02d} {self.birim}'

    def __repr__(self):
        isaret = '-' if self.kurus < 0 else ''
        lira, kurus = divmod(abs(self.kurus), 100)
        return f"Para('{isaret}{lira}.{kurus:02d}', {self.birim!r})"
''',
    editorial=ed('Kuruşu tam sayı tut; tüm aritmetik tam sayıyla yapılır, yuvarlama hatası birikmez. Operatörler dunder metotlarla tanımlanır: `+` → `__add__`, sağdaki işlenen için `__radd__` (`sum` 0 ile başladığı için `0 + Para` gerekir), `3 * p` → `__rmul__`. `total_ordering`, `__eq__` ve `__lt__`\'ten diğer karşılaştırmaları üretir. `__eq__` tanımlayan sınıfın `__hash__`\'i Python tarafından `None` yapılır; kümede kullanmak için onu da yazmalısın (eşit nesneler eşit hash vermeli).',
                 'Tüm işlemler O(1); `str` O(basamak).',
                 'Standart kütüphanede `decimal.Decimal` ondalık aritmetiği hassas yapar; `Decimal(\'0.1\') + Decimal(\'0.2\') == Decimal(\'0.3\')`. Üretimde genellikle `Decimal` + birim alanı ya da `py-moneyed` gibi kütüphaneler kullanılır.',
                 'Desteklenmeyen türde `TypeError` fırlatmak yerine `NotImplemented` <b>döndürmek</b> gerekir; Python böylece diğer işlenenin ters metodunu dener. `__eq__` yazıp `__hash__`\'i unutmak → `TypeError: unhashable type`. Negatif tutarda `divmod(-50, 100)` = (−1, 50) olduğunu unutup `-1,50` basmak: işareti ayırıp mutlak değerle çalış.'),
    hints=['Tutarı round(tutar * 100) ile tam sayı kuruş olarak sakla; sonuçları kuruştan yeni nesne olarak üret.', 'sum() için __radd__ (0 + Para), kümeler için __hash__ gerekir; desteklenmeyen türde NotImplemented döndür.']))

emit('/home/claude/py/v3/a2/arena_02.js', probs)
