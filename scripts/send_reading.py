# Simulator: POST a water quality reading to the FastAPI backend.
# Run: python send_reading.py [--url http://localhost:8000] [--alert]
# --alert sends bad values to trigger SMS.

import argparse
import urllib.request
import json

def main():
    p = argparse.ArgumentParser()
    p.add_argument("--url", default="http://localhost:8000", help="Backend base URL")
    p.add_argument("--alert", action="store_true", help="Send bad values to trigger alert + SMS")
    args = p.parse_args()

    if args.alert:
        payload = {"ph": 5.0, "turbidity": 150.0, "tds": 600.0, "device_id": "device1"}
    else:
        payload = {"ph": 7.2, "turbidity": 20.0, "tds": 180.0, "device_id": "device1"}

    url = f"{args.url.rstrip('/')}/api/readings"
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data, method="POST", headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            out = json.loads(resp.read().decode())
            print("Response:", out)
    except Exception as e:
        print("Error:", e)


if __name__ == "__main__":
    main()
