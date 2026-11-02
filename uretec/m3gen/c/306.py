import re
from typing import Literal
from pydantic import BaseModel, ValidationError, field_validator

class Talep(BaseModel):
    kategori: Literal["iade", "kargo", "fatura", "diger"]
    oncelik: int
    ozet: str

    @field_validator("oncelik")
    @classmethod
    def aralik(cls, v):
        if not 1 <= v <= 3:
            raise ValueError("1-3 arası olmalı")
        return v

def json_ayikla(metin):
    m = re.search(r"\{.*\}", metin, re.S)
    if not m:
        raise ValueError("JSON bulunamadı")
    return m.group(0)

yanitlar = [
    'Tabii! İşte sonuç:\n```json\n{"kategori": "kargo", "oncelik": 2, "ozet": "Paket gecikti"}\n```',
    '{"kategori": "Kargo", "oncelik": 5, "ozet": "Paket gecikti"}',
    '{"kategori": "iade", "oncelik": "1", "ozet": "Ürün kırık"}',
]
for y in yanitlar:
    try:
        t = Talep.model_validate_json(json_ayikla(y))
        print("OK", t.kategori, t.oncelik)
    except ValidationError as e:
        print("HATA", sorted(str(h["loc"][0]) for h in e.errors()))
