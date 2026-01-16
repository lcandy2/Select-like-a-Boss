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

const INSPECT_STORAGE_KEY = 'local:inspectLogs';
const INSPECT_MAX_ENTRIES = 100;
const INSPECT_MAX_SESSIONS = 10;
const INSPECT_BANNER_ID = 'slab-inspect-banner';

let coreInstalled = false;

let inspectState: {
  active: boolean;
  armed: boolean;
  finalized: boolean;
  sessionId: string;
  startedAt: number;
  logs: InspectLogEntry[];
} | null = null;
let inspectBanner: HTMLDivElement | null = null;
let inspectBannerStyle: HTMLStyleElement | null = null;

const ensureInspectBannerStyle = () => {
  if (inspectBannerStyle) return;
  inspectBannerStyle = document.createElement('style');
  inspectBannerStyle.textContent = `
.${INSPECT_BANNER_ID} {
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 2147483647;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid #1f2937;
  background: #ffffff;
  color: #0f172a;
  font-size: 13px;
  font-family: "Segoe UI", "PingFang SC", "Noto Sans SC", system-ui, -apple-system, sans-serif;
}
.${INSPECT_BANNER_ID} button {
  border: 1px solid #1f2937;
  background: #111827;
  color: #ffffff;
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}
.${INSPECT_BANNER_ID} button:hover {
  background: #1f2937;
}
`;
  document.head.appendChild(inspectBannerStyle);
};

const showInspectBanner = () => {
  if (inspectBanner) return;
  ensureInspectBannerStyle();
  inspectBanner = document.createElement('div');
  inspectBanner.className = INSPECT_BANNER_ID;
  inspectBanner.id = INSPECT_BANNER_ID;

  const label = document.createElement('span');
  label.textContent = 'Inspect mode active';

  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = 'End Inspect';
  button.addEventListener('click', () => {
    stopInspect('manual-stop');
  });

  inspectBanner.append(label, button);
  document.body.appendChild(inspectBanner);
};

const hideInspectBanner = () => {
  if (!inspectBanner) return;
  inspectBanner.remove();
  inspectBanner = null;
};

const createSessionId = (): string => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
};

const getSelectionInfo = () => {
  if (!selection) return null;
  const text = selection.toString();
  let rangeInfo: Record<string, unknown> | null = null;
  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    rangeInfo = {
      startOffset: range.startOffset,
      endOffset: range.endOffset,
      collapsed: range.collapsed,
      startContainer: describeNode(range.startContainer),
      endContainer: describeNode(range.endContainer),
    };
  }
  return {
    type: selection.type,
    isCollapsed: selection.isCollapsed,
    rangeCount: selection.rangeCount,
    text: text.length > 120 ? `${text.slice(0, 120)}…` : text,
    range: rangeInfo,
  };
};

const safeComputedStyle = (element: Element) => {
  try {
    const style = getComputedStyle(element);
    return {
      userSelect: style.userSelect,
      pointerEvents: style.pointerEvents,
    };
  } catch {
    return null;
  }
};

const describeNode = (node: Node | null) => {
  if (!node) return null;
  const element =
    node.nodeType === Node.ELEMENT_NODE ? (node as Element) : node.parentElement;
  if (!element) {
    return {
      nodeType: node.nodeType,
      text: node.textContent ? node.textContent.slice(0, 120) : null,
    };
  }
  const rect = element.getBoundingClientRect();
  const isAnchor = element instanceof HTMLAnchorElement;
  const anchor = isAnchor ? element : element.closest('a,button');
  return {
    nodeType: node.nodeType,
    tagName: element.tagName,
    id: element.id || null,
    className: typeof element.className === 'string' ? element.className : null,
    text: element.textContent ? element.textContent.trim().slice(0, 120) : null,
    href: anchor instanceof HTMLAnchorElement ? anchor.href : null,
    role: element.getAttribute('role'),
    draggable: (element as HTMLElement).draggable ?? null,
    isContentEditable: (element as HTMLElement).isContentEditable ?? null,
    rect: {
      x: Math.round(rect.x),
      y: Math.round(rect.y),
      w: Math.round(rect.width),
      h: Math.round(rect.height),
    },
    styles: safeComputedStyle(element),
  };
};

const logInspect = (type: string, data?: Record<string, unknown>): void => {
  if (!inspectState?.active) return;
  inspectState.logs.push({ ts: Date.now(), type, data });
  if (inspectState.logs.length > INSPECT_MAX_ENTRIES) {
    inspectState.logs.shift();
  }
};

const finalizeInspect = (status: 'completed' | 'aborted', reason?: string): void => {
  if (!inspectState?.active || inspectState.finalized) return;
  const snapshot = inspectState;
  snapshot.finalized = true;
  const session: InspectSession = {
    id: snapshot.sessionId,
    url: window.location.href,
    startedAt: snapshot.startedAt,
    endedAt: Date.now(),
    status,
    reason,
    logs: snapshot.logs,
  };
  inspectState = null;
  hideInspectBanner();
  void (async () => {
    try {
      const existing = (await storage.getItem<InspectSession[]>(INSPECT_STORAGE_KEY)) ?? [];
      const next = existing.concat(session);
      if (next.length > INSPECT_MAX_SESSIONS) {
        next.splice(0, next.length - INSPECT_MAX_SESSIONS);
      }
      await storage.setItem(INSPECT_STORAGE_KEY, next);
    } catch (error) {
      console.error('Failed to persist inspect logs', error);
    }
  })();
};

export const startInspectOnce = (): boolean => {
  if (inspectState?.active) return false;
  inspectState = {
    active: true,
    armed: true,
    finalized: false,
    sessionId: createSessionId(),
    startedAt: Date.now(),
    logs: [],
  };
  logInspect('inspect-start', { url: window.location.href });
  showInspectBanner();
  return true;
};

export const stopInspect = (reason: string): boolean => {
  if (!inspectState?.active) return false;
  logInspect('abort', { reason });
  finalizeInspect('aborted', reason);
  return true;
};

const _bind = (evt: string | string[], bind: boolean = true): void => {
  const events: string[] = Array.isArray(evt) ? evt : [evt];
  const method: 'addEventListener' | 'removeEventListener' = bind ? 'addEventListener' : 'removeEventListener';
  events.forEach(e => document[method](e, handlers[e] as EventListener, true));
};

const _unbind = (evt: string | string[]): void => _bind(evt, false);

function getCurrentAnchor(n: Node | null): HTMLAnchorElement | HTMLButtonElement | null {
  while (n && n !== document.body) {
    if (n instanceof HTMLAnchorElement || n instanceof HTMLButtonElement) return n;
    n = n.parentNode;
  }
  return null;
}

const stopEvent = (e: Event): boolean => {
  e.preventDefault();
  e.stopPropagation();
  return false;
};

// browser compatibility
const getRangeFromPoint = (x: number, y: number): Range | null => {
  if ('caretPositionFromPoint' in document) {
    let range = document.createRange();
    let p = (document as any).caretPositionFromPoint(x, y);
    if (p && p.offsetNode) {
      range.setStart(p.offsetNode, p.offset);
      return range;
    }
  }
  return document.caretRangeFromPoint ? document.caretRangeFromPoint(x, y) : null;
}

// user style
const _letUserSelect = (function () {
  let n: Element | null,
      styleElm = document.createElement('style');
  let _className = 'ext-Select-like-a-Boss',
      _property = '-webkit-user-select:text!important;outline-width:0!important;';
  document.head.appendChild(styleElm);
  styleElm.sheet?.insertRule(`.${_className}{${_property}}`, 0);
  return (node?: Element | null): void => {
    if (node) {
      (n = node).classList.add(_className);
    } else if (n) {
      n.classList.remove(_className);
      n = null;
    }
  };
})();

let selection = document.getSelection();
let cursor: { x: number; y: number } = { x: 0, y: 0 },
    movable: { n: HTMLElement; x: number; y: number; c: number } | null,
    needDetermineUserSelection: boolean,
    needCreateStartSelection: boolean,
    needStopClick: boolean,
    userSelecting: boolean,
    regexTDTH = /T[HD]/;

const mainMouseDownHandler = (e: MouseEvent): void => {
  let t = e.target as Node;
  // console.log(t)
  if (inspectState?.active && inspectState.armed) {
    inspectState.armed = false;
    logInspect('mousedown', {
      button: e.button,
      keys: { alt: e.altKey, ctrl: e.ctrlKey, shift: e.shiftKey, meta: e.metaKey },
      cursor: { x: e.clientX, y: e.clientY },
      target: describeNode(t),
      selection: getSelectionInfo(),
    });
  }
  if (e.button !== 0) {
    logInspect('abort', { reason: 'non-left-button' });
    return finalizeInspect('aborted', 'non-left-button');
  } // LMB only
  // resetVars
  needDetermineUserSelection = needCreateStartSelection = true;
  userSelecting = needStopClick = false;
  cursor.x = e.clientX;
  cursor.y = e.clientY;
  if (selection?.type === 'Range') {
    let range = getRangeFromPoint(cursor.x, cursor.y);
    if (range && (selection?.getRangeAt(0)?.isPointInRange(range.startContainer, range.startOffset) ?? false)) {
      logInspect('abort', { reason: 'mousedown-inside-selection', range: describeNode(range.startContainer) });
      return finalizeInspect('aborted', 'mousedown-inside-selection');
    }
  }
  _letUserSelect();
  if (t.nodeType === 3) t = t.parentNode as Node;
  if (e.ctrlKey && regexTDTH.test((t as Element).tagName) || e.altKey) {
    logInspect('abort', { reason: 'modifier-key-blocked', tag: (t as Element).tagName });
    return finalizeInspect('aborted', 'modifier-key-blocked');
  }
  let n = getCurrentAnchor(t);
  // console.log(n)
  logInspect('anchor-check', { target: describeNode(t), anchor: describeNode(n) });
  if (['HTMLTextAreaElement', 'HTMLCanvasElement'].includes(t.constructor.name) || t.textContent === '' || !n) {
    logInspect('abort', {
      reason: 'not-selectable-target',
      target: describeNode(t),
      anchor: describeNode(n),
    });
    return finalizeInspect('aborted', 'not-selectable-target');
  }
  let rect = n.getBoundingClientRect();
  movable = { n: n, x: Math.round(rect.left), y: Math.round(rect.top), c: 0 };
  _bind(['mousemove', 'mouseup', 'dragend', 'dragstart']);
  _letUserSelect(n);
};

// detection range setting
let D = 3,
    K = 0.8;
function getOutFromMoveHandler(): void {
  _unbind(['mousemove', 'mouseup', 'dragend', 'dragstart', 'click']);
  _letUserSelect();
  selection?.removeAllRanges();
}

interface Handlers {
  [key: string]: EventListener;
}

const handlers: Handlers = {
  mousemove: ((e: MouseEvent) => {
    if (movable) {
      if (movable.n.constructor !== HTMLAnchorElement && movable.n.draggable) {
        movable = null;
        logInspect('abort', { reason: 'draggable-target' });
        return getOutFromMoveHandler();
      }
      if (movable.c++ < 12) {
        let rect = movable.n.getBoundingClientRect();
        if (
            Math.round(rect.left) !== movable.x ||
            Math.round(rect.top) !== movable.y
        ) {
          _unbind(['mousemove', 'mouseup', 'dragend', 'dragstart', 'click']);
          _letUserSelect();
          selection?.removeAllRanges();
          logInspect('abort', { reason: 'target-moved', rect: { x: rect.left, y: rect.top } });
          return;
        }
      } else movable = null;
    }
    let x = e.clientX;
    let y = e.clientY;
    logInspect('mousemove', {
      cursor: { x, y },
      state: {
        needDetermineUserSelection,
        needCreateStartSelection,
        needStopClick,
        userSelecting,
      },
    });
    if (needCreateStartSelection) {
      if (!e.altKey || !e.ctrlKey) selection?.removeAllRanges();
      let correct = x > cursor.x ? -2 : 2;
      let range = getRangeFromPoint(x + correct, y);
      if (range) {
        selection?.addRange(range);
        needCreateStartSelection = false;
        logInspect('start-selection', { range: describeNode(range.startContainer) });
      }
    }
    if (needDetermineUserSelection) {
      let vx = Math.abs(cursor.x - x),
          vy = Math.abs(cursor.y - y);
      userSelecting = vy === 0 || vx / vy > K;
      if (vx > D || vy > D) {
        needDetermineUserSelection = false;
        if (userSelecting) {
          needStopClick = true;
          _bind('click');
          logInspect('user-selection-detected', { vx, vy });
        }
      }
    }
    if (userSelecting) {
      let range = getRangeFromPoint(x, y);
      if (range) selection?.extend(range.startContainer, range.startOffset);
    }
  }) as EventListener,
  dragstart: ((e: DragEvent) => {
    _unbind('dragstart');
    if (userSelecting) {
      logInspect('dragstart', { selection: getSelectionInfo() });
      return stopEvent(e);
    }
  }) as EventListener,
  mouseup: ((e: MouseEvent) => {
    _unbind(['mousemove', 'mouseup', 'dragstart', 'dragend']);
    if (!userSelecting && needStopClick) needStopClick = false;
    setTimeout(() => _unbind('click'), 111);
    if (selection?.type !== 'Range') _letUserSelect();
    logInspect('mouseup', {
      button: e.button,
      cursor: { x: e.clientX, y: e.clientY },
      selection: getSelectionInfo(),
    });
    finalizeInspect('completed');
  }) as EventListener,
  dragend: () => {
    _unbind(['dragend', 'mousemove', 'mouseup']);
    logInspect('dragend', { selection: getSelectionInfo() });
    finalizeInspect('completed');
  },
  click: ((e: Event) => {
    _unbind('click');
    if (selection?.type !== 'Range') _letUserSelect();
    if (needStopClick) {
      logInspect('click-stopped', { selection: getSelectionInfo() });
      return stopEvent(e);
    }
  }) as EventListener,
};

export const core = (): void => {
  setCoreEnabled(true);
};

const cleanupSelection = (): void => {
  _unbind(['mousemove', 'mouseup', 'dragend', 'dragstart', 'click']);
  _letUserSelect();
  selection?.removeAllRanges();
  restoreMovableDrag();
  movable = null;
  selectionStart = null;
  lastCaret = null;
  currentAnchor = null;
};

export const setCoreEnabled = (enabled: boolean): void => {
  if (enabled) {
    if (coreInstalled) return;
    coreInstalled = true;
    document.addEventListener('mousedown', mainMouseDownHandler, true);
    return;
  }
  if (!coreInstalled) return;
  coreInstalled = false;
  document.removeEventListener('mousedown', mainMouseDownHandler, true);
  cleanupSelection();
};
