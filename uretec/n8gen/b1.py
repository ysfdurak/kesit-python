import sys
sys.path.insert(0, '.')
from lib import py, pcode, emit
from core1 import TR, KELIME, POLITIKA
import ex1
E = ex1.E

# ---------------- gövde ----------------
E4_TANI = r'''soru = "Evlilikte kaç gün izin var?"
for p, s in IDX.ara(soru, k=3):
    print(s, p["id"], p["baslik"])
print(kok_analiz(soru))
print(kok_analiz("Evlilik, doğum ve vefat durumlarında 3 güne kadar ücretli mazeret izni verilir."))'''

body = r'''
<h2>Demo RAG ile üretim RAG arasındaki fark</h2>
<p><code>llm-api</code> dersinde bir belgeyi cümlelere bölüp TF-IDF ile en ilgili cümleleri isteme koydun; <code>embedding-vektor-arama</code> dersinde getirme katmanını (embedding, BM25, RRF, recall@k) derinlemesine kurdun. Bu derste parçaları birleştirip <b>uçtan uca bir RAG uygulaması</b> (Retrieval-Augmented Generation, getirmeyle zenginleştirilmiş üretim) yazıyorsun: belge gelir, temizlenir, parçalanır, indekslenir; soru gelir, getirilir, bütçeye sığdırılır, kaynaklı cevaba dönüşür; belge değişince indeks güncellenir.</p>
<p>Senaryo: <b>Pusula İK</b> çalışanları izin, çalışma düzeni ve eğitim kurallarını soruyor. Kaynaklar kurgusal bir yönetmelik metni ile gerçek <code>pusula_ik</code> tablolarından üretilen istatistik belgeleri; ürün sorularını da sınamak için <code>anadolu_market</code> ürünlerinden kısa ürün kartları ekliyoruz.</p>
<div class="tbl-wrap"><table>
<tr><th>Hat</th><th>Adımlar</th><th>Ne zaman çalışır?</th></tr>
<tr><td>İndeksleme (çevrim dışı)</td><td>yükle → temizle → parçala → meta veri ekle → vektörleştir → indeksle</td><td>Belge eklenince, değişince, silinince</td></tr>
<tr><td>Sorgu (çevrim içi)</td><td>soru → getir (hibrit) → yeniden sırala → bağlam bütçesi → istem → LLM → atıf denetimi → cevap</td><td>Her soruda, milisaniyeler içinde</td></tr>
</table></div>

<h2>1. Belge yükleme ve temizleme</h2>
<p>Gerçek belgeler PDF, HTML, Word ya da wiki sayfası olarak gelir ve içinde gürültü taşır: HTML etiketleri, <code>&amp;amp;</code> gibi kaçışlar, sayfa numaraları, her sayfada tekrar eden "Kurum içi - Gizli" altbilgisi, çift boşluklar. Bu gürültü hem parçaları şişirir hem de aramayı bozar. Bir de görünmez tuzak var: aynı "ü" harfi tek karakter (NFC) ya da "u + iki nokta" (NFD) olarak gelebilir; normalleştirmezsen iki metin eşit görünür ama eşleşmez.</p>
''' + py(E[0]) + r'''
<p>Her belge bir <b>kimlik</b>, temiz metin ve <b>meta veri</b> (metadata) taşır: kaynak dosya, tür, tarih ve en önemlisi <b>erişim</b> bilgisi. <code>parmak_izi</code> metnin özetidir; belge yeniden geldiğinde değişip değişmediğini bununla anlarsın. Şimdi korpusu gerçek veriyle kuralım:</p>
''' + py(E[1]) + r'''
<div class="tip"><b>Kendi bilgisayarında dene: PDF ve Word</b>Tarayıcıda PDF okuyucu yok; kendi makinende <code>pip install pypdf python-docx</code> ile <code>PdfReader("yonetmelik.pdf").pages[i].extract_text()</code> ve <code>Document("form.docx").paragraphs</code> kullanırsın. Taranmış (resim) PDF'ler için OCR gerekir; tablo içeren PDF'lerde metin sırası bozulabileceği için çıktıyı mutlaka gözle kontrol et.</div>

<h2>2. Parçalama ve meta veri</h2>
<p>Parçalama stratejilerini (sabit pencere, cümle, başlık, örtüşme) embedding dersinde ayrıntılı gördün. Üretimde bunları <b>birleştirirsin</b>: önce başlıklara göre bölümlere ayır, bölüm içinde cümleleri karakter sınırına kadar topla, ardışık parçalar arasında bir cümle örtüştür. En önemli iki ek:</p>
<ul>
<li><b>Başlık yolu</b> ("İzin yönetmeliği &gt; Hastalık izni") her parçaya eklenir. "Raporsuz 3 gündür" cümlesi tek başına hangi izinden söz ettiğini söylemez; başlık söyler.</li>
<li><b>Kararlı kimlik</b>: <code>belge_id#sıra</code>. Atıf, güncelleme ve silme bu kimlikle yapılır.</li>
</ul>
''' + py(E[2]) + r'''
<div class="tbl-wrap"><table>
<tr><th>Strateji</th><th>Güçlü yanı</th><th>Zayıf yanı</th><th>Uygun belge</th></tr>
<tr><td>Sabit pencere + örtüşme</td><td>Basit, her metinde çalışır</td><td>Cümleyi ortadan böler</td><td>Yapısız düz metin, log</td></tr>
<tr><td>Cümle tabanlı</td><td>Anlam bütünlüğü korunur</td><td>Kısaltmalar ("vb.") bölmeyi bozar</td><td>Haber, e-posta</td></tr>
<tr><td>Başlık tabanlı</td><td>Bağlam (başlık yolu) korunur</td><td>Bölümler çok uzun ya da çok kısa olabilir</td><td>Yönetmelik, wiki, dokümantasyon</td></tr>
<tr><td>Başlık + cümle (hibrit)</td><td>İkisinin iyi yanları</td><td>Biraz daha kod</td><td>Kurumsal belgelerin çoğu</td></tr>
</table></div>

<h2>3. İndeks: TF-IDF ve sahte embedding ile hibrit arama</h2>
<p>İki sinyal kullanıyoruz: <b>kelime</b> sinyali (TF-IDF; "KVKK", ürün kodu gibi tam eşleşmelerde güçlü) ve <b>vektör</b> sinyali (embedding; yazım farkı ve anlam yakınlığında güçlü). Tarayıcıda gerçek embedding modeli çalıştıramadığımız için harf üçlülerinden üretilen <b>sahte embedding</b> kullanıyoruz; arayüz gerçeğiyle aynı (metin → normalize vektör). Türkçe eklemeli bir dil olduğu için TF-IDF'e kaba bir kök bulucu veriyoruz: kelimenin ilk 5 harfi. Bu basit yöntem Türkçe bilgi erişiminde şaşırtıcı derecede iyi sonuç verir.</p>
''' + py(E[3]) + r'''
<p><code>filtre</code> parametresine dikkat: yetki ve meta veri filtresi sıralamadan <b>önce</b> uygulanır (embedding dersindeki kural). Örneğin İK dışındaki bir çalışan için <code>filtre=lambda m: m["erisim"] == "tum_calisanlar"</code> istatistik belgelerini hiç göstermez.</p>

<h3>Yeniden sıralama ve hata analizi</h3>
<p>Üretimde ilk aşama 20–50 aday getirir, bir <b>çapraz kodlayıcı</b> (cross-encoder) soru ile her adayı birlikte okuyup en iyi 3–5'ini seçer. Ama önce sistemin nerede yanıldığını görmelisin. Şu soruda ilk sonuç yanlış:</p>
''' + py(E4_TANI) + r'''
<p>Teşhis: kaba kök "izni" ile "izin"i, "güne" ile "gün"ü eşleştiremiyor; yıllık izin parçası "izin" ve "gün" kelimeleriyle kazanıyor. Çözüm seçenekleri: gerçek bir morfolojik çözümleyici (Zemberek gibi), gerçek embedding modeli ya da çapraz kodlayıcı. Bu tür hataları ancak bir <b>altın soru seti</b> ile yakalarsın; değerlendirme ölçütlerini <code>llm-degerlendirme</code> dersinde ayrıntılı göreceksin.</p>
''' + pcode(r'''# pip install sentence-transformers   (Kendi bilgisayarında dene)
from sentence_transformers import CrossEncoder
model = CrossEncoder("cross-encoder/mmarco-mMiniLMv2-L12-H384-v1")   # çok dilli
adaylar = IDX.ara(soru, k=20)
puanlar = model.predict([(soru, parca_metni(p)) for p, _ in adaylar])
en_iyi = [p for (p, _), s in sorted(zip(adaylar, puanlar), key=lambda x: -x[1])][:4]''') + r'''

<h2>4. Bağlam penceresi bütçesi</h2>
<p>Modelin bağlam penceresi büyük olsa da her parça token, yani para ve gecikme demektir. Üstelik alakasız parçalar gürültü katar ve modeller uzun bağlamın <b>ortasındaki</b> bilgiyi daha sık kaçırır. Bu yüzden getirilen parçaları bir <b>token bütçesine</b> sığdırırsın: skor sırasıyla ekle, sığmayanı atla, aynı metni iki kez koyma.</p>
''' + py(E[5]) + r'''
<p>Bütçe şöyle hesaplanır: <code>pencere - sistem istemi - soru - sohbet geçmişi - cevap için ayrılan</code>. Token tahmini için <code>llm-api</code> dersindeki "4 karakter ≈ 1 token" kuralını kullandık; Türkçede gerçek oran daha yüksektir, üretimde modelin kendi tokenizer'ı ile say (bunu <code>yerel-modeller-hf</code> dersinde göreceksin).</p>

<h2>5. İstem birleştirme, kaynak gösterme ve "bilmiyorum"</h2>
<p>İstem üç şey söyler: yalnız kaynaklara dayan, her iddiaya <b>[n]</b> atfı koy, cevap yoksa "Bilmiyorum." de. İstem şablonu yazma tekniklerini <code>prompt-muhendisligi</code> dersinde ayrıntılı göreceksin; burada önemli olan <b>kodun</b> modelin sözüne güvenmemesi. İki savunma hattı kurarsın:</p>
<ol>
<li><b>Getirmeden önce</b>: en iyi skor eşiğin altındaysa modeli hiç çağırma. Hem halüsinasyonu hem maliyeti keser.</li>
<li><b>Üretimden sonra</b>: cevapta atıf yoksa ya da var olmayan bir kaynağa ([7] gibi) atıf varsa cevabı reddet.</li>
</ol>
''' + py(E[6]) + r'''
<p>İkinci soru yönetmelikte yok ama yine de bir cevap geldi: "verilir" kelimesi mazeret izni parçasıyla eşleşti ve skor 0.25 eşiğini geçti. Eşiği 0.35'e çıkarırsan <code>cevapla("Şirket aracı kimlere verilir?", llm, esik=0.35)</code> "Bilmiyorum." döndürür. Eşik sezgiyle değil, altın setteki cevaplı ve cevapsız sorularla <b>ölçerek</b> seçilir; çok yüksek eşik de doğru soruları reddeder.</p>
<div class="warn"><b>Atıf, doğruluk garantisi değildir</b>Model doğru kaynağa atıf yapıp cümleyi yine de çarpıtabilir. Atıf denetimi "var olmayan kaynak" hatasını yakalar; içeriğin kaynakla tutarlılığını (sadakat, faithfulness) ölçmek değerlendirme işidir.</div>

<h2>6. Önbellek</h2>
<p>İK asistanına aynı sorular tekrar tekrar gelir. Önbellek anahtarı soru metninin <b>normalleştirilmiş</b> hâli ve <b>indeks sürümü</b>nden oluşur; böylece belge güncellenince eski cevaplar kendiliğinden geçersiz olur.</p>
''' + py(E[7]) + r'''
<p>Üç katman önbellek vardır: <b>embedding önbelleği</b> (aynı metni iki kez vektörleştirme), <b>getirme önbelleği</b> (soru → parça kimlikleri) ve <b>cevap önbelleği</b>. Cevap önbelleğini kullanıcıya özel içerikte (ör. "benim izin bakiyem") kullanma; anahtara kullanıcı ya da yetki grubunu ekle. Sağlayıcıların <b>istem önbelleği</b> (prompt caching) ise sabit sistem istemini ucuzlatır; ikisi birbirinin yerine geçmez.</p>

<h2>7. Güncelleme ve silme</h2>
<p>Belge değişince en sık yapılan hata yeni parçaları eskilerin üzerine yazmaktır: yeni sürüm daha kısaysa eski parçaların bir kısmı indekste <b>hayalet</b> olarak kalır ve model artık geçerli olmayan kuralı söyler. Doğru yol belge düzeyinde düşünmektir: parmak izi aynıysa hiçbir şey yapma; değiştiyse belgenin <b>tüm</b> eski parçalarını sil, yenilerini ekle, sürümü artır.</p>
''' + py(E[8]) + r'''
<p>Silme de aynı yoldan geçer; KVKK kapsamında "unutulma hakkı" talebi geldiğinde ilgili belgenin parçaları, vektörleri ve önbellek kayıtları birlikte silinmelidir. Vektör veritabanlarında bunun için parçalara <code>belge_id</code> meta verisi koyup "bu belge kimliğine sahip her şeyi sil" filtresiyle silersin.</p>

<h2>8. FastAPI uç noktası</h2>
<p>Asistanı bir web servisine çevirmek <code>fastapi</code> dersindeki kalıplarla birkaç satırdır. İstek ve cevabı pydantic ile tanımla, indeksi uygulama başlarken bir kez yükle:</p>
''' + pcode(r'''# pip install fastapi uvicorn scikit-learn numpy     (Kendi bilgisayarında dene)
# Çalıştır: uvicorn rag_api:app --reload   →   http://127.0.0.1:8000/docs
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

app = FastAPI(title="Pusula İK Asistanı")
llm = GercekLLMIstemcisi()            # llm-api dersindeki sağlayıcıdan bağımsız istemci
onbellek = OnbellekliRAG(lambda s: cevapla(s, llm, esik=0.35))

class Soru(BaseModel):
    soru: str = Field(min_length=3, max_length=500)

class Cevap(BaseModel):
    cevap: str
    kaynaklar: list[str]
    neden: str

@app.post("/sor", response_model=Cevap)
def sor(istek: Soru):
    return onbellek.sor(istek.soru)

@app.post("/belgeler/{belge_id}")
def belge_yukle(belge_id: str, metin: str):
    durum = canli.yukle(Belge(belge_id, temizle(metin), {"erisim": "tum_calisanlar"}))
    onbellek.surum = canli.surum
    return {"durum": durum, "surum": canli.surum}

@app.delete("/belgeler/{belge_id}")
def belge_sil(belge_id: str):
    if belge_id not in canli.belgeler:
        raise HTTPException(404, "belge yok")
    canli.sil(belge_id)
    onbellek.surum = canli.surum
    return {"silindi": belge_id}''') + r'''

<h2>9. LangChain ve LlamaIndex ile karşılaştırma</h2>
<p>Bu derste her adımı elle yazdın; çerçeveler aynı adımları hazır bileşenlerle sunar. Aynı hattın LangChain hâli:</p>
''' + pcode(r'''# pip install langchain langchain-community langchain-text-splitters faiss-cpu langchain-huggingface
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS

bolucu = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=80)
parcalar = bolucu.create_documents([POLITIKA], metadatas=[{"kaynak": "ik_politika.md"}])
emb = HuggingFaceEmbeddings(model_name="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2")
db = FAISS.from_documents(parcalar, emb)
getirici = db.as_retriever(search_kwargs={"k": 4})
for d in getirici.invoke("Raporsuz hastalık izni kaç gün?"):
    print(d.metadata, d.page_content[:60])''') + r'''
<p>LlamaIndex ise belge odaklıdır; yükleme, indeks ve sorgu motoru tek akışta gelir:</p>
''' + pcode(r'''# pip install llama-index llama-index-embeddings-huggingface
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader, Settings
from llama_index.embeddings.huggingface import HuggingFaceEmbedding

Settings.embed_model = HuggingFaceEmbedding(model_name="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2")
belgeler = SimpleDirectoryReader("politikalar/").load_data()     # PDF, docx, md
indeks = VectorStoreIndex.from_documents(belgeler)
motor = indeks.as_query_engine(similarity_top_k=4)               # Settings.llm ile model seçilir
yanit = motor.query("Raporsuz hastalık izni kaç gün?")
print(yanit, [n.node.metadata for n in yanit.source_nodes])''') + r'''
<div class="tbl-wrap"><table>
<tr><th></th><th>Elle (bu ders)</th><th>LangChain</th><th>LlamaIndex</th></tr>
<tr><td>Odak</td><td>Tam kontrol, az bağımlılık</td><td>Genel LLM uygulama bileşenleri, zincirler</td><td>Belge yükleme, indeksleme, sorgu motorları</td></tr>
<tr><td>Parçalama</td><td>Kendi kuralın (başlık + cümle)</td><td><code>RecursiveCharacterTextSplitter</code> vb.</td><td><code>SentenceSplitter</code>, düğüm ayrıştırıcıları</td></tr>
<tr><td>Atıf ve "bilmiyorum"</td><td>Açıkça kodda</td><td>İstem + çıktı ayrıştırıcı ile senin işin</td><td><code>source_nodes</code> hazır; eşik senin işin</td></tr>
<tr><td>Ne zaman?</td><td>Küçük-orta sistem, öğrenme, sıkı denetim</td><td>Çok bileşenli akışlar, ajanlar (LangGraph)</td><td>Çok sayıda belge kaynağı, hızlı prototip</td></tr>
</table></div>
<p>Çerçeve seçsen de bu derste yazdığın parçaları anlaman gerekir: hata ayıklarken "hangi parça neden geldi, neden bütçeye girmedi, atıf neden reddedildi" sorularını cevaplayabilmelisin.</p>

<div class="note"><b>Gerçek işte</b>Kurum içi RAG projeleri en çok üç yerde zorlanır: belge kalitesi (taranmış PDF'ler, eski sürümler), yetki (herkesin her belgeyi görmemesi) ve güncellik (yürürlükten kalkmış kuralın cevapta çıkması). Başarılı ekipler belge sahiplerini (İK, hukuk) sürece katar, her belgeye geçerlilik tarihi ve sahibi meta verisi koyar, "Bilmiyorum" cevaplarını kaydedip hangi belgenin eksik olduğunu düzenli raporlar.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Ebeveyn-çocuk parçalar</h3>
<p>Küçük parçalarla ara (isabet artar), modele parçanın ait olduğu büyük bölümü ya da komşu parçaları ver (bağlam artar). Meydan okuma alıştırmasında komşu parça genişletmeyi yazacaksın.</p>
<h3>Sorgu dönüşümü</h3>
<p>Sohbette "peki ya ücretsiz olanı?" sorusu tek başına aranamaz; önce geçmişle birlikte bağımsız bir soruya yeniden yazılır. HyDE yaklaşımında model önce varsayımsal bir cevap yazar, arama o cevapla yapılır.</p>
<h3>Değerlendirme hattı</h3>
<p>Getirme (recall@k, MRR), cevap sadakati, atıf doğruluğu ve ret oranını ayrı ayrı ölç; her indeks ya da istem değişikliğinde altın seti otomatik çalıştır. Ölçütlerin ayrıntısı <code>llm-degerlendirme</code> dersinde.</p>
<h3>Ne zaman RAG yetmez?</h3>
<p>"Geçen yıl kaç gün hastalık izni kullanıldı?" gibi toplama soruları metin aramasıyla değil SQL ile cevaplanır; bu soruları bir yönlendirici ile text-to-SQL ajanına (<code>llm-ajanlar</code>) gönder.</p>
</section>
'''

# ---------------- alıştırmalar ----------------
PARCALA_KODU = r'''import re

def cumleler(metin):
    return [c for c in re.split(r"(?<=[.!?])\s+", metin.strip()) if c]
'''

ex = []
ex.append(dict(t='mc', stage='Isınma',
    q='Pusula İK asistanı, yönetmelikte hiç geçmeyen "Şirket aracı kimlere verilir?" sorusuna kendinden emin bir cevap uyduruyor. İlk ve en etkili önlem hangisi?',
    o=['Daha büyük bir modele geçip sıcaklık (temperature) değerini yükseltmek',
       'En iyi getirme skoru eşiğin altındaysa modeli çağırmadan "Bilmiyorum." demek',
       'Her soruda tüm yönetmeliği ve tüm ürün kataloğunu isteme eklemek',
       'Modeli yönetmelik metniyle ince ayar (fine-tuning) yaparak yeniden eğitmek'],
    a=1, why='Kaynak yoksa modelin uydurma fırsatı da olmamalı. Eşik kontrolü hem halüsinasyonu hem de gereksiz model maliyetini keser; eşik altın setle ölçülerek seçilir. İnce ayar bilgi eklemek için güvenilir bir yol değildir ve güncellemesi zordur.'))
ex.append(dict(t='mc', stage='Isınma',
    q='Yönetmelik güncellendi; "Hastalık izni" bölümü kısaldı ve artık 3 yerine 2 parça üretiyor. İndeksi güncellemenin doğru yolu hangisi?',
    o=['Yeni parçaları eklemek yeter; eski parçalar zamanla düşük skor alır',
       'Belgenin tüm eski parçalarını silmek, yenilerini eklemek, sürümü artırmak',
       'Yalnız aynı kimliğe sahip parçaların üzerine yazmak yeterli olur',
       'Artımlı güncelleme mümkün olmadığından her gece sıfırdan kurmak'],
    a=1, why='Üzerine yazmak, yeni sürümde olmayan 3. parçayı hayalet olarak bırakır. Belge düzeyinde sil-ekle (upsert) ve sürüm artırma hem hayaletleri hem de eski önbellek kayıtlarını temizler.'))
ex.append(dict(t='mc', stage='Isınma',
    q='Modelin bağlam penceresi 200 bin token. Yine de getirdiğin en alakalı 50 parçanın hepsini isteme koymaman gerekir. Neden?',
    o=['Model teknik olarak 10\'dan fazla kaynak numarasını okuyamaz',
       'Maliyet ve gecikme artar, gürültü cevabı bozar, ortadaki bilgi kaçabilir',
       'TF-IDF skorları 10 parçadan sonra her zaman sıfıra yaklaşır',
       'Atıf numaralarının tek haneli olması API tarafından zorunludur'],
    a=1, why='Her token ücretlidir ve gecikme ekler; alakasız parçalar modeli yanlış kaynağa yöneltebilir ve uzun bağlamın ortasındaki bilgi daha sık gözden kaçar. Bu yüzden bütçeli seçim yapılır.'))
ex.append(dict(t='predict', stage='Kodu oku',
    q='Sabit pencere ve örtüşmeyle kelime parçalama. Bu kod ne yazdırır?',
    code='kelimeler = "a b c d e f g".split()\nboyut, ortusme = 3, 1\nadim = boyut - ortusme\nparcalar = [" ".join(kelimeler[i:i + boyut]) for i in range(0, len(kelimeler), adim)]\nprint(parcalar)\n',
    o=["['a b c', 'c d e', 'e f g', 'g']", "['a b c', 'c d e', 'e f g']", "['a b c', 'd e f', 'g']", "['a b c', 'b c d', 'c d e']"],
    a=0, why='Adım 2 olduğu için pencereler 0, 2, 4 ve 6\'da başlar. Son pencere yalnız "g"den oluşur ve önceki parçanın içinde zaten var: gereksiz bir kuyruk parçası. Döngüyü, pencere metnin sonuna ulaşınca durdurmak gerekir.'))
ex.append(dict(t='predict', stage='Kodu oku',
    q='Model cevabındaki atıfları denetleyen kod. Kaynak sayısı 3. Ne yazdırır?',
    code='import re\ncevap = "Raporsuz izin 3 gündür [2]. Rapor 2 iş günü içinde iletilir [1][4]."\natif = [int(x) for x in re.findall(r"\\[(\\d+)\\]", cevap)]\nn_kaynak = 3\nprint(atif, [a for a in atif if not 1 <= a <= n_kaynak])\n',
    o=['[2, 1, 4] [4]', '[2, 1, 4] []', '[2, 3, 2, 1, 4] [4]', "['2', '1', '4'] ['4']"],
    a=0, why='Desen yalnız köşeli parantez içindeki sayıları yakalar ("3 gündür" ve "2 iş günü" eşleşmez). int ile sayıya çevrilir; 4 numaralı kaynak yok, yani model var olmayan bir kaynağa atıf yapmış: bu cevap reddedilmeli.'))
ex.append(dict(t='predict', stage='Kodu oku',
    q='Önbellek anahtarı üreten kod Türkçe metinle çalışıyor. Ne yazdırır?',
    code='import re\n\ndef anahtar(soru, surum):\n    return f"v{surum}|" + " ".join(re.findall(r"\\w+", soru.lower()))\n\na = anahtar("Yıllık izin kaç gün?", 1)\nb = anahtar("  yıllık İZİN kaç gün", 1)\nc = anahtar("Yıllık izin kaç gün?", 2)\nprint(a == b, a == c)\n',
    o=['False False', 'True False', 'True True', 'False True'],
    a=0, why='"İ".lower() Python\'da "i" + birleşen nokta (U+0307) üretir; \\w bu noktayı kelime karakteri saymaz ve "İZİN" parçalanır. Bu yüzden a ile b eşleşmez (önbellek ıskalar). Sürüm farklı olduğu için a ile c de farklıdır; bu ise istenen davranış. Çözüm: tr_kucuk ile önce İ→i, I→ı dönüşümü.'))
ex.append(dict(t='order', stage='Kodu oku',
    q='<p>Getirme skorlarına göre "Bilmiyorum" kararını veren ve eşiği geçen parçaları numaralı kaynak listesine çeviren programın satırlarını sırala.</p>',
    lines=['SKOR = {"izin#0": 0.61, "izin#2": 0.34, "urun-1#0": 0.12}',
           'sirali = sorted(SKOR, key=SKOR.get, reverse=True)',
           'if SKOR[sirali[0]] < 0.35:',
           '    print("Bilmiyorum.")',
           'else:',
           '    secilen = [p for p in sirali if SKOR[p] >= 0.3]',
           '    print("Kaynaklar:", ", ".join(f"[{i}] {p}" for i, p in enumerate(secilen, 1)))'],
    expect='Kaynaklar: [1] izin#0, [2] izin#2\n',
    hint='Önce skorlar ve sıralama; sonra en iyi skora göre karar; else bloğunda seçim ve numaralandırma.',
    why='"Bilmiyorum" kararı en iyi skora göre verilir; eşiği geçen parçalar 1\'den başlayarak numaralanır ki model [1], [2] diye atıf yapabilsin.'))

# Rehberli 1: temizle
ex.append(dict(t='code', id='rag-uygulamasi-1', stage='Rehberli', diff=1,
    q='<p><code>temizle(ham)</code>: Yönetmelik HTML\'den kopyalanmış. Şu sırayla temizle ve satırları <code>"\\n"</code> ile birleştirip döndür:</p><ol><li>HTML etiketlerini (<code>&lt;...&gt;</code>) boşlukla değiştir, <code>html.unescape</code> uygula, <code>unicodedata.normalize("NFC", ...)</code> ile normalleştir.</li><li>Her satırda boşluk dizilerini (<code>\\s+</code>) tek boşluğa indir, baştan/sondan kırp.</li><li>Boş satırları ve altbilgileri at: Türkçe küçük harfe çevrilmiş satır <code>sayfa N / M</code> desenine uyuyorsa ya da <code>"kurum içi - gizli"</code> ise.</li><li>Bir satır, çıktıya en son eklenen satırla aynıysa ekleme (sayfa sonu altbilgileri atıldıktan sonra yan yana gelen tekrar satırları).</li></ol>',
    guide=['Etiketleri re.sub(r"<[^>]+>", " ", ham) ile boşluğa çevir; sonra html.unescape ve NFC.',
           'splitlines() ile satırları gez; re.sub(r"\\s+", " ", s).strip().',
           'Altbilgi kontrolü için tr_kucuk(s) ile re.fullmatch(r"sayfa \\d+ / \\d+", ...) kullan.',
           'Son eklenen satırla aynıysa ekleme (sonuc and sonuc[-1] == s).'],
    example='import html, unicodedata\nprint(html.unescape("Ar&amp;Ge &nbsp;birimi"))\nprint(len("u\\u0308"), len(unicodedata.normalize("NFC", "u\\u0308")))\n',
    start=TR + 'import re, html, unicodedata\n\ndef temizle(ham):\n    metin = re.sub(r"<[^>]+>", " ", ham)\n    # TODO: unescape + NFC\n    satirlar = []\n    for s in metin.splitlines():\n        # TODO: boşlukları sadeleştir, boş/altbilgi/ardışık tekrar satırları atla\n        satirlar.append(s)\n    return "\\n".join(satirlar)\n',
    sol=TR + 'import re, html, unicodedata\n\ndef temizle(ham):\n    metin = re.sub(r"<[^>]+>", " ", ham)\n    metin = unicodedata.normalize("NFC", html.unescape(metin))\n    satirlar = []\n    for s in metin.splitlines():\n        s = re.sub(r"\\s+", " ", s).strip()\n        if not s:\n            continue\n        k = tr_kucuk(s)\n        if re.fullmatch(r"sayfa \\d+ / \\d+", k) or k == "kurum içi - gizli":\n            continue\n        if satirlar and satirlar[-1] == s:\n            continue\n        satirlar.append(s)\n    return "\\n".join(satirlar)\n',
    tests='ham = "<h2>Hastalık  izni</h2>\\n<p>Rapor\\t2 iş günü &amp; içinde.</p>\\n\\nSAYFA 1 / 3\\nKurum İçi - Gizli\\n<p>Rapor 2 iş günü &amp; içinde.</p>\\n"\nassert temizle(ham) == "Hastalık izni\\nRapor 2 iş günü & içinde.", f"Altbilgiler ve ardışık tekrar atılmalı: {temizle(ham)!r}"\nassert temizle("Gu\\u0308nlu\\u0308k izin") == "Günlük izin", "NFD (u + iki nokta) NFC\'ye çevrilmeli; yoksa arama eşleşmez"\nassert temizle("A\\nB\\nA") == "A\\nB\\nA", "Yalnız ARDIŞIK tekrarlar atılır"\nimport veri\nurunler = veri.kayitlar("anadolu_market", "products")[:3]\nhtml_liste = "<ul>" + "".join(f"<li>{u[\'name\']}&nbsp;-&nbsp;{u[\'price\']:.0f} TL</li>\\n" for u in urunler) + "</ul>"\nassert temizle(html_liste).splitlines() == ["Kablosuz Kulaklık - 1299 TL", "Akıllı Saat - 3499 TL", "Bluetooth Hoparlör - 899 TL"], f"Gerçek ürün listesi: {temizle(html_liste)!r}"\n',
    hints=['&nbsp; unescape sonrası \\xa0 olur; \\s+ onu da yakalar.', 'Altbilgi karşılaştırmasını tr_kucuk ile yap: "Kurum İçi" → "kurum içi".', 'Ardışık tekrar: if satirlar and satirlar[-1] == s: continue'],
    why='Temizleme, getirme kalitesinin görünmeyen yarısıdır: tekrar eden altbilgiler her parçaya aynı gürültüyü ekler, NFD harfler eşleşmeyi bozar. Temizliği indekslemeden önce, tek bir fonksiyonda yaparsın ki sorgu ve belge aynı kurallardan geçsin.'))

# Rehberli 2: sabit pencere + meta
ex.append(dict(t='code', id='rag-uygulamasi-2', stage='Rehberli', diff=2,
    q='<p><code>pencere_parcala(belge_id, metin, meta, boyut=40, ortusme=10)</code>: metni boşluklardan kelimelere böl, <code>adim = boyut - ortusme</code> ile pencereler oluştur. Her parça bir sözlük: <code>{"id": f"{belge_id}#{n}", "belge_id": belge_id, "metin": ..., "baslangic": i, "meta": meta\'nın KOPYASI}</code>. Pencere metnin sonuna ulaştığında dur (gereksiz kuyruk parçası üretme). <code>ortusme &gt;= boyut</code> ya da <code>ortusme &lt; 0</code> ise <code>ValueError</code>; boş metin <code>[]</code>.</p>',
    guide=['Parametreleri doğrula ve kelimeleri metin.split() ile al.',
           'i = 0\'dan başlayıp her turda i += adim ile ilerle.',
           'Her turda parçayı ekle; i + boyut >= len(kelimeler) ise döngüyü kır.',
           'meta için dict(meta) kullan: her parçanın kendi kopyası olsun.'],
    example='k = list(range(7))\ni = 0\nwhile True:\n    print(k[i:i + 3])\n    if i + 3 >= len(k):\n        break\n    i += 2\n',
    start='def pencere_parcala(belge_id, metin, meta, boyut=40, ortusme=10):\n    kelimeler = metin.split()\n    parcalar = []\n    # TODO: doğrulama, pencere döngüsü, durma koşulu, meta kopyası\n    return parcalar\n',
    sol='def pencere_parcala(belge_id, metin, meta, boyut=40, ortusme=10):\n    if ortusme < 0 or ortusme >= boyut:\n        raise ValueError("ortusme 0 ile boyut-1 arasında olmalı")\n    kelimeler = metin.split()\n    parcalar, i, adim = [], 0, boyut - ortusme\n    while kelimeler:\n        parcalar.append({"id": f"{belge_id}#{len(parcalar)}", "belge_id": belge_id,\n                         "metin": " ".join(kelimeler[i:i + boyut]), "baslangic": i, "meta": dict(meta)})\n        if i + boyut >= len(kelimeler):\n            break\n        i += adim\n    return parcalar\n',
    tests=POLITIKA + 'p = pencere_parcala("pusula", POLITIKA, {"erisim": "tum"}, boyut=40, ortusme=10)\nn = len(POLITIKA.split())\nassert n == 154 and len(p) == 5, f"154 kelime, adım 30: 5 parça beklenir (120 + 40 >= 154), gelen {len(p)}"\nassert [x["baslangic"] for x in p] == [0, 30, 60, 90, 120]\nassert p[1]["metin"].split()[:10] == p[0]["metin"].split()[-10:], "Ardışık parçalar 10 kelime paylaşmalı"\nassert p[-1]["metin"].split()[-1] == POLITIKA.split()[-1], "Son parça metnin son kelimesini içermeli"\nassert p[0]["id"] == "pusula#0" and p[4]["id"] == "pusula#4"\np[0]["meta"]["erisim"] = "ik"\nassert p[1]["meta"]["erisim"] == "tum", "Her parçanın meta sözlüğü ayrı kopya olmalı"\nassert [x["metin"] for x in pencere_parcala("x", "a b c d e f g", {}, 3, 1)] == ["a b c", "c d e", "e f g"], "Gereksiz \'g\' kuyruğu olmamalı"\nassert pencere_parcala("x", "", {}) == []\nfor b, o in [(5, 5), (5, 7), (5, -1)]:\n    try:\n        pencere_parcala("x", "a b", {}, b, o)\n        assert False, f"boyut={b}, ortusme={o} ValueError vermeli"\n    except ValueError:\n        pass\n',
    hints=['Döngüyü while ile kur; for range(0, n, adim) kuyruk üretir.', 'Durma koşulu: if i + boyut >= len(kelimeler): break', 'meta kopyası: "meta": dict(meta)'],
    why='Sabit pencere her metinde çalışan güvenli bir varsayılandır. Kararlı kimlik (belge_id#n) atıf, güncelleme ve silmeyi mümkün kılar; meta kopyası ise bir parçanın meta verisini değiştirmenin diğerlerini bozmamasını sağlar.'))

# Rehberli 3: bağlam bütçesi
ex.append(dict(t='code', id='rag-uygulamasi-3', stage='Rehberli', diff=2,
    q='<p><code>baglam_sec(sonuclar, butce, belge_basina=2)</code>: <code>sonuclar</code> skor sırasına göre azalan <code>(parca, skor)</code> listesi; parça <code>{"id", "belge_id", "metin"}</code> içerir. Token tahmini <code>math.ceil(len(metin) / 4)</code>. Sırayla gez ve parçayı şu durumlarda <b>atla</b>: aynı metin zaten seçildi, aynı belgeden zaten <code>belge_basina</code> parça seçildi ya da eklenirse toplam bütçeyi aşacak (atla ama sonrakilere bakmaya devam et). <code>(secilen_parcalar, toplam_token)</code> döndür.</p>',
    guide=['secilen listesi, toplam sayacı, görülen metinler kümesi ve belge sayacı (Counter) tut.',
           'Her parça için token tahminini hesapla.',
           'Üç atlama koşulunu continue ile uygula.',
           'Eklenince sayaçları güncelle.'],
    example='from collections import Counter\nsay = Counter()\nfor b in ["a", "a", "b", "a"]:\n    if say[b] >= 2:\n        continue\n    say[b] += 1\nprint(say)\n',
    start='import math\nfrom collections import Counter\n\ndef baglam_sec(sonuclar, butce, belge_basina=2):\n    secilen, toplam = [], 0\n    for parca, skor in sonuclar:\n        t = math.ceil(len(parca["metin"]) / 4)\n        # TODO: tekrar, belge sınırı ve bütçe kontrolleri\n        secilen.append(parca)\n        toplam += t\n    return secilen, toplam\n',
    sol='import math\nfrom collections import Counter\n\ndef baglam_sec(sonuclar, butce, belge_basina=2):\n    secilen, toplam = [], 0\n    gorulen, belge_say = set(), Counter()\n    for parca, skor in sonuclar:\n        t = math.ceil(len(parca["metin"]) / 4)\n        if parca["metin"] in gorulen or belge_say[parca["belge_id"]] >= belge_basina or toplam + t > butce:\n            continue\n        secilen.append(parca)\n        toplam += t\n        gorulen.add(parca["metin"])\n        belge_say[parca["belge_id"]] += 1\n    return secilen, toplam\n',
    tests='def P(i, b, harf, n):\n    return {"id": i, "belge_id": b, "metin": harf * n}\nS = [(P("a#0", "a", "k", 40), .9), (P("a#1", "a", "l", 80), .8), (P("b#0", "b", "m", 400), .7), (P("a#2", "a", "n", 20), .6), (P("c#0", "c", "p", 40), .5), (P("c#1", "c", "p", 40), .4)]\nsec, t = baglam_sec(S, butce=60)\nassert [p["id"] for p in sec] == ["a#0", "a#1", "c#0"], f"b#0 bütçeyi aşar (atla, devam et), a#2 belge sınırına takılır, c#1 aynı metin: {[p[\'id\'] for p in sec]}"\nassert t == 40, f"10 + 20 + 10 = 40 token: {t}"\nsec, t = baglam_sec(S, butce=1000, belge_basina=1)\nassert [p["id"] for p in sec] == ["a#0", "b#0", "c#0"] and t == 120\nassert baglam_sec([], 100) == ([], 0)\nassert baglam_sec([(P("z#0", "z", "z", 9), 1.0)], 2) == ([], 0), "ceil(9/4)=3 > 2: hiçbir şey sığmaz"\n',
    hints=['Bütçeyi aşan parçada break değil continue kullan: daha kısa bir parça hâlâ sığabilir.', 'Aynı metin kontrolü için set, belge sınırı için Counter kullan.'],
    why='Bütçe seçimi bağlamı hem ucuz hem çeşitli tutar: tekrar eden metin (örtüşen ya da kopyalanmış belgeler) yer israfıdır, tek bir belgenin bağlamı doldurması diğer kaynakları dışarıda bırakır.'))

# Rehberli 4: istem_kur
ex.append(dict(t='code', id='rag-uygulamasi-4', stage='Rehberli', diff=1,
    q='<p><code>istem_kur(soru, parcalar)</code>: <code>(istem, harita)</code> döndürsün. <code>harita</code> kaynak numarası → parça kimliği sözlüğü (<code>{1: "pusula#2", ...}</code>). İstem tam olarak şu biçimde olsun (satırlar <code>"\\n"</code> ile):</p><pre class="out">Yalnızca numaralı kaynaklara dayanarak cevap ver. Her cümleye [n] biçiminde atıf ekle. Cevap kaynaklarda yoksa yalnızca \'Bilmiyorum.\' yaz.\nKaynaklar:\n[1] BAŞLIK: METİN\n[2] METİN\nSoru: SORU</pre><p>Parçanın <code>baslik</code> değeri boş değilse <code>"BAŞLIK: METİN"</code>, boşsa yalnız metin yazılır. Parça listesi boşsa <code>ValueError</code> (boş kaynakla modeli çağırma).</p>',
    guide=['Boş liste kontrolünü en başta yap.', 'enumerate(parcalar, 1) ile numaralandır.', 'Başlık varsa f"{baslik}: {metin}" yaz.', 'Satırları birleştir ve haritayı döndür.'],
    example='for i, ad in enumerate(["izin", "eğitim"], 1):\n    print(f"[{i}] {ad}")\n',
    start='GIRIS = "Yalnızca numaralı kaynaklara dayanarak cevap ver. Her cümleye [n] biçiminde atıf ekle. Cevap kaynaklarda yoksa yalnızca \'Bilmiyorum.\' yaz."\n\ndef istem_kur(soru, parcalar):\n    satirlar = [GIRIS, "Kaynaklar:"]\n    harita = {}\n    # TODO: numaralı kaynak satırları ve harita\n    satirlar.append(f"Soru: {soru}")\n    return "\\n".join(satirlar), harita\n',
    sol='GIRIS = "Yalnızca numaralı kaynaklara dayanarak cevap ver. Her cümleye [n] biçiminde atıf ekle. Cevap kaynaklarda yoksa yalnızca \'Bilmiyorum.\' yaz."\n\ndef istem_kur(soru, parcalar):\n    if not parcalar:\n        raise ValueError("kaynak yok: modeli çağırma")\n    satirlar = [GIRIS, "Kaynaklar:"]\n    harita = {}\n    for i, p in enumerate(parcalar, 1):\n        metin = f"{p[\'baslik\']}: {p[\'metin\']}" if p.get("baslik") else p["metin"]\n        satirlar.append(f"[{i}] {metin}")\n        harita[i] = p["id"]\n    satirlar.append(f"Soru: {soru}")\n    return "\\n".join(satirlar), harita\n',
    tests='ps = [{"id": "pusula#2", "baslik": "İzin > Hastalık izni", "metin": "Raporsuz hastalık izni yılda en fazla 3 gündür."}, {"id": "ik-izin-hastalık#0", "baslik": "", "metin": "Hastalık izin kayıtları: 6868 kayıt."}]\nistem, h = istem_kur("Raporsuz kaç gün?", ps)\nsatir = istem.split("\\n")\nassert satir[1] == "Kaynaklar:" and satir[-1] == "Soru: Raporsuz kaç gün?"\nassert satir[2] == "[1] İzin > Hastalık izni: Raporsuz hastalık izni yılda en fazla 3 gündür.", satir[2]\nassert satir[3] == "[2] Hastalık izin kayıtları: 6868 kayıt.", "Başlığı boş parçada iki nokta olmamalı"\nassert h == {1: "pusula#2", 2: "ik-izin-hastalık#0"}\nassert satir[0].startswith("Yalnızca numaralı") and "\'Bilmiyorum.\'" in satir[0]\ntry:\n    istem_kur("?", [])\n    assert False, "Boş kaynak listesi ValueError vermeli"\nexcept ValueError:\n    pass\n',
    hints=['p.get("baslik") boş metinde de False döner.', 'harita[i] = p["id"]'],
    why='Numaralı kaynak listesi hem modele atıf yapmayı kolaylaştırır hem de koda geri dönüş yolu verir: model [1] dediğinde harita sayesinde hangi parçaya, dolayısıyla hangi belgeye dayandığını bilir ve kullanıcıya kaynak bağlantısı gösterirsin.'))

# Kendin yaz 1: UrunArama (sklearn, gerçek veri)
ex.append(dict(t='code', id='rag-uygulamasi-5', stage='Kendin yaz', diff=2, needs=['scikit-learn'],
    q='<p>Anadolu Market ürün kartları için arama (gerçek <code>products</code> tablosu). <code>UrunArama(urunler)</code> sınıfını yaz:</p><ul><li>Kurucu her ürün için <code>f"{name} {category}"</code> metnini <code>TfidfVectorizer(analyzer=kok5)</code> ile vektörleştirsin (<code>kok5</code> verildi: Türkçe küçük harf + kelimelerin ilk 5 harfi).</li><li><code>ara(sorgu, k=3, kategori=None)</code>: sorguyla kosinüs benzerliği (TF-IDF satırları zaten normalize: nokta çarpımı yeter). Skoru 0 olanları ve kategori verilmişse başka kategoridekileri <b>sıralamadan önce</b> ele; skor azalan ilk k ürünü <code>(product_id, round(skor, 3))</code> listesi olarak döndür.</li></ul>',
    start='import re\nimport veri\nfrom sklearn.feature_extraction.text import TfidfVectorizer\n\n' + TR + '\ndef kok5(metin):\n    return [k[:5] for k in re.findall(r"\\w+", tr_kucuk(metin))]\n\nclass UrunArama:\n    def __init__(self, urunler):\n        pass\n\n    def ara(self, sorgu, k=3, kategori=None):\n        return []\n\nURUNLER = veri.kayitlar("anadolu_market", "products")\n',
    sol='import re\nimport veri\nfrom sklearn.feature_extraction.text import TfidfVectorizer\n\n' + TR + '\ndef kok5(metin):\n    return [k[:5] for k in re.findall(r"\\w+", tr_kucuk(metin))]\n\nclass UrunArama:\n    def __init__(self, urunler):\n        self.urunler = urunler\n        self.vek = TfidfVectorizer(analyzer=kok5)\n        self.X = self.vek.fit_transform(f"{u[\'name\']} {u[\'category\']}" for u in urunler)\n\n    def ara(self, sorgu, k=3, kategori=None):\n        s = (self.X @ self.vek.transform([sorgu]).T).toarray().ravel()\n        aday = [i for i in range(len(self.urunler))\n                if s[i] > 0 and (kategori is None or self.urunler[i]["category"] == kategori)]\n        aday.sort(key=lambda i: -s[i])\n        return [(self.urunler[i]["product_id"], round(float(s[i]), 3)) for i in aday[:k]]\n\nURUNLER = veri.kayitlar("anadolu_market", "products")\n',
    tests='a = UrunArama(URUNLER)\nassert a.ara("kablosuz kulaklıklar")[0][0] == 1, f"Kök eşleşmesi: kulaklıklar → kulak; gelen {a.ara(\'kablosuz kulaklıklar\')}"\nassert a.ara("SQL veri analizi kitabı")[0][0] == 14\nassert a.ara("veri analizi", kategori="Kitap") == [(14, 0.672)], a.ara("veri analizi", kategori="Kitap")\nassert a.ara("kahve")[0][0] == 16\nassert a.ara("kahve makinesi", kategori="Elektronik") == [], "Filtre sıralamadan önce: Elektronik\'te kahve yok"\nassert a.ara("uzay gemisi") == [], "Skoru 0 olan ürün dönmemeli"\nr = a.ara("spor", k=5)\nassert len(r) == 5 and r[0][0] == 25 and all(r[i][1] >= r[i + 1][1] for i in range(4)), r\nassert a.ara("Spor ayakkabı", kategori="Giyim") == [(25, 0.867)]\n',
    hints=['self.X @ self.vek.transform([sorgu]).T seyrek bir sütun matrisidir; .toarray().ravel() ile düz diziye çevir.', 'Önce koşula uyan indeksleri listele, sonra skora göre sırala, sonra k kadar al.'],
    why='Kategori filtresini sıralamadan önce uygulamak, filtreden sonra k\'dan az sonuç kalmasını önler. Kelime tabanlı arama ürün adı gibi kısa, terim yoğun metinlerde çok güçlüdür; kök kesme Türkçe çekim eklerini tolere eder.'))

# Kendin yaz 2: atif_denetle
ex.append(dict(t='code', id='rag-uygulamasi-6', stage='Kendin yaz', diff=2,
    q='<p><code>atif_denetle(cevap, n_kaynak)</code> şu sözlüğü döndürsün:</p><ul><li><code>"gecerli"</code>: 1..n_kaynak aralığındaki atıf numaraları (tekrarsız, sıralı liste).</li><li><code>"gecersiz"</code>: aralık dışındaki atıf numaraları (tekrarsız, sıralı).</li><li><code>"atifsiz"</code>: hiç <code>[n]</code> içermeyen cümle sayısı. Cümleler <code>re.split(r"(?&lt;=[.!?])\\s+", cevap.strip())</code> ile bölünür; boş parçalar sayılmaz.</li><li><code>"kabul"</code>: geçerli atıf en az bir tane, geçersiz atıf hiç yok ve atıfsız cümle yoksa <code>True</code>.</li></ul><p>"Bilmiyorum." cevabı özel durumdur: <code>{"gecerli": [], "gecersiz": [], "atifsiz": 0, "kabul": True}</code>.</p>',
    start='import re\n\ndef atif_denetle(cevap, n_kaynak):\n    pass\n',
    sol='import re\n\ndef atif_denetle(cevap, n_kaynak):\n    if cevap.strip() == "Bilmiyorum.":\n        return {"gecerli": [], "gecersiz": [], "atifsiz": 0, "kabul": True}\n    nolar = {int(x) for x in re.findall(r"\\[(\\d+)\\]", cevap)}\n    gecerli = sorted(n for n in nolar if 1 <= n <= n_kaynak)\n    gecersiz = sorted(nolar - set(gecerli))\n    cumleler = [c for c in re.split(r"(?<=[.!?])\\s+", cevap.strip()) if c]\n    atifsiz = sum(1 for c in cumleler if not re.search(r"\\[\\d+\\]", c))\n    return {"gecerli": gecerli, "gecersiz": gecersiz, "atifsiz": atifsiz,\n            "kabul": bool(gecerli) and not gecersiz and atifsiz == 0}\n',
    tests='r = atif_denetle("Raporsuz izin 3 gündür [2]. Rapor 2 iş günü içinde iletilir [1][2].", 3)\nassert r == {"gecerli": [1, 2], "gecersiz": [], "atifsiz": 0, "kabul": True}, r\nr = atif_denetle("Hibrit çalışan 2 gün ofiste olur [1]. Ayrıca yemek kartı verilir. Detay [5].", 2)\nassert r == {"gecerli": [1], "gecersiz": [5], "atifsiz": 1, "kabul": False}, f"Uydurma cümle ve olmayan kaynak yakalanmalı: {r}"\nassert atif_denetle("İzin 14 gündür.", 3)["kabul"] is False, "Hiç atıf yoksa kabul edilmez"\nassert atif_denetle("Bilmiyorum.", 3)["kabul"] is True\nassert atif_denetle("A [0]. B [1].", 2)["gecersiz"] == [0], "0 numaralı kaynak yoktur"\n',
    hints=['Atıfları küme olarak topla: {int(x) for x in re.findall(...)}', 'Atıfsız cümle: not re.search(r"\\[\\d+\\]", c)'],
    why='Atıf denetimi model çıktısına güvenmeyen ilk bekçidir: var olmayan kaynağa atıf ve atıfsız cümle, modelin kaynak dışına çıktığının en ucuz işaretidir. Bu denetim içerik doğruluğunu garanti etmez ama en kaba hataları kullanıcıya ulaşmadan yakalar.'))

# Kendin yaz 3: LRU önbellek
ex.append(dict(t='code', id='rag-uygulamasi-7', stage='Kendin yaz', diff=2,
    q='<p><code>SorguOnbellegi(kapasite)</code> sınıfı:</p><ul><li><code>anahtar(soru, surum)</code>: <code>tr_kucuk</code> + <code>re.findall(r"\\w+", ...)</code> kelimelerinin boşlukla birleşimi; başına <code>f"v{surum}|"</code>.</li><li><code>getir(soru, surum, hesapla)</code>: anahtar önbellekte varsa <code>isabet</code> sayacını artır ve değeri döndür (bu kayıt artık <b>en yeni</b> kullanılan olur). Yoksa <code>iska</code> sayacını artır, <code>hesapla(soru)</code> sonucunu sakla ve döndür.</li><li>Kayıt sayısı kapasiteyi aşarsa <b>en uzun süredir kullanılmayan</b> kaydı at (LRU).</li></ul>',
    start=TR + 'import re\nfrom collections import OrderedDict\n\nclass SorguOnbellegi:\n    def __init__(self, kapasite):\n        pass\n',
    sol=TR + 'import re\nfrom collections import OrderedDict\n\nclass SorguOnbellegi:\n    def __init__(self, kapasite):\n        self.kapasite = kapasite\n        self.kayit = OrderedDict()\n        self.isabet = self.iska = 0\n\n    def anahtar(self, soru, surum):\n        return f"v{surum}|" + " ".join(re.findall(r"\\w+", tr_kucuk(soru)))\n\n    def getir(self, soru, surum, hesapla):\n        a = self.anahtar(soru, surum)\n        if a in self.kayit:\n            self.isabet += 1\n            self.kayit.move_to_end(a)\n            return self.kayit[a]\n        self.iska += 1\n        deger = hesapla(soru)\n        self.kayit[a] = deger\n        if len(self.kayit) > self.kapasite:\n            self.kayit.popitem(last=False)\n        return deger\n',
    tests='cagri = []\ndef h(s):\n    cagri.append(s)\n    return f"cevap:{len(cagri)}"\no = SorguOnbellegi(2)\nassert o.anahtar("  Yıllık İZİN kaç gün?", 3) == "v3|yıllık izin kaç gün"\nassert o.getir("Yıllık izin?", 1, h) == "cevap:1"\nassert o.getir("YILLIK İZİN", 1, h) == "cevap:1", "Normalleştirilmiş aynı soru önbellekten gelmeli"\nassert o.getir("Yıllık izin?", 2, h) == "cevap:2", "Sürüm değişince yeniden hesaplanmalı"\no.getir("Yıllık izin?", 1, h)          # v1 kaydı en yeni olur\no.getir("Mazeret izni?", 1, h)         # kapasite 2: en eski (v2) atılır\nassert o.anahtar("Yıllık izin?", 2) not in o.kayit and o.anahtar("Yıllık izin?", 1) in o.kayit, f"LRU: en uzun süredir kullanılmayan atılmalı: {list(o.kayit)}"\nassert (o.isabet, o.iska) == (2, 3), (o.isabet, o.iska)\nassert len(cagri) == 3\n',
    hints=['OrderedDict.move_to_end(a) kaydı en yeni yapar; popitem(last=False) en eskiyi atar.', 'Anahtarda .lower() değil tr_kucuk kullan; "İ".lower() iki karakterdir.'],
    why='Sürüm anahtarın parçası olduğunda indeks güncellemesi önbelleği tek satırla geçersiz kılar. LRU sınırı belleği korur; sık sorulan sorular önbellekte kalır. Üretimde aynı fikir Redis\'te TTL ile uygulanır.'))

# Kendin yaz 4: hibrit birleştir
ex.append(dict(t='code', id='rag-uygulamasi-8', stage='Kendin yaz', diff=2, needs=['numpy'],
    q='<p><code>hibrit_sirala(s_kelime, s_vektor, alfa=0.5)</code>: iki skor dizisi (aynı uzunlukta liste ya da numpy dizisi) farklı ölçeklerde. Her birini <b>min-max</b> ile 0-1 aralığına çek (tüm değerler eşitse o dizi sıfır dizisi olsun), <code>alfa * kelime + (1 - alfa) * vektor</code> ile birleştir ve indeksleri birleşik skora göre <b>azalan</b> sırada liste olarak döndür (eşitlikte küçük indeks önce). <code>alfa</code> 0-1 dışındaysa <code>ValueError</code>.</p>',
    start='import numpy as np\n\ndef hibrit_sirala(s_kelime, s_vektor, alfa=0.5):\n    return list(range(len(s_kelime)))\n',
    sol='import numpy as np\n\ndef _minmax(x):\n    x = np.asarray(x, dtype=float)\n    aralik = x.max() - x.min() if len(x) else 0\n    return (x - x.min()) / aralik if aralik else np.zeros_like(x)\n\ndef hibrit_sirala(s_kelime, s_vektor, alfa=0.5):\n    if not 0 <= alfa <= 1:\n        raise ValueError("alfa 0 ile 1 arasında olmalı")\n    skor = alfa * _minmax(s_kelime) + (1 - alfa) * _minmax(s_vektor)\n    return [int(i) for i in np.argsort(-skor, kind="stable")]\n',
    tests='bm25 = [12.0, 3.0, 0.0, 7.5]\nkos = [0.20, 0.90, 0.85, 0.50]\nassert hibrit_sirala(bm25, kos, 1.0) == [0, 3, 1, 2], "alfa=1: yalnız kelime skoru"\nassert hibrit_sirala(bm25, kos, 0.0) == [1, 2, 3, 0], "alfa=0: yalnız vektör skoru"\nassert hibrit_sirala(bm25, kos, 0.5) == [1, 3, 0, 2], f"Min-max sonrası birleşik skorlar 0.5, 0.625, 0.464, 0.527 olmalı: {hibrit_sirala(bm25, kos, 0.5)}"\nassert hibrit_sirala([5, 5, 5], [0.1, 0.3, 0.2]) == [1, 2, 0], "Sabit dizi sıfır sayılmalı"\nassert hibrit_sirala([1, 1], [2, 2]) == [0, 1], "Tam eşitlikte küçük indeks önce"\ntry:\n    hibrit_sirala(bm25, kos, 1.5)\n    assert False\nexcept ValueError:\n    pass\n',
    hints=['min-max: (x - min) / (max - min); max == min ise sıfır dizisi.', 'np.argsort(-skor, kind="stable") azalan ve kararlı sıra verir.'],
    why='BM25 sınırsız, kosinüs -1..1 aralığındadır; ham toplamda büyük ölçekli sinyal diğerini ezer. Min-max ağırlıklı toplam RRF\'ye bir alternatiftir: skor büyüklüğünü korur ama aykırı değerlere duyarlıdır. alfa da altın setle ayarlanır.'))

# Hata avı 1
ex.append(dict(t='code', id='rag-uygulamasi-9', stage='Hata avı', kind='bug', diff=2,
    q='<p><b>Hatayı bul ve düzelt.</b> <code>cevapla(soru, ara, llm, esik=0.35)</code> en iyi getirme skoru eşiğin altındaysa ya da hiç sonuç yoksa modeli <b>çağırmadan</b> <code>"Bilmiyorum."</code> döndürmeli. Model cevabı en az bir atıf içermeli ve <b>tüm</b> atıflar 1..kaynak sayısı aralığında olmalı; değilse yine <code>"Bilmiyorum."</code>. Destek ekibi iki şikâyet iletti: konu dışı sorularda da cevap veriyor ve "[7]" gibi var olmayan kaynaklı cevaplar kullanıcıya ulaşıyor.</p>',
    start='import re\n\ndef cevapla(soru, ara, llm, esik=0.35):\n    sonuclar = ara(soru)                  # [(metin, skor)] skor azalan\n    if not sonuclar and sonuclar[0][1] < esik:\n        return "Bilmiyorum."\n    kaynak = "\\n".join(f"[{i}] {m}" for i, (m, _) in enumerate(sonuclar, 1))\n    cevap = llm(f"Kaynaklar:\\n{kaynak}\\nSoru: {soru}")\n    if "[" in cevap:\n        return cevap\n    return "Bilmiyorum."\n',
    sol='import re\n\ndef cevapla(soru, ara, llm, esik=0.35):\n    sonuclar = ara(soru)                  # [(metin, skor)] skor azalan\n    if not sonuclar or sonuclar[0][1] < esik:\n        return "Bilmiyorum."\n    kaynak = "\\n".join(f"[{i}] {m}" for i, (m, _) in enumerate(sonuclar, 1))\n    cevap = llm(f"Kaynaklar:\\n{kaynak}\\nSoru: {soru}")\n    atif = [int(x) for x in re.findall(r"\\[(\\d+)\\]", cevap)]\n    if atif and all(1 <= a <= len(sonuclar) for a in atif):\n        return cevap\n    return "Bilmiyorum."\n',
    tests='cagri = []\ndef llm_yap(cevap):\n    def f(istem):\n        cagri.append(istem)\n        return cevap\n    return f\nara_iyi = lambda s: [("Raporsuz hastalık izni yılda en fazla 3 gündür.", 0.62), ("Hastalık izin kayıtları: 6868.", 0.25)]\nara_zayif = lambda s: [("Ücretsiz izin en fazla 30 gün verilir.", 0.25)]\nassert cevapla("Raporsuz kaç gün?", ara_iyi, llm_yap("3 gündür [1].")) == "3 gündür [1]."\nassert cevapla("Şirket aracı?", ara_zayif, llm_yap("Herkese verilir [1].")) == "Bilmiyorum.", "Düşük skorda reddetmeli"\nassert len(cagri) == 1, "Düşük skorda model hiç çağrılmamalı (maliyet)"\nassert cevapla("?", lambda s: [], llm_yap("x [1]")) == "Bilmiyorum.", "Boş sonuçta hata vermeden reddetmeli"\nassert cevapla("?", ara_iyi, llm_yap("3 gündür [7].")) == "Bilmiyorum.", "Var olmayan kaynak [7] reddedilmeli"\nassert cevapla("?", ara_iyi, llm_yap("Bkz. [1] ve [3].")) == "Bilmiyorum.", "Tek bir geçersiz atıf bile reddetmeli"\nassert cevapla("?", ara_iyi, llm_yap("İki kaynağa göre [1][2].")) == "İki kaynağa göre [1][2]."\n',
    hints=['İlk koşul: "sonuç yok VEYA en iyi skor düşük" demek istiyor. and ile boş listede IndexError, dolu listede hiç ret olmaz.', '"[" in cevap çok gevşek: sayıları re.findall ile çıkar ve aralığı kontrol et.'],
    why='Boolean mantığındaki tek kelimelik hata (and/or) bekçiyi tamamen devre dışı bırakır ve testler yalnız mutlu yolu deniyorsa fark edilmez. Atıf denetimi de "köşeli parantez var mı?" değil "her atıf gerçek bir kaynağa mı işaret ediyor?" sorusunu sormalıdır.'))

# Hata avı 2
ex.append(dict(t='code', id='rag-uygulamasi-10', stage='Hata avı', kind='bug', diff=2,
    q='<p><b>Hatayı bul ve düzelt.</b> <code>Indeks.yukle(belge_id, metin)</code> belgeyi cümlelere bölüp her cümleyi <code>f"{belge_id}#{i}"</code> kimliğiyle <code>self.parcalar</code> sözlüğüne koyuyor. Yönetmelik kısaltılınca asistan yürürlükten kalkmış kuralı söylemeye devam etti; ayrıca önbellek eski cevapları vermeye devam ediyor. Beklenen: belge yeniden yüklendiğinde o belgenin <b>tüm</b> eski parçaları silinmeli; içerik gerçekten değiştiyse <code>surum</code> 1 artmalı, aynı içerik yeniden yüklenirse hiçbir şey değişmemeli.</p>',
    start='import re\n\nclass Indeks:\n    def __init__(self):\n        self.parcalar = {}\n        self.surum = 0\n\n    def yukle(self, belge_id, metin):\n        cumleler = [c for c in re.split(r"(?<=[.!?])\\s+", metin.strip()) if c]\n        for i, c in enumerate(cumleler):\n            self.parcalar[f"{belge_id}#{i}"] = c\n',
    sol='import re\n\nclass Indeks:\n    def __init__(self):\n        self.parcalar = {}\n        self.surum = 0\n\n    def yukle(self, belge_id, metin):\n        cumleler = [c for c in re.split(r"(?<=[.!?])\\s+", metin.strip()) if c]\n        eski = {k: v for k, v in self.parcalar.items() if k.rsplit("#", 1)[0] == belge_id}\n        yeni = {f"{belge_id}#{i}": c for i, c in enumerate(cumleler)}\n        if eski == yeni:\n            return\n        for k in eski:\n            del self.parcalar[k]\n        self.parcalar.update(yeni)\n        self.surum += 1\n',
    tests='ix = Indeks()\nix.yukle("hastalik", "Rapor 2 iş günü içinde iletilir. Raporsuz izin 3 gündür. Raporsuz izin hafta sonunu kapsamaz.")\nix.yukle("hibrit", "Haftada en az 2 gün ofiste olunur.")\nassert len(ix.parcalar) == 4 and ix.surum == 2\nix.yukle("hastalik", "Rapor 2 iş günü içinde iletilir. Raporsuz izin 5 gündür.")\nassert sorted(ix.parcalar) == ["hastalik#0", "hastalik#1", "hibrit#0"], f"Hayalet parça kalmamalı: {sorted(ix.parcalar)}"\nassert ix.parcalar["hastalik#1"] == "Raporsuz izin 5 gündür."\nassert ix.surum == 3, "İçerik değişti: sürüm artmalı (önbellek geçersizleşsin)"\nix.yukle("hastalik", "Rapor 2 iş günü içinde iletilir. Raporsuz izin 5 gündür.")\nassert ix.surum == 3, "Aynı içerik: sürüm artmamalı (önbellek boşuna silinmesin)"\nix.yukle("hastalik#eski", "Not.")\nix.yukle("hastalik", "Tek kural.")\nassert "hastalik#eski#0" in ix.parcalar, "Başka belgenin parçası (önek benzerliği) silinmemeli"\n',
    hints=['Üç eksik var: eski parçalar silinmiyor, sürüm hiç artmıyor ve aynı içerik kontrolü yok.', 'Belgenin eski parçalarını bulurken k.startswith(belge_id) kullanma: "hastalik#eski" de eşleşir. k.rsplit("#", 1)[0] == belge_id daha güvenli.'],
    why='Üzerine yazma, yeni sürümde karşılığı olmayan parçaları hayalet olarak bırakır; asistan yürürlükten kalkmış kuralı kaynak göstererek söyler ve bu, hiç cevap vermemekten daha zararlıdır. Sürüm sayacı da önbelleğin bu değişikliği fark etmesinin tek yoludur.'))

# Meydan okuma 1: komşu genişletme
ex.append(dict(t='code', id='rag-uygulamasi-11', stage='Meydan okuma', diff=3,
    q='<p>Ebeveyn-çocuk fikri: küçük parçalarla ara, modele komşularıyla birlikte ver. <code>komsu_genislet(isabetler, parcalar, pencere=1)</code>:</p><ul><li><code>parcalar</code>: kimlik → metin sözlüğü; kimlikler <code>"belge#sıra"</code> biçiminde (sıra tamsayı).</li><li><code>isabetler</code>: önem sırasına göre kimlik listesi.</li><li>Her isabet için aynı belgede <code>sıra-pencere .. sıra+pencere</code> aralığındaki <b>var olan</b> parçaları al.</li><li>Aynı belgede örtüşen ya da bitişik aralıkları birleştir (ör. 2-4 ve 5-6 → 2-6).</li><li>Sonuç: <code>{"belge": ..., "bas": ..., "son": ..., "metin": parçaların sırayla " " ile birleşimi}</code> listesi; birleşik aralıklar, içerdikleri <b>en önemli isabetin</b> sırasına göre dizilir.</li></ul>',
    start='def komsu_genislet(isabetler, parcalar, pencere=1):\n    return [{"belge": i.split("#")[0], "bas": 0, "son": 0, "metin": parcalar[i]} for i in isabetler]\n',
    sol='def komsu_genislet(isabetler, parcalar, pencere=1):\n    var = {}\n    for pid in parcalar:\n        b, s = pid.rsplit("#", 1)\n        var.setdefault(b, set()).add(int(s))\n    araliklar = {}\n    for oncelik, pid in enumerate(isabetler):\n        b, s = pid.rsplit("#", 1)\n        s = int(s)\n        komsu = [x for x in range(s - pencere, s + pencere + 1) if x in var.get(b, ())]\n        if komsu:\n            araliklar.setdefault(b, []).append([min(komsu), max(komsu), oncelik])\n    sonuc = []\n    for b, liste in araliklar.items():\n        liste.sort()\n        birlesik = [liste[0][:]]\n        for bas, son, onc in liste[1:]:\n            son_ar = birlesik[-1]\n            if bas <= son_ar[1] + 1:\n                son_ar[1] = max(son_ar[1], son)\n                son_ar[2] = min(son_ar[2], onc)\n            else:\n                birlesik.append([bas, son, onc])\n        for bas, son, onc in birlesik:\n            metin = " ".join(parcalar[f"{b}#{i}"] for i in range(bas, son + 1) if i in var[b])\n            sonuc.append((onc, {"belge": b, "bas": bas, "son": son, "metin": metin}))\n    return [d for _, d in sorted(sonuc, key=lambda x: x[0])]\n',
    tests='P = {f"izin#{i}": f"i{i}" for i in range(8)} | {f"egitim#{i}": f"e{i}" for i in range(3)}\nr = komsu_genislet(["egitim#1", "izin#3", "izin#5"], P)\nassert r == [{"belge": "egitim", "bas": 0, "son": 2, "metin": "e0 e1 e2"}, {"belge": "izin", "bas": 2, "son": 6, "metin": "i2 i3 i4 i5 i6"}], f"2-4 ve 4-6 birleşmeli: {r}"\nr = komsu_genislet(["izin#7", "izin#0"], P)\nassert [(d["bas"], d["son"]) for d in r] == [(6, 7), (0, 1)], f"Belge sınırında olmayan komşu alınmaz; sıra en önemli isabete göre: {r}"\nr = komsu_genislet(["izin#1", "izin#4"], P)\nassert [(d["bas"], d["son"]) for d in r] == [(0, 5)], f"Bitişik aralıklar (0-2 ve 3-5) birleşmeli: {r}"\nassert komsu_genislet(["izin#2"], P, pencere=0) == [{"belge": "izin", "bas": 2, "son": 2, "metin": "i2"}]\nQ = {"a#0": "x", "a#2": "z"}\nassert komsu_genislet(["a#0"], Q, pencere=2) == [{"belge": "a", "bas": 0, "son": 2, "metin": "x z"}], "Eksik sıra (a#1 silinmiş) atlanmalı"\nassert komsu_genislet(["b#10"], {"b#10": "on", "b#9": "dokuz", "b#11": "onbir"}) == [{"belge": "b", "bas": 9, "son": 11, "metin": "dokuz on onbir"}], "Sıralar sayısal karşılaştırılmalı"\n',
    hints=['Önce belge → var olan sıra kümesi sözlüğü kur.', 'Aralıkları belge başına [bas, son, oncelik] olarak topla, bas\'a göre sırala ve bas <= önceki_son + 1 ise birleştir.', 'Birleşen aralığın önceliği min(oncelik) olur; sonucu bu önceliğe göre sırala.'],
    why='Küçük parça isabeti artırır ama tek cümle çoğu zaman bağlamı kaybeder ("Raporsuz izin 3 gündür" hangi izin?). Komşu genişletme ve aralık birleştirme, aynı metni iki kez göndermeden bağlamı geri getirir; LlamaIndex\'teki sentence window ve auto-merging getiriciler bu fikre dayanır.'))

# Meydan okuma 2: artımlı senkron planı
ex.append(dict(t='code', id='rag-uygulamasi-12', stage='Meydan okuma', diff=3,
    q='<p>Gece çalışan senkron işi için plan çıkar. <code>senkron_plani(indeks, belgeler)</code>:</p><ul><li><code>indeks</code>: belge_id → mevcut parmak izi sözlüğü.</li><li><code>belgeler</code>: kaynaktaki güncel <code>{"id", "metin"}</code> listesi. Aynı id iki kez geçerse <code>ValueError</code>.</li><li>Parmak izi: <code>hashlib.sha256(" ".join(metin.split()).encode()).hexdigest()[:12]</code> (yalnız boşluk farkı içerik değişikliği sayılmaz). <code>parmak_izi(metin)</code> fonksiyonunu da yaz.</li><li>Dönüş: <code>{"ekle": [...], "guncelle": [...], "sil": [...], "ayni": n}</code>; listeler sıralı id listeleri. Kaynakta olmayan ama indekste olan belge silinir.</li><li>Güvenlik sigortası: silinecek belge sayısı indeksin yarısından fazlaysa (ve indeks boş değilse) <code>RuntimeError</code> (kaynak sistem yarım veri döndürmüş olabilir; indeksi boşaltma).</li></ul>',
    start='import hashlib\n\ndef parmak_izi(metin):\n    return hashlib.sha256(metin.encode()).hexdigest()[:12]\n\ndef senkron_plani(indeks, belgeler):\n    return {"ekle": [b["id"] for b in belgeler], "guncelle": [], "sil": [], "ayni": 0}\n',
    sol='import hashlib\n\ndef parmak_izi(metin):\n    return hashlib.sha256(" ".join(metin.split()).encode()).hexdigest()[:12]\n\ndef senkron_plani(indeks, belgeler):\n    yeni = {}\n    for b in belgeler:\n        if b["id"] in yeni:\n            raise ValueError(f"tekrarlanan belge: {b[\'id\']}")\n        yeni[b["id"]] = parmak_izi(b["metin"])\n    ekle = sorted(i for i in yeni if i not in indeks)\n    guncelle = sorted(i for i in yeni if i in indeks and indeks[i] != yeni[i])\n    sil = sorted(i for i in indeks if i not in yeni)\n    if indeks and len(sil) > len(indeks) / 2:\n        raise RuntimeError(f"{len(sil)} belge silinecekti; senkron durduruldu")\n    ayni = sum(1 for i in yeni if i in indeks and indeks[i] == yeni[i])\n    return {"ekle": ekle, "guncelle": guncelle, "sil": sil, "ayni": ayni}\n',
    tests=POLITIKA + 'bolum = POLITIKA.split("\\n# ")\nassert parmak_izi("Yıllık  izin\\n14 gün") == parmak_izi("Yıllık izin 14 gün"), "Boşluk farkı aynı parmak izi vermeli"\nassert len(parmak_izi("x")) == 12\nI = {"izin": parmak_izi(bolum[0]), "calisma": parmak_izi(bolum[1]), "egitim": parmak_izi(bolum[2]), "eski-genelge": parmak_izi("Eski kural.")}\nB = [{"id": "izin", "metin": bolum[0].replace("14 gün", "15 gün")}, {"id": "calisma", "metin": bolum[1] + "   "}, {"id": "egitim", "metin": bolum[2]}, {"id": "yan-haklar", "metin": "Yemek kartı verilir."}]\nassert senkron_plani(I, B) == {"ekle": ["yan-haklar"], "guncelle": ["izin"], "sil": ["eski-genelge"], "ayni": 2}, senkron_plani(I, B)\ntry:\n    senkron_plani(I, B[:1])\n    assert False, "4 belgeden 3\'ünü silecek plan durdurulmalı"\nexcept RuntimeError:\n    pass\ntry:\n    senkron_plani(I, B + [B[0]])\n    assert False, "Tekrarlanan id ValueError vermeli"\nexcept ValueError:\n    pass\nassert senkron_plani({}, B)["ekle"] == ["calisma", "egitim", "izin", "yan-haklar"], "Boş indekse ilk yükleme sigortaya takılmamalı"\nassert senkron_plani({"a": "1", "b": "2"}, [{"id": "a", "metin": "x"}])["sil"] == ["b"], "Tam yarısı silinebilir (fazlası değil)"\n',
    hints=['Önce yeni belgelerin parmak izlerini sözlüğe topla (tekrar kontrolü burada).', 'Küme mantığı: ekle = yeni - indeks, sil = indeks - yeni, güncelle = kesişimde parmak izi farklı olanlar.', 'Sigorta: if indeks and len(sil) > len(indeks) / 2: raise RuntimeError(...)'],
    why='Artımlı senkron, yalnız değişen belgeleri yeniden parçalayıp vektörleştirir; embedding maliyeti ve süre belge sayısıyla değil değişiklik sayısıyla ölçeklenir. Sigorta ise gerçek bir felaket senaryosunu önler: kaynak API hata verip boş liste döndürdüğünde koşulsuz senkron bütün indeksi siler.'))

# Mini proje
MP_START = r'''import re
import statistics
from collections import defaultdict
import veri
from sklearn.feature_extraction.text import TfidfVectorizer

''' + POLITIKA + r'''

def tr_kucuk(s):
    return s.replace("I", "ı").replace("İ", "i").lower()

def kok5(metin):
    return [k[:5] for k in re.findall(r"\w+", tr_kucuk(metin))]

def ik_istatistik_belgeleri():
    """Gerçek ik_leaves tablosundan izin türü başına bir istatistik belgesi."""
    izin = defaultdict(list)
    for r in veri.kayitlar("pusula_ik", "ik_leaves"):
        izin[r["leave_type"]].append(r["days"])
    return [{"id": f"ik-izin-{tur}",
             "metin": f"{tur.capitalize()} izin kayıtları: {len(g)} kayıt, ortalama {statistics.mean(g):.1f} gün, en uzun {max(g)} gün.",
             "meta": {"tur": "istatistik"}} for tur, g in sorted(izin.items())]

class SahteLLM:
    """Ağsız model: istemdeki kaynaklardan soruyla en çok kök paylaşanı seçer, metnini atıfla döndürür."""
    def __init__(self):
        self.cagri = 0

    def tamamla(self, istem):
        self.cagri += 1
        soru = istem.rsplit("Soru:", 1)[-1]
        kaynaklar = re.findall(r"^\[(\d+)\] (.+)$", istem, re.M)
        if not kaynaklar:
            return "Bilmiyorum."
        q = set(kok5(soru))
        no, metin = max(kaynaklar, key=lambda k: len(q & set(kok5(k[1]))))
        return f"{metin.split(': ', 1)[-1]} [{no}]"

ALTIN = [
    ("Raporsuz hastalık izni kaç gün?", "pusula#1"),
    ("Hibrit çalışan haftada kaç gün ofise gelir?", "pusula#4"),
    ("Tam uzaktan çalışma hangi departmanlarda mümkün?", "pusula#5"),
    ("Ücretsiz izin en fazla kaç gün?", "pusula#3"),
    ("KVKK eğitimi zorunlu mu?", "pusula#6"),
    ("Mazeret izninde en uzun kaç gün kullanılmış?", "ik-izin-mazeret#0"),
    ("Yıllık izin kayıtlarında ortalama kaç gün?", "ik-izin-yıllık#0"),
    ("Şirket aracı kimlere verilir?", None),
    ("Yemek kartı limiti ne kadar?", None),
]
'''
MP_SOL = MP_START + r'''

def parcala_basliklar(metin, belge_id, meta):
    parcalar, yol = [], {}
    for satir in metin.splitlines():
        m = re.match(r"(#+) (.+)", satir)
        if m:
            seviye = len(m.group(1))
            yol = {k: v for k, v in yol.items() if k < seviye}
            yol[seviye] = m.group(2)
        elif satir.strip():
            parcalar.append({"id": f"{belge_id}#{len(parcalar)}", "belge_id": belge_id,
                             "baslik": " > ".join(yol[k] for k in sorted(yol)),
                             "metin": satir.strip(), "meta": dict(meta)})
    return parcalar

class Asistan:
    def __init__(self, politika, istatistikler):
        self.parcalar = parcala_basliklar(politika, "pusula", {"tur": "politika"})
        for b in istatistikler:
            self.parcalar.append({"id": b["id"] + "#0", "belge_id": b["id"], "baslik": "İzin istatistikleri",
                                  "metin": b["metin"], "meta": dict(b["meta"])})
        self.vek = TfidfVectorizer(analyzer=kok5)
        self.X = self.vek.fit_transform(f"{p['baslik']}: {p['metin']}" for p in self.parcalar)

    def ara(self, soru, k=3):
        s = (self.X @ self.vek.transform([soru]).T).toarray().ravel()
        sira = sorted(range(len(s)), key=lambda i: -s[i])[:k]
        return [(self.parcalar[i], round(float(s[i]), 3)) for i in sira if s[i] > 0]

    def sor(self, soru, llm, esik=0.35, k=3):
        sonuc = self.ara(soru, k)
        if not sonuc or sonuc[0][1] < esik:
            return {"cevap": "Bilmiyorum.", "kaynaklar": [], "durum": "bilmiyorum"}
        kaynak = "\n".join(f"[{i}] {p['baslik']}: {p['metin']}" for i, (p, _) in enumerate(sonuc, 1))
        istem = ("Yalnızca numaralı kaynaklara dayanarak cevap ver ve [n] ile atıf yap. "
                 f"Cevap yoksa 'Bilmiyorum.' de.\nKaynaklar:\n{kaynak}\nSoru: {soru}")
        cevap = llm.tamamla(istem)
        nolar = sorted({int(x) for x in re.findall(r"\[(\d+)\]", cevap)})
        if not nolar or any(n < 1 or n > len(sonuc) for n in nolar):
            return {"cevap": "Bilmiyorum.", "kaynaklar": [], "durum": "bilmiyorum"}
        return {"cevap": cevap, "kaynaklar": [sonuc[n - 1][0]["id"] for n in nolar], "durum": "ok"}

def degerlendir(asistan, llm, altin, esik=0.35):
    cevapli = [(s, b) for s, b in altin if b is not None]
    cevapsiz = [s for s, b in altin if b is None]
    isabet = yanlis_ret = 0
    for soru, beklenen in cevapli:
        r = asistan.sor(soru, llm, esik)
        if r["durum"] == "bilmiyorum":
            yanlis_ret += 1
        elif beklenen in r["kaynaklar"]:
            isabet += 1
    dogru_ret = sum(asistan.sor(s, llm, esik)["durum"] == "bilmiyorum" for s in cevapsiz)
    return {"isabet": round(isabet / len(cevapli), 3), "dogru_ret": round(dogru_ret / len(cevapsiz), 3),
            "yanlis_ret": yanlis_ret}
'''
MP_START2 = MP_START + r'''

def parcala_basliklar(metin, belge_id, meta):
    pass

class Asistan:
    def __init__(self, politika, istatistikler):
        pass

    def ara(self, soru, k=3):
        pass

    def sor(self, soru, llm, esik=0.35, k=3):
        pass

def degerlendir(asistan, llm, altin, esik=0.35):
    pass
'''
ex.append(dict(t='code', id='rag-uygulamasi-13', stage='Mini proje', diff=3, needs=['scikit-learn'],
    q='<p><b>Pusula İK politika asistanı</b> (kurgusal yönetmelik + gerçek <code>pusula_ik.ik_leaves</code> istatistikleri). Hazır: <code>POLITIKA</code>, <code>ik_istatistik_belgeleri()</code>, <code>kok5</code>, <code>SahteLLM</code>, <code>ALTIN</code>. Yazacakların:</p><ol><li><code>parcala_basliklar(metin, belge_id, meta)</code>: Markdown başlıklarını (<code>#</code>, <code>##</code>) izle; başlık olmayan her dolu satır bir parça: <code>{"id": f"{belge_id}#{n}", "belge_id", "baslik": "Üst &gt; Alt", "metin": satır, "meta": kopya}</code>. Yeni bir <code>#</code> başlığı alt başlığı sıfırlar.</li><li><code>Asistan(politika, istatistikler)</code>: politika parçaları + her istatistik belgesi için bir parça (<code>id</code> = belge id + <code>"#0"</code>, <code>baslik</code> = <code>"İzin istatistikleri"</code>). <code>f"{baslik}: {metin}"</code> metinleri <code>TfidfVectorizer(analyzer=kok5)</code> ile indekslenir.</li><li><code>ara(soru, k=3)</code>: skor azalan ilk k parçadan skoru 0\'dan büyük olanlar, <code>(parca, round(skor, 3))</code>.</li><li><code>sor(soru, llm, esik=0.35, k=3)</code>: sonuç yoksa ya da en iyi skor eşiğin altındaysa modeli <b>çağırmadan</b> <code>{"cevap": "Bilmiyorum.", "kaynaklar": [], "durum": "bilmiyorum"}</code>. Değilse istemi kur (kaynak satırları <code>"[i] baslik: metin"</code>, son satır <code>"Soru: ..."</code>), <code>llm.tamamla(istem)</code> çağır, atıfları denetle (yoksa ya da aralık dışıysa bilmiyorum) ve <code>{"cevap", "kaynaklar": [atıf yapılan parça id\'leri, numara sırasıyla], "durum": "ok"}</code> döndür.</li><li><code>degerlendir(asistan, llm, altin, esik=0.35)</code>: cevaplı sorularda beklenen parça kaynaklarda mı (<code>isabet</code> oranı), cevapsız (<code>None</code>) sorularda bilmiyorum oranı (<code>dogru_ret</code>), cevaplı olup reddedilen soru sayısı (<code>yanlis_ret</code>). Oranlar 3 ondalık.</li></ol>',
    start=MP_START2, sol=MP_SOL,
    tests='a = Asistan(POLITIKA, ik_istatistik_belgeleri())\nassert [p["id"] for p in a.parcalar][:3] == ["pusula#0", "pusula#1", "pusula#2"] and len(a.parcalar) == 11, f"7 politika + 4 istatistik parçası: {[p[\'id\'] for p in a.parcalar]}"\nassert a.parcalar[1]["baslik"] == "İzin yönetmeliği > Hastalık izni" and a.parcalar[4]["baslik"] == "Çalışma düzeni > Hibrit çalışma", "Yeni # başlığı alt başlığı sıfırlamalı"\nassert a.parcalar[8]["id"] == "ik-izin-mazeret#0" and "1340 kayıt" in a.parcalar[8]["metin"], "Gerçek veri: 1340 mazeret izni kaydı"\nassert [(p["id"], s) for p, s in a.ara("Raporsuz hastalık izni kaç gün?")][0] == ("pusula#1", 0.627)\nllm = SahteLLM()\nr = a.sor("Raporsuz hastalık izni kaç gün?", llm)\nassert r == {"cevap": "Doktor raporu en geç 2 iş günü içinde İK\'ya iletilir. Raporsuz hastalık izni yılda en fazla 3 gündür. [1]", "kaynaklar": ["pusula#1"], "durum": "ok"}, r\nonce = llm.cagri\nassert a.sor("Şirket aracı kimlere verilir?", llm)["durum"] == "bilmiyorum" and llm.cagri == once, "Düşük skorda model çağrılmamalı"\nclass Uydurur:\n    def tamamla(self, istem):\n        return "Herkese şirket aracı verilir [9]."\nassert a.sor("Ücretsiz izin en fazla kaç gün?", Uydurur())["durum"] == "bilmiyorum", "Geçersiz atıf reddedilmeli"\nassert degerlendir(a, SahteLLM(), ALTIN) == {"isabet": 1.0, "dogru_ret": 1.0, "yanlis_ret": 0}\nassert degerlendir(a, SahteLLM(), ALTIN, esik=0.2) == {"isabet": 1.0, "dogru_ret": 0.0, "yanlis_ret": 0}, "Düşük eşik konu dışı soruları kaçırır"\nassert degerlendir(a, SahteLLM(), ALTIN, esik=0.5) == {"isabet": 0.857, "dogru_ret": 1.0, "yanlis_ret": 1}, "Yüksek eşik doğru soruyu reddeder"\n',
    hints=['parcala_basliklar: yol sözlüğü seviye → başlık tutar; yeni başlıkta {k: v for k, v in yol.items() if k < seviye} ile alt seviyeleri sil.', 'Asistan.ara: (self.X @ self.vek.transform([soru]).T).toarray().ravel() skorları verir.', 'sor: nolar = sorted({int(x) for x in re.findall(r"\\[(\\d+)\\]", cevap)}); kaynaklar = [sonuc[n - 1][0]["id"] for n in nolar].'],
    why='Bu, AI portföyüne koyabileceğin uçtan uca bir RAG asistanıdır: başlık yolu korunan parçalar, kelime tabanlı indeks, getirme eşiğiyle "bilmiyorum", atıf denetimi ve en önemlisi ölçüm. Eşik taraması (0.2 / 0.35 / 0.5) RAG\'in temel ödünleşimini sayıyla gösterir: düşük eşik uydurur, yüksek eşik bilen soruyu reddeder.'))

faq = [
    dict(q='RAG mi, ince ayar (fine-tuning) mı?', a='Bilgi eklemek ve güncel tutmak için RAG: belge değişince indeksi güncellersin, kaynak gösterebilirsin. Biçim, üslup ya da dar bir görevde davranış öğretmek için ince ayar. Çoğu kurumsal asistan RAG ile başlar; ince ayar gerekirse üstüne eklenir. Ayrıntı <code>yerel-modeller-hf</code> dersinde.'),
    dict(q='Vektör veritabanı şart mı?', a='Birkaç bin parçaya kadar bellekteki numpy matrisi ya da TF-IDF yeterlidir. Yüz binlerce parça, kalıcılık, eşzamanlı yazma ve meta veri filtresi gerektiğinde pgvector, Chroma ya da Qdrant gibi bir çözüme geç; arayüzün (ekle, sil, ara, filtre) bu dersteki sınıflarla aynı kalır.'),
    dict(q='"Bilmiyorum" eşiğini nasıl seçerim?', a='Cevabı belgelerde olan ve olmayan sorulardan oluşan bir altın set kur; eşiği tarayıp doğru ret ve yanlış ret oranlarını karşılaştır (mini projedeki gibi). İş tarafına sor: yanlış cevap mı, gereksiz "bilmiyorum" mu daha pahalı? İK ve hukuk gibi alanlarda genelde ret tercih edilir.'),
    dict(q='Kaynak gösterme (citation) yerine tüm belgeyi gösteremez miyim?', a='Gösterebilirsin ama kullanıcı doğrulamak için uzun metni okumaz. Parça düzeyinde atıf, kullanıcıyı doğrudan ilgili paragrafa götürür ve senin de hatalı cevabın hangi parçadan çıktığını izlemeni sağlar.'),
    dict(q='LangChain öğrenmeden RAG işi bulabilir miyim?', a='İlanların çoğu LangChain ya da LlamaIndex adını anar; ama mülakatta asıl sorulan parçalama, hibrit arama, eşik, atıf ve değerlendirme kararlarıdır. Bu dersteki hattı anladıysan bir çerçevenin belgelerini birkaç günde öğrenirsin.')
]
mistakes = [
    dict(bad='for i, c in enumerate(cumleler):\n    indeks[f"{belge_id}#{i}"] = c     # eski fazla parçalar kalır', good='for k in [k for k in indeks if k.rsplit("#", 1)[0] == belge_id]:\n    del indeks[k]\nfor i, c in enumerate(cumleler):\n    indeks[f"{belge_id}#{i}"] = c\nsurum += 1', why='Belge kısalınca üzerine yazma hayalet parçalar bırakır ve asistan yürürlükten kalkmış kuralı söyler.'),
    dict(bad='cevap = llm(istem)\nreturn cevap                       # atıf ve skor denetimi yok', good='if not sonuclar or sonuclar[0][1] < ESIK:\n    return "Bilmiyorum."\ncevap = llm(istem)\nreturn cevap if atif_denetle(cevap, len(sonuclar))["kabul"] else "Bilmiyorum."', why='Modelin "yalnız kaynaklara dayan" talimatına uyacağı varsayılamaz; eşik ve atıf denetimi kodda olmalı.'),
    dict(bad='anahtar = soru.lower().strip()', good='anahtar = f"v{surum}|" + " ".join(re.findall(r"\\w+", tr_kucuk(soru)))', why='Türkçe İ harfi .lower() ile bozulur ve indeks sürümü olmadan güncellemeden sonra eski cevaplar önbellekten gelir.'),
    dict(bad='sonuclar = indeks.ara(soru, k=5)\nsonuclar = [s for s in sonuclar if s.meta["erisim"] in yetkiler]', good='sonuclar = indeks.ara(soru, k=5, filtre=lambda m: m["erisim"] in yetkiler)', why='Sonradan filtreleme k\'dan az sonuç verir; yetki filtresi sıralamadan önce uygulanmalı.'),
    dict(bad='parca = {"metin": "Raporsuz izin yılda en fazla 3 gündür."}', good='parca = {"id": "pusula#2", "baslik": "İzin yönetmeliği > Hastalık izni",\n         "metin": "Raporsuz izin yılda en fazla 3 gündür.", "meta": {"kaynak": "ik_politika.md"}}', why='Başlık yolu olmayan parça bağlamını kaybeder; kimlik ve kaynak olmadan atıf, güncelleme ve silme yapılamaz.')
]

lesson = dict(
    id='rag-uygulamasi', lv='ileri', mod='Yapay Zekâ', min=75, needs=['scikit-learn', 'numpy'],
    title='Uçtan uca RAG uygulaması: belgeden kaynaklı cevaba',
    sum='Belge yükleme ve temizlemeden başlık + cümle parçalamaya, meta veriye, TF-IDF ve sahte embedding ile hibrit indekse, bağlam bütçesine, kaynak gösterme ve "bilmiyorum" davranışına, önbelleğe ve güncelleme/silmeye kadar üretim kalitesinde bir RAG hattı kurar; FastAPI uç noktası ile LangChain/LlamaIndex karşılığını görür, gerçek Pusula İK verisiyle ölçülen bir politika asistanıyla bitirirsin.',
    goals=['Ham belgeyi temizleyip başlık yolu, kararlı kimlik ve meta veri taşıyan parçalara bölebilirim.',
           'TF-IDF ve embedding sinyallerini birleştiren, filtreyi sıralamadan önce uygulayan bir hibrit indeks kurabilirim.',
           'Getirilen parçaları token bütçesine sığdırıp numaralı kaynaklı istem kurabilir, atıfları kodla denetleyebilirim.',
           'Getirme eşiği ve atıf denetimiyle "bilmiyorum" davranışı kurup eşiği altın setle seçebilirim.',
           'Önbellek, parmak izi ve sürümle belge güncelleme ve silmeyi hayalet parça bırakmadan yönetebilirim.'],
    body_here=True, body=body, ex=ex, faq=faq, mistakes=mistakes)

emit('/home/claude/py/v2/n8/rag-uygulamasi.js', 'İleri: rag-uygulamasi (Uçtan uca RAG uygulaması)', lesson, 'scikit-learn, numpy')
