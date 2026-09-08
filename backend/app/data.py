"""Deterministic, clearly labelled demo data for the CRIMEGRAPH AI prototype."""
from __future__ import annotations

import json
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[2]
DEMO_DIR = ROOT / "data" / "demo"
DEMO_STATUS = "SIMULATED_DEMO"


def _record(identifier: str, name: str, kind: str, **extra: Any) -> dict[str, Any]:
    return {
        "id": identifier,
        "name": name,
        "entity_type": kind,
        "data_status": DEMO_STATUS,
        "source_ids": ["DEMO-NETWORK-2026"],
        **extra,
    }


def build_demo_data() -> dict[str, list[dict[str, Any]]]:
    """Create a connected fictional intelligence graph; it contains no real allegations."""
    people_seed = [
        ("P001", "Rahul Sharma", ["R. Sharma", "Rahul K Sharma"], 34, "North District", "Logistics contractor", 78, "C1"),
        ("P002", "Arjun Mehta", ["A. Mehta"], 31, "Old City", "Vehicle broker", 72, "C1"),
        ("P003", "Manoj Singh", ["M. Singh"], 38, "Riverside", "Warehouse assistant", 67, "C1"),
        ("P004", "Aisha Khan", ["A. Khan"], 29, "Central Ward", "Bookkeeper", 64, "C2"),
        ("P005", "Dev Patel", ["D. Patel"], 42, "East Market", "Freight dispatcher", 74, "C3"),
        ("P006", "Isha Verma", ["I. Verma"], 33, "North District", "Retail manager", 49, "C2"),
        ("P007", "Kabir Nair", ["K. Nair"], 36, "Harbor Zone", "Driver", 61, "C3"),
        ("P008", "Priya Das", ["P. Das"], 27, "Old City", "Accounts assistant", 45, "C2"),
        ("P009", "Rohan Kapoor", ["R. Kapoor"], 40, "Industrial Belt", "Mechanic", 58, "C3"),
        ("P010", "Sana Ali", ["S. Ali"], 35, "Central Ward", "Consultant", 53, "C2"),
        ("P011", "Vikram Rao", ["V. Rao"], 46, "Riverside", "Property manager", 70, "C1"),
        ("P012", "Neha Bose", ["N. Bose"], 30, "East Market", "Courier coordinator", 55, "C3"),
        ("P013", "Imran Qureshi", ["I. Qureshi"], 39, "Harbor Zone", "Importer", 69, "C3"),
        ("P014", "Tara Sen", ["T. Sen"], 28, "North District", "Communications analyst", 47, "C1"),
    ]
    people = [
        _record(i, n, "PERSON", aliases=a, age=age, gender="Unspecified", location=loc,
                occupation=job, criminal_history=[], risk_score=risk, community=community,
                match_confidence=0.88 if i == "P001" else 1.0)
        for i, n, a, age, loc, job, risk, community in people_seed
    ]
    organizations = [
        _record("O001", "Orion Freight Cooperative", "ORGANIZATION", category="Logistics", location_id="L003", community="C3"),
        _record("O002", "Northstar Trading Circle", "ORGANIZATION", category="Trading", location_id="L001", community="C1"),
        _record("O003", "Civic Market Association", "ORGANIZATION", category="Commercial", location_id="L004", community="C2"),
        _record("O004", "Harbor Link Services", "ORGANIZATION", category="Transport", location_id="L006", community="C3"),
        _record("O005", "Silver Ledger Consultants", "ORGANIZATION", category="Financial services", location_id="L002", community="C2"),
        _record("O006", "Metro Vehicle Exchange", "ORGANIZATION", category="Vehicle services", location_id="L005", community="C1"),
    ]
    locations = [
        _record("L001", "North District Depot", "LOCATION", area="North District", latitude=26.177, longitude=91.739),
        _record("L002", "Central Ward Office", "LOCATION", area="Central Ward", latitude=26.182, longitude=91.748),
        _record("L003", "East Market Warehouse", "LOCATION", area="East Market", latitude=26.190, longitude=91.755),
        _record("L004", "Old City Arcade", "LOCATION", area="Old City", latitude=26.168, longitude=91.732),
        _record("L005", "Riverside Garage", "LOCATION", area="Riverside", latitude=26.161, longitude=91.765),
        _record("L006", "Harbor Zone Gate", "LOCATION", area="Harbor Zone", latitude=26.201, longitude=91.776),
        _record("L007", "Intercity Rail Station", "LOCATION", area="Transit", latitude=26.174, longitude=91.745),
        _record("L008", "Industrial Belt Yard", "LOCATION", area="Industrial Belt", latitude=26.208, longitude=91.724),
    ]
    vehicles = [
        _record("V001", "DL-7C-DM-2048", "VEHICLE", vehicle_type="Cargo van", color="White"),
        _record("V002", "AS-01-TX-4810", "VEHICLE", vehicle_type="Motorcycle", color="Black"),
        _record("V003", "DL-3C-TR-9017", "VEHICLE", vehicle_type="Pickup", color="Grey"),
        _record("V004", "AS-01-QR-7732", "VEHICLE", vehicle_type="Sedan", color="Blue"),
        _record("V005", "WB-08-LN-1186", "VEHICLE", vehicle_type="Truck", color="Red"),
        _record("V006", "DL-9A-KP-6621", "VEHICLE", vehicle_type="SUV", color="Silver"),
    ]
    phone_numbers = [
        _record(f"PH{i:03}", n, "PHONE", number=n, carrier="Demo Telecom")
        for i, n in enumerate(["9876543210", "9811002201", "9822113402", "9867014503", "9898015604", "9800016705", "9912017806", "9923018907", "9934019018", "9945020129", "9956031230", "9967042341"], 1)
    ]
    crimes = [
        _record("C001", "Case DG-204: Warehouse Inventory Loss", "CRIME", category="Property incident", date="2026-05-11", location_id="L003", status="Open analytical lead"),
        _record("C002", "Case DG-217: Vehicle Diversion", "CRIME", category="Transport anomaly", date="2026-05-22", location_id="L006", status="Open analytical lead"),
        _record("C003", "Case DG-231: Irregular Invoice Chain", "CRIME", category="Financial anomaly", date="2026-06-02", location_id="L002", status="Under review"),
        _record("C004", "Case DG-245: Repeated Co-location", "CRIME", category="Pattern observation", date="2026-06-12", location_id="L007", status="Under review"),
        _record("C005", "Case DG-256: Cargo Routing Exception", "CRIME", category="Transport anomaly", date="2026-06-18", location_id="L008", status="Open analytical lead"),
        _record("C006", "Case DG-268: Unusual Contact Pattern", "CRIME", category="Communication anomaly", date="2026-07-01", location_id="L004", status="Open analytical lead"),
        _record("C007", "Case DG-279: Account Activity Review", "CRIME", category="Financial anomaly", date="2026-07-15", location_id="L001", status="Under review"),
    ]
    transactions = [
        _record(f"T{i:03}", f"Transaction TR-{300+i}", "TRANSACTION", amount=amount, currency="INR", date=date, pattern="Simulated review signal")
        for i, (amount, date) in enumerate([(48500, "2026-05-13"), (72000, "2026-05-25"), (33000, "2026-06-03"), (96000, "2026-06-19"), (41500, "2026-07-02"), (68000, "2026-07-17")], 1)
    ]
    events = [
        _record(f"E{i:03}", title, "EVENT", date=date, location_id=loc, event_type="Observed demo event")
        for i, (title, date, loc) in enumerate([
            ("Depot meeting observation", "2026-05-10", "L001"), ("Warehouse access log", "2026-05-11", "L003"),
            ("Rail station co-location", "2026-06-12", "L007"), ("Harbor gate movement", "2026-06-18", "L006"),
            ("Central office visit", "2026-06-22", "L002"), ("Market contact pattern", "2026-07-01", "L004"),
            ("Industrial yard observation", "2026-07-15", "L008")
        ], 1)
    ]
    communications = [
        _record(f"M{i:03}", f"Communication log {i:02}", "COMMUNICATION", channel=channel, date=date, frequency=freq)
        for i, (channel, date, freq) in enumerate([
            ("Call", "2026-05-10", 8), ("SMS", "2026-05-11", 12), ("Call", "2026-05-21", 5), ("SMS", "2026-05-25", 17),
            ("Call", "2026-06-02", 9), ("Call", "2026-06-12", 24), ("SMS", "2026-06-18", 14), ("Call", "2026-06-22", 6),
            ("SMS", "2026-07-01", 19), ("Call", "2026-07-15", 11)
        ], 1)
    ]
    relationships: list[dict[str, Any]] = []
    evidence: list[dict[str, Any]] = []

    def add(source: str, target: str, relationship_type: str, strength: float = .76,
            confidence: float = .84, date: str = "2026-06-12", note: str = "Demo-generated relationship for investigation workflow.") -> None:
        rid = f"R{len(relationships) + 1:03}"
        eid = f"EV{len(evidence) + 1:03}"
        evidence.append({"id": eid, "relationship_id": rid, "title": "Simulated demo source record", "source_type": "DEMO_NETWORK", "summary": note, "observed_at": date, "data_status": DEMO_STATUS, "confidence": confidence})
        relationships.append({"id": rid, "source": source, "target": target, "type": relationship_type, "strength": strength, "confidence": confidence, "evidence_ids": [eid], "first_seen": date, "last_seen": date, "data_status": DEMO_STATUS})

    memberships = [("P001", "O002"), ("P002", "O006"), ("P003", "O001"), ("P004", "O005"), ("P005", "O001"), ("P006", "O003"), ("P007", "O004"), ("P008", "O005"), ("P009", "O006"), ("P010", "O003"), ("P011", "O002"), ("P012", "O004"), ("P013", "O004"), ("P014", "O002")]
    for source, target in memberships: add(source, target, "MEMBER_OF", .75)
    for idx, person in enumerate(people[:12]): add(person["id"], phone_numbers[idx]["id"], "USED", .82, .91)
    for person, location in [("P001", "L001"), ("P002", "L005"), ("P003", "L003"), ("P004", "L002"), ("P005", "L008"), ("P006", "L004"), ("P007", "L006"), ("P008", "L004"), ("P009", "L005"), ("P010", "L002"), ("P011", "L001"), ("P012", "L003"), ("P013", "L006"), ("P014", "L007")]: add(person, location, "LOCATED_AT", .69)
    for person, vehicle in [("P001", "V001"), ("P002", "V002"), ("P005", "V005"), ("P007", "V003"), ("P009", "V004"), ("P011", "V006")]: add(person, vehicle, "OWNS", .81, .9)
    for person, crime in [("P001", "C001"), ("P002", "C002"), ("P003", "C001"), ("P004", "C003"), ("P005", "C005"), ("P007", "C002"), ("P009", "C005"), ("P010", "C003"), ("P011", "C007"), ("P013", "C002"), ("P014", "C004")]: add(person, crime, "INVOLVED_IN", .64, .72, note="Simulated association requiring investigator verification.")
    associations = [("P001", "P002"), ("P001", "P003"), ("P001", "P004"), ("P001", "P011"), ("P001", "P014"), ("P002", "P003"), ("P002", "P007"), ("P003", "P011"), ("P004", "P008"), ("P004", "P010"), ("P005", "P007"), ("P005", "P009"), ("P005", "P012"), ("P005", "P013"), ("P007", "P013"), ("P009", "P012"), ("P011", "P014"), ("P006", "P008"), ("P010", "P014"), ("P012", "P013")]
    for source, target in associations: add(source, target, "ASSOCIATED_WITH", .72, .78)
    comm_pairs = [("P001", "P002"), ("P001", "P014"), ("P002", "P007"), ("P003", "P011"), ("P004", "P010"), ("P005", "P007"), ("P005", "P013"), ("P007", "P012"), ("P009", "P012"), ("P011", "P014")]
    for idx, (source, target) in enumerate(comm_pairs):
        message = communications[idx]
        add(source, target, "COMMUNICATED_WITH", .67 + (idx % 3) * .08, .79, message["date"], f"Simulated {message['channel'].lower()} pattern: {message['frequency']} contacts.")
        add(source, message["id"], "CONNECTED_TO", .7, .83, message["date"])
        add(target, message["id"], "CONNECTED_TO", .7, .83, message["date"])
    for idx, (source, target) in enumerate([("P004", "P001"), ("P001", "P005"), ("P005", "P013"), ("P008", "P010"), ("P011", "P004"), ("P013", "P007")]):
        transaction = transactions[idx]
        add(source, target, "TRANSACTED_WITH", .73, .81, transaction["date"], f"Simulated transaction pattern of INR {transaction['amount']:,}.")
        add(source, transaction["id"], "CONNECTED_TO", .72, .8, transaction["date"])
        add(target, transaction["id"], "CONNECTED_TO", .72, .8, transaction["date"])
    event_groups = [("E001", ["P001", "P002", "P011"]), ("E002", ["P001", "P003", "P012"]), ("E003", ["P001", "P014", "P004"]), ("E004", ["P005", "P007", "P013"]), ("E005", ["P004", "P010", "P008"]), ("E006", ["P002", "P006", "P009"]), ("E007", ["P005", "P009", "P012"])]
    for event, participants in event_groups:
        for person in participants: add(person, event, "CO_OCCURED_WITH", .66, .76)
    for org in organizations: add(org["id"], org["location_id"], "LOCATED_AT", .8, .9)
    for vehicle, location in [("V001", "L003"), ("V002", "L007"), ("V003", "L006"), ("V004", "L005"), ("V005", "L008"), ("V006", "L001")]: add(vehicle, location, "LOCATED_AT", .66)

    return {"people": people, "organizations": organizations, "locations": locations, "vehicles": vehicles, "phone_numbers": phone_numbers, "crimes": crimes, "transactions": transactions, "events": events, "communications": communications, "relationships": relationships, "evidence": evidence}


def ensure_demo_data() -> dict[str, list[dict[str, Any]]]:
    data = build_demo_data()
    DEMO_DIR.mkdir(parents=True, exist_ok=True)
    for name, records in data.items():
        (DEMO_DIR / f"demo_{name}.json").write_text(json.dumps(records, indent=2), encoding="utf-8")
    return data
