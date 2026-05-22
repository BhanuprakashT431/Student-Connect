import os
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from .database import engine, Base, get_db
from . import models, schemas, auth

# Initialize database tables on startup.
# In a full production setting, Alembic migrations are preferred.
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Career Guidance Portal API")

# Configure CORS Middleware to allow requests from the React frontend.
# Useful for Vercel deployments and local Vite server.
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
]

# Add production domains dynamically if running on Vercel
vercel_url = os.getenv("VERCEL_URL")
if vercel_url:
    origins.append(f"https://{vercel_url}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==========================================
# AUTHENTICATION ROUTING
# ==========================================

@app.post("/api/auth/register", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: schemas.UserRegister, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = db.query(models.User).filter(models.User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email is already registered"
        )
    
    # Hash password and create database user model
    hashed_password = auth.get_password_hash(user_in.password)
    
    # Initialize standard default values in profile data to avoid Null errors on frontend
    p_data = user_in.profile_data or {}
    p_data.setdefault("title", "")
    p_data.setdefault("company", "")
    p_data.setdefault("bio", "")
    p_data.setdefault("linkedin_url", "")
    p_data.setdefault("contact_email", "")

    db_user = models.User(
        email=user_in.email,
        password_hash=hashed_password,
        role=user_in.role,
        full_name=user_in.full_name,
        profile_data=p_data
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@app.post("/api/auth/login")
def login(login_in: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == login_in.email).first()
    if not user or not auth.verify_password(login_in.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Generate access token containing user metadata
    access_token = auth.create_access_token(
        data={"email": user.email, "role": user.role}
    )
    
    # Return user details alongside token to streamline login flow on frontend
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "role": user.role,
            "full_name": user.full_name,
            "profile_data": user.profile_data
        }
    }


# Local route helper for FastAPI OAuth2 login flow representation
@app.post("/api/auth/login-form-dummy", include_in_schema=False)
def login_form_dummy(form_data: Any = Depends(Depends), db: Session = Depends(get_db)):
    # OAuth2PasswordBearer sends credentials in form data form.
    # Included just to make OpenAPI interactive docs (/docs) functional.
    pass


@app.get("/api/auth/me", response_model=schemas.UserResponse)
def get_current_user_details(current_user: models.User = Depends(auth.get_current_user)):
    return current_user


# ==========================================
# OPPORTUNITIES ROUTING
# ==========================================

@app.get("/api/opportunities", response_model=List[schemas.OpportunityResponse])
def get_opportunities(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    # Fetch all job/internship posts
    opportunities = db.query(models.Opportunity).all()
    return opportunities


@app.post("/api/opportunities", response_model=schemas.OpportunityResponse, status_code=status.HTTP_201_CREATED)
def create_opportunity(
    opp_in: schemas.OpportunityCreate, 
    db: Session = Depends(get_db), 
    employee: models.User = Depends(auth.get_current_employee)
):
    db_opp = models.Opportunity(
        title=opp_in.title,
        company=opp_in.company,
        description=opp_in.description,
        type=opp_in.type,
        posted_by=employee.id
    )
    db.add(db_opp)
    db.commit()
    db.refresh(db_opp)
    return db_opp


# ==========================================
# EMPLOYEE DIRECTORY ROUTING (WITH INFO REVEAL)
# ==========================================

@app.get("/api/employees")
def get_employee_directory(
    db: Session = Depends(get_db),
    student: models.User = Depends(auth.get_current_student)
):
    # Fetch all employees
    employees = db.query(models.User).filter(models.User.role == "employee").all()
    
    # Fetch all connection requests sent by this student
    requests = db.query(models.ConnectionRequest).filter(
        models.ConnectionRequest.student_id == student.id
    ).all()
    
    # Map connection requests: employee_id -> request object
    request_map = {req.employee_id: req for req in requests}
    
    result = []
    for emp in employees:
        req = request_map.get(emp.id)
        status_str = req.status if req else "none"
        request_id = req.id if req else None
        
        # Build masked/revealed profile data based on connection status
        # SECURE INFORMATION REVEAL LOGIC
        profile_display = {
            "title": emp.profile_data.get("title", ""),
            "company": emp.profile_data.get("company", ""),
            "bio": emp.profile_data.get("bio", ""),
        }
        
        if status_str == "accepted":
            # Reveal sensitive details
            profile_display["linkedin_url"] = emp.profile_data.get("linkedin_url", "")
            profile_display["contact_email"] = emp.profile_data.get("contact_email", emp.email)
        else:
            # Hide sensitive details
            profile_display["linkedin_url"] = None
            profile_display["contact_email"] = None

        result.append({
            "id": emp.id,
            "full_name": emp.full_name,
            "role": emp.role,
            "profile_data": profile_display,
            "connection_status": status_str,
            "connection_request_id": request_id
        })
        
    return result


# ==========================================
# CONNECTIONS ROUTING
# ==========================================

@app.post("/api/connections", response_model=schemas.ConnectionRequestResponse, status_code=status.HTTP_201_CREATED)
def create_connection_request(
    request_in: schemas.ConnectionRequestCreate,
    db: Session = Depends(get_db),
    student: models.User = Depends(auth.get_current_student)
):
    # Ensure target user exists and is actually an employee
    target_employee = db.query(models.User).filter(
        models.User.id == request_in.employee_id, 
        models.User.role == "employee"
    ).first()
    
    if not target_employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Target employee not found"
        )
        
    # Prevent requesting connections to yourself
    if student.id == target_employee.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot establish a connection with yourself"
        )
        
    # Check if request already exists
    existing_request = db.query(models.ConnectionRequest).filter(
        models.ConnectionRequest.student_id == student.id,
        models.ConnectionRequest.employee_id == target_employee.id
    ).first()
    
    if existing_request:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"A connection request has already been sent to this employee (Status: {existing_request.status})"
        )
        
    # Enforce pitch length constraint (redundant backend validation)
    if len(request_in.pitch) > 300:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Connection pitch cannot exceed 300 characters"
        )

    db_request = models.ConnectionRequest(
        student_id=student.id,
        employee_id=target_employee.id,
        status="pending",
        pitch=request_in.pitch
    )
    db.add(db_request)
    db.commit()
    db.refresh(db_request)
    return db_request


@app.get("/api/connections/pending", response_model=List[schemas.ConnectionRequestResponse])
def get_pending_connections(
    db: Session = Depends(get_db),
    employee: models.User = Depends(auth.get_current_employee)
):
    # Fetch requests sent to this employee that are pending review
    requests = db.query(models.ConnectionRequest).filter(
        models.ConnectionRequest.employee_id == employee.id,
        models.ConnectionRequest.status == "pending"
    ).all()
    return requests


@app.get("/api/connections/my-requests")
def get_student_sent_connections(
    db: Session = Depends(get_db),
    student: models.User = Depends(auth.get_current_student)
):
    # Fetch all connection requests sent by this student
    requests = db.query(models.ConnectionRequest).filter(
        models.ConnectionRequest.student_id == student.id
    ).all()
    
    result = []
    for req in requests:
        emp = req.employee
        # If accepted, reveal contact info
        profile_display = {
            "title": emp.profile_data.get("title", ""),
            "company": emp.profile_data.get("company", ""),
            "bio": emp.profile_data.get("bio", ""),
        }
        
        if req.status == "accepted":
            profile_display["linkedin_url"] = emp.profile_data.get("linkedin_url", "")
            profile_display["contact_email"] = emp.profile_data.get("contact_email", emp.email)
        else:
            profile_display["linkedin_url"] = None
            profile_display["contact_email"] = None
            
        result.append({
            "id": req.id,
            "status": req.status,
            "pitch": req.pitch,
            "created_at": req.created_at,
            "employee": {
                "id": emp.id,
                "full_name": emp.full_name,
                "profile_data": profile_display
            }
        })
        
    return result


@app.patch("/api/connections/{id}")
def update_connection_status(
    id: int,
    status_update: schemas.ConnectionRequestUpdate,
    db: Session = Depends(get_db),
    employee: models.User = Depends(auth.get_current_employee)
):
    # Retrieve request
    conn_req = db.query(models.ConnectionRequest).filter(models.ConnectionRequest.id == id).first()
    if not conn_req:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Connection request not found"
        )
        
    # Enforce ownership: only the targeted employee can accept or decline
    if conn_req.employee_id != employee.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to update this connection request"
        )
        
    conn_req.status = status_update.status
    db.commit()
    db.refresh(conn_req)
    
    return {
        "id": conn_req.id,
        "status": conn_req.status,
        "detail": f"Connection request successfully {status_update.status}"
    }


# ==========================================
# APP INITIATION METRIC (FOR HEALTH CHECKS)
# ==========================================

@app.get("/")
def health_check():
    return {
        "status": "online",
        "service": "Career Guidance Portal Backend MVP",
        "database": str(engine.url).split(":")[0]  # Return DB flavor (sqlite/postgres) safely
    }
