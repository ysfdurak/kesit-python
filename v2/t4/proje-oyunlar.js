/* PythonPatika — Mini projeler: oyunlar ve araçlar — temel / Bitirme */
(function (W) {
'use strict';
const L = W.PY_LESSONS = W.PY_LESSONS || [];
L.push(
{ id: 'proje-oyunlar',
  lv: 'temel',
  mod: 'Bitirme',
  min: 60,
  title: 'Mini projeler: oyunlar ve araçlar',
  sum: 'Sayı tahmin, adam asmaca, taş-kağıt-makas, şifre üretici, Sezar şifresi, hesap bölüşme ve ATM menüsünü gereksinimden tasarıma, adım adım inşadan teste kadar kurarak temel kavramları gerçek programlarda birleştirirsin.',
  goals: [
    'Bir projeyi gereksinim, tasarım, inşa ve test adımlarıyla planlayabilirim.',
    'Oyun mantığını saf fonksiyonlara, kullanıcı etkileşimini döngü fonksiyonuna ayırabilirim.',
    'random.seed ve random.Random ile rastgele davranan kodu tekrarlanabilir ve test edilebilir yapabilirim.',
    'while, match, sözlük, küme ve metin işlemlerini birleştirerek menü tabanlı programlar yazabilirim.',
    'Girdiyi doğrulayıp geçersiz değerlerde programın çökmesini önleyebilirim.'
  ],
  body: `
<h2>Neden mini projeler?</h2>
<p>Değişken, koşul, döngü, fonksiyon, liste ve sözlüğü tek tek öğrendin. Gerçek program ise bunların <b>birlikte</b> çalışmasıdır ve asıl beceri boş bir dosyaya bakıp "nereden başlayacağım?" sorusunu yanıtlayabilmektir. Bu derste yedi küçük, eğlenceli ama ciddi biçimde tasarlanmış proje yapacağız. Her biri aynı dört adımı izler:</p>
<div class="steps-list"><ol>
<li><b>Gereksinimler:</b> program tam olarak ne yapmalı? Kenar durumlar neler?</li>
<li><b>Tasarım:</b> işi hangi fonksiyonlara bölerim? Hangisi hesap yapar, hangisi kullanıcıyla konuşur?</li>
<li><b>Adım adım inşa:</b> en küçük çalışan parçayı yaz, dene, sonra büyüt.</li>
<li><b>Test:</b> fonksiyonları tek tek, oyun döngüsünü hazır girdilerle dene.</li>
</ol></div>
<div class="tbl-wrap"><table>
<tr><th>Proje</th><th>Birleştirdiği kavramlar</th></tr>
<tr><td>Sayı tahmin oyunu</td><td>random + seed, while, int dönüşümü, try/except</td></tr>
<tr><td>Adam asmaca</td><td>küme, metin birleştirme, oyun durumu</td></tr>
<tr><td>Taş-kağıt-makas</td><td>sözlükle kural tablosu, random.choice, skor</td></tr>
<tr><td>Şifre üretici</td><td>string modülü, random.Random, kurallı üretim</td></tr>
<tr><td>Sezar şifreleme</td><td>ord/chr, mod aritmetiği, metin dönüştürme</td></tr>
<tr><td>Bahşiş ve hesap bölüşme</td><td>kayan nokta, yuvarlama, doğrulama</td></tr>
<tr><td>ATM menüsü</td><td>while True, match, durum (bakiye) yönetimi</td></tr>
</table></div>

<h2>Tasarımın altın kuralı: mantığı girdi/çıktıdan ayır</h2>
<p>Yeni başlayan biri sayı tahmin oyununu tek bir <code>while</code> içinde, <code>input</code> ve <code>print</code> arasına gömülmüş <code>if</code>'lerle yazar. Çalışır ama test edilemez: her denemede klavyeden sayı girmen gerekir. Profesyonel yol iki katmandır:</p>
<ul>
<li><b>Saf fonksiyonlar</b> (mantık): girdi alır, değer döndürür, ekrana dokunmaz. <code>tahmin_degerlendir(50, 37)</code> → <code>"küçük"</code>.</li>
<li><b>Döngü fonksiyonu</b> (arayüz): kullanıcıyla konuşur, mantık fonksiyonlarını çağırır. Girdiyi <code>girdi=input</code> parametresiyle alır.</li>
</ul>
<p>Son madde küçük ama güçlü bir hiledir: fonksiyon varsayılan olarak gerçek <code>input</code>'u kullanır, testte ise ona hazır cevaplar veren bir fonksiyon verirsin. Buna bağımlılık enjeksiyonu (dependency injection) denir.</p>
<pre class="py">def selamla(girdi=input):
    ad = girdi("Adın? ")
    return f"Merhaba {ad}!"

cevaplar = iter(["Ayşe"])
print(selamla(lambda istem: next(cevaplar)))   # klavye beklemeden test</pre>

<h2>Proje 1: Sayı tahmin oyunu</h2>
<p><b>Gereksinimler:</b> bilgisayar 1-100 arasında sayı tutar; oyuncunun 7 hakkı var; her tahminde "daha büyük/küçük" ipucu verilir; sayı olmayan ya da aralık dışı girdi hak yemez; bilinirse kaç denemede bilindiği, bilinemezse sayı söylenir.</p>
<p><b>Tasarım:</b> <code>tahmini_oku(metin)</code> → int ya da None; <code>tahmin_degerlendir(tahmin, hedef)</code> → "büyük" / "küçük" / "doğru"; <code>oyna(hedef, hak, girdi)</code> → döngü.</p>
<div class="steps-list"><ol>
<li>Önce <code>tahmin_degerlendir</code>'i yaz ve üç durumla dene; en kolay ve en önemli parça budur.</li>
<li><code>tahmini_oku</code>: <code>int()</code>'i try içine al, aralığı denetle.</li>
<li>Döngü: hak bitene kadar sor; geçersiz girdide <code>continue</code>.</li>
<li>Rastgele hedefi en dışta üret ve <code>random.seed</code> ile sabitlenebilir bırak: test ederken hep aynı sayı gelsin.</li>
</ol></div>
<pre class="py">import random

def tahmini_oku(metin, alt=1, ust=100):
    try:
        sayi = int(metin)
    except ValueError:
        return None
    return sayi if alt &lt;= sayi &lt;= ust else None

def tahmin_degerlendir(tahmin, hedef):
    if tahmin &lt; hedef:
        return "büyük"
    if tahmin &gt; hedef:
        return "küçük"
    return "doğru"

def oyna(hedef, hak=7, girdi=input):
    deneme = 0
    while deneme &lt; hak:
        tahmin = tahmini_oku(girdi("Tahmin: "))
        if tahmin is None:
            print("1-100 arası bir sayı gir.")
            continue
        deneme += 1
        sonuc = tahmin_degerlendir(tahmin, hedef)
        if sonuc == "doğru":
            print(f"Bildin! {deneme} denemede.")
            return deneme
        print(f"Daha {sonuc} bir sayı dene.")
    print(f"Hakkın bitti, sayı {hedef} idi.")
    return None

random.seed(42)
hedef = random.randint(1, 100)
cevaplar = iter(["50", "on", "25", str(hedef)])
oyna(hedef, girdi=lambda istem: next(cevaplar))</pre>
<p>Kendi bilgisayarında gerçek oyun için son satırı <code>oyna(random.randint(1, 100))</code> yapman yeter. İkili arama (binary search) stratejisiyle (hep aralığın ortasını söyle) 1-100 arası her sayı en fazla 7 denemede bulunur; hak sayısının 7 olmasının nedeni budur.</p>

<h2>Proje 2: Adam asmaca</h2>
<p><b>Gereksinimler:</b> gizli kelime harf harf tahmin edilir; bilinen harfler açılır, bilinmeyenler <code>_</code>; 6 yanlışta oyun biter; aynı harfi tekrar söylemek hak yemez.</p>
<p><b>Tasarım:</b> oyun durumunu iki kümede tut: <code>dogru</code> ve <code>yanlis</code> harfler. Ekranda görünen her şey bu iki kümeden <b>hesaplanır</b>; ayrı sayaçlar tutmazsın, böylece tutarsızlık da olmaz.</p>
<pre class="py">MAX_HATA = 6

def maske(kelime, tahminler):
    return " ".join(h if h in tahminler else "_" for h in kelime)

def kazandi_mi(kelime, tahminler):
    return set(kelime) &lt;= tahminler

def adam_asmaca(kelime, girdi=input):
    dogru, yanlis = set(), set()
    while len(yanlis) &lt; MAX_HATA and not kazandi_mi(kelime, dogru):
        harf = girdi(f"{maske(kelime, dogru)}  Harf: ").strip().lower()
        if harf in dogru | yanlis:
            print("Bunu zaten söyledin.")
        elif harf in kelime:
            dogru.add(harf)
        else:
            yanlis.add(harf)
            print(f"Yok! Kalan hak: {MAX_HATA - len(yanlis)}")
    print("Kazandın!" if kazandi_mi(kelime, dogru) else f"Kaybettin, kelime: {kelime}")

cevaplar = iter(["a", "e", "k", "a", "n", "r"])
adam_asmaca("ankara", lambda istem: (print(istem), next(cevaplar))[1])</pre>
<p><code>set(kelime) &lt;= tahminler</code> "kelimedeki tüm harfler tahmin edildi mi?" sorusunu tek ifadede yanıtlar (alt küme). Son satırdaki lambda, testte istemi de ekrana yazar ki oyunun akışını görebilesin.</p>

<h2>Proje 3: Taş-kağıt-makas</h2>
<p><b>Tasarım:</b> kuralı <code>if</code> merdiveniyle değil, <b>veriyle</b> anlat: "kim kimi yener" bir sözlüktür. Yeni bir seçenek (kertenkele, Spock) eklemek kod değil veri değişikliği olur.</p>
<pre class="py">import random

YENER = {"taş": "makas", "makas": "kağıt", "kağıt": "taş"}

def kazanan(oyuncu, bilgisayar):
    if oyuncu not in YENER or bilgisayar not in YENER:
        raise ValueError("geçersiz seçim")
    if oyuncu == bilgisayar:
        return "berabere"
    return "oyuncu" if YENER[oyuncu] == bilgisayar else "bilgisayar"

rng = random.Random(7)                 # kendi tohumlu üreteci
skor = {"oyuncu": 0, "bilgisayar": 0, "berabere": 0}
for secim in ["taş", "kağıt", "makas", "taş"]:
    pc = rng.choice(list(YENER))
    sonuc = kazanan(secim, pc)
    skor[sonuc] += 1
    print(f"{secim:6} - {pc:6} → {sonuc}")
print(skor)</pre>
<p><code>random.Random(7)</code> programın geri kalanını etkilemeyen, kendine ait bir rastgele üreteç oluşturur; testte global <code>random.seed</code> yerine bunu tercih etmek daha temizdir.</p>

<h2>Proje 4: Şifre üretici</h2>
<p><b>Gereksinimler:</b> en az 8 karakter; en az bir küçük harf, bir büyük harf, bir rakam ve bir sembol. <b>Tasarım:</b> önce her gruptan birer karakter seç (kuralı garanti et), kalan uzunluğu tüm havuzdan doldur, sonra karıştır (yoksa ilk dört karakter hep aynı düzende olur).</p>
<pre class="py">import random
import string

SEMBOLLER = "!@#%&amp;*?"

def sifre_uret(uzunluk=12, rng=random):
    if uzunluk &lt; 8:
        raise ValueError("en az 8 karakter")
    gruplar = [string.ascii_lowercase, string.ascii_uppercase, string.digits, SEMBOLLER]
    karakterler = [rng.choice(g) for g in gruplar]
    havuz = "".join(gruplar)
    karakterler += [rng.choice(havuz) for _ in range(uzunluk - len(gruplar))]
    rng.shuffle(karakterler)
    return "".join(karakterler)

print(sifre_uret(12, random.Random(1)))
print(sifre_uret(12, random.Random(1)))   # aynı tohum → aynı şifre</pre>
<div class="warn"><b>Gerçek şifre için random değil secrets</b><code>random</code> modülü tahmin edilebilir bir üreteç kullanır; oyun ve simülasyon içindir. Gerçek şifre, token ya da doğrulama kodu üretirken <code>secrets</code> modülünü kullan: <code>secrets.choice(havuz)</code>. Bu derste tohumla test edebilmek için <code>random</code> kullanıyoruz.</div>

<h2>Proje 5: Sezar şifreleme</h2>
<p>Her harfi alfabede k adım kaydır: k=3 için A→D, Z→C. Sona gelince başa dönmek mod aritmetiğidir: <code>(konum + k) % 26</code>. Çözmek, ters yönde kaydırmaktır: <code>sezar(metin, -k)</code>. Ayrı bir çözme algoritması yazmana gerek yok.</p>
<pre class="py">def sezar(metin, k):
    sonuc = []
    for h in metin:
        if "A" &lt;= h &lt;= "Z":
            sonuc.append(chr((ord(h) - ord("A") + k) % 26 + ord("A")))
        elif "a" &lt;= h &lt;= "z":
            sonuc.append(chr((ord(h) - ord("a") + k) % 26 + ord("a")))
        else:
            sonuc.append(h)
    return "".join(sonuc)

gizli = sezar("Toplanti Cuma 14:00", 3)
print(gizli)
print(sezar(gizli, -3))
for k in range(1, 4):                      # kaba kuvvetle kırma
    print(k, sezar(gizli, -k))</pre>
<p>Yalnızca 25 olası anahtar olduğu için Sezar şifresi bir döngüyle kırılır; tarihsel bir oyuncaktır, gerçek güvenlik değildir. Türkçe alfabeyle (29 harf) çalışan sürümünü Meydan okuma aşamasında yazacaksın.</p>

<h2>Proje 6: Bahşiş ve hesap bölüşme</h2>
<p><b>Gereksinimler:</b> hesap tutarı, bahşiş yüzdesi ve kişi sayısı alınır; bahşiş, toplam ve kişi başı tutar 2 ondalıkla verilir; kişi sayısı en az 1, tutar negatif olamaz.</p>
<pre class="py">def hesap_bolustur(hesap, bahsis_yuzde, kisi):
    if kisi &lt; 1 or hesap &lt; 0 or bahsis_yuzde &lt; 0:
        raise ValueError("geçersiz değer")
    bahsis = hesap * bahsis_yuzde / 100
    toplam = hesap + bahsis
    return round(bahsis, 2), round(toplam, 2), round(toplam / kisi, 2)

bahsis, toplam, kisi_basi = hesap_bolustur(1240, 12.5, 3)
print(f"Bahşiş: {bahsis:.2f} TL | Toplam: {toplam:.2f} TL | Kişi başı: {kisi_basi:.2f} TL")</pre>
<p>Kuruş farkına dikkat: 1395 TL'yi 3 kişiye bölünce 465.00 çıkar ama 1000 TL'yi 3'e bölünce 333.33 × 3 = 999.99 olur. Gerçek bir uygulamada son kişiye kalan kuruş eklenir ya da para birimi kuruş cinsinden tamsayıyla tutulur.</p>

<h2>Proje 7: ATM menüsü</h2>
<p><b>Tasarım:</b> sonsuz döngü (<code>while True</code>) menüyü gösterir, <code>match</code> seçime göre dallanır, <code>return</code> ya da <code>break</code> çıkışı sağlar. Bakiye döngü boyunca yaşayan <b>durumdur</b> (state).</p>
<pre class="py">def atm(bakiye, girdi=input):
    while True:
        secim = girdi("1) Bakiye 2) Yatır 3) Çek 4) Çıkış: ").strip()
        match secim:
            case "1":
                print(f"Bakiye: {bakiye:.2f} TL")
            case "2" | "3":
                tutar = float(girdi("Tutar: "))
                if secim == "3" and tutar &gt; bakiye:
                    print("Yetersiz bakiye")
                    continue
                bakiye += tutar if secim == "2" else -tutar
                print(f"Yeni bakiye: {bakiye:.2f} TL")
            case "4":
                print("İyi günler!")
                return bakiye
            case _:
                print("Geçersiz seçim")

cevaplar = iter(["1", "2", "250", "3", "5000", "9", "4"])
print(atm(1000, lambda istem: next(cevaplar)))</pre>
<p>Bu sürümde <code>float("abc")</code> programı çökertir; alıştırmalarda tutarı doğrulayan ve PIN denetimi ekleyen sağlam sürümü yazacaksın.</p>

<div class="note"><b>Gerçek işte</b>Bu projeler oyuncak gibi görünse de aynı kalıplar her yerdedir: ATM menüsü bir komut satırı aracının ya da sohbet botunun ana döngüsüdür; taş-kağıt-makas sözlüğü bir iş kuralı tablosudur (kampanya kuralları, onay matrisleri); şifre üretici kurallı veri üretimidir (test verisi, kupon kodları). "Mantığı arayüzden ayır" ilkesi de web uygulamalarında aynen geçerlidir: hesap fonksiyonları Flask'tan da, mobil uygulamadan da, testten de çağrılabilir. Mülakatlarda istenen ev ödevleri de çoğunlukla bu büyüklüktedir ve değerlendirmede çalışmasından çok tasarımına ve testlerine bakılır.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Durum makinesi olarak oyun</h3>
<p>Her oyun bir durum makinesidir (state machine): adam asmacada durum (doğru, yanlış harfler), olay (yeni tahmin), geçiş (kümeye ekle), bitiş koşulu (kazandı ya da 6 hata). Durumu tek bir yapıda tutup "durum + olay → yeni durum" fonksiyonu yazarsan, oyunun her anını test edebilir, kaydedip geri yükleyebilir, hatta geri al (undo) özelliği ekleyebilirsin.</p>
<h3>Tekrarlanabilir rastgelelik</h3>
<p>Rastgelelik içeren kodu test etmenin iki yolu var: tohumu sabitlemek (<code>random.Random(42)</code>) ya da sonucun <b>özelliklerini</b> test etmek (şifrenin uzunluğu, içerdiği karakter grupları). İyi test ikisini birlikte kullanır. Üreteci parametre olarak almak (<code>rng=random</code>) ise testte sabit tohumlu, gerçekte <code>secrets.SystemRandom()</code> gibi güvenli bir üreteç vermeni sağlar.</p>
<h3>Sonraki adım: arayüz</h3>
<p>Mantık ayrı olduğu için aynı fonksiyonlarla terminal yerine bir grafik arayüz (tkinter), web sayfası (Flask) ya da Discord botu yazabilirsin; yalnızca döngü katmanı değişir. Orta seviyede bu projeleri sınıflarla (<code>class AdamAsmaca</code>) ve testlerle yeniden kuracaksın.</p>
</section>
`,
  ex: [
    { t: 'mc',
      stage: 'Isınma',
      q: 'Sayı tahmin oyununu test ederken programın başında <code>random.seed(42)</code> çağırmanın amacı nedir?',
      o: [
        'Üretilen sayıların daha rastgele ve tahmin edilemez olması',
        'Her çalıştırmada aynı rastgele dizinin üretilmesi',
        'Üretilecek sayıları 0 ile 42 arasında sınırlamak',
        'Rastgele sayı üretimini hızlandırıp bellek kazanmak'
      ],
      a: 1,
      why: 'seed, sözde rastgele üretecin başlangıç noktasını sabitler: aynı tohum her seferinde aynı diziyi verir. Böylece "hedef 37 iken şu girdilerle oyun nasıl biter?" sorusunu tekrar tekrar test edebilirsin.' },
    { t: 'mc',
      stage: 'Isınma',
      q: '<code>kazanan(oyuncu, bilgisayar)</code> gibi mantık fonksiyonlarını <code>input</code>/<code>print</code> içeren oyun döngüsünden ayrı yazmanın asıl faydası nedir?',
      o: [
        'Program belirgin biçimde daha hızlı çalışır ve az bellek harcar',
        'Mantık klavye beklemeden test edilir, başka arayüzde de kullanılır',
        'input() ve print() çağrılarına artık hiç gerek kalmaz',
        'Python, fonksiyonsuz yazılmış while döngüsüne izin vermez'
      ],
      a: 1,
      why: 'Saf fonksiyon girdi alıp değer döndürür; onu assert ile saniyeler içinde yüzlerce durumla deneyebilirsin. Aynı fonksiyon yarın bir web sayfasından ya da bottan da çağrılabilir. Hız farkı yoktur ve döngü katmanı yine input/print kullanır.' },
    { t: 'predict',
      stage: 'Kodu oku',
      q: 'Sezar kaydırması: bu kod ne yazdırır?',
      code: 'def kaydir(harf, k):\n    return chr((ord(harf) - ord("A") + k) % 26 + ord("A"))\n\nprint(kaydir("A", 3), kaydir("Y", 3), kaydir("C", -3))\n',
      o: ['D B Z', 'D A Z', 'D B @', 'D Z B'],
      a: 0,
      why: 'Y alfabede 24. konumdadır (0\'dan sayınca); 24 + 3 = 27, 27 % 26 = 1 → B. C (2) için 2 - 3 = -1; Python\'da -1 % 26 = 25 → Z. Mod işlemi sayesinde alfabenin iki ucunda da başa/sona sarılır.' },
    { t: 'predict',
      stage: 'Kodu oku',
      q: 'Adam asmaca durumu: bu kod ne yazdırır?',
      code: 'kelime = "ankara"\ntahminler = {"a", "k", "e"}\nprint(" ".join(h if h in tahminler else "_" for h in kelime))\nprint(len(set(kelime) - tahminler))\n',
      o: ['a _ k a _ a\n3', 'a _ k a _ a\n2', 'a n k a r a\n2', 'a _ k _ _ _\n2'],
      a: 1,
      why: 'Maske her harfi tahmin edilmişse kendisiyle, değilse _ ile gösterir; "a" üç yerde de açılır. set("ankara") = {a, n, k, r}; tahminleri çıkarınca {n, r} kalır: 2 harf. "e" kelimede olmadığı için fark kümesini etkilemez.' },
    { t: 'predict',
      stage: 'Kodu oku',
      q: 'Kural tablosu sözlükte: bu kod ne yazdırır?',
      code: 'YENER = {"taş": "makas", "makas": "kağıt", "kağıt": "taş"}\n\ndef kazanan(o, b):\n    if o == b:\n        return "berabere"\n    return "oyuncu" if YENER[o] == b else "bilgisayar"\n\nprint(kazanan("taş", "kağıt"), kazanan("makas", "kağıt"), kazanan("taş", "taş"))\n',
      o: ['oyuncu bilgisayar berabere', 'bilgisayar oyuncu berabere', 'bilgisayar bilgisayar berabere', 'oyuncu oyuncu berabere'],
      a: 1,
      why: 'YENER["taş"] "makas"tır, bilgisayar kağıt seçmişse oyuncu kaybeder. YENER["makas"] "kağıt"tır, bu yüzden makas kağıdı yener. Aynı seçim berabere.' },
    { t: 'order',
      stage: 'Kodu oku',
      q: '<p>Hesap bölüşme fonksiyonunu ve kullanımını doğru sıraya koy.</p>',
      lines: [
        'def hesap_bolustur(hesap, bahsis_yuzde, kisi):',
        '    bahsis = hesap * bahsis_yuzde / 100',
        '    toplam = hesap + bahsis',
        '    return round(toplam / kisi, 2)',
        'pay = hesap_bolustur(1240, 10, 4)',
        'print(f"Kişi başı: {pay} TL")'
      ],
      expect: 'Kişi başı: 341.0 TL\n',
      hint: 'Her satır bir öncekinin ürettiği değeri kullanıyor: bahşiş → toplam → kişi başı.',
      why: 'Bahşiş tutarı (124.0) toplamdan önce hesaplanmalı, toplam (1364.0) da bölmeden önce. Fonksiyon tanımı çağrısından önce gelmeli.' },
    { id: 'proje-oyunlar-r1',
      t: 'code',
      stage: 'Rehberli',
      diff: 1,
      q: '<p>Sayı tahmin oyununun iki mantık fonksiyonunu yaz:</p><ul><li><code>tahmini_oku(metin, alt=1, ust=100)</code>: metnin baş/son boşluklarını at, tam sayıya çevir; çevrilemiyorsa ya da aralık dışındaysa <code>None</code>, yoksa sayıyı döndür.</li><li><code>tahmin_degerlendir(tahmin, hedef)</code>: tahmin küçükse <code>"Daha büyük"</code>, büyükse <code>"Daha küçük"</code>, eşitse <code>"Bildin!"</code> döndür.</li></ul>',
      guide: [
        'tahmini_oku içinde int(metin.strip()) çağrısını try bloğuna al.',
        'ValueError olursa None döndür.',
        'Sayı alt-ust aralığında değilse de None döndür (zincirli karşılaştırma).',
        'tahmin_degerlendir\'de iki if ve bir son return yeterli (erken dönüş).'
      ],
      example: 'def yas_oku(metin):\n    try:\n        yas = int(metin.strip())\n    except ValueError:\n        return None\n    return yas if 0 <= yas <= 120 else None\n\nprint(yas_oku(" 34 "), yas_oku("otuz"), yas_oku("150"))\n',
      start: 'def tahmini_oku(metin, alt=1, ust=100):\n    # TODO: int(metin.strip()) dene; ValueError ise None\n    # TODO: aralık dışıysa None, değilse sayı\n    pass\n\n\ndef tahmin_degerlendir(tahmin, hedef):\n    # TODO: "Daha büyük" / "Daha küçük" / "Bildin!"\n    pass\n',
      sol: 'def tahmini_oku(metin, alt=1, ust=100):\n    try:\n        sayi = int(metin.strip())\n    except ValueError:\n        return None\n    if alt <= sayi <= ust:\n        return sayi\n    return None\n\n\ndef tahmin_degerlendir(tahmin, hedef):\n    if tahmin < hedef:\n        return "Daha büyük"\n    if tahmin > hedef:\n        return "Daha küçük"\n    return "Bildin!"\n',
      tests: 'assert tahmini_oku("42") == 42, "\\"42\\" → 42"\nassert tahmini_oku(" 7 ") == 7, "Boşluklar atılmalı"\nassert tahmini_oku("yedi") is None, "Sayı olmayan metin None"\nassert tahmini_oku("3.5") is None, "Ondalıklı metin tam sayı değil: None"\nassert tahmini_oku("0") is None and tahmini_oku("101") is None, "Aralık dışı None"\nassert tahmini_oku("1") == 1 and tahmini_oku("100") == 100, "Sınırlar dahil"\nassert tahmini_oku("15", alt=1, ust=10) is None, "alt/ust parametreleri kullanılmalı"\nassert tahmin_degerlendir(30, 37) == "Daha büyük", "Tahmin küçükse daha büyük denemeli"\nassert tahmin_degerlendir(50, 37) == "Daha küçük", "Tahmin büyükse daha küçük denemeli"\nassert tahmin_degerlendir(37, 37) == "Bildin!", "Eşitse Bildin!"\n',
      hints: [
        'int("3.5") ve int("yedi") ikisi de ValueError verir; ikisini de aynı except yakalar.',
        'Aralık için: if alt <= sayi <= ust: return sayi',
        'tahmin < hedef ise oyuncu daha BÜYÜK bir sayı denemeli.'
      ],
      why: 'Girdiyi okuma ve değerlendirme oyunun beyni; ikisi de saf fonksiyon olduğu için klavye olmadan, birkaç assert ile her durumu denedin. Döngü bunları yalnızca çağıracak.' },
    { id: 'proje-oyunlar-r2',
      t: 'code',
      stage: 'Rehberli',
      diff: 1,
      q: '<p>Adam asmacanın iki yardımcısını yaz (kelimeler küçük harflidir):</p><ul><li><code>maske(kelime, tahminler)</code>: tahmin edilen harfleri göster, diğerlerini <code>_</code> yap, aralarına birer boşluk koy. Kelimedeki boşluk karakteri (iki kelimeli ifadelerde) her zaman <code>/</code> olarak görünsün: <code>maske("iyi gunler", {"i"})</code> → <code>"i _ i / _ _ _ _ _ _"</code></li><li><code>kazandi_mi(kelime, tahminler)</code>: kelimedeki tüm harfler (boşluk hariç) tahmin edildiyse True.</li></ul>',
      guide: [
        'Kelimenin her karakteri için bir parça üret: boşluksa "/", tahmin edildiyse harfin kendisi, değilse "_".',
        'Parçaları " ".join ile birleştir.',
        'kazandi_mi için kelimedeki harflerin kümesini al, boşluğu çıkar.',
        'Bu küme tahminlerin alt kümesi mi? (<= operatörü ya da issubset)'
      ],
      example: 'kod = "AM-42"\ngosterim = " ".join("#" if k.isdigit() else k for k in kod)\nprint(gosterim)\ngerekli = {"süt", "ekmek"}\nsepet = {"ekmek", "süt", "çay"}\nprint(gerekli <= sepet, gerekli - {"süt"})\n',
      start: 'def maske(kelime, tahminler):\n    parcalar = []\n    for h in kelime:\n        # TODO: boşluk → "/", tahmin edilmiş → h, diğer → "_"\n        pass\n    return " ".join(parcalar)\n\n\ndef kazandi_mi(kelime, tahminler):\n    # TODO: boşluk hariç harf kümesi tahminlerin alt kümesi mi?\n    pass\n',
      sol: 'def maske(kelime, tahminler):\n    parcalar = []\n    for h in kelime:\n        if h == " ":\n            parcalar.append("/")\n        elif h in tahminler:\n            parcalar.append(h)\n        else:\n            parcalar.append("_")\n    return " ".join(parcalar)\n\n\ndef kazandi_mi(kelime, tahminler):\n    harfler = set(kelime) - {" "}\n    return harfler <= set(tahminler)\n',
      tests: 'assert maske("ankara", {"a", "k"}) == "a _ k a _ a", "maske(\'ankara\', {\'a\',\'k\'}) → \'a _ k a _ a\'"\nassert maske("ankara", set()) == "_ _ _ _ _ _", "Hiç tahmin yoksa hepsi _"\nassert maske("iyi gunler", {"i"}) == "i _ i / _ _ _ _ _ _", "Boşluk / olarak gösterilmeli; gelen " + repr(maske("iyi gunler", {"i"}))\nassert kazandi_mi("ankara", {"a", "n", "k", "r"}) is True, "Tüm harfler bilindi: True"\nassert kazandi_mi("ankara", {"a", "n", "k"}) is False, "r eksik: False"\nassert kazandi_mi("iyi gunler", set("iyguner l")) is True, "Boşluk tahmin gerektirmez"\nassert kazandi_mi("iyi gunler", set("iygunelr")) is True, "Boşluk tahmin edilmese de kazanılır"\n',
      hints: [
        'Üç dallı bir if/elif/else, her karakter için parçayı belirler.',
        'set(kelime) - {" "} boşluk hariç harf kümesini verir.',
        'return harfler <= set(tahminler)'
      ],
      why: 'Ekrandaki görüntü (maske) ve oyunun sonucu (kazandi_mi), oyun durumundan (tahmin kümesi) hesaplanır. Ayrı sayaç tutmadığın için "ekranda her şey açık ama oyun bitmedi" gibi tutarsızlıklar oluşamaz.' },
    { id: 'proje-oyunlar-r3',
      t: 'code',
      stage: 'Rehberli',
      diff: 2,
      q: '<p>Sezar şifrelemesini yaz: <code>sezar(metin, k)</code> İngilizce alfabedeki harfleri (A-Z, a-z) k adım kaydırsın, büyük/küçük harfi korusun; diğer karakterleri (rakam, boşluk, noktalama, Türkçe harfler) olduğu gibi bıraksın. k negatif ya da 26\'dan büyük olabilir. Ardından <code>coz(metin, k)</code> fonksiyonunu <code>sezar</code>\'ı çağırarak tek satırda yaz.</p>',
      guide: [
        'Sonucu bir listede biriktir.',
        'Karakter "A" ile "Z" arasındaysa: konum = ord(h) - ord("A"), yeni = (konum + k) % 26, chr(yeni + ord("A")).',
        'Küçük harfler için aynısını "a" ile yap.',
        'Diğer karakterleri değiştirmeden ekle; sonunda "".join.',
        'coz, sezar\'ı -k ile çağırır.'
      ],
      example: '# Saat aritmetiği: 22:00\'den 5 saat sonra\nsaat = 22\nprint((saat + 5) % 24)\n# Haftanın günleri: Cumartesi (5) + 3 gün\ngunler = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"]\nprint(gunler[(5 + 3) % 7], gunler[(0 - 1) % 7])\n',
      start: 'def sezar(metin, k):\n    sonuc = []\n    for h in metin:\n        if "A" <= h <= "Z":\n            # TODO: büyük harfi k kaydır\n            pass\n        elif "a" <= h <= "z":\n            # TODO: küçük harfi k kaydır\n            pass\n        else:\n            sonuc.append(h)\n    return "".join(sonuc)\n\n\ndef coz(metin, k):\n    # TODO: sezar\'ı kullan\n    pass\n',
      sol: 'def sezar(metin, k):\n    sonuc = []\n    for h in metin:\n        if "A" <= h <= "Z":\n            sonuc.append(chr((ord(h) - ord("A") + k) % 26 + ord("A")))\n        elif "a" <= h <= "z":\n            sonuc.append(chr((ord(h) - ord("a") + k) % 26 + ord("a")))\n        else:\n            sonuc.append(h)\n    return "".join(sonuc)\n\n\ndef coz(metin, k):\n    return sezar(metin, -k)\n',
      tests: 'assert sezar("ABC", 3) == "DEF", "ABC +3 → DEF"\nassert sezar("xyz", 3) == "abc", "Sona gelince başa sarmalı: xyz +3 → abc"\nassert sezar("Merhaba Dunya!", 1) == "Nfsibcb Evozb!", "Büyük/küçük korunmalı, boşluk ve ! değişmemeli"\nassert sezar("Saat 14:00", 2) == "Uccv 14:00", "Rakamlar değişmemeli"\nassert sezar("Şifre", 1) == "Şjgsf", "Türkçe harfler (Ş) olduğu gibi kalmalı"\nassert sezar("abc", 29) == sezar("abc", 3), "k=29, k=3 ile aynı olmalı"\nassert sezar("abc", -1) == "zab", "Negatif kaydırma da çalışmalı"\nassert coz(sezar("Gizli Toplanti", 7), 7) == "Gizli Toplanti", "coz, sezar\'ı geri almalı"\n',
      hints: [
        'ord harfi sayıya, chr sayıyı harfe çevirir.',
        '% 26 hem 25\'i aşan hem de 0\'ın altına düşen değerleri alfabeye geri sarar.',
        'Büyük harf için: sonuc.append(chr((ord(h) - ord("A") + k) % 26 + ord("A")))'
      ],
      why: 'Konumu 0-25 aralığına indirip mod 26 ile kaydırmak, sarma ve negatif kaydırma gibi tüm kenar durumlarını tek formülle çözer. Çözme ayrı bir algoritma değil, ters yöndeki şifrelemedir.' },
    { id: 'proje-oyunlar-k1',
      t: 'code',
      stage: 'Kendin yaz',
      diff: 1,
      q: '<p>Taş-kağıt-makas: <code>kazanan(oyuncu, bilgisayar)</code> fonksiyonu <code>"oyuncu"</code>, <code>"bilgisayar"</code> ya da <code>"berabere"</code> döndürsün. Seçimler büyük/küçük harf ve baş/son boşluktan bağımsız olsun (<code>" Taş"</code> = <code>"taş"</code>). Geçersiz seçimde <code>ValueError("geçersiz seçim")</code> fırlat. Kuralları bir <code>YENER</code> sözlüğünde tut.</p>',
      start: 'YENER = {}\n\n\ndef kazanan(oyuncu, bilgisayar):\n    pass\n',
      sol: 'YENER = {"taş": "makas", "makas": "kağıt", "kağıt": "taş"}\n\n\ndef kazanan(oyuncu, bilgisayar):\n    oyuncu = oyuncu.strip().lower()\n    bilgisayar = bilgisayar.strip().lower()\n    if oyuncu not in YENER or bilgisayar not in YENER:\n        raise ValueError("geçersiz seçim")\n    if oyuncu == bilgisayar:\n        return "berabere"\n    if YENER[oyuncu] == bilgisayar:\n        return "oyuncu"\n    return "bilgisayar"\n',
      tests: 'assert kazanan("taş", "makas") == "oyuncu", "Taş makası yener"\nassert kazanan("makas", "taş") == "bilgisayar", "Makas taşa yenilir"\nassert kazanan("kağıt", "taş") == "oyuncu", "Kağıt taşı yener"\nassert kazanan("kağıt", "kağıt") == "berabere", "Aynı seçim berabere"\nassert kazanan(" Taş", "MAKAS ") == "oyuncu", "Büyük harf ve boşluklar yok sayılmalı"\ntry:\n    kazanan("kalem", "taş")\n    assert False, "Geçersiz seçimde ValueError beklenir"\nexcept ValueError as e:\n    assert str(e) == "geçersiz seçim", "Hata mesajı \'geçersiz seçim\' olmalı"\nassert len(YENER) == 3, "YENER sözlüğü üç kuralı içermeli"\n',
      hints: [
        'YENER = {"taş": "makas", "makas": "kağıt", "kağıt": "taş"}: anahtar, değeri yener.',
        'Önce iki seçimi de strip().lower() ile normalleştir, sonra geçerliliği denetle.'
      ],
      why: 'Kural tablosu veride durduğu için kazanan() üç satırlık bir arama olur. Girdiyi normalleştirmek (strip, lower) kullanıcı hatalarını sessizce tolere eder; geçersiz girdide ise açıkça hata verilir.' },
    { id: 'proje-oyunlar-k2',
      t: 'code',
      stage: 'Kendin yaz',
      diff: 2,
      q: '<p>Restoran hesabı bölüşme: <code>hesap_bolustur(hesap, bahsis_yuzde, kisi)</code> şu üç anahtarlı sözlüğü döndürsün (değerler 2 ondalığa yuvarlanmış): <code>"bahsis"</code>, <code>"toplam"</code>, <code>"kisi_basi"</code>. Ek kural: kişi başı tutar, toplamı karşılamak için <b>kuruşa yukarı yuvarlanır</b> (1000 TL / 3 kişi → 333.34; çünkü 333.33 × 3 hesabı karşılamaz). Kişi sayısı 1\'den küçükse ya da hesap veya bahşiş negatifse <code>ValueError</code> fırlat.</p>',
      start: 'import math\n\n\ndef hesap_bolustur(hesap, bahsis_yuzde, kisi):\n    pass\n',
      sol: 'import math\n\n\ndef hesap_bolustur(hesap, bahsis_yuzde, kisi):\n    if kisi < 1 or hesap < 0 or bahsis_yuzde < 0:\n        raise ValueError("geçersiz değer")\n    bahsis = round(hesap * bahsis_yuzde / 100, 2)\n    toplam = round(hesap + bahsis, 2)\n    kisi_basi = math.ceil(round(toplam * 100 / kisi, 6)) / 100\n    return {"bahsis": bahsis, "toplam": toplam, "kisi_basi": kisi_basi}\n',
      tests: 'r = hesap_bolustur(1240, 10, 4)\nassert r == {"bahsis": 124.0, "toplam": 1364.0, "kisi_basi": 341.0}, "1240 TL, %10, 4 kişi → 124.0 / 1364.0 / 341.0; gelen " + str(r)\nr2 = hesap_bolustur(1000, 0, 3)\nassert r2["kisi_basi"] == 333.34, "1000/3 kuruşa YUKARI yuvarlanmalı: 333.34; gelen " + str(r2["kisi_basi"])\nr3 = hesap_bolustur(850, 12.5, 2)\nassert r3 == {"bahsis": 106.25, "toplam": 956.25, "kisi_basi": 478.13}, "850 TL %12.5 2 kişi → 106.25 / 956.25 / 478.13; gelen " + str(r3)\nassert hesap_bolustur(100, 0, 1)["kisi_basi"] == 100.0, "Tek kişi tüm hesabı öder"\nassert hesap_bolustur(0.3, 0, 3)["kisi_basi"] == 0.1, "Kayan nokta gürültüsü yukarı yuvarlamayı bozmamalı (0.3/3 = 0.1)"\nfor kotu in [(100, 10, 0), (-5, 10, 2), (100, -1, 2)]:\n    try:\n        hesap_bolustur(*kotu)\n        assert False, f"{kotu} için ValueError beklenir"\n    except ValueError:\n        pass\n',
      hints: [
        'Kuruşa yukarı yuvarlamak: tutarı 100 ile çarp, math.ceil uygula, 100\'e böl.',
        '0.3 * 100 / 3 gibi işlemler 10.000000000000002 verebilir ve ceil bunu 11 yapar; ceil\'den önce round(..., 6) ile gürültüyü temizle.'
      ],
      why: 'Para hesabında "yuvarla" her zaman yeterli değildir: bölüşmede herkes aşağı yuvarlarsa hesap eksik kalır. math.ceil ile kuruşa yukarı yuvarlamak toplamı garanti eder; round(…, 6) ise kayan nokta gürültüsünün bir kuruşluk hata yaratmasını önler.' },
    { id: 'proje-oyunlar-k3',
      t: 'code',
      stage: 'Kendin yaz',
      diff: 2,
      q: '<p>Kurallı şifre üretici: <code>sifre_uret(uzunluk, rng)</code> şifreyi metin olarak döndürsün. <code>rng</code> bir <code>random.Random</code> nesnesidir; tüm rastgele seçimleri onunla yap (<code>rng.choice</code>, <code>rng.shuffle</code>).</p><ul><li>uzunluk 8\'den küçükse <code>ValueError("şifre en az 8 karakter olmalı")</code></li><li>En az bir küçük harf, bir büyük harf, bir rakam ve <code>SEMBOLLER = "!@#%&amp;*?"</code> içinden bir sembol içersin</li><li>Yalnızca bu dört gruptaki karakterlerden oluşsun (İngilizce harfler: <code>string.ascii_lowercase</code> vb.)</li><li>Aynı tohumla aynı şifre üretilsin</li></ul>',
      start: 'import random\nimport string\n\nSEMBOLLER = "!@#%&*?"\n\n\ndef sifre_uret(uzunluk, rng):\n    pass\n',
      sol: 'import random\nimport string\n\nSEMBOLLER = "!@#%&*?"\nGRUPLAR = [string.ascii_lowercase, string.ascii_uppercase, string.digits, SEMBOLLER]\n\n\ndef sifre_uret(uzunluk, rng):\n    if uzunluk < 8:\n        raise ValueError("şifre en az 8 karakter olmalı")\n    karakterler = [rng.choice(grup) for grup in GRUPLAR]\n    havuz = "".join(GRUPLAR)\n    for _ in range(uzunluk - len(karakterler)):\n        karakterler.append(rng.choice(havuz))\n    rng.shuffle(karakterler)\n    return "".join(karakterler)\n',
      tests: 'import string as _s\n_izinli = set(_s.ascii_letters + _s.digits + "!@#%&*?")\nfor tohum in range(30):\n    for n in (8, 12, 20):\n        s = sifre_uret(n, random.Random(tohum))\n        assert isinstance(s, str) and len(s) == n, f"Uzunluk {n} olmalı"\n        assert any(c.islower() for c in s), "En az bir küçük harf olmalı: " + s\n        assert any(c.isupper() for c in s), "En az bir büyük harf olmalı: " + s\n        assert any(c.isdigit() for c in s), "En az bir rakam olmalı: " + s\n        assert any(c in "!@#%&*?" for c in s), "En az bir sembol olmalı: " + s\n        assert set(s) <= _izinli, "İzinli olmayan karakter var: " + s\nassert sifre_uret(12, random.Random(5)) == sifre_uret(12, random.Random(5)), "Aynı tohum aynı şifreyi vermeli (yalnızca rng kullan)"\nassert len({sifre_uret(12, random.Random(t)) for t in range(10)}) > 1, "Farklı tohumlar farklı şifreler vermeli"\ntry:\n    sifre_uret(6, random.Random(0))\n    assert False, "6 karakterde ValueError beklenir"\nexcept ValueError as e:\n    assert str(e) == "şifre en az 8 karakter olmalı", "Hata mesajı görevdeki gibi olmalı"\n',
      hints: [
        'Önce her gruptan birer karakter seç (kuralı garanti eder), kalanı dört grubun birleşiminden doldur.',
        'Sonunda rng.shuffle ile karıştır; yoksa ilk dört karakter hep küçük-büyük-rakam-sembol sırasında olur.'
      ],
      why: 'Kuralı garanti etmek için "üret, kurala uymuyorsa tekrar üret" yerine her gruptan birini baştan koymak deterministik ve hızlıdır. Rastgeleliği dışarıdan rng olarak almak testi mümkün kılar; gerçek uygulamada buraya secrets.SystemRandom() verilir.' },
    { id: 'proje-oyunlar-k4',
      t: 'code',
      stage: 'Kendin yaz',
      diff: 2,
      q: '<p>ATM\'nin işlem çekirdeği: <code>atm_islem(bakiye, komut, tutar=0)</code> <code>(yeni_bakiye, mesaj)</code> demeti döndürsün. <code>match</code> kullan:</p><ul><li><code>"bakiye"</code> → bakiye aynı, <code>"Bakiye: 1500.00 TL"</code></li><li><code>"yatir"</code> ya da <code>"cek"</code> ve <code>tutar &lt;= 0</code> → bakiye aynı, <code>"Geçersiz tutar"</code></li><li><code>"yatir"</code> → bakiye artar, <code>"250.00 TL yatırıldı"</code></li><li><code>"cek"</code> ve tutar bakiyeden büyük → bakiye aynı, <code>"Yetersiz bakiye"</code></li><li><code>"cek"</code> → bakiye azalır, <code>"100.00 TL çekildi"</code></li><li>diğer her komut → bakiye aynı, <code>"Bilinmeyen işlem"</code></li></ul>',
      start: 'def atm_islem(bakiye, komut, tutar=0):\n    pass\n',
      sol: 'def atm_islem(bakiye, komut, tutar=0):\n    match komut:\n        case "bakiye":\n            return bakiye, f"Bakiye: {bakiye:.2f} TL"\n        case "yatir" | "cek" if tutar <= 0:\n            return bakiye, "Geçersiz tutar"\n        case "yatir":\n            return bakiye + tutar, f"{tutar:.2f} TL yatırıldı"\n        case "cek" if tutar > bakiye:\n            return bakiye, "Yetersiz bakiye"\n        case "cek":\n            return bakiye - tutar, f"{tutar:.2f} TL çekildi"\n        case _:\n            return bakiye, "Bilinmeyen işlem"\n',
      tests: 'assert atm_islem(1500, "bakiye") == (1500, "Bakiye: 1500.00 TL"), "Bakiye sorgusu"\nassert atm_islem(1000, "yatir", 250) == (1250, "250.00 TL yatırıldı"), "Para yatırma"\nassert atm_islem(1000, "cek", 100) == (900, "100.00 TL çekildi"), "Para çekme"\nassert atm_islem(1000, "cek", 1000) == (0, "1000.00 TL çekildi"), "Bakiyenin tamamı çekilebilir"\nassert atm_islem(1000, "cek", 5000) == (1000, "Yetersiz bakiye"), "Yetersiz bakiye"\nassert atm_islem(1000, "yatir", -50) == (1000, "Geçersiz tutar"), "Negatif yatırma geçersiz"\nassert atm_islem(1000, "cek", 0) == (1000, "Geçersiz tutar"), "Sıfır çekme geçersiz (yetersiz bakiye değil)"\nassert atm_islem(1000, "havale", 10) == (1000, "Bilinmeyen işlem"), "Bilinmeyen komut"\nassert "match" in __source__, "match yapısını kullan"\n',
      hints: [
        'case "yatir" | "cek" if tutar <= 0: iki komutu ve bir koşulu tek case\'te birleştirir.',
        'case\'ler yukarıdan aşağı denenir: önce geçersiz tutar, sonra yetersiz bakiye, sonra normal çekme.'
      ],
      why: 'match + koruma koşulu (guard, case ... if ...) iş kurallarını okunur bir tabloya dönüştürür. Sıra önemlidir: daha özel durumlar (geçersiz tutar, yetersiz bakiye) genel durumdan önce gelmelidir.' },
    { id: 'proje-oyunlar-b1',
      t: 'code',
      stage: 'Hata avı',
      kind: 'bug',
      diff: 2,
      q: '<p><b>Hatayı bul ve düzelt.</b> Arkadaşının yazdığı sayı tahmin oyunu ilk tahminde <code>TypeError</code> ile çöküyor. Düzelttiğinde fark edeceksin: oyuncu 3 hak yerine 4 kez tahmin edebiliyor. İki hatayı da düzelt (geçersiz girdi denetimi bu görevin konusu değil).</p>',
      start: 'def oyna(hedef, hak, girdi=input):\n    deneme = 0\n    while deneme <= hak:\n        tahmin = girdi("Tahmin: ")\n        deneme += 1\n        if tahmin == hedef:\n            print(f"Bildin! {deneme} denemede.")\n            return deneme\n        elif tahmin < hedef:\n            print("Daha büyük")\n        else:\n            print("Daha küçük")\n    print(f"Hakkın bitti. Sayı {hedef} idi.")\n    return None\n\n\noyna(37, 3)\n',
      sol: 'def oyna(hedef, hak, girdi=input):\n    deneme = 0\n    while deneme < hak:\n        tahmin = int(girdi("Tahmin: "))\n        deneme += 1\n        if tahmin == hedef:\n            print(f"Bildin! {deneme} denemede.")\n            return deneme\n        elif tahmin < hedef:\n            print("Daha büyük")\n        else:\n            print("Daha küçük")\n    print(f"Hakkın bitti. Sayı {hedef} idi.")\n    return None\n\n\noyna(37, 3)\n',
      stdin: ['50', '25', '30', '37'],
      expect: 'Tahmin: 50\nDaha küçük\nTahmin: 25\nDaha büyük\nTahmin: 30\nDaha büyük\nHakkın bitti. Sayı 37 idi.\n',
      tests: 'import io, contextlib\n_g = iter(["40", "37"])\nwith contextlib.redirect_stdout(io.StringIO()):\n    _sonuc = oyna(37, 5, girdi=lambda istem: next(_g))\nassert _sonuc == 2, "37\'yi ikinci denemede bilen oyuncu için 2 dönmeli"\n',
      hints: [
        'input (ve girdi) her zaman METİN döndürür: "50" < 37 karşılaştırması TypeError verir.',
        'deneme 0\'dan başlıyor; deneme <= hak koşulu 0, 1, 2, 3 için, yani 4 kez doğrudur.'
      ],
      why: 'İki klasik hata: input\'tan gelen metni sayıya çevirmemek ve döngü sınırında off-by-one. İkincisi sessizdir; yalnızca oyunu gerçekten oynayan ya da hakkı sayan bir test fark eder. Beklenen çıktı (expect) tam olarak bunu denetler: 3 tahminden sonra oyun bitmeli.' },
    { id: 'proje-oyunlar-b2',
      t: 'code',
      stage: 'Hata avı',
      kind: 'bug',
      diff: 2,
      q: '<p><b>Hatayı bul ve düzelt.</b> Sezar şifreleme kodunda <b>üç</b> hata var: küçük harfler bozuk çıkıyor, Türkçe harfler (ş, ğ, İ) anlamsız karakterlere dönüşüyor ve <code>coz</code> metni geri çözmüyor. Yalnızca İngilizce harfler (A-Z, a-z) kaydırılmalı.</p>',
      start: 'def sezar(metin, k):\n    sonuc = ""\n    for h in metin:\n        if h.isupper():\n            sonuc += chr((ord(h) - 65 + k) % 26 + 65)\n        elif h.islower():\n            sonuc += chr((ord(h) - 97 + k) % 26 + 65)\n        else:\n            sonuc += h\n    return sonuc\n\n\ndef coz(metin, k):\n    return sezar(metin, k)\n',
      sol: 'def sezar(metin, k):\n    sonuc = ""\n    for h in metin:\n        if "A" <= h <= "Z":\n            sonuc += chr((ord(h) - 65 + k) % 26 + 65)\n        elif "a" <= h <= "z":\n            sonuc += chr((ord(h) - 97 + k) % 26 + 97)\n        else:\n            sonuc += h\n    return sonuc\n\n\ndef coz(metin, k):\n    return sezar(metin, -k)\n',
      tests: 'assert sezar("abc", 1) == "bcd", "Küçük harfler küçük kalmalı: abc +1 → bcd; gelen " + sezar("abc", 1)\nassert sezar("Ankara", 2) == "Cpmctc", "Ankara +2 → Cpmctc"\nassert sezar("Şeker", 1) == "Şflfs", "Ş kaydırılmamalı (yalnızca A-Z, a-z); gelen " + sezar("Şeker", 1)\nassert sezar("İğne", 3) == "İğqh", "İ ve ğ olduğu gibi kalmalı"\nassert coz(sezar("Gizli Mesaj", 5), 5) == "Gizli Mesaj", "coz şifreyi geri almalı"\n',
      hints: [
        'Küçük harf satırında hangi sayı eklenerek harfe dönülüyor? 65 "A"nın, 97 "a"nın kodudur.',
        'isupper() Türkçe Ş için de True döner; aralık kontrolü ("A" <= h <= "Z") kullan.',
        'Çözmek ters yönde kaydırmaktır.'
      ],
      why: 'isupper/islower Unicode\'un tüm harflerini kapsar, ama formül yalnızca 26 harflik İngilizce alfabe için geçerli: Ş gibi bir harf alfabe dışına taşar. Kopyala-yapıştır ile yazılan küçük harf satırında 65 değişmeden kalmış; çözme ise -k ile yapılır.' },
    { id: 'proje-oyunlar-m1',
      t: 'code',
      stage: 'Meydan okuma',
      diff: 3,
      q: '<p>Türkçe Sezar ve kaba kuvvet kırıcı. Türk alfabesi 29 harftir:</p><pre class="out">BUYUK = "ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ"\nKUCUK = "abcçdefgğhıijklmnoöprsştuüvyz"</pre><ul><li><code>sezar_tr(metin, k)</code>: bu iki alfabedeki harfleri k adım kaydır (büyük harf büyük, küçük harf küçük kalır); Q, W, X dahil diğer tüm karakterler değişmez.</li><li><code>kir(sifreli, bilinen_kelime)</code>: 0-28 arasındaki anahtarları dene; <code>sezar_tr(sifreli, -k)</code> sonucu <code>bilinen_kelime</code>\'yi içeren <b>en küçük</b> k için <code>(k, cozulmus_metin)</code> döndür; bulamazsan <code>None</code>.</li></ul>',
      start: 'BUYUK = "ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ"\nKUCUK = "abcçdefgğhıijklmnoöprsştuüvyz"\n\n\ndef sezar_tr(metin, k):\n    pass\n\n\ndef kir(sifreli, bilinen_kelime):\n    pass\n',
      sol: 'BUYUK = "ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ"\nKUCUK = "abcçdefgğhıijklmnoöprsştuüvyz"\n\n\ndef sezar_tr(metin, k):\n    sonuc = []\n    for h in metin:\n        for alfabe in (BUYUK, KUCUK):\n            if h in alfabe:\n                sonuc.append(alfabe[(alfabe.index(h) + k) % len(alfabe)])\n                break\n        else:\n            sonuc.append(h)\n    return "".join(sonuc)\n\n\ndef kir(sifreli, bilinen_kelime):\n    for k in range(len(KUCUK)):\n        aday = sezar_tr(sifreli, -k)\n        if bilinen_kelime in aday:\n            return k, aday\n    return None\n',
      tests: 'assert len(BUYUK) == 29 and len(KUCUK) == 29, "Alfabeler 29 harf olmalı"\nassert sezar_tr("abc", 1) == "bcç", "Türk alfabesinde b\'den sonra c, c\'den sonra ç gelir"\nassert sezar_tr("Ğ", 1) == "H" and sezar_tr("ı", 1) == "i", "Ğ → H, ı → i"\nassert sezar_tr("Zz", 1) == "Aa", "Z\'den sonra başa sarmalı"\nassert sezar_tr("Wifi 5G!", 2) == "Wkğk 5H!", "W, rakam ve noktalama değişmemeli; gelen " + sezar_tr("Wifi 5G!", 2)\nasil = "Şubat toplantısı perşembe günü İzmir ofisinde"\nfor k in (1, 7, 28, 30, -4):\n    assert sezar_tr(sezar_tr(asil, k), -k) == asil, f"k={k} için şifrele-çöz turu orijinali vermeli"\nsifreli = sezar_tr(asil, 11)\nassert kir(sifreli, "toplantı") == (11, asil), "kir doğru anahtarı (11) ve metni bulmalı"\nassert kir("abc", "abc") == (0, "abc"), "k=0 da denenmeli"\nassert kir(sifreli, "kahve") is None, "Bilinen kelime hiçbir anahtarda çıkmıyorsa None"\n',
      hints: [
        'Harfin alfabedeki konumunu .index ile bul, (konum + k) % 29 ile yeni konumu hesapla.',
        'İki alfabeyi bir döngüde dene; for ... else yapısı "hiçbirinde bulunamadı" durumunu temizce yakalar.',
        'kir: for k in range(29) ile sezar_tr(sifreli, -k) dene, ilk eşleşmede döndür.'
      ],
      why: 'ord/chr hilesi yalnızca harflerin kodları ardışık olduğunda çalışır; Türkçe harfler Unicode\'da dağınık durduğu için alfabeyi bir metin olarak tutup konumla çalışmak gerekir. Kaba kuvvet kırıcı da Sezar\'ın neden güvensiz olduğunu gösterir: 29 deneme yeter.' },
    { id: 'proje-oyunlar-m2',
      t: 'code',
      stage: 'Meydan okuma',
      diff: 3,
      q: '<p>Adam asmacanın tüm durumunu hesaplayan saf fonksiyon: <code>oyun_durumu(kelime, tahminler, max_hata=6)</code>. <code>kelime</code> küçük harfli, <code>tahminler</code> oyuncunun sırayla girdiği metinlerin listesi. Kurallar:</p><ul><li>Her tahmin <code>strip().lower()</code> ile normalleştirilir; boş tahmin yok sayılır.</li><li>Tek harfli tahmin: kelimede varsa doğru, yoksa hata. Daha önce söylenmiş harf tekrar sayılmaz.</li><li>Birden çok harfli tahmin, kelimenin tamamı için bir denemedir: doğruysa oyun kazanılır, yanlışsa 1 hata sayılır (aynı yanlış kelime tekrar sayılmaz).</li><li>Oyun bittikten sonraki (kazanma ya da max_hata\'ya ulaşma) tahminler yok sayılır.</li></ul><p>Döndür: <code>{"maske": "a _ k a _ a", "hatalar": [...], "kalan_hak": int, "bitti": bool, "kazandi": bool}</code>. <code>hatalar</code> yanlış tahminlerin ilk söylenme sırasıdır; kazanılınca maske tüm harfleri gösterir.</p>',
      start: 'def oyun_durumu(kelime, tahminler, max_hata=6):\n    pass\n',
      sol: 'def oyun_durumu(kelime, tahminler, max_hata=6):\n    dogru = set()\n    hatalar = []\n    kazandi = False\n    for ham in tahminler:\n        if kazandi or len(hatalar) >= max_hata:\n            break\n        tahmin = ham.strip().lower()\n        if not tahmin or tahmin in dogru or tahmin in hatalar:\n            continue\n        if len(tahmin) > 1:\n            if tahmin == kelime:\n                kazandi = True\n            else:\n                hatalar.append(tahmin)\n        elif tahmin in kelime:\n            dogru.add(tahmin)\n            kazandi = set(kelime) <= dogru\n        else:\n            hatalar.append(tahmin)\n    gorunen = set(kelime) if kazandi else dogru\n    maske = " ".join(h if h in gorunen else "_" for h in kelime)\n    return {\n        "maske": maske,\n        "hatalar": hatalar,\n        "kalan_hak": max_hata - len(hatalar),\n        "bitti": kazandi or len(hatalar) >= max_hata,\n        "kazandi": kazandi,\n    }\n',
      tests: 'd = oyun_durumu("ankara", ["a", "e", "K", " a ", "", "z"])\nassert d == {"maske": "a _ k a _ a", "hatalar": ["e", "z"], "kalan_hak": 4, "bitti": False, "kazandi": False}, "Normalleştirme ve tekrar kuralı; gelen " + str(d)\nd2 = oyun_durumu("ankara", ["a", "n", "k", "r", "x", "y"])\nassert d2["kazandi"] and d2["bitti"] and d2["hatalar"] == [], "Tüm harfler bilinince kazanılır ve sonraki tahminler yok sayılır; gelen " + str(d2)\nassert d2["maske"] == "a n k a r a", "Kazanınca maske açık olmalı"\nd3 = oyun_durumu("izmir", ["i", "Izmir"])\nassert d3["kazandi"] and d3["maske"] == "i z m i r", "Kelimenin tamamı doğru tahmin edilirse kazanılır"\nd4 = oyun_durumu("bursa", ["konya", "konya", "a", "e", "i", "o", "k", "l", "m"], max_hata=4)\nassert d4["hatalar"] == ["konya", "e", "i", "o"], "Yanlış kelime 1 hata; tekrar sayılmaz; max_hata\'dan sonrası yok sayılır; gelen " + str(d4["hatalar"])\nassert d4["bitti"] and not d4["kazandi"] and d4["kalan_hak"] == 0, "4 hatada oyun kaybedilerek biter"\nassert d4["maske"] == "_ _ _ _ a", "Kaybedince maske yalnızca bilinen harfleri gösterir"\nd5 = oyun_durumu("van", [])\nassert d5 == {"maske": "_ _ _", "hatalar": [], "kalan_hak": 6, "bitti": False, "kazandi": False}, "Başlangıç durumu"\n',
      hints: [
        'Durumu iki yapıda tut: doğru harfler kümesi ve hatalar listesi (sıra önemli olduğu için liste).',
        'Döngünün başında oyun bitti mi diye bak (break); sonra normalleştir, boş ve tekrar tahminleri continue ile atla.',
        'Kazanınca gösterilecek harf kümesi set(kelime) olur; maske bu kümeden hesaplanır.'
      ],
      why: 'Tüm oyun, tahmin listesinden hesaplanan saf bir fonksiyona dönüştü: herhangi bir anın durumunu yeniden üretebilir, test edebilir, kaydedebilirsin. Ekran ve döngü katmanı artık yalnızca bu fonksiyonun sonucunu gösterir.' },
    { id: 'proje-oyunlar-p1',
      t: 'code',
      stage: 'Mini proje',
      diff: 2,
      q: '<p><b>Sayı tahmin oyunu (tam sürüm).</b> <code>oyna(hedef, hak=7, girdi=input)</code> fonksiyonunu yaz:</p><ul><li>Her turda <code>girdi(f"Tahmin ({kalan} hak): ")</code> ile sor (kalan = hak - geçerli deneme sayısı).</li><li>Girdi 1-100 arası tam sayı değilse <code>Lütfen 1-100 arası bir tam sayı gir.</code> yazdır; bu deneme hak yemez.</li><li>Küçükse <code>Daha büyük</code>, büyükse <code>Daha küçük</code> yazdır.</li><li>Bilirse <code>Tebrikler! {deneme} denemede bildin.</code> yazdır ve deneme sayısını döndür.</li><li>Hak biterse <code>Hakkın bitti. Sayı {hedef} idi.</code> yazdır, <code>None</code> döndür.</li></ul><p>Dosyanın sonunda: <code>if __name__ == "__main__":</code> bloğunda <code>random.seed(2026)</code>, <code>hedef = random.randint(1, 100)</code> ve <code>oyna(hedef)</code>. Girdiler hazır verildi; beklenen çıktı tam olarak denetlenir.</p>',
      start: 'import random\n\n\ndef oyna(hedef, hak=7, girdi=input):\n    # TODO\n    pass\n\n\nif __name__ == "__main__":\n    random.seed(2026)\n    hedef = random.randint(1, 100)\n    oyna(hedef)\n',
      sol: 'import random\n\n\ndef tahmini_oku(metin, alt=1, ust=100):\n    try:\n        sayi = int(metin.strip())\n    except ValueError:\n        return None\n    return sayi if alt <= sayi <= ust else None\n\n\ndef oyna(hedef, hak=7, girdi=input):\n    deneme = 0\n    while deneme < hak:\n        tahmin = tahmini_oku(girdi(f"Tahmin ({hak - deneme} hak): "))\n        if tahmin is None:\n            print("Lütfen 1-100 arası bir tam sayı gir.")\n            continue\n        deneme += 1\n        if tahmin == hedef:\n            print(f"Tebrikler! {deneme} denemede bildin.")\n            return deneme\n        print("Daha büyük" if tahmin < hedef else "Daha küçük")\n    print(f"Hakkın bitti. Sayı {hedef} idi.")\n    return None\n\n\nif __name__ == "__main__":\n    random.seed(2026)\n    hedef = random.randint(1, 100)\n    oyna(hedef)\n',
      stdin: ['50', 'abc', '20', '150', '10', '16'],
      expect: 'Tahmin (7 hak): 50\nDaha küçük\nTahmin (6 hak): abc\nLütfen 1-100 arası bir tam sayı gir.\nTahmin (6 hak): 20\nDaha küçük\nTahmin (5 hak): 150\nLütfen 1-100 arası bir tam sayı gir.\nTahmin (5 hak): 10\nDaha büyük\nTahmin (4 hak): 16\nTebrikler! 4 denemede bildin.\n',
      tests: 'import io, contextlib\n_tampon = io.StringIO()\n_g = iter(["1", "2", "3"])\nwith contextlib.redirect_stdout(_tampon):\n    _r = oyna(99, hak=3, girdi=lambda istem: next(_g))\nassert _r is None, "Hak bitince None dönmeli"\nassert "Hakkın bitti. Sayı 99 idi." in _tampon.getvalue(), "Hak bitince hedef sayı söylenmeli"\n_g2 = iter(["x", "", "42"])\nwith contextlib.redirect_stdout(io.StringIO()):\n    _r2 = oyna(42, hak=1, girdi=lambda istem: next(_g2))\nassert _r2 == 1, "Geçersiz girdiler hak yememeli: tek hakla 42 bilinmeli"\n',
      hints: [
        'Rehberli aşamadaki tahmini_oku fonksiyonunu burada yardımcı olarak kullan.',
        'Geçerli deneme sayısını ayrı say: geçersiz girdide continue ile deneme artmadan başa dön.',
        'Kalan hak her istemde hak - deneme; seed 2026 ile hedef 16\'dır.'
      ],
      why: 'Saf yardımcılar (tahmini_oku) ve girdi parametresi sayesinde oyun hem gerçek klavyeyle hem de hazır girdilerle aynı kodla çalışıyor. Sabit tohum, beklenen çıktıyı karakteri karakterine sabitlemeyi mümkün kıldı.' },
    { id: 'proje-oyunlar-p2',
      t: 'code',
      stage: 'Mini proje',
      diff: 3,
      q: '<p><b>Anadolu Bank ATM\'si.</b> <code>atm(bakiye, pin, girdi=input)</code> fonksiyonunu yaz:</p><ol><li><b>PIN:</b> <code>girdi("PIN: ")</code> ile en fazla 3 kez sor. Yanlışsa <code>Hatalı PIN. Kalan deneme: {n}</code> yazdır. Üçüncü yanlışta <code>Kart bloke edildi.</code> yazdır ve <code>None</code> döndür.</li><li><b>Menü döngüsü</b> (<code>while True</code> + <code>match</code>): <code>girdi("İşlem (1 bakiye, 2 yatır, 3 çek, 4 çıkış): ")</code><ul><li><code>"1"</code> → <code>Bakiye: {bakiye:.2f} TL</code></li><li><code>"2"</code>/<code>"3"</code> → <code>girdi("Tutar: ")</code>; tutar pozitif bir sayı (float) değilse <code>Geçersiz tutar</code>; çekmede bakiye yetmiyorsa <code>Yetersiz bakiye</code>; başarılıysa <code>Yeni bakiye: {bakiye:.2f} TL</code></li><li><code>"4"</code> → <code>İyi günler!</code> yazdır, bakiyeyi döndür</li><li>diğer → <code>Geçersiz seçim</code></li></ul></li></ol><p>Dosyanın sonunda <code>atm(1000, "1234")</code> çağrısı hazır girdilerle çalışacak.</p>',
      start: 'def atm(bakiye, pin, girdi=input):\n    # TODO: PIN kontrolü (3 hak)\n    # TODO: while True + match menüsü\n    pass\n\n\natm(1000, "1234")\n',
      sol: 'MAX_PIN_DENEME = 3\n\n\ndef tutar_oku(metin):\n    try:\n        tutar = float(metin)\n    except ValueError:\n        return None\n    return tutar if tutar > 0 else None\n\n\ndef pin_dogrula(pin, girdi):\n    for deneme in range(1, MAX_PIN_DENEME + 1):\n        if girdi("PIN: ").strip() == pin:\n            return True\n        kalan = MAX_PIN_DENEME - deneme\n        if kalan:\n            print(f"Hatalı PIN. Kalan deneme: {kalan}")\n    print("Kart bloke edildi.")\n    return False\n\n\ndef atm(bakiye, pin, girdi=input):\n    if not pin_dogrula(pin, girdi):\n        return None\n    while True:\n        secim = girdi("İşlem (1 bakiye, 2 yatır, 3 çek, 4 çıkış): ").strip()\n        match secim:\n            case "1":\n                print(f"Bakiye: {bakiye:.2f} TL")\n            case "2" | "3":\n                tutar = tutar_oku(girdi("Tutar: "))\n                if tutar is None:\n                    print("Geçersiz tutar")\n                elif secim == "3" and tutar > bakiye:\n                    print("Yetersiz bakiye")\n                else:\n                    bakiye = bakiye + tutar if secim == "2" else bakiye - tutar\n                    print(f"Yeni bakiye: {bakiye:.2f} TL")\n            case "4":\n                print("İyi günler!")\n                return bakiye\n            case _:\n                print("Geçersiz seçim")\n\n\natm(1000, "1234")\n',
      stdin: ['0000', '1234', '1', '2', 'yüz', '2', '250.5', '3', '5000', '3', '-10', '7', '3', '200', '4'],
      expect: 'PIN: 0000\nHatalı PIN. Kalan deneme: 2\nPIN: 1234\nİşlem (1 bakiye, 2 yatır, 3 çek, 4 çıkış): 1\nBakiye: 1000.00 TL\nİşlem (1 bakiye, 2 yatır, 3 çek, 4 çıkış): 2\nTutar: yüz\nGeçersiz tutar\nİşlem (1 bakiye, 2 yatır, 3 çek, 4 çıkış): 2\nTutar: 250.5\nYeni bakiye: 1250.50 TL\nİşlem (1 bakiye, 2 yatır, 3 çek, 4 çıkış): 3\nTutar: 5000\nYetersiz bakiye\nİşlem (1 bakiye, 2 yatır, 3 çek, 4 çıkış): 3\nTutar: -10\nGeçersiz tutar\nİşlem (1 bakiye, 2 yatır, 3 çek, 4 çıkış): 7\nGeçersiz seçim\nİşlem (1 bakiye, 2 yatır, 3 çek, 4 çıkış): 3\nTutar: 200\nYeni bakiye: 1050.50 TL\nİşlem (1 bakiye, 2 yatır, 3 çek, 4 çıkış): 4\nİyi günler!\n',
      tests: 'import io, contextlib\n_t = io.StringIO()\n_g = iter(["1", "2", "3", "1234"])\nwith contextlib.redirect_stdout(_t):\n    _r = atm(500, "1234", girdi=lambda istem: next(_g))\nassert _r is None, "3 yanlış PIN\'de None dönmeli ve dördüncü kez sormamalı"\nassert _t.getvalue().strip().endswith("Kart bloke edildi."), "3 yanlış PIN\'den sonra \'Kart bloke edildi.\' yazmalı"\nassert "Kalan deneme: 0" not in _t.getvalue(), "Üçüncü yanlışta \'Kalan deneme: 0\' yerine doğrudan bloke mesajı yazılmalı"\n_g2 = iter(["1234", "2", "100", "4"])\nwith contextlib.redirect_stdout(io.StringIO()):\n    assert atm(50, "1234", girdi=lambda istem: next(_g2)) == 150, "Çıkışta son bakiye döndürülmeli"\nassert "match" in __source__, "Menüde match kullan"\n',
      hints: [
        'İşi üç parçaya böl: tutar_oku (metin → pozitif float ya da None), pin_dogrula (3 deneme, True/False), atm (menü döngüsü).',
        'PIN döngüsünde kalan deneme 0 olduğunda "Hatalı PIN" satırını yazma; döngü bitince bloke mesajı yaz.',
        'case "2" | "3": içinde önce tutarı doğrula, sonra secim == "3" ise bakiyeyi denetle.'
      ],
      why: 'Proje üç sorumluluğa ayrıldı: girdi doğrulama, kimlik doğrulama ve menü döngüsü. Her biri tek başına anlaşılır ve test edilir; while True + match ise menü tabanlı her uygulamanın (CLI araçları, botlar) iskeletidir.' },
    { id: 'proje-oyunlar-p3',
      t: 'code',
      stage: 'Mini proje',
      diff: 3,
      q: '<p><b>Taş-kağıt-makas turnuvası.</b> <code>turnuva(tur_sayisi, seed, girdi=input)</code> fonksiyonunu yaz:</p><ul><li><code>rng = random.Random(seed)</code> oluştur; <code>SECENEKLER = ("taş", "kağıt", "makas")</code>.</li><li>Her turda <code>girdi("Seçimin (taş/kağıt/makas): ")</code>; <code>strip().lower()</code> ile normalleştir. Geçersizse <code>Geçersiz seçim, tekrar dene.</code> yazdır; tur sayılmaz ve bilgisayar seçim <b>yapmaz</b>.</li><li>Geçerliyse bilgisayar <code>rng.choice(SECENEKLER)</code> ile seçer; <code>Bilgisayar: {seçim} → {sonuç}</code> yazdır. Sonuç: <code>Kazandın</code>, <code>Kaybettin</code> ya da <code>Berabere</code>.</li><li>Turlar bitince <code>Skor: Sen {o} - {b} Bilgisayar</code> yazdır ve <code>(o, b)</code> döndür.</li></ul><p>Dosyanın sonunda <code>turnuva(3, 5)</code> çağrısı hazır girdilerle çalışacak.</p>',
      start: 'import random\n\nSECENEKLER = ("taş", "kağıt", "makas")\n\n\ndef turnuva(tur_sayisi, seed, girdi=input):\n    # TODO\n    pass\n\n\nturnuva(3, 5)\n',
      sol: 'import random\n\nSECENEKLER = ("taş", "kağıt", "makas")\nYENER = {"taş": "makas", "makas": "kağıt", "kağıt": "taş"}\nMESAJ = {"oyuncu": "Kazandın", "bilgisayar": "Kaybettin", "berabere": "Berabere"}\n\n\ndef kazanan(oyuncu, bilgisayar):\n    if oyuncu == bilgisayar:\n        return "berabere"\n    return "oyuncu" if YENER[oyuncu] == bilgisayar else "bilgisayar"\n\n\ndef turnuva(tur_sayisi, seed, girdi=input):\n    rng = random.Random(seed)\n    skor = {"oyuncu": 0, "bilgisayar": 0, "berabere": 0}\n    oynanan = 0\n    while oynanan < tur_sayisi:\n        secim = girdi("Seçimin (taş/kağıt/makas): ").strip().lower()\n        if secim not in SECENEKLER:\n            print("Geçersiz seçim, tekrar dene.")\n            continue\n        bilgisayar = rng.choice(SECENEKLER)\n        sonuc = kazanan(secim, bilgisayar)\n        skor[sonuc] += 1\n        oynanan += 1\n        print(f"Bilgisayar: {bilgisayar} → {MESAJ[sonuc]}")\n    print(f"Skor: Sen {skor[\'oyuncu\']} - {skor[\'bilgisayar\']} Bilgisayar")\n    return skor["oyuncu"], skor["bilgisayar"]\n\n\nturnuva(3, 5)\n',
      stdin: ['taş', 'kalem', 'makas', 'Kağıt '],
      expect: 'Seçimin (taş/kağıt/makas): taş\nBilgisayar: makas → Kazandın\nSeçimin (taş/kağıt/makas): kalem\nGeçersiz seçim, tekrar dene.\nSeçimin (taş/kağıt/makas): makas\nBilgisayar: kağıt → Kazandın\nSeçimin (taş/kağıt/makas): Kağıt \nBilgisayar: makas → Kaybettin\nSkor: Sen 2 - 1 Bilgisayar\n',
      tests: 'import io, contextlib\n_rng = random.Random(9)\n_pc = [_rng.choice(SECENEKLER) for _ in range(4)]\n_yener = {"taş": "makas", "makas": "kağıt", "kağıt": "taş"}\n_oyuncu = [_p for _p in _pc]\n_g = iter(_oyuncu)\nwith contextlib.redirect_stdout(io.StringIO()):\n    _r = turnuva(4, 9, girdi=lambda istem: next(_g))\nassert _r == (0, 0), "Bilgisayarla hep aynı seçimi yapan oyuncu: 4 beraberlik, skor (0, 0) olmalı; gelen " + str(_r)\n_kazanan_hamle = {v: k for k, v in _yener.items()}\n_g2 = iter([_kazanan_hamle[_p].capitalize() for _p in _pc])\nwith contextlib.redirect_stdout(io.StringIO()):\n    _r2 = turnuva(4, 9, girdi=lambda istem: next(_g2))\nassert _r2 == (4, 0), "Her turda bilgisayarı yenen hamle: (4, 0) olmalı; bilgisayar yalnızca geçerli turda rng.choice çağırmalı"\n',
      hints: [
        'Oynanan tur sayısını ayrı say; geçersiz girdide continue ile sayaç artmadan başa dön (bilgisayar seçimi de continue\'dan SONRA yapılmalı).',
        'Sonuç → mesaj eşlemesini sözlükte tut: {"oyuncu": "Kazandın", ...}.',
        'Seed 5 ile bilgisayarın ilk üç seçimi: makas, kağıt, makas.'
      ],
      why: 'Kendi tohumlu üreteci (random.Random(seed)) sayesinde testler bilgisayarın her hamlesini önceden bildi ve "hep berabere", "hep kazan" senaryolarını kurabildi. Bilgisayarın yalnızca geçerli turda seçim yapması, rastgele dizinin girdi hatalarından etkilenmemesini sağlar.' }
  ],
  faq: [
    { q: 'Neden oyunlarda girdi=input diye bir parametre var?',
      a: 'Fonksiyon normalde gerçek input\'u kullanır; testte ise ona hazır cevaplar döndüren bir fonksiyon verirsin. Böylece oyunu klavyeye dokunmadan, saniyeler içinde onlarca senaryoyla deneyebilirsin. Bu kalıba bağımlılık enjeksiyonu denir ve büyük projelerde veritabanı, saat ve ağ için de aynı şekilde kullanılır.' },
    { q: 'random.seed mi kullanmalıyım, random.Random(seed) mi?',
      a: 'random.seed tüm programın ortak üretecini sabitler; programın başka bir yeri de random kullanıyorsa dizi kayar. random.Random(seed) yalnızca sana ait bir üreteç oluşturur; testte daha güvenilirdir. Kısa betiklerde ikisi de iş görür.' },
    { q: 'Şifre üretici için random yeterli mi?',
      a: 'Hayır. random oyun ve simülasyon içindir; ürettiği dizi tahmin edilebilir. Gerçek şifre, token ve doğrulama kodu için secrets modülünü (secrets.choice, secrets.token_urlsafe) kullan. Bu derste test edebilmek için tohumlu random kullandık.' },
    { q: 'Bu projeleri tarayıcıda değil kendi bilgisayarımda nasıl oynarım?',
      a: 'Kodu bir .py dosyasına kaydet, test için verdiğin girdi fonksiyonunu kaldır (girdi varsayılan olarak input olur) ve python oyun.py ile çalıştır. Seed satırını kaldırırsan her oyunda farklı sayı gelir.' },
    { q: 'Projeyi daha da geliştirmek için ne ekleyebilirim?',
      a: 'Skor tablosunu JSON dosyasına kaydetme, zorluk seviyeleri (aralık ve hak sayısı), adam asmacaya kelime listesi dosyası ve ipucu hakkı, ATM\'ye işlem geçmişi ve günlük çekim limiti. Her eklemeyi önce saf bir fonksiyon olarak yazıp test et, sonra döngüye bağla.' }
  ],
  mistakes: [
    { bad: 'tahmin = input("Tahmin: ")\nif tahmin < hedef:\n    ...',
      good: 'tahmin = int(input("Tahmin: "))\nif tahmin < hedef:\n    ...',
      why: 'input her zaman metin döndürür; metinle sayıyı karşılaştırmak TypeError verir. Ayrıca int() de geçersiz girdide hata verir, onu da try ile koru.' },
    { bad: 'while True:\n    secim = input()\n    if secim == "1":\n        ...\n    # çıkış seçeneği yok',
      good: 'while True:\n    secim = input()\n    match secim:\n        case "4":\n            break\n        ...',
      why: 'Sonsuz döngünün mutlaka bir çıkış yolu olmalı; yoksa program ancak zorla durdurulur.' },
    { bad: 'def oyna():\n    hedef = random.randint(1, 100)\n    ...',
      good: 'def oyna(hedef, girdi=input):\n    ...\n\noyna(random.randint(1, 100))',
      why: 'Rastgeleliği fonksiyonun içine gömersen test edilemez; hedefi dışarıdan almak, testte bilinen bir değer vermeni sağlar.' },
    { bad: 'sifre = "".join(random.choice(havuz) for _ in range(12))',
      good: 'sifre = "".join(secrets.choice(havuz) for _ in range(12))',
      why: 'random tahmin edilebilir; güvenlikle ilgili her üretimde secrets kullanılır. Ayrıca yalnızca havuzdan seçmek her gruptan karakter olacağını garanti etmez.' },
    { bad: 'def coz(metin, k):\n    # ayrı, tersine algoritma\n    ...',
      good: 'def coz(metin, k):\n    return sezar(metin, -k)',
      why: 'Çözme, ters yönde şifrelemedir; ayrı bir algoritma yazmak kodu ikiye katlar ve iki fonksiyonun birbirini tutmama riskini doğurur.' }
  ] }
);
})(window);
