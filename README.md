#  DiagnoBridge – bridging symptoms to doctors

Simple React frontend with Python backend for medical diagnosis and appointment booking with Google Calendar integration.

## Features

- 🧠 **Medical Diagnosis** - AI-powered symptom analysis and diagnosis
- 📅 **Appointment Booking** - Book appointments with automatic Google Calendar integration
- 📋 **Medical Reports** - Automatically create Google Docs and attach to Calendar events
- 📊 **View Appointments** - See all upcoming appointments from Google Calendar

## Tech Stack

**Frontend:**

- React 18 + Vite
- React Router
- Axios for API calls

**Backend:**

- Flask (API server)
- Python (MedicalCrew agents)
- Google Calendar API
- Google Docs API

## Quick Start

### 1. Install Dependencies

**Python:**

```bash
python -m venv venv
.\venv\Scripts\Activate.ps1  # Windows PowerShell
pip install -r requirements.txt
```

**Node.js:**

```bash
npm install
```

### 2. Set Up Google OAuth

1. Place your `credentials.json` file in the root directory
2. The app will prompt you to authenticate on first run

### 3. Run the Application

**Terminal 1 - Backend:**

```bash
python backend-api-example.py
```

Backend runs on `http://localhost:5000`

**Terminal 2 - Frontend:**

```bash
npm run dev
```

Frontend runs on `http://localhost:3000`

### 4. Use the App

1. Go to `http://localhost:3000`
2. Click **"🧠 Medical Diagnosis"** tab
3. Fill in patient info and symptoms, then generate diagnosis
4. Click **"📅 Book Appointment"** tab
5. Fill in appointment details and check "Attach medical report"
6. The appointment will be created in Google Calendar with the medical report linked

## How Medical Reports Work

1. When you generate a diagnosis, a medical report is created
2. When booking an appointment with "Attach medical report" checked:
   - A Google Doc is created with the full medical report
   - The appointment is created in Google Calendar
   - The Google Doc link is added to the Calendar event description
   - You can click the link in the Calendar event to view the report

## Project Structure

```
DoctorAssist/
├── src/
│   ├── pages/
│   │   ├── HomePage.jsx          # Main page with Diagnosis & Booking tabs
│   │   └── ViewAppointments.jsx  # View upcoming appointments
│   ├── services/
│   │   └── api.js               # API service layer
│   └── App.jsx                   # Router setup
├── backend-api-example.py       # Flask API server
├── calendar_utils_flask.py      # Google Calendar/Docs utils (Flask-compatible)
├── crews/                       # Medical AI agents
└── agents/                      # Individual agent modules
```

## API Endpoints

- `POST /api/diagnose` - Generate medical diagnosis
- `POST /api/appointments` - Book appointment
- `GET /api/appointments` - List upcoming appointments

## Environment Variables

Optional `.env` file:

```
VITE_API_BASE_URL=http://localhost:5000
```

## Troubleshooting

**Google Calendar not connecting:**

- Ensure `credentials.json` is in the root directory
- Delete `token.json` and re-authenticate

**Import errors:**

- Make sure all Python packages are installed: `pip install -r requirements.txt`
- Ensure `calendar_utils_flask.py` exists in the root directory

**Port conflicts:**

- Frontend: Vite will auto-select next available port
- Backend: Change port in `backend-api-example.py` last line

## License

MIT License
