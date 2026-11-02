import pandas as pd
boyut = pd.DataFrame({
    'musteri_id': [1, 2], 'sehir': ['İzmir', 'Ankara'],
    'baslangic': ['2024-01-01', '2024-01-01'], 'bitis': ['9999-12-31', '9999-12-31'], 'guncel': [True, True],
})
gelen = pd.DataFrame({'musteri_id': [1, 2], 'sehir': ['Bursa', 'Ankara']})
tarih = '2024-06-01'
m = boyut[boyut['guncel']].merge(gelen, on='musteri_id', suffixes=('', '_yeni'))
degisen = m.loc[m['sehir'] != m['sehir_yeni'], 'musteri_id']
kapat = boyut['musteri_id'].isin(degisen) & boyut['guncel']
boyut.loc[kapat, 'bitis'] = tarih
boyut.loc[kapat, 'guncel'] = False
yeni = gelen[gelen['musteri_id'].isin(degisen)].assign(baslangic=tarih, bitis='9999-12-31', guncel=True)
boyut = pd.concat([boyut, yeni], ignore_index=True)
print(boyut.to_string(index=False))
import io
csv = 'sube,tutar\n' + '\n'.join(f'S{i % 3},{i * 10}' for i in range(1, 11))
toplam, parca_sayisi = {}, 0
for parca in pd.read_csv(io.StringIO(csv), chunksize=4):
    parca_sayisi += 1
    for sube, t in parca.groupby('sube')['tutar'].sum().items():
        toplam[sube] = toplam.get(sube, 0) + int(t)
print(parca_sayisi, dict(sorted(toplam.items())))
