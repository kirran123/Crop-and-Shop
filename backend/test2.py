import os
import google.generativeai as genai

from dotenv import load_dotenv
load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("API KEY NOT FOUND")
    exit(1)

genai.configure(api_key=api_key)

try:
    with open('models.txt', 'w') as f:
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                f.write(m.name + '\n')
except Exception as e:
    print(f"Error querying models: {e}")
