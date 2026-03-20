# 🚦 AI Accident Detection Dashboard

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19-blue)
![Vite](https://img.shields.io/badge/Vite-7-purple)
![FastAPI](https://img.shields.io/badge/FastAPI-Python-green)
![YOLOv8](https://img.shields.io/badge/YOLOv8-Ultralytics-yellow)

An advanced, real-time traffic monitoring and accident detection system powered by Artificial Intelligence. This solution integrates a modern React frontend, a Node.js authentication and logging server, and a robust Python (FastAPI + YOLOv8) backend for efficient video stream processing.

---

## ✨ Key Features

- **Real-time Accident Detection:** Leverages the state-of-the-art YOLOv8 model to instantly detect traffic accidents in video streams.
- **Interactive Live Dashboard:** Monitor active camera feeds, view immediate accident alerts, and track system status.
- **Dedicated Operator Console:** Purpose-built interface for emergency response management and rapid action coordination.
- **Secure Authentication:** Integrated Google OAuth ensures only authorized personnel can access the system.
- **Auditing & Activity Logging:** Automatically logs user sessions and system events to Excel spreadsheets for compliance and review.
- **Modern, Responsive Design:** Crafted with Tailwind CSS v4 and Framer Motion for a fluid, beautiful, and intuitive user experience.

---

## 🛠️ Technology Stack

### 🖥️ Frontend
- **Framework:** React 19 powered by Vite
- **Styling:** Tailwind CSS v4
- **Animations:** Framer Motion
- **Icons & UI:** Lucide React
- **Routing:** React Router v7
- **Authentication:** Google OAuth (`@react-oauth/google`)

### ⚙️ Node.js Server (Auth & Logging)
- **Framework:** Express.js v5
- **Data Export:** XLSX (SheetJS) for Excel-based logs
- **Middleware:** Body-Parser, CORS

### 🧠 AI Model Backend (Python)
- **Framework:** FastAPI for high-performance REST APIs
- **Real-time Comms:** WebSockets for instantaneous frontend alerting
- **Computer Vision:** YOLOv8 (Ultralytics) for object detection, OpenCV for video processing
- **Database:** SQLAlchemy

---

## 🚀 Getting Started

Follow these instructions to set up the project locally.

### 📋 Prerequisites

- **Node.js** (v18 or higher recommended)
- **Python** (3.8 or higher, typically 3.10+ for best compatibility)
- **Git**

### 📦 Installation

#### 1. Clone the repository
```bash
git clone <repository-url>
cd ai-accident-detection-dashboard-v2
```

#### 2. Install Node.js Dependencies
Installs the required packages for both the Vite React frontend and the Express server.
```bash
npm install
```

#### 3. Python AI Backend Setup
Navigate into the `backend` folder and configure a virtual environment:
```bash
cd backend
python -m venv venv

# Activate the virtual environment:
# Windows:
.\venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install required Python packages:
pip install -r requirements.txt
cd ..
```
*Note: Ensure your `yolov8n.pt` model weights are placed in the appropriate backend directory (or root) to allow detection processes to run.*

---

## 💻 Running the Application

This ecosystem expects all three tiers (AI Backend, Node Server, React Frontend) to run simultaneously.

### 🔧 Using the provided Batch Scripts (Windows)
For easiest execution on Windows, utilize the provided batch files located in the root directory:
- `start_all.bat` - Boots up the Python backend, Node server, and the React frontend simultaneously. 
- `stop_all.bat` - Safely stops all associated application processes.

### 🔨 Manual Startup

**1. Start the Python AI Backend**
```bash
# Ensure you are within the activated Python virtual environment
uvicorn backend.app.main:app --reload --port 8000
```
*(API available at `http://localhost:8000`)*

**2. Start the Frontend & Node.js Server**
In a new terminal at the project root:
```bash
npm start
```
*(Node Auth/Log server runs on `http://localhost:3001`, React Frontend runs on `http://localhost:5173`)*

---

## 📁 Project Structure

```text
├── backend/                   # Python FastAPI Backend Architecture
│   ├── app/                   # API logic, YOLOv8 detection streams, WebSockets
│   └── requirements.txt       # AI ecosystem dependencies
├── public/                    # Static UI resources
├── src/                       # React Frontend Codebase
│   ├── components/            # Reusable React components (Dashboard, Camera, etc.)
│   └── pages/                 # Full application views
├── server.js                  # Express.js Authentication & Logging microservice
├── package.json               # Node.js dependencies & NPM scripts
├── start_all.bat              # Quick-start script for Windows
├── stop_all.bat               # Teardown script for Windows
└── README.md                  # Project documentation (You are here!)
```

---

## 🔐 Environment & Authentication Configuration

This application uses Google OAuth. To enable authentication:
1. Obtain a **Google Client ID** from the Google Cloud Console.
2. Provide it within your frontend `.env` configuration (e.g. `VITE_GOOGLE_CLIENT_ID`) or wherever configured in the application source.

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for more information.
