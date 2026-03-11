from typing import List
from fastapi import APIRouter, Depends
from src.config.database import get_db
from src.test.schemas import TestBase, TestCreate, TestResponse
from src.test.models import *
from sqlalchemy.orm import Session
from src.test.services import *

router = APIRouter()


@router.post("/")
def create_test(test: TestCreate, db: Session = Depends(get_db)):
    return create(db, test)


@router.get("/", response_model=List[TestResponse])
def get_tests(db: Session = Depends(get_db)):
    return gett_all(db=db)
