from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from pydantic import BaseModel
import jwt
import datetime

# 1. SETUP FIRST
app = FastAPI()

# Allow React to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5500"], # added 5500 for live server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SECRET_KEY = "your_secret_key"
ALGORITHM = "HS256"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# 2. FAKE USERS DB
USERS = {
    "admin": {"password": "admin123", "role": "admin"},
    "hr": {"password": "hr123", "role": "hr"},
    "recruiter": {"password": "recruiter123", "role": "recruiter"},
}

# 3. MODELS
class Token(BaseModel):
    access_token: str
    token_type: str
    role: str

# 4. HELPER FUNCTION - THIS WAS MISSING
def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        role: str = payload.get("role")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return {"username": username, "role": role}
    except jwt.PyJWTError: # or jwt.InvalidTokenError
        raise HTTPException(status_code=401, detail="Invalid token")

# 5. ROUTES
@app.get("/")
def home():
    return {"message": "AI Resume API is running"}

@app.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = USERS.get(form_data.username)
    if not user or user["password"]!= form_data.password:
        raise HTTPException(status_code=400, detail="Wrong username or password")
    
    token = jwt.encode(
        {"sub": form_data.username, "role": user["role"], "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1)},
        SECRET_KEY, algorithm=ALGORITHM
    )
    return {"access_token": token, "token_type": "bearer", "role": user["role"]}

@app.get("/admin/users")
def get_users(user = Depends(get_current_user)):
    if user["role"]!= "admin":
        raise HTTPException(status_code=403, detail="Not allowed")
    
    # Return users without passwords
    safe_users = {k: v["role"] for k,v in USERS.items()}
    return {"users": safe_users}

def require_role(required_role: str):
    def role_checker(current_user: dict = Depends(get_current_user)):
        if current_user["role"] != required_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail="Not enough permissions"
            )
        return current_user
    return role_checker

@app.delete("/admin/users/{username}")
def delete_user(username: str, admin_user: dict = Depends(require_role("admin"))):
    if username not in USERS_DB:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    if username == admin_user["username"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You cannot delete yourself")

    del USERS_DB[username]
    return {"message": f"User {username} deleted successfully"}