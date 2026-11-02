import sys, os
sys.path.insert(0,'/home/claude/py/tools/pylib'); os.environ['PP_VERI']='/home/claude/py/data'
import veri, sqlite3
con = veri.baglan('anadolu_market')
print(sqlite3.sqlite_version)
def q(s, p=()):
    for r in con.execute(s, p).fetchall(): print(r)
    print('--')
q("select status, count(*) from orders group by 1")
q("select min(order_date), max(order_date) from orders")
q("select substr(order_date,1,4), count(*) from orders group by 1")
q("select count(*), count(city), count(email) from customers")
q("select category, count(*) from products group by 1")
q("select count(distinct customer_id) from orders")
q("select event_type, count(*), count(distinct user_id) from web_events group by 1")
q("select device, count(distinct user_id) from web_events group by 1")
q("select min(event_time), max(event_time) from web_events")
q("select variant, count(*), sum(converted), round(avg(revenue),2) from ab_test group by 1")
q("select count(*) from orders o where not exists (select 1 from order_items i where i.order_id=o.order_id)")
