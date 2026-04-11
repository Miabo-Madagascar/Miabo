import sys
import os

# Ajout du chemin pour permettre l'importation locale depuis la racine "back"
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.config.database import SessionLocal
from src.models.users import Profile
from sqlalchemy import text

def set_role(email: str, target_role: str):
    db = SessionLocal()
    try:
        user = db.query(Profile).filter(Profile.email == email).first()
        if user:
            # SQLAlchemy convertit automatiquement le string en l'Enum approprié
            # mais si ça échoue, on peut exécuter une requête SQL brute.
            db.execute(text("UPDATE profiles SET role = :role WHERE email = :email"), {"role": target_role, "email": email})
            db.commit()
            print(f"✅ Succès : Le rôle de {email} a été défini sur '{target_role}'.")
        else:
            print(f"❌ Erreur : Utilisateur avec l'email '{email}' introuvable. Veuillez d'abord le créer via l'interface d'inscription.")
    except Exception as e:
        print(f"Erreur technique : {e}")
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python set_role.py <email> <role>")
        print("Roles disponibles: student, tutor, parent, admin, canope, cosp")
        sys.exit(1)
    
    set_role(sys.argv[1], sys.argv[2])
