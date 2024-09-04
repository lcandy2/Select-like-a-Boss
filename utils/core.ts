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
  if (e.button !== 0) return; // LMB only
  // resetVars
  needDetermineUserSelection = needCreateStartSelection = true;
  userSelecting = needStopClick = false;
  cursor.x = e.clientX;
  cursor.y = e.clientY;
  if (selection?.type === 'Range') {
    let range = getRangeFromPoint(cursor.x, cursor.y);
    if (range && (selection?.getRangeAt(0)?.isPointInRange(range.startContainer, range.startOffset) ?? false)) return;
  }
  _letUserSelect();
  if (t.nodeType === 3) t = t.parentNode as Node;
  if (e.ctrlKey && regexTDTH.test((t as Element).tagName) || e.altKey) return;
  let n = getCurrentAnchor(t);
  // console.log(n)
  if (['HTMLTextAreaElement', 'HTMLCanvasElement'].includes(t.constructor.name) || t.textContent === '' || !n) return;
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
          return;
        }
      } else movable = null;
    }
    let x = e.clientX;
    let y = e.clientY;
    if (needCreateStartSelection) {
      if (!e.altKey || !e.ctrlKey) selection?.removeAllRanges();
      let correct = x > cursor.x ? -2 : 2;
      let range = getRangeFromPoint(x + correct, y);
      if (range) {
        selection?.addRange(range);
        needCreateStartSelection = false;
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
    if (userSelecting) return stopEvent(e);
  }) as EventListener,
  mouseup: ((e: MouseEvent) => {
    _unbind(['mousemove', 'mouseup', 'dragstart', 'dragend']);
    if (!userSelecting && needStopClick) needStopClick = false;
    setTimeout(() => _unbind('click'), 111);
    if (selection?.type !== 'Range') _letUserSelect();
  }) as EventListener,
  dragend: () => {
    _unbind(['dragend', 'mousemove', 'mouseup']);
  },
  click: ((e: Event) => {
    _unbind('click');
    if (selection?.type !== 'Range') _letUserSelect();
    if (needStopClick) return stopEvent(e);
  }) as EventListener,
};

export const core = (): void => {
  document.addEventListener('mousedown', mainMouseDownHandler, true);
}
