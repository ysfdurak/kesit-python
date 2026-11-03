#!/usr/bin/env python3
"""Yol (rol) sınavlarını üretir: kaynak/v3/s1/sinav_roller.js
Ders alıştırmaları aynen kopyalanmaz (denetim bulgusu A4):
  - kavram soruları: role özgü, elle yazılmış (aşağıda KAVRAM)
  - çıktı tahmini: ders kodundaki sayılar değiştirilir, doğru çıktı CPython ile yeniden hesaplanır, çeldiriciler ondan türetilir
  - kod görevleri: görev tanımı aynı kalabilir, testlerin girdileri değişir, beklenen değerler örnek çözümden hesaplanır
Önce derle, sonra üret, sonra yeniden derle:  python3 tools/build.py && python3 tools/gen_exams.py && python3 tools/build.py"""
import ast, copy, json, os, random, re, subprocess, sys, tempfile
KOK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DUMP = r"""
const fs=require('fs'),vm=require('vm');global.window=global;const R=process.argv[1];
for(const f of ['levels.js','paths.js','c_temel.js','c_orta.js','c_ileri.js','n_temel.js','n_orta.js','n_ileri.js','x_1.js','x_2.js'])if(fs.existsSync(R+f))vm.runInThisContext(fs.readFileSync(R+f,'utf8'));
const m={};PY_LESSONS.forEach(l=>m[l.id]=l);(PY_EXT||[]).forEach(x=>{if(m[x.id]&&x.ex)m[x.id].ex=(m[x.id].ex||[]).concat(x.ex)});
process.stdout.write(JSON.stringify({P:PY_PATHS,L:PY_LESSONS,LV:PY_LV_FIX,TITLE:PY_TITLE_FIX}));
"""
D = json.loads(subprocess.run(['node', '-e', DUMP, KOK + '/'], capture_output=True, text=True, check=True).stdout)
L = {l['id']: l for l in D['L']}
TITLE = lambda i: D['TITLE'].get(i) or L[i]['title']
LV = lambda i: D['LV'].get(i) or L[i]['lv']
KAVRAM = {
 'genel': [('Bir değişkeni neden "etiket" diye düşünmek doğrudur?', ['a = b yeni kopya üretmez; iki ad aynı nesneyi gösterir', 'Her atama belleği kopyalar', 'Değişkenler yalnız sayı tutar', 'Değişken adı değer değiştirince silinir'], 'Atama ad bağlar; değişebilir nesnede bu fark önem kazanır.'),
   ('Fonksiyon sonucu ekrana yazıp döndürmüyorsa ne olur?', ['Çağıran None alır', 'Çağıran yazılan metni alır', 'Program hata verir', 'Fonksiyon iki kez çalışır'], 'return yoksa dönen değer None olur.'),
   ('Dosyayı neden with ile açarız?', ['Hata olsa da dosya kapanır', 'Dosya daha hızlı okunur', 'Kodlama gerekmez', 'Yalnız with ile yazılabilir'], 'with kapanışı garanti eder.'),
   ('Hangi hata türü yakalanmalı?', ['Beklediğin belirli hata, örneğin ValueError', 'Her zaman çıplak except:', 'Hiçbir hata', 'Yalnız SyntaxError'], 'Çıplak except gerçek hataları da gizler.'),
   ('Listeyi döngüde dolaşırken eleman silmek neden riskli?', ['Konumlar kayar, bazı elemanlar atlanır', 'Python bunu yasaklar ve hep hata verir', 'Liste kopyalanır', 'Bellek taşar'], 'Yeni liste kurmak ya da kopya üzerinde dönmek güvenlidir.')],
 'analist': [('Satış tablosunda 3 sipariş ile müşteri tablosunu birleştirince satır sayısı artıyor. İlk şüphe?', ['Anahtar müşteri tablosunda tekil değil', 'pandas hatası', 'Tarih sütunu', 'Boş değerler satır ekler'], 'merge çoka çok olursa satır çoğalır; validate parametresiyle denetle.'),
   ('Aylık büyümeyi hesaplarken ilk bakılacak şey?', ['Karşılaştırılan ayların tam olup olmadığı', 'Grafik rengi', 'Sütun adının uzunluğu', 'Satır numarası'], 'Yarım ay büyümeyi yanıltır.'),
   ('A/B testinde p değeri 0,03 çıktı. Doğru yorum?', ['Fark yoksa bu kadar uç sonuç %3 olasılıkla görülürdü', 'B\'nin kazanma olasılığı %97', 'Etki %3', 'Test %3 hatalı'], 'p değeri, sıfır hipotezi altında veri olasılığıdır.'),
   ('Ortalama yerine medyan ne zaman daha uygun?', ['Dağılım çarpık ya da uç değer varsa', 'Her zaman', 'Veri azsa asla', 'Yalnız metinde'], 'Medyan uç değerden az etkilenir.'),
   ('Kohort analizinde kohort nedir?', ['Aynı dönemde başlayan müşteri grubu', 'En çok harcayanlar', 'Şehirler', 'Rastgele örnek'], 'Örneğin ilk siparişi aynı ayda olanlar.')],
 'bilimci': [('Eğitim skoru çok yüksek, test skoru düşük. Bu ne?', ['Aşırı öğrenme (overfitting)', 'Az veri sızıntısı', 'Yetersiz öğrenme', 'Normal'], 'Model eğitim verisini ezberlemiştir.'),
   ('Ölçekleyiciyi tüm veriye fit edip sonra bölmek neden yanlış?', ['Test bilgisi eğitime sızar', 'Daha yavaştır', 'Sütun sırası bozulur', 'Hata verir'], 'Pipeline ile yalnız eğitim katında fit et.'),
   ('Dengesiz sınıflarda accuracy neden yanıltır?', ['Hep çoğunluğu demek de yüksek skor verir', 'Hesaplanamaz', 'Her zaman düşüktür', 'Yalnız regresyonda geçerlidir'], 'Precision, recall, PR-AUC bak.'),
   ('Zaman serisinde rastgele k-katlı doğrulama neden uygun değil?', ['Gelecekten geçmişe bilgi sızar', 'Yavaştır', 'Model eğitilemez', 'Sınıf sayısı azalır'], 'TimeSeriesSplit kullan.'),
   ('Güven aralığı neyi anlatır?', ['Tahminin belirsizliğini, yöntemin uzun vadeli tutma oranıyla', 'Verinin %95\'inin aralıkta olduğunu', 'Modelin doğruluğunu', 'p değerini'], 'Tek bir aralık için "%95 olasılık" demek yanlıştır.')],
 'muhendis': [('Boru hattı idempotent ise ne demek?', ['Aynı işi iki kez çalıştırmak sonucu değiştirmez', 'Hiç hata vermez', 'Tek makinede çalışır', 'Sırası önemsizdir'], 'Yeniden çalıştırma güvenli olmalı.'),
   ('Parquet neden analitikte CSV\'den iyidir?', ['Kolon tabanlı ve sıkıştırılmış, tür bilgisi taşır', 'Elle düzenlenir', 'Her zaman küçük harflidir', 'Şema tutmaz'], 'Yalnız gereken kolonlar okunur.'),
   ('Artımlı yüklemede watermark ne işe yarar?', ['Son işlenen noktayı tutar, yalnız yeniyi çeker', 'Veriyi şifreler', 'Tabloyu siler', 'Grafik çizer'], 'Tam yükleme maliyetini önler.'),
   ('SCD2 boyut tablosu neyi saklar?', ['Bir kaydın zaman içindeki sürümlerini', 'Yalnız son hâli', 'Yalnız silinenleri', 'Toplamları'], 'Geçerlilik tarihleriyle geçmiş korunur.'),
   ('Kafka\'da "en az bir kez" teslim ne gerektirir?', ['Tüketicinin yinelenen mesaja dayanıklı olması', 'Hiçbir şey', 'Tek partition', 'Mesajların silinmesi'], 'İşleme idempotent olmalı.')],
 'backend': [('401 ile 403 farkı?', ['401 kimlik yok ya da geçersiz, 403 kimlik var yetki yok', 'Aynıdır', '403 sunucu hatasıdır', '401 bulunamadı demektir'], 'Kimlik doğrulama ve yetkilendirme ayrı adımlardır.'),
   ('N+1 sorgu problemi nasıl çözülür?', ['İlişkileri tek seferde yükleyerek (selectinload, prefetch_related)', 'Daha çok indeks', 'Daha büyük sunucu', 'Önbelleği kapatarak'], 'ORM ilişkisini baştan yüklemek gerekir.'),
   ('Parola nasıl saklanır?', ['Tuzlu, yavaş özetle (bcrypt, argon2)', 'MD5 ile', 'Şifreli metin olarak', 'Düz metin'], 'Yavaş özet kaba kuvveti zorlaştırır.'),
   ('asyncio\'da CPU ağır iş ne yapar?', ['Olay döngüsünü bloklar, herkes bekler', 'Otomatik paralel olur', 'Hızlanır', 'Hata verir'], 'Ayrı süreçte çalıştır.'),
   ('Ödeme API\'sinde yeniden deneme için ne gerekir?', ['Idempotency anahtarı', 'Daha uzun zaman aşımı', 'İstemci önbelleği', 'GET kullanmak'], 'Aynı istek iki kez işlenmesin.')],
 'ml': [('Model canlıda bozuluyor ama kod değişmedi. İlk şüphe?', ['Veri kayması (data drift)', 'Python sürümü', 'Log düzeyi', 'Disk'], 'Girdi dağılımını izle.'),
   ('Pipeline kullanmanın ana faydası?', ['Ön işleme yalnız eğitim katında fit edilir, üretimde aynısı çalışır', 'Daha iyi doğruluk garantisi', 'GPU kullanımı', 'Daha az veri'], 'Sızıntıyı ve eğitim-servis farkını önler.'),
   ('MLflow\'da yeni sürüme nasıl geçilir?', ['Takma adı (champion) yeni sürüme taşıyarak', 'Kodda sürüm numarasını değiştirerek', 'Eski modeli silerek', 'Sunucuyu yeniden kurarak'], 'Servis takma adı okur; geri dönüş de aynı yolla olur.'),
   ('Gradient boosting neden tablo verisinde sık seçilir?', ['Karma veri türlerinde az ayarla güçlü sonuç verir', 'Hep en hızlısıdır', 'Özellik gerektirmez', 'Sinir ağıdır'], 'HistGradientBoosting gibi modeller iyi başlangıçtır.'),
   ('Toplu ve anlık tahmin farkı?', ['Toplu zamanlanmış, anlık istek başına düşük gecikmeyle', 'Aynıdır', 'Toplu daha doğrudur', 'Anlık GPU ister'], 'Gecikme ihtiyacı belirler.')],
 'web': [('CSRF saldırısına karşı temel önlem?', ['Form belirteci ve SameSite çerez', 'HTTPS tek başına', 'Parola uzatmak', 'GET kullanmak'], 'Tarayıcı çerezi otomatik gönderir; belirteç istek sahibini doğrular.'),
   ('Flask\'ta <code>@app.get("/x")</code> nedir?', ['Fonksiyonu adrese bağlayan dekoratör', 'Veritabanı sorgusu', 'Şablon', 'Test'], 'Dekoratör fonksiyonu yönlendirme tablosuna kaydeder.'),
   ('Django\'da model değişince ne yaparsın?', ['makemigrations ve migrate', 'Tabloyu elle silerim', 'Sunucuyu kapatırım', 'Hiçbir şey'], 'Migrasyon şema geçmişini tutar.'),
   ('XSS\'e karşı şablonlarda ne yapılır?', ['Otomatik kaçış açık kalır, kullanıcı girdisi ham basılmaz', 'Girdi veritabanına yazılmaz', 'JavaScript kapatılır', 'Çerez silinir'], 'Jinja2 ve Django şablonları varsayılan kaçış yapar.'),
   ('FastAPI\'de istek gövdesi nasıl doğrulanır?', ['pydantic modeliyle', 'Elle if yazarak zorunlu', 'Şablonla', 'Doğrulanmaz'], 'Tür ipucu ve BaseModel 422 yanıtını üretir.')],
 'ai': [('RAG\'de chunk boyutu çok büyükse ne olur?', ['Alakasız metin bağlama girer, maliyet artar', 'Arama hızlanır', 'Halüsinasyon biter', 'Etkisi yok'], 'Parça, soruya yetecek kadar küçük olmalı.'),
   ('LLM çıktısını neden pydantic ile doğrularız?', ['Model geçersiz JSON ya da alan üretebilir', 'Model daha akıllı olur', 'Daha ucuz olur', 'Zorunlu API kuralıdır'], 'Doğrula, hatada yeniden dene.'),
   ('Prompt injection nedir?', ['Veri içine gizlenen talimatın modeli yönlendirmesi', 'SQL açığı', 'Parola kırma', 'Token sınırı'], 'Veriyi talimattan ayır, araç yetkisini sınırla.'),
   ('Bir değişikliğin LLM uygulamasını iyileştirdiğini nasıl anlarsın?', ['Sabit değerlendirme kümesiyle öncesi-sonrası ölçerek', 'Birkaç örnek deneyerek', 'Yanıt uzadıysa', 'Daha pahalı modelle'], 'Regresyon için ölçüm şart.'),
   ('Model adını neden koda gömmemeliyiz?', ['Sürümler değişir; ayardan okunmalı', 'Yasaktır', 'Yavaşlatır', 'Token harcar'], 'Değişiklik tek yerden yapılır.')],
 'otomasyon': [('Bir betiği zamanlayıcıya vermeden önce ne gerekir?', ['Mutlak yollar, kayıt (log) ve anlamlı çıkış kodu', 'Renkli çıktı', 'input() ile onay', 'GUI'], 'Zamanlayıcıda kimse ekrana bakmaz.'),
   ('Excel\'de "1.430" değerini sayıya çevirirken dikkat?', ['Türkçe binlik ayırıcıyı temizle, ondalık virgülü noktaya çevir', 'float() yeter', 'Değiştirmeden topla', 'Metin bırak'], 'float("1.430") 1,43 verir.'),
   ('Dosya işlerinde neden pathlib?', ['Yollar işletim sisteminden bağımsız ve okunur', 'Daha az bellek', 'Zorunlu', 'Dosyaları şifreler'], 'Path("a") / "b" her yerde çalışır.'),
   ('E-posta gönderen betiği test ederken?', ['Önce kuru çalıştırma (dry-run): göndermeden listele', 'Herkese gönder', 'Parolayı koda yaz', 'Hataları yut'], 'Yanlış toplu gönderim geri alınmaz.'),
   ('Yarım kalmış rapor dosyası riski nasıl önlenir?', ['Geçici dosyaya yaz, bitince taşı (atomik)', 'Dosyayı açık bırak', 'Daha küçük yaz', 'Dosya adını değiştirme'], 'os.replace aynı diskte atomiktir.')],
 'sertifika': [('<code>is</code> ile <code>==</code> farkı?', ['is kimliği, == değeri karşılaştırır', 'Aynıdır', 'is yalnız sayılar için', '== daha hızlıdır her zaman'], 'None için is kullanılır.'),
   ('Değişebilir varsayılan argüman neden tehlikeli?', ['Tanımda bir kez oluşur, çağrılar arasında paylaşılır', 'Sözdizimi hatası', 'Yavaştır', 'Liste kopyalanır'], 'None kullanıp içeride oluştur.'),
   ('MRO neyi belirler?', ['Metot arama sırasını', 'Bellek düzenini', 'Modül içe aktarmayı', 'Çıkış kodunu'], 'C3 doğrusallaştırma; Sinif.__mro__.'),
   ('Üreteç fonksiyonu çağrılınca ne olur?', ['Gövde çalışmaz, üreteç nesnesi döner', 'Tüm değerler üretilir', 'Hata verir', 'Liste döner'], 'next ile ilerler.'),
   ('LEGB sırası neyi anlatır?', ['Ad arama: yerel, kapsayan, genel, yerleşik', 'Kalıtım', 'Sıralama', 'İçe aktarma'], 'nonlocal ve global bu sırayı değiştirir.')]}
PATHOS = {'PYTHONDONTWRITEBYTECODE': '1'}
def runpy(code, timeout=20):
    with tempfile.TemporaryDirectory() as td:
        env = dict(os.environ, PP_VERI=KOK + '/data', PYTHONPATH=KOK + '/tools/pylib', **PATHOS)
        try: r = subprocess.run([sys.executable, '-c', code], capture_output=True, text=True, timeout=timeout, cwd=td, env=env)
        except subprocess.TimeoutExpired: return None, 'timeout'
    return r.stdout, (r.stderr if r.returncode else None)
class Mut(ast.NodeTransformer):
    def __init__(self, r): self.r = r; self.n = 0
    def visit_Constant(self, node):
        if type(node.value) is int and 1 < node.value < 100000 and self.r.random() < .6:
            self.n += 1; return ast.copy_location(ast.Constant(node.value + self.r.choice([1, 2, 3])), node)
        return node
def mutate(code, r):
    try: t = ast.parse(code)
    except SyntaxError: return None
    m = Mut(r); t2 = m.visit(t)
    return ast.unparse(t2) + '\n' if m.n else None
def perturb(out, r):
    """Doğru çıktıdan inandırıcı yanlışlar türetir."""
    res = []
    nums = list(re.finditer(r'\d+', out))
    for _ in range(12):
        if nums:
            m = r.choice(nums); v = int(m.group(0)); d = r.choice([1, -1, 2, 10])
            c = out[:m.start()] + str(abs(v + d)) + out[m.end():]
        else:
            ls = out.strip().split('\n'); w = out.split()
            if len(ls) > 1: r.shuffle(ls); c = '\n'.join(ls)
            elif len(w) > 1: r.shuffle(w); c = ' '.join(w)
            else: c = out.strip().upper() if r.random() < .5 else out.strip()[::-1]
        c = c.strip()
        if c != out.strip() and c not in res: res.append(c)
        if len(res) >= 3: break
    return res if len(res) == 3 else None
BADMOD = re.compile(r'\b(random|time|datetime|uuid|os\.|sys\.|id\(|hash\(|threading|asyncio|veri\b|sklearn|pandas|numpy|polars|duckdb|matplotlib|seaborn|plotly|pydantic|sqlalchemy|set\(|\{[^:}]*\}|__file__|input\()')
def predict_variant(e, r):
    if BADMOD.search(e.get('code') or ''): return None
    if e.get('raises'): return None
    for _ in range(8):
        c = mutate(e['code'], r)
        if not c: return None
        out, err = runpy(c)
        if err or out is None or not out.strip() or len(out) > 200: continue
        orig_out, _e = runpy(e['code'])
        if orig_out is None or out.strip() == orig_out.strip(): continue
        wr = perturb(out, r)
        if not wr: continue
        opts = [out.strip()] + wr; r.shuffle(opts)
        return c, opts, opts.index(out.strip())
    return None
def code_variant(e, r):
    """Testlerdeki assert CALL == EXPECT kalıplarının girdilerini değiştirir, beklenti örnek çözümden hesaplanır."""
    try: t = ast.parse(e['tests'])
    except SyntaxError: return None
    stm = t.body
    if not stm or len(e['tests']) > 2500: return None
    setup = []; new = []; changed = 0
    for s in stm:
        if isinstance(s, (ast.Assign, ast.Import, ast.ImportFrom)):
            setup.append(ast.unparse(s)); continue
        ok = isinstance(s, ast.Assert) and isinstance(s.test, ast.Compare) and len(s.test.ops) == 1 and isinstance(s.test.ops[0], ast.Eq) and isinstance(s.test.left, ast.Call) and isinstance(s.test.left.func, ast.Name)
        if not ok: continue
        call = s.test.left
        if any(isinstance(x, ast.Lambda) for x in ast.walk(call)): continue
        m = Mut(r); c2 = m.visit(copy.deepcopy(call))
        changed += 1 if m.n else 0
        new.append(ast.unparse(c2))
    if len(new) < 2 or changed < 1: return None
    pre = ''.join(x + '\n' for x in setup)
    prog = e['sol'] + '\n' + pre + 'import json as _j\n_r=[]\n' + ''.join(f'_r.append(repr({x}))\n' for x in new) + 'print("<<<"+_j.dumps(_r)+">>>")\n'
    out, err = runpy(prog)
    if err or out is None or '<<<' not in out: return None
    vals = json.loads(out[out.index('<<<') + 3:out.index('>>>')])
    if any('object at 0x' in v or v.startswith('<') or 'nan' in v for v in vals) or len(set(vals)) < 2: return None
    tests = pre + ''.join(f'assert {x} == {v}, "{x} için {v} bekleniyor"\n' if '"' not in x and '"' not in v and '\\' not in v else f'assert {x} == {v}\n' for x, v in zip(new, vals))
    _o, _e = runpy(e['sol'] + '\n' + tests)
    return tests if not _e else None
genel = next(p for p in D['P'] if p['id'] == 'genel')['lessons']
JSON = lambda o: json.dumps(o, ensure_ascii=False)
out = []
for p in D['P']:
    if p['id'] not in KAVRAM: continue  # kavram soruları elle yazılı; yazılmamış yolun sınavı üretilmez
    r = random.Random('sinav-' + p['id'])
    ids = [i for i in p['lessons'] if i in L and (p['id'] in ('genel', 'sertifika') or i not in genel)]
    if len(ids) < 8: ids = [i for i in p['lessons'] if i in L]
    r.shuffle(ids)
    qs = [{'t': 'mc', 'lv': 'orta', 'topic': p['name'], 'q': q, 'o': o, 'a': 0, 'why': w} for q, o, w in KAVRAM[p['id']]]
    # 11 çıktı tahmini (değiştirilmiş kod)
    n = 0; used = set()
    for round_ in range(4):
        for i in ids:
            if n >= 11: break
            c = [e for e in L[i]['ex'] if e['t'] == 'predict' and e.get('code') and id(e) not in used]
            r.shuffle(c)
            for e in c:
                used.add(id(e))
                v = predict_variant(e, r)
                if v:
                    code, opts, a = v
                    qs.append({'t': 'predict', 'lv': LV(i), 'topic': TITLE(i), 'q': 'Bu kod ne yazdırır?', 'code': code, 'o': opts, 'a': a, 'why': 'Kodu adım adım izle ya da kod editöründe çalıştır. Kalıp ' + TITLE(i) + ' dersinde.'}); n += 1
                    break
    # 4 kod görevi: testler yeni girdilerle
    codes = []
    for i in ids:
        if len(codes) >= 4: break
        c = [e for e in L[i]['ex'] if e['t'] == 'code' and e.get('tests') and e.get('sol') and (e.get('diff') or 1) <= 2 and 'input(' not in e['sol'] and 'veri.' not in e['sol'] and not e.get('expect') and not e.get('erken')]
        r.shuffle(c)
        for e in c:
            t2 = code_variant(e, r)
            if t2:
                needs = sorted(set((L[i].get('needs') or []) + (e.get('needs') or [])))
                q = {'t': 'code', 'lv': LV(i), 'topic': TITLE(i), 'pts': 5, 'q': '<p class="muted">Sınav görevi: testler dersteki alıştırmadan farklı girdiler kullanır.</p>' + e['q'], 'start': e.get('start') or '', 'sol': e['sol'], 'tests': t2, 'why': e.get('why') or ''}
                if needs: q['needs'] = needs
                codes.append(q); break
    qs += codes
    lv = 'temel' if p['id'] == 'genel' else 'orta' if p['id'] in ('analist', 'otomasyon', 'web', 'sertifika') else 'ileri'
    out.append({'id': 'patika-' + p['id'], 'title': p['name'] + ' yolu sınavı', 'lv': lv, 'kind': 'kod', 'min': 60, 'pass': 70,
      'desc': f"{p['name']} yolu için {len(qs)} soruluk karma sınav: {len(qs) - len(codes)} test sorusu ve {len(codes)} kodlama görevi (her biri 5 puan). Kavram soruları role özeldir; kod soruları derslerdeki kalıpların yeni değerli hâlidir.", 'qs': qs})
    print(p['id'], len(qs), 'kod', len(codes), 'tahmin', n, file=sys.stderr)
with open(KOK + '/kaynak/v3/s1/sinav_roller.js', 'w', encoding='utf-8') as f:
    f.write("/* Kesit Python — yol (rol) sınavları: tools/gen_exams.py üretir, elle düzenleme */\n(function (W) {\n'use strict';\nconst E = W.PY_EXAMS = W.PY_EXAMS || [];\nE.push(\n" + ',\n'.join('  ' + JSON(x) for x in out) + "\n);\n})(window);\n")
