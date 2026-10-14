import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const APK_PATH = 'C:\\Users\\PC\\Desktop\\FastGo_beta2\\FASTGO-release-2.2.5.apk';
const REPO_OWNER = 'OscarJHF';
const REPO_NAME = 'fastgo-platform';
const TAG = 'v2.2.5';
const RELEASE_NAME = 'FASTGO v2.2.5 — Filtro Dinámico de Categorías y Optimización de Plataforma';

async function publish() {
  console.log("=== INITIATING SECURE PUBLICATION OF FASTGO v2.2.5 ===");

  if (!fs.existsSync(APK_PATH)) {
    throw new Error(`APK file not found at: ${APK_PATH}`);
  }

  const stat = fs.statSync(APK_PATH);
  console.log(`Verified local APK: ${APK_PATH}`);
  console.log(`Size: ${stat.size} bytes`);

  // Obtain GitHub token from Git Credential Manager
  console.log("Retrieving GitHub credentials from Git Credential Manager...");
  const creds = execSync('git credential fill', { input: 'url=https://github.com\n' }).toString();
  const passMatch = creds.match(/password=(.+)/);
  if (!passMatch) {
    throw new Error("No password/token found in git credential manager");
  }
  const token = passMatch[1].trim();

  // 1. Tag in Git if not already present
  console.log(`Checking git tag ${TAG}...`);
  try {
    const existingTags = execSync('git tag -l').toString().split('\n').map(t => t.trim());
    if (!existingTags.includes(TAG)) {
      console.log(`Creating tag ${TAG}...`);
      execSync(`git tag -a ${TAG} -m "${RELEASE_NAME}"`);
      console.log(`Pushing tag ${TAG} to origin...`);
      execSync(`git push origin ${TAG}`);
    } else {
      console.log(`Tag ${TAG} already exists locally. Ensuring it is pushed to origin...`);
      try {
        execSync(`git push origin ${TAG}`);
      } catch (e) {
        console.log(`Push tag note: ${e.message}`);
      }
    }
  } catch (err) {
    console.error("Git tag error:", err.message);
  }

  // 2. Check if release already exists on GitHub
  console.log("Checking if GitHub Release exists...");
  let release = null;
  const getReleaseRes = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/releases/tags/${TAG}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'User-Agent': 'FastGo-Release-Bot',
      'Accept': 'application/vnd.github.v3+json'
    }
  });

  if (getReleaseRes.ok) {
    release = await getReleaseRes.json();
    console.log(`Release ${TAG} already exists with ID: ${release.id}`);
  } else if (getReleaseRes.status === 404) {
    console.log(`Creating new GitHub Release for tag ${TAG}...`);
    const releaseBody = `## FASTGO v2.2.5 — Release Oficial de Producción

### Novedades y Mejoras Principales
- **Filtro Desplegable de Categorías:** Se reemplazó la fila horizontal en la pantalla principal por un selector desplegable dinámico conectado en tiempo real al backend y base de datos Neon.
- **Filtrado Avanzado:** Soporte para «Todos los comercios», categorías activas registradas por ADMIN, estados vacíos amigables y reintentos ante desconexión.
- **Optimización de Despacho Asíncrono:** Tiempos de respuesta HTTP inferiores a 300ms en el backend Spring Boot para servicios transaccionales.
- **Seguridad y Paridad Total:** Certificación de paridad funcional entre la versión Web y la versión Android nativa.

### Información del Paquete Android
- **Nombre de archivo:** \`FASTGO-release-2.2.5.apk\`
- **Paquete:** \`com.fastgo.app\`
- **Versión:** \`2.2.5\`
- **versionCode:** \`12\`
- **Tamaño:** \`${stat.size.toLocaleString()} bytes\`
- **SHA-256:** \`4731139AF33CD62E24892D71088D2867B9FD92623FA560117E6685CBF996D7CF\`
- **Firma Digital:** Certificada con esquema APK Signature Scheme v2.
`;

    const createRes = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/releases`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'User-Agent': 'FastGo-Release-Bot',
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        tag_name: TAG,
        target_commitish: 'main',
        name: RELEASE_NAME,
        body: releaseBody,
        draft: false,
        prerelease: false
      })
    });

    if (!createRes.ok) {
      const errText = await createRes.text();
      throw new Error(`Failed to create GitHub release (${createRes.status}): ${errText}`);
    }

    release = await createRes.json();
    console.log(`GitHub Release created successfully with ID: ${release.id}`);
  } else {
    const errText = await getReleaseRes.text();
    throw new Error(`Error checking release: ${getReleaseRes.status} ${errText}`);
  }

  // 3. Check if asset already exists in release
  const assetName = 'FASTGO-release-2.2.5.apk';
  const existingAsset = release.assets.find(a => a.name === assetName);
  if (existingAsset) {
    console.log(`Asset ${assetName} already exists in release (ID: ${existingAsset.id}, Size: ${existingAsset.size}).`);
    if (existingAsset.size === stat.size) {
      console.log("Existing asset size matches local file! No need to re-upload.");
      return release;
    } else {
      console.log("Existing asset size differs! Deleting obsolete asset...");
      await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/releases/assets/${existingAsset.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'User-Agent': 'FastGo-Release-Bot'
        }
      });
      console.log("Deleted old asset.");
    }
  }

  // 4. Upload APK asset
  console.log(`Uploading ${assetName} (${stat.size} bytes) to GitHub Release...`);
  const uploadUrl = `https://uploads.github.com/repos/${REPO_OWNER}/${REPO_NAME}/releases/${release.id}/assets?name=${assetName}`;
  const fileStream = fs.createReadStream(APK_PATH);

  const uploadRes = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'User-Agent': 'FastGo-Release-Bot',
      'Content-Type': 'application/vnd.android.package-archive',
      'Content-Length': stat.size.toString()
    },
    body: fileStream,
    duplex: 'half'
  });

  if (!uploadRes.ok) {
    const errText = await uploadRes.text();
    throw new Error(`Asset upload failed (${uploadRes.status}): ${errText}`);
  }

  const assetData = await uploadRes.json();
  console.log(`Asset uploaded successfully!`);
  console.log(`Asset ID: ${assetData.id}`);
  console.log(`Asset Name: ${assetData.name}`);
  console.log(`Asset Size: ${assetData.size}`);
  console.log(`Download URL: ${assetData.browser_download_url}`);

  return release;
}

publish().catch(err => {
  console.error("Publication failed:", err);
  process.exit(1);
});
