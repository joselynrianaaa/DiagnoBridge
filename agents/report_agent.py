# agents/report_agent.py
import sys
import os

# Add crews directory to path to find mcp_engine
crews_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'crews')
sys.path.insert(0, crews_dir)

from mcp_engine import MCPAgent

ReportAgent = MCPAgent(
    name="Report Agent",
    role="Medical Documentation Specialist",
    prompt_template="""
You are a medical documentation specialist. Synthesize all previous analyses into a comprehensive clinical report.

Complete Analysis Context:
{context}

Create a structured report with:

**PATIENT SUMMARY**
- Demographics and presenting symptoms

**CLINICAL ASSESSMENT** 
- Key findings from symptom analysis
- Diagnostic reasoning and differential diagnoses

**RECOMMENDED TREATMENT**
- Immediate and long-term treatment plan
- Monitoring and follow-up requirements

**IMPORTANT DISCLAIMERS**
- AI limitations and need for professional medical evaluation
- Emergency contact information if symptoms worsen

Write in clear, professional medical language suitable for healthcare providers while being understandable to patients.
"""
)