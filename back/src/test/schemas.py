from pydantic import BaseModel


class TestBase(BaseModel):
    name: str
    bio: str


class TestCreate(TestBase):
    pass


class TestResponse(TestBase):
    id: int


class Test(TestBase):
    id: int

    class Config:
        from_attributes = True
