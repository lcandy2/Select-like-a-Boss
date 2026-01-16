import { storage } from '#imports';

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

const summaryEl = document.getElementById('summary') as HTMLDivElement;
const sessionsEl = document.getElementById('sessions') as HTMLDivElement;
const refreshBtn = document.getElementById('refresh') as HTMLButtonElement;
const clearBtn = document.getElementById('clear') as HTMLButtonElement;

const formatTime = (ts: number): string => {
  if (!ts) return '-';
  return new Date(ts).toLocaleString();
};

const toDuration = (start: number, end: number): string => {
  if (!start || !end || end < start) return '-';
  const ms = end - start;
  const seconds = Math.round(ms / 100) / 10;
  return `${seconds}s`;
};

const renderSummary = (sessions: InspectSession[]) => {
  summaryEl.innerHTML = '';
  const totalLogs = sessions.reduce((sum, session) => sum + session.logs.length, 0);
  const lastSession = sessions[0];

  const items: Array<{ label: string; value: string }> = [
    { label: 'Sessions', value: String(sessions.length) },
    { label: 'Total Logs', value: String(totalLogs) },
    { label: 'Latest', value: lastSession ? formatTime(lastSession.startedAt) : '-' },
  ];

  for (const item of items) {
    const card = document.createElement('div');
    card.className = 'summary-card';
    const label = document.createElement('div');
    label.className = 'label';
    label.textContent = item.label;
    const value = document.createElement('div');
    value.className = 'value';
    value.textContent = item.value;
    card.append(label, value);
    summaryEl.append(card);
  }
};

const renderSessions = (sessions: InspectSession[]) => {
  sessionsEl.innerHTML = '';
  if (sessions.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty';
    empty.textContent = 'No inspect sessions yet. Click “Inspect once” in the popup, then try selecting a link.';
    sessionsEl.append(empty);
    return;
  }

  for (const session of sessions) {
    const details = document.createElement('details');
    details.className = 'session';

    const summary = document.createElement('summary');

    const title = document.createElement('div');
    title.className = 'session-title';
    title.textContent = `${formatTime(session.startedAt)} · ${session.logs.length} logs`;

    const statusChip = document.createElement('span');
    statusChip.className = `status-chip ${session.status}`;
    statusChip.textContent = session.status;

    const url = document.createElement('div');
    url.className = 'session-url';
    url.textContent = session.url || '-';

    title.append(' ', statusChip);
    summary.append(title, url);

    const meta = document.createElement('div');
    meta.className = 'session-meta';
    const metaItems: Array<{ label: string; value: string }> = [
      { label: 'Session ID', value: session.id },
      { label: 'Duration', value: toDuration(session.startedAt, session.endedAt) },
      { label: 'Status Reason', value: session.reason ?? '-' },
    ];
    for (const item of metaItems) {
      const line = document.createElement('div');
      line.textContent = `${item.label}: `;
      const value = document.createElement('span');
      value.textContent = item.value;
      line.append(value);
      meta.append(line);
    }

    const logs = document.createElement('div');
    logs.className = 'logs';
    for (const entry of session.logs) {
      const row = document.createElement('div');
      row.className = 'log-row';

      const titleRow = document.createElement('div');
      titleRow.className = 'log-title';

      const label = document.createElement('span');
      label.textContent = entry.type;
      const time = document.createElement('span');
      time.className = 'log-time';
      time.textContent = formatTime(entry.ts);

      titleRow.append(label, time);
      row.append(titleRow);

      if (entry.data && Object.keys(entry.data).length > 0) {
        const pre = document.createElement('pre');
        pre.textContent = JSON.stringify(entry.data, null, 2);
        row.append(pre);
      }

      logs.append(row);
    }

    details.append(summary, meta, logs);
    sessionsEl.append(details);
  }
};

const loadSessions = async () => {
  const sessions = (await storage.getItem<InspectSession[]>(STORAGE_KEY)) ?? [];
  const sorted = sessions.slice().sort((a, b) => b.startedAt - a.startedAt);
  renderSummary(sorted);
  renderSessions(sorted);
};

refreshBtn.addEventListener('click', () => {
  void loadSessions();
});

clearBtn.addEventListener('click', async () => {
  clearBtn.disabled = true;
  try {
    await storage.setItem(STORAGE_KEY, []);
  } finally {
    clearBtn.disabled = false;
  }
  await loadSessions();
});

storage.watch<InspectSession[]>(STORAGE_KEY, () => {
  void loadSessions();
});

void loadSessions();
