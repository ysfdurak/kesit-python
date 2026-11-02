from build import D

T = 'Algoritmalar'
P = []


def ints(r, n, lo, hi):
    return ' '.join(str(r.randint(lo, hi)) for _ in range(n))


# ---------------------------------------------------------------- a-121
P.append(dict(
    id='a-121', title='Kampanya pankartı simetrik mi?', track=T, diff='Kolay',
    tags=['iki işaretçi', 'metin'], src='LeetCode 125 Valid Palindrome benzeri',
    statement=D('''
        <p>Anadolu Market\'in tasarım ekibi, vitrin pankartlarında soldan ve sağdan aynı okunan sloganları kullanmak istiyor. Bir sloganın <b>simetrik</b> sayılması için yalnızca harfler ve rakamlar dikkate alınır; boşluk ve noktalama işaretleri yok sayılır, büyük/küçük harf farkı önemsizdir.</p>
        <p>Her slogan için simetrikse <code>EVET</code>, değilse <code>HAYIR</code> yaz. Harf ve rakam içermeyen (tamamen noktalama ya da boş) bir slogan simetrik kabul edilir.</p>'''),
    input='<p>İlk satırda slogan sayısı Q. Sonraki Q satırın her biri bir slogan (yalnız İngilizce harfler, rakamlar, boşluk ve noktalama içerir; satır boş olabilir).</p>',
    output='<p>Her slogan için ayrı satırda <code>EVET</code> ya da <code>HAYIR</code>.</p>',
    constraints='1 ≤ Q ≤ 10, her satırın uzunluğu ≤ 2·10^5',
    samples=[
        ('3\nA man, a plan, a canal: Panama\nrace a car\nNo lemon, no melon!\n',
         'İlk ve üçüncü slogan yalnız harfler bırakılıp küçültülünce tersiyle aynı; "raceacar" ise değil.'),
        ('2\n...!!\nAb1 1bA\n', 'İlk satırda hiç harf/rakam yok, simetrik sayılır. İkincisi "ab11ba" olur.')],
    hidden=[
        '1\na\n', '1\nab\n', '2\n0P\nWas it a car or a cat I saw?\n', '3\n   \nZ.z\n12321 x 12321\n',
        '1\nTaco cat; ATAC ocat\n',
        {'gen': D('''
            import random
            random.seed(121)
            h = ''.join(random.choice('abcXYZ019') for _ in range(90000))
            print(3)
            print(h + ' ,. ' + h[::-1].upper())
            print(h + 'q' + h[::-1])
            print(h + 'qw' + h[::-1])
            ''')}],
    start=D('''
        import sys
        satirlar = sys.stdin.read().split('\\n')
        q = int(satirlar[0])
        for k in range(1, q + 1):
            s = satirlar[k] if k < len(satirlar) else ''
            # iki işaretçiyle kontrol et
        '''),
    sol=D('''
        import sys
        satirlar = sys.stdin.read().split('\\n')
        q = int(satirlar[0])
        cevap = []
        for k in range(1, q + 1):
            s = satirlar[k] if k < len(satirlar) else ''
            i, j = 0, len(s) - 1
            ok = True
            while i < j:
                if not s[i].isalnum():
                    i += 1
                elif not s[j].isalnum():
                    j -= 1
                elif s[i].lower() != s[j].lower():
                    ok = False
                    break
                else:
                    i += 1
                    j -= 1
            cevap.append('EVET' if ok else 'HAYIR')
        print('\\n'.join(cevap))
        '''),
    brute=D('''
        import sys
        satirlar = sys.stdin.read().split('\\n')
        q = int(satirlar[0])
        for k in range(1, q + 1):
            s = satirlar[k] if k < len(satirlar) else ''
            t = ''.join(c.lower() for c in s if c.isalnum())
            print('EVET' if t == t[::-1] else 'HAYIR')
        '''),
    rnd=lambda r: '4\n' + '\n'.join(''.join(r.choice('aAb ,1') for _ in range(r.randint(0, 7))) for _ in range(4)) + '\n',
    editorial=D('''
        <p><b>Yaklaşım:</b> Biri baştan biri sondan başlayan iki işaretçi tut. Harf/rakam olmayan karakterin üzerinden geç; ikisi de geçerli karakterdeyse <code>lower()</code> ile karşılaştır, eşitse ikisini de içeri kaydır. Bir uyuşmazlık görürsen hemen dur.</p>
        <p><b>Karmaşıklık:</b> O(n) zaman, O(1) ek bellek (satırın kendisi dışında).</p>
        <p><b>Naif çözüm:</b> Temizlenmiş metni kurup <code>t == t[::-1]</code> demek de O(n)\'dir ve burada geçer; ama iki ek kopya oluşturur. Mülakatlarda genellikle "ek bellek kullanmadan" istenir; iki işaretçi bu yüzden öğretilir. Asıl yavaş yol, her adımda <code>s.replace</code> ya da dilimleme ile yeni metin üretmektir (O(n²)).</p>
        <p><b>Sık hata:</b> Satırları <code>split()</code> ile bölmek: boşluklu sloganlar parçalanır. Satırı <code>split(\'\\n\')</code> ile almalısın; ayrıca boş satırı unutma.</p>'''),
    hints=['Sol ve sağ uçtan birer işaretçi başlat.', 'isalnum() olmayan karakteri atla, kalanları lower() ile karşılaştır.']))

# ---------------------------------------------------------------- a-122
P.append(dict(
    id='a-122', title='İki deponun stok kodlarını birleştir', track=T, diff='Kolay',
    tags=['iki işaretçi', 'birleştirme'], src='LeetCode 88 Merge Sorted Array benzeri',
    statement=D('''
        <p>Anadolu Market\'in İzmir ve Ankara depoları, ürün kodlarını küçükten büyüğe sıralı tutuyor. Merkez, iki listeyi tek bir sıralı listede görmek istiyor. Aynı kod iki depoda da olabilir; birleşik listede iki kez yer alır.</p>
        <p>İki sıralı listeyi tek bir sıralı liste olarak yazdır.</p>'''),
    input='<p>İlk satırda N ve M. İkinci satırda N kod (azalmayan sırada), üçüncü satırda M kod (azalmayan sırada). N ya da M sıfırsa o satır boştur.</p>',
    output='<p>Tek satırda, boşlukla ayrılmış N+M kod.</p>',
    constraints='0 ≤ N, M ≤ 10^5, N+M ≥ 1, 0 ≤ kod ≤ 10^9',
    samples=[('4 3\n1 4 4 9\n2 4 10\n', 'İki işaretçiyle her adımda küçük olanı alırız: 1 2 4 4 4 9 10.'),
             ('0 2\n\n5 6\n', 'İlk depo boş; ikinci liste olduğu gibi yazılır.')],
    hidden=['1 1\n7\n3\n', '3 0\n1 2 3\n\n', '2 2\n5 5\n5 5\n', '5 5\n1 3 5 7 9\n2 4 6 8 10\n',
            {'gen': D('''
                import random
                random.seed(122)
                n, m = 100000, 100000
                a = sorted(random.randint(0, 10**9) for _ in range(n))
                b = sorted(random.randint(0, 10**9) for _ in range(m))
                print(n, m)
                print(*a)
                print(*b)
                ''')}],
    start=D('''
        import sys
        satirlar = sys.stdin.read().split('\\n')
        n, m = map(int, satirlar[0].split())
        a = list(map(int, satirlar[1].split()))
        b = list(map(int, satirlar[2].split()))
        # iki işaretçiyle birleştir
        '''),
    sol=D('''
        import sys
        satirlar = sys.stdin.read().split('\\n')
        n, m = map(int, satirlar[0].split())
        a = list(map(int, satirlar[1].split())) if n else []
        b = list(map(int, satirlar[2].split())) if m else []
        i = j = 0
        sonuc = []
        while i < n and j < m:
            if a[i] <= b[j]:
                sonuc.append(a[i]); i += 1
            else:
                sonuc.append(b[j]); j += 1
        sonuc.extend(a[i:])
        sonuc.extend(b[j:])
        print(*sonuc)
        '''),
    brute=D('''
        import sys
        s = sys.stdin.read().split('\\n')
        print(*sorted(list(map(int, s[1].split())) + list(map(int, s[2].split()))))
        '''),
    rnd=lambda r: (lambda n, m: f"{n} {m}\n{' '.join(map(str, sorted(r.randint(0, 9) for _ in range(n))))}\n{' '.join(map(str, sorted(r.randint(0, 9) for _ in range(m))))}\n")(r.randint(0, 5), r.randint(1, 5)),
    editorial=D('''
        <p><b>Yaklaşım:</b> Her listenin başına bir işaretçi koy. Her adımda iki işaretçinin gösterdiği değerden küçük olanı sonuca ekle ve o işaretçiyi ilerlet. Bir liste bitince diğerinin kalanını olduğu gibi ekle. Bu, merge sort\'un "birleştir" adımının ta kendisidir.</p>
        <p><b>Karmaşıklık:</b> O(N+M) zaman, sonuç için O(N+M) bellek.</p>
        <p><b>Naif çözüm:</b> Her elemanı <code>insert</code> ile doğru yere koymak O(N·M) kaydırma yapar ve 10^5 boyutunda çok yavaşlar. <code>sorted(a + b)</code> O((N+M) log(N+M)) ile burada geçer (Timsal sıralı parçaları fark edip hızlanır bile), ama listelerin zaten sıralı olduğu bilgisini kullanmaz. <code>heapq.merge</code> da aynı iki işaretçi fikrinin hazır hâlidir.</p>
        <p><b>Sık hata:</b> N=0 iken boş satırı <code>int</code>\'e çevirmeye çalışmak ya da döngüden sonra kalan elemanları eklemeyi unutmak.</p>'''),
    hints=['Her iki listenin başına birer indeks koy.', 'Döngü bitince kalan kuyruğu da ekle.']))

# ---------------------------------------------------------------- a-123
P.append(dict(
    id='a-123', title='Dönem cirosu sorguları', track=T, diff='Kolay',
    tags=['önek toplamı', 'sorgu'], src='HackerRank / LeetCode 303 Range Sum Query benzeri',
    statement=D('''
        <p>Anadolu Market finans ekibi günlük net ciroyu (iade günlerinde negatif olabilir) bir dizi olarak tutuyor. Gün içinde yüzlerce kez "L. günden R. güne kadar toplam ciro ne?" sorusu geliyor.</p>
        <p>Her sorgu için L ile R (ikisi dahil, 1\'den başlayan numaralama) arasındaki günlerin toplam cirosunu yazdır.</p>'''),
    input='<p>İlk satırda N ve Q. İkinci satırda N tam sayı (günlük ciro). Sonraki Q satırın her birinde L R.</p>',
    output='<p>Her sorgu için bir satırda toplam.</p>',
    constraints='1 ≤ N, Q ≤ 10^5, |ciro| ≤ 10^9, 1 ≤ L ≤ R ≤ N',
    samples=[('5 3\n10 -2 7 4 1\n1 3\n2 5\n4 4\n',
              '1–3: 10−2+7=15; 2–5: −2+7+4+1=10; 4–4: 4.')],
    hidden=['1 1\n-5\n1 1\n', '3 2\n0 0 0\n1 3\n2 2\n', '4 4\n1000000000 1000000000 1000000000 1000000000\n1 4\n1 1\n2 3\n4 4\n',
            {'gen': D('''
                import random
                random.seed(123)
                n = q = 100000
                print(n, q)
                print(*[random.randint(-10**9, 10**9) for _ in range(n)])
                out = []
                for _ in range(q):
                    l = random.randint(1, n // 10)
                    r = random.randint(n - n // 10, n)
                    out.append(f'{l} {r}')
                print('\\n'.join(out))
                ''')},
            {'gen': D('''
                import random
                random.seed(1230)
                n = q = 100000
                print(n, q)
                print(*[random.randint(-5, 5) for _ in range(n)])
                for _ in range(q):
                    l = random.randint(1, n); r = random.randint(l, n)
                    print(l, r)
                ''')}],
    start=D('''
        import sys
        input = sys.stdin.readline
        n, q = map(int, input().split())
        ciro = list(map(int, input().split()))
        for _ in range(q):
            l, r = map(int, input().split())
            # önek toplamı ile O(1) cevapla
        '''),
    sol=D('''
        import sys
        veri = sys.stdin.read().split()
        n, q = int(veri[0]), int(veri[1])
        onek = [0] * (n + 1)
        for i in range(n):
            onek[i + 1] = onek[i] + int(veri[2 + i])
        cevap = []
        p = 2 + n
        for _ in range(q):
            l, r = int(veri[p]), int(veri[p + 1]); p += 2
            cevap.append(onek[r] - onek[l - 1])
        print('\\n'.join(map(str, cevap)))
        '''),
    brute=D('''
        import sys
        v = sys.stdin.read().split(); n, q = int(v[0]), int(v[1]); a = list(map(int, v[2:2+n])); p = 2 + n
        for _ in range(q):
            l, r = int(v[p]), int(v[p+1]); p += 2
            print(sum(a[l-1:r]))
        '''),
    rnd=lambda r: (lambda n: f"{n} 5\n{ints(r, n, -9, 9)}\n" + ''.join((lambda l: f"{l} {r.randint(l, n)}\n")(r.randint(1, n)) for _ in range(5)))(r.randint(1, 8)),
    editorial=D('''
        <p><b>Yaklaşım:</b> <code>onek[i]</code> = ilk i günün toplamı olacak şekilde bir önek (prefix) dizisi kur; <code>onek[0] = 0</code>. Sonra L..R toplamı <code>onek[R] - onek[L-1]</code> olur. Ön hazırlık bir kez yapılır, her sorgu sabit sürede cevaplanır. (<code>itertools.accumulate</code> da aynı diziyi üretir.)</p>
        <p><b>Karmaşıklık:</b> O(N + Q) zaman, O(N) bellek.</p>
        <p><b>Naif çözüm neden yetmez:</b> Her sorguda <code>sum(ciro[L-1:R])</code> demek sorgu başına O(N), toplamda O(N·Q) = 10^10 işlem demektir; gizli testteki geniş aralıklı 10^5 sorguda zaman sınırını aşar.</p>
        <p><b>Sık hata:</b> 1 tabanlı L\'yi 0 tabanlı diziyle karıştırmak (<code>onek[L]</code> yazmak) ve çok satırlı girdiyi <code>input()</code> ile tek tek okuyup yavaşlamak; büyük girdide <code>sys.stdin</code> kullan.</p>'''),
    hints=['onek[i+1] = onek[i] + ciro[i]', 'L..R toplamı = onek[R] − onek[L−1].']))

# ---------------------------------------------------------------- a-124
P.append(dict(
    id='a-124', title='En iyi K günlük kampanya dönemi', track=T, diff='Kolay',
    tags=['kayan pencere'], src='LeetCode 643 Maximum Average Subarray I benzeri',
    statement=D('''
        <p>Lezzet Kurye, bir sonraki reklam kampanyasını geçmiş verideki en başarılı <b>K ardışık günlük</b> dönemi örnek alarak planlayacak. Günlük net kâr dizisi verildiğinde, uzunluğu tam K olan ardışık dönemler içinde toplam kârı en yüksek olanın toplamını bul.</p>'''),
    input='<p>İlk satırda N ve K. İkinci satırda N tam sayı (günlük net kâr; negatif olabilir).</p>',
    output='<p>En büyük K günlük toplam.</p>',
    constraints='1 ≤ K ≤ N ≤ 2·10^5, |kâr| ≤ 10^4',
    samples=[('6 3\n2 -1 4 3 -6 5\n', 'Pencereler: 5, 6, 1, 2. En büyüğü −1+4+3 = 6.'),
             ('3 3\n-1 -2 -3\n', 'Tek pencere var: −6.')],
    hidden=['1 1\n-7\n', '5 1\n-3 -1 -2 -9 -4\n', '5 2\n1 1 1 1 1\n', '8 4\n5 5 -20 5 5 5 5 -1\n',
            {'gen': D('''
                import random
                random.seed(124)
                n, k = 200000, 70000
                print(n, k)
                print(*[random.randint(-10**4, 10**4) for _ in range(n)])
                ''')}],
    start=D('''
        n, k = map(int, input().split())
        kar = list(map(int, input().split()))
        # ilk pencerenin toplamını al, sonra kaydır
        '''),
    sol=D('''
        n, k = map(int, input().split())
        kar = list(map(int, input().split()))
        toplam = sum(kar[:k])
        en_iyi = toplam
        for i in range(k, n):
            toplam += kar[i] - kar[i - k]
            if toplam > en_iyi:
                en_iyi = toplam
        print(en_iyi)
        '''),
    brute=D('''
        n, k = map(int, input().split()); a = list(map(int, input().split()))
        print(max(sum(a[i:i+k]) for i in range(n-k+1)))
        '''),
    rnd=lambda r: (lambda n: f"{n} {r.randint(1, n)}\n{ints(r, n, -9, 9)}\n")(r.randint(1, 9)),
    editorial=D('''
        <p><b>Yaklaşım:</b> Sabit boyutlu kayan pencere (sliding window). İlk K elemanın toplamını hesapla. Pencereyi bir sağa kaydırırken yeni gireni ekle, çıkanı düş: <code>toplam += kar[i] - kar[i-K]</code>. Her adımda en iyiyi güncelle.</p>
        <p><b>Karmaşıklık:</b> O(N) zaman, O(1) ek bellek.</p>
        <p><b>Naif çözüm neden yetmez:</b> Her başlangıç için <code>sum(kar[i:i+K])</code> hesaplamak O(N·K)\'dir; gizli testte N=2·10^5, K=7·10^4 için ~10^10 işlem eder.</p>
        <p><b>Sık hata:</b> <code>en_iyi = 0</code> ile başlamak: tüm değerler negatifse yanlış cevap verir. İlk pencerenin toplamıyla başla.</p>'''),
    hints=['Pencere kayınca yalnız iki eleman değişir.', 'Başlangıç değerini 0 değil ilk pencerenin toplamı yap.']))

# ---------------------------------------------------------------- a-125
P.append(dict(
    id='a-125', title='Tekrarsız en uzun rota kodu', track=T, diff='Orta',
    tags=['kayan pencere', 'sözlük'], src='LeetCode 3 Longest Substring Without Repeating Characters benzeri',
    statement=D('''
        <p>Lezzet Kurye\'nin rota kayıtlarında her karakter bir mahalle kodudur. Operasyon ekibi, hiçbir mahallenin tekrar etmediği <b>en uzun ardışık bölümün</b> uzunluğunu merak ediyor; bu, kuryenin aynı yere dönmeden yaptığı en uzun kesintisiz tur sayılıyor.</p>
        <p>Verilen metinde, içinde aynı karakterin iki kez geçmediği en uzun alt dizinin (ardışık parça) uzunluğunu yazdır.</p>'''),
    input='<p>Tek satırda rota metni (küçük İngilizce harfler ve rakamlar).</p>',
    output='<p>Tek tam sayı: en uzun tekrarsız parçanın uzunluğu.</p>',
    constraints='1 ≤ |s| ≤ 2·10^5',
    samples=[('abcabcbb\n', 'En uzun tekrarsız parçalar "abc", "bca", "cab": uzunluk 3.'),
             ('pwwkew\n', '"wke" uzunluk 3; "pwke" ardışık değil, sayılmaz.')],
    hidden=['a\n', 'bbbbbb\n', 'abba\n', 'dvdf\n', 'tmmzuxt\n', '0123456789abcdefghijklmnopqrstuvwxyz\n',
            {'gen': D('''
                import random
                random.seed(125)
                print(''.join(random.choice('abcdefghijklmnopqrstuvwxyz0123456789') for _ in range(200000)))
                ''')},
            {'gen': D('''
                s = 'abcdefghijklmnopqrstuvwxyz0123456789'
                print((s * 6000)[:200000])
                ''')}],
    start=D('''
        s = input().strip()
        # son görülme indekslerini sözlükte tut
        '''),
    sol=D('''
        s = input().strip()
        son = {}
        sol = 0
        en_iyi = 0
        for i, c in enumerate(s):
            if c in son and son[c] >= sol:
                sol = son[c] + 1
            son[c] = i
            if i - sol + 1 > en_iyi:
                en_iyi = i - sol + 1
        print(en_iyi)
        '''),
    brute=D('''
        s = input().strip(); b = 0
        for i in range(len(s)):
            for j in range(i, len(s)):
                if len(set(s[i:j+1])) == j - i + 1: b = max(b, j - i + 1)
        print(b)
        '''),
    rnd=lambda r: ''.join(r.choice('abc1') for _ in range(r.randint(1, 10))) + '\n',
    editorial=D('''
        <p><b>Yaklaşım:</b> Değişken boyutlu kayan pencere. <code>sol</code> pencerenin başı, <code>i</code> sonu. Her karakterin son görüldüğü indeksi sözlükte tut. Yeni karakter pencerenin içinde daha önce görüldüyse (<code>son[c] &gt;= sol</code>), pencerenin başını o tekrarın bir sağına zıplat. Her adımda pencere uzunluğu <code>i - sol + 1</code> adaydır.</p>
        <p><b>Karmaşıklık:</b> O(n) zaman; sözlük en fazla alfabe kadar (O(min(n, Σ))) bellek.</p>
        <p><b>Naif çözüm neden yetmez:</b> Tüm (i, j) çiftlerini deneyip <code>set</code> ile kontrol etmek O(n²)–O(n³)\'tür; 2·10^5 karakterde milyarlarca adım eder.</p>
        <p><b>Sık hata:</b> <code>son[c] &gt;= sol</code> kontrolünü unutmak: "abba" örneğinde ikinci a geldiğinde eski a pencerenin dışındadır, <code>sol</code> geri gitmemelidir (cevap 2).</p>'''),
    hints=['Pencerenin başını ve her karakterin son indeksini tut.', 'Tekrar pencere içindeyse başı son[c]+1\'e taşı; geri gitme.']))

# ---------------------------------------------------------------- a-126
P.append(dict(
    id='a-126', title='Depo çatısında biriken yağmur', track=T, diff='Zor',
    tags=['iki işaretçi', 'önek maksimum'], src='LeetCode 42 Trapping Rain Water benzeri',
    statement=D('''
        <p>Anadolu Market\'in açık depo alanında yan yana dizilmiş, her biri 1 birim genişliğinde N raf bloğu var; i. bloğun yüksekliği h<sub>i</sub>. Şiddetli yağmurdan sonra bloklar arasındaki çukurlarda su birikiyor. Bir sütunun üzerinde biriken su miktarı, solundaki en yüksek blok ile sağındaki en yüksek bloktan <b>küçük olanı</b> eksi kendi yüksekliğidir (negatifse 0).</p>
        <p>Toplam kaç birim su biriktiğini hesapla.</p>'''),
    input='<p>İlk satırda N. İkinci satırda N tam sayı (yükseklikler).</p>',
    output='<p>Toplam biriken su (tam sayı).</p>',
    constraints='1 ≤ N ≤ 2·10^5, 0 ≤ h ≤ 10^4',
    samples=[('12\n0 1 0 2 1 0 1 3 2 1 2 1\n', 'Çukurlarda 1+1+2+1+1 = 6 birim su birikir.'),
             ('6\n4 2 0 3 2 5\n', 'Sütunlara 2, 4, 1, 2 birim: toplam 9.')],
    hidden=['1\n5\n', '2\n3 3\n', '5\n1 2 3 4 5\n', '5\n5 4 3 2 1\n', '3\n5 0 5\n', '7\n0 0 0 0 0 0 0\n',
            {'gen': D('''
                import random
                random.seed(126)
                n = 200000
                print(n)
                print(*[random.randint(0, 10**4) for _ in range(n)])
                ''')},
            {'gen': D('''
                n = 200000
                print(n)
                h = [10000] + [0] * (n - 2) + [9999]
                print(*h)
                ''')}],
    start=D('''
        n = int(input())
        h = list(map(int, input().split()))
        # iki uçtan işaretçilerle ilerle
        '''),
    sol=D('''
        n = int(input())
        h = list(map(int, input().split()))
        i, j = 0, n - 1
        sol_max = sag_max = 0
        su = 0
        while i < j:
            if h[i] < h[j]:
                if h[i] >= sol_max:
                    sol_max = h[i]
                else:
                    su += sol_max - h[i]
                i += 1
            else:
                if h[j] >= sag_max:
                    sag_max = h[j]
                else:
                    su += sag_max - h[j]
                j -= 1
        print(su)
        '''),
    brute=D('''
        n = int(input()); h = list(map(int, input().split()))
        print(sum(max(0, min(max(h[:i+1]), max(h[i:])) - h[i]) for i in range(n)))
        '''),
    rnd=lambda r: (lambda n: f"{n}\n{ints(r, n, 0, 6)}\n")(r.randint(1, 10)),
    editorial=D('''
        <p><b>Yaklaşım:</b> Her sütundaki su = <code>min(soldaki_max, sağdaki_max) - h[i]</code>. İki işaretçiyle tek geçişte hesaplanabilir: Sol ve sağ uçtan başla, <code>sol_max</code> ve <code>sag_max</code> tut. <code>h[i] &lt; h[j]</code> ise sol taraftaki sütunun suyu kesinlikle <code>sol_max</code> ile sınırlıdır (çünkü sağda en az h[j] kadar yüksek bir duvar var); onu hesapla ve <code>i</code>\'yi ilerlet. Aksi hâlde simetrik işlemi sağda yap.</p>
        <p><b>Karmaşıklık:</b> O(N) zaman, O(1) ek bellek. Alternatif: iki önek-maksimum dizisi (soldan ve sağdan) ile O(N) zaman, O(N) bellek; monoton yığınla da çözülür.</p>
        <p><b>Naif çözüm neden yetmez:</b> Her sütun için solu ve sağı baştan taramak O(N²) = 4·10^10 işlem; gizli testteki 2·10^5 blokta saniyelerce değil dakikalarca sürer.</p>
        <p><b>Sık hata:</b> Sadece en yüksek komşuya bakmak (yerel çukur sanmak) ya da hangi tarafı ilerleteceğine yanlış karar vermek: her zaman <b>alçak</b> taraftaki işaretçiyi ilerlet.</p>'''),
    hints=['Su seviyesi min(sol en yüksek, sağ en yüksek) ile belirlenir.', 'Alçak taraftaki işaretçinin suyu kesin bilinir; onu işle ve ilerlet.']))

# ---------------------------------------------------------------- a-127
P.append(dict(
    id='a-127', title='Net sıfır işlem üçlüleri', track=T, diff='Orta',
    tags=['iki işaretçi', 'sıralama'], src='LeetCode 15 3Sum benzeri',
    statement=D('''
        <p>Ilgaz Bank denetim ekibi, toplamı tam sıfır olan üç hesap hareketi (örneğin +500, −200, −300) bulduğunda bunları "dengeleyici üçlü" olarak işaretliyor. Aynı tutar değerlerinden oluşan üçlüler tek sayılır: {−1, 0, 1} hangi indekslerden gelirse gelsin bir kez sayılır.</p>
        <p>Farklı indekslerdeki üç hareketten oluşan, toplamı 0 olan <b>farklı değer üçlülerinin</b> sayısını yazdır.</p>'''),
    input='<p>İlk satırda N. İkinci satırda N tam sayı (hareket tutarları).</p>',
    output='<p>Farklı üçlü sayısı.</p>',
    constraints='3 ≤ N ≤ 1500, |tutar| ≤ 10^5',
    samples=[('6\n-1 0 1 2 -1 -4\n', 'Üçlüler: {−1, −1, 2} ve {−1, 0, 1}. Cevap 2.'),
             ('3\n0 0 0\n', '{0, 0, 0} tek üçlü.')],
    hidden=['3\n1 2 3\n', '5\n0 0 0 0 0\n', '7\n-2 0 1 1 2 -1 -1\n', '4\n-1 -1 2 2\n',
            {'gen': D('''
                import random
                random.seed(127)
                n = 1500
                print(n)
                print(*[random.randint(-10**5, 10**5) for _ in range(n)])
                ''')},
            {'gen': D('''
                import random
                random.seed(1270)
                n = 1500
                print(n)
                print(*[random.randint(-300, 300) for _ in range(n)])
                ''')}],
    start=D('''
        n = int(input())
        a = sorted(map(int, input().split()))
        sayac = 0
        # her i için iki işaretçiyle j, k ara; tekrarları atla
        print(sayac)
        '''),
    sol=D('''
        n = int(input())
        a = sorted(map(int, input().split()))
        sayac = 0
        for i in range(n - 2):
            if i > 0 and a[i] == a[i - 1]:
                continue
            if a[i] > 0:
                break
            hedef = -a[i]
            j, k = i + 1, n - 1
            while j < k:
                t = a[j] + a[k]
                if t < hedef:
                    j += 1
                elif t > hedef:
                    k -= 1
                else:
                    sayac += 1
                    v = a[j]
                    while j < k and a[j] == v:
                        j += 1
                    k -= 1
        print(sayac)
        '''),
    brute=D('''
        from itertools import combinations
        n = int(input()); a = list(map(int, input().split()))
        print(len({tuple(sorted(c)) for c in combinations(a, 3) if sum(c) == 0}))
        '''),
    rnd=lambda r: (lambda n: f"{n}\n{ints(r, n, -4, 4)}\n")(r.randint(3, 9)),
    editorial=D('''
        <p><b>Yaklaşım:</b> Diziyi sırala. Her <code>i</code> için (aynı değer bir öncekiyle eşitse atla) kalan kısımda toplamı <code>-a[i]</code> olan çifti iki işaretçiyle ara: toplam küçükse <code>j</code>\'yi, büyükse <code>k</code>\'yi kaydır. Bir çift bulunca say, <code>j</code>\'yi aynı değerleri geçecek kadar ilerlet. <code>a[i] &gt; 0</code> olunca dur; üç pozitif sıfır edemez.</p>
        <p><b>Karmaşıklık:</b> Sıralama O(N log N) + dış döngü × iki işaretçi O(N²). Bellek O(1) (sıralı liste dışında).</p>
        <p><b>Naif çözüm neden yetmez:</b> Üç iç içe döngü (ya da <code>combinations(a, 3)</code>) O(N³) ≈ 5,6·10^8 üçlü üretir (N=1500); CPython\'da dakikalar sürer. Hash tablosu ile O(N²) çözüm de mümkündür ama tekrarları ayıklamak daha zahmetlidir.</p>
        <p><b>Sık hata:</b> Tekrarları atlamamak ve aynı üçlüyü birden çok kez saymak; ya da tekrarları <code>set</code> ile ayıklayıp yine O(N³) kalmak.</p>'''),
    hints=['Önce sırala; sıralı dizide iki işaretçi çalışır.', 'Aynı a[i] değerini ikinci kez kullanma; çift bulunca aynı a[j] değerlerini de atla.']))

# ---------------------------------------------------------------- a-128
P.append(dict(
    id='a-128', title='Hedef tonaja ulaşan en kısa sevkiyat', track=T, diff='Orta',
    tags=['kayan pencere', 'iki işaretçi'], src='LeetCode 209 Minimum Size Subarray Sum benzeri',
    statement=D('''
        <p>Kanat Havayolları kargo bölümünde paletler sırayla bantta ilerliyor; i. paletin ağırlığı w<sub>i</sub> (pozitif). Bir uçağa <b>ardışık</b> paletler yüklenecek ve toplam ağırlık en az S olmalı (aksi hâlde sefer kârsız).</p>
        <p>Toplamı en az S olan en kısa ardışık palet grubunun uzunluğunu yazdır. Hiçbir grup yetmiyorsa 0 yaz.</p>'''),
    input='<p>İlk satırda N ve S. İkinci satırda N pozitif tam sayı.</p>',
    output='<p>En kısa uzunluk ya da 0.</p>',
    constraints='1 ≤ N ≤ 2·10^5, 1 ≤ w ≤ 10^4, 1 ≤ S ≤ 2·10^9',
    samples=[('6 7\n2 3 1 2 4 3\n', '[4, 3] toplamı 7, uzunluk 2.'),
             ('3 100\n10 20 30\n', 'Hepsinin toplamı 60, yani 100\'e ulaşılamıyor: cevap 0.')],
    hidden=['1 5\n5\n', '1 6\n5\n', '5 11\n1 2 3 4 5\n', '8 15\n1 1 1 1 1 1 1 1\n', '4 4\n1 4 4 1\n',
            {'gen': D('''
                import random
                random.seed(128)
                n = 200000
                print(n, 3 * 10**7)
                print(*[random.randint(1, 10**4) for _ in range(n)])
                ''')},
            {'gen': D('''
                n = 200000
                print(n, 150000)
                print(*([1] * n))
                ''')}],
    start=D('''
        n, s = map(int, input().split())
        w = list(map(int, input().split()))
        # pencereyi sağdan büyüt, toplam >= s iken soldan daralt
        '''),
    sol=D('''
        n, s = map(int, input().split())
        w = list(map(int, input().split()))
        en_kisa = n + 1
        toplam = 0
        sol = 0
        for i in range(n):
            toplam += w[i]
            while toplam >= s:
                if i - sol + 1 < en_kisa:
                    en_kisa = i - sol + 1
                toplam -= w[sol]
                sol += 1
        print(0 if en_kisa == n + 1 else en_kisa)
        '''),
    brute=D('''
        n, s = map(int, input().split()); w = list(map(int, input().split())); b = 0
        for L in range(1, n+1):
            if any(sum(w[i:i+L]) >= s for i in range(n-L+1)): b = L; break
        print(b)
        '''),
    rnd=lambda r: (lambda n: f"{n} {r.randint(1, 30)}\n{ints(r, n, 1, 6)}\n")(r.randint(1, 9)),
    editorial=D('''
        <p><b>Yaklaşım:</b> Değerler pozitif olduğu için pencere toplamı sağa genişleyince artar, soldan daralınca azalır. Sağ ucu ilerlet, toplam S\'ye ulaştıkça uzunluğu kaydet ve sol ucu daralt. Her eleman pencereye bir kez girer, bir kez çıkar.</p>
        <p><b>Karmaşıklık:</b> O(N) zaman (amortize), O(1) bellek. Alternatif: önek toplamları + ikili arama ile O(N log N).</p>
        <p><b>Naif çözüm neden yetmez:</b> Her başlangıç için sağa doğru toplamak O(N²) = 4·10^10 adımdır. Gizli testte 2·10^5 palet ve büyük S var.</p>
        <p><b>Sık hata:</b> Bu tekniği negatif değerli dizilere uygulamak (orada toplam monoton değildir; önek + monoton deque gerekir) ve hiç pencere bulunamadığında 0 yerine N+1 yazdırmak.</p>'''),
    hints=['Değerler pozitif: pencere büyüyünce toplam artar.', 'Toplam ≥ S olduğu sürece soldan daralt ve en kısa uzunluğu güncelle.']))

# ---------------------------------------------------------------- a-129
P.append(dict(
    id='a-129', title='Tüm stok kodlarını kapsayan en kısa raf aralığı', track=T, diff='Zor',
    tags=['kayan pencere', 'sayaç'], src='LeetCode 76 Minimum Window Substring benzeri',
    statement=D('''
        <p>Anadolu Market deposunda raflar tek sıra hâlinde dizili ve her rafta tek harfli bir ürün kategorisi kodu var (s metni). Bir toplayıcı, siparişteki tüm kategorileri (t metni, tekrarlar dahil: "AAB" iki A ve bir B ister) tek bir <b>ardışık raf aralığından</b> toplamak istiyor.</p>
        <p>t\'deki her karakteri (tekrar sayısıyla) içeren en kısa ardışık parçayı yazdır. Aynı uzunlukta birden çok parça varsa <b>en soldakini</b> seç. Hiçbiri yoksa <code>YOK</code> yaz.</p>'''),
    input='<p>İlk satırda s, ikinci satırda t (büyük ve küçük İngilizce harfler; büyük/küçük harf farklı sayılır).</p>',
    output='<p>En kısa parça ya da <code>YOK</code>.</p>',
    constraints='1 ≤ |s| ≤ 10^5, 1 ≤ |t| ≤ 10^4',
    samples=[('ADOBECODEBANC\nABC\n', '"BANC" A, B ve C\'yi içeren en kısa parça (uzunluk 4).'),
             ('aa\naaa\n', 's\'de yalnız iki a var, üç a istenmiş: YOK.')],
    hidden=['a\na\n', 'a\nA\n', 'abcabc\ncb\n', 'xyzAAByyAB\nAAB\n', 'bba\nab\n', 'aaflslflsldkalskaaa\naaa\n',
            {'gen': D('''
                import random
                random.seed(129)
                s = ''.join(random.choice('abcdefghij') for _ in range(100000))
                t = ''.join(random.choice('abcdefghij') for _ in range(40))
                print(s)
                print(t)
                ''')},
            {'gen': D('''
                import random
                random.seed(1290)
                s = ''.join(random.choice('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ') for _ in range(100000))
                t = ''.join(random.choice('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ') for _ in range(10000))
                print(s)
                print(t)
                ''')},
            {'gen': D('''
                s = 'a' * 99999 + 'b'
                print(s)
                print('ba')
                ''')}],
    start=D('''
        from collections import Counter
        s = input().strip()
        t = input().strip()
        gerek = Counter(t)
        # eksik sayısını tutarak pencereyi genişlet/daralt
        '''),
    sol=D('''
        from collections import Counter
        s = input().strip()
        t = input().strip()
        gerek = Counter(t)
        eksik = len(t)
        sol = 0
        en_bas, en_uzun = 0, len(s) + 1
        for i, c in enumerate(s):
            if gerek[c] > 0:
                eksik -= 1
            gerek[c] -= 1
            if eksik == 0:
                while gerek[s[sol]] < 0:
                    gerek[s[sol]] += 1
                    sol += 1
                if i - sol + 1 < en_uzun:
                    en_bas, en_uzun = sol, i - sol + 1
                gerek[s[sol]] += 1
                eksik += 1
                sol += 1
        print('YOK' if en_uzun > len(s) else s[en_bas:en_bas + en_uzun])
        '''),
    brute=D('''
        from collections import Counter
        s = input().strip(); t = input().strip(); ct = Counter(t)
        for L in range(1, len(s)+1):
            for i in range(len(s)-L+1):
                if not (ct - Counter(s[i:i+L])):
                    print(s[i:i+L]); raise SystemExit
        print('YOK')
        '''),
    rnd=lambda r: ''.join(r.choice('abA') for _ in range(r.randint(1, 9))) + '\n' + ''.join(r.choice('abA') for _ in range(r.randint(1, 3))) + '\n',
    editorial=D('''
        <p><b>Yaklaşım:</b> <code>gerek</code> sayacı t\'deki karakterlerden kaç tane daha lazım olduğunu, <code>eksik</code> toplam eksik karakter sayısını tutar. Sağ ucu ilerletirken gelen karakter hâlâ gerekiyorsa <code>eksik</code>\'i azalt. <code>eksik == 0</code> olunca pencere geçerlidir: soldan fazlalıkları (sayacı negatif olanları) at, uzunluğu kaydet, sonra bir gerekli karakteri bırakıp aramaya devam et.</p>
        <p><b>Karmaşıklık:</b> Her indeks pencereye bir kez girip bir kez çıkar: O(|s| + |t|) zaman, alfabe boyutunda bellek.</p>
        <p><b>Naif çözüm neden yetmez:</b> Tüm parçaları denemek O(|s|²) parça × her birinde sayım; 10^5 uzunlukta 10^10\'dan fazla işlem. Her pencere için <code>Counter</code> karşılaştırmak da alfabe kadar ek maliyet getirir.</p>
        <p><b>Sık hata:</b> Tekrar sayısını göz ardı etmek (<code>set(t)</code> kullanmak), büyük/küçük harfi aynı saymak ve eşit uzunlukta sağdaki pencereyi seçmek (karşılaştırmada <code>&lt;=</code> yerine <code>&lt;</code> kullan).</p>'''),
    hints=['Eksik karakter sayısını tek bir tamsayıda tut; her seferinde Counter karşılaştırma.', 'Pencere geçerli olunca soldan gereksizleri at, kaydet, sonra bir adım daha daralt.']))

# ---------------------------------------------------------------- a-130
P.append(dict(
    id='a-130', title='Net bakiye değişimi tam K olan dönemler', track=T, diff='Orta',
    tags=['önek toplamı', 'sözlük'], src='LeetCode 560 Subarray Sum Equals K benzeri',
    statement=D('''
        <p>Ilgaz Bank\'ın risk ekibi, bir müşterinin günlük bakiye değişimlerini (yatırma pozitif, çekme negatif) inceliyor. Toplam değişimi tam olarak K olan <b>ardışık gün dönemlerinin</b> sayısı şüpheli örüntü göstergesi sayılıyor.</p>
        <p>Toplamı K olan ardışık alt dizi (en az 1 gün) sayısını yazdır.</p>'''),
    input='<p>İlk satırda N ve K. İkinci satırda N tam sayı.</p>',
    output='<p>Dönem sayısı.</p>',
    constraints='1 ≤ N ≤ 2·10^5, |değer| ≤ 1000, |K| ≤ 10^8',
    samples=[('5 3\n1 2 1 2 1\n', '[1,2], [2,1], [1,2], [2,1]: 4 dönem.'),
             ('4 0\n1 -1 1 -1\n', 'Toplamı 0 olan dönemler: [1,−1] üç kez ve [1,−1,1,−1] bir kez: 4.')],
    hidden=['1 5\n5\n', '1 0\n0\n', '3 0\n0 0 0\n', '5 -2\n-1 -1 1 -2 0\n', '4 100\n1 2 3 4\n',
            {'gen': D('''
                import random
                random.seed(130)
                n = 200000
                print(n, 7)
                print(*[random.randint(-3, 3) for _ in range(n)])
                ''')},
            {'gen': D('''
                n = 200000
                print(n, 0)
                print(*([0] * n))
                ''')}],
    start=D('''
        from collections import defaultdict
        n, k = map(int, input().split())
        a = list(map(int, input().split()))
        # görülen önek toplamlarını say
        '''),
    sol=D('''
        n, k = map(int, input().split())
        a = list(map(int, input().split()))
        goruldu = {0: 1}
        onek = 0
        sayac = 0
        for x in a:
            onek += x
            sayac += goruldu.get(onek - k, 0)
            goruldu[onek] = goruldu.get(onek, 0) + 1
        print(sayac)
        '''),
    brute=D('''
        n, k = map(int, input().split()); a = list(map(int, input().split()))
        print(sum(1 for i in range(n) for j in range(i, n) if sum(a[i:j+1]) == k))
        '''),
    rnd=lambda r: (lambda n: f"{n} {r.randint(-3, 3)}\n{ints(r, n, -2, 2)}\n")(r.randint(1, 9)),
    editorial=D('''
        <p><b>Yaklaşım:</b> P(i) ilk i elemanın toplamı olsun. (j, i] aralığının toplamı P(i) − P(j). Bu K ise P(j) = P(i) − K. Soldan geçerken her önek toplamının kaç kez görüldüğünü sözlükte say; her adımda <code>goruldu[onek - K]</code> kadar yeni dönem bulursun. Başlangıçta <code>{0: 1}</code> (boş önek) olmalı ki baştan başlayan dönemler sayılsın.</p>
        <p><b>Karmaşıklık:</b> O(N) zaman, O(N) bellek.</p>
        <p><b>Naif çözüm neden yetmez:</b> Tüm (i, j) çiftlerini denemek O(N²) = 2·10^10\'dur. Değerler negatif olabildiği için kayan pencere de çalışmaz: toplam monoton değildir. Cevap 2·10^10 civarına çıkabilir; Python tam sayıları taşmaz ama başka dillerde 64 bit gerekir.</p>
        <p><b>Sık hata:</b> <code>{0: 1}</code> başlangıcını unutmak ya da sözlüğü güncelledikten <i>sonra</i> sorgulamak (K=0 iken her elemanı kendisiyle eşleyip fazla sayarsın).</p>'''),
    hints=['Aralık toplamı = iki önek toplamının farkı.', 'Önce onek−K kaç kez görüldü diye bak, sonra onek\'i sözlüğe ekle.']))

# ---------------------------------------------------------------- a-131
P.append(dict(
    id='a-131', title='İstenen saatten sonraki ilk uçuş', track=T, diff='Kolay',
    tags=['ikili arama', 'bisect'], src='HackerRank / LeetCode lower_bound kalıbı',
    statement=D('''
        <p>Kanat Havayolları\'nın İstanbul–İzmir hattındaki kalkış saatleri, gece yarısından itibaren dakika cinsinden <b>sıralı</b> bir listede tutuluyor (aynı dakikada birden çok sefer olabilir). Çağrı merkezi her müşteri için "x. dakikada ya da sonrasında kalkan ilk uçuş hangi dakikada?" sorusunu yanıtlıyor.</p>
        <p>Her sorgu için x\'ten büyük ya da eşit ilk kalkış dakikasını yaz; yoksa <code>-1</code> yaz.</p>'''),
    input='<p>İlk satırda N ve Q. İkinci satırda N kalkış dakikası (azalmayan sırada). Sonraki Q satırda birer x.</p>',
    output='<p>Her sorgu için bir satır.</p>',
    constraints='1 ≤ N, Q ≤ 10^5, 0 ≤ dakika, x ≤ 10^9',
    samples=[('5 4\n60 90 90 300 720\n0\n90\n91\n800\n', 'x=0 → 60, x=90 → 90, x=91 → 300, x=800 → uçuş yok: −1.')],
    hidden=['1 2\n5\n5\n6\n', '3 3\n10 10 10\n9\n10\n11\n', '4 1\n1 2 3 4\n0\n',
            {'gen': D('''
                import random
                random.seed(131)
                n = q = 100000
                a = sorted(random.randint(0, 10**9) for _ in range(n))
                print(n, q)
                print(*a)
                print('\\n'.join(str(random.randint(0, 10**9)) for _ in range(q)))
                ''')},
            {'gen': D('''
                import random
                random.seed(1310)
                n = q = 100000
                a = sorted(random.randint(0, 1000) for _ in range(n))
                print(n, q)
                print(*a)
                print('\\n'.join(str(random.randint(0, 1001)) for _ in range(q)))
                ''')}],
    start=D('''
        import sys
        from bisect import bisect_left
        input = sys.stdin.readline
        n, q = map(int, input().split())
        a = list(map(int, input().split()))
        for _ in range(q):
            x = int(input())
            # bisect_left ile ilk >= x konumunu bul
        '''),
    sol=D('''
        import sys
        from bisect import bisect_left
        veri = sys.stdin.read().split()
        n, q = int(veri[0]), int(veri[1])
        a = list(map(int, veri[2:2 + n]))
        cevap = []
        for t in veri[2 + n:2 + n + q]:
            i = bisect_left(a, int(t))
            cevap.append(a[i] if i < n else -1)
        print('\\n'.join(map(str, cevap)))
        '''),
    brute=D('''
        import sys
        v = sys.stdin.read().split(); n, q = int(v[0]), int(v[1]); a = list(map(int, v[2:2+n]))
        for t in v[2+n:]:
            c = [y for y in a if y >= int(t)]
            print(c[0] if c else -1)
        '''),
    rnd=lambda r: (lambda n: f"{n} 4\n{' '.join(map(str, sorted(r.randint(0, 9) for _ in range(n))))}\n" + '\n'.join(str(r.randint(0, 10)) for _ in range(4)) + '\n')(r.randint(1, 6)),
    editorial=D('''
        <p><b>Yaklaşım:</b> Liste sıralı olduğundan "x\'ten büyük-eşit ilk eleman" ikili aramayla bulunur. <code>bisect_left(a, x)</code> x\'in sırayı bozmadan girebileceği en soldaki konumu verir; bu konum N ise öyle bir uçuş yoktur.</p>
        <p><b>Karmaşıklık:</b> Sorgu başına O(log N), toplam O((N + Q) log N).</p>
        <p><b>Naif çözüm neden yetmez:</b> Her sorguda listeyi baştan taramak O(N·Q) = 10^10 karşılaştırma. Sözlükle "tam eşleşme" aramak da işe yaramaz; x listede olmayabilir.</p>
        <p><b>Kendi ikili araman:</b> <code>lo, hi = 0, n</code>; <code>while lo &lt; hi: mid = (lo+hi)//2; if a[mid] &lt; x: lo = mid+1 else: hi = mid</code>. Sık hata: <code>hi = n-1</code> ile başlayıp "yok" durumunu kaçırmak ya da <code>bisect_right</code> kullanıp eşit değeri atlamak.</p>'''),
    hints=['Sıralı listede "ilk ≥ x" = bisect_left.', 'Dönen indeks N ise −1 yaz.']))

# ---------------------------------------------------------------- a-132
P.append(dict(
    id='a-132', title='Kuryenin minimum saatlik hızı', track=T, diff='Orta',
    tags=['ikili arama', 'cevap üzerinde arama'], src='LeetCode 875 Koko Eating Bananas benzeri',
    statement=D('''
        <p>Lezzet Kurye\'de bir kurye N bölgedeki bekleyen siparişleri H saat içinde bitirmek zorunda; i. bölgede p<sub>i</sub> sipariş var. Kurye saatlik hızını v (saatte en fazla v sipariş) olarak seçer. Her saat yalnızca <b>tek bir bölgede</b> çalışır: o bölgede v\'den az sipariş kaldıysa hepsini bitirir ve o saatin kalanı boşa gider.</p>
        <p>Tüm siparişleri H saat içinde bitirebileceği en küçük tam sayı v\'yi bul.</p>'''),
    input='<p>İlk satırda N ve H. İkinci satırda N tam sayı p<sub>i</sub>.</p>',
    output='<p>En küçük v.</p>',
    constraints='1 ≤ N ≤ 10^5, N ≤ H ≤ 10^9, 1 ≤ p ≤ 10^9',
    samples=[('4 8\n3 6 7 11\n', 'v=4 ile 1+2+2+3 = 8 saat; v=3 ile 1+2+3+4 = 10 saat (yetmez). Cevap 4.'),
             ('5 5\n30 11 23 4 20\n', 'Her bölgeye tam 1 saat düşer: v en büyük değer olan 30 olmalı.')],
    hidden=['1 1\n1\n', '1 1000000000\n1000000000\n', '3 6\n5 5 5\n', '2 3\n10 1\n',
            {'gen': D('''
                import random
                random.seed(132)
                n = 100000
                p = [random.randint(1, 10**9) for _ in range(n)]
                print(n, 3 * n + 12345)
                print(*p)
                ''')},
            {'gen': D('''
                import random
                random.seed(1320)
                n = 100000
                p = [random.randint(1, 10**6) for _ in range(n)]
                print(n, 10**9)
                print(*p)
                ''')}],
    start=D('''
        n, h = map(int, input().split())
        p = list(map(int, input().split()))

        def saat(v):
            # v hızıyla toplam kaç saat gerekir?
            pass

        # 1..max(p) aralığında ikili arama
        '''),
    sol=D('''
        n, h = map(int, input().split())
        p = list(map(int, input().split()))

        def saat(v):
            return sum((x + v - 1) // v for x in p)

        lo, hi = 1, max(p)
        while lo < hi:
            mid = (lo + hi) // 2
            if saat(mid) <= h:
                hi = mid
            else:
                lo = mid + 1
        print(lo)
        '''),
    brute=D('''
        n, h = map(int, input().split()); p = list(map(int, input().split())); v = 1
        while sum((x + v - 1)//v for x in p) > h: v += 1
        print(v)
        '''),
    rnd=lambda r: (lambda n: f"{n} {r.randint(n, 3*n)}\n{ints(r, n, 1, 30)}\n")(r.randint(1, 6)),
    editorial=D('''
        <p><b>Yaklaşım:</b> Cevap üzerinde ikili arama. v hızıyla gereken süre <code>Σ ceil(p/v)</code>; v arttıkça süre azalır (monoton). Bu yüzden "süre ≤ H" koşulunu sağlayan en küçük v ikili aramayla bulunur. Alt sınır 1, üst sınır <code>max(p)</code> (bu hızda her bölge tam 1 saat sürer ve N ≤ H).</p>
        <p><b>Karmaşıklık:</b> O(N · log(max p)) ≈ 10^5 × 30.</p>
        <p><b>Naif çözüm neden yetmez:</b> v\'yi 1\'den başlayıp birer artırmak, cevap 10^9 civarındayken 10^9 deneme × N demektir. Gizli testte cevap çok büyük.</p>
        <p><b>Sık hata:</b> Tavan bölmeyi <code>math.ceil(x / v)</code> ile yapmak (büyük sayılarda kayan nokta hatası riski); tam sayı hilesi <code>(x + v - 1) // v</code> güvenlidir. Bir de <code>lo &lt;= hi</code>/<code>hi = mid - 1</code> karışıklığından doğan sonsuz döngüler.</p>'''),
    hints=['Hız arttıkça gereken saat azalır: monoton bir koşul.', 'Koşulu sağlayan en küçük v için 1..max(p) aralığında ikili ara.']))

# ---------------------------------------------------------------- a-133
P.append(dict(
    id='a-133', title='Maaş bandındaki çalışan sayısı', track=T, diff='Orta',
    tags=['ikili arama', 'sıralama'], src='HackerRank / Codeforces aralık sayma sorguları benzeri',
    statement=D('''
        <p>Pusula İK, şirket genelindeki N çalışanın aylık maaşlarını tutuyor (sırasız). Yöneticiler gün boyunca "maaşı L ile R arasında (ikisi dahil) olan kaç kişi var?" diye soruyor; bu bilgiyle zam bütçesi planlanıyor.</p>
        <p>Her sorgu için aralıktaki çalışan sayısını yazdır.</p>'''),
    input='<p>İlk satırda N ve Q. İkinci satırda N maaş. Sonraki Q satırda L R.</p>',
    output='<p>Her sorgu için bir satır.</p>',
    constraints='1 ≤ N, Q ≤ 10^5, 1 ≤ maaş ≤ 10^9, 1 ≤ L ≤ R ≤ 10^9',
    samples=[('6 3\n42000 35000 50000 35000 90000 61000\n35000 50000\n60000 100000\n1 1000\n',
              '35–50 bin: 35000, 35000, 42000, 50000 → 4. 60–100 bin: 61000, 90000 → 2. Üçüncüde kimse yok.')],
    hidden=['1 2\n5\n5 5\n6 9\n', '4 2\n7 7 7 7\n7 7\n1 6\n', '5 1\n1 2 3 4 5\n1 1000000000\n',
            {'gen': D('''
                import random
                random.seed(133)
                n = q = 100000
                print(n, q)
                print(*[random.randint(1, 10**9) for _ in range(n)])
                out = []
                for _ in range(q):
                    l = random.randint(1, 10**9 // 2); out.append(f'{l} {l + random.randint(0, 10**9 // 2)}')
                print('\\n'.join(out))
                ''')},
            {'gen': D('''
                import random
                random.seed(1330)
                n = q = 100000
                print(n, q)
                print(*[random.randint(1, 100) for _ in range(n)])
                for _ in range(q):
                    l = random.randint(1, 100); print(l, random.randint(l, 100))
                ''')}],
    start=D('''
        import sys
        from bisect import bisect_left, bisect_right
        input = sys.stdin.readline
        n, q = map(int, input().split())
        maas = list(map(int, input().split()))
        # önce sırala, sonra iki bisect farkı
        '''),
    sol=D('''
        import sys
        from bisect import bisect_left, bisect_right
        veri = sys.stdin.read().split()
        n, q = int(veri[0]), int(veri[1])
        maas = sorted(map(int, veri[2:2 + n]))
        cevap = []
        p = 2 + n
        for _ in range(q):
            l, r = int(veri[p]), int(veri[p + 1]); p += 2
            cevap.append(bisect_right(maas, r) - bisect_left(maas, l))
        print('\\n'.join(map(str, cevap)))
        '''),
    brute=D('''
        import sys
        v = sys.stdin.read().split(); n, q = int(v[0]), int(v[1]); a = list(map(int, v[2:2+n])); p = 2+n
        for _ in range(q):
            l, r = int(v[p]), int(v[p+1]); p += 2
            print(sum(1 for x in a if l <= x <= r))
        '''),
    rnd=lambda r: (lambda n: f"{n} 4\n{ints(r, n, 1, 9)}\n" + ''.join((lambda l: f"{l} {r.randint(l, 10)}\n")(r.randint(1, 10)) for _ in range(4)))(r.randint(1, 7)),
    editorial=D('''
        <p><b>Yaklaşım:</b> Maaşları bir kez sırala. Sıralı listede [L, R] aralığındaki eleman sayısı <code>bisect_right(maas, R) - bisect_left(maas, L)</code>: R\'den büyük ilk elemanın konumu eksi L\'den küçük olmayan ilk elemanın konumu.</p>
        <p><b>Karmaşıklık:</b> O(N log N) ön hazırlık + sorgu başına O(log N).</p>
        <p><b>Naif çözüm neden yetmez:</b> Her sorguda tüm maaşları gezip saymak O(N·Q) = 10^10. Değer aralığı 10^9 olduğu için "her maaş değeri için sayaç dizisi + önek toplamı" da bellek açısından mümkün değil (koordinat sıkıştırmasıyla olurdu, ama bisect daha basit).</p>
        <p><b>Sık hata:</b> İki tarafta da <code>bisect_left</code> kullanmak: R\'ye eşit maaşlar sayılmaz. Uçlardan biri dahil, biri hariç olan aralıklarda hangi bisect\'in seçileceğini mutlaka küçük örnekle doğrula.</p>'''),
    hints=['Maaşları bir kez sırala.', 'Sayı = bisect_right(R) − bisect_left(L).']))

# ---------------------------------------------------------------- a-134
P.append(dict(
    id='a-134', title='D günde sevkiyat için en küçük kamyon kapasitesi', track=T, diff='Orta',
    tags=['ikili arama', 'açgözlü'], src='LeetCode 1011 Capacity To Ship Packages Within D Days benzeri',
    statement=D('''
        <p>Anadolu Market\'in Gebze deposundan çıkan N koli bant üzerinde sırayla duruyor (i. kolinin ağırlığı w<sub>i</sub>). Her gün tek bir kamyon, banttaki sıradan <b>sırayı bozmadan</b> koli yükler; kamyon kapasitesini aşacak koli bir sonraki güne kalır.</p>
        <p>Tüm kolilerin en fazla D günde gönderilebilmesi için gereken en küçük kamyon kapasitesini bul.</p>'''),
    input='<p>İlk satırda N ve D. İkinci satırda N ağırlık.</p>',
    output='<p>En küçük kapasite.</p>',
    constraints='1 ≤ D ≤ N ≤ 5·10^4, 1 ≤ w ≤ 500',
    samples=[('10 5\n1 2 3 4 5 6 7 8 9 10\n', 'Kapasite 15: [1..5], [6,7], [8], [9], [10] → 5 gün. 14 ile 6 gün gerekir.'),
             ('4 1\n3 2 2 4\n', 'Tek günde hepsi: 11.')],
    hidden=['1 1\n7\n', '5 5\n4 4 4 4 4\n', '6 3\n3 2 2 4 1 4\n', '5 4\n1 2 3 1 1\n',
            {'gen': D('''
                import random
                random.seed(134)
                n = 50000
                print(n, 37)
                print(*[random.randint(1, 500) for _ in range(n)])
                ''')},
            {'gen': D('''
                import random
                random.seed(1340)
                n = 50000
                print(n, 20000)
                print(*[random.randint(1, 500) for _ in range(n)])
                ''')}],
    start=D('''
        n, d = map(int, input().split())
        w = list(map(int, input().split()))

        def gun_sayisi(kapasite):
            # açgözlü: sığdıkça aynı güne yükle
            pass
        '''),
    sol=D('''
        n, d = map(int, input().split())
        w = list(map(int, input().split()))

        def gun_sayisi(kapasite):
            gun, yuk = 1, 0
            for x in w:
                if yuk + x > kapasite:
                    gun += 1
                    yuk = 0
                yuk += x
            return gun

        lo, hi = max(w), sum(w)
        while lo < hi:
            mid = (lo + hi) // 2
            if gun_sayisi(mid) <= d:
                hi = mid
            else:
                lo = mid + 1
        print(lo)
        '''),
    brute=D('''
        n, d = map(int, input().split()); w = list(map(int, input().split())); c = max(w)
        def g(c):
            gun, y = 1, 0
            for x in w:
                if y + x > c: gun += 1; y = 0
                y += x
            return gun
        while g(c) > d: c += 1
        print(c)
        '''),
    rnd=lambda r: (lambda n: f"{n} {r.randint(1, n)}\n{ints(r, n, 1, 9)}\n")(r.randint(1, 8)),
    editorial=D('''
        <p><b>Yaklaşım:</b> Kapasite sabitse gün sayısı açgözlü hesaplanır: koli sığdıkça aynı güne koy, sığmazsa yeni gün aç. Kapasite arttıkça gün sayısı azalır (monoton), dolayısıyla <code>gun_sayisi(c) ≤ D</code> olan en küçük c, <code>[max(w), sum(w)]</code> aralığında ikili aramayla bulunur. Alt sınır <code>max(w)</code>: en ağır koli sığmalı.</p>
        <p><b>Karmaşıklık:</b> O(N · log(Σw)) ≈ 5·10^4 × 25.</p>
        <p><b>Naif çözüm neden yetmez:</b> Kapasiteyi <code>max(w)</code>\'den birer birer artırmak cevaba kadar (milyonlarca) deneme × N adım demektir. Tüm bölme yollarını denemek ise üsteldir.</p>
        <p><b>Sık hata:</b> Alt sınırı 1 almak (o zaman tek koli bile sığmaz ve açgözlü fonksiyon yanlış sayar) ve sıralamayı bozmak (kolileri sıralamak problemi değiştirir).</p>'''),
    hints=['Sabit kapasite için gün sayısını açgözlü hesapla.', 'Kapasite ↑ ⇒ gün ↓; max(w)..sum(w) arasında ikili ara.']))

# ---------------------------------------------------------------- a-135
P.append(dict(
    id='a-135', title='İstasyonlar arası k. en kısa mesafe', track=T, diff='Zor',
    tags=['ikili arama', 'iki işaretçi', 'sıralama'], src='LeetCode 719 Find K-th Smallest Pair Distance benzeri',
    statement=D('''
        <p>Pedal İzmir, Kordon boyunca düz bir hat üzerinde N bisiklet istasyonu işletiyor; i. istasyonun konumu x<sub>i</sub> metre. Planlama ekibi, tüm istasyon çiftleri arasındaki N(N−1)/2 mesafeyi küçükten büyüğe dizdiğinde <b>k. sıradaki</b> mesafeyi istiyor (servis aracı menzili buna göre seçilecek).</p>
        <p>|x<sub>i</sub> − x<sub>j</sub>| (i &lt; j) değerleri arasında k. en küçüğü yazdır.</p>'''),
    input='<p>İlk satırda N ve k. İkinci satırda N konum (sırasız, tekrar olabilir).</p>',
    output='<p>k. en küçük mesafe.</p>',
    constraints='2 ≤ N ≤ 4·10^4, 1 ≤ k ≤ N(N−1)/2, 0 ≤ x ≤ 10^6',
    samples=[('3 1\n1 3 1\n', 'Mesafeler: 0, 2, 2. En küçüğü 0.'),
             ('4 4\n10 40 20 70\n', 'Mesafeler sıralı: 10, 20, 30, 30, 50, 60. 4. sıradaki 30.')],
    hidden=['2 1\n0 1000000\n', '5 10\n1 2 3 4 5\n', '5 3\n7 7 7 7 7\n', '6 7\n1 6 1 10 3 3\n',
            {'gen': D('''
                import random
                random.seed(135)
                n = 40000
                print(n, n * (n - 1) // 4)
                print(*[random.randint(0, 10**6) for _ in range(n)])
                ''')},
            {'gen': D('''
                import random
                random.seed(1350)
                n = 40000
                print(n, 123456789)
                print(*[random.randint(0, 5000) for _ in range(n)])
                ''')}],
    start=D('''
        from bisect import bisect_right
        n, k = map(int, input().split())
        x = sorted(map(int, input().split()))

        def kac_cift(d):
            # mesafesi <= d olan çift sayısı
            pass
        '''),
    sol=D('''
        from bisect import bisect_right
        n, k = map(int, input().split())
        x = sorted(map(int, input().split()))

        def kac_cift(d):
            return sum(bisect_right(x, v + d) for v in x) - n * (n + 1) // 2

        lo, hi = 0, x[-1] - x[0]
        while lo < hi:
            mid = (lo + hi) // 2
            if kac_cift(mid) >= k:
                hi = mid
            else:
                lo = mid + 1
        print(lo)
        '''),
    brute=D('''
        n, k = map(int, input().split()); x = list(map(int, input().split()))
        print(sorted(abs(x[i]-x[j]) for i in range(n) for j in range(i+1, n))[k-1])
        '''),
    rnd=lambda r: (lambda n: f"{n} {r.randint(1, n*(n-1)//2)}\n{ints(r, n, 0, 20)}\n")(r.randint(2, 8)),
    editorial=D('''
        <p><b>Yaklaşım:</b> Cevabın kendisi üzerinde ikili arama. Konumları sırala. Bir d için "mesafesi ≤ d olan çift sayısı" hızlı sayılabilir: her i için <code>x[i] + d</code>\'yi aşmayan son konum <code>bisect_right</code> (ya da iki işaretçi) ile bulunur; i\'den sonra o konuma kadar olan herkes çift oluşturur. Bu sayı d ile monoton artar; sayının ≥ k olduğu en küçük d cevaptır. Çözümdeki formül, <code>Σ bisect_right(x, v+d)</code>\'den her i için kendisi dahil soldaki <code>i+1</code> elemanı çıkarır: <code>n(n+1)/2</code>.</p>
        <p><b>Karmaşıklık:</b> O(N log N · log(max x)) ≈ 4·10^4 × 15 × 20; iki işaretçili sayımla O(N log(max x)).</p>
        <p><b>Naif çözüm neden yetmez:</b> Tüm mesafeleri üretip sıralamak N=4·10^4 için 8·10^8 çift demek: hem zaman hem bellek (gigabaytlarca) yetmez. Heap ile k kez çekmek de k çok büyük olduğunda (gizli testte ~4·10^8) imkânsız.</p>
        <p><b>Sık hata:</b> Aynı konumlu istasyonları unutmak (mesafe 0 da bir çifttir) ve sayım fonksiyonunda i ile kendisini eşleştirmek.</p>'''),
    hints=['Cevap 0..max−min arasında; "≤ d olan çift sayısı" d ile artar.', 'Sıralı dizide her eleman için x+d\'yi aşmayan son indeksi bisect ile bul.']))

# ---------------------------------------------------------------- a-136
P.append(dict(
    id='a-136', title='Kurye performans sıralaması', track=T, diff='Kolay',
    tags=['sıralama', 'anahtar fonksiyonu'], src='HackerRank Python: Athlete Sort / çok anahtarlı sıralama benzeri',
    statement=D('''
        <p>Lezzet Kurye ay sonunda kuryeleri şu kurallara göre sıralayıp ilan ediyor:</p>
        <ol><li>Müşteri puanı yüksek olan önce,</li><li>puanlar eşitse teslimat sayısı yüksek olan önce,</li><li>o da eşitse adı alfabetik olarak önce gelen önce.</li></ol>
        <p>Sıralanmış listedeki adları yazdır.</p>'''),
    input='<p>İlk satırda N. Sonraki N satırın her birinde <code>ad puan teslimat</code> (ad boşluksuz, küçük İngilizce harfler).</p>',
    output='<p>Her satırda bir ad, sıralanmış hâliyle.</p>',
    constraints='1 ≤ N ≤ 10^5, 0 ≤ puan ≤ 100, 0 ≤ teslimat ≤ 10^4',
    samples=[('4\nali 90 120\nzeynep 95 80\ncan 90 150\nbora 90 120\n',
              'zeynep (95) ilk. 90 puanlılardan can 150 teslimatla önde; ali ve bora eşit, alfabetik: ali, bora.')],
    hidden=['1\ntek 0 0\n', '3\nc 50 5\nb 50 5\na 50 5\n', '3\nx 1 100\ny 2 0\nz 1 101\n',
            {'gen': D('''
                import random
                random.seed(136)
                n = 100000
                print(n)
                h = 'abcdefghij'
                for i in range(n):
                    ad = ''.join(random.choice(h) for _ in range(6))
                    print(ad, random.randint(80, 100), random.randint(0, 50))
                ''')}],
    start=D('''
        import sys
        input = sys.stdin.readline
        n = int(input())
        kuryeler = []
        for _ in range(n):
            ad, puan, teslim = input().split()
            kuryeler.append((ad, int(puan), int(teslim)))
        # key ile sırala
        '''),
    sol=D('''
        import sys
        input = sys.stdin.readline
        n = int(input())
        kuryeler = []
        for _ in range(n):
            ad, puan, teslim = input().split()
            kuryeler.append((ad, int(puan), int(teslim)))
        kuryeler.sort(key=lambda k: (-k[1], -k[2], k[0]))
        print('\\n'.join(k[0] for k in kuryeler))
        '''),
    editorial=D('''
        <p><b>Yaklaşım:</b> Python\'da çok ölçütlü sıralama için anahtar fonksiyonu bir demet döndürür; demetler soldan sağa karşılaştırılır. Azalan sıralanacak sayısal alanların önüne eksi koyarak tek bir <code>sort</code> yeterli olur: <code>key=lambda k: (-puan, -teslimat, ad)</code>.</p>
        <p><b>Karmaşıklık:</b> O(N log N).</p>
        <p><b>Alternatif:</b> Python\'un sıralaması <b>kararlı</b>dır (stable). Önce ada göre artan, sonra teslimata göre azalan, en son puana göre azalan sırala; sonuç aynı olur. Metin alanını azalan sıralamak gerekirse eksi işareti işe yaramaz; o zaman bu kararlı çok geçişli yöntem ya da <code>functools.cmp_to_key</code> kullanılır.</p>
        <p><b>Naif çözüm:</b> Kendi yazdığın kabarcık sıralaması O(N²) = 10^10 karşılaştırma ile gizli testi bitiremez. <b>Sık hata:</b> <code>reverse=True</code> verip adı da ters sıralamak.</p>'''),
    hints=['key bir demet döndürebilir.', 'Azalan sayısal ölçüt için değerin negatifini kullan.']))

# ---------------------------------------------------------------- a-137
P.append(dict(
    id='a-137', title='Kampanya kodundan en büyük sayı', track=T, diff='Orta',
    tags=['sıralama', 'karşılaştırıcı', 'açgözlü'], src='LeetCode 179 Largest Number benzeri',
    statement=D('''
        <p>Anadolu Market, yılbaşı çekilişinde katılımcılara N sayı kartı veriyor. Kartları yan yana dizerek oluşturulan sayının en büyüğünü yapan kişi büyük ödülü kazanıyor. Kartlar döndürülemez veya bölünemez; yalnızca sıraları değiştirilebilir.</p>
        <p>Elde edilebilecek en büyük sayıyı yaz (sonuç yalnız sıfırlardan oluşuyorsa tek bir <code>0</code> yaz).</p>'''),
    input='<p>İlk satırda N. İkinci satırda N negatif olmayan tam sayı.</p>',
    output='<p>En büyük sayı (metin olarak).</p>',
    constraints='1 ≤ N ≤ 2·10^4, 0 ≤ sayı ≤ 10^9',
    samples=[('5\n3 30 34 5 9\n', '"9", "5", "34", "3", "30" sırası 9534330 verir; 30\'u 3\'ün önüne koymak 330 yerine 303 verir.'),
             ('3\n0 0 0\n', 'Sonuç "000" değil, 0.')],
    hidden=['1\n10\n', '2\n10 2\n', '2\n121 12\n', '4\n0 0 1 0\n', '3\n824 8247 82\n', '5\n1000000000 9 99 999 0\n',
            {'gen': D('''
                import random
                random.seed(137)
                n = 20000
                print(n)
                print(*[random.choice([random.randint(0, 99), random.randint(0, 10**9), random.randint(0, 9999)]) for _ in range(n)])
                ''')}],
    start=D('''
        from functools import cmp_to_key
        n = int(input())
        kartlar = input().split()

        def karsilastir(a, b):
            # a+b ile b+a'yı karşılaştır
            pass
        '''),
    sol=D('''
        from functools import cmp_to_key
        n = int(input())
        kartlar = input().split()

        def karsilastir(a, b):
            if a + b > b + a:
                return -1
            if a + b < b + a:
                return 1
            return 0

        kartlar.sort(key=cmp_to_key(karsilastir))
        sonuc = ''.join(kartlar).lstrip('0')
        print(sonuc or '0')
        '''),
    brute=D('''
        from itertools import permutations
        n = int(input()); k = input().split()
        print(int(max(''.join(p) for p in permutations(k))))
        '''),
    rnd=lambda r: (lambda n: f"{n}\n{' '.join(str(r.choice([r.randint(0, 9), r.randint(0, 120)])) for _ in range(n))}\n")(r.randint(1, 6)),
    editorial=D('''
        <p><b>Yaklaşım:</b> İki kartın hangisinin önce gelmesi gerektiğine yalnızca onları yan yana koyarak karar verebilirsin: <code>a+b &gt; b+a</code> ise a önce. Bu karşılaştırma geçişlidir, dolayısıyla <code>functools.cmp_to_key</code> ile sıralama doğru sonucu verir. Sonda baştaki sıfırları temizle; geriye bir şey kalmazsa "0".</p>
        <p><b>Karmaşıklık:</b> O(N log N) karşılaştırma, her biri en fazla ~20 karakter.</p>
        <p><b>Naif çözüm neden yetmez:</b> Tüm permütasyonları denemek N! — 12 kartta bile yarım milyar. Sayısal büyüklüğe göre sıralamak da yanlış: 9 &gt; 34 olmalı ama sayısal olarak değil. Metin olarak ters sıralamak da yanlış: "30" &gt; "3" metin olarak, ama 3 önce gelmeli.</p>
        <p><b>Alternatif:</b> Kart uzunluğu ≤ 10 iken <code>key=lambda s: s * 10</code> ile karşılaştırıcısız ters sıralama da doğru sonuç verir (sonsuz tekrarı karşılaştırmanın kısa yolu), ama gerekçesi daha az açıktır.</p>'''),
    hints=['İki kartı a+b ve b+a olarak birleştirip karşılaştır.', 'Sonuç sıfırla başlıyorsa hepsi sıfırdır.']))

# ---------------------------------------------------------------- a-138
P.append(dict(
    id='a-138', title='Toplantı odası rezervasyonlarını birleştir', track=T, diff='Kolay',
    tags=['aralıklar', 'sıralama'], src='LeetCode 56 Merge Intervals benzeri',
    statement=D('''
        <p>Pusula İK\'nın büyük toplantı salonu için gün içinde N rezervasyon yapılmış; her biri [başlangıç, bitiş] dakika aralığı. Temizlik ekibi salonun hangi zaman bloklarında dolu olduğunu görmek istiyor. Çakışan ya da <b>uç uca değen</b> (biri 60\'ta bitip diğeri 60\'ta başlayan) aralıklar tek blok sayılır.</p>
        <p>Birleştirilmiş blokları başlangıca göre sıralı yazdır.</p>'''),
    input='<p>İlk satırda N. Sonraki N satırda <code>baslangic bitis</code> (baslangic ≤ bitis).</p>',
    output='<p>İlk satırda blok sayısı B, sonraki B satırda <code>baslangic bitis</code>.</p>',
    constraints='1 ≤ N ≤ 10^5, 0 ≤ başlangıç ≤ bitiş ≤ 10^9',
    samples=[('4\n1 3\n8 10\n2 6\n15 18\n', '[1,3] ve [2,6] çakışır → [1,6]. Diğerleri ayrı: 3 blok.'),
             ('2\n1 4\n4 5\n', 'Uç uca değiyorlar: [1,5].')],
    hidden=['1\n5 5\n', '3\n1 10\n2 3\n4 5\n', '3\n5 6\n1 2\n3 4\n', '4\n1 4\n0 0\n0 4\n6 7\n',
            {'gen': D('''
                import random
                random.seed(138)
                n = 100000
                print(n)
                for _ in range(n):
                    s = random.randint(0, 10**9 - 5000)
                    print(s, s + random.randint(0, 5000))
                ''')},
            {'gen': D('''
                import random
                random.seed(1380)
                n = 100000
                print(n)
                for _ in range(n):
                    s = random.randint(0, 10**7)
                    print(s, s + random.randint(0, 300))
                ''')}],
    start=D('''
        import sys
        input = sys.stdin.readline
        n = int(input())
        araliklar = [tuple(map(int, input().split())) for _ in range(n)]
        # başlangıca göre sırala, sonra tek geçişte birleştir
        '''),
    sol=D('''
        import sys
        veri = sys.stdin.read().split()
        n = int(veri[0])
        araliklar = sorted((int(veri[1 + 2 * i]), int(veri[2 + 2 * i])) for i in range(n))
        bloklar = []
        for s, e in araliklar:
            if bloklar and s <= bloklar[-1][1]:
                if e > bloklar[-1][1]:
                    bloklar[-1][1] = e
            else:
                bloklar.append([s, e])
        cikti = [str(len(bloklar))] + [f'{s} {e}' for s, e in bloklar]
        print('\\n'.join(cikti))
        '''),
    brute=D('''
        n = int(input()); iv = [list(map(int, input().split())) for _ in range(n)]
        ch = True
        while ch:
            ch = False
            for i in range(len(iv)):
                for j in range(i+1, len(iv)):
                    a, b = iv[i], iv[j]
                    if a[0] <= b[1] and b[0] <= a[1]:
                        iv[i] = [min(a[0], b[0]), max(a[1], b[1])]; iv.pop(j); ch = True; break
                if ch: break
        iv.sort(); print(len(iv))
        for s, e in iv: print(s, e)
        '''),
    rnd=lambda r: (lambda n: f"{n}\n" + ''.join((lambda s: f"{s} {s + r.randint(0, 3)}\n")(r.randint(0, 15)) for _ in range(n)))(r.randint(1, 7)),
    editorial=D('''
        <p><b>Yaklaşım:</b> Aralıkları başlangıca göre sırala. Sonra soldan geç: mevcut aralığın başlangıcı son bloğun bitişinden küçük ya da eşitse (değme dahil) son bloğu <code>max(bitiş)</code> ile uzat; değilse yeni blok aç.</p>
        <p><b>Karmaşıklık:</b> Sıralama O(N log N) + tek geçiş O(N).</p>
        <p><b>Naif çözüm neden yetmez:</b> Her çifti karşılaştırıp çakışanları birleştire birleştire ilerlemek O(N²) ve üstü; 10^5 rezervasyonda 10^10 karşılaştırma. Dakika dizisi işaretlemek ise 10^9 uzunluğunda bir dizi ister.</p>
        <p><b>Sık hata:</b> Son bloğun bitişini körü körüne yeni bitişle değiştirmek: [1,10] içine düşen [2,3] bloğu [1,3]\'e küçültür. Her zaman <code>max</code> al.</p>'''),
    hints=['Önce başlangıca göre sırala.', 'Yeni başlangıç ≤ son bitiş ise birleştir: son bitiş = max(son bitiş, yeni bitiş).']))

# ---------------------------------------------------------------- a-139
P.append(dict(
    id='a-139', title='Mülakat günü için gereken oda sayısı', track=T, diff='Orta',
    tags=['aralıklar', 'süpürme', 'heap'], src='LeetCode 253 Meeting Rooms II benzeri',
    statement=D('''
        <p>Pusula İK işe alım gününde N mülakat planladı; her mülakat [s, e) yarı açık aralığında sürüyor (e anında oda boşalır, aynı anda başka mülakat başlayabilir). Her mülakat ayrı bir odada yapılmalı.</p>
        <p>Tüm mülakatların çakışmadan yapılabilmesi için gereken <b>en az oda sayısını</b> bul.</p>'''),
    input='<p>İlk satırda N. Sonraki N satırda <code>s e</code> (s &lt; e).</p>',
    output='<p>En az oda sayısı.</p>',
    constraints='1 ≤ N ≤ 10^5, 0 ≤ s &lt; e ≤ 10^9',
    samples=[('3\n0 30\n5 10\n15 20\n', '0–30 mülakatı diğer ikisiyle çakışıyor, ama 5–10 ile 15–20 çakışmıyor: 2 oda.'),
             ('2\n7 10\n2 7\n', 'Biri 7\'de bitiyor, diğeri 7\'de başlıyor: 1 oda yeter.')],
    hidden=['1\n0 1\n', '3\n1 5\n1 5\n1 5\n', '4\n1 2\n2 3\n3 4\n4 5\n', '5\n1 10\n2 7\n3 19\n8 12\n10 20\n',
            {'gen': D('''
                import random
                random.seed(139)
                n = 100000
                print(n)
                for _ in range(n):
                    s = random.randint(0, 10**6)
                    print(s, s + random.randint(1, 50000))
                ''')},
            {'gen': D('''
                n = 100000
                print(n)
                for i in range(n):
                    print(i, 2 * n - i)
                ''')}],
    start=D('''
        import sys
        input = sys.stdin.readline
        n = int(input())
        mulakatlar = [tuple(map(int, input().split())) for _ in range(n)]
        # başlangıçları ve bitişleri ayrı sırala ya da heap kullan
        '''),
    sol=D('''
        import sys
        veri = sys.stdin.read().split()
        n = int(veri[0])
        bas = sorted(int(veri[1 + 2 * i]) for i in range(n))
        bit = sorted(int(veri[2 + 2 * i]) for i in range(n))
        oda = en_cok = 0
        j = 0
        for s in bas:
            while bit[j] <= s:
                j += 1
                oda -= 1
            oda += 1
            if oda > en_cok:
                en_cok = oda
        print(en_cok)
        '''),
    brute=D('''
        n = int(input()); iv = [tuple(map(int, input().split())) for _ in range(n)]
        print(max(sum(1 for s, e in iv if s <= t < e) for t in range(0, 40)))
        '''),
    rnd=lambda r: (lambda n: f"{n}\n" + ''.join((lambda s: f"{s} {s + r.randint(1, 6)}\n")(r.randint(0, 30)) for _ in range(n)))(r.randint(1, 8)),
    editorial=D('''
        <p><b>Yaklaşım (süpürme):</b> Başlangıçları ve bitişleri ayrı ayrı sırala. Başlangıçları sırayla gez; her başlangıçtan önce, bu ana kadar (≤ s) bitmiş mülakatları düşür, sonra yeni mülakatı say. Anlık sayıların en büyüğü cevaptır. Yarı açık aralık yüzünden "bitiş ≤ s" koşulu önemlidir: aynı anda biten oda tekrar kullanılabilir.</p>
        <p><b>Alternatif (heap):</b> Mülakatları başlangıca göre sırala, kullanılan odaların bitiş zamanlarını min-heap\'te tut; en erken biten oda boşaldıysa onu yeniden kullan (<code>heapreplace</code>), yoksa yeni oda aç. Heap\'in son boyutu cevaptır.</p>
        <p><b>Karmaşıklık:</b> İkisi de O(N log N).</p>
        <p><b>Naif çözüm neden yetmez:</b> Her mülakat için diğer tüm mülakatlarla çakışmayı saymak O(N²); zaman ekseninde dakika dakika dizi tutmak ise 10^9 boyut ister.</p>'''),
    hints=['Aynı anda en çok kaç mülakat sürüyor? Cevap bu.', 'Başlangıç ve bitişleri ayrı sırala; bitiş ≤ başlangıç olanları önce düş.']))

# ---------------------------------------------------------------- a-140
P.append(dict(
    id='a-140', title='Çanta kapasitesine göre sipariş eşleştirme', track=T, diff='Kolay',
    tags=['açgözlü', 'sıralama', 'iki işaretçi'], src='LeetCode 455 Assign Cookies benzeri',
    statement=D('''
        <p>Lezzet Kurye\'de akşam yoğunluğunda N kurye ve M sipariş var. i. kuryenin çantası c<sub>i</sub> litre, j. siparişin hacmi v<sub>j</sub> litre. Her kurye en fazla bir sipariş alabilir ve sipariş çantaya sığmalı (v ≤ c).</p>
        <p>Aynı anda en fazla kaç sipariş yola çıkarılabilir?</p>'''),
    input='<p>İlk satırda N ve M. İkinci satırda N çanta kapasitesi, üçüncü satırda M sipariş hacmi.</p>',
    output='<p>En fazla eşleşme sayısı.</p>',
    constraints='1 ≤ N, M ≤ 10^5, 1 ≤ c, v ≤ 10^9',
    samples=[('3 4\n5 2 8\n6 1 3 9\n', '2 litrelik çanta 1\'i, 5 litrelik 3\'ü, 8 litrelik 6\'yı alır: 3 sipariş.'),
             ('2 2\n1 1\n2 3\n', 'Hiçbir sipariş sığmıyor: 0.')],
    hidden=['1 1\n5\n5\n', '3 1\n9 9 9\n1\n', '1 3\n10\n1 2 3\n', '4 4\n1 2 3 4\n2 3 4 5\n',
            {'gen': D('''
                import random
                random.seed(140)
                n = m = 100000
                print(n, m)
                print(*[random.randint(1, 10**9) for _ in range(n)])
                print(*[random.randint(1, 10**9) for _ in range(m)])
                ''')}],
    start=D('''
        n, m = map(int, input().split())
        canta = list(map(int, input().split()))
        siparis = list(map(int, input().split()))
        # ikisini de sırala, küçük siparişi en küçük uygun çantaya ver
        '''),
    sol=D('''
        n, m = map(int, input().split())
        canta = sorted(map(int, input().split()))
        siparis = sorted(map(int, input().split()))
        j = 0
        for c in canta:
            if j < m and siparis[j] <= c:
                j += 1
        print(j)
        '''),
    brute=D('''
        from itertools import permutations
        n, m = map(int, input().split()); c = list(map(int, input().split())); v = list(map(int, input().split()))
        b = 0
        for p in permutations(range(max(n, m)), n):
            b = max(b, sum(1 for i in range(n) if p[i] < m and v[p[i]] <= c[i]))
        print(b)
        '''),
    rnd=lambda r: (lambda n, m: f"{n} {m}\n{ints(r, n, 1, 9)}\n{ints(r, m, 1, 9)}\n")(r.randint(1, 4), r.randint(1, 4)),
    editorial=D('''
        <p><b>Yaklaşım:</b> Açgözlü (greedy). Çantaları ve siparişleri küçükten büyüğe sırala. Çantaları sırayla gez; bekleyen en küçük sipariş bu çantaya sığıyorsa eşleştir. En küçük siparişi, ona yetecek en küçük çantaya vermek büyük çantaları büyük siparişler için saklar; bir değiştirme (exchange) argümanıyla bu seçimin hiçbir zaman kötüleştirmediği gösterilir.</p>
        <p><b>Karmaşıklık:</b> O(N log N + M log M).</p>
        <p><b>Naif çözüm neden yetmez:</b> Tüm atamaları denemek üsteldir; her sipariş için tüm çantaları tarayıp uygun olanı aramak da O(N·M) = 10^10.</p>
        <p><b>Sık hata:</b> En büyük çantaya önce en küçük siparişi vermek: bu, sonradan gelen büyük siparişleri açıkta bırakır.</p>'''),
    hints=['İki listeyi de sırala.', 'Her çanta için bekleyen en küçük sipariş sığıyorsa eşleştir.']))

# ---------------------------------------------------------------- a-141
P.append(dict(
    id='a-141', title='Elektrikli bisikletle en az şarj durağı', track=T, diff='Orta',
    tags=['açgözlü', 'BFS seviyesi'], src='LeetCode 45 Jump Game II benzeri',
    statement=D('''
        <p>Pedal İzmir\'in sahil hattında 0\'dan N−1\'e numaralı N istasyon var. Elektrikli bisiklet i. istasyonda şarj edilirse en fazla a<sub>i</sub> istasyon ileri gidebilir (a<sub>i</sub> = 0 ise o istasyon şarj vermez). Bisikletçi 0. istasyondan başlıyor ve N−1. istasyona ulaşmak istiyor.</p>
        <p>Gereken <b>en az şarj (atlama) sayısını</b> yaz. Ulaşmak mümkün değilse <code>-1</code> yaz. N = 1 ise cevap 0.</p>'''),
    input='<p>İlk satırda N. İkinci satırda N tam sayı a<sub>i</sub>.</p>',
    output='<p>En az atlama sayısı ya da −1.</p>',
    constraints='1 ≤ N ≤ 2·10^5, 0 ≤ a ≤ 10^5',
    samples=[('5\n2 3 1 1 4\n', '0 → 1 → 4: iki atlama.'),
             ('5\n3 2 1 0 4\n', 'Hangi yoldan gidilirse gidilsin 3. istasyonda takılınır: −1.')],
    hidden=['1\n0\n', '2\n0 5\n', '2\n1 0\n', '6\n1 1 1 1 1 1\n', '7\n6 0 0 0 0 0 0\n', '5\n1 2 0 1 0\n',
            {'gen': D('''
                import random
                random.seed(141)
                n = 200000
                print(n)
                print(*[random.randint(1, 20) for _ in range(n)])
                ''')},
            {'gen': D('''
                n = 200000
                print(n)
                print(*([1] * n))
                ''')},
            {'gen': D('''
                import random
                random.seed(1410)
                n = 200000
                a = [random.randint(1, 30) for _ in range(n)]
                for i in range(150000, 150030):
                    a[i] = 0
                for i in range(149970, 150000):
                    a[i] = min(a[i], 150000 - i)
                print(n)
                print(*a)
                ''')}],
    start=D('''
        n = int(input())
        a = list(map(int, input().split()))
        # mevcut seviyenin sonunu ve ulaşılabilecek en uzak noktayı tut
        '''),
    sol=D('''
        n = int(input())
        a = list(map(int, input().split()))
        atlama = 0
        seviye_sonu = 0
        en_uzak = 0
        cevap = 0
        if n > 1:
            cevap = -1
            for i in range(n - 1):
                if i > en_uzak:
                    break
                if i + a[i] > en_uzak:
                    en_uzak = i + a[i]
                if i == seviye_sonu:
                    atlama += 1
                    seviye_sonu = en_uzak
                    if seviye_sonu >= n - 1:
                        cevap = atlama
                        break
        print(cevap)
        '''),
    brute=D('''
        n = int(input()); a = list(map(int, input().split()))
        INF = 10**9; d = [INF]*n; d[0] = 0
        for i in range(n):
            if d[i] == INF: continue
            for j in range(i+1, min(n, i+a[i]+1)): d[j] = min(d[j], d[i]+1)
        print(d[-1] if d[-1] < INF else -1)
        '''),
    rnd=lambda r: (lambda n: f"{n}\n{ints(r, n, 0, 3)}\n")(r.randint(1, 9)),
    editorial=D('''
        <p><b>Yaklaşım:</b> Bunu seviyeli bir BFS gibi düşün: k atlamayla ulaşılabilen istasyonlar ardışık bir aralık oluşturur. Soldan geçerken bu aralığın sonunu (<code>seviye_sonu</code>) ve şu ana dek görülen en uzak erişimi (<code>en_uzak</code>) tut. <code>i</code> seviye sonuna gelince bir atlama daha yapmak zorundasın; yeni seviye sonu <code>en_uzak</code> olur. <code>i &gt; en_uzak</code> olursa o istasyona hiç ulaşılamıyordur: −1.</p>
        <p><b>Karmaşıklık:</b> O(N) zaman, O(1) bellek.</p>
        <p><b>Naif çözüm neden yetmez:</b> DP ile her i\'den ulaşılabilen tüm j\'leri güncellemek O(N · max a) — gizli testte 2·10^5 × 10^5\'e kadar. Özyinelemeli "tüm yolları dene" ise üsteldir.</p>
        <p><b>Sık hata:</b> Döngüyü son istasyonu da kapsayacak şekilde çalıştırıp fazladan bir atlama saymak ve ulaşılamazlık kontrolünü unutmak.</p>'''),
    hints=['k atlamayla ulaşılabilen istasyonlar bir aralık oluşturur.', 'i aralığın sonuna gelince atlama sayısını artır ve aralığı en_uzak\'a genişlet.']))

# ---------------------------------------------------------------- a-142
P.append(dict(
    id='a-142', title='Adil performans primi dağıtımı', track=T, diff='Zor',
    tags=['açgözlü', 'iki geçiş'], src='LeetCode 135 Candy benzeri',
    statement=D('''
        <p>Pusula İK, üretim bandında yan yana çalışan N kişiye prim kuponu dağıtacak. Kurallar:</p>
        <ul><li>Herkes en az 1 kupon alır.</li><li>Bir çalışanın performans puanı <b>yanındaki komşusundan</b> kesinlikle yüksekse, o komşudan daha fazla kupon almalıdır.</li></ul>
        <p>Eşit puanlı komşular arasında bir kısıt yoktur. Kurallara uyan en az toplam kupon sayısını bul.</p>'''),
    input='<p>İlk satırda N. İkinci satırda N performans puanı.</p>',
    output='<p>En az toplam kupon.</p>',
    constraints='1 ≤ N ≤ 2·10^5, 0 ≤ puan ≤ 10^9',
    samples=[('3\n1 0 2\n', 'Kuponlar 2, 1, 2: toplam 5.'),
             ('3\n1 2 2\n', 'Kuponlar 1, 2, 1: üçüncü kişi ikinciyle eşit, fazlasını almak zorunda değil. Toplam 4.')],
    hidden=['1\n7\n', '5\n1 2 3 4 5\n', '5\n5 4 3 2 1\n', '7\n1 3 4 5 2 2 1\n', '6\n1 6 10 8 7 3\n', '4\n2 2 2 2\n',
            {'gen': D('''
                import random
                random.seed(142)
                n = 200000
                print(n)
                print(*[random.randint(0, 100) for _ in range(n)])
                ''')},
            {'gen': D('''
                n = 200000
                print(n)
                print(*(list(range(100000)) + list(range(100000, 0, -1))))
                ''')}],
    start=D('''
        n = int(input())
        p = list(map(int, input().split()))
        kupon = [1] * n
        # soldan sağa, sonra sağdan sola geç
        '''),
    sol=D('''
        n = int(input())
        p = list(map(int, input().split()))
        kupon = [1] * n
        for i in range(1, n):
            if p[i] > p[i - 1]:
                kupon[i] = kupon[i - 1] + 1
        for i in range(n - 2, -1, -1):
            if p[i] > p[i + 1] and kupon[i] <= kupon[i + 1]:
                kupon[i] = kupon[i + 1] + 1
        print(sum(kupon))
        '''),
    brute=D('''
        n = int(input()); p = list(map(int, input().split())); k = [1]*n
        ch = True
        while ch:
            ch = False
            for i in range(n):
                for j in (i-1, i+1):
                    if 0 <= j < n and p[i] > p[j] and k[i] <= k[j]: k[i] = k[j] + 1; ch = True
        print(sum(k))
        '''),
    rnd=lambda r: (lambda n: f"{n}\n{ints(r, n, 0, 4)}\n")(r.randint(1, 9)),
    editorial=D('''
        <p><b>Yaklaşım:</b> Kuralı iki yöne ayır. Soldan sağa geçişte yalnızca sol komşu kuralını sağla: puan soldakinden yüksekse <code>kupon[i] = kupon[i-1] + 1</code>. Sağdan sola geçişte sağ komşu kuralını sağla, ama önceki değeri bozmamak için <code>max</code> mantığıyla (yalnız gerekirse artır). İki geçişten sonra her iki kural da sağlanır ve her değer kendi gereken alt sınırına eşittir; bu yüzden toplam en küçüktür.</p>
        <p><b>Karmaşıklık:</b> O(N) zaman, O(N) bellek. (Eğim sayarak O(1) bellekli bir sürüm de vardır.)</p>
        <p><b>Naif çözüm neden yetmez:</b> "Kural ihlali kalmayana dek düzelt" döngüsü uzun azalan dizilerde O(N²) tur atar; gizli testteki 10^5 uzunluğunda inen bölümde 10^10 adıma çıkar.</p>
        <p><b>Sık hata:</b> İkinci geçişte <code>kupon[i] = kupon[i+1] + 1</code> diye koşulsuz atamak; soldan gelen daha büyük değeri ezersin. Bir de eşit puanlıları da artırmak (kural yalnız "kesinlikle yüksek" için).</p>'''),
    hints=['Sol komşu ve sağ komşu kurallarını ayrı geçişlerde sağla.', 'İkinci geçişte yalnız gerekiyorsa artır (max mantığı).']))

# ---------------------------------------------------------------- a-143
P.append(dict(
    id='a-143', title='Eşi olmayan biniş kartı', track=T, diff='Kolay',
    tags=['bit işlemleri', 'XOR'], src='LeetCode 136 Single Number benzeri',
    statement=D('''
        <p>Kanat Havayolları\'nda her yolcunun biniş kartı hem kapıda hem uçak kapısında okutuluyor; yani her kart numarası kayıtlarda <b>tam iki kez</b> görünmeli. Bir yolcu ise kapıda okutulduğu hâlde uçağa binmemiş: onun numarası yalnız <b>bir kez</b> var.</p>
        <p>Tek kez görünen kart numarasını bul. Ek bellek kullanmadan çözmeye çalış.</p>'''),
    input='<p>İlk satırda N (tek sayı). İkinci satırda N kart numarası (sırasız).</p>',
    output='<p>Tek kez görünen numara.</p>',
    constraints='1 ≤ N ≤ 2·10^5 + 1, 0 ≤ numara ≤ 10^9',
    samples=[('5\n4 1 2 1 2\n', '1 ve 2 ikişer kez var; 4 tek: cevap 4.')],
    hidden=['1\n0\n', '3\n7 7 1000000000\n', '7\n9 3 9 5 5 3 0\n', '5\n0 6 0 8 8\n',
            {'gen': D('''
                import random
                random.seed(143)
                k = 100000
                v = random.sample(range(10**9), k + 1)
                a = v[:k] * 2 + [v[k]]
                random.shuffle(a)
                print(len(a))
                print(*a)
                ''')}],
    start=D('''
        n = int(input())
        kartlar = list(map(int, input().split()))
        sonuc = 0
        # XOR'un x ^ x = 0 özelliğini kullan
        '''),
    sol=D('''
        n = int(input())
        kartlar = list(map(int, input().split()))
        sonuc = 0
        for k in kartlar:
            sonuc ^= k
        print(sonuc)
        '''),
    brute=D('''
        from collections import Counter
        n = int(input()); c = Counter(input().split())
        print([k for k, v in c.items() if v == 1][0])
        '''),
    rnd=lambda r: (lambda v: (lambda a: f"{len(a)}\n{' '.join(map(str, a))}\n")(r.sample(v[:-1] * 2, 2 * (len(v) - 1)) + [v[-1]]))(r.sample(range(50), r.randint(1, 5))),
    editorial=D('''
        <p><b>Yaklaşım:</b> XOR (<code>^</code>) işleminin özellikleri: <code>x ^ x = 0</code>, <code>x ^ 0 = x</code> ve değişme/birleşme özelliği. Tüm numaraları XOR\'larsan çiftler birbirini sıfırlar, geriye tek kalan numara kalır.</p>
        <p><b>Karmaşıklık:</b> O(N) zaman, O(1) ek bellek. Python\'da tek satırda: <code>functools.reduce(operator.xor, kartlar)</code>.</p>
        <p><b>Naif çözüm:</b> Her numara için <code>list.count</code> çağırmak O(N²) = 4·10^10; gizli testte biter mi bitmez mi bekletir. <code>Counter</code> veya <code>set</code> ile O(N) zaman ama O(N) bellek kullanılır; mülakatta beklenen O(1) bellek çözümü XOR\'dur.</p>
        <p><b>Uzmanlaş:</b> "Biri bir kez, diğerleri üç kez" varyantında her bit konumunun toplamını 3\'e göre mod alarak çözersin.</p>'''),
    hints=['x ^ x = 0 ve x ^ 0 = x.', 'Hepsini XOR\'la.']))

# ---------------------------------------------------------------- a-144
P.append(dict(
    id='a-144', title='Yetki bayraklarının toplam farkı', track=T, diff='Orta',
    tags=['bit işlemleri', 'sayma'], src='LeetCode 477 Total Hamming Distance benzeri',
    statement=D('''
        <p>Ilgaz Bank\'ın iç sistemlerinde her kullanıcının yetkileri 30 bitlik bir maske ile tutuluyor (her bit bir yetki). Güvenlik ekibi, yetki dağılımının ne kadar çeşitli olduğunu ölçmek için tüm kullanıcı çiftleri arasındaki <b>Hamming mesafelerinin</b> (farklı bit sayısı) toplamını istiyor.</p>
        <p>Σ<sub>i&lt;j</sub> popcount(m<sub>i</sub> XOR m<sub>j</sub>) değerini yazdır.</p>'''),
    input='<p>İlk satırda N. İkinci satırda N maske (onluk tabanda).</p>',
    output='<p>Toplam mesafe.</p>',
    constraints='1 ≤ N ≤ 10^5, 0 ≤ maske &lt; 2^30',
    samples=[('3\n4 14 2\n', '4=0100, 14=1110, 2=0010. Mesafeler: (4,14)=2, (4,2)=2, (14,2)=2 → 6.')],
    hidden=['1\n5\n', '2\n0 1073741823\n', '4\n7 7 7 7\n', '4\n1 2 4 8\n',
            {'gen': D('''
                import random
                random.seed(144)
                n = 100000
                print(n)
                print(*[random.randint(0, 2**30 - 1) for _ in range(n)])
                ''')}],
    start=D('''
        n = int(input())
        m = list(map(int, input().split()))
        # her bit konumu için kaç maskede 1 olduğunu say
        '''),
    sol=D('''
        n = int(input())
        m = list(map(int, input().split()))
        toplam = 0
        for b in range(30):
            birler = sum((x >> b) & 1 for x in m)
            toplam += birler * (n - birler)
        print(toplam)
        '''),
    brute=D('''
        n = int(input()); m = list(map(int, input().split()))
        print(sum(bin(m[i] ^ m[j]).count('1') for i in range(n) for j in range(i+1, n)))
        '''),
    rnd=lambda r: (lambda n: f"{n}\n{ints(r, n, 0, 63)}\n")(r.randint(1, 8)),
    editorial=D('''
        <p><b>Yaklaşım:</b> Toplamı bit bit ayır. Belirli bir b bitinde, o biti 1 olan <code>birler</code> kişi ile 0 olan <code>n - birler</code> kişiden oluşan her çift tam 1 fark üretir; aynı değerdeki çiftler 0 üretir. Bu yüzden b bitinin katkısı <code>birler × (n − birler)</code>. 30 biti topla.</p>
        <p><b>Karmaşıklık:</b> O(30 · N), bellek O(1).</p>
        <p><b>Naif çözüm neden yetmez:</b> Tüm çiftleri XOR\'layıp bit saymak N(N−1)/2 ≈ 5·10^9 çift; CPython\'da saatler sürer.</p>
        <p><b>İpucu/Bit işlemleri:</b> <code>(x &gt;&gt; b) &amp; 1</code> x\'in b. bitini verir. Python 3.10+ <code>int.bit_count()</code> popcount\'u hızlı hesaplar. Bu "katkı tekniği" (her bileşenin cevaba katkısını ayrı say) birçok çift-toplamı sorusunda işe yarar.</p>'''),
    hints=['Her bit konumunu ayrı düşün.', 'O bitte 1 olan k kişi varsa katkı k·(n−k).']))

# ---------------------------------------------------------------- a-145
P.append(dict(
    id='a-145', title='Biniş sırasındaki ihlaller', track=T, diff='Zor',
    tags=['sıralama', 'böl ve yönet', 'merge sort'], src='HackerRank Merge Sort: Counting Inversions benzeri',
    statement=D('''
        <p>Kanat Havayolları\'nda yolcular grup numarası küçükten büyüğe doğru uçağa binmeli. Kapıda okutulan gerçek sıraya bakan operasyon ekibi, düzensizliği ölçmek için <b>ihlal sayısını</b> hesaplıyor: önce binen yolcunun grup numarası sonra binenden <b>kesinlikle büyükse</b> bu çift bir ihlaldir.</p>
        <p>i &lt; j ve a<sub>i</sub> &gt; a<sub>j</sub> olan çift sayısını yaz.</p>'''),
    input='<p>İlk satırda N. İkinci satırda N grup numarası (biniş sırasıyla).</p>',
    output='<p>İhlal sayısı.</p>',
    constraints='1 ≤ N ≤ 10^5, 1 ≤ a ≤ 10^9',
    samples=[('5\n2 4 1 3 5\n', 'İhlaller: (2,1), (4,1), (4,3) → 3.'),
             ('4\n3 3 3 3\n', 'Eşitler ihlal sayılmaz: 0.')],
    hidden=['1\n1\n', '2\n2 1\n', '5\n5 4 3 2 1\n', '6\n1 1 2 2 1 1\n', '6\n10 1 9 2 8 3\n',
            {'gen': D('''
                import random
                random.seed(145)
                n = 100000
                print(n)
                print(*[random.randint(1, 10**9) for _ in range(n)])
                ''')},
            {'gen': D('''
                n = 100000
                print(n)
                print(*range(n, 0, -1))
                ''')}],
    start=D('''
        n = int(input())
        a = list(map(int, input().split()))

        def say_ve_sirala(dizi):
            # dizi'yi sıralanmış hâliyle ve içindeki ihlal sayısıyla döndür
            pass
        '''),
    sol=D('''
        n = int(input())
        a = list(map(int, input().split()))

        def say_ve_sirala(dizi):
            if len(dizi) <= 1:
                return dizi, 0
            orta = len(dizi) // 2
            sol, x = say_ve_sirala(dizi[:orta])
            sag, y = say_ve_sirala(dizi[orta:])
            birlesik = []
            i = j = 0
            sayac = x + y
            ls, rs = len(sol), len(sag)
            while i < ls and j < rs:
                if sol[i] <= sag[j]:
                    birlesik.append(sol[i]); i += 1
                else:
                    birlesik.append(sag[j]); j += 1
                    sayac += ls - i
            birlesik.extend(sol[i:])
            birlesik.extend(sag[j:])
            return birlesik, sayac

        print(say_ve_sirala(a)[1])
        '''),
    brute=D('''
        n = int(input()); a = list(map(int, input().split()))
        print(sum(1 for i in range(n) for j in range(i+1, n) if a[i] > a[j]))
        '''),
    rnd=lambda r: (lambda n: f"{n}\n{ints(r, n, 1, 5)}\n")(r.randint(1, 10)),
    editorial=D('''
        <p><b>Yaklaşım:</b> Merge sort\'u sayaçla zenginleştir. Diziyi ikiye böl, her yarıdaki ihlalleri özyinelemeyle say ve sırala. Birleştirirken sağ yarıdan bir eleman alındığında (sol[i] &gt; sag[j]), sol yarıda henüz alınmamış <code>ls − i</code> elemanın hepsi ondan büyüktür: hepsi ihlaldir. Eşitlikte soldakini önce almak (<code>&lt;=</code>) eşit çiftlerin sayılmamasını sağlar.</p>
        <p><b>Karmaşıklık:</b> O(N log N) zaman, O(N) bellek; özyineleme derinliği yalnız log N.</p>
        <p><b>Naif çözüm neden yetmez:</b> Çift döngü O(N²) = 5·10^9 karşılaştırma. Ters sıralı 10^5 elemanlık gizli testte cevap ~5·10^9\'dur ve saymak bile saatler sürer.</p>
        <p><b>Alternatif:</b> Değerleri sıkıştırıp Fenwick ağacı (BIT) ile "benden önce gelip benden büyük olanları" saymak da O(N log N)\'dir. <b>Sık hata:</b> Birleştirmede <code>&lt;</code> kullanıp eşit değerleri ihlal saymak.</p>'''),
    hints=['Merge sort\'un birleştirme adımında say.', 'Sağdan bir eleman alındığında soldaki kalan eleman sayısı kadar ihlal ekle.']))

EXTRA = {
    'a-122': ['2 3\n0 1000000000\n0 5 1000000000\n'],
    'a-123': ['6 3\n-1 -2 -3 -4 -5 -6\n1 6\n3 4\n6 6\n', '2 2\n7 -7\n1 2\n2 2\n'],
    'a-124': ['6 6\n1 2 3 4 5 6\n'],
    'a-131': ['5 5\n2 4 6 8 10\n1\n3\n10\n11\n1000000000\n', '2 1\n0 1000000000\n1000000000\n'],
    'a-133': ['5 3\n10 20 30 40 50\n15 15\n20 40\n50 1000000000\n', '3 2\n1000000000 1 1\n1 1\n1000000000 1000000000\n'],
    'a-136': ['2\nzz 100 10000\naa 0 0\n', '4\nmert 70 3\nmert 70 3\nayse 70 4\nbaris 71 0\n'],
    'a-140': ['5 3\n1 1 1 1 1\n1 1 2\n'],
    'a-143': ['3\n1000000000 5 5\n'],
    'a-144': ['3\n1 1 0\n', '5\n0 0 0 0 1073741823\n'],
}
for _p in P:
    _p['hidden'] = _p['hidden'][:-1] + EXTRA.get(_p['id'], []) + _p['hidden'][-1:] if False else _p['hidden'] + EXTRA.get(_p['id'], [])
    assert len(_p['hidden']) >= 6, (_p['id'], len(_p['hidden']))
