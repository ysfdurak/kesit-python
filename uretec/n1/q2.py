import sys, os
sys.path.insert(0,'/home/claude/py/tools/pylib'); os.environ['PP_VERI']='/home/claude/py/data'
import veri
con = veri.baglan('anadolu_market')
def q(s, p=()):
    for r in con.execute(s, p).fetchall(): print(r)
    print('--')
q("""with g as (select distinct order_date d from orders),
a as (select d, julianday(d) - row_number() over (order by d) grp from g)
select min(d), max(d), count(*) n from a group by grp order by n desc, min(d) limit 5""")
q("""with g as (select distinct order_date d from orders where channel='store'),
a as (select d, julianday(d) - row_number() over (order by d) grp from g)
select min(d), max(d), count(*) n from a group by grp order by n desc, min(d) limit 3""")
q("select count(distinct order_date) from orders")
# second order gap
q("""with r as (select customer_id, order_date, row_number() over (partition by customer_id order by order_date, order_id) rn from orders)
select count(*), round(avg(julianday(b.order_date)-julianday(a.order_date)),1) from r a join r b on a.customer_id=b.customer_id and a.rn=1 and b.rn=2""")
q("""with r as (select customer_id, order_date, lead(order_date) over (partition by customer_id order by order_date, order_id) nxt, row_number() over (partition by customer_id order by order_date, order_id) rn from orders)
select customer_id, order_date, nxt, julianday(nxt)-julianday(order_date) from r where rn=1 and customer_id<=5""")
# cumulative 2024
NET="i.quantity*i.unit_price*(1-i.discount)"
q(f"""with a as (select strftime('%m',o.order_date) ay, sum({NET}) ciro from orders o join order_items i using(order_id) where o.status in ('delivered','shipped') and o.order_date like '2024%' group by 1)
select ay, round(ciro,2), round(sum(ciro) over (order by ay),2), round(sum(ciro) over (order by ay)/sum(ciro) over (),4) from a""")
q("""with a as (select strftime('%Y-%m',order_date) ay, count(*) n from orders group by 1)
select ay, n, round(avg(n) over (order by ay rows between 2 preceding and current row),2) from a where 1 order by ay desc limit 6""")
