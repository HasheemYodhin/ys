import google.generativeai as genai
import os
import asyncio

class AIService:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
        self.model = None
        
        if self.api_key:
            try:
                genai.configure(api_key=self.api_key)
                self.model = genai.GenerativeModel('gemini-pro')
            except Exception as e:
                print(f"Failed to initialize Gemini: {e}")

    def generate_response(self, message: str) -> str:
        """
        Generates a response using Google Gemini API.
        """
        if not self.model:
            # Try re-initializing if key was added later (e.g. via .env reload)
            self.api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
            if self.api_key:
                try:
                    genai.configure(api_key=self.api_key)
                    self.model = genai.GenerativeModel('gemini-pro')
                except:
                    pass
            
            if not self.model:
                return "I am ready to help! Please set the `GEMINI_API_KEY` or `GOOGLE_API_KEY` environment variable in your backend to enable my intelligence."

        try:
            # Generate response
            response = self.model.generate_content(message)
            return response.text
        except Exception as e:
            print(f"Gemini API Error: {e}")
            return "I'm having trouble connecting to my brain right now. Please try again later."

# Singleton instance
ai_service = AIService()
