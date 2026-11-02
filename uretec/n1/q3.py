import sys, os
sys.path.insert(0,'/home/claude/py/tools/pylib'); os.environ['PP_VERI']='/home/claude/py/data'
import veri
con = veri.baglan('anadolu_market')
def q(s, p=()):
    for r in con.execute(s, p).fetchall(): print(r)
    print('--')
SQL = """
WITH ilk AS (
  SELECT customer_id, MIN(order_date) AS ilk_tarih FROM orders GROUP BY customer_id
), akt AS (
  SELECT DISTINCT o.customer_id,
         strftime('%Y-%m', i.ilk_tarih) AS kohort,
         (CAST(strftime('%Y', o.order_date) AS INTEGER) - CAST(strftime('%Y', i.ilk_tarih) AS INTEGER)) * 12
         + CAST(strftime('%m', o.order_date) AS INTEGER) - CAST(strftime('%m', i.ilk_tarih) AS INTEGER) AS ay_farki
  FROM orders o JOIN ilk i USING (customer_id)
)
SELECT kohort, ay_farki, COUNT(*) FROM akt GROUP BY 1,2 HAVING ay_farki <= 3 ORDER BY 1,2
"""
q(SQL)
q("select strftime('%Y-%m', min(order_date)) k, count(*) from orders group by customer_id")
