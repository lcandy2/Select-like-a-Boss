export default defineBackground(() => {
  console.log('Hello background!', { id: browser.runtime.id });
  browser.runtime.onInstalled.addListener((details) => {
    // @ts-ignore
    if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
      browser.tabs.create({ url: 'help.html' });
    }
  });
});
