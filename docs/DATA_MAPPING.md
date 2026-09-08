# Internal Dataset Mapping

## Useful legacy assets identified

The initial repository inspection covered top-level directories, Python package files, `README.md`, tests, visualizer documentation, legacy dependency files and all available `datasets/preprocessed` JSON/NDJSON names. It contains no R source or R package structure, contrary to the supplied task text.

| Classification | Assets | How CRIMEGRAPH uses them |
| --- | --- | --- |
| A. Person/criminal data | Anonymised Israel burglary offender network | Source-pattern reference only; no profile is represented as source-derived in UI. |
| B. Crime/event data | Israel burglary crime network, Rhodes bombing, CSI episodes | Schema/reference context only. |
| C. Location data | Israel burglary (scaled coordinates), Montreal territory labels | Schema/reference context only. |
| D. Organisation data | Montreal group labels, Madoff firms | Schema/reference context only. |
| E. Network/relationship data | All NetworkX/NDJSON graph files | Motivated the normalized `relationships` model. |
| F. Financial data | Madoff money-flow graph | Motivated fictional transaction entities. |
| G. Communication data | Israel case speakers, NIST, CSI | Motivated fictional phone/communication nodes. |
| H. Vehicle data | None found | Filled with clearly fictional simulated records. |
| I. Temporal data | Israel burglary timestamps, event dates | Motivated the timeline model. |
| J. Unsuitable | Sensitive/historical/third-party datasets and non-investigative steroid/baseball data | Retained untouched; omitted from live graph. |

## Normalised schema implementation

All normalised records contain stable IDs, `data_status` and `source_ids`. Relationships additionally contain `type`, `strength`, `confidence`, `evidence_ids`, `first_seen` and `last_seen`. Evidence records explicitly describe their simulated source. The API makes this model available through focused entity, network, analytics, evidence and report endpoints.

## Demo layer design

The deterministic seed includes 60+ entities and 100+ relationships across three fictional clusters:

- Community 1: trading/vehicle coordination
- Community 2: financial/intermediary activity
- Community 3: freight/transport activity

Bridge entities and shared phones, vehicles, locations, events, transaction patterns and communication patterns create a meaningful, transparent graph. Every relationship and supporting record is `SIMULATED_DEMO`.
