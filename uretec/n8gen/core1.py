# rag-uygulamasi için ortak kod parçaları (alıştırmalarda tekrar kullanılır)

TR = r'''def tr_kucuk(s):
    return s.replace("I", "ı").replace("İ", "i").lower()
'''

KELIME = r'''import re

def tr_kucuk(s):
    return s.replace("I", "ı").replace("İ", "i").lower()

def kelimeler(metin):
    return re.findall(r"\w+", tr_kucuk(metin))

def kok(k):
    return k[:5]
'''

POLITIKA = r'''POLITIKA = """# İzin yönetmeliği
## Yıllık izin
Yıllık izin hakkı kıdeme göre belirlenir: 1-5 yıl arası 14 gün, 5-15 yıl arası 20 gün, 15 yıl ve üzeri 26 gün. Yıllık izin en az 7 gün önceden İK portalından talep edilir. Talep yönetici onayıyla kesinleşir.
## Hastalık izni
Doktor raporu en geç 2 iş günü içinde İK'ya iletilir. Raporsuz hastalık izni yılda en fazla 3 gündür.
## Mazeret izni
Evlilik, doğum ve vefat durumlarında 3 güne kadar ücretli mazeret izni verilir.
## Ücretsiz izin
Ücretsiz izin yönetici ve İK direktörünün onayıyla en fazla 30 gün verilebilir.
# Çalışma düzeni
## Hibrit çalışma
Hibrit çalışanlar haftada en az 2 gün ofiste bulunur. Ofis günlerini takım lideri belirler.
## Uzaktan çalışma
Tam uzaktan çalışma yalnızca Yazılım Geliştirme ile Veri ve Analitik departmanlarında mümkündür.
# Eğitim
## Zorunlu eğitimler
Bilgi Güvenliği Farkındalığı ve KVKK Temel eğitimleri tüm çalışanlar için zorunludur. Her ikisi de 2 saattir ve her yıl yenilenir.
"""
'''
