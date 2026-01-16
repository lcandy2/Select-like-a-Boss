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

    browser.runtime.onMessage.addListener((message) => {
      if (message?.type === 'SLAB_START_INSPECT') {
        const started = startInspectOnce();
        return Promise.resolve({ ok: started });
      }
      return undefined;
    });
  },
});
