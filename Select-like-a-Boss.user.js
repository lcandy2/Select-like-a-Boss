// ==UserScript==
// @name         Select like a Boss
// @namespace    https://github.com/lcandy2/Select-like-a-Boss
// @version      2023.7.37
// @license      MPL-2.0
// @description  With this extension, you can easily select link text just like regular text, making it easier to copy. Just Select like a Boss! ;)
// @author       seril🍋
// @match        *
// @run-at       document-end
// @homepageURL  https://lcandy2.github.io/Select-like-a-Boss/
// @icon         https://raw.githubusercontent.com/lcandy2/Select-like-a-Boss/main/src/icons/icon16.png
// @downloadURL  https://raw.githubusercontent.com/lcandy2/Select-like-a-Boss/main/Yet_Another_Weibo_Filter.user.js
// @supportURL   https://github.com/lcandy2/Select-like-a-Boss/issues
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
const _bind = (evt, bind = true) => {
  const events = Array.isArray(evt) ? evt : [evt];
  const method = bind ? 'addEventListener' : 'removeEventListener';
  events.forEach(e => document[method](e, handlers[e], true));
};
const _unbind = (evt) => _bind(evt, false);

function getCurrentAnchor(n) {
  while (n && n !== document.body) {
    if (n instanceof HTMLAnchorElement) return n;
    n = n.parentNode;
  }
  return null;
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
  let _className = 'ext-Select-like-a-Boss',
    _property = '-webkit-user-select:text!important;outline-width:0!important;';
  document.head.appendChild(styleElm);
  styleElm.sheet.insertRule(`.${_className}{${_property}}`, 0);
  return (node) => {
    if (node) {
      (n = node).classList.add(_className);
    } else if (n) {
      n.classList.remove(_className);
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
  userSelecting,
  regexTDTH = /T[HD]/;

const mainMouseDownHandler = (e) => {
  let t = e.target
  if (e.button !== 0 || getCurrentAnchor(t) === null) return // LMB on links only
  // resetVars
  needDetermineUserSelection = needCreateStartSelection = true;
  userSelecting = needStopClick = false;
  cursor.x = e.clientX;
  cursor.y = e.clientY;
  if (selection.type === 'Range') {
    let range = getRangeFromPoint(cursor.x, cursor.y);
    if (range && selection.getRangeAt(0).isPointInRange(range.startContainer, range.startOffset)
    ) return;
  }
  _letUserSelect();
  if (t.nodeType === 3) t = t.parentNode
  if (e.ctrlKey && regexTDTH.test(t.tagName) || e.altKey) return;
  let n = getCurrentAnchor(t);
  if (['HTMLTextAreaElement', 'HTMLCanvasElement'].includes(t.constructor.name) || t.textContent === '') return;
  let rect = n.getBoundingClientRect();
  movable = { n: n, x: Math.round(rect.left), y: Math.round(rect.top), c: 0 };
  _bind(['mousemove', 'mouseup', 'dragend', 'dragstart']);
  _letUserSelect(n);
};

// detection range setting
let D = 3,
  K = 0.8;
function getOutFromMoveHandler() {
  _unbind(['mousemove', 'mouseup', 'dragend', 'dragstart', 'click']);
  _letUserSelect();
  selection.removeAllRanges();
}

const handlers = {
  mousemove: (e) => {
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
          selection.removeAllRanges();
          return;
        }
      } else movable = null;
    }
    let x = e.clientX;
    let y = e.clientY;
    if (needCreateStartSelection) {
      if (!e.altKey || !e.ctrlKey) selection.removeAllRanges();
      let correct = x > cursor.x ? -2 : 2;
      let range = getRangeFromPoint(x + correct, y);
      if (range) {
        selection.addRange(range);
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
    setTimeout(() => _unbind('click'), 111);
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

document.addEventListener('mousedown', mainMouseDownHandler, true);

})();
