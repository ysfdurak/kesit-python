from d01 import I

ITEMS = [
I(['bilimci', 'analist'], 'temel', 'kavram', 'p-değeri',
  'p-değeri nedir, ne değildir? Teknik olmayan bir yöneticiye nasıl anlatırsın?',
  '<p><b>Tanım:</b> p-değeri, <b>sıfır hipotezi doğru olsaydı</b> (yani gerçekte hiçbir fark olmasaydı), elimizdeki kadar ya da daha uç bir sonucu görme olasılığıdır. Küçük p-değeri, verinin "fark yok" varsayımıyla pek uyuşmadığını gösterir.</p>'
  '<p><b>Ne değildir:</b></p><ul>'
  '<li>Sıfır hipotezinin doğru olma olasılığı <b>değildir</b>.</li>'
  '<li>Sonucun "tesadüf olma olasılığı" ya da B seçeneğinin daha iyi olma olasılığı <b>değildir</b>.</li>'
  '<li>Etkinin büyüklüğünü ya da önemini <b>söylemez</b>. Milyonlarca kullanıcıda önemsiz bir fark bile çok küçük p verir.</li></ul>'
  '<p><b>Yöneticiye anlatım:</b> "Yazı tura atan bir paranın hileli olup olmadığını merak ediyoruz. 10 atışta 9 tura geldi. Para düzgün olsaydı böyle bir sonucun çıkma olasılığı yaklaşık %2. Bu düşük olasılık bizi paranın hileli olduğundan şüphelendiriyor. p-değeri bu %2\'dir."</p>'
  '<p><b>Pratikte:</b> Eşik (genelde 0,05) veriye bakmadan önce belirlenir. p-değeri tek başına karar ölçütü olmamalı; etki büyüklüğü ve güven aralığıyla birlikte raporlanmalıdır.</p>',
  ['p = 0,06 çıktığında ne dersin?', 'Tek yönlü ve çift yönlü test arasındaki fark nedir?', 'p-hacking nedir?'],
  ['"p = 0,03, yani hipotezimin doğru olma olasılığı %97" demek', 'p-değerini etki büyüklüğüyle karıştırmak'],
  'Bu soruda yanlış yorumları kendiliğinden sayman büyük artıdır; çoğu aday yalnız tanımı ezberler.'),

I(['bilimci', 'analist'], 'temel', 'kavram', 'Güven aralığı',
  '%95 güven aralığı nasıl yorumlanır? "Gerçek değer %95 olasılıkla bu aralıktadır" demek doğru mu?',
  '<p><b>Kısa cevap:</b> Klasik (frekansçı) istatistikte tam olarak doğru değil, ama pratikte sık kullanılan bir sadeleştirmedir.</p>'
  '<p><b>Doğru yorum:</b> Aynı örnekleme sürecini çok kez tekrarlayıp her seferinde %95 güven aralığı hesaplasaydık, bu aralıkların yaklaşık %95\'i gerçek değeri kapsardı. "%95" yönteme ait bir güvendir; hesapladığın tek bir aralık gerçek değeri ya kapsar ya kapsamaz.</p>'
  '<p><b>Neden önemli:</b> Güven aralığı tek bir sayıdan çok daha fazla bilgi verir. "Ortalama sepet 245 TL, %95 GA: 238–252 TL" ifadesi hem tahmini hem belirsizliği gösterir. A/B testinde fark için verilen aralık sıfırı içermiyorsa, sonuç %5 düzeyinde anlamlıdır; aralığın genişliği ise etkinin ne kadar kesin bilindiğini anlatır.</p>'
  '<p><b>Genişliği etkileyenler:</b> Örneklem büyüklüğü (n dört katına çıkınca aralık yarıya iner), verinin değişkenliği ve güven düzeyi (%99 aralık daha geniştir).</p>'
  '<p>Bayesçi yaklaşımda hesaplanan <b>inandırıcı aralık (credible interval)</b> ise gerçekten "parametre %95 olasılıkla bu aralıkta" diye yorumlanabilir; ama bir ön dağılım (prior) gerektirir.</p>',
  ['Güven aralığını bootstrap ile nasıl hesaplarsın?', 'Aralık çok genişse ne yaparsın?'],
  ['Güven aralığını verinin %95\'inin bulunduğu aralık sanmak', 'Örneklem büyüklüğünün aralık genişliğine etkisini bilmemek'],
  'Teknik doğruyu söyle, ardından iş dilindeki pratik yorumu ver; iki seviyede de rahat olduğunu göster.'),

I(['bilimci'], 'orta', 'kod-okuma', 'Bootstrap',
  'Aşağıdaki kod küçük bir sepet tutarı örnekleminden bootstrap ile ne hesaplıyor? Çıktıdaki üç sayıyı yorumla.',
  '<p><b>Ne yapıyor:</b> 10 gözlemlik örneklemden, <b>yerine koyarak</b> 10\'ar elemanlık 2.000 yeni örneklem çekiyor ve her birinin ortalamasını alıyor. Bu ortalamaların dağılımı, örnek ortalamasının örnekleme dağılımının bir tahminidir. 2,5 ve 97,5 yüzdelikleri ise %95 yüzdelik bootstrap güven aralığını verir.</p>'
  '<p><b>Çıktı:</b> Örnek ortalaması 157.5 TL; aralık yaklaşık 104–231.5 TL. Aralık çok geniş, çünkü n = 10 küçük ve 300 ile 400 TL\'lik iki büyük sepet değişkenliği artırıyor. Aralık ortalamaya göre <b>simetrik değil</b>: sağa çarpık veride bootstrap bunu doğal olarak yakalar; normal dağılım varsayan "ortalama ± 1,96 × standart hata" formülü yakalayamaz.</p>'
  '<p><b>Neden bootstrap:</b> Medyan, oran farkı, P90 gibi standart hata formülü karmaşık istatistikler için de aynı yöntem çalışır.</p>'
  '<p><b>Dikkat:</b> <code>default_rng(42)</code> ile tohum verildiği için sonuç tekrarlanabilir. Bootstrap, örneklemin evreni iyi temsil ettiğini varsayar; 10 gözlem bunun için zayıftır. Zaman serisi gibi bağımlı verilerde satırları tek tek değil bloklar hâlinde yeniden örneklemek gerekir.</p>',
  ['Medyan için bootstrap aralığını nasıl hesaplarsın?', 'Bootstrap tekrar sayısını nasıl seçersin?'],
  ['Yerine koymadan örneklemenin de aynı sonucu vereceğini sanmak', 'Küçük örneklemde bootstrap\'ın sihirli biçimde kesinlik ürettiğini düşünmek'],
  'Bootstrap\'ı "veriden evreni simüle etmek" diye tek cümleyle özetleyip ardından varsayımını söyle.',
  code='''
import numpy as np
rng = np.random.default_rng(42)
sepet = np.array([120, 95, 300, 80, 150, 110, 90, 400, 130, 100])
ortalamalar = [rng.choice(sepet, size=sepet.size, replace=True).mean() for _ in range(2000)]
alt, ust = np.percentile(ortalamalar, [2.5, 97.5])
print(round(sepet.mean(), 1), round(alt, 1), round(ust, 1))
'''),

I(['bilimci', 'analist'], 'orta', 'kavram', 'Hata türleri ve güç',
  'Tip I ve Tip II hata nedir? İstatistiksel güç ve örneklem büyüklüğü bunlarla nasıl ilişkilidir?',
  '<p><b>Tip I hata (yanlış pozitif, α):</b> Gerçekte fark yokken "fark var" demek. Eşik 0,05 ise bu hatayı yapma olasılığını %5\'te tutmayı kabul etmişsindir. Örnek: etkisiz bir kampanyayı başarılı ilan etmek.</p>'
  '<p><b>Tip II hata (yanlış negatif, β):</b> Gerçekte fark varken onu yakalayamamak. Örnek: işe yarayan bir ödeme sayfasını "anlamlı değil" diye çöpe atmak.</p>'
  '<p><b>Güç (power) = 1 − β:</b> Gerçek bir etki varken onu yakalama olasılığı. Genellikle %80 hedeflenir.</p>'
  '<p><b>Güç neye bağlı?</b> 1) Örneklem büyüklüğü (arttıkça güç artar). 2) Etkinin büyüklüğü (küçük etkiyi yakalamak zordur). 3) Verinin varyansı. 4) α düzeyi (α küçülürse güç düşer).</p>'
  '<p><b>Pratik sonuç:</b> Test başlamadan <b>en küçük anlamlı etki</b> (MDE) belirlenir: "Dönüşümde %5\'lik göreli artış bizim için anlamlı." Ardından güç analiziyle gereken örneklem hesaplanır. Etki yarıya inerse gereken örneklem yaklaşık <b>dört katına</b> çıkar. Az trafiğe sahip bir sayfada küçük iyileştirmeleri test etmek bu yüzden haftalar sürebilir; güçsüz bir testin "anlamsız" sonucu "etki yok" anlamına gelmez.</p>',
  ['Python\'da örneklem büyüklüğünü nasıl hesaplarsın?', 'Hangi hata türü daha maliyetli? Bağlama göre örnek ver.'],
  ['"Anlamlı çıkmadı, demek ki etki yok" demek', 'Test başlamadan örneklem büyüklüğü hesaplamamak'],
  'Hata türlerini bir iş örneğiyle (sahte alarm ve kaçırılan fırsat) eşleştir; ezber görünmez.'),

I(['bilimci', 'ml'], 'orta', 'kavram', 'Yanlılık-varyans dengesi',
  'Yanlılık-varyans (bias-variance) dengesini açıkla. Modelinin hangi sorundan muzdarip olduğunu nasıl anlarsın?',
  '<p><b>Yanlılık (bias):</b> Modelin çok basit olmasından kaynaklanan sistematik hata. Doğrusal bir model, kıvrımlı bir ilişkiyi asla yakalayamaz; eğitim verisinde bile kötü performans gösterir. Buna eksik öğrenme (underfitting) denir.</p>'
  '<p><b>Varyans:</b> Modelin eğitim verisindeki gürültüye fazla duyarlı olması. Derin bir karar ağacı eğitim verisini ezberler, yeni veride kötü sonuç verir. Buna aşırı öğrenme (overfitting) denir.</p>'
  '<p><b>Denge:</b> Model karmaşıklığı arttıkça yanlılık düşer, varyans artar. Toplam beklenen hata = yanlılık² + varyans + indirgenemez gürültü; amaç toplamı en aza indirmektir.</p>'
  '<p><b>Teşhis:</b></p><ul>'
  '<li>Eğitim hatası yüksek, doğrulama hatası da yüksek ve ikisi yakın → <b>yüksek yanlılık</b>. Çözüm: daha güçlü model, yeni özellikler, düzenlileştirmeyi azaltmak.</li>'
  '<li>Eğitim hatası düşük, doğrulama hatası çok daha yüksek → <b>yüksek varyans</b>. Çözüm: daha fazla veri, düzenlileştirme, daha basit model, erken durdurma, topluluk (bagging).</li></ul>'
  '<p>Öğrenme eğrileri (eğitim boyutuna göre iki hata) bu teşhisi görsel olarak yapmanın en iyi yoludur: yüksek varyansta daha fazla veri boşluğu kapatır, yüksek yanlılıkta kapatmaz.</p>',
  ['Random forest hangi bileşeni azaltır? Gradient boosting hangisini?', 'Öğrenme eğrisini nasıl çizersin?', 'Daha fazla veri her zaman yardımcı olur mu?'],
  ['Eğitim ve doğrulama hatalarını karşılaştırmadan teşhis koymak', 'Yanlılığı istatistiksel "örneklem yanlılığı" ile karıştırmak'],
  'Teşhis tablosunu (eğitim hatası/doğrulama hatası → sorun → çözüm) ezbere bil; çok sık sorulur.'),

I(['bilimci', 'ml'], 'orta', 'kavram', 'Düzenlileştirme',
  'L1 (Lasso) ve L2 (Ridge) düzenlileştirme arasındaki fark nedir? Hangisini ne zaman seçersin?',
  '<p><b>Amaç:</b> Düzenlileştirme (regularization), kayıp fonksiyonuna katsayıların büyüklüğüne bağlı bir ceza ekleyerek modeli sadeleştirir ve aşırı öğrenmeyi azaltır. Ceza gücü <code>alpha</code> (ya da <code>C = 1/alpha</code>) ile ayarlanır.</p>'
  '<p><b>L2 (Ridge):</b> Ceza = katsayıların karelerinin toplamı. Tüm katsayıları sıfıra doğru küçültür ama genellikle <b>tam sıfır yapmaz</b>. Birbiriyle ilişkili özellikler varsa ağırlığı aralarında paylaştırır; çoklu doğrusallıkta kararlıdır.</p>'
  '<p><b>L1 (Lasso):</b> Ceza = katsayıların mutlak değerlerinin toplamı. Bazı katsayıları <b>tam sıfıra</b> indirir; yani otomatik özellik seçimi yapar. İlişkili özelliklerden birini seçip ötekini atabilir, bu seçim kararsız olabilir.</p>'
  '<p><b>Elastic Net:</b> İkisinin karışımı; çok sayıda ilişkili özellik varken hem seyreklik hem kararlılık sağlar.</p>'
  '<p><b>Seçim:</b> Yüzlerce özellikten azının önemli olduğunu düşünüyorsan ve yorumlanabilir sade bir model istiyorsan L1; özelliklerin çoğu biraz katkı veriyorsa L2. <code>alpha</code> değeri çapraz doğrulamayla seçilir.</p>'
  '<p><b>Kritik ayrıntı:</b> Ceza katsayının büyüklüğüne bağlı olduğundan özellikler önce <b>ölçeklendirilmelidir</b>; yoksa TL cinsinden gelir ile yaş eşit cezalandırılmaz.</p>',
  ['Geometrik olarak L1 neden sıfır katsayı üretir?', 'Ağaç tabanlı modellerde düzenlileştirme nasıl yapılır?'],
  ['Ölçeklendirme yapmadan düzenlileştirme uygulamak', 'L2\'nin de özellik seçimi yaptığını söylemek'],
  'Geometrik sezgiyi (L1\'in elmas biçimli kısıt bölgesi köşelerde sıfır üretir) kısaca anlatabilirsen çok iyi izlenim bırakırsın.'),

I(['bilimci', 'ml'], 'orta', 'kod-okuma', 'Ölçeklendirme ve sızıntı',
  'Standartlaştırma (z-skor) iki farklı şekilde yapılıyor. Çıktıları karşılaştır: hangisi doğru, neden?',
  '<p><b>İlk satır:</b> Ortalama ve standart sapma yalnız <b>eğitim</b> verisinden hesaplanır (ortalama 14, std ≈ 2.83). Test değerleri 40 ve 42 bu ölçekte <b>9.19 ve 9.9</b> standart sapma uzaktadır. Model bu değerlerin eğitimde görülmemiş kadar uç olduğunu doğru biçimde "görür".</p>'
  '<p><b>İkinci satır:</b> İstatistikler eğitim ve test birleştirilerek hesaplanır (ortalama ≈ 21.7, std ≈ 12.4). Test değerleri artık yalnız <b>1.47 ve 1.63</b> görünür. Test verisinin bilgisi ölçekleyiciye sızmış ve uç değerler sıradanlaşmıştır.</p>'
  '<p><b>Doğrusu ilki.</b> Gerçek hayatta canlıya gelen veriyi önceden göremezsin; test seti bu durumu taklit etmelidir. Ön işlem adımlarının (ölçekleme, eksik doldurma, kodlama) parametreleri yalnız eğitimden öğrenilir, teste yalnız uygulanır: <code>fit</code> eğitimde, <code>transform</code> her yerde.</p>'
  '<p><b>Pratik çözüm:</b> scikit-learn <code>Pipeline</code> kullan. Çapraz doğrulamada her katmanda ölçekleyici yalnız o katmanın eğitim kısmına uydurulur ve bu tür sızıntı yapısal olarak engellenir.</p>',
  ['Ağaç modelleri için ölçekleme gerekir mi?', 'Pipeline çapraz doğrulamada sızıntıyı nasıl engeller?'],
  ['Tüm veriye fit_transform yapıp sonra bölmeyi zararsız saymak', 'Test istatistiklerini "daha fazla veri, daha iyi tahmin" diye savunmak'],
  'Sızıntı sorularında her zaman "canlıda bu bilgiye o anda sahip olur muydum?" testini dile getir.',
  code='''
import numpy as np
egitim = np.array([10., 12., 14., 16., 18.])
test = np.array([40., 42.])
mu, sd = egitim.mean(), egitim.std()
print(((test - mu) / sd).round(2))
hepsi = np.concatenate([egitim, test])
print(((test - hepsi.mean()) / hepsi.std()).round(2))
'''),

I(['bilimci', 'ml'], 'ileri', 'kavram', 'Veri sızıntısı',
  'Veri sızıntısı (data leakage) türlerini örneklerle açıkla. Bir modelde sızıntıdan nasıl şüphelenirsin?',
  '<p><b>Tanım:</b> Modelin eğitimde, tahmin anında gerçekte erişemeyeceği bir bilgiye erişmesi. Sonuç: test metrikleri olağanüstü, canlı performans hayal kırıklığı.</p>'
  '<p><b>Türler:</b></p><ul>'
  '<li><b>Hedef sızıntısı:</b> Özellik, hedefin sonucu olarak oluşur. Anadolu Bank temerrüt modelinde "yasal takip başlatıldı mı" özelliği; temerrütten <i>sonra</i> doldurulur.</li>'
  '<li><b>Zamansal sızıntı:</b> Rastgele bölmede gelecekteki kayıtlar eğitime girer; ya da "müşterinin toplam sipariş sayısı" tahmin tarihinden sonraki siparişleri de sayar.</li>'
  '<li><b>Ön işlem sızıntısı:</b> Ölçekleme, eksik doldurma, hedef kodlama ya da özellik seçimi bölmeden önce tüm veriyle yapılır.</li>'
  '<li><b>Grup sızıntısı:</b> Aynı müşterinin satırları hem eğitimde hem testte; model kişiyi ezberler.</li>'
  '<li><b>Yinelenen kayıtlar:</b> Aynı satırın kopyaları iki tarafa düşer.</li></ul>'
  '<p><b>Şüphe sinyalleri:</b> Beklenmedik derecede yüksek skor (AUC 0,99); tek bir özelliğin önem sıralamasında ezici üstünlüğü; canlı ile test arasında büyük fark.</p>'
  '<p><b>Korunma:</b> Her özellik için "tahmin anında bu değer biliniyor muydu?" diye sor; özellikleri zaman damgalı (point-in-time) üret; zamana göre ve grup bazlı bölme kullan; tüm ön işlemi Pipeline içine koy.</p>',
  ['Özellik önemlerinin sızıntıyı bulmada rolü nedir?', 'Point-in-time doğruluğu nasıl sağlanır?', 'Kaggle yarışmalarındaki "sızıntı avcılığı" gerçek işte neden tehlikelidir?'],
  ['Sızıntıyı yalnız "test setini eğitimde kullanmak" diye tanımlamak', 'Çok yüksek skoru sorgulamadan kutlamak'],
  'Türleri sıraladıktan sonra kendi yaşadığın ya da duyduğun bir sızıntı hikâyesi anlat; çok akılda kalıcıdır.'),

I(['bilimci', 'analist'], 'orta', 'vaka', 'Dengesiz veri',
  'Anadolu Bank\'ta bir stajyer kredi temerrüt modeli kurmuş ve "%99 doğruluk" raporluyor. Temerrüt oranı %1. Ne düşünürsün, ne yaparsın?',
  '<p><b>1) İlk tespit:</b> Temerrüt oranı %1 ise "kimse temerrüde düşmez" diyen boş bir model de %99 doğruluk alır. Doğruluk (accuracy) dengesiz veride anlamsızdır. Modelin herhangi bir temerrüdü yakalayıp yakalamadığını bilmiyoruz.</p>'
  '<p><b>2) Doğru metrikler:</b> Karışıklık matrisi; temerrüt sınıfı için <b>recall</b> (gerçek temerrütlerin yüzde kaçını yakaladık) ve <b>precision</b> (alarm verdiklerimizin yüzde kaçı gerçekten temerrüt). Eşikten bağımsız özet için PR-AUC; ROC-AUC dengesiz veride iyimser görünebilir.</p>'
  '<p><b>3) İş maliyetine bağla:</b> Kaçırılan bir temerrüt bankaya ortalama 40.000 TL, yanlış reddedilen iyi müşteri 3.000 TL kâr kaybı olabilir. Eşik bu maliyet oranına göre seçilir; varsayılan 0,5 eşiği neredeyse hiç doğru değildir.</p>'
  '<p><b>4) Model iyileştirme:</b> <code>class_weight=\'balanced\'</code>, azınlık sınıfı için yeniden örnekleme (yalnız eğitim katmanında!), olasılık kalibrasyonu. Ayrıca zamana göre bölme ve sızıntı kontrolü.</p>'
  '<p><b>5) Stajyere geri bildirim:</b> Suçlamadan, birlikte bir "taban model" (hep 0 diyen) ile karşılaştırma yapıp neden farklı metrik gerektiğini göstermek.</p>',
  ['Eşiği maliyet matrisiyle nasıl seçersin?', 'SMOTE kullanmanın riskleri nelerdir?', 'Kalibrasyon neden kredi kararlarında önemli?'],
  ['%99 doğruluğu iyi bir sonuç diye kabul etmek', 'Eşiği iş maliyetini düşünmeden 0,5 bırakmak'],
  'Dengesiz veri sorularında her zaman "taban modeli" (hep çoğunluk sınıfı) karşılaştırmasıyla başla.'),

I(['bilimci', 'ml'], 'temel', 'kavram', 'Sınıflandırma metrikleri',
  'Precision, recall ve F1 nedir? Hangisini önceliklendireceğine nasıl karar verirsin?',
  '<p><b>Precision (kesinlik):</b> Pozitif dediklerimin ne kadarı gerçekten pozitif? TP / (TP + FP). "Alarm verdiğimde ne kadar haklıyım?"</p>'
  '<p><b>Recall (duyarlılık):</b> Gerçek pozitiflerin ne kadarını yakaladım? TP / (TP + FN). "Kaç vakayı kaçırdım?"</p>'
  '<p><b>F1:</b> İkisinin harmonik ortalaması; ikisinden biri düşükse F1 de düşer. Sınıfların dengesiz olduğu ve iki hatanın da önemli olduğu durumlarda tek sayıyla özet sağlar.</p>'
  '<p><b>Öncelik, hatanın maliyetine bağlıdır:</b></p><ul>'
  '<li><b>Recall öncelikli:</b> Dolandırıcılık tespiti, hastalık taraması. Bir vakayı kaçırmak pahalıdır; fazladan inceleme ucuzdur.</li>'
  '<li><b>Precision öncelikli:</b> Spam filtresi (önemli e-postayı spam\'e atmak çok rahatsız edici), müşteriye doğrudan otomatik ceza kesen sistemler.</li></ul>'
  '<p><b>Eşik:</b> Olasılık üreten modellerde eşiği düşürmek recall\'ı artırır, precision\'ı düşürür. Bu yüzden "modelin recall\'ı X" demek, hangi eşikte olduğu söylenmeden eksik bir bilgidir. Precision-recall eğrisi tüm eşiklerdeki dengeyi gösterir.</p>'
  '<p>İkiden fazla sınıf varsa macro (her sınıf eşit) ve weighted (sınıf büyüklüğüne göre) ortalama farkını da bilmek gerekir.</p>',
  ['F-beta skoru ne zaman kullanılır?', 'Macro ve micro ortalama arasındaki fark nedir?'],
  ['Precision ile recall formüllerini karıştırmak', 'Metriği eşikten bağımsız sanmak'],
  'Her metriği bir soru cümlesiyle ("Alarm verdiğimde ne kadar haklıyım?") tanımla; akılda kalır ve karışmaz.'),

I(['bilimci', 'ml'], 'temel', 'kod-okuma', 'Karışıklık matrisi',
  'Bir dolandırıcılık modelinin 10 işlem için tahminleri var. Kod hangi değerleri basar?',
  '<p>Pozitif sınıf = dolandırıcılık (1). Konum konum karşılaştıralım:</p>'
  '<ul><li><b>TP</b> (tahmin 1, gerçek 1): 0. ve 7. işlem → <b>2</b>.</li>'
  '<li><b>FP</b> (tahmin 1, gerçek 0): 2. ve 8. işlem → <b>2</b>.</li>'
  '<li><b>FN</b> (tahmin 0, gerçek 1): 3. işlem → <b>1</b>.</li></ul>'
  '<p>Precision = 2 / (2 + 2) = <b>0.5</b>; recall = 2 / (2 + 1) ≈ <b>0.67</b>. Doğruluk: 10 işlemin 7\'sinde tahmin doğru → <b>0.7</b>. <code>(tahmin == gercek).mean()</code> mantıksal dizinin ortalamasını alır; True 1, False 0 sayılır.</p>'
  '<p><b>Yorum:</b> Model her iki alarmdan birinde yanılıyor ve her üç dolandırıcılıktan birini kaçırıyor. Doğruluğun 0.7 olması bu iki ayrı zaafı gizler. <code>int(...)</code> dönüşümü, NumPy tamsayısının sade Python sayısı olarak basılması içindir.</p>'
  '<p>Gerçek işte aynı hesabı <code>sklearn.metrics.confusion_matrix</code> ve <code>classification_report</code> ile yaparsın; ama mülakatta elle hesaplayabilmek tanımları gerçekten bildiğini gösterir.</p>',
  ['Eşik değişirse bu sayılar nasıl değişir?', 'Specificity ve false positive rate nasıl hesaplanır?'],
  ['FP ile FN\'yi karıştırmak', 'Doğruluğun tek başına yeterli olduğunu söylemek'],
  'Kâğıda 2x2 tablo çiz, satırları gerçek, sütunları tahmin olarak etiketle; karışıklığı önler.',
  code='''
import numpy as np
gercek = np.array([1, 0, 0, 1, 0, 0, 0, 1, 0, 0])
tahmin = np.array([1, 0, 1, 0, 0, 0, 0, 1, 1, 0])
tp = int(((tahmin == 1) & (gercek == 1)).sum())
fp = int(((tahmin == 1) & (gercek == 0)).sum())
fn = int(((tahmin == 0) & (gercek == 1)).sum())
print(tp, fp, fn)
print(round(tp / (tp + fp), 2), round(tp / (tp + fn), 2))
print((tahmin == gercek).mean())
'''),

I(['bilimci', 'ml'], 'ileri', 'kavram', 'ROC-AUC ve PR-AUC',
  'ROC-AUC ile PR-AUC arasındaki fark nedir? Dengesiz veride hangisi daha bilgilendiricidir?',
  '<p><b>ROC eğrisi:</b> Tüm eşikler için gerçek pozitif oranı (recall) ile yanlış pozitif oranını (FP / tüm negatifler) çizer. <b>ROC-AUC</b>, rastgele seçilen bir pozitif örneğin rastgele seçilen bir negatiften daha yüksek skor alma olasılığıdır. 0,5 rastgele, 1 mükemmel sıralamadır.</p>'
  '<p><b>PR eğrisi:</b> Precision ile recall\'ı çizer. <b>PR-AUC</b> (ortalama precision) rastgele bir modelde pozitif sınıf oranına eşittir; yani %1 dolandırıcılık varsa taban 0,01\'dir.</p>'
  '<p><b>Dengesiz veride fark:</b> Yanlış pozitif oranının paydası tüm negatiflerdir. 1 milyon meşru işlemin olduğu bir veri setinde 5.000 yanlış alarm FPR\'yi yalnız %0,5 artırır; ROC eğrisi neredeyse kusursuz görünür. Oysa 1.000 gerçek dolandırıcılık için 5.000 yanlış alarm, precision\'ı çok düşürür ve operasyon ekibi boğulur. PR eğrisi bu acıyı gösterir.</p>'
  '<p><b>Öneri:</b> Pozitif sınıf nadirse ve ilgi pozitifleri doğru yakalamaktaysa PR-AUC raporla; modeller arası genel sıralama yeteneğini karşılaştırırken ROC-AUC da faydalıdır. Her iki durumda da sonunda işin çalışacağı <b>tek bir eşik</b> seçilir ve o eşikteki precision/recall raporlanır.</p>',
  ['ROC-AUC sınıf oranı değişince neden sabit kalır?', 'Modeli seçtikten sonra eşiği nasıl belirlersin?'],
  ['Dengesiz veride yalnız ROC-AUC\'ye bakıp modeli başarılı ilan etmek', 'PR-AUC\'nin rastgele tabanının 0,5 olduğunu söylemek'],
  'Sayısal bir örnekle (1 milyon negatif, 5.000 yanlış alarm) farkı göster; soyut anlatımdan çok daha ikna edicidir.'),

I(['bilimci', 'ml'], 'ileri', 'vaka', 'Vaka: canlıda düşen performans',
  'Lezzet Kurye\'nin teslim süresi tahmin modeli testte MAE 3 dakika veriyordu; canlıya çıktıktan sonra MAE 9 dakika. Nasıl araştırırsın?',
  '<p><b>1) Sızıntıdan şüphelen (en sık neden):</b> Eğitim özelliklerini tek tek "sipariş anında biliniyor muydu?" diye incele. Örneğin "kuryenin restorana varış zamanı" ya da "o saatteki tamamlanmış sipariş sayısı" tablolarda geçmişe dönük doldurulmuş olabilir; canlıda bu değerler henüz yoktur.</p>'
  '<p><b>2) Bölme yöntemini kontrol et:</b> Test seti rastgele mi ayrıldı? Aynı gün ve aynı restoranın siparişleri iki tarafa düştüyse model günün koşullarını ezberlemiştir. Zamana göre bölmeyle yeniden değerlendir; gerçekçi skor muhtemelen 3 ile 9 arasında çıkar.</p>'
  '<p><b>3) Eğitim-sunum farkı (training-serving skew):</b> Canlıdaki özellik hesaplama kodu eğitimdekiyle aynı mı? Saat dilimi, birim (saniye/dakika) ya da eksik değer doldurma farkı olabilir. Canlıdan örnek isteklerin özelliklerini kaydedip eğitim hattında aynı siparişler için üretilenlerle karşılaştır.</p>'
  '<p><b>4) Dağılım kayması:</b> Canlıya çıkış yağmurlu bir haftaya ya da yeni bir şehre denk geldiyse girdi dağılımı değişmiştir. Özellik dağılımlarını eğitimle karşılaştır.</p>'
  '<p><b>5) Kapanış:</b> Sorun bulunana kadar basit bir kural tabanlı tahmine geri dön; düzeltmeden sonra gölge modda (shadow) bir hafta karşılaştırıp yeniden yayına al.</p>',
  ['Gölge mod (shadow deployment) nedir?', 'Özellik değerlerini canlıda nasıl kaydedersin?'],
  ['İlk refleks olarak modeli daha karmaşık bir algoritmayla değiştirmek', 'Test metriğinin doğru olduğunu varsayıp sorunu yalnız veride aramak'],
  'Hipotezlerini olasılık ve kontrol maliyetine göre sırala; bu, kıdemli düşünmenin işaretidir.'),

I(['bilimci', 'analist'], 'orta', 'tasarim', 'Deney tasarımı',
  'Kanat Havayolları ek bagaj ücretini 450 TL\'den 399 TL\'ye düşürmeyi düşünüyor. Bunu test eden bir deney tasarla.',
  '<p><b>1) Hipotez ve karar:</b> "Fiyatı düşürmek ek bagaj satın alma oranını artırır ve bagaj başına gelir kaybını telafi eder." Karar metriği: <b>yolcu başına bagaj geliri</b>. İkincil: satın alma oranı. Denge metrikleri: bilet dönüşümü, havalimanında bagaj kaynaklı gecikme.</p>'
  '<p><b>2) Atama birimi:</b> Rezervasyonu yapan kullanıcı (aynı kişi her ziyarette aynı fiyatı görmeli). Aynı rezervasyondaki tüm yolcular aynı grupta olur.</p>'
  '<p><b>3) Örneklem ve süre:</b> Mevcut satın alma oranı ve varyansla güç analizi yapılır; en küçük anlamlı etki örneğin gelirde %3. Süre en az iki tam hafta: iş seyahati (hafta içi) ve tatil (hafta sonu) desenleri farklıdır. Bayram dönemi gibi uç haftalardan kaçınılır.</p>'
  '<p><b>4) Riskler:</b> Fiyat farkı sosyal medyada fark edilebilir (müşteri adaleti); hukuk ve iletişim ekibiyle önceden konuşulur. Rakip fiyat değişikliği dış etken olabilir. Rezervasyon ile uçuş arasındaki gecikme nedeniyle bazı etkiler (havalimanında satın alınan bagaj) geç gözlenir.</p>'
  '<p><b>5) Analiz planı:</b> Önceden yazılı: birincil metrik, test, eşik, segmentler (yurt içi/dış). Erken bakışa izin yoksa sabit süre; varsa sıralı test yöntemi. Sonuç: gelir farkı ve güven aralığı.</p>',
  ['Fiyat deneylerinde etik sorunları nasıl ele alırsın?', 'Ağ etkisi olan bir pazarda (ör. kurye) kullanıcı bazlı atama neden sorunlu?', 'Uzun vadeli etkiyi nasıl ölçersin?'],
  ['Karar metriği olarak yalnız satın alma oranını seçip geliri unutmak', 'Süreyi haftalık döngüleri düşünmeden belirlemek'],
  'Deney tasarımı sorularında şu sırayı izle: hipotez, metrikler, birim, güç/süre, riskler, analiz planı.'),

I(['bilimci', 'ml'], 'temel', 'kavram', 'Özellik mühendisliği',
  'Özellik mühendisliği (feature engineering) ne demektir? Tarih ve kategorik değişkenler için hangi teknikleri kullanırsın?',
  '<p><b>Tanım:</b> Ham veriyi, modelin örüntüyü daha kolay öğrenebileceği değişkenlere dönüştürmek. Çoğu iş probleminde model seçiminden daha fazla kazanç getirir.</p>'
  '<p><b>Tarih/zaman:</b> Haftanın günü, saat, ay, resmî tatil/bayram bayrağı, maaş günü yakınlığı, "son siparişten bu yana gün" (recency). Döngüsel değişkenlerde (saat 23 ile 0 komşudur) sinüs-kosinüs dönüşümü. Geçmiş pencereler: son 7/30 günün sipariş sayısı.</p>'
  '<p><b>Kategorik değişkenler:</b></p><ul>'
  '<li><b>One-hot kodlama:</b> Az sayıda kategori için (ödeme yöntemi). Doğrusal modellerde standart.</li>'
  '<li><b>Ordinal kodlama:</b> Sıralı kategoriler (eğitim düzeyi) ya da ağaç modelleri.</li>'
  '<li><b>Hedef kodlama (target encoding):</b> Çok sayıda kategori (binlerce ürün) için kategorinin hedef ortalaması. Sızıntı riski yüksektir; katman dışı (out-of-fold) hesaplanmalı ve az örnekli kategoriler genel ortalamaya yaklaştırılmalıdır.</li>'
  '<li><b>Frekans kodlama:</b> Kategorinin görülme sıklığı.</li></ul>'
  '<p><b>Oranlar ve etkileşimler:</b> Sepet tutarı / ürün adedi, iade sayısı / sipariş sayısı. Alan bilgisi en güçlü özellik kaynağıdır: Anadolu Market\'te "bayramdan önceki 3 gün" bir özellik olarak modelin kendi başına keşfedemeyeceği bir şeydir.</p>',
  ['Yeni, eğitimde görülmemiş bir kategori canlıda gelirse ne olur?', 'Özellik seçimini nasıl yaparsın?', 'Derin öğrenme özellik mühendisliğini gereksiz kılar mı?'],
  ['Hedef kodlamayı sızıntı önlemi almadan tüm veriyle hesaplamak', 'Yüksek kardinaliteli bir sütuna düşünmeden one-hot uygulamak'],
  'Her tekniği ne zaman seçeceğini söyle; yalnız isim saymak ezber izlenimi verir.'),
]
