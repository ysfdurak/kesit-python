exec(open('../h.py').read())
OZEL = {"istanbul": "İstanbul", "izmir": "İzmir"}
def sehir_std(s):
    k = s.str.strip().str.replace("İ", "i").str.replace("I", "i").str.lower()
    return k.map(lambda x: OZEL.get(x, x.capitalize()) if isinstance(x, str) else x)
def bayi_temizle():
    df = veri.oku("kirli_veri", "bayi", skiprows=2)
    df = df.dropna(how="all").drop_duplicates().reset_index(drop=True)
    df["Şehir"] = sehir_std(df["Şehir"])
    df["Tutar"] = pd.to_numeric(df["Tutar"].str.replace(".", "", regex=False).str.replace(",", ".", regex=False), errors="coerce")
    df["Tarih"] = pd.to_datetime(df["Tarih"], format="%d.%m.%Y", errors="coerce")
    return df
d=bayi_temizle(); print(d); print(d.Tutar.sum(), d.Tutar.isna().sum(), d.Tarih.isna().sum(), sorted(d['Şehir'].unique()))
rs=veri.oku('anadolu_market','raw_signups')
def signup_temizle():
    df = veri.oku("anadolu_market", "raw_signups")
    df["email"] = df["email"].str.strip().str.lower()
    df["city"] = sehir_std(df["city"]).fillna("Bilinmiyor")
    t = df["signup_date"].str.strip()
    df["signup_date"] = pd.to_datetime(t, format="%d.%m.%Y", errors="coerce").fillna(pd.to_datetime(t, format="%Y-%m-%d", errors="coerce"))
    return df.drop_duplicates(subset="email", keep="first").reset_index(drop=True)
s=signup_temizle(); print(len(s), s.city.value_counts().to_dict(), s.signup_date.isna().sum(), s.signup_date.min(), s.signup_date.max())
print(s.groupby(s.signup_date.dt.month).size().to_dict())
h=veri.oku('kirli_veri','hedef'); u=h.melt(id_vars='Kategori',var_name='Ay',value_name='Hedef').dropna(); print(u, u.Hedef.sum(), len(u))
ur=veri.oku('kirli_veri','urun'); ur['Kategori']=ur['Kategori'].ffill(); p=ur['Ürün Kodu ve Adı'].str.split(' ',n=1,expand=True); print(p); print(ur.groupby('Kategori').Fiyat.sum().to_dict())
m=veri.oku('kirli_veri','musteri',skiprows=1); print(m.columns.tolist(), m.dtypes.to_dict())
