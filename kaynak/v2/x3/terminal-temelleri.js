/* Kesit Python — 'terminal-temelleri' uzantısı (AUDIT 12, Derinleş + ek alıştırmalar) */
(function (W) {
'use strict';
const X = W.PY_EXT = W.PY_EXT || [];
X.push(
  {
    id: 'terminal-temelleri',
    min: 30,
    html: `<p>Bu bölüm, bir sunucuya bağlandığında ya da büyük bir log dosyasıyla karşılaştığında işini görecek Linux kabuk (shell) araçlarını tanıtıyor. Amaç her bayrağı ezberlemek değil; hangi aracın hangi işe yaradığını bilip gerektiğinde <code>man grep</code> ya da <code>grep --help</code> ile ayrıntıya bakabilmek. Her aracın yanında Python karşılığını da göreceksin: ikisini birlikte bilmek, ne zaman tek satırlık komutun ne zaman betiğin daha uygun olduğunu seçmeni sağlar. Windows'ta bu komutları WSL (Windows Subsystem for Linux) ya da Git Bash ile kullanabilirsin.</p>
<h2>Metin araçları: grep, sed, awk, jq</h2>
<div class="tbl-wrap"><table><tr><th>Komut</th><th>Ne yapar?</th><th>Python karşılığı</th></tr>
<tr><td><code>grep -i "hata" app.log</code></td><td>Deseni içeren satırları yazar (<code>-i</code> büyük/küçük harf duyarsız, <code>-v</code> tersini, <code>-c</code> sayısını, <code>-r</code> klasörde özyinelemeli)</td><td><code>[s for s in satirlar if "hata" in s.lower()]</code></td></tr>
<tr><td><code>sed 's/eski/yeni/g' dosya</code></td><td>Satır satır bul-değiştir (<code>g</code> olmadan satırdaki yalnız ilk eşleşme)</td><td><code>re.sub("eski", "yeni", satir)</code></td></tr>
<tr><td><code>awk -F, '{t+=$10} END {print t}'</code></td><td>Satırları sütunlara böler (<code>$1</code>, <code>$2</code>... 1'den başlar), hesap yapar</td><td><code>sum(float(s.split(",")[9]) ...)</code></td></tr>
<tr><td><code>jq '.items[].fiyat' veri.json</code></td><td>JSON içinden alan seçer, süzer</td><td><code>[x["fiyat"] for x in d["items"]]</code></td></tr>
<tr><td><code>sort | uniq -c | sort -rn</code></td><td>Sırala, ardışık tekrarları say, sayıya göre azalan diz</td><td><code>Counter(...).most_common()</code></td></tr>
<tr><td><code>cut -d, -f2</code>, <code>head</code>, <code>tail -f</code>, <code>wc -l</code></td><td>Sütun kes, ilk/son satırlar, canlı izle, satır say</td><td><code>split</code>, dilim, <code>len</code></td></tr></table></div>
<pre class="code"># En çok 404 alan 5 yol (erişim logunda 7. alan yol, 9. alan durum kodu)
awk '$9 == 404 {print $7}' access.log | sort | uniq -c | sort -rn | head -5
# Son 1 saatteki hataları canlı izle
tail -f app.log | grep --line-buffered ERROR
# Lezzet Kurye siparişlerinde duruma göre teslimat ücreti toplamı
awk -F, 'NR &gt; 1 {t[$8] += $10} END {for (k in t) print k, t[k]}' lk_orders.csv
# API yanıtından yalnız adlar
curl -s https://api.example.com/urunler | jq -r '.[] | select(.stok == 0) | .ad'</pre>
<p>Aynı awk satırının Python karşılığı aşağıda; gerçek <code>lk_orders</code> dosyasında çalışıyor. Kısa ve tek seferlik sorularda kabuk daha hızlıdır; mantık büyüyünce, test gerekince ya da Windows'ta da çalışması gerekince Python kazanır.</p>
<pre class="py">import veri
yol = veri.yol("lezzet_kurye", "lk_orders")
toplam = {}
with open(yol, encoding="utf-8") as f:
    next(f)                                   # NR &gt; 1: başlığı atla
    for satir in f:
        alan = satir.rstrip("\\n").split(",")  # -F,
        toplam[alan[7]] = toplam.get(alan[7], 0) + float(alan[9])   # $8, $10
for durum, tutar in sorted(toplam.items()):
    print(durum, round(tutar, 2))</pre>
<h2>Dosya bulmak ve toplu işlem: find ve xargs</h2>
<pre class="code">find . -name "*.py" -mtime -1              # son 1 günde değişen .py dosyaları
find /var/log -name "*.log" -size +100M    # 100 MB'tan büyük loglar
find . -name "__pycache__" -type d -prune -exec rm -rf {} +
grep -rl "TODO" src/ | xargs wc -l         # TODO içeren dosyaların satır sayısı
find . -name "*.csv" -print0 | xargs -0 -n 1 python temizle.py   # boşluklu adlara dayanıklı</pre>
<p><code>xargs</code>, girdideki her satırı bir komutun argümanına çevirir. Dosya adlarında boşluk olabileceği için <code>-print0</code> ve <code>-0</code> çiftini alışkanlık edin. Python'da karşılığı <code>Path(".").rglob("*.py")</code> ve döngüdür.</p>
<h2>İzinler ve chmod</h2>
<p><code>ls -l</code> çıktısındaki <code>-rwxr-x---</code> üç gruba ayrılır: sahip (user), grup (group), diğerleri (other). Her grupta okuma (r=4), yazma (w=2), çalıştırma (x=1) vardır; toplamları sayısal izni verir: <code>rwx</code>=7, <code>r-x</code>=5, <code>---</code>=0 → <b>750</b>.</p>
<pre class="py">import stat
for izin in (0o755, 0o644, 0o600, 0o750):
    print(oct(izin)[2:], stat.filemode(stat.S_IFREG | izin))</pre>
<pre class="code">chmod 755 deploy.sh        # sahibi her şey, diğerleri oku+çalıştır
chmod u+x betik.py         # sembolik: sahibine çalıştırma ekle
chmod 600 ~/.ssh/id_ed25519   # özel anahtar yalnız sahibine açık olmalı
chown app:app /srv/market -R</pre>
<div class="warn"><b>chmod 777 çözüm değildir</b>"Permission denied" alınca 777 vermek herkese yazma izni açar. Önce dosyanın sahibini (<code>ls -l</code>) ve hangi kullanıcıyla çalıştığını (<code>whoami</code>) kontrol et; gerekeni ver. SSH özel anahtarının izni geniş olursa ssh onu kullanmayı reddeder.</div>
<h2>Süreçler, uzak sunucu ve tmux</h2>
<div class="tbl-wrap"><table><tr><th>Komut</th><th>İş</th></tr>
<tr><td><code>ps aux | grep gunicorn</code>, <code>top</code> / <code>htop</code></td><td>Çalışan süreçleri, CPU ve bellek kullanımını gör</td></tr>
<tr><td><code>kill 4321</code> / <code>kill -9 4321</code></td><td>SIGTERM: "düzgün kapan" ricası; SIGKILL: anında öldür (temizlik yapılamaz, son çare)</td></tr>
<tr><td><code>ssh-keygen -t ed25519</code>, <code>ssh-copy-id kul@sunucu</code></td><td>Anahtar çifti üret, açık anahtarı sunucuya koy; parolasız ve güvenli giriş</td></tr>
<tr><td><code>ssh kul@sunucu</code>, <code>scp rapor.csv kul@sunucu:/srv/veri/</code></td><td>Uzak kabuk; dosya kopyala (büyük ve tekrarlı kopyada <code>rsync -avz</code>)</td></tr>
<tr><td><code>tmux new -s etl</code>, <code>Ctrl+b d</code>, <code>tmux attach -t etl</code></td><td>Oturum aç, ayrıl (bağlantı kopsa da iş sürer), geri bağlan</td></tr></table></div>
<p>Uzun süren bir eğitim ya da ETL işini SSH üzerinden başlatıp bağlantın koparsa iş ölür; tmux (ya da screen) içinde başlatırsan oturum sunucuda yaşamaya devam eder. Python tarafında SIGTERM'i yakalayıp yarım işi kaydetmek docker-deploy dersindeki "düzgün kapanma" konusudur.</p>
<div class="note"><b>Gerçek işte</b>Üretimde bir sorun çıktığında ilk dakikalar genellikle şöyle geçer: <code>ssh</code> ile bağlan, <code>df -h</code> ile disk, <code>free -m</code> ile bellek, <code>ps</code>/<code>top</code> ile süreçlere bak, <code>tail -n 200 app.log | grep -i error</code> ile son hataları oku. Bu akışı rahat yapabilmek mühendis, backend ve ML rollerinde mülakatlarda da sorulur.</div>`,
    ex: [
      {
        t: 'mc',
        id: 'terminal-temelleri-y1',
        stage: 'Isınma',
        q: '<code>chmod 640 maaslar.csv</code> sonrası izin durumu nedir?',
        o: [
          'Sahip okur ve yazar, grup yalnız okur, diğerleri hiçbir şey yapamaz',
          'Sahip her şeyi yapar, grup ve diğerleri yalnızca okuyabilir',
          'Herkes okuyabilir ama yalnızca dosyanın sahibi yazabilir',
          'Sahip okur, grup yazar, diğerleri yalnızca çalıştırabilir'
        ],
        a: 0,
        why: '6 = 4 + 2 (okuma + yazma), 4 = okuma, 0 = hiçbir şey. Sıra her zaman sahip, grup, diğerleri. Hassas bir dosya için bu yaygın ve doğru bir ayardır.'
      },
      {
        t: 'mc',
        id: 'terminal-temelleri-y2',
        stage: 'Isınma',
        q: 'Takılan bir ETL sürecini kapatmak istiyorsun ve yarım kalan dosyayı temizlemesini bekliyorsun. Hangi komutla başlamalısın?',
        o: ['<code>kill -9 PID</code>', '<code>kill PID</code>', '<code>rm -rf /tmp/*</code>', '<code>chmod 000 PID</code>'],
        a: 1,
        why: 'kill varsayılan olarak SIGTERM gönderir; süreç bunu yakalayıp temizlik yapabilir. kill -9 (SIGKILL) yakalanamaz, süreç anında ölür ve geride yarım dosya, kilit dosyası bırakabilir; yalnız SIGTERM işe yaramazsa kullanılır.'
      },
      {
        t: 'predict',
        id: 'terminal-temelleri-y3',
        stage: 'Kodu oku',
        q: 'Bu kod ne yazdırır?',
        o: ['754 -rwxr-xr--', '754 -rwxr-x--x', '0o754 rwxr-xr--', '754 drwxr-xr--'],
        a: 0,
        code: 'import stat\nprint(oct(0o754)[2:], stat.filemode(stat.S_IFREG | 0o754))\n',
        why: '7 = rwx, 5 = r-x, 4 = r--. Baştaki - normal dosya demektir (dizin olsaydı d). oct() "0o754" döndürür; [2:] öneki atar.'
      },
      {
        t: 'order',
        id: 'terminal-temelleri-y4',
        stage: 'Kodu oku',
        q: '<p><code>awk \'$3 &gt; 100 {t += $3; n++} END {print n, t}\'</code> komutunun Python karşılığını sırala. Beklenen çıktı:</p><pre class="out">2 470</pre>',
        lines: [
          'metin = "AM-1 İzmir 120\\nAM-2 Ankara 80\\nAM-3 İzmir 350"',
          't, n = 0, 0',
          'for satir in metin.splitlines():',
          '    alanlar = satir.split()',
          '    if int(alanlar[2]) > 100:',
          '        t += int(alanlar[2])',
          '        n += 1',
          'print(n, t)'
        ],
        expect: '2 470\n',
        hint: 'awk\'ın $3\'ü Python\'da [2]\'dir; END bloğu döngüden sonra çalışır.',
        why: 'awk varsayılan olarak boşluklara göre böler (split() gibi) ve alan numaraları 1\'den başlar. Koşul ve gövde her satırda, END bloğu tüm satırlar bitince bir kez çalışır.'
      },
      {
        t: 'code',
        id: 'terminal-temelleri-y5',
        stage: 'Rehberli',
        diff: 1,
        q: '<p><code>sembolik(izin)</code> yaz: <code>"754"</code> gibi üç haneli sayısal izni <code>"rwxr-xr--"</code> biçimine çevirsin.</p>',
        guide: ['Her haneyi ayrı ayrı int\'e çevir.', 'Bir hane için: 4 biti varsa "r", 2 biti varsa "w", 1 biti varsa "x", yoksa "-".', 'Üç parçayı birleştirip döndür.'],
        example: 'hane = 6\nprint(bool(hane & 4), bool(hane & 2), bool(hane & 1))\n',
        start: 'def sembolik(izin):\n    sonuc = ""\n    for h in izin:\n        d = int(h)\n        # TODO: r, w, x harflerini ya da - ekle\n    return sonuc\n',
        sol: 'def sembolik(izin):\n    sonuc = ""\n    for h in izin:\n        d = int(h)\n        sonuc += ("r" if d & 4 else "-") + ("w" if d & 2 else "-") + ("x" if d & 1 else "-")\n    return sonuc\n',
        tests: 'assert sembolik("754") == "rwxr-xr--", "754 -> rwxr-xr--"\nassert sembolik("644") == "rw-r--r--", "644 tipik dosya izni"\nassert sembolik("600") == "rw-------", "600 SSH özel anahtarı izni"\nassert sembolik("000") == "---------", "000 hiçbir izin yok"\nassert sembolik("777") == "rwxrwxrwx", "777 herkese her şey (kaçın!)"\n',
        hints: ['Her hane 3 bitlik bir sayıdır: 4 okuma, 2 yazma, 1 çalıştırma.', 'Bit kontrolü: d & 4 sıfır değilse okuma izni vardır.', 'sonuc += ("r" if d & 4 else "-") + ...'],
        why: 'Sayısal izin, üç bitlik üç sayının yan yana yazılmasıdır. & (bit düzeyinde ve) ile her biti ayrı ayrı sorgulamak, Python\'un stat.filemode fonksiyonunun da yaptığıdır.'
      },
      {
        t: 'code',
        id: 'terminal-temelleri-y6',
        stage: 'Rehberli',
        diff: 2,
        q: '<p>Küçük bir <code>grep</code> yaz: <code>grep(satirlar, desen, i=False, v=False, c=False)</code>. <code>desen</code> bir düzenli ifadedir (<code>re.search</code>). <code>i=True</code> büyük/küçük harf duyarsız arar, <code>v=True</code> eşleşmeyenleri seçer, <code>c=True</code> ise satırlar yerine seçilen satır <b>sayısını</b> döndürür.</p>',
        guide: [
          'flags değişkenini i\'ye göre re.IGNORECASE ya da 0 yap.',
          'Her satır için eşleşme var mı bak: bool(re.search(desen, s, flags)).',
          'v True ise koşulu tersine çevir (eşleşme != v).',
          'c True ise len, değilse liste döndür.'
        ],
        example: 'import re\nkayitlar = ["INFO basladi", "error disk", "ERROR ag"]\nprint([k for k in kayitlar if re.search("error", k, re.IGNORECASE)])\n',
        start: 'import re\n\ndef grep(satirlar, desen, i=False, v=False, c=False):\n    flags = 0\n    # TODO: i için bayrak\n    secilen = []\n    for s in satirlar:\n        # TODO: eşleşme ve v\n        pass\n    # TODO: c\n    return secilen\n',
        sol: 'import re\n\ndef grep(satirlar, desen, i=False, v=False, c=False):\n    flags = re.IGNORECASE if i else 0\n    secilen = [s for s in satirlar if bool(re.search(desen, s, flags)) != v]\n    return len(secilen) if c else secilen\n',
        tests: 'L = ["2024-10-01 INFO siparis alındı", "2024-10-01 ERROR ödeme zaman aşımı", "2024-10-02 error stok yok", "2024-10-02 WARN yavaş sorgu"]\nassert grep(L, "ERROR") == [L[1]], "Varsayılan arama büyük/küçük harfe duyarlı"\nassert grep(L, "error", i=True) == [L[1], L[2]], "-i ile iki satır"\nassert grep(L, "error", i=True, v=True) == [L[0], L[3]], "-v eşleşmeyenleri seçer"\nassert grep(L, "error", i=True, c=True) == 2, "-c sayıyı döndürür"\nassert grep(L, r"^2024-10-02") == [L[2], L[3]], "Desen düzenli ifadedir (^ satır başı)"\nassert grep(L, "yok", v=True, c=True) == 3, "-v ve -c birlikte"\n',
        hints: ['Üç bayrak birbirinden bağımsız; sırayla uygula: flags, seçim, dönüş biçimi.', 'eslesti != v ifadesi, v False iken eşleşenleri, True iken eşleşmeyenleri seçer.', 'return len(secilen) if c else secilen'],
        why: 'grep -ivc gibi bayraklar birleştirilebilir; Python sürümünde de her bayrak işin bir aşamasını değiştirir. bool != v hilesi "tersini al" bayrağını tek ifadede çözer.'
      },
      {
        t: 'code',
        id: 'terminal-temelleri-y7',
        stage: 'Kendin yaz',
        diff: 1,
        q: '<p><code>sayisal(sembol)</code> yaz: <code>"rwxr-x---"</code> gibi dokuz karakterlik izni <code>"750"</code> biçiminde metne çevirsin. Başta tür karakteri olabilir (<code>"-rw-r--r--"</code> ya da <code>"drwxr-xr-x"</code>); 10 karakter gelirse ilkini yok say.</p>',
        start: 'def sayisal(sembol):\n    pass\n',
        sol: 'def sayisal(sembol):\n    if len(sembol) == 10:\n        sembol = sembol[1:]\n    degerler = {"r": 4, "w": 2, "x": 1}\n    sonuc = ""\n    for i in range(0, 9, 3):\n        sonuc += str(sum(degerler.get(ch, 0) for ch in sembol[i:i + 3]))\n    return sonuc\n',
        tests: 'assert sayisal("rwxr-x---") == "750", "rwx=7, r-x=5, ---=0"\nassert sayisal("-rw-r--r--") == "644", "Baştaki tür karakteri atlanmalı"\nassert sayisal("drwxr-xr-x") == "755", "Dizin işareti d de atlanmalı"\nassert sayisal("rw-------") == "600", "SSH anahtarı izni"\nassert sayisal("---------") == "000", "Hiç izin yoksa 000 (baştaki sıfırlar korunur)"\n',
        hints: ['Dokuz karakteri üçerli gruplara böl: [0:3], [3:6], [6:9].', 'r=4, w=2, x=1; - 0 sayılır.', 'Sonucu int değil metin olarak kur ki "000" ve "044" gibi değerler korunsun.'],
        why: 'Sembolik → sayısal dönüşüm, ls -l çıktısını okuyup chmod komutuna çevirmenin zihinsel karşılığıdır. Sonucu metin tutmak baştaki sıfırların kaybolmasını önler.'
      },
      {
        t: 'code',
        id: 'terminal-temelleri-y8',
        stage: 'Kendin yaz',
        diff: 2,
        q: '<p><code>awk -F, \'NR &gt; 1 {t[$8] += $10} END {...}\'</code> komutunun genel Python karşılığını yaz: <code>sutun_topla(yol, anahtar, deger, ayirici=",")</code>. Sütun numaraları awk\'taki gibi <b>1\'den başlar</b>; ilk satır başlıktır ve atlanır; boş değer 0 sayılır. Sonucu her toplam 2 ondalığa yuvarlanmış bir sözlük olarak döndür. Gerçek veriyle dene: <code>veri.yol("lezzet_kurye", "lk_orders")</code> dosyasında 8. sütun sipariş durumu, 10. sütun teslimat ücretidir.</p>',
        start: 'import veri\n\ndef sutun_topla(yol, anahtar, deger, ayirici=","):\n    pass\n\nprint(sutun_topla(veri.yol("lezzet_kurye", "lk_orders"), 8, 10))\n',
        sol: 'import veri\n\ndef sutun_topla(yol, anahtar, deger, ayirici=","):\n    t = {}\n    with open(yol, encoding="utf-8") as f:\n        next(f)\n        for satir in f:\n            alan = satir.rstrip("\\n").split(ayirici)\n            t[alan[anahtar - 1]] = t.get(alan[anahtar - 1], 0) + float(alan[deger - 1] or 0)\n    return {k: round(v, 2) for k, v in t.items()}\n\nprint(sutun_topla(veri.yol("lezzet_kurye", "lk_orders"), 8, 10))\n',
        tests: 's = sutun_topla(veri.yol("lezzet_kurye", "lk_orders"), 8, 10)\nassert s == {"teslim": 73933.2, "iade": 1832.6, "iptal": 4128.6}, f"Durum bazında teslimat ücreti toplamı yanlış: {s}"\nwith open("mini.tsv", "w", encoding="utf-8") as f:\n    f.write("sehir\\tadet\\tciro\\nİzmir\\t2\\t100\\nAnkara\\t1\\t\\nİzmir\\t1\\t50.5\\n")\nassert sutun_topla("mini.tsv", 1, 3, ayirici="\\t") == {"İzmir": 150.5, "Ankara": 0}, "Sekme ayırıcı ve boş değer (0) desteklenmeli"\n',
        hints: ['awk\'ın $8\'i Python listesinde [7]\'dir: indeks = numara - 1.', 'Başlığı next(f) ile atla; satır sonunu rstrip("\\n") ile at.', 'Kayan nokta toplamı 73933.20000000072 gibi çıkar; sonuçta round(v, 2) kullan.'],
        why: 'Bu, awk\'ın en sık kullanılan kalıbıdır: dizi (sözlük) ile gruplayarak toplama. Python sürümü daha uzundur ama test edilebilir, Windows\'ta da çalışır ve tırnaklı CSV için csv modülüne kolayca geçirilebilir.'
      },
      {
        t: 'code',
        id: 'terminal-temelleri-y9',
        stage: 'Hata avı',
        kind: 'bug',
        diff: 2,
        q: '<p>Hatayı bul ve düzelt. <code>sed(satirlar, ifade)</code> sed\'in <code>s/eski/yeni/</code> ve <code>s/eski/yeni/g</code> biçimlerini taklit etmeli: <code>g</code> yoksa her satırda yalnız <b>ilk</b> eşleşme değişir. Kod <code>g</code> olmasa da tüm eşleşmeleri değiştiriyor ve ayrıca <code>eski</code> kısmını düzenli ifade olarak değil düz metin olarak arıyor.</p>',
        start: 'import re\n\ndef sed(satirlar, ifade):\n    _, eski, yeni, bayrak = ifade.split("/")\n    return [s.replace(eski, yeni) for s in satirlar]\n',
        sol: 'import re\n\ndef sed(satirlar, ifade):\n    _, eski, yeni, bayrak = ifade.split("/")\n    sayi = 0 if "g" in bayrak else 1\n    return [re.sub(eski, yeni, s, count=sayi) for s in satirlar]\n',
        tests: 'L = ["tel: 0532 111 22 33", "tel: 0533 444 55 66 ve 0212 000 00 00"]\nassert sed(L, "s/0/X/") == ["tel: X532 111 22 33", "tel: X533 444 55 66 ve 0212 000 00 00"], "g yoksa her satırda yalnız ilk 0 değişmeli"\nassert sed(L, r"s/[0-9]{4}/****/g") == ["tel: **** 111 22 33", "tel: **** 444 55 66 ve **** 000 00 00"], "eski kısmı düzenli ifadedir; g ile hepsi değişir"\nassert sed(["aaa"], "s/a/b/g") == ["bbb"], "g tümünü değiştirir"\n',
        hints: ['İki hata var: count ve arama türü.', 're.sub(desen, yeni, metin, count=1) yalnız ilk eşleşmeyi değiştirir; count=0 hepsini.', 'bayrak içinde "g" varsa count=0, yoksa 1.'],
        why: 'sed\'in varsayılanı satır başına ilk eşleşmedir; çoğu kişi g\'yi unutup "neden hepsi değişmedi" diye şaşırır, Python\'da ise tam tersi: str.replace ve re.sub varsayılan olarak hepsini değiştirir. Araçlar arasında geçerken varsayılanları bilmek gerekir.'
      },
      {
        t: 'code',
        id: 'terminal-temelleri-y10',
        stage: 'Meydan okuma',
        diff: 3,
        q: '<p>Klasik log tek satırlığının Python karşılığı: <code>awk \'{print $1}\' access.log | sort | uniq -c | sort -rn | head -n 3</code>. <code>en_cok(log_metni, alan=1, n=3)</code> yaz: her satırın <code>alan</code>. boşlukla ayrılmış alanını (1\'den başlar) say, en çok görülen <code>n</code> değeri <code>(sayi, deger)</code> demetleri olarak döndür. Sayıya göre azalan; eşitlikte değere göre alfabetik artan sırala. Boş satırları ve alanı eksik satırları atla.</p>',
        start: 'def en_cok(log_metni, alan=1, n=3):\n    pass\n',
        sol: 'from collections import Counter\n\ndef en_cok(log_metni, alan=1, n=3):\n    sayac = Counter()\n    for satir in log_metni.splitlines():\n        parcalar = satir.split()\n        if len(parcalar) >= alan:\n            sayac[parcalar[alan - 1]] += 1\n    sirali = sorted(sayac.items(), key=lambda kv: (-kv[1], kv[0]))\n    return [(sayi, deger) for deger, sayi in sirali[:n]]\n',
        tests: 'LOG = """10.0.0.5 - - [01/Oct/2024] "GET /sepet" 200\n10.0.0.9 - - [01/Oct/2024] "GET /urun/7" 404\n10.0.0.5 - - [01/Oct/2024] "POST /odeme" 500\n10.0.0.2 - - [01/Oct/2024] "GET /urun/7" 404\n\n10.0.0.9 - - [01/Oct/2024] "GET /urun/9" 404\n10.0.0.5 - - [01/Oct/2024] "GET /" 200\n10.0.0.7\n"""\nassert en_cok(LOG) == [(3, "10.0.0.5"), (2, "10.0.0.9"), (1, "10.0.0.2")], "IP sayımı: eşitlikte alfabetik (10.0.0.2 < 10.0.0.7)"\nassert en_cok(LOG, alan=7, n=2) == [(3, "404"), (2, "200")], "7. alan durum kodu; kısa satır atlanmalı"\nassert en_cok(LOG, n=10)[-1] == (1, "10.0.0.7"), "n tüm değerlerden büyükse hepsi döner"\nassert en_cok("") == [], "Boş log boş liste"\n',
        hints: ['collections.Counter sayımı tek satıra indirir.', 'Sıralama anahtarı (-sayi, deger): sayı azalan, değer artan.', 'Satırı split() ile böl; len(parcalar) < alan ise atla.'],
        why: 'uniq yalnız ardışık tekrarları sayar, bu yüzden kabukta önce sort gerekir; Counter ise sırasız sayar. Eşitlikleri belirli bir kurala bağlamak (deterministik çıktı) raporları ve testleri kararlı kılar.'
      }
    ],
    faq: [
      {
        q: 'Windows kullanıyorum; bu komutları öğrenmem gerekli mi?',
        a: 'Sunucuların, konteynerlerin ve CI makinelerinin çok büyük bölümü Linux çalıştırır; bir gün mutlaka bağlanacaksın. Windows\'ta WSL ile gerçek bir Ubuntu kabuğu kurabilirsin (wsl --install). Git for Windows ile gelen Git Bash de grep, sed, awk, find gibi temel araçları içerir.'
      },
      {
        q: 'SSH parolası mı, SSH anahtarı mı?',
        a: 'Anahtar. ssh-keygen -t ed25519 ile çift üret, özel anahtar (id_ed25519) bilgisayarında kalır ve parola cümlesiyle korunur; açık anahtar (.pub) sunucuya ve GitHub\'a eklenir. Sunucuda parola ile girişi kapatmak kaba kuvvet saldırılarını etkisiz kılar.'
      }
    ]
  }
);
})(window);
