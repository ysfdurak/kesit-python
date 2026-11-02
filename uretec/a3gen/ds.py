from build import D

T = 'Veri yapıları'
P = []


def ints(r, n, lo, hi):
    return ' '.join(str(r.randint(lo, hi)) for _ in range(n))


DUGUM = D('''
    class Dugum:
        def __init__(self, deger, sonraki=None):
            self.deger = deger
            self.sonraki = sonraki
    ''')

LL_HELP = D('''
    def _kur(degerler):
        bas = None
        for v in reversed(degerler):
            bas = Dugum(v, bas)
        return bas

    def _liste(bas, sinir=10**6):
        out = []
        while bas is not None and len(out) < sinir:
            out.append(bas.deger)
            bas = bas.sonraki
        return out

    def _dugumler(bas):
        out = []
        while bas is not None:
            out.append(bas)
            bas = bas.sonraki
        return out
    ''')

# ---------------------------------------------------------------- a-146
P.append(dict(
    id='a-146', title='Fatura şablonunda parantez dengesi', track=T, diff='Kolay',
    tags=['yığın', 'stack'], src='LeetCode 20 Valid Parentheses benzeri',
    statement=D('''
        <p>Ilgaz Bank\'ın fatura şablon motoru, alanları <code>( )</code>, <code>[ ]</code> ve <code>{ }</code> ile iç içe gruplayarak tanımlıyor. Bir şablonun geçerli sayılması için her açılan parantez <b>aynı türden</b> bir kapanışla, <b>doğru sırada</b> kapanmalı.</p>
        <p>Her şablon için geçerliyse <code>EVET</code>, değilse <code>HAYIR</code> yaz.</p>'''),
    input='<p>İlk satırda Q. Sonraki Q satırın her biri yalnız <code>()[]{}</code> karakterlerinden oluşan boş olmayan bir metin.</p>',
    output='<p>Her satır için <code>EVET</code> ya da <code>HAYIR</code>.</p>',
    constraints='1 ≤ Q ≤ 10, her metin ≤ 2·10^5 karakter',
    samples=[('4\n()[]{}\n([{}])\n(]\n([)]\n', 'İlk ikisi düzgün kapanıyor. "(]" tür uyuşmazlığı, "([)]" sıra hatası.'),
             ('2\n((\n))\n', 'İlki kapanmadan bitiyor, ikincisi açılmadan kapanıyor.')],
    hidden=['1\n(\n', '1\n)\n', '1\n{[]}\n', '3\n[\n]\n[]\n', '2\n{{{{}}}}\n{{{{}}}\n', '1\n()(())((()))[]\n',
            {'gen': D('''
                import random
                random.seed(146)
                def uret(n):
                    s, st = [], []
                    for _ in range(n):
                        if st and random.random() < 0.5:
                            s.append(st.pop())
                        else:
                            a, b = random.choice(['()', '[]', '{}'])
                            s.append(a); st.append(b)
                    return ''.join(s) + ''.join(reversed(st))
                a = uret(100000)
                print(3)
                print(a)
                print(a[:-1])
                print(a[:50000] + ')' + a[50000:])
                ''')}],
    start=D('''
        import sys
        satirlar = sys.stdin.read().split()
        q = int(satirlar[0])
        eslik = {')': '(', ']': '[', '}': '{'}
        for s in satirlar[1:q + 1]:
            yigin = []
            # açılışları yığına koy, kapanışta tepeyle eşleştir
        '''),
    sol=D('''
        import sys
        satirlar = sys.stdin.read().split()
        q = int(satirlar[0])
        eslik = {')': '(', ']': '[', '}': '{'}
        cevap = []
        for s in satirlar[1:q + 1]:
            yigin = []
            ok = True
            for c in s:
                if c in eslik:
                    if not yigin or yigin.pop() != eslik[c]:
                        ok = False
                        break
                else:
                    yigin.append(c)
            cevap.append('EVET' if ok and not yigin else 'HAYIR')
        print('\\n'.join(cevap))
        '''),
    brute=D('''
        import sys
        v = sys.stdin.read().split()
        for s in v[1:]:
            while '()' in s or '[]' in s or '{}' in s:
                s = s.replace('()', '').replace('[]', '').replace('{}', '')
            print('EVET' if not s else 'HAYIR')
        '''),
    rnd=lambda r: '3\n' + '\n'.join(''.join(r.choice('()[]') for _ in range(r.randint(1, 8))) for _ in range(3)) + '\n',
    editorial=D('''
        <p><b>Yaklaşım:</b> Yığın (stack) son giren ilk çıkar (LIFO) mantığıyla çalışır; iç içe yapının en içteki açılışı ilk kapanmalıdır. Açılışları yığına it; kapanış gelince yığının tepesindeki açılış aynı türden olmalı, değilse ya da yığın boşsa geçersiz. Sonda yığın boş kalmalı.</p>
        <p><b>Karmaşıklık:</b> O(n) zaman, en kötü O(n) bellek. Python\'da liste <code>append</code>/<code>pop</code> ile mükemmel bir yığındır.</p>
        <p><b>Naif çözüm neden yetmez:</b> "İçinde () [] {} kaldıkça sil" döngüsü her turda metni yeniden kurar: O(n²). Derin iç içe 10^5\'lik bir şablonda on binlerce tur demek. Sadece açılış/kapanış <b>sayılarını</b> karşılaştırmak ise "([)]" gibi sıra hatalarını yakalayamaz.</p>
        <p><b>Sık hata:</b> Sonda yığının boş olup olmadığını kontrol etmemek ("((" geçerli sanılır) ya da boş yığından <code>pop</code> yapıp <code>IndexError</code> almak.</p>'''),
    hints=['Açılışları bir listeye ekle (push).', 'Kapanışta tepeyi çıkar ve türünü kontrol et; sonda liste boş olmalı.']))

# ---------------------------------------------------------------- a-147
P.append(dict(
    id='a-147', title='Sipariş kuyruğu simülasyonu', track=T, diff='Kolay',
    tags=['kuyruk', 'deque'], src='HackerRank Queue using Two Stacks / collections.deque benzeri',
    statement=D('''
        <p>Lezzet Kurye\'nin mutfak ekranı siparişleri geliş sırasıyla işliyor (ilk gelen ilk çıkar). Aşağıdaki komutları sırayla uygula:</p>
        <ul><li><code>EKLE x</code>: x numaralı siparişi kuyruğun sonuna ekle.</li>
        <li><code>TESLIM</code>: kuyruğun başındaki siparişi çıkar ve numarasını yaz; kuyruk boşsa <code>BOS</code> yaz.</li>
        <li><code>SIRADAKI</code>: baştaki siparişi çıkarmadan yaz; boşsa <code>BOS</code>.</li>
        <li><code>SAY</code>: kuyrukta kaç sipariş olduğunu yaz.</li></ul>'''),
    input='<p>İlk satırda Q, sonraki Q satırda birer komut.</p>',
    output='<p>EKLE dışındaki her komut için bir satır.</p>',
    constraints='1 ≤ Q ≤ 2·10^5, 1 ≤ x ≤ 10^9',
    samples=[('7\nEKLE 5\nEKLE 8\nSIRADAKI\nTESLIM\nSAY\nTESLIM\nTESLIM\n', 'Önce 5 geldi: SIRADAKI 5, TESLIM 5, kalan 1, TESLIM 8, sonra kuyruk boş.')],
    hidden=['1\nSAY\n', '2\nTESLIM\nSIRADAKI\n', '4\nEKLE 1\nEKLE 1\nTESLIM\nSIRADAKI\n', '5\nEKLE 3\nTESLIM\nEKLE 4\nSAY\nSIRADAKI\n',
            '3\nEKLE 1000000000\nSAY\nTESLIM\n',
            {'gen': D('''
                import random
                random.seed(147)
                q = 200000
                print(q)
                out = []
                for i in range(q):
                    if i < 120000:
                        out.append('EKLE ' + str(random.randint(1, 10**9)) if random.random() < 0.85 else random.choice(['SAY', 'SIRADAKI']))
                    else:
                        out.append(random.choice(['TESLIM', 'TESLIM', 'TESLIM', 'SAY', 'SIRADAKI']))
                print('\\n'.join(out))
                ''')}],
    start=D('''
        import sys
        from collections import deque
        input = sys.stdin.readline
        q = int(input())
        kuyruk = deque()
        for _ in range(q):
            komut = input().split()
            # komutu işle
        '''),
    sol=D('''
        import sys
        from collections import deque
        satirlar = sys.stdin.read().split('\\n')
        q = int(satirlar[0])
        kuyruk = deque()
        cikti = []
        for k in range(1, q + 1):
            komut = satirlar[k].split()
            if komut[0] == 'EKLE':
                kuyruk.append(komut[1])
            elif komut[0] == 'TESLIM':
                cikti.append(kuyruk.popleft() if kuyruk else 'BOS')
            elif komut[0] == 'SIRADAKI':
                cikti.append(kuyruk[0] if kuyruk else 'BOS')
            else:
                cikti.append(str(len(kuyruk)))
        print('\\n'.join(cikti))
        '''),
    brute=D('''
        q = int(input()); k = []
        for _ in range(q):
            c = input().split()
            if c[0] == 'EKLE': k.append(c[1])
            elif c[0] == 'TESLIM': print(k.pop(0) if k else 'BOS')
            elif c[0] == 'SIRADAKI': print(k[0] if k else 'BOS')
            else: print(len(k))
        '''),
    rnd=lambda r: (lambda q: f"{q}\n" + ''.join(r.choice([f'EKLE {r.randint(1, 9)}\n', 'TESLIM\n', 'SIRADAKI\n', 'SAY\n']) for _ in range(q)))(r.randint(1, 10)),
    editorial=D('''
        <p><b>Yaklaşım:</b> İlk giren ilk çıkar (FIFO) yapısı kuyruktur. Python\'da <code>collections.deque</code> iki uçtan da O(1) ekleme/çıkarma yapar: <code>append</code> ile sona ekle, <code>popleft</code> ile baştan al, <code>[0]</code> ile baştakine bak.</p>
        <p><b>Karmaşıklık:</b> Komut başına O(1), toplam O(Q).</p>
        <p><b>Naif çözüm neden yetmez:</b> Listeyle <code>liste.pop(0)</code> her seferinde tüm elemanları bir sola kaydırır: O(n). Kuyrukta 10^5 sipariş varken 8·10^4 TESLIM komutu ~4·10^9 eleman kaydırması demektir. (Liste ile "baş indeksi" tutarak da O(1) yapılabilir, ama bellek geri verilmez.)</p>
        <p><b>Sık hata:</b> Boş kuyrukta <code>popleft</code> çağırıp <code>IndexError</code> almak ve SAY çıktısını sayı yerine liste olarak yazdırmak. Mülakat varyantı: iki yığınla kuyruk (biri gelen, biri giden) da amortize O(1)\'dir.</p>'''),
    hints=['collections.deque kullan.', 'TESLIM ve SIRADAKI\'de önce boş mu diye bak.']))

# ---------------------------------------------------------------- a-148
P.append(dict(
    id='a-148', title='Hediye çekine tam uyan iki ürün', track=T, diff='Kolay',
    tags=['hash', 'sözlük'], src='LeetCode 1 Two Sum benzeri',
    statement=D('''
        <p>Anadolu Market\'te bir müşterinin K TL\'lik hediye çeki var ve sepetine <b>tutarı tam K olan iki farklı ürün</b> eklemek istiyor. Ürünler raf sırasıyla 1\'den N\'ye numaralı, i. ürünün fiyatı a<sub>i</sub>.</p>
        <p>a<sub>i</sub> + a<sub>j</sub> = K ve i &lt; j olan bir çift bul. Birden çok çift varsa <b>j\'si en küçük</b> olanı, o da eşitse <b>i\'si en küçük</b> olanı seç. Çift yoksa <code>YOK</code> yaz.</p>'''),
    input='<p>İlk satırda N ve K. İkinci satırda N fiyat.</p>',
    output='<p><code>i j</code> (1 tabanlı) ya da <code>YOK</code>.</p>',
    constraints='2 ≤ N ≤ 2·10^5, 1 ≤ a, K ≤ 2·10^9',
    samples=[('5 9\n2 7 11 15 7\n', 'j=2 için 2+7=9 bulunur: 1 2.'),
             ('4 10\n5 3 6 5\n', 'j=3\'te 3 ile eşleşecek 7 yok; ilk uygun j=4: 5+5 → 1 4.')],
    hidden=['2 4\n2 2\n', '2 5\n2 2\n', '3 6\n3 3 3\n', '6 100\n1 2 3 4 5 6\n', '5 8\n4 1 7 4 1\n',
            {'gen': D('''
                import random
                random.seed(148)
                n = 200000
                a = [random.randint(1, 10**9) * 2 for _ in range(n)]
                print(n, 999999999)
                print(*a)
                ''')},
            {'gen': D('''
                import random
                random.seed(1480)
                n = 200000
                a = [random.randint(1, 10**9) for _ in range(n)]
                a[150000] = 1234
                a[199999] = 2 * 10**9 - 1234
                print(n, 2 * 10**9)
                print(*a)
                ''')}],
    start=D('''
        n, k = map(int, input().split())
        a = list(map(int, input().split()))
        ilk_gorulen = {}
        # her j için k - a[j] daha önce görüldü mü?
        '''),
    sol=D('''
        n, k = map(int, input().split())
        a = list(map(int, input().split()))
        ilk_gorulen = {}
        cevap = 'YOK'
        for j, x in enumerate(a):
            i = ilk_gorulen.get(k - x)
            if i is not None:
                cevap = f'{i + 1} {j + 1}'
                break
            if x not in ilk_gorulen:
                ilk_gorulen[x] = j
        print(cevap)
        '''),
    brute=D('''
        n, k = map(int, input().split()); a = list(map(int, input().split()))
        for j in range(n):
            for i in range(j):
                if a[i] + a[j] == k: print(i+1, j+1); raise SystemExit
        print('YOK')
        '''),
    rnd=lambda r: (lambda n: f"{n} {r.randint(2, 12)}\n{ints(r, n, 1, 6)}\n")(r.randint(2, 8)),
    editorial=D('''
        <p><b>Yaklaşım:</b> Soldan sağa geç; her j için tamamlayıcı <code>K − a[j]</code> daha önce görüldü mü diye sözlüğe bak (O(1)). Sözlükte her değerin <b>ilk</b> görüldüğü indeksi sakla; böylece aynı j için en küçük i gelir. j\'yi soldan taradığın için bulduğun ilk çift j\'si en küçük olandır.</p>
        <p><b>Karmaşıklık:</b> O(N) zaman, O(N) bellek.</p>
        <p><b>Naif çözüm neden yetmez:</b> Tüm çiftleri denemek O(N²) = 2·10^10 (gizli testte çift yok, yani tamamı taranır). Sıralayıp iki işaretçi O(N log N) çalışır ama orijinal indeksleri ve "en küçük j" kuralını korumak zahmetlidir.</p>
        <p><b>Sık hata:</b> Önce sözlüğe ekleyip sonra bakmak: K = 2·a[j] iken ürünü kendisiyle eşleştirirsin. Ya da her görüşte indeksi güncelleyip en küçük i\'yi kaybetmek.</p>'''),
    hints=['Her j için aradığın değer K − a[j].', 'Önce sözlüğe bak, sonra (ilk kez görülüyorsa) ekle.']))

# ---------------------------------------------------------------- a-149
P.append(dict(
    id='a-149', title='Anagram ürün etiketleri', track=T, diff='Kolay',
    tags=['hash', 'gruplama'], src='LeetCode 49 Group Anagrams benzeri',
    statement=D('''
        <p>Anadolu Market\'in stok sistemine yanlışlıkla harfleri karışmış etiketler girilmiş: "elma" ile "lame", "male" aynı harflerden oluşuyor. Veri ekibi, aynı harf çokluğuna sahip etiketleri (anagramları) bir grup sayıyor.</p>
        <p>Kaç farklı grup olduğunu ve en kalabalık grubun kaç etiket içerdiğini yaz.</p>'''),
    input='<p>İlk satırda N. İkinci satırda boşlukla ayrılmış N etiket (küçük İngilizce harfler).</p>',
    output='<p>Tek satırda <code>grup_sayisi en_buyuk_grup</code>.</p>',
    constraints='1 ≤ N ≤ 10^5, 1 ≤ etiket uzunluğu ≤ 10',
    samples=[('6\neat tea tan ate nat bat\n', 'Gruplar: {eat, tea, ate}, {tan, nat}, {bat} → 3 grup, en büyüğü 3.')],
    hidden=['1\na\n', '3\nab ba ab\n', '4\nabc abd bcd cde\n', '5\naab aba baa abb bab\n', '3\na aa aaa\n',
            {'gen': D('''
                import random
                random.seed(149)
                n = 100000
                print(n)
                print(*[''.join(random.choice('abcde') for _ in range(random.randint(1, 6))) for _ in range(n)])
                ''')},
            {'gen': D('''
                import random
                random.seed(1490)
                n = 100000
                print(n)
                print(*[''.join(random.choice('abcdefghijklmnopqrstuvwxyz') for _ in range(10)) for _ in range(n)])
                ''')}],
    start=D('''
        from collections import defaultdict
        n = int(input())
        etiketler = input().split()
        gruplar = defaultdict(int)
        # her etiket için sıralı harflerden bir anahtar üret
        '''),
    sol=D('''
        from collections import defaultdict
        n = int(input())
        etiketler = input().split()
        gruplar = defaultdict(int)
        for e in etiketler:
            gruplar[''.join(sorted(e))] += 1
        print(len(gruplar), max(gruplar.values()))
        '''),
    brute=D('''
        from collections import Counter
        n = int(input()); e = input().split(); G = []
        for w in e:
            for g in G:
                if Counter(g[0]) == Counter(w): g.append(w); break
            else: G.append([w])
        print(len(G), max(len(g) for g in G))
        '''),
    rnd=lambda r: (lambda n: f"{n}\n{' '.join(''.join(r.choice('ab') for _ in range(r.randint(1, 3))) for _ in range(n))}\n")(r.randint(1, 8)),
    editorial=D('''
        <p><b>Yaklaşım:</b> Anagramların ortak bir "imzası" vardır: harflerinin sıralanmış hâli (<code>\'\'.join(sorted(e))</code>) ya da 26 elemanlı harf sayacı demeti. Bu imzayı sözlük anahtarı yapıp say. Grup sayısı = sözlükteki anahtar sayısı.</p>
        <p><b>Karmaşıklık:</b> O(N · L log L), L ≤ 10. Sayaç imzası ile O(N · L).</p>
        <p><b>Naif çözüm neden yetmez:</b> Her etiketi mevcut tüm gruplarla karşılaştırmak O(N · G) — gizli testte neredeyse her etiket kendi grubunda, yani O(N²) = 10^10 karşılaştırma.</p>
        <p><b>Sık hata:</b> Anahtar olarak <code>set(e)</code> kullanmak: "aab" ile "abb" aynı kümeyi verir ama anagram değildir. Liste anahtar olamaz (hashlenemez); demet ya da metin kullan.</p>'''),
    hints=['Anagramların sıralanmış harfleri aynıdır.', 'Bu sıralı metni sözlük anahtarı yap.']))

# ---------------------------------------------------------------- a-150
P.append(dict(
    id='a-150', title='Kasada anlık en düşük tutar', track=T, diff='Orta',
    tags=['yığın', 'tasarım'], src='LeetCode 155 Min Stack benzeri',
    statement=D('''
        <p>Ilgaz Bank şubesindeki kasa, yatırılan zarfları üst üste koyuyor (son konan ilk alınır). Şube müdürü her an yığındaki <b>en düşük tutarlı</b> zarfı da bilmek istiyor. Komutlar:</p>
        <ul><li><code>KOY x</code>: x tutarlı zarfı tepeye koy.</li>
        <li><code>AL</code>: tepedeki zarfı çıkar (yığın boşsa <code>BOS</code> yaz, aksi hâlde bir şey yazma).</li>
        <li><code>TEPE</code>: tepedeki tutarı yaz (boşsa <code>BOS</code>).</li>
        <li><code>MIN</code>: yığındaki en küçük tutarı yaz (boşsa <code>BOS</code>).</li></ul>'''),
    input='<p>İlk satırda Q, sonraki Q satırda birer komut.</p>',
    output='<p>Çıktı üreten her komut için bir satır.</p>',
    constraints='1 ≤ Q ≤ 2·10^5, −10^9 ≤ x ≤ 10^9',
    samples=[('8\nKOY 5\nKOY 3\nKOY 7\nMIN\nAL\nAL\nMIN\nTEPE\n', 'İlk MIN 3. İki AL ile 7 ve 3 çıkar; kalan 5: MIN 5, TEPE 5.')],
    hidden=['2\nMIN\nAL\n', '4\nKOY -1\nKOY -1\nAL\nMIN\n', '5\nKOY 2\nKOY 2\nKOY 1\nAL\nMIN\n', '6\nKOY 9\nAL\nTEPE\nMIN\nKOY 4\nMIN\n',
            '5\nKOY 3\nKOY 1\nKOY 2\nAL\nMIN\n',
            {'gen': D('''
                import random
                random.seed(150)
                q = 200000
                print(q)
                out = []
                for i in range(q):
                    if i < 100000:
                        out.append('KOY ' + str(10**9 - i * 7 + random.randint(0, 5)) if random.random() < 0.9 else 'MIN')
                    else:
                        out.append(random.choice(['AL', 'MIN', 'MIN', 'TEPE']))
                print('\\n'.join(out))
                ''')}],
    start=D('''
        import sys
        input = sys.stdin.readline
        q = int(input())
        yigin = []   # (deger, o ana kadarki_min) çiftleri tutabilirsin
        for _ in range(q):
            komut = input().split()
        '''),
    sol=D('''
        import sys
        satirlar = sys.stdin.read().split('\\n')
        q = int(satirlar[0])
        yigin = []
        cikti = []
        for k in range(1, q + 1):
            komut = satirlar[k].split()
            c = komut[0]
            if c == 'KOY':
                x = int(komut[1])
                m = x if not yigin or x < yigin[-1][1] else yigin[-1][1]
                yigin.append((x, m))
            elif c == 'AL':
                if yigin:
                    yigin.pop()
                else:
                    cikti.append('BOS')
            elif c == 'TEPE':
                cikti.append(str(yigin[-1][0]) if yigin else 'BOS')
            else:
                cikti.append(str(yigin[-1][1]) if yigin else 'BOS')
        print('\\n'.join(cikti))
        '''),
    brute=D('''
        q = int(input()); y = []
        for _ in range(q):
            c = input().split()
            if c[0] == 'KOY': y.append(int(c[1]))
            elif c[0] == 'AL':
                if y: y.pop()
                else: print('BOS')
            elif c[0] == 'TEPE': print(y[-1] if y else 'BOS')
            else: print(min(y) if y else 'BOS')
        '''),
    rnd=lambda r: (lambda q: f"{q}\n" + ''.join(r.choice([f'KOY {r.randint(-5, 5)}\n', 'AL\n', 'TEPE\n', 'MIN\n']) for _ in range(q)))(r.randint(1, 12)),
    editorial=D('''
        <p><b>Yaklaşım:</b> Her elemanı, eklendiği andaki yığın minimumuyla birlikte sakla: <code>(x, min(x, önceki_min))</code>. Tepeden çıkarınca altındaki elemanın kaydettiği minimum otomatik olarak geçerli olur; hiçbir şeyi yeniden hesaplamazsın. (Alternatif: ayrı bir "minimumlar yığını".)</p>
        <p><b>Karmaşıklık:</b> Her komut O(1), toplam O(Q); bellek O(Q).</p>
        <p><b>Naif çözüm neden yetmez:</b> MIN için her seferinde <code>min(yigin)</code> çağırmak O(n). Gizli testte yığında ~9·10^4 eleman varken 5·10^4 MIN komutu ~4,5·10^9 karşılaştırma demek. Tek bir "en küçük" değişkeni tutmak da yetmez: en küçük eleman AL ile çıkınca bir öncekini bilemezsin.</p>
        <p><b>Sık hata:</b> Eşit minimumları atlamak (ayrı minimum yığınında <code>&lt;</code> yerine <code>&lt;=</code> kullanılmalı) ve boş yığında AL komutunu sessizce yutmak.</p>'''),
    hints=['Tek bir min değişkeni yetmez; çıkarılan eleman minimumsa ne olacak?', 'Her elemanla birlikte "o ana kadarki minimumu" sakla.']))

# ---------------------------------------------------------------- a-151
P.append(dict(
    id='a-151', title='Daha yüksek ciroya kaç gün var?', track=T, diff='Orta',
    tags=['monoton yığın'], src='LeetCode 739 Daily Temperatures benzeri',
    statement=D('''
        <p>Anadolu Market\'in analistleri her gün için şu soruyu soruyor: "Bugünkü cirodan <b>kesinlikle daha yüksek</b> ciro kaç gün sonra görüldü?" Böyle bir gün gelmediyse cevap 0.</p>
        <p>Her gün için bekleme süresini yazdır.</p>'''),
    input='<p>İlk satırda N. İkinci satırda N günlük ciro.</p>',
    output='<p>Tek satırda N tam sayı.</p>',
    constraints='1 ≤ N ≤ 2·10^5, 0 ≤ ciro ≤ 10^9',
    samples=[('8\n73 74 75 71 69 72 76 73\n', '73 → ertesi gün 74 (1). 75 → 4 gün sonra 76. Son gün için daha yüksek yok (0).')],
    hidden=['1\n5\n', '4\n1 2 3 4\n', '4\n4 3 2 1\n', '5\n3 3 3 3 4\n', '6\n2 1 1 1 1 3\n',
            {'gen': D('''
                import random
                random.seed(151)
                n = 200000
                print(n)
                print(*[random.randint(0, 10**9) for _ in range(n)])
                ''')},
            {'gen': D('''
                n = 200000
                print(n)
                print(*(list(range(n - 1, 0, -1)) + [n]))
                ''')}],
    start=D('''
        n = int(input())
        ciro = list(map(int, input().split()))
        cevap = [0] * n
        yigin = []   # cevabı henüz bulunmamış günlerin indeksleri
        # her yeni gün, yığının tepesindeki daha düşük günleri çözer
        '''),
    sol=D('''
        n = int(input())
        ciro = list(map(int, input().split()))
        cevap = [0] * n
        yigin = []
        for i, c in enumerate(ciro):
            while yigin and ciro[yigin[-1]] < c:
                j = yigin.pop()
                cevap[j] = i - j
            yigin.append(i)
        print(*cevap)
        '''),
    brute=D('''
        n = int(input()); a = list(map(int, input().split())); r = []
        for i in range(n):
            r.append(next((j - i for j in range(i+1, n) if a[j] > a[i]), 0))
        print(*r)
        '''),
    rnd=lambda r: (lambda n: f"{n}\n{ints(r, n, 0, 5)}\n")(r.randint(1, 10)),
    editorial=D('''
        <p><b>Yaklaşım:</b> Monoton azalan yığın. Yığında, cevabı henüz bulunmamış günlerin indeksleri vardır ve cirolar tepeye doğru azalmayan biçimde dizilidir. Yeni gün geldiğinde tepedeki daha düşük cirolu günlerin "ilk daha yüksek günü" bugündür: onları çıkar, farkı yaz. Sonra bugünü yığına koy.</p>
        <p><b>Karmaşıklık:</b> Her indeks yığına bir kez girip en fazla bir kez çıkar: O(N) zaman (amortize), O(N) bellek.</p>
        <p><b>Naif çözüm neden yetmez:</b> Her gün için ileri doğru tarama O(N²). Gizli testte cirolar sürekli azalıp en sonda yükseliyor: her gün N\'ye kadar tarar, ~2·10^10 adım.</p>
        <p><b>Bu kalıbı tanı:</b> "Sağdaki/soldaki ilk daha büyük/küçük eleman" sorularının hepsi monoton yığındır (hisse fiyatı açıklığı, histogramdaki en büyük dikdörtgen...). <b>Sık hata:</b> Yığına değer koymak: mesafe için indeks gerekir.</p>'''),
    hints=['Cevabı bekleyen günleri bir yığında tut.', 'Yeni gün, tepedeki kendisinden düşük cirolu tüm günlerin cevabıdır.']))

# ---------------------------------------------------------------- a-152
P.append(dict(
    id='a-152', title='En çok satan K ürün', track=T, diff='Kolay',
    tags=['hash', 'Counter', 'heap'], src='LeetCode 347 / 692 Top K Frequent benzeri',
    statement=D('''
        <p>Anadolu Market\'in günlük satış kaydında her satır satılan bir ürünün kodudur. Pazarlama ekibi en çok satan K ürünü istiyor: satış adedi çok olan önce, adetler eşitse kodu <b>alfabetik olarak küçük</b> olan önce.</p>
        <p>Farklı ürün sayısı K\'dan azsa hepsini yaz.</p>'''),
    input='<p>İlk satırda N ve K. İkinci satırda boşlukla ayrılmış N ürün kodu.</p>',
    output='<p>Her satırda <code>kod adet</code>.</p>',
    constraints='1 ≤ N ≤ 2·10^5, 1 ≤ K ≤ 1000, kodlar 1–8 karakter',
    samples=[('8 2\ncay seker cay un seker cay un un\n', 'cay 3, un 3, seker 2. Eşit olanlardan cay alfabetik önce.')],
    hidden=['1 1\nx\n', '3 5\na b a\n', '4 2\nd c b a\n', '6 1\nzz zz yy yy xx xx\n', '5 3\nab ab b b a\n',
            {'gen': D('''
                import random
                random.seed(152)
                kodlar = [''.join(random.choice('abcdefgh') for _ in range(4)) for _ in range(3000)]
                n = 200000
                print(n, 50)
                print(*[random.choice(kodlar[:random.randint(1, 3000)]) for _ in range(n)])
                ''')}],
    start=D('''
        from collections import Counter
        n, k = map(int, input().split())
        kodlar = input().split()
        sayac = Counter(kodlar)
        # adet azalan, kod artan sırada ilk k
        '''),
    sol=D('''
        from collections import Counter
        import heapq
        n, k = map(int, input().split())
        kodlar = input().split()
        sayac = Counter(kodlar)
        enler = heapq.nsmallest(k, sayac.items(), key=lambda t: (-t[1], t[0]))
        print('\\n'.join(f'{kod} {adet}' for kod, adet in enler))
        '''),
    brute=D('''
        n, k = map(int, input().split()); a = input().split()
        u = sorted(set(a), key=lambda x: (-a.count(x), x))[:k]
        for x in u: print(x, a.count(x))
        '''),
    rnd=lambda r: (lambda n: f"{n} {r.randint(1, 4)}\n{' '.join(r.choice(['a', 'b', 'c', 'ab', 'ba']) for _ in range(n))}\n")(r.randint(1, 10)),
    editorial=D('''
        <p><b>Yaklaşım:</b> Önce <code>Counter</code> ile adetleri say (O(N)). Sonra U farklı ürün arasından ilk K\'yı seç: <code>heapq.nsmallest(K, ..., key=(-adet, kod))</code> O(U log K), ya da tümünü sıralamak O(U log U). İkisi de burada rahat geçer.</p>
        <p><b>Karmaşıklık:</b> O(N + U log K).</p>
        <p><b>Naif çözüm neden yetmez:</b> Her farklı kod için <code>liste.count(kod)</code> çağırmak O(N · U) = 2·10^5 × 3000 = 6·10^8; CPython\'da dakikalar sürer.</p>
        <p><b>Sık hata:</b> <code>Counter.most_common(K)</code> eşitlikleri ilk görülme sırasına göre bırakır, alfabetik değil; bu yüzden ikincil anahtarı kendin vermelisin. <b>Uzmanlaş:</b> Kova sıralaması (adet → kodlar listesi) ile O(N) çözüm de mümkün.</p>'''),
    hints=['Counter ile say.', 'Anahtar (−adet, kod) ile sırala ya da heapq.nsmallest kullan.']))

# ---------------------------------------------------------------- a-153 (func)
P.append(dict(
    id='a-153', title='Kargo vagonlarını ters çevir', track=T, diff='Kolay', mode='func', fn='ters_cevir',
    tags=['bağlı liste', 'sınıf', 'işaretçi'], src='LeetCode 206 Reverse Linked List benzeri',
    statement=D('''
        <p>Kanat Havayolları\'nın kargo treninde vagonlar tek yönlü bağlı liste ile modelleniyor: her <code>Dugum</code> nesnesinin <code>deger</code> (vagon numarası) ve <code>sonraki</code> (arkasındaki vagon ya da <code>None</code>) alanları var. Tren ters yönde yüklenecek.</p>
        <p><code>ters_cevir(bas)</code> fonksiyonunu yaz: listeyi <b>yerinde</b> ters çevirip yeni baş düğümü döndürsün. Yeni düğüm oluşturma; mevcut düğümlerin <code>sonraki</code> bağlarını değiştir. Boş liste için <code>None</code> döndür.</p>'''),
    input='<p>Fonksiyon girdisi: bağlı listenin baş düğümü (<code>Dugum</code> ya da <code>None</code>).</p>',
    output='<p>Ters çevrilmiş listenin baş düğümü.</p>',
    constraints='0 ≤ düğüm sayısı ≤ 10^5',
    samples=[{'in': 'ters_cevir(1 → 2 → 3 → 4)', 'out': '4 → 3 → 2 → 1', 'why': 'Her düğümün okunu bir öncekine çevir.'},
             {'in': 'ters_cevir(None)', 'out': 'None', 'why': 'Boş liste boş kalır.'}],
    start=DUGUM + '\n\n' + D('''
        def ters_cevir(bas):
            onceki = None
            simdiki = bas
            # TODO: her adımda simdiki.sonraki'yi onceki'ye çevir
            pass
        '''),
    sol=DUGUM + '\n\n' + D('''
        def ters_cevir(bas):
            onceki = None
            simdiki = bas
            while simdiki is not None:
                sonraki = simdiki.sonraki
                simdiki.sonraki = onceki
                onceki = simdiki
                simdiki = sonraki
            return onceki
        '''),
    tests=LL_HELP + D('''
        assert ters_cevir(None) is None
        assert _liste(ters_cevir(_kur([7]))) == [7]
        assert _liste(ters_cevir(_kur([1, 2, 3, 4]))) == [4, 3, 2, 1]
        assert _liste(ters_cevir(_kur([5, 5, 1]))) == [1, 5, 5]
        _b = _kur(list(range(10)))
        _d = _dugumler(_b)
        _y = ters_cevir(_b)
        assert _dugumler(_y) == _d[::-1], 'yeni düğüm oluşturma; mevcut düğümleri yeniden bağla'
        assert _d[0].sonraki is None
        _buyuk = list(range(100000))
        assert _liste(ters_cevir(_kur(_buyuk))) == _buyuk[::-1], '10^5 düğümde de çalışmalı (özyineleme derinliğine dikkat)'
        '''),
    editorial=D('''
        <p><b>Yaklaşım:</b> Üç işaretçi: <code>onceki</code>, <code>simdiki</code>, <code>sonraki</code>. Her adımda önce <code>sonraki = simdiki.sonraki</code> ile yolu kaybetmemek için ilerideki düğümü sakla, sonra <code>simdiki.sonraki = onceki</code> ile oku ters çevir, ardından iki işaretçiyi bir adım ilerlet. Döngü bitince <code>onceki</code> yeni baştır.</p>
        <p><b>Karmaşıklık:</b> O(n) zaman, O(1) ek bellek.</p>
        <p><b>Naif/alternatif çözümler:</b> Değerleri listeye kopyalayıp ters sırayla yeni düğümler kurmak O(n) bellek harcar ve testteki "aynı düğümler" şartını bozar. Özyinelemeli çözüm zariftir ama 10^5 düğümde Python\'un ~1000\'lik özyineleme sınırına takılır (<code>RecursionError</code>).</p>
        <p><b>Sık hata:</b> <code>simdiki.sonraki</code>\'yi değiştirmeden önce saklamamak (liste kopar) ve eski baş düğümün <code>sonraki</code>\'sini <code>None</code> yapmamak (döngü oluşur).</p>'''),
    hints=['onceki = None ile başla.', 'Bağı değiştirmeden önce bir sonraki düğümü bir değişkende sakla.']))

# ---------------------------------------------------------------- a-154 (func)
P.append(dict(
    id='a-154', title='Rota zincirinde döngünün başladığı durak', track=T, diff='Orta', mode='func', fn='dongu_baslangici',
    tags=['bağlı liste', 'sınıf', 'Floyd', 'iki işaretçi'], src='LeetCode 142 Linked List Cycle II benzeri',
    statement=D('''
        <p>Lezzet Kurye\'nin rota motoru durakları tek yönlü bağlı liste olarak tutuyor (<code>Dugum</code>: <code>deger</code>, <code>sonraki</code>). Hatalı bir güncelleme yüzünden bazı rotalarda son durak, önceki duraklardan birine bağlanmış ve bir <b>döngü</b> oluşmuş olabilir.</p>
        <p><code>dongu_baslangici(bas)</code> fonksiyonunu yaz: döngü varsa döngünün <b>başladığı düğümü</b> (nesnenin kendisini), yoksa <code>None</code> döndürsün. Listeyi değiştirme. Hedef: O(1) ek bellek.</p>'''),
    input='<p>Fonksiyon girdisi: listenin baş düğümü (döngü içerebilir).</p>',
    output='<p>Döngünün ilk düğümü ya da <code>None</code>.</p>',
    constraints='0 ≤ düğüm sayısı ≤ 10^5',
    samples=[{'in': 'dongu_baslangici(3 → 2 → 0 → -4 → (tekrar 2))', 'out': 'değeri 2 olan düğüm', 'why': 'Son düğüm 2. düğüme bağlanmış.'},
             {'in': 'dongu_baslangici(1 → 2 → None)', 'out': 'None', 'why': 'Döngü yok.'}],
    start=DUGUM + '\n\n' + D('''
        def dongu_baslangici(bas):
            yavas = hizli = bas
            # TODO: önce buluşma noktasını bul, sonra döngü başını
            pass
        '''),
    sol=DUGUM + '\n\n' + D('''
        def dongu_baslangici(bas):
            yavas = hizli = bas
            while hizli is not None and hizli.sonraki is not None:
                yavas = yavas.sonraki
                hizli = hizli.sonraki.sonraki
                if yavas is hizli:
                    yavas = bas
                    while yavas is not hizli:
                        yavas = yavas.sonraki
                        hizli = hizli.sonraki
                    return yavas
            return None
        '''),
    tests=LL_HELP + D('''
        def _donguli(degerler, pos):
            bas = _kur(degerler)
            d = _dugumler(bas)
            if pos >= 0:
                d[-1].sonraki = d[pos]
            return bas, d

        assert dongu_baslangici(None) is None
        _b, _d = _donguli([1, 2], -1)
        assert dongu_baslangici(_b) is None
        _b, _d = _donguli([3, 2, 0, -4], 1)
        assert dongu_baslangici(_b) is _d[1]
        _b, _d = _donguli([1], 0)
        assert dongu_baslangici(_b) is _d[0]
        _b, _d = _donguli([1, 2], 0)
        assert dongu_baslangici(_b) is _d[0]
        _b, _d = _donguli([7, 7, 7, 7, 7], 3)
        assert dongu_baslangici(_b) is _d[3], 'değer değil düğüm kimliği karşılaştırılmalı'
        _b, _d = _donguli(list(range(100000)), 99999)
        assert dongu_baslangici(_b) is _d[99999]
        _b, _d = _donguli(list(range(100000)), 12345)
        assert dongu_baslangici(_b) is _d[12345]
        assert _d[-1].sonraki is _d[12345], 'liste değiştirilmemeli'
        _b, _d = _donguli(list(range(100000)), -1)
        assert dongu_baslangici(_b) is None
        '''),
    editorial=D('''
        <p><b>Yaklaşım (Floyd\'un kaplumbağa–tavşan algoritması):</b> Yavaş işaretçi bir, hızlı işaretçi iki adım ilerler. Döngü yoksa hızlı olan <code>None</code>\'a ulaşır. Döngü varsa döngü içinde buluşurlar. Baştan döngü başına uzaklık a, döngü başından buluşma noktasına b, döngü uzunluğu c olsun: hızlı 2 kat yol aldığından a + b ≡ 0 (mod c), yani buluşma noktasından a adım daha gidince döngü başına varılır. Bu yüzden bir işaretçiyi başa al, ikisini de birer adım ilerlet; buluştukları düğüm döngü başıdır.</p>
        <p><b>Karmaşıklık:</b> O(n) zaman, O(1) bellek.</p>
        <p><b>Basit alternatif:</b> Ziyaret edilen düğümleri bir <code>set</code>\'te tutmak O(n) zaman ama O(n) bellektir; bu soru özellikle sabit bellek ister. Değerleri kümede tutmak ise <b>yanlıştır</b>: farklı düğümler aynı değeri taşıyabilir (testteki 7\'li liste).</p>
        <p><b>Sık hata:</b> <code>==</code> yerine <code>is</code> kullanmamak, <code>hizli.sonraki</code>\'nin <code>None</code> olabileceğini kontrol etmemek ve listeyi işaretleyerek (ör. <code>deger</code>\'i değiştirerek) çözmek.</p>'''),
    hints=['Biri 1, biri 2 adım ilerleyen iki işaretçi döngüde mutlaka buluşur.', 'Buluşunca birini başa al; ikisini birer adım ilerlet, buluştukları yer döngü başı.']))

# ---------------------------------------------------------------- a-155 (func)
P.append(dict(
    id='a-155', title='Sevkiyat zincirini K\'lı gruplar hâlinde çevir', track=T, diff='Zor', mode='func', fn='k_grup_ters',
    tags=['bağlı liste', 'sınıf', 'işaretçi'], src='LeetCode 25 Reverse Nodes in k-Group benzeri',
    statement=D('''
        <p>Anadolu Market\'in dağıtım planında koliler tek yönlü bağlı liste (<code>Dugum</code>: <code>deger</code>, <code>sonraki</code>) olarak sıralı. Kamyonlar K\'şar koli alıyor ve her kamyona son yüklenen koli ilk indirilecek; bu yüzden listenin her ardışık K\'lık grubu kendi içinde ters çevrilmeli. Sonda K\'dan az koli kalırsa onlar <b>olduğu gibi</b> bırakılır.</p>
        <p><code>k_grup_ters(bas, k)</code> fonksiyonunu yaz ve yeni baş düğümü döndür. Düğümlerin değerlerini değiştirme; bağları yeniden kur.</p>'''),
    input='<p>Fonksiyon girdisi: baş düğüm ve pozitif tam sayı k.</p>',
    output='<p>Yeni baş düğüm.</p>',
    constraints='0 ≤ düğüm sayısı ≤ 10^5, 1 ≤ k ≤ 10^5',
    samples=[{'in': 'k_grup_ters(1 → 2 → 3 → 4 → 5, 2)', 'out': '2 → 1 → 4 → 3 → 5', 'why': '[1,2] ve [3,4] çevrildi; 5 tek kaldığı için yerinde.'},
             {'in': 'k_grup_ters(1 → 2 → 3 → 4 → 5, 3)', 'out': '3 → 2 → 1 → 4 → 5', 'why': 'Kalan 2 düğüm K\'dan az.'}],
    start=DUGUM + '\n\n' + D('''
        def k_grup_ters(bas, k):
            sahte = Dugum(0, bas)
            grup_onu = sahte
            # TODO: k düğüm var mı kontrol et, varsa o grubu çevir ve bağla
            pass
        '''),
    sol=DUGUM + '\n\n' + D('''
        def k_grup_ters(bas, k):
            sahte = Dugum(0, bas)
            grup_onu = sahte
            while True:
                kth = grup_onu
                for _ in range(k):
                    kth = kth.sonraki
                    if kth is None:
                        return sahte.sonraki
                grup_sonrasi = kth.sonraki
                onceki, simdiki = grup_sonrasi, grup_onu.sonraki
                while simdiki is not grup_sonrasi:
                    sonraki = simdiki.sonraki
                    simdiki.sonraki = onceki
                    onceki = simdiki
                    simdiki = sonraki
                ilk = grup_onu.sonraki
                grup_onu.sonraki = kth
                grup_onu = ilk
        '''),
    tests=LL_HELP + D('''
        def _bek(v, k):
            out = []
            for i in range(0, len(v), k):
                g = v[i:i + k]
                out += g[::-1] if len(g) == k else g
            return out

        assert k_grup_ters(None, 3) is None
        assert _liste(k_grup_ters(_kur([1, 2, 3, 4, 5]), 2)) == [2, 1, 4, 3, 5]
        assert _liste(k_grup_ters(_kur([1, 2, 3, 4, 5]), 3)) == [3, 2, 1, 4, 5]
        assert _liste(k_grup_ters(_kur([1, 2, 3, 4, 5]), 1)) == [1, 2, 3, 4, 5]
        assert _liste(k_grup_ters(_kur([1, 2, 3, 4]), 4)) == [4, 3, 2, 1]
        assert _liste(k_grup_ters(_kur([1, 2, 3]), 5)) == [1, 2, 3]
        assert _liste(k_grup_ters(_kur([1, 2, 3, 4, 5, 6]), 3)) == [3, 2, 1, 6, 5, 4]
        _v = list(range(12))
        _b = _kur(_v)
        _d = _dugumler(_b)
        _y = k_grup_ters(_b, 5)
        assert set(map(id, _dugumler(_y))) == set(map(id, _d)), 'yeni düğüm oluşturma'
        assert _liste(_y) == _bek(_v, 5)
        for _k in (2, 7, 1000, 99999, 100000):
            _v = list(range(100000))
            assert _liste(k_grup_ters(_kur(_v), _k)) == _bek(_v, _k), f'k={_k} büyük girdi'
        '''),
    editorial=D('''
        <p><b>Yaklaşım:</b> Başa bir <b>sahte düğüm</b> (dummy) koy; böylece ilk grubun çevrilmesi özel durum olmaz. <code>grup_onu</code> her zaman çevrilecek grubun hemen önündeki düğümdür. Her turda: (1) K adım ilerleyerek grubun son düğümünü (<code>kth</code>) bul; K düğüm yoksa dur. (2) Grubu, ters çevirmenin <code>onceki</code> başlangıcı <code>grup_sonrasi</code> olacak şekilde çevir; böylece grubun yeni sonu doğrudan sonraki gruba bağlanır. (3) <code>grup_onu.sonraki = kth</code> yap ve <code>grup_onu</code>\'yu grubun yeni sonu (eski ilk düğüm) olarak ilerlet.</p>
        <p><b>Karmaşıklık:</b> Her düğüm sabit sayıda ziyaret edilir: O(n) zaman, O(1) ek bellek.</p>
        <p><b>Naif çözüm neden yetmez:</b> Değerleri listeye çekip dilimleri ters çevirmek ve değerleri geri yazmak "düğüm değerlerini değiştirme" kuralını çiğner ve O(n) bellek ister. Her grup için listeyi baştan sayarak gezmek O(n²/k) yapar (k küçükken 10^5 düğümde yavaş). Özyinelemeli çözüm ise k=2 ve n=10^5 için 5·10^4 derinliğe çıkar ve <code>RecursionError</code> verir.</p>
        <p><b>Sık hata:</b> Çevrilen grubun sonunu sonraki gruba bağlamayı unutmak (liste kopar) ve son eksik grubu da çevirmek.</p>'''),
    hints=['Sahte bir baş düğüm kullan; grup_onu = sahte.', 'Önce K düğüm var mı bak; varsa grubu, sonundaki düğüme bağlanacak şekilde çevir.', 'Grubun eski ilk düğümü, bir sonraki turun grup_onu\'su olur.']))

# ---------------------------------------------------------------- a-156
P.append(dict(
    id='a-156', title='Canlı satış tablosunda K. büyük', track=T, diff='Orta',
    tags=['heap', 'öncelik kuyruğu'], src='LeetCode 703 Kth Largest Element in a Stream benzeri',
    statement=D('''
        <p>Anadolu Market\'in kampanya gününde satış tutarları tek tek ekrana düşüyor. Yönetim ekranında "şu ana kadarki satışlar arasında <b>K. en büyük</b> tutar" sürekli gösteriliyor (bu tutarın üstündekiler ödül alacak).</p>
        <p>Her yeni satıştan sonra K. en büyük tutarı yaz; o ana kadar K\'dan az satış varsa <code>-1</code> yaz.</p>'''),
    input='<p>İlk satırda N ve K. İkinci satırda N satış tutarı (geliş sırasıyla).</p>',
    output='<p>Tek satırda N tam sayı.</p>',
    constraints='1 ≤ K ≤ N ≤ 2·10^5, 1 ≤ tutar ≤ 10^9',
    samples=[('6 3\n4 5 8 2 3 10\n', 'İlk iki satışta 3 tutar yok: −1. Sonra [4,5,8] → 4; 2 eklenince yine 4; 3 → 4; 10 → [5,8,10] → 5.')],
    hidden=['1 1\n7\n', '3 1\n5 1 9\n', '4 4\n1 1 1 1\n', '5 2\n10 9 8 7 6\n', '5 3\n1 2 3 4 5\n',
            {'gen': D('''
                import random
                random.seed(156)
                n = 200000
                print(n, 50000)
                print(*[random.randint(1, 10**9) for _ in range(n)])
                ''')},
            {'gen': D('''
                n = 200000
                print(n, 1000)
                print(*range(1, n + 1))
                ''')}],
    start=D('''
        import heapq
        n, k = map(int, input().split())
        satislar = list(map(int, input().split()))
        heap = []   # en büyük k tutarı tutan min-heap
        '''),
    sol=D('''
        import heapq
        n, k = map(int, input().split())
        satislar = list(map(int, input().split()))
        heap = []
        cikti = []
        for x in satislar:
            if len(heap) < k:
                heapq.heappush(heap, x)
            elif x > heap[0]:
                heapq.heapreplace(heap, x)
            cikti.append(heap[0] if len(heap) == k else -1)
        print(*cikti)
        '''),
    brute=D('''
        n, k = map(int, input().split()); a = list(map(int, input().split())); r = []
        for i in range(n):
            s = sorted(a[:i+1], reverse=True)
            r.append(s[k-1] if len(s) >= k else -1)
        print(*r)
        '''),
    rnd=lambda r: (lambda n: f"{n} {r.randint(1, n)}\n{ints(r, n, 1, 9)}\n")(r.randint(1, 9)),
    editorial=D('''
        <p><b>Yaklaşım:</b> En büyük K tutarı boyutu K olan bir <b>min-heap</b>\'te tut. Heap\'in tepesi (<code>heap[0]</code>) bu K tutarın en küçüğü, yani K. en büyüktür. Yeni tutar tepeden büyükse <code>heapreplace</code> ile tepeyi at ve yeniyi ekle; değilse K. en büyük değişmez.</p>
        <p><b>Karmaşıklık:</b> Satış başına O(log K); toplam O(N log K), bellek O(K).</p>
        <p><b>Naif çözüm neden yetmez:</b> Her satıştan sonra tüm listeyi sıralamak O(N² log N); <code>bisect.insort</code> ile sıralı liste tutmak ekleme başına O(N) kaydırma yapar. N = 2·10^5 için ikisi de saniyeler, hatta dakikalar sürer.</p>
        <p><b>Sık hata:</b> Python\'un <code>heapq</code>\'su <b>min</b>-heap\'tir; "en büyükleri" tutmak için min-heap doğru seçimdir (en küçüğü atılacak olan). Max-heap sanıp negatif değerle uğraşmak gereksizdir.</p>'''),
    hints=['Yalnız en büyük K tutarı tutman yeter.', 'Min-heap\'in tepesi bu K tutarın en küçüğü, yani cevaptır.']))

# ---------------------------------------------------------------- a-157
P.append(dict(
    id='a-157', title='Kayan pencerede en yüksek bekleme süresi', track=T, diff='Zor',
    tags=['deque', 'monoton kuyruk', 'kayan pencere'], src='LeetCode 239 Sliding Window Maximum benzeri',
    statement=D('''
        <p>Lezzet Kurye\'nin müşteri hizmetleri, siparişlerin bekleme sürelerini dakika dakika izliyor. Son K siparişlik her pencerede <b>en uzun bekleme süresi</b> panoda gösteriliyor.</p>
        <p>N uzunluğundaki dizide K boyutlu her ardışık pencerenin maksimumunu (soldan sağa, N−K+1 değer) yazdır.</p>'''),
    input='<p>İlk satırda N ve K. İkinci satırda N bekleme süresi.</p>',
    output='<p>Tek satırda N−K+1 tam sayı.</p>',
    constraints='1 ≤ K ≤ N ≤ 2·10^5, 0 ≤ süre ≤ 10^9',
    samples=[('8 3\n1 3 0 2 5 3 6 7\n', 'Pencereler: [1,3,0]→3, [3,0,2]→3, [0,2,5]→5, [2,5,3]→5, [5,3,6]→6, [3,6,7]→7.')],
    hidden=['1 1\n5\n', '4 4\n1 9 2 8\n', '5 1\n3 1 4 1 5\n', '6 2\n9 8 7 6 5 4\n', '6 3\n1 1 1 1 1 1\n',
            {'gen': D('''
                import random
                random.seed(157)
                n = 200000
                print(n, 1000)
                print(*[random.randint(0, 10**9) for _ in range(n)])
                ''')},
            {'gen': D('''
                n = 200000
                print(n, 100000)
                print(*range(n, 0, -1))
                ''')},
            {'gen': D('''
                n = 200000
                print(n, 50000)
                print(*range(n))
                ''')}],
    start=D('''
        from collections import deque
        n, k = map(int, input().split())
        a = list(map(int, input().split()))
        dq = deque()   # indeksler; a değerleri azalan sırada
        '''),
    sol=D('''
        from collections import deque
        n, k = map(int, input().split())
        a = list(map(int, input().split()))
        dq = deque()
        cikti = []
        for i, x in enumerate(a):
            while dq and a[dq[-1]] <= x:
                dq.pop()
            dq.append(i)
            if dq[0] <= i - k:
                dq.popleft()
            if i >= k - 1:
                cikti.append(a[dq[0]])
        print(*cikti)
        '''),
    brute=D('''
        n, k = map(int, input().split()); a = list(map(int, input().split()))
        print(*[max(a[i:i+k]) for i in range(n-k+1)])
        '''),
    rnd=lambda r: (lambda n: f"{n} {r.randint(1, n)}\n{ints(r, n, 0, 6)}\n")(r.randint(1, 10)),
    editorial=D('''
        <p><b>Yaklaşım:</b> Monoton azalan deque. Deque\'te indeksler tutulur ve karşılık gelen değerler baştan sona azalır. Yeni eleman gelince sondan kendisinden küçük-eşit olanları at (artık asla maksimum olamazlar, çünkü daha yeni ve daha büyük biri var). Baştaki indeks pencereden çıktıysa (<code>≤ i − K</code>) onu da at. Pencerenin maksimumu her zaman deque\'in başındadır.</p>
        <p><b>Karmaşıklık:</b> Her indeks deque\'e bir kez girer, bir kez çıkar: O(N). Bellek O(K).</p>
        <p><b>Naif çözüm neden yetmez:</b> Her pencere için <code>max(a[i:i+K])</code> O(N·K) — gizli testte K = 10^5 ile 10^10 işlem. Heap ile (değer, indeks) tutup tembel silmek O(N log N) ile geçer ama daha yavaştır.</p>
        <p><b>Sık hata:</b> Deque\'te değer tutmak (pencereden çıkışı anlayamazsın) ve pencere tamamlanmadan (<code>i &lt; K−1</code>) çıktı üretmek.</p>'''),
    hints=['Deque\'te indeks tut; değerler azalan sırada olsun.', 'Yeni elemandan küçükleri sondan at, pencereden çıkanı baştan at.']))

# ---------------------------------------------------------------- a-158
P.append(dict(
    id='a-158', title='Çarşı cephesine en büyük tabela', track=T, diff='Zor',
    tags=['monoton yığın'], src='LeetCode 84 Largest Rectangle in Histogram benzeri',
    statement=D('''
        <p>Anadolu Market, bir çarşı caddesinde yan yana duran N dükkânın cephesini kiralayacak. Her dükkânın genişliği 1 metre, i. dükkânın cephe yüksekliği h<sub>i</sub> metre. Ardışık dükkânların cephesine yerden başlayan, <b>tek parça dikdörtgen</b> bir tabela asılacak; tabelanın yüksekliği kapsadığı en alçak cepheyi aşamaz.</p>
        <p>Asılabilecek en büyük tabela alanını bul.</p>'''),
    input='<p>İlk satırda N. İkinci satırda N yükseklik.</p>',
    output='<p>En büyük alan.</p>',
    constraints='1 ≤ N ≤ 2·10^5, 0 ≤ h ≤ 10^9',
    samples=[('6\n2 1 5 6 2 3\n', '5 ve 6 metrelik dükkânlar üzerinde 5 m yükseklik × 2 m: alan 10.'),
             ('2\n2 4\n', '4×1 = 4 ya da 2×2 = 4: cevap 4.')],
    hidden=['1\n0\n', '1\n7\n', '5\n1 1 1 1 1\n', '5\n1 2 3 4 5\n', '5\n5 4 3 2 1\n', '7\n6 2 5 4 5 1 6\n',
            {'gen': D('''
                import random
                random.seed(158)
                n = 200000
                print(n)
                print(*[random.randint(0, 10**9) for _ in range(n)])
                ''')},
            {'gen': D('''
                n = 200000
                print(n)
                print(*range(1, n + 1))
                ''')},
            {'gen': D('''
                n = 200000
                print(n)
                print(*([10**9] * n))
                ''')}],
    start=D('''
        n = int(input())
        h = list(map(int, input().split()))
        yigin = []   # yükseklikleri artan indeksler
        en_buyuk = 0
        '''),
    sol=D('''
        n = int(input())
        h = list(map(int, input().split()))
        h.append(0)
        yigin = []
        en_buyuk = 0
        for i, y in enumerate(h):
            bas = i
            while yigin and yigin[-1][1] >= y:
                j, yj = yigin.pop()
                alan = yj * (i - j)
                if alan > en_buyuk:
                    en_buyuk = alan
                bas = j
            yigin.append((bas, y))
        print(en_buyuk)
        '''),
    brute=D('''
        n = int(input()); h = list(map(int, input().split())); b = 0
        for i in range(n):
            m = h[i]
            for j in range(i, n):
                m = min(m, h[j]); b = max(b, m * (j - i + 1))
        print(b)
        '''),
    rnd=lambda r: (lambda n: f"{n}\n{ints(r, n, 0, 6)}\n")(r.randint(1, 10)),
    editorial=D('''
        <p><b>Yaklaşım:</b> Her dükkânın yüksekliği için o yükseklikte tabelanın ne kadar sola ve sağa uzayabileceğini bilmek gerekir: soldaki ve sağdaki ilk <b>daha alçak</b> dükkâna kadar. Yükseklikleri artan bir yığın tut: elemanlar (başlangıç indeksi, yükseklik). Yeni yükseklik tepedekinden düşük ya da eşitse tepedeki dikdörtgen artık sağa uzayamaz: çıkar, alanını <code>yükseklik × (i − başlangıç)</code> hesapla ve yeni elemanın başlangıcını onun başlangıcına çek (alçak olan sola doğru uzayabilir). Sona 0 yükseklik ekleyerek yığındaki her şeyi boşaltmayı garanti et.</p>
        <p><b>Karmaşıklık:</b> Her indeks bir kez girer, bir kez çıkar: O(N).</p>
        <p><b>Naif çözüm neden yetmez:</b> Her başlangıç için sağa genişleyip minimumu güncellemek O(N²) = 2·10^10 — gizli testlerde dakikalar sürer. Böl ve yönet (en alçağı bul, ikiye böl) sıralı girdide O(N²)\'ye düşer.</p>
        <p><b>Sık hata:</b> Sondaki 0 nöbetçisini eklememek (artan dizide hiçbir alan hesaplanmaz) ve genişliği çıkarılan elemanın kendi indeksinden hesaplayıp sola uzamayı kaçırmak.</p>'''),
    hints=['Her yükseklik için sol ve sağdaki ilk daha alçak dükkânı düşün.', 'Artan bir yığın tut; daha alçak gelince tepeyi çıkar ve alanını hesapla.', 'Sona 0 ekle ki yığın boşalsın.']))

# ---------------------------------------------------------------- a-159
P.append(dict(
    id='a-159', title='Bisiklet yolu ağındaki bölge sayısı', track=T, diff='Orta',
    tags=['union-find', 'DSU'], src='LeetCode 547 / 323 Number of Connected Components benzeri',
    statement=D('''
        <p>Pedal İzmir\'in N istasyonu başlangıçta birbirine bağlı değil. Belediye her gün iki istasyon arasına yeni bir bisiklet yolu açıyor. Bir yolla (doğrudan ya da dolaylı) birbirine ulaşılabilen istasyonlar aynı <b>bölge</b> sayılıyor.</p>
        <p>Her yeni yol açıldıktan sonra toplam bölge sayısını yaz.</p>'''),
    input='<p>İlk satırda N ve Q. Sonraki Q satırda <code>a b</code> (1 ≤ a, b ≤ N; a = b olabilir, aynı yol tekrar açılabilir).</p>',
    output='<p>Her yol için bir satırda bölge sayısı.</p>',
    constraints='1 ≤ N, Q ≤ 2·10^5',
    samples=[('5 4\n1 2\n3 4\n2 1\n2 3\n', '5 → 4 → 3 → (1-2 zaten bağlı) 3 → 2.')],
    hidden=['1 1\n1 1\n', '3 3\n1 2\n2 3\n1 3\n', '4 2\n1 2\n3 4\n', '6 5\n1 2\n3 4\n5 6\n2 3\n4 5\n',
            '4 3\n2 2\n4 4\n1 4\n',
            {'gen': D('''
                import random
                random.seed(159)
                n = q = 200000
                print(n, q)
                print('\\n'.join(f'{random.randint(1, n)} {random.randint(1, n)}' for _ in range(q)))
                ''')},
            {'gen': D('''
                n = q = 200000
                print(n, q - 1)
                print('\\n'.join(f'{i} {i + 1}' for i in range(1, n)))
                ''')}],
    start=D('''
        import sys
        input = sys.stdin.readline
        n, q = map(int, input().split())
        ebeveyn = list(range(n + 1))

        def bul(x):
            # kökü bul (yol sıkıştırmayla)
            pass
        '''),
    sol=D('''
        import sys
        veri = sys.stdin.read().split()
        n, q = int(veri[0]), int(veri[1])
        ebeveyn = list(range(n + 1))
        boyut = [1] * (n + 1)

        def bul(x):
            kok = x
            while ebeveyn[kok] != kok:
                kok = ebeveyn[kok]
            while ebeveyn[x] != kok:
                ebeveyn[x], x = kok, ebeveyn[x]
            return kok

        bolge = n
        cikti = []
        for t in range(q):
            a, b = bul(int(veri[2 + 2 * t])), bul(int(veri[3 + 2 * t]))
            if a != b:
                if boyut[a] < boyut[b]:
                    a, b = b, a
                ebeveyn[b] = a
                boyut[a] += boyut[b]
                bolge -= 1
            cikti.append(bolge)
        print('\\n'.join(map(str, cikti)))
        '''),
    brute=D('''
        n, q = map(int, input().split()); adj = {i: set() for i in range(1, n+1)}
        for _ in range(q):
            a, b = map(int, input().split()); adj[a].add(b); adj[b].add(a)
            seen = set(); c = 0
            for s in range(1, n+1):
                if s in seen: continue
                c += 1; st = [s]; seen.add(s)
                while st:
                    u = st.pop()
                    for v in adj[u]:
                        if v not in seen: seen.add(v); st.append(v)
            print(c)
        '''),
    rnd=lambda r: (lambda n, q: f"{n} {q}\n" + ''.join(f"{r.randint(1, n)} {r.randint(1, n)}\n" for _ in range(q)))(r.randint(1, 7), r.randint(1, 7)),
    editorial=D('''
        <p><b>Yaklaşım:</b> Birleşim-bul (union-find / disjoint set union). Her istasyonun bir ebeveyni var; kök, bölgenin temsilcisidir. Yeni yol açılınca iki ucun köklerini bul; farklıysa küçük ağacı büyüğün altına bağla (boyuta göre birleştirme) ve bölge sayısını 1 azalt. <code>bul</code> sırasında yolu köke doğrudan bağlamak (yol sıkıştırma) ağaçları neredeyse düz tutar.</p>
        <p><b>Karmaşıklık:</b> İşlem başına amortize O(α(N)) (pratikte sabit); toplam O(N + Q).</p>
        <p><b>Naif çözüm neden yetmez:</b> Her yoldan sonra BFS/DFS ile bileşen saymak O(Q·(N+Q)) = ~8·10^10. "Her istasyonun bölge etiketini tut, birleşince küçük etiketliyi güncelle" yaklaşımı akıllıca yapılmazsa O(N²)\'ye çıkar.</p>
        <p><b>Sık hata:</b> Özyinelemeli <code>bul</code> yazmak: yol sıkıştırma olmadan zincir 2·10^5 derinliğe ulaşır ve <code>RecursionError</code> verir (gizli testteki zincir girdisi). Döngüyle yaz.</p>'''),
    hints=['Her istasyon için ebeveyn dizisi tut; kök = bölge temsilcisi.', 'Kökler farklıysa birleştir ve sayacı azalt; bul() fonksiyonunu döngüyle yaz.']))

# ---------------------------------------------------------------- a-160
P.append(dict(
    id='a-160', title='Aynı müşterinin dağınık kayıtları', track=T, diff='Orta',
    tags=['union-find', 'hash'], src='LeetCode 721 Accounts Merge benzeri',
    statement=D('''
        <p>Ilgaz Bank\'ın eski sistemlerinden gelen N müşteri kaydının her birinde bir veya daha fazla e-posta adresi var. İki kayıt <b>en az bir ortak e-posta</b> içeriyorsa aynı kişiye aittir; bu ilişki geçişlidir (A ile B, B ile C ortaksa üçü de aynı kişi).</p>
        <p>Kaç farklı kişi olduğunu ve her kişinin <b>farklı e-posta sayısını</b> büyükten küçüğe yaz.</p>'''),
    input='<p>İlk satırda N. Sonraki N satırın her biri: <code>m e1 e2 ... em</code> (e-posta sayısı ve adresler).</p>',
    output='<p>İlk satırda kişi sayısı, ikinci satırda e-posta sayıları (azalan).</p>',
    constraints='1 ≤ N ≤ 5·10^4, 1 ≤ m ≤ 10, toplam e-posta ≤ 2·10^5',
    samples=[('4\n2 ali@x.com ali@y.com\n1 ayse@x.com\n2 ali@y.com a.k@z.com\n1 ali@x.com\n',
              'Kayıt 1, 3, 4 ortak adreslerle bağlı: {ali@x, ali@y, a.k@z} → 3 e-posta. Ayşe ayrı: 1. Kişi sayısı 2.')],
    hidden=['1\n1 a@b\n', '2\n1 a@b\n1 a@b\n', '3\n2 a b\n2 c d\n2 b c\n', '3\n1 a\n1 b\n1 c\n', '4\n3 a b c\n1 d\n2 d e\n2 c x\n',
            {'gen': D('''
                import random
                random.seed(160)
                n = 50000
                print(n)
                for _ in range(n):
                    m = random.randint(1, 6)
                    print(m, *[f'u{random.randint(1, 120000)}@pp.com' for _ in range(m)])
                ''')},
            {'gen': D('''
                n = 50000
                print(n)
                for i in range(n):
                    print(2, f'k{i}@zincir.com', f'k{i + 1}@zincir.com')
                ''')}],
    start=D('''
        import sys
        input = sys.stdin.readline
        n = int(input())
        sahip = {}   # e-posta -> ilk görüldüğü kayıt
        ebeveyn = list(range(n))
        '''),
    sol=D('''
        import sys
        satirlar = sys.stdin.read().split('\\n')
        n = int(satirlar[0])
        ebeveyn = list(range(n))

        def bul(x):
            kok = x
            while ebeveyn[kok] != kok:
                kok = ebeveyn[kok]
            while ebeveyn[x] != kok:
                ebeveyn[x], x = kok, ebeveyn[x]
            return kok

        sahip = {}
        kayit_epostalari = []
        for i in range(n):
            parca = satirlar[i + 1].split()
            epostalar = parca[1:]
            kayit_epostalari.append(epostalar)
            for e in epostalar:
                if e in sahip:
                    a, b = bul(sahip[e]), bul(i)
                    if a != b:
                        ebeveyn[b] = a
                else:
                    sahip[e] = i
        kisi = {}
        for e, i in sahip.items():
            k = bul(i)
            kisi[k] = kisi.get(k, 0) + 1
        sayilar = sorted(kisi.values(), reverse=True)
        print(len(sayilar))
        print(*sayilar)
        '''),
    brute=D('''
        n = int(input()); R = [set(input().split()[1:]) for _ in range(n)]
        G = []
        for s in R:
            s = set(s)
            rest = []
            for g in G:
                if g & s: s |= g
                else: rest.append(g)
            G = rest + [s]
        c = sorted((len(g) for g in G), reverse=True)
        print(len(c)); print(*c)
        '''),
    rnd=lambda r: (lambda n: f"{n}\n" + ''.join((lambda m: f"{m} " + ' '.join(r.choice('abcdefgh') for _ in range(m)) + '\n')(r.randint(1, 3)) for _ in range(n)))(r.randint(1, 6)),
    editorial=D('''
        <p><b>Yaklaşım:</b> Kayıtları union-find düğümleri yap. Her e-postanın ilk görüldüğü kaydı sözlükte tut; aynı e-posta başka kayıtta görülünce iki kaydı birleştir. Sonda her e-postayı sahibi olan kaydın köküne say: bu, kişi başına farklı e-posta sayısını verir (sözlük her adresi bir kez içerdiği için tekrarlar kendiliğinden elenir).</p>
        <p><b>Karmaşıklık:</b> Toplam e-posta sayısı E için O(E · α(N)) + sonuçları sıralamak O(N log N).</p>
        <p><b>Naif çözüm neden yetmez:</b> "Ortak eleman kalmayana dek kümeleri birleştir" ya da her kayıt çiftini karşılaştırmak O(N²) küme işlemi; 5·10^4 kayıtta 10^9 mertebesi. Zincir hâlindeki gizli testte tekrar tekrar birleştirme her adımda büyüyen kümeleri kopyalar.</p>
        <p><b>Alternatif:</b> E-postaları düğüm, kayıtları kenar sayıp BFS/DFS ile bileşen bulmak da O(E)\'dir. <b>Sık hata:</b> Aynı kayıt içinde aynı e-posta iki kez yazılmışsa onu iki kez saymak.</p>'''),
    hints=['Her e-posta için "ilk sahibi" sözlüğü tut.', 'Aynı e-posta yeni kayıtta çıkarsa iki kaydı union-find ile birleştir.']))

# ---------------------------------------------------------------- a-161
P.append(dict(
    id='a-161', title='Arama kutusu önek sayacı', track=T, diff='Orta',
    tags=['trie', 'sözlük'], src='LeetCode 208 Implement Trie / HackerRank Contacts benzeri',
    statement=D('''
        <p>Anadolu Market\'in arama kutusu, kullanıcı yazarken "bu harflerle başlayan kaç ürün adı var?" bilgisini anlık gösteriyor. Ürün kataloğu gün içinde büyüyor. İşlemler:</p>
        <ul><li><code>EKLE w</code>: w ürün adını kataloğa ekle (aynı ad birden çok kez eklenebilir; her ekleme ayrı sayılır).</li>
        <li><code>SAY p</code>: katalogda p ile başlayan ad sayısını yaz.</li></ul>'''),
    input='<p>İlk satırda Q, sonraki Q satırda birer işlem. Kelimeler küçük İngilizce harflerden oluşur.</p>',
    output='<p>Her SAY için bir satır.</p>',
    constraints='1 ≤ Q ≤ 10^5, 1 ≤ |w|, |p| ≤ 12',
    samples=[('6\nEKLE elma\nEKLE elmas\nEKLE erik\nSAY el\nSAY e\nSAY ka\n', '"el" ile 2, "e" ile 3, "ka" ile 0 ad başlıyor.')],
    hidden=['1\nSAY a\n', '3\nEKLE a\nEKLE a\nSAY a\n', '4\nEKLE abc\nSAY abcd\nSAY abc\nSAY ab\n', '5\nSAY x\nEKLE xy\nSAY x\nEKLE x\nSAY x\n',
            '3\nEKLE kalem\nSAY kalemlik\nSAY k\n',
            {'gen': D('''
                import random
                random.seed(161)
                q = 100000
                print(q)
                out = []
                for i in range(q):
                    if random.random() < 0.6:
                        out.append('EKLE ' + ''.join(random.choice('abcd') for _ in range(random.randint(4, 12))))
                    else:
                        out.append('SAY ' + ''.join(random.choice('abcd') for _ in range(random.randint(1, 4))))
                print('\\n'.join(out))
                ''')}],
    start=D('''
        import sys
        input = sys.stdin.readline
        q = int(input())
        kok = {}   # her düğüm: {harf: alt_dugum, '#': bu düğümden geçen kelime sayısı}
        for _ in range(q):
            islem, kelime = input().split()
        '''),
    sol=D('''
        import sys
        satirlar = sys.stdin.read().split('\\n')
        q = int(satirlar[0])
        kok = {}
        cikti = []
        for k in range(1, q + 1):
            islem, kelime = satirlar[k].split()
            if islem == 'EKLE':
                d = kok
                for c in kelime:
                    alt = d.get(c)
                    if alt is None:
                        alt = d[c] = {'#': 0}
                    alt['#'] += 1
                    d = alt
            else:
                d = kok
                for c in kelime:
                    d = d.get(c)
                    if d is None:
                        break
                cikti.append(str(d['#']) if d is not None else '0')
        print('\\n'.join(cikti))
        '''),
    brute=D('''
        q = int(input()); W = []
        for _ in range(q):
            o, w = input().split()
            if o == 'EKLE': W.append(w)
            else: print(sum(1 for x in W if x.startswith(w)))
        '''),
    rnd=lambda r: (lambda q: f"{q}\n" + ''.join(f"{r.choice(['EKLE', 'SAY'])} {''.join(r.choice('ab') for _ in range(r.randint(1, 3)))}\n" for _ in range(q)))(r.randint(1, 10)),
    editorial=D('''
        <p><b>Yaklaşım:</b> Trie (önek ağacı). Her düğüm bir sözlük: harf → alt düğüm. Ek olarak her düğümde, o düğümden <b>geçen</b> kelime sayısını (<code>\'#\'</code>) tut. Ekleme sırasında yol boyunca her düğümün sayacını artır. Sorguda öneki takip et; yol kopuyorsa 0, aksi hâlde vardığın düğümün sayacı cevaptır.</p>
        <p><b>Karmaşıklık:</b> İşlem başına O(L), L ≤ 12; toplam O(Q · L).</p>
        <p><b>Naif çözüm neden yetmez:</b> Her SAY için tüm kelimelerde <code>startswith</code> denemek O(Q · W) — gizli testte ~6·10^4 kelime × 4·10^4 sorgu = 2,4·10^9 kontrol.</p>
        <p><b>Alternatif:</b> Her eklemede kelimenin tüm öneklerini bir <code>Counter</code>\'da artırmak da O(L) ve burada geçer; ama trie, otomatik tamamlama ("bu önekle başlayan ilk 5 kelime") gibi genişletmelere uygundur. <b>Sık hata:</b> Sayacı yalnız kelime sonunda tutmak: o zaman sorgu alt ağacın tamamını gezmek zorunda kalır.</p>'''),
    hints=['İç içe sözlüklerle bir önek ağacı kur.', 'Her düğümde oradan geçen kelime sayısını tut; SAY o düğümün sayacıdır.']))

# ---------------------------------------------------------------- a-162
P.append(dict(
    id='a-162', title='Yetki kodları arasında en büyük XOR', track=T, diff='Zor',
    tags=['trie', 'bit işlemleri', 'açgözlü'], src='LeetCode 421 Maximum XOR of Two Numbers benzeri',
    statement=D('''
        <p>Ilgaz Bank güvenlik ekibi, iki kullanıcının 30 bitlik yetki kodları ne kadar "zıt" diye ölçmek için kodların XOR\'unu kullanıyor. Denetim raporu için tüm kullanıcı çiftleri arasındaki <b>en büyük XOR</b> değeri gerekiyor.</p>
        <p>max(a<sub>i</sub> XOR a<sub>j</sub>) değerini yazdır (i ≠ j).</p>'''),
    input='<p>İlk satırda N. İkinci satırda N kod.</p>',
    output='<p>En büyük XOR.</p>',
    constraints='2 ≤ N ≤ 5·10^4, 0 ≤ kod &lt; 2^30',
    samples=[('6\n3 10 5 25 2 8\n', '5 XOR 25 = 00101 XOR 11001 = 11100 = 28.')],
    hidden=['2\n0 0\n', '2\n0 1073741823\n', '3\n7 7 7\n', '4\n1 2 4 8\n', '5\n14 70 53 83 49\n',
            {'gen': D('''
                import random
                random.seed(162)
                n = 50000
                print(n)
                print(*[random.randint(0, 2**30 - 1) for _ in range(n)])
                ''')},
            {'gen': D('''
                import random
                random.seed(1620)
                n = 50000
                print(n)
                print(*[random.randint(0, 2**29 - 1) | (1 << 29) for _ in range(n)])
                ''')}],
    start=D('''
        n = int(input())
        a = list(map(int, input().split()))
        en_iyi = 0
        # yüksek bitten başlayarak cevabı bit bit kur
        '''),
    sol=D('''
        n = int(input())
        a = list(map(int, input().split()))
        en_iyi = 0
        maske = 0
        for b in range(29, -1, -1):
            maske |= 1 << b
            onekler = {x & maske for x in a}
            aday = en_iyi | (1 << b)
            for p in onekler:
                if (p ^ aday) in onekler:
                    en_iyi = aday
                    break
        print(en_iyi)
        '''),
    brute=D('''
        n = int(input()); a = list(map(int, input().split()))
        print(max(a[i] ^ a[j] for i in range(n) for j in range(i+1, n)))
        '''),
    rnd=lambda r: (lambda n: f"{n}\n{ints(r, n, 0, 63)}\n")(r.randint(2, 9)),
    editorial=D('''
        <p><b>Yaklaşım (açgözlü bit bit):</b> XOR\'u büyütmenin en etkili yolu yüksek bitleri 1 yapmaktır. Cevabı en yüksek bitten başlayarak kur: şimdiye kadarki cevaba bu biti eklemeyi dene (<code>aday</code>). Kodların ilk (yüksek) bitlerinden oluşan önek kümesinde <code>p ^ aday</code> de varsa, XOR\'u <code>aday</code> olan iki kod vardır (çünkü p ^ q = aday ⇔ q = p ^ aday). Varsa biti kabul et.</p>
        <p><b>Trie alternatifi:</b> Kodları ikili trie\'ye (30 seviye) ekle; her kod için her seviyede mümkünse <b>ters</b> bite git. O(30 · N) ama Python\'da sözlüklü trie 3·10^6 düğüm adımı yapar, küme yaklaşımı daha hızlıdır.</p>
        <p><b>Karmaşıklık:</b> O(30 · N) zaman, O(N) bellek.</p>
        <p><b>Naif çözüm neden yetmez:</b> Tüm çiftlerin XOR\'u N(N−1)/2 ≈ 1,25·10^9 işlem.</p>
        <p><b>Sık hata:</b> Önek maskesini unutup tam kodları kümeye koymak (o zaman yalnız tam eşleşme ararsın) ve <code>p ^ aday in onekler</code> ifadesinin önceliğinden emin olmamak: karşılaştırmalar (<code>in</code> dahil) <code>^</code>\'den düşük önceliklidir, yani ifade <code>(p ^ aday) in onekler</code> olarak çalışır; yine de parantez yazmak okunabilirliği artırır.</p>'''),
    hints=['Yüksek biti 1 yapmak, alt bitlerin hepsinden değerlidir.', 'p ^ q = aday ise q = p ^ aday: önek kümesinde ara.']))

# ---------------------------------------------------------------- a-163
P.append(dict(
    id='a-163', title='Kur servisi için LRU önbellek', track=T, diff='Orta',
    tags=['LRU', 'OrderedDict', 'tasarım'], src='LeetCode 146 LRU Cache benzeri',
    statement=D('''
        <p>Ilgaz Bank\'ın döviz kuru servisi yavaş olduğu için sonuçlar C kapasiteli bir önbellekte tutuluyor. Önbellek dolduğunda <b>en uzun süredir kullanılmayan</b> (Least Recently Used) kayıt atılıyor. İşlemler:</p>
        <ul><li><code>GET k</code>: k anahtarının değerini yaz ve onu "en son kullanılan" yap; yoksa <code>-1</code> yaz.</li>
        <li><code>PUT k v</code>: k\'nin değerini v yap (varsa güncelle) ve en son kullanılan yap. Yeni anahtar eklenirken önbellek doluysa önce LRU kaydı at.</li></ul>'''),
    input='<p>İlk satırda C ve Q. Sonraki Q satırda birer işlem.</p>',
    output='<p>Her GET için bir satır.</p>',
    constraints='1 ≤ C ≤ 10^5, 1 ≤ Q ≤ 2·10^5, 0 ≤ k, v ≤ 10^9',
    samples=[('2 9\nPUT 1 1\nPUT 2 2\nGET 1\nPUT 3 3\nGET 2\nPUT 4 4\nGET 1\nGET 3\nGET 4\n',
              'GET 1 → 1 (1 tazelendi). PUT 3, en eski olan 2\'yi atar: GET 2 → −1. PUT 4, 1\'i atar. Sonra −1, 3, 4.')],
    hidden=['1 3\nPUT 5 50\nPUT 6 60\nGET 5\n', '1 3\nPUT 5 50\nPUT 5 55\nGET 5\n', '2 6\nPUT 1 1\nPUT 2 2\nPUT 1 10\nPUT 3 3\nGET 2\nGET 1\n',
            '3 4\nGET 0\nPUT 0 0\nGET 0\nGET 1\n', '2 7\nPUT 2 1\nPUT 1 1\nPUT 2 3\nPUT 4 1\nGET 1\nGET 2\nGET 4\n',
            {'gen': D('''
                import random
                random.seed(163)
                c, q = 50000, 200000
                print(c, q)
                out = []
                for _ in range(q):
                    k = random.randint(0, 80000)
                    out.append(f'GET {k}' if random.random() < 0.5 else f'PUT {k} {random.randint(0, 10**9)}')
                print('\\n'.join(out))
                ''')},
            {'gen': D('''
                c, q = 100000, 200000
                print(c, q)
                out = [f'PUT {i} {i}' for i in range(100000)] + [f'GET {i}' for i in range(0, 200000, 2)]
                print('\\n'.join(out))
                ''')}],
    start=D('''
        import sys
        from collections import OrderedDict
        input = sys.stdin.readline
        c, q = map(int, input().split())
        onbellek = OrderedDict()
        for _ in range(q):
            parca = input().split()
        '''),
    sol=D('''
        import sys
        from collections import OrderedDict
        satirlar = sys.stdin.read().split('\\n')
        c, q = map(int, satirlar[0].split())
        onbellek = OrderedDict()
        cikti = []
        for i in range(1, q + 1):
            parca = satirlar[i].split()
            k = parca[1]
            if parca[0] == 'GET':
                if k in onbellek:
                    onbellek.move_to_end(k)
                    cikti.append(onbellek[k])
                else:
                    cikti.append('-1')
            else:
                if k in onbellek:
                    onbellek.move_to_end(k)
                elif len(onbellek) >= c:
                    onbellek.popitem(last=False)
                onbellek[k] = parca[2]
        print('\\n'.join(cikti))
        '''),
    brute=D('''
        c, q = map(int, input().split()); L = []
        for _ in range(q):
            p = input().split()
            idx = next((i for i, (k, v) in enumerate(L) if k == p[1]), None)
            if p[0] == 'GET':
                if idx is None: print(-1)
                else: kv = L.pop(idx); L.append(kv); print(kv[1])
            else:
                if idx is not None: L.pop(idx)
                elif len(L) >= c: L.pop(0)
                L.append((p[1], p[2]))
        '''),
    rnd=lambda r: (lambda q: f"{r.randint(1, 3)} {q}\n" + ''.join(r.choice([f"GET {r.randint(0, 4)}\n", f"PUT {r.randint(0, 4)} {r.randint(0, 9)}\n"]) for _ in range(q)))(r.randint(1, 12)),
    editorial=D('''
        <p><b>Yaklaşım:</b> LRU iki şey ister: anahtarla O(1) erişim (sözlük) ve kullanım sırasını O(1) güncelleme (çift yönlü bağlı liste). Python\'da <code>collections.OrderedDict</code> ikisini birlikte sunar: <code>move_to_end(k)</code> kaydı en sona (en yeni) taşır, <code>popitem(last=False)</code> en baştakini (en eski) atar.</p>
        <p><b>Karmaşıklık:</b> Her işlem O(1); bellek O(C).</p>
        <p><b>Naif çözüm neden yetmez:</b> Kayıtları bir listede tutup her erişimde arayıp sona taşımak işlem başına O(C): gizli testte C = 10^5 ve 2·10^5 işlemle ~10^10 adım. Her kayda "son kullanım zamanı" yazıp tahliyede minimumu aramak da tahliye başına O(C).</p>
        <p><b>Mülakatta:</b> Genellikle OrderedDict kullanmadan, sözlük + kendi çift yönlü bağlı listeni (sahte baş/son düğümlerle) yazman istenir. <b>Sık hata:</b> Var olan anahtarı PUT ile güncellerken tahliye yapmak (kapasite aşılmıyor) ve GET\'te kaydı tazelemeyi unutmak.</p>'''),
    hints=['Sözlük + kullanım sırası birlikte gerekli.', 'OrderedDict.move_to_end ve popitem(last=False) tam bu iş için.']))

# ---------------------------------------------------------------- a-164
P.append(dict(
    id='a-164', title='En uzun ardışık fatura serisi', track=T, diff='Kolay',
    tags=['hash', 'küme'], src='LeetCode 128 Longest Consecutive Sequence benzeri',
    statement=D('''
        <p>Pusula İK\'nın muhasebe arşivinde fatura numaraları karışık sırada duruyor (bazıları tekrar taranmış). Denetçi, eksiksiz ardışık bir seri (ör. 100, 101, 102, 103) oluşturan <b>en uzun numara dizisinin</b> uzunluğunu istiyor; sıra önemli değil, yalnızca numaraların varlığı.</p>'''),
    input='<p>İlk satırda N. İkinci satırda N fatura numarası.</p>',
    output='<p>En uzun ardışık serinin uzunluğu.</p>',
    constraints='1 ≤ N ≤ 2·10^5, −10^9 ≤ numara ≤ 10^9',
    samples=[('6\n100 4 200 1 3 2\n', '1, 2, 3, 4 ardışık: uzunluk 4.'),
             ('5\n0 0 -1 1 1\n', 'Tekrarlar sayılmaz: −1, 0, 1 → 3.')],
    hidden=['1\n5\n', '2\n1000000000 -1000000000\n', '4\n7 7 7 7\n', '7\n9 1 4 7 3 -1 0\n', '10\n0 3 7 2 5 8 4 6 0 1\n',
            {'gen': D('''
                import random
                random.seed(164)
                n = 200000
                print(n)
                print(*[random.randint(-300000, 300000) for _ in range(n)])
                ''')},
            {'gen': D('''
                import random
                random.seed(1640)
                a = list(range(-100000, 100000))
                random.shuffle(a)
                print(len(a))
                print(*a)
                ''')}],
    start=D('''
        n = int(input())
        numaralar = set(map(int, input().split()))
        en_uzun = 0
        # yalnızca serinin başlangıcı olan numaralardan say
        '''),
    sol=D('''
        n = int(input())
        numaralar = set(map(int, input().split()))
        en_uzun = 0
        for x in numaralar:
            if x - 1 not in numaralar:
                y = x
                while y + 1 in numaralar:
                    y += 1
                if y - x + 1 > en_uzun:
                    en_uzun = y - x + 1
        print(en_uzun)
        '''),
    brute=D('''
        n = int(input()); s = sorted(set(map(int, input().split()))); b = c = 1
        for i in range(1, len(s)):
            c = c + 1 if s[i] == s[i-1] + 1 else 1; b = max(b, c)
        print(b)
        '''),
    rnd=lambda r: (lambda n: f"{n}\n{ints(r, n, -5, 5)}\n")(r.randint(1, 10)),
    editorial=D('''
        <p><b>Yaklaşım:</b> Numaraları bir kümeye koy (O(1) üyelik testi). Bir x\'ten saymaya yalnızca <code>x − 1</code> kümede <b>yoksa</b> başla; çünkü o zaman x bir serinin başıdır. Oradan <code>x+1, x+2, ...</code> kümede oldukça ilerle. Her numara en fazla bir kez "ilerleme" adımında ziyaret edilir.</p>
        <p><b>Karmaşıklık:</b> O(N) beklenen zaman, O(N) bellek. Sıralama ile O(N log N) çözüm de burada geçer.</p>
        <p><b>Naif çözüm neden yetmez:</b> Her numaradan başlayıp ileri saymak (başlangıç kontrolü olmadan) tek uzun seride O(N²) olur: 2·10^5 elemanlık ardışık gizli testte 2·10^10 adım. Listede <code>in</code> ile üyelik aramak da adım başına O(N).</p>
        <p><b>Sık hata:</b> Tekrarları iki kez saymak (kümeye çevirmek çözer) ve sıralı yaklaşımda eşit komşularda sayacı sıfırlamak.</p>'''),
    hints=['Kümeye çevir.', 'Yalnızca x−1 kümede yoksa x\'ten saymaya başla.']))

# ---------------------------------------------------------------- a-165
P.append(dict(
    id='a-165', title='Teslimat sürelerinin anlık medyanı', track=T, diff='Zor',
    tags=['heap', 'iki heap', 'medyan'], src='LeetCode 295 Find Median from Data Stream benzeri',
    statement=D('''
        <p>Lezzet Kurye\'nin canlı panosu, gün içinde tamamlanan her teslimattan sonra o ana kadarki teslimat sürelerinin <b>medyanını</b> gösteriyor (ortalama aşırı uçlardan çok etkilendiği için medyan tercih ediliyor). Eleman sayısı çiftse medyan ortadaki iki değerin ortalamasıdır.</p>
        <p>Her teslimattan sonra medyanı <b>bir ondalık basamakla</b> yaz (ör. <code>5.0</code>, <code>7.5</code>).</p>'''),
    input='<p>İlk satırda N. İkinci satırda N teslimat süresi (dakika, tam sayı).</p>',
    output='<p>Tek satırda N değer.</p>',
    constraints='1 ≤ N ≤ 2·10^5, 1 ≤ süre ≤ 10^6',
    samples=[('5\n5 15 1 3 8\n', '[5]→5.0; [5,15]→10.0; [1,5,15]→5.0; [1,3,5,15]→4.0; [1,3,5,8,15]→5.0.')],
    hidden=['1\n7\n', '2\n1 2\n', '4\n4 4 4 4\n', '6\n10 9 8 7 6 5\n', '6\n1 1000000 1 1000000 1 1000000\n',
            {'gen': D('''
                import random
                random.seed(165)
                n = 200000
                print(n)
                print(*[random.randint(1, 10**6) for _ in range(n)])
                ''')},
            {'gen': D('''
                n = 200000
                print(n)
                print(*range(n, 0, -1))
                ''')}],
    start=D('''
        import heapq
        n = int(input())
        sureler = list(map(int, input().split()))
        alt = []   # küçük yarı: max-heap (negatif değerlerle)
        ust = []   # büyük yarı: min-heap
        '''),
    sol=D('''
        import heapq
        n = int(input())
        sureler = list(map(int, input().split()))
        alt = []
        ust = []
        cikti = []
        for x in sureler:
            if not alt or x <= -alt[0]:
                heapq.heappush(alt, -x)
            else:
                heapq.heappush(ust, x)
            if len(alt) > len(ust) + 1:
                heapq.heappush(ust, -heapq.heappop(alt))
            elif len(ust) > len(alt):
                heapq.heappush(alt, -heapq.heappop(ust))
            if len(alt) > len(ust):
                cikti.append(f'{-alt[0]:.1f}')
            else:
                cikti.append(f'{(-alt[0] + ust[0]) / 2:.1f}')
        print(' '.join(cikti))
        '''),
    brute=D('''
        import statistics
        n = int(input()); a = list(map(int, input().split()))
        print(' '.join(f'{statistics.median(a[:i+1]):.1f}' for i in range(n)))
        '''),
    rnd=lambda r: (lambda n: f"{n}\n{ints(r, n, 1, 9)}\n")(r.randint(1, 10)),
    editorial=D('''
        <p><b>Yaklaşım:</b> Verinin küçük yarısını bir <b>max-heap</b>\'te (Python\'da değerleri negatif yaparak), büyük yarısını bir <b>min-heap</b>\'te tut. Alt yarının boyutu ya üst yarıya eşit ya da bir fazla olsun. Yeni değeri uygun yarıya ekle, sonra boyutları dengelemek için gerekirse bir elemanı diğer heap\'e taşı. Medyan: tek sayıda eleman varsa alt yarının tepesi, çiftse iki tepenin ortalaması.</p>
        <p><b>Karmaşıklık:</b> Ekleme başına O(log N), medyan O(1); toplam O(N log N).</p>
        <p><b>Naif çözüm neden yetmez:</b> Her adımda sıralamak O(N² log N); <code>bisect.insort</code> ile sıralı liste O(N²) kaydırma (2·10^5\'te ~2·10^10 bayt taşıma, CPython\'da çok yavaş; gizli testteki azalan dizi her eklemeyi listenin başına yaptırır).</p>
        <p><b>Sık hata:</b> Max-heap için negatifleri geri çevirmeyi unutmak, dengeleme koşulunu tek yönlü yazmak ve çift sayıda elemanda ortalamayı tam sayı bölmesiyle (<code>//</code>) almak.</p>'''),
    hints=['Küçük yarı ve büyük yarı için iki heap.', 'Python heapq min-heap\'tir; max-heap için değerleri negatif sakla.', 'Boyut farkı en fazla 1 olacak şekilde dengele.']))
