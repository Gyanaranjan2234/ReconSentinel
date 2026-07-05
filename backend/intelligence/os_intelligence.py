import asyncio
import concurrent.futures

def _run_nmap_os_sync(target: str, open_ports: list = None) -> dict:
    import subprocess
    import platform
    
    try:
        system = platform.system().lower()
        
        if system == "windows":
            # Windows — use nmap directly with -O flag
            # nmap installs to PATH on Windows, runs with 
            # admin if terminal is elevated
            cmd = [
                "nmap", "-O", "--osscan-guess",
                "--max-os-tries", "2", "-T4",
                "--host-timeout", "30s",
                "-oX", "-",  # XML output to stdout
                target
            ]
        else:
            # Linux/Mac — prepend sudo with -n flag
            # -n = non-interactive (no password prompt)
            # Add nmap to sudoers for passwordless execution
            cmd = [
                "sudo", "-n", "nmap",
                "-O", "--osscan-guess",
                "--max-os-tries", "2", "-T4",
                "--host-timeout", "30s",
                "-oX", "-",
                target
            ]
        
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=45
        )
        
        if result.returncode != 0:
            # sudo -n failed = password required
            # fallback to TTL
            return _ttl_fallback(target, open_ports)
        
        # Parse nmap XML output
        import xml.etree.ElementTree as ET
        root = ET.fromstring(result.stdout)
        
        host = root.find('host')
        if host is None:
            return _ttl_fallback(target, open_ports)
        
        # Get OS match
        os_elem = host.find('os')
        if os_elem is not None:
            osmatches = os_elem.findall('osmatch')
            osclasses = os_elem.findall('osclass')
            
            import logging
            logging.info("Raw Nmap OS Data: (XML Element parsed)")
            logging.info(f"Parsed osmatch: {len(osmatches)} matches found")
            logging.info(f"Parsed osclass: {len(osclasses)} classes found")
            
            best_match = osmatches[0] if osmatches else None
            best_class = None
            
            if best_match is not None:
                match_classes = best_match.findall('osclass')
                if match_classes:
                    best_class = match_classes[0]
                elif osclasses:
                    best_class = osclasses[0]
            elif osclasses:
                best_class = osclasses[0]
                
            logging.info(f"Parsed running: {best_class.get('osfamily') if best_class is not None else 'None'} {best_class.get('osgen') if best_class is not None else ''}".strip())
            logging.info(f"Parsed os_details: {best_match.get('name') if best_match is not None else 'None'}")
            
            if best_match is not None or best_class is not None:
                name = best_match.get('name', 'Partial Detection') if best_match is not None else 'Partial Detection'
                accuracy = best_match.get('accuracy', '50') if best_match is not None else (best_class.get('accuracy', '50') if best_class is not None else '50')
                
                os_family = best_class.get('osfamily', 'Unknown') if best_class is not None else 'Unknown'
                vendor = best_class.get('vendor', 'Unknown') if best_class is not None else 'Unknown'
                device_type = best_class.get('type', 'Unknown') if best_class is not None else 'Unknown'
                
                cpe = "N/A"
                if best_class is not None:
                    cpe_elem = best_class.find('cpe')
                    if cpe_elem is not None and cpe_elem.text:
                        cpe = cpe_elem.text
                
                try:
                    acc_num = int(accuracy)
                except ValueError:
                    acc_num = 50
                    
                response = {
                    "os": name,
                    "os_family": os_family,
                    "vendor": vendor,
                    "device_type": device_type,
                    "cpe": cpe,
                    "accuracy": f"{accuracy}%",
                    "accuracy_num": acc_num,
                    "confidence": "High" if acc_num >= 90 else ("Medium" if acc_num >= 50 else "Low"),
                    "method": "nmap",
                    "is_admin": True
                }
                logging.info(f"Final OS Response: {response}")
                return response
        
        return _ttl_fallback(target, open_ports)
        
    except subprocess.TimeoutExpired:
        return _ttl_fallback(target, open_ports)
    except FileNotFoundError:
        # nmap not installed
        return {
            "os": "Unknown",
            "os_family": "Unknown",
            "accuracy": "0%",
            "accuracy_num": 0,
            "confidence": "Low",
            "method": "nmap_not_installed",
            "is_admin": False
        }
    except Exception as e:
        return _ttl_fallback(target, open_ports)

def _get_ttl_via_socket(target: str) -> int | None:
    import socket
    import struct
    try:
        sock = socket.socket(
            socket.AF_INET, 
            socket.SOCK_STREAM
        )
        sock.settimeout(3)
        
        # Try connecting to port 80 or 443
        for port in [80, 443, 22, 21]:
            try:
                sock.connect((target, port))
                # Get TTL from socket options
                ttl = sock.getsockopt(
                    socket.IPPROTO_IP, 
                    socket.IP_TTL
                )
                sock.close()
                return ttl
            except:
                continue
        sock.close()
        return None
    except:
        return None

def _ttl_fallback(target: str, open_ports: list = None) -> dict:
    import subprocess
    import platform
    import re
    try:
        system = platform.system().lower()
        if system == "windows":
            cmd = ["ping", "-n", "2", target]
        else:
            cmd = ["ping", "-c", "2", target]
            
        result = subprocess.run(
            cmd, capture_output=True, 
            text=True, timeout=8
        )
        output = result.stdout.lower()
        
        ttl = None
        
        # 1. Split entire ping stdout by spaces AND newlines
        tokens = output.replace('\n', ' ').split()
        
        # 2. Loop through every word/token
        for part in tokens:
            # 3. Check if token contains "ttl=" (case insensitive)
            if "ttl=" in part:
                # 4. Extract number after "=" using split("=")[1]
                val_str = part.split("ttl=")[1]
                # 5. Strip any non-numeric characters before converting to int
                num_str = "".join(c for c in val_str if c.isdigit())
                if num_str:
                    ttl = int(num_str)
                    break
        
        # 7. If not found after full loop -> try regex as backup
        if ttl is None:
            match = re.search(r'ttl=(\d+)', output, re.IGNORECASE)
            if match:
                ttl = int(match.group(1))
        
        if ttl is None:
            ttl = _get_ttl_via_socket(target)
            
        if ttl is None:
            if open_ports:
                for port_info in open_ports:
                    banner = str(port_info.get("banner", "")).lower()
                    if not banner:
                        continue
                    if "ubuntu" in banner: return {"os": "Ubuntu", "os_family": "Linux", "accuracy": "70%", "accuracy_num": 70, "confidence": "Medium", "method": "banner", "is_admin": False}
                    if "debian" in banner: return {"os": "Debian", "os_family": "Linux", "accuracy": "70%", "accuracy_num": 70, "confidence": "Medium", "method": "banner", "is_admin": False}
                    if "centos" in banner: return {"os": "CentOS", "os_family": "Linux", "accuracy": "70%", "accuracy_num": 70, "confidence": "Medium", "method": "banner", "is_admin": False}
                    if "iis" in banner: return {"os": "Windows Server", "os_family": "Windows", "accuracy": "75%", "accuracy_num": 75, "confidence": "Medium", "method": "banner", "is_admin": False}
                    if "windows" in banner or "microsoft" in banner: return {"os": "Windows Server", "os_family": "Windows", "accuracy": "70%", "accuracy_num": 70, "confidence": "Medium", "method": "banner", "is_admin": False}
                    if "nginx" in banner or "apache" in banner or "litespeed" in banner or "proftpd" in banner: return {"os": "Linux", "os_family": "Linux", "accuracy": "60%", "accuracy_num": 60, "confidence": "Medium", "method": "banner", "is_admin": False}

            return {
                "os": "Unknown",
                "os_family": "Unknown",
                "accuracy": "0%",
                "accuracy_num": 0,
                "confidence": "Low",
                "method": "ttl_fallback",
                "is_admin": False
            }
        
        if ttl >= 255:
            return {
                "os": "Network Device (Cisco/Router)",
                "os_family": "Network Device",
                "accuracy": "50%",
                "accuracy_num": 50,
                "confidence": "Low",
                "method": "ttl_fallback",
                "is_admin": False
            }
        elif ttl >= 128:
            return {
                "os": "Windows",
                "os_family": "Windows",
                "accuracy": "60%",
                "accuracy_num": 60,
                "confidence": "Medium",
                "method": "ttl_fallback",
                "is_admin": False
            }
        elif ttl >= 64:
            return {
                "os": "Linux/Unix",
                "os_family": "Linux",
                "accuracy": "60%",
                "accuracy_num": 60,
                "confidence": "Medium",
                "method": "ttl_fallback",
                "is_admin": False
            }
        else:
            return {
                "os": "Unknown",
                "os_family": "Unknown",
                "accuracy": "0%",
                "accuracy_num": 0,
                "confidence": "Low",
                "method": "ttl_fallback",
                "is_admin": False
            }
    except:
        return {
            "os": "Unknown",
            "os_family": "Unknown",
            "accuracy": "0%",
            "accuracy_num": 0,
            "confidence": "Low",
            "method": "ttl_fallback",
            "is_admin": False
        }


async def detect_os(target: str, open_ports: list = None) -> dict:
    loop = asyncio.get_event_loop()
    with concurrent.futures.ThreadPoolExecutor() as pool:
        result = await loop.run_in_executor(
            pool, _run_nmap_os_sync, target, open_ports
        )
    return result

def get_host_os_intelligence(ip: str, open_ports: list = None) -> dict:
    """
    Synchronous wrapper to maintain compatibility with router.py
    while using the new nmap-based async detect_os logic.
    """
    try:
        try:
            loop = asyncio.get_running_loop()
            is_running = True
        except RuntimeError:
            is_running = False

        if is_running:
            import threading
            result_dict = {}
            def run_in_thread():
                result_dict["data"] = asyncio.run(detect_os(ip, open_ports))
            t = threading.Thread(target=run_in_thread)
            t.start()
            t.join()
            data = result_dict["data"]
        else:
            data = asyncio.run(detect_os(ip, open_ports))
            
        if data and data.get("os"):
            return {"status": "success", "data": data, "message": ""}
        else:
            return {
                "status": "error", 
                "message": "Could not determine OS.",
                "data": {"is_admin": False}
            }
    except Exception as e:
        return {"status": "error", "message": "OS fingerprint data unavailable. The target may be filtering probes, insufficient ports were detected, or elevated privileges are required."}
