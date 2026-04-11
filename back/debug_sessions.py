import os
import sys

from sqlalchemy.orm import Session
from src.config.database import SessionLocal
from src.models.users import Profile
from src.services.sessions import list_sessions, session_to_dict

def debug():
    db = SessionLocal()
    # Récupérer un tuteur
    tutor = db.query(Profile).filter(Profile.role == "tutor").first()
    if not tutor:
        print("Aucun tuteur trouvé.")
        return
        
    print(f"Test pour le tuteur : {tutor.id} ({tutor.full_name})")
    
    try:
        sessions = list_sessions(db, tutor)
        print(f"{len(sessions)} sessions trouvées.")
        
        for s in sessions:
            d = session_to_dict(s, db)
            print("Session dump:", d["id"], d["status"])
            
    except Exception as e:
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    debug()
