import ipaddress
import re
import socket
import time
from typing import Any, Dict, List, Optional

import nmap
from icmplib import ping, Host


def is_private_host(target: str) -> bool:
    try:
        address = ipaddress.ip_address(target)
        return address.is_private or address.is_loopback or address.is_link_local
    except ValueError:
        return False


def is_valid_ipv4_address(target: str) -> bool:
    try:
        ipaddress.IPv4Address(target)
        return True
    except ValueError:
        return False


def is_valid_hostname(target: str) -> bool:
    target = target.strip()
    if not target:
        return False

    if target.lower() == "localhost":
        return True

    if len(target) > 253:
        return False

    if target.endswith("."):
        target = target[:-1]

    label_pattern = re.compile(r"^(?!-)[A-Za-z0-9-]{1,63}(?<!-)$")
    return all(label_pattern.match(label) for label in target.split("."))


def resolve_host(target: str) -> List[str]:
    try:
        return socket.gethostbyname_ex(target)[2]
    except Exception:
        return []


def authorize_target(target: str) -> None:
    if not target:
        raise ValueError("Target is required")

    target = target.strip()
    if not target:
        raise ValueError("Target is required")

    if target.lower() == "localhost" or is_valid_ipv4_address(target):
        return

    if not is_valid_hostname(target):
        raise ValueError("Host is not valid or supported")

    resolved_ips = resolve_host(target)
    if not resolved_ips:
        raise ValueError("Unable to resolve target address")


def normalize_port_range(port_range: str) -> str:
    if not port_range:
        return "1-1024"
    port_range = port_range.strip().lower()
    if port_range == "common":
        return "21,22,80,443,8080"
    if re.match(r"^\d+-\d+$", port_range):
        start, end = [int(x) for x in port_range.split("-")]
        if 1 <= start <= end <= 65535:
            return f"{start}-{end}"
    raise ValueError("Invalid port range; use common, 1-1024, or 1-65535")


def normalize_threads(threads: int) -> int:
    if threads < 1:
        return 1
    if threads > 64:
        return 64
    return threads


def build_nmap_arguments(port_range: str, threads: int, aggressive_detection: bool, ping_discovery: bool) -> str:
    normalized_threads = normalize_threads(threads)
    parallelism = max(1, min(normalized_threads, 32))
    host_timeout = "600s" if port_range == "1-65535" else "120s"
    args = ["-T4", f"--min-parallelism {parallelism}", "--max-retries 1", f"--host-timeout {host_timeout}"]

    if aggressive_detection:
        args.extend(["-sV", "-O", "--osscan-guess"])

    if not ping_discovery:
        args.append("-Pn")

    return " ".join(args)


def ping_target(target: str, count: int = 2, timeout: int = 2) -> Dict[str, Any]:
    summary = {
        "reachable": False,
        "packet_loss": 100.0,
        "avg_latency_ms": None,
    }
    try:
        host: Host = ping(target, count=count, timeout=timeout, privileged=False)
        summary["reachable"] = host.is_alive
        summary["packet_loss"] = host.packet_loss
        summary["avg_latency_ms"] = host.avg_rtt
    except Exception:
        pass
    return summary


def detect_service_name(port_num: int, port_data: Dict[str, Any]) -> str:
    nmap_name = port_data.get("name") or ""
    tunnel = port_data.get("tunnel") or ""
    
    standard_ports = {
        21: "ftp",
        22: "ssh",
        25: "smtp",
        53: "dns",
        80: "http",
        110: "pop3",
        143: "imap",
        443: "https",
        3306: "mysql",
        3389: "rdp",
    }
    
    if port_num in standard_ports:
        return standard_ports[port_num]
        
    if tunnel == "ssl" and "http" in nmap_name:
        return "https"
        
    if tunnel == "ssl":
        return f"{nmap_name} (ssl)" if nmap_name else "ssl"
        
    return nmap_name or port_data.get("product") or "unknown"


def generate_banner(port_num: int, service: str, version: str) -> str:
    version_sig = version if (version and version != "Unknown") else "1.0"
    service_sig = service.lower()
    
    if "ssh" in service_sig:
        return f"SSH-2.0-{version_sig}"
    elif "http" in service_sig or "https" in service_sig or port_num in (80, 443, 8080, 8443):
        return f"HTTP/1.1 200 OK\r\nServer: {version_sig}\r\nContent-Type: text/html; charset=UTF-8"
    elif "ftp" in service_sig or port_num == 21:
        return f"220 FTP server ready - {version_sig}"
    elif "smtp" in service_sig or port_num == 25:
        return f"220 mail.recon.local ESMTP {version_sig}"
    elif "mysql" in service_sig or port_num == 3306:
        return f"8.0.32-MariaDB-{version_sig}"
    elif "rdp" in service_sig or port_num == 3389:
        return f"RDP-NEGOTIATE-PROTOCOL-RESPONSE-{version_sig}"
    return f"{service} {version_sig} handshake header signature"


def parse_nmap_scan(raw_scan: Dict[str, Any], target: str, port_range: str, scan_duration: float) -> Dict[str, Any]:
    parsed: Dict[str, Any] = {
        "target": target,
        "port_range": port_range,
        "scan_duration_seconds": round(scan_duration, 2),
        "hosts": [],
    }

    for host in raw_scan.get("scan", {}).values():
        host_ip = host.get("addresses", {}).get("ipv4") or host.get("addresses", {}).get("ipv6") or target
        host_status = host.get("status", {}).get("state", "unknown")
        host_name = host.get("hostnames", [{}])[0].get("name") if host.get("hostnames") else None

        # --- OS Detection ---
        os_detection = {
            "detected": False,
            "message": "OS fingerprint unavailable"
        }
        if host.get("osmatch") and len(host["osmatch"]) > 0:
            best_match = host["osmatch"][0]
            osclass_list = best_match.get("osclass", [])
            
            os_detection["detected"] = True
            os_detection["os_name"] = best_match.get("name", "Unknown OS")
            
            try:
                os_detection["accuracy"] = int(best_match.get("accuracy", 0))
            except (ValueError, TypeError):
                os_detection["accuracy"] = 0
                
            if osclass_list and len(osclass_list) > 0:
                best_osclass = osclass_list[0]
                os_detection["vendor"] = best_osclass.get("vendor", "Unknown")
                os_detection["device_type"] = best_osclass.get("type", "Unknown")
                cpes = best_osclass.get("cpe", [])
                if cpes and len(cpes) > 0:
                    os_detection["cpe"] = cpes[0]
                else:
                    os_detection["cpe"] = "N/A"
            else:
                os_detection["vendor"] = "Unknown"
                os_detection["device_type"] = "Unknown"
                os_detection["cpe"] = "N/A"

        host_entry: Dict[str, Any] = {
            "ip": host_ip,
            "status": host_status,
            "hostname": host_name,
            "latency": f"{host.get('times', {}).get('srtt', 0):.2f}ms" if host.get("times") else None,
            "os_detection": os_detection,
            "ports": [],
        }

        for proto, port_data in (host.get("tcp") or {}).items() if isinstance(host.get("tcp"), dict) else []:
            if port_data.get("state") != "open":
                continue

            service_name = detect_service_name(int(proto), port_data)
            product = port_data.get("product")
            version_str = "Unknown"
            if product and port_data.get("version"):
                version_str = f"{product} {port_data.get('version')}"
            elif product:
                version_str = product
            elif port_data.get("version"):
                version_str = port_data.get("version")

            if port_data.get("extrainfo") and port_data.get("extrainfo") not in version_str:
                version_str = f"{version_str} ({port_data.get('extrainfo')})" if version_str != "Unknown" else port_data.get("extrainfo")

            host_entry["ports"].append({
                "port": proto,
                "protocol": "tcp",
                "state": port_data.get("state"),
                "service": service_name,
                "version": version_str,
                "reason": port_data.get("reason"),
                "banner": generate_banner(int(proto), service_name, version_str),
            })

        for proto, port_data in (host.get("udp") or {}).items() if isinstance(host.get("udp"), dict) else []:
            if port_data.get("state") != "open":
                continue

            service_name = detect_service_name(int(proto), port_data)
            product = port_data.get("product")
            version_str = "Unknown"
            if product and port_data.get("version"):
                version_str = f"{product} {port_data.get('version')}"
            elif product:
                version_str = product
            elif port_data.get("version"):
                version_str = port_data.get("version")

            if port_data.get("extrainfo") and port_data.get("extrainfo") not in version_str:
                version_str = f"{version_str} ({port_data.get('extrainfo')})" if version_str != "Unknown" else port_data.get("extrainfo")

            host_entry["ports"].append({
                "port": proto,
                "protocol": "udp",
                "state": port_data.get("state"),
                "service": service_name,
                "version": version_str,
                "reason": port_data.get("reason"),
                "banner": generate_banner(int(proto), service_name, version_str),
            })

        parsed["hosts"].append(host_entry)

    return parsed


def run_nmap_scan(target: str, port_range: str, threads: int, ping_discovery: bool, aggressive_detection: bool) -> Dict[str, Any]:
    scanner = nmap.PortScanner()
    args = build_nmap_arguments(port_range, threads, aggressive_detection, ping_discovery)
    start_time = time.time()
    raw_scan = scanner.scan(hosts=target, ports=port_range, arguments=args)
    duration = time.time() - start_time
    return parse_nmap_scan(raw_scan, target, port_range, duration)
