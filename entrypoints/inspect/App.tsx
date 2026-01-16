import { useEffect, useMemo, useState } from 'react';
import { storage } from '#imports';
import './App.css';

type InspectLogEntry = {
  ts: number;
  type: string;
  data?: Record<string, unknown>;
};

type InspectSession = {
  id: string;
  url: string;
  startedAt: number;
  endedAt: number;
  status: 'completed' | 'aborted';
  reason?: string;
  logs: InspectLogEntry[];
};

const STORAGE_KEY = 'local:inspectLogs';

const formatTime = (ts?: number): string => {
  if (!ts) return '-';
  return new Date(ts).toLocaleString();
};

const toDuration = (start?: number, end?: number): string => {
  if (!start || !end || end < start) return '-';
  const ms = end - start;
  const seconds = Math.round(ms / 100) / 10;
  return `${seconds}s`;
};

function App() {
  const [sessions, setSessions] = useState<InspectSession[]>([]);
  const [clearing, setClearing] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const loadSessions = async () => {
    const data = await storage.getItem<InspectSession[]>(STORAGE_KEY);
    setSessions(data ?? []);
    setLoaded(true);
  };

  useEffect(() => {
    void loadSessions();
    const unwatch = storage.watch<InspectSession[]>(STORAGE_KEY, () => {
      void loadSessions();
    });
    return () => {
      if (typeof unwatch === 'function') {
        unwatch();
      }
    };
  }, []);

  const sortedSessions = useMemo(() => {
    return sessions.slice().sort((a, b) => b.startedAt - a.startedAt);
  }, [sessions]);

  const totalLogs = useMemo(() => {
    return sortedSessions.reduce((sum, session) => sum + session.logs.length, 0);
  }, [sortedSessions]);

  const latest = sortedSessions[0];

  const onClear = async () => {
    setClearing(true);
    try {
      await storage.setItem(STORAGE_KEY, []);
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="inspect-page">
      <header className="page-header">
        <div className="brand">
          <div className="title">Inspect Logs</div>
          <div className="subtitle">Select like a Boss</div>
        </div>
        <div className="header-actions">
          <button type="button" onClick={loadSessions}>
            Refresh
          </button>
          <button type="button" onClick={onClear} disabled={clearing}>
            {clearing ? 'Clearing…' : 'Clear Logs'}
          </button>
        </div>
      </header>

      <main>
        <section className="summary">
          <div className="summary-card">
            <div className="label">Sessions</div>
            <div className="value">{sortedSessions.length}</div>
          </div>
          <div className="summary-card">
            <div className="label">Total Logs</div>
            <div className="value">{totalLogs}</div>
          </div>
          <div className="summary-card">
            <div className="label">Latest</div>
            <div className="value">{latest ? formatTime(latest.startedAt) : '-'}</div>
          </div>
        </section>

        <section className="sessions">
          {loaded && sortedSessions.length === 0 && (
            <div className="empty">
              No inspect sessions yet. Click “Inspect once” in the popup, then try selecting a link.
            </div>
          )}
          {!loaded && <div className="empty">Loading logs…</div>}
          {sortedSessions.map((session) => (
            <details key={session.id} className="session">
              <summary>
                <div className="session-title">
                  {formatTime(session.startedAt)} · {session.logs.length} logs
                  <span className={`status-chip ${session.status}`}>{session.status}</span>
                </div>
                <div className="session-url">{session.url || '-'}</div>
              </summary>
              <div className="session-meta">
                <div>
                  Session ID:<span>{session.id}</span>
                </div>
                <div>
                  Duration:<span>{toDuration(session.startedAt, session.endedAt)}</span>
                </div>
                <div>
                  Status Reason:<span>{session.reason ?? '-'}</span>
                </div>
              </div>
              <div className="logs">
                {session.logs.map((entry, index) => (
                  <div key={`${session.id}-${index}`} className="log-row">
                    <div className="log-title">
                      <span>{entry.type}</span>
                      <span className="log-time">{formatTime(entry.ts)}</span>
                    </div>
                    {entry.data && Object.keys(entry.data).length > 0 && (
                      <pre>{JSON.stringify(entry.data, null, 2)}</pre>
                    )}
                  </div>
                ))}
              </div>
            </details>
          ))}
        </section>
      </main>
    </div>
  );
}

export default App;
