from dataclasses import dataclass

@dataclass
class ThinkingBlock:
    thinking: str
    type: str = "thinking"

@dataclass
class TextBlock:
    text: str
    type: str = "text"

@dataclass
class ToolUseBlock:
    id: str
    name: str
    input: dict
    type: str = "tool_use"

content = [
    ThinkingBlock("Kullanıcı sipariş durumunu soruyor..."),
    TextBlock("Siparişinizi kontrol ediyorum."),
    ToolUseBlock("tu_1", "siparis_bul", {"no": "SP-104233"}),
]

try:
    print(content[0].text)
except AttributeError as e:
    print("AttributeError:", type(content[0]).__name__)

metin = "".join(b.text for b in content if b.type == "text")
cagrilar = [(b.name, b.input) for b in content if b.type == "tool_use"]
print(metin)
print(cagrilar)
