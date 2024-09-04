import {core} from "@/utils/core";
import {localExtStorage} from "@webext-core/storage";

export default defineContentScript({
  matches: ['<all_urls>'],
  async main() {
    const value = await localExtStorage.getItem('isActivated');
    console.log(value);
    if (value === true || value === null) {
      core();
    }
  },
});
