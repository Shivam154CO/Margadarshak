import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

class GenAIService:
    """
    Service to provide Generative AI insights for admission predictions.
    Aligned with JD: 'Improve engineering productivity using Generative AI'.
    """
    def __init__(self):
        api_key = os.getenv("GOOGLE_API_KEY")
        if api_key:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-pro')
            self.enabled = True
        else:
            self.enabled = False
            print("⚠️ GOOGLE_API_KEY not found. GenAI Service disabled.")

    def get_admission_strategy(self, profile, college_matches):
        """
        Generates a personalized admission strategy using LLM.
        """
        if not self.enabled:
            return "AI Consultant is currently offline. Please check back later."

        prompt = f"""
        User Profile:
        - Exam: {profile.get('exam_type')}
        - Score: {profile.get('score')}
        - Category: {profile.get('category')}
        - Preferred Branches: {profile.get('branches')}

        Top Predicted Matches:
        {college_matches[:3]}

        Task:
        Act as a professional Admission Consultant. Provide a 3-point strategy for this student:
        1. How to rank these top 3 matches in the CAP portal.
        2. One specific document they must ensure is ready for their category.
        3. A 'Safe' backup branch or city recommendation if these matches are 'Stretch'.
        
        Keep it concise and professional.
        """
        
        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            return f"Error generating strategy: {str(e)}"
