# crews/medical_crew.py
import json
import os
import sys

# --- Path setup ---
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(current_dir)
agents_dir = os.path.join(project_root, 'agents')
utils_dir = os.path.join(project_root, 'utils')

if agents_dir not in sys.path:
    sys.path.append(agents_dir)
if utils_dir not in sys.path:
    sys.path.append(utils_dir)

# --- Imports ---
from .mcp_engine import MCPOrchestrator
from symptom_analyzer import SymptomAgent
from diagnostic_agent import DiagnosisAgent
from treatment_planner import TreatmentAgent
from report_agent import ReportAgent
from knowledge_graph_agent import KnowledgeGraphAgent, generate_knowledge_graph

# Optional visualizer import
try:
    from knowledge_graph_visualizer import KnowledgeGraphVisualizer
    VISUALIZER_AVAILABLE = True
except ImportError as e:
    VISUALIZER_AVAILABLE = False
    print(f"Warning: Knowledge graph visualizer not available: {e}")


class MedicalCrew:
    def __init__(self):
        """Initialize the medical agent crew and orchestrator."""
        self.agents = [
            SymptomAgent,
            DiagnosisAgent,
            TreatmentAgent,
            ReportAgent,
            KnowledgeGraphAgent
        ]
        self.orchestrator = MCPOrchestrator(self.agents)

        if VISUALIZER_AVAILABLE:
            self.kg_visualizer = KnowledgeGraphVisualizer()
        else:
            self.kg_visualizer = None

    def diagnose(self, patient_data):
        """
        Run all agents and return structured results.
        Now includes automatic JSON cleaning for Knowledge Graph output.
        """
        try:
            # Run the full pipeline
            results = self.orchestrator.run_pipeline(patient_data)

            # --- Fix: Safely clean & parse Knowledge Graph Agent output ---
            raw_kg_output = results.get("Knowledge Graph Agent", "")
            parsed_kg = generate_knowledge_graph(raw_kg_output)

            # --- Final structured output for Streamlit ---
            structured_output = {
                "diagnosis": results.get("Diagnosis Agent", "No diagnosis available"),
                "treatment": results.get("Treatment Agent", "No treatment plan available"),
                "report": results.get("Report Agent", "No report available"),
                "symptoms": results.get("Symptom Analyzer", "No symptom analysis available"),
                "knowledge_graph": parsed_kg,  # ✅ cleaned JSON output
            }

            return structured_output

        except Exception as e:
            return {
                "error": f"Agent pipeline failed: {str(e)}",
                "diagnosis": "Error in diagnosis generation",
                "treatment": "Error in treatment planning",
                "report": "Error in report generation",
                "symptoms": "Error in symptom analysis",
                "knowledge_graph": {
                    "nodes": [],
                    "relationships": [],
                    "error": str(e),
                },
            }

    def render_knowledge_graph(self, kg_data):
        """Optionally render graph if visualizer is available."""
        if self.kg_visualizer:
            return self.kg_visualizer.render_knowledge_graph(kg_data)
        else:
            import streamlit as st
            st.warning("Knowledge graph visualizer not available")
            st.code(kg_data)
