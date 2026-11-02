import sys, textwrap
sys.path.insert(0, '/tmp/claude-0/-home-claude/6c066959-3fcb-54bb-bdf1-c8ae148dfc4c/scratchpad/arena_a1')
from arena_build import build


def c(s):
    return textwrap.dedent(s).lstrip('\n')


T = 'Metinler'
P = []
TRLOW = "def tr_kucuk(s):\n    return s.replace('I', 'ı').replace('İ', 'i').lower()\n"
TRUP = "def tr_buyuk(s):\n    return s.replace('i', 'İ').replace('ı', 'I').upper()\n"

# ---------------------------------------------------------------- a-031
P.append(dict(
    id='a-031', title='Türkçe büyük/küçük harf çevirme', track=T, diff='Kolay',
    tags=['str', 'Türkçe karakter', 'swapcase'], src='HackerRank Python: sWAP cASE benzeri (Türkçe uyarlama)',
    mode='stdin',
    statement='<p>Pusula İK\'nın eski sistemi Caps Lock açıkken girilmiş kayıtlarla dolu. Her harfin büyük/küçük durumunu tersine çevirmen gerekiyor.</p>'
              '<p>Ama dikkat: Türkçede <code>i ↔ İ</code> ve <code>ı ↔ I</code> eşleşir. Python\'un <code>swapcase()</code> metodu İngilizce kurala göre <code>i</code>\'yi <code>I</code> yapar; bu Türkçe için yanlıştır. Harf olmayan karakterler aynen kalır.</p>',
    input='<p>Tek satır metin.</p>',
    output='<p>Çevrilmiş metin.</p>',
    constraints='1 ≤ uzunluk ≤ 2·10^5; metin Türkçe harfler, rakamlar, boşluk ve noktalama içerir',
    samples=[dict(in_='İSTANBUL ışık ılık\n', why='İ → i, I → ı, ı → I. Sonuç: istanbul IŞIK ILIK.'), dict(in_='Pusula İK 2024!\n', why='Rakam ve noktalama değişmez; İ → i, K → k.')],
    hidden=['a\n', 'İ\n', 'I\n', 'ı\n', 'i\n', 'ÇĞÖŞÜ çğöşü\n', '123 ... ?\n',
            dict(gen="import random\nrandom.seed(31)\nh='abcçdefgğhıijklmnoöprsştuüvyzABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ 0123.,'\nprint(''.join(random.choice(h) for _ in range(2 * 10**5)))")],
    start="metin = input()\n# Türkçe kurala uygun swapcase\n",
    sol=c(r'''
        OZEL = {'i': 'İ', 'ı': 'I', 'İ': 'i', 'I': 'ı'}
        metin = input()
        print(''.join(OZEL.get(ch, ch.swapcase()) for ch in metin))
        '''),
    editorial='<p><b>Fikir:</b> Dört Türkçe özel harfi bir sözlükte eşle; diğer her karakter için standart <code>swapcase()</code> doğru çalışır. <code>OZEL.get(ch, ch.swapcase())</code> "sözlükte varsa onu, yoksa varsayılanı" demektir.</p>'
              '<p><b>Neden gerekli?</b> Python Unicode varsayılan kurallarını uygular: <code>\'i\'.upper()</code> → <code>\'I\'</code>, <code>\'İ\'.lower()</code> → <code>\'i̇\'</code> (i + birleşik nokta, <b>iki</b> karakter!). Türkçe metinlerde arama, sıralama ve karşılaştırma hatalarının çoğu buradan çıkar.</p>'
              '<p><b>Alternatif:</b> <code>str.maketrans</code> ile çeviri tablosu ve <code>translate</code>; ya da PyICU gibi yerel ayar destekli kütüphaneler. <code>locale.setlocale</code> Python\'un <code>str.upper</code>\'ını etkilemez.</p>'
              '<p><b>Karmaşıklık:</b> O(n). Parçaları listede toplayıp <code>\'\'.join</code> kullan; döngüde <code>+=</code> ile metin büyütmek garanti hızlı değildir.</p>',
    hints=['i, ı, İ, I için özel bir sözlük kur.', 'Sözlükte olmayan karakterlerde ch.swapcase() kullan.']))

# ---------------------------------------------------------------- a-032
P.append(dict(
    id='a-032', title='Logda hata kodu sayımı', track=T, diff='Kolay',
    tags=['str.find', 'çakışan eşleşme', 'döngü'], src='HackerRank Python: Find a string benzeri',
    mode='stdin',
    statement='<p>Lezzet Kurye sunucu logları tek uzun satırda birleştirilmiş. Bir hata kodunun logda kaç kez geçtiğini bulman gerekiyor; <b>çakışan</b> eşleşmeler de sayılır. Örneğin <code>ABABA</code> içinde <code>ABA</code> iki kez geçer.</p>',
    input='<p>İlk satırda log metni, ikinci satırda aranan kod.</p>',
    output='<p>Geçiş sayısı.</p>',
    constraints='1 ≤ |kod| ≤ |log| ≤ 2·10^5; büyük/küçük harf duyarlı',
    samples=[dict(in_='ERR5ERR5ERR\nERR5ERR\n', why='0. ve 4. konumlarda başlayan iki eşleşme var; str.count bunu 1 sayar.'), dict(in_='abcABCabc\nabc\n', why='Büyük harfli ABC eşleşmez: 2.')],
    hidden=['a\na\n', 'a\nb\n', 'aaaa\naa\n', 'xyz\nxyzz\n', 'çççç\nçç\n', 'ab ab ab\nb a\n',
            dict(gen="print('a' * 2 * 10**5)\nprint('aaa')"),
            dict(gen="import random\nrandom.seed(32)\nprint(''.join(random.choice('AB') for _ in range(2 * 10**5)))\nprint('ABAB')")],
    start="log = input()\nkod = input()\n# çakışanlar dahil say\n",
    sol=c(r'''
        log = input()
        kod = input()
        sayac = 0
        i = log.find(kod)
        while i != -1:
            sayac += 1
            i = log.find(kod, i + 1)
        print(sayac)
        '''),
    editorial='<p><b>Fikir:</b> <code>str.find(alt, baslangic)</code> verilen konumdan itibaren ilk eşleşmenin indeksini, yoksa −1 döndürür. Bir eşleşme bulunca aramayı <b>bir sonraki karakterden</b> (<code>i + 1</code>) sürdürmek çakışanları da yakalar.</p>'
              '<p><b>Tuzak:</b> <code>log.count(kod)</code> çakışmayan eşleşmeleri sayar: <code>\'aaaa\'.count(\'aa\')</code> → 2, oysa çakışanlarla 3.</p>'
              '<p><b>Alternatif:</b> <code>sum(log.startswith(kod, i) for i in range(len(log) - len(kod) + 1))</code> okunaklıdır ama her konumu dener. Regex ile ileriye bakış: <code>len(re.findall(\'(?=\' + re.escape(kod) + \')\', log))</code>.</p>'
              '<p><b>Karmaşıklık:</b> En kötü durumda O(n·m), ama <code>find</code> C ile yazıldığından pratikte çok hızlıdır. Garantili O(n+m) için KMP algoritması kullanılır.</p>',
    hints=['log.find(kod, i) i konumundan itibaren arar.', 'Eşleşme bulunca aramayı i + 1\'den sürdür; str.count çakışanları saymaz.']))

# ---------------------------------------------------------------- a-033
P.append(dict(
    id='a-033', title='Şifre karakter denetimi', track=T, diff='Kolay',
    tags=['isalnum', 'isdigit', 'any'], src='HackerRank Python: String Validators benzeri',
    mode='stdin',
    statement='<p>Anadolu Bank internet şubesi şifre ekranı, girilen şifre hakkında beş bilgi gösteriyor. Şifrede en az bir tane:</p>'
              '<ol><li>harf ya da rakam var mı</li><li>harf var mı</li><li>rakam var mı</li><li>küçük harf var mı</li><li>büyük harf var mı</li></ol>'
              '<p>Her şifre için bu beş cevabı <code>True</code>/<code>False</code> olarak tek satırda, boşlukla ayırarak yazdır. Türkçe harfler (ç, Ğ, ı...) de harf sayılır.</p>',
    input='<p>İlk satırda <code>N</code>, sonraki <code>N</code> satırda birer şifre (boşluk içerebilir).</p>',
    output='<p>Her şifre için 5 değer.</p>',
    constraints='1 ≤ N ≤ 2·10^4, 1 ≤ uzunluk ≤ 50',
    samples=[dict(in_='3\nKanat2024\n#$%&\nçiçek 7\n', why='Kanat2024: hepsi True. #$%&: hiçbiri. çiçek 7: büyük harf yok.')],
    hidden=['1\n7\n', '1\nA\n', '1\nı\n', '1\nİ\n', '2\n   \n_-_\n', '1\nŞifre!\n',
            dict(gen="import random\nrandom.seed(33)\nn=20000\nprint(n)\nh='aBçĞıİ09 #!'\nfor _ in range(n):\n    print(''.join(random.choice(h) for _ in range(random.randint(1, 50))).strip() or 'x')")],
    start="n = int(input())\nfor _ in range(n):\n    sifre = input()\n    # any() ile beş denetim\n",
    sol=c(r'''
        import sys
        satirlar = sys.stdin.read().split('\n')
        n = int(satirlar[0])
        cikti = []
        for s in satirlar[1:1 + n]:
            sonuc = [any(ch.isalnum() for ch in s), any(ch.isalpha() for ch in s),
                     any(ch.isdigit() for ch in s), any(ch.islower() for ch in s),
                     any(ch.isupper() for ch in s)]
            cikti.append(' '.join(map(str, sonuc)))
        print('\n'.join(cikti))
        '''),
    editorial='<p><b>Fikir:</b> <code>s.isdigit()</code> gibi metotlar <b>tüm</b> karakterler için sorar; burada ise "en az bir" isteniyor. Bunu <code>any(ch.isdigit() for ch in s)</code> ile karakter düzeyinde sorarsın. <code>any</code> ilk <code>True</code>\'da durur (kısa devre).</p>'
              '<p><b>Türkçe:</b> Unicode metotları <code>ç</code>, <code>ı</code>, <code>İ</code> için doğru çalışır: <code>\'ı\'.islower()</code> True, <code>\'İ\'.isupper()</code> True. Sorun yalnız büyük/küçük <b>dönüştürmede</b> çıkar, sınıflandırmada değil.</p>'
              '<p><b>Not:</b> <code>isdigit</code> "²" gibi üst simgeleri de rakam sayar; yalnız 0–9 istiyorsan <code>ch in \'0123456789\'</code> ya da <code>ch.isdecimal()</code>.</p>'
              '<p><b>Sık hata:</b> <code>s.isalnum()</code> ile tüm metni sormak (\'Kanat 2024\' boşluk yüzünden False olur) ya da beş değeri ayrı satırlara basmak.</p>',
    hints=['any(ch.isalpha() for ch in s) "en az bir harf var mı" demektir.', 'str(True) çıktısı "True"; join için map(str, ...) kullan.']))

# ---------------------------------------------------------------- a-034
P.append(dict(
    id='a-034', title='Kasa fişi satırları', track=T, diff='Kolay',
    tags=['ljust', 'rjust', 'biçimlendirme'], src='HackerRank Python: Text Alignment benzeri',
    mode='stdin',
    statement='<p>Anadolu Market kasa yazıcısı sabit genişlikte (<code>W</code> karakter) fiş basıyor. Her ürün satırı şöyle:</p>'
              '<ul><li>İlk <code>W−10</code> karakter: ürün adı, sağı nokta (<code>.</code>) ile doldurulmuş. Ad daha uzunsa <code>W−10</code> karaktere kırpılır.</li>'
              '<li>Son 10 karakter: fiyat, Türkçe biçimde (<code>12,50</code>), sağa yaslı, solu boşlukla doldurulmuş.</li></ul>'
              '<p>En sonda aynı biçimde ad yerine <code>TOPLAM</code> yazan bir satır var. Fiyatlar kuruş cinsinden veriliyor.</p>',
    input='<p>İlk satırda <code>W N</code>, sonraki <code>N</code> satırda <code>ad;kurus</code>.</p>',
    output='<p><code>N+1</code> satır, her biri tam <code>W</code> karakter.</p>',
    constraints='16 ≤ W ≤ 60, 1 ≤ N ≤ 10^4, 0 ≤ kuruş ≤ 10^7; toplam tutar metni 10 karaktere sığar',
    samples=[dict(in_='24 3\nEkmek;1250\nBeyaz peynir 600 gr;18990\nSu;500\n', why='W−10 = 14: "Beyaz peynir 6" olarak kırpılır. Toplam 20740 kuruş = 207,40.')],
    hidden=['16 1\nA;0\n', '16 1\nAbcdefgh;5\n', '20 2\nÇay;100000\nŞeker;99\n', '30 1\nTam on dört kr;1\n', '18 2\nX;9999999\nY;1\n',
            dict(gen="import random\nrandom.seed(34)\nn=10000\nprint(40, n)\nfor i in range(n):\n    print('ürün' + 'x' * random.randint(0, 40) + ';' + str(random.randint(0, 900)))")],
    start="w, n = map(int, input().split())\n# her satırda ad;kurus\n",
    sol=c(r'''
        import sys
        satirlar = sys.stdin.read().split('\n')
        w, n = map(int, satirlar[0].split())

        def tl(kurus):
            return f'{kurus // 100},{kurus % 100:02d}'

        def satir(ad, kurus):
            return ad[:w - 10].ljust(w - 10, '.') + tl(kurus).rjust(10)

        toplam = 0
        cikti = []
        for s in satirlar[1:1 + n]:
            ad, kurus = s.rsplit(';', 1)
            kurus = int(kurus)
            toplam += kurus
            cikti.append(satir(ad, kurus))
        cikti.append(satir('TOPLAM', toplam))
        print('\n'.join(cikti))
        '''),
    editorial='<p><b>Fikir:</b> <code>ad[:w-10]</code> ile kırp (kısa adlarda dilim hata vermez), <code>.ljust(w-10, \'.\')</code> ile sağını noktayla doldur. Fiyatı <code>.rjust(10)</code> ile sağa yasla. f-string karşılığı: <code>f\'{ad[:g]:.&lt;{g}}{fiyat:&gt;10}\'</code>.</p>'
              '<p><b>Türkçe para biçimi:</b> Kuruşu <code>divmod</code> ile ayır: <code>f\'{k // 100},{k % 100:02d}\'</code>. <code>:02d</code>, 5 kuruşu <code>05</code> yazar; unutursan 0,5 çıkar.</p>'
              '<p><b>Ayrıştırma:</b> <code>rsplit(\';\', 1)</code> sağdan tek bölme yapar; ürün adında <code>;</code> olsa bile fiyat doğru ayrılır.</p>'
              '<p><b>Sık hata:</b> Float ile <code>kurus / 100</code> yazıp <code>replace(\'.\', \',\')</code> yapmak: 1250 → <code>12,5</code> (sondaki sıfır kaybolur).</p>',
    hints=['str.ljust(genislik, dolgu) ve str.rjust(genislik) kullan.', 'Fiyat: f\'{k // 100},{k % 100:02d}\'.']))

# ---------------------------------------------------------------- a-035
P.append(dict(
    id='a-035', title='Kampanya sloganı palindrom mu?', track=T, diff='Kolay',
    tags=['palindrom', 'Türkçe karakter', 'filtreleme'], src='Valid Palindrome (LeetCode 125) Türkçe uyarlaması',
    mode='func', fn='palindrom_mu',
    statement='<p>Kanat Havayolları reklam ekibi tersten de aynı okunan sloganlar arıyor. Kontrol yaparken boşluklar, noktalama ve büyük/küçük harf farkı yok sayılır; yalnız harfler ve rakamlar dikkate alınır.</p>'
              '<p><code>palindrom_mu(metin)</code> True/False döndürsün. Büyük/küçük dönüşümü <b>Türkçe kurala</b> göre yap: <code>I</code> → <code>ı</code>, <code>İ</code> → <code>i</code>.</p>',
    input='<p>str</p>',
    output='<p>bool</p>',
    constraints='0 ≤ uzunluk ≤ 2·10^5',
    samples=[dict(call="palindrom_mu('Ey Edip, Adana\\'da pide ye!')", why='Sadeleşince "eyedipadanadapideye".'),
             dict(call="palindrom_mu('Iı')", why='Türkçe küçültmede "ıı" olur: palindrom. Standart lower() "iı" yapar.'),
             dict(call="palindrom_mu('Kanat')", why='"kanat" tersten "tanak".')],
    start='def palindrom_mu(metin):\n    # Türkçe küçült, harf/rakam dışını at, tersiyle karşılaştır\n    return None\n',
    sol=TRLOW + c(r'''

        def palindrom_mu(metin):
            temiz = [ch for ch in tr_kucuk(metin) if ch.isalnum()]
            return temiz == temiz[::-1]
        '''),
    tests=c(r'''
        assert palindrom_mu("Ey Edip, Adana'da pide ye!") is True
        assert palindrom_mu('Kanat') is False
        assert palindrom_mu('') is True
        assert palindrom_mu('?!.') is True
        assert palindrom_mu('Iı') is True
        assert palindrom_mu('İi') is True
        assert palindrom_mu('Iİ') is False
        assert palindrom_mu('12 3 21') is True
        assert palindrom_mu('Ç.ç') is True and palindrom_mu('ab') is False
        assert palindrom_mu('Ab, ' * 1000 + 'x' + ' ,bA' * 1000) is True and palindrom_mu('a' * 2 * 10**5 + 'b') is False
        '''),
    editorial='<p><b>Fikir:</b> Üç adım: (1) Türkçe küçült: önce <code>I→ı</code>, <code>İ→i</code> değiştir, sonra <code>lower()</code>. (2) <code>isalnum()</code> ile yalnız harf/rakamları tut. (3) Tersiyle (<code>[::-1]</code>) karşılaştır.</p>'
              '<p><b>Sıra önemli:</b> <code>replace</code> işlemlerini <code>lower()</code>\'dan <b>önce</b> yap; yoksa <code>I</code> zaten <code>i</code> olmuş olur.</p>'
              '<p><b>Bellek dostu alternatif:</b> İki işaretçi: <code>sol</code> baştan, <code>sag</code> sondan ilerler; harf/rakam olmayanları atla, karşılaştır. Ek liste gerekmez, O(1) ek bellek. Mülakatlarda sık istenir.</p>'
              '<p><b>Sık hata:</b> Standart <code>lower()</code>: <code>\'İ\'.lower()</code> iki karakterli <code>\'i̇\'</code> döndürür ve palindrom kontrolünü bozar. <code>print</code> etmek yerine <code>return</code> et.</p>',
    hints=["Önce replace('I', 'ı').replace('İ', 'i'), sonra lower().", 'Harf/rakamları isalnum() ile süz ve tersiyle karşılaştır.']))

# ---------------------------------------------------------------- a-036
P.append(dict(
    id='a-036', title='Müşteri yorumu istatistiği', track=T, diff='Kolay',
    tags=['split', 'strip', 'max key'], src='Kelime sayımı / en uzun kelime alıştırması',
    mode='stdin',
    statement='<p>Lezzet Kurye müşteri yorumlarını hızlıca özetliyor. Bir yorum için kelime sayısını, en uzun kelimeyi ve uzunluğunu yazdır.</p>'
              '<p>Kelimeler boşluk karakterleriyle ayrılır; her kelimenin <b>başındaki ve sonundaki</b> <code>.,;:!?"\'()</code> karakterleri atılır. Atıldıktan sonra boş kalan parçalar kelime sayılmaz. En uzun kelimede eşitlik varsa <b>ilk</b> geçen seçilir.</p>',
    input='<p>Tek satır yorum.</p>',
    output='<p>Tek satırda <code>sayi kelime uzunluk</code>.</p>',
    constraints='1 ≤ uzunluk ≤ 5·10^5; en az bir kelime var',
    samples=[dict(in_='Yemek sıcak geldi, kurye çok kibardı!\n', why='6 kelime. "kibardı!" → "kibardı" (7 harf) en uzun.'), dict(in_='"Harika" - (süper)\n', why='"-" atılacak karakterlerden olmadığı için tek başına kelime sayılır: 3 kelime. En uzun Harika (6).')],
    hidden=['a\n', '  çok   güzel  \n', '... merhaba ...\n', 'ab cd ef\n', 'Şükran, teşekkürler; teşekkürlerr.\n', 'x!? (yy) "zzz"\n',
            dict(gen="import random\nrandom.seed(36)\nh='abcçdefgğhıijklmnoöprsştuüvyz'\nprint(' '.join(''.join(random.choice(h) for _ in range(random.randint(1, 12))) + random.choice(['', '', ',', '.', '!']) for _ in range(40000)))")],
    start="yorum = input()\n# kelimeleri ayır ve noktalamayı temizle\n",
    sol=c(r'''
        yorum = input()
        kelimeler = [k.strip('.,;:!?"\'()') for k in yorum.split()]
        kelimeler = [k for k in kelimeler if k]
        en_uzun = max(kelimeler, key=len)
        print(len(kelimeler), en_uzun, len(en_uzun))
        '''),
    editorial='<p><b>Fikir:</b> <code>split()</code> argümansız çağrılınca ardışık boşlukları tek ayraç sayar ve baş/son boşlukları yok eder; <code>split(\' \')</code> ise boş parçalar üretir. Sonra her kelimeye <code>strip(karakterler)</code>: verilen kümedeki karakterleri <b>uçlardan</b> siler (ortadakilere dokunmaz).</p>'
              '<p><b>En uzun:</b> <code>max(liste, key=len)</code> eşitlikte ilk elemanı döndürür, istenen kural tam olarak budur.</p>'
              '<p><b>Not:</b> <code>len</code> Türkçe karakterleri tek sayar (<code>len(\'ğ\') == 1</code>), çünkü Python 3 metinleri Unicode kod noktası dizisidir. Bayt uzunluğu ise farklıdır: <code>len(\'ğ\'.encode()) == 2</code>.</p>'
              '<p><b>Sık hata:</b> <code>strip</code> argümanını bir "sonek" sanmak: <code>\'abc\'.strip(\'ca\')</code> → <code>\'b\'</code>; karakter kümesi olarak çalışır. Tamamen noktalamadan oluşan parçaları saymak.</p>',
    hints=['split() argümansız kullanılınca fazla boşluklar sorun olmaz.', 'max(kelimeler, key=len) eşitlikte ilkini döndürür.']))

# ---------------------------------------------------------------- a-037
P.append(dict(
    id='a-037', title='Plaka kaydı düzeltme', track=T, diff='Kolay',
    tags=['değişmezlik', 'liste', 'join'], src='HackerRank Python: Mutations benzeri',
    mode='stdin',
    statement='<p>Pedal İzmir\'in bisiklet seri numaraları uzun bir metinde birleştirilmiş tutuluyor ve operatörler tek tek karakter düzeltmeleri yapıyor. Her düzeltme "<code>i</code> konumundaki karakteri <code>c</code> yap" anlamına gelir (0 tabanlı).</p>'
              '<p>Tüm düzeltmeler uygulandıktan sonraki metni yazdır.</p>',
    input='<p>İlk satırda metin, ikinci satırda <code>Q</code>, sonra <code>Q</code> satırda <code>i c</code>.</p>',
    output='<p>Son metin.</p>',
    constraints='1 ≤ uzunluk ≤ 2·10^5, 0 ≤ Q ≤ 2·10^5, 0 ≤ i &lt; uzunluk',
    samples=[dict(in_='PDL-0O1-IZM\n2\n5 0\n8 İ\n', why='5. konumdaki O sıfır olur; 8. konumdaki I, İ yapılır: PDL-001-İZM.')],
    hidden=['a\n0\n', 'a\n1\n0 b\n', 'abc\n3\n0 x\n0 y\n0 z\n', 'xyz\n2\n2 ç\n1 ğ\n', 'aaaa\n4\n0 b\n1 b\n2 b\n3 b\n',
            dict(gen="import random\nrandom.seed(37)\nn=200000\nprint(''.join(random.choice('ABC0123') for _ in range(n)))\nq=200000\nprint(q)\nfor _ in range(q):\n    print(random.randrange(n), random.choice('XYZ9'))")],
    start="metin = input()\nq = int(input())\nfor _ in range(q):\n    i, c = input().split()\n    # metin[int(i)] = c çalışmaz; neden?\n",
    sol=c(r'''
        import sys
        satirlar = sys.stdin.read().split('\n')
        harfler = list(satirlar[0])
        q = int(satirlar[1])
        for s in satirlar[2:2 + q]:
            i, ch = s.split()
            harfler[int(i)] = ch
        print(''.join(harfler))
        '''),
    editorial='<p><b>Neden doğrudan atama olmaz?</b> Python metinleri değişmezdir (immutable): <code>metin[5] = \'0\'</code> → <code>TypeError: \'str\' object does not support item assignment</code>.</p>'
              '<p><b>Fikir:</b> Metni bir kez <code>list(metin)</code> ile karakter listesine çevir, tüm düzeltmeleri listede O(1) atamayla yap, sonunda <code>\'\'.join(...)</code> ile tek seferde metne dön. Toplam O(n + Q).</p>'
              '<p><b>Neden dilimleme değil?</b> <code>metin = metin[:i] + c + metin[i+1:]</code> her düzeltmede yeni bir metin kurar: O(n). 2·10^5 düzeltme × 2·10^5 uzunluk = 4·10^10 karakter kopyası; büyük test bunu yakalar.</p>'
              '<p><b>Sık hata:</b> <code>i</code>\'yi <code>int</code>\'e çevirmeyi unutmak (liste indeksi metin olamaz).</p>',
    hints=['Metinler değişmez; önce list(metin) ile listeye çevir.', 'Sonunda \'\'.join(liste) ile metne dön.']))

# ---------------------------------------------------------------- a-038
P.append(dict(
    id='a-038', title='Şirket adı kısaltması', track=T, diff='Kolay',
    tags=['split', 'Türkçe karakter', 'upper'], src='Acronym üretimi alıştırması',
    mode='stdin',
    statement='<p>Pusula İK tedarikçi kartlarında şirket adlarının kısaltmasını gösteriyor: her kelimenin ilk harfi, <b>Türkçe kurala göre büyütülerek</b> yan yana yazılır. Bağlaç olan <code>ve</code> ile <code>ile</code> kelimeleri (büyük/küçük fark etmeksizin) atlanır.</p>'
              '<p>Örneğin <code>ılgaz inşaat ve işletme</code> → <code>Iİİ</code>.</p>',
    input='<p>İlk satırda <code>N</code>, sonraki <code>N</code> satırda şirket adı.</p>',
    output='<p>Her ad için kısaltma.</p>',
    constraints='1 ≤ N ≤ 3·10^4; her adda atlanmayan en az bir kelime var; kelimeler harfle başlar',
    samples=[dict(in_='3\nılgaz inşaat ve işletme\nAnadolu Market\nçınar ile ortakları gıda\n', why='ı → I, i → İ (Türkçe). "ve" ve "ile" atlanır: ÇOG.')],
    hidden=['1\na\n', '1\nVE ortak\n', '1\nİLE Ve İle iz\n', '2\nıı\nii\n', '1\n  çok   boşluklu   ad  \n', '1\nüçgen öğrenme şirketi\n',
            dict(gen="import random\nrandom.seed(38)\nh='abcçdefgğhıijklmnoöprsştuüvyz'\nn=30000\nprint(n)\nfor _ in range(n):\n    print(' '.join(random.choice(['ve', 'ile', ''.join(random.choice(h) for _ in range(5))]) for _ in range(4)) + ' son')")],
    start="n = int(input())\nfor _ in range(n):\n    ad = input()\n    # baş harfleri Türkçe kurala göre büyüt\n",
    sol=TRLOW + TRUP + c(r'''
        import sys
        ATLA = {'ve', 'ile'}
        satirlar = sys.stdin.read().split('\n')
        n = int(satirlar[0])
        cikti = []
        for ad in satirlar[1:1 + n]:
            harfler = [tr_buyuk(k[0]) for k in ad.split() if tr_kucuk(k) not in ATLA]
            cikti.append(''.join(harfler))
        print('\n'.join(cikti))
        '''),
    editorial='<p><b>Fikir:</b> <code>split()</code> ile kelimeleri al, bağlaçları bir kümeyle (<code>{\'ve\', \'ile\'}</code>, O(1) üyelik) ele, kalanların ilk harfini Türkçe büyüt ve birleştir.</p>'
              '<p><b>Türkçe büyütme:</b> <code>s.replace(\'i\', \'İ\').replace(\'ı\', \'I\').upper()</code>. Bağlaç kontrolünde de Türkçe küçültme kullan: <code>\'İLE\'.lower()</code> standart kuralla <code>\'i̇le\'</code> olur ve <code>\'ile\'</code>\'ye eşit çıkmaz!</p>'
              '<p><b>Sık hata:</b> <code>\'ılgaz\'[0].upper()</code> → <code>\'I\'</code> doğru görünür; ama <code>\'inşaat\'[0].upper()</code> → <code>\'I\'</code> yanlış (olması gereken İ). Bir de <code>title()</code> ile her kelimeyi büyütüp baş harf almak aynı hatayı taşır.</p>',
    hints=['Bağlaç kontrolünü Türkçe küçültülmüş kelimeyle yap.', 'İlk harfi büyütmeden önce i → İ, ı → I değiştir.']))

# ---------------------------------------------------------------- a-039
P.append(dict(
    id='a-039', title='Blog başlığından URL kısaltması', track=T, diff='Orta',
    tags=['slug', 'Türkçe karakter', 'translate'], src='Slugify (web geliştirme klasiği), HackerRank String Split and Join esinli',
    mode='stdin',
    statement='<p>Kanat Havayolları blog yazılarının adresi başlıktan otomatik üretiliyor (slug). Kurallar:</p>'
              '<ol><li>Başlığı Türkçe kurala göre küçült (<code>I→ı</code>, <code>İ→i</code>).</li>'
              '<li>Türkçe harfleri ASCII karşılığına çevir: ç→c, ğ→g, ı→i, ö→o, ş→s, ü→u.</li>'
              '<li><code>a–z</code> ve <code>0–9</code> dışındaki her karakter ayraç sayılır; ardışık ayraçlar tek bir <code>-</code> olur.</li>'
              '<li>Baştaki ve sondaki <code>-</code> silinir.</li></ol>',
    input='<p>İlk satırda <code>N</code>, sonraki <code>N</code> satırda başlık.</p>',
    output='<p>Her başlık için slug. Başlıkta en az bir harf ya da rakam olduğu garanti.</p>',
    constraints='1 ≤ N ≤ 10^4, başlık ≤ 200 karakter',
    samples=[dict(in_='2\nİzmir\'e Uçuşlar %20 İNDİRİMLİ!\n  Iğdır -- Şırnak: Yeni Hat  \n', why="İ→i, ' ve % ayraç. IĞDIR → ığdır → igdir.")],
    hidden=['1\na\n', '1\n---a---\n', '1\nÇĞIİÖŞÜ çğıiöşü\n', '1\n2024 Yaz Kampanyası\n', '1\nCafé & Bar\n', '1\nA_B.C/D\n',
            dict(gen="import random\nrandom.seed(39)\nh='abcçdefgğhıijklmnoöprsştuüvyzABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ0123  -!.,\\'%&é'\nn=10000\nprint(n)\nfor _ in range(n):\n    print('x' + ''.join(random.choice(h) for _ in range(random.randint(1, 200))))")],
    start="n = int(input())\nfor _ in range(n):\n    baslik = input()\n    # küçült, ASCII\'ye çevir, ayraçları tek - yap\n",
    sol=c(r'''
        import sys
        CEVIR = str.maketrans('çğıöşü', 'cgiosu')
        IZINLI = set('abcdefghijklmnopqrstuvwxyz0123456789')

        def slug(baslik):
            s = baslik.replace('I', 'ı').replace('İ', 'i').lower().translate(CEVIR)
            parcalar = []
            onceki_ayrac = False
            for ch in s:
                if ch in IZINLI:
                    parcalar.append(ch)
                    onceki_ayrac = False
                elif not onceki_ayrac:
                    parcalar.append('-')
                    onceki_ayrac = True
            return ''.join(parcalar).strip('-')

        satirlar = sys.stdin.read().split('\n')
        n = int(satirlar[0])
        print('\n'.join(slug(b) for b in satirlar[1:1 + n]))
        '''),
    editorial='<p><b>Fikir:</b> Dört adımı sırayla uygula. <code>str.maketrans(\'çğıöşü\', \'cgiosu\')</code> karakter karakter çeviri tablosu kurar; <code>translate</code> bunu tek geçişte uygular (çoklu <code>replace</code>\'den hızlı ve okunaklı).</p>'
              '<p><b>Ayraç birleştirme:</b> "Önceki karakter ayraç mıydı?" bayrağı tut; izinsiz karakter geldiğinde yalnız bayrak kapalıysa <code>-</code> ekle. Regex ile tek satır: <code>re.sub(\'[^a-z0-9]+\', \'-\', s).strip(\'-\')</code>; <code>+</code> ardışık ayraçları tek eşleşme yapar.</p>'
              '<p><b>Neden Türkçe küçültme önce?</b> <code>\'İ\'.lower()</code> = <code>\'i\' + \'\\u0307\'</code> (birleşik nokta). Bu nokta izinsiz karakter sayılır ve <code>izmir</code> yerine <code>i-zmir</code> üretir. Python\'un <code>isalnum()</code>\'u ise <code>é</code>\'yi harf sayar; bu yüzden izinli kümeyi açıkça yazdık.</p>'
              '<p><b>Gerçekte:</b> Django\'nun <code>slugify</code>\'ı ya da <code>python-slugify</code> paketi kullanılır, ama Türkçe <code>ı</code> ve <code>İ</code> için çoğu zaman ek ayar gerekir.</p>',
    hints=["str.maketrans('çğıöşü', 'cgiosu') ile çeviri tablosu kur.", 'Ardışık ayraçları tek - yapmak için önceki karakterin ayraç olup olmadığını tut ya da re.sub(\'[^a-z0-9]+\', ...) kullan.']))

# ---------------------------------------------------------------- a-040
P.append(dict(
    id='a-040', title='Raf etiketinde sayı tabanları', track=T, diff='Orta',
    tags=['format', 'bin/oct/hex', 'hizalama'], src='HackerRank Python: String Formatting benzeri',
    mode='stdin',
    statement='<p>Anadolu Market\'in otomatik depo robotları raf numaralarını farklı tabanlarda okuyor. 1\'den <code>N</code>\'ye kadar her numara için tek satırda dört değer yaz: onluk, sekizlik, onaltılık (<b>büyük harf</b>) ve ikilik.</p>'
              '<p>Her değer, <code>N</code>\'nin <b>ikilik</b> gösterimi uzunluğu kadar genişlikte sağa yaslanır ve değerler arasında birer boşluk bulunur. Önek (<code>0b</code>, <code>0x</code>) yazılmaz.</p>',
    input='<p>Tek satırda <code>N</code>.</p>',
    output='<p><code>N</code> satır.</p>',
    constraints='1 ≤ N ≤ 5·10^4',
    samples=[dict(in_='5\n', why='5 = 101 (3 basamak) → genişlik 3.'), dict(in_='17\n', why='17 = 10001 → genişlik 5; 10 → oct 12, hex A, bin 1010.')],
    hidden=['1\n', '2\n', '8\n', '16\n', '255\n', '1024\n', dict(gen='print(50000)')],
    start="n = int(input())\ngenislik = len(bin(n)) - 2\n# her i için dört taban\n",
    sol=c(r'''
        n = int(input())
        g = len(f'{n:b}')
        satirlar = [f'{i:>{g}d} {i:>{g}o} {i:>{g}X} {i:>{g}b}' for i in range(1, n + 1)]
        print('\n'.join(satirlar))
        '''),
    editorial='<p><b>Fikir:</b> Biçim belirteçleri tabanı doğrudan verir: <code>d</code> onluk, <code>o</code> sekizlik, <code>X</code> büyük harfli onaltılık, <code>b</code> ikilik. Genişliği iç içe süslü parantezle dinamik verebilirsin: <code>f\'{i:&gt;{g}b}\'</code>.</p>'
              '<p><b>Genişlik:</b> <code>len(f\'{n:b}\')</code> ya da <code>n.bit_length()</code>. <code>len(bin(n))</code> kullanırsan <code>0b</code> önekinin 2 karakterini çıkarmayı unutma.</p>'
              '<p><b>Alternatifler:</b> <code>str(i).rjust(g)</code>, <code>oct(i)[2:]</code>, <code>hex(i)[2:].upper()</code>, <code>bin(i)[2:]</code>; çalışır ama daha dağınık. <code>format(i, \'X\')</code> da aynı mini-dili kullanır.</p>'
              '<p><b>Sık hata:</b> <code>x</code> (küçük harf) kullanmak; genişliği her satırın kendi ikilik uzunluğundan almak (hizalama bozulur).</p>',
    hints=["f'{i:o}', f'{i:X}', f'{i:b}' tabanları verir.", "Genişlik değişken olabilir: f'{i:>{g}}'; g = n.bit_length()."]))

# ---------------------------------------------------------------- a-041
P.append(dict(
    id='a-041', title='Stok kodu sıkıştırma', track=T, diff='Orta',
    tags=['run-length', 'groupby', 'metin kurma'], src='HackerRank Python: Compress the String / RLE benzeri',
    mode='func', fn='sikistir',
    statement='<p>Anadolu Market depo sensörleri raf durumunu harf dizisi olarak gönderiyor (ör. <code>DDDBBK</code>: dolu, dolu, dolu, boş, boş, kritik). Ağ trafiğini azaltmak için ardışık tekrarlar sıkıştırılacak: her grup <b>harf</b> ve, grup 1\'den uzunsa, ardından <b>tekrar sayısı</b>.</p>'
              '<p><code>sikistir(metin)</code> sıkıştırılmış metni döndürsün. Büyük/küçük harf farklı karakterdir.</p>',
    input='<p>str (yalnız harfler)</p>',
    output='<p>str</p>',
    constraints='0 ≤ uzunluk ≤ 2·10^5',
    samples=[dict(call="sikistir('DDDBBK')", why='DDD → D3, BB → B2, K → K.'),
             dict(call="sikistir('aAaa')", why='Büyük/küçük ayrı: a, A, a2.'),
             dict(call="sikistir('ççççççççççç')", why='11 tekrar → ç11.')],
    start='def sikistir(metin):\n    # ardışık grupları say\n    return metin\n',
    sol=c(r'''
        def sikistir(metin):
            parcalar = []
            i = 0
            n = len(metin)
            while i < n:
                j = i
                while j < n and metin[j] == metin[i]:
                    j += 1
                adet = j - i
                parcalar.append(metin[i] + (str(adet) if adet > 1 else ''))
                i = j
            return ''.join(parcalar)
        '''),
    tests=c(r'''
        assert sikistir('DDDBBK') == 'D3B2K'
        assert sikistir('') == ''
        assert sikistir('a') == 'a'
        assert sikistir('abc') == 'abc'
        assert sikistir('aAaa') == 'aAa2'
        assert sikistir('ççççççççççç') == 'ç11'
        assert sikistir('aabbaa') == 'a2b2a2'
        assert sikistir('x' * 10**5) == 'x100000'
        import random
        random.seed(41)
        s = ''.join(random.choice('ab') for _ in range(2 * 10**5))
        r = sikistir(s)
        assert r.startswith(s[0]) and sum(int(p) if p else 1 for p in __import__('re').findall('[ab](\\d*)', r)) == 2 * 10**5
        '''),
    editorial='<p><b>Fikir:</b> Grup başlangıcı <code>i</code>; <code>j</code>\'yi aynı karakter sürdükçe ilerlet. <code>j − i</code> grup uzunluğu. Parçaları listede topla, sonunda <code>join</code>. Her karakter bir kez: O(n).</p>'
              '<p><b>Pythonik sürüm:</b> <code>itertools.groupby(metin)</code> ardışık eşit elemanları gruplar: <code>\'\'.join(k + (str(n) if (n := len(list(g))) &gt; 1 else \'\') for k, g in groupby(metin))</code>. Dikkat: <code>groupby</code> yalnız <b>ardışık</b> eşitleri gruplar; <code>aabbaa</code> üç grup verir. Tüm eşitleri saymak istersen <code>Counter</code> kullanılır, ama o sıkıştırma olmaz.</p>'
              '<p><b>Ters işlem:</b> Rakamlar sayıyı, harfler karakteri gösterdiği için çözme mümkündür; girdide rakam olsaydı belirsizlik çıkardı (bu yüzden girdi yalnız harf).</p>'
              '<p><b>Sık hata:</b> Son grubu eklemeyi unutmak (döngü bittikten sonra bekleyen grup) ve 1 uzunluklu grupta "a1" yazmak.</p>',
    hints=['Grubun başını i, sonunu j ile izle; j - i grup uzunluğu.', 'itertools.groupby ardışık eşit karakterleri gruplar.']))

# ---------------------------------------------------------------- a-042
P.append(dict(
    id='a-042', title='Türkçe alfabetik personel listesi', track=T, diff='Orta',
    tags=['sorted key', 'Türkçe alfabe', 'demet'], src='Yerel ayara göre sıralama (collation) problemi',
    mode='stdin',
    statement='<p>Pusula İK personel listesini <b>Türk alfabesine göre</b> sıralamak istiyor: <code>a b c ç d e f g ğ h ı i j k l m n o ö p r s ş t u ü v y z</code>.</p>'
              '<p>Python\'un varsayılan <code>sorted</code>\'ı Unicode kod sırasını kullanır: <code>Ç</code>, <code>Z</code>\'den sonra; <code>ı</code> ise en sona düşer. Büyük/küçük harf farkını yok say (Türkçe kurala göre), boşluğu tüm harflerden önce kabul et. Anahtarı eşit olan adlarda girdi sırası korunsun.</p>',
    input='<p>İlk satırda <code>N</code>, sonra <code>N</code> ad (yalnız Türkçe harfler ve boşluk).</p>',
    output='<p>Sıralanmış adlar.</p>',
    constraints='1 ≤ N ≤ 5·10^4, ad ≤ 40 karakter',
    samples=[dict(in_='6\nZeynep\nÇağrı\nıhlamur\nİlker\nCan\nIşık\n', why='Sıra: Can, Çağrı, ıhlamur, Işık (ı grubu; ıh &lt; ış), İlker, Zeynep.')],
    hidden=['1\nTek\n', '3\nali\nAli\nALİ\n', '4\nöz\noz\nÖzge\nozan\n', '3\nab c\nabc\nab\n', '4\nşeker\nsu\nŞule\ntuz\n', '5\nğ\ng\nh\nı\ni\n',
            dict(gen="import random\nrandom.seed(42)\nh='abcçdefgğhıijklmnoöprsştuüvyzABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ'\nn=50000\nprint(n)\nfor _ in range(n):\n    print(''.join(random.choice(h) for _ in range(random.randint(1, 8))))")],
    start="ALFABE = ' abcçdefgğhıijklmnoöprsştuüvyz'\nn = int(input())\nadlar = [input() for _ in range(n)]\n# her harfin ALFABE içindeki sırasını anahtar yap\n",
    sol=c(r'''
        import sys
        ALFABE = ' abcçdefgğhıijklmnoöprsştuüvyz'
        SIRA = {h: i for i, h in enumerate(ALFABE)}

        def anahtar(ad):
            kucuk = ad.replace('I', 'ı').replace('İ', 'i').lower()
            return [SIRA[ch] for ch in kucuk]

        satirlar = sys.stdin.read().split('\n')
        n = int(satirlar[0])
        adlar = satirlar[1:1 + n]
        print('\n'.join(sorted(adlar, key=anahtar)))
        '''),
    editorial='<p><b>Fikir:</b> Her harfe Türk alfabesindeki sırasını veren bir sözlük kur (<code>{h: i for i, h in enumerate(ALFABE)}</code>). Bir adın anahtarı, Türkçe küçültülmüş harflerinin sıra numaralarından oluşan liste olsun. Listeler sözlük sırasıyla (lexicographic) karşılaştırılır; kısa olan önek ise önce gelir (<code>ab &lt; ab c &lt; abc</code>).</p>'
              '<p><b>Kararlılık:</b> Python\'un sıralaması kararlıdır; aynı anahtara sahip <code>ali</code>, <code>Ali</code>, <code>ALİ</code> girdi sırasında kalır.</p>'
              '<p><b>Neden index() değil?</b> <code>ALFABE.index(ch)</code> her harf için metni baştan tarar (O(29)); sözlük O(1). Anahtar fonksiyonu her eleman için yalnız <b>bir kez</b> çağrılır, bu yüzden <code>key=</code> karşılaştırma fonksiyonundan çok daha verimlidir.</p>'
              '<p><b>Gerçekte:</b> <code>locale.strxfrm</code> + <code>tr_TR.UTF-8</code> yerel ayarı ya da PyICU kullanılır; ama sunucuda yerel ayar kurulu olmayabilir, bu yüzden açık tablo yöntemi taşınabilirdir.</p>',
    hints=['Alfabeyi bir sözlükle harf → sıra numarasına çevir.', 'key fonksiyonu Türkçe küçültülmüş adın sıra numaraları listesini döndürsün.']))

# ---------------------------------------------------------------- a-043
P.append(dict(
    id='a-043', title='Türkçe Sezar şifresi', track=T, diff='Orta',
    tags=['modülo', 'Türkçe alfabe', 'sözlük'], src='HackerRank Caesar Cipher benzeri (29 harfli alfabe)',
    mode='stdin',
    statement='<p>Kanat Havayolları\'nın eğitim simülasyonunda mesajlar basit bir Sezar şifresiyle gizleniyor: her harf 29 harfli Türk alfabesinde <code>K</code> adım kaydırılır, <code>z</code>\'den sonra <code>a</code>\'ya döner. Büyük harf büyük, küçük harf küçük kalır; harf olmayan karakterler (rakam, boşluk, noktalama, q/w/x) değişmez.</p>'
              '<p><code>K</code> negatif olabilir (çözme) ve 29\'dan büyük olabilir.</p>',
    input='<p>İlk satırda <code>K</code>, ikinci satırda mesaj.</p>',
    output='<p>Şifrelenmiş mesaj.</p>',
    constraints='|K| ≤ 10^9, 1 ≤ uzunluk ≤ 2·10^5',
    samples=[dict(in_='1\nÇay saat 15:00 Zİ\n', why='Ç → D, a → b, y → z, s → ş, t → u; Z → A, İ → J (alfabede İ\'den sonra J).'), dict(in_='-1\nDbz\n', why='Geri kaydırma: D → Ç, b → a, z → y.')],
    hidden=['0\nabc\n', '29\nxyz Ğ\n', '1\nz\n', '-30\na\n', '1000000000\nIıİi\n', '3\nqwx QWX 123\n',
            dict(gen="import random\nrandom.seed(43)\nprint(random.randint(-10**9, 10**9))\nh='abcçdefgğhıijklmnoöprsştuüvyzABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ .,0q'\nprint(''.join(random.choice(h) for _ in range(2 * 10**5)))")],
    start="KUCUK = 'abcçdefgğhıijklmnoöprsştuüvyz'\nBUYUK = 'ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ'\nk = int(input())\nmesaj = input()\n# her harfi k adım kaydır\n",
    sol=c(r'''
        KUCUK = 'abcçdefgğhıijklmnoöprsştuüvyz'
        BUYUK = 'ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ'
        k = int(input()) % 29
        tablo = {}
        for alfabe in (KUCUK, BUYUK):
            for i, h in enumerate(alfabe):
                tablo[h] = alfabe[(i + k) % 29]
        mesaj = input()
        print(''.join(tablo.get(ch, ch) for ch in mesaj))
        '''),
    editorial='<p><b>Fikir:</b> İngilizce Sezar\'da <code>ord</code>/<code>chr</code> ile aritmetik yapılır; Türkçe harflerin Unicode kodları ardışık olmadığı için (ç = 231, ğ = 287, ı = 305) bu çalışmaz. Bunun yerine alfabeyi metin olarak yaz ve <b>indeks</b> üzerinden kaydır.</p>'
              '<p><b>Hız:</b> Kaydırma sabit olduğu için 58 harfin hepsinin karşılığını <b>bir kez</b> hesaplayıp sözlüğe koy; sonra her karakter O(1). <code>str.maketrans(KUCUK + BUYUK, kaydirilmis)</code> + <code>translate</code> daha da hızlıdır.</p>'
              '<p><b>Negatif modülo:</b> Python\'da <code>-1 % 29 == 28</code>; yani negatif kaydırma doğal olarak doğru çalışır (C/Java\'da <code>%</code> negatif sonuç verebilir).</p>'
              '<p><b>Sık hata:</b> <code>KUCUK.index(ch)</code>\'ı her karakterde çağırmak (O(29) tarama) ya da <code>q, w, x</code> gibi alfabede olmayan harflerde <code>ValueError</code> almak.</p>',
    hints=['Harfleri ord/chr ile değil, alfabe metnindeki indeksiyle kaydır.', 'Python\'da negatif sayının % 29 sonucu zaten 0..28 aralığındadır.']))

# ---------------------------------------------------------------- a-044
P.append(dict(
    id='a-044', title='Ünlü-ünsüz kelime düellosu', track=T, diff='Orta',
    tags=['alt dizgi sayımı', 'matematik', 'O(n)'], src='HackerRank Python: The Minion Game benzeri',
    mode='stdin',
    statement='<p>Anadolu Market\'in çocuk kulübü etkinliğinde iki takım bir kelimeyle yarışıyor. Kelimenin <b>tüm</b> (boş olmayan, ardışık) alt dizgileri yazılıyor; aynı alt dizgi farklı konumlarda geçiyorsa her geçiş ayrı sayılır.</p>'
              '<p><b>Ünlü</b> takımı ünlüyle (a e ı i o ö u ü) başlayan, <b>Ünsüz</b> takımı ünsüzle başlayan her alt dizgi için 1 puan alır. Kazananı ve puanını yaz; eşitse <code>Berabere</code> ve puan.</p>',
    input='<p>Tek satırda küçük harfli Türkçe kelime.</p>',
    output='<p><code>Ünlü P</code>, <code>Ünsüz P</code> ya da <code>Berabere P</code>.</p>',
    constraints='1 ≤ uzunluk ≤ 3·10^5',
    samples=[dict(in_='elma\n', why='e ile başlayanlar: e, el, elm, elma (4); a: 1 → Ünlü 5. l: 3, m: 2 → Ünsüz 5. Berabere 5.'), dict(in_='kitap\n', why='Ünsüz: k(5) + t(3) + p(1) = 9; Ünlü: i(4) + a(2) = 6.')],
    hidden=['a\n', 'b\n', 'ab\n', 'ba\n', 'ıı\n', 'çğş\n', dict(gen="print('a' * 3 * 10**5)"),
            dict(gen="import random\nrandom.seed(44)\nprint(''.join(random.choice('abcçdefgğhıijklmnoöprsştuüvyz') for _ in range(2 * 10**5)))")],
    start="kelime = input().strip()\n# her konumdan başlayan kaç alt dizgi var?\n",
    sol=c(r'''
        kelime = input().strip()
        UNLU = set('aeıioöuü')
        n = len(kelime)
        unlu = unsuz = 0
        for i, ch in enumerate(kelime):
            if ch in UNLU:
                unlu += n - i
            else:
                unsuz += n - i
        if unlu > unsuz:
            print('Ünlü', unlu)
        elif unsuz > unlu:
            print('Ünsüz', unsuz)
        else:
            print('Berabere', unlu)
        '''),
    editorial='<p><b>Anahtar gözlem:</b> <code>i</code> konumunda başlayan alt dizgi sayısı tam <code>n − i</code>\'dir (uzunluğu 1, 2, …, n−i olanlar). Hangi takımın puan alacağını yalnız ilk harf belirlediği için, her konumun katkısını doğrudan ekleyebilirsin. O(n).</p>'
              '<p><b>Neden saf yöntem olmaz?</b> Tüm alt dizgileri üretmek O(n²) adet ve toplam O(n³) karakter demektir; n = 3·10^5 için imkânsız. "Tek tek üretme, say" mülakatların en sevdiği fikirlerdendir.</p>'
              '<p><b>Not:</b> Toplam puan <code>n(n+1)/2</code>; 3·10^5 için ~4,5·10^10. Python tam sayıları taşmaz, ama C/Java\'da <code>long</code> gerekirdi.</p>'
              '<p><b>Sık hata:</b> Ünlü kümesine <code>ı</code> ve <code>ö</code>/<code>ü</code>\'yü eklemeyi unutmak; ya da farklı alt dizgileri bir kümede toplayıp tekrarları kaybetmek (her geçiş ayrı sayılmalı).</p>',
    hints=['i konumundan başlayan alt dizgi sayısı n - i.', 'Alt dizgileri üretme; her konumun katkısını doğrudan topla.']))

# ---------------------------------------------------------------- a-045
P.append(dict(
    id='a-045', title='Dağınık tutar sütununu topla', track=T, diff='Orta',
    tags=['ayrıştırma', 'Türkçe sayı biçimi', 'kuruş'], src='Veri temizleme: yerel sayı biçimi (kirli veri) problemi',
    mode='stdin',
    statement='<p>Anadolu Bank\'a bayilerden gelen Excel dökümünde tutarlar Türkçe biçimde ve dağınık: binlik ayracı nokta, ondalık ayracı virgül (<code>1.234,5</code>); başta/sonda boşluk ve isteğe bağlı <code>TL</code> eki olabilir; eksi işaretli değerler (iade) de var. Ondalık kısım en fazla 2 basamak.</p>'
              '<p>Tüm tutarları <b>kuruş hassasiyetiyle</b> topla ve sonucu aynı Türkçe biçimde yaz: binlik ayracı nokta, tam iki ondalık basamak, negatifse başta <code>-</code>.</p>',
    input='<p>İlk satırda <code>N</code>, sonraki <code>N</code> satırda birer tutar.</p>',
    output='<p>Toplam, ör. <code>1.234.567,80</code>.</p>',
    constraints='1 ≤ N ≤ 2·10^5, |tutar| ≤ 10^12',
    samples=[dict(in_='4\n1.234,5\n  250 TL\n-34,05\n1.000.000\n', why='123450 + 25000 − 3405 + 100000000 kuruş = 100145045 kuruş → 1.001.450,45.')],
    hidden=['1\n0\n', '1\n-0,01\n', '2\n0,1\n0,01\n', '1\n999\n', '2\n1.000\n-1.000,00 TL\n', '3\n-5\n2,5\n1,49\n', '1\n1.000.000.000.000,99\n',
            dict(gen="import random\nrandom.seed(45)\nn=200000\nprint(n)\nfor _ in range(n):\n    t=random.randint(-10**10, 10**12)\n    s=f'{abs(t)//100:,}'.replace(',', '.') + ',' + f'{abs(t)%100:02d}'\n    print((' ' if random.random()<0.3 else '') + ('-' if t<0 else '') + s + (' TL' if random.random()<0.3 else ''))")],
    start="n = int(input())\ntoplam_kurus = 0\nfor _ in range(n):\n    ham = input()\n    # temizle ve kuruşa çevir\n",
    sol=c(r'''
        import sys

        def kurusa(ham):
            s = ham.strip()
            if s.endswith('TL'):
                s = s[:-2].strip()
            isaret = 1
            if s.startswith('-'):
                isaret = -1
                s = s[1:]
            s = s.replace('.', '')
            if ',' in s:
                tam, ondalik = s.split(',')
            else:
                tam, ondalik = s, ''
            ondalik = (ondalik + '00')[:2]
            return isaret * (int(tam) * 100 + int(ondalik))

        def tr_bicim(kurus):
            isaret = '-' if kurus < 0 else ''
            tam, kr = divmod(abs(kurus), 100)
            return isaret + f'{tam:,}'.replace(',', '.') + f',{kr:02d}'

        satirlar = sys.stdin.read().split('\n')
        n = int(satirlar[0])
        print(tr_bicim(sum(kurusa(s) for s in satirlar[1:1 + n])))
        '''),
    editorial='<p><b>Ayrıştırma adımları:</b> (1) <code>strip</code> + <code>TL</code> ekini at, (2) işareti ayır, (3) binlik noktalarını sil, (4) virgülden böl, (5) ondalığı 2 basamağa tamamla (<code>\'5\'</code> → 50 kuruş, yani <code>(ondalik + \'00\')[:2]</code>), (6) <code>tam*100 + ondalik</code>.</p>'
              '<p><b>Neden kuruş (tam sayı)?</b> <code>float(\'1234.5\')</code> toplamlarında 2·10^5 değer sonra kuruş kayabilir: <code>0.1 + 0.2 != 0.3</code>. Para için tam sayı kuruş ya da <code>decimal.Decimal</code> kullan.</p>'
              '<p><b>Biçimleme:</b> <code>f\'{x:,}\'</code> İngilizce binlik ayracı (virgül) koyar; <code>replace(\',\', \'.\')</code> ile Türkçeye çevir. Negatiflerde önce <code>abs</code> al, işareti sonra ekle; yoksa <code>divmod(-345, 100)</code> = <code>(-4, 55)</code> gibi şaşırtıcı sonuç verir.</p>'
              '<p><b>Gerçek işte:</b> pandas\'ta <code>pd.read_csv(..., thousands=\'.\', decimal=\',\')</code> bu temizliği okuma anında yapar.</p>',
    hints=['Noktaları sil, virgülden böl; ondalığı iki basamağa tamamla.', 'Toplamı kuruşta tut; yazarken divmod(abs(t), 100) ve f\'{x:,}\'.replace(\',\', \'.\').']))

# ---------------------------------------------------------------- a-046
P.append(dict(
    id='a-046', title='IBAN doğrulama', track=T, diff='Orta',
    tags=['mod 97', 'metin temizleme', 'doğrulama'], src='ISO 13616 IBAN kontrol algoritması',
    mode='func', fn='gecerli_iban_mi',
    statement='<p>Anadolu Bank havale formunda girilen Türk IBAN\'larını göndermeden önce doğruluyor. <code>gecerli_iban_mi(iban)</code> şu kurallara göre True/False döndürsün:</p>'
              '<ol><li>Boşlukları sil, harfleri büyüt.</li><li>Uzunluk tam <b>26</b> ve <code>TR</code> ile başlamalı; geri kalan 24 karakter rakam olmalı.</li>'
              '<li>İlk 4 karakteri sona taşı; harfleri sayıya çevir (A=10, B=11, …, Z=35; yani T=29, R=27).</li><li>Ortaya çıkan büyük sayının 97\'ye bölümünden kalan <b>1</b> olmalı.</li></ol>',
    input='<p>str</p>',
    output='<p>bool</p>',
    constraints='0 ≤ uzunluk ≤ 64',
    samples=[dict(call="gecerli_iban_mi('TR33 0006 1005 1978 6457 8413 26')", why='Boşluklar silinince 26 karakter; mod 97 = 1.'),
             dict(call="gecerli_iban_mi('TR34 0006 1005 1978 6457 8413 26')", why='Kontrol basamağı bir artırılınca kalan 1 olmaz.')],
    start='def gecerli_iban_mi(iban):\n    # temizle, biçimi denetle, mod 97\n    return True\n',
    sol=c(r'''
        def gecerli_iban_mi(iban):
            s = iban.replace(' ', '').upper()
            if len(s) != 26 or not s.startswith('TR') or not s[2:].isdigit():
                return False
            duzen = s[4:] + s[:4]
            sayi = ''.join(str(int(ch, 36)) for ch in duzen)
            return int(sayi) % 97 == 1
        '''),
    tests=c(r'''
        assert gecerli_iban_mi('TR33 0006 1005 1978 6457 8413 26') is True
        assert gecerli_iban_mi('TR330006100519786457841326') is True
        assert gecerli_iban_mi('tr33 0006 1005 1978 6457 8413 26') is True
        assert gecerli_iban_mi('TR34 0006 1005 1978 6457 8413 26') is False
        assert gecerli_iban_mi('TR33 0006 1005 1978 6457 8413 2') is False
        assert gecerli_iban_mi('') is False
        assert gecerli_iban_mi('DE89 3704 0044 0532 0130 00') is False
        assert gecerli_iban_mi('TR33 0006 1005 1978 6457 8413 2A') is False
        import random
        random.seed(46)
        def uret():
            bban = ''.join(random.choice('0123456789') for _ in range(22))
            kd = 98 - int(bban + '292700') % 97
            return 'TR' + f'{kd:02d}' + bban
        ibanlar = [uret() for _ in range(20000)]
        assert all(gecerli_iban_mi(x) for x in ibanlar)
        assert sum(gecerli_iban_mi(x[:10] + str((int(x[10]) + 1) % 10) + x[11:]) for x in ibanlar) == 0
        '''),
    editorial='<p><b>Fikir:</b> Önce biçim (uzunluk, ülke kodu, rakamlar), sonra matematik. Kontrol basamaklarını sona taşımak, ülke kodu harflerini 10–35 aralığında sayılara çevirmek ve mod 97 almak ISO standardıdır. Python tam sayıları sınırsız olduğu için 30 basamaklı sayıyı doğrudan <code>int</code> yapabilirsin.</p>'
              '<p><b>Harf → sayı kısayolu:</b> <code>int(\'T\', 36)</code> = 29: 36 tabanında A=10 … Z=35, standarttaki tablonun ta kendisi. Rakamlar da kendisini verir.</p>'
              '<p><b>Neden işe yarar?</b> Mod 97 kontrolü tek basamak hatalarını ve komşu iki basamağın yer değiştirmesini her zaman yakalar; son test her IBAN\'da bir basamağı değiştirip hepsinin reddedildiğini denetler.</p>'
              '<p><b>Büyük sayı olmayan dillerde:</b> Sayıyı parça parça işle: <code>kalan = (kalan * 10 + rakam) % 97</code>. Mülakatta bu sürümü de anlatabilmek artıdır.</p>'
              '<p><b>Sık hata:</b> Boşlukları silmeden uzunluk kontrolü; küçük harfli <code>tr</code>\'yi reddetmek; harfleri <code>ord(ch) - 55</code> yerine <code>ord(ch)</code> ile çevirmek.</p>',
    hints=["Boşlukları sil ve upper() uygula; sonra uzunluk, 'TR' ve isdigit kontrolü.", 'İlk 4 karakteri sona taşı; int(ch, 36) harfi standarttaki sayıya çevirir.']))

# ---------------------------------------------------------------- a-047
P.append(dict(
    id='a-047', title='Tekrarsız en uzun şifre parçası', track=T, diff='Zor',
    tags=['kayan pencere', 'sözlük', 'iki işaretçi'], src='Longest Substring Without Repeating Characters (LeetCode 3) benzeri',
    mode='stdin',
    statement='<p>Anadolu Bank güvenlik ekibi, kullanıcıların oluşturduğu uzun anahtar dizilerinde <b>hiçbir karakteri tekrar etmeyen</b> en uzun ardışık parçayı arıyor.</p>'
              '<p>Bu parçanın uzunluğunu ve kendisini yazdır. Aynı uzunlukta birden çok parça varsa <b>en solda</b> başlayanı seç. Büyük/küçük harf farklı karakterdir.</p>',
    input='<p>Tek satır metin (boşluk içermez).</p>',
    output='<p>İki satır: uzunluk ve parça.</p>',
    constraints='1 ≤ uzunluk ≤ 2·10^5',
    samples=[dict(in_='abcabcbb\n', why='abc (0. konumda) — bca, cab da 3 uzunlukta ama daha sağda.'), dict(in_='pwwkew\n', why='wke.')],
    hidden=['a\n', 'aaaa\n', 'abcdef\n', 'abba\n', 'dvdf\n', 'ğüşiöçĞÜŞİÖÇığ\n', 'tmmzuxt\n',
            dict(gen="import random\nrandom.seed(47)\nprint(''.join(random.choice('abcdefghijklmnopqrstuvwxyzABCDEFGHIJ0123456789') for _ in range(200000)))"),
            dict(gen="print(''.join(chr(0x4e00 + i) for i in range(20000)) * 10)")],
    start="s = input().strip()\n# pencere: son görülme konumlarını sözlükte tut\n",
    sol=c(r'''
        s = input().strip()
        son = {}
        sol = 0
        en_iyi = 0
        bas = 0
        for i, ch in enumerate(s):
            if ch in son and son[ch] >= sol:
                sol = son[ch] + 1
            son[ch] = i
            if i - sol + 1 > en_iyi:
                en_iyi = i - sol + 1
                bas = sol
        print(en_iyi)
        print(s[bas:bas + en_iyi])
        '''),
    editorial='<p><b>Fikir (kayan pencere):</b> <code>[sol, i]</code> penceresi her zaman tekrarsızdır. Her karakterin <b>son görüldüğü konumu</b> sözlükte tut. Yeni karakter pencerenin içinde (<code>son[ch] &gt;= sol</code>) daha önce görülmüşse, <code>sol</code>\'u o konumun bir sağına atla. Her adımda pencere uzunluğunu en iyiyle karşılaştır. O(n).</p>'
              '<p><b>Kritik koşul:</b> <code>son[ch] &gt;= sol</code> kontrolü olmadan <code>sol</code> geriye gidebilir: <code>abba</code>\'da ikinci <code>a</code> geldiğinde <code>son[\'a\'] = 0</code> ama pencere zaten 2\'den başlıyor. Bu testlerde var.</p>'
              '<p><b>En solda kuralı:</b> Yalnız <b>kesin büyük</b> pencere bulunca güncelle; eşit uzunluktakiler daha sağdadır.</p>'
              '<p><b>Neden kaba kuvvet değil?</b> Her başlangıçtan kümeyle ilerlemek O(n·k); 2·10^4 farklı karakterli son test (k büyük) bunu çok yavaşlatır.</p>',
    hints=['Her karakterin son görüldüğü indeksi bir sözlükte tut.', 'Tekrar pencere içindeyse sol = son[ch] + 1; pencere dışındaysa sol değişmez.']))

# ---------------------------------------------------------------- a-048
P.append(dict(
    id='a-048', title='Bülten metnini iki yana yasla', track=T, diff='Zor',
    tags=['açgözlü', 'metin hizalama', 'divmod'], src='Text Justification (LeetCode 68) benzeri',
    mode='stdin',
    statement='<p>Pusula İK\'nın aylık bülteni sabit genişlikli bir ekranda gösteriliyor ve metin <b>iki yana yaslı</b> olmalı. Kurallar:</p>'
              '<ol><li>Kelimeleri sırayla, her satıra (aralarında en az birer boşlukla) <code>W</code>\'yi aşmayacak kadar çok yerleştir (açgözlü).</li>'
              '<li>Son satır hariç her satır tam <code>W</code> karakter olacak şekilde kelime aralarına boşluk dağıtılır; eşit dağılmıyorsa <b>soldaki</b> aralıklar birer fazla alır.</li>'
              '<li>Tek kelimeli satır ve <b>son satır</b> sola yaslıdır: kelimeler arasında tek boşluk.</li></ol>'
              '<p>(Satır sonlarındaki boşluklar denetimde yok sayılır.)</p>',
    input='<p>İlk satırda <code>W</code>, sonraki satırlarda metin (kelimeler boşluk ve satır sonlarıyla ayrılmış).</p>',
    output='<p>Hizalanmış satırlar.</p>',
    constraints='1 ≤ W ≤ 100, her kelime ≤ W karakter, toplam kelime ≤ 10^5',
    samples=[dict(in_='16\nBu ay yeni yan haklar ve esnek çalışma modeli devreye alındı.\n', why='İlk satır "Bu ay yeni yan" (11 harf): kalan 16−11 = 5 boşluk 3 aralığa 2-2-1 dağılır.')],
    hidden=['7\nmerhaba\n', '10\nbir\n', '7\na b c d e f g h\n', '13\nuzunkelimeler kısa\n', '20\nSon   satır   tek boşluklu kalmalı\n', '6\naaaaaa bbbbbb c\n',
            dict(gen="import random\nrandom.seed(48)\nprint(60)\nh='abcçdefgğhıijklmnoöprsştuüvyz'\nfor _ in range(5000):\n    print(' '.join(''.join(random.choice(h) for _ in range(random.randint(1, 15))) for _ in range(20)))")],
    start="import sys\nveri = sys.stdin.read().split()\nw = int(veri[0])\nkelimeler = veri[1:]\n# satırlara böl, sonra boşlukları dağıt\n",
    sol=c(r'''
        import sys
        veri = sys.stdin.read().split()
        w = int(veri[0])
        kelimeler = veri[1:]
        satirlar = []
        i = 0
        n = len(kelimeler)
        while i < n:
            j = i
            uzunluk = 0
            while j < n and uzunluk + len(kelimeler[j]) + (j - i) <= w:
                uzunluk += len(kelimeler[j])
                j += 1
            parca = kelimeler[i:j]
            if j == n or len(parca) == 1:
                satirlar.append(' '.join(parca))
            else:
                bosluk = w - uzunluk
                aralik = len(parca) - 1
                taban, fazla = divmod(bosluk, aralik)
                satir = ''
                for k, kel in enumerate(parca[:-1]):
                    satir += kel + ' ' * (taban + (1 if k < fazla else 0))
                satirlar.append(satir + parca[-1])
            i = j
        print('\n'.join(satirlar))
        '''),
    editorial='<p><b>İki aşama:</b> (1) <b>Satıra bölme:</b> <code>i</code>\'den başlayıp, "kelime uzunlukları toplamı + en az (kelime sayısı − 1) boşluk ≤ W" olduğu sürece kelime ekle. (2) <b>Boşluk dağıtma:</b> toplam boşluk <code>W − harf_toplamı</code>, aralık sayısı <code>kelime − 1</code>; <code>taban, fazla = divmod(bosluk, aralik)</code> ve ilk <code>fazla</code> aralık birer fazla alır.</p>'
              '<p><b>Özel durumlar:</b> Tek kelimeli satırda aralık yoktur (sıfıra bölme!), son satır ise tanım gereği sola yaslı. İkisini aynı dalda ele almak kodu sadeleştirir.</p>'
              '<p><b>Karmaşıklık:</b> Her kelime bir kez yerleştirilir: O(toplam karakter).</p>'
              '<p><b>Standart kütüphane:</b> <code>textwrap.wrap(metin, W)</code> 1. aşamayı yapar (iki yana yaslamaz). Mülakatta "önce satır kır, sonra dağıt" diye problemi parçalara ayırdığını göstermek en önemli kısımdır.</p>'
              '<p><b>Sık hata:</b> Satır sığma kontrolünde boşlukları saymamak; fazla boşlukları sağdaki aralıklara vermek.</p>',
    hints=['Önce kelimeleri satırlara böl: harf toplamı + (kelime sayısı - 1) ≤ W.', 'Boşluk dağıtımı için divmod(toplam_bosluk, aralik_sayisi); soldaki aralıklar fazlayı alır.']))

# ---------------------------------------------------------------- a-049
P.append(dict(
    id='a-049', title='Çek tutarını yazıya çevir', track=T, diff='Zor',
    tags=['özyineleme', 'üçlü gruplar', 'Türkçe'], src='Integer to English Words (LeetCode 273) Türkçe uyarlaması',
    mode='func', fn='sayi_yaziya',
    statement='<p>Anadolu Bank çek ve dekontlarda tutarı yazıyla da basıyor. <code>sayi_yaziya(n)</code> 0 ≤ n ≤ 999.999.999.999 aralığındaki tam sayıyı Türkçe yazıya çevirsin. Kurallar:</p>'
              '<ul><li>Kelimeler küçük harf ve aralarında <b>tek boşluk</b>.</li><li>0 → <code>sıfır</code>.</li>'
              '<li><b>yüz</b> ve <b>bin</b> önünde "bir" söylenmez: 100 → <code>yüz</code>, 1000 → <code>bin</code>, 1100 → <code>bin yüz</code>. Ama <code>bir milyon</code>, <code>bir milyar</code>.</li></ul>',
    input='<p>int</p>',
    output='<p>str</p>',
    constraints='0 ≤ n ≤ 999999999999',
    samples=[dict(call='sayi_yaziya(1250)', why='bin + iki yüz + elli.'),
             dict(call='sayi_yaziya(2001000)', why='iki milyon + bin.'),
             dict(call='sayi_yaziya(101)', why='yüz bir (bir yüz bir değil).')],
    start='def sayi_yaziya(n):\n    # üçlü gruplara ayır\n    return \'\'\n',
    sol=c(r'''
        BIRLER = ['', 'bir', 'iki', 'üç', 'dört', 'beş', 'altı', 'yedi', 'sekiz', 'dokuz']
        ONLAR = ['', 'on', 'yirmi', 'otuz', 'kırk', 'elli', 'altmış', 'yetmiş', 'seksen', 'doksan']
        OLCEK = ['', 'bin', 'milyon', 'milyar']

        def uclu(n):
            yuz, kalan = divmod(n, 100)
            on, bir = divmod(kalan, 10)
            kelimeler = []
            if yuz:
                if yuz > 1:
                    kelimeler.append(BIRLER[yuz])
                kelimeler.append('yüz')
            if on:
                kelimeler.append(ONLAR[on])
            if bir:
                kelimeler.append(BIRLER[bir])
            return kelimeler

        def sayi_yaziya(n):
            if n == 0:
                return 'sıfır'
            parcalar = []
            derece = 0
            while n:
                n, grup = divmod(n, 1000)
                if grup:
                    if derece == 1 and grup == 1:
                        kelimeler = ['bin']
                    else:
                        kelimeler = uclu(grup) + ([OLCEK[derece]] if derece else [])
                    parcalar = kelimeler + parcalar
                derece += 1
            return ' '.join(parcalar)
        '''),
    tests=c(r'''
        assert sayi_yaziya(0) == 'sıfır'
        assert sayi_yaziya(7) == 'yedi'
        assert sayi_yaziya(101) == 'yüz bir'
        assert sayi_yaziya(1250) == 'bin iki yüz elli'
        assert sayi_yaziya(1100) == 'bin yüz'
        assert sayi_yaziya(2001000) == 'iki milyon bin'
        assert sayi_yaziya(1000000) == 'bir milyon'
        assert sayi_yaziya(1000001000) == 'bir milyar bin'
        assert sayi_yaziya(999999999999) == 'dokuz yüz doksan dokuz milyar dokuz yüz doksan dokuz milyon dokuz yüz doksan dokuz bin dokuz yüz doksan dokuz'
        hepsi = [sayi_yaziya(i) for i in range(120000)]
        assert len(set(hepsi)) == 120000 and all('  ' not in y and y == y.strip() for y in hepsi) and not any(y.startswith('bir bin') or 'bir yüz' in y for y in hepsi)
        '''),
    editorial='<p><b>Fikir:</b> Sayıyı sağdan üçlü gruplara böl (<code>divmod(n, 1000)</code>): birler, bin, milyon, milyar. Her grubu 0–999 için yazan küçük bir fonksiyonla çevir ve ölçek kelimesini ekle. Sıfır olan grupları tamamen atla (<code>1.000.001</code> → "bir milyon bir").</p>'
              '<p><b>Türkçe istisnalar:</b> (1) Yüzler basamağında 1 ise yalnız "yüz". (2) Bin grubunun değeri tam 1 ise yalnız "bin"; ama 101.000 → "yüz bir bin" (burada "bir" söylenir!). Bu yüzden kontrol <code>grup == 1</code>, "son rakam 1" değil. (3) Milyon ve milyarda "bir" her zaman söylenir.</p>'
              '<p><b>Veri ile mantığı ayır:</b> Kelimeleri listelerde tut (<code>BIRLER[3]</code> = "üç"); kod yalnız indeks hesaplar. İngilizcede 11–19 özel kelimeler (eleven…) ek tablo isterdi; Türkçe düzenli yapısıyla daha kolaydır.</p>'
              '<p><b>Sık hata:</b> Boş gruplardan çift boşluk üretmek (çözüm: parçaları listede topla, en sonda <code>\' \'.join</code>); "bir bin" yazmak.</p>',
    hints=['divmod(n, 1000) ile üçlü gruplara ayır; her grubu 0-999 çeviren bir yardımcı yaz.', 'Bin grubunun değeri tam 1 ise yalnız "bin"; yüzler basamağı 1 ise yalnız "yüz".']))

# ---------------------------------------------------------------- a-050
P.append(dict(
    id='a-050', title='SMS şablon motoru', track=T, diff='Zor',
    tags=['ayrıştırma', 'durum makinesi', 'sözlük'], src='Şablon doldurma (string.Template / format mini motoru) problemi',
    mode='stdin',
    statement='<p>Lezzet Kurye müşterilere kişiselleştirilmiş SMS gönderiyor. Şablon dilinin kuralları:</p>'
              '<ul><li><code>{anahtar}</code> → kayıttaki değer. Anahtar kayıtta yoksa <code>?</code>.</li>'
              '<li><code>{anahtar|varsayılan}</code> → kayıtta varsa değer, yoksa <code>varsayılan</code> metni. (Kayıtta değer <b>boş</b> olsa bile vardır; boş yazılır.)</li>'
              '<li><code>{{</code> → <code>{</code>, <code>}}</code> → <code>}</code> (kaçış).</li></ul>'
              '<p>Her kayıt için doldurulmuş mesajı yazdır. Şablon geçerlidir: her <code>{</code> (kaçış değilse) bir <code>}</code> ile kapanır, içinde <code>{</code> ya da <code>}</code> yoktur.</p>',
    input='<p>İlk satırda şablon, ikinci satırda <code>N</code>, sonraki <code>N</code> satırda kayıt: <code>anahtar=değer</code> çiftleri <code>;</code> ile ayrılmış (değer <code>=</code> içerebilir, <code>;</code> içermez). Boş satır = boş kayıt.</p>',
    output='<p><code>N</code> satır.</p>',
    constraints='Şablon ≤ 500 karakter, 1 ≤ N ≤ 2·10^4, kayıt ≤ 200 karakter',
    samples=[dict(in_='Merhaba {ad|değerli müşterimiz}, {{kod}}: {kod} - {saat|yakında} teslim.\n3\nad=Ece;kod=LK-42;saat=19:30\nkod=X=1\nad=;kod=7\n',
                  why='2. kayıtta ad yok → varsayılan; değer "X=1" (ilk = ile bölünür). 3. kayıtta ad boş ama var → boş yazılır.')],
    hidden=['{a}\n1\n\n', 'sabit metin\n2\nx=1\n\n', '{{}}{{{a}}}\n1\na=b\n', '[{x|}][{y}]\n1\ny=\n', '{a}{a}{b|-}\n1\na=1\n', '{çok uzun anahtar|ok}\n1\nçok uzun anahtar=evet\n',
            dict(gen="import random\nrandom.seed(50)\nprint('Sn. {ad|müşteri}, {{' + 'x' * 30 + '}} siparişiniz {no} ' * 10 + '{ek}')\nn=20000\nprint(n)\nfor i in range(n):\n    p=[]\n    if random.random()<0.7: p.append('ad=K' + str(i))\n    if random.random()<0.9: p.append('no=' + str(random.randint(1, 10**9)))\n    if random.random()<0.2: p.append('ek=')\n    print(';'.join(p))")],
    start="sablon = input()\nn = int(input())\nfor _ in range(n):\n    kayit = input()\n    # kaydı sözlüğe çevir, şablonu doldur\n",
    sol=c(r'''
        import sys

        def derle(sablon):
            parcalar = []
            metin = []
            i = 0
            while i < len(sablon):
                ch = sablon[i]
                if ch == '{' and sablon[i + 1:i + 2] == '{':
                    metin.append('{'); i += 2
                elif ch == '}' and sablon[i + 1:i + 2] == '}':
                    metin.append('}'); i += 2
                elif ch == '{':
                    j = sablon.index('}', i)
                    if metin:
                        parcalar.append(('metin', ''.join(metin))); metin = []
                    ic = sablon[i + 1:j]
                    if '|' in ic:
                        anahtar, vars_ = ic.split('|', 1)
                    else:
                        anahtar, vars_ = ic, '?'
                    parcalar.append(('alan', anahtar, vars_))
                    i = j + 1
                else:
                    metin.append(ch); i += 1
            if metin:
                parcalar.append(('metin', ''.join(metin)))
            return parcalar

        def doldur(parcalar, kayit):
            cikti = []
            for p in parcalar:
                if p[0] == 'metin':
                    cikti.append(p[1])
                else:
                    cikti.append(kayit.get(p[1], p[2]))
            return ''.join(cikti)

        satirlar = sys.stdin.read().split('\n')
        parcalar = derle(satirlar[0])
        n = int(satirlar[1])
        sonuc = []
        for s in satirlar[2:2 + n]:
            kayit = {}
            for cift in s.split(';'):
                if cift:
                    k, v = cift.split('=', 1)
                    kayit[k] = v
            sonuc.append(doldur(parcalar, kayit))
        print('\n'.join(sonuc))
        '''),
    editorial='<p><b>Fikir — derle, sonra çalıştır:</b> Şablonu <b>bir kez</b> ayrıştırıp <code>(\'metin\', ...)</code> ve <code>(\'alan\', anahtar, varsayılan)</code> parçalarından oluşan bir listeye çevir. Her kayıtta yalnız bu listeyi gezip birleştirirsin. 2·10^4 kayıtta şablonu her seferinde yeniden ayrıştırmaktan çok daha hızlıdır; Jinja2 ve Django şablonları da böyle çalışır.</p>'
              '<p><b>Ayrıştırıcı:</b> Karakter karakter ilerleyen küçük bir durum makinesi. Önce iki karakterlik kaçışlara (<code>{{</code>, <code>}}</code>) bak, sonra tek <code>{</code>\'e. Alan içinde <code>split(\'|\', 1)</code> yalnız ilk dikey çizgiden böler.</p>'
              '<p><b>Varsayılan ile boş değer farkı:</b> <code>kayit.get(anahtar, varsayilan)</code> anahtar <b>yoksa</b> varsayılanı verir; anahtar var ama değer boşsa boş metni verir. <code>kayit.get(k) or varsayilan</code> yazmak bu farkı yok eder (yaygın hata).</p>'
              '<p><b>Kayıt ayrıştırma:</b> <code>split(\'=\', 1)</code>: değerde <code>=</code> olabilir. Python\'un <code>str.format_map</code>\'i benzer işi yapar ama <code>|varsayılan</code> sözdizimini desteklemez ve eksik anahtarda <code>KeyError</code> fırlatır.</p>',
    hints=['Şablonu bir kez metin ve alan parçalarına ayır; her kayıtta yalnız parçaları birleştir.', 'Önce {{ ve }} kaçışlarını kontrol et; alan içinde split(\'|\', 1) kullan.']))


if __name__ == '__main__':
    build(P, '/home/claude/py/v3/a1/arena_03.js')
