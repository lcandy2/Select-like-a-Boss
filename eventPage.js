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
var showIcon = !1;
var _hide = function(id){
  chrome.pageAction.hide(id);
}
var _show = function(id){
  if(showIcon)
    chrome.pageAction.show(id);
}
chrome.storage.sync.get({
  noIcon: false
}, function(items){
  showIcon = ! items.noIcon;
});
chrome.storage.onChanged.addListener(function(changes){
  for(key in changes){
    if(key === 'noIcon'){
      var fn = (showIcon = ! changes[key].newValue) ? _show : _hide;
      chrome.windows.getAll({populate: true}, function(windows){
        windows.forEach(function(window){
          window.tabs.forEach(function(tab){
            fn(tab.id);
          });
        });
      });
    }
  }
});
chrome.tabs.onCreated.addListener(function(tab){
  _show(tab.id);
});
chrome.tabs.onUpdated.addListener(_show);
chrome.tabs.onReplaced.addListener(_show);
chrome.pageAction.onClicked.addListener(function(tab){
  openHelpPage();
});
function openHelpPage(){
  chrome.tabs.create({url: 'help.html'});
}
function injectIntoTabs(incognitoOnly){
  chrome.windows.getAll({populate: true}, function(windows){
    windows.forEach(function(window){
      if( ! incognitoOnly || window.incognito)
        window.tabs.forEach(addSelectLikeABoss);
    });
  });
}
var regex = /(chrome|opera|vivaldi|\-extension|view\-source)/;
function addSelectLikeABoss(tab){
  if( ! regex.test(tab.url.split(':')[0])){
    chrome.tabs.executeScript(tab.id, {
      file: 'script.js',
      allFrames: true
    });
    _show(tab.id);
  }
}
chrome.runtime.onInstalled.addListener(function(details){
  if(details.reason === 'install'){
    openHelpPage();
    injectIntoTabs();
  }
});
chrome.extension.isAllowedIncognitoAccess(function(isAllowed){
  injectIntoTabs(true);
});
