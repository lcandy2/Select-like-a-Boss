import './inspect-ui.css';
import { createInspectUi } from '@/utils/inspect-ui';
import { setCoreEnabled, setInspectUiController, startInspectOnce, stopInspect } from '@/utils/core';
import { storage } from '#imports';

export default defineContentScript({
  matches: ['<all_urls>'],
  cssInjectionMode: 'ui',
  async main(ctx) {
    const inspectUi = await createInspectUi(ctx, {
      onStop: () => stopInspect('manual-stop'),
    });
    setInspectUiController(inspectUi);

    const value = await storage.getItem<boolean>('local:isActivated');
    console.log(value);
    setCoreEnabled(value === true || value === null);

    storage.watch<boolean>('local:isActivated', (nextValue) => {
      setCoreEnabled(nextValue === true || nextValue === null);
    });

    browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      if (message?.type === 'SLAB_START_INSPECT') {
        setCoreEnabled(true);
        const started = startInspectOnce();
        sendResponse({ ok: started });
        return true;
      }
      return undefined;
    });
  },
});
