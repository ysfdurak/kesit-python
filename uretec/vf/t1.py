import veri, sqlite3
print(sqlite3.sqlite_version)
con = veri.baglan('kanat_havayollari')
print(con.execute("""WITH u AS (SELECT flight_id, SUM(minutes) dk FROM hv_delays GROUP BY flight_id)
SELECT r.origin, r.dest, COUNT(*), ROUND(AVG(u.dk),1) ort, AVG(u.dk) FROM u JOIN hv_flights f USING(flight_id) JOIN hv_routes r USING(route_id) GROUP BY r.route_id ORDER BY ort DESC LIMIT 7""").fetchall())
print(con.execute("select typeof(minutes), count(*) from hv_delays group by 1").fetchall())
con = veri.baglan('lezzet_kurye')
print(con.execute("""SELECT r.name, ROUND(AVG(p.food_score),2) ort, COUNT(*) FROM lk_ratings p JOIN lk_orders o ON o.order_id=p.order_id JOIN lk_restaurants r ON r.restaurant_id=o.restaurant_id GROUP BY r.restaurant_id HAVING COUNT(*)>=50 ORDER BY ort DESC LIMIT 7""").fetchall())
