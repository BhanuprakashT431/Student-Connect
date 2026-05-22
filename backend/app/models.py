import datetime
from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, nullable=False)  # "student" or "employee"
    full_name = Column(String, nullable=False)
    
    # Stores flexible profile data like company name, job title, biography, and
    # sensitive details like contact_email and linkedin_url to reveal later.
    profile_data = Column(JSON, default=dict)

    # Relationships
    opportunities = relationship("Opportunity", back_populates="poster", cascade="all, delete-orphan")
    
    # We specify foreign_keys because User is referenced twice in ConnectionRequest
    sent_requests = relationship(
        "ConnectionRequest", 
        foreign_keys="ConnectionRequest.student_id", 
        back_populates="student",
        cascade="all, delete-orphan"
    )
    received_requests = relationship(
        "ConnectionRequest", 
        foreign_keys="ConnectionRequest.employee_id", 
        back_populates="employee",
        cascade="all, delete-orphan"
    )


class Opportunity(Base):
    __tablename__ = "opportunities"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False, index=True)
    company = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=False)
    type = Column(String, nullable=False)  # "job" or "internship"
    posted_by = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Relationships
    poster = relationship("User", back_populates="opportunities")


class ConnectionRequest(Base):
    __tablename__ = "connection_requests"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    employee_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(String, default="pending", nullable=False)  # "pending", "accepted", "declined"
    pitch = Column(Text, nullable=False)  # Maximum 300 characters
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    # Relationships
    student = relationship("User", foreign_keys=[student_id], back_populates="sent_requests")
    employee = relationship("User", foreign_keys=[employee_id], back_populates="received_requests")
