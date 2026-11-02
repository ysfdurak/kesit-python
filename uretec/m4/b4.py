QS = []
def S(**k): QS.append(k)

S(id='m-380', roles=['otomasyon', 'muhendis'], lv='orta', topic='Atomik yazma ve os.replace', kind='kod-okuma',
q='Bir betik kaldığı yeri <code>durum.json</code> dosyasında tutuyor. Dosya bir kez atomik yöntemle, bir kez doğrudan yazılıyor ve her ikisinde de yazma sırasında hata oluşuyor. Çıktı nedir?',
a='<p><b>Atomik yazma:</b> Yeni içerik aynı klasörde geçici bir dosyaya yazılır, diske indirilir (<code>fsync</code>) ve <code>os.replace</code> ile tek adımda eski dosyanın yerine konur. Aynı dosya sisteminde <code>os.replace</code> atomiktir: okuyan herkes ya eski ya yeni dosyayı görür, yarım dosyayı asla.</p><p><b>Çıktı:</b></p><ul><li><code>atomik: hata</code>: küme JSON\'a çevrilemedi (<code>TypeError</code>). Hata <code>replace</code>\'ten önce olduğu için eski dosya <b>dokunulmadan</b> kaldı: <code>{\'son_islenen\': \'2024-05-01\'}</code>. Klasörde yalnız <code>durum.json</code> var; <code>except</code> bloğu geçici dosyayı sildi.</li><li>Başarılı atomik yazma: <code>2024-05-02</code>.</li><li><code>saf: hata</code>: <code>open(yol, \'w\')</code> dosyayı <b>açar açmaz sıfırlar</b>. Yazma yarıda kesilince dosyada yalnız <code>{"son_isle</code> kaldı: <code>BOZUK: ...</code>. Betik bir sonraki çalışmada durumunu okuyamaz; ya çöker ya da baştan başlayıp her şeyi yeniden işler.</li></ul><p><b>Neden önemli:</b> Zamanlanmış betikler disk dolması, süreç öldürülmesi ya da elektrik kesintisiyle tam yazma anında kesilebilir. Durum dosyaları, yapılandırma ve rapor çıktıları için atomik yazma idempotent ve kendini toparlayabilen betiklerin temelidir.</p><p><b>Ayrıntılar:</b> Geçici dosya <b>aynı klasörde</b> oluşturulur; farklı diskler arasında <code>replace</code> atomik değildir (hatta başarısız olur). <code>os.rename</code> Windows\'ta hedef varsa hata verir; <code>os.replace</code> her iki platformda üzerine yazar.</p>',
code='''import json
import os
import tempfile
from pathlib import Path

klasor = Path(tempfile.mkdtemp())
durum = klasor / 'durum.json'
durum.write_text(json.dumps({'son_islenen': '2024-05-01'}))

def atomik_yaz(yol, veri):
    fd, gecici = tempfile.mkstemp(dir=yol.parent, suffix='.tmp')
    try:
        with os.fdopen(fd, 'w') as f:
            f.write(json.dumps(veri))
            f.flush()
            os.fsync(f.fileno())
        os.replace(gecici, yol)
    except BaseException:
        os.unlink(gecici)
        raise

def saf_yaz(yol, veri):
    with open(yol, 'w') as f:
        f.write(json.dumps(veri)[:10])
        raise RuntimeError('disk doldu')

def oku():
    try:
        return json.loads(durum.read_text())
    except json.JSONDecodeError:
        return f'BOZUK: {durum.read_text()!r}'

try:
    atomik_yaz(durum, {'son_islenen': {2024, 5, 2}})
except TypeError:
    print('atomik: hata')
print(oku(), sorted(p.name for p in klasor.iterdir()))
atomik_yaz(durum, {'son_islenen': '2024-05-02'})
print(oku())
try:
    saf_yaz(durum, {'son_islenen': '2024-05-03'})
except RuntimeError:
    print('saf: hata')
print(oku())
''',
out='''atomik: hata
{'son_islenen': '2024-05-01'} ['durum.json']
{'son_islenen': '2024-05-02'}
saf: hata
BOZUK: '{"son_isle\'''',
follow=['Geçici dosya neden <code>/tmp</code>\'de değil de hedefle aynı klasörde oluşturuluyor?', 'Aynı dosyaya iki süreç aynı anda yazarsa atomik yazma yeterli olur mu?', 'Büyük bir CSV raporunu atomik olarak nasıl yayınlarsın?'],
flags=['<code>open(..., \'w\')</code>\'nin hata durumunda eski içeriği koruduğunu sanmak', 'Atomikliği <code>try/except</code> ile sağlanmış saymak'],
tip='"Okuyan ya eski ya yeni dosyayı görür, yarımı asla" cümlesi atomikliğin en net tanımıdır.')

S(id='m-381', roles=['otomasyon', 'muhendis'], lv='orta', topic='Vaka: kaçırılan çalıştırmalar', kind='vaka',
q='Her sabah 07:00\'de "dünün satışlarını" işleyen bir Python betiği var. Sunucu bakım için üç gün kapalı kaldı; bir gün de betik hata verdi. Bu dört günün verisi hiç işlenmedi ve iki hafta sonra fark edildi. Betiği nasıl yeniden tasarlarsın?',
a='<p><b>Kök neden:</b> Betik "dün" kavramını <b>çalıştığı ana göre</b> hesaplıyor. Çalışmayan gün sonsuza kadar atlanır. Çözüm, işlenmiş son günü bir <b>su seviyesi</b> (watermark) olarak saklamak ve her çalışmada aradaki tüm günleri işlemektir.</p><pre>def eksik_gunler(son_islenen: date, bugun: date):\n    g = son_islenen + timedelta(days=1)\n    while g &lt; bugun:                     # bugün henüz tamamlanmadı\n        yield g\n        g += timedelta(days=1)\n\nfor gun in eksik_gunler(durum_oku(), date.today()):\n    gunu_isle(gun)                       # idempotent: o günü silip yeniden yazar\n    durum_yaz(gun)                       # yalnız başarıdan sonra, atomik</pre><ul><li><b>Idempotent gün işleme:</b> Her gün "o tarihin bölümünü sil + yeniden yaz" ya da UPSERT ile işlenir; aynı gün iki kez çalışsa da sonuç değişmez.</li><li><b>Su seviyesi sırası:</b> Durum, gün başarıyla bittikten <b>sonra</b> güncellenir; hata olursa bir sonraki çalışma aynı günden devam eder.</li><li><b>Elle geri doldurma:</b> <code>--baslangic</code>/<code>--bitis</code> argümanları ile belirli bir aralık yeniden işlenebilir.</li><li><b>Üst üste binme:</b> Dört günlük birikim uzun sürebilir; dosya kilidi ile ikinci kopyanın başlaması engellenir.</li><li><b>Görünürlük:</b> Su seviyesi bugünden 2 günden fazla gerideyse alarm. İki hafta sonra fark etmek asıl başarısızlıktır.</li></ul><p><b>Zamanlayıcı seçimi:</b> <code>schedule</code> kütüphanesi süreç içinde çalışır; süreç ölürse ya da makine kapalıysa kaçırılan işler telafi edilmez. cron da telafi etmez; systemd zamanlayıcısında <code>Persistent=true</code> ya da Airflow\'un <code>catchup</code> özelliği kaçırılan çalıştırmaları yakalar. Ama en sağlam yol, telafiyi betiğin kendi mantığına (su seviyesi) koymaktır.</p>',
follow=['Geçmiş bir günün kaynak verisi sonradan düzeltilirse nasıl yeniden işlersin?', 'Saat dilimi değişikliği "dün" hesabını nasıl bozabilir?', 'Su seviyesini dosyada mı veritabanında mı tutarsın?'],
flags=['Yalnız "cron\'u kontrol ederiz" demek', 'Kaçırılan günleri elle tek tek çalıştırmayı kalıcı çözüm saymak', 'Durumu işlemden önce güncellemek'],
tip='Vakada önce kök nedeni tek cümleyle adlandır ("dün, çalışma anına göre hesaplanıyor"); çözüm o cümleden doğal olarak çıkar.')

S(id='m-382', roles=['otomasyon', 'muhendis'], lv='orta', topic='requests: zaman aşımı ve Retry adaptörü', kind='kavram',
q='<code>requests</code> ile bir API\'den veri çeken gece betiği bazen sabaha kadar takılı kalıyor, bazen de geçici 503 hatalarında düşüyor. <code>requests</code>\'i nasıl yapılandırırsın?',
a='<p><b>Takılmanın nedeni:</b> <code>requests</code>\'in <b>varsayılan zaman aşımı yoktur</b>. Sunucu bağlantıyı açık tutup yanıt vermezse çağrı sonsuza kadar bekler. Her çağrıya <code>timeout</code> verilmelidir: <code>timeout=(3.05, 30)</code> → bağlantı kurma için 3, iki bayt arası okuma beklemesi için 30 saniye. Okuma zaman aşımı <b>toplam süre değildir</b>; sunucu damla damla veri gönderirse çağrı yine uzun sürebilir.</p><p><b>Geçici hatalar için yeniden deneme:</b> Kendi döngün yerine urllib3\'ün <code>Retry</code> sınıfı oturuma bağlanır:</p><pre>from requests.adapters import HTTPAdapter\nfrom urllib3.util.retry import Retry\n\nyeniden = Retry(\n    total=5,\n    backoff_factor=0.5,                       # 0.5, 1, 2, 4... sn\n    status_forcelist=[429, 500, 502, 503, 504],\n    allowed_methods={"GET", "PUT", "DELETE"},  # POST yok: idempotent değil\n    respect_retry_after_header=True,\n)\noturum = requests.Session()\noturum.mount("https://", HTTPAdapter(max_retries=yeniden))\nr = oturum.get(url, timeout=(3.05, 30))\nr.raise_for_status()</pre><ul><li><b>Session:</b> TCP/TLS bağlantılarını yeniden kullanır, ortak başlıkları (token) bir kez ayarlatır.</li><li><b>POST:</b> Varsayılan olarak yeniden denenmez; çünkü sunucu isteği işlemiş ama yanıt kaybolmuş olabilir. Gerekirse API\'nin idempotency anahtarı desteğiyle yapılır.</li><li><b>raise_for_status:</b> Olmazsa 404/500 yanıtı başarılı gibi işlenir; betik boş JSON\'la devam eder.</li><li><b>4xx hataları</b> (400, 401, 404) yeniden denenmez; kalıcıdır ve hemen raporlanmalıdır.</li></ul><p><b>Toplam süre bütçesi:</b> Gece betiği için ayrıca toplam bir üst sınır (ör. 20 dakika) konur; sınır aşılırsa betik kod 1 ile biter ve alarm verir.</p>',
follow=['Sayfalı bir API\'de 37. sayfada kalıcı hata alırsan ne yaparsın?', 'Retry nesnesi bağlantı hatalarını ve okuma hatalarını nasıl ayırır?', 'Aynı yapılandırmayı httpx ile nasıl kurarsın?'],
flags=['requests\'in varsayılan bir zaman aşımı olduğunu sanmak', 'POST isteklerini koşulsuz yeniden denemek', 'Tüm 4xx hatalarını da yeniden denemek'],
tip='İlk cümlede "requests\'te varsayılan zaman aşımı yoktur" demek, sorunun yarısını doğrudan çözer ve deneyim gösterir.')

S(id='m-383', roles=['otomasyon', 'backend'], lv='ileri', topic='Retry-After ve geri çekilme süresi', kind='kod-okuma',
q='429/503 yanıtlarından sonra ne kadar bekleneceğini hesaplayan bir fonksiyon. <code>Retry-After</code> başlığı saniye ya da HTTP tarihi olabilir. Yedi çağrının çıktısı nedir? Bu fonksiyonun tasarımında tartışmalı olan nokta ne?',
a='<p><b>Mantık:</b> Başlık varsa önce ona bakılır. Tamamen rakamsa saniye olarak okunur; değilse HTTP tarihi olarak <code>email.utils.parsedate_to_datetime</code> ile çözülür ve şimdiki zamandan farkı alınır. Başlık yoksa ya da çözülemezse üstel geri çekilme: <code>taban × 2^deneme</code>, <code>tavan</code> ile sınırlı.</p><p><b>Çıktı:</b></p><ul><li><code>1.0</code>, <code>8.0</code>: 1 × 2⁰ ve 1 × 2³.</li><li><code>60.0</code>: 2¹⁰ = 1024 saniye tavana takıldı.</li><li><code>60.0</code>: sunucu 120 saniye dedi ama tavan 60.</li><li><code>30.0</code>: HTTP tarihi 30 saniye sonrasını gösteriyor.</li><li><code>0.0</code>: tarih geçmişte; negatif bekleme <code>max(0, ...)</code> ile engellendi (<code>time.sleep</code> negatif değerde hata verir).</li><li><code>4.0</code>: <code>\'yarın\'</code> çözülemedi (<code>ValueError</code>); üstel değere düşüldü: 1 × 2².</li></ul><p><b>Tartışmalı nokta:</b> Sunucunun istediği 120 saniyeyi 60\'a indirmek, büyük olasılıkla yine 429 almak ve kotayı daha da zorlamak demektir. Daha doğru tasarım: sunucunun söylediğine uymak; o süre toplam bütçeyi aşıyorsa beklemek yerine <b>hemen ve açıkça başarısız olmak</b>. Ayrıca çok sayıda istemci aynı anda yeniden denerse sürü etkisi oluşur; üstel değere rastgele sapma (jitter) eklenmelidir: <code>random.uniform(0, ust)</code>.</p><p><b>Python ayrıntıları:</b> Saat farkı için <code>simdi</code> saat dilimli (UTC) olmalıdır; naive bir değerle aware tarih çıkarılamaz (<code>TypeError</code>). Gerçek kodda başlık sözlüğü büyük/küçük harf duyarsızdır (<code>requests</code>\'in <code>CaseInsensitiveDict</code>\'i); burada sade bir sözlük kullanıldı. <code>simdi</code>\'nin parametre olarak verilmesi fonksiyonu test edilebilir kılar.</p>',
code='''from datetime import datetime, timezone
from email.utils import parsedate_to_datetime

def bekleme_suresi(deneme, basliklar, simdi, taban=1.0, tavan=60.0):
    deger = basliklar.get('Retry-After')
    if deger is not None:
        if deger.strip().isdigit():
            return min(float(deger), tavan)
        try:
            hedef = parsedate_to_datetime(deger)
        except (TypeError, ValueError):
            pass
        else:
            return max(0.0, min((hedef - simdi).total_seconds(), tavan))
    return min(taban * 2 ** deneme, tavan)

simdi = datetime(2024, 5, 2, 9, 0, 0, tzinfo=timezone.utc)
print(bekleme_suresi(0, {}, simdi))
print(bekleme_suresi(3, {}, simdi))
print(bekleme_suresi(10, {}, simdi))
print(bekleme_suresi(0, {'Retry-After': '120'}, simdi))
print(bekleme_suresi(0, {'Retry-After': 'Thu, 02 May 2024 09:00:30 GMT'}, simdi))
print(bekleme_suresi(0, {'Retry-After': 'Thu, 02 May 2024 08:59:00 GMT'}, simdi))
print(bekleme_suresi(2, {'Retry-After': 'yarın'}, simdi))
''',
out='''1.0
8.0
60.0
60.0
30.0
0.0
4.0''',
follow=['Tam sapmalı (full jitter) ve eşit sapmalı geri çekilme arasındaki fark nedir?', 'Birden çok iş parçacığı aynı API\'ye istek atıyorsa 429 sonrası beklemeyi nasıl paylaştırırsın?', 'Bu fonksiyonu sabit saat kullanmadan nasıl test edersin?'],
flags=['Tarih biçimli Retry-After değerini int\'e çevirmeye çalışmak', 'Geçmiş tarihte negatif bekleme olasılığını görmemek', 'Sunucunun bekleme süresini kısaltmayı sorunsuz saymak'],
tip='Kod okuma sorusunda "bu kodda neyi değiştirirdin?" sorusuna hazırlıklı ol; tavan ile Retry-After çatışması iyi bir eleştiri noktasıdır.')

S(id='m-384', roles=['otomasyon'], lv='orta', topic='EmailMessage ile çok parçalı e-posta', kind='kod-okuma',
q='Günlük rapor e-postası <code>email.message.EmailMessage</code> ile hem düz metin hem HTML gövde ve bir CSV ekiyle oluşturuluyor. Çıktı nedir? E-postanın MIME yapısını açıkla.',
a='<p><b>MIME ağacı adım adım oluşur:</b></p><ul><li><code>set_content</code>: tek parçalı <code>text/plain</code> ileti.</li><li><code>add_alternative(..., subtype=\'html\')</code>: ileti <code>multipart/alternative</code>\'e dönüşür; içinde aynı içeriğin iki <b>alternatif</b> gösterimi vardır. E-posta istemcisi gösterebildiği en zengin olanı (HTML) seçer, HTML göstermeyen istemci düz metni kullanır.</li><li><code>add_attachment</code>: en dışa <code>multipart/mixed</code> eklenir; alternatif gövde ve ek onun çocuklarıdır.</li></ul><p><b>Çıktı:</b> Kök tür <code>multipart/mixed</code>; <code>walk()</code> ağacı derinlik öncelikli gezer: mixed, alternative, plain, html ve dosya adıyla birlikte <code>text/csv</code>. Kapsayıcı parçaların dosya adı yoktur (<code>None</code>). <code>get_body(preferencelist=(\'plain\',))</code> düz metin gövdeyi bulur; ikinci satırı ciro bilgisidir.</p><p><b>Neden EmailMessage:</b> Eski <code>MIMEMultipart</code>/<code>MIMEText</code> sınıflarıyla bu ağacı elle kurmak gerekirdi. Yeni API Türkçe karakterli konu satırını ve gövdeyi otomatik kodlar, <code>formataddr</code> görünen adı doğru biçimlendirir.</p><p><b>Gönderim:</b></p><pre>with smtplib.SMTP("smtp.firma.com", 587, timeout=30) as s:\n    s.starttls()\n    s.login(kullanici, os.environ["SMTP_PAROLA"])\n    s.send_message(m)</pre><p><code>send_message</code> alıcıları <code>To</code>/<code>Cc</code>/<code>Bcc</code> başlıklarından alır ve <code>Bcc</code> başlığını iletiden çıkarır. Parola koda yazılmaz. Gönderim hatası (<code>SMTPException</code>) yakalanıp loglanmalı ve çıkış kodu ile bildirilmelidir.</p>',
code='''from email.message import EmailMessage
from email.utils import formataddr

m = EmailMessage()
m['Subject'] = 'Günlük satış raporu 02.05.2024'
m['From'] = formataddr(('Rapor Botu', 'rapor@firma.com'))
m['To'] = ', '.join(['ayse@firma.com', 'mehmet@firma.com'])
m.set_content('Rapor ektedir.\\nToplam ciro: 125.400 TL')
m.add_alternative('<p>Rapor ektedir.</p><p><b>Toplam ciro:</b> 125.400 TL</p>', subtype='html')
m.add_attachment('sube,ciro\\nIzmir,80400\\nBursa,45000\\n'.encode('utf-8'),
                 maintype='text', subtype='csv', filename='satis_2024-05-02.csv')

print(m.get_content_type())
for parca in m.walk():
    print(' ', parca.get_content_type(), parca.get_filename())
print(m['To'])
print(m.get_body(preferencelist=('plain',)).get_content().splitlines()[1])
''',
out='''multipart/mixed
  multipart/mixed None
  multipart/alternative None
  text/plain None
  text/html None
  text/csv satis_2024-05-02.csv
ayse@firma.com, mehmet@firma.com
Toplam ciro: 125.400 TL''',
follow=['HTML gövdeye satır içi (inline) bir grafik görseli nasıl eklersin?', '500 kişiye kişiselleştirilmiş e-posta gönderirken bağlantıyı nasıl yönetirsin?', 'Gönderimi gerçek SMTP sunucusu olmadan nasıl test edersin?'],
flags=['Ek eklendikten sonra kök türün <code>multipart/alternative</code> kaldığını sanmak', 'HTML ve düz metin gövdeyi iki ayrı ek gibi düşünmek'],
tip='MIME yapısını küçük bir ağaç olarak çizmek, bu sorudaki karmaşayı anında dağıtır.')

S(id='m-385', roles=['otomasyon', 'analist'], lv='temel', topic='Regex: findall grupları ve açgözlülük', kind='kod-okuma',
q='Bir sipariş metninden düzenli ifadelerle bilgi çekiliyor. Altı satırın çıktısı nedir? Dördüncü ve beşinci satır neden farklı?',
a='<p><b>findall ve gruplar:</b> <code>re.findall</code>\'ın döndürdüğü şey desendeki <b>yakalama grubu sayısına</b> bağlıdır:</p><ul><li>Grup yoksa: eşleşen metnin tamamı → <code>[\'#A-1024\', \'#B-77\']</code>.</li><li>Birden çok grup varsa: her eşleşme için bir demet → <code>[(\'A\', \'1024\'), (\'B\', \'77\')]</code>.</li><li>Tek grup varsa: yalnız o grup → <code>[\'3\', \'12\']</code>. Parantez <code>\\(</code> ile kaçırıldığı için gerçek parantez karakteri aranır, grup oluşturmaz.</li></ul><p><b>Açgözlülük:</b> <code>.*</code> <b>açgözlüdür</b>: olabildiğince uzun eşleşir ve son <code>&lt;/b&gt;</code>\'ye kadar gider; iki fatura numarası tek bir bozuk sonuçta birleşir. <code>.*?</code> tembel sürümdür, ilk <code>&lt;/b&gt;</code>\'de durur: <code>[\'F-2024/15\', \'F-2024/16\']</code>. Daha da sağlamı, izin verilen karakterleri daraltmaktır: <code>[^&lt;]+</code>.</p><p><b>Son satır:</b> <code>re.search</code> eşleşme yoksa <code>None</code> döndürür. Ardından <code>.group()</code> çağırmak <code>AttributeError</code> verir; otomasyonlarda en sık görülen regex hatası budur. Önce kontrol et: <code>if (m := re.search(...)):</code>.</p><p><b>Not:</b> Desenleri her zaman ham dize (<code>r\'...\'</code>) olarak yaz. HTML gibi iç içe yapıları regex ile ayrıştırmak kırılgandır; küçük, düzenli parçalar dışında bir ayrıştırıcı kullanılır.</p>',
code=r'''import re

metin = ('Sipariş #A-1024 (3 adet) ve #B-77 (12 adet) kargoya verildi. '
         'Fatura: <b>F-2024/15</b> <b>F-2024/16</b>')
print(re.findall(r'#[A-Z]-\d+', metin))
print(re.findall(r'#([A-Z])-(\d+)', metin))
print(re.findall(r'\((\d+) adet\)', metin))
print(re.findall(r'<b>(.*)</b>', metin))
print(re.findall(r'<b>(.*?)</b>', metin))
print(re.search(r'\d+', 'Toplam: yok'))
''',
out='''['#A-1024', '#B-77']
[('A', '1024'), ('B', '77')]
['3', '12']
['F-2024/15</b> <b>F-2024/16']
['F-2024/15', 'F-2024/16']
None''',
follow=['Yakalamayan grup <code>(?:...)</code> ne zaman gerekir?', 'Türkçe karakterleri de kapsayan bir "kelime" deseni nasıl yazılır?', 'Aynı deseni döngüde binlerce kez kullanırken <code>re.compile</code> fark yaratır mı?'],
flags=['İkinci satırda tam eşleşmelerin döneceğini sanmak', 'Açgözlü ve tembel nicelik belirteçlerini karıştırmak'],
tip='findall sorusunda önce desendeki grupları say; dönüş tipini o sayı belirler.')

S(id='m-386', roles=['otomasyon', 'muhendis'], lv='orta', topic='Regex: adlandırılmış gruplar ile log ayrıştırma', kind='kod-okuma',
q='Bir yedekleme aracının log dosyası <code>re.VERBOSE</code> ve adlandırılmış gruplarla ayrıştırılıyor. Çıktı nedir? Bozuk satıra ne oldu?',
a='<p><b>Desen:</b> <code>re.VERBOSE</code> desendeki boşlukları ve satır sonlarını yok sayar; böylece uzun bir deseni okunur parçalara bölebilirsin. Gerçek boşluk için <code>\\s</code> açıkça yazılır. <code>(?P&lt;ad&gt;...)</code> adlandırılmış gruplardır; <code>groupdict()</code> eşleşmeyi doğrudan sözlüğe çevirir. <code>re.MULTILINE</code> sayesinde <code>^</code> ve <code>$</code> her satırın başı ve sonunda eşleşir.</p><p><b>Çıktı:</b></p><ul><li><code>4 07:03:12 \'yedek basladi kullanici=ayse\'</code>: dört kayıt; <code>\\s+</code> seviye sonrası değişken sayıdaki boşluğu (<code>INFO  </code>) yuttuğu için mesaj temiz başlıyor.</li><li><code>Counter({\'ERROR\': 2, \'INFO\': 1, \'WARN\': 1})</code>: seviyelere göre sayım.</li><li><code>{\'kod\': \'28\', \'disk\': \'/dev/sdb1\'}</code>: mesajdaki <code>anahtar=değer</code> çiftleri iki gruplu <code>findall</code> ile demet listesine, oradan <code>dict</code>\'e çevrildi. Değerler hâlâ metin; <code>kod</code> sayı olarak gerekirse dönüştürülmeli.</li></ul><p><b>Bozuk satır:</b> <code>finditer</code> eşleşmeyen satırı <b>sessizce atladı</b>. Bu, log formatı değiştiğinde tüm kayıtların kaybolup raporun "hata yok" demesine yol açabilir. Sağlam yaklaşım: dosyayı satır satır okuyup <code>DESEN.match(satir)</code> ile denemek, eşleşmeyenleri saymak ve oran yüksekse uyarmak.</p><p><b>Büyük dosyalar:</b> Tüm dosyayı tek dizeye okumak yerine <code>for satir in dosya:</code> ile akış hâlinde işlemek belleği sabit tutar.</p>',
code=r'''import re
from collections import Counter

LOG = """2024-05-02 07:00:01 INFO  yedek basladi kullanici=ayse
2024-05-02 07:03:12 ERROR yedek basarisiz kod=28 disk=/dev/sdb1
2024-05-02 07:05:40 WARN  yeniden deneniyor deneme=2
2024-05-02 07:09:02 ERROR yedek basarisiz kod=28 disk=/dev/sdb1
bozuk satir burada"""

DESEN = re.compile(r"""
    ^(?P<tarih>\d{4}-\d{2}-\d{2})\s
    (?P<saat>\d{2}:\d{2}:\d{2})\s
    (?P<seviye>[A-Z]+)\s+
    (?P<mesaj>.*)$
""", re.VERBOSE | re.MULTILINE)

kayitlar = [m.groupdict() for m in DESEN.finditer(LOG)]
print(len(kayitlar), kayitlar[1]['saat'], repr(kayitlar[0]['mesaj']))
print(Counter(k['seviye'] for k in kayitlar))
hatalar = [dict(re.findall(r'(\w+)=(\S+)', k['mesaj'])) for k in kayitlar if k['seviye'] == 'ERROR']
print(hatalar[0])
''',
out='''4 07:03:12 'yedek basladi kullanici=ayse'
Counter({'ERROR': 2, 'INFO': 1, 'WARN': 1})
{'kod': '28', 'disk': '/dev/sdb1'}''',
follow=['Aynı ayrıştırmayı pandas\'ta <code>str.extract</code> ile nasıl yaparsın?', 'Çok satırlı (traceback içeren) log kayıtlarını nasıl gruplarsın?', 'Log formatı JSON olsaydı ne değişirdi?'],
flags=['VERBOSE modda desendeki boşlukların eşleşeceğini sanmak', 'Eşleşmeyen satırın hata fırlatacağını düşünmek'],
tip='Ayrıştırma sorularında "eşleşmeyen satırlara ne oluyor?" sorusunu kendin sorman, veri kaybına duyarlılığını gösterir.')

S(id='m-387', roles=['otomasyon', 'backend'], lv='ileri', topic='zoneinfo ve yaz saati geçişi', kind='kod-okuma',
q='Berlin saatiyle planlanmış bir toplantıya bir gün ekleniyor; yaz saati geçişi tam o gece. Çıktı nedir? <code>ertesi - toplanti</code> neden 24 saat gösteriyor, gerçekte kaç saat geçti?',
a='<p><b>Hazırlık:</b> <code>zoneinfo</code> (3.9+) IANA saat dilimi veritabanını kullanır. Linux\'ta sistemden gelir; Windows\'ta ve tarayıcıdaki Python\'da <code>tzdata</code> paketi gerekir, ilk satırlar bunu yükler.</p><p><b>Çıktı:</b></p><ul><li><code>2024-03-31 09:00:00+02:00 2:00:00</code>: <code>timedelta(days=1)</code> <b>duvar saatine</b> eklenir; yine 09:00, ama 31 Mart gecesi yaz saatine geçildiği için ofset +01:00\'den +02:00\'ye değişti.</li><li><code>1 day, 0:00:00</code>: İki değer <b>aynı tzinfo</b> nesnesini paylaştığında Python çıkarmayı duvar saatiyle yapar ve ofset farkını yok sayar. Gerçekte geçen süre <b>23 saattir</b>. Doğru süre için önce UTC\'ye çevir: <code>ertesi.astimezone(timezone.utc) - toplanti.astimezone(timezone.utc)</code>.</li><li><code>10:00 11:00</code>: İstanbul\'da yaz saati uygulanmadığı (sabit +03:00) için aynı Berlin toplantısı İstanbul\'dan bakınca bir saat erkene kaydı.</li><li><code>None 2024-05-02T07:00:00+03:00</code>: saat dilimsiz (naive) tarihe <code>replace(tzinfo=...)</code> ile dilim <b>iliştirilir</b>; saat değişmez. <code>astimezone</code> ise saati <b>dönüştürür</b>; ikisi karıştırılmamalı.</li><li><code>1:00:00</code>: 31 Mart 02:30 Berlin\'de <b>hiç yaşanmayan</b> bir saattir (02:00\'den 03:00\'e atlanır). Python hata vermez; <code>fold=0</code> ile geçiş öncesi ofseti kullanır.</li></ul><p><b>Otomasyon kuralları:</b> Saklarken ve hesaplarken UTC kullan, yalnız gösterirken yerel saate çevir. "Her gün 09:00\'da" gibi zamanlamalar yerel saatle, "her 24 saatte" gibi süreler UTC ile hesaplanır. <code>datetime.utcnow()</code> naive değer döndürür ve 3.12\'de kullanımdan kaldırıldı; <code>datetime.now(timezone.utc)</code> kullanılır.</p>',
code='''try:
    import tzdata  # Windows ve tarayıcıda saat dilimi veritabanı
except ImportError:
    pass
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

IST = ZoneInfo('Europe/Istanbul')
BER = ZoneInfo('Europe/Berlin')

toplanti = datetime(2024, 3, 30, 9, 0, tzinfo=BER)
ertesi = toplanti + timedelta(days=1)
print(ertesi, ertesi.utcoffset())
print(ertesi - toplanti)
print(ertesi.astimezone(IST).strftime('%H:%M'), toplanti.astimezone(IST).strftime('%H:%M'))

saf = datetime(2024, 5, 2, 7, 0)
print(saf.tzinfo, saf.replace(tzinfo=IST).isoformat())
print(datetime(2024, 3, 31, 2, 30, tzinfo=BER).utcoffset())
''',
out='''2024-03-31 09:00:00+02:00 2:00:00
1 day, 0:00:00
10:00 11:00
None 2024-05-02T07:00:00+03:00
1:00:00''',
follow=['Sonbaharda iki kez yaşanan 02:30 için <code>fold</code> özelliği nasıl kullanılır?', 'Veritabanında zaman damgalarını hangi tiple saklarsın?', 'pandas\'ta <code>tz_localize</code> ile <code>tz_convert</code> farkı nedir?'],
flags=['Farkın 23 saat olarak hesaplanacağını söylemek', '<code>replace(tzinfo=...)</code> ile <code>astimezone</code>\'u eşdeğer saymak', 'Türkiye\'nin hâlâ yaz saati uyguladığını varsaymak'],
tip='Saat dilimi sorularında "sakla ve hesapla UTC, göster yerel" kuralını söyle; ardından duvar saati ile geçen süre ayrımını örnekle.')

S(id='m-388', roles=['otomasyon'], lv='temel', topic='tempfile ile geçici dosya ve klasörler', kind='kod-okuma',
q='Bir rapor betiği ara dosyalarını <code>tempfile</code> ile oluşturuyor. Çıktı nedir? Hangi geçici dosya otomatik silinir, hangisi silinmez?',
a='<p><b>TemporaryDirectory:</b> Benzersiz adlı bir klasör oluşturur (<code>prefix</code> ile tanınabilir ad verilebilir) ve <code>with</code> bloğundan çıkınca <b>içindekilerle birlikte</b> siler. İlk satır: <code>True [\'ara.csv\']</code>; blok bitince <code>False</code>. Betik hata verse de klasör silinir; ara dosyalar diskte birikmez.</p><p><b>NamedTemporaryFile(delete=False):</b> Dosya kapanınca silinmez; yolunu başka bir sürece ya da kütüphaneye vermek için kullanılır. <code>True .txt</code> basılır ve temizlik senin sorumluluğundadır (<code>os.remove</code>, tercihen <code>finally</code> içinde).</p><p><b>NamedTemporaryFile (varsayılan):</b> Kapanınca silinir. <code>\'w+\'</code> kipiyle hem yazılıp hem okunabilir; yazdıktan sonra <code>seek(0)</code> ile başa dönmek gerekir, yoksa <code>read()</code> boş döner. Çıktı <code>merhaba</code>, sonra <code>False</code>.</p><p><b>Neden tempfile:</b> Sabit adlı <code>/tmp/rapor.csv</code> kullanmak, betiğin iki kopyası aynı anda çalışınca birbirinin dosyasını ezmesine ve güvenlik açıklarına (başka kullanıcının önceden oluşturduğu dosya ya da sembolik bağ) yol açar. <code>tempfile</code> adları öngörülemez ve dosyayı yalnız sahibinin okuyabileceği izinlerle oluşturur. <code>tempfile.mktemp()</code> yalnız ad üretir, yarış koşulu yüzünden kullanılmamalıdır.</p><p><b>Platform notu:</b> Windows\'ta açık bir <code>NamedTemporaryFile</code> başka bir süreç tarafından açılamaz; Python 3.12\'deki <code>delete_on_close=False</code> seçeneği bunun için eklendi. Metin kipinde <code>encoding=\'utf-8\'</code> vermek Türkçe karakterlerin platformdan bağımsız yazılmasını sağlar.</p>',
code='''import os
import tempfile
from pathlib import Path

with tempfile.TemporaryDirectory(prefix='rapor_') as d:
    calisma = Path(d)
    (calisma / 'ara.csv').write_text('a,b\\n1,2\\n', encoding='utf-8')
    print(calisma.name.startswith('rapor_'), [p.name for p in calisma.iterdir()])
print(calisma.exists())

with tempfile.NamedTemporaryFile('w+', suffix='.txt', delete=False, encoding='utf-8') as f:
    f.write('geçici veri')
    yol = f.name
print(os.path.exists(yol), Path(yol).suffix)
os.remove(yol)

with tempfile.NamedTemporaryFile('w+', encoding='utf-8') as f:
    f.write('merhaba')
    f.seek(0)
    print(f.read())
    yol2 = f.name
print(os.path.exists(yol2))
''',
out='''True ['ara.csv']
False
True .txt
merhaba
False''',
follow=['Geçici dosyaların varsayılan olarak nerede oluşturulduğunu nasıl değiştirirsin?', 'Büyük ara dosyalar için bellekte mi diskte mi çalışırsın (<code>SpooledTemporaryFile</code>)?', 'Testlerde pytest\'in <code>tmp_path</code> fixture\'ı ne sağlar?'],
flags=['<code>delete=False</code> dosyasının da otomatik silineceğini sanmak', '<code>seek(0)</code> olmadan okumanın içeriği getireceğini düşünmek'],
tip='Geçici dosya sorularında "betik çökerse ne kalır?" sorusunu cevaplamak, otomasyon deneyimini gösterir.')

S(id='m-389', roles=['otomasyon'], lv='orta', topic='zipfile: arcname ve güvenli açma', kind='kod-okuma',
q='Rapor klasörü bellekte bir zip arşivine paketleniyor; arşive kötü niyetli bir giriş de ekleniyor. Çıktı nedir? <code>arcname</code> verilmeseydi ne olurdu?',
a='<p><b>arcname:</b> <code>z.write(p)</code> yalnız dosya yolu alırsa arşive yolun tamamı (ör. <code>tmp/tmpx8k2/raporlar/2024/ocak.csv</code>) yazılır; arşivi açan kişi anlamsız bir klasör ağacıyla karşılaşır ve sunucunun klasör yapısı sızar. <code>arcname=p.relative_to(...)</code> ile arşiv içindeki yol <code>2024/ocak.csv</code> olur.</p><p><b>Çıktı:</b></p><ul><li><code>[\'2024/ocak.csv\', \'2024/subat.csv\', \'../../.bashrc\']</code>: <code>writestr</code> verilen adı olduğu gibi yazdı. İnternetten gelen bir arşivde böyle girişler olabilir.</li><li><code>2000 True</code>: dosya 2.000 bayt; tekrarlı metin olduğu için <code>ZIP_DEFLATED</code> ile çok daha küçük sıkıştırıldı. Sıkıştırma parametresi verilmeseydi varsayılan <code>ZIP_STORED</code> (sıkıştırmasız) kullanılırdı.</li><li>İlk iki giriş hedef klasörün içinde kalır: <code>GÜVENLİ</code>. <code>../../.bashrc</code> klasör dışına çıkıyor: <code>REDDET</code>.</li></ul><p><b>Zip Slip:</b> Kendi açma kodunu yazıp <code>hedef / ad</code> ile dosya oluşturursan, kötü niyetli bir arşiv sistemde istediği dosyanın üzerine yazabilir. Python\'un <code>ZipFile.extract/extractall</code>\'u mutlak yolları ve <code>..</code> parçalarını temizler; ama arşivi elle açıyorsan buradaki gibi <code>resolve()</code> + <code>is_relative_to</code> kontrolü şarttır. <code>tarfile</code> için Python 3.12+\'da <code>extractall(filter=\'data\')</code> kullanılmalıdır.</p><p><b>Zip bombası:</b> Açmadan önce <code>infolist()</code> ile <code>file_size</code> toplamını ve dosya sayısını kontrol edip bir üst sınır koymak gerekir.</p>',
code='''import io
import tempfile
import zipfile
from pathlib import Path

kok = Path(tempfile.mkdtemp())
(kok / 'raporlar' / '2024').mkdir(parents=True)
for ad in ['ocak.csv', 'subat.csv']:
    (kok / 'raporlar' / '2024' / ad).write_text('sube,ciro\\n' * 200)

tampon = io.BytesIO()
with zipfile.ZipFile(tampon, 'w', compression=zipfile.ZIP_DEFLATED) as z:
    for p in sorted((kok / 'raporlar').rglob('*.csv')):
        z.write(p, arcname=p.relative_to(kok / 'raporlar'))
    z.writestr('../../.bashrc', 'kotu')

with zipfile.ZipFile(tampon) as z:
    print(z.namelist())
    bilgi = z.getinfo('2024/ocak.csv')
    print(bilgi.file_size, bilgi.compress_size < bilgi.file_size)
    hedef = (kok / 'cikti').resolve()
    for ad in z.namelist():
        yol = (hedef / ad).resolve()
        print(ad, 'GÜVENLİ' if yol.is_relative_to(hedef) else 'REDDET')
''',
out='''['2024/ocak.csv', '2024/subat.csv', '../../.bashrc']
2000 True
2024/ocak.csv GÜVENLİ
2024/subat.csv GÜVENLİ
../../.bashrc REDDET''',
follow=['Diskte yer kaplamadan büyük bir zip\'i nasıl akış hâlinde üretirsin?', 'Parola korumalı zip\'ler için standart kütüphane ne kadar destek verir?', 'Zip içindeki CSV\'yi açmadan pandas ile nasıl okursun?'],
flags=['<code>arcname</code> olmadan arşivde yalnız dosya adının yer alacağını sanmak', 'Arşivdeki adların her zaman güvenli olduğunu varsaymak'],
tip='Arşiv sorularında "Zip Slip" ve "zip bombası" terimlerini anmak güvenlik farkındalığını hızla gösterir.')

S(id='m-390', roles=['otomasyon', 'muhendis'], lv='ileri', topic='Vaka: toplu işlemde bozuk dosya', kind='vaka',
q='Gece çalışan betik 300 bayiden gelen CSV dosyalarını işleyip veritabanına yüklüyor. Bir gece 47. dosyada <code>UnicodeDecodeError</code> ile çöktü; kalan 253 dosya işlenmedi ve sabah raporu eksik çıktı. Betiği Python tarafında nasıl yeniden tasarlarsın?',
a='<p><b>1. Hata türlerini ayır:</b> Hepsi aynı muameleyi hak etmez.</p><ul><li><b>Veri hataları</b> (kodlama, eksik sütun, bozuk satır): tek dosyaya özgüdür. Dosya karantinaya alınır, diğerleri işlenmeye devam eder.</li><li><b>Sistem hataları</b> (veritabanı bağlantısı, disk dolu, yetki): her dosyada tekrarlanacaktır. Betik <b>hemen</b> durmalı; 253 kez aynı hatayı almak anlamsızdır.</li></ul><pre>class VeriHatasi(Exception): ...\n\ndef oku(yol):\n    for kodlama in ("utf-8-sig", "cp1254"):     # Türkçe Windows dosyaları\n        try:\n            return pd.read_csv(yol, sep=";", encoding=kodlama)\n        except UnicodeDecodeError:\n            continue\n    raise VeriHatasi(f"{yol.name}: kodlama çözülemedi")\n\nozet = {"ok": 0, "karantina": []}\nfor yol in sorted(GELEN.glob("*.csv")):\n    try:\n        yukle(dogrula(oku(yol)))               # dosya başına tek transaction\n    except VeriHatasi as e:\n        log.warning("karantina: %s", e)\n        shutil.move(yol, KARANTINA / yol.name)\n        ozet["karantina"].append(yol.name)\n    else:\n        shutil.move(yol, ISLENDI / yol.name)\n        ozet["ok"] += 1\n# OperationalError gibi sistem hataları yakalanmaz: betik log.exception ile düşer</pre><p><b>2. Kodlama:</b> Önce <code>utf-8-sig</code>, sonra Türkçe Windows kodlaması <code>cp1254</code> denenir. <code>errors="ignore"</code> ile hatayı yutmak <b>sessiz veri bozulmasıdır</b>; yapılmaz.</p><p><b>3. Yeniden çalıştırılabilirlik:</b> İşlenen dosyalar <code>islendi/</code> klasörüne taşınır; betik tekrar çalışınca yalnız kalanları işler. Yükleme dosya başına transaction ve UPSERT ile yapılır, yarım dosya kalmaz.</p><p><b>4. Raporlama ve çıkış kodu:</b> Sonunda özet loglanır ve e-postayla gider ("297 başarılı, 3 karantinada: ..."). Çıkış kodu politikası: 0 = hepsi başarılı, 3 = kısmi başarı (karantina var), 1 = sistem hatası. Karantina oranı bir eşiği (ör. %5) aşarsa betik kısmi değil başarısız sayılır, çünkü kaynakta toplu bir format değişikliği vardır.</p><p><b>5. Önleme:</b> Bayilere şablon ve kodlama standardı bildirilir; karantina klasörü günlük olarak izlenir.</p>',
follow=['Karantinadaki dosya düzeltilince nasıl yeniden işlenir, kim tetikler?', 'Dosyaların bir kısmı hâlâ yazılırken (FTP yüklemesi sürerken) betik başlarsa ne olur?', 'Bu döngüyü paralelleştirmek istersen nelere dikkat edersin?'],
flags=['Tüm döngüyü tek <code>try/except Exception: pass</code> ile sarmak', '<code>errors="ignore"</code> ile kodlama hatasını yok saymak', 'Veri ve sistem hatalarını aynı şekilde ele almak'],
tip='Cevabı "hangi hata devam ettirir, hangisi durdurur" ayrımıyla başlatmak, mülakatçıya sistematik düşündüğünü gösterir.')
