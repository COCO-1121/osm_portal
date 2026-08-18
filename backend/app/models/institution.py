import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class Institution(Base):
    __tablename__ = "institutions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    name: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
    )

    institute_id: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        nullable=False,
        index=True,
    )

    institution_type: Mapped[str] = mapped_column(
        String(50),
        default="University",
        nullable=False,
    )

    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False,
    )

    phone: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
    )

    address: Mapped[str] = mapped_column(
        String(255),
        default="Main Campus Address",
        nullable=False,
    )

    city: Mapped[str] = mapped_column(
        String(100),
        default="Central City",
        nullable=False,
    )

    state: Mapped[str] = mapped_column(
        String(100),
        default="State",
        nullable=False,
    )

    pincode: Mapped[str] = mapped_column(
        String(10),
        default="110001",
        nullable=False,
    )

    contact_person_name: Mapped[str] = mapped_column(
        String(150),
        default="Registrar",
        nullable=False,
    )

    contact_person_email: Mapped[str] = mapped_column(
        String(255),
        default="contact@osm.test",
        nullable=False,
    )

    contact_person_phone: Mapped[str] = mapped_column(
        String(20),
        default="9876543210",
        nullable=False,
    )

    password_hash: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    status: Mapped[str] = mapped_column(
        String(20),
        default="Active",
        nullable=False,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
