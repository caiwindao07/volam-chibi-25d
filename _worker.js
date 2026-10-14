export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const backend = (env.BACKEND_URL || 'https://volam-25d.onrender.com').replace(/\/+$/, '');

    // 1. Chuyển tiếp toàn bộ API và kết nối WebSocket về máy chủ backend Node.js (Render.com + MongoDB Atlas)
    if (url.pathname.startsWith('/api/') || request.headers.get('Upgrade') === 'websocket') {
      const targetUrl = new URL(url.pathname + url.search, backend);
      const newHeaders = new Headers(request.headers);
      try {
        newHeaders.set('Host', new URL(backend).host);
      } catch (e) {}

      try {
        return await fetch(targetUrl.toString(), {
          method: request.method,
          headers: newHeaders,
          body: (request.method !== 'GET' && request.method !== 'HEAD') ? request.body : null,
          redirect: 'follow'
        });
      } catch (err) {
        return new Response(JSON.stringify({
          ok: false,
          error: `Máy chủ Backend đang khởi động (${err.message || 'Backend Offline'}). Vui lòng thử lại sau giây lát!`
        }), {
          status: 502,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }
    }

    // 2. Phục vụ toàn bộ Game Assets qua Cloudflare Edge CDN (HTML, JS, CSS, Fonts, Images)
    return env.ASSETS.fetch(request);
  }
};
