exec(open('../h.py').read())
import sqlite3; print(sqlite3.sqlite_version)
con=veri.baglan('anadolu_market',tablolar=['orders','order_items','customers','products'])
q=lambda s,*a: con.execute(s,a).fetchall()
CTE="""WITH sip AS (SELECT o.order_id, o.customer_id, o.order_date, o.channel, SUM(oi.quantity*oi.unit_price*(1-oi.discount)) AS tutar
FROM orders o JOIN order_items oi ON oi.order_id=o.order_id WHERE o.status='delivered' GROUP BY o.order_id)"""
print(q(CTE+""", ay AS (SELECT substr(order_date,1,7) ay, ROUND(SUM(tutar),2) ciro FROM sip WHERE order_date>='2024-01-01' GROUP BY ay)
SELECT ay, ciro, ROUND(100.0*(ciro-LAG(ciro) OVER (ORDER BY ay))/LAG(ciro) OVER (ORDER BY ay),1) FROM ay ORDER BY ay"""))
print(q(CTE+""", m AS (SELECT c.city, c.customer_id, ROUND(SUM(tutar),2) top, ROW_NUMBER() OVER (PARTITION BY c.city ORDER BY SUM(tutar) DESC) sira FROM sip JOIN customers c USING(customer_id) WHERE c.city IS NOT NULL GROUP BY c.city,c.customer_id)
SELECT city, customer_id, top FROM m WHERE sira<=1 ORDER BY top DESC LIMIT 5"""))
print(q("""WITH f AS (SELECT customer_id, channel, ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date, order_id) rn FROM orders) SELECT channel, COUNT(*) FROM f WHERE rn=1 GROUP BY channel ORDER BY 2 DESC"""))
print(q("""WITH g AS (SELECT customer_id, julianday(order_date)-julianday(LAG(order_date) OVER (PARTITION BY customer_id ORDER BY order_date, order_id)) fark FROM orders WHERE status='delivered') SELECT ROUND(AVG(fark),1), COUNT(fark), MAX(fark) FROM g"""))
print(q(CTE+""", u AS (SELECT p.name, SUM(oi.quantity*oi.unit_price*(1-oi.discount)) c FROM order_items oi JOIN orders o USING(order_id) JOIN products p USING(product_id) WHERE o.status='delivered' GROUP BY p.name),
k AS (SELECT name, c, SUM(c) OVER (ORDER BY c DESC ROWS UNBOUNDED PRECEDING)/SUM(c) OVER () pay FROM u) SELECT COUNT(*) FROM k WHERE pay<0.5""") , q("select count(distinct product_id) from order_items"))
print(q(CTE+""", ay AS (SELECT substr(order_date,1,7) ay, SUM(tutar) ciro FROM sip GROUP BY ay) SELECT ay, ROUND(AVG(ciro) OVER (ORDER BY ay ROWS BETWEEN 2 PRECEDING AND CURRENT ROW),2) FROM ay ORDER BY ay DESC LIMIT 3"""))
print(q("SELECT customer_id, tutar, RANK() OVER (ORDER BY tutar DESC), ROW_NUMBER() OVER (ORDER BY tutar DESC), DENSE_RANK() OVER (ORDER BY tutar DESC) FROM (SELECT o.customer_id, SUM(oi.quantity) tutar FROM orders o JOIN order_items oi USING(order_id) GROUP BY o.customer_id) ORDER BY 3 LIMIT 6"))
print(q("WITH s AS (SELECT order_id, order_date FROM orders WHERE customer_id=4 ORDER BY order_date LIMIT 4) SELECT order_id, COUNT(*) OVER (ORDER BY order_date) FROM s"))
