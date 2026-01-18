from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .db import Base, engine
from .routers import checkins

Base.metadata.create_all(bind=engine)

app = FastAPI(title="SiLeMe App")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(checkins.router)


@app.get("/")
def root():
    return {"status": "ok"}
