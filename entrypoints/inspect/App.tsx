import { useEffect, useMemo, useRef, useState } from 'react';
import {
  WarningCircle,
  MouseLeftClick,
  ArrowClockwise,
  Broom,
  Copy,
  CheckCircle,
  XCircle,
  Clock,
  LinkSimple,
  ListChecks,
  Database,
  Timer,
  Tag,
} from '@phosphor-icons/react';
import { storage } from '#imports';
import './App.css';
import iconUrl from '@/public/icon/icon.svg';

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
  const [copyState, setCopyState] = useState<Record<string, 'idle' | 'copied' | 'error'>>({});
  const [loaded, setLoaded] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement | null>(null);

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

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (confirmOpen && !dialog.open) {
      dialog.showModal();
    }
    if (!confirmOpen && dialog.open) {
      dialog.close();
    }
  }, [confirmOpen]);

  const sortedSessions = useMemo(() => {
    return sessions.slice().sort((a, b) => b.startedAt - a.startedAt);
  }, [sessions]);

  const totalLogs = useMemo(() => {
    return sortedSessions.reduce((sum, session) => sum + session.logs.length, 0);
  }, [sortedSessions]);

  const latest = sortedSessions[0];

  const onClear = async () => {
    setConfirmOpen(true);
  };

  const onConfirmClear = async () => {
    setClearing(true);
    try {
      await storage.setItem(STORAGE_KEY, []);
    } finally {
      setClearing(false);
    }
    setConfirmOpen(false);
  };

  const onCopy = async (session: InspectSession) => {
    try {
      const payload = JSON.stringify(session.logs, null, 2);
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(payload);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = payload;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        textarea.remove();
      }
      setCopyState((prev) => ({ ...prev, [session.id]: 'copied' }));
      setTimeout(() => setCopyState((prev) => ({ ...prev, [session.id]: 'idle' })), 1500);
    } catch (error) {
      console.error('Failed to copy logs', error);
      setCopyState((prev) => ({ ...prev, [session.id]: 'error' }));
      setTimeout(() => setCopyState((prev) => ({ ...prev, [session.id]: 'idle' })), 1500);
    }
  };

  return (
    <div className="inspect-page">
      <header className="page-header">
        <div className="brand">
          <img className="brand-icon" src={iconUrl} alt="Select like a Boss" />
          <div className="brand-text">
            <div className="title">Select like a Boss - Inspect</div>
            <div className="subtitle">Diagnostic view for selection issues.</div>
          </div>
        </div>
        <div className="header-actions">
          <button type="button" className="inspect-btn inspect-btn-secondary" onClick={loadSessions}>
            <ArrowClockwise size={16} weight="bold" />
            Refresh
          </button>
          <button
            type="button"
            className="inspect-btn inspect-btn-danger"
            onClick={onClear}
            disabled={clearing}
          >
            <Broom size={16} weight="bold" />
            {clearing ? 'Clearing…' : 'Clear Logs'}
          </button>
        </div>
      </header>

      <section className="inspect-note">
        <div className="inspect-note-icon">
          <WarningCircle size={18} weight="bold" />
        </div>
        <div className="inspect-note-body">
          <div className="inspect-note-title">When to use Inspect</div>
          <div className="inspect-note-text">
            Use Inspect when a site blocks or breaks link text selection, or when drag selection behaves
            unexpectedly. It records selection events and element data for one attempt.
          </div>
          <div className="inspect-note-steps">
            <MouseLeftClick size={16} weight="bold" />
            <span>Click “Inspect once”, then drag to select a link on the target page.</span>
          </div>
        </div>
      </section>

      <dialog
        ref={dialogRef}
        className="confirm-dialog"
        onCancel={(event) => {
          event.preventDefault();
          setConfirmOpen(false);
        }}
      >
        <div className="confirm-dialog-body">
          <div className="confirm-dialog-title">Clear all inspect logs?</div>
          <div className="confirm-dialog-text">This cannot be undone.</div>
        </div>
        <div className="confirm-dialog-actions">
          <button
            type="button"
            className="inspect-btn inspect-btn-secondary"
            onClick={() => setConfirmOpen(false)}
          >
            <XCircle size={16} weight="bold" />
            Cancel
          </button>
          <button
            type="button"
            className="inspect-btn inspect-btn-danger"
            onClick={onConfirmClear}
            disabled={clearing}
          >
            <Broom size={16} weight="bold" />
            {clearing ? 'Clearing…' : 'Clear'}
          </button>
        </div>
      </dialog>

      <main>
        <section className="summary">
          <div className="summary-card">
            <div className="label"><ListChecks size={14} weight="bold" /> Sessions</div>
            <div className="value">{sortedSessions.length}</div>
          </div>
          <div className="summary-card">
            <div className="label"><Database size={14} weight="bold" /> Total Logs</div>
            <div className="value">{totalLogs}</div>
          </div>
          <div className="summary-card">
            <div className="label"><Clock size={14} weight="bold" /> Latest</div>
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
                <div className="session-url">
                  <LinkSimple size={14} weight="bold" />
                  <span>{session.url || '-'}</span>
                </div>
              </summary>
              <div className="session-actions">
                <button
                  type="button"
                  className="inspect-btn inspect-btn-secondary"
                  onClick={() => onCopy(session)}
                  disabled={session.logs.length === 0}
                >
                  {copyState[session.id] === 'copied' ? (
                    <CheckCircle size={16} weight="bold" />
                  ) : copyState[session.id] === 'error' ? (
                    <XCircle size={16} weight="bold" />
                  ) : (
                    <Copy size={16} weight="bold" />
                  )}
                  {copyState[session.id] === 'copied'
                    ? 'Copied!'
                    : copyState[session.id] === 'error'
                      ? 'Copy failed'
                      : 'Copy logs'}
                </button>
              </div>
              <div className="session-meta">
                <div>
                  <Tag size={14} weight="bold" /> Session ID:<span>{session.id}</span>
                </div>
                <div>
                  <Timer size={14} weight="bold" /> Duration:<span>{toDuration(session.startedAt, session.endedAt)}</span>
                </div>
                <div>
                  <WarningCircle size={14} weight="bold" /> Status Reason:<span>{session.reason ?? '-'}</span>
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
