from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
import uvicorn
import json # Essential for /market-match logic
from dotenv import load_dotenv
from pydantic import BaseModel
import database
from mirror_agent import MirrorAgent
from lab_agent import LabAgent
from foundry_agent import FoundryAgent
from market_agent import MarketAnalystAgent
from resume_agent import ResumeAgent
from datetime import datetime, timedelta

load_dotenv()
database.init_db()

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# Initialize Agents
mirror = MirrorAgent()
lab = LabAgent(mirror.client)
market = MarketAnalystAgent(mirror.client)
foundry = FoundryAgent(mirror.client)
resume_bot = ResumeAgent(mirror.client)

# --- Foundry API Models & Endpoints ---
class FoundryChatRequest(BaseModel):
    message: str
    code: str
    project_context: dict 

class FoundryValidateRequest(BaseModel):
    code: str
    phase_objective: str

@app.post("/foundry/chat")
async def foundry_chat(req: FoundryChatRequest):
    response = foundry.chat_architect(req.message, req.code, req.project_context)
    return {"response": response}

@app.post("/foundry/validate")
async def foundry_validate(req: FoundryValidateRequest):
    result = foundry.validate_code(req.code, req.phase_objective)
    return result

import base64

@app.post("/foundry/verify")
async def verify_output(file: UploadFile = File(...), phase_objective: str = Form(...)):
    try:
        contents = await file.read()
        # Convert to base64 data url
        encoded_image = base64.b64encode(contents).decode("utf-8")
        image_url = f"data:image/jpeg;base64,{encoded_image}"
        
        result = foundry.verify_screenshot(image_url, phase_objective)
        return result
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e), "approved": False})

@app.post("/analyze")
async def process_career_cycle(file: UploadFile = File(...), target_role: str = Form(...)):
    try:
        # Read the file content
        content = (await file.read()).decode('utf-8', errors='ignore')
        
        # 1. Mirror Agent call (Returns profile dictionary)
        profile_data = mirror.analyze_resume(content, target_role)
        
        # 2. Use the result to trigger the Lab Agent
        skill_gaps = profile_data.get("skill_gaps", [])
        projects = lab.generate_projects(skill_gaps)
        
        # 3. FIX: Match the function name and add 'stage' argument
        database.save_career_data(target_role, profile_data, projects, "Sprout")
        
        return {"profile": profile_data, "projects": projects}
    except Exception as e:
        print(f"Analysis Error: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})

class UpdateProjectsRequest(BaseModel):
    projects: list

@app.post("/update-generated-projects")
async def update_generated_projects(req: UpdateProjectsRequest):
    try:
        success = database.update_latest_profile_projects(req.projects)
        if success:
            return {"status": "updated"}
        return {"status": "no_profile_found"}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.get("/market-match")
async def get_market_matching():
    # Frontend calls this on refresh to restore the dashboard
    history = database.get_latest_profile()
    if not history:
        return {"error": "No profile found"}
    
    return {
        "profile": history['analysis'], 
        "projects": history['projects'], # database.py handles the json.loads
        "role": history['role'],
        "stage": history['growth_stage']
    }

# --- Persistent Chat API ---

class ChatRequest(BaseModel):
    message: str
    session_id: str

@app.get("/chat/sessions")
async def get_chat_sessions():
    return database.get_all_chat_sessions()

@app.post("/chat/new")
async def create_new_chat():
    session_id = f"chat_{int(time.time())}"
    database.create_chat_session(session_id, "New Chat")
    return {"session_id": session_id, "title": "New Chat"}

@app.get("/chat/history/{session_id}")
async def get_history_by_session(session_id: str):
    history = database.get_chat_history(session_id)
    return {"messages": history}

@app.post("/chat")
async def career_chat(req: ChatRequest):
    history = database.get_latest_profile()
    if not history:
        return {"response": "Please upload a resume first."}
        
    # Check if session exists, if not create (auto-recovery)
    if not database.get_chat_history(req.session_id) and len(database.get_chat_history(req.session_id)) == 0:
        database.create_chat_session(req.session_id, f"Chat about {req.message[:20]}...")

    # Load Past Context
    past_msgs = database.get_chat_history(req.session_id)
    chat_context = [{"role": m["role"], "content": m["content"]} for m in past_msgs]
    
    # Save User Msg
    database.save_chat_message(req.session_id, "user", req.message)
    
    context_system = (
        f"User is a {history['role']} with skills: {history['analysis'].get('current_skills', 'N/A')}. "
        "INSTRUCTIONS: Respond in max 3 short paragraphs. Use bullet points. Keep it neat. \n\n"
        "IMPORTANT PROJECT GENERATION RULES:\n"
        "1. ONLY generate a JSON block if the user EXPLICITLY asks to 'create', 'generate', 'give', 'change', or 'update' projects.\n"
        "2. Do NOT generate JSON for general questions like 'what are my skills' or 'explain python'.\n"
        "3. If the user asks for specific difficulty levels (e.g., 'give me medium projects'), ONLY generate projects for that level.\n"
        "4. If the user asks for projects by TOPIC but DOES NOT specify a level (e.g., 'give me python projects'), generate valid projects for ALL THREE LEVELS (3 Easy, 3 Medium, 3 Hard) to complete the set.\n"
        "5. Format: Append a single JSON block at the end: ```json { \"projects\": [ { \"id\": \"unique-id\", \"title\": \"Title\", \"description\": \"Desc\", \"tech\": [\"Tag\"], \"difficulty\": \"Easy/Medium/Hard\", \"icon\": \"code\", \"color\": \"from-blue-500 to-cyan-500\" } ] } ```. ensure 'id' and 'difficulty' are PRESENT."
    )
    
    try:
        # Build Messages
        messages = [{"role": "system", "content": context_system}] + chat_context + [{"role": "user", "content": req.message}]

        response = mirror.client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages
        )
        reply = response.choices[0].message.content
        
        # Save Bot Msg
        database.save_chat_message(req.session_id, "assistant", reply)
        
        # Auto-Rename if first message
        if len(past_msgs) == 0:
             # Simple rename logic (could use AI)
             new_title = req.message.split('\n')[0][:30]
             database.rename_chat_session(req.session_id, new_title)

        return {"response": reply}
    except Exception as e:
        return {"response": f"I'm having trouble thinking right now. ({str(e)})"}

@app.get("/history")
async def get_history():
    return database.get_all_profiles()

@app.get("/history/{profile_id}")
async def load_history_item(profile_id: int):
    data = database.get_profile_by_id(profile_id)
    if not data:
        return JSONResponse(status_code=404, content={"error": "Not found"})
    return data

@app.delete("/history/{profile_id}")
async def delete_history_item(profile_id: int):
    try:
        database.delete_profile(profile_id)
        return {"message": "Deleted successfully"}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})
    

# --- Resume Builder API ---

class ResumeBuildRequest(BaseModel):
    job_description: str

@app.post("/resume/build")
async def build_resume(req: ResumeBuildRequest):
    try:
        # Gather Context
        profile = database.get_latest_profile() or {}
        # Get projects user actually WORKED on (from 'My Lab')
        active_projects = database.get_all_active_projects() 
        
        result = resume_bot.generate_resume_content(profile, active_projects, req.job_description)
        return result
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

# --- New Endpoints for Frontend Alignment ---

@app.get("/live-feeds")
async def get_live_feeds():
    profile = database.get_latest_profile()
    if profile:
        skills = profile['analysis'].get('current_skills', [])
        return market.get_live_feeds(profile['role'], skills)
        
    # Fallback if no profile
    return market.get_live_feeds(None, None)

@app.get("/job-matches")
async def get_job_matches():
    profile = database.get_latest_profile()
    if not profile:
        return {"jobs": []}
    
    # Check Staleness (24h)
    should_refresh = True
    last_updated = profile.get('job_matches_updated_at')
    
    if last_updated:
        try:
            # Handle potential format variations
            if isinstance(last_updated, str):
                # SQLite often returns "YYYY-MM-DD HH:MM:SS"
                last_dt = datetime.fromisoformat(last_updated) if 'T' in last_updated else datetime.strptime(last_updated, "%Y-%m-%d %H:%M:%S")
            else:
                last_dt = last_updated # Already datetime object
                
            if datetime.now() - last_dt < timedelta(hours=24):
                should_refresh = False
        except Exception as e:
            print(f"Date parse error: {e}, forcing refresh")
            should_refresh = True
            
    # Return cached matches if valid and exist
    if not should_refresh and profile.get('job_matches') and len(profile['job_matches']) > 0:
        return {"jobs": profile['job_matches']}
        
    # Otherwise generate new ones (Daily Scrape)
    skills = profile['analysis'].get('current_skills', [])
    jobs = market.find_job_matches(profile['role'], skills)
    
    # Save to DB (updates timestamp)
    database.update_job_matches(profile['id'], jobs)
    
    return {"jobs": jobs}

# --- Active Projects API ---
import time


class StartProjectRequest(BaseModel):
    title: str
    tech_stack: str
    description: str

class UpdatePhaseRequest(BaseModel):
    project_id: str
    phase_id: int # The phase just completed

@app.post("/project/start")
async def start_project(req: StartProjectRequest):
    # Check if already active
    # Note: We now check global projects
    active_projects = database.get_all_active_projects()
    for p in active_projects:
        if p['title'] == req.title:
            return {"project": p, "status": "job_already_started"}
            
    # Generate Phases
    phases = mirror.generate_project_phases(req.title, req.tech_stack)
    
    new_project = {
        "id": f"proj_{int(time.time())}",
        "title": req.title,
        "tech_stack": req.tech_stack,
        "description": req.description,
        "current_phase": 1, 
        "total_phases": 6,
        "phases": phases, 
        "started_at": datetime.now().isoformat()
    }
    
    database.save_project_globally(new_project)
    
    return {"project": new_project, "status": "started"}

@app.get("/workspace")
async def get_workspace():
    projects = database.get_all_active_projects()
    return {"projects": projects}

@app.get("/project/{project_id}")
async def get_project(project_id: str):
    p = database.get_project_by_id(project_id)
    if p:
        return p
    
    raise HTTPException(status_code=404, detail="Project not found")

@app.post("/project/unlock-phase")
async def unlock_phase(req: UpdatePhaseRequest):
    # Simpler global update
    try:
        # Check current phase first to ensure we are incrementing correctly
        p = database.get_project_by_id(req.project_id)
        if not p:
            raise HTTPException(status_code=404)
            
        if p['current_phase'] == req.phase_id:
             database.update_phase_progress(req.project_id, req.phase_id + 1)
             return {"status": "updated"}
             
        return {"status": "no_change"}
    except Exception as e:
        print(f"Unlock Error: {e}")
        return {"status": "error"}

@app.delete("/project/{project_id}")
async def delete_project(project_id: str):
    try:
        database.delete_project(project_id)
        return {"status": "deleted"}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

# --- SESSION & COLLABORATION API ---
import random
import string

# In-memory session store (Code -> ProjectID)
# In production, use Redis or DB
SESSION_CODES = {}

class SessionRequest(BaseModel):
    project_id: str

class JoinSessionRequest(BaseModel):
    code: str

class SyncCodeRequest(BaseModel):
    project_id: str
    code: str

@app.post("/session/create")
async def create_session(req: SessionRequest):
    # Generate 6-digit code
    code = ''.join(random.choices(string.digits, k=6))
    SESSION_CODES[code] = req.project_id
    return {"code": code}

@app.post("/session/join")
async def join_session(req: JoinSessionRequest):
    project_id = SESSION_CODES.get(req.code)
    if not project_id:
        raise HTTPException(status_code=404, detail="Invalid Session Code")
    return {"project_id": project_id}

@app.post("/project/sync")
async def sync_code(req: SyncCodeRequest):
    database.update_project_code(req.project_id, req.code)
    return {"status": "synced"}

@app.get("/project/{project_id}/sync")
async def get_latest_code(project_id: str):
    p = database.get_project_by_id(project_id)
    if not p: return {"code": ""}
    return {"code": p.get('code', "")}


class LoginRequest(BaseModel):
    email: str
    password: str

@app.post("/login")
async def login(creds: LoginRequest):
    return {"token": "demo-token-123", "user": {"name": "Cadet X", "email": creds.email}}

@app.get("/growth-status")
async def get_growth_status():
    profile = database.get_latest_profile()
    if profile:
        stages = {"Seed": 15, "Sprout": 35, "Sapling": 55, "Young Tree": 75, "Mature Tree": 95}
        prog = stages.get(profile['growth_stage'], 15)
        return {"progress": prog, "stage": profile['growth_stage']}
    
    return {"progress": 15, "stage": "Seed"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)