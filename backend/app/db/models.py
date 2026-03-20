
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.db.session import Base

def generate_uuid():
    return str(uuid.uuid4())

class Camera(Base):
    __tablename__ = "cameras"

    id = Column(String, primary_key=True, default=generate_uuid)
    location = Column(String)
    rtsp_url = Column(String, unique=True, index=True)
    status = Column(String, default="active") # active, inactive, maintenance

    incidents = relationship("Incident", back_populates="camera")

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(String, primary_key=True, default=generate_uuid)
    camera_id = Column(String, ForeignKey("cameras.id"))
    timestamp = Column(DateTime, default=datetime.utcnow)
    severity = Column(String) # critical, high, medium, low
    confidence = Column(Float)
    address = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    detected_objects = Column(JSON) # e.g. ["car", "person"]
    weather = Column(String)
    traffic_density = Column(String)
    status = Column(String, default="new") # new, acknowledged, dispatched, resolved, false_positive
    video_clip_id = Column(String)

    camera = relationship("Camera", back_populates="incidents")
    dispatches = relationship("Dispatch", back_populates="incident")

class Dispatch(Base):
    __tablename__ = "dispatches"

    id = Column(String, primary_key=True, default=generate_uuid)
    incident_id = Column(String, ForeignKey("incidents.id"))
    services = Column(JSON) # e.g. ["ambulance", "police"]
    operator_id = Column(String)
    dispatch_time = Column(DateTime, default=datetime.utcnow)
    notes = Column(String)
    status = Column(String, default="pending") # pending, on_route, arrived, completed

    incident = relationship("Incident", back_populates="dispatches")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    operator_id = Column(String)
    action = Column(String)
    incident_id = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    details = Column(String, nullable=True)
