from pydantic import BaseModel, Field, ValidationError

class IadeArgs(BaseModel):
    siparis_no: str = Field(pattern=r"^SP-\d{6}$")
    tutar: float = Field(gt=0, le=5000)

class StokArgs(BaseModel):
    urun_kodu: str

def iade_baslat(siparis_no, tutar):
    return f"{siparis_no} için {tutar:.2f} TL iade başlatıldı"

def stok_sorgula(urun_kodu):
    return f"{urun_kodu}: 17 adet"

IZINLI = {   # ad -> (şema, fonksiyon, onay gerekir mi)
    "stok_sorgula": (StokArgs, stok_sorgula, False),
    "iade_baslat": (IadeArgs, iade_baslat, True),
}

def calistir(ad, girdi, onaylandi=False):
    if ad not in IZINLI:
        return {"is_error": True, "content": f"'{ad}' aracı yok"}
    sema, fn, onay_gerekir = IZINLI[ad]
    try:
        args = sema.model_validate(girdi)
    except ValidationError as e:
        alanlar = [".".join(map(str, h["loc"])) for h in e.errors()]
        return {"is_error": True, "content": "geçersiz alan: " + ", ".join(alanlar)}
    if onay_gerekir and not onaylandi:
        return {"is_error": True, "content": "kullanıcı onayı gerekli"}
    return {"is_error": False, "content": fn(**args.model_dump())}

print(calistir("stok_sorgula", {"urun_kodu": "KZ-12"}))
print(calistir("dosya_sil", {"yol": "/"}))
print(calistir("iade_baslat", {"siparis_no": "SP-12", "tutar": 99999}))
print(calistir("iade_baslat", {"siparis_no": "SP-123456", "tutar": "250"}))
print(calistir("iade_baslat", {"siparis_no": "SP-123456", "tutar": "250"}, onaylandi=True))
