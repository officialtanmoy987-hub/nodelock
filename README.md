# CRIMEGRAPH AI

## AI-Powered Criminal Network Intelligence & Investigation Platform

CRIMEGRAPH AI is a local-first hackathon demonstration that turns fragmented records into an explainable relationship graph. It is an investigative decision-support prototype: it surfaces **analytical leads**, never conclusions about real people.

> **Ethical demo notice:** The live CRIMEGRAPH network is deterministic and fictional. Every relationship is marked `SIMULATED_DEMO`; centrality, anomaly and path outputs are marked `MODEL_INFERRED_DEMO` where appropriate. These outputs require investigator verification and must never be treated as proof of wrongdoing.

## Features

- Command-center dashboard with entity, relationship, event, location and alert signals
- Interactive, filterable multi-modal graph for people, organisations, locations, vehicles, phones, events, transactions and communications
- Entity profiles, connections, timelines, evidence links and generated intelligence reports
- Search with normalised/fuzzy matching candidates and alias support
- NetworkX degree, betweenness, closeness, PageRank, community detection, components and shortest-path analysis
- Explainable alerts plus a lightweight rule-based NLP endpoint
- CSV/JSON ingestion preview that does not mutate the deterministic demo

## Architecture

```text
React + Vite dashboard  ── HTTP/JSON ──>  FastAPI service
       interactive SVG graph                  │
                                                ├─ NetworkX analytics
                                                ├─ deterministic demo generator
                                                └─ JSON artefacts in data/demo/
```

## Quick start

Open two terminals from this repository.

```powershell
# Terminal 1 — API (Python 3.10+)
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r backend\requirements.txt
python backend\run.py
```

```powershell
# Terminal 2 — dashboard (Node 20+)
cd frontend
npm.cmd install
npm.cmd run dev
```

Visit `http://localhost:5173`. The API documentation is at `http://127.0.0.1:8000/docs`. See [RUNNING.md](RUNNING.md) for exact verification commands.

## Suggested demo workflow

1. Open **Command Center** and inspect priority alerts and influence ranking.
2. Search **Rahul Sharma** (fictional demo subject) and open the profile.
3. Select **Generate report** to download an explainable JSON investigation brief.
4. Open **Network Graph**, choose *Find connection*, or limit the view to suspicious links.
5. Inspect an alert to see its score, supporting entity IDs, relationship types and data status.
6. Use **Data Import** to preview a CSV or JSON source locally.

## Data sources and provenance

The checkout contains a prior criminal-network-visualisation repository, not the `lightbluetitan/crimedatasets` R package named in the brief. It has no R package `DESCRIPTION`, `NAMESPACE`, `.R` or `.rda` files. Its preserved source data is kept untouched under `datasets/preprocessed/`.

Useful preserved resources include anonymised burglary network data, anonymised telephone traffic networks, CSI character conversation networks, Montreal group network data and the Madoff financial-flow network. Their formats are NetworkX JSON/NDJSON. The current UI does not render them as person-level evidence: that would risk wrongly recontextualising heterogeneous records.

The frontend uses only the fictional demo layer generated into `data/demo/` at API startup. Details, mapping and limitations are in [DATA_SOURCES.md](DATA_SOURCES.md) and [docs/DATA_MAPPING.md](docs/DATA_MAPPING.md).

## Project layout

```text
backend/               FastAPI API, analytics and demo-data generator
frontend/              React/Vite intelligence dashboard
data/demo/             Generated normalised JSON demo artefacts
datasets/preprocessed/ Preserved legacy NetworkX/NDJSON source datasets
docs/                  Data mapping and implementation documentation
```

## Limitations

- This is a local, deterministic demo. It has no authentication, case management or production audit log.
- The ingestion screen previews source structure; it intentionally does not persist uploads to the seeded graph.
- Rule-based NLP extracts candidates and requires human review; it is not a forensic NLP system.
- The graph is a custom SVG implementation for zero-config startup; it is suitable for the demo-scale dataset, not very large graphs.
- No model or alert makes an allegation or establishes criminality.
