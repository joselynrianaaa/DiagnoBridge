# agents/knowledge_graph_agent.py
import sys
import os
import json
import re
import streamlit as st

# Add crews directory to path to find mcp_engine
crews_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'crews')
sys.path.insert(0, crews_dir)

from mcp_engine import MCPAgent

# ----------------------------------------------------------------------
# KNOWLEDGE GRAPH AGENT DEFINITION
# ----------------------------------------------------------------------
KnowledgeGraphAgent = MCPAgent(
    name="Knowledge Graph Agent",
    role="Medical Knowledge Graph Generator",
    prompt_template="""
You are a medical knowledge graph specialist. Based on the medical analysis, create a structured knowledge graph
showing relationships between symptoms, diseases, treatments, and reasoning paths.

Context:
{context}

Return ONLY a single valid JSON object (no markdown, no commentary, no quotes).
The JSON must have the keys: "nodes", "relationships", "reasoning_paths", "alternative_paths".
Each node should include "id", "type", and a descriptive "label" (e.g., "Cough", "Flu", "Paracetamol").
"""
)

# ----------------------------------------------------------------------
# FINAL ULTRA-ROBUST JSON CLEANER + LABEL FIXER
# ----------------------------------------------------------------------
def generate_knowledge_graph(model_output):
    """
    Handles unwrapping multiple layers of escaped JSON from Gemini.
    Removes quotes, code blocks, escaped characters, and malformed wrappers.
    Also ensures all nodes have 'label' and 'id'.
    """
    try:
        if not model_output:
            raise ValueError("Empty output from model")

        if isinstance(model_output, dict):
            parsed = model_output
        else:
            raw = str(model_output).strip()
            original = raw  # For debugging

            # Remove code fences like ```json or ```
            raw = re.sub(r"^```(?:json)?", "", raw)
            raw = re.sub(r"```$", "", raw)
            raw = raw.strip()

            # Unwrap escaped double quotes multiple times
            for _ in range(2):
                if raw.startswith('"') and raw.endswith('"'):
                    raw = raw[1:-1].replace('\\"', '"').replace("\\n", "\n").strip()

            # Strip leading/trailing junk
            raw = raw.strip(", \n\r\t")

            # Try to locate actual JSON block
            json_match = re.search(r"\{[\s\S]*\}", raw)
            if not json_match:
                raise ValueError("No valid JSON object found.")
            json_str = json_match.group(0)

            parsed = json.loads(json_str)

        # Fallback if key missing
        if "nodes" not in parsed:
            raise ValueError("'nodes' key missing in parsed object.")

        # Fix each node: ensure label present
        for node in parsed["nodes"]:
            node["id"] = node.get("id", node.get("label", "unknown_id")).strip()
            node["type"] = node.get("type", "unknown").strip()
            node["label"] = node.get("label", node["id"]).strip()

        # Fix relationships (optional)
        if "relationships" not in parsed:
            parsed["relationships"] = []

        # Optional: show in Streamlit
        st.markdown("### 🧪 Raw Gemini Output (after cleaning)")
        with st.expander("Click to view raw output"):
            st.code(json.dumps(parsed, indent=2)[:1500], language="json")

        return parsed

    except Exception as e:
        st.error(f"Agent pipeline failed: {e}")
        return {
            "nodes": [{"id": "error", "type": "error", "label": "Parsing failed"}],
            "relationships": [],
            "error": str(e)
        }

# ----------------------------------------------------------------------
# WRAPPER TO RUN AGENT + CLEAN OUTPUT
# ----------------------------------------------------------------------
def run_knowledge_graph(context_text):
    try:
        raw = KnowledgeGraphAgent.run(context=context_text)
        response = raw.get("response", "") if isinstance(raw, dict) else str(raw)
        return generate_knowledge_graph(response)
    except Exception as e:
        st.error(f"Agent pipeline failed: {e}")
        return {
            "nodes": [{"id": "error", "type": "error", "label": "Agent failed"}],
            "relationships": [],
            "error": str(e)
        }
