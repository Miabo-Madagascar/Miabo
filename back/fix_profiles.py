from src.config.database import SessionLocal
from src.models.users import Profile
from src.models.profiles import StudentProfile, TutorProfile
from src.models.enums import UserRole
import uuid

db = SessionLocal()
profiles = db.query(Profile).all()
fixed = 0
for p in profiles:
    if p.role == UserRole.student:
        sp = db.query(StudentProfile).filter_by(profile_id=p.id).first()
        if not sp:
            db.add(StudentProfile(id=uuid.uuid4(), profile_id=p.id, grade_level="6eme", subjects_needed=[]))
            fixed += 1
    elif p.role == UserRole.tutor:
        tp = db.query(TutorProfile).filter_by(profile_id=p.id).first()
        if not tp:
            db.add(TutorProfile(id=uuid.uuid4(), profile_id=p.id, hourly_rate=5000, subjects=[], grade_levels=[], teaching_methods=[]))
            fixed += 1

db.commit()
print(f"Fixed {fixed} profiles")
