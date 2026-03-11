from sqlalchemy.orm import Session
from src.test.schemas import TestBase
from src.test.models import Test


def create(db: Session, test: TestBase):
    new_test = Test(name=test.name, bio=test.bio)
    db.add(new_test)
    db.commit()
    db.refresh(new_test)
    return new_test


def gett_all(db: Session):
    tests = db.query(Test).all()
    return tests