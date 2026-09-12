"use client";

import { useEffect, useMemo, useState } from "react";
import { questions, trails, trailImages } from "@/config/study";

type Marker = { id?: string; x: number; y: number };
type Annotation = {
  submission_id: string;
  selected_trail_id: string | null;
  completed_at: string | null;
  language_selected: string | null;
  image_id: string | null;
  image_src: string | null;
  markers: Marker[];
};
type ItemStat = { n: number; mean: number | null; counts: Record<string, number> };
type Summary = {
  total: number;
  completed: number;
  incomplete: number;
  medianCompletionSeconds: number | null;
  trailCounts: Record<string, number>;
  languageCounts: Record<string, number>;
  recent: Array<{ id: string; completion_status: string; selected_trail_id: string | null; started_at: string | null; completed_at: string | null; language_selected: string | null; created_at: string }>;
  itemStats: Record<string, ItemStat>;
  annotations: Annotation[];
  version: string;
};

function formatDuration(seconds: number | null) {
  if (seconds === null) return "—";
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
}
function trailName(id: string | null) {
  return trails.find((trail) => trail.id === id)?.name.en ?? "—";
}
function loadCanvasImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not load the trail image."));
    image.src = src;
  });
}

export default function ResearchDashboard() {
  const [key, setKey] = useState("");
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [annotationTrailFilter, setAnnotationTrailFilter] = useState("all");

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
    if (!key) return;
    setError("");
    try {
      const response = await fetch("/api/research/export", { headers: { "x-research-key": key } });
      if (!response.ok) throw new Error(await response.text());
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `mpa-index-final-v24-export-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url);
    } catch (err) { setError(err instanceof Error ? err.message : String(err)); }
  }

  async function downloadAnnotatedImage(annotation: Annotation) {
    const src = annotation.image_src ?? trailImages.find((image) => image.trailId === annotation.selected_trail_id)?.src;
    if (!src) { setError("No trail image is associated with this record."); return; }
    setError("");
    try {
      const image = await loadCanvasImage(src);
      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth || image.width;
      canvas.height = image.naturalHeight || image.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas is not available in this browser.");
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      const radius = Math.max(16, Math.round(Math.min(canvas.width, canvas.height) * 0.025));
      annotation.markers.forEach((marker, index) => {
        const x = marker.x * canvas.width;
        const y = marker.y * canvas.height;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.94)";
        ctx.fill();
        ctx.lineWidth = Math.max(4, radius * 0.18);
        ctx.strokeStyle = "#173f4f";
        ctx.stroke();
        ctx.fillStyle = "#173f4f";
        ctx.font = `700 ${Math.round(radius * 1.05)}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(String(index + 1), x, y + 1);
      });
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) throw new Error("Could not create annotated image.");
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `MPA_${annotation.submission_id.slice(0, 8)}_${annotation.selected_trail_id ?? "trail"}_3points.png`;
      document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url);
    } catch (err) { setError(err instanceof Error ? err.message : String(err)); }
  }

  const maxTrail = summary ? Math.max(1, ...Object.values(summary.trailCounts)) : 1;
  const likertQuestions = useMemo(() => questions.filter((question) => question.type === "likert"), []);
  const filteredAnnotations = useMemo(() => {
    if (!summary) return [];
    return annotationTrailFilter === "all" ? summary.annotations : summary.annotations.filter((row) => row.selected_trail_id === annotationTrailFilter);
  }, [summary, annotationTrailFilter]);

  return <main className="research-page">
    <div className="research-header"><div><p className="eyebrow">MPA-Index</p><h1>Researcher analysis dashboard</h1><p>FINAL v24 questionnaire results, item statistics, route-image clicks, and data export.</p></div><a href="/" className="secondary-button">← Participant questionnaire</a></div>
    {!summary && <section className="research-login"><h2>Dashboard access</h2><p>Enter the value configured as <code>RESEARCH_DASHBOARD_KEY</code>.</p><div><input type="password" value={key} onChange={(event) => setKey(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") void load(); }} placeholder="Research dashboard key" /><button className="primary-button" type="button" disabled={!key || loading} onClick={() => void load()}>{loading ? "Loading…" : "Open dashboard"}</button></div>{error && <p className="research-error">{error}</p>}</section>}
    {summary && <>
      <div className="research-toolbar"><span>FINAL v24 records only · {summary.version}</span><div><button className="secondary-button" onClick={() => void downloadCsv()} type="button">Export Excel-ready CSV</button><button className="secondary-button" onClick={() => void load()} type="button">Refresh</button></div></div>
      {error && <p className="research-error">{error}</p>}
      <section className="metric-grid"><article><span>Total records</span><b>{summary.total}</b></article><article><span>Completed</span><b>{summary.completed}</b></article><article><span>Incomplete</span><b>{summary.incomplete}</b></article><article><span>Median completion</span><b>{formatDuration(summary.medianCompletionSeconds)}</b></article></section>

      <section className="research-panel"><div className="panel-heading"><div><p className="eyebrow">Field distribution</p><h2>Participants by route</h2></div><span>Only the three committed study routes are shown.</span></div><div className="trail-bars">{trails.map((trail) => { const count = summary.trailCounts[trail.id] ?? 0; return <div key={trail.id}><span>{trail.number}</span><strong>{trail.name.en}</strong><div><i style={{ width: `${(count / maxTrail) * 100}%` }} /></div><b>{count}</b></div>; })}</div></section>

      <section className="research-panel"><div className="panel-heading"><div><p className="eyebrow">Descriptive analysis</p><h2>Item-level response statistics</h2></div><span>Means are based on the 1–5 agreement scale; Neutral = 3.</span></div><div className="research-table-wrap"><table className="item-analysis-table"><thead><tr><th>Code</th><th>Statement</th><th>N</th><th>Mean</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th></tr></thead><tbody>{likertQuestions.map((question) => { const stat = summary.itemStats[question.id]; return <tr key={question.id}><td><code>{question.displayCode ?? question.id}</code></td><td>{question.label.en}</td><td>{stat?.n ?? 0}</td><td>{stat?.mean === null || stat?.mean === undefined ? "—" : stat.mean.toFixed(2)}</td>{["1","2","3","4","5"].map((value) => <td key={value}>{stat?.counts?.[value] ?? 0}</td>)}</tr>; })}</tbody></table></div></section>

      <section className="research-panel annotation-analysis-panel">
        <div className="panel-heading"><div><p className="eyebrow">Spatial image task</p><h2>Participant click locations</h2></div><span>The three stored coordinates are drawn directly over the route image.</span></div>
        <div className="annotation-toolbar"><label>Route <select value={annotationTrailFilter} onChange={(event) => setAnnotationTrailFilter(event.target.value)}><option value="all">All routes</option>{trails.map((trail) => <option value={trail.id} key={trail.id}>{trail.name.en}</option>)}</select></label><span>{filteredAnnotations.length} annotated participant image{filteredAnnotations.length === 1 ? "" : "s"}</span></div>
        {filteredAnnotations.length === 0 ? <p className="empty-analysis">No completed three-point image records are available yet.</p> : <div className="annotation-gallery">{filteredAnnotations.map((annotation) => {
          const configured = trailImages.find((image) => image.trailId === annotation.selected_trail_id);
          const src = annotation.image_src ?? configured?.src;
          return <article className="annotation-card" key={annotation.submission_id}>
            <div className="annotation-card__meta"><div><strong>Session {annotation.submission_id.slice(0, 8)}</strong><span>{trailName(annotation.selected_trail_id)}</span></div><small>{annotation.completed_at ? new Date(annotation.completed_at).toLocaleString() : "—"}</small></div>
            {src ? <div className="annotation-image-wrap"><img src={src} alt={`${trailName(annotation.selected_trail_id)} annotated route`} />{annotation.markers.map((marker, index) => <span className="research-image-marker" key={`${annotation.submission_id}-${index}`} style={{ left: `${marker.x * 100}%`, top: `${marker.y * 100}%` }}>{index + 1}</span>)}</div> : <div className="annotation-image-missing">Image unavailable</div>}
            <div className="annotation-coordinates">{annotation.markers.map((marker, index) => <span key={index}><b>P{index + 1}</b> x={marker.x.toFixed(5)} · y={marker.y.toFixed(5)}</span>)}</div>
            <button type="button" className="secondary-button annotation-download" disabled={!src} onClick={() => void downloadAnnotatedImage(annotation)}>Download annotated PNG</button>
          </article>;
        })}</div>}
      </section>

      <section className="research-panel"><div className="panel-heading"><div><p className="eyebrow">Operational view</p><h2>Recent records</h2></div><span>IDs are session UUIDs, not participant names.</span></div><div className="research-table-wrap"><table><thead><tr><th>Session</th><th>Status</th><th>Route</th><th>Language</th><th>Started</th><th>Completed</th></tr></thead><tbody>{summary.recent.map((row) => <tr key={row.id}><td><code>{row.id.slice(0,8)}</code></td><td>{row.completion_status}</td><td>{trailName(row.selected_trail_id)}</td><td>{row.language_selected ?? "—"}</td><td>{row.started_at ? new Date(row.started_at).toLocaleString() : "—"}</td><td>{row.completed_at ? new Date(row.completed_at).toLocaleString() : "—"}</td></tr>)}</tbody></table></div></section>
    </>}
  </main>;
}
