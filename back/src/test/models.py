from src.config.database import Base
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime


class Test(Base):
    __tablename__ = "tests"
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, index=True)
    bio = Column(String)
