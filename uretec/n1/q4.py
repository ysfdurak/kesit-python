import sys, os
sys.path.insert(0,'/home/claude/py/tools/pylib'); os.environ['PP_VERI']='/home/claude/py/data'
import veri
con = veri.baglan('anadolu_market')
def q(s, p=()):
    for r in con.execute(s, p).fetchall(): print(r)
    print('--')
NET="i.quantity*i.unit_price*(1-i.discount)"
q(f"select o.channel, round(sum({NET}),2) from orders o join order_items i using(order_id) where o.status in ('delivered','shipped') and o.order_date like '2023%' group by 1 order by 2 desc")
q("""select sum(n=0), count(*) from (select c.customer_id, count(o.order_id) n from customers c left join orders o on o.customer_id=c.customer_id and o.order_date >= '2024-01-01' group by 1)""")
q("""select count(*) from (select c.customer_id, count(o.order_id) n from customers c left join orders o on o.customer_id=c.customer_id where o.order_date >= '2024-01-01' group by 1)""")
q("""select c.customer_id, count(o.order_id) n from customers c left join orders o on o.customer_id=c.customer_id and o.order_date >= '2024-01-01' group by 1 limit 5""")
q(f"""select o.channel, count(distinct o.order_id), round(sum({NET}),2), round(sum({NET})/count(distinct o.order_id),2), round(sum({NET})/count(*),2) from orders o join order_items i using(order_id) where o.status in ('delivered','shipped') group by 1""")
q("select count(distinct city), count(city), count(*), count(email) from customers")
