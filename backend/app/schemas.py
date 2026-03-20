
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# --- Camera Schemas ---
class CameraBase(BaseModel):
    location: str
    rtsp_url: str
    status: Optional[str] = "active"

class CameraCreate(CameraBase):
    pass

class Camera(CameraBase):
    id: str

    class Config:
        from_attributes = True

# --- Incident Schemas ---
class IncidentBase(BaseModel):
    camera_id: str
    severity: str
    confidence: float
    address: str
    latitude: float
    longitude: float
    detected_objects: List[str]
    weather: Optional[str] = None
    traffic_density: Optional[str] = None
    video_clip_id: Optional[str] = None

class IncidentCreate(IncidentBase):
    pass

class Incident(IncidentBase):
    id: str
    timestamp: datetime
    status: str

    class Config:
        from_attributes = True
