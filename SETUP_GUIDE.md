# Setup and Run Guide

This guide will help you set up and run the DocEasy React frontend with the Python backend API.

## Prerequisites

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **Python** (3.8 or higher) - [Download here](https://www.python.org/downloads/)
- **Google OAuth Credentials** (`credentials.json`) - Required for Google Calendar/Docs integration

## Step 1: Install Python Dependencies

1. Create a virtual environment (recommended):

```bash
python -m venv venv
```

2. Activate the virtual environment:

   - **Windows (PowerShell):**
     ```bash
     .\venv\Scripts\Activate.ps1
     ```
   - **Windows (CMD):**
     ```bash
     venv\Scripts\activate.bat
     ```
   - **Mac/Linux:**
     ```bash
     source venv/bin/activate
     ```

3. Install Python packages:

```bash
pip install -r requirements.txt
```

## Step 2: Install Node.js Dependencies

1. Install React dependencies:

```bash
npm install
```

## Step 3: Configure Environment Variables

1. Create a `.env` file in the root directory (optional):

```bash
VITE_API_BASE_URL=http://localhost:5000
```

## Step 4: Set Up Google OAuth (if needed)

1. Ensure you have `credentials.json` in the root directory for Google Calendar/Docs integration
2. On first run, the backend will prompt you to authenticate via browser

## Step 5: Run the Application

You need to run **two servers** - one for the backend API and one for the React frontend.

### Terminal 1: Start Backend API Server

```bash
# Make sure your virtual environment is activated
python backend-api-example.py
```

You should see:

```
Starting Flask API server on http://localhost:5000
 * Running on http://127.0.0.1:5000
```

### Terminal 2: Start React Frontend

```bash
npm run dev
```

You should see:

```
VITE v5.0.8  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

## Step 6: Access the Application

- **Frontend:** Open your browser and go to `http://localhost:3000`
- **Backend API:** Available at `http://localhost:5000`

## Troubleshooting

### Port Already in Use

If port 3000 or 5000 is already in use:

**For React (port 3000):**

- Vite will automatically try the next available port
- Or edit `vite.config.js` to change the port

**For Flask (port 5000):**

- Edit `backend-api-example.py` and change the port in the last line:
  ```python
  app.run(debug=True, port=5001)  # Change to different port
  ```

### Google Calendar Authentication Issues

If you see authentication errors:

1. Delete `token.json` if it exists
2. Make sure `credentials.json` is in the root directory
3. Run the backend again and complete the OAuth flow

### Module Import Errors

If you get import errors in the backend:

- Make sure you're in the project root directory
- Ensure all Python dependencies are installed: `pip install -r requirements.txt`

### CORS Errors

The Flask server includes `flask-cors` to handle CORS. If you still see CORS errors:

- Check that the Flask server is running
- Verify `VITE_API_BASE_URL` matches your Flask server URL

## Development Commands

### React Frontend:

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Python Backend:

- `python backend-api-example.py` - Run Flask API server

## Production Deployment

For production:

1. Build the React app: `npm run build`
2. Serve the `dist` folder with a web server (nginx, Apache, etc.)
3. Deploy the Flask API to a production server (Gunicorn, uWSGI, etc.)

## Project Structure

```
DoctorAssist/
├── src/                    # React frontend source
│   ├── pages/             # Page components
│   ├── services/          # API service layer
│   └── App.jsx            # Main app component
├── agents/                # Medical AI agents
├── crews/                 # Medical crew orchestration
├── backend-api-example.py # Flask API server
├── calendar_utils.py      # Google Calendar/Docs utils
├── requirements.txt       # Python dependencies
├── package.json           # Node.js dependencies
└── vite.config.js         # Vite configuration
```
