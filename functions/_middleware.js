/* ==============================================================
   Middleware de todas las peticiones del sitio.

   1. Redirige www -> dominio pelado con un 301, para que no existan
      dos direcciones de la misma web (lo que perjudica al buscador).
   2. Añade un par de cabeceras de seguridad y marca el panel como
      no indexable.
   3. Sirve con un 200 el archivo de verificación de Google, porque
      Pages redirige las direcciones .html y el buscador no lo acepta.

   Se resuelve aquí y no con una regla de redirección de Cloudflare
   para no tener que pedir permisos extra sobre la zona.
   ============================================================== */

export async function onRequest(context) {
  var request = context.request;
  var env = context.env;
  var url = new URL(request.url);

  var dominio = env.DOMINIO || 'eyeleanphotography.com';
  if (url.hostname === 'www.' + dominio) {
    var destino = new URL(request.url);
    destino.hostname = dominio;
    return Response.redirect(destino.toString(), 301);
  }

  /* Archivo de verificación de Google (Search Console). Pages redirige
     las direcciones con .html a su versión sin extensión con un 308, y
     eso no se puede desactivar; Google lo pide con .html y esperando un
     200, así que se sirve aquí, leyendo el archivo que hay en la raíz.
     Vale para cualquier nombre google<algo>.html que ponga el buscador. */
  if (/^\/google[a-f0-9]+\.html$/.test(url.pathname)) {
    var pedido = await env.ASSETS.fetch(
      new URL(url.pathname.replace(/\.html$/, ''), url.origin)
    );
    if (pedido.ok) {
      return new Response(pedido.body, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'public, max-age=3600',
          'X-Content-Type-Options': 'nosniff'
        }
      });
    }
  }

  var respuesta = await context.next();
  var cabeceras = new Headers(respuesta.headers);

  cabeceras.set('X-Content-Type-Options', 'nosniff');
  cabeceras.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  if (url.pathname === '/panel' || url.pathname.indexOf('/panel/') === 0) {
    cabeceras.set('X-Robots-Tag', 'noindex, nofollow');
  }

  return new Response(respuesta.body, {
    status: respuesta.status,
    statusText: respuesta.statusText,
    headers: cabeceras
  });
}
