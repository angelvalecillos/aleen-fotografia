/* GET /api/contenido  — devuelve el contenido vigente tal cual, en el
   mismo formato que carga la web (window.CONTENIDO = {...};).

   El panel lo inyecta como script y lee window.CONTENIDO: así edita
   exactamente lo que hay publicado, sin formatos intermedios.
   Se sirve sin caché para que nunca edite una versión vieja. */

import { identidad } from '../_lib/access.js';
import { noAutorizado } from '../_lib/comun.js';

export async function onRequestGet(context) {
  var quien = await identidad(context.request, context.env);
  if (!quien) return noAutorizado();

  var texto = null;

  if (context.env.FOTOS) {
    var objeto = await context.env.FOTOS.get('contenido.js');
    if (objeto) texto = await objeto.text();
  }

  /* Todavía sin nada guardado: se devuelve el contenido con el que
     viene el sitio, para que el panel arranque con datos reales. */
  if (texto === null) {
    var r = await context.env.ASSETS.fetch(new URL('/contenido.js', context.request.url));
    if (r.ok) texto = await r.text();
  }

  if (texto === null) {
    return new Response('window.CONTENIDO = { "fotos": [], "servicios": [], "extras": [], "faq": [], "textos": {} };\n', {
      status: 200,
      headers: {
        'Content-Type': 'application/javascript; charset=utf-8',
        'Cache-Control': 'no-store'
      }
    });
  }

  return new Response(texto, {
    status: 200,
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'no-store'
    }
  });
}
