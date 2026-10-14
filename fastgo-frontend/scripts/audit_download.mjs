import fs from 'fs';

async function test() {
  const urls = [
    "https://fastgo-app.fastgo-frontend.workers.dev/descargar",
    "https://fastgo-frontend.onrender.com/descargar",
    "https://fastgo-app.fastgo-frontend.workers.dev/descargar/apk",
    "https://fastgo-frontend.onrender.com/descargar/apk",
    "https://fastgo-app.fastgo-frontend.workers.dev/fastgo-qr-descargar.svg",
    "https://fastgo-frontend.onrender.com/fastgo-qr-descargar.svg",
    "https://api.github.com/repos/OscarJHF/fastgo-platform/releases"
  ];
  for (const url of urls) {
    try {
      const res = await fetch(url, { method: "HEAD", redirect: "manual", headers: { "User-Agent": "FastGo-Audit" } });
      console.log(`URL: ${url}`);
      console.log(`Status: ${res.status} ${res.statusText}`);
      console.log(`Location: ${res.headers.get("location")}`);
      console.log(`Content-Type: ${res.headers.get("content-type")}`);
      console.log(`Content-Disposition: ${res.headers.get("content-disposition")}`);
      console.log(`Content-Length: ${res.headers.get("content-length")}`);
      console.log("-----------------------------------------");
    } catch (e) {
      console.log(`Error fetching ${url}: ${e.message}`);
    }
  }

  // Also query GitHub releases list in full
  try {
    const ghRes = await fetch("https://api.github.com/repos/OscarJHF/fastgo-platform/releases", {
      headers: { "User-Agent": "FastGo-Audit" }
    });
    if (ghRes.ok) {
      const data = await ghRes.json();
      console.log("=== GITHUB RELEASES ===");
      data.forEach(r => {
        console.log(`Tag: ${r.tag_name}, Name: ${r.name}, Draft: ${r.draft}, Prerelease: ${r.prerelease}`);
        r.assets.forEach(a => {
          console.log(`  - Asset: ${a.name}, Size: ${a.size}, DownloadURL: ${a.browser_download_url}`);
        });
      });
    } else {
      console.log(`GitHub API error: ${ghRes.status} ${ghRes.statusText}`);
      const txt = await ghRes.text();
      console.log(txt);
    }
  } catch (e) {
    console.log(`GitHub fetch error: ${e.message}`);
  }

  // Test full GET download from Cloudflare
  console.log("\n=== TESTING FULL GET DOWNLOAD FROM CLOUDFLARE ===");
  try {
    const { createHash } = await import('crypto');
    const dlUrl = "https://fastgo-app.fastgo-frontend.workers.dev/descargar/apk";
    console.log("Fetching GET from:", dlUrl);
    const start = Date.now();
    const res = await fetch(dlUrl, { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" } });
    console.log("Status:", res.status, res.statusText);
    for (const [k, v] of res.headers.entries()) {
      console.log(`  ${k}: ${v}`);
    }
    const hash = createHash("sha256");
    let totalBytes = 0;
    for await (const chunk of res.body) {
      totalBytes += chunk.length;
      hash.update(chunk);
    }
    console.log("Total bytes downloaded:", totalBytes);
    console.log("SHA256:", hash.digest("hex").toUpperCase());
    console.log("Duration:", (Date.now() - start) / 1000, "s");
  } catch (err) {
    console.error("GET download failed:", err);
  }

  // Decode QR
  console.log("\n=== DECODING QR CODE ===");
  try {
    const qrRes = await fetch("https://api.qrserver.com/v1/read-qr-code/?fileurl=https://fastgo-app.fastgo-frontend.workers.dev/fastgo-qr-descargar.png");
    const qrData = await qrRes.json();
    console.log("QR decoded data:", JSON.stringify(qrData, null, 2));
  } catch (e) {
    console.log("QR decode failed:", e);
  }
}
test();
