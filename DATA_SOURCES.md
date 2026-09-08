# CRIMEGRAPH AI — Data Sources & Provenance

## Repository inspection result

The supplied working directory is a clone of `erichoang/criminal-network-visualization`, despite the pasted brief naming `https://github.com/lightbluetitan/crimedatasets`. No R package metadata (`DESCRIPTION`, `NAMESPACE`) or R/RDA files were present. The prior project's top-level Python components and source assets were inspected before new application files were added.

The legacy project has been retained as source context, but it is no longer the main architecture. CRIMEGRAPH AI lives in `backend/` and `frontend/`.

## Dataset inventory and mapping

| Dataset/resource | Classification | Status in CRIMEGRAPH AI | Rationale |
| --- | --- | --- | --- |
| Israel LEA burglary offender/crime network JSON | A. Person/criminal, B. Crime/event, C. Location, I. Temporal | Preserved reference | Anonymised IDs, dates and scaled locations are useful source-context examples, but they are not mapped to fictional live profiles. |
| Israel LEA case 1/2 speakers JSON | G. Communication | Preserved reference | Provides anonymised call/SMS network structure. |
| NIST C1/C2 JSON | G. Communication | Preserved reference | Large anonymised communication networks; unsuitable for direct hackathon UI loading. |
| Madoff JSON | F. Financial/transaction, E. Network | Preserved reference | Financial-flow network design reference; source entities are not mixed into the fictional demo. |
| Montreal gangs JSON | D. Organisation, E. Network/relationship | Preserved reference | Group contact network; terminology and historical context require careful re-use. |
| CSI India episodes JSON | G. Communication, B. Event | Preserved reference | Fictional TV-character conversation dataset, not an investigative record. |
| 911 hijackers, BBC Islam groups, Rhodes bombing, Moreno crime, Noordintop and baseball steroid JSON | J. Unsuitable for live demo | Preserved only | Heterogeneous historical/sensitive/fictional material without safe unified schema coverage for this prototype. |
| `data/demo/demo_*.json` | A–I, normalised demo layer | **Live application data** | Deterministic fictional entities and graph relationships made expressly for the hackathon workflow. |

## Transformations

1. Legacy datasets remain untouched in `datasets/preprocessed/` and are documented as NetworkX JSON/NDJSON references.
2. `backend/app/data.py` defines a normalized model for `people`, `organizations`, `locations`, `vehicles`, `phone_numbers`, `crimes`, `transactions`, `communications`, `events`, `relationships` and `evidence`.
3. `ensure_demo_data()` writes these application-ready JSON artefacts to `data/demo/` whenever the API starts.
4. Graph metrics use NetworkX over the deterministic demo graph. Influence combines degree, betweenness, PageRank and closeness. Community, alert, risk and path outputs are model-derived indicators.

## Status vocabulary

- `SOURCE_DATASET_REFERENCE`: Original repository files retained for provenance/context; not live evidence in the dashboard.
- `SIMULATED_DEMO`: Fictional records/relationships created for the demo. They are not real-world facts or allegations.
- `MODEL_INFERRED_DEMO`: A calculation over the demo graph, such as a path, centrality score or alert. It is an investigative prioritisation signal only.
- `USER_UPLOAD_PREVIEW`: A local import preview. It is not persisted into the demo graph.

## Limitations

This prototype deliberately does not claim source-derived criminal connections for named people. The example names, organisations, cases and relationships are fictional. Legacy data is heterogeneous, contains anonymised or third-party entities, and is not sufficient to safely support a unified real-world multimodal case graph without data-governance review, authorised source integration, a transformation audit and investigator validation.
