# backend/app/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from middleware.error_handler import validation_exception_handler, general_exception_handler
from fastapi.exceptions import RequestValidationError


from routes.chat import router as chat_router
from routes.dashboard import router as dashboard_router
from routes.help import router as help_router
from routes.rate_limit import router as rate_limit_router
from routes.upgrade import router as upgrade_router

load_dotenv()

app = FastAPI(
    title="AI Chatbot Backend",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(chat_router, prefix="/chat", tags=["Chat"])
app.include_router(dashboard_router, prefix="/dashboard", tags=["Dashboard"])
app.include_router(help_router, prefix="", tags=["Help"])
app.include_router(rate_limit_router, prefix="/rate-limit", tags=["Rate Limit"])
app.include_router(upgrade_router, prefix="/upgrade", tags=["Upgrade"])
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, general_exception_handler)

@app.get("/", tags=["Health"])
async def health_check():
    return {"status": "ok", "service": "AI Chatbot API"}





















# # backend/app/main.py

# import os
# from contextlib import asynccontextmanager
# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware
# from fastapi.exceptions import RequestValidationError
# from dotenv import load_dotenv

# from middleware.error_handler import validation_exception_handler, general_exception_handler
# from routes.chat import router as chat_router
# from routes.dashboard import router as dashboard_router
# from routes.help import router as help_router
# # from routes.upgrade import router as upgrade_router
# from routes.admin import router as admin_router

# load_dotenv()

# @asynccontextmanager
# async def lifespan(app: FastAPI):
#     # Startup
#     print("🚀 Starting AI Chatbot API...")
#     yield
#     # Shutdown
#     print("🛑 Shutting down AI Chatbot API...")

# app = FastAPI(
#     title="AI Chatbot Backend",
#     version="1.0.0",
#     description="Backend API for AI-powered chatbot application",
#     lifespan=lifespan
# )

# # CORS - Use environment variable for origins
# origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=origins,
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # Routes
# app.include_router(chat_router, prefix="/chat", tags=["Chat"])
# app.include_router(dashboard_router, prefix="/dashboard", tags=["Dashboard"])
# app.include_router(help_router, prefix="", tags=["Help"])
# app.include_router(upgrade_router, prefix="", tags=["Upgrade"])
# app.include_router(admin_router, prefix="", tags=["Admin"])

# # Exception handlers
# app.add_exception_handler(RequestValidationError, validation_exception_handler)
# app.add_exception_handler(Exception, general_exception_handler)

# @app.get("/", tags=["Health"])
# async def root():
#     return {
#         "status": "ok",
#         "service": "AI Chatbot API",
#         "version": "1.0.0"
#     }

# @app.get("/health", tags=["Health"])
# async def health_check():
#     return {
#         "status": "healthy",
#         "service": "AI Chatbot API",
#         "environment": os.getenv("ENVIRONMENT", "development")
#     }











