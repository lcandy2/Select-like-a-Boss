const fs = require('fs');
const packageVersion = JSON.parse(fs.readFileSync('package.json')).version

const scriptContent = `// ==UserScript==
// @name         Select like a Boss
// @namespace    https://github.com/lcandy2/Select-like-a-Boss
// @version      {packageVersion}
// @license      MPL-2.0
// @description  With this extension, you can easily select link text just like regular text, making it easier to copy. Just Select like a Boss! ;)
// @author       seril🍋
// @match        *
// @run-at       document-end
// @homepageURL  https://lcandy2.github.io/Select-like-a-Boss/
// @icon         https://raw.githubusercontent.com/lcandy2/Select-like-a-Boss/main/src/icons/icon16.png
// @downloadURL  https://raw.githubusercontent.com/lcandy2/Select-like-a-Boss/main/Yet_Another_Weibo_Filter.user.js
// @supportURL   https://github.com/lcandy2/Select-like-a-Boss/issues
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
{./src/Select-like-a-Boss.js}
})();
`;

fs.readFile('./src/Select-like-a-Boss.js', 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading file: ', err);
  } else {
    const updatedScriptContent = scriptContent.replace('{./src/Select-like-a-Boss.js}', data).replace('{packageVersion}', packageVersion);
    fs.writeFile('Select-like-a-Boss.user.js', updatedScriptContent, (err) => {
      if (err) {
        console.error('Error writing file: ', err);
      } else {
        console.log('Select-like-a-Boss.user.js file has been generated.');
      }
    });
  }
});
