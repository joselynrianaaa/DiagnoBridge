"""
Example Flask API server to connect React frontend with your existing Streamlit backend.
Run this alongside your React frontend: python backend-api-example.py
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime, timedelta
import json
from googleapiclient.errors import HttpError

# Import your existing modules
from crews.medical_crew import MedicalCrew
# Use Flask-compatible calendar utils (no Streamlit dependencies)
try:
    from calendar_utils_flask import (
        get_google_services,
        create_medical_report_doc,
        create_appointment_with_doc,
        get_calendar_service,
        get_upcoming_appointments,
        check_appointment_conflicts,
    )
except ImportError:
    # Fallback to original if Flask version doesn't exist
    try:
        from calendar_utils import (
            get_google_services,
            create_medical_report_doc,
            create_appointment_with_doc,
            get_calendar_service,
            get_upcoming_appointments,
            check_appointment_conflicts,
        )
    except ImportError:
        print("ERROR: calendar_utils not available. Please ensure calendar_utils_flask.py exists.")

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Mock doctors data - replace with your database
DOCTORS = [
    {
        "id": 1,
        "name": "Dr. John Smith",
        "specialty": "Cardiologist",
        "rating": 5,
        "location": "New York, USA",
        "bio": "Experienced cardiologist with 15+ years of practice."
    },
    {
        "id": 2,
        "name": "Dr. Sarah Johnson",
        "specialty": "Dentist",
        "rating": 5,
        "location": "Los Angeles, USA",
        "bio": "Specialized in cosmetic and general dentistry."
    }
]


@app.route('/api/diagnose', methods=['POST'])
def diagnose():
    """Medical diagnosis endpoint"""
    try:
        data = request.json
        patient_data = {
            "name": data.get("name", ""),
            "age": data.get("age", ""),
            "gender": data.get("gender", ""),
            "symptoms": data.get("symptoms", "")
        }
        
        if not patient_data["symptoms"]:
            return jsonify({"error": "Symptoms are required"}), 400
        
        # Use your existing MedicalCrew
        crew = MedicalCrew()
        results = crew.diagnose(patient_data)
        
        if "error" in results:
            return jsonify(results), 500
        
        return jsonify(results)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/doctors', methods=['GET'])
def get_doctors():
    """Get list of doctors, optionally filtered by specialty"""
    specialty = request.args.get('specialty')
    
    if specialty and specialty != 'all':
        filtered = [d for d in DOCTORS if d['specialty'].lower() == specialty.lower()]
        return jsonify(filtered)
    
    return jsonify(DOCTORS)


@app.route('/api/doctors/<int:doctor_id>', methods=['GET'])
def get_doctor(doctor_id):
    """Get specific doctor details"""
    doctor = next((d for d in DOCTORS if d['id'] == doctor_id), None)
    if not doctor:
        return jsonify({"error": "Doctor not found"}), 404
    return jsonify(doctor)


@app.route('/api/appointments', methods=['POST'])
def book_appointment():
    """Book a new appointment"""
    try:
        data = request.json
        patient_name = data.get("patientName")
        date = data.get("date")
        time = data.get("time")
        duration = data.get("duration", 60)
        notes = data.get("notes", "")
        attach_report = data.get("attachReport", False)
        diagnosis_report = data.get("diagnosisReport")
        
        if not all([patient_name, date, time]):
            return jsonify({"error": "Missing required fields (patientName, date, time)"}), 400
        
        # Parse datetime
        start_dt = datetime.fromisoformat(f"{date}T{time}")
        end_dt = start_dt + timedelta(minutes=int(duration))
        
        # Get Google services
        calendar_service, docs_service = get_google_services()
        if not calendar_service:
            return jsonify({"error": "Google Calendar not connected"}), 500
        
        # Create medical report if needed
        doc_url = None
        if attach_report and docs_service and diagnosis_report:
            try:
                # Format the report content
                report_content = f"""MEDICAL DIAGNOSIS REPORT
Generated: {datetime.now().strftime("%B %d, %Y at %I:%M %p")}

Patient Information
- Name: {patient_name}
- Age: {diagnosis_report.get('age', 'N/A')}
- Gender: {diagnosis_report.get('gender', 'N/A')}

Symptoms
{diagnosis_report.get('symptoms', 'N/A')}

Diagnosis
{diagnosis_report.get('diagnosis', 'No diagnosis generated')}

Treatment Plan
{diagnosis_report.get('treatment', 'No treatment plan generated')}

Comprehensive Report
{diagnosis_report.get('report', 'No detailed report available')}

──────────────────────────────────────────────
Disclaimer: AI-generated content for educational purposes only.
──────────────────────────────────────────────
"""
                # Create Google Doc
                doc_info = create_medical_report_doc(docs_service, patient_name, report_content)
                if doc_info:
                    doc_url = doc_info.get('url')
            except Exception as e:
                print(f"Warning: Failed to create medical report doc: {e}")
                # Continue without doc_url if report creation fails
        
        # Check conflicts
        conflicts = check_appointment_conflicts(calendar_service, start_dt, end_dt)
        if conflicts:
            return jsonify({
                "error": "Time conflict",
                "conflicts": conflicts
            }), 409
        
        # Create appointment
        event = create_appointment_with_doc(
            calendar_service,
            patient_name,
            notes,
            start_dt,
            end_dt,
            doc_url
        )
        
        if event:
            return jsonify({
                "success": True,
                "event": event,
                "calendarLink": event.get('htmlLink')
            })
        else:
            return jsonify({"error": "Failed to create appointment"}), 500
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/appointments', methods=['GET'])
def list_appointments():
    """Get list of upcoming appointments"""
    try:
        service = get_calendar_service()
        if not service:
            return jsonify({"error": "Google Calendar not connected"}), 500
        
        appointments = get_upcoming_appointments(service)
        return jsonify(appointments)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/appointments/<event_id>', methods=['DELETE'])
def delete_appointment(event_id):
    """Delete an appointment from Google Calendar"""
    try:
        service = get_calendar_service()
        if not service:
            return jsonify({"error": "Google Calendar not connected"}), 500
        
        service.events().delete(calendarId='primary', eventId=event_id).execute()
        return jsonify({"success": True, "message": "Appointment deleted"})
    except HttpError as e:
        return jsonify({"error": str(e)}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    print("Starting Flask API server on http://localhost:5000")
    print("Make sure to set VITE_API_BASE_URL=http://localhost:5000 in your React .env")
    app.run(debug=True, port=5000)

