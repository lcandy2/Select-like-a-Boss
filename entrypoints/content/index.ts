import { core } from '@/utils/core';
import { storage } from '#imports';

export default defineContentScript({
  matches: ['<all_urls>'],
  async main() {
    const value = await storage.getItem<boolean>('local:isActivated');
    console.log(value);
    if (value === true || value === null) {
      core();
    }
  },
});
