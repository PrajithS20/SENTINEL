import os
import json
from openai import OpenAI

class MirrorAgent:
    def __init__(self):
        self.api_key = os.getenv("GROK_API_KEY")
        # Initialize OpenAI client for Groq Cloud
        self.client = OpenAI(
            api_key=self.api_key,
            base_url="https://api.groq.com/openai/v1"
        )
        self.model_id = "llama-3.3-70b-versatile"

    def analyze_resume(self, text, target_role):
        prompt = f"""
        Analyze this resume for a {target_role} role. 
        Context: User has a Robotics background.
        Return a JSON object with: 
        1. 'personal_details': {{ "name": "...", "email": "...", "phone": "..." }}
        2. 'education': [ {{ "degree": "...", "university": "...", "year": "..." }} ]
        3. 'experience': [ {{ "role": "...", "company": "...", "duration": "...", "description": "..." }} ]
        4. 'current_skills' (list)
        5. 'skill_gaps' (list)
        6. 'growth_stage' (string: Seed, Sprout, or Sapling)
        
        Resume: {text}
        
        Return ONLY valid JSON.
        """
        
        try:
            response = self.client.chat.completions.create(
                model=self.model_id,
                messages=[
                    {"role": "system", "content": "You are an expert career coach and resume analyzer. Return JSON only."},
                    {"role": "user", "content": prompt}
                ]
            )
            
            # Scrubbing and parsing
            content = response.choices[0].message.content
            raw_data = content.strip().replace("```json", "").replace("```", "")
            return json.loads(raw_data)
        except Exception as e:
            print(f"Error analyzing resume: {e}")
            # Fallback Profile
            return {
                "personal_details": {"name": "Cadet X", "email": "cadet@sentinel.ai"},
                "education": [],
                "experience": [],
                "current_skills": ["Python", "JavaScript", "Problem Solving"],
                "skill_gaps": ["Cloud Architecture", "System Design"],
                "growth_stage": "Sprout"
            }
        
    def generate_project_phases(self, project_title, tech_stack):
        prompt = f"""
        Project: "{project_title}" using {tech_stack}.
        Break this project down into exactly 6 distinct, progressive phases.
        For each phase, provide:
        1. "id": phase index (1-6)
        2. "title": A clear, professional phase name (e.g. "Backend Setup", "Core Features").
        3. "description": A brief 1-sentence overview.
        4. "tasks": A list of 3-5 specific, actionable bullet points (strings) to complete this phase.
        
        Return a JSON list of objects.
        """
        
        try:
            response = self.client.chat.completions.create(
                model=self.model_id,
                messages=[
                    {"role": "system", "content": "You are a technical project manager. Return JSON only."},
                    {"role": "user", "content": prompt}
                ]
            )
            # Scrubbing and parsing
            content = response.choices[0].message.content
            text = content.strip().replace("```json", "").replace("```", "")
            return json.loads(text)
        except Exception as e:
            print(f"Error generating phases: {e}")
            # Fallback
            return [
                {"id": 1, "title": "Setup & Init", "description": "Initialize project structure", "tasks": ["Install dependencies", "Setup Git", "Hello World"]},
                {"id": 2, "title": "Core Logic", "description": "Implement main features", "tasks": ["Build API", "Create Components", "Connect DB"]},
                {"id": 3, "title": "UI/UX Polish", "description": "Style the application", "tasks": ["Add animations", "Responsive design", "Theme setup"]},
                {"id": 4, "title": "Integration", "description": "Connect fontend and backend", "tasks": ["Fetch API", "State Management", "Error Handling"]},
                {"id": 5, "title": "Testing", "description": "Ensure quality", "tasks": ["Unit Tests", "Integration Tests", "Bug Fixes"]},
                {"id": 6, "title": "Deployment", "description": "Ship to production", "tasks": ["Build optimization", "Deploy to Vercel/Render", "Documentation"]}
            ]