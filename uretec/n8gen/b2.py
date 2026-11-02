import sys
sys.path.insert(0, '.')
from lib import py, pcode, emit
from core1 import TR
import importlib, ex2
importlib.reload(ex2)
E = ex2.E

body = r'''
<h2>Neden kendi makinende model çalıştırasın?</h2>
<p><code>llm-api</code> dersinde bulut sağlayıcılarının API'lerini kullandın ve dersin sonundaki "Derinleş" bölümünde Ollama'nın OpenAI uyumlu uç noktasını gördün. Bu derste bir adım geri çekilip açık modellerin dünyasına giriyorsun: <b>Hugging Face</b> ekosistemi, tokenizer'ın aslında ne yaptığı, bir modelin hangi donanıma sığacağı, <b>nicemleme</b> (quantization) ile modelin nasıl küçüldüğü, <b>LoRA</b> ile ince ayarın nasıl ucuzladığı ve en önemlisi: her işe LLM gerekmediği.</p>
<p>Yerel ya da kendi sunucunda model çalıştırmanın üç tipik nedeni vardır: <b>veri</b> (müşteri yorumları, sağlık ya da İK kayıtları kurum dışına çıkmasın; KVKK), <b>maliyet</b> (milyonlarca kısa sınıflandırma çağrısında token faturası büyür) ve <b>bağımsızlık</b> (çevrim dışı çalışma, sağlayıcı değişikliğinden etkilenmeme). Bedeli ise işletmedir: GPU, bellek, güncelleme ve ölçekleme senin işin olur.</p>
<p>Senaryo: <b>Lezzet Kurye</b> müşteri yorumlarını (gerçek <code>lk_ratings</code> tablosu) olumlu, nötr, olumsuz diye sınıflandırmak istiyor ve yorumların dışarı gönderilmesini istemiyor. Elimizde üç seçenek var: klasik makine öğrenmesi, küçük bir yerel model, bulut LLM'i.</p>

<h2>1. Hugging Face ekosistemi</h2>
<div class="tbl-wrap"><table>
<tr><th>Parça</th><th>Ne işe yarar?</th><th>Kurulum</th></tr>
<tr><td>Hub (huggingface.co)</td><td>Model, veri seti ve demo deposu; her modelin bir <b>model kartı</b> (lisans, eğitim verisi, sınırlılıklar) vardır</td><td>Tarayıcı</td></tr>
<tr><td><code>transformers</code></td><td>Modeli indirip çalıştırma: <code>pipeline</code>, <code>AutoTokenizer</code>, <code>AutoModel...</code></td><td><code>pip install transformers torch</code></td></tr>
<tr><td><code>sentence-transformers</code></td><td>Cümle embedding'leri ve çapraz kodlayıcılar</td><td><code>pip install sentence-transformers</code></td></tr>
<tr><td><code>datasets</code>, <code>peft</code>, <code>accelerate</code></td><td>Veri yükleme, LoRA ile ince ayar, çoklu GPU</td><td><code>pip install datasets peft accelerate</code></td></tr>
</table></div>
<p><code>pipeline</code> en hızlı başlangıçtır: görev adını ve model kimliğini verirsin; tokenizer, model ve son işlem hazır gelir. İlk çalıştırmada model indirilir ve önbelleğe (<code>~/.cache/huggingface</code>) alınır.</p>
''' + pcode(r'''# pip install transformers torch sentencepiece      (Kendi bilgisayarında dene)
from transformers import pipeline

duygu = pipeline("sentiment-analysis", model="savasy/bert-base-turkish-sentiment-cased")
print(duygu(["Yemek sıcacık geldi, çok lezzetliydi", "Sipariş yanlış geldi"]))
# [{'label': 'positive', 'score': 0.99...}, {'label': 'negative', 'score': 0.98...}]

ner = pipeline("ner", model="savasy/bert-base-turkish-ner-cased", aggregation_strategy="simple")
print(ner("Kadıköy'deki Köşe Dönercisi siparişimi Oğuz Güneş getirdi."))
# [{'entity_group': 'LOC', 'word': 'Kadıköy', 'start': 0, 'end': 7, 'score': ...}, ...]

ozet = pipeline("summarization", model="csebuetnlp/mT5_multilingual_XLSum")
print(ozet(uzun_metin, max_length=60, min_length=15)[0]["summary_text"])''') + r'''
<div class="warn"><b>Model kimliklerini körü körüne kopyalama</b>Hub'daki modeller silinebilir, adı değişebilir ya da lisansı güncellenebilir. Kullanmadan önce model kartını oku: hangi dillerde eğitildi, lisansı ne, hangi veriyle değerlendirildi? Kurumsal projede model kimliğini ve <code>revision</code> (commit) değerini sabitle.</div>

<h2>2. Tokenizer: model metni nasıl görür?</h2>
<p>Model harfleri ya da kelimeleri değil <b>token</b>'ları görür. Modern tokenizer'lar alt kelime (subword) birimleri kullanır: sık kelimeler tek token, nadir kelimeler birkaç parça olur. En yaygın algoritma <b>BPE</b> (Byte Pair Encoding): harflerden başla, en sık yan yana gelen ikiliyi birleştir, tekrarla. Aşağıda gerçek Lezzet Kurye yorumlarından 30 birleşimlik oyuncak bir BPE öğreniyoruz:</p>
''' + py(E[0]) + r'''
<p>Öğrenilen birleşimlerle yeni kelimeleri tokenlara bölelim. Sık görülen "geldi" tek token, hiç görülmemiş "sıcacıktı" neredeyse harf harf bölünür:</p>
''' + py(E[1]) + r'''
<p>Bunun pratik sonuçları önemlidir: Türkçe gibi eklemeli dillerde, ağırlıklı İngilizce metinle eğitilmiş tokenizer'lar aynı anlamı daha <b>çok tokenla</b> ifade eder. Bu da daha yüksek maliyet, daha çabuk dolan bağlam penceresi ve bazen daha düşük kalite demektir. Model seçerken Türkçe metninle token sayısını ölç:</p>
''' + pcode(r'''from transformers import AutoTokenizer          # Kendi bilgisayarında dene
for ad in ["dbmdz/bert-base-turkish-cased", "bert-base-uncased"]:
    tok = AutoTokenizer.from_pretrained(ad)
    parcalar = tok.tokenize("Siparişlerinizden memnun kalmadık")
    print(ad, len(parcalar), parcalar)
# Türkçe için eğitilmiş tokenizer aynı cümleyi belirgin biçimde daha az parçaya böler.''') + r'''

<h2>3. Ollama ve llama.cpp ile yerel LLM</h2>
<p>Sohbet modelleri için en pratik yol <b>Ollama</b>'dır: modeli indirir, nicemlenmiş hâlde çalıştırır ve yerelde bir HTTP sunucusu açar. Altında <b>llama.cpp</b> vardır: modelleri tek bir <b>GGUF</b> dosyası olarak CPU ya da GPU'da çalıştıran C/C++ çıkarım motoru. OpenAI uyumlu uç noktayı <code>llm-api</code> dersinde gördün; burada Ollama'nın kendi API'si ve llama.cpp'nin Python bağlayıcısı:</p>
''' + pcode(r'''# Terminal (Kendi bilgisayarında dene):
#   ollama pull qwen2.5:7b          # ~4.7 GB, 4 bit nicemlenmiş
#   ollama run qwen2.5:7b "Merhaba"
#   ollama list                     # indirilen modeller
import requests

yanit = requests.post("http://localhost:11434/api/chat", json={
    "model": "qwen2.5:7b",
    "messages": [{"role": "system", "content": "Yorumu olumlu, notr ya da olumsuz diye etiketle. Yalnız etiketi yaz."},
                 {"role": "user", "content": "Biraz geç geldi ama lezzetli"}],
    "stream": False,
    "options": {"temperature": 0},
}, timeout=60)
print(yanit.json()["message"]["content"])

# pip install llama-cpp-python      (GGUF dosyasını doğrudan yükler)
from llama_cpp import Llama
llm = Llama(model_path="modeller/qwen2.5-7b-instruct-q4_k_m.gguf", n_ctx=4096, n_gpu_layers=-1)
print(llm.create_chat_completion(messages=[{"role": "user", "content": "Merhaba"}])["choices"][0]["message"]["content"])''') + r'''
<p>Dosya adındaki <code>q4_k_m</code> nicemleme türünü söyler: yaklaşık 4 bit, gruplu ölçekler. Birazdan bunun ne demek olduğunu numpy ile göreceksin.</p>

<h2>4. sentence-transformers: yerel embedding</h2>
<p><code>embedding-vektor-arama</code> ve <code>rag-uygulamasi</code> derslerinde sahte embedding kullandın. Kendi bilgisayarında gerçeğine geçmek tek satırdır; çok dilli küçük modeller CPU'da da hızlıdır ve veri dışarı çıkmaz:</p>
''' + pcode(r'''# pip install sentence-transformers       (Kendi bilgisayarında dene)
from sentence_transformers import SentenceTransformer
model = SentenceTransformer("sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2")   # 384 boyut
v = model.encode(["Yemek soğuk geldi", "Siparişim buz gibiydi", "Kurye çok nazikti"], normalize_embeddings=True)
print(v.shape, (v @ v.T).round(2))   # ilk ikisi birbirine üçüncüden daha yakın''') + r'''

<h2>5. Model seçimi: boyut, lisans, Türkçe</h2>
<p>Bir modelin belleğe sığıp sığmadığı kabaca <b>parametre sayısı × parametre başına bayt</b> ile hesaplanır. fp16'da parametre başına 2 bayt, int8'de 1, 4 bitte yarım bayt. Buna çalışma sırasındaki ek bellek (bağlam önbelleği, ara değerler) eklenir; kaba bir pay olarak %20 kullanılabilir.</p>
''' + py(E[2]) + r'''
<div class="tbl-wrap"><table>
<tr><th>Ölçüt</th><th>Sor</th><th>Neden önemli?</th></tr>
<tr><td>Boyut</td><td>Hedef donanıma (GPU belleği, dizüstü RAM) hangi nicemlemeyle sığar?</td><td>Sığmayan model ya çalışmaz ya da dayanılmaz yavaşlar</td></tr>
<tr><td>Lisans</td><td>Apache-2.0, MIT mi; yoksa ticari kullanımı kısıtlayan (CC BY-NC) ya da özel koşullu bir topluluk lisansı mı?</td><td>Ticari üründe NC lisanslı model kullanmak hukuki risktir</td></tr>
<tr><td>Türkçe desteği</td><td>Model kartı Türkçeyi sayıyor mu? Türkçe metinde token sayısı ve kalite nasıl?</td><td>Desteklenmeyen dilde hem kalite düşer hem maliyet artar</td></tr>
<tr><td>Görev uyumu</td><td>Sohbet (instruct) modeli mi, temel model mi, embedding modeli mi?</td><td>Temel model talimat izlemez; embedding modeli metin üretmez</td></tr>
<tr><td>Bağlam uzunluğu</td><td>RAG için kaç token bağlam gerekiyor?</td><td>Uzun bağlam bellek ister</td></tr>
</table></div>

<h2>6. Nicemleme (quantization) numpy ile</h2>
<p>Nicemleme, 16 bitlik ağırlıkları 8 ya da 4 bitlik tamsayılara çevirip yanına bir <b>ölçek</b> (scale) saklamaktır: <code>q = yuvarla(w / ölçek)</code>, geri dönüşte <code>w ≈ q × ölçek</code>. Simetrik nicemlemede ölçek, en büyük mutlak değeri tamsayı aralığının ucuna eşler. Sorun <b>aykırı değerlerdir</b>: tek bir büyük ağırlık ölçeği büyütür ve küçük ağırlıkların hepsi sıfıra yuvarlanır. Çözüm, ağırlıkları küçük gruplara bölüp her gruba ayrı ölçek vermektir (GGUF'taki <code>q4_k</code> ve GPTQ/AWQ gibi yöntemlerin temel fikri):</p>
''' + py(E[3]) + r'''
<p>Tek ölçekli 4 bit nicemlemede aykırı değer yüzünden ağırlıkların neredeyse tamamı sıfıra düştü; 64'lük gruplarla hata int8 düzeyine indi. Grup başına ek bir ölçek saklamanın maliyeti küçüktür (64 ağırlıkta bir sayı).</p>

<h2>7. İnce ayar ve LoRA</h2>
<p><b>İnce ayar</b> (fine-tuning), önceden eğitilmiş modeli kendi örneklerinle eğitmeye devam etmektir. Tüm ağırlıkları güncellemek büyük modelde çok pahalıdır. <b>LoRA</b> (Low-Rank Adaptation) ağırlıkları dondurur ve her katmana iki küçük matris ekler: <code>W' = W + (alfa / r) · B · A</code>. <code>r</code> (rank) 8 ya da 16 gibi küçük bir sayıdır; eğitilen parametre sayısı binde birler düzeyine iner. B sıfırla başladığı için eğitim başında model değişmez; eğitim bitince adaptör ağırlığa gömülebilir:</p>
''' + py(E[4]) + r'''
''' + pcode(r'''# pip install transformers peft datasets accelerate     (Kendi bilgisayarında dene; GPU önerilir)
from peft import LoraConfig, get_peft_model
from transformers import AutoModelForSequenceClassification

model = AutoModelForSequenceClassification.from_pretrained("dbmdz/bert-base-turkish-cased", num_labels=3)
ayar = LoraConfig(r=8, lora_alpha=16, lora_dropout=0.1, target_modules=["query", "value"], task_type="SEQ_CLS")
model = get_peft_model(model, ayar)
model.print_trainable_parameters()      # eğitilebilir parametrelerin oranı yüzde birin altında
# Sonra transformers.Trainer ile birkaç yüz-birkaç bin etiketli örnekle eğitilir.''') + r'''
<div class="tbl-wrap"><table>
<tr><th>İhtiyaç</th><th>Önce dene</th><th>Neden?</th></tr>
<tr><td>Model güncel şirket bilgisini bilsin</td><td>RAG (<code>rag-uygulamasi</code>)</td><td>Belge değişince indeksi güncellersin; kaynak gösterirsin</td></tr>
<tr><td>Belirli biçim ve üslup</td><td>İstem + yapılandırılmış çıktı (<code>prompt-muhendisligi</code>)</td><td>Eğitim gerektirmez, hemen değiştirilir</td></tr>
<tr><td>Dar görevde küçük, ucuz, tutarlı model</td><td>LoRA ince ayar</td><td>Küçük model büyük modelin işini yapar; gecikme ve maliyet düşer</td></tr>
<tr><td>Etiketli binlerce örnek, sabit sınıflar</td><td>scikit-learn temel çizgisi</td><td>Milisaniyeler içinde, GPU'suz, açıklanabilir</td></tr>
</table></div>

<h2>8. Temel çizgi: scikit-learn ile Türkçe metin sınıflandırma</h2>
<p>LLM'e geçmeden önce <b>temel çizgi</b> (baseline) kur. <code>nlp-metin</code> dersindeki TF-IDF + lojistik regresyon hattını gerçek Lezzet Kurye yorumlarına uygulayalım. Etiket, yemek ve kurye puanlarının ortalamasından türetiliyor (4 ve üstü olumlu, 3'ün altı olumsuz):</p>
''' + py(E[5]) + r'''
<p>Doğruluk 0.89 ve bu, aynı yorumun farklı puanlarla gelmesinden kaynaklanan gürültü düşünüldüğünde neredeyse tavan: "Porsiyon küçüktü" diyenlerin bir kısmı 4 puan vermiş. Ama bu veride yalnız 13 farklı yorum kalıbı var. Model hiç görmediği ifadelerle karşılaşınca ne yapıyor?</p>
''' + py(E[6]) + r'''
<p>Dört yeni ifadenin hiçbir kelimesi sözlükte yok; model hepsine en sık sınıfı ("olumlu") veriyor. "Buz gibiydi" ve "Bir saat bekledim" açıkça olumsuz. İşte LLM'in (yerel ya da bulut) değeri burada: <b>dil bilgisi</b> sayesinde görmediği ifadeyi anlar. Ama her yorum için LLM çağırmak yavaş ve pahalıdır. Pratik çözüm <b>hibrit</b>: hızlı sınıflandırıcı önce çalışır, güveni düşük ya da sözlük dışı kalan yorumları LLM'e gönderir. Bunu mini projede ölçerek kuracaksın.</p>
<div class="tbl-wrap"><table>
<tr><th></th><th>scikit-learn</th><th>Yerel küçük LLM</th><th>Bulut LLM</th></tr>
<tr><td>Gecikme (yorum başına)</td><td>Milisaniyenin altı</td><td>Yüzlerce milisaniye (GPU'ya bağlı)</td><td>Yüzlerce milisaniye + ağ</td></tr>
<tr><td>Maliyet</td><td>Yok denecek kadar az</td><td>Donanım + elektrik</td><td>Token başına</td></tr>
<tr><td>Etiketli veri</td><td>Gerekir (yüzlerce-binlerce)</td><td>Az ya da hiç (sıfır atış)</td><td>Az ya da hiç</td></tr>
<tr><td>Yeni ifadeler</td><td>Zayıf</td><td>İyi</td><td>Çok iyi</td></tr>
<tr><td>Veri dışarı çıkar mı?</td><td>Hayır</td><td>Hayır</td><td>Evet (sözleşme ve KVKK)</td></tr>
</table></div>

<div class="note"><b>Gerçek işte</b>Müşteri yorumu, e-posta ya da talep sınıflandıran ekipler genelde şu yolu izler: önce birkaç yüz örneği LLM ile (ya da elle) etiketleyip temel çizgiyi kurar, sonra hacim büyüdükçe küçük bir modeli (TF-IDF + lojistik regresyon ya da LoRA ile ince ayarlanmış BERTurk) üretime alır ve yalnız zor örnekleri büyük modele gönderir. Kararı her zaman aynı test setinde doğruluk, gecikme ve maliyet tablosuyla verirler.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Çıkarım sunucuları</h3>
<p>Tek kullanıcı için Ollama yeterlidir; çok kullanıcılı üretimde vLLM ya da Hugging Face TGI gibi sunucular sürekli toplu işleme (continuous batching) ve bağlam önbelleği paylaşımıyla aynı GPU'dan çok daha fazla istek çıkarır. İkisi de OpenAI uyumlu uç nokta sunar; <code>llm-api</code> dersindeki sağlayıcıdan bağımsız istemcin değişmeden çalışır.</p>
<h3>QLoRA</h3>
<p>Temel modeli 4 bit nicemlenmiş tutup üstüne LoRA adaptörlerini eğitmek (QLoRA), büyük modellerin tek bir tüketici GPU'sunda ince ayarını mümkün kılar.</p>
<h3>Damıtma (distillation)</h3>
<p>Büyük modelin etiketlerini (ya da olasılıklarını) öğretmen olarak kullanıp küçük bir modeli eğitirsin. Mini projedeki hibrit yaklaşımın doğal devamıdır: LLM'in etiketlediği zor örnekler zamanla küçük modelin eğitim setine eklenir.</p>
<h3>Değerlendirme</h3>
<p>Yerel modeli bulut modeliyle karşılaştırırken aynı altın seti, aynı istemi ve aynı ölçütleri kullan; ölçüt seçimi ve LLM-hakem tuzakları <code>llm-degerlendirme</code> dersinde.</p>
</section>
'''

# ---------------- alıştırmalar ----------------
BPE_TEMEL = r'''import re
from collections import Counter

def tr_kucuk(s):
    return s.replace("I", "ı").replace("İ", "i").lower()

def cift_say(sozcukler):
    say = Counter()
    for semboller, n in sozcukler.items():
        for a, b in zip(semboller, semboller[1:]):
            say[a, b] += n
    return say

def birlestir(sozcukler, cift):
    yeni = {}
    for semboller, n in sozcukler.items():
        s, i = [], 0
        while i < len(semboller):
            if i + 1 < len(semboller) and (semboller[i], semboller[i + 1]) == cift:
                s.append(semboller[i] + semboller[i + 1])
                i += 2
            else:
                s.append(semboller[i])
                i += 1
        yeni[tuple(s)] = n
    return yeni
'''
BPE_OGREN = r'''
def bpe_ogren(metinler, n_birlesim, en_az=2):
    frek = Counter(k for m in metinler for k in re.findall(r"\w+", tr_kucuk(m)))
    sozcukler = {tuple(k) + ("_",): n for k, n in frek.items()}
    birlesimler = []
    for _ in range(n_birlesim):
        say = cift_say(sozcukler)
        if not say:
            break
        cift = min(say, key=lambda c: (-say[c], c))
        if say[cift] < en_az:
            break
        birlesimler.append(cift)
        sozcukler = birlestir(sozcukler, cift)
    return birlesimler
'''
YORUMLAR = 'import veri\nYORUMLAR = [r["comment"] for r in veri.kayitlar("lezzet_kurye", "lk_ratings") if r["comment"]]\n'

ex = []
ex.append(dict(t='mc', stage='Isınma',
    q='8 milyar parametreli bir modelin yalnız ağırlıkları fp16 (parametre başına 2 bayt) olarak yaklaşık ne kadar bellek ister?',
    o=['Yaklaşık 4 GB', 'Yaklaşık 15-16 GB', 'Yaklaşık 64 GB', 'Yaklaşık 128 GB'],
    a=1, why='8 × 10⁹ × 2 bayt = 16 × 10⁹ bayt ≈ 14.9 GiB. Çalışma sırasında bağlam önbelleği ve ara değerler için ek pay gerekir; 4 bit nicemlemeyle ağırlıklar 4 GB civarına iner.'))
ex.append(dict(t='mc', stage='Isınma',
    q='Hugging Face\'te Türkçe yorum sınıflandırmada çok başarılı bir model buldun; model kartında lisans <b>CC BY-NC 4.0</b> yazıyor. Lezzet Kurye\'nin ücretli müşteri destek ürününde kullanabilir misin?',
    o=['Evet; Hub\'da herkese açık olan her model ticari amaçla kullanılabilir',
       'Hayır; NC (NonCommercial) ticari kullanımı yasaklar, izin ya da başka model gerekir',
       'Evet; model kendi sunucunda çalışıyorsa lisans koşulları geçerli olmaz',
       'Evet; yalnızca model adını ürünün hakkında sayfasında belirtmek yeterlidir'],
    a=1, why='"Açık ağırlıklı" olmak "her amaçla serbest" demek değildir. NC lisansı ticari kullanımı yasaklar; model nerede çalışırsa çalışsın lisans geçerlidir. Ticari ürün için Apache-2.0, MIT gibi izin veren lisanslar ya da sahibinden yazılı izin gerekir.'))
ex.append(dict(t='mc', stage='Isınma',
    q='Aşağıdakilerden hangisinde LoRA ile ince ayar, RAG\'den daha uygun bir çözümdür?',
    o=['İK yönetmeliği her çeyrek güncelleniyor ve cevaplarda kaynak gösterilmeli',
       'Dar bir etiketleme görevinde küçük modelin sabit biçimde, tutarlı çalışması',
       'Ürün fiyatları her gün değişiyor ve asistan güncel fiyatı söylemeli',
       'Model, şirketin yeni açılan şubelerinin adreslerini her zaman bilmeli'],
    a=1, why='İnce ayar davranış ve biçim öğretmekte iyidir; değişen bilgiyi taşımakta kötüdür (her değişiklikte yeniden eğitim gerekir, kaynak gösterilemez). Güncel ve kaynak gerektiren bilgi RAG\'in işidir.'))
ex.append(dict(t='predict', stage='Kodu oku',
    q='En uzun eşleşmeyle (greedy longest-match) çalışan bir tokenizer. Bu kod ne yazdırır?',
    code='sozluk = {"gel", "geldi", "di", "ler", "ge", "l", "d", "i", "e", "r"}\n\ndef tokenle(k):\n    cikti, i = [], 0\n    while i < len(k):\n        for j in range(len(k), i, -1):\n            if k[i:j] in sozluk:\n                cikti.append(k[i:j])\n                i = j\n                break\n        else:\n            cikti.append("[UNK]")\n            i += 1\n    return cikti\n\nprint(tokenle("geldiler"), tokenle("gelx"))\n',
    o=["['geldi', 'ler'] ['gel', '[UNK]']", "['gel', 'di', 'ler'] ['gel', '[UNK]']", "['geldi', 'ler'] ['ge', 'l', '[UNK]']", "['geldiler'] ['[UNK]']"],
    a=0, why='Her konumda önce en uzun parçayı dener: "geldi" sözlükte olduğu için "gel"+"di" yerine tek token olur. "x" hiçbir sözlük girdisiyle eşleşmez ve bilinmeyen token [UNK] olur. BPE tabanlı modern tokenizer\'lar bayt düzeyinde çalışarak [UNK] sorununu ortadan kaldırır.'))
ex.append(dict(t='predict', stage='Kodu oku', needs=['numpy'],
    q='Simetrik int8 nicemleme. Bu kod ne yazdırır?',
    code='import numpy as np\nw = np.array([0.5, -1.27, 0.004, 1.0])\nolcek = np.abs(w).max() / 127\nq = np.round(w / olcek).astype(np.int8)\nprint(q.tolist(), round(float(np.abs(w - q * olcek).max()), 4))\n',
    o=['[50, -127, 0, 100] 0.004', '[50, -127, 1, 100] 0.0', '[50, 129, 0, 100] 0.004', '[0, -1, 0, 1] 0.5'],
    a=0, why='Ölçek 1.27 / 127 = 0.01. 0.004 / 0.01 = 0.4 sıfıra yuvarlanır; geri dönüşte 0 olur ve hata 0.004\'tür. En büyük mutlak değer (-1.27) tam -127\'ye eşlenir, taşma olmaz.'))
ex.append(dict(t='predict', stage='Kodu oku',
    q='Ağırlık belleği hesabı (GiB). Bu kod ne yazdırır?',
    code='def gb(param_milyar, bit):\n    return param_milyar * 1e9 * bit / 8 / 1024**3\n\nprint(round(gb(8, 16), 1), round(gb(8, 4), 1))\n',
    o=['14.9 3.7', '16.0 4.0', '128.0 32.0', '14.9 7.5'],
    a=0, why='bit / 8 bayta çevirir; 1024³ ise GiB\'e. 8 × 10⁹ × 2 bayt ≈ 14.9 GiB; 4 bitte dörtte biri ≈ 3.7 GiB. 16.0 sonucu 10⁹ ile bölmekten (GB), 128 ise bit/bayt karışıklığından gelir.'))
ex.append(dict(t='order', stage='Kodu oku', needs=['numpy'],
    q='<p>Ağırlıkları simetrik int8\'e nicemleyip geri çeviren ve en büyük hatayı yazdıran programın satırlarını sırala.</p>',
    lines=['import numpy as np', 'w = np.array([0.42, -1.27, 0.08, 0.9])', 'olcek = np.abs(w).max() / 127', 'q = np.round(w / olcek).astype(np.int8)', 'geri = q.astype(np.float32) * olcek', 'print(q.tolist(), round(float(np.abs(w - geri).max()), 4))'],
    expect='[42, -127, 8, 90] 0.0\n',
    hint='Ölçek ağırlıklardan, q ölçekten, geri dönüş q\'dan hesaplanır.',
    why='Nicemleme iki adımdır: ölçeği bul, böl ve yuvarla. Geri çevirme çarpmadır. Bu örnekte tüm değerler ölçeğin tam katı olduğu için hata sıfır; gerçek ağırlıklarda yuvarlama hatası oluşur.'))

# Rehberli 1: cift_say + en_sik_cift
ex.append(dict(t='code', id='yerel-modeller-hf-1', stage='Rehberli', diff=1,
    q='<p>BPE\'nin ilk adımı. <code>sozcukler</code> sözlüğünde anahtar bir kelimenin sembol demeti (<code>("g", "e", "l", "_")</code>), değer kelimenin sıklığıdır.</p><ul><li><code>cift_say(sozcukler)</code>: her kelimedeki yan yana sembol çiftlerini, kelimenin sıklığı kadar sayan bir <code>Counter</code> döndürsün.</li><li><code>en_sik_cift(say)</code>: en sık çifti döndürsün; eşitlikte alfabetik olarak <b>küçük</b> olan seçilsin. Sayaç boşsa <code>None</code>.</li></ul><p>Testler gerçek Lezzet Kurye yorumlarıyla çalışır.</p>',
    guide=['Counter() oluştur.', 'Her (semboller, n) için zip(semboller, semboller[1:]) ile çiftleri gez ve n ekle.', 'en_sik_cift: boşsa None; değilse min(say, key=lambda c: (-say[c], c)).'],
    example='from collections import Counter\nsay = Counter()\nfor a, b in zip("kedi", "kedi"[1:]):\n    say[a, b] += 3\nprint(say)\n',
    start='from collections import Counter\n\ndef cift_say(sozcukler):\n    say = Counter()\n    # TODO: her kelimenin yan yana çiftlerini sıklığıyla say\n    return say\n\ndef en_sik_cift(say):\n    # TODO: en sık; eşitlikte alfabetik küçük; boşsa None\n    return None\n',
    sol='from collections import Counter\n\ndef cift_say(sozcukler):\n    say = Counter()\n    for semboller, n in sozcukler.items():\n        for a, b in zip(semboller, semboller[1:]):\n            say[a, b] += n\n    return say\n\ndef en_sik_cift(say):\n    if not say:\n        return None\n    return min(say, key=lambda c: (-say[c], c))\n',
    tests='S = {("g", "e", "l", "_"): 5, ("g", "e", "ç", "_"): 3, ("e", "l", "_"): 1}\ns = cift_say(S)\nassert s[("g", "e")] == 8 and s[("e", "l")] == 6 and s[("l", "_")] == 6 and s[("ç", "_")] == 3, f"Çiftler kelime sıklığıyla ağırlıklandırılmalı: {dict(s)}"\nassert en_sik_cift(s) == ("g", "e")\nassert en_sik_cift(Counter({("l", "_"): 6, ("e", "l"): 6})) == ("e", "l"), "Eşitlikte alfabetik küçük çift"\nassert en_sik_cift(Counter()) is None\nimport re, veri\nfrek = Counter(k for r in veri.kayitlar("lezzet_kurye", "lk_ratings") if r["comment"] for k in re.findall(r"\\w+", r["comment"].replace("I", "ı").replace("İ", "i").lower()))\nsg = cift_say({tuple(k) + ("_",): n for k, n in frek.items()})\nassert en_sik_cift(sg) == ("i", "_"), f"Gerçek yorumlarda en sık çift i + kelime sonu: {en_sik_cift(sg)}"\nassert sg[("g", "e")] == 1552, sg[("g", "e")]\n',
    hints=['say[a, b] += n ile demet anahtar kullanılır.', 'min(say, key=lambda c: (-say[c], c)) önce sıklığa (azalan), sonra alfabeye bakar.'],
    why='BPE\'nin her adımı bu iki işlemden ibarettir: çiftleri say, en sıkını birleştir. Sıklık ağırlığı sayesinde "geldi" gibi binlerce kez geçen kelimeler hızla tek token olur; nadir kelimeler parçalı kalır.'))

# Rehberli 2: bpe_ogren
ex.append(dict(t='code', id='yerel-modeller-hf-2', stage='Rehberli', diff=2,
    q='<p><code>bpe_ogren(metinler, n_birlesim, en_az=2)</code>: <code>cift_say</code> ve <code>birlestir</code> hazır. Metinleri <code>tr_kucuk</code> + <code>re.findall(r"\\w+", ...)</code> ile kelimelere ayır, kelime sıklıklarını say, her kelimeyi <code>tuple(kelime) + ("_",)</code> sembol demetine çevir. Sonra en fazla <code>n_birlesim</code> kez: çiftleri say, en sık çifti seç (eşitlikte alfabetik küçük), sıklığı <code>en_az</code>\'dan küçükse ya da hiç çift yoksa dur; değilse birleşimi listeye ekle ve uygula. Birleşim listesini döndür.</p>',
    guide=['Counter ile kelime sıklıklarını çıkar.', 'sozcukler = {tuple(k) + ("_",): n for k, n in frek.items()}', 'Döngüde cift_say → seçim → durma koşulları → birlestir.', 'Birleşimleri sırayla listeye ekle.'],
    example=BPE_TEMEL + '\nsoz = {("a", "b", "_"): 3, ("a", "b", "c", "_"): 1}\nsay = cift_say(soz)\nc = min(say, key=lambda c: (-say[c], c))\nprint(c, birlestir(soz, c))\n',
    start=BPE_TEMEL + '\ndef bpe_ogren(metinler, n_birlesim, en_az=2):\n    birlesimler = []\n    # TODO: kelime sıklıkları, sembol demetleri, birleşim döngüsü\n    return birlesimler\n',
    sol=BPE_TEMEL + BPE_OGREN,
    tests=YORUMLAR + 'b = bpe_ogren(YORUMLAR, 8)\nassert b[:4] == [("i", "_"), ("d", "i_"), ("g", "e"), ("l", "di_")], f"Gerçek yorumlarda ilk birleşimler: {b[:4]}"\nassert len(b) == 8\nassert ("ge", "ldi_") in b, "Sık kelime \'geldi\' birkaç adımda tek token olur"\nassert bpe_ogren(["ab ab", "ab"], 10) == [("a", "b"), ("ab", "_")], f"Sıklık 2\'nin altına düşünce durmalı: {bpe_ogren([\'ab ab\', \'ab\'], 10)}"\nassert bpe_ogren(["a"], 5, en_az=1) == [("a", "_")], "Tek sembollü kelimede çift kalmayınca durmalı"\nassert len(bpe_ogren(["IŞIK ışık"], 10)) == 4, "Türkçe küçük harf: IŞIK ve ışık aynı kelime (sıklık 2) sayılmalı; .lower() IŞIK\'ı işik yapar"\n',
    hints=['frek = Counter(k for m in metinler for k in re.findall(r"\\w+", tr_kucuk(m)))', 'if not say: break; cift = min(...); if say[cift] < en_az: break'],
    why='Gerçek tokenizer\'lar (GPT, Llama, BERTurk\'ün WordPiece\'i) aynı fikri milyonlarca belge ve on binlerce birleşimle uygular. Eğitim verisinde sık geçen Türkçe ekler ve kökler tek token olur; Türkçe az görülmüşse kelimeler çok parçaya bölünür ve maliyet artar.'))

# Rehberli 3: int8
ex.append(dict(t='code', id='yerel-modeller-hf-3', stage='Rehberli', diff=1, needs=['numpy'],
    q='<p><code>int8_nicemle(w)</code>: numpy dizisini simetrik int8\'e çevirsin ve <code>(q, olcek)</code> döndürsün: <code>olcek = max|w| / 127</code>, <code>q = clip(round(w / olcek), -127, 127)</code> ve <code>dtype=np.int8</code>. Tüm ağırlıklar sıfırsa ölçek <code>1.0</code> olsun (sıfıra bölme olmasın). <code>geri_coz(q, olcek)</code>: <code>q</code>\'yu float32\'ye çevirip ölçekle çarpsın.</p>',
    guide=['olcek = float(np.abs(w).max()) / 127; sıfırsa 1.0 yap.', 'np.round(w / olcek) ile yuvarla, np.clip ile sınırla.', '.astype(np.int8) ile tamsayıya çevir.', 'geri_coz: q.astype(np.float32) * olcek'],
    example='import numpy as np\nx = np.array([1.6, -2.4, 300.0])\nprint(np.clip(np.round(x), -127, 127).astype(np.int8))\n',
    start='import numpy as np\n\ndef int8_nicemle(w):\n    olcek = np.abs(w).max() / 127\n    q = w / olcek   # TODO: yuvarla, sınırla, int8\'e çevir; sıfır ölçek durumunu ele al\n    return q, olcek\n\ndef geri_coz(q, olcek):\n    # TODO\n    return q\n',
    sol='import numpy as np\n\ndef int8_nicemle(w):\n    w = np.asarray(w, dtype=np.float32)\n    olcek = float(np.abs(w).max()) / 127\n    if olcek == 0:\n        olcek = 1.0\n    q = np.clip(np.round(w / olcek), -127, 127).astype(np.int8)\n    return q, olcek\n\ndef geri_coz(q, olcek):\n    return q.astype(np.float32) * olcek\n',
    tests='w = np.array([0.5, -1.27, 0.004, 1.0], dtype=np.float32)\nq, s = int8_nicemle(w)\nassert q.dtype == np.int8, "q int8 olmalı"\nassert q.tolist() == [50, -127, 0, 100], q.tolist()\nassert abs(s - 0.01) < 1e-6\nassert np.abs(geri_coz(q, s) - w).max() < 0.0051, "Yuvarlama hatası ölçeğin yarısını aşmamalı"\nq0, s0 = int8_nicemle(np.zeros(3))\nassert s0 == 1.0 and q0.tolist() == [0, 0, 0], "Sıfır dizide ölçek 1.0"\nrng = np.random.default_rng(0)\nb = rng.normal(0, 0.05, 1000).astype(np.float32)\nqb, sb = int8_nicemle(b)\nassert int(qb.max()) <= 127 and int(qb.min()) >= -127 and 127 in np.abs(qb).tolist()\nassert np.abs(geri_coz(qb, sb) - b).mean() < sb / 2, "Ortalama hata yarım ölçekten küçük olmalı"\nassert geri_coz(qb, sb).dtype == np.float32\n',
    hints=['np.round(w / olcek) yuvarlar; .astype(np.int8) taşmayı yakalamaz, önce np.clip kullan.', 'Ölçek sıfırsa 1.0: tüm q değerleri zaten 0 olur.'],
    why='Bu, int8 nicemlemenin çekirdeğidir: ağırlık başına 4 bayt (fp32) yerine 1 bayt + tensör başına tek bir ölçek. Belleği dörtte birine indirir; hata, ölçeğin yarısıyla sınırlıdır.'))

# Rehberli 4: bellek
ex.append(dict(t='code', id='yerel-modeller-hf-4', stage='Rehberli', diff=1,
    q='<p>İki fonksiyon yaz:</p><ul><li><code>gerekli_gb(param_milyar, bit, ek_oran=0.2)</code>: <code>param_milyar × 10⁹ × bit / 8</code> baytı GiB\'e (<code>1024**3</code>) çevir, <code>(1 + ek_oran)</code> ile çarp ve 1 ondalığa yuvarla. <code>bit</code> 4, 8, 16 ya da 32 değilse <code>ValueError</code>.</li><li><code>sigan_modeller(katalog, gpu_gb, bit)</code>: <code>katalog</code> <code>{"ad", "param_milyar"}</code> sözlüklerinin listesi. Gerekli belleği <code>gpu_gb</code>\'yi aşmayan modellerin adlarını parametre sayısına göre <b>büyükten küçüğe</b> döndür.</li></ul>',
    guide=['Bit değerini bir kümeyle doğrula.', 'Bayt → GiB: / 1024**3; sonra ek pay ve round(..., 1).', 'sigan_modeller: listeyi filtrele, sonra sorted(..., key=param, reverse=True).'],
    example='print(round(7e9 * 2 / 1024**3, 1))\n',
    start='def gerekli_gb(param_milyar, bit, ek_oran=0.2):\n    # TODO: doğrulama, GiB, ek pay, yuvarlama\n    return param_milyar * bit / 8\n\ndef sigan_modeller(katalog, gpu_gb, bit):\n    # TODO\n    return [m["ad"] for m in katalog]\n',
    sol='def gerekli_gb(param_milyar, bit, ek_oran=0.2):\n    if bit not in {4, 8, 16, 32}:\n        raise ValueError("bit 4, 8, 16 ya da 32 olmalı")\n    return round(param_milyar * 1e9 * bit / 8 / 1024**3 * (1 + ek_oran), 1)\n\ndef sigan_modeller(katalog, gpu_gb, bit):\n    uygun = [m for m in katalog if gerekli_gb(m["param_milyar"], bit) <= gpu_gb]\n    return [m["ad"] for m in sorted(uygun, key=lambda m: m["param_milyar"], reverse=True)]\n',
    tests='assert gerekli_gb(8, 16) == 17.9, f"14.9 GiB × 1.2: {gerekli_gb(8, 16)}"\nassert gerekli_gb(8, 4) == 4.5\nassert gerekli_gb(70, 4, ek_oran=0) == 32.6\nassert gerekli_gb(1, 8, 0.5) == 1.4\ntry:\n    gerekli_gb(8, 3)\n    assert False, "3 bit desteklenmiyor: ValueError"\nexcept ValueError:\n    pass\nK = [{"ad": "kucuk-1b", "param_milyar": 1}, {"ad": "orta-8b", "param_milyar": 8}, {"ad": "buyuk-70b", "param_milyar": 70}, {"ad": "orta-14b", "param_milyar": 14}]\nassert sigan_modeller(K, 12, 4) == ["orta-14b", "orta-8b", "kucuk-1b"], sigan_modeller(K, 12, 4)\nassert sigan_modeller(K, 12, 16) == ["kucuk-1b"], "fp16\'da 8B bile 12 GB\'a sığmaz"\nassert sigan_modeller(K, 0.5, 4) == []\n',
    hints=['GiB için 1024**3 kullan; 10⁹ ile bölmek GB verir ve %7 farklıdır.', 'sorted(uygun, key=lambda m: m["param_milyar"], reverse=True)'],
    why='Model seçiminin ilk süzgeci donanımdır. Bu kaba hesap "8B modeli 12 GB GPU\'da fp16 çalıştıramam ama 4 bitte rahatça çalıştırırım" kararını saniyeler içinde verdirir. Uzun bağlam ve çok kullanıcılı sunumda ek pay belirgin biçimde büyür.'))

# Kendin yaz 1: tokenle
ex.append(dict(t='code', id='yerel-modeller-hf-5', stage='Kendin yaz', diff=2,
    q='<p>Öğrenilmiş birleşimlerle tokenlama (<code>birlestir</code>, <code>bpe_ogren</code> hazır).</p><ul><li><code>tokenle(kelime, birlesimler)</code>: kelimeyi <code>tr_kucuk</code> ile küçült, <code>tuple(kelime) + ("_",)</code> ile başla ve birleşimleri <b>öğrenildikleri sırayla</b> uygula; sembol listesini döndür.</li><li><code>token_sayisi(metin, birlesimler)</code>: metnin <code>\\w+</code> kelimelerinin token sayılarının toplamı.</li></ul>',
    start=BPE_TEMEL + BPE_OGREN + '\ndef tokenle(kelime, birlesimler):\n    return list(kelime)\n\ndef token_sayisi(metin, birlesimler):\n    return 0\n\n' + YORUMLAR,
    sol=BPE_TEMEL + BPE_OGREN + '\ndef tokenle(kelime, birlesimler):\n    semboller = tuple(tr_kucuk(kelime)) + ("_",)\n    for cift in birlesimler:\n        semboller = next(iter(birlestir({semboller: 1}, cift)))\n    return list(semboller)\n\ndef token_sayisi(metin, birlesimler):\n    return sum(len(tokenle(k, birlesimler)) for k in re.findall(r"\\w+", tr_kucuk(metin)))\n\n' + YORUMLAR,
    tests='B = bpe_ogren(YORUMLAR, 30)\nassert tokenle("geldi", B) == ["geldi_"], tokenle("geldi", B)\nassert tokenle("Lezzetliydi", B) == ["lezzetl", "iy", "di_"], tokenle("Lezzetliydi", B)\nassert tokenle("gelmedi", B) == ["ge", "l", "m", "e", "di_"], tokenle("gelmedi", B)\nassert tokenle("geldi", []) == ["g", "e", "l", "d", "i", "_"], "Birleşim yoksa harf harf + kelime sonu"\nassert token_sayisi("Biraz geç geldi ama lezzetli", B) == 5, "Sık kalıp: her kelime tek token"\nassert token_sayisi("Sıcacıktı, bayıldım!", B) > 12, f"Görülmemiş kelimeler çok parçaya bölünür: {token_sayisi(\'Sıcacıktı, bayıldım!\', B)}"\n',
    hints=['Tek kelimelik sözlükle birlestir({semboller: 1}, cift) çağırıp sonucun tek anahtarını al.', 'Birleşimleri listedeki sırayla uygula; sıra değişirse sonuç değişir.'],
    why='Tokenlama, eğitimde öğrenilen birleşimlerin aynı sırayla tekrar oynatılmasıdır. Bu yüzden bir modelin tokenizer\'ı modelle birlikte gelir ve değiştirilemez; aynı metin farklı modellerde farklı token sayısı (ve maliyet) üretir.'))

# Kendin yaz 2: grup nicemleme
ex.append(dict(t='code', id='yerel-modeller-hf-6', stage='Kendin yaz', diff=2, needs=['numpy'],
    q='<p>Gruplu simetrik nicemleme. <code>grup_nicemle(w, bit=4, grup=64)</code>: 1 boyutlu <code>w</code>\'yu <code>(-1, grup)</code> biçimine getir (uzunluk gruba bölünmüyorsa <code>ValueError</code>), <code>qmax = 2**(bit-1) - 1</code>, her satırın ölçeği <code>max|satır| / qmax</code> (sıfırsa 1.0), <code>q = clip(round(satır / ölçek), -qmax, qmax)</code> int8. <code>(q, olcekler)</code> döndür; <code>olcekler</code> şekli <code>(grup_sayisi, 1)</code>. <code>grup_geri_coz(q, olcekler)</code> düz (1 boyutlu) float32 dizi döndürsün.</p>',
    start='import numpy as np\n\ndef grup_nicemle(w, bit=4, grup=64):\n    pass\n\ndef grup_geri_coz(q, olcekler):\n    pass\n',
    sol='import numpy as np\n\ndef grup_nicemle(w, bit=4, grup=64):\n    w = np.asarray(w, dtype=np.float32)\n    if w.size % grup:\n        raise ValueError("uzunluk grup boyutuna bölünmeli")\n    qmax = 2 ** (bit - 1) - 1\n    g = w.reshape(-1, grup)\n    olcek = np.abs(g).max(axis=1, keepdims=True) / qmax\n    olcek[olcek == 0] = 1.0\n    q = np.clip(np.round(g / olcek), -qmax, qmax).astype(np.int8)\n    return q, olcek\n\ndef grup_geri_coz(q, olcekler):\n    return (q.astype(np.float32) * olcekler).reshape(-1)\n',
    tests='rng = np.random.default_rng(0)\nw = rng.normal(0, 0.02, 4096).astype(np.float32)\nw[7] = 0.9\nq, s = grup_nicemle(w, 4, 64)\nassert q.shape == (64, 64) and s.shape == (64, 1) and q.dtype == np.int8\nassert int(np.abs(q).max()) == 7, "4 bit simetrik: -7..7"\ng = np.abs(w - grup_geri_coz(q, s)).mean()\nq1, s1 = grup_nicemle(w, 4, 4096)\ntek = np.abs(w - grup_geri_coz(q1, s1)).mean()\nassert g < tek / 5, f"Gruplu hata ({g:.5f}) tek ölçekliden ({tek:.5f}) çok küçük olmalı: aykırı değer yalnız kendi grubunu bozar"\nassert (q1 == 0).mean() > 0.99, "Tek ölçekte neredeyse tüm ağırlıklar sıfıra düşer"\nz, sz = grup_nicemle(np.zeros(8), 8, 4)\nassert sz.tolist() == [[1.0], [1.0]] and z.tolist() == [[0] * 4] * 2\nassert grup_geri_coz(z, sz).shape == (8,)\ntry:\n    grup_nicemle(np.ones(10), 4, 4)\n    assert False\nexcept ValueError:\n    pass\n',
    hints=['g = w.reshape(-1, grup); olcek = np.abs(g).max(axis=1, keepdims=True) / qmax', 'Sıfır ölçekleri maskeyle düzelt: olcek[olcek == 0] = 1.0', 'Geri çözme: (q.astype(np.float32) * olcekler).reshape(-1)'],
    why='Gruplu ölçekler, aykırı bir ağırlığın tüm tensörün çözünürlüğünü yemesini engeller. GGUF\'taki Q4_K, GPTQ ve AWQ gibi yöntemler bu fikri daha akıllı ölçek ve sıfır noktası seçimleriyle geliştirir; 4 bitlik modellerin kaliteyi büyük ölçüde korumasının sırrı budur.'))

# Kendin yaz 3: LoRA
ex.append(dict(t='code', id='yerel-modeller-hf-7', stage='Kendin yaz', diff=2, needs=['numpy'],
    q='<p>Üç LoRA fonksiyonu yaz (ağırlıklar <code>W</code>: çıktı × girdi):</p><ul><li><code>lora_parametre(d_girdi, d_cikti, r)</code>: <code>(tam, lora, oran)</code>; tam = <code>d_girdi × d_cikti</code>, lora = <code>r × (d_girdi + d_cikti)</code>, oran = <code>round(lora / tam, 4)</code>.</li><li><code>lora_ileri(x, W, A, B, alfa, r)</code>: <code>x @ W.T + (alfa / r) * (x @ A.T) @ B.T</code> (A: r × girdi, B: çıktı × r).</li><li><code>lora_birlestir(W, A, B, alfa, r)</code>: <code>W + (alfa / r) * B @ A</code>; W\'yu <b>değiştirmeden</b> yeni dizi döndür.</li></ul>',
    start='import numpy as np\n\ndef lora_parametre(d_girdi, d_cikti, r):\n    pass\n\ndef lora_ileri(x, W, A, B, alfa, r):\n    pass\n\ndef lora_birlestir(W, A, B, alfa, r):\n    pass\n',
    sol='import numpy as np\n\ndef lora_parametre(d_girdi, d_cikti, r):\n    tam = d_girdi * d_cikti\n    lora = r * (d_girdi + d_cikti)\n    return tam, lora, round(lora / tam, 4)\n\ndef lora_ileri(x, W, A, B, alfa, r):\n    return x @ W.T + (alfa / r) * (x @ A.T) @ B.T\n\ndef lora_birlestir(W, A, B, alfa, r):\n    return W + (alfa / r) * B @ A\n',
    tests='assert lora_parametre(4096, 4096, 8) == (16777216, 65536, 0.0039)\nassert lora_parametre(768, 3072, 16) == (2359296, 61440, 0.026)\nrng = np.random.default_rng(3)\nW = rng.normal(size=(6, 5)); A = rng.normal(size=(2, 5)); B = np.zeros((6, 2)); x = rng.normal(size=(4, 5))\nassert np.allclose(lora_ileri(x, W, A, B, 16, 2), x @ W.T), "B sıfırken model değişmemeli"\nB = rng.normal(size=(6, 2))\ny = lora_ileri(x, W, A, B, 16, 2)\nassert y.shape == (4, 6)\nW0 = W.copy()\nWb = lora_birlestir(W, A, B, 16, 2)\nassert np.allclose(x @ Wb.T, y), "Birleştirilmiş ağırlık aynı çıktıyı vermeli"\nassert np.array_equal(W, W0), "Orijinal W değişmemeli (dondurulmuş temel model)"\nassert np.linalg.matrix_rank(Wb - W) <= 2, "Güncelleme rankı en fazla r olmalı"\n',
    hints=['x @ A.T şekli (n, r); sonra @ B.T ile (n, çıktı).', 'W + ... yeni dizi üretir; W += ... yerinde değiştirir, kullanma.'],
    why='LoRA\'nın gücü sayılarda: 4096 × 4096\'lık bir katmanda eğitilen parametre binde dört. Adaptör ayrı dosya olarak saklanır (birkaç MB), aynı temel modele farklı görevler için farklı adaptörler takılabilir; çıkarımda birleştirilirse ek gecikme olmaz.'))

# Kendin yaz 4: temel çizgi gerçek veri
TC_SOL = r'''import veri
from collections import Counter
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, f1_score

def tr_kucuk(s):
    return s.replace("I", "ı").replace("İ", "i").lower()

def etiket(r):
    ort = (r["food_score"] + r["courier_score"]) / 2
    return "olumlu" if ort >= 4 else ("olumsuz" if ort < 3 else "notr")

def temel_cizgi():
    kayit = [r for r in veri.kayitlar("lezzet_kurye", "lk_ratings") if r["comment"]]
    X = [r["comment"] for r in kayit]
    y = [etiket(r) for r in kayit]
    X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.25, random_state=42, stratify=y)
    model = make_pipeline(TfidfVectorizer(preprocessor=tr_kucuk), LogisticRegression(max_iter=1000))
    model.fit(X_tr, y_tr)
    t = model.predict(X_te)
    return {"n": len(X),
            "cogunluk": round(Counter(y_te).most_common(1)[0][1] / len(y_te), 3),
            "dogruluk": round(accuracy_score(y_te, t), 3),
            "makro_f1": round(f1_score(y_te, t, average="macro"), 3)}
'''
ex.append(dict(t='code', id='yerel-modeller-hf-8', stage='Kendin yaz', diff=2, needs=['scikit-learn'],
    q='<p>Gerçek <code>lezzet_kurye.lk_ratings</code> yorumlarıyla temel çizgi. <code>temel_cizgi()</code>:</p><ol><li>Yorumu boş olmayan kayıtları al; etiket: yemek ve kurye puanının ortalaması 4 ve üstü <code>"olumlu"</code>, 3\'ün altı <code>"olumsuz"</code>, arası <code>"notr"</code>.</li><li><code>train_test_split(X, y, test_size=0.25, random_state=42, stratify=y)</code>.</li><li><code>make_pipeline(TfidfVectorizer(preprocessor=tr_kucuk), LogisticRegression(max_iter=1000))</code> eğit.</li><li><code>{"n", "cogunluk", "dogruluk", "makro_f1"}</code> döndür: n kayıt sayısı, cogunluk test setinde en sık sınıfın payı, diğerleri test seti ölçütleri; oranlar 3 ondalık.</li></ol>',
    start='import veri\n\ndef tr_kucuk(s):\n    return s.replace("I", "ı").replace("İ", "i").lower()\n\ndef temel_cizgi():\n    kayit = [r for r in veri.kayitlar("lezzet_kurye", "lk_ratings") if r["comment"]]\n    return {"n": len(kayit)}\n',
    sol=TC_SOL,
    tests='r = temel_cizgi()\nassert r["n"] == 2366, "Yorumu dolu 2366 kayıt"\nassert r["cogunluk"] == 0.752, f"Test setinde olumlu payı: {r[\'cogunluk\']}"\nassert abs(r["dogruluk"] - 0.892) < 0.011, f"Doğruluk yaklaşık 0.892 olmalı: {r[\'dogruluk\']}"\nassert abs(r["makro_f1"] - 0.858) < 0.02, f"Makro F1 yaklaşık 0.858: {r[\'makro_f1\']}"\nassert r["dogruluk"] > r["cogunluk"] + 0.1, "Model çoğunluk tahmininden belirgin iyi olmalı"\n',
    hints=['stratify=y sınıf oranlarını eğitim ve testte korur.', 'Counter(y_te).most_common(1)[0][1] / len(y_te) çoğunluk temel çizgisidir.', 'f1_score(y_te, t, average="macro") her sınıfa eşit ağırlık verir; azınlık sınıflarını gizlemez.'],
    why='Her LLM projesinden önce iki temel çizgi kur: "hep en sık sınıf" (0.752) ve basit bir model (0.892). LLM bunları anlamlı biçimde geçmiyorsa ek maliyeti ve gecikmeyi haklı çıkaramaz. Makro F1, azınlıktaki olumsuz yorumları ne kadar yakaladığını gösterir.'))

# Hata avı 1
ex.append(dict(t='code', id='yerel-modeller-hf-9', stage='Hata avı', kind='bug', diff=2, needs=['numpy'],
    q='<p><b>Hatayı bul ve düzelt.</b> <code>nicemle(w)</code> simetrik int8 nicemleme yapmalı (<code>olcek = max|w| / 127</code>, sonuç -127..127) ve <code>(q, olcek)</code> döndürmeli. Ekip, negatif ağırlığı baskın katmanlarda modelin tamamen saçmaladığını fark etti: bazı büyük negatif ağırlıklar nicemlemeden sonra <b>pozitif</b> çıkıyor.</p>',
    start='import numpy as np\n\ndef nicemle(w):\n    w = np.asarray(w, dtype=np.float32)\n    olcek = float(w.max()) / 127\n    q = np.round(w / olcek).astype(np.int8)\n    return q, olcek\n',
    sol='import numpy as np\n\ndef nicemle(w):\n    w = np.asarray(w, dtype=np.float32)\n    olcek = float(np.abs(w).max()) / 127\n    if olcek == 0:\n        olcek = 1.0\n    q = np.clip(np.round(w / olcek), -127, 127).astype(np.int8)\n    return q, olcek\n',
    tests='w = np.array([0.3, -1.0, 0.5, -0.2], dtype=np.float32)\nq, s = nicemle(w)\nassert abs(s - 1.0 / 127) < 1e-7, f"Ölçek mutlak değerin maksimumundan gelmeli: {s}"\nassert q.tolist() == [38, -127, 64, -25], f"Gelen {q.tolist()}"\nassert all((qi < 0) == (wi < 0) for qi, wi in zip(q.tolist(), w.tolist()) if wi != 0), "İşaret korunmalı"\nq2, s2 = nicemle(np.array([-2.0, -0.5, -1.0]))\nassert q2.tolist() == [-127, -32, -64], f"Tümü negatif dizi: {q2.tolist()}"\nq3, s3 = nicemle(np.zeros(4))\nassert q3.tolist() == [0, 0, 0, 0] and s3 == 1.0, "Sıfır dizide bölme hatası olmamalı"\n',
    hints=['w.max() en büyük POZİTİF değerdir; -1.0 gibi büyük negatifler ölçeğin dışında kalır.', 'astype(np.int8) taşan değeri sessizce sarar (-254 → 2). Önce np.clip(..., -127, 127).', 'Tümü sıfır dizide ölçek 0 olur: 1.0 yap.'],
    why='İki sessiz hata birleşiyor: ölçek yalnız pozitif uçtan hesaplanınca büyük negatifler aralığın dışına taşar ve int8 dönüşümü taşan değeri hata vermeden ters işaretli bir sayıya sarar. Nicemleme kodunda her zaman mutlak değer ve açık sınırlama (clip) kullan.'))

# Hata avı 2: sızıntı
ex.append(dict(t='code', id='yerel-modeller-hf-10', stage='Hata avı', kind='bug', diff=2, needs=['scikit-learn'],
    q='<p><b>Hatayı bul ve düzelt.</b> <code>degerlendir(metinler, etiketler)</code> ilk %75\'i eğitim, son %25\'i test olarak ayırmalı (<code>k = int(len(metinler) * 0.75)</code>), <code>TfidfVectorizer</code>\'ı <b>yalnız eğitim</b> metinlerine uydurmalı, <code>LogisticRegression</code> eğitip <b>test</b> setindeki doğruluğu ve sözlük boyutunu <code>(dogruluk, sozluk_boyutu)</code> olarak döndürmeli. Rapordaki %100 doğruluk ekibi şüphelendirdi.</p>',
    start='from sklearn.feature_extraction.text import TfidfVectorizer\nfrom sklearn.linear_model import LogisticRegression\n\ndef degerlendir(metinler, etiketler):\n    vek = TfidfVectorizer()\n    X = vek.fit_transform(metinler)\n    k = int(len(metinler) * 0.75)\n    model = LogisticRegression(max_iter=1000).fit(X[:k], etiketler[:k])\n    dogruluk = model.score(X[:k], etiketler[:k])\n    return round(dogruluk, 3), len(vek.vocabulary_)\n',
    sol='from sklearn.feature_extraction.text import TfidfVectorizer\nfrom sklearn.linear_model import LogisticRegression\n\ndef degerlendir(metinler, etiketler):\n    k = int(len(metinler) * 0.75)\n    vek = TfidfVectorizer()\n    X_tr = vek.fit_transform(metinler[:k])\n    X_te = vek.transform(metinler[k:])\n    model = LogisticRegression(max_iter=1000).fit(X_tr, etiketler[:k])\n    dogruluk = model.score(X_te, etiketler[k:])\n    return round(dogruluk, 3), len(vek.vocabulary_)\n',
    tests='M = ["yemek sıcak geldi", "kurye nazik", "lezzetli yemek", "sıcak ve lezzetli", "kurye geç kaldı", "yemek soğuk", "sipariş eksik", "soğuk ve geç", "harika lezzet", "geç geldi soğuk", "paket dağılmış", "çok güzel"]\nE = ["+", "+", "+", "+", "-", "-", "-", "-", "+", "-", "-", "+"]\nd, s = degerlendir(M, E)\nassert s == 14, f"Sözlük yalnız eğitim metinlerinden kurulmalı (14 kelime); test kelimeleri (paket, dağılmış...) sızmamalı: {s}"\nassert d == 0.667, f"Doğruluk TEST setinde ölçülmeli: {d}"\n',
    hints=['İki hata: sözlük tüm metinlere uyduruluyor (test kelimeleri sızıyor) ve doğruluk eğitim setinde ölçülüyor.', 'fit_transform yalnız metinler[:k] için; test için vek.transform(metinler[k:]).'],
    why='Vektörleştiriciyi tüm veriye uydurmak test setinin kelime ve IDF bilgisini eğitime sızdırır; eğitim setinde ölçülen doğruluk ise ezberi ölçer. LLM ile karşılaştırma yaparken bu hatalar temel çizgiyi olduğundan iyi gösterir ve yanlış karara götürür.'))

# Meydan okuma 1: model seçici
ex.append(dict(t='code', id='yerel-modeller-hf-11', stage='Meydan okuma', diff=3,
    q='<p>Kurgusal bir model kataloğundan seçim yap. <code>model_sec(katalog, gpu_gb, ticari=True, dil="tr", min_baglam=0)</code>:</p><ul><li>Katalog öğesi: <code>{"ad", "param_milyar", "lisans", "diller", "baglam", "kalite"}</code>.</li><li><code>ticari=True</code> ise yalnız <code>IZINLI = {"apache-2.0", "mit"}</code> lisanslar uygun.</li><li><code>dil</code> modelin <code>diller</code> listesinde olmalı (küçük harf karşılaştırma); <code>baglam &gt;= min_baglam</code>.</li><li>Bellek: 16, 8, 4 bitten (bu sırayla) <b>sığan ilk</b> hassasiyeti seç: <code>param_milyar × bit / 8 / 1.073741824 × 1.2</code> GB (GiB + %20) <code>&lt;= gpu_gb</code>. Hiçbiri sığmıyorsa model elenir.</li><li>Sonuç: <code>[(ad, bit), ...]</code>; kaliteye göre azalan, eşitlikte daha yüksek bit (daha az kayıp), sonra daha küçük model, sonra ad.</li></ul>',
    start='IZINLI = {"apache-2.0", "mit"}\n\ndef model_sec(katalog, gpu_gb, ticari=True, dil="tr", min_baglam=0):\n    return [(m["ad"], 16) for m in katalog]\n',
    sol='IZINLI = {"apache-2.0", "mit"}\n\ndef _gb(param_milyar, bit):\n    return param_milyar * bit / 8 / 1.073741824 * 1.2\n\ndef model_sec(katalog, gpu_gb, ticari=True, dil="tr", min_baglam=0):\n    sonuc = []\n    for m in katalog:\n        if ticari and m["lisans"].lower() not in IZINLI:\n            continue\n        if dil.lower() not in [d.lower() for d in m["diller"]] or m["baglam"] < min_baglam:\n            continue\n        bit = next((b for b in (16, 8, 4) if _gb(m["param_milyar"], b) <= gpu_gb), None)\n        if bit is None:\n            continue\n        sonuc.append((m, bit))\n    sonuc.sort(key=lambda x: (-x[0]["kalite"], -x[1], x[0]["param_milyar"], x[0]["ad"]))\n    return [(m["ad"], bit) for m, bit in sonuc]\n',
    tests='K = [\n    {"ad": "kartal-8b", "param_milyar": 8, "lisans": "Apache-2.0", "diller": ["TR", "en"], "baglam": 32000, "kalite": 7},\n    {"ad": "atmaca-70b", "param_milyar": 70, "lisans": "apache-2.0", "diller": ["tr", "en"], "baglam": 128000, "kalite": 9},\n    {"ad": "serce-1b", "param_milyar": 1, "lisans": "mit", "diller": ["tr"], "baglam": 8000, "kalite": 4},\n    {"ad": "baykus-14b", "param_milyar": 14, "lisans": "cc-by-nc-4.0", "diller": ["tr", "en"], "baglam": 32000, "kalite": 8},\n    {"ad": "martı-3b", "param_milyar": 3, "lisans": "apache-2.0", "diller": ["en"], "baglam": 8000, "kalite": 6},\n    {"ad": "doğan-7b", "param_milyar": 7, "lisans": "mit", "diller": ["tr"], "baglam": 16000, "kalite": 7},\n]\nassert model_sec(K, 24) == [("doğan-7b", 16), ("kartal-8b", 16), ("serce-1b", 16)], f"NC lisans, Türkçesiz ve sığmayan elenir; aynı kalitede küçük model önce: {model_sec(K, 24)}"\nassert model_sec(K, 16) == [("doğan-7b", 16), ("kartal-8b", 8), ("serce-1b", 16)], f"16 GB\'ta 8B yalnız 8 bitte sığar; eşit kalitede yüksek bit önce: {model_sec(K, 16)}"\nassert model_sec(K, 12) == [("doğan-7b", 8), ("kartal-8b", 8), ("serce-1b", 16)], f"Kalite ve bit eşitse küçük model önce: {model_sec(K, 12)}"\nassert model_sec(K, 24, ticari=False)[0] == ("baykus-14b", 8), "Ticari değilse NC lisanslı model de aday olur"\nassert model_sec(K, 24, min_baglam=20000) == [("kartal-8b", 16)], "Bağlam filtresi"\nassert [a for a, _ in model_sec(K, 48, dil="EN")] == ["atmaca-70b", "kartal-8b", "martı-3b"], "Dil karşılaştırması büyük/küçük harf duyarsız; 70B 48 GB\'ta 4 bitte sığar"\nassert model_sec(K, 1) == [("serce-1b", 4)], "1 GB: yalnız 1B model 4 bitte sığar"\nassert model_sec(K, 0.5) == []\n',
    hints=['Her model için 16 → 8 → 4 sırasıyla sığan ilk biti next(...) ile bul.', 'Sıralama anahtarı: (-kalite, -bit, param_milyar, ad).', 'Lisans ve dil karşılaştırmasında büyük/küçük harfe dikkat.'],
    why='Gerçek seçim süreci budur: önce lisans ve dil gibi kesin elemeler, sonra donanıma sığma, sonra kalite-maliyet sıralaması. Bu kuralları kodda tutmak kararı tekrarlanabilir kılar; katalog güncellendiğinde öneri de kendiliğinden güncellenir.'))
# testi düzelt: doğru beklenen değer aşağıda b2 sonrası kontrol edilir

# Meydan okuma 2: sahte NER pipeline
NER_SOL = r'''import re
import veri

def tr_kucuk(s):
    return s.replace("I", "ı").replace("İ", "i").lower()

def sozluk_kur():
    restoran = veri.kayitlar("lezzet_kurye", "lk_restaurants")
    kurye = veri.kayitlar("lezzet_kurye", "lk_couriers")
    s = {}
    for r in restoran:
        s[tr_kucuk(r["city"])] = "LOC"
        s[tr_kucuk(r["district"])] = "LOC"
    for k in kurye:
        s[tr_kucuk(k["full_name"])] = "PER"
    for r in restoran:
        s[tr_kucuk(r["name"])] = "ORG"
    return s

def pipeline(gorev, **ayar):
    if gorev != "ner":
        raise ValueError(f"Bilinmeyen görev: {gorev}")
    sozluk = sozluk_kur()
    adlar = sorted(sozluk, key=len, reverse=True)

    def bul(metin):
        kucuk = tr_kucuk(metin)
        dolu = [False] * len(metin)
        bulunan = []
        for ad in adlar:
            for m in re.finditer(re.escape(ad), kucuk):
                b, s = m.start(), m.end()
                if (b > 0 and kucuk[b - 1].isalnum()) or (s < len(kucuk) and kucuk[s].isalnum()):
                    continue
                if any(dolu[b:s]):
                    continue
                dolu[b:s] = [True] * (s - b)
                bulunan.append({"entity_group": sozluk[ad], "word": metin[b:s], "start": b, "end": s, "score": 1.0})
        return sorted(bulunan, key=lambda e: e["start"])

    def calistir(girdi):
        return [bul(m) for m in girdi] if isinstance(girdi, list) else bul(girdi)
    return calistir
'''
ex.append(dict(t='code', id='yerel-modeller-hf-12', stage='Meydan okuma', diff=3,
    q='<p>Hugging Face <code>pipeline("ner")</code> arayüzünü taklit eden, gerçek Lezzet Kurye verisinden kurulmuş bir sözlük (gazetteer) tabanlı varlık tanıyıcı yaz.</p><ul><li><code>sozluk_kur()</code>: <code>lk_restaurants</code> şehir ve ilçeleri <code>"LOC"</code>, <code>lk_couriers.full_name</code> <code>"PER"</code>, restoran adları <code>"ORG"</code>; anahtarlar <code>tr_kucuk</code> ile küçültülmüş ad.</li><li><code>pipeline(gorev)</code>: <code>"ner"</code> dışındaki görevde <code>ValueError</code>. Döndürdüğü fonksiyon bir metin alırsa varlık listesi, metin listesi alırsa liste listesi döndürür.</li><li>Eşleştirme: küçültülmüş metinde, <b>uzun adlar önce</b>; eşleşmenin önündeki ve arkasındaki karakter harf/rakam olmamalı (kelime sınırı); daha önce işaretlenmiş karakterlerle örtüşen eşleşme atlanır.</li><li>Her varlık: <code>{"entity_group", "word": orijinal metindeki parça, "start", "end", "score": 1.0}</code>; sonuç <code>start</code>\'a göre sıralı.</li></ul>',
    start='import re\nimport veri\n\ndef tr_kucuk(s):\n    return s.replace("I", "ı").replace("İ", "i").lower()\n\ndef sozluk_kur():\n    return {}\n\ndef pipeline(gorev, **ayar):\n    def calistir(girdi):\n        return []\n    return calistir\n',
    sol=NER_SOL,
    tests='s = sozluk_kur()\nassert s["kadıköy"] == "LOC" and s["izmir"] == "LOC" and s["köşe dönercisi"] == "ORG" and s["oğuz güneş"] == "PER", "Gerçek veriden sözlük"\nner = pipeline("ner")\nm = "Kadıköy\'deki Köşe Dönercisi siparişimi Oğuz Güneş getirdi, İZMİR\'e de şube açsınlar."\nr = ner(m)\nassert [(e["entity_group"], e["word"]) for e in r] == [("LOC", "Kadıköy"), ("ORG", "Köşe Dönercisi"), ("PER", "Oğuz Güneş"), ("LOC", "İZMİR")], r\nassert r[0]["start"] == 0 and r[0]["end"] == 7 and m[r[1]["start"]:r[1]["end"]] == "Köşe Dönercisi" and r[1]["score"] == 1.0\nassert [e["word"] for e in ner("Adana Sofrası ile Esnaf Sofrası Üsküdar ve Kadıköy\'de")] == ["Adana Sofrası", "Esnaf Sofrası", "Üsküdar", "Kadıköy"]\nassert ner("Konaklama ücreti") == [], "Kelime sınırı: Konak, Konaklama içinde eşleşmemeli"\nassert ner(["Bambu güzel", "boş"]) == [[{"entity_group": "ORG", "word": "Bambu", "start": 0, "end": 5, "score": 1.0}], []], "Liste girdisi liste döndürmeli"\ntry:\n    pipeline("summarization")\n    assert False\nexcept ValueError:\n    pass\n',
    hints=['Uzun adları önce dene: sorted(sozluk, key=len, reverse=True). Böylece kısa bir ad uzun adın içinden çalınmaz.', 'tr_kucuk uzunluğu korur, bu yüzden küçük metindeki indeksler orijinal metinde de geçerlidir.', 'Örtüşme kontrolü için karakter başına bir dolu listesi tut.'],
    why='Hugging Face pipeline\'larının çıktı biçimini (entity_group, word, start, end, score) taklit etmek, ileride gerçek modele geçişi kolaylaştırır: kodun geri kalanı değişmez. Sözlük tabanlı tanıyıcı sınırlıdır ama hızlı, açıklanabilir ve kendi verinde kesindir; gerçek projelerde çoğu zaman modelin çıktısını düzeltmek için onunla birlikte kullanılır.'))

# Mini proje
MP2_START = r'''import re
import math
import veri
from collections import Counter
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline
from sklearn.model_selection import train_test_split

def tr_kucuk(s):
    return s.replace("I", "ı").replace("İ", "i").lower()

def etiket(r):
    ort = (r["food_score"] + r["courier_score"]) / 2
    return "olumlu" if ort >= 4 else ("olumsuz" if ort < 3 else "notr")

class SahteYerelLLM:
    """Sıfır atışlı (zero-shot) yerel LLM taklidi: geniş bir dil bilgisiyle etiketler, yavaştır.
    Gecikme: 40 ms + token başına 9 ms (token ≈ ceil(karakter / 3))."""
    OLUMSUZ = ["soğuk", "buz", "geç", "bekle", "yanlış", "eksik", "dökül", "dağıl", "berbat", "memnun kalmadım"]
    NOTR = ["ortalama", "porsiyon küçük", "idare eder", "fena değil"]

    def etiketle(self, yorum):
        m = tr_kucuk(yorum)
        m = m.split(" ama ")[-1]                    # "ama"dan sonrası belirleyicidir
        if any(k in m for k in self.NOTR):
            return "notr"
        if any(k in m for k in self.OLUMSUZ):
            return "olumsuz"
        return "olumlu"

    def gecikme_ms(self, yorum):
        return 40 + 9 * math.ceil(len(yorum) / 3)

YENI = [("Buz gibiydi", "olumsuz"), ("Bayıldım", "olumlu"), ("Bir saat bekledim", "olumsuz"), ("İdare eder", "notr"),
        ("Kibar bir kuryeydi", "olumlu"), ("Paket dağılmıştı", "olumsuz"), ("Fena değildi", "notr"), ("Tadı berbattı", "olumsuz")]

def makro_f1(gercek, tahmin):
    siniflar = sorted(set(gercek))
    f1ler = []
    for s in siniflar:
        tp = sum(g == s and t == s for g, t in zip(gercek, tahmin))
        fp = sum(g != s and t == s for g, t in zip(gercek, tahmin))
        fn = sum(g == s and t != s for g, t in zip(gercek, tahmin))
        f1ler.append(2 * tp / (2 * tp + fp + fn) if tp else 0.0)
    return sum(f1ler) / len(f1ler)
'''
MP2_SOL = MP2_START + r'''
def veri_hazirla():
    kayit = [r for r in veri.kayitlar("lezzet_kurye", "lk_ratings") if r["comment"]]
    X = [r["comment"] for r in kayit]
    y = [etiket(r) for r in kayit]
    return train_test_split(X, y, test_size=0.25, random_state=42, stratify=y)

def olc(tahmin_fn, X, y):
    t = [tahmin_fn(x) for x in X]
    return {"dogruluk": round(sum(a == b for a, b in zip(y, t)) / len(y), 3), "makro_f1": round(makro_f1(y, t), 3)}

def karsilastir():
    X_tr, X_te, y_tr, y_te = veri_hazirla()
    model = make_pipeline(TfidfVectorizer(preprocessor=tr_kucuk), LogisticRegression(max_iter=1000)).fit(X_tr, y_tr)
    llm = SahteYerelLLM()
    sk = lambda x: str(model.predict([x])[0])
    Xy, yy = [a for a, _ in YENI], [b for _, b in YENI]
    rapor = {
        "sklearn": {"test": olc(sk, X_te, y_te), "yeni": olc(sk, Xy, yy), "ms": 0.1},
        "llm": {"test": olc(llm.etiketle, X_te, y_te), "yeni": olc(llm.etiketle, Xy, yy),
                "ms": round(sum(llm.gecikme_ms(x) for x in X_te) / len(X_te), 1)},
    }
    fark_test = rapor["llm"]["test"]["makro_f1"] - rapor["sklearn"]["test"]["makro_f1"]
    fark_yeni = rapor["llm"]["yeni"]["makro_f1"] - rapor["sklearn"]["yeni"]["makro_f1"]
    if fark_test >= 0.05:
        karar = "llm"
    elif fark_yeni >= 0.05:
        karar = "hibrit"
    else:
        karar = "sklearn"
    rapor["karar"] = karar
    return rapor
'''
ex.append(dict(t='code', id='yerel-modeller-hf-13', stage='Mini proje', diff=3, needs=['scikit-learn'],
    q='<p><b>Lezzet Kurye: klasik model mi, yerel LLM mi?</b> Hazır: <code>etiket</code>, <code>SahteYerelLLM</code> (sıfır atışlı etiketleyici ve gecikme modeli), <code>YENI</code> (eğitim sözlüğünde hiç geçmeyen 8 yeni ifade ve etiketleri), <code>makro_f1</code>. Yazacakların:</p><ol><li><code>veri_hazirla()</code>: yorumu dolu <code>lk_ratings</code> kayıtları, <code>etiket</code> ile y, <code>train_test_split(X, y, test_size=0.25, random_state=42, stratify=y)</code> sonucunu döndür.</li><li><code>olc(tahmin_fn, X, y)</code>: <code>{"dogruluk", "makro_f1"}</code>, 3 ondalık.</li><li><code>karsilastir()</code>: TF-IDF (<code>preprocessor=tr_kucuk</code>) + <code>LogisticRegression(max_iter=1000)</code> eğit. Rapor: <code>{"sklearn": {"test": ..., "yeni": ..., "ms": 0.1}, "llm": {"test": ..., "yeni": ..., "ms": test yorumlarında ortalama gecikme (1 ondalık)}, "karar": ...}</code>. Karar: LLM test makro F1\'de en az 0.05 öndeyse <code>"llm"</code>; değilse yeni ifadelerde en az 0.05 öndeyse <code>"hibrit"</code> (sklearn önce, sözlük dışı yorum LLM\'e); değilse <code>"sklearn"</code>.</li></ol>',
    start=MP2_START + '\ndef veri_hazirla():\n    pass\n\ndef olc(tahmin_fn, X, y):\n    pass\n\ndef karsilastir():\n    pass\n',
    sol=MP2_SOL,
    tests='X_tr, X_te, y_tr, y_te = veri_hazirla()\nassert len(X_tr) == 1774 and len(X_te) == 592\nassert olc(lambda x: "olumlu", ["a", "b", "c", "d"], ["olumlu", "olumlu", "notr", "olumsuz"]) == {"dogruluk": 0.5, "makro_f1": 0.222}\nr = karsilastir()\nassert abs(r["sklearn"]["test"]["dogruluk"] - 0.892) < 0.011, r["sklearn"]\nassert r["llm"]["test"]["dogruluk"] == 0.892, f"Sıfır atışlı LLM gerçek test setinde de çoğunluk etiketini buluyor: {r[\'llm\']}"\nassert r["sklearn"]["yeni"] == {"dogruluk": 0.25, "makro_f1": 0.133}, f"Sözlük dışı ifadelerde sklearn hep \'olumlu\' der: {r[\'sklearn\'][\'yeni\']}"\nassert r["llm"]["yeni"] == {"dogruluk": 1.0, "makro_f1": 1.0}\nassert r["llm"]["ms"] == 92.6, f"Ortalama LLM gecikmesi: {r[\'llm\'][\'ms\']}"\nassert r["karar"] == "hibrit", f"Test setinde eşit, yeni ifadelerde LLM çok iyi: hibrit. Gelen {r[\'karar\']}"\n',
    hints=['olc: t = [tahmin_fn(x) for x in X]; doğruluk eşleşme oranı; makro_f1 hazır.', 'sklearn için tahmin fonksiyonu: lambda x: str(model.predict([x])[0]).', 'Karar sırası önemli: önce test farkı, sonra yeni ifade farkı.'],
    why='Bu analiz bir mülakatta ya da yönetim sunumunda tam olarak beklenen şeydir: aynı test seti, aynı ölçütler, gecikme ve genelleme ayrı ayrı. Gerçek yorumlarda iki yaklaşım eşit; LLM yaklaşık 900 kat yavaş ama yeni ifadelerde çok daha iyi. Doğru mühendislik kararı ikisini birleştirmektir.'))

faq = [
    dict(q='Bilgisayarımda GPU yok; yerel model çalıştırabilir miyim?', a='Evet. Ollama ve llama.cpp CPU\'da da çalışır; 1-3 milyar parametreli, 4 bit nicemlenmiş modeller dizüstü bilgisayarda kabul edilebilir hızdadır. 7-8B modeller CPU\'da yavaştır ama denemek için yeterlidir. Apple Silicon (M serisi) birleşik belleği sayesinde orta boy modellerde iyi performans verir.'),
    dict(q='Hangi Türkçe modeli kullanmalıyım?', a='Göreve bağlı. Sınıflandırma ve varlık tanıma için BERTurk tabanlı modeller (ince ayarla) güçlü ve küçüktür. Üretken görevler için çok dilli sohbet modellerinin Türkçe destekli olanlarını model kartından doğrula ve kendi Türkçe test setinde dene. Liste hızla değiştiği için isim ezberlemek yerine seçim ölçütlerini (lisans, boyut, dil, değerlendirme) uygula.'),
    dict(q='4 bit nicemleme kaliteyi ne kadar düşürür?', a='Gruplu yöntemlerle (Q4_K, GPTQ, AWQ) çoğu görevde kayıp küçüktür; matematik, kod ve uzun akıl yürütme gibi görevlerde daha belirgin olabilir. Karar vermeden önce kendi altın setinde fp16 ile 4 bit sürümü karşılaştır.'),
    dict(q='İnce ayar için ne kadar veri gerekir?', a='LoRA ile dar bir sınıflandırma ya da biçim görevinde birkaç yüz kaliteli örnek fark yaratabilir. Örneklerin kalitesi ve çeşitliliği sayısından önemlidir. Önce scikit-learn temel çizgisi ve istem ile LLM\'i dene; ince ayarı ancak ikisi yetmediğinde düşün.'),
    dict(q='Model kendi sunucumda çalışıyorsa KVKK sorunu kalmaz mı?', a='Veri yurt dışına ya da üçüncü tarafa aktarılmadığı için önemli bir risk kalkar ama işleme amacı, saklama süresi, erişim yetkisi ve kayıt (log) tutma gibi yükümlülükler devam eder. Modelin girdi ve çıktılarını içeren loglar da kişisel veri içerebilir.')
]
mistakes = [
    dict(bad='q = np.round(w / (w.max() / 127)).astype(np.int8)', good='olcek = np.abs(w).max() / 127\nq = np.clip(np.round(w / olcek), -127, 127).astype(np.int8)', why='Ölçek mutlak değerden hesaplanmazsa negatif uç taşar; astype(int8) taşan değeri sessizce ters işarete sarar.'),
    dict(bad='vek = TfidfVectorizer().fit(tum_metinler)\nX_tr, X_te = vek.transform(egitim), vek.transform(test)', good='model = make_pipeline(TfidfVectorizer(), LogisticRegression())\nmodel.fit(egitim, y_egitim)\nprint(model.score(test, y_test))', why='Vektörleştiriciyi tüm veriye uydurmak test bilgisini sızdırır; Pipeline bunu yapısal olarak engeller.'),
    dict(bad='duygu = pipeline("sentiment-analysis")   # varsayılan İngilizce model', good='duygu = pipeline("sentiment-analysis", model="savasy/bert-base-turkish-sentiment-cased", revision=SABIT_COMMIT)', why='Model belirtilmezse İngilizce varsayılan model iner ve Türkçe metinde anlamsız sonuç verir; sürüm sabitlenmezse sonuçlar zamanla değişebilir.'),
    dict(bad='gb = param_milyar * bit       # 8B, 16 bit → "128 GB"', good='gb = param_milyar * 1e9 * bit / 8 / 1024**3   # 8B, 16 bit → 14.9 GiB', why='Bit ile bayt karıştırılınca bellek ihtiyacı 8 kat abartılır ve gereksiz pahalı donanım seçilir.'),
    dict(bad='etiket = llm.etiketle(yorum)        # her yorum için LLM', good='etiket = model.predict([yorum])[0]\nif sozluk_disi(yorum) or guven_dusuk(yorum):\n    etiket = llm.etiketle(yorum)', why='Her kayıt için LLM çağırmak yüzlerce kat yavaş ve pahalıdır; hızlı model + zor örneklerde LLM (hibrit) çoğu zaman en iyi dengedir.')
]

lesson = dict(
    id='yerel-modeller-hf', lv='ileri', mod='Yapay Zekâ', min=70, needs=['scikit-learn', 'numpy'],
    title='Hugging Face ve yerel modellerle Python',
    sum='transformers pipeline ve tokenizer kavramından (oyuncak BPE ile) Ollama ve llama.cpp ile yerel LLM\'e, sentence-transformers\'a, boyut-lisans-Türkçe ölçütleriyle model seçimine, numpy ile nicemlemeye ve LoRA ince ayarına kadar açık model dünyasını öğrenir; gerçek Lezzet Kurye yorumlarında scikit-learn temel çizgisini sahte bir yerel LLM ile ölçerek karşılaştırırsın.',
    goals=['Hugging Face pipeline, tokenizer ve sentence-transformers\'ın ne yaptığını açıklayıp kendi makinemde kullanabilirim.',
           'BPE\'nin nasıl öğrendiğini ve Türkçe metinde token sayısının neden arttığını kodla gösterebilirim.',
           'Bir modelin belleğe sığıp sığmadığını hesaplayıp lisans ve dil desteğiyle birlikte model seçebilirim.',
           'Simetrik ve gruplu nicemlemeyi numpy ile uygulayıp LoRA\'nın parametre tasarrufunu hesaplayabilirim.',
           'scikit-learn temel çizgisini bir LLM ile aynı test setinde doğruluk, gecikme ve genelleme açısından karşılaştırıp karar verebilirim.'],
    body_here=True, body=body, ex=ex, faq=faq, mistakes=mistakes)

emit('/home/claude/py/v2/n8/yerel-modeller-hf.js', 'İleri: yerel-modeller-hf (Hugging Face ve yerel modeller)', lesson, 'scikit-learn, numpy')
