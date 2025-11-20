# backend/app/core/config.py

from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=False,
        extra='ignore'  # This allows extra fields
    )
    # DATABASE
    DATABASE_URL: str
    
    # Supabase Auth
    SUPABASE_URL: str
    SUPABASE_ANON_KEY: str
    SUPABASE_JWT_SECRET: str
    
    # Solana (optional for development)
    NEXT_PUBLIC_TREASURY_WALLET: str = ""
    SOLANA_RPC_ENDPOINT: str = "https://api.mainnet-beta.solana.com"

    # API Keys
    GOOGLE_API_KEY: str
    
    # Rate Limiting (more generous with Flash)
    FREE_TIER_DAILY_LIMIT: int = 5
    PRO_TIER_DAILY_LIMIT: int = 10
    ELITE_TIER_DAILY_LIMIT: int = 20
    
    # Cost limits (monthly)
    FREE_TIER_MONTHLY_COST_LIMIT: float = 10.0
    PRO_TIER_MONTHLY_COST_LIMIT: float = 50.0
    ELITE_TIER_MONTHLY_COST_LIMIT: float = 200.0
    
    # Model settings
    GEMINI_MODEL: str = "gemini-2.0-flash"
    MAX_CONTEXT_MESSAGES: int = 20
    
    # CORS
    ALLOWED_ORIGINS: list = ["http://localhost:3000"]

settings = Settings()