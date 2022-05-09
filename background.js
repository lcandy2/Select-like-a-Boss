chrome.runtime.onInstalled.addListener((reason) => {
	if (reason === chrome.runtime.OnInstalledReason.INSTALL) {
		chrome.tabs.create({ url: 'help.html' });
	}
});