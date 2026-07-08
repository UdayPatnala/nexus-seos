import os
import sys
import sqlite3
import uuid
from datetime import datetime

def get_db_connection():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Check multiple locations to be robust:
    # 1. apps/api/nexus-seos.db (actual Spring Boot location)
    # 2. apps/nexus-seos.db (literal path from e2e-tests/utils/../../nexus-seos.db)
    # 3. nexus-seos.db (root directory if running from there)
    
    paths_to_try = [
        os.path.abspath(os.path.join(script_dir, "../../api/nexus-seos.db")),
        os.path.abspath(os.path.join(script_dir, "../../nexus-seos.db")),
        os.path.abspath(os.path.join(script_dir, "../../../nexus-seos.db")),
        "nexus-seos.db"
    ]
    
    db_file = None
    for path in paths_to_try:
        if os.path.exists(path):
            db_file = path
            break
            
    if not db_file:
        # Default to the literal path relative to the script if none exist yet
        db_file = os.path.abspath(os.path.join(script_dir, "../../nexus-seos.db"))
        
    print(f"[DB-Manager] Using database path: {db_file}")
    
    # Ensure directory exists
    os.makedirs(os.path.dirname(db_file), exist_ok=True)
    return sqlite3.connect(db_file)

def seed():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Check if tables exist
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='courses'")
        if not cursor.fetchone():
            print("[DB-Manager] 'courses' table does not exist. Skipping seeding.")
            return

        course_uuid = uuid.UUID("a0e0a0e0-0000-0000-0000-000000000001")
        lesson_uuid = uuid.UUID("a0e0a0e0-0000-0000-0000-000000000002")
        concept1_uuid = uuid.UUID("a0e0a0e0-0000-0000-0000-000000000003")
        concept2_uuid = uuid.UUID("a0e0a0e0-0000-0000-0000-000000000004")
        quiz_uuid = uuid.UUID("a0e0a0e0-0000-0000-0000-000000000005")

        # Check if already seeded
        cursor.execute("SELECT id FROM courses WHERE id = ?", (course_uuid.bytes,))
        if cursor.fetchone():
            print("[DB-Manager] Database already seeded. Skipping.")
            return

        print("[DB-Manager] Seeding database with static UUIDs...")
        
        # Insert Course
        cursor.execute(
            "INSERT INTO courses (id, title, description, difficulty, created_at) VALUES (?, ?, ?, ?, ?)",
            (course_uuid.bytes, "Introduction to Software Engineering", "Learn the basics of software engineering, version control, and team collaboration.", "BEGINNER", datetime.now())
        )
        
        # Insert Lesson
        cursor.execute(
            "INSERT INTO lessons (id, course_id, title, order_no) VALUES (?, ?, ?, ?)",
            (lesson_uuid.bytes, course_uuid.bytes, "Git Version Control", 1)
        )
        
        # Insert Concept 1
        cursor.execute(
            "INSERT INTO concepts (id, lesson_id, title, content) VALUES (?, ?, ?, ?)",
            (concept1_uuid.bytes, lesson_uuid.bytes, "Repository Basics", "Learn git init, clone, add, commit, push.")
        )
        
        # Insert Concept 2
        cursor.execute(
            "INSERT INTO concepts (id, lesson_id, title, content) VALUES (?, ?, ?, ?)",
            (concept2_uuid.bytes, lesson_uuid.bytes, "Branching & Merging", "Learn git branch, checkout, merge, rebase.")
        )
        
        # Insert Quiz
        cursor.execute(
            "INSERT INTO quizzes (id, lesson_id, title) VALUES (?, ?, ?)",
            (quiz_uuid.bytes, lesson_uuid.bytes, "Git Basics Quiz")
        )
        
        conn.commit()
        print("[DB-Manager] Database seeded successfully.")
    except Exception as e:
        print(f"[DB-Manager] Error during seeding: {e}")
        conn.rollback()
    finally:
        conn.close()

def clean():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    tables_to_clean = ["users", "quiz_attempts", "notes", "projects", "executions", "profiles", "concept_completions"]
    
    try:
        print("[DB-Manager] Cleaning user data and attempts tables...")
        for table in tables_to_clean:
            # Check if table exists before clearing
            cursor.execute(f"SELECT name FROM sqlite_master WHERE type='table' AND name='{table}'")
            if cursor.fetchone():
                cursor.execute(f"DELETE FROM {table}")
                print(f"[DB-Manager] Cleared table: {table}")
        conn.commit()
        print("[DB-Manager] Database cleaned successfully.")
    except Exception as e:
        print(f"[DB-Manager] Error during cleaning: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python db-manager.py [seed|clean]")
        sys.exit(1)
        
    cmd = sys.argv[1].lower()
    if cmd == "seed":
        seed()
    elif cmd == "clean":
        clean()
    else:
        print(f"Unknown command: {cmd}")
        sys.exit(1)
