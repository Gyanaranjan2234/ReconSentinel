"""
Integration tests for the ReconSentinel scanner API.

Requirements:
  - Backend server must be running at http://127.0.0.1:8000
  - Run with: python -m pytest backend/tests/test_scan.py -v
  - Or directly: python backend/tests/test_scan.py
"""

import json
import unittest
import urllib.request
import urllib.error

BASE_URL = "http://127.0.0.1:8000"
SCAN_ENDPOINT = f"{BASE_URL}/api/scan/"


def post_scan(payload: dict) -> tuple[int, dict | str]:
    """Send a POST request to the scan endpoint and return (status_code, body)."""
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        SCAN_ENDPOINT,
        data=data,
        headers={"Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(req) as response:
            return response.getcode(), json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8")
    except urllib.error.URLError as e:
        raise ConnectionError(
            f"Cannot connect to backend at {BASE_URL}. "
            "Make sure the server is running before executing these tests."
        ) from e


class TestScanAPIValidation(unittest.TestCase):
    """Tests that verify request validation on the scan endpoint."""

    BASE_PAYLOAD = {
        "target": "scanme.nmap.org",
        "port_range": "1-1024",
        "threads": 8,
        "aggressive_mode": False,
        "ping_discovery": True,
    }

    def test_valid_public_domain_accepted(self):
        """A well-formed public domain scan request should return HTTP 200."""
        status, body = post_scan(self.BASE_PAYLOAD)
        self.assertEqual(status, 200, f"Expected 200, got {status}: {body}")

    def test_missing_target_rejected(self):
        """A request with no target should return HTTP 422 (Unprocessable Entity)."""
        payload = {k: v for k, v in self.BASE_PAYLOAD.items() if k != "target"}
        status, _ = post_scan(payload)
        self.assertEqual(status, 422, f"Expected 422, got {status}")

    def test_invalid_port_range_rejected(self):
        """An invalid port_range value should return HTTP 422."""
        payload = {**self.BASE_PAYLOAD, "port_range": "invalid-range"}
        status, _ = post_scan(payload)
        self.assertEqual(status, 422, f"Expected 422, got {status}")

    def test_unresolvable_domain_rejected(self):
        """An unresolvable hostname should return HTTP 400 or 422."""
        payload = {**self.BASE_PAYLOAD, "target": "invalid-domain-test.local"}
        status, _ = post_scan(payload)
        self.assertIn(status, [400, 422], f"Expected 400 or 422, got {status}")

    def test_private_ip_scan(self):
        """Scanning localhost should be accepted (private/loopback is allowed)."""
        payload = {**self.BASE_PAYLOAD, "target": "localhost"}
        status, _ = post_scan(payload)
        self.assertEqual(status, 200, f"Expected 200, got {status}")


if __name__ == "__main__":
    unittest.main(verbosity=2)
