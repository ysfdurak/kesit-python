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
    ex: [{
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
      }],
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
