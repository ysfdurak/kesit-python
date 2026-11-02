import inspect, json
from typing import Literal, get_args, get_origin

TIP = {str: "string", int: "integer", float: "number", bool: "boolean"}

def arac_semasi(fn):
    ozellikler, zorunlu = {}, []
    for ad, p in inspect.signature(fn).parameters.items():
        t = p.annotation
        if get_origin(t) is Literal:
            ozellikler[ad] = {"type": "string", "enum": list(get_args(t))}
        else:
            ozellikler[ad] = {"type": TIP[t]}
        if p.default is inspect.Parameter.empty:
            zorunlu.append(ad)
    return {"name": fn.__name__,
            "description": inspect.getdoc(fn).splitlines()[0],
            "input_schema": {"type": "object", "properties": ozellikler,
                             "required": zorunlu}}

def kargo_takip(takip_no: str, firma: Literal["yurtici", "aras", "mng"],
                detayli: bool = False):
    """Kargo gönderisinin son durumunu döndürür.

    Bu satır modele gönderilmez."""

sema = arac_semasi(kargo_takip)
print(sema["name"], "|", sema["description"])
print(json.dumps(sema["input_schema"]["properties"]))
print(sema["input_schema"]["required"])
