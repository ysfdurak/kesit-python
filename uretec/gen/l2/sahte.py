import re
import zlib
import numpy as np

def tr_kucuk(s):
    return s.replace("I", "ı").replace("İ", "i").lower()

def sahte_embedding(metin, boyut=256):
    v = np.zeros(boyut)
    for kelime in re.findall(r"\w+", tr_kucuk(metin)):
        k = f" {kelime} "
        for i in range(len(k) - 2):
            v[zlib.crc32(k[i:i + 3].encode()) % boyut] += 1
    n = np.linalg.norm(v)
    return v / n if n else v
