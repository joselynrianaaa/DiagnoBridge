# crews/mcp_engine.py
import google.generativeai as genai
import os
from dotenv import load_dotenv

# --- Load API key ---
load_dotenv()
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))


# ----------------------------------------------------------------------
# Helper function for direct Gemini API calls
# ----------------------------------------------------------------------
def call_gemini(prompt, model="models/gemini-2.0-flash", temperature=0.4):
    """Call Gemini API and return plain text output."""
    try:
        model_obj = genai.GenerativeModel(model)
        response = model_obj.generate_content(prompt)
        return response.text.strip() if response and response.text else ""
    except Exception as e:
        print("❌ Gemini API Error:", e)
        return f"[Error calling Gemini: {e}]"


# ----------------------------------------------------------------------
# Agent Wrapper Class
# ----------------------------------------------------------------------
class MCPAgent:
    def __init__(self, name, role, prompt_template):
        self.name = name
        self.role = role
        self.prompt_template = prompt_template

    def run(self, context):
        """Run this agent on given context and return only text output."""
        prompt = self.prompt_template.format(context=context)
        response_text = call_gemini(prompt)
        # return just the text (no nested dicts)
        return {"agent": self.name, "response": response_text}


# ----------------------------------------------------------------------
# Orchestrator for multi-agent pipeline
# ----------------------------------------------------------------------
class MCPOrchestrator:
    def __init__(self, agents):
        self.agents = agents

    def run_pipeline(self, patient_data):
        """
        Sequentially run all agents, passing accumulated context.
        Returns a dict of {AgentName: raw_output}.
        """
        context = str(patient_data)
        results = {}

        for agent in self.agents:
            print(f"\n🤖 Running {agent.name}...")
            output = agent.run(context)
            response_text = output.get("response", "")
            results[agent.name] = response_text

            # Append agent output to context for the next one
            context += f"\n\n---\n{agent.name} Output:\n{response_text}"

        print("\n✅ All agents completed successfully.\n")
        return results
