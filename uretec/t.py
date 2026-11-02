code = '''
from sqlalchemy import create_engine, ForeignKey, select, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship, Session
class Base(DeclarativeBase):
    pass
class Musteri(Base):
    __tablename__ = "musteri"
    id: Mapped[int] = mapped_column(primary_key=True)
    ad: Mapped[str]
    siparisler: Mapped[list["Siparis"]] = relationship(back_populates="musteri")
class Siparis(Base):
    __tablename__ = "siparis"
    id: Mapped[int] = mapped_column(primary_key=True)
    tutar: Mapped[float]
    musteri_id: Mapped[int] = mapped_column(ForeignKey("musteri.id"))
    musteri: Mapped["Musteri"] = relationship(back_populates="siparisler")
e = create_engine("sqlite+pysqlite:///:memory:")
Base.metadata.create_all(e)
with Session(e) as s:
    s.add(Musteri(ad="A", siparisler=[Siparis(tutar=5)]))
    s.commit()
with Session(e) as s:
    print(s.scalars(select(Siparis)).one().musteri.ad)
'''
ns = {"__name__": "__main__"}
exec(compile(code, "<c>", "exec"), ns)
