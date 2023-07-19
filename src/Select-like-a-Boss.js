// Create and insert style element
const styleElm = document.createElement('style');
document.head.appendChild(styleElm);
styleElm.sheet.insertRule('.ext-Select-like-a-Boss {user-select: text !important; outline-width: 0 !important;}', 0);

const getRangeFromPoint = (x, y) =>
  document.caretPositionFromPoint
    ? (() => {
      const range = document.createRange();
      const p = document.caretPositionFromPoint(x, y);
      range.setStart(p.offsetNode, p.offset);
      return range;
    })()
    : document.caretRangeFromPoint(x, y);

const stopEvent = (e) => {
  e.preventDefault();
  e.stopPropagation();
  return false;
};

let selection = document.getSelection();
let cursor = {}, userSelecting;
let justSelected = false;

const handlers = {
  mousemove: (e) => {
    let x = e.clientX, y = e.clientY;
    let vx = Math.abs(cursor.x - x), vy = Math.abs(cursor.y - y);
    userSelecting = vy === 0 || vx / vy > 0.8;
    if (userSelecting && (vx > 3 || vy > 3)) {
      let range = getRangeFromPoint(x, y);
      if (range && selection.rangeCount > 0) {  // Check if a selection range exists
        selection.extend(range.startContainer, range.startOffset);
      }
    }
  },
  mouseup: (e) => {
    ['mousemove', 'mouseup', 'dragstart', 'dragend'].forEach(event => removeEvent(event, handlers[event]));
    if (userSelecting) {
      justSelected = true;
      addEvent('click', handlers.click);
    }
    toggleUserSelect(e.target, false);
  },
  dragstart: (e) => {
    if (userSelecting) return stopEvent(e);
  },
  dragend: (e) => ['dragend', 'mousemove', 'mouseup'].forEach(event => removeEvent(event, handlers[event])),
  click: (e) => {
    if (justSelected) {
      justSelected = false;
      removeEvent('click', handlers.click);
      return stopEvent(e);
    }
  },
};

const addEvent = (event, handler) => document.addEventListener(event, handler, true);
const removeEvent = (event, handler) => document.removeEventListener(event, handler, true);

const toggleUserSelect = (node, enable = false) => {
  if (node) {
    if (enable) node.classList.add('ext-Select-like-a-Boss');
    else node.classList.remove('ext-Select-like-a-Boss');
  }
};

document.addEventListener('mousedown', (e) => {
  const excludeTags = e.target.closest('img, p, h1, h2, h3, h4, h5, h6, canvas, code, picture, svg, sub, strong, span, audio, video, em, blockquote, mark, del, ins, sup, abbr, object, embed, progress')
  let excludeTagsCount = 1;
  if (excludeTags) excludeTagsCount = excludeTags.childElementCount;
  if (e.button !== 0 || excludeTagsCount === 0) { excludeTagsCount = 1; return; }
  userSelecting = false;
  cursor.x = e.clientX;
  cursor.y = e.clientY;
  if (selection.type === 'Range') {
    let range = getRangeFromPoint(cursor.x, cursor.y);
    if (range && selection.getRangeAt(0).isPointInRange(range.startContainer, range.startOffset)) return;
  }
  let range = getRangeFromPoint(e.clientX, e.clientY);
  if (range) {
    selection.removeAllRanges();
    selection.addRange(range);
  }
  toggleUserSelect(e.target, true);
  ['mousemove', 'mouseup', 'dragstart', 'dragend'].forEach(event => addEvent(event, handlers[event]));
}, true);
