from lib import emit
I = []
I.append(dict(id='m-334', roles=['ml', 'muhendis'], lv='orta', topic='pickle ile model yüklemenin riski', kind='kod-okuma', c=True,
q='Zararsız görünen bir "model" nesnesi pickle ile kaydedilip yükleniyor. Yükleme sırasında ne oluyor? Bu, joblib ile paylaşılan model dosyaları için ne anlama gelir?',
a='''
<p><b>Kısa cevap:</b> pickle bir veri biçimi değil, küçük bir <b>yürütme dilidir</b>. <code>__reduce__</code>, nesnenin "yüklenirken şu fonksiyonu şu argümanlarla çağırarak yeniden kur" diye kaydedilmesini sağlar. <code>pickle.loads</code> bu çağrıyı gerçekten yapar.</p>
<p><b>Çıktı:</b> Kaydedilen bayt dizisi <code>print</code> adını içerir. Yükleme anında mesaj ekrana basılır ve dönen "nesne" aslında <code>print</code>\'in dönüş değeri olan <code>None</code>\'dır. Saldırgan <code>print</code> yerine <code>os.system</code> koysaydı, dosyayı yükleyen makinede istediği komutu çalıştırırdı.</p>
<p><b>joblib için anlamı:</b> <code>joblib.load</code> de içeride pickle kullanır. İnternetten indirilen, e-postayla gelen ya da yazma yetkisi geniş bir paylaşımlı klasördeki <code>.pkl</code> / <code>.joblib</code> dosyası, çalıştırılabilir kod kadar tehlikelidir.</p>
<p><b>Önlemler:</b></p>
<ul><li>Yalnız kendi eğitim hattının ürettiği dosyaları yükle. Dosyanın SHA-256 özetini kaydet ve yüklemeden önce doğrula.</li>
<li>Model deposuna yazma yetkisini kısıtla.</li>
<li>Paylaşım gerekiyorsa daha güvenli biçimlere geç: scikit-learn için <code>skops.io</code> (tür denetimi yapar) ya da ONNX; derin öğrenme ağırlıkları için <code>safetensors</code>.</li>
<li>scikit-learn sürümünü dosyayla birlikte kaydet. Farklı sürümle yüklemek uyarı ve hatalı sonuç üretebilir.</li></ul>
<p><b>Sık hata:</b> "Sadece model dosyası, ne zararı olabilir?" diye düşünmek.</p>
''',
follow=['Model dosyasının bütünlüğünü dağıtım hattında nasıl doğrularsın?', 'ONNX\'e dönüştürmenin bedelleri nelerdir?', 'json ile pickle arasındaki güvenlik farkı nedir?'],
flags=['pickle\'ı güvenli bir veri biçimi saymak', 'joblib\'in pickle kullandığını bilmemek'],
tip='Kısa bir saldırı senaryosuyla anlat: "Hugging Face\'ten indirilen bir .pkl dosyası" gibi.'))

I.append(dict(id='m-335', roles=['ml', 'muhendis'], lv='orta', topic='Pipeline\'ı kaydetme ve taşınabilirlik', kind='kod-okuma', c=True,
q='İçinde FunctionTransformer olan iki Pipeline pickle ile kaydediliyor; sonra fonksiyonun modülü kaldırılıp yükleniyor. Üç satırı açıkla. Canlıya alırken ne yapmalısın?',
a='''
<p><b>Kısa cevap:</b> pickle, fonksiyonları <b>kodlarıyla değil, modül ve adlarıyla</b> kaydeder (<code>donusumler.log_donustur</code> gibi). Adı olmayan lambda kaydedilemez. Adı olan fonksiyon kaydedilir, ama yükleyen ortamda o modül bulunamazsa yükleme düşer.</p>
<p><b>Satır satır:</b></p>
<ul><li><code>lambda -&gt; PicklingError</code>: Modülde <code>&lt;lambda&gt;</code> adıyla aranabilecek bir nesne yoktur.</li>
<li><code>modül fonksiyonu -&gt; kaydedildi True</code>: Dosyaya fonksiyonun kodu değil, yalnız <code>donusumler</code> modül adı ve fonksiyon adı yazılır. <code>True</code>, bu adın bayt dizisinde geçtiğini gösterir.</li>
<li><code>yükleme -&gt; ModuleNotFoundError</code>: Sunum ortamını taklit etmek için modül kaldırıldı. pickle <code>donusumler</code> modülünü içe aktarmaya çalışır ve bulamaz.</li></ul>
<p><b>Gerçek hayattaki karşılığı:</b> Jupyter\'de tanımlanan özel bir dönüştürücü <code>__main__</code> modülüne aittir. Model dosyası FastAPI servisinde yüklenince, servisin <code>__main__</code> modülünde bu ad olmadığı için benzer bir hata (<code>AttributeError</code>) çıkar. Çözüm:</p>
<ul><li>Özel fonksiyon ve sınıfları bir pakete taşı (<code>sirket_ml/donusumler.py</code>). Hem eğitim hem sunum ortamı bu paketi aynı sürümle kursun.</li>
<li>Pipeline\'ı bütün olarak <code>joblib.dump</code> ile kaydet. Yanına scikit-learn, numpy ve paket sürümlerini, özellik listesini ve eğitim tarihini içeren bir meta veri dosyası koy.</li>
<li>CI\'da "temiz ortamda yükle ve örnek veriyle tahmin al" testi çalıştır.</li></ul>
<p><b>Sık hata:</b> cloudpickle ile lambda\'yı kaydedip sorunu çözdüğünü sanmak. Dosya, kodu tanımlayan ortama ve Python sürümüne sıkıca bağlanır.</p>
''',
follow=['Eğitimde ve sunumda farklı scikit-learn sürümleri olursa ne olur?', 'Model dosyasının yanına hangi meta verileri koyarsın?'],
flags=['Lambda kullanan Pipeline\'ın sorunsuz kaydedildiğini sanmak', 'Notebook\'ta tanımlı sınıflarla eğitilmiş modeli doğrudan canlıya taşımak'],
tip='"pickle adla kaydeder" cümlesi üç satırın hepsini açıklar; onunla başla.'))

I.append(dict(id='m-336', roles=['ml', 'bilimci'], lv='temel', topic='Broadcasting ile mesafe matrisi', kind='kod-okuma', c=True,
q='3 müşterinin 2 küme merkezine uzaklığı önce iç içe döngüyle, sonra numpy yayınlama (broadcasting) ile hesaplanıyor. Şekiller ve sonuçlar ne anlatıyor?',
a='''
<p><b>Kısa cevap:</b> <code>musteri[:, None, :]</code> (3, 1, 2), <code>merkez[None, :, :]</code> ise (1, 2, 2) şeklindedir. Çıkarma işleminde 1 olan boyutlar genişletilir ve sonuç (3, 2, 2) olur: her müşteri-merkez çifti için 2 özelliklik bir fark vektörü. Son eksende karelerin toplamı ve karekök alınınca (3, 2)\'lik mesafe matrisi elde edilir.</p>
<p><b>Çıktı:</b> İki yöntem aynı sonucu verir (<code>True</code>; float karşılaştırmasında <code>==</code> yerine <code>allclose</code> kullanılır). (4, 6) noktasının (3, 4) merkezine uzaklığı √(1 + 4) ≈ 2.24\'tür. <code>argmin(axis=1)</code> her müşterinin en yakın merkezini verir: <code>[0, 1, 0]</code>. Bu, k-means\'in atama adımıdır.</p>
<p><b>Neden önemli:</b> Döngü her çiftte Python yorumlayıcısından geçer. Vektörleştirilmiş sürüm işi C\'de yapılan tek bir işleme indirir; büyük veride genellikle onlarca, hatta yüzlerce kat daha hızlıdır.</p>
<p><b>Bedeli:</b> Ara dizi n × k × d boyutundadır. 1 milyon müşteri, 100 merkez ve 50 özellikte bu 5 milyar float64 eder; yaklaşık 40 GB bellek. Böyle durumlarda veri parçalar hâlinde işlenir ya da <code>‖a−b‖² = ‖a‖² + ‖b‖² − 2a·b</code> açılımıyla matris çarpımı kullanılır. <code>scipy.spatial.distance.cdist</code> ve scikit-learn\'deki <code>pairwise_distances</code> bunu hazır yapar.</p>
<p><b>Sık hata:</b> <code>None</code> ile eklenen eksenin yerini karıştırıp (2, 3, 2) gibi yanlış bir şekil elde etmek ya da yayınlama hatası almak.</p>
''',
follow=['Yayınlama kurallarını kendi cümlelerinle anlatır mısın?', 'Bellek sınırını aşmadan bu hesabı nasıl parçalara bölersin?'],
flags=['Vektörleştirmenin bellek maliyetini hiç düşünmemek', 'float sonuçları == ile karşılaştırmak'],
tip='Şekilleri yan yana yazıp sağdan hizala; yayınlamayı anlatmanın en net yolu budur.'))

I.append(dict(id='m-337', roles=['ml'], lv='ileri', topic='Özel scikit-learn dönüştürücüsü', kind='kod-okuma', c=True,
q='Aykırı değerleri kırpan özel bir dönüştürücü yazılmış. Çıktıdaki beş satırı açıkla. HataliKirp neden clone edilemiyor ve bu neden GridSearchCV\'yi bozar?',
a='''
<p><b>Kısa cevap:</b> scikit-learn sözleşmesine göre <code>__init__</code> yalnız parametreleri <b>aynı adla</b> saklar. Veriden öğrenilen her şey <code>fit</code> içinde, sonu alt çizgiyle biten özniteliklere yazılır (<code>sinirlar_</code>). <code>get_params</code> ve <code>clone</code> bu sözleşmeye dayanır.</p>
<p><b>Satır satır:</b></p>
<ul><li><code>[1.0, 4.0]</code>: Eğitim verisinin %0 ve %75 yüzdelikleri. 100 aykırı değer olduğu hâlde üst sınır 4\'te kalır.</li>
<li><code>[1.0, 4.0, 3.0]</code>: Yeni veride 0 alt sınıra, 50 üst sınıra kırpılır; 3 aynen kalır. Sınırlar <b>eğitimden</b> gelir.</li>
<li><code>get_params()</code>: <code>__init__</code> imzasını okuyup aynı adlı öznitelikleri döndürür.</li>
<li><code>False</code>: <code>clone</code> yalnız parametreleri kopyalar, öğrenilmiş durumu almaz. Çapraz doğrulamada her katın sıfırdan eğitilmesi bu sayede olur.</li>
<li><code>AttributeError</code>: <code>HataliKirp</code>, <code>ust</code> parametresini <code>esik</code> adıyla sakladığı için <code>get_params</code> <code>self.ust</code> özniteliğini bulamaz.</li></ul>
<p><b>Neden bozulur?</b> <code>GridSearchCV</code>, <code>cross_val_score</code> ve Pipeline <code>set_params(kirp__ust=0.9)</code> ile parametre değiştirir ve her denemede <code>clone</code> yapar. Sözleşmeyi bozan bir sınıf ya hata verir ya da daha kötüsü, ayarlanan parametreyi sessizce kullanmaz.</p>
<p><b>Diğer kurallar:</b> <code>__init__</code> içinde doğrulama ya da hesaplama yapılmaz; <code>fit</code> <code>self</code> döndürür; <code>TransformerMixin</code> <code>fit_transform</code> metodunu bedavaya verir. <code>sklearn.utils.estimator_checks.check_estimator</code> sözleşmeyi otomatik test eder.</p>
<p><b>Sık hata:</b> Sınırları <code>transform</code> içinde, gelen veriden yeniden hesaplamak. Bu, test verisinin istatistiğiyle dönüşüm yapmak demektir.</p>
''',
follow=['Bu dönüştürücüye get_feature_names_out nasıl eklenir?', 'pandas DataFrame girdisinde sütun adlarını nasıl korursun?', 'check_estimator hangi hataları yakalar?'],
flags=['__init__ içinde veri işlemek', 'Öğrenilen durumu alt çizgisiz öznitelikte tutmak', 'clone\'un öğrenilmiş durumu kopyaladığını sanmak'],
tip='"Parametre __init__\'te, öğrenilen durum fit\'te ve sonu alt çizgili" kuralını tek cümleyle söyle.'))

I.append(dict(id='m-338', roles=['ml', 'muhendis'], lv='ileri', topic='Notebook\'tan yeniden kullanılabilir eğitim koduna', kind='tasarim',
q='Bir veri bilimcinin 600 hücrelik Jupyter notebook\'unda eğitilen kredi skoru modeli canlıya alınacak. Bu kodu tekrar üretilebilir bir Python eğitim paketine nasıl dönüştürürsün?',
a='''
<p><b>Kısa cevap:</b> Ön işleme ve modeli tek bir scikit-learn Pipeline\'ında topla, ayarları kodun dışına al, eğitimi tek komutla çalışan bir betiğe dönüştür. Çıktı olarak modeli, meta verisini ve değerlendirme raporunu birlikte üret.</p>
<p><b>Yapı:</b></p>
<ul><li><code>kredi_ml/veri.py</code>: Veriyi okuma ve pydantic ya da pandera ile şema doğrulama (sütunlar, türler, aralıklar).</li>
<li><code>kredi_ml/ozellikler.py</code>: Özel dönüştürücüler, scikit-learn sözleşmesine uygun.</li>
<li><code>kredi_ml/hat.py</code>: <code>def hat_kur(cfg) -&gt; Pipeline</code>; ColumnTransformer ve model burada tanımlanır.</li>
<li><code>egit.py</code>: <code>python -m kredi_ml.egit --config configs/v3.yaml</code>. Veriyi böler, çapraz doğrular, son modeli eğitir ve kaydeder.</li>
<li><code>tests/</code>: Dönüştürücü birim testleri, küçük bir veriyle uçtan uca eğitim testi ve "kaydet, temiz ortamda yükle, tahmin al" testi.</li></ul>
<p><b>Tekrar üretilebilirlik:</b> Tüm <code>random_state</code> değerleri yapılandırmadan gelir. Bağımlılıklar sürüm kilitli bir dosyada tutulur (<code>uv.lock</code> ya da <code>requirements.txt</code>). Eğitim verisinin özeti (hash) ve git commit bilgisi meta veriye yazılır.</p>
<p><b>Çıktılar:</b> <code>model.joblib</code>, <code>meta.json</code> (sürümler, özellik listesi, metrikler, eşik) ve dilim bazlı metrik raporu. Canlı servis yalnız <code>kredi_ml</code> paketini ve bu dosyaları kullanır; notebook\'a bağımlılık kalmaz.</p>
<p><b>Notebook\'un rolü:</b> Keşif ve analiz için kalır, paketi içe aktarır. Kod notebook\'ta kopyalanmaz.</p>
<p><b>Sık hata:</b> Notebook\'u olduğu gibi <code>.py</code> dosyasına çevirip global değişkenlerle, sabit dosya yollarıyla ve gizli hücre sırasıyla canlıya almak.</p>
''',
follow=['Eğitim verisi her ay değişiyorsa sürümlemeyi nasıl yaparsın?', 'Yeni modelin eskisinden iyi olduğuna hangi kontrolle karar verirsin?', 'MLflow gibi bir araç bu yapıda nereye oturur?'],
flags=['"Notebook\'u .py olarak kaydederiz" demek', 'Rastgelelik ve sürüm kontrolünden hiç bahsetmemek', 'Ön işlemeyi Pipeline dışında bırakmak'],
tip='Klasör yapısını söylemek, soyut ilkeleri sıralamaktan çok daha ikna edicidir.'))

I.append(dict(id='m-339', roles=['bilimci', 'analist'], lv='temel', topic='groupby-transform ile grup içi pay', kind='kod-okuma', c=True,
q='Her mağazada kategorilerin cirodaki payı hesaplanıyor. transform ile agg sonuçlarının satır sayısı neden farklı? Çıktıdaki payları yorumla.',
a='''
<p><b>Kısa cevap:</b> <code>transform("sum")</code> grup toplamını hesaplar ve sonucu <b>orijinal satır sayısında</b> geri yayar: her satır kendi mağazasının toplamını alır. Bu sayede satır bazında oran hesaplanabilir. <code>sum()</code> (agg) ise grup başına tek satır döndürür.</p>
<p><b>Çıktı:</b> Konak\'ın toplamı 1.000; gıda 600 / 1.000 = 0.6, temizlik 0.3, kırtasiye 0.1. Bornova\'nın toplamı 500; gıda 0.9, temizlik 0.1. Her mağazada paylar 1\'e tamamlanır; bu, hesabı denetlemenin hızlı bir yoludur. Son satır: DataFrame 5 satır, özet 2 satır. Gruplar alfabetik sıralandığı için Bornova önce gelir.</p>
<p><b>Alternatif:</b> Özeti hesaplayıp <code>merge</code> ile geri birleştirmek de aynı sonucu verir. Ama transform daha kısadır ve satır sırasını korur. Tek satırda da yazılabilir: <code>df["ciro"] / df.groupby("magaza")["ciro"].transform("sum")</code>.</p>
<p><b>Yaygın kullanımlar:</b> Grup içi pay, grup ortalamasından sapma (<code>x - transform("mean")</code>), grup içi z-skor ve grup ortalamasıyla eksik değer doldurma.</p>
<p><b>Sık hata:</b> <code>df["toplam"] = df.groupby("magaza")["ciro"].sum()</code> yazmak. İndeksler (mağaza adları ile 0..4) eşleşmediği için sütun NaN ile dolar.</p>
''',
follow=['Grup ortalamasıyla eksik değer doldurmayı nasıl yazarsın?', 'transform ile apply arasındaki performans farkı nedir?'],
flags=['transform ile agg\'nin aynı şekli döndürdüğünü sanmak', 'Payların 1\'e tamamlandığını kontrol etmeyi düşünmemek'],
tip='"transform şekli korur, agg küçültür" cümlesini söyleyip satır sayılarıyla göster.'))

I.append(dict(id='m-340', roles=['bilimci', 'analist'], lv='orta', topic='resample: hafta etiketi ve kapanış', kind='kod-okuma', c=True,
q='4 Mart 2024 Pazartesi\'den başlayan 10 günlük satış haftalık özetleniyor. resample("W") neden 10.03 ve 17.03 etiketlerini veriyor? İkinci satır neyi değiştiriyor? Count sütunu neden önemli?',
a='''
<p><b>Kısa cevap:</b> pandas\'ta <code>"W"</code>, <code>"W-SUN"</code> demektir: haftalar <b>Pazar günü biter</b> ve etiket olarak haftanın <b>son günü</b> kullanılır. 4–10 Mart haftası "10.03" etiketini alır (1+…+7 = 28). 11–13 Mart ise "17.03" etiketli kovaya düşer (8+9+10 = 27); veri 13\'ünde bittiği hâlde etiket ileri bir tarihi gösterir.</p>
<p><b>İkinci satır:</b> <code>"W-MON"</code>, <code>label="left"</code> ve <code>closed="left"</code> ile haftalar Pazartesi başlar ve başlangıç gününe göre etiketlenir: <code>04.03</code> ve <code>11.03</code>. Türkiye\'deki iş raporlarının çoğu bu "hafta başı" anlayışını kullanır. Toplamlar aynıdır, değişen yalnız sınırlar ve etiketlerdir.</p>
<p><b>Count sütunu:</b> İkinci haftada yalnız <b>3</b> gün var. Toplam 27 tam bir haftayla karşılaştırılırsa "satışlar düştü" diye yanlış yorumlanır. Eksik haftalar raporda işaretlenir ya da atılır, gerekirse günlük ortalama karşılaştırılır.</p>
<p><b>Ek dikkatler:</b></p>
<ul><li>Aylık özette pandas 2.2 ve sonrasında ay sonu için <code>"ME"</code>, ay başı için <code>"MS"</code> kullanılır.</li>
<li>Saat dilimi farklı bir zaman damgası (UTC) gece yarısı sınırını kaydırabilir; önce <code>tz_convert("Europe/Istanbul")</code>.</li>
<li>Satış olmayan günler tabloda hiç yoksa <code>sum</code> yine doğru çalışır, ama <code>mean</code> yanıltır; önce <code>asfreq("D", fill_value=0)</code>.</li></ul>
<p><b>Sık hata:</b> Etiketi haftanın başı sanıp grafikte veriyi bir hafta kaydırmak.</p>
''',
follow=['ISO hafta numarasıyla gruplama nasıl yapılır?', 'Saatlik veriyi iş günü bazında nasıl özetlersin?'],
flags=['"W" etiketinin haftanın başı olduğunu varsaymak', 'Eksik kalan son haftayı tam haftayla karşılaştırmak'],
tip='Etiket ve kapanış davranışını bir kez elle doğrulamayı alışkanlık olarak anlat; mülakatçılar bu titizliği sever.'))

I.append(dict(id='m-341', roles=['bilimci'], lv='orta', topic='numpy ile vektörleştirilmiş bootstrap', kind='kod-okuma', c=True,
q='Eski ve yeni sayfadaki sepet tutarlarının medyan farkı için döngüsüz bir bootstrap yazılmış. Kodun nasıl çalıştığını ve üç sayının ne anlattığını açıkla.',
a='''
<p><b>Kısa cevap:</b> Döngü yerine <code>rng.integers(0, n, size=(B, n))</code> ile B × n\'lik bir indeks matrisi üretilir. Her satır, yerine koyarak çekilmiş bir bootstrap örneğidir. <code>a[ia]</code> (10000, 10) şeklinde örnekleri verir, <code>np.median(..., axis=1)</code> her satırın medyanını tek seferde hesaplar. Sonuç (10000,) boyutunda bir fark dağılımıdır.</p>
<p><b>Sayılar:</b> Gözlenen medyan farkı 137.5 − 115 = <b>22.5</b> TL. Ama %95 yüzdelik güven aralığı <b>[−75.0, 60.0]</b>; sıfırı rahatça içine alıyor. Bootstrap örneklerinin %18\'inde fark sıfır ya da negatif. 10 ve 12 gözlemle bu fark gürültüden ayırt edilemez.</p>
<p><b>Neden medyan ve neden bootstrap?</b> Sepet tutarları çarpıktır (300 ve 400 gibi uç değerler). Medyanın standart hatası için basit bir formül yoktur; bootstrap formül istemeden dağılımı verir.</p>
<p><b>Dikkat:</b></p>
<ul><li>Aralık bu kadar genişken "yeni sayfa 22.5 TL artırdı" demek yanlıştır; daha fazla veri gerekir.</li>
<li>Bellek B × n ile büyür. Büyük n\'de bootstrap parçalar hâlinde yapılır.</li>
<li>Küçük örneklemde yüzdelik yöntemi kaba kalabilir; <code>scipy.stats.bootstrap</code> BCa aralığı sunar.</li>
<li>Tohum (<code>default_rng(2024)</code>) analizi tekrarlanabilir kılar.</li></ul>
<p><b>Sık hata:</b> Bootstrap\'i <code>for</code> döngüsünde <code>rng.choice</code> ile 10.000 kez çağırmak. Doğru sonuç verir ama gereksiz yavaştır.</p>
''',
follow=['Bu aralığı daraltmak için kaç gözlem gerektiğini nasıl tahmin edersin?', 'Permütasyon testiyle bootstrap arasındaki fark nedir?'],
flags=['Gözlenen farkı güven aralığına bakmadan sonuç olarak sunmak', 'İndeks matrisinin şeklini açıklayamamak'],
tip='Önce şekilleri (B, n) söyle, sonra istatistiksel yoruma geç; iki beceriyi de göstermiş olursun.'))

I.append(dict(id='m-342', roles=['bilimci', 'analist'], lv='temel', topic='İki oran testini Python\'da hesaplama', kind='kod-okuma', c=True,
q='Bir A/B testinde kontrol grubunda 10.000 kullanıcıdan 400\'ü, yeni tasarımda 10.000\'den 460\'ı satın aldı. Kod iki oran z-testini yalnız math modülüyle hesaplıyor. Çıktıyı yorumla.',
a='''
<p><b>Kısa cevap:</b> Dönüşüm %4,0\'dan %4,6\'ya çıkmış: mutlak fark 0,6 puan, göreli artış %15. z = 2,09 ve iki yönlü p ≈ 0,037. %95 güven aralığı [0,04, 1,16] puan. Aralık sıfırı içermiyor, yani fark %5 düzeyinde anlamlı. Ama alt sınır sıfıra çok yakın, etkinin büyüklüğü belirsiz.</p>
<p><b>Kodun ayrıntıları:</b></p>
<ul><li><b>Test istatistiği:</b> "Oranlar eşit" sıfır hipotezi altında hesaplandığı için iki grubun <b>birleşik oranı</b> (%4,3) kullanılır.</li>
<li><b>Güven aralığı:</b> Sıfır hipotezi varsayılmadan her grubun kendi oranıyla hesaplanır. İkisinin farklı olması hata değil, bilinçli bir seçimdir.</li>
<li><code>math.erfc(|z| / √2)</code> standart normal dağılımın iki kuyruk olasılığını verir; scipy\'siz hesaplamanın yoludur. Aynı sonuç <code>statsmodels</code> paketindeki <code>proportions_ztest</code> ile de alınır.</li></ul>
<p><b>İş yorumu:</b> Örneklem büyüklüğü testten önce belirlendiyse ve test o süre boyunca izlenip erken durdurulmadıysa, sonuç yeni tasarım lehinedir. Ama "%15 artış" yerine aralıkla birlikte raporlanmalı: göreli artış yaklaşık %1 ile %29 arasında olabilir.</p>
<p><b>Sık hata:</b> Kullanıcı yerine oturum ya da sayfa görüntüleme sayıp gözlemleri bağımsız saymak. Aynı kullanıcının birden çok oturumu varyansı olduğundan küçük gösterir.</p>
''',
follow=['Testi her gün kontrol edip p değeri 0,05\'in altına inince durdurmak neden sorunludur?', 'Bu testi önceden kaç kullanıcıyla planlamak gerekirdi?'],
flags=['p-değerini "yeni tasarımın daha iyi olma olasılığı" diye yorumlamak', 'Güven aralığını hiç raporlamamak'],
tip='Sonucu bir cümlede hem istatistik hem iş diliyle söyle: "Anlamlı, ama etkinin büyüklüğü belirsiz."'))

I.append(dict(id='m-343', roles=['bilimci', 'ml'], lv='ileri', topic='CUPED ile varyans azaltma', kind='kod-okuma', c=True,
q='Simüle bir deneyde gerçek etki +5 TL. Deney öncesi harcama kullanılarak CUPED ayarlaması yapılıyor. Ham ve ayarlı sonuçları karşılaştır; son satırdaki iki sayı ne anlatıyor?',
a='''
<p><b>Kısa cevap:</b> CUPED, deney sonucundan, deneyden <b>önce</b> ölçülmüş ve sonuçla ilişkili bir değişkenin açıkladığı kısmı çıkarır: <code>y − θ(x − x̄)</code>. Etki tahmini yansız kalır, gürültü azalır ve standart hata küçülür.</p>
<p><b>Çıktı:</b> Ham analizde fark 2,1 TL, standart hata 1,97. Gerçek etki 5 olduğu hâlde tahmin gürültüye gömülü; yaklaşık %95 aralık [−1,8, 6,0] sıfırı içerir. CUPED ile tahmin 4,7 TL, standart hata 0,94 olur ve aralık [2,9, 6,5] sıfırı dışarıda bırakır.</p>
<p><b>Son satır:</b> θ = 0,79; simülasyondaki gerçek katsayı 0,8\'e çok yakın. Ayarlı varyansın ham varyansa oranı 0,23, yani varyans yaklaşık %77 azaldı. Bu oran yaklaşık 1 − ρ² değerine eşittir (ρ önceki ve sonraki harcama arasındaki korelasyon). Aynı güç için gereken örneklem büyüklüğü de yaklaşık bu oranda küçülür.</p>
<p><b>Koşullar:</b></p>
<ul><li>Ortak değişken (covariate) deneyden <b>etkilenmemiş</b> olmalı. Deney öncesi dönemden alınır; deney sırasında ölçülen bir değişken etkiyi de çıkarır.</li>
<li>θ iki grup birlikte kullanılarak hesaplanır. Bu işlem, ortak değişkenli doğrusal regresyona (<code>y ~ grup + x</code>) eşdeğerdir.</li>
<li>Yeni kullanıcıların geçmişi yoktur. Onlar için eksik değer 0 ile doldurulup bir "geçmiş var mı" göstergesi eklenir.</li></ul>
<p><b>Sık hata:</b> CUPED\'in etkiyi büyüttüğünü sanmak. Burada tahmin 2,1\'den 4,7\'ye gerçeğe yaklaştı, çünkü ham tahmin şansa bağlı olarak düşüktü. Yöntem ortalamayı değil <b>belirsizliği</b> değiştirir.</p>
''',
follow=['Deney öncesi veri yoksa varyansı azaltmak için ne yaparsın?', 'CUPED\'i statsmodels ile regresyon olarak nasıl yazarsın?', 'Oran metriklerinde (ör. dönüşüm) CUPED uygulanabilir mi?'],
flags=['Deney sırasında ölçülen bir değişkeni ortak değişken olarak kullanmak', 'CUPED\'in etki büyüklüğünü artırdığını söylemek'],
tip='1 − ρ² ilişkisini söylemek, yöntemi ezberden değil anlayarak bildiğini gösterir.'))

I.append(dict(id='m-344', roles=['bilimci', 'ml'], lv='orta', topic='Gecikmeli özellik: shift ve rolling', kind='kod-okuma', c=True,
q='Günlük talep tahmini için "son 3 günün ortalaması" özelliği iki şekilde hesaplanıyor. Hangi sütun sızıntılı, neden? 3 Mayıs satırını iki sütunda karşılaştır.',
a='''
<p><b>Kısa cevap:</b> <code>rolling(3).mean()</code> pencereye <b>o günün kendi değerini</b> de katar. 3 Mayıs\'ın talebini tahmin ederken 3 Mayıs\'ın talebini (30) kullanmak, geleceği bilmek demektir. <code>shift(1)</code> önce seriyi bir gün kaydırır; böylece pencere yalnız geçmiş günleri içerir.</p>
<p><b>3 Mayıs:</b> Sızıntılı sütun (10 + 12 + 30) / 3 = <b>17.3</b>. Ani sıçramayı "önceden biliyor" gibi görünür. Doğru sütun (10 + 12) / 2 = <b>11.0</b>. O sabah gerçekten bilinebilecek tek bilgi budur. Model sızıntılı özellikle eğitilirse testte parlak, canlıda zayıf sonuç verir.</p>
<p><b>Diğer ayrıntılar:</b></p>
<ul><li><code>min_periods=1</code> ilk günlerde eksik pencereyle ortalama alır. Doğru sütunda 1 Mayıs NaN kalır, çünkü öncesinde hiç veri yoktur. Model bunu ele alabilmeli ya da bu satırlar atılmalıdır.</li>
<li>Birden çok mağaza varsa işlem grup bazında yapılır: <code>df.groupby("magaza")["talep"].transform(lambda s: s.shift(1).rolling(3, min_periods=1).mean())</code>. Grupsuz <code>shift</code>, bir mağazanın son gününü sonraki mağazanın ilk gününe taşır.</li>
<li>Tahmin ufku 7 günse <code>shift(7)</code> gerekir. Canlıda o an hangi verinin elinde olacağı sorulur.</li></ul>
<p><b>Sık hata:</b> Özellik koduna ve satır sırasına bakmadan "zaman serisi bölmesi yaptım, sızıntı yok" demek. Sızıntı bölmede değil, özellik hesabında da olabilir.</p>
''',
follow=['Veri tarihe göre sıralı değilse bu kod ne yapar?', 'Tatil günleri gibi eksik tarihler pencereyi nasıl etkiler?', 'Bu özellikleri canlıda nasıl hesaplarsın?'],
flags=['rolling\'in yalnız geçmişe baktığını sanmak', 'Grup bazında shift yapmayı unutmak'],
tip='"Tahmin anında bu bilgi elimde olur muydu?" sorusunu her özellik için sorduğunu söyle.'))

I.append(dict(id='m-345', roles=['bilimci', 'analist'], lv='ileri', topic='Vaka: yavaş pandas analizi', kind='vaka',
q='Bir lojistik firmasında 12 milyon satırlık gönderi verisi üzerindeki günlük analiz notebook\'u 40 dakika sürüyor ve zaman zaman bellek hatasıyla çöküyor. Kodda iterrows, apply ve CSV okuma var. Nasıl hızlandırırsın?',
a='''
<p><b>Kısa cevap:</b> Önce ölç, sonra en pahalı adımı düzelt. Tipik kazanç sırası: Python döngülerini vektörleştirmek, veri türlerini küçültmek, CSV yerine Parquet kullanmak ve gereksiz kopyaları kaldırmak.</p>
<p><b>1. Ölç:</b> Hücrelerde <code>%%time</code>, fonksiyon düzeyinde <code>cProfile</code> ya da <code>line_profiler</code>, bellek için <code>df.memory_usage(deep=True)</code>. Çoğu zaman sürenin %80\'i bir ya da iki satırdadır.</p>
<p><b>2. Döngüleri kaldır:</b> <code>iterrows</code> her satır için bir Series oluşturur ve en yavaş yöntemdir. Satır bazlı koşullar <code>np.where</code> ya da <code>np.select</code> ile, grup hesapları <code>groupby().agg/transform</code> ile, metin işlemleri <code>.str</code> metotlarıyla, tarih işlemleri <code>.dt</code> ile yapılır. Arama tablosu gerektiren <code>apply</code>, <code>map</code> ya da <code>merge</code> ile değiştirilir.</p>
<p><b>3. Türler:</b> Şehir ve durum gibi az sayıda farklı değeri olan metin sütunları <code>category</code> türüne çevrilir; bellek çoğu zaman 5–10 kat azalır. Tamsayılar <code>pd.to_numeric(downcast="integer")</code> ile küçültülür. Tarihler okurken ayrıştırılır.</p>
<p><b>4. Okuma:</b> CSV her seferinde metinden ayrıştırılır. Bir kez Parquet\'e çevirip <code>columns=[...]</code> ile yalnız gerekli sütunları okumak hem hızı hem belleği iyileştirir. Gerekirse veri tarih bazında bölümlenir.</p>
<p><b>5. Hâlâ yetmiyorsa:</b> Ara sonuçları önbelleğe al. Ağır toplamaları DuckDB ile doğrudan Parquet üzerinde SQL olarak çalıştır ya da Polars\'ı dene. Bunlar tek makinede çok çekirdekli ve bellek dostu çalışır.</p>
<p><b>Sık hata:</b> Ölçmeden "Spark\'a geçelim" demek. 12 milyon satır tek makinede rahatça işlenebilecek bir boyuttur.</p>
''',
follow=['category türünün ters teptiği bir durum söyleyebilir misin?', 'DuckDB ile pandas\'ı aynı analizde nasıl birlikte kullanırsın?', 'Optimizasyon sonrası sonuçların değişmediğini nasıl doğrularsın?'],
flags=['Profil çıkarmadan çözüm önermek', 'apply\'ın vektörleştirilmiş işlem olduğunu sanmak', 'Tek makinede işlenebilecek veri için dağıtık sisteme atlamak'],
tip='Sonuçların optimizasyondan önce ve sonra aynı olduğunu bir testle doğruladığını söyle; hız kadar doğruluğu da önemsediğini gösterir.'))
emit('mulakat_m3_04.js', I)
