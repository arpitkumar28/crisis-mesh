"use client";
import { useCallback, useEffect, useState } from "react";
import { ClipboardList, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/lib/store/auth-store";
import apiClient from "@/lib/api-client";
import { OperationsShell } from "@/components/operations-shell";
import { wsClient } from "@/lib/websocket-client";
type Incident = {
  id: string;
  title?: string;
  type?: string;
  description?: string;
  severity?: string;
  status?: string;
  reported_at?: string;
};
export default function IncidentsPage() {
  const router = useRouter();
  const { token, isAuthenticated: authenticated, hasHydrated } = useAuthStore();
  const [items, setItems] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeOnly, setActiveOnly] = useState(false);
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await apiClient.get(
        activeOnly ? "/incidents/active" : "/incidents",
      );
      setItems(result.data.data || []);
    } catch {
      setError("Incidents are unavailable. Check the API and retry.");
    } finally {
      setLoading(false);
    }
  }, [activeOnly]);
  useEffect(() => {
    if (!hasHydrated) return;
    if (!authenticated || !token) {
      router.push("/login");
      return;
    }
    wsClient.connect(token);
    load();
    const refresh = () => load();
    wsClient.on("incident.created", refresh);
    wsClient.on("incident.updated", refresh);
    return () => {
      wsClient.off("incident.created", refresh);
      wsClient.off("incident.updated", refresh);
    };
  }, [authenticated, hasHydrated, load, router, token]);
  if (!hasHydrated || !authenticated) return null;
  const open = items.filter(
    (i) => !["RESOLVED", "CLOSED"].includes(i.status || ""),
  ).length;
  return (
    <OperationsShell eyebrow="Response coordination" title="Incidents">
      <section className="page-summary">
        <div>
          <span>Open incidents</span>
          <strong className="danger-text">{loading ? "—" : open}</strong>
        </div>
        <div>
          <span>Total in view</span>
          <strong>{loading ? "—" : items.length}</strong>
        </div>
        <div>
          <span>Resolved / closed</span>
          <strong className="safe-text">
            {loading ? "—" : items.length - open}
          </strong>
        </div>
        <button onClick={load}>
          <RefreshCw size={15} />
          Refresh
        </button>
      </section>
      <section className="data-panel">
        <div className="data-toolbar">
          <div>
            <h2>Response coordination queue</h2>
            <p>
              Track real incidents through acknowledgement, response, and
              closure.
            </p>
          </div>
          <div className="filter-tabs">
            <button
              className={!activeOnly ? "selected" : ""}
              onClick={() => setActiveOnly(false)}
            >
              All incidents
            </button>
            <button
              className={activeOnly ? "selected" : ""}
              onClick={() => setActiveOnly(true)}
            >
              Open only
            </button>
          </div>
        </div>
        {error ? (
          <div className="data-error">
            {error}
            <button onClick={load}>Retry</button>
          </div>
        ) : loading ? (
          <div className="data-loading">Loading incident queue…</div>
        ) : items.length === 0 ? (
          <div className="data-empty">
            <ClipboardList size={25} />
            No incidents in this view.
          </div>
        ) : (
          <div className="incident-list">
            {items.map((item) => (
              <Link href={`/incidents/${item.id}`} key={item.id} className="incident-row">
                <span
                  className={`incident-mark ${(item.severity || "low").toLowerCase()}`}
                />
                <div>
                  <h3>{item.title || item.type || "Field incident"}</h3>
                  <p>{item.description || "No field description received."}</p>
                  <small>
                    {item.id.slice(0, 8)} · Reported{" "}
                    {item.reported_at
                      ? new Date(item.reported_at).toLocaleString()
                      : "time unavailable"}
                  </small>
                </div>
                <div className="incident-state">
                  <span
                    className={`state-badge ${(item.status || "").toLowerCase().replace("_", "-")}`}
                  >
                    {item.status || "REPORTED"}
                  </span>
                  <small>{item.severity || "UNSPECIFIED"} priority</small>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </OperationsShell>
  );
}
