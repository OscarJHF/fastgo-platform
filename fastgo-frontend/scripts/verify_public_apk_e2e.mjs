import fs from 'fs';
import path from 'path';
import { createHash } from 'crypto';
import { execSync } from 'child_process';

const TARGET_DOWNLOAD_PATH = 'C:\\Users\\PC\\Desktop\\FastGo_beta2\\FASTGO-downloaded-v2.2.5.apk';
const EXPECTED_SHA256 = '4731139AF33CD62E24892D71088D2867B9FD92623FA560117E6685CBF996D7CF';
const EXPECTED_SIZE = 69063238;
const AAPT_PATH = 'C:\\Users\\PC\\AppData\\Local\\Android\\Sdk\\build-tools\\35.0.0\\aapt.exe';
const APKSIGNER_PATH = 'C:\\Users\\PC\\AppData\\Local\\Android\\Sdk\\build-tools\\35.0.0\\apksigner.bat';

async function verifyDownload() {
  console.log("=== FULL PUBLIC DOWNLOAD VERIFICATION E2E ===");
  const dlUrl = "https://fastgo-app.fastgo-frontend.workers.dev/descargar/apk";
  console.log("Downloading from public endpoint:", dlUrl);

  const start = Date.now();
  const res = await fetch(dlUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) FastGo-E2E-Verifier'
    }
  });

  console.log(`HTTP Status: ${res.status} ${res.statusText}`);
  console.log("Headers:");
  for (const [k, v] of res.headers.entries()) {
    console.log(`  ${k}: ${v}`);
  }

  if (!res.ok) {
    throw new Error(`Public download failed with status: ${res.status}`);
  }

  const fileStream = fs.createWriteStream(TARGET_DOWNLOAD_PATH);
  const hash = createHash('sha256');
  let downloadedBytes = 0;

  for await (const chunk of res.body) {
    downloadedBytes += chunk.length;
    hash.update(chunk);
    if (!fileStream.write(chunk)) {
      await new Promise(resolve => fileStream.once('drain', resolve));
    }
  }
  await new Promise((resolve, reject) => {
    fileStream.on('finish', resolve);
    fileStream.on('error', reject);
    fileStream.end();
  });

  const finalSha256 = hash.digest('hex').toUpperCase();
  const durationSec = ((Date.now() - start) / 1000).toFixed(2);

  console.log("\n=== DOWNLOAD METRICS ===");
  console.log(`Duration: ${durationSec} s`);
  console.log(`Downloaded Bytes: ${downloadedBytes.toLocaleString()}`);
  console.log(`Expected Bytes:   ${EXPECTED_SIZE.toLocaleString()}`);
  console.log(`Calculated SHA256: ${finalSha256}`);
  console.log(`Expected SHA256:   ${EXPECTED_SHA256}`);

  const sizeMatch = downloadedBytes === EXPECTED_SIZE;
  const hashMatch = finalSha256 === EXPECTED_SHA256;

  console.log(`\nSize Match: ${sizeMatch ? 'PASS (100%)' : 'FAIL'}`);
  console.log(`Hash Match: ${hashMatch ? 'PASS (100%)' : 'FAIL'}`);

  if (!sizeMatch || !hashMatch) {
    throw new Error("Downloaded APK integrity check failed!");
  }

  // Verify APK metadata using aapt
  console.log("\n=== AUDITING DOWNLOADED APK PACKAGE ===");
  const badging = execSync(`"${AAPT_PATH}" dump badging "${TARGET_DOWNLOAD_PATH}"`).toString();
  const pkgLine = badging.split('\n').find(l => l.startsWith('package:'));
  console.log("aapt output:", pkgLine);

  if (!pkgLine.includes("name='com.fastgo.app'") || !pkgLine.includes("versionName='2.2.5'") || !pkgLine.includes("versionCode='12'")) {
    throw new Error("Downloaded APK package metadata mismatch!");
  }
  console.log("Package, Version and VersionCode: PASS (100%)");

  // Verify signature using apksigner
  console.log("\n=== AUDITING DOWNLOADED APK SIGNATURE ===");
  const signOutput = execSync(`"${APKSIGNER_PATH}" verify --verbose "${TARGET_DOWNLOAD_PATH}"`).toString();
  console.log("apksigner output:\n" + signOutput.trim());

  if (!signOutput.includes("Verified using v2 scheme (APK Signature Scheme v2): true")) {
    throw new Error("Downloaded APK signature verification failed!");
  }
  console.log("Signature Verification: PASS (100%)");

  console.log("\n>>> ALL TESTS PASSED: THE PUBLIC APK DOWNLOAD IS 100% OPERATIONAL, VALID AND CERTIFIED! <<<");
}

verifyDownload().catch(err => {
  console.error("Verification failed:", err);
  process.exit(1);
});
