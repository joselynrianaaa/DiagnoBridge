# agents/symptom_analyzer.py
import sys
import os

# Add crews directory to path to find mcp_engine
crews_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'crews')
sys.path.insert(0, crews_dir)

from mcp_engine import MCPAgent

SymptomAgent = MCPAgent(
    name="Symptom Analyzer",
    role="Medical Symptom Analysis Specialist",
    prompt_template="""
You are a medical symptom analyzer. Extract and categorize symptoms from patient data.

Patient Information:
{context}

Analyze and provide:
1. Primary symptoms (most concerning)
2. Secondary symptoms (supporting details)
3. Symptom duration and severity assessment
4. Red flags or urgent symptoms that need immediate attention
5. Questions that should be asked for more clarity

Format your response clearly with categories.
"""
)