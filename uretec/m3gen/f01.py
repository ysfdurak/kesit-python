from lib import emit
I = []
I.append(dict(id='m-301', roles=['ai', 'backend'], lv='temel', topic='SDK ile mesaj isteği', kind='kavram',
q='Anthropic ve OpenAI Python SDK\'larıyla bir mesaj isteği nasıl kurulur? Sistem istemi nereye yazılır, yanıttan metin ve token kullanımı nasıl okunur?',
a='''
<p><b>Kısa cevap:</b> İki SDK da durumsuz bir HTTP API\'yi sarar. Her istekte model adı, mesaj listesi ve çıktı sınırı gönderilir; yanıt, metin blokları ile kullanım (usage) bilgisini taşıyan bir nesnedir.</p>
<p><b>Anthropic:</b> <code>client = anthropic.Anthropic()</code> anahtarı <code>ANTHROPIC_API_KEY</code> ortam değişkeninden okur. <code>client.messages.create(model=..., max_tokens=1024, system="...", messages=[{"role": "user", "content": "..."}])</code>. Sistem istemi <b>ayrı bir parametredir</b>, <code>max_tokens</code> zorunludur. <code>resp.content</code> bir <b>blok listesidir</b>; metin, <code>type == "text"</code> olan blokların <code>.text</code> alanındadır. Ayrıca <code>resp.stop_reason</code> ve <code>resp.usage.input_tokens</code> / <code>output_tokens</code> okunur.</p>
<p><b>OpenAI (Chat Completions):</b> Sistem istemi listenin başına <code>{"role": "system", ...}</code> mesajı olarak eklenir. Metin <code>resp.choices[0].message.content</code>, kullanım ise <code>resp.usage.prompt_tokens</code> / <code>completion_tokens</code> alanlarındadır. Yeni Responses API\'de <code>instructions=</code> ve <code>resp.output_text</code> kullanılır.</p>
<p><b>Sık hata:</b> Yanıtı her zaman tek bir string sanmak, usage bilgisini kaydetmemek (maliyet izlenemez), istemciyi her istekte yeniden oluşturmak, anahtarı koda gömmek.</p>
''',
follow=['max_tokens ile bağlam penceresi arasındaki fark nedir?', 'Aynı kodu iki sağlayıcıyla çalıştırmak için nasıl bir soyutlama katmanı yazarsın?', 'stop_reason hangi değerleri alabilir, her birinde ne yaparsın?'],
flags=['Sistem istemini Anthropic\'te messages listesine "system" rolüyle koymaya çalışmak', 'Yanıt içeriğini her zaman tek bir string sanmak', 'Token kullanımını hiç kaydetmemek'],
tip='İki SDK\'yı ayrı ayrı ezberlemek yerine ortak modeli anlat: istek = model + mesajlar + sınır, yanıt = içerik blokları + durma nedeni + kullanım.'))

I.append(dict(id='m-302', roles=['ai', 'backend'], lv='temel', topic='Sohbet geçmişini taşıma', kind='kod-okuma', c=True,
q='Sahte bir LLM istemcisiyle iki kez sohbet ediliyor. İlk iki satırda model neden adı bilmiyor? Son satırdaki liste neyi gösteriyor?',
a='''
<p><b>Kısa cevap:</b> LLM API\'leri <b>durumsuzdur</b>: model, yalnızca o istekte gönderilen mesajları görür. Önceki konuşmayı sunucu hatırlamaz; geçmişi taşımak uygulamanın işidir.</p>
<p><b>İlk bölüm:</b> Her çağrıya tek bir mesaj gidiyor. İkinci çağrıda "adım Elif" bilgisi listede olmadığı için cevap <b>Adınızı bilmiyorum.</b> oluyor.</p>
<p><b>İkinci bölüm:</b> Her soru ve her cevap <code>gecmis</code> listesine eklenip listenin tamamı gönderiliyor. Böylece ikinci çağrı ilk mesajı da görüyor ve <b>Adınız Elif.</b> diyor. Son satır, 4 mesajın <code>user</code> / <code>assistant</code> diye sırayla dizildiğini gösteriyor. Anthropic API, ilk mesajın <code>user</code> olmasını bekler. Rollerin bu düzende ilerlemesi de doğal yapıdır.</p>
<p><b>Sonuçları:</b> Geçmiş büyüdükçe her istekte gönderilen token sayısı da büyür. Uzun sohbetlerde kırpma ya da özetleme gerekir. Çok kullanıcılı bir serviste geçmiş, oturum kimliğiyle Redis veya bir veritabanında tutulur. Geçmişi global bir listede tutmak kullanıcıları birbirine karıştırır.</p>
<p><b>Sık hata:</b> Asistan cevabını geçmişe eklemeyi unutmak. Model kendi önceki cevabını göremediği için tutarsızlaşır.</p>
''',
follow=['Geçmiş bağlam penceresine sığmazsa ne yaparsın?', 'Çok kullanıcılı bir FastAPI servisinde geçmişi nerede saklarsın?'],
flags=['"Model önceki konuşmayı sunucuda hatırlıyor" demek', 'Geçmişi modül düzeyinde tek bir global listede tutmayı önermek'],
tip='"API durumsuzdur" cümlesiyle başla. Maliyet ve bağlam sınırı da bu tek gerçekten doğar.'))

I.append(dict(id='m-303', roles=['ai', 'backend'], lv='orta', topic='Akışlı (streaming) yanıt', kind='kod-okuma', c=True,
q='Bir LLM akışının olayları sahte bir üreteçle taklit ediliyor. Kod üç satırda ne basar? Gerçek SDK\'da bu döngü nasıl yazılır?',
a='''
<p><b>Kısa cevap:</b> Akışta yanıt tek parça gelmez; sunucu SSE ile olaylar gönderir. Metin parçaları <code>content_block_delta</code> olaylarında, durma nedeni ve çıktı token sayısı ise sondaki <code>message_delta</code> olayında gelir.</p>
<p><b>Çıktı:</b> İlk satırda her parça geldiği anda <code>|</code> ile ayrılarak yazılır: <code>İade |süresi |14 |gündür.|</code>. <code>flush=True</code>, tamponda beklemeden ekrana basmayı sağlar. İkinci satır, parçaların birleştirilmiş hâlidir. Üçüncü satır <code>end_turn 42 9</code>: girdi token sayısı başta <code>message_start</code> ile, çıktı sayısı sonda gelir.</p>
<p><b>Gerçek SDK (Anthropic):</b> <code>with client.messages.stream(...) as s:</code> bloğunda <code>for t in s.text_stream: print(t, end="", flush=True)</code> yazılır, ardından <code>s.get_final_message()</code> ile usage ve stop_reason alınır. Olayları tek tek işlemek de mümkündür. OpenAI\'de <code>stream=True</code> verilir ve <code>chunk.choices[0].delta.content</code> okunur.</p>
<p><b>Neden önemli:</b> Toplam süre değişmez ama ilk token\'a kadar geçen süre (TTFT) kısalır, kullanıcı beklemez. Uzun çıktılarda zaman aşımı riski de azalır.</p>
<p><b>Sık hata:</b> Parçaları ekrana yazıp biriktirmemek. Akış bittiğinde loglanacak ya da doğrulanacak tam metin elde kalmaz.</p>
''',
follow=['Akış ortasında bağlantı koparsa ne yaparsın?', 'Akışlı yanıtta JSON çıktısını nasıl doğrularsın?', 'FastAPI\'de bu akışı tarayıcıya nasıl iletirsin?'],
flags=['Akışın toplam süreyi kısalttığını söylemek', 'Kullanım (usage) bilgisinin akışta hiç gelmediğini düşünmek'],
tip='TTFT kavramını adıyla söyle; akışın kullanıcı deneyimi için yapıldığını vurgula.'))

I.append(dict(id='m-304', roles=['ai'], lv='orta', topic='Araç çağırma döngüsü', kind='kod-okuma', c=True,
q='Sahte bir modelle araç çağırma (tool use) döngüsü yazılmış. Model kaç kez çağrılır, mesaj listesi nasıl biter? Döngünün kritik ayrıntıları neler?',
a='''
<p><b>Kısa cevap:</b> Model aracı kendisi çalıştırmaz. <code>stop_reason == "tool_use"</code> ile döner ve hangi aracı hangi girdiyle istediğini söyler. Aracı Python kodun çalıştırır, sonucu <code>tool_result</code> olarak geri gönderir ve model son cevabı yazar.</p>
<p><b>Çıktı:</b> Model <b>2</b> kez çağrılır, listede <b>4</b> mesaj vardır: kullanıcı sorusu, asistanın iki <code>tool_use</code> bloğu içeren cevabı, iki <code>tool_result</code> taşıyan <code>user</code> mesajı ve son metin. Model iki aracı aynı turda istedi; ikisinin sonucu <b>tek</b> kullanıcı mesajında döndü.</p>
<p><b>Kritik ayrıntılar:</b></p>
<ul><li>Asistanın <code>tool_use</code> içeren cevabı geçmişe <b>olduğu gibi</b> eklenir. Eklenmezse API, eşleşmeyen <code>tool_result</code> için hata verir.</li>
<li>Her sonuç doğru <code>tool_use_id</code> ile eşlenir.</li>
<li>Araç hata verirse istisna yutulmaz; sonuç <code>is_error: True</code> ile modele bildirilir, model düzeltmeyi deneyebilir.</li>
<li>Döngüye bir adım sınırı konur, aksi hâlde sonsuza dek dönebilir.</li></ul>
<p><b>Sık hata:</b> Model istedi diye <code>ARACLAR[blok["name"]]</code> ile her fonksiyonu körü körüne çalıştırmak. İzin listesi ve argüman doğrulaması gerekir.</p>
''',
follow=['Bağımsız araç çağrılarını asyncio ile nasıl paralel çalıştırırsın?', 'Araç sonucu çok uzunsa (ör. 50 sayfa) ne yaparsın?', 'tool_choice parametresi ne işe yarar?'],
flags=['Modelin aracı kendisinin çalıştırdığını sanmak', 'tool_result\'ı assistant rolüyle göndermek', 'Döngüye adım sınırı koymamak'],
tip='Döngüyü tahtaya dört mesaj olarak çiz: user, assistant(tool_use), user(tool_result), assistant(metin).'))

I.append(dict(id='m-305', roles=['ai', 'backend'], lv='ileri', topic='Araç izin listesi ve doğrulama', kind='kod-okuma', c=True,
q='Bir müşteri asistanının araç yürütücüsü izin listesi ve pydantic şemalarıyla korunuyor. Beş çağrının sonuçlarını açıkla. Bu tasarım hangi riskleri kapatıyor?',
a='''
<p><b>Kısa cevap:</b> Modelin ürettiği araç adı ve argümanlar <b>güvenilmeyen girdidir</b>. Yürütücü önce adı izin listesinde arar, sonra argümanları şemayla doğrular. Yan etkili araçlarda ayrıca insan onayı ister.</p>
<p><b>Satır satır:</b></p>
<ul><li>1: <code>stok_sorgula</code> izinli ve geçerli, sonuç döner.</li>
<li>2: <code>dosya_sil</code> listede yok, çalıştırılmaz. İstem enjeksiyonuyla istenen bir araç da böyle durur.</li>
<li>3: <code>SP-12</code> desene uymaz, <code>99999</code> üst sınırı aşar. pydantic <b>iki hatayı birlikte</b> raporlar.</li>
<li>4: Argümanlar geçerli. <code>"250"</code> lax modda float\'a çevrilir, ama iade yan etkili olduğu için onay olmadan çalışmaz.</li>
<li>5: Onaylı çağrı başarılı olur.</li></ul>
<p><b>Neden önemli:</b> Hatalar istisna olarak fırlatılmaz, <code>is_error: True</code> ile <code>tool_result</code> olarak modele döner. Model hangi alanın yanlış olduğunu görür ve düzeltebilir. Tutar sınırı gibi iş kuralları istemde değil <b>kodda</b> durur; model ikna edilse bile kod izin vermez. Ek önlemler: araç başına yetki kapsamı, oturumdaki kullanıcının kimliğiyle sorgulama (ör. yalnız kendi siparişleri), her çağrının denetim için loglanması.</p>
<p><b>Sık hata:</b> <code>getattr(modul, ad)(**girdi)</code> ile modelin istediği her fonksiyonu çağırmak.</p>
''',
follow=['Model başka bir müşterinin sipariş numarasını isterse ne olur?', 'Araç şemasını pydantic modelinden nasıl üretirsin?', 'İnsan onayı adımını web arayüzünde nasıl tasarlarsın?'],
flags=['Güvenliği yalnız sistem istemine yazılan kurallarla sağlamaya çalışmak', 'Doğrulama hatasında istisnayı yutup modele bilgi vermemek'],
tip='"İş kuralı istemde değil kodda" cümlesi bu sorunun özüdür.'))

I.append(dict(id='m-306', roles=['ai'], lv='orta', topic='pydantic ile LLM çıktısı doğrulama', kind='kod-okuma', c=True,
q='Bir destek talebi sınıflandırıcısının üç ham LLM yanıtı pydantic ile doğrulanıyor. Hangi satırlar geçer, hangisi neden düşer?',
a='''
<p><b>Kısa cevap:</b> LLM\'in "JSON ver" talimatına uyduğunu varsaymak yerine çıktı bir şemaya karşı doğrulanır. pydantic hem türü hem iş kuralını denetler ve hatalı alanları tek tek listeler.</p>
<p><b>1. yanıt:</b> Model JSON\'u açıklama metni ve kod çiti içine koymuş. <code>json_ayikla</code> ilk <code>{</code> ile son <code>}</code> arasını alır, doğrulama geçer: <b>OK kargo 2</b>.</p>
<p><b>2. yanıt:</b> <code>"Kargo"</code> büyük harfle yazıldığı için <code>Literal</code> değerlerinden biri değil. <code>5</code> ise doğrulayıcıdaki 1–3 aralığının dışında. İki hata birlikte gelir: <b>HATA [\'kategori\', \'oncelik\']</b>.</p>
<p><b>3. yanıt:</b> <code>"1"</code> string olsa da pydantic\'in varsayılan lax modu onu int\'e çevirir: <b>OK iade 1</b>. Bunu istemiyorsan <code>model_config = ConfigDict(strict=True)</code> kullanılır.</p>
<p><b>Üretimde akış:</b> Doğrulama hatası olursa <code>e.errors()</code> özetlenip modele "şu alanlar geçersiz, düzelt" diye bir kez daha sorulur, deneme sayısı sınırlanır. Mümkünse sağlayıcının yapılandırılmış çıktı özelliği ya da araç şeması ile zorunlu JSON kullanılır. Bu özellik biçimi garanti etse de iş kurallarını (aralık, tutarlılık) yine pydantic denetler.</p>
<p><b>Sık hata:</b> <code>json.loads</code> geçince işin bittiğini sanmak.</p>
''',
follow=['Doğrulama hatasını modele geri besleyen döngüyü nasıl yazarsın?', 'Regex ile JSON ayıklamanın hangi durumlarda başarısız olur?', 'Literal yerine Enum kullanmanın farkı nedir?'],
flags=['Geçerli JSON\'u geçerli veri saymak', 'Lax modun string sayıları dönüştürdüğünü bilmemek', 'Sonsuz düzeltme döngüsü kurmak'],
tip='"Biçim" ile "anlam" doğrulamasını ayırarak anlat; mülakatçı bu ayrımı arar.'))

I.append(dict(id='m-307', roles=['ai', 'backend'], lv='orta', topic='LLM çağrısında üstel geri çekilme', kind='kod-okuma', c=True,
q='Bir LLM çağrısı için yeniden deneme fonksiyonu yazılmış. Üç senaryoda bekleme listeleri neden böyle çıkıyor? Hangi hatalar yeniden denenmeli?',
a='''
<p><b>Kısa cevap:</b> Yalnız <b>geçici</b> hatalar yeniden denenir: 408 zaman aşımı, 429 hız sınırı, 5xx sunucu hataları ve Anthropic\'in aşırı yük kodu 529. 400, 401 ve 403 gibi istemci hataları yeniden denemeyle düzelmez.</p>
<p><b>Aşırı yük:</b> Üç hata gelir, her birinde bekleme <code>uniform(0, min(20, 2**i))</code> ile seçilir: tavanlar 1, 2 ve 4 saniye, çıkan değerler <code>[0.32, 0.3, 2.6]</code>. Bu "tam jitter"dır. Binlerce istemci aynı anda hata alıp aynı anda yeniden denerse sunucu yeniden çöker. Rastgelelik denemeleri zamana yayar. Dördüncü denemede yanıt gelir.</p>
<p><b>Hız sınırı:</b> Sunucu <code>Retry-After: 3</code> başlığı gönderdi; tahmin yerine bu değer kullanılır: <code>[3.0]</code>.</p>
<p><b>Kötü istek:</b> 400 hemen fırlatılır, bekleme listesi boştur.</p>
<p><b>Tasarım notları:</b> <code>uyu</code> ve <code>rng</code> dışarıdan verildiği için test anında gerçekten beklemez ve sonuç tekrarlanabilir. Gerçek SDK\'lar zaten <code>max_retries</code> ile yeniden dener (Anthropic ve OpenAI\'de varsayılan 2). Kendi katmanını ekleyeceksen SDK\'nınkiyle çarpışmamasına dikkat et, yoksa 3 × 3 = 9 deneme olur. Yan etkili isteklerde (ör. ödeme) idempotency anahtarı gerekir.</p>
<p><b>Sık hata:</b> Her istisnada yeniden denemek ya da sabit 1 saniye beklemek.</p>
''',
follow=['tenacity kütüphanesiyle aynı politikayı nasıl yazarsın?', 'Toplam süre bütçesi (deadline) nasıl eklenir?', 'Akışlı bir yanıt ortada koparsa yeniden denemek güvenli midir?'],
flags=['400 hatasını da yeniden denemek', 'Jitter\'ın neden gerektiğini açıklayamamak', 'Retry-After başlığını yok saymak'],
tip='"Hangi hatalar?" ve "ne kadar beklerim?" sorularını ayrı ayrı cevapla; ikisi de puan getirir.'))

I.append(dict(id='m-308', roles=['ai', 'muhendis'], lv='ileri', topic='Hız sınırı altında toplu iş planlama', kind='tasarim',
q='Saatte 60.000 ürün yorumunu bir LLM ile sınıflandıracaksın. Hesabın limiti dakikada 1.000 istek ve dakikada 400.000 girdi token\'ı. Her istek ortalama 900 girdi token\'ı. Python tarafında bu işi nasıl planlarsın?',
a='''
<p><b>Kısa cevap:</b> Önce hangi limitin bağlayıcı olduğunu hesapla, sonra istemci tarafında hem istek hem token bütçesi uygulayan bir asyncio sınırlayıcı kur. 429 gelince sunucunun dediği kadar bekle.</p>
<p><b>Hesap:</b> Saatte 60.000 istek dakikada 1.000 eder, yani istek limitinin tam sınırındayız. Token tarafı: 1.000 × 900 = dakikada 900.000 token gerekir, limit 400.000. <b>Bağlayıcı limit token\'dır</b>: dakikada en fazla yaklaşık 444 istek, saatte yaklaşık 26.600 yorum. Hedef bu hâliyle tutmaz.</p>
<p><b>Seçenekler:</b></p>
<ul><li><b>Girdiyi küçült:</b> Uzun sistem istemi her istekte tekrar ediyorsa istem önbelleği ya da daha kısa istem kullan.</li>
<li><b>Toplu gönder:</b> Bir istekte 20 yorumu numaralı liste olarak sınıflandır. Sabit istem 20\'ye bölünür, istek sayısı da düşer.</li>
<li><b>Batch API:</b> Sonuç anında gerekmiyorsa sağlayıcının toplu iş API\'si genelde daha ucuzdur ve ayrı limitlerle çalışır.</li>
<li><b>Limit artırımı</b> iste.</li></ul>
<p><b>Python iskeleti:</b> <code>asyncio.Semaphore</code> eşzamanlı istek sayısını sınırlar. Dakikalık token için bir token kovası kullanılır: her istekten önce <code>await kova.al(tahmini_token)</code>. Sonuçlar JSONL\'e yazılır ve kaldığı yerden devam edilebilir. Yanıt başlıklarındaki kalan limit bilgisi izlenir; 429\'da <code>retry-after</code> beklenir.</p>
<p><b>Sık hata:</b> Yalnız istek sayısına bakıp token limitini unutmak.</p>
''',
follow=['Token kovasını asyncio ile nasıl yazarsın?', 'Yorumları 20\'li toplayınca hangi kalite riskleri doğar?', 'Çıktı token limiti de varsa hesap nasıl değişir?'],
flags=['Bağlayıcı limiti hesaplamadan "paralel çalıştırırım" demek', 'Sınırsız asyncio.gather ile 60.000 görevi aynı anda başlatmak'],
tip='Önce hesabı yüksek sesle yap; "bağlayıcı limit token" tespiti cevabın en değerli cümlesidir.'))

I.append(dict(id='m-309', roles=['ai', 'analist'], lv='orta', topic='Çok turlu sohbette token birikimi', kind='kod-okuma', c=True,
q='Bir sohbet botunun maliyeti tur sayısına göre hesaplanıyor (fiyatlar kurgusal). 40 turluk sohbet neden 1 turluğun 40 katından çok daha pahalı?',
a='''
<p><b>Kısa cevap:</b> API durumsuz olduğu için her turda sistem istemi ve <b>tüm geçmiş</b> yeniden gönderilir. Girdi token\'ı tur sayısıyla doğrusal değil, yaklaşık <b>karesel</b> büyür.</p>
<p><b>Çıktı:</b> 1 tur: 860 girdi, 200 çıktı, 0.0056 $. 10 tur: girdi 20.300 olur; tek turun 10 katı 8.600 olurdu. 40 tur: 237.200 girdi token\'ı, maliyet 0.8316 $; tek turun yaklaşık <b>148 katı</b>. Çıktı token\'ı ise doğrusal kalır (40 × 200 = 8.000).</p>
<p><b>Formül:</b> n. turda giden girdi = sistem + (n−1) × (soru + cevap) + soru. Toplam, n² ile büyüyen bir terim içerir: 260 × n(n−1)/2.</p>
<p><b>Ne yapılır?</b></p>
<ul><li>Sabit önek (sistem istemi, eski turlar) için <b>istem önbelleği</b>: tekrar okunan kısım çok daha ucuza faturalanır.</li>
<li>Geçmişi kayan pencereyle kırpmak ya da eski turları kısa bir özetle değiştirmek.</li>
<li>Araç çıktıları gibi büyük blokları, işi bitince kısaltılmış hâlleriyle değiştirmek.</li>
<li>Gerçek kullanımı <code>resp.usage</code> alanından loglayıp oturum başına maliyet panosu kurmak.</li></ul>
<p><b>Sık hata:</b> Maliyeti "mesaj sayısı × ortalama mesaj uzunluğu" diye tahmin etmek.</p>
''',
follow=['Geçmişi özetlemenin kaliteye etkisi ne olur?', 'Oturum başına maliyet tavanı nasıl uygulanır?'],
flags=['Maliyetin tur sayısıyla doğrusal arttığını söylemek', 'Sistem isteminin her turda yeniden faturalandığını bilmemek'],
tip='"n² ile büyür" demek ve küçük bir sayısal örnek vermek bu soruda yeterince ikna edicidir.'))

I.append(dict(id='m-310', roles=['ai', 'backend'], lv='orta', topic='Semaphore ile paralel LLM çağrıları', kind='kod-okuma', c=True,
q='10 LLM çağrısı asyncio.gather ile paralel çalıştırılıyor; ilk denemede Semaphore(3), ikincide Semaphore(100) var. İki satırı yorumla.',
a='''
<p><b>Kısa cevap:</b> <code>asyncio.gather</code> verilen tüm görevleri aynı anda başlatır. <code>Semaphore(n)</code> ise aynı anda en fazla n çağrının "içeride" olmasını sağlar. Sonuç listesi <b>tamamlanma sırasına göre değil, veriliş sırasına göre</b> döner.</p>
<p><b>1. satır:</b> Süreler farklı olsa da sonuçlar <code>özet-0, özet-1, özet-2</code> diye sırayla gelir, toplam 10 sonuç vardır. Eşzamanlı çağrı sayısı en fazla <b>3</b> olur.</p>
<p><b>2. satır:</b> Limit 100 olunca sınır fiilen kalkar; 10 çağrının <b>10</b>\'u birden çalışır. 10.000 belgede bu, 10.000 eşzamanlı HTTP isteği demektir: 429 hataları, bağlantı havuzunun tükenmesi ve bellek baskısı.</p>
<p><b>Ayrıntılar:</b></p>
<ul><li>Semaphore <code>main</code> içinde, çalışan olay döngüsünde oluşturulmuştur. Modül düzeyinde oluşturmak eski sürümlerde farklı döngüye bağlanma hatası verebilir.</li>
<li>Gerçekte <code>AsyncAnthropic</code> / <code>AsyncOpenAI</code> istemcisi bir kez oluşturulur ve paylaşılır.</li>
<li>Çok sayıda görevde tümünü <code>gather</code> ile aynı anda oluşturmak yerine sabit sayıda işçi ve <code>asyncio.Queue</code> belleği korur.</li>
<li>İş CPU değil ağ beklemesi olduğu için thread havuzu da çalışır; asyncio binlerce bekleyen çağrıda daha hafiftir.</li></ul>
<p><b>Sık hata:</b> Senkron istemciyi <code>async def</code> içinde çağırıp paralellik beklemek. Olay döngüsü bloklanır, çağrılar sıralı çalışır.</p>
''',
follow=['Semaphore yerine sabit sayıda işçi ve Queue ile nasıl yazarsın?', 'Sonuçları tamamlandıkça işlemek için ne kullanırsın?', 'Hız sınırı token cinsindense Semaphore yeterli mi?'],
flags=['gather sonuçlarının bitiş sırasına göre döndüğünü söylemek', 'Eşzamanlılığı sınırlamadan binlerce çağrı başlatmak'],
tip='as_completed ile gather farkını takip sorusu olarak bekle; ikisinin sıra davranışını önceden hazırla.'))

I.append(dict(id='m-311', roles=['ai', 'backend'], lv='orta', topic='Toplu çağrılarda kısmi hata', kind='kod-okuma', c=True,
q='Beş belge paralel özetleniyor; ikisi hata veriyor. İlk gather ile return_exceptions=True kullanan ikinci gather arasındaki farkı çıktı üzerinden açıkla.',
a='''
<p><b>Kısa cevap:</b> Varsayılan <code>gather</code>, ilk istisnayı hemen yukarı fırlatır ve diğer sonuçlara ulaşamazsın. <code>return_exceptions=True</code> ise istisnaları da sonuç listesine <b>değer olarak</b> koyar. Kısmi başarıyı işleyebilirsin.</p>
<p><b>Çıktı:</b> İlk denemede <code>HizSiniri</code> yakalanır, 3 başarılı özet kaybolur. İkinci denemede liste sırası korunur. Başarılılar <code>b1, b2, b4</code>, hatalılar <code>b3: HizSiniri</code> ve <code>b5: ValueError</code> olarak ayrılır.</p>
<p><b>Dikkat edilecekler:</b></p>
<ul><li>İlk <code>gather</code> düştüğünde diğer görevler <b>iptal edilmez</b>, arka planda çalışmaya devam eder. Python 3.11\'in <code>asyncio.TaskGroup</code> yapısı ise bir hata olunca kalanları iptal eder ve hataları <code>ExceptionGroup</code> olarak toplar. Hangisinin seçileceği işin doğasına bağlıdır: hepsi ya da hiçbiri mi, en iyi çaba mı?</li>
<li>Hatalar türüne göre ayrılmalı: <code>HizSiniri</code> geçicidir, kuyruğa geri koyup yeniden denenir. <code>ValueError</code> (boş belge) kalıcıdır, yeniden denemek boşunadır; ayrı bir hata dosyasına yazılır.</li>
<li><code>isinstance(s, BaseException)</code> kontrolü önemlidir; sonuç listesinde istisna nesneleri sıradan değerlerle karışık durur.</li></ul>
<p><b>Sık hata:</b> <code>return_exceptions=True</code> verip listeyi kontrol etmeden kullanmak. Hata nesneleri sessizce "özet" diye veritabanına yazılır.</p>
''',
follow=['Aynı işi TaskGroup ile yazarsan çıktı nasıl değişir?', 'Kalıcı ve geçici hataları kodda nasıl sınıflandırırsın?'],
flags=['gather bir hata fırlatınca diğer görevlerin otomatik iptal edildiğini sanmak', 'return_exceptions sonrası listeyi denetlememek'],
tip='"En iyi çaba mı, hep ya da hiç mi?" sorusunu sen sor; seçim gerekçesi teknik ayrıntıdan daha çok puan getirir.'))
emit('mulakat_m3_01.js', I)
