function i18n() {
    setLocalization('helpTitle');
    setLocalization('helpHeading');
    setLocalization('helpThanks');
    setLocalization('helpDescription');
    setLocalization('helpSelect');
    setLocalization('helpSelectContent');
    setLocalization('helpDrag');
    setLocalization('helpDragContent');
    setLocalization('helpTry');
    setLocalization('helpEnjoy');
    setLocalization('helpDemoVideo');
    setLocalization('helpNotice');
    setLocalization('helpThank');
    setLocalization('helpEmail');
    setLocalization('helpDonateBitcoin');
    setLocalization('helpAttention');
}

function setLocalization(elementId) {
    if (document.getElementById(elementId)) document.getElementById(elementId).innerHTML = chrome.i18n.getMessage(elementId);
}

document.addEventListener('DOMContentLoaded', () => {
    i18n();
    document.getElementsByTagName('img')[0].outerHTML = '<img src="icons/icon128.png" height="128" width="128" alt="">';
});