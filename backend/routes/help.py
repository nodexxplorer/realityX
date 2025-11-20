# backend/routes/help.py

from fastapi import APIRouter, Depends, HTTPException, Query
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel
from middleware.auth import verify_supabase_token

router = APIRouter()

# Models
class HelpRequestCreate(BaseModel):
    type: str  # 'help', 'suggestion', 'bug', 'feedback'
    subject: str
    message: str

class HelpRequestUpdate(BaseModel):
    response: Optional[str] = None
    status: Optional[str] = None  # 'open', 'in-progress', 'resolved', 'closed'

class HelpRequest(BaseModel):
    id: str
    userId: str
    type: str
    subject: str
    message: str
    response: Optional[str] = None
    status: str
    createdAt: datetime
    updatedAt: datetime

class HelpRequestPaginated(BaseModel):
    data: List[HelpRequest]
    total: int
    page: int
    limit: int

# Mock storage (replace with database queries)
help_requests_store = {}
request_id_counter = 1

@router.post("/help-requests")
async def submit_help_request(
    request: HelpRequestCreate,
    user_id: str = Depends(verify_supabase_token)
):
    """Submit a help/suggestion/bug report/feedback request"""
    global request_id_counter
    
    try:
        request_id = str(request_id_counter)
        request_id_counter += 1
        
        help_request = {
            "id": request_id,
            "userId": user_id,
            "type": request.type,
            "subject": request.subject,
            "message": request.message,
            "response": None,
            "status": "open",
            "createdAt": datetime.utcnow().isoformat(),
            "updatedAt": datetime.utcnow().isoformat(),
        }
        
        help_requests_store[request_id] = help_request
        
        print(f"✅ Help request {request_id} submitted by {user_id}")
        return help_request
    except Exception as e:
        print(f"❌ Error submitting help request: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/user/help-requests", response_model=HelpRequestPaginated)
async def get_user_help_requests(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    user_id: str = Depends(verify_supabase_token)
):
    """Get user's own help requests"""
    try:
        # Filter requests for current user
        user_requests = [
            req for req in help_requests_store.values()
            if req["userId"] == user_id
        ]
        
        # Pagination
        start = (page - 1) * limit
        end = start + limit
        paginated = user_requests[start:end]
        
        print(f"📋 Found {len(user_requests)} help requests for user {user_id}, returning page {page}")
        
        return HelpRequestPaginated(
            data=paginated,
            total=len(user_requests),
            page=page,
            limit=limit
        )
    except Exception as e:
        print(f"❌ Error fetching user help requests: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/admin/help-requests", response_model=HelpRequestPaginated)
async def get_all_help_requests(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    type: Optional[str] = None,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    search: Optional[str] = None,
    user_id: str = Depends(verify_supabase_token)
):
    """Get all help requests (admin only)"""
    try:
        # TODO: Check if user is admin
        requests = list(help_requests_store.values())
        
        # Filter
        if type:
            requests = [r for r in requests if r["type"] == type]
        if status:
            requests = [r for r in requests if r["status"] == status]
        if search:
            search_lower = search.lower()
            requests = [
                r for r in requests
                if search_lower in r["subject"].lower() or search_lower in r["message"].lower()
            ]
        
        # Pagination
        start = (page - 1) * limit
        end = start + limit
        paginated = requests[start:end]
        
        print(f"📋 Admin fetched {len(requests)} help requests, returning page {page}")
        
        return HelpRequestPaginated(
            data=paginated,
            total=len(requests),
            page=page,
            limit=limit
        )
    except Exception as e:
        print(f"❌ Error fetching admin help requests: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/admin/help-requests/{request_id}")
async def get_help_request_by_id(
    request_id: str,
    user_id: str = Depends(verify_supabase_token)
):
    """Get a specific help request"""
    try:
        if request_id not in help_requests_store:
            raise HTTPException(status_code=404, detail="Help request not found")
        
        return help_requests_store[request_id]
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error fetching help request: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/admin/help-requests/{request_id}")
async def respond_to_help_request(
    request_id: str,
    update: HelpRequestUpdate,
    user_id: str = Depends(verify_supabase_token)
):
    """Admin: Respond to a help request"""
    try:
        if request_id not in help_requests_store:
            raise HTTPException(status_code=404, detail="Help request not found")
        
        req = help_requests_store[request_id]
        
        if update.response:
            req["response"] = update.response
        if update.status:
            req["status"] = update.status
        
        req["updatedAt"] = datetime.utcnow().isoformat()
        
        print(f"✅ Help request {request_id} updated")
        return req
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error updating help request: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/admin/help-requests/{request_id}")
async def patch_help_request(
    request_id: str,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    user_id: str = Depends(verify_supabase_token)
):
    """Admin: Patch status or priority"""
    try:
        if request_id not in help_requests_store:
            raise HTTPException(status_code=404, detail="Help request not found")
        
        req = help_requests_store[request_id]
        
        if status:
            req["status"] = status
        
        # Note: priority is stored but not used yet
        if priority and "priority" in req:
            req["priority"] = priority
        
        req["updatedAt"] = datetime.utcnow().isoformat()
        
        return req
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error patching help request: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
