DUR = {"kaç", "var", "mi", "mı", "ne", "nedir", "hangi", "kim", "ve", "en"}
def uclu(m):
    t = f" {tr_kucuk(m)} "
    return {t[i:i+3] for i in range(len(t)-2)}
def rr(sorgu, sonuclar):
    qs = [k for k in re.findall(r"\w+", tr_kucuk(sorgu)) if k not in DUR]
    def puan(ik):
        p, ilk = ik
        ks = re.findall(r"\w+", tr_kucuk(p["metin"]))
        kap = sum(any(w[:4] == q[:4] for w in ks) for q in qs) / max(len(qs),1)
        return kap + ilk
    return sorted(sonuclar, key=puan, reverse=True)
qs = ["Evlilikte kaç gün izin var?","İzin talebi kaç gün önceden yapılmalı?", "Doğum izni kaç gün?", "Raporsuz kaç gün hasta olabilirim?", "Veri ve Analitik ekibi evden çalışabilir mi?", "Hangi eğitimler zorunlu?", "Tam uzaktan kimler çalışabilir?", "Vefat durumunda izin", "İzin onayını kim verir?", "kulaklık stok", "SQL kitabı kaç TL?","Mazeret izninde en uzun kaç gün kullanılmış?", "Yıllık izin talebini kim onaylar?", "Ofis günlerini kim belirler?","Ortalama yıllık izin kaç gün sürüyor?", "15 yıllık çalışanın izni kaç gün?", "Ücretsiz izne kim onay verir?","Raporsuz hastalık izni kaç gün?", "Hibrit çalışan haftada kaç gün ofise gelir?"]
for q in qs:
    r = IDX.ara(q, k=6)
    a=[p["id"] for p, s in r[:3]]; b=[p["id"] for p,_ in rr(q, r)[:3]]
    print(q, a, '' if a==b else ' DEGISTI '+str(b))
