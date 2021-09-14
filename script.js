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

if(typeof SelectLikeABoss !== 'undefined')
	SelectLikeABoss.del();
SelectLikeABoss = (function(){
	function stopEvent(e){
		return e.preventDefault(), e.stopPropagation(), !1;
	}
	function _bind(evt, bind){
		if(bind === undefined)
			bind = true;
		if(evt.constructor !== Array)
			evt = [evt];
		for(var i = 0, l = evt.length; i < l; i+=1)
			document[bind ? 'addEventListener' : 'removeEventListener'](evt[i], handlers[evt[i]], true);
	}
	function _unbind(evt){
		_bind(evt, false);
	}
	var browser = (function(){
		var w = 'WebkitAppearance' in document.documentElement.style;
		var f = typeof InstallTrigger !== 'undefined';
		return {
			getRangeFromPoint: function(x,y){
				if(document.caretRangeFromPoint)
					return document.caretRangeFromPoint(x,y);
				if(document.caretPositionFromPoint){
					var p = document.caretPositionFromPoint(x,y);
					if(p){
						var range = document.createRange();
						range.setStart(p.offsetNode, p.offset);
					}
				}
				return range;
			}
			, isWK : w
			, isFF : f
		};
	})();
	var styleElm,
	_letUserSelect = (function(){
		var DATA = 'data-Select-like-a-Boss';
		var prefix = '',
			n;
		document.head.appendChild(styleElm = document.createElement('style'));
		if(browser.isWK) prefix = '-webkit-';
		else if(browser.isFF) prefix = '-moz-';
		styleElm.sheet.insertRule('['+DATA+'],['+DATA+'] *{'+prefix+'user-select:text!important;outline:none!important}',0);
		return function(node){
			if(node){
				(n = node).setAttribute(DATA,1);
			}else if(n){
				n.removeAttribute(DATA);
				n = null;
			}
		};
	})();
	var findFulcrum = (function(){
		var NODE_EXCLUDED = null,
			NODE_UNDF;
		var gc_top = [
				HTMLBodyElement,
				HTMLHtmlElement,
				HTMLTableCellElement,
				HTMLLIElement,
				HTMLUListElement,
				HTMLOListElement,
				HTMLFormElement,
				HTMLPreElement
			],
			gc_exclude = [
				HTMLCanvasElement,
				HTMLTextAreaElement,
				HTMLInputElement,
				HTMLImageElement
			],
			gc_elements = [
				HTMLAnchorElement,
				HTMLButtonElement,
			],
			gc_roles = ['button', 'menu','menuitem','menuitemcheckbox','menuitemradio', 'option', 'tab'];
		function getCurrent_(node){
			var n = node,
				gc_ie, gc_ir,
				c, r,
				ret = {
					n: NODE_EXCLUDED,
					likeUI:  !1,
					isAnchor:!1
				};
			do{
				c = n.constructor;
				if(gc_top.indexOf(c) > -1)
					break;
				if(gc_exclude.indexOf(c) > -1)
					return ret;
				gc_ie = gc_elements.indexOf(c);
				gc_ir = (r = n.getAttribute('role')) ? gc_roles.indexOf(r) : -1;
				if(gc_ie > -1 || gc_ir > -1){
					ret.isAnchor= gc_ie === 0;
					ret.likeUI  = gc_ir >= 0 || gc_ie > 0;
					if(n.textContent !== '')
						ret.n = n;
					return ret;
				}
			}while(n = n.parentNode);
			if(node.textContent !== '')
				ret.n = NODE_UNDF;
			return ret;
		}
		function _fHasParentAnchor(n){
			var c;
			while((n = n.parentNode) && (c = n.constructor) !== HTMLBodyElement)
				if(c === HTMLAnchorElement)
					return true;
		}
		return function(target){
			if(target.nodeType === 3)
				target = target.parentNode;
			var c = getCurrent_(target);
			if(c.n === NODE_EXCLUDED)
				return;
			var n = c.n ? c.n : target;
			if(isNotLinkAndDraggable(n))
				return;
			return {
				forced: !! c.n,
				node: n,
				likeUI:  c.likeUI,
				isAnchor:c.isAnchor,
				hasParentAnchor: ! c.isAnchor && c.n && _fHasParentAnchor(c.n)
			};
		};
	})();
	function getCurrentAnchor(node){
		var c;
		do{
			if(node.nodeType === 3)
				continue;
			if((c = node.constructor) === HTMLAnchorElement)
				return node;
			if(c === HTMLBodyElement || c === HTMLHtmlElement)
				break;
		}while(node = node.parentNode);
	}
	var cursor = {},
		f_moveFired,
		needDetermineUserSelection,
		userSelecting,
		needCreateStartSelection,
		needStopClick,
		timeDown,
		s,
		_range,
		o;
	function resetVars(){
		needDetermineUserSelection = needCreateStartSelection = true;
		f_moveFired = userSelecting = needStopClick = false;
	}
	var events_mMove_mUp_dStart_dEnd_Click	= ['mousemove','mouseup','dragstart','dragend','click'],
		events_mMove_mUp_dStart_dEnd		= ['mousemove','mouseup','dragstart','dragend'];
	function unbindAndDeselect(events){
		_unbind(events !== undefined ? events : events_mMove_mUp_dStart_dEnd_Click);
		_letUserSelect();
		s.removeAllRanges();
	}
	function isNotLinkAndDraggable(n){
		return n.constructor !== HTMLAnchorElement && n.draggable;
	}
	var hack_lazy_draggable = (function(){
		function hack_binder(act){document[act+'EventListener']('mousemove', hack_handler, true);}
		function hack_handler(){
			hack_binder('remove');
			if( ! o || isNotLinkAndDraggable(o.node))
				unbindAndDeselect('click');
		}
		return function(){
			hack_binder('remove');
			hack_binder('add');
		};
	})();
	function mainMouseDownHandler(e){
		if(e.which < 2){
			resetVars();
			timeDown = e.timeStamp;
			cursor.x = e.clientX;
			cursor.y = e.clientY;
			s = window.getSelection();
			if( ! s.isCollapsed && (_range = browser.getRangeFromPoint(cursor.x, cursor.y))){
				for(var i = 0, l = s.rangeCount; i < l; i+=1)
					if(s.getRangeAt(i).isPointInRange(_range.startContainer, _range.startOffset))
						return;
			}
			_letUserSelect();
			if( ! (o = findFulcrum(e.target)))
				return;
			if(o.forced){
				_bind(events_mMove_mUp_dStart_dEnd);
			}else{
				_bind('click');
				hack_lazy_draggable();
			}
			_letUserSelect(o.node);
		}
	}
	var D = 3,
		K = 1.4,
		T = 151;
	function isCasual(e){
		return e.timeStamp - timeDown < T && Math.abs(cursor.x - e.clientX) < 41;
	}
	function startNewSelection(e, x,y){
		if( ! e.ctrlKey || ! browser.isFF)
			s.removeAllRanges();
		var correct = x > cursor.x ? -2 : 2;
		if(_range = browser.getRangeFromPoint(x + correct, y)){
			s.addRange(_range);
			needCreateStartSelection = false;
		}
	}
	function stopDetermining(isDragging){
		needDetermineUserSelection = false;
		if( ! isDragging){
			needStopClick = true;
			_bind('click');
		}
	}
	var handlers = {
		mousemove: function(e){
			f_moveFired = true;
			if(e.which < 1)
				return unbindAndDeselect();
			var x = e.clientX,
				y = e.clientY;
			if(needCreateStartSelection)
				startNewSelection(e, x,y);
			if(needDetermineUserSelection){
				var vx = Math.abs(cursor.x - x),
					vy = Math.abs(cursor.y - y);
				var _uSel = vy === 0 || vx / vy > K;
				if(browser.isFF)
					userSelecting = _uSel;
				if(vx > D || vy > D){
					userSelecting = _uSel;
					stopDetermining( ! userSelecting);
				}
			}
			if(userSelecting){
				if(_range = browser.getRangeFromPoint(x, y - 3)){
					s.extend(_range.startContainer, _range.startOffset);
					if( ! s.isCollapsed)
						stopDetermining();
				}
			}else{
				if( ! needDetermineUserSelection)
					unbindAndDeselect();
			}
		}
		, dragstart: function(e){
			_unbind('dragstart');
			if( ! f_moveFired){
				userSelecting = true;
				startNewSelection(e, e.clientX, e.clientY);
			}
			if(userSelecting)
				return stopEvent(e);
		}
		, mouseup: function(e){
			_unbind(events_mMove_mUp_dStart_dEnd);
			var anchorEnv = o.isAnchor || o.hasParentAnchor;
			if((anchorEnv || o.likeUI) && isCasual(e)){
				if(userSelecting && ! s.isCollapsed){
					unbindAndDeselect('click');
					if(browser.isWK && anchorEnv && getCurrentAnchor(e.target) === getCurrentAnchor(o.node))
						o.node.dispatchEvent(new MouseEvent('click', e));
				}
				return;
			}
			if( ! userSelecting && needStopClick)
				needStopClick = false;
			setTimeout(function(){_unbind('click')}, 111);
			if(s.isCollapsed)
				_letUserSelect();
			if(o.likeUI && ! s.isCollapsed && ! isCasual(e)){
				needStopClick = true;
				return stopEvent(e);
			}
		}
		, click: function(e){
			_unbind('click');
			if(s.isCollapsed)
				_letUserSelect();
			if(needStopClick || ( ! s.isCollapsed && ! isCasual(e) && ! o.forced))
				return stopEvent(e);
		}
		, dragend: function(e){_unbind(events_mMove_mUp_dStart_dEnd);}
	};
	var enabled;
	return {
		toggle: function(is){
			enabled = ! (is !== undefined ? ! is : enabled);
			document[(enabled ? 'add' : 'remove') + 'EventListener']('mousedown', mainMouseDownHandler, true);
			if( ! enabled)
				_letUserSelect();
		}
		, on : function(){this.toggle(!0)}
		, off: function(){this.toggle(!1)}
		, del: function(){
			if(styleElm)
				styleElm.parentNode.removeChild(styleElm);
			this.off();
			delete SelectLikeABoss;
		}
	};
})();
SelectLikeABoss.on();