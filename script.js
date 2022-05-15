/**********************************************************************************\

	Copyright (c) 2014-2015 Dzianis Rusak

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in
	all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	THE SOFTWARE.

\**********************************************************************************/

window.SelectLikeABoss = window.SelectLikeABoss || (function(){
	var getCurrentAnchor = function(node){
		do{
			if(node.constructor === HTMLAnchorElement)
				return node;
		}while((node = node.parentNode) && node !== document.body);
		return null;
	};
	var stopEvent = function(e){
		return e.preventDefault(), e.stopPropagation(), false;
	};
	var browser = (function(){
		var w = 'WebkitAppearance' in document.documentElement.style;
		var f = typeof InstallTrigger !== 'undefined';
		return {
			getRangeFromPoint: function(x,y){
				if(f){
					var range = document.createRange();
					var p = document.caretPositionFromPoint(x,y);
					range.setStart(p.offsetNode, p.offset);
					return range;
				}
				return document.caretRangeFromPoint(x,y);
			}
			, isWK : w
			, isFF : f
		};
	})();
	var _letUserSelect = (function(){
		var CLASS_NAME = 'c-ext-Select-like-a-Boss';
		var s = document.createElement('style');
		document.head.appendChild(s);
		var prefix = '';
		if(browser.isWK) prefix = '-webkit-';
		if(browser.isFF) prefix = '-moz-';
		s.sheet.insertRule('.'+CLASS_NAME+'{outline-width:0 !important;'+prefix+'user-select:text !important}', 0);
		var n;
		return function(node){
			if(node){
				(n = node).classList.add(CLASS_NAME);
			}else if(n){
				n.classList.remove(CLASS_NAME);
				n = null;
			}
		};
	})();
	var _bind = function(evt, bind){
		if(bind === undefined)
			bind = true;
		if(evt.constructor !== Array)
			evt = [evt];
		for(var i = 0, len = evt.length; i < len; i+=1)
			document[bind ? 'addEventListener' : 'removeEventListener'](evt[i], handlers[evt[i]], true);
	};
	var _unbind = function(evt){
		_bind(evt, false);
	};
	var cursor;
	var needDetermineUserSelection;
	var userSelecting;
	var needCreateStartSelection;
	var needStopClick;
	var resetVars = function(){
		needDetermineUserSelection = needCreateStartSelection = true;
		userSelecting = needStopClick = false;
	};
	var movable;
	var DBL_PRESS_TIME = 500,
		timeDown = 0,
		timeDownLast = 0,
		isDblPress = !1;
	var s = document.getSelection();
	var t;
	var regexTDTH = /T[HD]/;
	var mainMouseDownHandler = function(e){
		if(e.which < 2){
			resetVars();
			timeDown = Date.now();
			isDblPress = timeDown - timeDownLast < DBL_PRESS_TIME;
			timeDownLast = timeDown;
			if(isDblPress)
				return;
			var x = e.clientX,
				y = e.clientY;
			if( ! s.isCollapsed){
				var range = browser.getRangeFromPoint(x, y);
				if(range && s.getRangeAt(0).isPointInRange(range.startContainer, range.startOffset))
					return;
			}
			_letUserSelect();
			var t = e.target;
			if(t.nodeType === 3)
				t = t.parentNode;
			if(e.ctrlKey && browser.isFF && regexTDTH.test(t.tagName))
				return;
			var n = getCurrentAnchor(t);
			if( ! n){
				if(    t.constructor === HTMLTextAreaElement
					|| t.constructor === HTMLCanvasElement
					|| t.textContent === '')
					return;
				n = t;
			}
			var rect = n.getBoundingClientRect();
			movable = {n: n, x: Math.round(rect.left), y: Math.round(rect.top), c: 0};
			cursor = {x:x, y:y};
			_bind(['mousemove','mouseup','dragend','dragstart']);
			_letUserSelect(n);
		}
	};
	var D = 3; var K = 0.8;
	function getOutFromMoveHandler(){
		_unbind(['mousemove','mouseup','dragend',   'dragstart', 'click']);
		_letUserSelect();
		s.removeAllRanges();
	}
	var handlers = {
		mousemove: function(e){
			if(e.which < 1)
				return getOutFromMoveHandler();
			if(movable){
				if(movable.n.constructor !== HTMLAnchorElement && movable.n.draggable){
					movable = null;
					return getOutFromMoveHandler();
				}
				if(movable.c++ < 12){
					var rect = movable.n.getBoundingClientRect();
					if(Math.round(rect.left) !== movable.x || Math.round(rect.top) !== movable.y)
						return getOutFromMoveHandler();
				}else{
					movable = null;
				}
			}
			var x = e.clientX,
				y = e.clientY;
			if(needCreateStartSelection){
				if( ! e.ctrlKey || ! browser.isFF)
					s.removeAllRanges();
				var correct = x > cursor.x ? -2 : 2;
				var range = browser.getRangeFromPoint(x + correct, y);
				if(range){
					s.addRange(range);
					needCreateStartSelection = false;
				}
			}
			if(needDetermineUserSelection){
				var vx = Math.abs(cursor.x - x),
					vy = Math.abs(cursor.y - y);
				userSelecting = vy === 0 || vx / vy > K;
				if(vx > D || vy > D){
					needDetermineUserSelection = false;
					needStopClick = true;
					_bind('click');
				}
			}
			if(userSelecting){
				var range = browser.getRangeFromPoint(x, y - 3);
				if(range)
					s.extend(range.startContainer, range.startOffset);
			}
		}
		, dragstart: function(e){
			_unbind('dragstart');
			if(userSelecting)
				return stopEvent(e);
		}
		, mouseup: function(e){
			_unbind(['mouseup','mousemove','dragstart','dragend']);
			if( ! userSelecting && needStopClick)
				needStopClick = false;
			setTimeout(function(){_unbind('click')}, 111);
			if(s.isCollapsed)
				_letUserSelect();
		}
		, dragend: function(e){
			_unbind(['dragend','mousemove','mouseup']);
		}
		, click: function(e){
			_unbind('click');
			if(needStopClick)
				return stopEvent(e);
		}
	};
	var enabled;
	return {
		toggle: function(is){
			enabled = is !== undefined ? is : ! enabled;
			document[enabled ? 'addEventListener' : 'removeEventListener']('mousedown', mainMouseDownHandler, true);
			if( ! enabled)
				_letUserSelect();
		}
		, on : function(){this.toggle(true)}
		, off: function(){this.toggle(false)}
	};
})(window);
window.SelectLikeABoss.on();