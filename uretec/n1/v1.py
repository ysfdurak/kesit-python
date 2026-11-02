import sys, os, math
sys.path.insert(0,'/home/claude/py/tools/pylib'); os.environ['PP_VERI']='/home/claude/py/data'
import veri, pandas as pd, numpy as np
con=veri.baglan('anadolu_market')
def q(s,p=()):
    print(con.execute(s,p).fetchall()); print('--')
q("select emp_id, first_name, dept_id, salary from employees order by salary desc limit 6")
q("with r as (select salary, dense_rank() over (order by salary desc) dr from employees) select distinct salary from r where dr=2")
q("with r as (select dept_id, first_name, salary, dense_rank() over (partition by dept_id order by salary desc) dr from employees where dept_id is not null) select dept_id, first_name, salary from r where dr=1 order by dept_id")
q("select d.name, count(e.emp_id), round(avg(e.salary),2) from departments d left join employees e on e.dept_id=d.dept_id group by d.dept_id order by d.dept_id")
q("select e.first_name, e.salary, m.first_name, m.salary from employees e join employees m on e.manager_id=m.emp_id where e.salary>m.salary")
q("select count(*) from customers c where not exists (select 1 from orders o where o.customer_id=c.customer_id)")
q("select round(100.0*sum(status in ('cancelled','returned'))/count(*),2) from orders")
q("select channel, round(100.0*sum(status='returned')/count(*),2) from orders group by 1")
q("select segment, sum(channel='web'), sum(channel='mobile'), sum(channel='store') from orders join customers using(customer_id) group by 1")
q("select count(*) from (select customer_id from orders group by customer_id having count(distinct channel)=3)")
q("select email, count(*) from (select lower(trim(email)) email from raw_signups) group by 1 having count(*)>1 limit 3")
q("select count(*), count(distinct id) from raw_signups")
# customers with 3 consecutive months of orders
q("""with m as (select distinct customer_id, cast(strftime('%Y',order_date) as int)*12+cast(strftime('%m',order_date) as int) mi from orders),
g as (select customer_id, mi, mi - row_number() over (partition by customer_id order by mi) grp from m)
select count(distinct customer_id) from (select customer_id from g group by customer_id, grp having count(*)>=3)""")
q("""with p as (select o.order_id, p.category from order_items i join orders o using(order_id) join products p using(product_id) where o.status in ('delivered','shipped'))
select category, count(distinct order_id) from p group by 1 order by 2 desc limit 3""")
ab=veri.oku('anadolu_market','ab_test'); g=ab.groupby('variant').converted.agg(['sum','count']); print(g)
pa,pb=g['sum']/g['count']; print(pa,pb)
from statistics import NormalDist
n1,n2=g['count']; x1,x2=g['sum']; p=(x1+x2)/(n1+n2); se=math.sqrt(p*(1-p)*(1/n1+1/n2)); z=(pb-pa)/se; pv=2*(1-NormalDist().cdf(abs(z))); print('z',z,'p',pv)
se2=math.sqrt(pa*(1-pa)/n1+pb*(1-pb)/n2); print('ci', (pb-pa)-1.96*se2,(pb-pa)+1.96*se2)
# SRM chi2
e=1000; chi=((975-e)**2+(1025-e)**2)/e; print('srm chi', chi)
print(ab.groupby('variant').revenue.mean())
