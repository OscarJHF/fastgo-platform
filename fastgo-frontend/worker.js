export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Endpoint técnico de descarga directa del APK oficial de FASTGO
    if (url.pathname === '/descargar/apk') {
      const APK_ORIGIN = 'https://github.com/OscarJHF/fastgo-platform/releases/download/v2.2.2/FASTGO-Beta2-release.apk';

      if (request.method === 'HEAD') {
        const headRes = await fetch(APK_ORIGIN, {
          method: 'HEAD',
          headers: { 'User-Agent': 'FastGo-Worker' },
          redirect: 'follow'
        });
        const headers = new Headers(headRes.headers);
        headers.set('Content-Type', 'application/vnd.android.package-archive');
        headers.set('Content-Disposition', 'attachment; filename="FASTGO-Beta2-release.apk"');
        headers.set('Cache-Control', 'public, max-age=86400, s-maxage=86400');
        headers.delete('set-cookie');
        return new Response(null, { status: 200, headers });
      }

      const upstream = await fetch(APK_ORIGIN, {
        method: 'GET',
        headers: {
          'User-Agent': 'FastGo-Worker'
        },
        redirect: 'follow'
      });

      if (!upstream.ok) {
        return new Response('No se pudo obtener el instalador oficial de FASTGO.', { status: upstream.status });
      }

      const responseHeaders = new Headers(upstream.headers);
      responseHeaders.set('Content-Type', 'application/vnd.android.package-archive');
      responseHeaders.set('Content-Disposition', 'attachment; filename="FASTGO-Beta2-release.apk"');
      responseHeaders.set('Cache-Control', 'public, max-age=86400, s-maxage=86400');
      responseHeaders.delete('set-cookie');

      return new Response(upstream.body, {
        status: 200,
        headers: responseHeaders
      });
    }

    return env.ASSETS.fetch(request);
  }
};
