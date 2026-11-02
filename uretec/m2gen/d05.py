from d01 import I

ITEMS = [
I(['ml', 'bilimci'], 'temel', 'kavram', 'scikit-learn Pipeline',
  'scikit-learn\'de <code>Pipeline</code> ve <code>ColumnTransformer</code> neden kullanılır? Kullanmazsan ne gibi sorunlar çıkar?',
  '<p><b>Pipeline</b>, ön işleme adımlarını (eksik doldurma, ölçekleme, kodlama) ve modeli tek bir nesnede sıralı olarak birleştirir. <b>ColumnTransformer</b> ise farklı sütun türlerine farklı dönüşümler uygular: sayısallara medyan doldurma + ölçekleme, kategoriklere one-hot.</p>'
  '<p><b>Faydaları:</b></p><ul>'
  '<li><b>Sızıntıyı önler:</b> Çapraz doğrulamada <code>cross_val_score(pipeline, X, y)</code> her katmanda dönüşümleri yalnız eğitim kısmına uydurur. Elle yapılan ön işlem çoğu zaman tüm veriye uygulanır.</li>'
  '<li><b>Eğitim-sunum tutarlılığı:</b> Canlıya tek bir nesne gider; aynı dönüşüm kodu hem eğitimde hem tahminde çalışır. "Canlıda ölçeklemeyi unuttuk" hatası olmaz.</li>'
  '<li><b>Hiperparametre arama:</b> <code>GridSearchCV</code> ön işlem parametrelerini de (ör. <code>onislem__sayisal__imputer__strategy</code>) modelinkilerle birlikte arayabilir.</li>'
  '<li><b>Okunabilirlik ve tekrar üretilebilirlik:</b> Tüm akış tek yerde tanımlıdır.</li></ul>'
  '<p><b>Kullanmazsan:</b> Ölçekleyiciyi tüm veriye <code>fit</code> etmek, canlıda farklı sütun sırasıyla tahmin yapmak, eğitimde görülmemiş kategoriyle karşılaşınca çökmek (<code>OneHotEncoder(handle_unknown=\'ignore\')</code> bunu çözer) gibi hatalar yaygındır.</p>'
  '<p>Kaydederken pipeline bütün olarak <code>joblib.dump</code> ile kaydedilir; scikit-learn sürümü de not edilir, çünkü farklı sürümde yüklemek sorun çıkarabilir.</p>',
  ['Kendi dönüştürücünü (transformer) nasıl yazarsın?', 'Pipeline içindeki bir adımın çıktısını nasıl incelersin?'],
  ['Pipeline\'ı yalnız "kodu kısaltan" bir araç olarak görmek', 'Ön işlemi tüm veriye uygulayıp sonra çapraz doğrulama yapmak'],
  'Sızıntı ve eğitim-sunum tutarlılığı, Pipeline\'ın iki asıl gerekçesidir; ikisini de mutlaka söyle.'),

I(['ml', 'bilimci'], 'temel', 'kavram', 'Doğrulama stratejisi',
  'Eğitim, doğrulama ve test setlerinin rolleri nedir? k-katlı çapraz doğrulama ne zaman tercih edilir?',
  '<p><b>Eğitim seti:</b> Model parametrelerini öğrenir. <b>Doğrulama seti:</b> Model ve hiperparametre seçimi, eşik ayarı gibi kararlar için kullanılır. <b>Test seti:</b> Tüm kararlar verildikten sonra <b>bir kez</b> kullanılır; modelin görmediği veride beklenen performansın yansız tahminidir. Test setine bakıp modeli değiştirirsen o artık test seti değildir.</p>'
  '<p><b>k-katlı çapraz doğrulama:</b> Eğitim verisi k parçaya bölünür; her seferinde bir parça doğrulama, kalanlar eğitim olur; k skorun ortalaması ve standart sapması raporlanır.</p>'
  '<ul><li><b>Ne zaman:</b> Veri küçük ya da orta boyutluysa; tek bir doğrulama bölmesi şansa çok bağlı kalır. Skorun değişkenliğini de görürsün: 0,82 ± 0,01 ile 0,82 ± 0,08 çok farklı güven düzeyleridir.</li>'
  '<li><b>Ne zaman gerekmez:</b> Milyonlarca satırda tek bir büyük doğrulama seti yeterince kararlıdır ve k kat eğitim pahalıdır.</li></ul>'
  '<p><b>Dikkat:</b> Sınıflandırmada sınıf oranlarını korumak için <code>StratifiedKFold</code>. Aynı müşterinin birden çok satırı varsa <code>GroupKFold</code>. Zamana bağlı veride ise rastgele katlar yerine zamana göre bölme gerekir. Tipik oranlar 70/15/15 ya da 80/20 + çapraz doğrulamadır; ama oran yerine "test seti, gerçek kullanım koşulunu temsil ediyor mu?" sorusu daha önemlidir.</p>',
  ['Hiperparametre ayarı ve performans tahmini aynı CV ile yapılırsa ne olur?', 'Leave-one-out ne zaman mantıklıdır?'],
  ['Test setini model seçimi için tekrar tekrar kullanmak', 'Zaman serisinde rastgele k-katlı bölme önermek'],
  'Test setini "kasada saklanan, bir kez açılan zarf" benzetmesiyle anlat; akılda kalır.'),

I(['ml', 'bilimci'], 'orta', 'kavram', 'Zaman ve grup bazlı doğrulama',
  'Zaman serisi ve aynı varlığa ait çok sayıda satır içeren verilerde çapraz doğrulama nasıl yapılmalı?',
  '<p><b>Zaman serisi:</b> Gerçek hayatta model geçmişle eğitilip geleceği tahmin eder. Rastgele katlarda gelecek günler eğitime girer ve model "geleceği görür". Doğrusu <b>ileriye kayan doğrulama</b> (walk-forward): Ocak–Haziran ile eğit, Temmuz\'u doğrula; Ocak–Temmuz ile eğit, Ağustos\'u doğrula... scikit-learn\'de <code>TimeSeriesSplit</code>.</p>'
  '<p>Ek ayrıntılar: Hedef gelecekteki bir pencereyse (ör. "sonraki 7 günde satın alır mı"), eğitim ile doğrulama arasına pencere uzunluğu kadar <b>boşluk</b> (gap) bırakılır; yoksa etiketler örtüşür. Eğitim penceresi genişleyen mi kayan mı olacak, veride kalıcı değişiklik olup olmadığına göre seçilir.</p>'
  '<p><b>Gruplu veri:</b> Anadolu Bank\'ta bir müşterinin 24 aylık kaydı varsa, rastgele bölmede aynı müşteri hem eğitimde hem doğrulamada yer alır; model kişiye özgü örüntüleri ezberler ve skor şişer. Canlıda ise çoğunlukla <b>yeni</b> müşteriler için tahmin yapılacaksa <code>GroupKFold(groups=musteri_id)</code> kullanılır.</p>'
  '<p><b>Genel ilke:</b> Doğrulama bölmesi, modelin canlıda karşılaşacağı durumu taklit etmelidir. "Canlıda kimin için, hangi tarihte tahmin yapacağım?" sorusunun cevabı bölme stratejisini belirler.</p>',
  ['Hem zaman hem grup yapısı varsa ne yaparsın?', 'Gap (boşluk) uzunluğunu nasıl seçersin?'],
  ['Zamana bağlı veride KFold(shuffle=True) kullanmak', 'Aynı müşterinin satırlarının iki tarafa düşmesini sorun görmemek'],
  'Cevabın merkezine "doğrulama canlıyı taklit etmeli" ilkesini koy; teknik ayrıntılar ondan türer.'),

I(['ml', 'bilimci'], 'orta', 'kod-okuma', 'Grup sızıntısı',
  '20 müşterinin 5\'er siparişi rastgele ve müşteri bazlı olarak bölünüyor. İki satırdaki sayılar ne anlatıyor?',
  '<p><b>İlk satır (rastgele bölme):</b> Test setindeki 20 sipariş <b>14</b> farklı müşteriye ait ve bu <b>14</b> müşterinin hepsinin başka siparişleri eğitim setinde de var. Yani test setindeki her müşteriyi model daha önce görmüş. Müşteriye özgü alışkanlıkları (her zaman aynı ürün, aynı saat) ezberleyen model testte parlak görünür.</p>'
  '<p><b>İkinci satır (müşteri bazlı bölme):</b> 4 müşteri tamamen teste ayrılır: 80 eğitim, 20 test satırı ve ortak müşteri sayısı <b>0</b>. Bu, modelin <b>hiç görmediği</b> müşterilere ne kadar genelleyebildiğini ölçer.</p>'
  '<p><b>Hangisi doğru?</b> Canlı kullanım senaryosuna bağlıdır. Model çoğunlukla yeni müşteriler için tahmin yapacaksa (ör. ilk siparişte dolandırıcılık skoru) müşteri bazlı bölme şarttır. Mevcut müşterilerin gelecekteki siparişleri tahmin edilecekse, doğru bölme <b>zamana göre</b> olur: geçmiş siparişlerle eğitip sonraki siparişlerle test.</p>'
  '<p>scikit-learn\'de aynı iş <code>GroupShuffleSplit</code> ya da <code>GroupKFold</code> ile yapılır. <code>default_rng(0)</code> tohumu sonucu tekrarlanabilir kılar.</p>',
  ['GroupKFold ile StratifiedGroupKFold farkı nedir?', 'Bölme yöntemine göre skor farkı büyükse ne sonuç çıkarırsın?'],
  ['Rastgele bölmenin her durumda yansız olduğunu düşünmek', 'Ortak müşteri sayısının neden önemli olduğunu açıklayamamak'],
  'Sayıları okuduktan sonra mutlaka "canlıda hangi senaryo?" sorusuna bağla; doğru cevap senaryoya göre değişir.',
  code='''
import numpy as np
rng = np.random.default_rng(0)
musteri = np.repeat(np.arange(20), 5)
idx = rng.permutation(musteri.size)
egitim, test = idx[:80], idx[80:]
ortak = np.intersect1d(musteri[egitim], musteri[test])
print(len(np.unique(musteri[test])), len(ortak))
test_musteri = np.array([3, 7, 11, 15])
maske = np.isin(musteri, test_musteri)
print(int((~maske).sum()), int(maske.sum()), len(np.intersect1d(musteri[~maske], musteri[maske])))
'''),

I(['ml', 'bilimci'], 'orta', 'kavram', 'Veri ve kavram kayması',
  'Veri kayması (data drift) ile kavram kayması (concept drift) arasındaki fark nedir? Her birine örnek ver.',
  '<p><b>Veri kayması (covariate shift):</b> Girdi özelliklerinin dağılımı P(X) değişir, ama girdi ile hedef arasındaki ilişki aynı kalır. Örnek: Anadolu Market yeni bir şehirde açıldı; müşterilerin yaş ve sepet dağılımı farklı. Model bu bölgede eğitimde az gördüğü veriyle çalışır ve hatası artabilir.</p>'
  '<p><b>Kavram kayması:</b> Girdi ile hedef arasındaki ilişki P(y | X) değişir. Örnek: Anadolu Bank dolandırıcılık modelinde, dolandırıcılar yöntem değiştirdi; eskiden şüpheli olan desenler artık masum, yeni desenler şüpheli. Ya da pandemi döneminde gece yarısı market siparişlerinin anlamı tamamen değişti.</p>'
  '<p><b>Etiket kayması (prior shift):</b> Hedef sınıfın oranı P(y) değişir; ör. ekonomik kriz döneminde temerrüt oranının %2\'den %5\'e çıkması.</p>'
  '<p><b>Tespit farkı:</b> Veri kayması etiket beklemeden, girdi dağılımlarını eğitimle karşılaştırarak (PSI, KS testi) tespit edilebilir. Kavram kayması ise genelde ancak gerçek etiketler geldiğinde performans düşüşü olarak görülür; etiketler gecikmeli geliyorsa (kredi temerrüdü aylar sonra belli olur) bu ciddi bir kör noktadır.</p>'
  '<p><b>Müdahale:</b> Veri kaymasında yeni bölgenin verisini ekleyip yeniden eğitmek genelde yeterlidir. Kavram kaymasında eski veriye daha az ağırlık vermek, daha sık yeniden eğitim ya da özellikleri yeniden tasarlamak gerekir.</p>',
  ['Etiket gecikmesi varken kavram kaymasını nasıl erken yakalarsın?', 'Her veri kayması performansı düşürür mü?'],
  ['İki kavramı aynı şey sanmak', 'Kaymayı yalnız performans metrikleriyle izlemeye çalışmak'],
  'Her türü bir formülle (P(X), P(y|X), P(y)) ve bir Türk iş örneğiyle eşle; hem teknik hem pratik görünürsün.'),

I(['ml', 'bilimci'], 'ileri', 'kod-okuma', 'Kayma ölçümü: PSI',
  'Bir modelin skor dağılımı için Population Stability Index (PSI) hesaplanıyor. Çıktıyı ve nasıl yorumlanacağını açıkla.',
  '<p><b>Hesap:</b> Eğitim döneminde skorlar 4 kovaya eşit dağılmış (her biri %25). Canlıda oranlar %10, %20, %30, %40. PSI = Σ (gerçek − beklenen) × ln(gerçek / beklenen). Kova katkıları yaklaşık 0.137, 0.011, 0.009 ve 0.071; toplam <b>0.228</b>.</p>'
  '<p><b>Sezgi:</b> Her terim negatif olamaz: oran arttıysa hem fark hem logaritma pozitif, azaldıysa ikisi de negatif. En büyük katkı, oranı en çok değişen uç kovalardan gelir.</p>'
  '<p><b>Yaygın eşikler</b> (sektörde, özellikle kredi skorlamada kullanılan kaba kurallar):</p><ul>'
  '<li>PSI &lt; 0,1: kayda değer değişim yok.</li><li>0,1–0,25: orta düzey değişim, incele.</li><li>&gt; 0,25: belirgin değişim, büyük olasılıkla müdahale gerekir.</li></ul>'
  '<p>0.228 "incele" bölgesinin üst sınırında. Skorlar yüksek kovalara kaymış: ya müşteri kitlesi değişti ya da bir girdi özelliğinin hesaplanmasında sorun var.</p>'
  '<p><b>Pratik notlar:</b> Bir kovada oran 0 olursa logaritma tanımsızdır; küçük bir sabit (ör. 0.0001) eklenir. Kova sınırları eğitim verisinden belirlenip sabitlenir. PSI hem model skoruna hem de her özelliğe ayrı ayrı uygulanır; skorda kayma görülünce hangi özelliğin sebep olduğunu özellik bazlı PSI gösterir.</p>',
  ['PSI ile KL ıraksaması arasındaki ilişki nedir?', 'Sürekli değişkenlerde KS testi mi PSI mı?'],
  ['PSI yüksek diye modelin kesin kötüleştiğini söylemek', 'Sıfır oranlı kova sorununu bilmemek'],
  'Eşikleri "kesin kural" değil "sektör pratiği" olarak sun; bu nüans güven verir.',
  code='''
import numpy as np
beklenen = np.array([0.25, 0.25, 0.25, 0.25])
gercek = np.array([0.10, 0.20, 0.30, 0.40])
psi = np.sum((gercek - beklenen) * np.log(gercek / beklenen))
print(round(psi, 3))
'''),

I(['ml', 'muhendis'], 'orta', 'kavram', 'Model izleme',
  'Canlıdaki bir makine öğrenmesi modelinde neleri izlersin? Klasik yazılım izlemesinden farkı nedir?',
  '<p><b>Fark:</b> Klasik bir servis hata verdiğinde çöker ya da 500 döner. ML modeli ise bozulduğunda <b>sessizce yanlış</b> tahmin üretmeye devam eder. Bu yüzden servis sağlığına ek olarak veri ve tahmin kalitesi izlenir.</p>'
  '<p><b>Dört katman:</b></p><ol>'
  '<li><b>Operasyonel:</b> Gecikme (P50/P99), hata oranı, istek hacmi, kaynak kullanımı. Klasik yazılım izlemesiyle aynı.</li>'
  '<li><b>Girdi verisi:</b> Eksik değer oranı, şema değişiklikleri, kategorik değerlerde yeni sınıflar, özellik dağılımlarının eğitimle karşılaştırılması (PSI). "Yaş" alanının bir gün tümüyle 0 gelmesi gibi veri hatalarını en erken burada yakalarsın.</li>'
  '<li><b>Tahminler:</b> Skor dağılımı, pozitif tahmin oranı. Dolandırıcılık modeli birden işlemlerin %15\'ini işaretlemeye başladıysa bir şeyler yanlıştır.</li>'
  '<li><b>Performans:</b> Gerçek etiketler geldikçe AUC, MAE, precision/recall; ayrıca iş metriği (onaylanan kredi kaybı, iptal oranı). Etiket gecikmesi varsa bu katman haftalar sonra sinyal verir; o yüzden 2. ve 3. katman erken uyarıdır.</li></ol>'
  '<p><b>Uygulama:</b> Her tahmini girdi özellikleri, model sürümü ve zaman damgasıyla kaydet. Eşiklere bağlı uyarılar kur, ama uyarı yorgunluğunu önlemek için az ve anlamlı tut. Segment bazında izle; genel ortalama bir şehirdeki çöküşü gizleyebilir.</p>',
  ['Etiketler hiç gelmiyorsa performansı nasıl tahmin edersin?', 'Uyarı eşiklerini nasıl belirlersin?'],
  ['Yalnız gecikme ve hata oranı izlemek', 'Tahminleri girdileriyle birlikte loglamamak'],
  'Katmanlı bir yapı (operasyon → veri → tahmin → performans) çizmek cevabı düzenli ve kapsamlı gösterir.'),

I(['ml', 'muhendis'], 'temel', 'kavram', 'Toplu ve çevrim içi tahmin',
  'Toplu (batch) tahmin ile çevrim içi (online / gerçek zamanlı) tahmin arasındaki farklar nelerdir? Hangisini ne zaman seçersin?',
  '<p><b>Toplu tahmin:</b> Model belirli aralıklarla (ör. her gece) çalışır, tüm varlıklar için tahmin üretir ve sonuçları bir tabloya yazar. Uygulamalar sonucu tablodan okur.</p>'
  '<ul><li>Artıları: Basit altyapı, büyük hacimde verimli, gecikme sorunu yok, hata olursa yeniden çalıştırılabilir.</li>'
  '<li>Eksileri: Tahminler bayatlar; gün içinde olan bir değişikliği yansıtmaz; tahmin edilmeyecek varlıklar için de hesaplama yapılır.</li>'
  '<li>Örnek: Anadolu Bank\'ın her gece hesapladığı müşteri terk riski skorları; Pusula İK\'nın haftalık ayrılma risk listesi.</li></ul>'
  '<p><b>Çevrim içi tahmin:</b> Model bir API arkasında çalışır, istek geldiği anda o andaki verilerle tahmin üretir.</p>'
  '<ul><li>Artıları: Taze bağlam (o anki sepet, konum, saat).</li>'
  '<li>Eksileri: Düşük gecikme gerekir (ör. &lt; 100 ms), özelliklerin anlık sunulması gerekir (özellik deposu), ölçekleme, izleme ve yedek planı daha karmaşıktır.</li>'
  '<li>Örnek: Kart işlemi anında dolandırıcılık skoru; Lezzet Kurye\'de sipariş anındaki teslim süresi tahmini.</li></ul>'
  '<p><b>Seçim:</b> "Tahmin ne zaman kullanılıyor ve o ana kadar girdi ne kadar değişiyor?" Kararın saniyeler içinde verilmesi gerekmiyorsa toplu başla. Karma yaklaşım da yaygındır: ağır özellikler gece hesaplanır, hafif bağlam özellikleri istek anında eklenir.</p>',
  ['Akış (streaming) tahmini bu ikisinden nasıl ayrılır?', 'Çevrim içi tahminde model zaman aşımına uğrarsa ne yaparsın?'],
  ['Her problemi varsayılan olarak gerçek zamanlı çözmek', 'Toplu tahminin bayatlama riskini anmamak'],
  'Cevaba "en basit çözüm genellikle toplu tahmindir" cümlesini eklemek mühendislik olgunluğu gösterir.'),

I(['ml', 'muhendis'], 'orta', 'kavram', 'Özellik deposu',
  'Özellik deposu (feature store) nedir, hangi sorunları çözer? Her ekibin buna ihtiyacı var mı?',
  '<p><b>Tanım:</b> Makine öğrenmesi özelliklerinin tanımlandığı, hesaplandığı, saklandığı ve hem eğitim hem tahmin için sunulduğu merkezi sistem. Feast, Tecton ya da bulut sağlayıcılarının hizmetleri örnektir.</p>'
  '<p><b>İki depo:</b> <b>Çevrim dışı depo</b> (ambar ya da parquet dosyaları), özelliklerin tarihsel değerlerini zaman damgalarıyla saklar; eğitim verisi buradan üretilir. <b>Çevrim içi depo</b> (Redis gibi düşük gecikmeli anahtar-değer deposu) her varlığın en güncel özellik değerini milisaniyeler içinde sunar.</p>'
  '<p><b>Çözdüğü sorunlar:</b></p><ul>'
  '<li><b>Eğitim-sunum tutarsızlığı:</b> Özellik bir kez tanımlanır; aynı mantık iki depoyu besler.</li>'
  '<li><b>Zamanda doğru birleştirme (point-in-time join):</b> Eğitim verisi oluşturulurken her olay için yalnız o anda bilinen özellik değeri alınır. Elle yapıldığında en sık sızıntı kaynağıdır.</li>'
  '<li><b>Yeniden kullanım:</b> "Müşterinin son 30 gündeki sipariş sayısı" bir kez yazılır, beş farklı model kullanır.</li>'
  '<li><b>Keşif ve yönetişim:</b> Hangi özellik var, sahibi kim, ne kadar taze?</li></ul>'
  '<p><b>Her ekibe gerekli mi?</b> Hayır. Birkaç toplu tahmin modeli olan küçük bir ekip için ambarda iyi tasarlanmış, zaman damgalı özellik tabloları yeterlidir. Çok sayıda gerçek zamanlı model ve ekip olduğunda depo kendini amorti eder.</p>',
  ['Point-in-time join\'i SQL ya da pandas ile nasıl yaparsın?', 'Akış tabanlı özellikler (son 5 dakikadaki işlem sayısı) nasıl hesaplanır?'],
  ['Özellik deposunu yalnız "özelliklerin tutulduğu bir veritabanı" diye tanımlamak', 'Her projeye özellik deposunu varsayılan olarak önermek'],
  'Point-in-time doğruluğu, özellik deposu sorularının kalbidir; mutlaka anlat.'),

I(['ml', 'muhendis'], 'ileri', 'kavram', 'Eğitim-sunum farkı',
  'Training-serving skew (eğitim-sunum farkı) nedir? Nasıl tespit eder ve önlersin?',
  '<p><b>Tanım:</b> Modelin eğitimde gördüğü özellik değerleri ile canlıda tahmin anında aldığı değerlerin, aynı durum için farklı olması. Model doğru eğitilmiştir ama canlıda başka bir "dil" konuşulmaktadır.</p>'
  '<p><b>Tipik nedenler:</b></p><ul>'
  '<li><b>İki ayrı kod:</b> Eğitim özellikleri ambar SQL\'iyle, canlı özellikler uygulama ekibinin Java koduyla hesaplanıyor; biri iptalleri hariç tutuyor, öteki tutmuyor.</li>'
  '<li><b>Zaman farkı:</b> Eğitimde "son 7 günün siparişi" gün sonu verisiyle, canlıda anlık veriyle hesaplanıyor; ya da eğitim verisi sonradan düzeltilmiş kayıtları içeriyor.</li>'
  '<li><b>Birim/biçim:</b> Saniye ve dakika, UTC ve yerel saat, "İzmir" ve "izmir".</li>'
  '<li><b>Eksik değer:</b> Eğitimde NaN medyanla dolduruluyor, canlıda 0 gönderiliyor.</li>'
  '<li><b>Kütüphane sürümü:</b> Farklı scikit-learn ya da tokenizer sürümü.</li></ul>'
  '<p><b>Tespit:</b> Canlıda tahmin anındaki özellik değerlerini kaydet; aynı varlık ve zaman için eğitim hattının ürettiği değerlerle satır satır karşılaştır. Özellik dağılımlarını izle; gölge modda modelin skorlarını eğitim verisindeki skorlarla karşılaştır.</p>'
  '<p><b>Önleme:</b> Özellik mantığını tek bir yerde tanımla (ortak kütüphane, Pipeline ya da özellik deposu); eğitim verisini mümkünse canlıda kaydedilen özelliklerden üret ("log and wait"); canlıya çıkış öncesi tutarlılık testleri yaz.</p>',
  ['"Log and wait" yaklaşımının dezavantajı nedir?', 'Gölge modda neyi karşılaştırırsın?'],
  ['Sorunu yalnız veri kayması sanmak', 'Eğitim ve canlı özellik kodlarının ayrı yazılmasını normal karşılamak'],
  'Gerçekçi bir örnek (birim ya da saat dilimi farkı) vermek soyut tanımdan çok daha ikna edicidir.'),

I(['ml', 'bilimci'], 'temel', 'kod-okuma', 'Ön işlem parametreleri',
  'Eğitimde eksik değerler ortalamayla dolduruluyor. Canlı veri için hangi değer kullanılmalı? Çıktıyı yorumla.',
  '<p><b>İlk satır:</b> <code>np.nanmean</code> eksik değeri atlayarak eğitim ortalamasını hesaplar: (3 + 5 + 7) / 3 = <b>5.0</b>. Bu değer, modelin "eksik" için öğrendiği temsildir ve modelle birlikte saklanmalıdır.</p>'
  '<p><b>İkinci satır:</b> Canlıda gelen eksik değer, <b>eğitimden öğrenilen</b> 5.0 ile doldurulur; 100 olduğu gibi kalır → <code>[  5. 100.]</code>.</p>'
  '<p><b>Üçüncü satır:</b> Yanlış yaklaşım. Canlı verinin kendi ortalaması (tek dolu değer 100) kullanılsaydı eksik değer <b>100.0</b> ile doldurulurdu. Sonuç, o anda gelen veri grubuna bağlı olurdu: aynı müşteri, hangi toplu iş içinde geldiğine göre farklı skor alırdı. Tek kayıtlık çevrim içi tahminde ise ortalama hesaplanamazdı bile.</p>'
  '<p><b>Genel ilke:</b> Dönüşümlerin parametreleri (ortalama, standart sapma, kategori listesi, kova sınırları) eğitimde <code>fit</code> edilir ve sabitlenir; canlıda yalnız <code>transform</code> uygulanır. scikit-learn\'de <code>SimpleImputer</code> bu değeri <code>statistics_</code> özniteliğinde saklar ve Pipeline ile modelle birlikte kaydedilir.</p>',
  ['Eksik değerin kendisi bilgi taşıyorsa ne eklersin?', 'Eğitim ortalaması zamanla geçerliliğini yitirirse ne olur?'],
  ['Canlı verinin kendi istatistiğiyle doldurmayı doğru saymak', 'Doldurma parametresini modelle birlikte kaydetmemek'],
  '"fit eğitimde, transform her yerde" cümlesini bir kural olarak tekrar et; bu sorunun özüdür.',
  code='''
import numpy as np
egitim = np.array([3.0, np.nan, 5.0, 7.0])
canli = np.array([np.nan, 100.0])
dolgu = np.nanmean(egitim)
print(dolgu)
print(np.where(np.isnan(canli), dolgu, canli))
print(np.nanmean(canli))
'''),

I(['ml', 'muhendis'], 'orta', 'kavram', 'MLOps ve sürümleme',
  'MLOps ne demektir? Bir modelin tekrar üretilebilir olması için neleri sürümlemen gerekir?',
  '<p><b>MLOps</b>, DevOps ilkelerini (otomasyon, sürüm kontrolü, sürekli entegrasyon/dağıtım, izleme) makine öğrenmesi yaşam döngüsüne uygular: veri hazırlama → eğitim → değerlendirme → kayıt → dağıtım → izleme → yeniden eğitim.</p>'
  '<p><b>ML\'yi yazılımdan farklı kılan:</b> Davranış yalnız koddan değil, <b>veriden</b> de gelir. Aynı kod farklı veriyle farklı model üretir.</p>'
  '<p><b>Sürümlenmesi gerekenler:</b></p><ul>'
  '<li><b>Kod:</b> Git; eğitim ve özellik kodu dahil.</li>'
  '<li><b>Veri:</b> Eğitim verisinin anlık görüntüsü ya da sorgu + tarih aralığı + kaynak tabloların sürümü (DVC, lakehouse zaman yolculuğu, ya da tarihli parquet bölümleri).</li>'
  '<li><b>Ortam:</b> Kütüphane sürümleri (<code>requirements.txt</code> kilitli sürümlerle, Docker imajı).</li>'
  '<li><b>Konfigürasyon ve hiperparametreler.</b></li>'
  '<li><b>Rastgelelik:</b> Tohum değerleri.</li>'
  '<li><b>Model artefaktı ve metrikleri:</b> Model kayıt defterinde (MLflow gibi) sürüm, eğitim verisi referansı, değerlendirme sonuçları ve aşama (staging/production).</li></ul>'
  '<p><b>Test:</b> "Altı ay önce canlıda olan modeli bugün yeniden üretebilir miyim ve neden bu tahmini verdiğini açıklayabilir miyim?" Bankacılık gibi düzenlemeye tabi sektörlerde bu bir yasal gerekliliktir.</p>',
  ['Model kayıt defteri (model registry) ne işe yarar?', 'ML için CI/CD hattında hangi testler olur?'],
  ['Yalnız kodu sürümlemenin yeterli olduğunu sanmak', 'MLOps\'u belirli bir araçla (ör. yalnız MLflow) eşitlemek'],
  'Cevabı bir denetim senaryosuyla ("altı ay önceki modeli yeniden üret") bitirmek, konunun neden önemli olduğunu gösterir.'),

I(['ml', 'bilimci'], 'orta', 'vaka', 'Vaka: performans düşüşü teşhisi',
  'Lezzet Kurye\'de canlıdaki teslim süresi modelinin haftalık MAE\'si 4 dakikadan 7 dakikaya çıktı. Adım adım nasıl teşhis edersin?',
  '<p><b>1) Önce veri ve sistem hatası mı?</b> Boru hattı tamamlandı mı, özellikler boş mu geliyor, yeni bir uygulama sürümüyle bir alan değişti mi? Özellik başına eksik oranı ve dağılımlarını geçen haftayla karşılaştır. Bir özelliğin aniden sabit değer alması en sık nedendir.</p>'
  '<p><b>2) Hata nerede yoğunlaşıyor?</b> MAE\'yi şehir, saat dilimi, restoran türü, mesafe ve hava durumuna göre kır. Örneğin artış yalnız İzmir\'de ve akşam 19–21 arasında olabilir.</p>'
  '<p><b>3) Dış olayları eşle:</b> Kötü hava, yeni kurye vardiya politikası, büyük bir maç, yeni katılan zincir restoranlar, trafik düzenlemesi. Bu bir veri kayması (yeni restoran tipi) ya da kavram kayması (aynı mesafe artık daha uzun sürüyor) olabilir.</p>'
  '<p><b>4) Hata yönüne bak:</b> Model sistematik olarak <b>az mı</b> tahmin ediyor? Ortalama hata (işaretli) sıfırdan uzaklaştıysa yanlılık var demektir; genelde kavram kaymasının işaretidir.</p>'
  '<p><b>5) Müdahale:</b> Veri hatasıysa düzelt ve gerekirse etkilenen günleri işaretle. Geçici olaysa (bir haftalık yağmur) izle. Kalıcı değişimse son verilerle yeniden eğit, yeni modeli eskisiyle aynı test haftasında karşılaştır ve kademeli yayınla.</p>'
  '<p><b>6) Kalıcı iyileştirme:</b> Segment bazında MAE uyarıları ve özellik dağılımı izlemesi.</p>',
  ['Yeniden eğitim sorunu çözmezse ne yaparsın?', 'İşaretli hata ile mutlak hatayı neden birlikte izlersin?'],
  ['İlk adım olarak doğrudan yeniden eğitim yapmak', 'Hatayı segmentlere bölmeden genel ortalamaya bakmak'],
  'Teşhis sorularında "önce en ucuz ve en olası kontroller" sırasını vurgula.'),

I(['ml', 'bilimci'], 'ileri', 'vaka', 'Vaka: gecikmeli etiketler',
  'Anadolu Bank\'ın kart dolandırıcılığı modelinde gerçek etiketler (müşteri itirazı) ortalama 45 gün sonra geliyor. Modelin bozulduğunu nasıl erken anlarsın ve yeniden eğitimi nasıl kurgularsın?',
  '<p><b>Sorun:</b> Performans metriği (precision/recall) ancak 45 gün sonra hesaplanabilir; bu sürede model bozulduysa ciddi kayıp oluşur.</p>'
  '<p><b>1) Vekil (proxy) sinyaller:</b></p><ul>'
  '<li><b>Girdi kayması:</b> İşlem tutarı, ülke, işyeri kategorisi, cihaz dağılımlarında PSI.</li>'
  '<li><b>Skor dağılımı:</b> Yüksek riskli işlem oranı ani artarsa ya da düşerse alarm.</li>'
  '<li><b>Erken etiketler:</b> Operasyon ekibinin incelediği işaretli işlemlerin sonucu birkaç gün içinde belli olur; bu, precision için erken bir tahmindir. Müşteri çağrı merkezinin "kartımı ben kullanmadım" bildirimleri de recall için erken sinyaldir.</li></ul>'
  '<p><b>2) Olgunlaşmış kohortlarla değerlendirme:</b> Performansı işlem tarihine göre kohortlar hâlinde, yalnız etiketi büyük ölçüde gelmiş (ör. 60 günden eski) dönemler için raporla; yeni dönemlerin eksik etiketlerini "temiz" saymak recall\'ı yapay yükseltir.</p>'
  '<p><b>3) Yeniden eğitim:</b> Eğitim verisinin son 60 günü etiket olgunluğu nedeniyle hariç tutulur ya da olgunluk düzeltmesi yapılır. Dolandırıcılar hızlı uyum sağladığından aylık periyodik eğitim + kayma alarmıyla tetiklenen eğitim birlikte kullanılır.</p>'
  '<p><b>4) Güvenlik ağı:</b> Model yanında kural motoru; yeni bir saldırı deseni görülünce kural hemen eklenir, model sonraki eğitimde öğrenir.</p>',
  ['Olgunlaşmamış etiketleri eğitimde kullanmanın riski nedir?', 'İncelenmeyen (onaylanan) işlemlerin etiket yanlılığını nasıl ele alırsın?'],
  ['Etiket gecikmesini hiç hesaba katmadan haftalık recall raporlamak', 'Tek çözüm olarak "daha sık yeniden eğitim" önermek'],
  'Etiket gecikmesi sorularında vekil metrik + olgun kohort + kural motoru üçlüsünü kur; kapsamlı ve gerçekçi görünür.'),

I(['ml', 'muhendis'], 'ileri', 'tasarim', 'Gerçek zamanlı öneri servisi',
  'Anadolu Market mobil uygulamasında ana sayfa için gerçek zamanlı ürün önerisi servisi tasarla. Gecikme hedefi 150 ms.',
  '<p><b>1) Gereksinimler:</b> Günlük 2 milyon aktif kullanıcı, tepe noktada saniyede 3.000 istek, P99 &lt; 150 ms. Öneriler kullanıcının o oturumdaki davranışına tepki vermeli.</p>'
  '<p><b>2) İki aşamalı mimari:</b></p><ul>'
  '<li><b>Aday üretimi (retrieval):</b> 100.000 üründen birkaç yüz aday. Gece toplu işle hesaplanan "birlikte alınanlar", kullanıcının geçmiş kategorileri, popüler ürünler ve embedding tabanlı yakın komşu araması (önceden kurulmuş ANN indeksi).</li>'
  '<li><b>Sıralama (ranking):</b> Adaylar, kullanıcı + ürün + bağlam özellikleriyle bir gradient boosting modeliyle puanlanır.</li></ul>'
  '<p><b>3) Özellikler:</b> Kullanıcının ağır özellikleri (12 aylık harcama, kategori tercihleri) gece hesaplanıp çevrim içi depoya (Redis) yazılır. Oturum özellikleri (son 10 görüntülenen ürün) olay akışından saniyeler içinde güncellenir.</p>'
  '<p><b>4) İş kuralları ve yedek plan:</b> Stokta olmayan ürünleri ele, çeşitlilik sağla. Model servisi zaman aşımına uğrarsa önbelleğe alınmış kişisel ya da popüler liste dönülür; ana sayfa asla boş kalmaz.</p>'
  '<p><b>5) Ölçekleme:</b> Durumsuz model servisleri yatay ölçeklenir; popüler sonuçlar kısa süreli önbelleğe alınır.</p>'
  '<p><b>6) Değerlendirme ve izleme:</b> Çevrim dışı NDCG/recall@k; canlıda A/B testiyle tıklama, sepete ekleme ve ciro. Gecikme, yedek plana düşme oranı ve öneri çeşitliliği izlenir.</p>',
  ['Yeni kullanıcı (soğuk başlangıç) için ne gösterirsin?', 'Geri bildirim döngüsü (popüler ürünün daha popüler olması) nasıl kırılır?', 'ANN indeksini ne sıklıkla yenilersin?'],
  ['Tüm ürünleri her istekte tek bir modelle puanlamayı önermek', 'Yedek plan ve zaman aşımı davranışını düşünmemek'],
  'Sistem tasarımında önce sayıları (istek/saniye, gecikme) sor; mimari kararlar bu sayılardan türemeli.'),

I(['ml', 'bilimci'], 'orta', 'kavram', 'Hiperparametre arama',
  'Hiperparametre ayarında grid search, random search ve Bayesçi optimizasyon arasındaki farklar nelerdir? İç içe (nested) çapraz doğrulama neden gerekir?',
  '<p><b>Grid search:</b> Belirlenen değerlerin tüm kombinasyonlarını dener. Az sayıda parametrede şeffaf ve basittir; ama kombinasyon sayısı üstel büyür. 5 parametreye 5\'er değer = 3.125 eğitim.</p>'
  '<p><b>Random search:</b> Her parametre için dağılımdan rastgele örnek çeker. Aynı bütçeyle genellikle grid\'den daha iyi sonuç verir; çünkü çoğu problemde birkaç parametre önemlidir ve rastgele arama bu önemli parametrelerin daha çok farklı değerini dener.</p>'
  '<p><b>Bayesçi optimizasyon</b> (Optuna, Hyperopt): Önceki denemelerin sonuçlarından bir vekil model kurar ve sonraki denemeyi umut verici bölgeye yönlendirir. Eğitim pahalıysa (her deneme saatler sürüyorsa) en verimli yaklaşımdır; umutsuz denemeleri erken durdurma (pruning) ile birleşir.</p>'
  '<p><b>İç içe çapraz doğrulama:</b> En iyi hiperparametreyi bir CV ile seçip aynı CV skorunu performans tahmini olarak raporlarsan, skor <b>iyimser</b> olur; çünkü çok sayıda denemenin en iyisini seçtin ve doğrulama verisine uyum sağladın. Doğru yöntem: dış döngü performansı tahmin eder, iç döngü her dış katmanın eğitim kısmında hiperparametre seçer. Pratikte ayrı bir test seti tutmak da aynı amaca hizmet eder.</p>'
  '<p><b>Pratik ipucu:</b> Önce geniş aralıkta (log ölçek: öğrenme oranı 0,001–0,3) kaba arama, sonra dar aralıkta ince ayar.</p>',
  ['Erken durdurma (early stopping) hiperparametre aramasıyla nasıl birleşir?', 'Hangi parametreler log ölçekte aranmalı?'],
  ['Arama sonucunun CV skorunu yansız performans olarak raporlamak', 'Grid search\'ün her zaman en iyi sonucu bulacağını söylemek'],
  'Random search\'ün neden işe yaradığını "önemli parametrenin daha çok değerini dener" sezgisiyle açıkla.'),

I(['ml', 'muhendis'], 'ileri', 'kavram', 'Güvenli model dağıtımı',
  'Yeni bir model sürümünü canlıya güvenle çıkarmak için hangi dağıtım stratejilerini kullanırsın? Gölge, kanarya ve A/B arasındaki fark nedir?',
  '<p><b>Gölge dağıtım (shadow):</b> Yeni model canlı trafiği alır ve tahmin üretir, ama tahminleri <b>kullanıcıya gösterilmez</b>; yalnız kaydedilir. Eski modelle karşılaştırılır: tahmin dağılımları, gecikme, hata oranı. Kullanıcı riski sıfırdır; ama yeni modelin iş metriğine etkisi ölçülemez.</p>'
  '<p><b>Kanarya (canary):</b> Trafiğin küçük bir kısmı (%1–5) yeni modele yönlendirilir. Teknik metrikler ve temel iş metrikleri kötüleşmezse oran kademeli artırılır (%5 → %25 → %100). Amaç <b>risk azaltmaktır</b>, istatistiksel karşılaştırma değil.</p>'
  '<p><b>A/B testi (şampiyon/meydan okuyan):</b> Trafik rastgele ve genellikle eşit bölünür; yeterli örneklemle iş metriği üzerindeki etki istatistiksel olarak ölçülür. Amaç, yeni modelin <b>gerçekten daha iyi</b> olup olmadığına karar vermektir.</p>'
  '<p><b>Tipik sıra:</b> Gölge (teknik doğrulama, eğitim-sunum farkı kontrolü) → kanarya (güvenlik) → A/B (etki ölçümü) → tam yayın. Bandit yöntemleri, trafiği daha iyi performans gösteren modele kademeli kaydırarak deney maliyetini azaltır ama analizi zorlaştırır.</p>'
  '<p><b>Her durumda:</b> Tek tıkla geri alma (rollback), model sürümünün her tahminle birlikte loglanması ve önceden tanımlanmış başarı/geri çekilme ölçütleri.</p>',
  ['Gölge modda hangi metrikleri karşılaştırırsın?', 'Bandit yaklaşımının A/B testine göre riskleri nelerdir?'],
  ['Kanarya ile A/B testini aynı amaçlı saymak', 'Geri alma planından hiç bahsetmemek'],
  'Stratejileri amaçlarına göre ayır: gölge = teknik doğrulama, kanarya = risk azaltma, A/B = etki ölçümü.'),

I(['ml', 'muhendis'], 'temel', 'kavram', 'Tekrar üretilebilirlik',
  'Aynı eğitim kodunu iki kez çalıştırdığında farklı model skorları alıyorsun. Bunun nedenleri neler olabilir ve nasıl tekrar üretilebilir hâle getirirsin?',
  '<p><b>Olası nedenler:</b></p><ul>'
  '<li><b>Rastgelelik:</b> Veri bölme, karıştırma, ağırlık başlatma, rastgele ormanda örnekleme. Tohum verilmemiştir ya da yalnız bir kütüphaneye verilmiştir.</li>'
  '<li><b>Veri değişti:</b> Sorgu "son 90 gün" gibi göreli bir tarih kullanıyor; ya da kaynak tablo arada güncellendi. Sorgu sonucunun sırası garanti değilse (<code>ORDER BY</code> yok) bölme farklı satırları seçer.</li>'
  '<li><b>Ortam:</b> Kütüphane sürümü güncellendi; varsayılan parametreler değişmiş olabilir.</li>'
  '<li><b>Donanım ve paralellik:</b> GPU işlemleri ve çok iş parçacıklı toplamalarda kayan nokta toplamlarının sırası değişir; küçük farklar oluşur.</li></ul>'
  '<p><b>Çözümler:</b></p><ul>'
  '<li>Tüm kütüphanelere tohum ver: <code>random.seed</code>, <code>np.random.default_rng(42)</code>, modelde <code>random_state=42</code>.</li>'
  '<li>Veriyi sabit tarih aralığıyla çek, deterministik sırala ve eğitim verisinin anlık görüntüsünü sakla.</li>'
  '<li>Bağımlılıkları kilitli sürümlerle sabitle; Docker imajı kullan.</li>'
  '<li>Skoru tek bir çalıştırmayla değil, birden çok tohumla ortalama ± sapma olarak raporla; iki model arasındaki fark bu sapmadan küçükse anlamlı değildir.</li></ul>',
  ['Tohumu sabitlemek modeli "iyi tohum seçme" riskine açar mı?', 'GPU\'da tam deterministiklik neden zordur?'],
  ['Tek bir tohuma güvenip farkın şanstan kaynaklanabileceğini düşünmemek', 'Veri değişikliğini olası neden olarak görmemek'],
  'Son maddeyi (çoklu tohumla raporlama) eklemek, tekrar üretilebilirliği bilimsel titizlikle birleştirdiğini gösterir.'),

I(['ml', 'bilimci'], 'orta', 'kod-okuma', 'Aşırı öğrenme',
  'Gürültülü doğrusal veriye 1. ve 5. dereceden polinom uyduruluyor. Eğitim ve doğrulama hatalarını yorumla.',
  '<p><b>Kurgu:</b> Gerçek ilişki y = 2x + gürültü. 12 noktanın çift indeksli 6\'sı eğitim, tek indeksli 6\'sı doğrulama. Tohum sabit olduğu için sonuç tekrarlanabilir.</p>'
  '<p><b>Derece 1:</b> Eğitim hatası (MSE) 0.007, doğrulama 0.023. İkisi de düşük ve birbirine yakın; model gerçek ilişkiyi yakalamış. Aradaki fark, küçük örneklemin doğal oynaklığıdır.</p>'
  '<p><b>Derece 5:</b> 6 noktaya 6 katsayılı bir polinom her noktadan tam geçer: eğitim hatası <b>0.0</b>. Ama noktalar arasında çılgınca salınır; doğrulama hatası <b>0.504</b>, yani doğrusal modelin yaklaşık 20 katı. Bu, aşırı öğrenmenin (yüksek varyans) ders kitabı örneğidir: model gürültüyü ezberlemiştir.</p>'
  '<p><b>Dersler:</b> 1) Eğitim hatası tek başına hiçbir şey söylemez. 2) Parametre sayısı veri sayısına yaklaştıkça ezberleme riski artar. 3) Çözüm: daha basit model, düzenlileştirme (Ridge polinom katsayılarını küçültür) ya da daha fazla veri. Model karmaşıklığı doğrulama hatasına bakılarak seçilir.</p>',
  ['Aynı deneyde Ridge kullansaydık ne beklerdin?', 'Öğrenme eğrisi bu iki model için nasıl görünür?'],
  ['Eğitim hatası 0 olan modeli en iyi model saymak', 'Doğrulama hatasındaki farkı yalnız şansa bağlamak'],
  'Kod okuma sorusunda "6 nokta, 6 katsayı" gözlemini yapmak, sonucu hesaplamadan tahmin edebildiğini gösterir.',
  code='''
import numpy as np
rng = np.random.default_rng(1)
x = np.linspace(0, 1, 12)
y = 2 * x + rng.normal(0, 0.2, x.size)
egit, dog = np.arange(0, 12, 2), np.arange(1, 12, 2)
for derece in (1, 5):
    k = np.polyfit(x[egit], y[egit], derece)
    hata = lambda i: np.mean((np.polyval(k, x[i]) - y[i]) ** 2)
    print(derece, round(hata(egit), 3), round(hata(dog), 3))
'''),

I(['ml', 'bilimci'], 'orta', 'vaka', 'Vaka: açıklanabilirlik',
  'Kanat Havayolları\'nın rötar tahmin modelini operasyon ekibi kullanmak istemiyor: "Model neden bu uçuşa yüksek risk veriyor, anlamıyoruz." Ne yaparsın?',
  '<p><b>1) Asıl ihtiyacı anla:</b> Ekip modele neden güvenmiyor? Açıklama olmaması mı, geçmişte yanlış alarmlar mı, yoksa tahminin bir eyleme dönüşmemesi mi? Birkaç vardiya amiriyle görüşürüm.</p>'
  '<p><b>2) Küresel açıklama:</b> Model genel olarak neye bakıyor? Permütasyon önemi ya da SHAP özet grafiği: önceki uçuşun geç gelmesi, kalkış saati, hava durumu, havalimanı yoğunluğu. Dikkat: ağaç modellerinin varsayılan "önem" değerleri yüksek kardinaliteli özellikleri abartır; permütasyon önemi daha güvenilirdir.</p>'
  '<p><b>3) Yerel açıklama:</b> Her tahmin için en çok katkı yapan 3 neden, operasyon dilinde: "Uçak önceki seferden 35 dk geç geliyor (+), Ankara\'da kar uyarısı (+), sabah ilk dalga (−)". SHAP değerleri buna uygun biçimde özetlenir.</p>'
  '<p><b>4) Güveni ölç ve göster:</b> Geçmiş bir ayın tahminlerini gerçekleşenlerle birlikte göster; "yüksek risk" dediklerimizin yüzde kaçı gerçekten geç kaldı (kalibrasyon). Kalibre olasılık, "risk puanı 0,8"den daha anlaşılırdır.</p>'
  '<p><b>5) Eyleme bağla:</b> Tahmini, ekibin yapabileceği bir eylemle eşle: yedek ekip hazırlığı, kapı değişikliği. Pilot olarak bir havalimanında birlikte deneyip geri bildirim topla.</p>',
  ['SHAP değerlerinin sınırlamaları nelerdir?', 'Açıklanabilirlik ile doğruluk arasında ödünleşim var mı?'],
  ['Sorunu yalnız teknik bir görselleştirme eksikliği olarak görmek', 'Özellik önemini nedensel etki gibi sunmak'],
  'Açıklanabilirlik vakalarında insan tarafını (güven, eylem, dil) teknik araçlar kadar önemse.'),

I(['ml', 'muhendis'], 'ileri', 'kavram', 'Büyük veride model eğitimi',
  'Eğitim verin tek bir makinenin belleğine sığmıyor (ör. 2 milyar satır). Hangi seçenekleri değerlendirirsin?',
  '<p><b>1) Gerçekten tüm veriye ihtiyaç var mı?</b> Çoğu tablo verisi probleminde öğrenme eğrisi birkaç milyon satırda düzleşir. Akıllı örnekleme (çoğunluk sınıfından alt örnekleme + ağırlık düzeltme, son dönemden daha çok örnek) en ucuz çözümdür. Öğrenme eğrisini çizip karar ver.</p>'
  '<p><b>2) Veriyi küçült:</b> Doğru veri tipleri (float64 yerine float32, metin yerine kategori), yalnız gerekli sütunlar, parquet gibi kolon tabanlı format; bellek kullanımı çoğu zaman 3–5 kat düşer.</p>'
  '<p><b>3) Parça parça öğrenme:</b> <code>partial_fit</code> destekleyen modeller (SGDClassifier, MiniBatchKMeans) veriyi parçalar hâlinde okuyarak öğrenir. Sinir ağları zaten mini-batch\'lerle eğitilir; veri diskten akış hâlinde okunur.</p>'
  '<p><b>4) Dağıtık eğitim:</b> Spark MLlib, XGBoost/LightGBM\'in dağıtık modları, Dask. Veri paralelliği: her düğüm verinin bir kısmında gradyan ya da histogram hesaplar, sonuçlar birleştirilir. Ağ iletişimi ve küme yönetimi maliyeti vardır.</p>'
  '<p><b>5) Dikey ölçekleme:</b> Bazen en basit çözüm 512 GB belleğe sahip tek bir bulut makinesidir; birkaç saatlik kira, dağıtık sistem karmaşıklığından ucuzdur.</p>'
  '<p><b>6) Özellik hesaplamasını ambara it:</b> Toplamaları SQL\'de yapıp modelin göreceği satır sayısını azalt.</p>',
  ['Veri paralelliği ile model paralelliği arasındaki fark nedir?', 'Örnekleme yaparken olasılık kalibrasyonunu nasıl korursun?'],
  ['Doğrudan Spark kümesi kurmayı tek çözüm olarak sunmak', 'Veri tiplerini ve örneklemeyi hiç düşünmemek'],
  'Çözümleri basitten karmaşığa sırala; görüşmeci gereksiz karmaşıklıktan kaçındığını görmek ister.'),

I(['ml', 'bilimci'], 'ileri', 'kod-okuma', 'Olasılık kalibrasyonu',
  'Bir modelin tahmin ettiği olasılıklar kovalara ayrılıp gerçekleşen oranlarla karşılaştırılıyor. Tabloyu yorumla: model kalibre mi?',
  '<p><b>Ne yapılıyor:</b> <code>pd.cut</code> olasılıkları 3 kovaya ayırır; her kova için ortalama tahmin ve gerçekleşen pozitif oranı hesaplanır. <code>observed=True</code>, kategorik gruplamada yalnız gözlenen kovaların gösterilmesini sağlar.</p>'
  '<p><b>Okuma:</b></p><ul>'
  '<li><b>dusuk:</b> Model ortalama 0.15 diyor, gerçekte 0.5. Model bu bölgede riski <b>az tahmin ediyor</b>.</li>'
  '<li><b>orta:</b> Tahmin 0.38, gerçek 0.5; yine eksik.</li>'
  '<li><b>yuksek:</b> Tahmin 0.81, gerçek 1.0.</li></ul>'
  '<p>Kalibre bir modelde iki sütun birbirine yakın olur (güvenilirlik diyagramında köşegen). Burada model her kovada gerçeği <b>az</b> tahmin ediyor; ama sıralaması fena değil, çünkü kovalar arasındaki gerçek oran artıyor. Yani ayırt etme gücü (AUC) iyi olabilir ama olasılıklar güvenilmez.</p>'
  '<p><b>Neden önemli:</b> Olasılık doğrudan karar hesabına giriyorsa (beklenen kayıp = olasılık × tutar, sigorta primi) kalibrasyon şarttır. Çözüm: ayrı bir kalibrasyon setinde Platt ölçekleme ya da izotonik regresyon (<code>CalibratedClassifierCV</code>). Not: 10 gözlem kalibrasyon yargısı için çok azdır; gerçekte binlerce örnek ve 10 kova kullanılır.</p>',
  ['Brier skoru nedir?', 'Sınıf ağırlıkları kullanmak kalibrasyonu neden bozar?'],
  ['Sıralama başarısı (AUC) ile kalibrasyonu aynı şey sanmak', 'Küçük kovalardan kesin sonuç çıkarmak'],
  'Kalibrasyonu "model 0,7 dediğinde, gerçekten 10 olaydan 7\'si oluyor mu?" sorusuyla açıkla.',
  code='''
import pandas as pd
df = pd.DataFrame({
    'olasilik': [0.05, 0.1, 0.15, 0.3, 0.35, 0.4, 0.7, 0.8, 0.85, 0.9],
    'gercek':   [0, 0, 1, 1, 1, 0, 1, 1, 1, 1],
})
df['kova'] = pd.cut(df['olasilik'], bins=[0, 0.33, 0.66, 1.0], labels=['dusuk', 'orta', 'yuksek'])
tablo = df.groupby('kova', observed=True).agg(ort_tahmin=('olasilik', 'mean'), gercek_oran=('gercek', 'mean'))
print(tablo.round(2))
'''),

I(['ml', 'muhendis'], 'temel', 'vaka', 'Vaka: yeniden eğitim politikası',
  'Pedal İzmir\'in istasyon bazlı saatlik talep tahmin modeli için "ne sıklıkla yeniden eğitelim?" sorusu geldi. Nasıl karar verirsin?',
  '<p><b>1) Veriyle cevapla, tahminle değil:</b> Geçmiş veride bir simülasyon (backtest) yap: modeli Ocak verisiyle eğit, sonraki haftaların her biri için hatasını ölç. Hata kaç haftada anlamlı biçimde artıyor? Bu "model yaşlanma eğrisi" yeniden eğitim aralığını belirler.</p>'
  '<p><b>2) Değişimin kaynağını düşün:</b> Bisiklet talebi mevsime, okul takvimine ve havaya bağlıdır. Mevsim geçişlerinde (Haziran\'da sahil talebinin patlaması) model hızla yaşlanır. Yeni istasyon açılınca model o istasyonu hiç tanımaz.</p>'
  '<p><b>3) Maliyet-fayda:</b> Eğitim ucuzsa (tablo verisi, birkaç dakika) haftalık otomatik eğitim mantıklıdır. Pahalıysa ya da her yeni model manuel onay gerektiriyorsa daha seyrek ve tetiklemeli.</p>'
  '<p><b>4) Önerilen politika:</b> Haftalık planlı eğitim (pazar gecesi) + tetikleyiciler: son 7 günün MAE\'si eşiği aşarsa ya da yeni istasyon eklenirse. Yeni model otomatik olarak son haftada eskisiyle karşılaştırılır; daha iyi değilse yayınlanmaz.</p>'
  '<p><b>5) Güvenlik:</b> Bayram, maç gibi olağandışı haftaların eğitimi bozmasını engellemek için bu günler işaretlenir ya da özellik olarak eklenir.</p>',
  ['Otomatik yeniden eğitimin riskleri nelerdir?', 'Yeni istasyon için tahmin nasıl yapılır (soğuk başlangıç)?'],
  ['"Her gün eğitelim" ya da "yılda bir yeterli" gibi veriye dayanmayan cevaplar', 'Yeni modeli eskisiyle karşılaştırmadan yayına almak'],
  'Sıklık sorularında "backtest ile model yaşlanma eğrisi çıkarırım" demek en güçlü açılıştır.'),

I(['ml', 'muhendis'], 'orta', 'tasarim', 'Eğitim boru hattı',
  'Bir sınıflandırma modeli için uçtan uca otomatik eğitim boru hattı (training pipeline) tasarla. Hangi adımlar ve kalite kapıları olmalı?',
  '<p><b>Adımlar (her biri ayrı, yeniden çalıştırılabilir görev):</b></p><ol>'
  '<li><b>Veri çekme:</b> Sabit tarih aralığıyla, sürümlenen sorgu; çıktı tarihli parquet olarak saklanır.</li>'
  '<li><b>Veri doğrulama (kapı 1):</b> Şema, satır sayısı, eksik oranı, hedef oranı ve özellik dağılımları beklenen aralıkta mı? Değilse hat durur ve uyarı gönderir; bozuk veriyle eğitilmiş model en tehlikelisidir.</li>'
  '<li><b>Özellik üretimi:</b> Zamanda doğru (point-in-time) birleştirme; özellik kodu canlıyla ortak.</li>'
  '<li><b>Bölme ve eğitim:</b> Zamana göre bölme; Pipeline içinde ön işlem + model; sabit tohum; hiperparametreler konfigürasyondan.</li>'
  '<li><b>Değerlendirme (kapı 2):</b> Test metrikleri mutlak eşiğin üstünde mi? Canlıdaki şampiyon modelden en az eşit mi? Kritik segmentlerde (şehir, yeni müşteri) kötüleşme var mı? Adalet metrikleri sınır içinde mi?</li>'
  '<li><b>Kayıt:</b> Model, metrikler, veri referansı ve kod sürümü model kayıt defterine "aday" olarak yazılır.</li>'
  '<li><b>Dağıtım:</b> Onaydan (otomatik ya da insan) sonra gölge → kanarya → tam yayın.</li></ol>'
  '<p><b>Altyapı:</b> Airflow ya da benzeri bir orkestratörde DAG; her görev idempotent. Ayrıntılı loglama ve her adım için süre/başarı izleme.</p>'
  '<p><b>Tetikleme:</b> Takvim (haftalık), kayma alarmı ya da yeni etiketli veri miktarı.</p>',
  ['Değerlendirme kapısında şampiyon modelle nasıl adil karşılaştırma yaparsın?', 'Bu hattı test etmek için hangi testleri yazarsın?'],
  ['Veri doğrulama adımını atlamak', 'Yeni modeli canlıdakiyle karşılaştırmadan otomatik yayınlamak'],
  'Kalite kapılarını ayrı başlıklar olarak vurgula; tasarımın "otomasyon" kadar "güvenlik" de içerdiğini gösterir.'),

I(['ml', 'bilimci'], 'ileri', 'vaka', 'Vaka: adalet denetimi',
  'Pusula İK\'nın CV ön eleme modelinin kadın adayları erkeklere göre daha az geçirdiği iddia ediliyor. Modelde cinsiyet özelliği yok. Nasıl incelersin?',
  '<p><b>1) Özelliği çıkarmak yetmez:</b> Model cinsiyetle ilişkili vekil (proxy) değişkenlerden aynı bilgiyi öğrenebilir: kariyer boşluğu (doğum izni), belirli okullar, hobiler, ifade biçimi. Eğitim verisi geçmiş işe alım kararlarından geliyorsa geçmişin yanlılığını da öğrenir.</p>'
  '<p><b>2) Ölç:</b> Denetim için cinsiyet bilgisini (modele vermeden) kullanarak gruplara göre karşılaştır:</p><ul>'
  '<li><b>Seçilme oranı:</b> Kadınlarda geçme oranı / erkeklerde geçme oranı. Sık kullanılan bir kural, bu oran 0,8\'in altındaysa olumsuz etki şüphesidir.</li>'
  '<li><b>Hata oranları:</b> Gerçekte nitelikli olan adaylar arasında elenme oranı (yanlış negatif) gruplar arasında farklı mı?</li>'
  '<li><b>Kalibrasyon:</b> Aynı skor, her iki grupta aynı başarı olasılığına mı karşılık geliyor?</li></ul>'
  '<p>Bu metrikler aynı anda tamamen sağlanamaz; hangisinin öncelikli olduğu hukuk ve İK ile birlikte belirlenir.</p>'
  '<p><b>3) Kaynağı bul:</b> SHAP ile hangi özelliklerin farkı yarattığını incele; "kariyer boşluğu" büyük katkı yapıyorsa iş gereksinimiyle gerçekten ilişkili mi diye sorgula.</p>'
  '<p><b>4) Düzelt:</b> Sorunlu vekil özellikleri çıkar ya da dönüştür; eğitim verisini yeniden ağırlıklandır; gruplar için eşik dengelemesini hukuki açıdan değerlendir. Model kararı tavsiye niteliğinde kalsın, insan incelemesiyle birleşsin.</p>'
  '<p><b>5) Süreklilik:</b> Adalet metriklerini düzenli raporla ve belgele.</p>',
  ['Demografik eşitlik ile fırsat eşitliği arasındaki fark nedir?', 'Korumalı özelliği hiç toplamıyorsan denetimi nasıl yaparsın?'],
  ['"Cinsiyet modelde yok, o yüzden yanlılık olamaz" demek', 'Adalet metriklerinin birbiriyle çelişebileceğini bilmemek'],
  'Adalet sorularında teknik analizi hukuki ve insani süreçle birlikte anlat; tek başına teknik çözüm yoktur.'),
]
