# Fills missing lat/lng in sources.json using OpenStreetMap Nominatim (free, no key).
# Run locally:  pip install requests  &&  python geocode.py
# Nominatim allows ~1 request/second, so this takes about 30 seconds.
import json, time, requests

data = json.load(open("sources.json"))
for s in data["sources"]:
    if s["lat"] is not None or not s["address"] or "TBD" in s["address"] or "&" in s["address"]:
        continue
    street = s["address"].split(" (")[0]  # drop "(Town Green)" style notes
    q = f"{street}, {s['city']}, CT {s['zip'] or ''}"
    r = requests.get("https://nominatim.openstreetmap.org/search",
                     params={"q": q, "format": "json", "limit": 1},
                     headers={"User-Agent": "hartford-fresh-food-hackathon"})
    hits = r.json()
    if hits:
        s["lat"], s["lng"] = float(hits[0]["lat"]), float(hits[0]["lon"])
        print("OK  ", s["name"], s["lat"], s["lng"])
    else:
        print("MISS", s["name"], "->", q)
    time.sleep(1.1)

json.dump(data, open("sources.json", "w"), indent=2)
print("Done. Spot-check a few pins on a map before the demo.")
