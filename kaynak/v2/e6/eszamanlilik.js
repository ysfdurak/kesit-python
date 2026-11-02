/* Kesit Python — 'eszamanlilik' dersi uzantısı (Derinleş) */
(function (W) {
'use strict';
const X = W.PY_EXT = W.PY_EXT || [];
X.push(
  {
    id: 'eszamanlilik',
    min: 30,
    html: `<h2>Derinleş: süreç havuzu, Amdahl, kilit disiplini ve Future arayüzü</h2><p>Thread havuzu, GIL, Lock ve queue temellerini gördün. Bu bölüm gerçek projelerde karşına çıkan eksik parçaları tamamlıyor: ProcessPoolExecutor'ı Windows ve macOS'ta çalıştırmanın kuralları, işi süreçlere doğru bölmek, paralelliğin ne kadar hız getirebileceğini önceden hesaplamak (Amdahl yasası), kilitlerde kilitlenme (deadlock) önleme ve Future nesnesinin tam arayüzü.</p><div class="note"><b>Bu ortamda</b>Tarayıcıdaki Python (Pyodide) yeni thread ya da süreç başlatamaz. Bu yüzden thread/süreç başlatan örnekleri çalıştırılamaz kod kutusunda veriyoruz; çalıştırılabilir örnekler ve alıştırmalar ise Lock, RLock, Event, Future gibi nesneleri ve iş bölme mantığını thread başlatmadan kullanıyor. Aynı kod kendi bilgisayarında gerçek thread'lerle birebir çalışır.</div><h3>ProcessPoolExecutor'ı doğru kurmak</h3><pre class="code"># fiyat_opt.py — kendi bilgisayarında: python fiyat_opt.py
import os
from concurrent.futures import ProcessPoolExecutor

def optimize(urun_id: int) -&gt; tuple[int, float]:      # modül düzeyinde (pickle edilebilir)
    toplam = sum((urun_id * i) % 97 for i in range(200_000))
    return urun_id, toplam / 200_000

def main():
    urunler = range(1, 401)
    with ProcessPoolExecutor(max_workers=os.cpu_count()) as havuz:
        sonuc = dict(havuz.map(optimize, urunler, chunksize=25))
    print(len(sonuc), "ürün hesaplandı")

if __name__ == "__main__":       # Windows ve macOS'ta ZORUNLU
    main()
</pre><p>Windows ve macOS (Python 3.8+) yeni süreci <b>spawn</b> yöntemiyle başlatır: çocuk süreç betiğini baştan içe aktarır. <code>if __name__ == "__main__":</code> koruması yoksa her çocuk yeniden havuz kurmaya çalışır. <code>chunksize</code>, işleri süreçlere tek tek değil paketler halinde gönderir; çok sayıda küçük işte pickle ve iletişim maliyetini belirgin azaltır.</p><div class="tbl-wrap"><table><tr><th>Belirti</th><th>Neden</th><th>Çözüm</th></tr><tr><td><code>RuntimeError: An attempt has been made to start a new process before the current process has finished its bootstrapping phase</code></td><td><code>__main__</code> koruması yok (spawn)</td><td>Havuzu <code>if __name__ == "__main__":</code> altında kur</td></tr><tr><td><code>PicklingError: Can't pickle &lt;function &lt;lambda&gt;&gt;</code></td><td>lambda, iç fonksiyon ya da yerel sınıf gönderildi</td><td>Fonksiyonu modül düzeyinde tanımla; parametre için <code>functools.partial</code></td></tr><tr><td><code>AttributeError: Can't get attribute 'f' on &lt;module '__main__'&gt;</code></td><td>Jupyter'de tanımlanan fonksiyon süreçte bulunamıyor</td><td>Fonksiyonu bir <code>.py</code> modülüne taşı ve içe aktar</td></tr><tr><td><code>BrokenProcessPool</code></td><td>Çocuk süreç çöktü (bellek yetmedi, sistem sonlandırdı)</td><td>Daha küçük parçalar, daha az işçi; logları incele</td></tr><tr><td>Süreçlerle daha yavaş</td><td>İşler çok küçük, kopyalama maliyeti hesabı aşıyor</td><td><code>chunksize</code> büyüt ya da işi birleştir; önce numpy/pandas dene</td></tr></table></div><h3>Ne kadar hızlanır? Amdahl yasası</h3><p>Programın yalnızca bir kısmı paralelleştirilebilir: dosyayı okumak, sonuçları birleştirmek sıralı kalır. Paralel oran <code>p</code>, işçi sayısı <code>n</code> ise en iyi hızlanma <code>1 / ((1 - p) + p / n)</code> olur. İşin %90'ı paralel olsa bile sınır 10 kattır; 64 çekirdek almadan önce bu hesabı yapmak para kazandırır.</p><pre class="py">def hizlanma(p: float, n: int) -&gt; float:
    return 1 / ((1 - p) + p / n)

for n in (1, 2, 4, 8, 16, 64):
    print(f"{n:&gt;3} işçi: %90 paralel -&gt; {hizlanma(0.90, n):5.2f}x   %50 paralel -&gt; {hizlanma(0.50, n):4.2f}x")
print("üst sınır (%90):", round(1 / (1 - 0.90), 1))
</pre><h3>İşi parçalara bölmek ve birleştirmek</h3><p>Süreç havuzunda en verimli kalıp böl-hesapla-birleştir (map-reduce) kalıbıdır: veriyi yaklaşık eşit parçalara böl, her parça kendi kısmi özetini döndürsün, ana süreç özetleri birleştirsin. Paylaşılan değişken yok, kilit yok. Kısmi özet fonksiyonunu ayrı yazmak bir avantaj daha getirir: aynı kodu önce sıralı <code>map</code> ile test eder, sonra <code>havuz.map</code> ile paralel çalıştırırsın.</p><pre class="py">from collections import Counter

siparisler = [("Ankara", 120.0), ("İzmir", 80.0), ("Ankara", 45.5), ("Bursa", 300.0),
              ("İzmir", 19.9), ("Ankara", 10.0), ("Bursa", 5.0)]

def parcala(veri, n):
    boyut, artan = divmod(len(veri), n)
    parcalar, bas = [], 0
    for i in range(n):
        son = bas + boyut + (1 if i &lt; artan else 0)
        parcalar.append(veri[bas:son])
        bas = son
    return parcalar

def kismi_ciro(parca):
    c = Counter()
    for sehir, tutar in parca:
        c[sehir] += tutar
    return c

parcalar = parcala(siparisler, 3)
print([len(p) for p in parcalar])
toplam = sum(map(kismi_ciro, parcalar), Counter())    # havuz.map ile aynı arayüz
print(dict(sorted(toplam.items())))
</pre><h3>Senkronizasyon araçları</h3><div class="tbl-wrap"><table><tr><th>Araç</th><th>Ne işe yarar</th><th>Örnek</th></tr><tr><td><code>Lock</code></td><td>Kritik bölgeye tek seferde tek thread</td><td>Bakiye güncelleme</td></tr><tr><td><code>RLock</code></td><td>Aynı thread kilidi iç içe tekrar alabilir</td><td>Kilitli bir metot başka kilitli metodu çağırıyor</td></tr><tr><td><code>Semaphore(n)</code></td><td>Aynı anda en çok n thread</td><td>Veritabanına en çok 5 bağlantı</td></tr><tr><td><code>Event</code></td><td>Bir thread'in diğerlerine "başla/dur" sinyali</td><td>Kapanış bayrağı: <code>while not dur.is_set()</code></td></tr><tr><td><code>Condition</code></td><td>Bir koşul gerçekleşene kadar bekle-uyandır</td><td>Kendi kuyruğunu yazarken (çoğu zaman <code>queue</code> yeter)</td></tr></table></div><pre class="py">import threading

kilit = threading.Lock()
kilit.acquire()
print("Lock ikinci kez alınabilir mi?", kilit.acquire(blocking=False))   # kendini kilitler
kilit.release()

rk = threading.RLock()
with rk:
    with rk:                       # aynı thread: sorun yok
        print("RLock iç içe alındı")

dur = threading.Event()
print("dur?", dur.is_set())
dur.set()                          # işçi döngüleri bunu görüp çıkar
print("dur?", dur.is_set(), "| bekleme sonucu:", dur.wait(timeout=0.01))
</pre><h3>Kilitlenme (deadlock) ve kilit sırası</h3><p>Thread A önce hesap 1'in, sonra hesap 2'nin kilidini; thread B aynı anda önce hesap 2'nin, sonra hesap 1'in kilidini almaya çalışırsa ikisi de sonsuza kadar bekler. En basit ve etkili kural: birden çok kilit gerektiğinde onları <b>her zaman aynı sırada</b> al (ör. hesap numarasına göre artan). Ek savunma olarak <code>kilit.acquire(timeout=1)</code> False dönerse işlemi geri al ve hata raporla.</p><h3>Future: sonucun sözü</h3><p><code>submit</code> bir <code>Future</code> döndürür. <code>done()</code> bitti mi, <code>result(timeout=...)</code> sonucu (işçideki istisnayı yeniden fırlatarak) verir, <code>exception()</code> istisnayı döndürür, <code>cancel()</code> henüz başlamamış işi iptal eder, <code>add_done_callback</code> bitince çalışacak fonksiyonu kaydeder. Havuzu kapatırken <code>shutdown(cancel_futures=True)</code> kuyrukta bekleyen işleri iptal eder.</p><pre class="py">from concurrent.futures import Future

f = Future()                      # havuzun içeride yaptığını elle yapıyoruz
f.add_done_callback(lambda g: print("geri çağrı: bitti =", g.done()))
f.set_result({"USD": 32.5})
print(f.result())

hata = Future()
hata.set_exception(TimeoutError("kur servisi cevap vermedi"))
try:
    hata.result()
except TimeoutError as e:
    print("result() istisnayı yeniden fırlattı:", e)

bekleyen = Future()
print("iptal edildi mi?", bekleyen.cancel(), bekleyen.cancelled())
</pre><div class="tip"><b>Yürütücüyü parametre yap</b>Fonksiyonların <code>havuz</code> nesnesini dışarıdan alırsa (bağımlılık enjeksiyonu), testte sıralı çalışan sahte bir yürütücü verip deterministik test yazabilir, üretimde gerçek <code>ThreadPoolExecutor</code> ya da <code>ProcessPoolExecutor</code> kullanırsın.</div><div class="warn"><b>GIL'siz Python</b>Python 3.13 ile deneysel gelen "free-threaded" (GIL'siz) derleme 3.14'te resmî destek kazandı; saf Python CPU işinde thread'ler gerçekten paralel çalışabiliyor. Varsayılan değil, ayrıca kurulur ve bazı paketler henüz desteklemiyor. Kilit disiplini GIL olsa da olmasa da gerekir: GIL hiçbir zaman <code>sayac += 1</code> gibi işlemleri atomik yapma sözü vermedi.</div><div class="note"><b>Gerçek işte</b>Veri ekiplerinde paralellik çoğunlukla gece çalışan toplu işlerde görülür: dosyalar thread havuzuyla indirilir, ağır hesap süreç havuzunda parçalara bölünerek yapılır, sonuçlar ana süreçte birleştirilir. Bu düzende en pahalı hatalar kilitlenen ve sabaha kadar asılı kalan işler ile Windows sunucuda unutulan <code>__main__</code> korumasıdır. Her bekleme noktasına zaman aşımı koymak ve işi paylaşılan durum yerine "parça → özet → birleştir" biçiminde tasarlamak bu riskleri büyük ölçüde ortadan kaldırır.</div>`,
    ex: [
      { t: 'mc',
        stage: 'Isınma',
        q: 'ProcessPoolExecutor kullanan betik Linux\'ta çalışıyor ama Windows\'ta "bootstrapping phase" <code>RuntimeError</code>\'ı veriyor. En olası sebep?',
        o: ['Windows\'ta süreç havuzu hiç desteklenmez, thread kullanmak gerekir', 'Havuzu kuran kod <code>if __name__ == "__main__":</code> altında değil', '<code>max_workers</code> değeri makinedeki çekirdek sayısından büyük', 'İşçi fonksiyonu tip ipucu içerdiği için pickle edilemiyor'],
        a: 1,
        why: 'Windows (ve macOS) çocuk süreci spawn ile başlatır ve betiği baştan içe aktarır. Koruma yoksa her çocuk yeniden havuz kurmaya çalışır; Python bunu bu hata ile durdurur.' },
      { t: 'predict',
        stage: 'Kodu oku',
        q: 'Amdahl yasasına göre ne yazdırır?',
        code: 'def hizlanma(p, n):\n    return 1 / ((1 - p) + p / n)\n\nprint(round(hizlanma(0.9, 8), 2), round(hizlanma(0.9, 1000), 2))\n',
        o: ['7.2 900.0', '4.71 9.91', '8.0 1000.0', '4.71 10.0'],
        a: 1,
        why: '%10\'luk sıralı kısım hızlanmayı sınırlar: 8 işçide 1 / (0.1 + 0.1125) ≈ 4.71, 1000 işçide ≈ 9.91; sınır 1 / 0.1 = 10\'a hiç ulaşılmaz.' },
      { t: 'predict',
        stage: 'Kodu oku',
        q: 'Aynı thread kilidi ikinci kez almaya çalışıyor. Ne yazdırır?',
        code: 'import threading\nk = threading.Lock()\nr = threading.RLock()\nk.acquire()\nr.acquire()\nprint(k.acquire(blocking=False), r.acquire(blocking=False))\n',
        o: ['True True', 'False True', 'False False', 'True False'],
        a: 1,
        why: 'Lock sahibini tanımaz: kilit tutulurken aynı thread de alamaz (blocking=True olsaydı sonsuza kadar beklerdi). RLock sahibini ve kaç kez alındığını tutar; aynı thread tekrar alabilir, aynı sayıda release gerekir.' },
      { t: 'predict',
        stage: 'Kodu oku',
        q: 'Future\'a istisna yerleştiriliyor. Ne yazdırır?',
        code: 'from concurrent.futures import Future\nf = Future()\nf.set_exception(ValueError("kötü veri"))\ntry:\n    f.result()\nexcept ValueError as e:\n    print("yakalandı:", e)\nprint(f.done(), type(f.exception()).__name__)\n',
        o: ['yakalandı: kötü veri\nTrue ValueError', 'False NoneType', 'yakalandı: kötü veri\nFalse ValueError', 'True NoneType'],
        a: 0,
        why: 'İstisnayla biten Future da "bitmiş" sayılır (done True). result() saklanan istisnayı yeniden fırlatır; exception() ise fırlatmadan döndürür. Havuzdaki işçi hataları sana bu yolla ulaşır.' },
      { t: 'order',
        stage: 'Kodu oku',
        q: '<p>Satış listesini iki parçaya bölüp her parçanın toplamını <code>map</code> ile hesaplayan ve kısmi toplamları birleştiren programın satırlarını sırala (havuz.map ile aynı arayüz).</p>',
        lines: ['satis = [10, 20, 30, 40, 50]', 'orta = len(satis) // 2', 'parcalar = [satis[:orta], satis[orta:]]', 'kismi = list(map(sum, parcalar))', 'print(kismi, sum(kismi))'],
        expect: '[30, 120] 150\n',
        hint: 'Bölme noktası parçalardan önce, kısmi toplamlar birleştirmeden önce hesaplanır.',
        why: 'Böl → kısmi özet → birleştir kalıbı: map(sum, parcalar) satırı havuz.map(sum, parcalar) ile değiştirilirse aynı program paralel çalışır.' },
      { t: 'code',
        id: 'eszamanlilik-x1',
        stage: 'Rehberli',
        diff: 2,
        q: '<p>Amdahl yasasıyla kapasite planı yap. <code>hizlanma(p, n)</code> en iyi hızlanmayı (<code>1 / ((1 - p) + p / n)</code>) döndürsün. <code>gereken_isci(p, hedef, en_fazla=256)</code> hızlanmanın <code>hedef</code>\'e ulaştığı <b>en küçük</b> işçi sayısını döndürsün; <code>en_fazla</code>\'ya kadar ulaşılamıyorsa <code>None</code>. <code>p</code> 0 ile 1 arasında değilse <code>ValueError</code> fırlat.</p>',
        guide: ['hizlanma formülünü doğrudan yaz.', 'gereken_isci başında p aralığını kontrol et.', '1\'den en_fazla\'ya kadar n dene; hizlanma(p, n) >= hedef olan ilk n\'i döndür.', 'Döngü biterse None döndür.'],
        example: 'def ilk_kare_buyuk(esik):\n    for n in range(1, 100):\n        if n * n >= esik:\n            return n\n    return None\n\nprint(ilk_kare_buyuk(50))\n',
        start: 'def hizlanma(p, n):\n    # TODO: Amdahl formülü\n    return 0\n\ndef gereken_isci(p, hedef, en_fazla=256):\n    # TODO: p aralığı kontrolü\n    # TODO: en küçük n\'i bul, yoksa None\n    return None\n',
        sol: 'def hizlanma(p, n):\n    return 1 / ((1 - p) + p / n)\n\ndef gereken_isci(p, hedef, en_fazla=256):\n    if not 0 <= p <= 1:\n        raise ValueError("p 0 ile 1 arasında olmalı")\n    for n in range(1, en_fazla + 1):\n        if hizlanma(p, n) >= hedef:\n            return n\n    return None\n',
        tests: 'assert abs(hizlanma(0.9, 8) - 4.7058823) < 1e-6, "hizlanma(0.9, 8) ≈ 4.706"\nassert hizlanma(0.5, 1) == 1.0, "Tek işçide hızlanma 1"\nassert gereken_isci(0.9, 4) == 6, f"%90 paralel işte 4x için en az 6 işçi gerekir; gelen {gereken_isci(0.9, 4)}"\nassert gereken_isci(0.9, 10) is None, "%90 paralelde 10x\'e asla ulaşılamaz (sınır 10)"\nassert gereken_isci(1.0, 16) == 16, "Tamamen paralel işte n işçi n kat"\nassert gereken_isci(0.0, 1) == 1\ntry:\n    gereken_isci(1.5, 2)\n    assert False, "p > 1 ValueError vermeli"\nexcept ValueError:\n    pass\n',
        hints: ['Formül: 1 / ((1 - p) + p / n).', 'for n in range(1, en_fazla + 1): if hizlanma(p, n) >= hedef: return n'],
        why: 'Amdahl hesabı "daha çok çekirdek" kararını sayıya döker: sıralı kısım büyükse işçi eklemek hızlanmayı neredeyse hiç artırmaz; önce sıralı kısmı küçültmek gerekir.' },
      { t: 'code',
        id: 'eszamanlilik-x2',
        stage: 'Rehberli',
        diff: 2,
        q: '<p><code>paralel_ciro(siparisler, parca_sayisi, haritala=map)</code> fonksiyonu <code>(sehir, tutar)</code> listesini <code>parca_sayisi</code> parçaya bölsün, her parçanın şehir bazında kısmi cirosunu <code>kismi_ciro</code> ile hesaplatmak için <code>haritala(kismi_ciro, parcalar)</code> çağırsın ve sonuçları birleştirip şehir adına göre sıralı <code>{sehir: ciro}</code> sözlüğü döndürsün. <code>haritala</code> parametresi sayesinde aynı fonksiyon <code>havuz.map</code> ile de çalışır.</p>',
        guide: ['parcala(veri, n) verilmiş; parçaları onunla üret.', 'kismi_ciro\'yu modül düzeyinde yaz (süreç havuzunda pickle edilebilsin): Counter ile şehir toplamı.', 'haritala(kismi_ciro, parcalar) sonuçlarını bir Counter\'da topla.', 'sorted ile sıralı sözlük döndür.'],
        example: 'from collections import Counter\nparcalar = [["a", "b"], ["a"]]\nkismi = map(Counter, parcalar)\nprint(sum(kismi, Counter()))\n',
        start: 'from collections import Counter\n\ndef parcala(veri, n):\n    boyut, artan = divmod(len(veri), n)\n    sonuc, bas = [], 0\n    for i in range(n):\n        son = bas + boyut + (1 if i < artan else 0)\n        sonuc.append(veri[bas:son])\n        bas = son\n    return sonuc\n\ndef kismi_ciro(parca):\n    c = Counter()\n    # TODO: her (sehir, tutar) için c[sehir] += tutar\n    return c\n\ndef paralel_ciro(siparisler, parca_sayisi, haritala=map):\n    parcalar = parcala(siparisler, parca_sayisi)\n    toplam = Counter()\n    # TODO: haritala ile kısmi cirolar, toplam\'a ekle\n    return dict(sorted(toplam.items()))\n',
        sol: 'from collections import Counter\n\ndef parcala(veri, n):\n    boyut, artan = divmod(len(veri), n)\n    sonuc, bas = [], 0\n    for i in range(n):\n        son = bas + boyut + (1 if i < artan else 0)\n        sonuc.append(veri[bas:son])\n        bas = son\n    return sonuc\n\ndef kismi_ciro(parca):\n    c = Counter()\n    for sehir, tutar in parca:\n        c[sehir] += tutar\n    return c\n\ndef paralel_ciro(siparisler, parca_sayisi, haritala=map):\n    parcalar = parcala(siparisler, parca_sayisi)\n    toplam = Counter()\n    for kismi in haritala(kismi_ciro, parcalar):\n        toplam.update(kismi)\n    return dict(sorted(toplam.items()))\n',
        tests: 's = [("Ankara", 120.0), ("İzmir", 80.0), ("Ankara", 45.5), ("Bursa", 300.0), ("İzmir", 19.9), ("Ankara", 10.0), ("Bursa", 5.0)]\nr = paralel_ciro(s, 3)\nassert r == {"Ankara": 175.5, "Bursa": 305.0, "İzmir": 99.9}, f"Ciro yanlış: {r}"\nassert paralel_ciro(s, 1) == r and paralel_ciro(s, 7) == r, "Parça sayısı sonucu değiştirmemeli"\ncagri = []\ndef sahte_map(f, parcalar):\n    parcalar = list(parcalar)\n    cagri.append(len(parcalar))\n    return [f(p) for p in parcalar]\nassert paralel_ciro(s, 3, haritala=sahte_map) == r, "Verilen haritala kullanılmalı"\nassert cagri == [3], "haritala bir kez, 3 parçayla çağrılmalı"\nassert paralel_ciro([], 2) == {}, "Boş liste"\n',
        hints: ['kismi_ciro içinde: for sehir, tutar in parca: c[sehir] += tutar', 'for kismi in haritala(kismi_ciro, parcalar): toplam.update(kismi) — Counter.update toplar.'],
        why: 'Kısmi özet + birleştirme kalıbında paylaşılan durum ve kilit yoktur; haritala parametresi aynı kodu sıralı test etmeyi ve üretimde havuz.map ile paralel çalıştırmayı sağlar.' },
      { t: 'code',
        id: 'eszamanlilik-x3',
        stage: 'Rehberli',
        diff: 2,
        q: '<p>Thread-güvenli <code>Stok</code> sınıfı yaz. <code>__init__(self, adet)</code>: <code>self.adet</code> ve <code>self.kilit = threading.Lock()</code>. <code>dus(self, miktar)</code>: kilit altında stok yetiyorsa düşüp yeni adedi döndürsün, yetmiyorsa <code>ValueError</code> fırlatsın; <b>hata durumunda da kilit serbest kalmalı</b>. <code>durum(self)</code>: kilit altında adedi döndürsün.</p>',
        guide: ['Kilidi with self.kilit: ile kullan; with bloğu istisnada da kilidi bırakır.', 'Kontrol ve düşme aynı kilit bloğunda olmalı (kontrol et-sonra değiştir yarışını önlemek için).', 'Yetmiyorsa raise ValueError(...).', 'durum da kilitle okusun.'],
        example: 'import threading\nk = threading.Lock()\ntry:\n    with k:\n        raise RuntimeError("bir şey oldu")\nexcept RuntimeError:\n    pass\nprint("kilit tutuluyor mu?", k.locked())\n',
        start: 'import threading\n\nclass Stok:\n    def __init__(self, adet):\n        self.adet = adet\n        self.kilit = threading.Lock()\n\n    def dus(self, miktar):\n        # TODO: with self.kilit: içinde kontrol et ve düş\n        pass\n\n    def durum(self):\n        # TODO: kilitle oku\n        pass\n',
        sol: 'import threading\n\nclass Stok:\n    def __init__(self, adet):\n        self.adet = adet\n        self.kilit = threading.Lock()\n\n    def dus(self, miktar):\n        with self.kilit:\n            if miktar > self.adet:\n                raise ValueError("yetersiz stok")\n            self.adet -= miktar\n            return self.adet\n\n    def durum(self):\n        with self.kilit:\n            return self.adet\n',
        tests: 's = Stok(10)\nassert s.dus(3) == 7, "10 - 3 = 7"\ntry:\n    s.dus(50)\n    assert False, "Yetersiz stokta ValueError"\nexcept ValueError:\n    pass\nassert not s.kilit.locked(), "Hata sonrası kilit serbest kalmalı (with kullan)"\nassert s.durum() == 7, "Başarısız düşüş stoğu değiştirmemeli"\ns.kilit.acquire()\ntry:\n    assert not s.kilit.acquire(blocking=False), "Kilit tutulurken alınamamalı"\nfinally:\n    s.kilit.release()\nassert s.dus(7) == 0, "Tam stok düşülebilmeli"\n',
        hints: ['with self.kilit: bloğu çıkışta (istisna olsa da) release eder.', 'if miktar > self.adet: raise ValueError(...); self.adet -= miktar; return self.adet'],
        why: '"Kontrol et, sonra değiştir" işlemi tek kilit bloğunda olmazsa iki thread aynı stoğu birlikte düşebilir. with ifadesi kilidin her yolda bırakılmasını garanti eder.' },
      { t: 'code',
        id: 'eszamanlilik-x4',
        stage: 'Kendin yaz',
        diff: 3,
        q: '<p>Kilitlenmeyi önleyen havale fonksiyonu yaz. <code>Hesap</code> sınıfı verilmiş (<code>no</code>, <code>bakiye</code>, <code>kilit</code>). <code>havale(kaynak, hedef, miktar)</code> iki hesabın kilidini <b>hesap numarasına göre artan sırada</b> alsın (hangi yönde havale yapılırsa yapılsın), bakiye yetmezse <code>ValueError</code> fırlatsın, yetiyorsa kaynaktan düşüp hedefe eklesin. Her durumda iki kilit de serbest kalmalı. Aynı hesaba havale <code>ValueError</code>.</p>',
        start: 'import threading\n\nclass Hesap:\n    def __init__(self, no, bakiye):\n        self.no = no\n        self.bakiye = bakiye\n        self.kilit = threading.Lock()\n\ndef havale(kaynak, hedef, miktar):\n    pass\n',
        sol: 'import threading\n\nclass Hesap:\n    def __init__(self, no, bakiye):\n        self.no = no\n        self.bakiye = bakiye\n        self.kilit = threading.Lock()\n\ndef havale(kaynak, hedef, miktar):\n    if kaynak is hedef:\n        raise ValueError("aynı hesap")\n    ilk, ikinci = sorted((kaynak, hedef), key=lambda h: h.no)\n    with ilk.kilit:\n        with ikinci.kilit:\n            if kaynak.bakiye < miktar:\n                raise ValueError("yetersiz bakiye")\n            kaynak.bakiye -= miktar\n            hedef.bakiye += miktar\n',
        tests: 'import threading\nclass KayitliKilit:\n    sira = []\n    def __init__(self, ad):\n        self.ad = ad\n        self._k = threading.Lock()\n    def acquire(self, *a, **k):\n        KayitliKilit.sira.append(self.ad)\n        return self._k.acquire(*a, **k)\n    def release(self):\n        self._k.release()\n    def locked(self):\n        return self._k.locked()\n    def __enter__(self):\n        self.acquire()\n        return self\n    def __exit__(self, *a):\n        self.release()\na, b = Hesap(7, 100), Hesap(3, 50)\na.kilit, b.kilit = KayitliKilit(7), KayitliKilit(3)\nhavale(a, b, 30)\nassert (a.bakiye, b.bakiye) == (70, 80), "7 → 3: 30 TL"\nassert KayitliKilit.sira == [3, 7], f"Kilitler numara sırasıyla alınmalı (3 sonra 7); gelen {KayitliKilit.sira}"\nKayitliKilit.sira.clear()\nhavale(b, a, 10)\nassert KayitliKilit.sira == [3, 7], f"Ters yönde de aynı sıra; gelen {KayitliKilit.sira}"\ntry:\n    havale(b, a, 1000)\n    assert False, "Yetersiz bakiye ValueError"\nexcept ValueError:\n    pass\nassert not a.kilit.locked() and not b.kilit.locked(), "Hata sonrası iki kilit de serbest olmalı"\nassert (a.bakiye, b.bakiye) == (80, 70), "Başarısız havale bakiyeleri değiştirmemeli"\ntry:\n    havale(a, a, 1)\n    assert False, "Aynı hesaba havale ValueError"\nexcept ValueError:\n    pass\n',
        hints: ['sorted((kaynak, hedef), key=lambda h: h.no) kilit sırasını belirler.', 'İç içe iki with bloğu; bakiye kontrolünü iki kilit alındıktan sonra yap.'],
        why: 'Tüm thread\'ler kilitleri aynı küresel sırada alırsa döngüsel bekleme oluşamaz; bu, kilitlenmeyi önlemenin en basit ve en yaygın yoludur.' },
      { t: 'code',
        id: 'eszamanlilik-x5',
        stage: 'Hata avı',
        kind: 'bug',
        diff: 2,
        q: '<p><b>Hatayı bul ve düzelt.</b> <code>Kasa.cek(miktar)</code> kilidi elle alıp bırakıyor. Yetersiz bakiyede hata fırlattıktan sonra sonraki tüm çağrılar sonsuza kadar bekliyor (üretimde servis kilitlendi). Kilidi her durumda bırakacak biçimde düzelt.</p>',
        start: 'import threading\n\nclass Kasa:\n    def __init__(self, bakiye):\n        self.bakiye = bakiye\n        self.kilit = threading.Lock()\n\n    def cek(self, miktar):\n        self.kilit.acquire()\n        if miktar > self.bakiye:\n            raise ValueError("yetersiz bakiye")\n        self.bakiye -= miktar\n        self.kilit.release()\n        return self.bakiye\n',
        sol: 'import threading\n\nclass Kasa:\n    def __init__(self, bakiye):\n        self.bakiye = bakiye\n        self.kilit = threading.Lock()\n\n    def cek(self, miktar):\n        with self.kilit:\n            if miktar > self.bakiye:\n                raise ValueError("yetersiz bakiye")\n            self.bakiye -= miktar\n            return self.bakiye\n',
        tests: 'k = Kasa(100)\nassert k.cek(40) == 60\ntry:\n    k.cek(500)\n    assert False, "ValueError bekleniyordu"\nexcept ValueError:\n    pass\nassert not k.kilit.locked(), "Hata sonrası kilit serbest kalmalı; with self.kilit: kullan"\nassert k.cek(10) == 50, "Sonraki çekim çalışmalı"\n',
        hints: ['raise satırı release\'e hiç ulaşmaz.', 'with self.kilit: (ya da try/finally) kilidi her çıkışta bırakır.'],
        why: 'Elle acquire/release, erken return ya da istisna yollarında kilidi açık unutur. with ifadesi bağlam yöneticisi protokolüyle release\'i garanti eder.' },
      { t: 'code',
        id: 'eszamanlilik-x6',
        stage: 'Hata avı',
        kind: 'bug',
        diff: 2,
        q: '<p><b>Hatayı bul ve düzelt.</b> <code>parcala(veri, n)</code> işi süreç havuzuna dağıtmak için listeyi <code>n</code> parçaya bölmeli; parça boyutları en fazla 1 farklı olmalı ve <b>hiçbir eleman kaybolmamalı</b>. Gece işinde bazı siparişler hiç işlenmiyor.</p>',
        start: 'def parcala(veri, n):\n    boyut = len(veri) // n\n    return [veri[i * boyut:(i + 1) * boyut] for i in range(n)]\n',
        sol: 'def parcala(veri, n):\n    boyut, artan = divmod(len(veri), n)\n    sonuc, bas = [], 0\n    for i in range(n):\n        son = bas + boyut + (1 if i < artan else 0)\n        sonuc.append(veri[bas:son])\n        bas = son\n    return sonuc\n',
        tests: 'r = parcala(list(range(10)), 3)\nassert sum(r, []) == list(range(10)), f"Hiçbir eleman kaybolmamalı ve sıra korunmalı; gelen {r}"\nassert [len(p) for p in r] == [4, 3, 3], f"Boyutlar [4, 3, 3] olmalı; gelen {[len(p) for p in r]}"\nassert parcala([1, 2], 4) == [[1], [2], [], []], "Eleman sayısından fazla parça: boş parçalar"\nassert len(parcala(list(range(7)), 7)) == 7\n',
        hints: ['len(veri) // n kalanı (len % n) yok sayar; son elemanlar hiçbir parçaya girmez.', 'divmod ile boyut ve kalan; ilk "kalan" kadar parçaya birer eleman fazla ver.'],
        why: 'Tam sayı bölmesi kalanı atar; 10 eleman 3 parçaya bölününce son eleman kaybolur. divmod ile kalanı ilk parçalara dağıtmak hem kaybı önler hem de parçaları dengeler.' },
      { t: 'code',
        id: 'eszamanlilik-x7',
        stage: 'Meydan okuma',
        diff: 3,
        q: '<p>Testlerde gerçek thread yerine kullanılacak <code>SiraliYurutucu</code> sınıfını yaz; <code>concurrent.futures</code> yürütücüleriyle aynı arayüzü taşısın: <code>submit(fn, *args, **kwargs)</code> işi hemen çalıştırıp <code>concurrent.futures.Future</code> döndürsün (sonuç <code>set_result</code>, istisna <code>set_exception</code> ile; istisna submit\'ten dışarı sızmasın); <code>map(fn, *iterables)</code> sonuçları sırayla veren bir yineleyici döndürsün (hatalı elemana gelince o istisnayı fırlatsın); <code>shutdown()</code> sonrası <code>submit</code> <code>RuntimeError</code> fırlatsın; <code>with</code> bloğu çıkışta <code>shutdown</code> çağırsın.</p>',
        start: 'from concurrent.futures import Future\n\nclass SiraliYurutucu:\n    pass\n',
        sol: 'from concurrent.futures import Future\n\nclass SiraliYurutucu:\n    def __init__(self):\n        self._kapali = False\n\n    def submit(self, fn, *args, **kwargs):\n        if self._kapali:\n            raise RuntimeError("yürütücü kapatıldı")\n        f = Future()\n        try:\n            f.set_result(fn(*args, **kwargs))\n        except Exception as e:\n            f.set_exception(e)\n        return f\n\n    def map(self, fn, *iterables):\n        gelecekler = [self.submit(fn, *a) for a in zip(*iterables)]\n        return (g.result() for g in gelecekler)\n\n    def shutdown(self, wait=True, cancel_futures=False):\n        self._kapali = True\n\n    def __enter__(self):\n        return self\n\n    def __exit__(self, *exc):\n        self.shutdown()\n        return False\n',
        tests: 'from concurrent.futures import Future\nwith SiraliYurutucu() as y:\n    f = y.submit(pow, 2, 10)\n    assert isinstance(f, Future) and f.result() == 1024, "submit Future döndürmeli"\n    g = y.submit(int, "abc")\n    assert g.done() and isinstance(g.exception(), ValueError), "İstisna Future içinde saklanmalı, dışarı sızmamalı"\n    k = y.submit(lambda a, b=0: a + b, 1, b=5)\n    assert k.result() == 6, "kwargs desteklenmeli"\n    assert list(y.map(lambda a, b: a * b, [1, 2, 3], [4, 5, 6])) == [4, 10, 18], "map birden çok iterable ile sıralı sonuç vermeli"\n    it = y.map(lambda x: 10 // x, [5, 0, 2])\n    assert next(it) == 2, "İlk sonuç 2"\n    try:\n        next(it)\n        assert False, "0\'a bölme hatası map yinelenirken fırlatılmalı"\n    except ZeroDivisionError:\n        pass\ntry:\n    y.submit(print, "x")\n    assert False, "with bloğundan sonra submit RuntimeError vermeli"\nexcept RuntimeError:\n    pass\n',
        hints: ['Future() oluştur; try içinde set_result(fn(*args, **kwargs)), except Exception as e: set_exception(e).', 'map: tüm Future\'ları önce üret, sonra (g.result() for g in gelecekler) üreteci döndür.', '__exit__ içinde shutdown; submit başında kapalılık kontrolü.'],
        why: 'Executor arayüzüne uyan sıralı bir yürütücü, paralel kodu deterministik ve thread\'siz test etmeyi sağlar; üretimde aynı fonksiyona ThreadPoolExecutor ya da ProcessPoolExecutor verilir. Future, sonuç ile istisnanın tek bir nesnede taşınmasının standart yoludur.' }
    ],
    faq: [
      { q: 'chunksize\'ı nasıl seçerim?',
        a: 'ProcessPoolExecutor.map için varsayılan 1\'dir ve her eleman ayrı ayrı pickle edilip gönderilir. Binlerce küçük işte toplam iş sayısını işçi sayısının birkaç katına bölecek bir değer (ör. 10.000 iş, 8 işçi için 100-300) iletişim maliyetini düşürür. Ölçerek karar ver; çok büyük chunksize yük dengesini bozar.' },
      { q: 'Süreçler arasında büyük bir DataFrame\'i nasıl paylaşırım?',
        a: 'Her işçiye aynı büyük nesneyi argüman olarak göndermek onu her seferinde kopyalar. Ya veriyi dosyaya (parquet) yazıp her işçinin kendi parçasını okumasını sağla, ya da ProcessPoolExecutor(initializer=..., initargs=...) ile her süreçte bir kez yükle. Çoğu durumda en iyi çözüm hâlâ vektörleştirilmiş pandas/numpy ya da polars/duckdb\'dir.' }
    ],
    mistakes: [
      { bad: 'kilit.acquire()\nisle()          # hata verirse kilit açık kalır\nkilit.release()',
        good: 'with kilit:\n    isle()',
        why: 'İstisna ya da erken return release\'i atlar ve sonraki tüm thread\'ler sonsuza kadar bekler.' },
      { bad: 'with ProcessPoolExecutor() as h:\n    h.map(lambda x: x * 2, veri)',
        good: 'def iki_kat(x):\n    return x * 2\n\nif __name__ == "__main__":\n    with ProcessPoolExecutor() as h:\n        list(h.map(iki_kat, veri))',
        why: 'lambda pickle edilemez ve spawn kullanan sistemlerde __main__ koruması zorunludur.' }
    ]
  }
);
})(window);
