from datetime import date

from sqlalchemy import Boolean, Date, Integer, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from .db import Base


class Checkin(Base):
    __tablename__ = "checkins"
    __table_args__ = (UniqueConstraint("date", name="uq_checkins_date"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    alive: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    sleep_hours: Mapped[int | None] = mapped_column(Integer, nullable=True)
    energy: Mapped[int | None] = mapped_column(Integer, nullable=True)
    mood: Mapped[int | None] = mapped_column(Integer, nullable=True)
    note: Mapped[str | None] = mapped_column(Text, nullable=True)
