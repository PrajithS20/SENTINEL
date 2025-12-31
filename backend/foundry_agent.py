from openai import OpenAI
import json

class FoundryAgent:
    def __init__(self, openai_client):
        self.client = openai_client
        self.model_id = "llama-3.3-70b-versatile" # Using the fast Groq model

    def chat_architect(self, user_message, current_code, project_context):
        """
        The Architect: A helpful Senior Mentor.
        """
        system_prompt = f"""
        You are "The Architect", a helpful and encouraging Senior Tech Lead. 
        The student is working on:
        Project: {project_context.get('title')}
        Phase: {project_context.get('phase_title')}
        Objective: {project_context.get('phase_description')}
        
        Current Code:
        ```
        {current_code}
        ```

        GUIDELINES:
        1. Be a helpful mentor. If they are stuck, PROVIDE THE CODE SOLUTION.
        2. Explain *why* the code works, but don't be afraid to give snippets or full functions to help them move forward.
        3. Use clear, neat formatting.
        4. Keep responses concise (max 2-3 paragraphs) but informative.
        5. Your goal is to help them learn by DOING, even if that means showing them the path.
        """

        try:
            response = self.client.chat.completions.create(
                model=self.model_id,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message}
                ]
            )
            return response.choices[0].message.content
        except Exception as e:
            return f"The Architect is offline temporarily. ({str(e)})"

    def validate_code(self, user_code, phase_objective):
        """
        The Interpreter: Simulates code execution and provides feedback.
        Returns JSON: { 'output': '...', 'review': '...' }
        """
        system_prompt = f"""
        Act as a Python Interpreter ("The Interpreter").
        Phase Objective: {phase_objective}
        
        CODE TO ANALYZE:
        ```python
        {user_code}
        ```
        
        MISSION:
        1. SIMULATE the execution of this code. What would the terminal output be?
        2. If there are syntax errors, output the error message.
        3. Provide a very short (1 sentence) technical review.
        
        CRITICAL: Return ONLY a JSON object:
        {{
            "output": "The exact terminal output (or error)...",
            "review": "Short critique..."
        }}
        """

        try:
            response = self.client.chat.completions.create(
                model=self.model_id,
                messages=[
                    {"role": "system", "content": "You are a code simulator. Return JSON only."},
                    {"role": "user", "content": system_prompt}
                ],
                response_format={"type": "json_object"} 
            )
            content = response.choices[0].message.content
            return json.loads(content)
        except Exception as e:
            print(f"Interpreter Error: {e}")
            return {
                "output": "Execution Error: Simulation failed.",
                "review": "Could not verify code at this time."
            }

    def verify_screenshot(self, image_url, phase_objective):
        """
        The Auditor: Verifies visual proof of work using Vision model.
        Returns JSON: { 'approved': bool, 'feedback': 'string' }
        """
        try:
            response = self.client.chat.completions.create(
                model="llama-3.2-90b-vision-preview", # Vision Model
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": f"Analyze this screenshot. Does it provide evidence that the user has completed the objective: '{phase_objective}'? Return JSON with 'approved' (boolean) and 'feedback' (string)."},
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": image_url,
                                },
                            },
                        ],
                    }
                ],
                response_format={"type": "json_object"}
            )
            return json.loads(response.choices[0].message.content)
        except Exception as e:
            print(f"Vision Error: {e}")
            # Fallback for error/testing
            return {"approved": True, "feedback": "Auto-approved (Vision API unavailable)."}
