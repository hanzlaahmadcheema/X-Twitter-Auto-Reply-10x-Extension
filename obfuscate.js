const fs = require('fs-extra');
const path = require('path');
const JavaScriptObfuscator = require('javascript-obfuscator');

const distDir = path.join(__dirname, 'dist');
const releaseDir = path.join(__dirname, 'release');

async function buildRelease() {
  if (!fs.existsSync(distDir)) {
    console.error('dist/ does not exist. Run build first.');
    process.exit(1);
  }

  // Clean release directory
  await fs.emptyDir(releaseDir);

  // Copy dist to release
  await fs.copy(distDir, releaseDir);

  // Find all JS files in release
  const jsFiles = [];
  
  async function findJS(dir) {
    const files = await fs.readdir(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = await fs.stat(fullPath);
      if (stat.isDirectory()) {
        await findJS(fullPath);
      } else if (fullPath.endsWith('.js')) {
        // Skip third-party libraries that are already minified
        if (!fullPath.includes('html2canvas.min.js')) {
          jsFiles.push(fullPath);
        }
      }
    }
  }

  await findJS(releaseDir);

  for (const jsFile of jsFiles) {
    const content = await fs.readFile(jsFile, 'utf8');
    
    // Obfuscate with moderate settings
    const obfuscationResult = JavaScriptObfuscator.obfuscate(content, {
      compact: true,
      controlFlowFlattening: false,
      deadCodeInjection: false,
      debugProtection: false,
      debugProtectionInterval: 0,
      disableConsoleOutput: false,
      identifierNamesGenerator: 'hexadecimal',
      log: false,
      numbersToExpressions: false,
      renameGlobals: false,
      selfDefending: false,
      simplify: true,
      splitStrings: false,
      stringArray: true,
      stringArrayEncoding: [],
      stringArrayThreshold: 0.75,
      unicodeEscapeSequence: false
    });

    await fs.writeFile(jsFile, obfuscationResult.getObfuscatedCode());
    console.log(`Obfuscated: ${path.relative(releaseDir, jsFile)}`);
  }

  console.log('Release build completed successfully in release/');
}

buildRelease().catch(console.error);
