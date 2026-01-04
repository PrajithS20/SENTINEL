import sqlite3
import json
import os

DB_PATH = 'career_sapling.db'

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS profiles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            role TEXT,
            analysis_json TEXT,
            projects_json TEXT,
            job_matches_json TEXT,
            active_projects_json TEXT, -- New column for active projects
            current_phase INTEGER DEFAULT 0,
            growth_stage TEXT DEFAULT 'Seed',
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Simple migration checks
    try:
        cursor.execute("ALTER TABLE profiles ADD COLUMN job_matches_json TEXT")
    except sqlite3.OperationalError:
        pass 

    try:
        cursor.execute("ALTER TABLE profiles ADD COLUMN active_projects_json TEXT")
    except sqlite3.OperationalError:
        pass
        
    # NEW: Global Projects Table for persistence
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS projects (
            id TEXT PRIMARY KEY,
            title TEXT,
            data_json TEXT,
            code_content TEXT, -- New column for sync
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''') 
    
    # Migration for code_content
    try:
        cursor.execute("ALTER TABLE projects ADD COLUMN code_content TEXT")
    except sqlite3.OperationalError:
        pass
        
    # NEW: Chat History Tables
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS chat_sessions (
            id TEXT PRIMARY KEY,
            title TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''') 
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS chat_messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT,
            role TEXT,
            content TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE
        )
    ''')

    conn.commit()
    conn.close()

def create_chat_session(session_id, title="New Chat"):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('INSERT OR IGNORE INTO chat_sessions (id, title) VALUES (?, ?)', (session_id, title))
    conn.commit()
    conn.close()

def save_chat_message(session_id, role, content):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('INSERT INTO chat_messages (session_id, role, content) VALUES (?, ?, ?)', (session_id, role, content))
    conn.commit()
    conn.close()

def get_chat_history(session_id):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute('SELECT role, content FROM chat_messages WHERE session_id = ? ORDER BY id ASC', (session_id,))
    rows = cursor.fetchall()
    conn.close()
    return [{"role": r["role"], "content": r["content"]} for r in rows]

def get_all_chat_sessions():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM chat_sessions ORDER BY created_at DESC')
    rows = cursor.fetchall()
    conn.close()
    return [{"id": r["id"], "title": r["title"], "created_at": r["created_at"]} for r in rows]

def rename_chat_session(session_id, new_title):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('UPDATE chat_sessions SET title = ? WHERE id = ?', (new_title, session_id))
    conn.commit()
    conn.close()

def update_phase_progress(project_id, phase_index):
    """Updates progress for a specific project in the global table."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # Get current project data
    cursor.execute('SELECT data_json FROM projects WHERE id = ?', (project_id,))
    row = cursor.fetchone()
    
    if row:
        project_data = json.loads(row['data_json'])
        project_data['current_phase'] = phase_index
        
        cursor.execute('UPDATE projects SET data_json = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', 
                      (json.dumps(project_data), project_id))
        conn.commit()
        
    conn.close()

def update_project_code(project_id, code):
    """Syncs the latest code content to the database."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('UPDATE projects SET code_content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', (code, project_id))
    conn.commit()
    conn.close()

def update_job_matches(profile_id, job_matches):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('UPDATE profiles SET job_matches_json = ? WHERE id = ?', (json.dumps(job_matches), profile_id))
    conn.commit()
    conn.close()

def save_active_projects(profile_id, active_projects):
    """
    Deprecated: Used to save to profile. 
    Now acts as a migrator or alias to save_project_globally if needed, 
    but mainly we use save_project_globally.
    """
    pass

def save_project_globally(project_data):
    """Saves or updates a project in the global projects table."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    project_id = project_data['id']
    title = project_data['title']
    
    # Check if exists
    cursor.execute('SELECT id FROM projects WHERE id = ?', (project_id,))
    exists = cursor.fetchone()
    
    if exists:
        cursor.execute('UPDATE projects SET data_json = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                      (json.dumps(project_data), project_id))
    else:
        cursor.execute('INSERT INTO projects (id, title, data_json) VALUES (?, ?, ?)',
                      (project_id, title, json.dumps(project_data)))
                      
    conn.commit()
    conn.close()

def get_all_active_projects():
    """Retrieves all projects from the global table."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute('SELECT data_json FROM projects ORDER BY updated_at DESC')
    rows = cursor.fetchall()
    conn.close()
    
    return [json.loads(row['data_json']) for row in rows]

def get_project_by_id(project_id):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute('SELECT data_json, code_content FROM projects WHERE id = ?', (project_id,))
    row = cursor.fetchone()
    conn.close()
    
    if row:
        data = json.loads(row['data_json'])
        # Inject code_content if exists and not in json
        if 'code_content' in row.keys() and row['code_content']:
             data['code'] = row['code_content']
        return data
    return None

def save_career_data(role, analysis, projects, stage):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Convert Pydantic objects to dicts
    projects_list = [p.model_dump() if hasattr(p, 'model_dump') else p for p in projects]
    analysis_dict = analysis.model_dump() if hasattr(analysis, 'model_dump') else analysis
    
    cursor.execute('''
        INSERT INTO profiles (role, analysis_json, projects_json, growth_stage)
        VALUES (?, ?, ?, ?)
    ''', (role, json.dumps(analysis_dict), json.dumps(projects_list), stage))
    conn.commit()
    conn.close()

def get_latest_profile():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM profiles ORDER BY timestamp DESC LIMIT 1')
    row = cursor.fetchone()
    conn.close()
    
    if row:
        job_matches = []
        if row["job_matches_json"]:
            job_matches = json.loads(row["job_matches_json"])
            
        # For active_projects, we now prefer the global table, 
        # but we return empty here to avoid confusion or legacy data.
        active_projects = [] 
            
        return {
            "id": row["id"],
            "role": row["role"],
            "analysis": json.loads(row["analysis_json"]),
            "projects": json.loads(row["projects_json"]),
            "job_matches": job_matches,
            "active_projects": active_projects,
            "growth_stage": row["growth_stage"]
        }
    return None

def get_all_profiles():
    """Retrieves all past uploads for the history sidebar."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    # Fetch all records, newest first
    cursor.execute('SELECT id, role, timestamp FROM profiles ORDER BY timestamp DESC')
    rows = cursor.fetchall()
    conn.close()
    
    return [{"id": r["id"], "role": r["role"], "date": r["timestamp"]} for r in rows]

def get_profile_by_id(profile_id):
    """Retrieves a specific profile when clicked in the sidebar."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM profiles WHERE id = ?', (profile_id,))
    row = cursor.fetchone()
    conn.close()
    
    if row:
        job_matches = []
        if row["job_matches_json"]:
            job_matches = json.loads(row["job_matches_json"])
            
        active_projects = []

        return {
            "role": row["role"],
            "analysis": json.loads(row["analysis_json"]),
            "projects": json.loads(row["projects_json"]),
            "job_matches": job_matches,
            "active_projects": active_projects,
            "growth_stage": row["growth_stage"]
        }
    return None

def delete_profile(profile_id):
    """Permanently removes a profile session from the database."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('DELETE FROM profiles WHERE id = ?', (profile_id,))
    conn.commit() # Save the deletion to disk
    conn.close()
    return True

def delete_project(project_id):
    """Deletes a project from the global projects table."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('DELETE FROM projects WHERE id = ?', (project_id,))
    conn.commit()
    conn.close()
    return True

def update_latest_profile_projects(projects):
    """Updates the projects_json for the most recent profile."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Get latest ID
    cursor.execute('SELECT id FROM profiles ORDER BY timestamp DESC LIMIT 1')
    row = cursor.fetchone()
    
    if row:
        profile_id = row[0]
        # Convert Pydantic objects if needed, or raw dicts
        projects_list = [p if isinstance(p, dict) else p.model_dump() for p in projects]
        
        cursor.execute('UPDATE profiles SET projects_json = ? WHERE id = ?', 
                      (json.dumps(projects_list), profile_id))
        conn.commit()
        conn.close()
        return True
    
    conn.close()
    return False
