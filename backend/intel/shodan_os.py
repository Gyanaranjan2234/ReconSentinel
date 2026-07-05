import os
import httpx
import logging
from typing import Dict, Any, Optional
import time

# Simple in-memory cache to avoid redundant Shodan lookups
# Format: { "ip": {"data": dict, "timestamp": float} }
_shodan_cache: Dict[str, Dict[str, Any]] = {}
CACHE_TTL = 3600  # Cache for 1 hour

def get_shodan_host_os(ip: str) -> Optional[Dict[str, Any]]:
    """
    Queries Shodan for host intelligence to extract OS and related fingerprint data.
    Uses in-memory caching to prevent duplicate lookups.
    """
    api_key = os.getenv("SHODAN_API_KEY")
    if not api_key:
        logging.warning("SHODAN_API_KEY is not set. Skipping Shodan OS fingerprinting.")
        return None

    # Check cache
    now = time.time()
    if ip in _shodan_cache:
        cached_entry = _shodan_cache[ip]
        if now - cached_entry["timestamp"] < CACHE_TTL:
            logging.info(f"[Shodan] Cache hit for IP: {ip}")
            return cached_entry["data"]

    logging.info(f"[Shodan] Querying API for IP: {ip}")
    
    try:
        url = f"https://api.shodan.io/shodan/host/{ip}?key={api_key}"
        # We can use httpx synchronously here or via asyncio. Since Nmap scan is synchronous in thread, we do synchronous.
        with httpx.Client(timeout=10.0) as client:
            response = client.get(url)
            
            if response.status_code == 404:
                logging.info(f"[Shodan] No results found for IP: {ip}")
                return None
            elif response.status_code == 401:
                logging.error("[Shodan] Invalid or unauthorized API key.")
                return None
            elif response.status_code == 429:
                logging.error("[Shodan] Rate limit exceeded.")
                return None
                
            response.raise_for_status()
            data = response.json()
            
            # Extract relevant OS intelligence
            os_name = data.get("os")
            org = data.get("org", "Unknown")
            isp = data.get("isp", "Unknown")
            country = data.get("country_name", "Unknown")
            hostnames = data.get("hostnames", [])
            ports = data.get("ports", [])
            last_update = data.get("last_update")
            
            # Extract product names and service versions as evidence
            products = []
            for service in data.get("data", []):
                prod = service.get("product")
                if prod and prod not in products:
                    products.append(prod)
            
            evidence = []
            if os_name:
                evidence.append("Shodan OS classification")
            for prod in products[:3]: # Keep top 3 products for evidence
                evidence.append(f"{prod} detected")
                
            confidence = "High" if os_name else ("Medium" if products else "Low")
            
            result = {
                "os": os_name or "Unknown",
                "org": org,
                "isp": isp,
                "country": country,
                "hostnames": hostnames,
                "ports": ports,
                "products": products,
                "evidence": evidence,
                "confidence": confidence,
                "last_seen": last_update
            }
            
            # Save to cache
            _shodan_cache[ip] = {
                "data": result,
                "timestamp": now
            }
            
            return result
            
    except httpx.RequestError as exc:
        logging.error(f"[Shodan] Request exception for {ip}: {exc}")
    except Exception as exc:
        logging.error(f"[Shodan] Unexpected error during lookup for {ip}: {exc}")
        
    return None
