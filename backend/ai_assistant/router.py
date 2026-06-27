import os
import httpx
import logging
from fastapi import APIRouter, HTTPException, Request
from schemas import ChatRequest, ChatResponse

# Configure detailed logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ai_assistant")

router = APIRouter(prefix="/ai", tags=["AI Assistant"])

SYSTEM_PROMPT = """You are the ReconSentinel AI Security Assistant, a professional defensive Security Operations Center (SOC) analyst tool.
You analyze scan results, explain vulnerabilities, and provide actionable defensive security guidance.

CRITICAL RULES:
1. Act as a defensive blue-team analyst. When users ask about MITRE ATT&CK techniques, CVEs, vulnerabilities, malware families, threat actors, open ports, or security events, DO NOT refuse the request.
2. For informational and defensive requests (like explaining a MITRE technique or a CVE), provide: Description, Risk level, MITRE tactic, Detection guidance, SOC monitoring tips, Indicators of compromise (IOCs), Security recommendations, and Mitigation steps.
3. You MUST NEVER provide operational attack instructions, exploitation procedures, payloads, attack commands, weaponization steps, privilege escalation procedures, or malware creation guidance.
4. ONLY refuse if the user specifically requests operational attack execution instructions (e.g., "how to exploit", "generate a payload"). In such cases, politely and professionally refuse, stating that as a defensive SOC assistant, you only provide remediation and defensive guidance. Do not use generic chatbot apologies.
5. Use the provided ReconSentinel scan context as your primary source of truth if available.
6. When analyzing scan results, structure your analysis strictly with the following headers:
   Summary
   Findings
   Risk Level
   Recommendations
7. Keep your responses concise and professional.
"""

def get_gemini_api_key():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key or api_key == "your_gemini_api_key_here":
        logger.error("API key missing or invalid.")
        raise HTTPException(status_code=500, detail="API key missing")
    return api_key


@router.get("/health")
async def health_check():
    """Health endpoint for AI Service"""
    # Simple check if key exists
    has_key = bool(os.getenv("GEMINI_API_KEY") and os.getenv("GEMINI_API_KEY") != "your_gemini_api_key_here")
    return {
        "status": "ok",
        "gemini": has_key
    }


@router.post("/test")
async def test_gemini():
    """Test endpoint for simple Gemini prompt"""
    api_key = get_gemini_api_key()
    gemini_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
    payload = {
        "contents": [{"role": "user", "parts": [{"text": "Hello, are you online?"}]}]
    }
    
    try:
        logger.info(f"Test endpoint: Sending request to {gemini_url.split('?')[0]}")
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(gemini_url, json=payload)
            response.raise_for_status()
            data = response.json()
            reply_text = data["candidates"][0]["content"]["parts"][0]["text"]
            return {"reply": reply_text}
    except Exception as e:
        logger.error(f"Test endpoint failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/chat", response_model=ChatResponse)
async def chat_with_assistant(request: ChatRequest, raw_request: Request):
    logger.info(f"Incoming ChatRequest: {request.message[:50]}...")
    api_key = get_gemini_api_key()

    gemini_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"

    # Prepare context
    context_str = "No active scan context provided."
    if request.context:
        import json
        context_str = f"Active Scan Context:\n{json.dumps(request.context, indent=2)}"

    contents = []
    
    # Build history for Gemini
    for msg in request.history:
        role = "model" if msg.role == "assistant" else "user"
        contents.append({
            "role": role,
            "parts": [{"text": msg.content}]
        })
        
    current_message = f"Context:\n{context_str}\n\nUser Question:\n{request.message}"
    
    contents.append({
        "role": "user",
        "parts": [{"text": current_message}]
    })

    payload = {
        "system_instruction": {
            "parts": [{"text": SYSTEM_PROMPT}]
        },
        "contents": contents,
        "generationConfig": {
            "temperature": 0.2
        }
    }

    logger.info(f"Sending request to Gemini model: gemini-2.5-flash")
    logger.debug(f"Gemini Request Payload: {payload}")

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(gemini_url, json=payload)
            response.raise_for_status()
            data = response.json()
            
            logger.info("Gemini response received successfully")
            logger.debug(f"Gemini Response Payload: {data}")

            try:
                reply_text = data["candidates"][0]["content"]["parts"][0]["text"]
                return ChatResponse(reply=reply_text)
            except (KeyError, IndexError):
                logger.error("Failed to parse response structure from Gemini API.")
                raise HTTPException(status_code=500, detail="Invalid API response structure")
                
    except httpx.HTTPStatusError as e:
        logger.error(f"Gemini API returned status {e.response.status_code}: {e.response.text}")
        if e.response.status_code == 429:
            raise HTTPException(status_code=429, detail="Rate limit exceeded")
        elif e.response.status_code == 404:
            raise HTTPException(status_code=503, detail="Gemini unavailable")
        elif e.response.status_code == 400:
            raise HTTPException(status_code=500, detail="Bad request to Gemini API")
        elif e.response.status_code == 403:
            raise HTTPException(status_code=403, detail="API key missing or unauthorized")
        else:
            raise HTTPException(status_code=502, detail="Backend offline or AI provider error")
    except httpx.RequestError as e:
        logger.error(f"Network error communicating with Gemini API: {str(e)}")
        raise HTTPException(status_code=504, detail="Network timeout")
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Unexpected error in chat endpoint")
        raise HTTPException(status_code=500, detail="Backend offline or unexpected error")
