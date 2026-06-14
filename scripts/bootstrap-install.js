const https = require('https');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const npmVersion = '10.9.2';
const tgzUrl = `https://registry.npmjs.org/npm/-/npm-${npmVersion}.tgz`;
const tgzPath = path.join(__dirname, 'npm.tgz');
const extractDir = path.join(__dirname, '.npm-bootstrap');

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        file.close();
        fs.unlinkSync(dest);
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', reject);
  });
}

async function main() {
  console.log('Downloading npm...');
  await download(tgzUrl, tgzPath);
  console.log('Extracting...');
  fs.mkdirSync(extractDir, { recursive: true });
  execSync(`tar -xzf "${tgzPath}" -C "${extractDir}"`, { stdio: 'inherit' });
  const npmCli = path.join(extractDir, 'package', 'bin', 'npm-cli.js');
  console.log('Running npm install...');
  execSync(`node "${npmCli}" install`, { stdio: 'inherit', cwd: path.join(__dirname, '..') });
  console.log('Done!');
}

main().catch(console.error);
