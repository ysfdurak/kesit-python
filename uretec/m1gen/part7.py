def star(d, g, e, s, ek=''):
    return ('<p><b>Durum:</b> ' + d + '</p><p><b>Görev:</b> ' + g + '</p><p><b>Eylem:</b> ' + e + '</p><p><b>Sonuç:</b> ' + s + '</p>'
            + (('<p><i>' + ek + '</i></p>') if ek else ''))


R = ['davranissal']
K = 'davranissal'

Q = [
dict(roles=R, lv='temel', topic='Kendini tanıt', kind=K,
     q='Bize kendinden bahseder misin?',
     a='<p>Bu soru bir özgeçmiş okuması değil, 60–90 saniyelik bir "asansör konuşması"dır. Yapı: <b>şimdi → geçmiş → gelecek</b>.</p>'
       '<p><b>Örnek cevap:</b> "Dokuz Eylül Üniversitesi İstatistik bölümünden geçen yıl mezun oldum ve son bir yıldır Python ile backend geliştirme üzerine yoğunlaşıyorum. Şu anda bir lojistik girişiminde yarı zamanlı çalışıyorum; FastAPI ile kargo takip servisinin uç noktalarını yazıyor ve PostgreSQL sorgularını iyileştiriyorum. Geçen ay bir rapor uç noktasındaki N+1 sorgusunu bularak yanıt süresini 4 saniyeden 300 milisaniyeye indirdim.</p>'
       '<p>Bu alana stajımda bir Excel raporunu Python betiğiyle otomatikleştirip ekibin haftada beş saatini kurtardığımda ilgi duymaya başladım. Sonrasında açık kaynak bir Django projesine iki küçük katkı yaptım.</p>'
       '<p>Şimdi daha büyük ölçekli sistemlerde, kod incelemesi kültürü güçlü bir ekipte çalışmak istiyorum. İlanınızda geçen ödeme altyapısı ve yüksek trafik konuları tam olarak kendimi geliştirmek istediğim alanlar; bu yüzden başvurdum."</p>'
       '<p><b>İpuçları:</b> Pozisyonla ilgili 2–3 güçlü noktayı somut bir başarıyla destekle; özel hayat, memleket veya aile ayrıntılarına girme; konuşmayı ilana bağlayarak bitir.</p>',
     follow=['Bu projede en çok neyi öğrendin?', 'Neden istatistikten yazılıma geçtin?'],
     flags=['Özgeçmişi madde madde okumak', 'Ölçülebilir hiçbir başarı söylememek', 'Konuşmayı 3 dakikadan uzun tutmak'],
     tip='Cevabını önceden yaz ve sesli prova et; ama ezber gibi değil, sohbet tonunda söyle.'),

dict(roles=R, lv='temel', topic='Neden bu şirket?', kind=K,
     q='Neden bizimle çalışmak istiyorsun? Şirketimiz hakkında ne biliyorsun?',
     a='<p>Mülakatçı burada iki şeyi ölçer: hazırlık yapıp yapmadığını ve şirketle gerçek bir bağ kurup kurmadığını. Genel övgü ("sektörün lideri") puan getirmez.</p>'
       '<p><b>Hazırlık kaynakları:</b> şirketin web sitesi ve mühendislik blogu, GitHub hesabı, son basın haberleri, LinkedIn\'de ekip üyelerinin paylaşımları, ilan metni ve Glassdoor/Kariyer.net yorumları.</p>'
       '<p><b>Örnek cevap:</b> "Üç nedenim var. Birincisi ürününüz: Anadolu Market\'i iki yıldır kullanıyorum ve aynı gün teslimat özelliğinin arkasındaki depo optimizasyonu beni çok etkiledi. Mühendislik blogunuzda sipariş servisini mikroservislere ayırma sürecinizi anlatan yazıyı okudum. Outbox kalıbını neden seçtiğinizi açıklamanız benim de projede yaşadığım bir problemi çözmeme yardım etti.</p>'
       '<p>İkincisi teknoloji yığınınız: Python, FastAPI ve PostgreSQL ile çalışıyorsunuz; bunlar en güçlü olduğum ve derinleşmek istediğim araçlar.</p>'
       '<p>Üçüncüsü öğrenme kültürü: yeni başlayanlar için mentorluk programınız ve kod inceleme süreçlerinizden ilanda bahsedilmesi, kariyerimin bu döneminde aradığım şey."</p>'
       '<p>Cevabı şirkete ne katacağınla bağlamak da güçlü bir kapanış olur.</p>',
     follow=['Blog yazısında katılmadığın bir nokta var mıydı?', 'Rakiplerimizden bizi ne ayırıyor?'],
     flags=['Yalnızca maaş, konum veya yan haklardan söz etmek', 'Şirketin ne yaptığını bilmemek', 'Her şirkete söylenebilecek genel cümleler kurmak'],
     tip='Şirkete özgü en az bir somut ayrıntı (blog yazısı, ürün özelliği, açık kaynak projesi) söyle.'),

dict(roles=R, lv='temel', topic='Zayıf yön', kind=K,
     q='En zayıf yönün nedir?',
     a='<p>Bu sorunun amacı öz farkındalığını ve gelişime açıklığını görmektir. "Mükemmeliyetçiyim" veya "çok çalışıyorum" gibi kılık değiştirmiş övgüler samimiyetsiz bulunur. Doğru formül: <b>gerçek ama işi engellemeyen bir zayıflık + farkına varma anı + aldığın somut önlem + şimdiki durum</b>.</p>'
       + star('Projenin ilk aylarında bir konuda takıldığımda yardım istemekte geç kalıyordum. Bir keresinde Celery yapılandırmasıyla bir buçuk gün uğraştım; takım arkadaşım sorunu on dakikada çözdü.',
              'Hem ekibin zamanını hem de kendi zamanımı daha verimli kullanmam gerekiyordu.',
              'Kendime bir kural koydum: Bir sorunda 45 dakika ilerleyemezsem, denediklerimi kısaca yazıp ekip kanalına soruyorum. Ayrıca yöneticimle haftalık birebir görüşmelerde takıldığım konuları düzenli olarak konuşmaya başladım.',
              'Takılma sürelerim belirgin şekilde kısaldı. Sorularımı yazılı sorduğum için başkalarının da aynı sorunda yararlanabileceği bir bilgi birikimi oluştu. Hâlâ zaman zaman kendi başıma çözme isteği duyuyorum ama artık bunu bilinçli yönetiyorum.')
       + '<p>Pozisyonun temel yetkinliğini zayıflık olarak söyleme; örneğin backend rolü için "SQL bilmiyorum" demek ciddi bir risk oluşturur.</p>',
     follow=['Bu kuralı uygulamaya başladıktan sonra ölçülebilir bir fark gördün mü?', 'Başka hangi alanda gelişmek istiyorsun?'],
     flags=['"Zayıf yönüm yok" demek', 'Kılık değiştirmiş övgü kullanmak', 'Rolün temel gerekliliğini zayıflık olarak söylemek'],
     tip='Zayıflığı söyledikten sonra konuşmanın çoğunu aldığın önlemlere ayır.'),

dict(roles=R, lv='temel', topic='Yaptığın bir hata', kind=K,
     q='İşte yaptığın bir hatayı ve bundan ne öğrendiğini anlatır mısın?',
     a='<p>Mülakatçı burada sorumluluk alıp almadığını, baskı altında nasıl davrandığını ve süreç iyileştirme refleksini ölçer. Gerçek bir hata seç ve suçu başkasına atma.</p>'
       + star('Lojistik firmasında çalışırken Cuma akşamı bir veritabanı migration\'ını üretime aldım. Yeni bir sütuna varsayılan değer verirken büyük bir tabloyu kilitleyen bir komut kullanmışım; sipariş ekranı yaklaşık 12 dakika yanıt vermedi.',
              'Sorunu hızla çözmem ve tekrarlanmamasını sağlamam gerekiyordu.',
              'Önce durumu ekip kanalına açıkça yazdım: "Benim migration\'ım tabloyu kilitledi, geri alıyorum." Ekip liderimle birlikte migration\'ı geri aldık. Ertesi hafta kısa bir olay sonrası değerlendirme (post-mortem) yazdım. Suçlamasız formatta kök nedeni, zaman çizelgesini ve önerileri paylaştım. Migration\'ları önce üretim boyutunda bir kopya üzerinde denemeyi, büyük tablolarda kilit süresini kontrol etmeyi ve Cuma öğleden sonra dağıtım yapmamayı öneren bir kontrol listesi hazırladım.',
              'Kontrol listesi ekip standardı oldu ve sonraki altı ayda benzer bir kesinti yaşanmadı. Ben de veritabanı kilitleri konusunda ciddi bir bilgi edindim.')
       + '<p>Hikâyeyi kısa tut, en az yarısını öğrenme ve önleme kısmına ayır.</p>',
     follow=['O anda paniğini nasıl yönettin?', 'Post-mortem\'de suçlamasız format neden önemlidir?'],
     flags=['"Hiç ciddi bir hata yapmadım" demek', 'Hatayı başkasına veya koşullara yüklemek', 'Öğrenme kısmını atlamak'],
     tip='Hatayı küçümseme ama dramatize de etme; asıl vurguyu ne değiştirdiğine yap.'),

dict(roles=R, lv='temel', topic='Hızlı öğrenme', kind=K,
     q='Hiç bilmediğin bir teknolojiyi kısa sürede öğrenmek zorunda kaldığın bir durumu anlat.',
     a=star('Stajımın ikinci haftasında ekip, eski bir Flask servisinin kuyruk işlerini Celery\'den RabbitMQ tabanlı yeni bir yapıya taşıyordu. Mesaj kuyruklarıyla hiç çalışmamıştım ve bir hafta sonra demo yapılacaktı.',
            'Bana, sipariş onay e-postalarını gönderen görevi yeni yapıya taşımak verildi.',
            'İlk gün resmî belgelerdeki "hello world" ve iş kuyruğu örneklerini kendi bilgisayarımda Docker ile çalıştırdım. İkinci gün mevcut kodu okuyup akışı bir şemaya döktüm ve anlamadığım üç noktayı (ack, prefetch, ölü mektup kuyruğu) listeleyerek mentorumla 20 dakikalık bir görüşme yaptım. Sonra önce testleri yazıp küçük adımlarla ilerledim. Öğrendiklerimi ekip wiki\'sine kısa bir "ilk adımlar" notu olarak ekledim.',
            'Görevi demodan bir gün önce bitirdim; e-posta görevi sorunsuz taşındı. Hazırladığım not, sonradan gelen iki stajyerin başlangıç belgesi oldu.')
       + '<p>Bu soruda öğrenme <b>yöntemini</b> göstermek önemlidir: resmî belge, küçük deneme, mentora odaklı sorular, testle güvence ve bilgiyi paylaşma.</p>',
     follow=['Öğrenirken en çok nerede zorlandın?', 'Yeni bir kod tabanına girdiğinde ilk ne yaparsın?'],
     flags=['"Bir hafta YouTube izledim" gibi yüzeysel bir yöntem anlatmak', 'Kimseden yardım almadan her şeyi tek başına çözmeyi övünç kaynağı yapmak'],
     tip='Öğrenme adımlarını sırayla say; mülakatçı senin "nasıl öğrendiğini" görmek istiyor.'),

dict(roles=R, lv='temel', topic='Takım çalışması', kind=K,
     q='Bir ekip projesinde üstlendiğin rolü ve ekibe katkını anlatır mısın?',
     a=star('Üniversitenin son yılında dört kişilik bir ekiple, bir belediye için mahalle şikâyetlerini toplayan bir web uygulaması geliştirdik. Ekipte iki frontend, bir veri ve bir backend sorumlusu vardı; ben backend\'i üstlendim.',
            'API\'yi tasarlamak ve diğerlerinin beni beklemeden çalışabilmesini sağlamak.',
            'İlk hafta frontend arkadaşlarla birlikte uç noktaları ve JSON yapısını konuştuk ve FastAPI\'nin otomatik ürettiği OpenAPI belgesini ortak sözleşme olarak kullandık. Gerçek uç noktalar hazır olmadan sahte (mock) yanıtlar döndüren bir sürüm yayınladım; böylece frontend ilk günden çalışabildi. Haftalık 15 dakikalık toplantılar ve paylaşılan bir görev panosu önerdim. Veri arkadaşımızın şikâyetleri kategorilere ayıran modelini API\'ye bağlarken birlikte eşli programlama (pair programming) yaptık.',
            'Projeyi teslim tarihinden üç gün önce bitirdik ve belediyenin pilot uygulamasında iki ay kullanıldı. Ekip içi geri bildirimde en çok "beklemeden çalışabilme" düzenine değinildi.')
       + '<p>"Biz" ile "ben" arasındaki dengeyi koru: ekibin başarısını sahiplen, ama kendi somut katkını net söyle.</p>',
     follow=['Ekipte iş yükü dengesiz dağıldığında ne yaptınız?', 'Tekrar yapsan neyi farklı yapardın?'],
     flags=['Hep "biz" deyip kendi katkını söyleyememek', 'Ekip arkadaşlarını küçümsemek'],
     tip='Kendi katkını iletişim veya süreç kolaylaştırma gibi "takımı hızlandıran" bir eylemle anlat.'),

dict(roles=R, lv='temel', topic='Maaş beklentisi', kind=K,
     q='Maaş beklentin nedir?',
     a='<p>Bu soru bir müzakerenin başlangıcıdır; hazırlıksız yakalanmak seni ya düşük bir rakama ya da fırsatın kaçmasına götürür.</p>'
       '<p><b>Hazırlık:</b> Rolün ve şehrin piyasa aralığını araştır: Kariyer.net ve LinkedIn maaş verileri, Glassdoor, yazılımcı topluluklarının yıllık maaş anketleri ve sektördeki tanıdıklar. Türkiye\'de yüksek enflasyon nedeniyle verilerin güncel olmasına dikkat et.</p>'
       '<p><b>Önemli ayrıntılar:</b> Rakamın <b>net mi brüt mü</b> olduğunu her zaman açıkça belirt; yanlış anlaşılma en sık burada olur. Yan hakları da toplam pakete dahil et: yemek kartı, özel sağlık sigortası, prim, uzaktan veya hibrit çalışma, eğitim bütçesi ve yılda kaç kez zam yapıldığı.</p>'
       '<p><b>Örnek cevap:</b> "Bu rol için yaptığım araştırma ve deneyimime göre beklentim aylık net 55 ile 65 bin TL aralığında. Ancak bu yalnızca bir başlangıç noktası; yan haklarınız, hibrit çalışma düzeni ve yıl içindeki zam politikanızla birlikte değerlendirmek isterim. Sizin bu pozisyon için planladığınız aralığı paylaşabilir misiniz?"</p>'
       '<p>Bir aralık ver ve alt sınırını kabul edebileceğin rakam yap. Erken aşamada sorulursa önce rol ve sorumlulukları netleştirmek istediğini kibarca söyleyebilirsin.</p>',
     follow=['Teklifimiz aralığının altında kalırsa ne yaparsın?', 'Mevcut maaşın nedir?'],
     flags=['Net ya da brüt olduğunu belirtmemek', '"Ne verirseniz olur" demek', 'Araştırmasız, piyasadan çok uzak bir rakam söylemek'],
     tip='Rakamını aralık olarak ver, net/brüt belirt ve toplam paketi konuşmaya kapı aç.'),

dict(roles=R, lv='temel', topic='Beş yıl sonra', kind=K,
     q='Kendini beş yıl sonra nerede görüyorsun?',
     a='<p>Mülakatçı burada hedeflerinin pozisyonla uyumlu olup olmadığını ve şirkette kalma olasılığını değerlendirir. Ne aşırı belirsiz ("bilmiyorum") ne de rolle ilgisiz ("kendi şirketimi kurmuş olacağım") bir cevap ver.</p>'
       '<p><b>Formül:</b> teknik derinlik + artan sorumluluk + şirkete bağlı bir hedef.</p>'
       '<p><b>Örnek cevap:</b> "Önümüzdeki iki yılda backend tarafında güçlü bir mühendis olmak istiyorum: veritabanı performansı, dağıtık sistemler ve gözlemlenebilirlik konularında derinleşmeyi, ekipte bu konularda başvurulan kişilerden biri olmayı hedefliyorum. Beş yıl içinde bir servisin tasarımını baştan sona sahiplenen, mimari kararlarda söz sahibi olan ve yeni katılan mühendislere mentorluk yapan kıdemli bir mühendis olarak görüyorum kendimi.</p>'
       '<p>Teknik liderlik mi yoksa yöneticilik mi seçeceğime ise bu süreçte deneyimlerime göre karar vermek istiyorum. İlanınızda bahsedilen kariyer basamakları ve mentorluk programı, bu hedefe sizinle ulaşabileceğimi düşündürüyor."</p>'
       '<p>Cevabın gerçekçi olsun; mülakatçı bunu bir söz değil, bir yön işareti olarak dinler. Şirketin kariyer yapısını önceden araştırmak cevabı güçlendirir.</p>',
     follow=['Bu hedefe ulaşmak için şu an ne yapıyorsun?', 'Teknik liderlik ile yöneticilik arasında hangisi sana daha yakın?'],
     flags=['Rolle hiç ilgisi olmayan hedefler söylemek', '"Sizin yerinizde olacağım" gibi ezber cevaplar', 'Hiçbir hedef ifade etmemek'],
     tip='Hedefini şirketin sunduğu bir olanağa (mentorluk, kariyer basamakları) bağlayarak bitir.'),

dict(roles=R, lv='orta', topic='Takım arkadaşıyla anlaşmazlık', kind=K,
     q='Bir takım arkadaşınla teknik bir konuda anlaşamadığın bir durumu anlat. Nasıl çözdünüz?',
     a=star('Sipariş servisinde rapor uç noktası yavaşlamıştı. Ben sorgu düzeyinde çözüm (indeks ve sorguyu yeniden yazmak), kıdemli bir takım arkadaşım ise tüm sonucu Redis\'te önbelleklemeyi önerdi. Kod incelemesinde tartışma uzamaya ve biraz gerilmeye başlamıştı.',
            'Kişisel bir tartışmaya dönüşmeden ekip için doğru kararı vermemiz gerekiyordu.',
            'Yorumlarla yazışmayı bırakıp 20 dakikalık bir görüşme önerdim. Önce onun kaygısını dinledim: rapor gün içinde çok sık çağrılıyordu. Sonra iki yaklaşımı ölçmeyi teklif ettim. Staging ortamında EXPLAIN çıktısı ve yük testiyle karşılaştırdık: indeks sorguyu 3,2 saniyeden 180 milisaniyeye indiriyordu; önbellek ise ek karmaşıklık ve tazelik sorunu getiriyordu.',
            'Veriye bakınca önce indeks çözümünü uygulamaya, önbelleği ancak gerekirse eklemeye birlikte karar verdik. Ölçüm yaklaşımını beğendiği için sonraki benzer tartışmalarda da "önce ölçelim" ekip alışkanlığı oldu. İlişkimiz de güçlendi.')
       + '<p>Anlaşmazlık hikâyelerinde kişiyi değil fikri tartıştığını, karşı tarafın haklı olduğu noktaları kabul ettiğini ve kararı veriye dayandırdığını göster.</p>',
     follow=['Veri senin aleyhine çıksaydı ne yapardın?', 'Hiçbir şekilde anlaşamasaydınız kararı kim verirdi?'],
     flags=['Karşı tarafı kötüleyen bir anlatım', 'Hikâyenin sonunda "zaten ben haklıydım" vurgusu', 'Hiç anlaşmazlık yaşamadığını söylemek'],
     tip='Hikâyende "ölçtük", "dinledim" ve "birlikte karar verdik" ifadeleri olsun.'),

dict(roles=R, lv='orta', topic='Sıkışık teslim tarihi', kind=K,
     q='Teslim tarihinin çok yakın olduğu ve işin yetişmeyeceğini fark ettiğin bir durumu anlat.',
     a=star('Kurban Bayramı tatilinden önceki son hafta, e-fatura entegrasyonunun Cuma günü canlıya alınması gerekiyordu. Çarşamba günü, entegratör firmanın test ortamının beklenenden farklı hata kodları döndürdüğünü ve hata işleme kısmının iki gün daha süreceğini fark ettim.',
            'Ürün yöneticisini zamanında bilgilendirmek ve bayram öncesi riskli bir dağıtım yapmadan en değerli kısmı yetiştirmek.',
            'Aynı gün ürün yöneticisiyle görüşüp durumu sayılarla anlattım ve üç seçenek sundum: (1) tüm kapsamı bayram sonrasına ertelemek, (2) fatura oluşturma ve gönderme akışını Cuma çıkarıp hata durumlarında otomatik yeniden deneme yerine muhasebe ekibine e-posta bildirimi göndermek, (3) fazla mesaiyle her şeyi yetiştirmeye çalışmak. Üçüncüsünü bayram öncesi kesinti riski nedeniyle önermedim. İkinci seçeneği seçtik; muhasebe ekibiyle manuel süreci birlikte yazdık.',
            'Temel akış zamanında canlıya çıktı ve bayramda yalnızca iki fatura manuel takip gerektirdi. Otomatik yeniden deneme bayram sonrası ilk hafta tamamlandı. Yöneticim erken uyarıyı takdir etti; ekip olarak riskleri haftanın başında konuşma alışkanlığı edindik.')
       + '<p>Kilit davranış: kötü haberi erken vermek ve sorunla birlikte seçenek sunmak.</p>',
     follow=['Ürün yöneticisi kapsamı daraltmayı kabul etmeseydi ne yapardın?', 'Bu durumu daha erken fark etmek için ne yapabilirdin?'],
     flags=['Son güne kadar kimseye söylememek', 'Tek çözüm olarak sürekli fazla mesai önermek', 'Kaliteden ve testlerden sessizce vazgeçmek'],
     tip='"Erken haber + seçenekler + gerekçeli öneri" üçlüsünü hikâyende açıkça göster.'),

dict(roles=R, lv='orta', topic='Belirsiz gereksinim', kind=K,
     q='Size verilen görevin gereksinimleri belirsizdi. Nasıl ilerlediğini anlatır mısın?',
     a=star('Pusula İK\'da "yöneticiler izin raporlarını dışa aktarabilsin" diye tek cümlelik bir görev aldım. Hangi alanların, hangi biçimde ve hangi yetkilerle dışa aktarılacağı belli değildi.',
            'Yanlış şeyi hızla inşa etmek yerine gerçekten ihtiyaç duyulan şeyi netleştirmek.',
            'Önce talebi açan İK uzmanıyla 30 dakikalık bir görüşme ayarladım ve "Bu raporu aldıktan sonra ne yapıyorsunuz?" diye sordum. Raporun aslında aylık bordro hazırlığında kullanıldığını, Excel\'de belirli sütunlarla açılması gerektiğini öğrendim. Konuştuklarımızı beş maddelik kabul kriteri olarak yazıp onaya sundum. Kişisel veri içerdiği için yetki ve loglama gereksinimlerini de ekledim. Ardından gerçek verinin anonimleştirilmiş bir örneğiyle hızlı bir prototip gösterdim ve iki geri bildirim aldım.',
            'İlk sürüm tek seferde kabul edildi ve tahmin edilen sürenin yarısında tamamlandı. Varsayımla başlasaydım ekibin kullanmadığı bir CSV ekranı yapmış olacaktım. Bu deneyimden sonra her belirsiz görevde kabul kriterlerini yazılı netleştirmeyi alışkanlık hâline getirdim.')
       + '<p>Mülakatçı inisiyatif almanı ve bunu doğru sorularla yapmanı görmek ister.</p>',
     follow=['Paydaşa ulaşamasaydın nasıl ilerlerdin?', 'Kabul kriterlerini nasıl yazarsın?'],
     flags=['Hiç soru sormadan kendi varsayımıyla ilerlemek', 'Netlik gelene kadar hiçbir şey yapmadan beklemek'],
     tip='Sorduğun "neden" sorusunu ve ardından yazdığın kabul kriterlerini vurgula.'),

dict(roles=R, lv='orta', topic='Yöneticiyle fikir ayrılığı', kind=K,
     q='Yöneticinin bir kararına katılmadığın bir durumu anlat. Ne yaptın?',
     a=star('Yöneticim, kampanya dönemine yetişsin diye yeni ödeme akışının birim ve entegrasyon testleri yazılmadan canlıya alınmasını istedi. Ben ödeme gibi kritik bir akışta test olmadan çıkmanın ciddi risk olduğunu düşünüyordum.',
            'Kararı açıkça sorgulamak, ama yöneticimin zaman baskısını da anlayarak yapıcı bir çözüm sunmak.',
            'Ekip toplantısında değil, birebir konuştum. Önce kampanya tarihinin neden önemli olduğunu dinledim. Sonra riski somutlaştırdım: geçen yılki benzer bir hatanın kaç siparişi etkilediğini gösterdim. Bir uzlaşma önerdim: Tüm testler yerine yalnızca para hareketini etkileyen beş kritik senaryonun entegrasyon testini bir günde yazmak, özelliği önce çalışanların %5\'ine bir özellik bayrağıyla açmak ve geri kalan testleri kampanya sonrasına planlamak.',
            'Yöneticim öneriyi kabul etti. Kademeli açılış sırasında kritik testlerden biri, indirimli tutarlarda bir yuvarlama hatasını yakaladı; müşteriler etkilenmeden düzelttik. Sonrasında yöneticim kritik akışlar için bu modeli ekip kuralı yaptı.')
       + '<p>Ana mesaj: "Katılmadığımı saygıyla ve veriyle söylerim; karar verildikten sonra da ona bağlı kalırım (disagree and commit)."</p>',
     follow=['Yöneticin önerini reddetseydi ne yapardın?', 'Hangi durumda bir kararı üst yönetime taşırdın?'],
     flags=['Yöneticiyi ekip önünde sorgulamak', 'Katılmadığı hâlde sessiz kalıp sonra şikâyet etmek', 'Kararı uygulamayı reddetmek'],
     tip='Hikâyende hem itirazını hem de alternatif önerini göster; yalnızca "hayır" demek yeterli değildir.'),

dict(roles=R, lv='orta', topic='Eleştiri almak', kind=K,
     q='Kod incelemesinde ya da performans değerlendirmesinde sert bir eleştiri aldığın bir durumu anlat.',
     a=star('İlk büyük çekme isteğimde (pull request) kıdemli bir mühendis 30\'dan fazla yorum yazdı. Bazıları oldukça doğrudandı: "Bu fonksiyon üç farklı iş yapıyor, okunması çok zor."',
            'Savunmaya geçmeden geri bildirimden en iyi şekilde yararlanmak ve PR\'ı birleştirilebilir hâle getirmek.',
            'İlk tepkim kırılmak oldu; yorumlara hemen cevap vermek yerine bir saat ara verdim. Sonra yorumları üç gruba ayırdım: kesinlikle haklı olanlar, anlamadıklarım ve katılmadığım iki nokta. Anlamadıklarım için kendisinden 15 dakika istedim; neden küçük fonksiyonlar ve açık isimlendirme beklediğini örneklerle anlattı. Katılmadığım bir noktada gerekçemi yazdım; birinde beni haklı buldu, diğerinde onun yaklaşımını benimsedim.',
            'PR iki gün sonra birleştirildi. Sonraki PR\'larımdaki yorum sayısı belirgin şekilde azaldı. O mühendis zamanla mentorum oldu. Ben de inceleme yaparken yorumlarımı "neden" açıklamasıyla yazmaya özen gösteriyorum.')
       + '<p>Mülakatçı burada duygusal olgunluğu ve eleştiriyi gelişime çevirme becerisini ölçer.</p>',
     follow=['Haksız bulduğun bir eleştiriye nasıl karşılık verirsin?', 'Sen kod incelemesi yaparken nasıl yorum yazarsın?'],
     flags=['Eleştireni kötüleyen bir anlatım', '"Hiç eleştiri almadım" demek', 'Tüm yorumları sorgulamadan kabul ettiğini övmek'],
     tip='İlk duygusal tepkini dürüstçe söyle ve onu nasıl yönettiğini anlat; samimi ve olgun görünür.'),

dict(roles=R, lv='orta', topic='Üretimde kriz', kind=K,
     q='Üretim ortamında acil bir sorunla karşılaştığın bir anı anlat. Nasıl yönettin?',
     a=star('Bir Cumartesi akşamı nöbetteyken (on-call) Lezzet Kurye\'nin sipariş API\'sinde hata oranı %30\'a çıktı; akşam yemeği saatinin en yoğun anıydı.',
            'Önce müşteri etkisini durdurmak, sonra kök nedeni bulmak.',
            'Alarmı aldıktan sonra olay kanalını açtım ve durumu herkesin görebileceği şekilde 10 dakikada bir güncelledim. Grafiklere baktığımda hataların öğleden sonraki dağıtımla başladığını gördüm. Kök nedeni aramak yerine önce geri alma (rollback) yaptım; hata oranı beş dakikada normale döndü. Müşteri hizmetleri ekibini bilgilendirdim. Sonra logları incelediğimde yeni sürümde bir ödeme sağlayıcısı istemcisinin zaman aşımı değerinin yanlışlıkla 30 saniyeye çıktığını ve bağlantı havuzunu tükettiğini buldum.',
            'Toplam kesinti yaklaşık 18 dakika sürdü. Pazartesi suçlamasız bir post-mortem yazdık: yapılandırma değerleri için doğrulama testi ve dağıtım sonrası otomatik hata oranı kontrolü eklendi. Sonraki çeyrekte ortalama müdahale süremiz yarıya indi.')
       + '<p>Krizde öncelik sırası: etkiyi azalt, iletişim kur, sonra kök nedeni bul, en son kalıcı önlem al.</p>',
     follow=['Geri alma mümkün olmasaydı ne yapardın?', 'Post-mortem\'de hangi bilgileri yazarsın?'],
     flags=['Müşteri etkisini durdurmadan önce saatlerce kök neden aramak', 'Hiç iletişim kurmadan tek başına çalışmak', 'Suçu bir kişiye yüklemek'],
     tip='Zaman çizelgesi vererek anlat (dakikalar, yüzdeler); kriz hikâyelerinde rakamlar güven verir.'),

dict(roles=R, lv='orta', topic='Önceliklendirme', kind=K,
     q='Aynı anda birden fazla acil iş geldiğinde nasıl önceliklendirirsin? Bir örnekle anlat.',
     a=star('Bir pazartesi sabahı aynı anda üç talep geldi: satış ekibi akşamki müşteri sunumu için bir rapor değişikliği istiyordu, finans ekibi ay sonu mutabakatında çıkan bir hatanın incelenmesini bekliyordu ve sprint işim olan yeni kupon özelliği o hafta bitmeliydi.',
            'Üçünü de "acil" diye gelen talepler arasında gerçek önceliği belirlemek ve kimseyi habersiz bırakmamak.',
            'Her biri için iki soru sordum: Yapılmazsa etkisi nedir, ve son tarih gerçekten ne zaman? Finans hatası birden çok müşterinin faturasını etkileyebiliyordu ve yasal bir boyutu vardı; ilk sıraya koydum. Satış raporunda asıl ihtiyacın tek bir grafiğin filtrelenmesi olduğunu öğrendim; 30 dakikada bitecek bir işti, ikinci sıraya aldım. Kupon özelliği için ürün yöneticisine bir günlük gecikme olabileceğini sabahtan yazdım. Tüm sıralamayı ekip kanalında görünür şekilde paylaştım ve yöneticimin onayını aldım.',
            'Finans hatası öğlene kadar bulundu ve düzeltildi, sunum zamanında yapıldı, kupon özelliği yalnızca yarım gün gecikti.')
       + '<p>Etki ve aciliyet matrisi (Eisenhower) gibi bir çerçeveden bahsetmek iyidir, ama asıl önemli olan şeffaf iletişimdir.</p>',
     follow=['İki yöneticiden çelişkili öncelik gelirse ne yaparsın?', 'Sürekli acil iş geliyorsa bunu kök nedeniyle nasıl çözersin?'],
     flags=['"Hepsini aynı anda yaparım" demek', 'Önceliği yalnızca isteyen kişinin unvanına göre belirlemek', 'Ertelenen tarafı bilgilendirmemek'],
     tip='Önceliklendirme ölçütünü (etki ve gerçek son tarih) açıkça söyle; mülakatçı kararını değil karar verme yöntemini puanlar.'),

dict(roles=R, lv='ileri', topic='Teknik borç için ikna', kind=K,
     q='Ürün ekibini teknik borcu azaltmak için zaman ayırmaya ikna ettiğin bir durumu anlat.',
     a=star('Anadolu Market\'in sipariş modülünde testi olmayan, 2.000 satırlık bir fonksiyon vardı. Her değişiklikte yeni bir hata çıkıyordu, ama ürün ekibi yeni özelliklere odaklanmak istiyordu ve "refaktör" kelimesi toplantılarda olumsuz karşılanıyordu.',
            'Teknik borcu iş diliyle anlatıp yol haritasında yer açmak.',
            'Önce veri topladım: son altı ayda bu modülle ilgili 14 hata kaydı açılmış, düzeltmelerine toplam yaklaşık 22 geliştirici günü harcanmış ve iki hata kampanya döneminde siparişleri etkilemişti. Ayrıca yeni bir özelliğin bu modülde ortalama 2,5 kat daha uzun sürdüğünü gösterdim. Ürün yöneticisine "refaktör" yerine şunu önerdim: "Önümüzdeki iki sprintte kapasitenin %20\'sini bu modülün test kapsamına ve parçalanmasına ayıralım; karşılığında sonraki özellikler daha hızlı ve güvenli çıksın." İşi, yol haritasındaki sıradaki özellikle ilişkili parçalardan başlayacak şekilde planladım; böylece her adım bir iş çıktısıyla bağlantılıydı.',
            'Plan onaylandı. Üç ay içinde modülle ilgili hata kaydı sayısı ayda ortalama 2,3\'ten 0,5\'e düştü ve kupon özelliği tahminden hızlı teslim edildi. Teknik borç sonrasında çeyreklik planlamada düzenli bir kalem hâline geldi.')
       + '<p>Kıdemli rollerde mülakatçı teknik konuları iş etkisine çevirebilmeni bekler.</p>',
     follow=['Verilerin bu kadar net olmasaydı nasıl ikna ederdin?', 'Hangi teknik borcun hiç ödenmemesi gerektiğine nasıl karar verirsin?'],
     flags=['Ürün ekibini "teknik konudan anlamıyorlar" diye küçümsemek', 'Teknik borcu yalnızca kod estetiği olarak savunmak'],
     tip='Hikâyende en az iki sayısal veri (hata sayısı, harcanan gün) kullan ve teklifini zaman yüzdesiyle somutlaştır.'),

dict(roles=R, lv='ileri', topic='Mentorluk', kind=K,
     q='Daha az deneyimli bir ekip arkadaşına yardım ettiğin ya da mentorluk yaptığın bir durumu anlat.',
     a=star('Ekibimize yeni katılan bir yeni mezun, ilk ayında aldığı görevleri sürekli geciktiriyor ve toplantılarda soru sormuyordu. Bazı ekip üyeleri onu "yavaş" olarak görmeye başlamıştı.',
            'Ona destek olmak ve ekibe katkı verebilir hâle gelmesine yardım etmek; bu görevi ekip liderimle konuşarak üstlendim.',
            'Önce birebir bir kahve sohbeti yaptım ve zorlandığı noktaları sordum. Kod tabanının büyüklüğünden bunaldığını ve "basit bir şey sorarsam yetersiz görünürüm" diye çekindiğini anlattı. Haftada iki kez 30 dakikalık eşli programlama oturumları ayarladık. Ona görevleri küçük ve bitirilebilir parçalara bölmeyi gösterdim. Kod incelemelerinde yalnızca hata değil iyi yaptığı noktaları da yazdım. Sorularını herkese açık kanalda sormasını teşvik ettim ve sorduğunda ilk cevabı genellikle ben verdim ki sormak normalleşsin.',
            'İki ay sonra görevlerini zamanında teslim eder hâle geldi. Altıncı ayında üstlendiği bildirim servisini tek başına canlıya aldı. Bu süreçte ben de teknik bilgiyi aktarma ve geri bildirim verme konusunda çok şey öğrendim.')
       + '<p>Mentorluk hikâyesinde kişinin gelişimini ön plana koy; kendini kurtarıcı gibi anlatma.</p>',
     follow=['Mentorluk yaptığın kişi gelişim göstermeseydi ne yapardın?', 'Kendi işinle mentorluk arasında zamanı nasıl dengeledin?'],
     flags=['Mentörlük edilen kişiyi küçümseyen bir dil', 'Yalnızca "kodunu düzelttim" diye anlatmak'],
     tip='Kişinin sorununun kökünü (çekingenlik, bunalma) nasıl anladığını göster; bu, empati ve liderlik işaretidir.'),

dict(roles=R, lv='ileri', topic='Başarısız proje', kind=K,
     q='Başarısız olan ya da beklentiyi karşılamayan bir projeyi anlat. Geriye dönüp baktığında neyi farklı yapardın?',
     a=star('Kanat Havayolları\'nda rötar tahmini yapan bir servis geliştirdik. Altı ay çalıştık, model teknik olarak iyi sonuç veriyordu, ama operasyon ekibi aracı neredeyse hiç kullanmadı.',
            'Projenin teknik lideri olarak neden kullanılmadığını anlamak ve sonuç çıkarmak.',
            'Operasyon ekibinden beş kişiyle görüşmeler yaptım. Asıl sorunun modelde değil iş akışında olduğu ortaya çıktı: Tahminler ayrı bir web panelindeydi, oysa ekip gün boyu başka bir sistemde çalışıyordu. Ayrıca tahminin <i>neden</i> öyle olduğunu göremedikleri için güvenmiyorlardı. Bulguları yönetime dürüstçe sundum ve iki değişiklik önerdim: Tahminleri ekibin kullandığı sisteme bildirim olarak entegre etmek ve her tahminin yanında en etkili üç nedeni göstermek.',
            'İkinci sürümde kullanım oranı %10\'dan %65\'e çıktı. Kişisel çıkarımım şu: İlk haftadan itibaren son kullanıcıyı sürece dahil etmeli ve "çalışan model" ile "kullanılan ürün"ün farklı şeyler olduğunu unutmamalıydık. Artık her projede ilk ay içinde gerçek kullanıcıyla erken bir prototip denemesi yapıyorum.')
       + '<p>Başarısızlığı sahiplen, ama hikâyeyi öğrenme ve uygulamaya dönüştürmeyle bitir.</p>',
     follow=['Bu sorunu daha erken nasıl fark edebilirdiniz?', 'Projeyi tamamen durdurmayı hiç düşündünüz mü?'],
     flags=['Başarısızlığı tamamen başkalarına bağlamak', '"Hiç başarısız olmadım" demek', 'Ders çıkarma kısmını yüzeysel geçmek'],
     tip='"Neyi farklı yapardım" sorusuna somut ve hâlâ uyguladığın bir alışkanlıkla cevap ver.'),

dict(roles=R, lv='ileri', topic='Paydaşa hayır demek', kind=K,
     q='Bir paydaşın (satış, yönetim, müşteri) talebini reddetmek ya da ertelemek zorunda kaldığın bir durumu anlat.',
     a=star('Satış direktörümüz, büyük bir kurumsal müşteriyi kazanmak için iki hafta içinde müşteriye özel bir veri dışa aktarma özelliği sözü vermek istiyordu. Bu iş, ekibin o çeyrekteki en önemli hedefi olan ödeme altyapısı geçişini en az bir ay geciktirecekti.',
            'Satış ekibinin hedefini anlamak, ama ekibin önceliklerini ve sistemin güvenliğini koruyacak bir çözüm bulmak.',
            'Talebi doğrudan reddetmek yerine, müşterinin asıl ihtiyacını anlamak için satış ekibiyle birlikte müşteriyle kısa bir görüşme yaptık. İhtiyacın gerçek zamanlı entegrasyon değil, haftalık bir CSV raporu olduğu ortaya çıktı. Mevcut rapor altyapımızla bunu üç günde zamanlanmış bir görev olarak sunabileceğimizi gösterdim. Tam entegrasyonu ise ödeme geçişinden sonra yol haritasına almayı önerdim ve kararı ürün yöneticisiyle birlikte yazılı hâle getirdik.',
            'Müşteri sözleşmeyi imzaladı, ödeme geçişi planlandığı gibi tamamlandı. Satış direktörü sonraki büyük taleplerde ekibi sürece daha erken dahil etmeye başladı.')
       + '<p>"Hayır" demenin en iyi yolu çoğu zaman "şu anda bu şekilde değil, ama şunu yapabiliriz" demektir. Gerekçeyi iş önceliğiyle kur.</p>',
     follow=['Satış direktörü ısrar etseydi kararı kim verirdi?', 'Bu tür taleplerin tekrarlanmaması için ne önerirdin?'],
     flags=['Talebi gerekçesiz reddetmek', 'Her talebe evet deyip ekibi aşırı yüklemek', 'Kararı yazılı hâle getirmemek'],
     tip='Hikâyende reddedilen talebin arkasındaki asıl ihtiyacı nasıl bulduğunu göster; bu, paydaş yönetiminin özüdür.'),

dict(roles=R, lv='ileri', topic='Etik ikilem ve KVKK', kind=K,
     q='Senden etik açıdan rahatsız olduğun ya da kurallara aykırı olabilecek bir şey istendiğinde ne yaparsın? Bir örnek ver.',
     a=star('Bir pazarlama kampanyası için yönetici, kampanyalara izin vermemiş müşterilerin telefon numaralarını da içeren bir listeyi "acil" olarak dışa aktarmamı istedi.',
            'İşi engellemeden yasal ve etik çerçevede kalmak.',
            'Talebi hemen reddetmek yerine önce sakin bir şekilde gerekçemi açıkladım: İYS (İleti Yönetim Sistemi) kaydı ve KVKK kapsamında açık rızası olmayan kişilere ticari ileti göndermenin idari para cezasına ve marka itibarına zarar verebileceğini söyledim. Kararı tek başıma vermek yerine konuyu şirketin veri koruma sorumlusuna taşımayı önerdim ve e-postayla kayıt altına aldım. Bu arada izin vermiş müşterilerden oluşan listeyi aynı gün hazırladım; ayrıca uygulamada izin almayı kolaylaştıran bir bildirim akışı önerdim.',
            'Veri koruma sorumlusu yalnızca izinli listenin kullanılmasını onayladı ve kampanya zamanında çıktı. Sonraki ay izin oranı yeni akış sayesinde arttı. Yöneticim de bu tür talepler için önce hukuk ekibine danışma adımını sürece ekledi.')
       + '<p>Bu soruda dürüstlük, cesaret ve çözüm odaklılığı birlikte göstermek gerekir. "Söyleneni yaparım" cevabı ciddi bir kırmızı bayraktır.</p>',
     follow=['Veri koruma sorumlusu da talebi onaylasaydı ne yapardın?', 'Şirkette bu tür konular için hangi kanalları kullanırsın?'],
     flags=['"Yöneticim istediyse yaparım" demek', 'Konuyu kayıt altına almadan sessizce reddetmek', 'Alternatif bir çözüm önermemek'],
     tip='Hem kurala uyduğunu hem de işin yürümesi için alternatif ürettiğini göster; ikisi birlikte güçlü bir cevaptır.'),
]
