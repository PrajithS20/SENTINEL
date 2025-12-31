from typing import List
import json
from models import ProjectList 

class LabAgent:
    def __init__(self, openai_client):
        self.client = openai_client
        self.model_id = "llama-3.3-70b-versatile"

    def generate_projects(self, skill_gaps: List[str]):
        prompt = f"""
        Act as a Tech Lead and Mentor. 
        The user has the following technical skill gaps: {skill_gaps}.
        
        Generate exactly 3 professional, portfolio-ready projects that 
        will help the user bridge these specific gaps. 
        
        For each project, provide:
        - A unique 'id' (kebab-case string)
        - 'title': Project Name
        - 'description': Brief description
        - 'tech' list (e.g. ["React", "Python"])
        - 'icon' (Choose from: "globe", "code", "database", "smartphone", "cpu", "lightbulb")
        - 'color' (Tailwind gradient classes, e.g., "from-blue-500 to-cyan-600")
        - 'difficulty': "Beginner", "Intermediate", or "Advanced"
        
        Return the result as ONLY a JSON object with a key "projects" containing the list.
        Example: {{ "projects": [ ... ] }}
        """

        try:
            response = self.client.chat.completions.create(
                model=self.model_id,
                messages=[
                    {"role": "system", "content": "You are a helpful coding mentor. Return JSON only."},
                    {"role": "user", "content": prompt}
                ]
            )
            
            content = response.choices[0].message.content
            # Scrub markdown
            raw_data = content.strip().replace("```json", "").replace("```", "")
            data = json.loads(raw_data)
            return data.get("projects", [])
            
        except Exception as e:
            print(f"❌ Lab Agent Error: {e}")
            return []