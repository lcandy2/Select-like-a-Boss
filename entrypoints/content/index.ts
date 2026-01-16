import { core, startInspectOnce } from '@/utils/core';
import { storage } from '#imports';

export default defineContentScript({
  matches: ['<all_urls>'],
  async main() {
    const value = await storage.getItem<boolean>('local:isActivated');
    console.log(value);
    if (value === true || value === null) {
      core();
    }

    browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      if (message?.type === 'SLAB_START_INSPECT') {
        core();
        const started = startInspectOnce();
        sendResponse({ ok: started });
        return true;
      }
      return undefined;
    });
  },
});
