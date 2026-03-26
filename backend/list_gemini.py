import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

import google.generativeai as genai
from api.ai_engine import ai_engine

api_key = ai_engine._get_api_key()
with open("d:\\Abdulbosit\\mri.med-taxlil.uz\\backend\\output.txt", "w") as f:
    if not api_key:
        f.write("NO API KEY\n")
    else:
        genai.configure(api_key=api_key)
        f.write("AVAILABLE MODELS:\n")
        try:
            for m in genai.list_models():
                if 'generateContent' in m.supported_generation_methods:
                    f.write(m.name + "\n")
        except Exception as e:
            f.write(f"ERROR: {e}\n")
