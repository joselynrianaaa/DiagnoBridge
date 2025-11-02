import streamlit as st
from datetime import datetime, timedelta
import json
import numpy as np
import plotly.graph_objects as go

# Internal imports
from crews.medical_crew import MedicalCrew
from calendar_utils import (
    get_google_services,
    create_medical_report_doc,
    create_appointment_with_doc,
    get_calendar_service,
    get_upcoming_appointments,
    reset_calendar_auth,
    check_appointment_conflicts,
)

# Streamlit page setup
st.set_page_config(page_title="DiagnoBridge – bridging symptoms to doctors.", page_icon="🏥", layout="wide")
st.title("🏥 DiagnoBridge – bridging symptoms to doctors")

# Session state
if "last_diagnosis_report" not in st.session_state:
    st.session_state.last_diagnosis_report = None
if "last_patient_name" not in st.session_state:
    st.session_state.last_patient_name = None


# --------------------------------------------------------------------------
# 🔹 Knowledge Graph Visualizer (Color Coded + Legend)
# --------------------------------------------------------------------------
def create_knowledge_graph_visualization(kg_json_str):
    """Plotly-based medical knowledge graph with color coding and legend."""
    try:
        if isinstance(kg_json_str, str):
            cleaned_json = kg_json_str.strip()
            if cleaned_json.startswith("```json"):
                cleaned_json = cleaned_json[7:]
            if cleaned_json.endswith("```"):
                cleaned_json = cleaned_json[:-3]
            kg_data = json.loads(cleaned_json)
        else:
            kg_data = kg_json_str

        nodes = kg_data.get("nodes", [])
        relationships = kg_data.get("relationships", [])

        if len(nodes) == 0:
            st.warning("No nodes to visualize.")
            return

        angles = np.linspace(0, 2 * np.pi, len(nodes), endpoint=False)
        radius = 5

        node_x, node_y, node_text, node_color = [], [], [], []
        color_map = {
            "symptom": "#e74c3c",
            "disease": "#3498db",
            "treatment": "#2ecc71",
            "outcome": "#f39c12",
            "error": "#7f8c8d",
            "unknown": "#bdc3c7",
        }

        id_to_pos = {}
        for i, node in enumerate(nodes):
            x, y = radius * np.cos(angles[i]), radius * np.sin(angles[i])
            label = node.get("label", f"Node {i}")
            ntype = node.get("type", "unknown").lower()
            node_x.append(x)
            node_y.append(y)
            node_text.append(label)
            node_color.append(color_map.get(ntype, color_map["unknown"]))
            id_to_pos[node.get("id")] = (x, y)

        # Build edges
        edge_x, edge_y = [], []
        for rel in relationships:
            src, tgt = rel.get("source"), rel.get("target")
            if src in id_to_pos and tgt in id_to_pos:
                x0, y0 = id_to_pos[src]
                x1, y1 = id_to_pos[tgt]
                edge_x += [x0, x1, None]
                edge_y += [y0, y1, None]

        fig = go.Figure()

        # Edges
        fig.add_trace(
            go.Scatter(
                x=edge_x,
                y=edge_y,
                line=dict(width=2, color="gray"),
                mode="lines",
                hoverinfo="none",
            )
        )

        # Nodes
        fig.add_trace(
            go.Scatter(
                x=node_x,
                y=node_y,
                mode="markers+text",
                text=node_text,
                textposition="middle center",
                marker=dict(size=28, color=node_color, line=dict(width=1.5, color="white")),
                textfont=dict(size=11, color="white"),
                hoverinfo="text",
            )
        )

        fig.update_layout(
            title="Medical Knowledge Graph",
            plot_bgcolor="white",
            xaxis=dict(showgrid=False, zeroline=False, showticklabels=False),
            yaxis=dict(showgrid=False, zeroline=False, showticklabels=False),
            height=520,
            margin=dict(l=20, r=20, t=40, b=20),
        )

        st.plotly_chart(fig, use_container_width=True)

        # Legend
        st.markdown("### 🔹 Legend")
        cols = st.columns(3)
        legend_items = list(color_map.items())
        for i, (key, val) in enumerate(legend_items):
            with cols[i % 3]:
                st.markdown(
                    f"<div style='background:{val};padding:6px 10px;border-radius:6px;color:white;width:fit-content;'>{key.title()}</div>",
                    unsafe_allow_html=True,
                )

        # Node/Edge metrics
        col1, col2 = st.columns(2)
        col1.metric("🧠 Nodes", len(nodes))
        col2.metric("🔗 Relationships", len(relationships))

    except Exception as e:
        st.error(f"Visualization error: {str(e)}")
        st.json(kg_json_str)


# --------------------------------------------------------------------------
# 🔹 Tabs Setup
# --------------------------------------------------------------------------
tab1, tab2, tab3 = st.tabs(["🧠 Medical Diagnosis", "📅 Book Appointment", "📋 View Appointments"])

# --------------------------------------------------------------------------
# 🧠 Tab 1: Diagnosis
# --------------------------------------------------------------------------
with tab1:
    st.header("Medical Diagnosis with Knowledge Graph")

    with st.form("patient_form"):
        col1, col2 = st.columns(2)
        with col1:
            name = st.text_input("Patient Name")
            age = st.number_input("Age", min_value=0, max_value=120)
        with col2:
            gender = st.selectbox("Gender", ["Male", "Female", "Other"])
        symptoms = st.text_area("Describe the patient's symptoms", height=150)
        submitted = st.form_submit_button("🧠 Generate Diagnosis & Graph")

    if submitted:
        if not symptoms.strip():
            st.error("Please describe symptoms before generating a diagnosis.")
        else:
            patient_data = {"name": name, "age": age, "gender": gender, "symptoms": symptoms}
            crew = MedicalCrew()
            with st.spinner("Running multi-agent medical analysis..."):
                results = crew.diagnose(patient_data)

            if "error" in results:
                st.error(results["error"])
            else:
                report_content = results.get("report", "")
                if report_content:
                    st.session_state.last_diagnosis_report = f"""
──────────────────────────────────────────────
**MEDICAL DIAGNOSIS REPORT**
Generated: {datetime.now().strftime("%B %d, %Y at %I:%M %p")}
──────────────────────────────────────────────

**Patient Information**
- Name: {name}
- Age: {age}
- Gender: {gender}

**Symptoms**
{symptoms}

**Diagnosis**
{results.get("diagnosis", "No diagnosis generated")}

**Treatment Plan**
{results.get("treatment", "No treatment plan generated")}

**Comprehensive Report**
{report_content}

──────────────────────────────────────────────
*Disclaimer: AI-generated content for educational purposes only.*
──────────────────────────────────────────────
"""
                    st.session_state.last_patient_name = name
                    st.success("✅ Diagnosis complete! You can now book an appointment.")

                # Display sections
                diag_tab, graph_tab, pipeline_tab = st.tabs(["Clinical Report", "Knowledge Graph", "Pipeline Details"])

                with diag_tab:
                    st.subheader("📋 Clinical Analysis")
                    st.write(results.get("report", "No detailed report available."))

                with graph_tab:
                    st.subheader("🧠 Interactive Knowledge Graph")
                    kg_data = results.get("knowledge_graph", "")
                    if kg_data and kg_data != "No knowledge graph available":
                        create_knowledge_graph_visualization(kg_data)
                    else:
                        st.warning("No graph data available.")

                with pipeline_tab:
                    st.subheader("🤖 Agent Pipeline Details")
                    st.info("Multi-agent system used for analysis:")
                    st.markdown("""
1️⃣ **Symptom Analyzer** – Identifies and categorizes symptoms  
2️⃣ **Diagnostic Agent** – Suggests possible conditions  
3️⃣ **Treatment Planner** – Recommends treatments  
4️⃣ **Report Agent** – Generates structured clinical report  
5️⃣ **Knowledge Graph Agent** – Maps relationships visually
""")


# --------------------------------------------------------------------------
# 📅 Tab 2: Booking
# --------------------------------------------------------------------------
with tab2:
    st.header("Book an Appointment with Attached Medical Report")

    if st.session_state.last_diagnosis_report:
        st.info(f"📄 Report ready for **{st.session_state.last_patient_name}** – will be auto-attached.")

    calendar_service, docs_service = get_google_services()
    if not calendar_service:
        st.warning("❌ Google Calendar not connected.")
        if st.button("🔄 Reset Google Authentication"):
            reset_calendar_auth()
            st.rerun()
    else:
        st.success("✅ Connected to Google Calendar & Docs.")

        with st.form("book_form"):
            col1, col2 = st.columns(2)
            with col1:
                pname = st.text_input("Patient Name", value=st.session_state.last_patient_name or "")
                date = st.date_input("Date", min_value=datetime.now().date())
            with col2:
                time = st.time_input("Time", value=datetime.strptime("10:00", "%H:%M").time())
                duration = st.selectbox("Duration (min)", [30, 45, 60, 90], index=1)
            notes = st.text_area("Notes / Reason for visit")
            attach = st.checkbox(
                "Attach medical report", value=bool(st.session_state.last_diagnosis_report),
                disabled=not st.session_state.last_diagnosis_report
            )
            submit = st.form_submit_button("📅 Book Appointment")

        if submit:
            start_dt = datetime.combine(date, time)
            end_dt = start_dt + timedelta(minutes=duration)
            doc_url = None

            if attach and docs_service and st.session_state.last_diagnosis_report:
                with st.spinner("Creating Google Doc for report..."):
                    doc_info = create_medical_report_doc(docs_service, pname, st.session_state.last_diagnosis_report)
                    if doc_info:
                        doc_url = doc_info["url"]
                        st.success(f"✅ Report saved: [Open Google Doc]({doc_url})")

            conflicts = check_appointment_conflicts(calendar_service, start_dt, end_dt)
            if conflicts:
                st.warning(f"⚠️ Time conflict with {len(conflicts)} existing appointment(s).")
                for c in conflicts:
                    start = c["start"].get("dateTime", c["start"].get("date"))
                    st.write(f"- {c.get('summary', 'Unnamed')} at {start}")
            else:
                with st.spinner("Creating calendar event..."):
                    event = create_appointment_with_doc(calendar_service, pname, notes, start_dt, end_dt, doc_url)
                    if event:
                        st.success("✅ Appointment booked!")
                        st.markdown(f"[📅 Open in Google Calendar]({event['htmlLink']})")
                        if doc_url:
                            st.markdown(f"[📄 Open Report]({doc_url})")
                        st.session_state.last_diagnosis_report = None
                        st.session_state.last_patient_name = None


# --------------------------------------------------------------------------
# 📋 Tab 3: View Appointments
# --------------------------------------------------------------------------
with tab3:
    st.header("Upcoming Appointments")

    if st.button("🔄 Refresh Appointments"):
        with st.spinner("Fetching upcoming events..."):
            service = get_calendar_service()
            if service:
                appts = get_upcoming_appointments(service)
                if appts:
                    st.success(f"Found {len(appts)} upcoming appointments.")
                    for i, ev in enumerate(appts, 1):
                        with st.expander(f"📅 {i}. {ev.get('summary', 'Untitled')}"):
                            start = ev["start"].get("dateTime", ev["start"].get("date"))
                            st.write(f"🕒 {start}")
                            desc = ev.get("description", "")
                            if "docs.google.com" in desc:
                                for line in desc.split("\n"):
                                    if "docs.google.com" in line:
                                        link = line.strip().split(" ")[-1]
                                        st.markdown(f"[📄 Medical Report]({link})")
                            st.write(desc)
                else:
                    st.info("No appointments found.")
            else:
                st.warning("Google Calendar not connected. Authenticate under the booking tab.")

# --------------------------------------------------------------------------
# 🧠 Sidebar
# --------------------------------------------------------------------------
st.sidebar.header("⚠️ Disclaimer")
st.sidebar.error("""
**AI Assistant for Educational Use Only**

- Not a substitute for medical advice  
- Always consult licensed professionals  
- In case of emergency, contact local services
""")

st.sidebar.header("💡 Quick Guide")
st.sidebar.info("""
1️⃣ **Medical Diagnosis** – AI analysis + graph  
2️⃣ **Book Appointment** – Create events with Docs  
3️⃣ **View Appointments** – Review upcoming events  
""")
