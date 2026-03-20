
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.db.models import Incident, Dispatch
from app.schemas import Incident as IncidentSchema
from app.schemas import IncidentCreate
from app.websocket.manager import manager

router = APIRouter()

@router.get("/", response_model=List[IncidentSchema])
def read_incidents(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    incidents = db.query(Incident).order_by(Incident.timestamp.desc()).offset(skip).limit(limit).all()
    return incidents

@router.get("/{incident_id}", response_model=IncidentSchema)
def read_incident(incident_id: str, db: Session = Depends(get_db)):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if incident is None:
        raise HTTPException(status_code=404, detail="Incident not found")
    return incident

@router.post("/{incident_id}/dispatch")
async def dispatch_services(incident_id: str, services: List[str], db: Session = Depends(get_db)):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if incident is None:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    # improved: Create Dispatch record
    dispatch = Dispatch(
        incident_id=incident_id,
        services=services,
        operator_id="OP_001", # Mock operator
        notes="Auto-dispatch trigger",
        status="pending"
    )
    db.add(dispatch)
    
    incident.status = "dispatched"
    db.commit()
    
    # Notify Frontend via WebSocket
    await manager.broadcast({
        "type": "dispatch_update",
        "incident_id": incident_id,
        "status": "dispatched",
        "services": services
    })
    
    return {"message": "Services dispatched successfully", "dispatch_id": dispatch.id}
