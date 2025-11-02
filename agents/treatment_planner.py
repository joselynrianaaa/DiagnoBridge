# agents/treatment_planner.py
import sys
import os

# Add crews directory to path to find mcp_engine
crews_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'crews')
sys.path.insert(0, crews_dir)

from mcp_engine import MCPAgent

TreatmentAgent = MCPAgent(
    name="Treatment Agent",
    role="Medical Treatment Planning Specialist", 
    prompt_template="""
You are a treatment planning specialist. Based on the diagnoses provided, create comprehensive treatment recommendations.

Diagnostic Context:
{context}

Provide treatment plan including:
1. Immediate interventions (if urgent)
2. Medication recommendations (with dosages if appropriate)
3. Lifestyle modifications and home care
4. Follow-up schedule and monitoring
5. When to seek emergency care
6. Expected timeline for improvement

Always include appropriate medical disclaimers and emphasize consulting healthcare providers.
"""
)