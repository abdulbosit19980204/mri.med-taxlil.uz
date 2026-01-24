import os
import django
import google.generativeai as genai
import sys

# Setup Django environment
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from api.models import SystemSettings
from django.conf import settings

def get_api_key():
    try:
        settings_obj = SystemSettings.objects.first()
        if settings_obj and settings_obj.gemini_api_key:
            return settings_obj.gemini_api_key
        return getattr(settings, 'GEMINI_API_KEY', None)
    except Exception as e:
        print(f"Error getting key: {e}")
        return None

def list_models():
    api_key = get_api_key()
    if not api_key:
        print("No API Key found!")
        return

    print(f"Using API Key: {api_key[:5]}...{api_key[-5:]}")
    genai.configure(api_key=api_key)

    print("Listing available models...")
    try:
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                print(f"- {m.name}")
    except Exception as e:
        print(f"Error listing models: {e}")

if __name__ == "__main__":
    list_models()
