import os
import json

def get_techniques(open_ports):
    techniques = []
    
    mapping_file = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "mitre_mapping.json")
    if not os.path.exists(mapping_file):
        return techniques
        
    with open(mapping_file, "r") as f:
        mappings = json.load(f)
        
    port_nums = set()
    for p in open_ports:
        try:
            port_num_str = p.get('port', '0')
            if isinstance(port_num_str, str) and "/" in port_num_str:
                p_num = int(port_num_str.split("/")[0])
            else:
                p_num = int(port_num_str)
            port_nums.add(p_num)
        except:
            pass
            
    added_ids = set()
    for p_num in port_nums:
        port_str = str(p_num)
        if port_str in mappings:
            mapping = mappings[port_str]
            tech_id = mapping.get("technique_id")
            
            # Avoid duplicate mappings if multiple ports map to the same technique
            if tech_id not in added_ids:
                added_ids.add(tech_id)
                # Determine a risk level (simple heuristic: Initial Access/Cred Access are High)
                tactic = mapping.get("tactic", "")
                risk = "High" if tactic in ["Initial Access", "Credential Access", "Lateral Movement"] else "Medium"
                
                techniques.append({
                    "id": tech_id,
                    "name": mapping.get("technique_name"),
                    "tactic": tactic,
                    "description": mapping.get("description"),
                    "recommendation": mapping.get("recommendation"),
                    "risk": risk
                })
                
    return techniques
