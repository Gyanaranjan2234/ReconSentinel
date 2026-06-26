import os
import re
import socket
import ssl
import ipaddress
import httpx
import asyncio
import logging
from typing import Any, Dict, Tuple
from datetime import datetime

logger = logging.getLogger(__name__)

async def fetch_with_retry(client: httpx.AsyncClient, url: str, headers: Dict[str, str] = None, retries: int = 3) -> httpx.Response:
    for attempt in range(retries):
        try:
            response = await client.get(url, headers=headers)
            response.raise_for_status()
            return response
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 404:
                raise e # Do not retry 404s
            if e.response.status_code in [401, 403]:
                logger.error(f"Authentication error when calling API: HTTP {e.response.status_code}")
                raise e
            logger.warning(f"HTTP Error {e.response.status_code} on attempt {attempt + 1}")
            if attempt == retries - 1:
                raise e
        except Exception as e:
            logger.warning(f"Network error on attempt {attempt + 1}: {str(e)}")
            if attempt == retries - 1:
                raise e
        await asyncio.sleep(2 ** attempt)

async def check_virustotal(query: str, type: str) -> Dict[str, Any]:
    vt_api_key = os.getenv("VIRUSTOTAL_API_KEY")
    if not vt_api_key or vt_api_key == "your_virustotal_api_key_here":
        raise ValueError("Missing required API key: VIRUSTOTAL_API_KEY is not configured.")

    headers = {"x-apikey": vt_api_key}
    if type == "IP":
        url = f"https://www.virustotal.com/api/v3/ip_addresses/{query}"
    else:
        url = f"https://www.virustotal.com/api/v3/domains/{query}"

    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            response = await fetch_with_retry(client, url, headers=headers)
            return response.json()
        except Exception:
            return {"error": "vt_lookup_failed"}

async def fetch_cve(query: str) -> Tuple[str, Dict[str, Any]]:
    nvd_api_key = os.getenv("NVD_API_KEY")
    if not nvd_api_key or nvd_api_key == "your_nvd_api_key_here":
        raise ValueError("Missing required API key: NVD_API_KEY is not configured.")

    # Validate
    if not re.match(r"^CVE-\d{4}-\d{4,7}$", query, re.IGNORECASE):
        raise ValueError("Invalid CVE ID format. Must be like CVE-YYYY-NNNNN")
    
    query = query.upper()
    
    # Use NVD API
    url = f"https://services.nvd.nist.gov/rest/json/cves/2.0?cveId={query}"
    headers = {"apiKey": nvd_api_key}
    
    async with httpx.AsyncClient(timeout=15.0) as client:
        try:
            response = await fetch_with_retry(client, url, headers=headers)
            data = response.json()
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 404:
                return f"No results found for {query}.", {"status": "not_found", "query": query}
            return f"Failed to fetch CVE data: HTTP {e.response.status_code}", {"error": "http_error"}
        except Exception as e:
            return f"Failed to fetch CVE data. Please try again later.", {"error": "network_error"}

    vulnerabilities = data.get("vulnerabilities", [])
    if not vulnerabilities:
        return f"No results found for {query}.", {"status": "not_found", "query": query}

    cve_data = vulnerabilities[0].get("cve", {})
    
    # Extract details
    desc_list = cve_data.get("descriptions", [])
    description = "No description available."
    for d in desc_list:
        if d.get("lang") == "en":
            description = d.get("value")
            break
            
    published = cve_data.get("published", "Unknown")
    if published != "Unknown":
        try:
            dt = datetime.fromisoformat(published.replace("Z", "+00:00"))
            published = dt.strftime("%Y-%m-%d %H:%M:%S")
        except ValueError:
            pass
    
    metrics = cve_data.get("metrics", {})
    cvss_data = metrics.get("cvssMetricV31", metrics.get("cvssMetricV30", []))
    
    cvss = "Unknown"
    severity = "Unknown"
    if cvss_data and len(cvss_data) > 0:
        cvss = cvss_data[0].get("cvssData", {}).get("baseScore", "Unknown")
        severity = cvss_data[0].get("cvssData", {}).get("baseSeverity", "Unknown")

    references_list = cve_data.get("references", [])
    references = "\n".join([f"- {r.get('url')}" for r in references_list[:5]])
    
    # Recommendations dynamically based on severity
    recommendations = "Apply vendor patches or workarounds."
    if str(severity).upper() in ["CRITICAL", "HIGH"]:
        recommendations = "Apply vendor patches IMMEDIATELY. Consider temporary mitigations if patching is not possible."
    elif str(severity).upper() == "MEDIUM":
        recommendations = "Apply vendor patches during the next maintenance window."

    summary = (
        f"Threat Intelligence Summary for {query}:\n\n"
        f"- Severity: {severity} (CVSS: {cvss})\n"
        f"- Published Date: {published}\n"
        f"- Description: {description}\n\n"
        f"- Recommendations: {recommendations}\n\n"
        f"- References:\n{references}"
    )

    raw_response = {
        "source": "nvd-api",
        "query": query,
        "type": "CVE",
        "cve": cve_data,
    }

    return summary, raw_response

async def fetch_ip(query: str) -> Tuple[str, Dict[str, Any]]:
    # Requires VIRUSTOTAL API KEY to be checked first
    vt_api_key = os.getenv("VIRUSTOTAL_API_KEY")
    if not vt_api_key or vt_api_key == "your_virustotal_api_key_here":
        raise ValueError("Missing required API key: VIRUSTOTAL_API_KEY is not configured.")

    # Validate
    try:
        ip_obj = ipaddress.ip_address(query)
    except ValueError:
        raise ValueError("Invalid IP address format.")

    if ip_obj.is_private:
        summary = (
            f"Threat Intelligence Summary for IP '{query}':\n\n"
            f"- Status: Private/Internal IP Address\n"
            f"- Country: N/A\n"
            f"- ASN: N/A\n"
            f"- ISP: N/A\n"
            f"- Risk Rating: Low (Internal)\n"
            f"- Reputation: Clean\n"
        )
        return summary, {"source": "local", "query": query, "type": "IP", "is_private": True}

    # Public IP: fetch info
    url = f"http://ip-api.com/json/{query}"
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            response = await fetch_with_retry(client, url)
            data = response.json()
        except Exception:
            return f"Failed to fetch IP geo data.", {"error": "geo_lookup_failed"}

    if data.get("status") == "fail":
        return f"No results found for IP {query}.", {"status": "not_found", "query": query}

    country = data.get("country", "Unknown")
    asn = data.get("as", "Unknown")
    isp = data.get("isp", "Unknown")

    # Reverse DNS
    try:
        rdns = socket.gethostbyaddr(query)[0]
    except Exception:
        rdns = "None"

    # VirusTotal check
    vt_data = await check_virustotal(query, "IP")
    vt_stats = vt_data.get("data", {}).get("attributes", {}).get("last_analysis_stats", {})
    malicious = vt_stats.get("malicious", 0)
    
    is_listed = False
    if malicious > 0:
        is_listed = True

    reputation = f"Malicious ({malicious} vendors flagged)" if is_listed else "Clean"
    risk_rating = "High" if is_listed else "Low"

    summary = (
        f"Threat Intelligence Summary for IP '{query}':\n\n"
        f"- Country: {country}\n"
        f"- ASN: {asn}\n"
        f"- ISP: {isp}\n"
        f"- Reverse DNS: {rdns}\n"
        f"- Public/Private: Public\n"
        f"- Reputation: {reputation}\n"
        f"- Risk Rating: {risk_rating}\n"
    )

    raw_response = {
        "source": "ip-api-and-vt",
        "query": query,
        "type": "IP",
        "geo": data,
        "rdns": rdns,
        "reputation": reputation,
        "risk_rating": risk_rating,
        "vt_stats": vt_stats
    }

    return summary, raw_response

async def fetch_domain(query: str) -> Tuple[str, Dict[str, Any]]:
    vt_api_key = os.getenv("VIRUSTOTAL_API_KEY")
    if not vt_api_key or vt_api_key == "your_virustotal_api_key_here":
        raise ValueError("Missing required API key: VIRUSTOTAL_API_KEY is not configured.")

    # Validate basic domain format
    query = query.strip()
    if not re.match(r"^(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$", query):
        raise ValueError("Invalid Domain format.")

    try:
        resolved_ip = socket.gethostbyname(query)
    except socket.gaierror:
        return f"Failed to resolve domain {query}.", {"error": "dns_resolution_failed"}

    # WHOIS
    whois_url = f"https://networkcalc.com/api/dns/whois/{query}"
    whois_data = {}
    async with httpx.AsyncClient(timeout=15.0) as client:
        try:
            response = await fetch_with_retry(client, whois_url)
            whois_data = response.json()
        except Exception:
            pass

    registrar = "Unknown"
    if whois_data.get("status") == "OK" and whois_data.get("whois", {}).get("registrar"):
        registrar = whois_data["whois"]["registrar"]

    # ISP (Hosting Provider)
    isp_url = f"http://ip-api.com/json/{resolved_ip}"
    hosting_provider = "Unknown"
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            response = await fetch_with_retry(client, isp_url)
            isp_data = response.json()
            hosting_provider = isp_data.get("isp", "Unknown")
        except Exception:
            pass

    # SSL Status
    ssl_status = "Invalid/No SSL"
    try:
        context = ssl.create_default_context()
        with socket.create_connection((query, 443), timeout=5) as sock:
            with context.wrap_socket(sock, server_hostname=query) as ssock:
                cert = ssock.getpeercert()
                not_after = cert.get("notAfter")
                if not_after:
                    expire_date = datetime.strptime(not_after, "%b %d %H:%M:%S %Y %Z")
                    if expire_date > datetime.utcnow():
                        ssl_status = f"Valid (Expires: {not_after})"
                    else:
                        ssl_status = f"Expired ({not_after})"
    except Exception:
        pass

    # VirusTotal check
    vt_data = await check_virustotal(query, "Domain")
    vt_stats = vt_data.get("data", {}).get("attributes", {}).get("last_analysis_stats", {})
    malicious = vt_stats.get("malicious", 0)

    # Risk Rating
    risk_rating = "Low"
    if ssl_status == "Invalid/No SSL" or "Expired" in ssl_status:
        risk_rating = "Medium"
    
    if malicious > 0:
        risk_rating = "High"
        ssl_status += f" - Malicious ({malicious} vendors flagged)"

    summary = (
        f"Threat Intelligence Summary for Domain '{query}':\n\n"
        f"- Resolved IP: {resolved_ip}\n"
        f"- Registrar: {registrar}\n"
        f"- Hosting Provider: {hosting_provider}\n"
        f"- SSL Status: {ssl_status}\n"
        f"- Risk Rating: {risk_rating}\n"
    )

    raw_response = {
        "source": "multi-api-and-vt",
        "query": query,
        "type": "Domain",
        "resolved_ip": resolved_ip,
        "whois": whois_data,
        "ssl_status": ssl_status,
        "hosting_provider": hosting_provider,
        "vt_stats": vt_stats
    }

    return summary, raw_response

async def lookup_intel_summary(query: str, intel_type: str) -> Tuple[str, Dict[str, Any]]:
    intel_type = intel_type.upper()
    if intel_type == "CVE":
        return await fetch_cve(query)
    elif intel_type == "IP":
        return await fetch_ip(query)
    elif intel_type == "DOMAIN":
        return await fetch_domain(query)
    else:
        raise ValueError("Invalid intelligence type. Supported types: CVE, IP, Domain")
