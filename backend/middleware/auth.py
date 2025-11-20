# backend/app/middleware/auth.py - Email-based Auth (Compatible with existing code)

from fastapi import HTTPException, Header, Depends
from typing import Optional
import jwt
import re
from core.config import settings
from db.queries import get_user_by_id, get_user_by_email

async def verify_supabase_token(authorization: Optional[str] = Header(None)) -> str:
    """
    Verify Supabase JWT token OR accept email directly and return user_id
    Token format: Bearer <jwt_token> OR Bearer <email>
    """
    if not authorization:
        raise HTTPException(
            status_code=401, 
            detail="Missing authorization header"
        )
    
    try:
        # Extract token
        token = authorization.replace("Bearer ", "").strip()
        
        if not token:
            raise HTTPException(status_code=401, detail="Empty token")
        
        # Check if it's an email (contains @ and . with valid email pattern)
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        
        if re.match(email_pattern, token):
            # Treat as email
            print(f"🔍 Auth attempt with email: {token}")
            user = await get_user_by_email(token)
            if not user:
                print(f"❌ User not found for email: {token}")
                raise HTTPException(status_code=401, detail="User not found")
            
            if not user.get("active"):
                raise HTTPException(status_code=403, detail="Account inactive")
            
            print(f"✅ Auth verified for email: {token}, user_id: {user['id']}")
            return user["id"]  # Return user_id from database
        
        # Otherwise, try to decode as JWT
        print(f"🔍 Attempting JWT decode for token: {token[:20]}...")
        payload = jwt.decode(
            token, 
            settings.SUPABASE_JWT_SECRET,  # Get from Supabase dashboard
            algorithms=["HS256"],
            audience="authenticated"
        )
        
        user_id = payload.get("sub")  # Supabase uses 'sub' for user ID
        
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token payload")
        
        # Verify user exists and is active
        user = await get_user_by_id(user_id)
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        
        if not user.get("active"):
            raise HTTPException(status_code=403, detail="Account inactive")
        
        print(f"✅ Auth verified for JWT user_id: {user_id}")
        return user_id
        
    except jwt.ExpiredSignatureError:
        print(f"❌ Token expired: {authorization[:20]}...")
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError as e:
        print(f"❌ Invalid JWT token: {str(e)}")
        # If JWT decode fails but it's not an email, raise error
        raise HTTPException(status_code=401, detail="Invalid token")
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Unexpected auth error: {str(e)}")
        raise HTTPException(status_code=401, detail="Unauthorized")


async def verify_premium_user(user_id: str = Depends(verify_supabase_token)) -> str:
    """Verify user has premium access"""
    from db.queries import verify_user_is_premium
    
    is_premium = await verify_user_is_premium(user_id)
    if not is_premium:
        raise HTTPException(
            status_code=403, 
            detail="Premium subscription required"
        )
    
    return user_id


async def get_current_user(user_id: str = Depends(verify_supabase_token)):
    """Get full user info from database"""
    user = await get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user










#     # backend/app/middleware/auth.py - Email-based Auth

# from fastapi import HTTPException, Depends
# from fastapi.security import HTTPBearer, HTTPAuthCredentials
# import re

# security = HTTPBearer()


# async def verify_supabase_token(credentials: HTTPAuthCredentials = Depends(security)) -> str:
#     """
#     Verify email-based authorization token
    
#     Expected header: Authorization: Bearer <user_email>
#     Returns: user_id (email in this case)
#     """
#     token = credentials.credentials
    
#     try:
#         # Validate email format
#         email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        
#         if not token or not isinstance(token, str):
#             raise HTTPException(status_code=401, detail="Invalid token format")
        
#         if not re.match(email_pattern, token):
#             raise HTTPException(status_code=401, detail="Invalid email format in token")
        
#         print(f"✅ Auth verified for user: {token}")
#         return token
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         print(f"❌ Token verification error: {e}")
#         raise HTTPException(status_code=401, detail="Unauthorized")