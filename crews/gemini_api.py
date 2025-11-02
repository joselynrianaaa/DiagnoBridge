# crews/gemini_api.py
import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

def call_gemini(prompt, model="models/gemini-2.5-flash", temperature=0.4):
    """
    Lightweight Gemini API call.
    """
    try:
        model_obj = genai.GenerativeModel(model)
        response = model_obj.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print("Gemini API Error:", e)
        return f"[Error calling Gemini: {e}]"