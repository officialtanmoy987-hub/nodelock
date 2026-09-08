"""Network calculations and explainable demo alerts."""
from __future__ import annotations

from collections import Counter
from typing import Any

import networkx as nx


def graph_from(data: dict[str, list[dict[str, Any]]]) -> nx.Graph:
    graph = nx.Graph()
    for collection in ("people", "organizations", "locations", "vehicles", "phone_numbers", "crimes", "transactions", "events", "communications"):
        for item in data[collection]:
            graph.add_node(item["id"], **item)
    for rel in data["relationships"]:
        graph.add_edge(rel["source"], rel["target"], **rel)
    return graph


def calculate_metrics(data: dict[str, list[dict[str, Any]]]) -> dict[str, dict[str, Any]]:
    graph = graph_from(data)
    degree = nx.degree_centrality(graph)
    betweenness = nx.betweenness_centrality(graph)
    closeness = nx.closeness_centrality(graph)
    pagerank = nx.pagerank(graph)
    communities = list(nx.algorithms.community.greedy_modularity_communities(graph))
    community_lookup = {node: f"C{i + 1}" for i, group in enumerate(communities) for node in group}
    result: dict[str, dict[str, Any]] = {}
    for node in graph.nodes:
        influence = 100 * (.30 * degree[node] + .30 * betweenness[node] + .20 * pagerank[node] + .20 * closeness[node])
        result[node] = {
            "degree_centrality": round(degree[node], 4), "betweenness_centrality": round(betweenness[node], 4),
            "closeness_centrality": round(closeness[node], 4), "pagerank": round(pagerank[node], 4),
            "influence_score": round(min(100, influence * 2.6), 1), "connections": graph.degree[node],
            "community": community_lookup[node],
        }
    return result


def build_alerts(data: dict[str, list[dict[str, Any]]], metrics: dict[str, dict[str, Any]]) -> list[dict[str, Any]]:
    ranked = sorted(data["people"], key=lambda person: metrics[person["id"]]["betweenness_centrality"], reverse=True)
    bridge = ranked[0]
    return [
        {"id": "AL001", "severity": "CRITICAL", "title": "Bridge node detected between network clusters", "entity_id": bridge["id"], "score": 91, "reason": f"{bridge['name']} has the strongest bridge score across simulated communities and connects communication, vehicle and transaction pathways.", "supporting_entities": ["P002", "P004", "P005", "P011"], "supporting_relationships": ["ASSOCIATED_WITH", "COMMUNICATED_WITH", "TRANSACTED_WITH"], "data_status": "MODEL_INFERRED_DEMO", "evidence": ["EV001", "EV065"]},
        {"id": "AL002", "severity": "HIGH", "title": "Unusual communication concentration", "entity_id": "P001", "score": 84, "reason": "A simulated six-hour window contains 24 contacts across multiple entity types; review source records before acting.", "supporting_entities": ["P002", "P014", "M006"], "supporting_relationships": ["COMMUNICATED_WITH"], "data_status": "SIMULATED_DEMO", "evidence": ["EV082"]},
        {"id": "AL003", "severity": "HIGH", "title": "Repeated cross-community co-location", "entity_id": "P005", "score": 79, "reason": "Simulated event records place entities from transport and financial communities at shared locations.", "supporting_entities": ["P007", "P013", "E004", "L006"], "supporting_relationships": ["CO_OCCURED_WITH", "LOCATED_AT"], "data_status": "SIMULATED_DEMO", "evidence": ["EV109"]},
        {"id": "AL004", "severity": "MEDIUM", "title": "Transaction-chain review signal", "entity_id": "P004", "score": 68, "reason": "Two simulated transaction paths overlap with an irregular-invoice case node.", "supporting_entities": ["P001", "P011", "T001", "T005", "C003"], "supporting_relationships": ["TRANSACTED_WITH", "CONNECTED_TO"], "data_status": "SIMULATED_DEMO", "evidence": ["EV095"]},
        {"id": "AL005", "severity": "LOW", "title": "High-centrality entity", "entity_id": "P011", "score": 52, "reason": "Graph centrality is elevated in the demo network. This is an analytical prioritisation signal, not proof.", "supporting_entities": ["P001", "P003", "P014"], "supporting_relationships": ["ASSOCIATED_WITH"], "data_status": "MODEL_INFERRED_DEMO", "evidence": ["EV061"]},
    ]


def activity_series(data: dict[str, list[dict[str, Any]]]) -> list[dict[str, Any]]:
    dates = Counter(item.get("date", rel.get("first_seen", "")) for item in data["events"] + data["transactions"] + data["communications"] for rel in [{}])
    return [{"date": date, "activity": count} for date, count in sorted(dates.items())]


def shortest_path(data: dict[str, list[dict[str, Any]]], source: str, target: str) -> list[str]:
    graph = graph_from(data)
    try:
        return nx.shortest_path(graph, source, target)
    except (nx.NetworkXNoPath, nx.NodeNotFound):
        return []
