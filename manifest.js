const fs = require('fs-extra');
const path = require('path');

// Check browser type
const isChrome = process.argv.includes('--chrome');
const isFirefox = process.argv.includes('--firefox');
const outputFolderPathBase = './build';
const outputFolderPathChrome = outputFolderPathBase + '/chrome';
const outputFolderPathFirefox = outputFolderPathBase + '/firefox';
const outputToBoth = !isChrome && !isFirefox; // Whether to output to both folders
const packageVersion = JSON.parse(fs.readFileSync('package.json')).version
const [versionYear, versionMonth] = packageVersion.split(".");
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const packageVersionName = `${versionYear} ${months[parseInt(versionMonth) - 1]}`;

const manifestJson = {
  manifest_version: 3,
  name: 'Select like a Boss',
  short_name: 'Select bossily',
  version: packageVersion,
  description:
    'With this extension, you can easily select link text just like regular text, making it easier to copy. Just Select like a Boss! ;)',
  author: 'lcandy2',
  homepage_url: 'https://github.com/lcandy2/Select-like-a-Boss',
  icons: {
    '16': 'icons/icon16.png',
    '48': 'icons/icon48.png',
    '128': 'icons/icon128.png',
  },
  options_ui: {
    page: 'help.html',
    open_in_tab: true,
  },
  content_scripts: [
    {
      matches: ['<all_urls>'],
      all_frames: true,
      match_about_blank: true,
      run_at: 'document_end',
      js: ['Select-like-a-Boss.js'],
    },
  ],
  background: {},
};

function generateManifestAndCopyFiles(outputFolderPath) {
  // Ensure output folder exists
  if (!fs.existsSync(outputFolderPath)) {
    fs.mkdirpSync(outputFolderPath, { recursive: true });
  }
  // Output file path
  const outputFilePath = path.join(outputFolderPath, 'manifest.json');
  // Convert manifestJson object to string and write fanifest.json file
  fs.writeFileSync(outputFilePath, JSON.stringify(manifestJson, null, 2));
  // Copy all files in src folder to output folder
  fs.copySync('./src', outputFolderPath);
  fs.copySync('./LICENSE', outputFolderPath + '/LICENSE');
  console.log(`Generated ${outputFilePath}`);
}

if (isFirefox || outputToBoth) {
  // Firefox configuration
  manifestJson.manifest_version = 2
  manifestJson.background = {
    scripts: ['background.js'],
  };
  generateManifestAndCopyFiles(outputFolderPathFirefox);
}

if (isChrome || outputToBoth) {
  // Chrome configuration
  manifestJson.manifest_version = 3
  manifestJson.background = {
    service_worker: 'background.js',
  };
  manifestJson.version_name = packageVersionName;
  manifestJson.offline_enabled = true;
  generateManifestAndCopyFiles(outputFolderPathChrome);
}