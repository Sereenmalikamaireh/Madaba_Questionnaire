"use client";

import { useEffect, useState } from "react";
import { trails } from "@/config/study";

type Summary = {
  total: number;
  completed: number;
  incomplete: number;
  medianCompletionSeconds: number | null;
  trailCounts: Record<string, number>;
  languageCounts: Record<string, number>;
  recent: Array<{ id: string; completion_status: string; selected_trail_id: string | null; started_at: string | null; completed_at: string | null; language_selected: string | null; created_at: string }>;
};

function formatDuration(seconds: number | null) {
  if (seconds === null) return "—";
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
}

export default function ResearchDashboard() {
  const [key, setKey] = useState("");
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { const saved = sessionStorage.getItem("mpa_research_key"); if (saved) setKey(saved); }, []);

  async function load() {
    if (!key) return;
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/research/summary", { headers: { "x-research-key": key } });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Could not load dashboard.");
      sessionStorage.setItem("mpa_research_key", key);
      setSummary(body);
    } catch (err) { setSummary(null); setError(err instanceof Error ? err.message : String(err)); }
    finally { setLoading(false); }
  }

  async function downloadCsv() {
    setError("");
    try {
      const response = await fetch("/api/research/export", { headers: { "x-research-key": key } });
      if (!response.ok) throw new Error(await response.text());
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a"); link.href = url; link.download = `mpa-index-export-${new Date().toISOString().slice(0, 10)}.csv`; document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url);
    } catch (err) { setError(err instanceof Error ? err.message : String(err)); }
  }

  const maxTrail = summary ? Math.max(1, ...Object.values(summary.trailCounts)) : 1;

  return <main className="research-page">
    <div className="research-header"><div><p className="eyebrow">MPA-Index</p><h1>Researcher dashboard</h1><p>FINAL v23 questionnaire completion, route distribution, and CSV export.</p></div><a href="/" className="secondary-button">← Participant questionnaire</a></div>
    {!summary && <section className="research-login"><h2>Dashboard access</h2><p>Enter the value configured as <code>RESEARCH_DASHBOARD_KEY</code>.</p><div><input type="password" value={key} onChange={(event) => setKey(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") void load(); }} placeholder="Research dashboard key" /><button className="primary-button" type="button" disabled={!key || loading} onClick={() => void load()}>{loading ? "Loading…" : "Open dashboard"}</button></div>{error && <p className="research-error">{error}</p>}</section>}
    {summary && <>
      <div className="research-toolbar"><span>FINAL v23 records only.</span><div><button className="secondary-button" onClick={() => void downloadCsv()} type="button">Export CSV</button><button className="secondary-button" onClick={() => void load()} type="button">Refresh</button></div></div>
      <section className="metric-grid"><article><span>Total records</span><b>{summary.total}</b></article><article><span>Completed</span><b>{summary.completed}</b></article><article><span>Incomplete</span><b>{summary.incomplete}</b></article><article><span>Median completion</span><b>{formatDuration(summary.medianCompletionSeconds)}</b></article></section>
      <section className="research-panel"><div className="panel-heading"><div><p className="eyebrow">Field distribution</p><h2>Participants by route</h2></div><span>Only the three committed study routes are shown.</span></div><div className="trail-bars">{trails.map((trail) => { const count = summary.trailCounts[trail.id] ?? 0; return <div key={trail.id}><span>{trail.number}</span><strong>{trail.name.en}</strong><div><i style={{ width: `${(count / maxTrail) * 100}%` }} /></div><b>{count}</b></div>; })}</div></section>
      <section className="research-panel"><div className="panel-heading"><div><p className="eyebrow">Operational view</p><h2>Recent records</h2></div><span>IDs are session UUIDs, not participant names.</span></div><div className="research-table-wrap"><table><thead><tr><th>Session</th><th>Status</th><th>Route</th><th>Language</th><th>Started</th><th>Completed</th></tr></thead><tbody>{summary.recent.map((row) => <tr key={row.id}><td><code>{row.id.slice(0,8)}</code></td><td>{row.completion_status}</td><td>{trails.find((trail) => trail.id === row.selected_trail_id)?.name.en ?? "—"}</td><td>{row.language_selected ?? "—"}</td><td>{row.started_at ? new Date(row.started_at).toLocaleString() : "—"}</td><td>{row.completed_at ? new Date(row.completed_at).toLocaleString() : "—"}</td></tr>)}</tbody></table></div></section>
    </>}
  </main>;
}
