/*
  this file is based on the script.js made by Christoph142 and Dzianis Rusak
  see /LICENSE for license
*/

const _bind = (evt, bind) => {
  if (bind === undefined) bind = true;
  if (evt.constructor !== Array) evt = [evt];
  let method = bind ? 'addEventListener' : 'removeEventListener';
  for (let i = 0, len = evt.length; i < len; i++)
    document[method](evt[i], handlers[evt[i]], true);
};
const _unbind = (evt) => {
  _bind(evt, false);
};
function getCurrentAnchor(n) {
  if (n.href) return n;
  else if (!n.parentNode) return null;
  else return getCurrentAnchor(n.parentNode);
}
const stopEvent = (e) => {
  return e.preventDefault(), e.stopPropagation(), false;
};

// browser compatibility
const getRangeFromPoint = (x, y) => {
  if (document.caretPositionFromPoint) {
    let range = document.createRange();
    let p = document.caretPositionFromPoint(x, y);
    range.setStart(p.offsetNode, p.offset);
    return range;
  } else return document.caretRangeFromPoint(x, y);
}

// user style
const _letUserSelect = (function () {
  let n,
    styleElm = document.createElement('style');
  let _data = 'data-Select-like-a-Boss',
    _property = '-webkit-user-select:text!important;outline-width:0!important';
  document.head.appendChild(styleElm);
  styleElm.sheet.insertRule(`[${_data}],[${_data}] *{${_property}}`, 0);
  return (node) => {
    if (node) {
      (n = node).setAttribute(_data, 1);
    } else if (n) {
      n.removeAttribute(_data);
      n = null;
    }
  };
})();

let selection = document.getSelection();
let cursor = {},
  movable,
  needDetermineUserSelection,
  needCreateStartSelection,
  needStopClick,
  userSelecting;
const mouseDownHandler = (e) => {
  if (e.which !== 1 || getCurrentAnchor(e.target) === null) return; // LMB on links only
  // resetVars
  needDetermineUserSelection = needCreateStartSelection = true;
  userSelecting = needStopClick = false;
  cursor.x = e.clientX;
  cursor.y = e.clientY;
  if (selection.type === 'Range') {
    let range = getRangeFromPoint(cursor.x, cursor.y);
    if (range && selection.getRangeAt(0).isPointInRange(range.startContainer, range.startOffset)
    )
      return;
  }
  _letUserSelect();
  let n = getCurrentAnchor(e.target);
  let rect = n.getBoundingClientRect();
  movable = { n: n, x: Math.round(rect.left), y: Math.round(rect.top), c: 0 };
  _bind(['mousemove', 'mouseup', 'dragend', 'dragstart']);
  _letUserSelect(n);
};
// detection range setting
let D = 3,
  K = 0.8;
const handlers = {
  mousemove: (e) => {
    if (movable) {
      if (movable.c++ < 12) {
        let rect = movable.n.getBoundingClientRect();
        if (
          Math.round(rect.left) !== movable.x ||
          Math.round(rect.top) !== movable.y
        ) {
          _unbind(['mousemove', 'mouseup', 'dragend', 'dragstart', 'click']);
          _letUserSelect();
          selection.removeAllRanges();
          return;
        }
      } else movable = null;
    }
    let x = e.clientX;
    let y = e.clientY;
    if (needCreateStartSelection) {
      selection.removeAllRanges();
      let correct = x > cursor.x ? -2 : 2;
      let range = getRangeFromPoint(x + correct, y);
      if (range) {
        selection.addRange(range);
        needCreateStartSelection = false;
      }
    }
    if (needDetermineUserSelection) {
      let vx = Math.abs(cursor.x - x);
      let vy = Math.abs(cursor.y - y);
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
      if (range) selection.extend(range.startContainer, range.startOffset);
    }
  },
  dragstart: (e) => {
    _unbind('dragstart');
    if (userSelecting) return stopEvent(e);
  },
  mouseup: (e) => {
    _unbind(['mousemove', 'mouseup', 'dragstart', 'dragend']);
    if (!userSelecting && needStopClick) needStopClick = false;
    setTimeout(function () {
      _unbind('click');
    }, 111);
    if (selection.type !== 'Range') _letUserSelect();
  },
  dragend: () => {
    _unbind(['dragend', 'mousemove', 'mouseup']);
  },
  click: function (e) {
    _unbind('click');
    if (selection.type !== 'Range') _letUserSelect();
    if (needStopClick) return stopEvent(e);
  },
};

document.addEventListener('mousedown', mouseDownHandler, true);
