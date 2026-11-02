from a2common import *

M = 'Matematik'
IC = 'itertools ve collections'
probs = []

# ---------------------------------------------------------------- MATEMATİK
probs.append(dict(
    id='a-061', title='Özdeş meyve kolileri', track=M, diff='Kolay', tags=['ebob', 'math.gcd'],
    src='HackerRank Mathematics: GCD benzeri', mode='stdin',
    statement=P('Anadolu Market\'in Bursa deposunda <b>a</b> kilo elma ve <b>b</b> kilo armut var. Satın alma ekibi bunları <b>tamamen özdeş</b> kolilere bölmek istiyor: her kolide aynı miktar elma ve aynı miktar armut olacak, hiçbir meyve artmayacak.',
                'Yapılabilecek <b>en fazla</b> koli sayısını ve bir kolideki elma ile armut miktarını bul.'),
    input='Tek satırda iki tam sayı: `a b`',
    output='Tek satırda üç sayı: `koli_sayisi elma_koli_basi armut_koli_basi`',
    constraints='1 ≤ a, b ≤ 10^18',
    samples=[('12 18\n', '12 ve 18\'in en büyük ortak böleni 6: 6 koli, her kolide 2 elma ve 3 armut.'),
             ('7 13\n', 'Ortak bölen yalnız 1: tek koli, içinde her şey.')],
    hidden=['1 1\n', '100 100\n', '1 1000000000000000000\n', '1000000000000000000 999999999999999999\n',
            '48 180\n', '1024 4096\n', '999999937 999999937\n', '600851475143 6857\n'],
    start='a, b = map(int, input().split())\n# kodunu yaz\n',
    sol='''
import math

a, b = map(int, input().split())
g = math.gcd(a, b)
print(g, a // g, b // g)
''',
    editorial=ed('Koli sayısı hem <b>a</b>\'yı hem <b>b</b>\'yi tam bölmeli; en fazla koli için en büyük ortak bölen (EBOB, <i>greatest common divisor</i>) gerekir. `math.gcd` bunu Öklid algoritmasıyla hesaplar: `gcd(a, b) = gcd(b, a % b)`.',
                 'Öklid algoritması O(log min(a, b)) adımda biter; 10^18 bile birkaç düzine adımdır.',
                 'Öklid\'i kendin yaz: `while b: a, b = b, a % b`. Python 3.9+ ile `math.gcd` ikiden fazla argüman da alır.',
                 '1\'den min(a, b)\'ye kadar deneyerek bölen aramak: 10^18 için asla bitmez. Bölmede `/` kullanmak da büyük sayılarda float hassasiyetini kaybettirir; `//` kullan.'),
    hints=['Koli sayısı iki sayının da böleni olmalı. En büyüğünü arıyorsun.', 'math.gcd(a, b) ve tam sayı bölmesi (//) yeterli.']))

probs.append(dict(
    id='a-062', title='Kuryelerin buluşma anı', track=M, diff='Kolay', tags=['ekok', 'math.lcm'],
    src='Klasik EKOK problemi (Project Euler 5 benzeri)', mode='stdin',
    statement=P('Lezzet Kurye\'nin Alsancak deposundan sabah 09:00\'da <b>n</b> kurye aynı anda çıkıyor. Kurye <i>i</i>, turunu bitirip depoya her <b>t<sub>i</sub></b> dakikada bir geri dönüyor (hiç gecikmeden).',
                'Kuryelerin <b>hepsinin</b> yeniden aynı anda depoda olacağı ilk an, çıkıştan kaç dakika sonradır?'),
    input='İlk satırda `n`, ikinci satırda boşlukla ayrılmış `n` tam sayı: t<sub>1</sub> … t<sub>n</sub>',
    output='Tek tam sayı: dakika cinsinden süre.',
    constraints='1 ≤ n ≤ 1000, 1 ≤ t_i ≤ 10^6 (sonuç çok büyük olabilir)',
    samples=[('3\n20 30 45\n', 'EKOK(20, 30, 45) = 180: 180. dakikada üçü de depoda.'),
             ('2\n7 7\n', 'İkisi de 7 dakikada bir dönüyor.')],
    hidden=['1\n13\n', '4\n1 1 1 1\n', '5\n2 3 5 7 11\n', '3\n12 18 24\n', '6\n1000000 999999 999998 999997 999996 999995\n',
            {'gen': 'import random\nrandom.seed(62)\nn = 1000\nprint(n)\nprint(*[random.randint(1, 60) for _ in range(n)])'},
            '2\n6 4\n', '3\n17 34 51\n'],
    start='n = int(input())\nt = list(map(int, input().split()))\n# kodunu yaz\n',
    sol='''
import math

n = int(input())
t = list(map(int, input().split()))
sonuc = 1
for x in t:
    sonuc = sonuc * x // math.gcd(sonuc, x)
print(sonuc)
''',
    editorial=ed('Herkesin depoda olduğu an, tüm t<sub>i</sub>\'lerin ortak katıdır; ilk an ise en küçük ortak kattır (EKOK, <i>least common multiple</i>). İki sayının EKOK\'u `a * b // gcd(a, b)`; listeyi soldan sağa katlayarak (fold) tüm sayıların EKOK\'unu bulursun.',
                 'n adet gcd çağrısı: O(n · log M). Sonuç Python\'da sınırsız büyüklükte tam sayı olduğu için taşma yok.',
                 'Python 3.9+: `math.lcm(*t)` tek satırda çözer. `functools.reduce(lambda a, b: a * b // math.gcd(a, b), t)` de olur.',
                 'Sayıları doğrudan çarpmak (20·30·45 = 27000) ortak bir an verir ama <b>ilk</b> anı vermez. `a * b / gcd` yazmak float\'a çevirir ve büyük sonuçlarda yanlış sayı basar.'),
    hints=['Tüm sürelerin ortak katlarından en küçüğünü arıyorsun.', 'EKOK(a, b) = a * b // EBOB(a, b); bunu listeye tek tek uygula.']))

probs.append(dict(
    id='a-063', title='Kupon kodu dijital kökü', track=M, diff='Kolay', tags=['basamak', 'mod 9'],
    src='LeetCode 258 Add Digits benzeri', mode='func', fn='dijital_kok',
    statement=P('Anadolu Market kupon kodlarının sonuna bir kontrol rakamı ekliyor: sayının basamakları toplanır, sonuç tek basamaklı olana kadar işlem tekrarlanır. Buna <b>dijital kök</b> denir. Örn. 9875 → 9+8+7+5 = 29 → 2+9 = 11 → 1+1 = <b>2</b>.',
                '`dijital_kok(n)` fonksiyonunu yaz: negatif olmayan tam sayı `n` için dijital kökü döndürsün. `n` 10^18\'e kadar çıkabilir; döngüsüz, sabit zamanlı bir çözüm bulabilir misin?'),
    constraints='0 ≤ n ≤ 10^18',
    samples=[('dijital_kok(9875)', '29 → 11 → 2'), ('dijital_kok(0)', 'Sıfırın kökü sıfır.')],
    checks=['dijital_kok(5)', 'dijital_kok(9)', 'dijital_kok(10)', 'dijital_kok(18)', 'dijital_kok(999999999999999999)',
            'dijital_kok(10**18)', 'dijital_kok(123456789)', '[dijital_kok(k) for k in range(1, 20)]'],
    start='def dijital_kok(n):\n    # kodunu yaz\n    pass\n',
    sol='''
def dijital_kok(n):
    if n == 0:
        return 0
    return 1 + (n - 1) % 9
''',
    editorial=ed('Bir sayı ile basamakları toplamı 9\'a bölündüğünde aynı kalanı verir (10 ≡ 1 mod 9). Bu yüzden dijital kök, sayının 9\'a göre kalanıdır; tek fark kalanın 0 olduğu durumda kökün 9 olmasıdır (n &gt; 0 iken). Formül: `1 + (n - 1) % 9`, n = 0 için 0.',
                 'O(1). Basamak toplayan döngü O(log n) olurdu; burada sorun değil ama formül neden-sonuç ilişkisini öğretir.',
                 '`while n &gt;= 10: n = sum(map(int, str(n)))` okunabilir ve doğru bir çözümdür.',
                 '`n % 9` yazıp 9, 18, 27 gibi sayılarda 0 döndürmek. n = 0 durumunu unutup formülden 9 elde etmek.'),
    hints=['Bir sayının basamakları toplamı, 9\'a bölümünden kalanı değiştirmez.', '9\'un katları için sonuç 0 değil 9 olmalı; 0 ise ayrı durum.']))

probs.append(dict(
    id='a-064', title='Asal masa numarası', track=M, diff='Kolay', tags=['asallık', 'karekök'],
    src='HackerRank 30 Days: Running Time and Complexity benzeri', mode='stdin',
    statement=P('Pusula İK\'nın yıl sonu etkinliğinde masa numarası <b>asal</b> olan masalara sürpriz hediye çıkıyor. Organizasyon ekibi sana q masa numarası veriyor; her biri için asal olup olmadığını yaz.',
                'Numaralar 10^10\'a kadar çıkabilir, bu yüzden 2\'den n\'ye kadar denemek yetmez.'),
    input='İlk satırda `q`, sonra her satırda bir tam sayı `n`.',
    output='Her sayı için ayrı satırda `ASAL` ya da `DEGIL`.',
    constraints='1 ≤ q ≤ 20, 1 ≤ n ≤ 10^10',
    samples=[('4\n1\n2\n15\n97\n', '1 asal değildir; 2 en küçük asal; 15 = 3·5; 97 asal.')],
    hidden=['3\n3\n4\n9\n', '2\n25\n49\n', '1\n9999999967\n', '1\n10000000000\n', '3\n9999999943\n9999999929\n9999999937\n',
            '5\n2147483647\n1000000007\n998244353\n561\n1105\n', '2\n6\n7\n', '4\n121\n169\n289\n361\n'],
    brute='''
def asal(n):
    if n < 2: return False
    i = 2
    while i * i <= n:
        if n % i == 0: return False
        i += 1
    return True
q = int(input())
for _ in range(q):
    n = int(input())
    print('ASAL' if asal(n) and n < 10**8 or (n >= 10**8 and __import__('sympy', fromlist=['isprime']).isprime(n) if False else asal(n) if n < 10**8 else None) else 'DEGIL')
''' if False else None,
    start='q = int(input())\nfor _ in range(q):\n    n = int(input())\n    # kodunu yaz\n',
    sol='''
def asal_mi(n):
    if n < 2:
        return False
    if n < 4:
        return True
    if n % 2 == 0 or n % 3 == 0:
        return False
    i = 5
    while i * i <= n:
        if n % i == 0 or n % (i + 2) == 0:
            return False
        i += 6
    return True

q = int(input())
for _ in range(q):
    n = int(input())
    print('ASAL' if asal_mi(n) else 'DEGIL')
''',
    editorial=ed('n bileşikse en az bir böleni √n\'den küçük ya da eşittir; o yüzden yalnız `i * i &lt;= n` olana kadar dene. 2 ve 3\'ü ayrıca eledikten sonra tüm asallar 6k ± 1 biçimindedir; böylece adayların üçte ikisini atlarsın.',
                 'Sorgu başına O(√n): 10^10 için ~10^5 / 3 adım, 20 sorguda rahat.',
                 '`math.isqrt(n)` ile üst sınırı bir kez hesaplayıp `range(5, r + 1, 6)` kullanabilirsin. Çok büyük sayılar için Miller–Rabin olasılıksal testi gerekir.',
                 '1\'i asal saymak; döngü sınırını `i &lt; √n` yazıp 25, 49 gibi tam kareleri kaçırmak; `n ** 0.5` ile float karekök alıp büyük sayılarda yuvarlama hatasına düşmek.'),
    hints=['Bir bölen varsa karekökten küçük ya da eşit olanı da vardır.', '2 ve 3\'ü ayrıca ele; sonra 5, 7, 11, 13… yani i ve i+2 adımlarıyla 6\'şar ilerle.']))
probs[-1].pop('brute')

probs.append(dict(
    id='a-065', title='Asal numaralı siparişler', track=M, diff='Orta', tags=['eratosthenes', 'önek toplam'],
    src='Eratosthenes kalburu (SPOJ PRIME1 / klasik)', mode='stdin',
    statement=P('Anadolu Market bir kampanyada sipariş numarası <b>asal</b> olan müşterilere puan veriyor. Pazarlama ekibi çok sayıda soru soruyor: “1\'den N\'ye kadar kaç asal sipariş numarası var?”',
                'Her soru için cevabı hızlıca ver. Soru sayısı 10^5\'e kadar çıkabilir; her soruda baştan asal aramak yavaş kalır.'),
    input='İlk satırda `q`, sonra her satırda bir `N`.',
    output='Her soru için [1, N] aralığındaki asal sayıların adedi.',
    constraints='1 ≤ q ≤ 10^5, 1 ≤ N ≤ 10^6',
    samples=[('3\n10\n1\n100\n', '2,3,5,7 → 4; 1 için 0; 100\'e kadar 25 asal.')],
    hidden=['2\n2\n3\n', '1\n1000000\n', '4\n4\n5\n6\n7\n', '3\n999983\n999982\n999984\n', '1\n30\n',
            {'gen': 'import random\nrandom.seed(65)\nq = 100000\nprint(q)\nfor _ in range(q):\n    print(random.randint(1, 10**6))'},
            '2\n1000\n10000\n'],
    brute='''
q = int(input())
for _ in range(q):
    n = int(input())
    c = 0
    for k in range(2, n + 1):
        if all(k % d for d in range(2, int(k ** 0.5) + 1)):
            c += 1
    print(c)
''',
    start='import sys\n\nveri = sys.stdin.read().split()\nq = int(veri[0])\nsorgular = list(map(int, veri[1:1 + q]))\n# kodunu yaz\n',
    sol='''
import sys

veri = sys.stdin.read().split()
q = int(veri[0])
sorgular = list(map(int, veri[1:1 + q]))
M = max(sorgular)
asal = bytearray([1]) * (M + 1)
asal[0] = 0
if M >= 1:
    asal[1] = 0
i = 2
while i * i <= M:
    if asal[i]:
        asal[i * i::i] = bytearray(len(range(i * i, M + 1, i)))
    i += 1
say = [0] * (M + 1)
c = 0
for k in range(M + 1):
    c += asal[k]
    say[k] = c
print('\\n'.join(str(say[n]) for n in sorgular))
''',
    editorial=ed('Ön hesaplama (<i>precomputation</i>) yap: en büyük N\'ye kadar Eratosthenes kalburuyla asal tablosu kur, sonra önek toplam (prefix sum) dizisi `say[k]` = k\'ye kadarki asal adedi. Her soru artık tek bir dizi okumasıdır.',
                 'Kalbur O(M log log M), önek toplam O(M), sorgular O(q). Bellek O(M).',
                 'Sorgular sıralanıp tek geçişte de cevaplanabilir. numpy ile kalbur çok daha hızlıdır. Sorgu başına asallık testi O(q·N√N) olur ve zaman aşımına düşer.',
                 'Kalburda i\'nin katlarını `2 * i`den başlatmak (doğru ama yavaş; `i * i` yeterli). Çok sayıda satırı tek tek `print` ile yazmak yerine `\\n`.join kullan; 10^5 `input()` çağrısı yerine `sys.stdin.read()` daha hızlı.'),
    hints=['Her soru için yeniden hesaplama; en büyük N\'ye kadar bir kez kalbur kur.', 'say[k] = say[k-1] + (k asal mı) dizisiyle her soru O(1) olur.']))

probs.append(dict(
    id='a-066', title='Kredi taksiti', track=M, diff='Orta', tags=['anüite', 'float', 'round'],
    src='Finans matematiği: eşit taksitli kredi formülü', mode='func', fn='taksit',
    statement=P('Ilgaz Bank\'ın kredi hesaplayıcısını yazıyorsun. Eşit taksitli kredide aylık taksit şu formülle bulunur (anüite):',
                '<pre class="py">taksit = A · r · (1 + r)^n / ((1 + r)^n − 1)</pre>',
                'Burada A anapara, r aylık faiz oranı (yüzde değil, oran: %2 → 0.02), n ay sayısıdır.',
                '`taksit(anapara, aylik_faiz_yuzde, ay)` fonksiyonunu yaz. Faiz <b>yüzde</b> olarak gelir (ör. `2.5`). Sonucu 2 ondalığa yuvarla. Faiz 0 ise formül 0/0 olur; o durumda taksit `anapara / ay`dır. `ay` 1\'den küçükse ya da anapara negatifse `ValueError` fırlat.'),
    constraints='0 ≤ anapara ≤ 10^9, 0 ≤ aylik_faiz_yuzde ≤ 20, ay tam sayı',
    samples=[('taksit(100000, 2, 12)', '100 bin TL, aylık %2, 12 ay.'), ('taksit(12000, 0, 12)', 'Faizsiz: 12000 / 12.')],
    checks=['taksit(100000, 3.49, 36)', 'taksit(5000, 1.5, 1)', 'taksit(0, 2, 10)', 'taksit(250000, 4.25, 24)',
            'taksit(1000, 0, 3)', 'taksit(750000, 1.99, 120)'],
    raises=[('ValueError', 'taksit(1000, 2, 0)', 'ay = 0'), ('ValueError', 'taksit(-5, 2, 12)', 'negatif anapara')],
    start='def taksit(anapara, aylik_faiz_yuzde, ay):\n    # kodunu yaz\n    pass\n',
    sol='''
def taksit(anapara, aylik_faiz_yuzde, ay):
    if ay < 1 or anapara < 0:
        raise ValueError('Geçersiz kredi bilgisi')
    r = aylik_faiz_yuzde / 100
    if r == 0:
        return round(anapara / ay, 2)
    k = (1 + r) ** ay
    return round(anapara * r * k / (k - 1), 2)
''',
    editorial=ed('Yüzdeyi orana çevir (`/ 100`), `(1 + r) ** n` değerini bir kez hesaplayıp formüle koy. Faiz sıfırsa formül 0/0 olur; bunu ayrı dal olarak ele al. Girdi denetimini en başta yap ve hatalıysa `ValueError` fırlat (erken çıkış).',
                 'O(1); `**` üs alma sabit zamanlıdır.',
                 'Gerçek bankacılık yazılımında para hesapları `decimal.Decimal` ile ve belirli bir yuvarlama kuralıyla (`ROUND_HALF_UP`) yapılır; float burada öğretim için yeterli. Amortisman tablosu çıkarmak istersen her ay faiz = kalan · r, anapara payı = taksit − faiz.',
                 'Yüzdeyi orana çevirmeyi unutmak (2 yerine 0.02); faiz 0 iken `ZeroDivisionError` almak; `round` yerine string biçimlendirme döndürmek (`f\'{x:.2f}\'` bir str\'dir).'),
    hints=['r = aylik_faiz_yuzde / 100 ve k = (1 + r) ** ay ile formül kısalır.', 'r == 0 için ayrı dal yaz; hatalı girdide raise ValueError(...).']))

probs.append(dict(
    id='a-067', title='Anahtar üretimi: hızlı üs', track=M, diff='Orta', tags=['modüler üs', 'pow'],
    src='Modular exponentiation (CSES Exponentiation benzeri)', mode='stdin',
    statement=P('Ilgaz Bank\'ın güvenlik ekibi, test ortamında basit bir anahtar üretiminde `a^b mod m` değerine ihtiyaç duyuyor. Üs `b` 10^18\'e kadar çıkabiliyor; önce `a ** b` hesaplayıp sonra mod almak bellek ve zaman açısından imkânsız.',
                'Her sorgu için `a^b mod m` değerini yaz. Not: `0^0` bu problemde 1 kabul edilir (sonra mod m alınır).'),
    input='İlk satırda `q`, sonra her satırda `a b m`.',
    output='Her sorgu için tek satırda sonuç.',
    constraints='1 ≤ q ≤ 10^4, 0 ≤ a ≤ 10^18, 0 ≤ b ≤ 10^18, 1 ≤ m ≤ 10^18',
    samples=[('3\n2 10 1000\n3 0 7\n5 3 1\n', '2^10 = 1024 → 24; herhangi bir sayının 0. kuvveti 1; mod 1 her zaman 0.')],
    hidden=['1\n0 0 5\n', '1\n0 5 7\n', '2\n10 18 1000000007\n123456789 987654321 998244353\n', '1\n2 1000000000000000000 1000000000000000000\n',
            '1\n999999999999999999 999999999999999999 999999999999999989\n', '2\n7 1 3\n7 2 3\n',
            {'gen': 'import random\nrandom.seed(67)\nq = 10000\nprint(q)\nfor _ in range(q):\n    print(random.randint(0, 10**18), random.randint(0, 10**18), random.randint(1, 10**18))'}],
    start='q = int(input())\nfor _ in range(q):\n    a, b, m = map(int, input().split())\n    # kodunu yaz\n',
    sol='''
import sys

def us_mod(a, b, m):
    sonuc = 1 % m
    a %= m
    while b > 0:
        if b & 1:
            sonuc = sonuc * a % m
        a = a * a % m
        b >>= 1
    return sonuc

veri = sys.stdin.read().split()
q = int(veri[0])
cikti = []
for i in range(q):
    a, b, m = int(veri[1 + 3 * i]), int(veri[2 + 3 * i]), int(veri[3 + 3 * i])
    cikti.append(str(us_mod(a, b, m)))
print('\\n'.join(cikti))
''',
    editorial=ed('Kare-al-ve-çarp (<i>binary exponentiation</i>): b\'yi ikili düşün. Her adımda b\'nin son biti 1 ise sonucu a ile çarp, sonra a\'nın karesini al ve b\'yi bir bit sağa kaydır. Her çarpımdan sonra mod alarak sayıları küçük tutarsın.',
                 'Sorgu başına O(log b) çarpma: 10^18 için yaklaşık 60 adım.',
                 'Python\'ın yerleşik üç argümanlı `pow(a, b, m)` fonksiyonu aynı algoritmayı C hızında uygular; gerçek kodda onu kullan. Algoritmayı bir kez kendin yazmak mülakatlarda çok sorulur.',
                 '`a ** b % m` yazmak: önce dev sayıyı üretmeye çalışır, bitmez. `m = 1` durumunda başlangıç değerini `1` bırakmak (`1 % m` olmalı). Ara çarpımlarda mod almayı unutmak.'),
    hints=['b\'yi ikili sayı olarak düşün: a^13 = a^8 · a^4 · a^1.', 'Her çarpımdan sonra % m al. Yerleşik pow(a, b, m) da var.']))

probs.append(dict(
    id='a-068', title='Kısa sipariş kodu', track=M, diff='Orta', tags=['taban dönüşümü', 'divmod'],
    src='Base conversion (LeetCode 504/405 benzeri)', mode='func', fn='tabana_cevir',
    statement=P('Kanat Havayolları rezervasyon numaralarını kısaltmak için sayıları 36 tabanında (0–9 ve A–Z) yazmak istiyor. Örn. 1295 → `ZZ`, 1296 → `100`.',
                '`tabana_cevir(n, taban)` fonksiyonunu yaz: tam sayı `n`\'i verilen tabanda (2–36) büyük harfli string olarak döndürsün. Negatif sayılarda başa `-` gelsin; 0 için `\'0\'`. Taban aralık dışındaysa `ValueError` fırlat.',
                'Python\'daki `int(s, taban)` ters yönü yapar ama sayıdan stringe hazır bir genel fonksiyon yok (yalnız `bin`, `oct`, `hex`).'),
    constraints='-10^18 ≤ n ≤ 10^18, taban tam sayı',
    samples=[('tabana_cevir(1295, 36)', ''), ('tabana_cevir(10, 2)', ''), ('tabana_cevir(-255, 16)', 'Negatifte işaret başa gelir.')],
    checks=['tabana_cevir(0, 7)', 'tabana_cevir(1296, 36)', 'tabana_cevir(35, 36)', 'tabana_cevir(10**18, 36)',
            'tabana_cevir(-1, 2)', 'tabana_cevir(123456789, 10)', 'int(tabana_cevir(987654321987, 29), 29)'],
    raises=[('ValueError', 'tabana_cevir(10, 1)', 'taban 1'), ('ValueError', 'tabana_cevir(10, 37)', 'taban 37')],
    start='def tabana_cevir(n, taban):\n    # kodunu yaz\n    pass\n',
    sol='''
RAKAMLAR = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'

def tabana_cevir(n, taban):
    if not 2 <= taban <= 36:
        raise ValueError('Taban 2 ile 36 arasında olmalı')
    if n == 0:
        return '0'
    isaret = '-' if n < 0 else ''
    n = abs(n)
    parcalar = []
    while n:
        n, kalan = divmod(n, taban)
        parcalar.append(RAKAMLAR[kalan])
    return isaret + ''.join(reversed(parcalar))
''',
    editorial=ed('Tekrarlı bölme: `divmod(n, taban)` ile kalan son basamağı verir, bölüm ile devam edersin. Basamaklar sağdan sola üretildiği için listeye ekleyip sonunda ters çevir. İşareti başta ayırıp mutlak değerle çalış.',
                 'O(log<sub>taban</sub> n) adım.',
                 'Özyinelemeli çözüm: `tabana_cevir(n // t, t) + RAKAMLAR[n % t]`. Ters yön için `int(s, taban)` var; testlerde gidiş-dönüş (round trip) kontrolü güzel bir doğrulama yöntemidir.',
                 'Python\'da negatif sayıda `%` pozitif kalan verir (−7 % 2 == 1); işareti ayırmadan bölersen döngü sonsuza gidebilir. 0 için boş string döndürmek. String\'i her adımda başa ekleyerek (`s = r + s`) O(k²) maliyete girmek.'),
    hints=['divmod(n, taban) hem bölümü hem kalanı verir; kalan son basamaktır.', 'Negatif sayıyı abs ile pozitife çevir, işareti en sonda başa ekle; 0\'ı ayrıca ele.']))

probs.append(dict(
    id='a-069', title='Kampanya numaraları', track=M, diff='Zor', tags=['içerme-dışlama', 'ekok', 'bitmask'],
    src='Inclusion–exclusion (CSES Prime Multiples benzeri)', mode='stdin',
    statement=P('Anadolu Market bir “şanslı sipariş” kampanyası yapıyor: sipariş numarası verilen k sayıdan <b>en az birine</b> tam bölünen siparişlere hediye çıkıyor. Sipariş numaraları 1\'den N\'ye kadar.',
                'Kaç siparişe hediye çıkar? N 10^18\'e kadar olduğu için tek tek saymak mümkün değil. Sayılar asal olmak zorunda değil ve tekrar edebilir.'),
    input='İlk satırda `N k`, ikinci satırda `k` tam sayı.',
    output='Tek tam sayı: hediye alan sipariş adedi.',
    constraints='1 ≤ N ≤ 10^18, 1 ≤ k ≤ 15, 1 ≤ a_i ≤ 10^18',
    samples=[('20 2\n2 3\n', '2\'ye bölünen 10, 3\'e bölünen 6, ikisine birden (6\'ya) bölünen 3: 10 + 6 − 3 = 13.'),
             ('100 3\n4 6 10\n', 'Asal olmayan sayılarda kesişim EKOK ile bulunur: EKOK(4, 6) = 12.')],
    hidden=['10 1\n1\n', '10 2\n5 5\n', '1 3\n2 3 5\n', '1000 3\n7 11 13\n', '30 4\n2 4 8 16\n', '999 2\n1000 2000\n',
            '1000000 5\n2 3 5 7 11\n', '987 6\n6 10 15 21 35 14\n'],
    brute='''
N, k = map(int, input().split())
a = list(map(int, input().split()))
print(sum(1 for x in range(1, N + 1) if any(x % d == 0 for d in a)))
''',
    start='N, k = map(int, input().split())\na = list(map(int, input().split()))\n# kodunu yaz\n',
    sol='''
import math

N, k = map(int, input().split())
a = list(set(map(int, input().split())))
k = len(a)
toplam = 0
for maske in range(1, 1 << k):
    l = 1
    bit = 0
    for i in range(k):
        if maske >> i & 1:
            bit += 1
            l = l * a[i] // math.gcd(l, a[i])
            if l > N:
                break
    if l > N:
        continue
    if bit % 2 == 1:
        toplam += N // l
    else:
        toplam -= N // l
print(toplam)
''',
    editorial=ed('İçerme–dışlama ilkesi (<i>inclusion–exclusion</i>): |A₁ ∪ … ∪ A<sub>k</sub>| = tekli kümelerin toplamı − ikili kesişimler + üçlü kesişimler − … Bir alt kümedeki tüm sayılara bölünenler, onların EKOK\'una bölünenlerdir; adedi `N // ekok`. Alt kümeleri 1\'den 2^k − 1\'e kadar bit maskesiyle (bitmask) gez; seçili eleman sayısı tekse ekle, çiftse çıkar.',
                 'O(2^k · k · log) — k = 15 için ~500 bin işlem. EKOK N\'yi aşarsa terim 0 olur; erken kesmek büyük sayıların gereksiz büyümesini de önler.',
                 '`itertools.combinations(a, r)` ile r = 1..k için alt kümeleri dolaşmak daha okunur: işaret `(-1) ** (r + 1)`. Tekrarlanan sayıları `set` ile temizlemek gereklidir; yoksa aynı küme iki kez sayılıp çıkarılır ama sonuç yine doğru kalır — yine de iş yükü ikiye katlanır.',
                 'Kesişimi çarpımla hesaplamak (4 ve 6 için 24 değil EKOK 12). 1..N arasında döngü kurmak (10^18). EKOK\'un N\'yi aştığı durumda gereksiz devam edip devasa sayılar üretmek.'),
    hints=['A ∪ B = A + B − (A ∩ B). Üç ve daha fazla küme için işaretler sırayla değişir.', 'Bir alt kümedeki sayıların hepsine bölünenlerin sayısı N // EKOK(alt küme).']))

probs.append(dict(
    id='a-070', title='Mülakat komisyonu sayısı', track=M, diff='Zor', tags=['kombinasyon', 'modüler ters', 'faktöriyel'],
    src='nCr mod p (CSES Binomial Coefficients benzeri)', mode='stdin',
    statement=P('Pusula İK, işe alım süreçleri için farklı büyüklüklerde komisyonlar kuruyor: n çalışan arasından r kişilik bir komisyon kaç farklı şekilde seçilebilir? Sonuçlar çok büyük olduğundan cevabı <b>10^9 + 7</b>\'ye göre kalan olarak ver.',
                'Sorgu sayısı 10^5\'e kadar; her sorguda C(n, r)\'yi baştan hesaplamak zaman aşımına düşer. r &gt; n ise cevap 0.'),
    input='İlk satırda `q`, sonra her satırda `n r`.',
    output='Her sorgu için C(n, r) mod 1 000 000 007.',
    constraints='1 ≤ q ≤ 10^5, 0 ≤ n, r ≤ 10^6',
    samples=[('3\n5 2\n10 0\n3 5\n', 'C(5,2) = 10; boş komisyon tek yolla seçilir; 3 kişiden 5 kişilik komisyon olmaz.')],
    hidden=['2\n0 0\n1 1\n', '1\n1000000 500000\n', '3\n52 5\n100 50\n1000 999\n', '2\n1000000 0\n1000000 1000000\n',
            '1\n999999 123456\n',
            {'gen': 'import random\nrandom.seed(70)\nq = 100000\nprint(q)\nfor _ in range(q):\n    n = random.randint(0, 10**6)\n    print(n, random.randint(0, n + 5))'},
            '2\n20 10\n30 15\n'],
    brute='''
import math
q = int(input())
for _ in range(q):
    n, r = map(int, input().split())
    print(math.comb(n, r) % (10**9 + 7) if r <= n else 0)
''',
    start='import sys\n\nMOD = 10**9 + 7\nveri = sys.stdin.read().split()\nq = int(veri[0])\n# kodunu yaz\n',
    sol='''
import sys

MOD = 10**9 + 7
veri = sys.stdin.read().split()
q = int(veri[0])
ns = list(map(int, veri[1::2]))
rs = list(map(int, veri[2::2]))
M = max(ns) if ns else 0
fakt = [1] * (M + 1)
for i in range(1, M + 1):
    fakt[i] = fakt[i - 1] * i % MOD
ters = [1] * (M + 1)
ters[M] = pow(fakt[M], MOD - 2, MOD)
for i in range(M, 0, -1):
    ters[i - 1] = ters[i] * i % MOD
cikti = []
for n, r in zip(ns, rs):
    if r < 0 or r > n:
        cikti.append('0')
    else:
        cikti.append(str(fakt[n] * ters[r] % MOD * ters[n - r] % MOD))
print('\\n'.join(cikti))
''',
    editorial=ed('C(n, r) = n! / (r! · (n−r)!). Mod p (asal) altında bölme, modüler ters ile çarpmaya dönüşür. Fermat\'ın küçük teoremi: x<sup>p−2</sup> ≡ x<sup>−1</sup> (mod p). En büyük n\'ye kadar faktöriyelleri ön hesapla; ters faktöriyelleri ise <b>tek</b> bir `pow` ile en üstten başlayıp `ters[i−1] = ters[i] · i` ile aşağı doğru doldur.',
                 'Ön hesaplama O(M + log p), sorgu başına O(1). 10^6 elemanlık iki liste yaklaşık 16 MB.',
                 '`math.comb(n, r) % MOD` doğru ama her sorguda yüz binlerce basamaklı sayı üretir; 10^5 sorguda çok yavaş. Küçük n için Pascal üçgeni (DP) de kullanılabilir.',
                 'Mod altında `/` kullanmak (yanlış sonuç). Her ters için ayrı `pow` çağırmak (10^6 · log p — yavaş ama geçebilir). r &gt; n durumunu unutup negatif indeksle sessizce yanlış cevap üretmek.'),
    hints=['n!, r! ve (n−r)!\'yi bir kez hesaplayıp sakla. Bölme yerine modüler ters kullan.', 'pow(x, MOD - 2, MOD) x\'in tersidir; ters faktöriyelleri sondan başa tek pow ile doldurabilirsin.']))

# ---------------------------------------------------------------- ITERTOOLS / COLLECTIONS
probs.append(dict(
    id='a-071', title='Haftanın en çok satanları', track=IC, diff='Kolay', tags=['Counter', 'sorted'],
    src='HackerRank Collections: Company Logo benzeri', mode='stdin',
    statement=P('Anadolu Market\'in kasa kayıtlarında her satış, ürün adıyla bir satır olarak tutuluyor. Haftalık bültende <b>en çok satan k ürünü</b> yayınlamak istiyorsun.',
                'Sıralama satış adedine göre <b>azalan</b>; adetler eşitse ürün adına göre <b>alfabetik</b> (Python\'ın normal string sıralaması). k, farklı ürün sayısından büyükse olanların hepsini yaz.'),
    input='İlk satırda `n k`, sonra her satırda bir ürün adı (boşluk içermez).',
    output='Her satırda `urun adet`.',
    constraints='1 ≤ n ≤ 10^5, 1 ≤ k ≤ 100',
    samples=[('7 2\nsut\nekmek\nsut\nyumurta\nekmek\nsut\npeynir\n', 'sut 3 kez, ekmek 2 kez.'),
             ('4 3\nzeytin\nbal\nzeytin\nbal\n', 'Eşit adette alfabetik: bal, zeytin. Yalnız 2 farklı ürün var.')],
    hidden=['1 1\ncay\n', '5 5\na\nb\nc\nd\ne\n', '6 1\nkahve\ncay\ncay\nkahve\nsu\nsu\n', '3 2\nB\na\nA\n',
            {'gen': 'import random\nrandom.seed(71)\nurunler = ["urun" + str(i) for i in range(300)]\nn = 100000\nprint(n, 10)\nfor _ in range(n):\n    print(random.choice(urunler[:random.randint(1, 300)]))'},
            '8 3\nx\ny\nz\nx\ny\nz\nw\nw\n'],
    start='import sys\n\nsatirlar = sys.stdin.read().split()\nn, k = int(satirlar[0]), int(satirlar[1])\nurunler = satirlar[2:2 + n]\n# kodunu yaz\n',
    sol='''
import sys
from collections import Counter

satirlar = sys.stdin.read().split()
n, k = int(satirlar[0]), int(satirlar[1])
urunler = satirlar[2:2 + n]
sayac = Counter(urunler)
sirali = sorted(sayac.items(), key=lambda t: (-t[1], t[0]))
for ad, adet in sirali[:k]:
    print(ad, adet)
''',
    editorial=ed('`Counter` her ürünün kaç kez geçtiğini tek satırda sayar. Sıralama için anahtar `(-adet, ad)`: eksi işareti adedi azalan, ad ise eşitlikte artan sıraya koyar. Sonra ilk k elemanı al.',
                 'Sayma O(n), sıralama O(u log u) (u = farklı ürün sayısı).',
                 '`sayac.most_common(k)` eşitlikte ilk görülme sırasını korur, alfabetik değil; bu yüzden burada tek başına yetmez. Çok büyük u için `heapq.nsmallest(k, ..., key=...)` O(u log k) çalışır.',
                 '`most_common` sonucunu doğrudan basmak (eşitlik sırası yanlış). `sorted(..., reverse=True)` kullanınca adlar da ters sıralanır.'),
    hints=['collections.Counter(liste) adetleri sayar.', 'sorted(..., key=lambda t: (-t[1], t[0])) ile iki ölçütlü sıralama yap.']))

probs.append(dict(
    id='a-072', title='Kategoriye göre raf listesi', track=IC, diff='Kolay', tags=['defaultdict', 'gruplama'],
    src='defaultdict ile gruplama (HackerRank DefaultDict Tutorial benzeri)', mode='func', fn='kategori_grupla',
    statement=P('Anadolu Market\'in yeni depo yazılımında raf etiketleri basılacak. Elinde `(urun_adi, kategori)` ikililerinden oluşan bir liste var.',
                '`kategori_grupla(urunler)` fonksiyonunu yaz: her kategori için o kategorideki ürün adlarını <b>alfabetik sıralı</b> ve <b>tekrarsız</b> listeleyen bir sözlük döndürsün. Sözlüğün anahtarları da alfabetik sırada eklensin (dönen değer düz `dict` olsun).'),
    constraints='0 ≤ len(urunler) ≤ 10^4',
    samples=[("kategori_grupla([('elma', 'meyve'), ('sut', 'sut urunleri'), ('armut', 'meyve')])", ''),
             ('kategori_grupla([])', 'Boş liste → boş sözlük.')],
    checks=["kategori_grupla([('a', 'x')])", "kategori_grupla([('elma', 'meyve'), ('elma', 'meyve'), ('ayva', 'meyve')])",
            "list(kategori_grupla([('k', 'z'), ('m', 'a'), ('n', 'm')]))", "type(kategori_grupla([('k', 'z')])).__name__",
            "kategori_grupla([('Zeytin', 'kahvalti'), ('bal', 'kahvalti'), ('Bal', 'kahvalti')])",
            "kategori_grupla([('deterjan', 'temizlik'), ('sabun', 'temizlik'), ('cay', 'icecek'), ('su', 'icecek'), ('ayran', 'icecek')])"],
    start='from collections import defaultdict\n\ndef kategori_grupla(urunler):\n    # kodunu yaz\n    pass\n',
    sol='''
from collections import defaultdict

def kategori_grupla(urunler):
    gruplar = defaultdict(set)
    for ad, kategori in urunler:
        gruplar[kategori].add(ad)
    return {k: sorted(gruplar[k]) for k in sorted(gruplar)}
''',
    editorial=ed('`defaultdict(set)` olmayan anahtar istendiğinde otomatik boş küme oluşturur; böylece “anahtar var mı?” kontrolü yazmazsın. Küme tekrarları atar. Sonunda kategorileri sıralı gezip her kümeyi `sorted` ile listeye çevirerek düz bir `dict` kurarsın.',
                 'O(n + Σ g log g): ekleme O(1), her grubun sıralanması.',
                 '`d.setdefault(k, set()).add(ad)` düz dict ile aynı işi yapar. Veri zaten kategoriye göre sıralıysa `itertools.groupby` da kullanılabilir.',
                 'defaultdict\'i olduğu gibi döndürmek (tip testi ve yanlışlıkla anahtar oluşturma riski). Liste kullanıp tekrarları atmamak. Büyük harfli adların küçük harflilerden önce sıralandığını unutmak (\'Bal\' &lt; \'bal\').'),
    hints=['defaultdict(set) ile her kategoriye ad ekle; küme tekrarı kendisi atar.', 'Dönüşte {k: sorted(v) ...} ile düz ve sıralı bir sözlük kur.']))

probs.append(dict(
    id='a-073', title='ATM son işlemler ekranı', track=IC, diff='Kolay', tags=['deque', 'maxlen'],
    src='collections.deque (HackerRank Collections.deque benzeri)', mode='stdin',
    statement=P('Ilgaz Bank ATM\'lerinde “Son işlemler” ekranı yalnız en son <b>k</b> işlemi gösterir. Bir günlük komut akışını simüle et:',
                '<ul><li>`ISLEM x` — x tutarlı (tam sayı, negatif olabilir) işlem kaydedilir.</li><li>`SON` — ekranda görünen işlemleri en <b>yeniden eskiye</b> doğru, boşlukla ayrılmış yaz. Hiç işlem yoksa `BOS` yaz.</li><li>`TEMIZLE` — ekran sıfırlanır.</li></ul>'),
    input='İlk satırda `k`, ikinci satırda komut sayısı `q`, sonra `q` komut.',
    output='Her `SON` komutu için bir satır.',
    constraints='1 ≤ k ≤ 1000, 1 ≤ q ≤ 2·10^5',
    samples=[('3\n6\nISLEM 100\nISLEM -50\nSON\nISLEM 20\nISLEM 75\nSON\n', 'İlk SON: -50 100. İkinci SON: en eski olan 100 ekrandan düştü.')],
    hidden=['1\n2\nSON\nISLEM 5\n', '2\n5\nISLEM 1\nTEMIZLE\nSON\nISLEM 2\nSON\n', '1\n4\nISLEM 1\nISLEM 2\nISLEM 3\nSON\n',
            '5\n3\nISLEM 0\nISLEM -1\nSON\n',
            {'gen': 'import random\nrandom.seed(73)\nk = 1000\nq = 200000\nprint(k)\nprint(q)\nfor i in range(q):\n    r = random.random()\n    if r < 0.0005:\n        print("SON")\n    elif r < 0.0006:\n        print("TEMIZLE")\n    else:\n        print("ISLEM", random.randint(-10**6, 10**6))'},
            '4\n7\nSON\nISLEM 9\nISLEM 8\nTEMIZLE\nTEMIZLE\nSON\nSON\n'],
    start='from collections import deque\n\nk = int(input())\nq = int(input())\nfor _ in range(q):\n    komut = input().split()\n    # kodunu yaz\n',
    sol='''
import sys
from collections import deque

satirlar = sys.stdin.read().split('\\n')
k = int(satirlar[0])
q = int(satirlar[1])
ekran = deque(maxlen=k)
cikti = []
for satir in satirlar[2:2 + q]:
    p = satir.split()
    if p[0] == 'ISLEM':
        ekran.append(p[1])
    elif p[0] == 'SON':
        cikti.append(' '.join(reversed(ekran)) if ekran else 'BOS')
    else:
        ekran.clear()
print('\\n'.join(cikti))
''',
    editorial=ed('`deque(maxlen=k)` dolduğunda yeni eleman eklenince en eski eleman otomatik olarak diğer uçtan düşer: tam aradığımız “son k” davranışı. Yazdırırken `reversed(ekran)` ile yeniden eskiye gez.',
                 'Ekleme O(1), her SON O(k).',
                 'Düz listeyle `liste.append(x); if len(liste) &gt; k: liste.pop(0)` de çalışır ama `pop(0)` O(k) maliyetlidir; çok işlemde yavaşlar. Dilimleme `liste[-k:]` ise her seferinde kopya üretir.',
                 'Eskiden yeniye yazmak; ekran boşken boş satır basmak (`BOS` bekleniyor); tutarları int\'e çevirip sonra yine stringe çevirmek gereksiz iş.'),
    hints=['deque(maxlen=k) en eski elemanı kendisi atar.', 'Yeniden eskiye yazdırmak için reversed(deque) kullan.']))

probs.append(dict(
    id='a-074', title='Bütçeye uygun ikili paketler', track=IC, diff='Kolay', tags=['combinations', 'itertools'],
    src='itertools.combinations (HackerRank itertools.combinations benzeri)', mode='func', fn='ikili_paketler',
    statement=P('Anadolu Market “ikisi bir arada” kampanyası hazırlıyor. Elinde `(urun, fiyat)` listesi ve bir bütçe var.',
                '`ikili_paketler(urunler, butce)` fonksiyonunu yaz: toplam fiyatı bütçeyi <b>aşmayan</b> tüm farklı ürün ikililerini `(ad1, ad2)` demetleri olarak döndürsün. İkililer, listedeki sıraya göre `itertools.combinations`\'ın ürettiği sırada olsun (ad1 listede ad2\'den önce gelir).'),
    constraints='0 ≤ len(urunler) ≤ 200, fiyatlar pozitif tam sayı',
    samples=[("ikili_paketler([('cay', 40), ('seker', 30), ('kahve', 90)], 100)", 'cay+seker = 70 uygun, cay+kahve = 130 ve seker+kahve = 120 aşıyor.')],
    checks=["ikili_paketler([], 50)", "ikili_paketler([('a', 10)], 50)", "ikili_paketler([('a', 10), ('b', 40)], 50)",
            "ikili_paketler([('a', 10), ('b', 41)], 50)", "ikili_paketler([('x', 5), ('y', 5), ('z', 5), ('w', 100)], 10)",
            "len(ikili_paketler([('u' + str(i), i) for i in range(1, 101)], 100))",
            "ikili_paketler([('elma', 25), ('armut', 25), ('muz', 75), ('kivi', 50)], 75)"],
    start='from itertools import combinations\n\ndef ikili_paketler(urunler, butce):\n    # kodunu yaz\n    pass\n',
    sol='''
from itertools import combinations

def ikili_paketler(urunler, butce):
    return [(a[0], b[0]) for a, b in combinations(urunler, 2) if a[1] + b[1] <= butce]
''',
    editorial=ed('`combinations(liste, 2)` her ikiliyi bir kez ve sıra korunarak üretir (i &lt; j). Liste kavrayışı içinde bütçe koşuluyla süzgeçten geçir.',
                 'O(n²) ikili; n = 200 için ~20 bin, sorun değil.',
                 'İç içe iki `for` ile `range(i + 1, n)` aynı sonucu verir. Yalnız ikili sayısı lazım olsaydı fiyatları sıralayıp iki işaretçi (two pointers) ile O(n log n) çözülebilirdi. Sıra önemli olsaydı `permutations`, aynı ürün iki kez seçilebilseydi `combinations_with_replacement` kullanılırdı.',
                 '`permutations` kullanıp her ikiliyi iki kez üretmek; “aşmayan” yerine `&lt;` yazıp tam bütçeye eşit paketleri kaçırmak.'),
    hints=['itertools.combinations(urunler, 2) tüm ikilileri verir.', 'Her ikilide fiyatları topla, <= butce olanların adlarını demet olarak al.']))

probs.append(dict(
    id='a-075', title='Son k günün zirvesi', track=IC, diff='Orta', tags=['deque', 'kayan pencere', 'monoton kuyruk'],
    src='Sliding Window Maximum (LeetCode 239 benzeri)', mode='stdin',
    statement=P('Pedal İzmir, istasyon kapasitesini planlamak için her gün için “son k günün en yüksek kiralama sayısı”nı görmek istiyor. Günlük kiralama sayıları sırayla verildiğinde, k uzunluğundaki her pencere için en büyük değeri yaz.',
                'n 2·10^5\'e kadar çıkıyor; her pencerede `max` almak (O(n·k)) yavaş kalır.'),
    input='İlk satırda `n k`, ikinci satırda `n` tam sayı.',
    output='Tek satırda, boşlukla ayrılmış `n − k + 1` sayı.',
    constraints='1 ≤ k ≤ n ≤ 2·10^5, 0 ≤ değer ≤ 10^9',
    samples=[('8 3\n4 2 12 3 8 1 5 6\n', 'Pencereler: [4,2,12]→12, [2,12,3]→12, [12,3,8]→12, [3,8,1]→8, [8,1,5]→8, [1,5,6]→6.')],
    hidden=['1 1\n7\n', '5 5\n1 9 3 9 2\n', '5 1\n3 1 4 1 5\n', '6 2\n6 5 4 3 2 1\n', '6 3\n1 2 3 4 5 6\n', '7 3\n5 5 5 5 5 5 5\n',
            {'gen': 'import random\nrandom.seed(75)\nn = 200000\nk = 1000\nprint(n, k)\nprint(*[random.randint(0, 10**9) for _ in range(n)])'},
            {'gen': 'n = 200000\nk = 50000\nprint(n, k)\nprint(*range(n, 0, -1))'}],
    brute='''
n, k = map(int, input().split())
a = list(map(int, input().split()))
print(*[max(a[i:i + k]) for i in range(n - k + 1)])
''',
    start='from collections import deque\n\nn, k = map(int, input().split())\na = list(map(int, input().split()))\n# kodunu yaz\n',
    sol='''
from collections import deque

n, k = map(int, input().split())
a = list(map(int, input().split()))
dq = deque()
sonuc = []
for i, x in enumerate(a):
    while dq and a[dq[-1]] <= x:
        dq.pop()
    dq.append(i)
    if dq[0] <= i - k:
        dq.popleft()
    if i >= k - 1:
        sonuc.append(a[dq[0]])
print(*sonuc)
''',
    editorial=ed('Monoton kuyruk: deque\'te <b>indeksleri</b> değerleri azalan sırada tut. Yeni değer gelince ondan küçük ya da eşit olanları sağdan at (artık hiçbir pencerede maksimum olamazlar). Soldaki indeks pencereden çıktıysa `popleft`. Pencerenin maksimumu her zaman `dq[0]`dadır.',
                 'Her indeks deque\'e en fazla bir kez girip bir kez çıkar: toplam O(n). Bellek O(k).',
                 'Kaba kuvvet `max(a[i:i+k])` O(n·k). `heapq` ile (değer, indeks) yığını O(n log n) çalışır; tembel silme gerekir. Blok önek/sonek maksimum yöntemi de O(n)\'dir.',
                 'Deque\'te değer tutmak (pencereden çıkışı anlayamazsın). `&lt;` ile atıp eşit değerleri bırakmak doğru ama gereksiz büyür; `&lt;=` daha temiz. İlk k − 1 adımda çıktı üretmek.'),
    hints=['Yeni gelen değerden küçük olan eski değerler bir daha asla maksimum olamaz; onları at.', 'Deque\'te indeks tut; dq[0] pencereden çıktıysa popleft yap.']))

probs.append(dict(
    id='a-076', title='Kuryenin en uzun serisi', track=IC, diff='Orta', tags=['groupby', 'itertools'],
    src='itertools.groupby (HackerRank Compress the String benzeri)', mode='func', fn='en_uzun_seri',
    statement=P('Lezzet Kurye her teslimatı bir harfle kaydediyor: `Z` zamanında, `G` gecikmeli, `I` iptal. Performans ekranında her durum için <b>art arda gelen en uzun seri</b> uzunluğu gösterilecek.',
                '`en_uzun_seri(kayit)` fonksiyonunu yaz: `kayit` bir string. Dönüş, metinde geçen her harf için en uzun ardışık tekrar uzunluğunu veren bir sözlük olsun; anahtarlar alfabetik sırada eklensin. Boş kayıt için `{}`.'),
    constraints='0 ≤ len(kayit) ≤ 10^5',
    samples=[("en_uzun_seri('ZZGZZZIGG')", 'Z için en uzun seri 3 (ortadaki ZZZ), G için 2, I için 1.')],
    checks=["en_uzun_seri('')", "en_uzun_seri('Z')", "en_uzun_seri('GGGG')", "en_uzun_seri('ZGZGZG')",
            "en_uzun_seri('IIZZZZZGIIIIII')", "list(en_uzun_seri('ZGI'))", "en_uzun_seri('Z' * 50000 + 'G' + 'Z' * 49999)"],
    start='from itertools import groupby\n\ndef en_uzun_seri(kayit):\n    # kodunu yaz\n    pass\n',
    sol='''
from itertools import groupby

def en_uzun_seri(kayit):
    enuzun = {}
    for harf, grup in groupby(kayit):
        uzunluk = sum(1 for _ in grup)
        if uzunluk > enuzun.get(harf, 0):
            enuzun[harf] = uzunluk
    return {h: enuzun[h] for h in sorted(enuzun)}
''',
    editorial=ed('`groupby` ardışık eşit elemanları gruplar (sıralama yapmaz!). Her grubun uzunluğunu `sum(1 for _ in grup)` ile say ve o harfin şimdiye kadarki en büyüğüyle karşılaştır. Sonda anahtarları sıralayıp yeni sözlük kur.',
                 'O(n) tek geçiş + O(u log u) anahtar sıralaması.',
                 'Elle sayaç: önceki harfi ve mevcut seri uzunluğunu tutan döngü. `re.finditer(r\'(.)\\1*\', kayit)` de ardışık blokları bulur.',
                 '`groupby`\'ın grubu bir yineleyicidir (iterator); `len(grup)` çalışmaz. Grubu tüketmeden bir sonraki gruba geçince eski grup boşalır. groupby\'ın sıralama yaptığını sanmak: `Counter` toplam adet verir, seri değil.'),
    hints=['groupby(\'ZZG\') → (\'Z\', <grup>), (\'G\', <grup>) gibi ardışık bloklar verir.', 'Grup bir iterator: uzunluğu sum(1 for _ in grup) ile bul.']))

probs.append(dict(
    id='a-077', title='Hesap ekstresi ve ilk eksi gün', track=IC, diff='Orta', tags=['accumulate', 'itertools'],
    src='itertools.accumulate ile önek toplam', mode='stdin',
    statement=P('Ilgaz Bank müşterisinin ay başı bakiyesi ve gün gün net hareketleri (pozitif: giriş, negatif: çıkış) veriliyor. Ekstre özeti için:',
                '<ol><li>Her gün sonundaki bakiyeyi,</li><li>Ay içindeki <b>en düşük</b> gün sonu bakiyesini ve ilk kez görüldüğü gün numarasını (1\'den başlar),</li><li>Bakiyenin ilk kez <b>sıfırın altına</b> düştüğü günü (hiç düşmediyse `YOK`) yaz.</li></ol>'),
    input='İlk satırda `baslangic n`, ikinci satırda `n` tam sayı (günlük hareketler).',
    output='1. satır: gün sonu bakiyeleri (boşlukla). 2. satır: `EN_DUSUK deger gun`. 3. satır: `EKSI gun` ya da `EKSI YOK`.',
    constraints='1 ≤ n ≤ 10^5, |hareket| ≤ 10^9',
    samples=[('1000 5\n-300 -800 500 -700 200\n', 'Bakiyeler 700, -100, 400, -300, -100. En düşük -300 (4. gün), ilk eksi 2. gün.'),
             ('50 3\n0 10 -60\n', 'Bakiye 0\'a düşer ama altına inmez.')],
    hidden=['0 1\n0\n', '0 1\n-1\n', '100 4\n-25 -25 -25 -25\n', '10 3\n-5 5 -5\n', '5 2\n-5 -1\n',
            {'gen': 'import random\nrandom.seed(77)\nn = 100000\nprint(10**9, n)\nprint(*[random.randint(-10**4, 10**4) for _ in range(n)])'},
            '-20 3\n30 -10 -10\n'],
    start='from itertools import accumulate\n\nbaslangic, n = map(int, input().split())\nhareket = list(map(int, input().split()))\n# kodunu yaz\n',
    sol='''
from itertools import accumulate

baslangic, n = map(int, input().split())
hareket = list(map(int, input().split()))
bakiye = list(accumulate(hareket, initial=baslangic))[1:]
print(*bakiye)
en_dusuk = min(bakiye)
print('EN_DUSUK', en_dusuk, bakiye.index(en_dusuk) + 1)
ilk = next((i + 1 for i, b in enumerate(bakiye) if b < 0), None)
print('EKSI', ilk if ilk is not None else 'YOK')
''',
    editorial=ed('`accumulate(hareket, initial=baslangic)` önek toplamları üretir; ilk eleman başlangıç bakiyesidir, onu `[1:]` ile atarsın. En düşük değeri `min`, ilk görülme gününü `index` verir. İlk eksi gün için `next(üreteç, None)` kalıbı: koşulu sağlayan ilk elemanı bulur, yoksa varsayılanı döndürür.',
                 'O(n) zaman ve bellek.',
                 '`initial` parametresi Python 3.8+ ile gelir; yoksa `accumulate([baslangic] + hareket)`. `accumulate(veri, max)` gibi farklı ikili fonksiyonlarla kayan maksimum da üretebilirsin.',
                 '“Sıfırın altı” koşulunu `&lt;= 0` yazmak. Başlangıç bakiyesini çıktıya eklemek. Gün numarasını 0\'dan başlatmak.'),
    hints=['accumulate(liste, initial=x) önek toplamları üretir; ilk eleman x\'tir.', 'next((i for i, b in enumerate(...) if b < 0), None) ilk eşleşmeyi bulur.']))

probs.append(dict(
    id='a-078', title='Raf sayımı uzlaştırma', track=IC, diff='Orta', tags=['Counter', 'çoklu küme'],
    src='Counter aritmetiği (multiset farkı)', mode='stdin',
    statement=P('Anadolu Market İzmir mağazasında yıl sonu sayımı yapıldı. Sistemdeki stok kaydı ve raf sayımı, her okutulan barkod için bir SKU kodu olacak şekilde iki satırda veriliyor (bir SKU birden çok kez geçebilir).',
                'Uzlaştırma raporu çıkar: sistemde olup rafta <b>eksik</b> olanlar ve rafta olup sistemde <b>fazla</b> görünenler. Önce tüm `EKSIK` satırları, sonra tüm `FAZLA` satırları; her grup içinde SKU koduna göre alfabetik. Fark yoksa yalnız `TAMAM` yaz.'),
    input='1. satır: sistem kaydındaki SKU\'lar (boşlukla). 2. satır: raf sayımındaki SKU\'lar. Bir satır boş olabilir.',
    output='Her satırda `EKSIK sku adet` ya da `FAZLA sku adet`; ya da tek satır `TAMAM`.',
    constraints='Her satırda en fazla 10^5 SKU',
    samples=[('A1 A1 B2 C3 C3 C3\nA1 B2 B2 C3 C3 C3\n', 'A1 sistemde 2, rafta 1 → 1 eksik. B2 rafta bir fazla.'),
             ('X9 Y8\nY8 X9\n', 'Sıra önemli değil; adetler aynı.')],
    hidden=['\n\n', 'A\n\n', '\nB B\n', 'K1 K2 K3\nK4 K5\n', 'S S S S\nS S S S S S\n', 'b a\nA B\n',
            {'gen': 'import random\nrandom.seed(78)\nsk = ["SKU" + str(i).zfill(4) for i in range(2000)]\nprint(*[random.choice(sk) for _ in range(100000)])\nprint(*[random.choice(sk) for _ in range(100000)])'}],
    start='from collections import Counter\n\nsistem = input().split()\nraf = input().split()\n# kodunu yaz\n',
    sol='''
import sys
from collections import Counter

satirlar = sys.stdin.read().split('\\n')
sistem = Counter(satirlar[0].split() if satirlar else [])
raf = Counter(satirlar[1].split() if len(satirlar) > 1 else [])
eksik = sistem - raf
fazla = raf - sistem
if not eksik and not fazla:
    print('TAMAM')
else:
    for sku in sorted(eksik):
        print('EKSIK', sku, eksik[sku])
    for sku in sorted(fazla):
        print('FAZLA', sku, fazla[sku])
''',
    editorial=ed('`Counter` bir çoklu küme (multiset) gibi davranır: `sistem - raf` her anahtar için farkı alır ve sıfır ya da negatif kalanları <b>otomatik atar</b>. Ters yöndeki fark fazlaları verir. İkisi de boşsa sayım tutarlıdır.',
                 'O(n + u log u): sayma doğrusal, rapor için anahtar sıralaması.',
                 '`sistem.subtract(raf)` negatifleri de tutar; tek geçişte işaretine göre EKSIK/FAZLA ayrılabilir. `&amp;` (kesişim, min) ve `|` (birleşim, max) operatörleri de çok işe yarar.',
                 'Kümeyle (`set`) karşılaştırmak: adet farklarını kaybedersin. `input()` ile okurken boş satırda hata almak; boş satır geçerli bir girdidir.'),
    hints=['Counter(a) - Counter(b) yalnız pozitif farkları bırakır.', 'İki yönde fark al: sistem − raf eksikler, raf − sistem fazlalar.']))

probs.append(dict(
    id='a-079', title='LRU önbellek', track=IC, diff='Zor', tags=['OrderedDict', 'önbellek', 'sınıf'],
    src='LRU Cache (LeetCode 146 benzeri)', mode='func', fn='LRUOnbellek',
    statement=P('Anadolu Market\'in ürün detay servisi yavaş; sık bakılan ürünleri bellekte tutmak için bir <b>LRU</b> (en uzun süredir kullanılmayanı at) önbellek yazacaksın.',
                '`LRUOnbellek(kapasite)` sınıfını `collections.OrderedDict` kullanarak yaz:',
                '<ul><li>`al(anahtar)` — varsa değeri döndürür ve anahtarı “en son kullanılan” yapar; yoksa `-1` döndürür.</li><li>`koy(anahtar, deger)` — ekler ya da günceller; anahtar en son kullanılan olur. Kapasite aşılırsa en uzun süredir kullanılmayanı çıkarır.</li><li>`len(onbellek)` — içerideki eleman sayısı (`__len__`).</li><li>`anahtarlar()` — en eski kullanılandan en yeniye anahtar listesi.</li></ul>',
                'Kapasite 1\'den küçükse `ValueError`. Her işlem O(1) olmalı.'),
    constraints='1 ≤ kapasite ≤ 10^5, işlem sayısı ≤ 2·10^5',
    samples=[("c = LRUOnbellek(2)\nc.koy('sut', 30)\nc.koy('cay', 45)\nc.al('sut')\nc.koy('kahve', 90)\nc.anahtarlar()", 'al(\'sut\') sut\'u tazeledi; kahve gelince en eski olan cay atıldı.')],
    checks=["c = LRUOnbellek(2)\nc.koy('a', 1)\nc.koy('b', 2)\nc.koy('c', 3)\nc.al('a')",
            "c = LRUOnbellek(1)\nc.koy('a', 1)\nc.koy('a', 5)\n(c.al('a'), len(c))",
            "c = LRUOnbellek(3)\nc.koy(1, 'x')\nc.koy(2, 'y')\nc.koy(3, 'z')\nc.koy(1, 'X')\nc.koy(4, 'w')\nc.anahtarlar()",
            "c = LRUOnbellek(2)\nc.al('yok')",
            "c = LRUOnbellek(2)\nc.koy('a', 1)\nc.koy('b', 2)\nc.al('a')\nc.koy('c', 3)\n(c.al('b'), c.al('a'), c.al('c'))",
            "c = LRUOnbellek(3)\n(len(c), c.anahtarlar())",
            "c = LRUOnbellek(1000)\nfor i in range(200000):\n    c.koy(i % 1500, i)\n(len(c), c.anahtarlar()[0], c.al(1499), c.al(0))"],
    raises=[('ValueError', 'LRUOnbellek(0)', 'kapasite 0')],
    start='from collections import OrderedDict\n\nclass LRUOnbellek:\n    def __init__(self, kapasite):\n        pass\n\n    def al(self, anahtar):\n        pass\n\n    def koy(self, anahtar, deger):\n        pass\n\n    def __len__(self):\n        return 0\n\n    def anahtarlar(self):\n        return []\n',
    sol='''
from collections import OrderedDict

class LRUOnbellek:
    def __init__(self, kapasite):
        if kapasite < 1:
            raise ValueError('Kapasite en az 1 olmalı')
        self.kapasite = kapasite
        self._veri = OrderedDict()

    def al(self, anahtar):
        if anahtar not in self._veri:
            return -1
        self._veri.move_to_end(anahtar)
        return self._veri[anahtar]

    def koy(self, anahtar, deger):
        if anahtar in self._veri:
            self._veri.move_to_end(anahtar)
        self._veri[anahtar] = deger
        if len(self._veri) > self.kapasite:
            self._veri.popitem(last=False)

    def __len__(self):
        return len(self._veri)

    def anahtarlar(self):
        return list(self._veri)
''',
    editorial=ed('`OrderedDict` ekleme sırasını tutar ve iki O(1) yardımcısı vardır: `move_to_end(k)` anahtarı en sona (en yeni) taşır, `popitem(last=False)` en baştakini (en eski) çıkarır. Her erişimde anahtarı sona taşı, kapasite aşılınca baştan at.',
                 'Tüm işlemler O(1); bellek O(kapasite).',
                 'Sıfırdan yazmak istersen sözlük + çift yönlü bağlı liste (doubly linked list) kullanılır; mülakatlarda en çok beklenen budur. Fonksiyon sonuçlarını önbelleğe almak için hazır `functools.lru_cache` dekoratörü var.',
                 '`al` çağrısında sırayı güncellemeyi unutmak. Güncelleme (aynı anahtarı yeniden koyma) sırasında taşımayı unutmak. Düz liste ile sıra tutup `list.remove` kullanmak: her işlem O(n) olur.'),
    hints=['OrderedDict.move_to_end(k) anahtarı “en yeni” yapar.', 'Kapasite aşıldığında popitem(last=False) en eskiyi çıkarır.']))

probs.append(dict(
    id='a-080', title='Kuryenin en kısa turu', track=IC, diff='Zor', tags=['permutations', 'gezgin satıcı', 'kaba kuvvet'],
    src='Gezgin satıcı problemi (TSP) küçük n kaba kuvvet', mode='stdin',
    statement=P('Lezzet Kurye\'nin bir kuryesi depodan (nokta 0) çıkıp n teslimat noktasının <b>hepsine</b> birer kez uğrayacak ve depoya dönecek. Noktalar arası dakika cinsinden süreler bir matrisle veriliyor (simetrik olmak zorunda değil: tek yönlü yollar var).',
                'Toplam süresi en kısa turu bul. Aynı sürede birden çok tur varsa uğrama sırası (nokta numaralarının listesi) <b>sözlük sırasında en küçük</b> olanı yaz.'),
    input='İlk satırda `n`; sonra `n+1` satırda `n+1` tam sayı: `d[i][j]` = i\'den j\'ye süre.',
    output='1. satır: en kısa süre. 2. satır: `0 a b … 0` biçiminde tur.',
    constraints='1 ≤ n ≤ 8, 0 ≤ d[i][j] ≤ 1000, d[i][i] = 0',
    samples=[('3\n0 10 15 20\n10 0 35 25\n15 35 0 30\n20 25 30 0\n', 'Tur 0→1→3→2→0: 10 + 25 + 30 + 15 = 80.'),
             ('2\n0 5 9\n1 0 2\n3 7 0\n', 'Yönlü: 0→1→2→0 = 5 + 2 + 3 = 10; 0→2→1→0 = 9 + 7 + 1 = 17.')],
    hidden=['1\n0 7\n3 0\n', '2\n0 1 1\n1 0 1\n1 1 0\n',
            {'gen': 'import random\nrandom.seed(80)\nn = 8\nprint(n)\nfor i in range(n + 1):\n    print(*[0 if i == j else random.randint(1, 1000) for j in range(n + 1)])'},
            {'gen': 'n = 8\nprint(n)\nfor i in range(n + 1):\n    print(*[0 if i == j else 5 for j in range(n + 1)])'},
            '4\n0 2 9 10 7\n1 0 6 4 3\n15 7 0 8 3\n6 3 12 0 11\n9 7 5 6 0\n',
            {'gen': 'import random\nrandom.seed(801)\nn = 7\nprint(n)\nfor i in range(n + 1):\n    print(*[0 if i == j else random.randint(1, 3) for j in range(n + 1)])'},
            '3\n0 0 0 0\n0 0 0 0\n0 0 0 0\n0 0 0 0\n'],
    start='from itertools import permutations\n\nn = int(input())\nd = [list(map(int, input().split())) for _ in range(n + 1)]\n# kodunu yaz\n',
    sol='''
from itertools import permutations

n = int(input())
d = [list(map(int, input().split())) for _ in range(n + 1)]
en_iyi = None
en_iyi_tur = None
for sira in permutations(range(1, n + 1)):
    sure = d[0][sira[0]] + d[sira[-1]][0]
    for a, b in zip(sira, sira[1:]):
        sure += d[a][b]
    if en_iyi is None or sure < en_iyi:
        en_iyi = sure
        en_iyi_tur = sira
print(en_iyi)
print(0, *en_iyi_tur, 0)
''',
    editorial=ed('n ≤ 8 olduğundan tüm uğrama sıralarını denemek mümkün: `permutations(range(1, n + 1))` en fazla 8! = 40 320 sıra üretir. Her sıranın süresini depo→ilk, ardışık çiftler (`zip(sira, sira[1:])`) ve son→depo olarak topla. `permutations` sıraları sözlük sırasında ürettiği için yalnız <b>kesin küçük</b> (`&lt;`) olduğunda güncellersen eşitlikte en küçük tur kendiliğinden kalır.',
                 'O(n! · n): 8 için ~320 bin toplama.',
                 'Held–Karp dinamik programlama O(2^n · n²) ile n = 20\'ye kadar çıkar. Gerçek rota optimizasyonunda sezgisel yöntemler (en yakın komşu, 2-opt) ya da OR-Tools gibi kütüphaneler kullanılır.',
                 '`&lt;=` ile güncelleyip eşitlikte sözlük sırasında en büyük turu yazmak. Dönüş yolunu (son → depo) eklemeyi unutmak. Matrisin simetrik olduğunu varsayıp d[j][i] kullanmak.'),
    hints=['permutations(range(1, n + 1)) tüm uğrama sıralarını verir; n! en fazla 40 320.', 'permutations sözlük sırasında üretir; yalnız kesin daha kısa tur bulunca güncelle.']))

emit('/home/claude/py/v3/a2/arena_01.js', probs)
