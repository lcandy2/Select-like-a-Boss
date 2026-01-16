import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'Select like a Boss - Select all kinds of text by dragging ↔',
    description: 'With this extension, you can easily select link text just like regular text, making it easier to copy. Just Select like a Boss! ;)',
    permissions: ['storage'],
    version_name: '2026 (11)',
    options_page: 'help.html',
    web_accessible_resources: [
      {
        resources: ['icon/icon.svg'],
        matches: ['<all_urls>'],
      },
    ],
  }
});
