from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.routers import todo_router
from src.models.todo import Base
from src.database import engine

# Create database tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI application
app = FastAPI(
    title="Todo API",
    description="FastAPI Python Todo Application API",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:4200",  # Angular
        "http://localhost:3000",  # Next.js
        "http://localhost:8080",  # General dev
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(todo_router)


@app.get("/", tags=["health"])
def health_check():
    """Health check endpoint."""
    return {"status": "ok", "message": "Todo API is running"}


@app.get("/health", tags=["health"])
def health():
    """Health check endpoint."""
    return {"status": "healthy"}
