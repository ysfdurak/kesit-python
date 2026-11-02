import pandas as pd, veri
print(pd.__version__)
cal = veri.oku('pusula_ik', 'ik_employees'); maas = veri.oku('pusula_ik', 'ik_salaries'); poz = veri.oku('pusula_ik', 'ik_positions'); bol = veri.oku('pusula_ik', 'ik_departments')
print(maas.dtypes.to_dict(), cal['term_date'].isna().sum())
guncel = maas.sort_values('effective_date').groupby('emp_id').tail(1)
aktif = cal[cal['term_date'].isna()]
df = (aktif[['emp_id','position_id']].merge(guncel[['emp_id','monthly_gross']], on='emp_id').merge(poz[['position_id','dept_id','band_min','band_max']], on='position_id').merge(bol[['dept_id','name']], on='dept_id'))
df['compa'] = df['monthly_gross'] / ((df['band_min'] + df['band_max']) / 2)
print(df.groupby('name')['compa'].mean().sort_values().head(4))
print(maas.groupby(['emp_id','effective_date']).size().max())
