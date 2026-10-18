/* ==============================================================
   Utilidades compartidas por la API del panel.
   ============================================================== */

export function json(datos, estado) {
  return new Response(JSON.stringify(datos), {
    status: estado || 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store'
    }
  });
}

export function noAutorizado() {
  return json({ error: 'No autorizado' }, 401);
}

export function sinAlmacen() {
  return json({ error: 'Falta el almacenamiento (binding FOTOS)' }, 503);
}

/* Convierte el objeto de contenido en el archivo contenido.js que
   carga la web. El JSON es estricto y se escapa "<" para que el
   archivo no pueda cerrar una etiqueta script si algún día se sirve
   en línea. */
export function serializarContenido(datos) {
  return '/* Archivo generado por el panel de Eyelean. No editar a mano. */\n' +
         'window.CONTENIDO = ' +
         JSON.stringify(datos, null, 2).replace(/</g, '\\u003c') +
         ';\n';
}

/* Extensión y tipo a partir del MIME que manda el navegador. */
export function tipoDeImagen(mime) {
  var tabla = {
    'image/jpeg': ['jpg', 'image/jpeg'],
    'image/jpg': ['jpg', 'image/jpeg'],
    'image/png': ['png', 'image/png'],
    'image/webp': ['webp', 'image/webp'],
    'image/avif': ['avif', 'image/avif']
  };
  return tabla[mime] || null;
}

export function hex(nBytes) {
  var b = new Uint8Array(nBytes);
  crypto.getRandomValues(b);
  var s = '';
  for (var i = 0; i < b.length; i++) s += ('0' + b[i].toString(16)).slice(-2);
  return s;
}

/* Lee el contenido vigente: primero el guardado en el almacenamiento y,
   si todavía no hay ninguno, el que viene con el sitio. Devuelve el
   objeto ya convertido o null. */
export async function leerContenido(env, request) {
  var texto = null;

  if (env.FOTOS) {
    var objeto = await env.FOTOS.get('contenido.js');
    if (objeto) texto = await objeto.text();
  }

  if (texto === null && env.ASSETS) {
    var r = await env.ASSETS.fetch(new URL('/contenido.js', request.url));
    if (r.ok) texto = await r.text();
  }

  if (texto === null) return null;

  var i = texto.indexOf('window.CONTENIDO');
  if (i === -1) return null;
  var j = texto.indexOf('=', i);
  if (j === -1) return null;

  var cuerpo = texto.slice(j + 1).trim();
  if (cuerpo.slice(-1) === ';') cuerpo = cuerpo.slice(0, -1);

  try {
    return JSON.parse(cuerpo);
  } catch (e) {
    return null;
  }
}

/* Tubería de escritura segura sobre el contenido: exige que la clave
   pertenezca de verdad a una foto publicada, para que nadie pueda
   pedir el borrado de un archivo arbitrario del almacenamiento. */
export function urlDeFoto(env, clave) {
  var base = String(env.FOTOS_URL || '').replace(/\/+$/, '');
  return base + '/f/' + clave;
}
