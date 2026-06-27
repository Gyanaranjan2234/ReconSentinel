from typing import List, Dict, Any

DANGEROUS_PORTS = {
    21: ("FTP", 25),       # cleartext credentials
    23: ("Telnet", 30),    # completely unencrypted
    445: ("SMB", 25),      # common ransomware vector
    3389: ("RDP", 20),     # brute force target
    5900: ("VNC", 20),     # remote access exposure
    6379: ("Redis", 25),   # often unauthenticated
    27017: ("MongoDB", 25) # often unauthenticated
}

def calculate_risk(open_ports: List[Dict[str, Any]], cves: List[Dict[str, Any]] = None) -> Dict[str, Any]:
    if cves is None:
        cves = []
        
    dangerous_services_score = 0
    port_count_score = min(len(open_ports) * 3, 15)
    cve_severity_score = 0
    dangerous_ports_found = []
    
    for p in open_ports:
        try:
            port_num_str = p.get("port", "0")
            if isinstance(port_num_str, str) and "/" in port_num_str:
                port_num = int(port_num_str.split("/")[0])
            else:
                port_num = int(port_num_str)
        except (ValueError, TypeError):
            port_num = 0
            
        if port_num in DANGEROUS_PORTS:
            service_name, penalty = DANGEROUS_PORTS[port_num]
            dangerous_services_score += penalty
            dangerous_ports_found.append(f"{service_name} ({port_num})")
            
    for cve in cves:
        try:
            cvss = float(cve.get("cvss", 0.0))
        except (ValueError, TypeError):
            cvss = 0.0
            
        if cvss >= 9.0:
            cve_severity_score += 25
        elif cvss >= 7.0:
            cve_severity_score += 15
        elif cvss >= 4.0:
            cve_severity_score += 8
        elif cvss >= 0.1:
            cve_severity_score += 3
            
    total = dangerous_services_score + port_count_score + cve_severity_score
    score = min(total, 100)
    
    if score <= 30:
        level = "Low"
    elif score <= 70:
        level = "Medium"
    else:
        level = "High"
        
    summary = "No critical risks detected. Maintain standard security posture."
    if dangerous_ports_found:
        first_port = dangerous_ports_found[0]
        if "FTP" in first_port:
            summary = "FTP on port 21 exposes cleartext credentials — upgrade to SFTP immediately."
        elif "Telnet" in first_port:
            summary = "Telnet on port 23 is completely unencrypted — disable immediately and use SSH."
        elif "SMB" in first_port:
            summary = "SMB on port 445 is a common ransomware vector — restrict access immediately."
        elif "RDP" in first_port:
            summary = "RDP is exposed — place behind a VPN or enable MFA."
        else:
            summary = f"Dangerous services detected: {', '.join(dangerous_ports_found)}. Restrict access immediately."
    elif cve_severity_score > 0:
        summary = "Vulnerabilities detected. Review CVEs and apply patches immediately."
        
    return {
        "score": score,
        "level": level,
        "breakdown": {
            "dangerous_services": dangerous_services_score,
            "port_count": port_count_score,
            "cve_severity": cve_severity_score,
            "total": total
        },
        "dangerous_ports_found": dangerous_ports_found,
        "summary": summary
    }
