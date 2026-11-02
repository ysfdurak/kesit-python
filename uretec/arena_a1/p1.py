import sys
sys.path.insert(0, '/tmp/claude-0/-home-claude/6c066959-3fcb-54bb-bdf1-c8ae148dfc4c/scratchpad/arena_a1')
from arena_build import build

T = 'Python dili'
P = []

# ---------------------------------------------------------------- a-001
P.append(dict(
    id='a-001', title='Lezzet Kurye teslimat ücreti', track=T, diff='Kolay',
    tags=['input', 'aritmetik', 'tam sayı bölme'], src='HackerRank Python: Introduction (Arithmetic Operators) benzeri',
    mode='stdin',
    statement='<p>Lezzet Kurye teslimat ücretini mesafeye göre hesaplıyor: ilk <b>3000 metre</b> sabit <b>25 TL</b>. '
              '3000 metreyi aşan her <b>başlamış</b> 1000 metre için <b>7 TL</b> eklenir. Yani 3001 metre de 4000 metre de 32 TL tutar.</p>'
              '<p>Sana gün içindeki siparişlerin mesafeleri (metre) veriliyor; her sipariş için ücreti yazdır.</p>',
    input='<p>İlk satırda sipariş sayısı <code>Q</code>. Sonraki <code>Q</code> satırın her birinde bir tam sayı: mesafe (metre).</p>',
    output='<p>Her sipariş için ayrı satırda ücret (tam sayı, TL).</p>',
    constraints='1 ≤ Q ≤ 10^5, 0 ≤ mesafe ≤ 10^9',
    samples=[dict(in_='4\n2500\n3000\n3001\n7200\n', why='2500 ve 3000 m taban ücrette kalır (25). 3001 m: 1 başlamış km → 25+7=32. 7200 m: aşan 4200 m = 5 başlamış km → 25+35=60.')],
    hidden=['1\n0\n', '3\n3999\n4000\n4001\n', '2\n1000000000\n2999\n', '1\n13000\n', '5\n3000\n3000\n3000\n3000\n3000\n',
            dict(gen='import random\nrandom.seed(11)\nq=100000\nprint(q)\nfor _ in range(q):\n    print(random.randint(0, 10**9))')],
    start='q = int(input())\nfor _ in range(q):\n    m = int(input())\n    # ücreti hesapla ve yazdır\n',
    sol='import sys\nveri = sys.stdin.read().split()\nq = int(veri[0])\nsonuc = []\nfor m in map(int, veri[1:1 + q]):\n    asan = max(0, m - 3000)\n    km = (asan + 999) // 1000\n    sonuc.append(25 + 7 * km)\nprint(\'\\n\'.join(map(str, sonuc)))\n',
    editorial='<p><b>Fikir:</b> Önce taban mesafeyi aşan kısmı bul: <code>asan = max(0, m - 3000)</code>. "Başlamış her km" demek yukarı yuvarlama (tavan) demektir. '
              'Tam sayılarda tavanı float kullanmadan <code>(asan + 999) // 1000</code> ile alırsın; <code>math.ceil(asan / 1000)</code> da olur ama çok büyük sayılarda float hassasiyeti risklidir.</p>'
              '<p><b>Karmaşıklık:</b> Her sipariş O(1), toplam O(Q). 10^5 satırda <code>input()</code> yerine <code>sys.stdin.read().split()</code> ile hepsini tek seferde okumak ve çıktıyı <code>\'\\n\'.join</code> ile tek <code>print</code>te basmak belirgin hız kazandırır.</p>'
              '<p><b>Sık hata:</b> <code>asan // 1000 + 1</code> yazmak: tam 4000 metrede (asan=1000) 2 km sayar ve fazla ücret çıkar. Ayrıca 3000 metre ve altında negatif mesafe çıkmasın diye <code>max(0, ...)</code> şart.</p>',
    hints=['Taban mesafeyi aşan metreyi bul; negatif olmasın diye max(0, ...) kullan.', 'Tam sayıda yukarı yuvarlama: (x + 999) // 1000.']))

# ---------------------------------------------------------------- a-002
P.append(dict(
    id='a-002', title='Kasada para üstü', track=T, diff='Kolay',
    tags=['divmod', 'döngü', 'açgözlü'], src='Klasik para üstü (greedy change) alıştırması',
    mode='stdin',
    statement='<p>Anadolu Market kasasında para üstü her zaman <b>en az sayıda</b> banknot/madenî para ile verilir. Kasada 200, 100, 50, 20, 10, 5 ve 1 TL\'lik birimler bulunuyor ve hepsinden yeterince var.</p>'
              '<p>Her para üstü tutarı için büyükten küçüğe her birimden kaç adet verileceğini yazdır.</p>',
    input='<p>İlk satırda <code>Q</code>, sonraki <code>Q</code> satırda birer tam sayı tutar (TL).</p>',
    output='<p>Her tutar için tek satırda 7 sayı: sırasıyla 200, 100, 50, 20, 10, 5, 1 TL adetleri, aralarında birer boşluk.</p>',
    constraints='1 ≤ Q ≤ 10^5, 0 ≤ tutar ≤ 10^9',
    samples=[dict(in_='2\n388\n45\n', why='388 = 200 + 100 + 50 + 20 + 10 + 5 + 3×1 → 1 1 1 1 1 1 3. 45 = 2×20 + 5 → 0 0 0 2 0 1 0.')],
    hidden=['1\n0\n', '1\n200\n', '3\n1\n4\n9\n', '1\n1000000000\n', '2\n399\n376\n',
            dict(gen='import random\nrandom.seed(2)\nq=100000\nprint(q)\nfor _ in range(q):\n    print(random.randint(0, 10**6))')],
    start='BIRIMLER = [200, 100, 50, 20, 10, 5, 1]\nq = int(input())\nfor _ in range(q):\n    tutar = int(input())\n    # her birimden kaç adet?\n',
    sol='import sys\nBIRIMLER = [200, 100, 50, 20, 10, 5, 1]\nveri = sys.stdin.read().split()\nq = int(veri[0])\ncikti = []\nfor t in map(int, veri[1:1 + q]):\n    adetler = []\n    for b in BIRIMLER:\n        adet, t = divmod(t, b)\n        adetler.append(adet)\n    cikti.append(\' \'.join(map(str, adetler)))\nprint(\'\\n\'.join(cikti))\n',
    editorial='<p><b>Fikir:</b> Büyük birimden başla; <code>adet, kalan = divmod(tutar, birim)</code> bir adımda hem kaç tane verileceğini hem de geriye kalanı verir. Kalanla bir sonraki birime geç.</p>'
              '<p>Bu birim kümesi (200-100-50-20-10-5-1) "kanonik" olduğu için açgözlü (greedy) seçim her zaman en az adedi verir. Uyarı: her birim sisteminde böyle değildir; örneğin 1, 3, 4 birimlerinde 6 için açgözlü 4+1+1 (3 adet) verir, en iyisi 3+3 (2 adet). O durumda dinamik programlama gerekir.</p>'
              '<p><b>Karmaşıklık:</b> Tutar başına 7 adım, toplam O(Q).</p>'
              '<p><b>Sık hata:</b> Sadece sıfır olmayan birimleri yazdırmak ya da <code>%</code> ile <code>//</code>yi ayrı ayrı yazarken kalanı güncellemeyi unutmak.</p>',
    hints=['divmod(a, b) bölüm ve kalanı birlikte döndürür.', 'Birimleri büyükten küçüğe gez; her adımda tutarı kalanla güncelle.']))

# ---------------------------------------------------------------- a-003
P.append(dict(
    id='a-003', title='Şubat kaç gün?', track=T, diff='Kolay',
    tags=['koşul', 'fonksiyon', 'artık yıl'], src='HackerRank Python: Write a function (artık yıl) benzeri',
    mode='func', fn='subat_gunu',
    statement='<p>Pusula İK bordro sistemi Şubat maaşını günlük ücretle hesaplıyor; bu yüzden Şubat\'ın kaç gün çektiğini bilmesi gerekiyor.</p>'
              '<p><code>subat_gunu(yil)</code> fonksiyonunu yaz: yıl artık yılsa <b>29</b>, değilse <b>28</b> döndürsün. Gregoryen kural: 4\'e bölünen yıllar artıktır; ama 100\'e bölünenler artık değildir; ama 400\'e bölünenler yine artıktır.</p>',
    input='<p>Bir tam sayı <code>yil</code>.</p>',
    output='<p>28 ya da 29 (int).</p>',
    constraints='1 ≤ yil ≤ 10^9',
    samples=[dict(call='subat_gunu(2024)', why='4\'e bölünüyor, 100\'e bölünmüyor → artık.'),
             dict(call='subat_gunu(1900)', why='100\'e bölünüyor ama 400\'e bölünmüyor → artık değil.'),
             dict(call='subat_gunu(2000)', why='400\'e bölünüyor → artık.')],
    start='def subat_gunu(yil):\n    # 28 ya da 29 döndür\n    pass\n',
    sol='def subat_gunu(yil):\n    artik = yil % 4 == 0 and (yil % 100 != 0 or yil % 400 == 0)\n    return 29 if artik else 28\n',
    tests='assert subat_gunu(2024) == 29\nassert subat_gunu(2023) == 28\nassert subat_gunu(1900) == 28\nassert subat_gunu(2000) == 29\nassert subat_gunu(2100) == 28\nassert subat_gunu(1) == 28\nassert subat_gunu(4) == 29\nassert type(subat_gunu(2400)) is int and subat_gunu(2400) == 29\nassert sum(subat_gunu(y) == 29 for y in range(1, 400001)) == 97000\n',
    editorial='<p><b>Fikir:</b> Kuralı tek bir mantıksal ifadeye çevir: <code>yil % 4 == 0 and (yil % 100 != 0 or yil % 400 == 0)</code>. Parantez önemlidir; <code>and</code>, <code>or</code>\'dan önce değerlendirilir.</p>'
              '<p>Her 400 yılda tam 97 artık yıl vardır (100 aday − 3 istisna); son test bunu denetler.</p>'
              '<p><b>Alternatif:</b> Standart kütüphanede <code>calendar.isleap(yil)</code> ve <code>calendar.monthrange(yil, 2)[1]</code> hazırdır. Mülakatta önce kuralı kendin yaz, sonra kütüphaneyi bildiğini söyle.</p>'
              '<p><b>Sık hata:</b> Yalnız <code>yil % 4 == 0</code> kontrolü (1900 ve 2100\'ü yanlış bilir) ya da <code>print</code> edip <code>return</code> etmemek.</p>',
    hints=['Üç kuralı iç içe if ile ya da tek bir and/or ifadesiyle yazabilirsin.', '400\'e bölünme durumu, 100 istisnasının istisnasıdır.']))

# ---------------------------------------------------------------- a-004
P.append(dict(
    id='a-004', title='Kampanya etiketleri', track=T, diff='Kolay',
    tags=['döngü', 'koşul', 'modülo'], src='FizzBuzz / HackerRank Python If-Else benzeri',
    mode='stdin',
    statement='<p>Anadolu Market raf etiketlerini 1\'den <code>N</code>\'ye numaralıyor. Kampanya kuralı:</p>'
              '<ul><li>Numara 3\'e <b>ve</b> 5\'e bölünüyorsa etikete <code>Süper</code></li><li>yalnız 3\'e bölünüyorsa <code>İndirim</code></li><li>yalnız 5\'e bölünüyorsa <code>Kargo</code></li><li>hiçbiri değilse numaranın kendisi</li></ul>'
              '<p>Etiketleri sırayla yazdır.</p>',
    input='<p>Tek satırda <code>N</code>.</p>',
    output='<p><code>N</code> satır.</p>',
    constraints='1 ≤ N ≤ 10^5',
    samples=[dict(in_='15\n', why='3, 6, 9, 12 → İndirim; 5, 10 → Kargo; 15 hem 3\'e hem 5\'e bölünür → Süper.')],
    hidden=['1\n', '3\n', '5\n', '30\n', '2\n', dict(gen='print(100000)')],
    start='n = int(input())\nfor i in range(1, n + 1):\n    # etiketi yazdır\n    pass\n',
    sol='n = int(input())\nsatirlar = []\nfor i in range(1, n + 1):\n    if i % 15 == 0:\n        satirlar.append(\'Süper\')\n    elif i % 3 == 0:\n        satirlar.append(\'İndirim\')\n    elif i % 5 == 0:\n        satirlar.append(\'Kargo\')\n    else:\n        satirlar.append(str(i))\nprint(\'\\n\'.join(satirlar))\n',
    editorial='<p><b>Fikir:</b> En özel koşulu (hem 3 hem 5, yani 15\'e bölünme) <b>önce</b> kontrol et. <code>if/elif</code> zincirinde ilk doğru dal çalışır; 3 kontrolü önde olursa 15 hiçbir zaman <code>Süper</code> olmaz.</p>'
              '<p><b>Performans:</b> 10^5 satırı tek tek <code>print</code> etmek de geçer ama çıktıyı listede toplayıp <code>\'\\n\'.join</code> ile tek seferde basmak birkaç kat hızlıdır. Büyük çıktılı yarışma sorularında bunu alışkanlık edin.</p>'
              '<p><b>Sık hata:</b> <code>range(n)</code> yazıp 0\'dan başlamak (0, 15\'e bölündüğü için <code>Süper</code> basılır) ya da N\'yi dışarıda bırakmak.</p>',
    hints=['range(1, n + 1) ile 1\'den N\'ye (dahil) gez.', 'if/elif sırası önemli: önce 15\'e bölünmeyi kontrol et.']))

# ---------------------------------------------------------------- a-005
P.append(dict(
    id='a-005', title='Servis otobüsü planı', track=T, diff='Kolay',
    tags=['tam sayı bölme', 'modülo', 'aritmetik'], src='HackerRank Python: Division benzeri',
    mode='stdin',
    statement='<p>Kanat Havayolları aktarmalı yolcuları terminaller arası servisle taşıyor. Bir seferde <code>P</code> yolcu var ve her otobüs <code>K</code> kişilik.</p>'
              '<p>Her sefer için üç sayı yazdır: gereken otobüs sayısı, <b>tamamen dolu</b> giden otobüs sayısı ve <b>son</b> otobüsteki yolcu sayısı.</p>',
    input='<p>İlk satırda <code>Q</code>. Sonraki <code>Q</code> satırda <code>P K</code>.</p>',
    output='<p>Her sefer için <code>otobus dolu son</code>.</p>',
    constraints='1 ≤ Q ≤ 10^5, 1 ≤ P, K ≤ 10^12',
    samples=[dict(in_='3\n130 50\n100 50\n7 10\n', why='130/50: 3 otobüs, 2 dolu, sonda 30 kişi. 100/50: 2 otobüs, ikisi de dolu, son otobüste 50 kişi. 7/10: 1 otobüs, hiç dolu yok, son otobüste 7 kişi.')],
    hidden=['1\n1 1\n', '1\n1000000000000 1\n', '1\n1 1000000000000\n', '2\n99 33\n100 33\n', '1\n999999999999 1000000000000\n',
            dict(gen='import random\nrandom.seed(5)\nq=100000\nprint(q)\nfor _ in range(q):\n    print(random.randint(1, 10**12), random.randint(1, 10**6))')],
    start='q = int(input())\nfor _ in range(q):\n    p, k = map(int, input().split())\n    # otobüs, dolu, son\n',
    sol='import sys\nveri = sys.stdin.read().split()\nq = int(veri[0])\ncikti = []\nfor i in range(q):\n    p = int(veri[1 + 2 * i]); k = int(veri[2 + 2 * i])\n    tam, kalan = divmod(p, k)\n    if kalan == 0:\n        cikti.append(f\'{tam} {tam} {k}\')\n    else:\n        cikti.append(f\'{tam + 1} {tam} {kalan}\')\nprint(\'\\n\'.join(cikti))\n',
    editorial='<p><b>Fikir:</b> <code>tam, kalan = divmod(P, K)</code>. Kalan sıfırsa <code>tam</code> otobüs gider, hepsi doludur ve son otobüste <code>K</code> kişi vardır. Kalan varsa bir otobüs daha gerekir; dolu sayısı <code>tam</code>, son otobüste <code>kalan</code> kişi olur.</p>'
              '<p><b>Neden float değil?</b> <code>P / K</code> 10^12 düzeyinde ondalık sonuç üretir ve <code>math.ceil(P / K)</code> nadiren de olsa yanlış yuvarlanabilir. Python tam sayıları sınırsız ve kesindir; <code>//</code> ve <code>%</code> ile kal.</p>'
              '<p><b>Sık hata:</b> Kalan sıfırken son otobüs için 0 yazmak. Son otobüs her zaman en az bir kişi taşır.</p>',
    hints=['divmod(P, K) ile tam bölüm ve kalanı al.', 'Kalan 0 ise son otobüs tam doludur; bu durumu ayrı ele al.']))

# ---------------------------------------------------------------- a-006
P.append(dict(
    id='a-006', title='Fatura numarası rakamları', track=T, diff='Kolay',
    tags=['metin', 'döngü', 'int dönüşümü'], src='Klasik basamak toplamı alıştırması',
    mode='stdin',
    statement='<p>Anadolu Bank fatura numaralarında kontrol için iki değer kullanılıyor: rakamların <b>toplamı</b> ve <b>çift rakam</b> sayısı (0 da çifttir).</p>'
              '<p>Çok uzun bir numara veriliyor; bu iki değeri yazdır.</p>',
    input='<p>Tek satırda yalnız rakamlardan oluşan bir dizgi (baştaki sıfırlar olabilir).</p>',
    output='<p>Tek satırda <code>toplam cift_adedi</code>.</p>',
    constraints='1 ≤ uzunluk ≤ 10^6',
    samples=[dict(in_='4072915\n', why='Toplam 4+0+7+2+9+1+5 = 28. Çift rakamlar 4, 0, 2 → 3 adet.')],
    hidden=['0\n', '7\n', '0000\n', '13579\n', '2468024680\n', dict(gen='import random\nrandom.seed(3)\nprint(\'\'.join(random.choice(\'0123456789\') for _ in range(10**6)))')],
    start='numara = input().strip()\n# rakam toplamı ve çift rakam sayısı\n',
    sol='numara = input().strip()\ntoplam = 0\ncift = 0\nfor ch in numara:\n    r = int(ch)\n    toplam += r\n    if r % 2 == 0:\n        cift += 1\nprint(toplam, cift)\n',
    editorial='<p><b>Fikir:</b> Sayıyı <code>int</code>\'e çevirip <code>% 10</code> ile basamak koparmak da çalışır, ama girdi zaten metin: karakterleri gezip her birini <code>int(ch)</code> yapmak hem basit hem de baştaki sıfırları korur.</p>'
              '<p><b>Kısa yol:</b> <code>sum(map(int, numara))</code> ve <code>sum(ch in \'02468\' for ch in numara)</code>. <code>True</code> toplamda 1 sayılır.</p>'
              '<p><b>Karmaşıklık:</b> O(n). 10^6 karakterlik bir sayıyı <code>int()</code>\'e çevirmek Python 3.11+ sürümlerinde 4300 basamak sınırına takılır (<code>ValueError</code>); metin olarak işlemek bu yüzden de doğru yoldur.</p>'
              '<p><b>Sık hata:</b> Satır sonundaki boşluğu temizlemeden <code>int(ch)</code> yapmak; <code>strip()</code> unutma.</p>',
    hints=['Girdiyi sayıya çevirmeden karakter karakter gez.', 'Çift rakam kontrolü: int(ch) % 2 == 0.']))

# ---------------------------------------------------------------- a-007
P.append(dict(
    id='a-007', title='Sıra numarası şeridi', track=T, diff='Kolay',
    tags=['print', 'sep', 'end'], src='HackerRank Python: Print Function benzeri',
    mode='stdin',
    statement='<p>Pedal İzmir istasyon yazıcısı tek satırlık bir sıra şeridi basıyor: 1\'den <code>N</code>\'ye kadar sayılar <b>arada hiçbir ayraç olmadan</b> yan yana yazılıyor.</p>'
              '<p>Örneğin <code>N = 12</code> için çıktı <code>123456789101112</code>. Şeridi yazdır.</p>',
    input='<p>Tek satırda <code>N</code>.</p>',
    output='<p>Tek satır.</p>',
    constraints='1 ≤ N ≤ 10^5',
    samples=[dict(in_='5\n', why='1, 2, 3, 4, 5 yan yana: 12345.'), dict(in_='12\n', why='10, 11, 12 iki basamaklı olarak eklenir.')],
    hidden=['1\n', '9\n', '10\n', '100\n', '1000\n', dict(gen='print(100000)')],
    start='n = int(input())\n# 1..n arasını ayraçsız tek satırda yaz\n',
    sol='n = int(input())\nprint(*range(1, n + 1), sep=\'\')\n',
    editorial='<p><b>Fikir:</b> <code>print</code> birden çok argümanı varsayılan olarak boşlukla ayırır; <code>sep=\'\'</code> bu ayracı kaldırır. <code>*range(1, n + 1)</code> aralıktaki her sayıyı ayrı argüman olarak açar (unpacking).</p>'
              '<p><b>Alternatifler:</b> <code>\'\'.join(map(str, range(1, n + 1)))</code> ya da döngüde <code>print(i, end=\'\')</code> ve en sonda bir <code>print()</code>. Döngüde her seferinde <code>s += str(i)</code> yapmak da CPython\'da genelde hızlıdır ama garanti değildir; <code>join</code> tercih et.</p>'
              '<p><b>Sık hata:</b> Sayıları toplamak (<code>sum</code>) ya da <code>end=\'\'</code> kullanıp son satır sonunu hiç basmamak (çoğu denetleyici kabul eder ama terminalde istem satırına yapışır).</p>',
    hints=['print fonksiyonunun sep ve end parametrelerini hatırla.', 'print(*dizi) diziyi ayrı argümanlara açar.']))

# ---------------------------------------------------------------- a-008
P.append(dict(
    id='a-008', title='Günlük bakiye takibi', track=T, diff='Kolay',
    tags=['döngü', 'birikimli toplam', 'min'], src='Klasik birikimli toplam alıştırması',
    mode='stdin',
    statement='<p>Anadolu Bank bir esnaf hesabının <code>N</code> günlük net hareketini (para girişi pozitif, çıkışı negatif) tutuyor. Gün başı bakiyesi <code>B</code>.</p>'
              '<p>Her günün hareketi bakiyeye eklendikten sonra; dönem sonu bakiyesini, dönem içindeki <b>en düşük</b> gün sonu bakiyesini ve bakiyenin <b>eksiye düştüğü</b> (0\'ın altında kaldığı) gün sayısını yazdır.</p>',
    input='<p>İlk satırda <code>B N</code>, ikinci satırda <code>N</code> tam sayı.</p>',
    output='<p>Tek satırda <code>son en_dusuk eksi_gun</code>.</p>',
    constraints='1 ≤ N ≤ 2·10^5, |B|, |hareket| ≤ 10^9',
    samples=[dict(in_='100 5\n-50 -80 40 -20 200\n', why='Gün sonları: 50, -30, 10, -10, 190. Son 190, en düşük -30, eksi günler 2.')],
    hidden=['0 1\n0\n', '-5 3\n1 1 1\n', '1000 3\n-1 -1 -1\n', '10 4\n-10 0 0 -1\n', '-1000000000 2\n-1000000000 1000000000\n',
            dict(gen='import random\nrandom.seed(8)\nn=200000\nprint(0, n)\nprint(*[random.randint(-10**9, 10**9) for _ in range(n)])')],
    start='b, n = map(int, input().split())\nhareketler = list(map(int, input().split()))\n# son, en düşük, eksi gün\n',
    sol='b, n = map(int, input().split())\nhareketler = list(map(int, input().split()))\nen_dusuk = None\neksi = 0\nfor h in hareketler:\n    b += h\n    if en_dusuk is None or b < en_dusuk:\n        en_dusuk = b\n    if b < 0:\n        eksi += 1\nprint(b, en_dusuk, eksi)\n',
    editorial='<p><b>Fikir:</b> Bakiyeyi tek değişkende biriktir. En düşük değeri izlemek için başlangıç değeri önemli: ilk gün sonu bakiyesiyle başla (ya da <code>float(\'inf\')</code> kullan). <b>Gün başı bakiyesi</b> en düşüğe dahil değildir; yalnız gün sonları sayılır.</p>'
              '<p><b>Alternatif:</b> <code>itertools.accumulate(hareketler, initial=B)</code> birikimli bakiyeleri üretir; ilk elemanı (B) atlayıp <code>min</code> ve <code>sum(x &lt; 0 for x in ...)</code> uygulayabilirsin.</p>'
              '<p><b>Sık hata:</b> <code>en_dusuk = 0</code> ile başlamak: bakiye hep pozitifse yanlış olarak 0 çıkar. Bakiye tam 0 ise eksi sayılmaz.</p>',
    hints=['En düşük değeri izlerken başlangıç değerini 0 seçme; ilk gün sonu bakiyesini ya da sonsuzu kullan.', 'Eksi gün koşulu: bakiye < 0 (0 dahil değil).']))

# ---------------------------------------------------------------- a-009
P.append(dict(
    id='a-009', title='Taksit planı', track=T, diff='Orta',
    tags=['fonksiyon', 'divmod', 'liste'], src='Bankacılık taksitlendirme (kuruş dağıtma) problemi',
    mode='func', fn='taksit_plani',
    statement='<p>Anadolu Bank kredi kartı alışverişini taksitlendiriyor. Tutar <b>kuruş</b> cinsinden tam sayı; taksitler de tam kuruş olmalı ve toplamları tutara <b>tam olarak</b> eşit olmalı.</p>'
              '<p>Kural: taksitler mümkün olduğunca eşit olsun; artan kuruşlar <b>ilk</b> taksitlere birer birer dağıtılsın. <code>taksit_plani(tutar, ay)</code> taksitleri liste olarak döndürsün.</p>',
    input='<p><code>tutar</code> (int, kuruş), <code>ay</code> (int).</p>',
    output='<p><code>ay</code> uzunluğunda int listesi.</p>',
    constraints='0 ≤ tutar ≤ 10^15, 1 ≤ ay ≤ 10^5',
    samples=[dict(call='taksit_plani(1000, 3)', why='1000 = 3×333 + 1; artan 1 kuruş ilk taksite.'),
             dict(call='taksit_plani(1200, 4)', why='Tam bölünüyor.'),
             dict(call='taksit_plani(5, 8)', why='Taksit sayısı tutardan fazla: ilk 5 taksit 1 kuruş, gerisi 0.')],
    start='def taksit_plani(tutar, ay):\n    # mümkün olduğunca eşit, artanlar ilk taksitlere\n    return []\n',
    sol='def taksit_plani(tutar, ay):\n    taban, artan = divmod(tutar, ay)\n    return [taban + 1] * artan + [taban] * (ay - artan)\n',
    tests='assert taksit_plani(1000, 3) == [334, 333, 333]\nassert taksit_plani(1200, 4) == [300, 300, 300, 300]\nassert taksit_plani(5, 8) == [1, 1, 1, 1, 1, 0, 0, 0]\nassert taksit_plani(0, 2) == [0, 0]\nassert taksit_plani(999, 1) == [999]\nassert taksit_plani(10**15, 7) == [142857142857143] * 6 + [142857142857142]\nr = taksit_plani(123456789, 100000)\nassert len(r) == 100000 and sum(r) == 123456789 and max(r) - min(r) <= 1\nassert all(type(x) is int for x in taksit_plani(100, 3))\n',
    editorial='<p><b>Fikir:</b> <code>taban, artan = divmod(tutar, ay)</code>. İlk <code>artan</code> taksit <code>taban + 1</code>, kalanlar <code>taban</code> olur. Böylece toplam <code>artan·(taban+1) + (ay−artan)·taban = tutar</code> ve en büyük/en küçük fark en fazla 1 kuruştur.</p>'
              '<p><b>Neden kuruş?</b> Parayı <code>float</code> ile tutmak (<code>10.0 / 3</code>) yuvarlama artıkları üretir; taksitlerin toplamı tutarı tutmaz. Finansal hesaplarda tam sayı kuruş ya da <code>decimal.Decimal</code> kullan.</p>'
              '<p><b>Karmaşıklık:</b> O(ay). Liste çarpımı (<code>[x] * k</code>) değişmez int\'lerle güvenlidir.</p>'
              '<p><b>Sık hata:</b> <code>round(tutar / ay)</code> ile her taksiti yuvarlayıp toplamın kaymasına izin vermek; artanı son taksite yığıp farkı 1\'den büyük yapmak.</p>',
    hints=['divmod ile taban taksit ve artan kuruş sayısını bul.', '[a] * k + [b] * m biçiminde listeyi tek satırda kurabilirsin.']))

# ---------------------------------------------------------------- a-010
P.append(dict(
    id='a-010', title='Birikim hedefi', track=T, diff='Orta',
    tags=['while', 'simülasyon', 'tam sayı'], src='Bileşik faiz / while döngüsü alıştırması',
    mode='stdin',
    statement='<p>Anadolu Bank\'ın birikim hesabında yıl sonunda bakiyeye <code>r</code>% faiz eklenir; faiz <b>kuruşa aşağı yuvarlanır</b> (bakiye kuruş cinsinden tam sayı). Müşteri <code>B</code> kuruşla başlıyor ve <code>H</code> kuruş hedefliyor.</p>'
              '<p>Her soru için bakiyenin hedefe <b>ulaşması ya da geçmesi</b> için kaç yıl gerektiğini yazdır. Başta zaten ulaşılmışsa 0. Faiz hiç artış sağlamıyorsa (yıllık faiz 0 kuruşa yuvarlanıyorsa) ve hedefe ulaşılmamışsa <code>ASLA</code> yazdır.</p>',
    input='<p>İlk satırda <code>Q</code>. Sonraki <code>Q</code> satırda <code>B r H</code>.</p>',
    output='<p>Her soru için yıl sayısı ya da <code>ASLA</code>.</p>',
    constraints='1 ≤ Q ≤ 2000, 0 ≤ B ≤ 10^12, 1 ≤ r ≤ 100, 1 ≤ H ≤ 10^15',
    samples=[dict(in_='3\n100000 10 150000\n50 1 51\n200 5 100\n', why='100000 → 110000 → 121000 → 133100 → 146410 → 161051: 5 yıl. 50 kuruşun %1\'i 0,5 → 0 kuruş, artış yok: ASLA. 200 zaten ≥ 100: 0.')],
    hidden=['1\n0 50 1\n', '1\n1 100 1024\n', '1\n99 1 100\n', '1\n100 1 101\n', '2\n10 10 11\n10 10 12\n', '1\n1000000000000 1 1000000000000000\n',
            dict(gen='import random\nrandom.seed(4)\nq=2000\nprint(q)\nfor _ in range(q):\n    print(random.randint(0, 10**9), random.randint(1, 100), random.randint(1, 10**15))')],
    start='q = int(input())\nfor _ in range(q):\n    b, r, h = map(int, input().split())\n    # while ile yılları say\n',
    sol='q = int(input())\nfor _ in range(q):\n    b, r, h = map(int, input().split())\n    yil = 0\n    sonuc = None\n    while b < h:\n        faiz = b * r // 100\n        if faiz == 0:\n            sonuc = \'ASLA\'\n            break\n        b += faiz\n        yil += 1\n    print(sonuc if sonuc else yil)\n',
    editorial='<p><b>Fikir:</b> Hedef koşulu sağlanana kadar dönen bir <code>while b &lt; h</code> döngüsü. Her yıl faiz <code>b * r // 100</code> (önce çarp, sonra böl; tersi <code>b // 100 * r</code> kuruş kaybettirir).</p>'
              '<p><b>Sonsuz döngü tuzağı:</b> Faiz 0 kuruşa yuvarlanırsa bakiye hiç değişmez ve döngü bitmez. Bu durumu yakalayıp <code>break</code> ile çık. <code>while</code> yazarken her zaman "döngü değişkeni her turda ilerliyor mu?" diye sor.</p>'
              '<p><b>Karmaşıklık:</b> Faiz pozitifse bakiye en az %1 büyür; ama küçük bakiyelerde artış 1 kuruşla sınırlı olabilir. Faiz pozitifken <code>b·r ≥ 100</code> olduğundan her yıl bakiye <code>(1 + r/100)</code> katına yakın büyür, yıl sayısı logaritmiktir (birkaç bin adım).</p>'
              '<p><b>Sık hata:</b> <code>b * (1 + r / 100)</code> ile float kullanmak: 10^12 düzeyinde yuvarlama farkları yıl sayısını değiştirebilir.</p>',
    hints=['while b < h döngüsünde her yıl faizi tam sayı bölmeyle hesapla.', 'Faiz 0 çıkarsa bakiye artmaz; döngüden ASLA ile çık.']))

# ---------------------------------------------------------------- a-011
P.append(dict(
    id='a-011', title='Kademeli gelir vergisi', track=T, diff='Orta',
    tags=['koşul', 'döngü', 'demet listesi'], src='Kademeli vergi dilimi hesabı (klasik iş problemi)',
    mode='stdin',
    statement='<p>Pusula İK yıllık gelir vergisini <b>kademeli</b> hesaplıyor (kurgusal oranlar). Her dilimin oranı yalnız o dilime düşen kısma uygulanır:</p>'
              '<table><tr><th>Dilim (TL)</th><th>Oran</th></tr><tr><td>0 – 110.000</td><td>%15</td></tr><tr><td>110.000 – 230.000</td><td>%20</td></tr><tr><td>230.000 – 580.000</td><td>%27</td></tr><tr><td>580.000 – 3.000.000</td><td>%35</td></tr><tr><td>3.000.000 üstü</td><td>%40</td></tr></table>'
              '<p>Her çalışanın yıllık geliri için vergiyi hesapla ve <b>aşağı yuvarlanmış</b> tam TL olarak yazdır.</p>',
    input='<p>İlk satırda <code>N</code>, sonraki <code>N</code> satırda gelir (tam sayı, TL).</p>',
    output='<p>Her gelir için vergi (tam sayı).</p>',
    constraints='1 ≤ N ≤ 10^5, 0 ≤ gelir ≤ 10^10',
    samples=[dict(in_='3\n100000\n150000\n600000\n', why='100000×%15 = 15000. 150000: 110000×%15 + 40000×%20 = 16500 + 8000 = 24500. 600000: 16500 + 24000 + 94500 + 7000 = 142000.')],
    hidden=['1\n0\n', '1\n110000\n', '1\n230000\n', '1\n3000000\n', '1\n10000000000\n', '3\n1\n7\n110001\n',
            dict(gen='import random\nrandom.seed(6)\nn=100000\nprint(n)\nfor _ in range(n):\n    print(random.randint(0, 10**8))')],
    start='DILIMLER = [(110000, 15), (230000, 20), (580000, 27), (3000000, 35), (None, 40)]\nn = int(input())\nfor _ in range(n):\n    gelir = int(input())\n    # kademeli vergi\n',
    sol='import sys\nDILIMLER = [(110000, 15), (230000, 20), (580000, 27), (3000000, 35), (None, 40)]\n\ndef vergi(gelir):\n    toplam = 0\n    alt = 0\n    for ust, oran in DILIMLER:\n        if gelir <= alt:\n            break\n        dilim_ust = gelir if ust is None else min(gelir, ust)\n        toplam += (dilim_ust - alt) * oran\n        alt = ust if ust is not None else gelir\n    return toplam // 100\n\nveri = sys.stdin.read().split()\nn = int(veri[0])\nprint(\'\\n\'.join(str(vergi(int(x))) for x in veri[1:1 + n]))\n',
    editorial='<p><b>Fikir:</b> Dilimleri <code>(üst sınır, oran)</code> demetleri olarak bir listede tut ve sırayla gez. Her dilimde vergilenen kısım <code>min(gelir, üst) − alt</code>; ardından <code>alt</code> sınırı bir sonraki dilime taşı. Gelir alt sınırın altında kalınca dur.</p>'
              '<p><b>Hassasiyet:</b> Oranları yüzde olarak tam sayı tut, tüm çarpımları topla ve en sonda bir kez <code>// 100</code> yap. Her dilimde ayrı ayrı yuvarlamak ya da <code>0.27</code> gibi float kullanmak kuruş farkları doğurur.</p>'
              '<p><b>Tasarım notu:</b> Sınırları koda gömmek yerine veri yapısında tutmak, gelecek yıl oranlar değiştiğinde yalnız listeyi güncellemeni sağlar. Gerçek bordro sistemleri de böyle çalışır.</p>'
              '<p><b>Sık hata:</b> Tüm gelire en yüksek oranı uygulamak (kademeli değil düz vergi) ya da sınır değerlerinde (<code>110000</code>) bir dilim kaydırmak.</p>',
    hints=['Dilimleri (üst sınır, oran) listesi yap; alt sınırı döngüde güncelle.', 'Oranları tam sayı yüzde tut; bölmeyi en sonda tek seferde yap.']))

# ---------------------------------------------------------------- a-012
P.append(dict(
    id='a-012', title='Kategori ağacında ürün sayısı', track=T, diff='Orta',
    tags=['özyineleme', 'isinstance', 'iç içe liste'], src='Özyinelemeli düzleştirme (nested list sum) problemi',
    mode='func', fn='ic_ice_topla',
    statement='<p>Anadolu Market kategori ağacını iç içe listelerle tutuyor: bir eleman ya bir alt kategorinin ürün sayısıdır (int) ya da yeni bir alt kategori listesidir.</p>'
              '<p><code>ic_ice_topla(agac)</code> tüm seviyelerdeki sayıların toplamını döndürsün.</p>',
    input='<p>İç içe list; yapraklar int.</p>',
    output='<p>int</p>',
    constraints='Derinlik ≤ 500, toplam eleman ≤ 10^5',
    samples=[dict(call='ic_ice_topla([3, [2, [1]], 4])', why='3 + 2 + 1 + 4 = 10.'),
             dict(call='ic_ice_topla([[], [[]], 5])', why='Boş alt kategoriler 0 katkı yapar.')],
    start='def ic_ice_topla(agac):\n    toplam = 0\n    # liste ise içine in, sayı ise topla\n    return toplam\n',
    sol='def ic_ice_topla(agac):\n    toplam = 0\n    for el in agac:\n        if isinstance(el, list):\n            toplam += ic_ice_topla(el)\n        else:\n            toplam += el\n    return toplam\n',
    tests='assert ic_ice_topla([3, [2, [1]], 4]) == 10\nassert ic_ice_topla([]) == 0\nassert ic_ice_topla([[], [[]], 5]) == 5\nassert ic_ice_topla([1, 2, 3]) == 6\nassert ic_ice_topla([[[[[7]]]]]) == 7\nassert ic_ice_topla([-2, [2, [-3, 3]]]) == 0\nd = [1]\nfor _ in range(499):\n    d = [1, d]\nassert ic_ice_topla(d) == 500\nassert ic_ice_topla([list(range(1000))] * 100) == 49950000\n',
    editorial='<p><b>Fikir:</b> Özyineleme (recursion) iç içe yapılar için doğal çözümdür. Temel durum: eleman bir sayıysa kendisini ekle. Özyinelemeli durum: eleman listeyse aynı fonksiyonu o liste için çağır ve sonucunu ekle. Boş liste döngüye hiç girmeden 0 döndürür.</p>'
              '<p><b>Tür kontrolü:</b> <code>type(el) == list</code> yerine <code>isinstance(el, list)</code> kullan; alt sınıfları da kabul eder ve Pythonik yoldur.</p>'
              '<p><b>Derinlik sınırı:</b> Python\'da varsayılan özyineleme sınırı ~1000\'dir. Çok derin ağaçlarda yığıt (stack) ile yinelemeli çözüm yaz: <code>yigit = [agac]</code>, boşalana kadar <code>pop</code> et, liste elemanlarını yığıta, sayıları toplama ekle.</p>'
              '<p><b>Sık hata:</b> Özyinelemeli çağrının sonucunu <code>toplam += ...</code> ile eklemeyi unutmak (çağrı yapılır ama değer kaybolur).</p>',
    hints=['Eleman liste mi diye isinstance(el, list) ile bak.', 'Liste ise ic_ice_topla(el) sonucunu toplama ekle.']))

# ---------------------------------------------------------------- a-013
P.append(dict(
    id='a-013', title='Bagaj ücreti', track=T, diff='Orta',
    tags=['iç içe koşul', 'sözlük', 'input ayrıştırma'], src='HackerRank Python: If-Else ve koşul zinciri problemleri benzeri',
    mode='stdin',
    statement='<p>Kanat Havayolları bagaj kuralları sınıfa göre değişiyor:</p>'
              '<table><tr><th>Sınıf</th><th>Ücretsiz kg</th><th>Ücretsiz parça</th><th>Fazla kg başına</th><th>Fazla parça başına</th></tr>'
              '<tr><td>E (ekonomi)</td><td>20</td><td>1</td><td>50 TL</td><td>400 TL</td></tr>'
              '<tr><td>B (business)</td><td>32</td><td>2</td><td>30 TL</td><td>300 TL</td></tr></table>'
              '<p>Toplam ağırlık <b>100 kg\'ı geçerse</b> ya da parça sayısı <b>5\'i geçerse</b> bagaj kabul edilmez. Her yolcu için ücreti ya da <code>RED</code> yazdır.</p>',
    input='<p>İlk satırda <code>N</code>. Sonraki <code>N</code> satırda <code>sinif kg parca</code> (sınıf E ya da B).</p>',
    output='<p>Her yolcu için ücret (tam sayı) ya da <code>RED</code>.</p>',
    constraints='1 ≤ N ≤ 10^5, 0 ≤ kg ≤ 500, 0 ≤ parca ≤ 20',
    samples=[dict(in_='4\nE 23 1\nB 40 3\nE 15 2\nE 101 1\n', why='E 23 1: 3 fazla kg → 150. B 40 3: 8 kg × 30 + 1 parça × 300 = 540. E 15 2: 1 fazla parça → 400. 101 kg → RED.')],
    hidden=['1\nE 0 0\n', '2\nE 100 5\nB 100 5\n', '2\nE 20 6\nB 32 2\n', '1\nB 33 2\n', '3\nE 21 1\nE 20 1\nB 31 1\n',
            dict(gen='import random\nrandom.seed(9)\nn=100000\nprint(n)\nfor _ in range(n):\n    print(random.choice(\'EB\'), random.randint(0, 120), random.randint(0, 7))')],
    start='KURAL = {\'E\': (20, 1, 50, 400), \'B\': (32, 2, 30, 300)}\nn = int(input())\nfor _ in range(n):\n    sinif, kg, parca = input().split()\n    # kurallara göre ücret ya da RED\n',
    sol='import sys\nKURAL = {\'E\': (20, 1, 50, 400), \'B\': (32, 2, 30, 300)}\nsatirlar = sys.stdin.read().split(\'\\n\')\nn = int(satirlar[0])\ncikti = []\nfor satir in satirlar[1:1 + n]:\n    sinif, kg, parca = satir.split()\n    kg = int(kg); parca = int(parca)\n    if kg > 100 or parca > 5:\n        cikti.append(\'RED\')\n        continue\n    serbest_kg, serbest_parca, kg_ucret, parca_ucret = KURAL[sinif]\n    ucret = max(0, kg - serbest_kg) * kg_ucret + max(0, parca - serbest_parca) * parca_ucret\n    cikti.append(str(ucret))\nprint(\'\\n\'.join(cikti))\n',
    editorial='<p><b>Fikir:</b> Önce reddetme koşullarını kontrol et (erken çıkış / <code>continue</code>); böylece asıl hesap iç içe <code>if</code>\'lere boğulmaz. Sınıfa özgü sayıları bir sözlükte demet olarak tut ve <code>serbest_kg, ... = KURAL[sinif]</code> ile aç.</p>'
              '<p>Fazla miktar <code>max(0, kg − serbest)</code>; negatif fazla olamaz. Ağırlık ve parça ücretleri bağımsız toplanır.</p>'
              '<p><b>Neden sözlük?</b> <code>if sinif == \'E\': ... elif sinif == \'B\': ...</code> de çalışır, ama yeni bir sınıf (ör. "P" premium) eklemek sözlükte tek satırdır. Kuralı veriden ayırmak bakımı kolaylaştırır.</p>'
              '<p><b>Sık hata:</b> Sınırları ters almak: 100 kg tam sınırda kabul edilir (<code>&gt; 100</code> reddedilir), 5 parça kabul edilir. <code>input().split()</code> sonucunu <code>int</code>\'e çevirmeyi unutmak da string karşılaştırma hatasına yol açar (<code>\'9\' &gt; \'100\'</code> True!).</p>',
    hints=['Önce RED koşullarını kontrol et; sonra ücret hesabına geç.', 'Fazla kg = max(0, kg - serbest_kg); parça için de aynısı.']))

# ---------------------------------------------------------------- a-014
P.append(dict(
    id='a-014', title='Asal numaralı kuponlar', track=T, diff='Zor',
    tags=['elek', 'önek toplam', 'performans'], src='Eratosthenes eleği + çoklu sorgu (yarışma klasiği)',
    mode='stdin',
    statement='<p>Anadolu Market\'in yıl dönümü kampanyasında kupon numarası <b>asal</b> olan müşteriler hediye kazanıyor. Kuponlar 1\'den başlayarak numaralanmış.</p>'
              '<p>Mağazalardan gelen her sorguda bir <code>x</code> değeri var: 1..x aralığındaki kaç kupon hediye kazanır? Çok sayıda sorgu olduğundan her sorguda baştan saymak yavaş kalır.</p>',
    input='<p>İlk satırda <code>Q</code>, ikinci satırda <code>Q</code> tam sayı.</p>',
    output='<p>Her sorgunun cevabı ayrı satırda.</p>',
    constraints='1 ≤ Q ≤ 10^5, 1 ≤ x ≤ 10^6',
    samples=[dict(in_='4\n1 10 2 30\n', why='1 asal değil → 0. 10\'a kadar 2,3,5,7 → 4. 2\'ye kadar → 1. 30\'a kadar 10 asal var.')],
    hidden=['1\n1\n', '1\n2\n', '1\n1000000\n', '3\n3 4 5\n', '2\n97 100\n',
            dict(gen='import random\nrandom.seed(14)\nq=100000\nprint(q)\nprint(*[random.randint(1, 10**6) for _ in range(q)])')],
    start='q = int(input())\nsorgular = list(map(int, input().split()))\n# önce eleği kur, sonra her sorguya O(1) cevap ver\n',
    sol='import sys\nveri = sys.stdin.read().split()\nq = int(veri[0])\nsorgular = list(map(int, veri[1:1 + q]))\nm = max(sorgular)\nasal = bytearray([1]) * (m + 1)\nasal[0] = 0\nif m >= 1:\n    asal[1] = 0\ni = 2\nwhile i * i <= m:\n    if asal[i]:\n        asal[i * i::i] = bytes(len(range(i * i, m + 1, i)))\n    i += 1\nonek = [0] * (m + 1)\nsay = 0\nfor k in range(m + 1):\n    say += asal[k]\n    onek[k] = say\nprint(\'\\n\'.join(str(onek[x]) for x in sorgular))\n',
    editorial='<p><b>Fikir (iki aşama):</b></p><ol><li><b>Eratosthenes eleği:</b> 0..M için "asal mı" dizisi kur. 2\'den başla; asal bulduğun her <code>i</code> için <code>i*i</code>\'den başlayarak katlarını sil. Karmaşıklık O(M log log M).</li>'
              '<li><b>Önek toplamı:</b> <code>onek[k]</code> = 0..k arasındaki asal sayısı. Sonra her sorgu <code>onek[x]</code> ile O(1).</li></ol>'
              '<p><b>Python hız hilesi:</b> Katları tek tek silmek yerine dilim ataması <code>asal[i*i::i] = bytes(adet)</code> C hızında çalışır. <code>bytearray</code> bellekte eleman başına 1 bayt tutar; liste ise ~8 bayt referans.</p>'
              '<p><b>Neden saf yöntem yetmez?</b> Her sorgu için 1..x\'i deneme bölmesiyle saymak 10^5 sorgu × 10^6 sayı demektir; asla bitmez. "Çok sorgu + sabit veri" gördüğünde <b>önceden hesapla</b> (precompute) diye düşün.</p>'
              '<p><b>Sık hata:</b> 1\'i asal saymak; katları <code>2*i</code> yerine <code>i*i</code>\'den başlatmanın doğru olduğunu bilmemek (daha küçük katlar zaten silinmiştir).</p>',
    hints=['Tüm sorgulardaki en büyük x\'e kadar bir kez elek kur.', 'onek[k] = k\'ye kadar asal sayısı; her sorgu bir dizi erişimi olur.']))

# ---------------------------------------------------------------- a-015
P.append(dict(
    id='a-015', title='Romen rakamlı dönem etiketleri', track=T, diff='Zor',
    tags=['sözlük', 'açgözlü', 'metin ayrıştırma'], src='Roman to Integer / Integer to Roman (LeetCode) birleşimi',
    mode='stdin',
    statement='<p>Pusula İK eğitim arşivinde dönemler Romen rakamıyla etiketlenmiş (ör. <code>MMXXIV</code>). Yeni sistem hem çeviri hem ters çeviri istiyor.</p>'
              '<p>Her satır ya bir tam sayı ya da geçerli bir Romen rakamıdır. Sayıysa Romen karşılığını, Romen rakamıysa sayı değerini yazdır. Standart çıkarma kuralları geçerlidir: IV=4, IX=9, XL=40, XC=90, CD=400, CM=900.</p>',
    input='<p>İlk satırda <code>N</code>, sonraki <code>N</code> satırda birer değer.</p>',
    output='<p>Her değer için çeviri.</p>',
    constraints='1 ≤ N ≤ 10^5, sayılar 1..3999',
    samples=[dict(in_='4\n2024\nMCMXCIV\n4\nXL\n', why='2024 = MM + XX + IV. MCMXCIV = 1000 + 900 + 90 + 4 = 1994. 4 → IV. XL → 40.')],
    hidden=['1\n1\n', '1\n3999\n', '1\nMMMCMXCIX\n', '3\nI\nIX\nCD\n', '4\n49\n944\n3888\nMMMDCCCLXXXVIII\n',
            dict(gen='import random\nrandom.seed(15)\nV=[(1000,\'M\'),(900,\'CM\'),(500,\'D\'),(400,\'CD\'),(100,\'C\'),(90,\'XC\'),(50,\'L\'),(40,\'XL\'),(10,\'X\'),(9,\'IX\'),(5,\'V\'),(4,\'IV\'),(1,\'I\')]\ndef r(n):\n    s=\'\'\n    for v,h in V:\n        while n>=v:\n            s+=h; n-=v\n    return s\nn=100000\nprint(n)\nfor _ in range(n):\n    x=random.randint(1,3999)\n    print(x if random.random()<0.5 else r(x))')],
    start='DEGER = {\'I\': 1, \'V\': 5, \'X\': 10, \'L\': 50, \'C\': 100, \'D\': 500, \'M\': 1000}\nn = int(input())\nfor _ in range(n):\n    s = input().strip()\n    # sayı mı, Romen mi?\n',
    sol='import sys\nDEGER = {\'I\': 1, \'V\': 5, \'X\': 10, \'L\': 50, \'C\': 100, \'D\': 500, \'M\': 1000}\nCIFTLER = [(1000, \'M\'), (900, \'CM\'), (500, \'D\'), (400, \'CD\'), (100, \'C\'), (90, \'XC\'),\n           (50, \'L\'), (40, \'XL\'), (10, \'X\'), (9, \'IX\'), (5, \'V\'), (4, \'IV\'), (1, \'I\')]\n\ndef romene(n):\n    parcalar = []\n    for deger, harf in CIFTLER:\n        adet, n = divmod(n, deger)\n        parcalar.append(harf * adet)\n    return \'\'.join(parcalar)\n\ndef sayiya(s):\n    toplam = 0\n    for i, ch in enumerate(s):\n        v = DEGER[ch]\n        if i + 1 < len(s) and v < DEGER[s[i + 1]]:\n            toplam -= v\n        else:\n            toplam += v\n    return toplam\n\nsatirlar = sys.stdin.read().split()\nn = int(satirlar[0])\ncikti = []\nfor s in satirlar[1:1 + n]:\n    cikti.append(romene(int(s)) if s.isdigit() else str(sayiya(s)))\nprint(\'\\n\'.join(cikti))\n',
    editorial='<p><b>Sayı → Romen:</b> Altı çıkarma çiftini de (CM, CD, XC, XL, IX, IV) normal sembollerle birlikte büyükten küçüğe bir tabloya koy. Sonra açgözlü: her değerden <code>divmod</code> ile kaç tane sığıyorsa o kadar harf ekle. Tablo bu kadar, özel durum kalmaz.</p>'
              '<p><b>Romen → sayı:</b> Soldan sağa gez; bir sembolün değeri <b>sağındakinden küçükse</b> çıkar, değilse ekle. MCMXCIV: M(+1000) C(−100, çünkü M daha büyük) M(+1000) X(−10) C(+100) I(−1) V(+5) = 1994.</p>'
              '<p><b>Ayırt etme:</b> <code>s.isdigit()</code> ile sayı mı Romen mi olduğunu anla. Girdi çok satırlı ve büyük olduğundan <code>sys.stdin.read().split()</code> ile oku.</p>'
              '<p><b>Karmaşıklık:</b> Her değer için O(uzunluk), toplam O(N·15).</p>'
              '<p><b>Sık hata:</b> Romen → sayı çevirisinde son karakterde <code>s[i + 1]</code>\'e erişip <code>IndexError</code> almak; ya da tabloya yalnız 7 temel sembolü koyup 4\'ü IIII yazmak.</p>',
    hints=['Sayıdan Romen\'e: 13 elemanlı (değer, harf) tablosu ve divmod.', 'Romen\'den sayıya: sağdaki sembol daha büyükse mevcut değeri çıkar.']))


if __name__ == '__main__':
    for p in P:
        for s in p.get('samples', []):
            if 'in_' in s:
                s['in'] = s.pop('in_')
    build(P, '/home/claude/py/v3/a1/arena_01.js')
