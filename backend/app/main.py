
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.api import cameras, alerts, dispatch
from app.websocket import manager as ws_manager
from app.db.session import engine, Base

# Create database tables
# In production, use Alembic for migrations
Base.metadata.create_all(bind=engine)

from contextlib import asynccontextmanager
from app.detection.service import service as detection_service
from app.db.session import SessionLocal
from app.db.models import Camera

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Load cameras and start detection
    print("Starting up detection service...")
    db = SessionLocal()
    cameras = db.query(Camera).filter(Camera.status == "active").all()
    for cam in cameras:
        # For demo, if rtsp_url is meant to be a file, ensure it exists or use O for webcam
        # If it's a file path string, use it.
        try:
            source = int(cam.rtsp_url) if cam.rtsp_url.isdigit() else cam.rtsp_url
            detection_service.start_camera(cam.id, source)
            print(f"Started monitoring camera {cam.id} at {source}")
        except Exception as e:
            print(f"Failed to start camera {cam.id}: {e}")
    db.close()
    yield
    # Shutdown logic if needed

app = FastAPI(
    title="ESP Backend",
    description="Backend for AI Accident Detection System",
    version="1.0.0",
    lifespan=lifespan
)

# API Routers
app.include_router(cameras.router, prefix="/api/cameras", tags=["cameras"])
app.include_router(alerts.router, prefix="/api/alerts", tags=["alerts"])
app.include_router(dispatch.router, prefix="/api/dispatch", tags=["dispatch"])

# WebSocket Endpoint
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await ws_manager.manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Handle incoming messages from UI (acknowledgments, etc.)
            print(f"WS Message: {data}")
    except Exception:
        ws_manager.manager.disconnect(websocket)

# Static Video Clips
app.mount("/clips", StaticFiles(directory="data/clips"), name="clips")

# CORS configuration
origins = [
    "http://localhost:5173",  # Frontend Vite dev server
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "online", "system": "ESP Backend"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
