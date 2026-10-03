export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Endpoint técnico de descarga directa del APK oficial de FASTGO
    if (url.pathname === '/descargar/apk') {
      const APK_V223 = 'https://github.com/OscarJHF/fastgo-platform/releases/download/v2.2.3/FASTGO-release-2.2.3.apk';
      const APK_V222 = 'https://github.com/OscarJHF/fastgo-platform/releases/download/v2.2.2/FASTGO-Beta2-release.apk';

      if (request.method === 'HEAD') {
        let headRes = await fetch(APK_V223, {
          method: 'HEAD',
          headers: { 'User-Agent': 'FastGo-Worker' },
          redirect: 'follow'
        });

        if (!headRes.ok) {
          headRes = await fetch(APK_V222, {
            method: 'HEAD',
            headers: { 'User-Agent': 'FastGo-Worker' },
            redirect: 'follow'
          });
        }

        const headers = new Headers(headRes.headers);
        headers.set('Content-Type', 'application/vnd.android.package-archive');
        headers.set('Content-Disposition', 'attachment; filename="FASTGO-release-2.2.3.apk"');
        headers.set('Cache-Control', 'public, max-age=86400, s-maxage=86400');
        headers.delete('set-cookie');
        return new Response(null, { status: 200, headers });
      }

      let upstream = await fetch(APK_V223, {
        method: 'GET',
        headers: {
          'User-Agent': 'FastGo-Worker'
        },
        redirect: 'follow'
      });

      if (!upstream.ok && upstream.status === 404) {
        // Fallback temporal si v2.2.3 aún está sincronizándose
        upstream = await fetch(APK_V222, {
          method: 'GET',
          headers: {
            'User-Agent': 'FastGo-Worker'
          },
          redirect: 'follow'
        });
      }

      if (!upstream.ok) {
        return new Response('No se pudo obtener el instalador oficial de FASTGO.', { status: upstream.status });
      }

      // Registro analítico asíncrono no bloqueante
      if (ctx && typeof ctx.waitUntil === 'function') {
        ctx.waitUntil(
          fetch('https://fastgo-backend-lp2j.onrender.com/api/analytics/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              eventType: 'APK_DOWNLOAD',
              platform: 'WEB',
              appVersion: '2.2.3',
              pathOrScreen: '/descargar/apk',
              referrer: request.headers.get('referer') || '',
              utmSource: url.searchParams.get('utm_source') || '',
              utmMedium: url.searchParams.get('utm_medium') || '',
              utmCampaign: url.searchParams.get('utm_campaign') || '',
              metadata: JSON.stringify({
                version: '2.2.3',
                userAgent: request.headers.get('user-agent') || '',
                ip: request.headers.get('cf-connecting-ip') || ''
              })
            })
          }).catch(err => console.error('Analytics track error:', err))
        );
      }

      const responseHeaders = new Headers(upstream.headers);
      responseHeaders.set('Content-Type', 'application/vnd.android.package-archive');
      responseHeaders.set('Content-Disposition', 'attachment; filename="FASTGO-release-2.2.3.apk"');
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

