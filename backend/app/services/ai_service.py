from google import genai
import os
import asyncio

class AIService:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
        self.client = None
        self.model = "gemini-2.0-flash-exp" # default model, can be changed
        
        if self.api_key:
            try:
                self.client = genai.Client(api_key=self.api_key)
            except Exception as e:
                print(f"Failed to initialize Gemini Client: {e}")

    def generate_response(self, message: str) -> str:
        """
        Generates a response using Google Gen AI SDK.
        """
        if not self.client:
            # Try re-initializing if key was added later (e.g. via .env reload)
            self.api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
            if self.api_key:
                try:
                    self.client = genai.Client(api_key=self.api_key)
                except:
                    pass
            
            if not self.client:
                return "I am ready to help! Please set the `GEMINI_API_KEY` or `GOOGLE_API_KEY` environment variable in your backend to enable my intelligence."

        try:
            # Generate response
            response = self.client.models.generate_content(
                model=self.model,
                contents=message
            )
            return response.text
        except Exception as e:
            print(f"Gemini API Error: {e}")
            return "I'm having trouble connecting to my brain right now. Please try again later."

# Singleton instance
ai_service = AIService()
