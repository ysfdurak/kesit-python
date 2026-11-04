/* Kesit Python: XML ve ElementTree. uretec/p2/gercek.py üretir, elle düzenleme. */
(function (W) {
'use strict';
const X = W.PY_EXT = W.PY_EXT || [];
X.push(
{
 "id": "json-csv",
 "min": 18,
 "html": "<h2>XML ve ElementTree</h2><p>Kurumsal entegrasyonlarda JSON kadar XML de karşına çıkar: e-Fatura, banka dosyaları, eski servisler. Python'ın standart kütüphanesi okur ve yazar, paket gerekmez.</p>\n<pre class=\"py\">import xml.etree.ElementTree as ET\n\nkok = ET.fromstring('&lt;Siparis no=\"7\"&gt;&lt;Kalem adet=\"2\"&gt;Çay&lt;/Kalem&gt;&lt;Kalem adet=\"1\"&gt;Kahve&lt;/Kalem&gt;&lt;/Siparis&gt;')\nprint(kok.tag, kok.get(\"no\"))\nfor k in kok.findall(\"Kalem\"):\n    print(k.text, k.get(\"adet\"))</pre>\n<p><code>.text</code> etiketin içindeki metni, <code>.get()</code> özniteliği verir. Her şey metindir; sayıya kendin çevirirsin, para için <code>Decimal</code> kullan.</p>\n<h3>Ad alanları (namespace)</h3><p>e-Fatura gibi belgelerde her etiketin bir ad alanı vardır. <code>findall(\"InvoiceLine\")</code> burada boş döner ve hata vermez; en sık yapılan hata budur. Ön ek sözlüğü vererek ararsın: <code>kok.findall(\"cac:InvoiceLine\", NS)</code>.</p>\n<div class=\"note\"><b>Kurgu örnek</b>Görevdeki fatura UBL biçimine benzetilmiş kurgu bir örnektir, geçerli bir e-Fatura değildir. Gerçek UBL-TR belgesi çok daha geniştir; şeması için Gelir İdaresi Başkanlığı kılavuzlarına bak. Güvenilmeyen kaynaktan gelen XML için <code>defusedxml</code> kullan.</div>",
 "ex": [
  {
   "t": "mc",
   "id": "json-csv-gm1",
   "stage": "Isınma",
   "q": "Ad alanlı bir belgede <code>kok.findall(\"InvoiceLine\")</code> ne döner?",
   "o": [
    "Boş liste",
    "Tüm satırlar",
    "Hata fırlatır",
    "None"
   ],
   "a": 0,
   "why": "Etiketin tam adı ad alanını da içerir, bu ad eşleşmez ve boş liste döner. Hata çıkmadığı için fark etmek zordur."
  },
  {
   "t": "code",
   "id": "json-csv-g1",
   "stage": "Rehberli",
   "diff": 2,
   "q": "<p><b>e-Fatura benzeri XML oku.</b> <code>fatura_oku(yol)</code>: dosyayı <code>ET.parse</code> ile aç. Döndür: <code>no</code>, <code>satici</code>, <code>toplam</code> (Decimal), <code>kalemler</code> (<code>{\"ad\", \"miktar\": int, \"tutar\": Decimal}</code> listesi). <code>tutarli_mi(f)</code>: kalem tutarları toplamı toplama eşit mi? Kurgu örnek test dosyasında; yapısı: <code>cbc:ID</code>, <code>cac:AccountingSupplierParty/cac:Party/cac:PartyName/cbc:Name</code>, <code>cac:InvoiceLine</code> içinde <code>cbc:InvoicedQuantity</code>, <code>cbc:LineExtensionAmount</code>, <code>cac:Item/cbc:Name</code>, <code>cac:LegalMonetaryTotal/cbc:PayableAmount</code>.</p>",
   "start": "import xml.etree.ElementTree as ET\nfrom decimal import Decimal\nNS = {\"inv\": \"urn:oasis:names:specification:ubl:schema:xsd:Invoice-2\",\n      \"cbc\": \"urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2\",\n      \"cac\": \"urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2\"}\n\ndef fatura_oku(yol):\n    pass\n\ndef tutarli_mi(f):\n    pass\n",
   "sol": "import xml.etree.ElementTree as ET\nfrom decimal import Decimal\nNS = {\"inv\": \"urn:oasis:names:specification:ubl:schema:xsd:Invoice-2\",\n      \"cbc\": \"urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2\",\n      \"cac\": \"urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2\"}\n\ndef fatura_oku(yol):\n    kok = ET.parse(yol).getroot()\n    kalemler = []\n    for s in kok.findall(\"cac:InvoiceLine\", NS):\n        kalemler.append({\"ad\": s.find(\"cac:Item/cbc:Name\", NS).text,\n                         \"miktar\": int(s.find(\"cbc:InvoicedQuantity\", NS).text),\n                         \"tutar\": Decimal(s.find(\"cbc:LineExtensionAmount\", NS).text)})\n    return {\"no\": kok.find(\"cbc:ID\", NS).text,\n            \"satici\": kok.find(\".//cac:PartyName/cbc:Name\", NS).text,\n            \"toplam\": Decimal(kok.find(\"cac:LegalMonetaryTotal/cbc:PayableAmount\", NS).text),\n            \"kalemler\": kalemler}\n\ndef tutarli_mi(f):\n    return sum(k[\"tutar\"] for k in f[\"kalemler\"]) == f[\"toplam\"]\n",
   "tests": "_XML = \"\"\"<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<Invoice xmlns=\"urn:oasis:names:specification:ubl:schema:xsd:Invoice-2\"\n         xmlns:cbc=\"urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2\"\n         xmlns:cac=\"urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2\">\n  <cbc:ID>KST2024000000123</cbc:ID>\n  <cbc:IssueDate>2024-10-15</cbc:IssueDate>\n  <cac:AccountingSupplierParty><cac:Party><cac:PartyName><cbc:Name>Anadolu Market A.Ş.</cbc:Name></cac:PartyName></cac:Party></cac:AccountingSupplierParty>\n  <cac:InvoiceLine><cbc:InvoicedQuantity unitCode=\"C62\">2</cbc:InvoicedQuantity><cbc:LineExtensionAmount currencyID=\"TRY\">100.50</cbc:LineExtensionAmount><cac:Item><cbc:Name>Çay</cbc:Name></cac:Item></cac:InvoiceLine>\n  <cac:InvoiceLine><cbc:InvoicedQuantity unitCode=\"C62\">1</cbc:InvoicedQuantity><cbc:LineExtensionAmount currencyID=\"TRY\">49.50</cbc:LineExtensionAmount><cac:Item><cbc:Name>Kahve</cbc:Name></cac:Item></cac:InvoiceLine>\n  <cac:LegalMonetaryTotal><cbc:PayableAmount currencyID=\"TRY\">150.00</cbc:PayableAmount></cac:LegalMonetaryTotal>\n</Invoice>\n\"\"\"\nimport tempfile, os\n_y = os.path.join(tempfile.mkdtemp(), \"f.xml\")\nopen(_y, \"w\", encoding=\"utf-8\").write(_XML)\n_f = fatura_oku(_y)\nassert _f[\"no\"] == \"KST2024000000123\" and _f[\"satici\"] == \"Anadolu Market A.Ş.\", \"Başlık alanları: \" + repr(_f)\nassert _f[\"toplam\"] == Decimal(\"150.00\") and isinstance(_f[\"toplam\"], Decimal), \"Toplam Decimal olmalı\"\nassert _f[\"kalemler\"] == [{\"ad\": \"Çay\", \"miktar\": 2, \"tutar\": Decimal(\"100.50\")}, {\"ad\": \"Kahve\", \"miktar\": 1, \"tutar\": Decimal(\"49.50\")}], \"Kalemler: \" + repr(_f[\"kalemler\"])\nassert tutarli_mi(_f) is True, \"Tutarlı fatura\"\n_f[\"toplam\"] = Decimal(\"151\"); assert tutarli_mi(_f) is False, \"Tutarsız fatura yakalanmalı\"\n",
   "hints": [
    "ET.parse(yol).getroot()",
    "kok.findall(\"cac:InvoiceLine\", NS)",
    "Derin arama: kok.find(\".//cac:PartyName/cbc:Name\", NS)"
   ],
   "why": "Kalem toplamıyla belge toplamını karşılaştırmak gerçek bir kabul denetimidir. Para için Decimal, float yuvarlama farkı üretmez."
  },
  {
   "t": "code",
   "id": "json-csv-g2",
   "stage": "Kendin yaz",
   "diff": 2,
   "q": "<p><b>XML üret.</b> <code>siparis_xml(no, kalemler)</code>: kök <code>Siparis</code> (öznitelik <code>no</code>), her <code>(ad, adet)</code> için <code>Kalem</code> (öznitelik <code>adet</code>, metni ad). Metin döndür. <code>adet_toplam(metin)</code>: metni çözüp adetleri toplasın.</p>",
   "start": "import xml.etree.ElementTree as ET\n\ndef siparis_xml(no, kalemler):\n    pass\n\ndef adet_toplam(metin):\n    pass\n",
   "sol": "import xml.etree.ElementTree as ET\n\ndef siparis_xml(no, kalemler):\n    kok = ET.Element(\"Siparis\", {\"no\": str(no)})\n    for ad, adet in kalemler:\n        k = ET.SubElement(kok, \"Kalem\", {\"adet\": str(adet)})\n        k.text = ad\n    return ET.tostring(kok, encoding=\"unicode\")\n\ndef adet_toplam(metin):\n    return sum(int(k.get(\"adet\")) for k in ET.fromstring(metin).findall(\"Kalem\"))\n",
   "tests": "_m = siparis_xml(7, [(\"Çay & Kek\", 2), (\"Kahve\", 3)])\nassert isinstance(_m, str), \"Metin döndürmeli: encoding='unicode'\"\n_k = ET.fromstring(_m)\nassert _k.tag == \"Siparis\" and _k.get(\"no\") == \"7\", \"Kök yanlış\"\nassert [(x.text, x.get(\"adet\")) for x in _k] == [(\"Çay & Kek\", \"2\"), (\"Kahve\", \"3\")], \"Kalemler yanlış\"\nassert \"&amp;\" in _m, \"Özel karakter kaçırılmalı; XML'i elle birleştirme\"\nassert adet_toplam(_m) == 5, \"Toplam 5\"\n",
   "hints": [
    "ET.SubElement(kok, \"Kalem\", {\"adet\": str(adet)})",
    "ET.tostring(kok, encoding=\"unicode\")"
   ],
   "why": "XML'i f-string ile kurma: & ve &lt; belgeyi bozar. Kütüphane kaçırmayı kendisi yapar."
  },
  {
   "t": "code",
   "id": "json-csv-g3",
   "stage": "Hata avı",
   "diff": 2,
   "q": "<p><b>Hatayı bul ve düzelt.</b> <code>satir_sayisi(metin)</code> fatura satırlarını saymalı ama hep 0 döndürüyor, hata da vermiyor.</p>",
   "start": "import xml.etree.ElementTree as ET\n\ndef satir_sayisi(metin):\n    kok = ET.fromstring(metin)\n    return len(kok.findall(\"InvoiceLine\"))\n",
   "sol": "import xml.etree.ElementTree as ET\n\ndef satir_sayisi(metin):\n    kok = ET.fromstring(metin)\n    return len(kok.findall(\"{urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2}InvoiceLine\"))\n",
   "tests": "_m = \"\"\"<Invoice xmlns=\"urn:oasis:names:specification:ubl:schema:xsd:Invoice-2\" xmlns:cac=\"urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2\"><cac:InvoiceLine/><cac:InvoiceLine/></Invoice>\"\"\"\nassert satir_sayisi(_m) == 2, \"İki satır beklenir\"\n",
   "hints": [
    "Etiketin gerçek adını görmek için print(kok[0].tag).",
    "{ad_alani}InvoiceLine ya da findall(\"cac:InvoiceLine\", NS)."
   ],
   "why": "Sessiz sıfır, hata mesajından kötüdür. Beklenen en az bir satır varsa bunu ayrıca denetle.",
   "kind": "bug"
  }
 ]
}
);
})(window);
