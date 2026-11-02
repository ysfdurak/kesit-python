exec(open('../h.py').read())
o=veri.oku('anadolu_market','orders',parse_dates=['order_date'])
m=veri.oku('kesit_bi','Musteriler')
ilk=o.groupby('customer_id').order_date.min().dt.strftime('%Y-%m-%d')
x=m.set_index('MusteriNo').IlkSiparis; print((x.dropna()==ilk.reindex(x.dropna().index)).mean(), x.isna().sum(), len(ilk))
ilkd=o[o.status=='delivered'].groupby('customer_id').order_date.min().dt.strftime('%Y-%m-%d'); print((x.dropna()==ilkd.reindex(x.dropna().index)).mean())
s=veri.oku('kesit_bi','Satislar')
oo=o.copy(); oo['koh']=oo.groupby('customer_id').order_date.transform('min')
oo['ayno']=(oo.order_date.dt.year-oo.koh.dt.year)*12+(oo.order_date.dt.month-oo.koh.dt.month)
k=s.drop_duplicates('SiparisNo').set_index('SiparisNo').KohortAyFarki; print((k==oo.set_index('order_id').ayno.reindex(k.index)).mean())
# kohort tablosu 2024 kohorts, ay 0..3
oo['kohort']=oo.koh.dt.strftime('%Y-%m')
t=oo.groupby(['kohort','ayno']).customer_id.nunique().unstack(fill_value=0); print(t.shape); print(t.iloc[:,:4].tail(8))
boyut=t[0]; ret=(t.div(boyut,axis=0)*100).round(1); print(ret.iloc[:,:4].head(10))
# average month-1 retention
print(round(ret[1].mean(),1), boyut.sum())
# RFM score
oi=veri.oku('anadolu_market','order_items'); oi['ciro']=oi.quantity*oi.unit_price*(1-oi.discount)
d=o[o.status=='delivered'].join(oi.groupby('order_id').ciro.sum(),on='order_id')
r=d.groupby('customer_id').agg(son=('order_date','max'),F=('order_id','size'),M=('ciro','sum')); r['R']=(pd.Timestamp('2025-01-01')-r.son).dt.days
def sk(s, ters=False):
    q=pd.qcut(s.rank(method='first'),5,labels=[1,2,3,4,5]).astype(int)
    return 6-q if ters else q
r['r']=sk(r.R,True); r['f']=sk(r.F); r['m']=sk(r.M)
def seg(R,F):
    if R>=4 and F>=4: return 'Şampiyon'
    if R==3 and F>=4: return 'Sadık'
    if R>=4 and F>=2: return 'Potansiyel sadık'
    if R>=4: return 'Yeni'
    if R==3: return 'Dikkat gerektiren'
    if F>=3: return 'Risk altında'
    return 'Kaybedilmiş'
r['Segment']=[seg(a,b) for a,b in zip(r.r,r.f)]
sg=veri.oku('kesit_bi','RFMSegmentleri')
c=r.Segment.value_counts(); print(c.to_dict())
t2=sg.merge(r.groupby('Segment').agg(musteri=('M','size'),ciro=('M','sum')).reset_index(),on='Segment',how='left').sort_values('Sira'); t2['pay']=(t2.ciro/t2.ciro.sum()*100).round(1); print(t2[['Segment','musteri','pay']])
print(r.loc[[1,2,4]])
