import os
from typing import Any, Dict, Tuple


def format_threat_intel_summary(query: str, intel_type: str) -> Tuple[str, Dict[str, Any]]:
    severity = "HIGH" if intel_type.upper() == "CVE" else "MEDIUM"
    summary = (
        f"Threat Intelligence Summary for {intel_type} query '{query}':\n\n"
        f"- Severity: {severity}\n"
        f"- Description: This artifact represents an illustrative risk classification for educational use. "
        "Validate against trusted vulnerability feeds and authorized asset inventories before action.\n"
        "- Recommended Mitigation: Apply vendor patches, verify firewall access controls, and reduce attack surface exposure.\n"
        "- Notes: Use only for authorized assessment targets and scan within permitted boundaries.\n"
    )

    raw_response: Dict[str, Any] = {
        "source": "educational-stub",
        "query": query,
        "type": intel_type,
        "nvd_available": bool(os.getenv("NVD_API_KEY")),
        "anthropic_available": bool(os.getenv("ANTHROPIC_API_KEY")),
        "signal": "example-intel",
    }

    return summary, raw_response


async def lookup_intel_summary(query: str, intel_type: str) -> Tuple[str, Dict[str, Any]]:
    # Safe stub for threat intelligence, not an external production feed.
    return format_threat_intel_summary(query, intel_type)
