import sys, os
sys.path.insert(0,'/home/claude/py/tools/pylib'); os.environ['PP_VERI']='/home/claude/py/data'
import veri, pandas as pd, numpy as np
r = veri.oku('anadolu_market','raw_signups')
print(r.dtypes); print(len(r), r.id.nunique(), r.duplicated().sum(), r.email.str.lower().nunique())
r['email']=r.email.str.strip().str.lower()
print(r.duplicated().sum(), r.duplicated(['email']).sum())
def anahtar(s): return s.strip().replace('İ','i').lower() if isinstance(s,str) else s
print(r.city.map(anahtar).value_counts(dropna=False))
t1=pd.to_datetime(r.signup_date, format='%Y-%m-%d', errors='coerce'); t2=pd.to_datetime(r.signup_date, format='%d.%m.%Y', errors='coerce')
t=t1.fillna(t2); print(t.isna().sum(), t.min(), t.max(), r.signup_date.str.contains(r'\.').sum())
c=r.drop_duplicates('email'); print(len(c)); 
cc = c.city.map(anahtar).map({'istanbul':'İstanbul','ankara':'Ankara','izmir':'İzmir'})
print(cc.value_counts(dropna=False).to_dict())
tt=t[c.index]; print(tt.dt.month.value_counts().sort_index().to_dict())
print(r.full_name.str.strip().str.len().head())
b = veri.oku('kirli_veri','bayi'); print(b)
b2 = veri.oku('kirli_veri','bayi', skiprows=1); print(b2.columns.tolist()); print(b2.dtypes)
