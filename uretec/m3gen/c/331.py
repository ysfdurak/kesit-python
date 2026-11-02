import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

df = pd.DataFrame({
    "yas": [25, 32, None, 41],
    "gelir": [18000, 25000, 30000, None],
    "sehir": ["İzmir", "Ankara", "İzmir", "Bursa"],
    "musteri_id": [101, 102, 103, 104],
})
on_islem = ColumnTransformer([
    ("sayi", Pipeline([("doldur", SimpleImputer(strategy="median")),
                       ("olcek", StandardScaler())]), ["yas", "gelir"]),
    ("kat", OneHotEncoder(handle_unknown="ignore"), ["sehir"]),
])                                    # remainder varsayılanı: 'drop'
X = on_islem.fit_transform(df)
print(X.shape)
print(list(on_islem.get_feature_names_out()))
yeni = pd.DataFrame({"yas": [30], "gelir": [20000], "sehir": ["Antalya"], "musteri_id": [999]})
print(on_islem.transform(yeni)[0, 2:].tolist())
