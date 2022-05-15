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
(function(){
	'use strict';

	var regex = /(docs\.google\.)/gi;
	var host = window.location.host;
	if(regex.test(host))
		return;

	var EXTENSION_ID_STR = 'select-like-a-boss-extension';
	var DOM_CONTENT_LOADED_STR = 'DOMContentLoaded';
	var includeScript = function(doc){
		var to = doc.head;
		if( ! to)
			return;
		var s = doc.createElement('script');
		s.id = EXTENSION_ID_STR;
		s.src = chrome.extension.getURL('script.js');
		to.appendChild(s);
	};
	var onlyIfChromeLess37 = function(){};
	var chromeVersion = parseInt(window.navigator.appVersion.match(/Chrome\/(\d+)\./)[1], 10);
	if(chromeVersion < 37){
		onlyIfChromeLess37 = function(){
			document.body.addEventListener('DOMNodeInserted', function(e){
				if(e.target.constructor === HTMLIFrameElement){
					var doc = e.target.contentDocument;
					if(doc && ! doc.getElementById(EXTENSION_ID_STR))
						includeScript(doc);
				}
			});
		}
	}
	document.addEventListener(DOM_CONTENT_LOADED_STR, function listenerDOMContentLoaded(e){
		document.removeEventListener(DOM_CONTENT_LOADED_STR, listenerDOMContentLoaded);
		includeScript(document);
		onlyIfChromeLess37();
	});
})(window);