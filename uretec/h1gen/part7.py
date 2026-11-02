START = 121
T = 'Tarih-saat ve saat dilimi'
I = 'Modüller ve import'
P = 'pandas'
ITEMS = [
(T, 'ileri', 'Saat dilimini replace() ile çevirmek',
'''\
from datetime import datetime, timezone, timedelta
TR = timezone(timedelta(hours=3))
kayit = datetime(2024, 11, 5, 9, 0, tzinfo=timezone.utc)   # sunucu UTC kaydetti
yerel = kayit.replace(tzinfo=TR)
print('Müşteriye gösterilen saat:', yerel.strftime('%H:%M'))
print('Aynı an mı?', yerel == kayit)
''',
'''\
from datetime import datetime, timezone, timedelta
TR = timezone(timedelta(hours=3))
kayit = datetime(2024, 11, 5, 9, 0, tzinfo=timezone.utc)
yerel = kayit.astimezone(TR)
print('Müşteriye gösterilen saat:', yerel.strftime('%H:%M'))
print('Aynı an mı?', yerel == kayit)
''',
'replace(tzinfo=...) saati değiştirmeden yalnız etiketi değiştirir; 09:00 UTC, 09:00 Türkiye saati olur ve zaman 3 saat kayar. astimezone() ise aynı anı başka bir saat diliminde gösterir.',
'Saat dilimi DÖNÜŞTÜRMEK için astimezone(), yalnız dilimsiz tarihe ETİKET koymak için replace(tzinfo=) kullan.'),

(T, 'temel', 'gg.aa.yyyy metinlerini karşılaştırmak',
'''\
teslim = '05.03.2024'
son_gun = '12.01.2024'
if teslim > son_gun:
    print('Teslim gecikti')
else:
    print('Zamanında teslim')
''',
'''\
from datetime import datetime
teslim = datetime.strptime('05.03.2024', '%d.%m.%Y').date()
son_gun = datetime.strptime('12.01.2024', '%d.%m.%Y').date()
if teslim > son_gun:
    print('Teslim gecikti')
else:
    print('Zamanında teslim')
''',
'Metinler soldan sağa harf harf karşılaştırılır; gg.aa.yyyy biçiminde önce GÜN karşılaştırılır. 5 Mart, 12 Ocak\'tan "küçük" sayılır. Yalnız yyyy-aa-gg (ISO) biçimi metin olarak doğru sıralanır.',
'Tarihleri karşılaştırmadan önce date/datetime nesnesine çevir.'),

(I, 'temel', 'datetime modülünü sınıf sanmak',
'''\
import datetime
acilis = datetime(2024, 11, 5, 9, 0)
print(acilis)
''',
'''\
from datetime import datetime
acilis = datetime(2024, 11, 5, 9, 0)
print(acilis)
''',
'datetime hem modülün hem de içindeki sınıfın adıdır. import datetime modülü getirir; modül çağrılamaz (TypeError: \'module\' object is not callable). Sınıfa datetime.datetime diye ulaşılır.',
'from datetime import datetime ile sınıfı al ya da import datetime yazdıysan datetime.datetime(...) kullan.'),

(I, 'orta', 'Modül adını değişken adı yapmak',
'''\
import json
siparis = {'no': 101, 'tutar': 250}
json = json.dumps(siparis)
print(json)
geri = json.loads(json)
''',
'''\
import json
siparis = {'no': 101, 'tutar': 250}
metin = json.dumps(siparis)
print(metin)
geri = json.loads(metin)
print(geri['tutar'])
''',
'json = ... ataması modülü bir metinle değiştirir. Sonraki json.loads çağrısı artık metnin özniteliğini arar ve AttributeError (\'str\' object has no attribute \'loads\') verir. Aynı sorun json.py, random.py gibi DOSYA adlarında da olur: kendi dosyan standart modülü gölgeler.',
'Değişkenlere ve dosyalara içe aktardığın modüllerin adını verme.'),

(I, 'orta', 'from modul import * ile yerleşikleri ezmek',
'''\
from math import *
# ... yüzlerce satır sonra: kart doğrulama için modüler üs
print(pow(7, 128, 13))
''',
'''\
import math
print(pow(7, 128, 13))
print(math.sqrt(16))
''',
'import * modüldeki bütün adları senin ad alanına döker. math.pow yerleşik pow\'un üzerine yazılır; üç argümanlı (modüler) kullanım TypeError verir. Hangi adın nereden geldiği de okunamaz hâle gelir.',
'import * kullanma; modülü adıyla ya da ihtiyaç duyduğun adları tek tek içe aktar.'),

(I, 'orta', 'Modülde __name__ koruması koymamak',
'''\
import sys, os, tempfile
klasor = tempfile.mkdtemp()
sys.path.insert(0, klasor)
with open(os.path.join(klasor, 'kdv_araci.py'), 'w', encoding='utf-8') as f:
    f.write("def kdvli(t):\\n    return round(t * 1.2, 2)\\n\\nprint('TEST:', kdvli(100))\\n")

import kdv_araci              # yalnız fonksiyonu kullanmak istiyoruz
print(kdv_araci.kdvli(250))
''',
'''\
import sys, os, tempfile
klasor = tempfile.mkdtemp()
sys.path.insert(0, klasor)
with open(os.path.join(klasor, 'kdv_modulu.py'), 'w', encoding='utf-8') as f:
    f.write("def kdvli(t):\\n    return round(t * 1.2, 2)\\n\\nif __name__ == '__main__':\\n    print('TEST:', kdvli(100))\\n")

import kdv_modulu
print(kdv_modulu.kdvli(250))
''',
'import bir dosyayı baştan sona ÇALIŞTIRIR. Modülün en üst düzeyindeki deneme kodu (print, dosya yazma, sunucu başlatma) onu içe aktaran her programda istenmeden çalışır.',
'Doğrudan çalıştırma kodunu if __name__ == \'__main__\': bloğuna koy.'),

(I, 'ileri', 'from import ile alınan değerin güncel kalacağını sanmak',
'''\
import sys, os, tempfile
klasor = tempfile.mkdtemp()
sys.path.insert(0, klasor)
with open(os.path.join(klasor, 'komisyon_ayar.py'), 'w', encoding='utf-8') as f:
    f.write('ORAN = 0.02\\n')

import komisyon_ayar
from komisyon_ayar import ORAN
komisyon_ayar.ORAN = 0.03       # yönetim paneli oranı güncelledi
print('Kullanılan oran:', ORAN)
''',
'''\
import sys, os, tempfile
klasor = tempfile.mkdtemp()
sys.path.insert(0, klasor)
with open(os.path.join(klasor, 'komisyon_ayari.py'), 'w', encoding='utf-8') as f:
    f.write('ORAN = 0.02\\n')

import komisyon_ayari
komisyon_ayari.ORAN = 0.03
print('Kullanılan oran:', komisyon_ayari.ORAN)
''',
'from modul import AD, o anki DEĞERİ senin modülünde yeni bir ada bağlar. Modüldeki değer sonradan değişirse senin kopyan eski değeri göstermeye devam eder.',
'Çalışma sırasında değişebilen ayarlara modul.AD biçiminde eriş.'),

(I, 'ileri', 'Betikte göreli import kullanmak',
'''\
from . import ayarlar
print(ayarlar.PARA_BIRIMI)
''',
'''\
import sys, os, tempfile
kok = tempfile.mkdtemp()
sys.path.insert(0, kok)
os.makedirs(os.path.join(kok, 'magaza'))
open(os.path.join(kok, 'magaza', '__init__.py'), 'w').close()
with open(os.path.join(kok, 'magaza', 'ayarlar.py'), 'w', encoding='utf-8') as f:
    f.write("PARA_BIRIMI = 'TL'\\n")

from magaza import ayarlar          # paket adıyla mutlak import
print(ayarlar.PARA_BIRIMI)
''',
'Göreli import (from . import x) yalnız bir PAKETİN içindeki modülde çalışır. Dosyayı python dosya.py ile doğrudan çalıştırınca __package__ boştur ve ImportError (attempted relative import with no known parent package) alırsın.',
'Paket içi modülleri python -m paket.modul ile çalıştır ya da mutlak import kullan.'),

(P, 'temel', 'pandas filtresinde and/or kullanmak',
'''\
import pandas as pd
df = pd.DataFrame({'sube': ['Ankara', 'İzmir', 'Bursa'],
                   'ciro': [1200, 800, 1500], 'iade': [3, 0, 7]})
secim = df[(df['ciro'] > 1000) and (df['iade'] < 5)]
print(secim['sube'].tolist())
''',
'''\
import pandas as pd
df = pd.DataFrame({'sube': ['Ankara', 'İzmir', 'Bursa'],
                   'ciro': [1200, 800, 1500], 'iade': [3, 0, 7]})
secim = df[(df['ciro'] > 1000) & (df['iade'] < 5)]
print(secim['sube'].tolist())
''',
'and/or/not tek bir True/False ister; bir Series\'in doğruluğu belirsizdir ve ValueError (The truth value of a Series is ambiguous) alırsın. Satır satır mantık için & | ~ işleçleri kullanılır ve öncelik nedeniyle her koşul paranteze alınır.',
'pandas koşullarında & | ~ kullan ve her koşulu paranteze al.'),

(P, 'temel', 'dropna() sonucunu atamamak',
'''\
import pandas as pd
df = pd.DataFrame({'musteri': ['Ali', 'Ece', 'Can'], 'telefon': ['555', None, '533']})
df.dropna()
print('SMS gidecek kişi:', len(df))
''',
'''\
import pandas as pd
df = pd.DataFrame({'musteri': ['Ali', 'Ece', 'Can'], 'telefon': ['555', None, '533']})
df = df.dropna(subset=['telefon'])
print('SMS gidecek kişi:', len(df))
''',
'dropna, fillna, sort_values, rename, drop gibi metotlar varsayılan olarak YENİ bir DataFrame döndürür; orijinali değiştirmez. Sonucu atamazsan temizlik yapılmamış olur.',
'pandas metotlarının sonucunu bir değişkene ata (inplace=True yerine atamayı tercih et).'),

(P, 'temel', 'Sütun adındaki görünmez boşluk',
'''\
import io
import pandas as pd
csv = 'Sehir ,Ciro\\nAnkara,1200\\nİzmir,800\\n'
df = pd.read_csv(io.StringIO(csv))
print(df['Sehir'].tolist())
''',
'''\
import io
import pandas as pd
csv = 'Sehir ,Ciro\\nAnkara,1200\\nİzmir,800\\n'
df = pd.read_csv(io.StringIO(csv))
df.columns = df.columns.str.strip()
print(df['Sehir'].tolist())
''',
'Excel\'den gelen başlıklarda sonda boşluk sık görülür; \'Sehir \' ile \'Sehir\' farklı adlardır ve KeyError alırsın. df.columns yazdırınca bile boşluk gözden kaçar.',
'Dosyayı okur okumaz sütun adlarını temizle: df.columns = df.columns.str.strip().'),

(P, 'temel', 'Eksik değeri == np.nan ile aramak',
'''\
import numpy as np
import pandas as pd
df = pd.DataFrame({'urun': ['çay', 'kahve', 'şeker'], 'fiyat': [42.5, np.nan, 38.0]})
eksik = df[df['fiyat'] == np.nan]
print('Fiyatı eksik ürün:', len(eksik))
''',
'''\
import numpy as np
import pandas as pd
df = pd.DataFrame({'urun': ['çay', 'kahve', 'şeker'], 'fiyat': [42.5, np.nan, 38.0]})
eksik = df[df['fiyat'].isna()]
print('Fiyatı eksik ürün:', len(eksik), eksik['urun'].tolist())
''',
'NaN kendisi dahil hiçbir şeye eşit değildir; == np.nan karşılaştırması her satırda False döner ve eksik kayıtlar hiç bulunmaz.',
'Eksik değerleri isna()/notna() ile ara.'),

(P, 'ileri', 'Zincirleme atama ile değer güncellemek',
'''\
import pandas as pd
df = pd.DataFrame({'urun': ['çay', 'kahve', 'şeker'], 'stok': [0, 12, 0],
                   'durum': ['aktif', 'aktif', 'aktif']})
df[df['stok'] == 0]['durum'] = 'tükendi'
print(df['durum'].tolist())
''',
'''\
import pandas as pd
df = pd.DataFrame({'urun': ['çay', 'kahve', 'şeker'], 'stok': [0, 12, 0],
                   'durum': ['aktif', 'aktif', 'aktif']})
df.loc[df['stok'] == 0, 'durum'] = 'tükendi'
print(df['durum'].tolist())
''',
'df[koşul] önce bir KOPYA üretir, [\'durum\'] = ... atama o kopyaya yapılır ve kopya hemen kaybolur. pandas yalnız uyarı (SettingWithCopyWarning / ChainedAssignmentError) verir; tablon değişmez.',
'Koşullu güncellemeyi tek adımda yap: df.loc[koşul, \'sütun\'] = değer.'),

(P, 'orta', 'DataFrame.append() kullanmak',
'''\
import pandas as pd
df = pd.DataFrame({'no': [101], 'tutar': [250]})
df = df.append({'no': 102, 'tutar': 90}, ignore_index=True)
print(df)
''',
'''\
import pandas as pd
df = pd.DataFrame({'no': [101], 'tutar': [250]})
yeni = pd.DataFrame([{'no': 102, 'tutar': 90}])
df = pd.concat([df, yeni], ignore_index=True)
print(df['tutar'].tolist())
''',
'DataFrame.append pandas 2.0\'da kaldırıldı; eski eğitimlerdeki kod AttributeError verir. Döngüde satır satır eklemek zaten her seferinde bütün tabloyu kopyaladığı için çok yavaştı.',
'Satırları önce listede topla, sonunda bir kez pd.DataFrame(liste) ya da pd.concat kullan.'),

(P, 'orta', 'iterrows() satırını değiştirip tabloyu güncellediğini sanmak',
'''\
import pandas as pd
df = pd.DataFrame({'urun': ['çay', 'kahve'], 'fiyat': [40.0, 120.0]})
for i, satir in df.iterrows():
    satir['fiyat'] = round(satir['fiyat'] * 1.1, 2)
print(df['fiyat'].tolist())
''',
'''\
import pandas as pd
df = pd.DataFrame({'urun': ['çay', 'kahve'], 'fiyat': [40.0, 120.0]})
df['fiyat'] = (df['fiyat'] * 1.1).round(2)
print(df['fiyat'].tolist())
''',
'iterrows() her satırı bir KOPYA Series olarak verir; satıra yapılan atama tabloya yansımaz. Üstelik satır satır döngü vektörel işlemden yüzlerce kat yavaştır.',
'Sütun hesaplarını vektörel yap: df[\'sütun\'] = ifade; döngüyle tablo güncelleme.'),

(P, 'ileri', 'Metin sütunu varken groupby().mean() çağırmak',
'''\
import pandas as pd
df = pd.DataFrame({'sube': ['A', 'A', 'B'], 'kasiyer': ['Ali', 'Ece', 'Can'],
                   'ciro': [100, 300, 250]})
print(df.groupby('sube').mean())
''',
'''\
import pandas as pd
df = pd.DataFrame({'sube': ['A', 'A', 'B'], 'kasiyer': ['Ali', 'Ece', 'Can'],
                   'ciro': [100, 300, 250]})
print(df.groupby('sube')['ciro'].mean().to_dict())
''',
'pandas 2.0\'dan önce metin sütunları sessizce atılırdı; artık mean() metin sütununa da uygulanmaya çalışılır ve TypeError verir. Eski kodlar sürüm yükseltince kırılır.',
'groupby\'dan sonra toplanacak sütunları açıkça seç (ya da numeric_only=True ver).'),

(P, 'orta', 'Türkçe sayı biçimli CSV\'yi düz okumak',
'''\
import io
import pandas as pd
csv = 'urun;fiyat\\nçay;1.250,50\\nkahve;899,90\\n'
df = pd.read_csv(io.StringIO(csv), sep=';')
print(df['fiyat'].tolist())
print('Toplam:', df['fiyat'].sum())
''',
'''\
import io
import pandas as pd
csv = 'urun;fiyat\\nçay;1.250,50\\nkahve;899,90\\n'
df = pd.read_csv(io.StringIO(csv), sep=';', decimal=',', thousands='.')
print(df['fiyat'].tolist())
print('Toplam:', round(df['fiyat'].sum(), 2))
''',
'1.250,50 biçimindeki sayılar sayı olarak tanınmaz, metin kalır. Metin sütununun sum()\'ı hata vermez, değerleri yan yana ekler: "1.250,50899,90".',
'Türkçe biçimli sayıları read_csv(decimal=\',\', thousands=\'.\') ile oku ve dtype\'ı kontrol et.'),

(P, 'orta', 'Baştaki sıfırları kaybetmek',
'''\
import io
import pandas as pd
csv = 'sube,posta_kodu\\nKızılay,06420\\nAlsancak,35220\\n'
df = pd.read_csv(io.StringIO(csv))
print(df['posta_kodu'].tolist())
''',
'''\
import io
import pandas as pd
csv = 'sube,posta_kodu\\nKızılay,06420\\nAlsancak,35220\\n'
df = pd.read_csv(io.StringIO(csv), dtype={'posta_kodu': str})
print(df['posta_kodu'].tolist())
''',
'read_csv rakamlardan oluşan sütunu sayıya çevirir; posta kodu, vergi no, telefon, IBAN gibi alanlardaki baştaki 0 kaybolur ve veriler eşleşmez.',
'Kimlik/kod niteliğindeki sütunları dtype={\'sütun\': str} ile metin olarak oku.'),

(P, 'ileri', 'Eksik değerli tamsayı sütununun float olması',
'''\
import io
import pandas as pd
csv = 'siparis,musteri_id\\n1,1001\\n2,\\n3,1003\\n'
df = pd.read_csv(io.StringIO(csv))
print(df['musteri_id'].tolist())
''',
'''\
import io
import pandas as pd
csv = 'siparis,musteri_id\\n1,1001\\n2,\\n3,1003\\n'
df = pd.read_csv(io.StringIO(csv), dtype={'musteri_id': 'Int64'})
print(df['musteri_id'].tolist())
''',
'Klasik int64 sütunu NaN tutamaz; tek bir boş hücre bütün sütunu float64 yapar. Kimlikler 1001.0 olur, başka tablolarla birleştirmede ve dışa aktarmada sorun çıkar.',
'Boş olabilen tamsayı sütunlarında boş değer destekli \'Int64\' türünü kullan.'),

(P, 'ileri', 'Gün.ay tarihlerini biçimsiz çevirmek',
'''\
import pandas as pd
df = pd.DataFrame({'tarih': ['03.04.2024', '11.04.2024']})
df['tarih'] = pd.to_datetime(df['tarih'])
print(df['tarih'].dt.strftime('%Y-%m-%d').tolist())
''',
'''\
import pandas as pd
df = pd.DataFrame({'tarih': ['03.04.2024', '11.04.2024']})
df['tarih'] = pd.to_datetime(df['tarih'], format='%d.%m.%Y')
print(df['tarih'].dt.strftime('%Y-%m-%d').tolist())
''',
'Biçim verilmezse pandas Amerikan alışkanlığıyla önce AYI okur. Günü 12\'den küçük tarihler hata vermeden yanlış çevrilir: 3 Nisan, 4 Mart olur. Hata ancak 13 ve sonrası bir gün gelince fark edilir.',
'Tarih sütunlarını her zaman format= (ya da en azından dayfirst=True) ile çevir.'),
]
