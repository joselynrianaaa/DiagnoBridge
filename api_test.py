# api_test_fixed.py
import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")

print(f"API Key loaded: {api_key[:10]}..." if api_key else "No API key found")

genai.configure(api_key=api_key)

# First, let's see what models are available
print("\nAvailable models:")
for model in genai.list_models():
    if 'generateContent' in model.supported_generation_methods:
        print(f"- {model.name}")

# Test with the correct model name
try:
    model = genai.GenerativeModel('gemini-1.5-flash')  # Updated model name
    response = model.generate_content("Hello, can you respond with a simple greeting?")
    print(f"\nSuccess! Response: {response.text}")
except Exception as e:
    print(f"Error with gemini-1.5-flash: {e}")
    
    # Try alternative model name
    try:
        model = genai.GenerativeModel('models/gemini-1.5-flash')
        response = model.generate_content("Hello, can you respond with a simple greeting?")
        print(f"\nSuccess with full model name! Response: {response.text}")
    except Exception as e2:
        print(f"Error with full model name: {e2}")