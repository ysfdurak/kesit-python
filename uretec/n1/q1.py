import sys, os
sys.path.insert(0,'/home/claude/py/tools/pylib'); os.environ['PP_VERI']='/home/claude/py/data'
import veri
con = veri.baglan('anadolu_market')
def q(s, p=()):
    for r in con.execute(s, p).fetchall(): print(r)
    print('--')
NET="i.quantity*i.unit_price*(1-i.discount)"
q(f"select o.channel, round(sum({NET}),2) from orders o join order_items i using(order_id) where o.status in ('delivered','shipped') and o.order_date like '2024%' group by 1 order by 2 desc")
q("""with s as (select customer_id, count(*) n from orders group by 1) select n, count(*) from s group by n order by n""")
q("""with r as (select order_id, customer_id, order_date, channel, row_number() over (partition by customer_id order by order_date desc, order_id desc) rn from orders) select count(*) from r where rn=1""")
q("""with r as (select order_id, customer_id, order_date, channel, row_number() over (partition by customer_id order by order_date desc, order_id desc) rn from orders) select * from r where rn=1 and customer_id in (1,2,3)""")
q("select customer_id, order_date, count(*) from orders group by 1,2 having count(*)>1")
q(f"""with a as (select strftime('%Y-%m',o.order_date) ay, round(sum({NET}),2) ciro from orders o join order_items i using(order_id) where o.status in ('delivered','shipped') group by 1)
select ay, ciro, lag(ciro) over (order by ay), round(100.0*(ciro-lag(ciro) over (order by ay))/lag(ciro) over (order by ay),1) from a where ay >= '2023-12'""")
