"""FastAPI service for the self-contained CRIMEGRAPH AI hackathon demo."""
from __future__ import annotations

from difflib import SequenceMatcher
from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .analytics import activity_series, build_alerts, calculate_metrics, graph_from, shortest_path
from .data import DEMO_STATUS, ensure_demo_data

app = FastAPI(title="NODELOCK", version="1.0.0", description="NODELOCK investigation intelligence platform.")
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
DATA = ensure_demo_data()
METRICS = calculate_metrics(DATA)
ALERTS = build_alerts(DATA, METRICS)


def all_entities() -> list[dict[str, Any]]:
    return [item for name, records in DATA.items() if name not in {"relationships", "evidence"} for item in records]


def entity(identifier: str) -> dict[str, Any]:
    found = next((item for item in all_entities() if item["id"] == identifier), None)
    if not found:
        raise HTTPException(404, "Entity not found")
    return {**found, "analytics": METRICS.get(identifier, {})}


def profile(identifier: str) -> dict[str, Any]:
    subject = entity(identifier)
    connected = [rel for rel in DATA["relationships"] if identifier in (rel["source"], rel["target"])]
    ids = {rel["source"] if rel["target"] == identifier else rel["target"] for rel in connected}
    related = [entity(item_id) for item_id in ids]
    evidence_ids = {item for rel in connected for item in rel["evidence_ids"]}
    return {**subject, "connections": related, "relationships": connected, "evidence": [e for e in DATA["evidence"] if e["id"] in evidence_ids], "alerts": [alert for alert in ALERTS if alert["entity_id"] == identifier]}


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "mode": "simulated_demo"}


@app.get("/api/dashboard")
def dashboard() -> dict[str, Any]:
    person_rows = sorted([{
        "id": person["id"], "name": person["name"], "type": "PERSON", "risk_score": person["risk_score"],
        **METRICS[person["id"]], "alert_status": next((a["severity"] for a in ALERTS if a["entity_id"] == person["id"]), "MONITOR")
    } for person in DATA["people"]], key=lambda item: item["influence_score"], reverse=True)
    return {"metrics": {"persons": len(DATA["people"]), "relationships": len(DATA["relationships"]), "crime_events": len(DATA["crimes"]), "locations": len(DATA["locations"]), "organizations": len(DATA["organizations"]), "active_alerts": len(ALERTS)}, "top_entities": person_rows[:8], "alerts": ALERTS, "activity": activity_series(DATA), "categories": [{"name": "Transport", "value": 31}, {"name": "Communications", "value": 28}, {"name": "Financial", "value": 21}, {"name": "Co-location", "value": 20}], "data_notice": "All live graph records in this demo are simulated or model-inferred analytical leads, never verified allegations."}


@app.get("/api/entities")
def entities(kind: str | None = None) -> list[dict[str, Any]]:
    records = all_entities()
    if kind:
        records = [item for item in records if item["entity_type"] == kind.upper()]
    return [{**item, "analytics": METRICS.get(item["id"], {})} for item in records]


@app.get("/api/people")
def people() -> list[dict[str, Any]]:
    return [{**person, "analytics": METRICS[person["id"]]} for person in DATA["people"]]


@app.get("/api/people/{person_id}")
def get_person(person_id: str) -> dict[str, Any]:
    return profile(person_id)


@app.get("/api/people/{person_id}/network")
def person_network(person_id: str, depth: int = 1) -> dict[str, Any]:
    entity(person_id)
    graph = graph_from(DATA)
    if depth not in (1, 2, 3): depth = 1
    visible = {person_id}
    frontier = {person_id}
    for _ in range(depth):
        frontier = {neighbor for node in frontier for neighbor in graph.neighbors(node)} - visible
        visible.update(frontier)
    return graph_payload(visible)


@app.get("/api/relationships")
def relationships() -> list[dict[str, Any]]:
    return DATA["relationships"]


@app.get("/api/network")
def network() -> dict[str, Any]:
    return graph_payload({item["id"] for item in all_entities()})


def graph_payload(visible: set[str]) -> dict[str, Any]:
    return {"nodes": [{**item, "analytics": METRICS.get(item["id"], {})} for item in all_entities() if item["id"] in visible], "edges": [rel for rel in DATA["relationships"] if rel["source"] in visible and rel["target"] in visible], "data_status": DEMO_STATUS}


@app.get("/api/crimes")
def crimes() -> list[dict[str, Any]]: return DATA["crimes"]

@app.get("/api/locations")
def locations() -> list[dict[str, Any]]: return DATA["locations"]


@app.get("/api/organizations")
def organizations() -> list[dict[str, Any]]: return DATA["organizations"]


@app.get("/api/transactions")
def transactions() -> list[dict[str, Any]]: return DATA["transactions"]


@app.get("/api/evidence")
def evidence() -> list[dict[str, Any]]: return DATA["evidence"]


@app.get("/api/risk/{person_id}")
def risk(person_id: str) -> dict[str, Any]:
    item = next((person for person in DATA["people"] if person["id"] == person_id), None)
    if not item: raise HTTPException(404, "Person not found")
    return {"person_id": person_id, "investigation_risk_score": item["risk_score"], "influence_score": METRICS[person_id]["influence_score"], "disclaimer": "Risk is a demo analytical prioritisation score. It is not evidence of wrongdoing or proof of criminality.", "data_status": DEMO_STATUS}


@app.get("/api/search")
def search(q: str = "") -> list[dict[str, Any]]:
    query = " ".join(q.lower().split())
    if not query: return []
    results = []
    for item in all_entities():
        terms = [item["name"], item["id"], *item.get("aliases", [])]
        score = max(SequenceMatcher(None, query, term.lower()).ratio() for term in terms)
        if query in " ".join(terms).lower() or score >= .52:
            results.append({**item, "match_confidence": round(score, 2), "analytics": METRICS.get(item["id"], {})})
    return sorted(results, key=lambda item: item["match_confidence"], reverse=True)[:12]


@app.get("/api/network/analyze")
def analyze() -> dict[str, Any]:
    graph = graph_from(DATA)
    return {"node_count": graph.number_of_nodes(), "edge_count": graph.number_of_edges(), "connected_components": nx_connected(graph), "metrics": METRICS, "methodology": "Influence = 30% degree + 30% betweenness + 20% PageRank + 20% closeness, normalised for this demo graph.", "data_status": "MODEL_INFERRED_DEMO"}


def nx_connected(graph: Any) -> list[list[str]]:
    import networkx as nx
    return [sorted(group) for group in nx.connected_components(graph)]


@app.get("/api/path")
def path(source: str, target: str) -> dict[str, Any]:
    route = shortest_path(DATA, source, target)
    return {"path": route, "found": bool(route), "data_status": "MODEL_INFERRED_DEMO", "disclaimer": "Path is calculated from simulated demo records and should be independently verified."}


class Note(BaseModel):
    text: str


@app.post("/api/nlp/extract")
def extract(note: Note) -> dict[str, Any]:
    import re
    text = note.text.strip()
    known = all_entities()
    found = [{"text": item["name"], "type": item["entity_type"], "entity_id": item["id"], "confidence": .91} for item in known if item["name"].lower() in text.lower()]
    for number in re.findall(r"(?<!\d)\d{10}(?!\d)", text):
        found.append({"text": number, "type": "PHONE", "entity_id": None, "confidence": .98})
    for candidate in re.findall(r"\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2}\b", text):
        if not any(entity["text"].lower() == candidate.lower() for entity in found):
            found.append({"text": candidate, "type": "PERSON_CANDIDATE", "entity_id": None, "confidence": .55})
    relationships = []
    people_found = [item for item in found if item["type"] in {"PERSON", "PERSON_CANDIDATE"}]
    if len(people_found) > 1:
        for a, b in zip(people_found, people_found[1:]): relationships.append({"source": a["text"], "target": b["text"], "type": "POSSIBLE_ASSOCIATION", "confidence": .58, "data_status": "MODEL_INFERRED_DEMO"})
    return {"entities": found, "relationships": relationships, "disclaimer": "Rule-based extraction identifies candidates only; confirm names, context and relationships before use."}


class Investigation(BaseModel):
    subject_id: str


@app.post("/api/investigate")
def investigate(request: Investigation) -> dict[str, Any]:
    subject = profile(request.subject_id)
    return {"report_id": f"REP-{request.subject_id}-2026", "investigation_subject": subject["name"], "executive_summary": f"{subject['name']} is an analytical priority in a fictional simulated network due to its connection pattern. This report contains investigative leads only, not findings of fact.", "key_entities": [{"id": item["id"], "name": item["name"], "type": item["entity_type"]} for item in subject["connections"][:10]], "important_relationships": subject["relationships"][:12], "network_structure": subject["analytics"], "suspicious_patterns": subject["alerts"], "timeline": sorted([{ "date": rel["first_seen"], "relationship": rel["type"], "with": rel["target"] if rel["source"] == request.subject_id else rel["source"]} for rel in subject["relationships"]], key=lambda item: item["date"]), "evidence": subject["evidence"][:12], "data_provenance": "All relationship records and scores in this report are SIMULATED_DEMO or MODEL_INFERRED_DEMO.", "confidence_limitations": "Do not use this demo output as evidence or to make determinations about real people."}


class ImportPayload(BaseModel):
    file_name: str
    source_type: str
    records: list[dict[str, Any]] = []


@app.post("/api/import")
def import_preview(payload: ImportPayload) -> dict[str, Any]:
    columns = list(payload.records[0].keys()) if payload.records else []
    entity_hints = sum(1 for col in columns if col.lower() in {"name", "person", "phone", "location", "vehicle", "organization"})
    return {"file": payload.file_name, "source_type": payload.source_type, "records": len(payload.records), "detected_entity_fields": entity_hints, "detected_relationship_fields": sum(1 for col in columns if col.lower() in {"source", "target", "from", "to", "caller", "receiver"}), "status": "Preview processed â€” no records were added to the deterministic demo graph.", "data_status": "USER_UPLOAD_PREVIEW"}

