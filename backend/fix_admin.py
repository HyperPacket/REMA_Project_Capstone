                                                                                       


from app.database import SessionLocal
from app.models.user import User

db = SessionLocal()
beforeat = input()
afterat = input()
email = beforeat + "@" + afterat
user = db.query(User).filter(User.email == email).first()

if not user:
    print(f"User {email} NOT FOUND.")
else:
    print(f"User found: {user.email}")
    print(f"Current is_admin status: {user.is_admin}")
    
    if not user.is_admin:
        print("Promoting user to admin...")
        user.is_admin = True
        db.commit()
        print("User promoted successfully.")
    else:
        print("User is already an admin.")
