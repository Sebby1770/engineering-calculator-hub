/**
 * Static export for GitHub Pages.
 * Route handlers under src/app/api cannot be exported; park them for the build.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const apiDir = path.join(root, 'src', 'app', 'api');
const parkDir = path.join(root, '.pages-api-park');
const outDir = path.join(root, 'out');
const successPage = path.join(root, 'src', 'app', 'checkout', 'success', 'page.tsx');
const successBackup = `${successPage}.pages-bak`;
const successStub = path.join(root, 'scripts', 'pages-stubs', 'checkout-success.tsx');

const env = {
  ...process.env,
  GITHUB_PAGES: 'true',
  NEXT_PUBLIC_SITE_URL: 'https://sebby1770.github.io/engineering-calculator-hub',
  NEXT_PUBLIC_AD_ENABLED: 'false',
};

function restoreApi() {
  if (fs.existsSync(parkDir) && !fs.existsSync(apiDir)) {
    fs.renameSync(parkDir, apiDir);
  }
}

function restoreCheckoutSuccess() {
  if (fs.existsSync(successBackup)) {
    fs.renameSync(successBackup, successPage);
  }
}

try {
  if (fs.existsSync(parkDir) && fs.existsSync(apiDir)) {
    fs.rmSync(parkDir, { recursive: true, force: true });
  }
  if (fs.existsSync(apiDir)) {
    fs.renameSync(apiDir, parkDir);
  }
  if (fs.existsSync(successPage)) {
    fs.renameSync(successPage, successBackup);
    fs.copyFileSync(successStub, successPage);
  }

  const result = spawnSync('npx', ['next', 'build'], {
    cwd: root,
    env,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }

  fs.writeFileSync(path.join(outDir, '.nojekyll'), '');
  console.log('GitHub Pages export written to out/');
} finally {
  restoreCheckoutSuccess();
  restoreApi();
}
