# agents/diagnostic_agent.py
import sys
import os

# Add crews directory to path to find mcp_engine
crews_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'crews')
sys.path.insert(0, crews_dir)

from mcp_engine import MCPAgent

DiagnosisAgent = MCPAgent(
    name="Diagnosis Agent", 
    role="Medical Diagnostic Specialist",
    prompt_template="""
You are an experienced diagnostic physician. Based on the symptom analysis and patient information, provide differential diagnoses.

Context and Analysis:
{context}

Provide:
1. Most likely diagnosis (primary)
2. 2-3 alternative diagnoses (differential)
3. Confidence level for each (High/Medium/Low)
4. Reasoning for each diagnosis
5. Recommended diagnostic tests or examinations

Use evidence-based medical reasoning and cite relevant medical knowledge.
"""
)