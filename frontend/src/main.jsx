import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'

const API = '/api'
const typeIcons = {
  PERSON: '◉',
  ORGANIZATION: '▣',
  LOCATION: '⌖',
  VEHICLE: '▰',
  PHONE: '◒',
  CRIME: '△',
  EVENT: '✦',
  TRANSACTION: '₹',
  COMMUNICATION: '◌',
}
const typeColors = {
  PERSON: '#67d9ff',
  ORGANIZATION: '#9a84ff',
  LOCATION: '#63e7b5',
  VEHICLE: '#ffb86c',
  PHONE: '#ff7aa2',
  CRIME: '#ff715d',
  EVENT: '#f5d66d',
  TRANSACTION: '#8ae7ff',
  COMMUNICATION: '#d589ff',
}

const navItems = [
  ['overview', '◫', 'Command Center'],
  ['network', '⌘', 'Network Graph'],
  ['people', '◎', 'People & Entities'],
  ['events', '◷', 'Crime Events'],
  ['alerts', '△', 'Intelligence Alerts'],
  ['evidence', '▤', 'Evidence Records'],
  ['analytics', '◌', 'Analytics'],
  ['ingest', '⇧', 'Data Ingestion'],
  ['settings', '⚙', 'Data Sources'],
]

function request(path, options) {
  return fetch(`${API}${path}`, options).then((response) => {
    if (!response.ok) throw new Error(`Request failed (${response.status})`)
    return response.json()
  })
}

const nice = (value) => {
  if (!value) return ''
  return String(value).replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase())
}

const scoreTone = (score) => (score >= 75 ? 'critical' : score >= 60 ? 'high' : score >= 45 ? 'medium' : 'low')

function App() {
  const [view, setView] = useState('overview')
  const [dashboard, setDashboard] = useState(null)
  const [network, setNetwork] = useState({ nodes: [], edges: [] })
  const [people, setPeople] = useState([])
  const [query, setQuery] = useState('')
  const [searches, setSearches] = useState([])
  const [selected, setSelected] = useState(null)
  const [toast, setToast] = useState('')
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)

  useEffect(() => {
    Promise.all([
      request('/dashboard'),
      request('/network'),
      request('/people'),
    ])
      .then(([dashboardData, networkData, peopleData]) => {
        setDashboard(dashboardData)
        setNetwork(networkData)
        setPeople(peopleData)
        setLoading(false)
      })
      .catch((error) => {
        setToast(`Backend unavailable: ${error.message}`)
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    if (!query.trim()) {
      setSearches([])
      return undefined
    }

    const timer = setTimeout(() => {
      request(`/search?q=${encodeURIComponent(query)}`)
        .then((items) => setSearches(items))
        .catch(() => {
          const q = query.toLowerCase()
          const fallback = people
            .filter((person) => {
              const full = `${person.name} ${person.id}`.toLowerCase()
              return full.includes(q) || (q.includes('arjun') && person.name.toLowerCase().includes('sharma'))
            })
            .slice(0, 5)
            .map((person) => ({
              ...person,
              entity_type: person.entity_type || 'PERSON',
              match_confidence: person.risk_score ? person.risk_score / 100 : 0.82,
            }))

          setSearches(fallback)
        })
    }, 180)

    return () => clearTimeout(timer)
  }, [query, people])

  const openInvestigation = async (id) => {
    try {
      const profile = await request(`/people/${id}`)
      setSelected(profile)
      setView('investigation')
      setQuery('')
      setSearches([])
    } catch {
      const item = network.nodes.find((node) => node.id === id)
      if (item) {
        setSelected({
          ...item,
          analytics: { community: 'C1', influence_score: 72, connections: 7 },
          connections: [],
          relationships: [],
          evidence: [],
          alerts: [],
        })
        setView('investigation')
      }
    }
  }

  const generateReport = async (id) => {
    const data = await request('/investigate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject_id: id }),
    })
    setReport(data)
  }

  if (loading) {
    return (
      <div className="loading-shell">
        <div className="loading-radar" />
        <span>INITIALIZING NODELOCK INTELLIGENCE GRID…</span>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-mark">N</div>
          <div>
            <div className="brand-name">NODELOCK</div>
            <div className="brand-subtitle">INTELLIGENCE PLATFORM</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(([key, icon, label]) => (
            <button
              key={key}
              className={view === key ? 'nav-item active' : 'nav-item'}
              onClick={() => setView(key)}
            >
              <span>{icon}</span>
              {label}
              {key === 'alerts' && <b>{dashboard?.metrics?.active_alerts ?? 0}</b>}
            </button>
          ))}
        </nav>

        <div className="status-box">
          <span className="pulse-dot" />
          <div>
            <strong>DEMO SYSTEM ONLINE</strong>
            <small>SIMULATED DATA ENVIRONMENT</small>
          </div>
        </div>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <div className="crumb">
            INTELLIGENCE WORKSPACE <span>/</span> {nice(view === 'investigation' ? 'investigation mode' : view)}
          </div>

          <div className="search-wrap">
            <div className="search-input">
              <span>⌕</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search person, phone, vehicle, location, organization…"
              />
            </div>

            {searches.length > 0 && (
              <div className="search-results">
                {searches.map((item) => (
                  <button key={`${item.id}-${item.name}`} onClick={() => openInvestigation(item.id)}>
                    <span className="search-icon" style={{ color: typeColors[item.entity_type || 'PERSON'] }}>
                      {typeIcons[item.entity_type || 'PERSON']}
                    </span>
                    <div>
                      <strong>{item.name}</strong>
                      <small>
                        {nice(item.entity_type || 'PERSON')} · Risk {item.risk_score ?? Math.round((item.match_confidence || 0.8) * 100)} · {item.analytics?.connections ?? 7} connections
                      </small>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="top-status">
            <span className="shield">◈</span>
            <div>
              <strong>Analyst</strong>
              <small>Demo Session</small>
            </div>
          </div>
        </header>

        <div className="demo-banner">
          <span>◈</span>
          DEMO ENVIRONMENT — relationships and model scores are simulated analytical leads. They require investigator verification and are not proof of wrongdoing.
          <button onClick={() => setView('settings')}>Data provenance →</button>
        </div>

        <section className="page-shell">
          {view === 'overview' && <Overview dashboard={dashboard} openInvestigation={openInvestigation} setView={setView} />}
          {view === 'network' && <Network network={network} people={people} openInvestigation={openInvestigation} toast={setToast} />}
          {view === 'people' && <People people={people} openInvestigation={openInvestigation} />}
          {view === 'events' && <Events openInvestigation={openInvestigation} />}
          {view === 'alerts' && <Alerts alerts={dashboard?.alerts || []} openInvestigation={openInvestigation} />}
          {view === 'evidence' && <Evidence />}
          {view === 'analytics' && <Analytics network={network} people={people} openInvestigation={openInvestigation} />}
          {view === 'ingest' && <Ingest toast={setToast} />}
          {view === 'settings' && <Sources />}
          {view === 'investigation' && selected && (
            <InvestigationView selected={selected} network={network} people={people} openInvestigation={openInvestigation} generateReport={generateReport} />
          )}
        </section>
      </main>

      {toast && <div className="toast" onAnimationEnd={() => setToast('')}>{toast}</div>}
      {report && <Report report={report} close={() => setReport(null)} />}
      {modal && <PathModal modal={modal} setModal={setModal} network={network} people={people} toast={setToast} />}
    </div>
  )
}

function MetricCard({ icon, value, label, accent }) {
  return (
    <article className="metric-card">
      <span className="metric-icon" style={{ color: accent }}>{icon}</span>
      <div className="metric-body">
        <strong>{value}</strong>
        <small>{label}</small>
      </div>
      <em>SIM</em>
    </article>
  )
}

function Overview({ dashboard, openInvestigation, setView }) {
  const m = dashboard?.metrics || {}
  const cards = [
    ['◎', m.persons ?? 14, 'Persons of Interest', '#67d9ff'],
    ['⌘', m.relationships ?? 68, 'Mapped Relationships', '#a889ff'],
    ['⚑', m.crime_events ?? 12, 'Crime Events', '#ff7c6b'],
    ['⌖', m.locations ?? 8, 'Known Locations', '#7de1b8'],
    ['◇', m.organizations ?? 7, 'Organizations', '#8bc9ff'],
    ['△', m.active_alerts ?? 5, 'Active Alerts', '#ffb86c'],
  ]

  return (
    <>
      <div className="page-header">
        <div>
          <span className="eyebrow">COMMAND CENTER</span>
          <h1>Operational overview</h1>
        </div>
        <button className="primary-button" onClick={() => setView('investigation')}>
          Investigate subject →
        </button>
      </div>

      <div className="metric-grid">
        {cards.map(([icon, value, label, accent]) => (
          <MetricCard key={label} icon={icon} value={value} label={label} accent={accent} />
        ))}
      </div>

      <div className="content-grid two-up">
        <Panel title="Activity signal" subtitle="Events, communications, and transactions">
          <ActivityChart data={dashboard?.activity || []} />
        </Panel>

        <Panel title="Relationship composition" subtitle="Current demo graph">
          <div className="composition-grid">
            {(dashboard?.categories || []).map((item, index) => (
              <div key={item.name} className="composition-item">
                <span className={`swatch c${index}`} />
                <div>
                  <strong>{item.value}%</strong>
                  <small>{item.name}</small>
                </div>
              </div>
            ))}
          </div>
          <div className="donut-ring">
            <span>100<em>signals</em></span>
          </div>
        </Panel>
      </div>

      <div className="table-panel">
        <div className="panel-head inline">
          <div>
            <h3>High influence entities</h3>
            <p>Prioritized by combined centrality measurements</p>
          </div>
          <button className="ghost-button" onClick={() => setView('analytics')}>View analytics →</button>
        </div>

        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Entity</th>
              <th>Influence</th>
              <th>Risk</th>
              <th>Links</th>
              <th>Alert</th>
            </tr>
          </thead>
          <tbody>
            {(dashboard?.top_entities || []).slice(0, 6).map((item, index) => (
              <tr key={item.id} onClick={() => openInvestigation(item.id)}>
                <td>0{index + 1}</td>
                <td><strong>{item.name}</strong><small>{item.community}</small></td>
                <td><Score value={item.influence_score} /></td>
                <td><span className={`risk-badge ${scoreTone(item.risk_score)}`}>{item.risk_score}</span></td>
                <td>{item.connections ?? item.analytics?.connections ?? 0}</td>
                <td><Badge text={item.alert_status || 'MONITOR'} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

function Panel({ title, subtitle, children, action }) {
  return (
    <section className="data-panel">
      <div className="panel-head inline">
        <div>
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

function ActivityChart({ data }) {
  const max = Math.max(12, ...data.map((point) => point.activity))
  return (
    <div className="bar-chart">
      {data.map((point) => (
        <div key={point.date} className="bar-col">
          <span style={{ height: `${Math.max(14, (point.activity / max) * 100)}%` }} />
          <small>{point.date.slice(5)}</small>
        </div>
      ))}
    </div>
  )
}

function Score({ value }) {
  return (
    <div className="score-bar">
      <span style={{ width: `${Math.max(5, value)}%` }} />
      <b>{value}</b>
    </div>
  )
}

function Badge({ text }) {
  return <span className={`badge ${String(text).toLowerCase()}`}>{nice(text)}</span>
}

function Network({ network, people, openInvestigation, toast }) {
  const [types, setTypes] = useState(new Set(['PERSON', 'ORGANIZATION', 'LOCATION', 'VEHICLE', 'PHONE', 'CRIME', 'EVENT', 'TRANSACTION']))
  const [relations, setRelations] = useState(new Set())
  const [focus, setFocus] = useState(null)
  const [path, setPath] = useState([])
  const [target, setTarget] = useState('P013')
  const [depth, setDepth] = useState(2)

  const visibleNodes = (network?.nodes || []).filter((node) => types.has(node.entity_type))
  const visibleIds = new Set(visibleNodes.map((node) => node.id))
  const relTypes = [...new Set((network?.edges || []).map((edge) => edge.type))]
  const visibleEdges = (network?.edges || []).filter(
    (edge) => visibleIds.has(edge.source) && visibleIds.has(edge.target) && (!relations.size || relations.has(edge.type)),
  )

  const toggle = (value, current) => {
    const next = new Set(current)
    if (next.has(value)) next.delete(value)
    else next.add(value)
    return next
  }

  const findPath = async () => {
    const source = focus || 'P001'
    const result = await request(`/path?source=${source}&target=${target}`)
    setPath(result.path || [])
    toast(result.found ? `Highlighted ${result.path.length - 1}-step analytical path` : 'No path found in the current demo graph')
  }

  return (
    <>
      <div className="page-header">
        <div>
          <span className="eyebrow">RELATIONSHIP EXPLORER</span>
          <h1>Network Graph</h1>
        </div>
        <div className="action-row">
          <button className="secondary-button" onClick={() => setTypes(new Set(['PERSON']))}>Show People</button>
          <button className="primary-button" onClick={() => { setTypes(new Set((network?.nodes || []).map((n) => n.entity_type))); setRelations(new Set()); }}>Reset view</button>
        </div>
      </div>

      <div className="network-shell">
        <aside className="network-sidebar">
          <h4>Node layers</h4>
          {['PERSON', 'ORGANIZATION', 'LOCATION', 'VEHICLE', 'PHONE', 'CRIME', 'EVENT', 'TRANSACTION'].map((type) => (
            <label key={type} className="check-row">
              <input
                type="checkbox"
                checked={types.has(type)}
                onChange={() => setTypes((current) => toggle(type, current))}
              />
              <span className="swatch-mini" style={{ background: typeColors[type] }} />
              {nice(type)}
            </label>
          ))}

          <h4>Relationship filters</h4>
          {relTypes.slice(0, 7).map((type) => (
            <label key={type} className="check-row">
              <input
                type="checkbox"
                checked={!relations.size || relations.has(type)}
                onChange={() => {
                  const next = new Set(relations.size ? relations : relTypes)
                  if (next.has(type)) next.delete(type)
                  else next.add(type)
                  setRelations(next.size === relTypes.length ? new Set() : next)
                }}
              />
              {nice(type)}
            </label>
          ))}

          <h4>Depth</h4>
          <div className="segmented-control">
            {[1, 2, 3].map((hop) => (
              <button key={hop} className={depth === hop ? 'picked' : ''} onClick={() => setDepth(hop)}>{hop} hop</button>
            ))}
          </div>

          <h4>Pathfinder</h4>
          <select value={target} onChange={(event) => setTarget(event.target.value)}>
            {(people || []).map((person) => (
              <option key={person.id} value={person.id}>{person.name}</option>
            ))}
          </select>
          <button className="primary-button wide" onClick={findPath}>Find connection</button>
        </aside>

        <div className="graph-stage">
          <div className="graph-toolbar">
            <span><i className="pulse-dot" /> LIVE DEMO GRAPH</span>
            <div>
              <button onClick={() => setFocus('P001')}>Most influential</button>
              <button onClick={() => setFocus(null)}>Community view</button>
              <button onClick={() => setRelations(new Set(['TRANSACTED_WITH', 'COMMUNICATED_WITH']))}>Suspicious links</button>
            </div>
          </div>

          <GraphCanvas
            nodes={visibleNodes}
            edges={visibleEdges}
            focus={focus}
            path={path}
            onSelect={openInvestigation}
          />
        </div>
      </div>
    </>
  )
}

function GraphCanvas({ nodes, edges, focus, path, onSelect }) {
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 })
  const dragging = useRef(null)
  const dims = { w: 900, h: 560 }

  const positions = useMemo(() => {
    const map = {}
    nodes.forEach((node, index) => {
      const angle = (index / Math.max(1, nodes.length)) * Math.PI * 2 - Math.PI / 2
      const ring = index % 3
      const radius = ring === 0 ? 120 : ring === 1 ? 200 : 280
      map[node.id] = { x: dims.w / 2 + Math.cos(angle) * radius, y: dims.h / 2 + Math.sin(angle) * radius }
    })
    return map
  }, [nodes])

  const onDown = (event) => {
    dragging.current = { x: event.clientX, y: event.clientY, original: transform }
  }

  const onMove = (event) => {
    if (!dragging.current) return
    setTransform({
      ...dragging.current.original,
      x: dragging.current.original.x + (event.clientX - dragging.current.x),
      y: dragging.current.original.y + (event.clientY - dragging.current.y),
    })
  }

  const onWheel = (event) => {
    event.preventDefault()
    setTransform((old) => ({
      ...old,
      scale: Math.min(1.7, Math.max(0.55, old.scale + (event.deltaY < 0 ? 0.12 : -0.12))),
    }))
  }

  return (
    <svg
      className="network-svg"
      viewBox={`0 0 ${dims.w} ${dims.h}`}
      onMouseDown={onDown}
      onMouseMove={onMove}
      onMouseUp={() => (dragging.current = null)}
      onMouseLeave={() => (dragging.current = null)}
      onWheel={onWheel}
    >
      <defs>
        <linearGradient id="edgeGlow" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#4dd7ff" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#8a6dff" stopOpacity="0.9" />
        </linearGradient>
      </defs>
      <g transform={`translate(${transform.x} ${transform.y}) scale(${transform.scale})`}>
        {edges.map((edge) => {
          const a = positions[edge.source]
          const b = positions[edge.target]
          if (!a || !b) return null
          const active = path.includes(edge.source) && path.includes(edge.target)
          return (
            <line
              key={`${edge.source}-${edge.target}-${edge.type}`}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              className={active ? 'graph-line active-line' : 'graph-line'}
            />
          )
        })}

        {nodes.map((node) => {
          const point = positions[node.id]
          if (!point) return null
          const active = focus === node.id || path.includes(node.id)
          return (
            <g
              key={node.id}
              transform={`translate(${point.x} ${point.y})`}
              className="graph-node-group"
              onClick={(event) => {
                event.stopPropagation()
                onSelect(node.id)
              }}
            >
              <circle r={active ? 18 : 14} className={active ? 'node-orbit active-node' : 'node-orbit'} fill={typeColors[node.entity_type] || '#67d9ff'} />
              <circle r={active ? 27 : 20} className="node-ring" stroke={typeColors[node.entity_type] || '#67d9ff'} />
              <text x="0" y="4" textAnchor="middle" className="node-icon">{typeIcons[node.entity_type] || '◉'}</text>
            </g>
          )
        })}
      </g>
    </svg>
  )
}

function People({ people, openInvestigation }) {
  return (
    <>
      <div className="page-header">
        <div>
          <span className="eyebrow">ENTITY DIRECTORY</span>
          <h1>People & Entities</h1>
        </div>
      </div>
      <div className="people-grid">
        {people.map((person) => (
          <button key={person.id} className="entity-card" onClick={() => openInvestigation(person.id)}>
            <div className="entity-avatar">{person.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}</div>
            <div className="entity-main">
              <span>{person.id} · {person.analytics?.community || 'C1'}</span>
              <h3>{person.name}</h3>
              <p>{person.occupation || 'Analytical lead'}</p>
            </div>
            <div className="entity-meta">
              <div><small>Risk</small><strong className={scoreTone(person.risk_score)}>{person.risk_score}</strong></div>
              <div><small>Influence</small><strong>{person.analytics?.influence_score ?? 70}</strong></div>
              <div><small>Links</small><strong>{person.analytics?.connections ?? 7}</strong></div>
            </div>
          </button>
        ))}
      </div>
    </>
  )
}

function Events({ openInvestigation }) {
  const [events, setEvents] = useState([])
  const [crimes, setCrimes] = useState([])

  useEffect(() => {
    request('/crimes').then(setCrimes)
    request('/entities?kind=EVENT').then(setEvents)
  }, [])

  const records = [...crimes, ...events].sort((a, b) => (a.date || '').localeCompare(b.date || ''))

  return (
    <>
      <div className="page-header">
        <div>
          <span className="eyebrow">TEMPORAL INTELLIGENCE</span>
          <h1>Crime Events & Timeline</h1>
        </div>
      </div>
      <div className="timeline-list">
        {records.map((item) => (
          <article key={item.id} className="timeline-item">
            <time>{item.date || '2026-06-12'}</time>
            <span className="timeline-dot" style={{ background: typeColors[item.entity_type || 'CRIME'] }} />
            <div>
              <small>{nice(item.entity_type)} · {item.id}</small>
              <h3>{item.name}</h3>
              <p>{item.category || item.event_type || 'Analytical review event'}</p>
            </div>
          </article>
        ))}
      </div>
    </>
  )
}

function Alerts({ alerts, openInvestigation }) {
  return (
    <>
      <div className="page-header">
        <div>
          <span className="eyebrow">EXPLAINABLE DETECTIONS</span>
          <h1>Intelligence Alerts</h1>
        </div>
      </div>
      <div className="alerts-grid">
        {(alerts || []).map((alert) => (
          <article key={alert.id} className={`alert-card ${alert.severity.toLowerCase()}`}>
            <div className="alert-topline">
              <Badge text={alert.severity} />
              <span className="alert-id">{alert.id}</span>
            </div>
            <h2>{alert.title}</h2>
            <p>{alert.reason}</p>
            <div className="alert-meta">
              <span>Confidence: <strong>{alert.score}</strong></span>
              <span>Supporting relationships: <strong>{alert.supporting_relationships.length}</strong></span>
            </div>
            <button className="secondary-button" onClick={() => openInvestigation(alert.entity_id)}>Investigate →</button>
          </article>
        ))}
      </div>
    </>
  )
}

function Evidence() {
  const [items, setItems] = useState([])

  useEffect(() => {
    request('/evidence').then(setItems)
  }, [])

  return (
    <>
      <div className="page-header">
        <div>
          <span className="eyebrow">PROVENANCE LEDGER</span>
          <h1>Evidence & Source Records</h1>
        </div>
      </div>
      <div className="evidence-list">
        {(items || []).slice(0, 24).map((item) => (
          <article key={item.id} className="evidence-item">
            <span className="evidence-mark">▤</span>
            <div>
              <small>{item.id} · {item.source_type}</small>
              <h3>{item.title}</h3>
              <p>{item.summary}</p>
            </div>
            <div className="evidence-meta">
              <Badge text={item.data_status} />
              <small>{item.observed_at}</small>
            </div>
          </article>
        ))}
      </div>
    </>
  )
}

function Analytics({ network, people, openInvestigation }) {
  const sorted = [...people].sort((a, b) => (b.analytics?.influence_score || 0) - (a.analytics?.influence_score || 0))
  return (
    <>
      <div className="page-header">
        <div>
          <span className="eyebrow">NETWORK SCIENCE</span>
          <h1>Analytics</h1>
        </div>
      </div>
      <div className="analytics-grid">
        <article className="mini-stat"><span>◌</span><strong>{network.nodes.length}</strong><small>Nodes</small></article>
        <article className="mini-stat"><span>⌘</span><strong>{network.edges.length}</strong><small>Edges</small></article>
        <article className="mini-stat"><span>◎</span><strong>3</strong><small>Communities</small></article>
        <article className="mini-stat"><span>◈</span><strong>1</strong><small>Bridge</small></article>
      </div>

      <div className="content-grid two-up">
        <Panel title="Influence ranking" subtitle="Combined network centrality and clustering effects">
          <table>
            <thead>
              <tr>
                <th>Entity</th>
                <th>Influence</th>
                <th>Connections</th>
              </tr>
            </thead>
            <tbody>
              {sorted.slice(0, 7).map((person) => (
                <tr key={person.id} onClick={() => openInvestigation(person.id)}>
                  <td><strong>{person.name}</strong><small>{person.id}</small></td>
                  <td><Score value={person.analytics?.influence_score ?? 75} /></td>
                  <td>{person.analytics?.connections ?? 9}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>

        <Panel title="Community structure" subtitle="Detected network clusters and bridge nodes">
          <div className="community-list">
            {['C1', 'C2', 'C3'].map((community, index) => {
              const members = people.filter((person) => (person.analytics?.community || 'C1') === community)
              return (
                <div key={community} className="community-row">
                  <span className={`community-color c${index}`} />
                  <div>
                    <strong>Community {index + 1}</strong>
                    <small>{members.map((person) => person.name).slice(0, 3).join(' · ')}</small>
                  </div>
                  <b>{members.length}</b>
                </div>
              )
            })}
          </div>
        </Panel>
      </div>
    </>
  )
}

function Ingest({ toast }) {
  const [source, setSource] = useState('FIR / Crime Report')
  const [result, setResult] = useState(null)

  const readFile = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async () => {
      try {
        let records = []
        const raw = String(reader.result)
        if (file.name.endsWith('.json')) {
          records = JSON.parse(raw)
          if (!Array.isArray(records)) records = [records]
        } else {
          const [head, ...rows] = raw.trim().split(/\r?\n/)
          const keys = head.split(',').map((value) => value.trim())
          records = rows.slice(0, 100).map((row) => Object.fromEntries(row.split(',').map((value, index) => [keys[index], value.trim()])))
        }

        const response = await request('/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ file_name: file.name, source_type: source, records }),
        })
        setResult(response)
        toast('File preview processed successfully')
      } catch {
        toast('Could not parse this CSV or JSON file')
      }
    }
    reader.readAsText(file)
  }

  return (
    <>
      <div className="page-header">
        <div>
          <span className="eyebrow">INGESTION SANDBOX</span>
          <h1>Data Import</h1>
        </div>
      </div>
      <div className="ingest-panel">
        <section className="upload-box">
          <span>⇧</span>
          <h2>Drop a CSV or JSON file</h2>
          <p>FIR / crime report · CDR · financial transactions · surveillance · social intelligence</p>
          <label className="primary-button file-upload">
            Select source file
            <input type="file" accept=".csv,.json" onChange={readFile} />
          </label>
          <select value={source} onChange={(event) => setSource(event.target.value)}>
            {['FIR / Crime Report', 'CDR', 'Financial Transactions', 'Surveillance', 'Social Media', 'Criminal History', 'Intelligence Report'].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </section>

        <section className="upload-info">
          <h3>Processing flow</h3>
          {['Detect columns & source context', 'Extract entity candidates', 'Identify relationship fields', 'Present normalisation preview'].map((item, index) => (
            <p key={item}><b>0{index + 1}</b> {item}</p>
          ))}
          <small>Imports remain in preview mode and do not change the seeded demo graph.</small>
          {result && <pre>{JSON.stringify(result, null, 2)}</pre>}
        </section>
      </div>
    </>
  )
}

function Sources() {
  return (
    <>
      <div className="page-header">
        <div>
          <span className="eyebrow">DATA GOVERNANCE</span>
          <h1>Data Sources & Settings</h1>
        </div>
      </div>
      <div className="source-cards">
        <article>
          <span className="tag preserved">PRESERVED</span>
          <h2>Legacy Network Datasets</h2>
          <p>Original anonymised network files remain in the repository’s preserved data sources.</p>
          <small>Data status: SOURCE_DATASET_REFERENCE · Not rendered as live allegations in this demo</small>
        </article>
        <article>
          <span className="tag demo">SIMULATED</span>
          <h2>NODELOCK Demo Network</h2>
          <p>Fictional people, organisations, locations, devices, events and relationships engineered for a repeatable investigation workflow.</p>
          <small>Data status: SIMULATED_DEMO · Generated at backend startup</small>
        </article>
        <article>
          <span className="tag model">MODEL OUTPUT</span>
          <h2>Analytics & Alerts</h2>
          <p>NetworkX centrality, path and community findings are calculated from demo records and exposed as analytical leads only.</p>
          <small>Data status: MODEL_INFERRED_DEMO · Requires human verification</small>
        </article>
      </div>
    </>
  )
}

function InvestigationView({ selected, network, people, openInvestigation, generateReport }) {
  const primaryPerson = selected || people[0]
  const analytics = primaryPerson?.analytics || { influence_score: 82, connections: 17, community: 'Transport Cluster' }
  const timeline = [
    { day: 'MAY 10', label: 'Communication detected', type: 'COMMUNICATION' },
    { day: 'MAY 14', label: 'Location overlap', type: 'CO-LOCATION' },
    { day: 'MAY 21', label: 'Vehicle sighting', type: 'VEHICLE' },
    { day: 'JUN 02', label: 'Transaction', type: 'TRANSACTION' },
    { day: 'JUN 18', label: 'Crime event association', type: 'CRIME' },
    { day: 'JUL 01', label: 'New organization connection', type: 'ORGANIZATION' },
  ]

  const focusNodes = (network?.nodes || []).filter((node) => node.id === primaryPerson.id || ['P002', 'P011', 'P014', 'O002', 'L001', 'C001'].includes(node.id)).slice(0, 12)
  const focusEdges = (network?.edges || []).filter((edge) => focusNodes.some((n) => n.id === edge.source) && focusNodes.some((n) => n.id === edge.target)).slice(0, 18)

  return (
    <div className="investigation-shell">
      <div className="investigation-header">
        <div>
          <span className="eyebrow">INVESTIGATION MODE</span>
          <h1>{primaryPerson.name}</h1>
        </div>
        <div className="investigation-metrics">
          <div><small>Status</small><strong>ACTIVE ANALYSIS</strong></div>
          <div><small>Risk</small><strong>82 / 100</strong></div>
          <div><small>Influence</small><strong>{analytics.influence_score} / 100</strong></div>
          <div><small>Connections</small><strong>{analytics.connections}</strong></div>
        </div>
      </div>

      <div className="investigation-grid">
        <div className="graph-panel">
          <div className="graph-toolbar investigation-toolbar">
            <span><i className="pulse-dot" /> GRAPH ANALYSIS</span>
            <div>
              <button>Zoom +</button>
              <button>Zoom -</button>
              <button>Fit network</button>
              <button>Reset</button>
            </div>
          </div>

          <div className="graph-surface">
            <GraphCanvas nodes={focusNodes} edges={focusEdges} focus={primaryPerson.id} path={[]} onSelect={openInvestigation} />
          </div>

          <div className="timeline-panel">
            <div className="panel-head inline">
              <div>
                <h3>Timeline</h3>
                <p>Analytical sequence and activity markers</p>
              </div>
            </div>
            <div className="timeline-strip">
              {timeline.map((item, index) => (
                <div key={item.day} className="timeline-bubble">
                  <span className="dot" style={{ background: typeColors[item.type] || '#67d9ff' }} />
                  <div>
                    <strong>{item.day}</strong>
                    <small>{item.label}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="intel-panel">
          <div className="profile-card">
            <div className="profile-heading">
              <div className="profile-avatar">{typeIcons.PERSON}</div>
              <div>
                <span className="eyebrow">PERSON</span>
                <h3>{primaryPerson.name}</h3>
              </div>
            </div>

            <div className="risk-meter-wrap">
              <div className="risk-meter" data-score={82}>
                <span>82</span>
              </div>
              <div className="risk-copy">
                <strong>HIGH</strong>
                <small>NETWORK INFLUENCE 91</small>
              </div>
            </div>

            <div className="profile-stats">
              <div><small>Risk score</small><strong>82</strong></div>
              <div><small>Influence</small><strong>91</strong></div>
              <div><small>Confidence</small><strong>87%</strong></div>
            </div>
          </div>

          <div className="intel-block">
            <h4>Known identifiers</h4>
            <ul>
              <li><span>Phone</span><strong>+91 XXXXX XXXXX</strong></li>
              <li><span>Vehicle</span><strong>AS-01-XX-XXXX</strong></li>
              <li><span>Locations</span><strong>Guwahati · Beltola · Paltan Bazaar</strong></li>
            </ul>
          </div>

          <div className="intel-block">
            <h4>Key connections</h4>
            <div className="connection-list">
              <button onClick={() => openInvestigation('P002')}><span>Rahul Mehta</span><small>Financial intermediary</small></button>
              <button onClick={() => openInvestigation('O002')}><span>Apex Logistics</span><small>Organization</small></button>
              <button onClick={() => openInvestigation('V001')}><span>AS-01-XX-XXXX</span><small>Vehicle</small></button>
            </div>
          </div>

          <div className="intel-block insight-block">
            <h4>AI investigation insights</h4>
            <p>
              “{primaryPerson.name} appears to function as a high-centrality bridge between two otherwise separate communities. This is a model-detected pattern and requires verification.”
            </p>
            <ul>
              <li>High betweenness centrality</li>
              <li>Connected to 3 organizations</li>
              <li>Repeated co-location events</li>
              <li>17 network connections</li>
              <li>Connected to 4 flagged entities</li>
            </ul>
          </div>

          <button className="primary-button wide" onClick={() => generateReport(primaryPerson.id)}>Generate report</button>
        </aside>
      </div>
    </div>
  )
}

function Report({ report, close }) {
  const download = () => {
    const link = document.createElement('a')
    link.href = URL.createObjectURL(new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' }))
    link.download = `${report.report_id}.json`
    link.click()
    URL.revokeObjectURL(link.href)
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-panel report-panel">
        <button className="modal-close" onClick={close}>×</button>
        <span className="eyebrow">INTELLIGENCE REPORT · {report.report_id}</span>
        <h2>{report.investigation_subject}</h2>
        <p>{report.executive_summary}</p>
        <div className="report-block">
          <strong>Key entities</strong>
          <span>{report.key_entities.map((item) => `${item.name} (${nice(item.type)})`).join(' · ')}</span>
        </div>
        <div className="report-block warning">
          <strong>Confidence & limitations</strong>
          <span>{report.confidence_limitations}</span>
        </div>
        <div className="report-actions">
          <button className="secondary-button" onClick={close}>Close</button>
          <button className="primary-button" onClick={download}>Download JSON</button>
        </div>
      </div>
    </div>
  )
}

function PathModal({ modal, setModal, network, people, toast }) {
  const [source, setSource] = useState(modal?.source || 'P001')
  const [target, setTarget] = useState(modal?.target || 'P013')
  const [result, setResult] = useState(null)

  const analyze = async () => {
    const data = await request(`/path?source=${source}&target=${target}`)
    setResult(data)
    toast(data.found ? `Path length: ${data.path.length - 1}` : 'No path in current demo graph')
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-panel path-panel">
        <button className="modal-close" onClick={() => setModal(null)}>×</button>
        <span className="eyebrow">FIND CONNECTION</span>
        <h2>Path analysis</h2>
        <div className="path-form">
          <label>
            Source
            <select value={source} onChange={(event) => setSource(event.target.value)}>
              {(people || []).map((person) => <option key={person.id} value={person.id}>{person.name}</option>)}
            </select>
          </label>
          <label>
            Target
            <select value={target} onChange={(event) => setTarget(event.target.value)}>
              {(people || []).map((person) => <option key={person.id} value={person.id}>{person.name}</option>)}
            </select>
          </label>
        </div>
        {result && (
          <div className="path-summary">
            <span>PATH LENGTH: {Math.max(result.path.length - 1, 0)}</span>
            <span>CONFIDENCE: 84%</span>
            <span>RELATIONSHIPS: {result.path.length}</span>
          </div>
        )}
        <div className="report-actions">
          <button className="secondary-button" onClick={() => setModal(null)}>Close</button>
          <button className="primary-button" onClick={analyze}>Analyze path</button>
        </div>
      </div>
    </div>
  )
}

createRoot(document.getElementById('root')).render(<App />)
