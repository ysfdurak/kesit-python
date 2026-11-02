import sys, os; sys.path.insert(0,'/home/claude/py/tools/pylib'); os.environ['PP_VERI']='/home/claude/py/data'
import veri, collections, duckdb, polars as pl, time
t0=time.time()
trips=veri.kayitlar("pedal_izmir","bk_trips"); st=veri.kayitlar("pedal_izmir","bk_stations")
print('load',time.time()-t0)
def bolumle(k,n,a):
    b=[[] for _ in range(n)]
    for x in k: b[x[a]%n].append(x)
    return b
print([len(b) for b in bolumle(trips,4,'start_station')])
def parcala(k,n):
    boy=-(-len(k)//n); return [k[i*boy:(i+1)*boy] for i in range(n)]
P=parcala(trips,4); print([len(p) for p in P])
kis=[collections.Counter(x['start_station'] for x in p) for p in P]
print('shuffled after combiner', sum(len(c) for c in kis))
tot=sum(kis,collections.Counter()); print(tot.most_common(3), len(tot))
# shuffle count
print('shuffle', sum(1 for i,p in enumerate(P) for x in p if x['start_station']%4!=i))
# polars
tr=pl.read_csv(veri.yol("pedal_izmir","bk_trips")); s=pl.read_csv(veri.yol("pedal_izmir","bk_stations"))
r=(tr.join(s,left_on='start_station',right_on='station_id').group_by('district').agg(pl.len().alias('yolculuk'),pl.col('distance_km').mean().round(2).alias('ort_km')).sort('yolculuk',descending=True))
print(r)
q=f"""WITH s AS (SELECT t.start_station, st.name, st.district, COUNT(*) n FROM read_csv('{veri.yol("pedal_izmir","bk_trips")}') t JOIN read_csv('{veri.yol("pedal_izmir","bk_stations")}') st ON t.start_station=st.station_id GROUP BY ALL),
r AS (SELECT *, ROW_NUMBER() OVER (PARTITION BY district ORDER BY n DESC, name) rn FROM s)
SELECT district, name, n FROM r WHERE rn=1 ORDER BY n DESC"""
print(duckdb.sql(q).fetchall())
sd={x['station_id']:x for x in st}
flows=collections.Counter((sd[x['start_station']]['district'],sd[x['end_station']]['district']) for x in trips if x['end_station'] is not None and sd[x['start_station']]['district']!=sd[x['end_station']]['district'])
print(flows.most_common(4))
print(collections.Counter(sd[x['start_station']]['district'] for x in trips))
# salting
plain=collections.Counter(x['start_station'] for x in trips)
hot={k for k,_ in plain.most_common(2)}; print('hot',hot, plain.most_common(2))
g=collections.Counter((x['start_station'], x['trip_id']%4 if x['start_station'] in hot else 0) for x in trips)
print('max salted', max(g.values()))
print(collections.Counter(x['started_at'][:7] for x in trips))
# avg
B=bolumle(trips,4,'start_station')
tt=[x for x in trips if x['distance_km'] is not None]; print('true avg', round(sum(x['distance_km'] for x in tt)/len(tt),3)); BB=[[x for x in b if x['distance_km'] is not None] for b in B]; print('bad', round(sum(sum(x['distance_km'] for x in b)/len(b) for b in BB)/4,3))
routes=collections.Counter((x['start_station'],x['end_station']) for x in trips if x['end_station'] is not None and x['start_station']!=x['end_station'])
print(routes.most_common(6))
# local topk on contiguous wrong?
loc=collections.Counter()
for p in P:
    c=collections.Counter(x['start_station'] for x in p); loc.update(dict(c.most_common(3)))
print('wrong topk', loc.most_common(3), 'right', plain.most_common(3))
bikes=veri.kayitlar("pedal_izmir","bk_bikes"); print(bikes[:2], collections.Counter(b['model'] for b in bikes))
bm={b['bike_id']:b['model'] for b in bikes}
print(collections.Counter(bm[x['bike_id']] for x in trips[:2000]))
print(time.time()-t0)
