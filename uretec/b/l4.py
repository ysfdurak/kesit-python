import sys
sys.path.insert(0, '/tmp/claude-0/-home-claude/6c066959-3fcb-54bb-bdf1-c8ae148dfc4c/scratchpad/b')
from jsb import C, emit

body = r'''
<h2>Neden önemli?</h2>
<p>Anadolu Market'in deposunda çalışan ekip her sabah bir Excel dosyasını açıp aynı üç hesabı elle yapıyor. Python betiğini yazdın ama ekip terminal kullanmıyor. Çözüm küçük bir masaüstü penceresi: iki kutu, bir düğme, bir sonuç etiketi. Kurumlarda bu tür <b>iç araçlar</b> (internal tools) çok yaygındır: fiyat etiketi basıcı, vardiya planlayıcı, kur hesaplayıcı. Python'un yanında gelen <b>tkinter</b>, bunları ek kurulum olmadan yazmanı sağlar.</p>
<p>Bu derste iki şeyi birlikte öğreneceksin: grafik arayüzün (GUI) temel kavramları (pencere, widget, yerleşim, olay, callback, olay döngüsü) ve daha önemlisi <b>mantığı arayüzden ayırmak</b>. İyi yazılmış bir GUI uygulamasında hesap kodu pencereden habersizdir; bu yüzden test edilebilir ve aynı kod yarın bir web sayfasına taşınabilir.</p>
<div class="warn"><b>tkinter tarayıcıda çalışmaz</b>Bu sayfadaki Python motoru tarayıcıda çalışır ve pencere açamaz. Arayüz kodlarını gri kutularda (çalıştır düğmesi olmadan) gösteriyoruz; bunları <b>kendi bilgisayarında dene</b>. Alıştırmalar ise arayüzden bağımsız mantık katmanını yazdırır ve burada çalışır.</div>

<h2>Kurulum ve ilk pencere</h2>
<p>Windows ve macOS'te python.org yükleyicisi tkinter'ı içerir. Linux'ta çoğu dağıtım ayrı paket ister. Kurulumu sınamak için terminalde küçük bir deneme penceresi açabilirsin:</p>
<pre class="code"># Linux (Debian/Ubuntu)
sudo apt install python3-tk
# Her işletim sisteminde deneme penceresi
python -m tkinter</pre>
<p>En küçük uygulama: bir pencere, bir etiket, bir düğme.</p>
<pre class="code">import tkinter as tk

pencere = tk.Tk()
pencere.title("Anadolu Market")
pencere.geometry("320x120")

etiket = tk.Label(pencere, text="Merhaba depo ekibi!")
etiket.pack(pady=10)

def selamla():
    etiket.config(text="Düğmeye basıldı")

tk.Button(pencere, text="Bas", command=selamla).pack()

pencere.mainloop()      # olay döngüsü: pencere kapanana kadar burada kalır</pre>
<div class="note"><b>Kendi bilgisayarında dene</b>Kodu <code>ilk_pencere.py</code> olarak kaydet ve <code>python ilk_pencere.py</code> ile çalıştır. VS Code'da da "Run Python File" yeterlidir; tkinter için <code>pip install</code> gerekmez.</div>

<h2>Widget'lar</h2>
<div class="tbl-wrap"><table>
<tr><th>Widget</th><th>Ne işe yarar?</th><th>Sık kullanılan</th></tr>
<tr><td><code>Label</code></td><td>Metin ya da resim gösterir</td><td><code>text=</code>, <code>textvariable=</code>, <code>config()</code></td></tr>
<tr><td><code>Entry</code></td><td>Tek satır girdi kutusu</td><td><code>get()</code>, <code>delete(0, "end")</code>, <code>insert()</code></td></tr>
<tr><td><code>Button</code></td><td>Tıklanınca fonksiyon çağırır</td><td><code>command=</code></td></tr>
<tr><td><code>Listbox</code></td><td>Seçilebilir satır listesi</td><td><code>insert("end", x)</code>, <code>curselection()</code>, <code>delete(i)</code></td></tr>
<tr><td><code>Checkbutton</code>, <code>Radiobutton</code></td><td>Seçenekler</td><td><code>variable=</code> (BooleanVar/StringVar)</td></tr>
<tr><td><code>Frame</code></td><td>Widget'ları gruplayan kap</td><td>İç içe yerleşim</td></tr>
<tr><td><code>ttk.Combobox</code></td><td>Açılır liste</td><td><code>values=</code>, <code>get()</code></td></tr>
</table></div>
<p><code>tkinter.ttk</code> modülü aynı widget'ların işletim sistemine daha uygun görünen "temalı" sürümlerini sunar; yeni projelerde <code>ttk.Button</code>, <code>ttk.Entry</code> tercih edilir.</p>

<h2>Yerleşim: pack, grid, place</h2>
<div class="tbl-wrap"><table>
<tr><th>Yöntem</th><th>Mantık</th><th>Ne zaman?</th></tr>
<tr><td><code>pack()</code></td><td>Widget'ları üstten alta (ya da yan yana) dizer</td><td>Basit, tek sütunlu düzen</td></tr>
<tr><td><code>grid(row=, column=)</code></td><td>Satır/sütun tablosu; <code>columnspan</code>, <code>sticky</code></td><td>Formlar, hesap makinesi tuşları</td></tr>
<tr><td><code>place(x=, y=)</code></td><td>Piksel koordinatı</td><td>Nadiren; pencere boyutu değişince bozulur</td></tr>
</table></div>
<div class="warn"><b>Aynı kapta pack ve grid karıştırma</b>Bir pencere ya da Frame içinde bazı widget'ları <code>pack</code>, bazılarını <code>grid</code> ile yerleştirirsen tkinter ikisini uzlaştırmaya çalışırken donar ya da <code>TclError</code> verir. Farklı yöntem gerekiyorsa ayrı Frame'ler kullan.</div>
<p>Grid, hesap makinesi gibi düzenlerde etiket listesinden satır/sütun hesaplamayı gerektirir; bu tamamen sıradan Python'dur:</p>
<pre class="py">tuslar = ["7", "8", "9", "/", "4", "5", "6", "*", "1", "2", "3", "-", "0", ".", "=", "+"]
sutun_sayisi = 4
for i, tus in enumerate(tuslar):
    satir, sutun = divmod(i, sutun_sayisi)
    satir += 1                      # 0. satır ekrana ayrıldı
    print(f"{tus!r:5} -> grid(row={satir}, column={sutun})")
    if i == 5:
        print("...")
        break</pre>

<h2>Olaylar ve callback'ler</h2>
<p>GUI programı yukarıdan aşağı akmaz; <b>olay güdümlüdür</b> (event-driven). Sen fonksiyonları kaydedersin, kullanıcı tıklayınca ya da tuşa basınca tkinter onları çağırır. Bu fonksiyonlara <b>callback</b> denir. En sık hata, fonksiyonu kaydetmek yerine <b>çağırmaktır</b>:</p>
<div class="tbl-wrap"><table>
<tr><th>Yazım</th><th>Ne olur?</th></tr>
<tr><td><code>command=hesapla</code></td><td>Fonksiyon nesnesi kaydedilir; tıklanınca çalışır. Doğru.</td></tr>
<tr><td><code>command=hesapla()</code></td><td>Fonksiyon pencere kurulurken HEMEN bir kez çalışır, dönüş değeri (çoğu zaman None) kaydedilir; tıklama hiçbir şey yapmaz.</td></tr>
<tr><td><code>command=lambda: ekle("7")</code></td><td>Argümanlı çağrı için sarmalayıcı; tıklanınca <code>ekle("7")</code> çalışır.</td></tr>
<tr><td><code>entry.bind("&lt;Return&gt;", f)</code></td><td>Klavye/fare olayı; <code>f(event)</code> biçiminde bir olay nesnesiyle çağrılır.</td></tr>
</table></div>
<p>Bunu tkinter'sız, sahte bir düğme sınıfıyla burada görebilirsin:</p>
<pre class="py">class Dugme:                       # tk.Button'ın davranışını taklit eder
    def __init__(self, metin, command=None):
        self.metin = metin
        self.command = command
    def tikla(self):
        if self.command is not None:
            self.command()
        else:
            print(f"[{self.metin}] tıklandı ama bağlı komut yok")

def hesapla():
    print("Hesaplandı!")
    return None

dogru = Dugme("Hesapla", command=hesapla)
yanlis = Dugme("Hesapla", command=hesapla())   # burada bir kez çalışır!
print("--- kullanıcı tıklıyor ---")
dogru.tikla()
yanlis.tikla()</pre>

<h2>mainloop: olay döngüsü</h2>
<p><code>mainloop()</code> sonsuz bir döngüdür: işletim sisteminden olayları (tıklama, tuş, yeniden çizim, zamanlayıcı) bir kuyruktan alır ve ilgili callback'i çağırır. Bu yüzden callback'ler <b>kısa</b> olmalıdır; 10 saniyelik bir hesap yaparsan döngü o süre boyunca olay işleyemez ve pencere "yanıt vermiyor" olur. Mekanizma kabaca şöyledir:</p>
<pre class="py">from collections import deque

kuyruk = deque()
kayitli = {}                                   # olay adı -> callback listesi

def bind(olay, fonk):
    kayitli.setdefault(olay, []).append(fonk)

def mainloop():
    while kuyruk:                              # gerçekte: pencere kapanana dek
        olay, veri = kuyruk.popleft()
        for fonk in kayitli.get(olay, []):
            fonk(veri)

bind("tikla", lambda v: print("Sepete eklendi:", v))
bind("tus", lambda v: print("Basılan tuş:", v))
bind("tus", lambda v: print("  (arama kutusu güncellendi)"))
kuyruk.extend([("tus", "a"), ("tikla", "Termos"), ("kapat", None), ("tus", "b")])
mainloop()
print("Pencere kapandı")</pre>
<p>Zamanlayıcı için tkinter <code>pencere.after(1000, fonk)</code> sunar: "1 saniye sonra fonk'u kuyruğa koy". Saat, ilerleme çubuğu, periyodik yenileme hep bununla yapılır; <code>time.sleep</code> ise döngüyü dondurur.</p>

<h2>StringVar: widget ile değişkeni bağlamak</h2>
<p><code>tk.StringVar</code>, <code>IntVar</code>, <code>DoubleVar</code>, <code>BooleanVar</code> bir değeri tutar ve ona bağlı widget'ları otomatik günceller. <code>Label(textvariable=sonuc)</code> yazarsan <code>sonuc.set("...")</code> etiketi değiştirir; <code>trace_add("write", f)</code> ile değer her yazıldığında bir fonksiyon çalıştırabilirsin (canlı doğrulama). Bu, <b>gözlemci</b> (observer) kalıbıdır:</p>
<pre class="py">class Degisken:                               # tk.StringVar'ın sade taklidi
    def __init__(self, deger=""):
        self._deger = deger
        self._izleyiciler = []
    def get(self):
        return self._deger
    def set(self, yeni):
        self._deger = yeni
        for f in self._izleyiciler:
            f(yeni)
    def trace_add(self, f):
        self._izleyiciler.append(f)

tutar = Degisken()
tutar.trace_add(lambda v: print("Etiket:", v or "(boş)"))
tutar.trace_add(lambda v: print("Geçerli mi?", v.replace(",", ".", 1).replace(".", "", 1).isdigit()))
tutar.set("250,50")
tutar.set("abc")</pre>

<h2>messagebox ve bahşiş hesaplayıcı</h2>
<p><code>tkinter.messagebox</code> hazır diyalog pencereleri sunar: <code>showinfo</code>, <code>showwarning</code>, <code>showerror</code>, <code>askyesno</code>. Şimdi küçük ama tam bir uygulama yazalım. Önce <b>mantık</b> (model): saf Python, tarayıcıda çalışır.</p>
<pre class="py">def bahsis_hesapla(tutar, yuzde, kisi):
    if tutar &lt;= 0 or not 0 &lt;= yuzde &lt;= 100 or kisi &lt; 1:
        raise ValueError("Geçersiz girdi")
    bahsis = round(tutar * yuzde / 100, 2)
    toplam = round(tutar + bahsis, 2)
    return {"bahsis": bahsis, "toplam": toplam, "kisi_basi": round(toplam / kisi, 2)}

print(bahsis_hesapla(1250.0, 10, 4))
print(bahsis_hesapla(480, 15, 3))
try:
    bahsis_hesapla(100, 120, 2)
except ValueError as e:
    print("Hata:", e)</pre>
<p>Sonra <b>arayüz</b>: yalnız girdiyi okur, modeli çağırır, sonucu gösterir.</p>
<pre class="code">import tkinter as tk
from tkinter import ttk, messagebox
from bahsis_model import bahsis_hesapla      # yukarıdaki fonksiyon

pencere = tk.Tk()
pencere.title("Bahşiş Hesaplayıcı")
tutar, yuzde, kisi, sonuc = tk.StringVar(), tk.StringVar(value="10"), tk.StringVar(value="1"), tk.StringVar()

for satir, (etiket, degisken) in enumerate([("Tutar (TL)", tutar), ("Bahşiş %", yuzde), ("Kişi", kisi)]):
    ttk.Label(pencere, text=etiket).grid(row=satir, column=0, sticky="w", padx=8, pady=4)
    ttk.Entry(pencere, textvariable=degisken, width=12).grid(row=satir, column=1, padx=8)

def hesapla(event=None):
    try:
        s = bahsis_hesapla(float(tutar.get().replace(",", ".")), float(yuzde.get()), int(kisi.get()))
    except ValueError:
        messagebox.showerror("Hata", "Lütfen geçerli sayılar girin.")
        return
    sonuc.set(f"Bahşiş {s['bahsis']:.2f} | Toplam {s['toplam']:.2f} | Kişi başı {s['kisi_basi']:.2f}")

ttk.Button(pencere, text="Hesapla", command=hesapla).grid(row=3, column=0, columnspan=2, pady=6)
ttk.Label(pencere, textvariable=sonuc).grid(row=4, column=0, columnspan=2, pady=4)
pencere.bind("&lt;Return&gt;", hesapla)            # Enter tuşu da hesaplasın
pencere.mainloop()</pre>
<div class="note"><b>Kendi bilgisayarında dene</b>Mantığı <code>bahsis_model.py</code>, arayüzü <code>bahsis_app.py</code> olarak aynı klasöre kaydet ve <code>python bahsis_app.py</code> çalıştır. <code>hesapla(event=None)</code> imzası sayesinde aynı fonksiyon hem düğmeden (argümansız) hem Enter tuşundan (olay nesnesiyle) çağrılabilir.</div>

<h2>MVC: mantığı arayüzden ayırmak</h2>
<p><b>Model–View–Controller</b> (Model–Görünüm–Denetleyici) bu ayrımı adlandırır. <b>Model</b> iş kuralıdır (hesap, doğrulama, veri). <b>View</b> pencere ve widget'lardır, kural içermez. <b>Controller</b> görünümden girdiyi alır, modeli çağırır, sonucu görünüme yazar. Controller'ı, <code>get()</code>/<code>set()</code> sunan herhangi bir nesneyle çalışacak biçimde yazarsan onu gerçek pencere olmadan, sahte bir görünümle test edebilirsin. Bu dersin mini projesi tam olarak bu.</p>

<h2>Hesap makinesi bir durum makinesidir</h2>
<p>Hesap makinesinin ekranı, o ana kadar basılan tuşlara bağlı bir <b>durumdur</b>: ekrandaki sayı, bekleyen işlem, biriken değer ve "yeni sayı mı başlıyor?" bayrağı. Her tuş bu durumu değiştirir. Arayüzdeki 16 düğmenin her biri yalnızca <code>makine.bas("7")</code> çağırır ve <code>ekran</code>'ı etikete yazar.</p>
<pre class="py">class MiniHesap:
    def __init__(self):
        self.ekran, self.birikim, self.islem, self.yeni = "0", None, None, True
    def bas(self, tus):
        if tus.isdigit():
            self.ekran = tus if self.yeni or self.ekran == "0" else self.ekran + tus
            self.yeni = False
        elif tus in "+-":
            self.esittir()
            self.birikim, self.islem, self.yeni = float(self.ekran), tus, True
        elif tus == "=":
            self.esittir()
    def esittir(self):
        if self.islem and not self.yeni:
            b, s = self.birikim, float(self.ekran)
            sonuc = b + s if self.islem == "+" else b - s
            self.ekran = str(int(sonuc)) if sonuc == int(sonuc) else str(sonuc)
            self.islem, self.yeni = None, True

m = MiniHesap()
for tus in "12+30-5=":
    m.bas(tus)
    print(f"{tus} -> ekran {m.ekran}")</pre>

<h2>Döngüde düğme oluşturma tuzağı</h2>
<p>Tuşları döngüyle oluştururken <code>command=lambda: ekle(tus)</code> yazarsan bütün düğmeler <b>son</b> tuşu ekler. Lambda <code>tus</code>'un değerini değil adını hatırlar; tıklandığında döngü çoktan bitmiş ve <code>tus</code> son değerde kalmıştır (geç bağlama, late binding). Çözüm: değeri varsayılan argümanla dondurmak.</p>
<pre class="py">ekran = []
yanlis = [lambda: ekran.append(t) for t in "123"]
dogru = [lambda t=t: ekran.append(t) for t in "123"]
for f in yanlis:
    f()
print("yanlış:", "".join(ekran))
ekran.clear()
for f in dogru:
    f()
print("doğru :", "".join(ekran))</pre>

<h2>Alternatifler</h2>
<div class="tbl-wrap"><table>
<tr><th>Araç</th><th>Güçlü yanı</th><th>Dikkat</th><th>Kurulum</th></tr>
<tr><td>tkinter (+ttk)</td><td>Python ile gelir, hafif, öğrenmesi kolay</td><td>Görünüm sade; karmaşık arayüzde zahmetli</td><td>Yok</td></tr>
<tr><td>customtkinter</td><td>tkinter üstünde modern, koyu tema</td><td>Topluluk projesi</td><td><code>pip install customtkinter</code></td></tr>
<tr><td>PySide6 (Qt)</td><td>Profesyonel, zengin widget, Qt Designer</td><td>Büyük paket; öğrenme eğrisi</td><td><code>pip install PySide6</code></td></tr>
<tr><td>PyQt6</td><td>PySide6 ile benzer API</td><td>GPL/ticari lisans; kapalı kaynakta dikkat</td><td><code>pip install PyQt6</code></td></tr>
<tr><td>Flet</td><td>Flutter tabanlı; masaüstü, web ve mobil tek kod</td><td>Görece yeni; sürüm değişiklikleri</td><td><code>pip install flet</code></td></tr>
<tr><td>Kivy</td><td>Dokunmatik ve mobil odaklı</td><td>Kendine özgü görünüm</td><td><code>pip install kivy</code></td></tr>
</table></div>
<p>Uygulamayı Python kurulu olmayan bir bilgisayara dağıtmak için <code>pip install pyinstaller</code> ve <code>pyinstaller --onefile --windowed bahsis_app.py</code> ile tek dosyalık çalıştırılabilir üretebilirsin.</p>

<div class="note"><b>Gerçek işte</b>Şirket içinde masaüstü araçlar genellikle bir uzmanın tekrar eden işini otomatikleştirmek için doğar: depoda etiket basma, muhasebede dosya birleştirme, İK'da izin hesabı. Bu araçların ömrü çoğu zaman beklenenden uzun olur ve bir gün web'e taşınması istenir. Mantığı arayüzden ayırdıysan taşıma, yalnız görünüm katmanını yeniden yazmaktır; ayırmadıysan baştan yazmaktır. Ayrıca ayrık mantık birim testiyle güvenceye alınır; GUI'yi elle tıklayarak test etmek ise yavaş ve güvenilmezdir.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Uzun işlerde donmayan arayüz</h3>
<p>Rapor oluşturmak gibi uzun bir işi callback içinde yaparsan pencere donar. Çözüm: işi <code>threading.Thread</code> ile arka planda çalıştırmak ve sonucu bir <code>queue.Queue</code>'ya koymak; arayüz ise <code>pencere.after(100, kontrol_et)</code> ile kuyruğu periyodik olarak yoklar. Altın kural: widget'lara <b>yalnız ana iş parçacığı</b> dokunur; arka plandaki thread'den <code>label.config(...)</code> çağırmak rastgele çökmelere yol açar.</p>
<h3>Olay nesnesi ve "break"</h3>
<p><code>bind</code> ile bağlanan fonksiyon bir <code>event</code> alır: <code>event.char</code>, <code>event.keysym</code>, <code>event.x</code>, <code>event.widget</code>. Fonksiyon <code>"break"</code> döndürürse olayın diğer işleyicilere (ör. Entry'nin harfi yazması) gitmesi durur; yalnız rakam kabul eden bir kutu böyle yapılır.</p>
<h3>Test edilebilir GUI</h3>
<p>Controller'ı sahte görünümle test etmek ilk adımdır. Gerçek widget testleri için pytest-qt (Qt) ya da tkinter'da <code>widget.event_generate</code> kullanılabilir, ama bunlar yavaştır ve ekran gerektirir. Kuralların yüzde doksanını model ve controller testleri kapsamalı.</p>
</section>
'''

ex = []
ex += [
{'t': 'mc', 'stage': 'Isınma',
 'q': '<code>tk.Button(pencere, text="Hesapla", command=hesapla())</code> yazıldı. Ne olur?',
 'o': ['Düğmeye her basıldığında hesapla iki kez arka arkaya çalışır', 'Kurulumda bir kez çalışır; tıklama hiçbir şey yapmaz', 'SyntaxError: command parametresi parantezli çağrı almaz', 'Düğme ancak ikinci tıklamadan itibaren hesapla\'yı çalıştırır'], 'a': 1,
 'why': 'Parantez fonksiyonu hemen çağırır ve command\'a dönüş değeri (genellikle None) atanır. Doğrusu command=hesapla; argüman gerekiyorsa command=lambda: hesapla(x).'},
{'t': 'mc', 'stage': 'Isınma',
 'q': '<code>pencere.mainloop()</code> satırı ne yapar?',
 'o': ['Pencereyi bir kez çizip programı sonlandırır', 'Tüm callback\'leri sırayla bir kez çalıştırır', 'Pencere kapanana dek olayları bekleyip işleyen döngüyü başlatır', 'Arka planda yeni bir iş parçacığı açar ve hemen döner'], 'a': 2,
 'why': 'mainloop olay döngüsüdür: kuyruktaki tıklama, tuş, zamanlayıcı olaylarını alıp ilgili callback\'leri çağırır ve pencere kapanana kadar geri dönmez. Ondan sonraki satırlar pencere kapanınca çalışır.'},
{'t': 'mc', 'stage': 'Isınma',
 'q': 'Bir Frame içinde etiketi <code>pack()</code>, altındaki düğmeleri <code>grid()</code> ile yerleştirdin. Ne beklemelisin?',
 'o': ['Donma ya da TclError; ayrı Frame kullanmalısın', 'grid çağrıları otomatik olarak pack\'e dönüştürülür', 'İkisi aynı kapta sorunsuz birlikte çalışır', 'Yalnız ilk kullanılan yöntem geçerli olur, diğeri yok sayılır'], 'a': 0,
 'why': 'Aynı kap içinde iki yerleşim yöneticisi boyut için birbiriyle yarışır; tkinter bunu hata ile engeller ya da donar. Farklı düzenler için her birini ayrı bir Frame\'e koy.'},
]
ex += [
{'t': 'predict', 'stage': 'Kodu oku', 'q': 'Bu kod ne yazdırır?',
 'code': C('''
def tikla():
    print("tıklandı")

class Dugme:
    def __init__(self, command=None):
        self.command = command
    def bas(self):
        if self.command:
            self.command()

d = Dugme(command=tikla())
print("hazır")
d.bas()
'''),
 'o': ['hazır\ntıklandı', 'tıklandı\nhazır', 'tıklandı\nhazır\ntıklandı', 'hazır'], 'a': 1,
 'why': 'tikla() Dugme oluşturulurken çalışır ve "tıklandı" basılır; command None olur. bas() içinde if self.command False olduğu için hiçbir şey çağrılmaz.'},
{'t': 'predict', 'stage': 'Kodu oku', 'q': 'Bu kod ne yazdırır?',
 'code': C('''
komutlar = []
for tus in ["7", "8", "9"]:
    komutlar.append(lambda: print(tus, end=" "))
for k in komutlar:
    k()
'''),
 'o': ['7 8 9', '9 9 9', '7 7 7', 'NameError'], 'a': 1,
 'why': 'Lambda tus değişkeninin adını hatırlar, değerini değil. Çağrıldıklarında döngü bitmiş ve tus "9" olmuştur. Düzeltme: lambda t=tus: print(t, end=" ").'},
{'t': 'predict', 'stage': 'Kodu oku', 'q': 'Bu kod ne yazdırır?',
 'code': C('''
from collections import deque
kuyruk = deque([("tus", "a"), ("tikla", "Kaydet"), ("tus", "b")])
isleyiciler = {"tus": [lambda v: print("yaz", v)],
               "tikla": [lambda v: print("kaydet"), lambda v: kuyruk.append(("tus", "!"))]}
while kuyruk:
    olay, veri = kuyruk.popleft()
    for f in isleyiciler[olay]:
        f(veri)
'''),
 'o': ['yaz a\nkaydet\nyaz b', 'yaz a\nkaydet\nyaz !\nyaz b', 'yaz a\nkaydet\nyaz b\nyaz !', 'yaz a\nyaz b\nkaydet\nyaz !'], 'a': 2,
 'why': 'Olaylar kuyruk sırasıyla işlenir. "tikla" işleyicisi yeni bir olayı kuyruğun SONUNA ekler; bu yüzden "b"den sonra işlenir. Olay döngüsünde bir callback\'in ürettiği olaylar hemen değil sırası gelince çalışır.'},
{'t': 'order', 'stage': 'Kodu oku',
 'q': '<p>Bahşiş hesaplayıcının mantık fonksiyonunu ve denemesini doğru sıraya koy. Çıktı <code>(125.0, 1375.0, 343.75)</code> olmalı.</p>',
 'lines': ['def bahsis(tutar, yuzde, kisi):', '    b = round(tutar * yuzde / 100, 2)', '    toplam = tutar + b', '    kisi_basi = round(toplam / kisi, 2)', '    return b, toplam, kisi_basi', 'print(bahsis(1250, 10, 4))'],
 'expect': '(125.0, 1375.0, 343.75)\n',
 'hint': 'Her satır bir öncekinin sonucunu kullanır: önce bahşiş, sonra toplam, sonra kişi başı.',
 'why': 'Mantık fonksiyonu girdileri alıp sonuç döndürür; pencereden habersizdir. Arayüz yalnız Entry değerlerini bu fonksiyona verip sonucu etikete yazar.'},
]
ex += [
{'t': 'code', 'stage': 'Rehberli', 'id': 'gui-tkinter-1', 'diff': 1,
 'q': '<p>Bahşiş formunun mantığını yaz: <code>bahsis_hesapla(tutar_metni, yuzde_metni, kisi_metni)</code>. Üç girdi de Entry\'den gelen <b>metinlerdir</b>.</p><ul><li>Boşlukları kırp; ondalık ayırıcı olarak virgül de kabul et.</li><li>Tutar sayıya çevrilemiyorsa ya da 0 veya negatifse <code>ValueError("Tutar pozitif bir sayı olmalı")</code>.</li><li>Yüzde boşsa 10 say; 0–100 dışındaysa ya da çevrilemiyorsa <code>ValueError("Yüzde 0-100 arası olmalı")</code>.</li><li>Kişi tam sayı ve en az 1 olmalı; değilse <code>ValueError("Kişi sayısı en az 1 olmalı")</code>.</li><li><code>{"bahsis", "toplam", "kisi_basi"}</code> sözlüğü döndür; hepsi <code>round(..., 2)</code>.</li></ul>',
 'guide': ['Yardımcı bir sayi(metin) fonksiyonu yaz: strip + virgülü noktaya çevir + float.', 'Tutarı try/except ValueError içinde çevir; olumsuzsa kendi mesajınla ValueError fırlat.', 'Yüzde metni boşsa "10" kabul et, sonra aralığı denetle.', 'Kişi için int() kullan ve 1\'den küçükse hata ver.', 'Hesabı yap ve sözlüğü döndür.'],
 'example': C('''
def kur_cevir(metin):
    try:
        deger = float(metin.strip().replace(",", "."))
    except ValueError:
        raise ValueError("Kur sayı olmalı") from None
    if deger <= 0:
        raise ValueError("Kur sayı olmalı")
    return deger

print(kur_cevir(" 34,25 "))
'''),
 'start': C('''
def bahsis_hesapla(tutar_metni, yuzde_metni, kisi_metni):
    # TODO: metinleri sayıya çevir ve doğrula
    # TODO: bahşiş, toplam, kişi başı hesapla
    return {}
'''),
 'sol': C('''
def _sayi(metin):
    return float(metin.strip().replace(",", "."))


def bahsis_hesapla(tutar_metni, yuzde_metni, kisi_metni):
    try:
        tutar = _sayi(tutar_metni)
    except ValueError:
        tutar = -1
    if tutar <= 0:
        raise ValueError("Tutar pozitif bir sayı olmalı")
    yuzde_metni = yuzde_metni.strip() or "10"
    try:
        yuzde = _sayi(yuzde_metni)
    except ValueError:
        yuzde = -1
    if not 0 <= yuzde <= 100:
        raise ValueError("Yüzde 0-100 arası olmalı")
    try:
        kisi = int(kisi_metni.strip())
    except ValueError:
        kisi = 0
    if kisi < 1:
        raise ValueError("Kişi sayısı en az 1 olmalı")
    bahsis = round(tutar * yuzde / 100, 2)
    toplam = round(tutar + bahsis, 2)
    return {"bahsis": bahsis, "toplam": toplam, "kisi_basi": round(toplam / kisi, 2)}
'''),
 'tests': C('''
assert bahsis_hesapla("1250", "10", "4") == {"bahsis": 125.0, "toplam": 1375.0, "kisi_basi": 343.75}, "temel hesap yanlış"
assert bahsis_hesapla(" 250,50 ", "", "2") == {"bahsis": 25.05, "toplam": 275.55, "kisi_basi": 137.78}, f"virgül ve boş yüzde (10): {bahsis_hesapla(' 250,50 ', '', '2')}"
for args, mesaj in [(("abc", "10", "1"), "Tutar pozitif bir sayı olmalı"), (("0", "10", "1"), "Tutar pozitif bir sayı olmalı"),
                    (("100", "120", "1"), "Yüzde 0-100 arası olmalı"), (("100", "%10", "1"), "Yüzde 0-100 arası olmalı"),
                    (("100", "10", "0"), "Kişi sayısı en az 1 olmalı"), (("100", "10", "2.5"), "Kişi sayısı en az 1 olmalı")]:
    try:
        bahsis_hesapla(*args)
        assert False, f"{args} için ValueError bekleniyordu"
    except ValueError as e:
        assert str(e) == mesaj, f"{args}: mesaj {mesaj!r} olmalı, gelen {str(e)!r}"
'''),
 'hints': ['Kavram: arayüzden gelen her şey metindir; çevirme ve doğrulama mantık katmanının işidir.', 'Çevirme hatasını yakalayıp geçersiz bir değer ata (ör. -1), sonra tek bir aralık kontrolüyle kendi mesajını fırlat.', 'yuzde_metni = yuzde_metni.strip() or "10"'],
 'why': 'Kullanıcıya gösterilecek açık mesajlar mantık katmanında üretilir; arayüz yalnız except ValueError as e ile mesajı messagebox\'a verir. Böylece aynı doğrulama web ya da komut satırı arayüzünde de kullanılabilir.'},
{'t': 'code', 'stage': 'Rehberli', 'id': 'gui-tkinter-2', 'diff': 2,
 'q': '<p><code>tk.StringVar</code> benzeri bir <code>Degisken</code> sınıfı yaz:</p><ul><li><code>Degisken(deger="")</code>, <code>get()</code>, <code>set(yeni)</code></li><li><code>trace_add(fonk)</code>: değer her <code>set</code> edildiğinde <code>fonk(yeni)</code> çağrılsın; benzersiz bir kimlik (1, 2, 3... sırayla artan tam sayı) döndürsün.</li><li><code>trace_remove(kimlik)</code>: o izleyiciyi kaldırsın; bilinmeyen kimlikte <code>KeyError</code> versin.</li><li>İzleyiciler eklenme sırasıyla çağrılsın.</li></ul>',
 'guide': ['Kurucuda değeri, boş bir izleyici sözlüğünü ve sayaç (0) tut.', 'trace_add sayacı artırıp sözlüğe kimlik → fonk ekler ve kimliği döndürür.', 'set önce değeri günceller, sonra sözlüğün değerlerini sırayla çağırır.', 'trace_remove için del self._izleyiciler[kimlik] yeterli (yoksa KeyError zaten oluşur).'],
 'example': C('''
class Sayac:
    def __init__(self):
        self.n = 0
        self.dinleyiciler = []
    def artir(self):
        self.n += 1
        for f in self.dinleyiciler:
            f(self.n)

s = Sayac()
s.dinleyiciler.append(lambda n: print("Sayaç:", n))
s.artir(); s.artir()
'''),
 'start': C('''
class Degisken:
    def __init__(self, deger=""):
        self._deger = deger
        # TODO: izleyiciler ve sayaç

    def get(self):
        return self._deger

    def set(self, yeni):
        # TODO: değeri güncelle ve izleyicileri çağır
        pass

    # TODO: trace_add, trace_remove
'''),
 'sol': C('''
class Degisken:
    def __init__(self, deger=""):
        self._deger = deger
        self._izleyiciler = {}
        self._sayac = 0

    def get(self):
        return self._deger

    def set(self, yeni):
        self._deger = yeni
        for f in list(self._izleyiciler.values()):
            f(yeni)

    def trace_add(self, fonk):
        self._sayac += 1
        self._izleyiciler[self._sayac] = fonk
        return self._sayac

    def trace_remove(self, kimlik):
        del self._izleyiciler[kimlik]
'''),
 'tests': C('''
v = Degisken("10")
assert v.get() == "10", "başlangıç değeri"
gorulen = []
k1 = v.trace_add(lambda x: gorulen.append(("etiket", x)))
k2 = v.trace_add(lambda x: gorulen.append(("dogrula", x)))
assert (k1, k2) == (1, 2), f"kimlikler 1, 2 olmalı: {(k1, k2)}"
v.set("15")
assert v.get() == "15" and gorulen == [("etiket", "15"), ("dogrula", "15")], f"izleyiciler sırayla çağrılmalı: {gorulen}"
v.trace_remove(k1)
v.set("20")
assert gorulen[-1] == ("dogrula", "20") and len(gorulen) == 3, "kaldırılan izleyici çağrılmamalı"
try:
    v.trace_remove(99)
    assert False, "bilinmeyen kimlik KeyError vermeli"
except KeyError:
    pass
w = Degisken()
assert w.get() == "" and w.trace_add(print) == 1, "her nesnenin kendi sayacı olmalı"
'''),
 'hints': ['Kavram: gözlemci (observer) kalıbı; sözlük Python 3.7+ ekleme sırasını korur.', 'trace_add: self._sayac += 1; self._izleyiciler[self._sayac] = fonk; return self._sayac', 'set: self._deger = yeni; for f in list(self._izleyiciler.values()): f(yeni)'],
 'why': 'Değişken ile ona bağlı widget\'lar arasındaki gevşek bağ budur: değişken kimin dinlediğini bilmez, yalnız haber verir. list(...) ile kopya üzerinde dönmek, bir izleyici çağrı sırasında kendini kaldırırsa sözlüğün döngü sırasında değişmesini önler.'},
{'t': 'code', 'stage': 'Rehberli', 'id': 'gui-tkinter-3', 'diff': 2,
 'q': '<p>İK başvuru formunun doğrulayıcısını yaz: <code>formu_dogrula(alanlar)</code>. <code>alanlar</code> Entry\'lerden okunmuş metinlerin sözlüğüdür (anahtar eksik olabilir, o zaman boş say). Yalnız <b>hatalı</b> alanlar için <code>{alan: mesaj}</code> döndür (hepsi geçerliyse <code>{}</code>):</p><ul><li><code>"ad"</code>: kırpılmış hâli boşsa <code>"Ad boş olamaz"</code></li><li><code>"eposta"</code>: <code>re.fullmatch(r"[^@\\s]+@[^@\\s]+\\.[A-Za-z]{2,}", ...)</code> uymuyorsa <code>"Geçersiz e-posta"</code></li><li><code>"yas"</code>: tam sayı değilse ya da 18–65 dışındaysa <code>"Yaş 18-65 arası olmalı"</code></li></ul>',
 'guide': ['Boş bir hatalar sözlüğü oluştur.', 'Her alanı alanlar.get(ad, "").strip() ile oku.', 'E-postayı re.fullmatch ile denetle.', 'Yaşı int\'e çevirmeyi try/except içinde dene; aralığı kontrol et.', 'Sözlüğü döndür.'],
 'example': C('''
import re
def telefon_hatasi(metin):
    metin = metin.replace(" ", "")
    if not re.fullmatch(r"5\\d{9}", metin):
        return "Telefon 5 ile başlayan 10 hane olmalı"
    return None

print(telefon_hatasi("532 123 45 67"), telefon_hatasi("12"))
'''),
 'start': C('''
import re

def formu_dogrula(alanlar):
    hatalar = {}
    # TODO: ad, eposta, yas kontrolleri
    return hatalar
'''),
 'sol': C('''
import re

def formu_dogrula(alanlar):
    hatalar = {}
    ad = alanlar.get("ad", "").strip()
    eposta = alanlar.get("eposta", "").strip()
    yas = alanlar.get("yas", "").strip()
    if not ad:
        hatalar["ad"] = "Ad boş olamaz"
    if not re.fullmatch(r"[^@\\s]+@[^@\\s]+\\.[A-Za-z]{2,}", eposta):
        hatalar["eposta"] = "Geçersiz e-posta"
    try:
        y = int(yas)
    except ValueError:
        y = 0
    if not 18 <= y <= 65:
        hatalar["yas"] = "Yaş 18-65 arası olmalı"
    return hatalar
'''),
 'tests': C('''
assert formu_dogrula({"ad": "Elif Yıldız", "eposta": "elif@anadolu.com.tr", "yas": " 29 "}) == {}, "geçerli form hatasız olmalı"
assert formu_dogrula({"ad": "  ", "eposta": "elif@anadolu", "yas": "17"}) == {"ad": "Ad boş olamaz", "eposta": "Geçersiz e-posta", "yas": "Yaş 18-65 arası olmalı"}, "üç hata da raporlanmalı"
assert formu_dogrula({"ad": "Can", "eposta": "can@x.io", "yas": "yirmi"}) == {"yas": "Yaş 18-65 arası olmalı"}, "sayı olmayan yaş"
assert formu_dogrula({}) == {"ad": "Ad boş olamaz", "eposta": "Geçersiz e-posta", "yas": "Yaş 18-65 arası olmalı"}, "eksik anahtarlar boş sayılmalı"
assert formu_dogrula({"ad": "A", "eposta": "a b@c.com", "yas": "65"}) == {"eposta": "Geçersiz e-posta"}, "boşluklu e-posta geçersiz, 65 sınırı geçerli"
'''),
 'hints': ['Kavram: her alan bağımsız denetlenir; ilk hatada durma (kullanıcı tüm hataları birlikte görmeli).', 'alanlar.get("yas", "").strip() ile oku; int çevirme hatasında y = 0 ver ki aralık kontrolü yakalasın.', 'if not re.fullmatch(desen, eposta): hatalar["eposta"] = "Geçersiz e-posta"'],
 'why': 'Doğrulayıcı tüm hataları bir sözlükte döndürdüğü için arayüz her hatayı ilgili kutunun yanında gösterebilir (ör. kırmızı etiket). Fonksiyon tkinter\'dan habersiz olduğu için birim testiyle saniyeler içinde doğrulanır.'},
]
ex += [
{'t': 'code', 'stage': 'Kendin yaz', 'id': 'gui-tkinter-4', 'diff': 2,
 'q': '<p>tkinter\'ın <code>bind</code> mekanizmasını taklit eden <code>OlayYoneticisi</code> sınıfını yaz:</p><ul><li><code>bind(olay, fonk)</code>: aynı olaya birden fazla fonksiyon bağlanabilir (eklenme sırası korunur).</li><li><code>unbind(olay, fonk)</code>: o fonksiyonu kaldırır; bağlı değilse sessizce geçer.</li><li><code>tetikle(olay, **veri)</code>: bağlı fonksiyonları sırayla <code>fonk(**veri)</code> ile çağırır ve dönüş değerlerinin listesini döndürür. Bir fonksiyon <code>"break"</code> döndürürse sonrakiler çağrılmaz ("break" listeye eklenir). Bağlı fonksiyon yoksa <code>[]</code>.</li></ul>',
 'start': C('''
class OlayYoneticisi:
    def __init__(self):
        pass
'''),
 'sol': C('''
class OlayYoneticisi:
    def __init__(self):
        self._baglar = {}

    def bind(self, olay, fonk):
        self._baglar.setdefault(olay, []).append(fonk)

    def unbind(self, olay, fonk):
        liste = self._baglar.get(olay, [])
        if fonk in liste:
            liste.remove(fonk)

    def tetikle(self, olay, **veri):
        sonuclar = []
        for fonk in list(self._baglar.get(olay, [])):
            s = fonk(**veri)
            sonuclar.append(s)
            if s == "break":
                break
        return sonuclar
'''),
 'tests': C('''
oy = OlayYoneticisi()
def rakam_mi(char):
    return None if char.isdigit() else "break"
def yaz(char):
    return f"yazıldı:{char}"
oy.bind("<Key>", rakam_mi)
oy.bind("<Key>", yaz)
assert oy.tetikle("<Key>", char="7") == [None, "yazıldı:7"], "rakam iki işleyiciden de geçmeli"
assert oy.tetikle("<Key>", char="x") == ["break"], "break sonrası işleyiciler çağrılmamalı"
assert oy.tetikle("<Return>") == [], "bağsız olay boş liste"
oy.unbind("<Key>", rakam_mi)
oy.unbind("<Key>", rakam_mi)
assert oy.tetikle("<Key>", char="x") == ["yazıldı:x"], "unbind sonrası yalnız yaz kalmalı; ikinci unbind hata vermemeli"
b = OlayYoneticisi()
assert b.tetikle("<Key>", char="1") == [], "her yönetici kendi bağlarını tutmalı"
'''),
 'hints': ['Olay adından fonksiyon listesine sözlük: self._baglar.setdefault(olay, []).append(fonk).', 'tetikle içinde sonucu listeye ekledikten sonra if s == "break": break.'],
 'why': 'tkinter\'da bind ile bağlanan işleyiciler zincir hâlinde çalışır ve "break" zinciri keser; yalnız rakam kabul eden kutular böyle yapılır. Taklit sınıf aynı fikri arayüzsüz, test edilebilir biçimde gösterir.'},
{'t': 'code', 'stage': 'Kendin yaz', 'id': 'gui-tkinter-5', 'diff': 2,
 'q': '<p>Hesap makinesi tuşları için grid konumlarını hesaplayan <code>grid_konumlari(etiketler, sutun, ilk_satir=1)</code> fonksiyonunu yaz. Etiketleri soldan sağa, yukarıdan aşağı yerleştirip <code>{etiket: (satir, sutun)}</code> döndürsün. <code>sutun</code> 1\'den küçükse <code>ValueError</code>; aynı etiket iki kez geçerse <code>ValueError("Tekrarlanan etiket: X")</code>.</p>',
 'start': C('''
def grid_konumlari(etiketler, sutun, ilk_satir=1):
    return {}
'''),
 'sol': C('''
def grid_konumlari(etiketler, sutun, ilk_satir=1):
    if sutun < 1:
        raise ValueError("Sütun sayısı en az 1 olmalı")
    konum = {}
    for i, e in enumerate(etiketler):
        if e in konum:
            raise ValueError(f"Tekrarlanan etiket: {e}")
        satir, s = divmod(i, sutun)
        konum[e] = (ilk_satir + satir, s)
    return konum
'''),
 'tests': C('''
tuslar = ["7", "8", "9", "/", "4", "5", "6", "*", "1", "2", "3", "-", "0", ".", "=", "+"]
k = grid_konumlari(tuslar, 4)
assert k["7"] == (1, 0) and k["/"] == (1, 3) and k["4"] == (2, 0) and k["+"] == (4, 3), f"konumlar yanlış: {k}"
assert len(k) == 16, "16 tuş"
assert grid_konumlari(["C", "←", "OK"], 2, ilk_satir=0) == {"C": (0, 0), "←": (0, 1), "OK": (1, 0)}, "eksik son satır ve ilk_satir"
assert grid_konumlari([], 3) == {}, "boş liste"
for kotu in ((["1"], 0), (["1", "2", "1"], 2)):
    try:
        grid_konumlari(*kotu)
        assert False, f"{kotu} ValueError vermeli"
    except ValueError as e:
        if kotu[1] == 2:
            assert str(e) == "Tekrarlanan etiket: 1", str(e)
'''),
 'hints': ['divmod(i, sutun) → (satır, sütun).', 'Tekrar kontrolü: etiket zaten sözlükte varsa hata ver.'],
 'why': 'divmod tek adımda satır ve sütunu verir. Konum hesabını ayrı bir fonksiyona almak, arayüz kodunu tek döngüye indirir: for e, (r, c) in grid_konumlari(...).items(): Button(...).grid(row=r, column=c).'},
{'t': 'code', 'stage': 'Kendin yaz', 'id': 'gui-tkinter-6', 'diff': 2,
 'q': '<p>Bir <code>Listbox</code>\'ın arkasındaki modeli yaz: <code>GorevListesi</code>.</p><ul><li><code>ekle(metin)</code>: kırpılmış metin boşsa ya da (büyük/küçük harf duyarsız) zaten varsa eklemez ve <code>False</code> döner; aksi hâlde ekleyip <code>True</code>.</li><li><code>sil_secili(secim)</code>: <code>secim</code>, <code>curselection()</code> gibi bir demettir (<code>()</code> ya da <code>(2,)</code>). Boşsa <code>None</code>, değilse o indeksteki görevi silip döndürür.</li><li><code>goster()</code>: <code>["1. Faturaları gönder", "2. ..."]</code> biçiminde liste.</li><li><code>len(liste)</code> görev sayısını versin.</li></ul>',
 'start': C('''
class GorevListesi:
    pass
'''),
 'sol': C('''
class GorevListesi:
    def __init__(self):
        self._gorevler = []

    def ekle(self, metin):
        metin = metin.strip()
        if not metin or metin.casefold() in (g.casefold() for g in self._gorevler):
            return False
        self._gorevler.append(metin)
        return True

    def sil_secili(self, secim):
        if not secim:
            return None
        return self._gorevler.pop(secim[0])

    def goster(self):
        return [f"{i}. {g}" for i, g in enumerate(self._gorevler, 1)]

    def __len__(self):
        return len(self._gorevler)
'''),
 'tests': C('''
g = GorevListesi()
assert g.ekle(" Faturaları gönder ") is True and g.ekle("Stok say") is True, "geçerli görevler eklenmeli"
assert g.ekle("   ") is False and g.ekle("stok SAY") is False, "boş ve tekrar eden eklenmemeli"
g.ekle("Kargo etiketle")
assert g.goster() == ["1. Faturaları gönder", "2. Stok say", "3. Kargo etiketle"], f"liste yanlış: {g.goster()}"
assert g.sil_secili(()) is None and len(g) == 3, "seçim yoksa hiçbir şey silinmemeli"
assert g.sil_secili((1,)) == "Stok say", "seçili görev silinip döndürülmeli"
assert g.goster() == ["1. Faturaları gönder", "2. Kargo etiketle"] and len(g) == 2, "numaralar yeniden sıralanmalı"
'''),
 'hints': ['Büyük/küçük harf duyarsız karşılaştırma için casefold() kullan.', 'Boş demet False sayılır: if not secim: return None.'],
 'why': 'Listbox yalnız metin gösterir; hangi görevin var olduğu, tekrarın engellenmesi, numaralandırma model katmanının işidir. Arayüz her değişiklikten sonra listbox.delete(0, "end") ve goster() ile yeniden doldurur.'},
]
ex += [
{'t': 'code', 'stage': 'Hata avı', 'kind': 'bug', 'id': 'gui-tkinter-7', 'diff': 2,
 'q': '<p>Sayısal tuş takımında hangi tuşa basılırsa basılsın ekrana <b>9</b> yazılıyor. Hatayı bul ve düzelt.</p>',
 'start': C('''
class Dugme:
    def __init__(self, metin, command):
        self.metin = metin
        self.command = command

    def tikla(self):
        return self.command()


class Ekran:
    def __init__(self):
        self.metin = ""

    def ekle(self, karakter):
        self.metin += karakter


def tus_takimi_kur(ekran):
    dugmeler = []
    for rakam in "0123456789":
        dugmeler.append(Dugme(rakam, lambda: ekran.ekle(rakam)))
    return dugmeler
'''),
 'sol': C('''
class Dugme:
    def __init__(self, metin, command):
        self.metin = metin
        self.command = command

    def tikla(self):
        return self.command()


class Ekran:
    def __init__(self):
        self.metin = ""

    def ekle(self, karakter):
        self.metin += karakter


def tus_takimi_kur(ekran):
    dugmeler = []
    for rakam in "0123456789":
        dugmeler.append(Dugme(rakam, lambda r=rakam: ekran.ekle(r)))
    return dugmeler
'''),
 'tests': C('''
e = Ekran()
d = tus_takimi_kur(e)
for i in (1, 2, 0, 5):
    d[i].tikla()
assert e.metin == "1205", f"ekran 1205 olmalı, gelen {e.metin!r}"
assert [x.metin for x in d] == list("0123456789"), "düğme etiketleri değişmemeli"
'''),
 'hints': ['Lambda, çağrıldığı anda rakam değişkeninin GÜNCEL değerine bakar.', 'Değeri varsayılan argümanla dondur: lambda r=rakam: ekran.ekle(r)'],
 'why': 'Lambda gövdesindeki rakam, döngü değişkenine yapılan bir göndermedir; tıklandığında döngü bitmiş ve rakam "9" olmuştur. Varsayılan argüman lambda tanımlandığı anda değerlendirilir ve her düğmeye kendi rakamını verir. functools.partial(ekran.ekle, rakam) de aynı işi görür.'},
{'t': 'code', 'stage': 'Hata avı', 'kind': 'bug', 'id': 'gui-tkinter-8', 'diff': 2,
 'q': '<p>Bahşiş uygulamasının "Hesapla" callback\'i kullanıcılar <code>250,50</code> yazınca ve yüzde kutusunu boş bırakınca çöküyor. Fonksiyon şöyle çalışmalı: tutarda virgül kabul edilir, kutulardaki boşluklar önemsenmez, boş yüzde <b>10</b> sayılır ve sonuç <code>"Bahşiş: 25.05 TL"</code> biçiminde döner. Hataları bul ve düzelt.</p>',
 'start': C('''
def bahsis_metni(tutar_str, yuzde_str):
    tutar = tutar_str.replace(",", ".")
    if yuzde_str is None:
        yuzde_str = "10"
    bahsis = float(tutar_str) * float(yuzde_str) / 100
    return f"Bahşiş: {bahsis:.2f} TL"
'''),
 'sol': C('''
def bahsis_metni(tutar_str, yuzde_str):
    tutar = tutar_str.strip().replace(",", ".")
    yuzde_str = yuzde_str.strip()
    if not yuzde_str:
        yuzde_str = "10"
    bahsis = float(tutar) * float(yuzde_str) / 100
    return f"Bahşiş: {bahsis:.2f} TL"
'''),
 'tests': C('''
assert bahsis_metni("250,50", "") == "Bahşiş: 25.05 TL", f"virgül + boş yüzde: {bahsis_metni('250,50', '') if True else ''}"
assert bahsis_metni(" 100 ", " 15 ") == "Bahşiş: 15.00 TL", "boşluklar önemsenmemeli"
assert bahsis_metni("80", "12,5".replace(",", ".")) == "Bahşiş: 10.00 TL", "ondalıklı yüzde"
'''),
 'hints': ['Entry.get() hiçbir zaman None döndürmez; boş kutu "" döndürür.', 'Virgülü düzelttiğin değişkeni (tutar) kullanmıyorsun; float(tutar_str) eski metne bakıyor.'],
 'why': 'İki klasik GUI hatası: boş kutu None değil boş metindir (if not yuzde_str ile yakalanır) ve dönüştürülen değişken yerine ham metnin kullanılması. strip ise kullanıcının kopyala-yapıştırla getirdiği boşlukları temizler.'},
]
ex += [
{'t': 'code', 'stage': 'Meydan okuma', 'id': 'gui-tkinter-9', 'diff': 3,
 'q': '<p>Dört işlemli hesap makinesinin durum makinesini yaz: <code>HesapMakinesi</code>. Arayüzdeki her düğme yalnız <code>bas(tus)</code> çağırır ve <code>ekran</code> (salt okunur property, başlangıç <code>"0"</code>) etikete yazılır.</p><ul><li>Rakamlar: yeni sayı başlıyorsa ya da ekran <code>"0"</code> ise ekranı o rakam yapar, değilse sona ekler.</li><li><code>"."</code>: yeni sayı başlıyorsa <code>"0."</code>; mevcut sayıda nokta yoksa ekler, varsa yok sayar.</li><li><code>"+ - * /"</code>: bekleyen işlem varsa ve yeni sayı girildiyse önce onu hesaplar (soldan sağa: <code>2 + 3 * 4 =</code> → <code>20</code>). Arka arkaya iki işlem tuşunda yalnız işlem değişir (<code>9 + - 3 =</code> → <code>6</code>).</li><li><code>"="</code>: bekleyen işlemi hesaplar; işlem yoksa bir şey yapmaz.</li><li><code>"C"</code>: her şeyi sıfırlar. <code>"←"</code>: yeni sayı başlamadıysa son karakteri siler; ekran boşalırsa <code>"0"</code>.</li><li>Sıfıra bölme: ekran <code>"Hata"</code> olur, durum sıfırlanır (sonraki rakam yeni sayı başlatır).</li><li>Sonuç gösterimi: tam sayıysa <code>"5"</code>, değilse <code>str(round(x, 10))</code> (<code>0.1 + 0.2 =</code> → <code>"0.3"</code>).</li></ul>',
 'start': C('''
class HesapMakinesi:
    def __init__(self):
        self._ekran = "0"

    @property
    def ekran(self):
        return self._ekran

    def bas(self, tus):
        pass
'''),
 'sol': C('''
class HesapMakinesi:
    def __init__(self):
        self._sifirla()

    def _sifirla(self, ekran="0"):
        self._ekran = ekran
        self._birikim = None
        self._islem = None
        self._yeni = True

    @property
    def ekran(self):
        return self._ekran

    @staticmethod
    def _bicim(x):
        x = round(x, 10)
        return str(int(x)) if x == int(x) else str(x)

    def _hesapla(self):
        a, b = self._birikim, float(self._ekran)
        if self._islem == "/" and b == 0:
            self._sifirla("Hata")
            return False
        sonuc = {"+": a + b, "-": a - b, "*": a * b, "/": a / b if b else 0}[self._islem]
        self._ekran = self._bicim(sonuc)
        return True

    def bas(self, tus):
        if tus.isdigit():
            if self._yeni or self._ekran == "0":
                self._ekran = tus
            else:
                self._ekran += tus
            self._yeni = False
        elif tus == ".":
            if self._yeni:
                self._ekran, self._yeni = "0.", False
            elif "." not in self._ekran:
                self._ekran += "."
        elif tus in "+-*/":
            if self._islem and not self._yeni:
                if not self._hesapla():
                    return
            if not (self._islem and self._yeni):
                self._birikim = float(self._ekran)
            self._islem = tus
            self._yeni = True
        elif tus == "=":
            if self._islem and not self._yeni:
                if self._hesapla():
                    self._islem, self._birikim, self._yeni = None, None, True
        elif tus == "C":
            self._sifirla()
        elif tus == "←":
            if not self._yeni:
                self._ekran = self._ekran[:-1] or "0"
'''),
 'tests': C('''
def calistir(tuslar):
    m = HesapMakinesi()
    for t in tuslar:
        m.bas(t)
    return m.ekran
assert HesapMakinesi().ekran == "0", "başlangıç 0"
assert calistir(["1", "2", "+", "3", "0", "="]) == "42", "12 + 30 = 42"
assert calistir(list("2+3*4=")) == "20", "soldan sağa: (2+3)*4 = 20"
assert calistir(list("10/4=")) == "2.5", "10/4 = 2.5"
assert calistir(list("0.1+0.2=")) == "0.3", "0.1+0.2 gösterimi 0.3 olmalı"
assert calistir(list("9+-3=")) == "6", "arka arkaya işlem tuşunda son işlem geçerli"
assert calistir(list("7/0=")) == "Hata", "sıfıra bölme Hata"
assert calistir(list("7/0=5")) == "5", "Hata sonrası rakam yeni sayı başlatır"
assert calistir(list("7/0=5+1=")) == "6", "Hata sonrası durum sıfırlanmış olmalı"
assert calistir(["1", "2", "3", "←"]) == "12" and calistir(["5", "←", "←"]) == "0", "geri silme"
assert calistir(list("..5+.5=")) == "1", "nokta kuralları"
assert calistir(list("12+3C")) == "0" and calistir(list("8=")) == "8", "C sıfırlar, işlemsiz = bir şey yapmaz"
assert calistir(list("6*7=+1=")) == "43", "sonuç üzerinden işleme devam"
m = HesapMakinesi()
try:
    m.ekran = "99"
    assert False, "ekran salt okunur olmalı"
except AttributeError:
    pass
'''),
 'hints': ['Durumu dört alanla tut: ekran metni, birikim (sol işlenen), bekleyen işlem, yeni sayı bayrağı.', 'Ortak hesabı bir yardımcı metoda al; sıfıra bölmede durumu "Hata" ekranıyla sıfırla ve False döndür.', 'İşlem tuşunda: bekleyen işlem varsa ve yeni sayı girildiyse önce hesapla; sonra birikim = float(ekran), islem = tus, yeni = True. Yalnız işlem değişiyorsa birikimi koru.'],
 'why': 'Hesap makinesi küçük ama gerçek bir durum makinesidir: her tuş, mevcut durum ve girdiye göre yeni bir durum üretir. Mantığı tek bir sınıfta toplamak arayüzü 16 satırlık bir döngüye indirir ve kenar durumların (sıfıra bölme, çift işlem, nokta) her biri birim testiyle güvenceye alınır.'},
{'t': 'code', 'stage': 'Meydan okuma', 'id': 'gui-tkinter-10', 'diff': 3,
 'q': '<p>tkinter\'ın <code>after</code> zamanlayıcısını simüle eden <code>OlayDongusu</code> sınıfını yaz (gerçek zaman yok; sanal milisaniye):</p><ul><li><code>simdi</code> niteliği 0\'dan başlar.</li><li><code>after(ms, fonk, *args)</code>: <code>simdi + ms</code> anında çalışacak bir görev planlar ve <code>"after#1"</code>, <code>"after#2"</code>... kimliği döndürür.</li><li><code>after_cancel(kimlik)</code>: görevi iptal eder (bilinmeyen kimlikte sessizce geçer).</li><li><code>calistir(sure)</code>: zamanı <code>sure</code>\'ye kadar ilerletir; vakti gelen görevleri zaman sırasıyla (eşit zamanlıysa planlanma sırasıyla) çalıştırır; her görevden önce <code>simdi</code> görevin zamanına ayarlanır. Görevler yeni görev planlayabilir; <code>sure</code>\'den önceye düşenler de aynı çağrıda çalışır. Sonunda <code>simdi = sure</code>; çalışan görev sayısını döndürür.</li></ul><p>İpucu: <code>heapq</code> ile <code>(zaman, sira, kimlik, fonk, args)</code> öğeleri.</p>',
 'start': C('''
import heapq

class OlayDongusu:
    def __init__(self):
        self.simdi = 0
'''),
 'sol': C('''
import heapq

class OlayDongusu:
    def __init__(self):
        self.simdi = 0
        self._yigin = []
        self._sira = 0
        self._iptal = set()

    def after(self, ms, fonk, *args):
        self._sira += 1
        kimlik = f"after#{self._sira}"
        heapq.heappush(self._yigin, (self.simdi + ms, self._sira, kimlik, fonk, args))
        return kimlik

    def after_cancel(self, kimlik):
        self._iptal.add(kimlik)

    def calistir(self, sure):
        sayi = 0
        while self._yigin and self._yigin[0][0] <= sure:
            zaman, _, kimlik, fonk, args = heapq.heappop(self._yigin)
            if kimlik in self._iptal:
                self._iptal.discard(kimlik)
                continue
            self.simdi = zaman
            fonk(*args)
            sayi += 1
        self.simdi = sure
        return sayi
'''),
 'tests': C('''
d = OlayDongusu()
kayit = []
def saat():
    kayit.append(d.simdi)
    d.after(1000, saat)
k = d.after(1000, saat)
assert k == "after#1", "ilk kimlik after#1"
assert d.calistir(3500) == 3 and kayit == [1000, 2000, 3000], f"periyodik saat: {kayit}"
assert d.simdi == 3500, "calistir sonunda simdi = sure"
sira = []
d2 = OlayDongusu()
d2.after(50, sira.append, "b")
d2.after(10, sira.append, "a")
iptal = d2.after(30, sira.append, "iptal")
d2.after(50, sira.append, "c")
d2.after_cancel(iptal)
d2.after_cancel("after#999")
assert d2.calistir(100) == 3 and sira == ["a", "b", "c"], f"zaman sırası, eşitlikte planlama sırası, iptal: {sira}"
d3 = OlayDongusu()
d3.after(100, sira.append, "geç")
assert d3.calistir(99) == 0 and d3.calistir(100) == 1, "vakti gelmeyen çalışmamalı"
'''),
 'hints': ['Yığına (zaman, sira, kimlik, fonk, args) koy; sira eşit zamanlarda planlama sırasını korur ve fonksiyonların karşılaştırılmasını önler.', 'İptali bir kümede tut; çıkarırken iptalse atla.', 'Döngü: while yigin and yigin[0][0] <= sure: pop → simdi = zaman → fonk(*args).'],
 'why': 'Gerçek olay döngüleri (tkinter, asyncio) zamanlayıcıları tam olarak böyle bir öncelik kuyruğunda tutar. Sanal zamanla yazılan döngü, "her saniye güncellenen saat" gibi davranışları beklemeden ve deterministik olarak test etmeyi sağlar.'},
]
ex += [
{'t': 'code', 'stage': 'Mini proje', 'id': 'gui-tkinter-11', 'diff': 3,
 'q': '<p><b>MVC bahşiş uygulaması.</b> Görünüm (View) gerçek tkinter yerine testte sahte nesneyle verilecek. Görünümde <code>tutar</code>, <code>yuzde</code>, <code>kisi</code>, <code>sonuc</code>, <code>hata</code> adlı ve her biri <code>get()</code>/<code>set()</code> sunan değişkenler vardır (StringVar gibi).</p><ol><li><code>BahsisModel.hesapla(tutar: float, yuzde: float, kisi: int)</code>: tutar &gt; 0, 0 ≤ yuzde ≤ 100, kisi ≥ 1 değilse <code>ValueError</code> (mesajlar: <code>"Tutar pozitif olmalı"</code>, <code>"Yüzde 0-100 arası olmalı"</code>, <code>"Kişi en az 1 olmalı"</code>); <code>(bahsis, toplam, kisi_basi)</code> demeti, hepsi 2 basamağa yuvarlanmış.</li><li><code>BahsisKontrolcu(model, gorunum)</code>:<ul><li><code>hesapla_tiklandi()</code>: metinleri okur (virgül kabul, boşluk kırp, boş yüzde = 10). Sayıya çevrilemeyen tutar/yüzde için <code>"Sayısal değer girin"</code>, kişi için int kullan (çevrilemezse aynı mesaj). Başarıda <code>sonuc</code>\'a <code>"Bahşiş 25.05 TL | Toplam 275.55 TL | Kişi başı 137.78 TL"</code>, <code>hata</code>\'ya <code>""</code>; hatada <code>hata</code>\'ya mesaj, <code>sonuc</code>\'a <code>""</code> yazar.</li><li><code>temizle_tiklandi()</code>: tutar, kişi, sonuç, hata <code>""</code>; yüzde <code>"10"</code>.</li></ul></li><li>Kontrolcü ve model <code>tkinter</code> içe aktarmamalı.</li></ol>',
 'start': C('''
class BahsisModel:
    def hesapla(self, tutar, yuzde, kisi):
        pass


class BahsisKontrolcu:
    def __init__(self, model, gorunum):
        self.model = model
        self.gorunum = gorunum

    def hesapla_tiklandi(self):
        pass

    def temizle_tiklandi(self):
        pass
'''),
 'sol': C('''
class BahsisModel:
    def hesapla(self, tutar, yuzde, kisi):
        if tutar <= 0:
            raise ValueError("Tutar pozitif olmalı")
        if not 0 <= yuzde <= 100:
            raise ValueError("Yüzde 0-100 arası olmalı")
        if kisi < 1:
            raise ValueError("Kişi en az 1 olmalı")
        bahsis = round(tutar * yuzde / 100, 2)
        toplam = round(tutar + bahsis, 2)
        return bahsis, toplam, round(toplam / kisi, 2)


class BahsisKontrolcu:
    def __init__(self, model, gorunum):
        self.model = model
        self.gorunum = gorunum

    @staticmethod
    def _sayi(metin):
        return float(metin.strip().replace(",", "."))

    def _goster(self, sonuc="", hata=""):
        self.gorunum.sonuc.set(sonuc)
        self.gorunum.hata.set(hata)

    def hesapla_tiklandi(self):
        g = self.gorunum
        try:
            tutar = self._sayi(g.tutar.get())
            yuzde = self._sayi(g.yuzde.get().strip() or "10")
            kisi = int(g.kisi.get().strip())
        except ValueError:
            self._goster(hata="Sayısal değer girin")
            return
        try:
            b, t, k = self.model.hesapla(tutar, yuzde, kisi)
        except ValueError as e:
            self._goster(hata=str(e))
            return
        self._goster(sonuc=f"Bahşiş {b:.2f} TL | Toplam {t:.2f} TL | Kişi başı {k:.2f} TL")

    def temizle_tiklandi(self):
        g = self.gorunum
        for d in (g.tutar, g.kisi, g.sonuc, g.hata):
            d.set("")
        g.yuzde.set("10")
'''),
 'tests': C('''
class SahteDegisken:
    def __init__(self, v=""):
        self.v = v
    def get(self):
        return self.v
    def set(self, v):
        self.v = v
class SahteGorunum:
    def __init__(self, tutar="", yuzde="10", kisi="1"):
        self.tutar, self.yuzde, self.kisi = SahteDegisken(tutar), SahteDegisken(yuzde), SahteDegisken(kisi)
        self.sonuc, self.hata = SahteDegisken("eski"), SahteDegisken("eski")

m = BahsisModel()
assert m.hesapla(1250, 10, 4) == (125.0, 1375.0, 343.75), "model hesabı"
g = SahteGorunum(" 250,50 ", "", "2")
k = BahsisKontrolcu(m, g)
k.hesapla_tiklandi()
assert g.sonuc.get() == "Bahşiş 25.05 TL | Toplam 275.55 TL | Kişi başı 137.78 TL" and g.hata.get() == "", f"başarılı hesap: {g.sonuc.get()!r} / {g.hata.get()!r}"
for t, y, ki, mesaj in [("abc", "10", "1", "Sayısal değer girin"), ("100", "10", "iki", "Sayısal değer girin"),
                        ("-5", "10", "1", "Tutar pozitif olmalı"), ("100", "150", "1", "Yüzde 0-100 arası olmalı"),
                        ("100", "10", "0", "Kişi en az 1 olmalı")]:
    g = SahteGorunum(t, y, ki)
    BahsisKontrolcu(m, g).hesapla_tiklandi()
    assert g.hata.get() == mesaj and g.sonuc.get() == "", f"{(t, y, ki)}: hata {mesaj!r} bekleniyordu, gelen {g.hata.get()!r} / sonuc {g.sonuc.get()!r}"
g = SahteGorunum("100", "5", "3")
k = BahsisKontrolcu(m, g)
k.temizle_tiklandi()
assert [g.tutar.get(), g.yuzde.get(), g.kisi.get(), g.sonuc.get(), g.hata.get()] == ["", "10", "", "", ""], "temizle tüm alanları sıfırlamalı"
assert "tkinter" not in __source__, "model ve kontrolcü tkinter'dan bağımsız olmalı"
'''),
 'hints': ['Önce modeli yaz ve tek başına dene; kontrolcü yalnız metin → sayı çevirir ve modeli çağırır.', 'İki ayrı try: biri çevirme hataları ("Sayısal değer girin"), biri modelin ValueError\'ı (mesajı aynen göster).', 'Sonuç ve hatayı birlikte yazan küçük bir yardımcı (_goster) tekrarları önler.'],
 'why': 'Model iş kuralını, kontrolcü kullanıcı etkileşimini, görünüm yalnız gösterimi üstlenir. Kontrolcü yalnız get/set bildiği için gerçek StringVar\'larla da, testteki sahte nesnelerle de çalışır; aynı kontrolcüyü yarın bir web formuna bağlamak da mümkündür.'},
]

lesson = {
 'id': 'gui-tkinter', 'lv': 'orta', 'mod': 'Otomasyon ve Araçlar', 'min': 45,
 'title': 'Masaüstü arayüz: tkinter ve MVC',
 'sum': 'tkinter ile pencere, widget, grid/pack yerleşimi, olay ve callback, StringVar ve messagebox kullanmayı; bahşiş hesaplayıcı ve hesap makinesi örnekleriyle mantığı arayüzden ayıran MVC düzenini ve tkinter alternatiflerini öğrenirsin.',
 'goals': [
  'tkinter ile pencere kurar; Label, Entry, Button ve Listbox\'ı grid/pack ile yerleştirebilirim.',
  'command=f ile command=f() farkını, mainloop\'u ve olay güdümlü akışı açıklayabilirim.',
  'StringVar ve bind ile girdiyi okuyup sonucu gösteren, döngüde doğru callback bağlayan arayüz kodu yazabilirim.',
  'Hesap ve doğrulama mantığını arayüzden ayırıp (MVC) sahte görünümle test edebilirim.',
  'tkinter, PySide6/PyQt, customtkinter ve Flet arasında ihtiyaca göre seçim yapabilirim.'
 ],
 'body': body, 'ex': ex,
 'faq': [
  {'q': 'tkinter alıştırmaları neden pencere açmıyor?', 'a': 'Bu uygulamadaki Python tarayıcıda çalışır ve işletim sistemi penceresi açamaz. Alıştırmalar bu yüzden arayüzün arkasındaki mantığı (hesap, doğrulama, durum makinesi, olay sistemi) yazdırır. Arayüz kodunu dersteki gri kutulardan kopyalayıp kendi bilgisayarında çalıştırabilirsin.'},
  {'q': 'Linux\'ta "No module named tkinter" hatası alıyorum.', 'a': 'Dağıtımın Python\'u tkinter\'ı ayrı pakette tutar: Debian/Ubuntu\'da sudo apt install python3-tk, Fedora\'da sudo dnf install python3-tkinter. pip ile kurulmaz. Sanal ortamlar sistemdeki tkinter\'ı kullanır.'},
  {'q': 'Yeni bir proje için tkinter mı, PySide6 mı?', 'a': 'Birkaç form ve düğmeden oluşan iç araçlar için tkinter (görünüm için ttk ya da customtkinter) yeterli ve bağımlılıksızdır. Tablolar, sekmeler, karmaşık düzen ve profesyonel görünüm gerekiyorsa PySide6 seç (LGPL lisansı kapalı kaynakta da kullanıma uygundur). Hem masaüstü hem web istiyorsan Flet\'e bak.'},
  {'q': 'Callback\'e argüman nasıl veririm?', 'a': 'command=lambda: sil(secili_id) ya da functools.partial(sil, secili_id). Döngü içinde oluşturuyorsan değeri dondur: lambda i=i: sil(i). bind ile bağlanan fonksiyonlar ayrıca bir event argümanı alır.'}
 ],
 'mistakes': [
  {'bad': 'tk.Button(p, text="Hesapla", command=hesapla())', 'good': 'tk.Button(p, text="Hesapla", command=hesapla)', 'why': 'Parantez fonksiyonu kurulum sırasında çağırır ve dönüş değerini (None) bağlar; tıklama hiçbir şey yapmaz.'},
  {'bad': C('''
for r in "0123456789":
    tk.Button(p, text=r, command=lambda: ekle(r))
'''), 'good': C('''
for r in "0123456789":
    tk.Button(p, text=r, command=lambda r=r: ekle(r))
'''), 'why': 'Lambda döngü değişkeninin son değerini görür; tüm düğmeler 9 ekler. Varsayılan argüman değeri dondurur.'},
  {'bad': C('''
def rapor_olustur():
    time.sleep(10)   # callback içinde
'''), 'good': C('''
def rapor_olustur():
    threading.Thread(target=uzun_is).start()
    pencere.after(100, sonucu_kontrol_et)
'''), 'why': 'Callback\'te uzun iş olay döngüsünü kilitler ve pencere donar; işi arka plana al, sonucu after ile yokla.'},
  {'bad': 'if tutar_entry.get() is None: ...', 'good': 'if not tutar_entry.get().strip(): ...', 'why': 'Entry.get() boş kutuda None değil "" döndürür; boşluk da girilmiş olabilir.'},
  {'bad': 'etiket.pack()\ndugme.grid(row=1, column=0)   # aynı kapta', 'good': 'ust = tk.Frame(p); ust.pack()\nalt = tk.Frame(p); alt.pack()\ndugme = tk.Button(alt); dugme.grid(row=0, column=0)', 'why': 'Aynı kapta pack ve grid birlikte kullanılamaz; farklı düzenleri ayrı Frame\'lere koy.'}
 ]
}

emit(lesson, '/home/claude/py/v2/o2/gui-tkinter.js')
