/* Kesit Python — kurulum ve araç derslerine tarayıcıda çalışan kod görevleri (Kasım 2026).
   Bu derslerde görevler seçmeli, adım sırası ve "kendi bilgisayarında" türündeydi; burada aynı konunun
   tarayıcıda denetlenebilen yüzü var: sürüm metnini okumak, Windows ve macOS yollarını ayrıştırmak,
   VS Code ayar dosyası (JSON), not defteri dosyası (.ipynb JSON), git status çıktısı, .gitignore kalıpları, argparse. */
(function (W) {
'use strict';
const X = W.PY_EXT = W.PY_EXT || [];
const K = (id, q, start, sol, expect, hints, why) => ({ t: 'code', stage: 'Kendin yaz', id, q: '<p>' + q + '</p>', start, sol, expect, hints, why });
X.push(
{ id: 'ilk-kod', ex: [
  K('ilk-kod-k1', 'İlk hesabın: 3 adet 249,90 TL\'lik ürünün toplamını <code>Toplam: 749.7 TL</code> biçiminde yazdır (değişkenler hazır).',
    'adet = 3\nfiyat = 249.90\n# toplamı hesapla ve yazdır\n',
    'adet = 3\nfiyat = 249.90\ntoplam = round(adet * fiyat, 2)\nprint(f"Toplam: {toplam} TL")\n',
    'Toplam: 749.7 TL\n', ['Çarpımı round(..., 2) ile yuvarla.', 'f"Toplam: {toplam} TL"'], 'Ondalıklı çarpım 749.6999… çıkabilir; round iki basamağa yuvarlar.'),
  K('ilk-kod-k2', 'Kullanıcıdan alınan metin hep <code>str</code> gelir. <code>"12"</code> ve <code>"30"</code> metinlerini sayıya çevirip toplamlarını yazdır; sonra aynı iki metni birleştirince ne çıktığını yazdır.',
    'a = "12"\nb = "30"\n',
    'a = "12"\nb = "30"\nprint(int(a) + int(b))\nprint(a + b)\n',
    '42\n1230\n', ['int("12") sayı yapar.', 'Metinde + birleştirir.'], 'input() her zaman metin döndürür; hesap yapmadan önce int() ya da float() gerekir.'),
] },
{ id: 'kurulum-araclar', ex: [
  K('kurulum-k1', '<code>python --version</code> çıktısını okuyan <code>surum_uygun(metin)</code> işlevini yaz: sürüm 3.10 ya da üstüyse <code>True</code> döndürsün. Verilen üç çıktı için sonucu yazdır.',
    'def surum_uygun(metin):\n    ...\n\nfor m in ["Python 3.12.4", "Python 3.9.18", "Python 3.10.0"]:\n    print(m, surum_uygun(m))\n',
    'def surum_uygun(metin):\n    parca = metin.split()[1].split(".")\n    return (int(parca[0]), int(parca[1])) >= (3, 10)\n\nfor m in ["Python 3.12.4", "Python 3.9.18", "Python 3.10.0"]:\n    print(m, surum_uygun(m))\n',
    'Python 3.12.4 True\nPython 3.9.18 False\nPython 3.10.0 True\n', ['Sürümü boşluktan sonra al, noktadan böl.', 'Sayı demetlerini karşılaştır: (3, 9) ile (3, 10) doğru sıralanır; metin olarak "3.9", "3.10"dan büyük görünür.'], 'Sürümler metin olarak karşılaştırılırsa 3.9, 3.10\'dan büyük görünür; sayı demetine çevirmek gerekir.'),
  K('kurulum-k2', '<code>pip freeze</code> çıktısından paket adı ve sürümünü sözlüğe çevir, adlara göre sıralı yazdır.',
    'cikti = """pandas==2.2.3\nnumpy==2.1.3\nrequests==2.32.3"""\n',
    'cikti = """pandas==2.2.3\nnumpy==2.1.3\nrequests==2.32.3"""\npaketler = dict(satir.split("==") for satir in cikti.splitlines())\nfor ad in sorted(paketler):\n    print(ad, paketler[ad])\n',
    'numpy 2.1.3\npandas 2.2.3\nrequests 2.32.3\n', ['Her satırı "==" ile böl.', 'dict(...) iki elemanlı parçalardan sözlük kurar.'], 'requirements.txt de aynı biçimdedir; sürümü sabitlemek ortamı başka bilgisayarda aynen kurmanı sağlar.'),
  K('kurulum-k3', 'Sanal ortamın Python\'u nerede? Windows\'ta <code>.venv\\Scripts\\python.exe</code>, macOS/Linux\'ta <code>.venv/bin/python</code>. <code>yorumlayici(isletim)</code> işlevini yaz; "windows" ve "linux" için yolu yazdır.',
    'def yorumlayici(isletim):\n    ...\n\nprint(yorumlayici("windows"))\nprint(yorumlayici("linux"))\n',
    'from pathlib import PureWindowsPath, PurePosixPath\n\ndef yorumlayici(isletim):\n    if isletim == "windows":\n        return str(PureWindowsPath(".venv", "Scripts", "python.exe"))\n    return str(PurePosixPath(".venv", "bin", "python"))\n\nprint(yorumlayici("windows"))\nprint(yorumlayici("linux"))\n',
    '.venv\\Scripts\\python.exe\n.venv/bin/python\n', ['pathlib.PureWindowsPath ve PurePosixPath her işletim sisteminde çalışır.', 'Parçaları ayrı ayrı ver; ayırıcıyı kütüphane koyar.'], 'Yol ayırıcısını elle yazmak yerine pathlib kullanmak aynı kodu iki işletim sisteminde doğru çalıştırır.'),
] },
{ id: 'kurulum-windows', ex: [
  K('windows-k1', 'Windows yolunu ayrıştır: <code>C:\\Users\\ayse\\Masaustu\\rapor\\satis_2024.xlsx</code> için dosya adını, uzantıyı ve bir üst klasörün adını ayrı satırlarda yazdır.',
    'from pathlib import PureWindowsPath\nyol = PureWindowsPath(r"C:\\Users\\ayse\\Masaustu\\rapor\\satis_2024.xlsx")\n',
    'from pathlib import PureWindowsPath\nyol = PureWindowsPath(r"C:\\Users\\ayse\\Masaustu\\rapor\\satis_2024.xlsx")\nprint(yol.name)\nprint(yol.suffix)\nprint(yol.parent.name)\n',
    'satis_2024.xlsx\n.xlsx\nrapor\n', ['.name, .suffix, .parent.name', 'r"..." ham metin: ters eğik çizgiler kaçış sayılmaz.'], 'Windows yollarındaki \\ Python metninde kaçış karakteridir; r"" ön eki ya da pathlib kullanmak hatayı önler.'),
  K('windows-k2', 'PATH değişkeni <code>;</code> ile ayrılır. Verilen PATH metninde <b>Python içeren</b> klasörleri sırasıyla yazdır (büyük/küçük harf fark etmesin).',
    'path = r"C:\\Windows\\System32;C:\\Users\\ayse\\AppData\\Local\\Programs\\Python\\Python312;C:\\Program Files\\Git\\cmd;C:\\Users\\ayse\\AppData\\Local\\Programs\\Python\\Python312\\Scripts"\n',
    'path = r"C:\\Windows\\System32;C:\\Users\\ayse\\AppData\\Local\\Programs\\Python\\Python312;C:\\Program Files\\Git\\cmd;C:\\Users\\ayse\\AppData\\Local\\Programs\\Python\\Python312\\Scripts"\nfor klasor in path.split(";"):\n    if "python" in klasor.lower():\n        print(klasor)\n',
    'C:\\Users\\ayse\\AppData\\Local\\Programs\\Python\\Python312\nC:\\Users\\ayse\\AppData\\Local\\Programs\\Python\\Python312\\Scripts\n', ['split(";")', '"python" in klasor.lower()'], '"python komutu bulunamadı" hatasında ilk bakılacak yer PATH\'tir: hem Python klasörü hem Scripts klasörü listede olmalı.'),
] },
{ id: 'kurulum-macos-linux', ex: [
  K('unix-k1', 'macOS/Linux yolu: <code>/Users/mert/proje/veri/siparis.csv</code> için uzantısız dosya adını (<code>stem</code>) ve dosyanın <code>proje</code> klasörüne göre göreli yolunu yazdır.',
    'from pathlib import PurePosixPath\nyol = PurePosixPath("/Users/mert/proje/veri/siparis.csv")\n',
    'from pathlib import PurePosixPath\nyol = PurePosixPath("/Users/mert/proje/veri/siparis.csv")\nprint(yol.stem)\nprint(yol.relative_to("/Users/mert/proje"))\n',
    'siparis\nveri/siparis.csv\n', ['.stem', '.relative_to(...)'], 'Göreli yol, projeyi başka bilgisayara taşıyınca da çalışır; kodda /Users/mert gibi kişisel yollar olmamalı.'),
  K('unix-k2', '<code>which -a python3</code> birden çok satır döndürebilir; ilk satır kullanılır. Çıktıdan kullanılan yolu ve toplam aday sayısını yazdır.',
    'cikti = """/opt/homebrew/bin/python3\n/usr/bin/python3"""\n',
    'cikti = """/opt/homebrew/bin/python3\n/usr/bin/python3"""\nsatirlar = cikti.splitlines()\nprint("kullanılan:", satirlar[0])\nprint("aday:", len(satirlar))\n',
    'kullanılan: /opt/homebrew/bin/python3\naday: 2\n', ['splitlines()', 'İlk eleman [0]'], 'Birden çok Python kuruluysa PATH sırası hangisinin çalışacağını belirler; sanal ortam bu karışıklığı ortadan kaldırır.'),
] },
{ id: 'vscode', ex: [
  K('vscode-k1', 'VS Code ayar dosyası JSON\'dur. Verilen <code>settings.json</code> metninde yorumlayıcı yolunu oku ve yazdır; sonra <code>"editor.formatOnSave"</code> değerini <code>True</code> yapıp anahtarları sıralı, 2 boşluk girintili JSON olarak yazdır.',
    'import json\nmetin = \'{"python.defaultInterpreterPath": ".venv/bin/python", "editor.formatOnSave": false}\'\n',
    'import json\nmetin = \'{"python.defaultInterpreterPath": ".venv/bin/python", "editor.formatOnSave": false}\'\nayar = json.loads(metin)\nprint(ayar["python.defaultInterpreterPath"])\nayar["editor.formatOnSave"] = True\nprint(json.dumps(ayar, indent=2, sort_keys=True))\n',
    '.venv/bin/python\n{\n  "editor.formatOnSave": true,\n  "python.defaultInterpreterPath": ".venv/bin/python"\n}\n', ['json.loads metni sözlüğe çevirir.', 'json.dumps(..., indent=2, sort_keys=True)'], 'Python True JSON\'da true olur; ayar dosyasını elle değil kodla değiştirirken json modülü biçimi korur.'),
] },
{ id: 'terminal-temelleri', ex: [
  K('terminal-k1', 'Terminalden argüman alan bir betik: <code>argparse</code> ile <code>--yil</code> (tamsayı) ve <code>--sehir</code> (varsayılan "Tümü") seçeneklerini tanımla. Verilen argüman listesini ayrıştırıp iki değeri yazdır.',
    'import argparse\narglar = ["--yil", "2024"]\n',
    'import argparse\narglar = ["--yil", "2024"]\np = argparse.ArgumentParser()\np.add_argument("--yil", type=int, required=True)\np.add_argument("--sehir", default="Tümü")\nns = p.parse_args(arglar)\nprint(ns.yil + 1)\nprint(ns.sehir)\n',
    '2025\nTümü\n', ['type=int ile sayı gelir; yil + 1 çalışır.', 'parse_args(arglar): gerçek terminalde listeyi vermezsin, sys.argv kullanılır.'], 'Terminalde python rapor.py --yil 2024 yazınca aynı ayrıştırma sys.argv üzerinden olur.'),
  K('terminal-k2', '<code>ls -l</code> benzeri çıktıdan <b>1 MB\'tan büyük</b> dosyaların adlarını yazdır (boyut 5. sütun, ad son sütun).',
    'cikti = """-rw-r--r-- 1 ayse staff 2483200 Nov 20 09:12 satis.csv\n-rw-r--r-- 1 ayse staff 1820 Nov 20 09:13 notlar.txt\n-rw-r--r-- 1 ayse staff 15728640 Nov 21 18:40 kayit.parquet"""\n',
    'cikti = """-rw-r--r-- 1 ayse staff 2483200 Nov 20 09:12 satis.csv\n-rw-r--r-- 1 ayse staff 1820 Nov 20 09:13 notlar.txt\n-rw-r--r-- 1 ayse staff 15728640 Nov 21 18:40 kayit.parquet"""\nfor satir in cikti.splitlines():\n    p = satir.split()\n    if int(p[4]) > 1024 * 1024:\n        print(p[-1])\n',
    'satis.csv\nkayit.parquet\n', ['split() boşluklardan böler.', 'p[4] boyut, p[-1] ad.'], 'Terminal çıktısını Python\'da işlemek otomasyonun ilk adımıdır; aynısı pathlib ile doğrudan da yapılabilir.'),
] },
{ id: 'jupyter-colab', ex: [
  K('jupyter-k1', '.ipynb dosyası JSON\'dur. Verilen not defterinde kod hücrelerinin sayısını ve ilk markdown hücresinin ilk satırını yazdır.',
    'import json\nnb = json.loads(\'{"cells": [{"cell_type": "markdown", "source": ["# Satış analizi\\\\n", "Kasım verisi"]}, {"cell_type": "code", "source": ["import pandas as pd"]}, {"cell_type": "code", "source": ["df.head()"]}]}\')\n',
    'import json\nnb = json.loads(\'{"cells": [{"cell_type": "markdown", "source": ["# Satış analizi\\\\n", "Kasım verisi"]}, {"cell_type": "code", "source": ["import pandas as pd"]}, {"cell_type": "code", "source": ["df.head()"]}]}\')\nkod = [h for h in nb["cells"] if h["cell_type"] == "code"]\nprint(len(kod))\nilk = next(h for h in nb["cells"] if h["cell_type"] == "markdown")\nprint(ilk["source"][0].strip())\n',
    '2\n# Satış analizi\n', ['nb["cells"] listesinde cell_type alanına bak.', 'next(...) ilk eşleşeni verir.'], 'Not defterini kodla okumak, çok sayıda defteri toplu denetlemek (ör. çıktısı temizlenmiş mi) için kullanılır.'),
] },
{ id: 'git-proje-yapisi', ex: [
  K('git-k1', '<code>git status --porcelain</code> çıktısında ilk iki karakter durumu verir: <code>M</code> değişmiş, <code>??</code> izlenmeyen. Değişmiş ve izlenmeyen dosya sayılarını yazdır.',
    'cikti = """ M analiz.py\n?? veri/ham.csv\n M README.md\n?? notlar.txt\nA  rapor.py"""\n',
    'cikti = """ M analiz.py\n?? veri/ham.csv\n M README.md\n?? notlar.txt\nA  rapor.py"""\ndegisen = izlenmeyen = 0\nfor satir in cikti.splitlines():\n    durum = satir[:2]\n    if "M" in durum:\n        degisen += 1\n    elif durum == "??":\n        izlenmeyen += 1\nprint("değişen:", degisen)\nprint("izlenmeyen:", izlenmeyen)\n',
    'değişen: 2\nizlenmeyen: 2\n', ['satir[:2] durum kodu.', '"A " eklenmiş (staged) dosyadır; sayma.'], 'Porcelain biçimi betikler için kararlıdır; insan için olan git status çıktısı sürümden sürüme değişebilir.'),
  K('git-k2', '.gitignore kalıplarıyla hangi dosyalar depoya <b>girmez</b>? <code>fnmatch</code> ile her dosyayı kalıplarla karşılaştır, yok sayılanları yazdır.',
    'import fnmatch\nkaliplar = ["*.csv", ".env", "__pycache__/*"]\ndosyalar = ["analiz.py", "veri.csv", ".env", "__pycache__/analiz.cpython-312.pyc", "README.md"]\n',
    'import fnmatch\nkaliplar = ["*.csv", ".env", "__pycache__/*"]\ndosyalar = ["analiz.py", "veri.csv", ".env", "__pycache__/analiz.cpython-312.pyc", "README.md"]\nfor d in dosyalar:\n    if any(fnmatch.fnmatch(d, k) for k in kaliplar):\n        print(d)\n',
    'veri.csv\n.env\n__pycache__/analiz.cpython-312.pyc\n', ['any(fnmatch.fnmatch(d, k) for k in kaliplar)', 'Gerçek .gitignore kuralları biraz daha zengindir; bu yaklaşık bir denetimdir.'], '.env (parolalar) ve ham veri depoya girmemeli; bunu bir betikle denetlemek kazara gönderimi önler.'),
] },
);
})(window);
