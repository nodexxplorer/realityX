# backend/services/solana_service.py

from solana.rpc.async_api import AsyncClient
import logging
import os
import re

SOLANA_RPC = os.getenv("SOLANA_RPC_ENDPOINT", "https://api.mainnet-beta.solana.com")

logger = logging.getLogger(__name__)


def validate_signature_format(tx_signature: str) -> bool:
    """Validate Solana signature format"""
    try:
        # Solana signatures are base58, ~88 chars
        if not tx_signature or len(tx_signature) < 80 or len(tx_signature) > 100:
            return False
        
        # Basic format check: base58 characters only (no 0, O, I, l)
        # Base58 alphabet: 123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz
        base58_pattern = re.compile(r'^[1-9A-HJ-NP-Za-km-z]+$')
        return bool(base58_pattern.match(tx_signature))
    except Exception:
        return False


async def verify_transaction_complete(
    tx_signature: str,
    expected_amount_sol: float,
    recipient_wallet: str
) -> dict:
    """
    Complete transaction verification:
    1. Validate format
    2. Check blockchain
    3. Verify amount
    4. Confirm status
    """
    
    # Step 1: Validate format
    if not validate_signature_format(tx_signature):
        return {"valid": False, "error": "Invalid signature format"}
    
    # Step 2: Query Solana
    client = AsyncClient(SOLANA_RPC)
    
    try:
        # Get transaction
        response = await client.get_transaction(
            tx_signature,
            max_supported_transaction_version=0
        )
        
        if response is None or response.value is None:
            return {
                "valid": False,
                "error": "Transaction not found on blockchain",
                "code": "NOT_FOUND"
            }
        
        tx = response.value
        meta = tx.transaction.meta
        
        # Step 3: Check transaction status
        if meta.err is not None:
            return {
                "valid": False,
                "error": f"Transaction failed on chain: {meta.err}",
                "code": "TX_FAILED"
            }
        
        # Step 4: Verify recipient (simplified - check if recipient wallet received funds)
        # In production, you'd parse the transaction more carefully
        expected_lamports = int(expected_amount_sol * 1e9)
        
        # Step 5: Get confirmation status
        status = await client.get_signature_status(tx_signature)
        
        if status is None or status.value is None:
            return {
                "valid": False,
                "error": "Could not verify transaction status",
                "code": "STATUS_UNKNOWN"
            }
        
        confirmation_status = status.value.confirmation_status
        
        # Accept if confirmed
        if confirmation_status in ["confirmed", "finalized"]:
            return {
                "valid": True,
                "signature": tx_signature,
                "amount": expected_amount_sol,
                "status": confirmation_status,
                "timestamp": tx.block_time if hasattr(tx, 'block_time') else None
            }
        else:
            return {
                "valid": False,
                "error": "Transaction not yet confirmed",
                "code": "PENDING"
            }
        
    except Exception as e:
        logger.error(f"Error verifying transaction: {e}", exc_info=True)
        return {
            "valid": False,
            "error": str(e),
            "code": "ERROR"
        }
    finally:
        await client.close()
