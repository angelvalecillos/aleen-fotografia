/* ==============================================================
   /api/foto

   POST   (multipart: archivo, w, h)  -> sube una foto
   DELETE (?clave=xxxxxxxxxxxxxxxx.jpg) -> la borra

   Las fotos se guardan como f/<16 hex>.<ext>. La clave se valida con
   un patrón estricto: solo se puede borrar un archivo con la forma
   exacta que genera esta misma API, nunca otro del almacenamiento
   (contenido.js no cuelga de f/, así que no es alcanzable).

   El panel borra en este orden: primero guarda la lista sin la foto
   y solo después llama aquí. Si este borrado fallara, quedaría un
   archivo suelto sin efecto ninguno en la web.
   ============================================================== */

import { identidad } from '../_lib/access.js';
import { json, noAutorizado, sinAlmacen, tipoDeImagen, hex, urlDeFoto } from '../_lib/comun.js';

var MAX_BYTES = 8 * 1024 * 1024;
var CLAVE = /^[a-f0-9]{16}\.(jpg|png|webp|avif)$/;

export async function onRequestPost(context) {
  var quien = await identidad(context.request, context.env);
  if (!quien) return noAutorizado();
  if (!context.env.FOTOS) return sinAlmacen();

  var formulario;
  try {
    formulario = await context.request.formData();
  } catch (e) {
    return json({ error: 'Se esperaba un formulario con la foto' }, 400);
  }

  var archivo = formulario.get('archivo');
  if (!archivo || typeof archivo === 'string') {
    return json({ error: 'Falta la foto' }, 400);
  }
  if (archivo.size > MAX_BYTES) {
    return json({ error: 'La foto pesa más de 8 MB' }, 413);
  }

  var tipo = tipoDeImagen(archivo.type);
  if (!tipo) {
    return json({ error: 'Formato no admitido (usa JPG, PNG, WebP o AVIF)' }, 415);
  }

  var clave = hex(8) + '.' + tipo[0];
  var w = parseInt(formulario.get('w'), 10);
  var h = parseInt(formulario.get('h'), 10);

  await context.env.FOTOS.put('f/' + clave, archivo.stream(), {
    httpMetadata: {
      contentType: tipo[1],
      /* El nombre cambia en cada subida, así que el archivo nunca
         cambia: se puede cachear para siempre. */
      cacheControl: 'public, max-age=31536000, immutable'
    }
  });

  return json({
    ok: true,
    clave: clave,
    url: urlDeFoto(context.env, clave),
    w: isFinite(w) ? w : 0,
    h: isFinite(h) ? h : 0
  });
}

export async function onRequestDelete(context) {
  var quien = await identidad(context.request, context.env);
  if (!quien) return noAutorizado();
  if (!context.env.FOTOS) return sinAlmacen();

  var clave = new URL(context.request.url).searchParams.get('clave') || '';
  if (!CLAVE.test(clave)) {
    return json({ error: 'Clave no válida' }, 400);
  }

  /* Borrar algo que ya no está no es un error. */
  await context.env.FOTOS.delete('f/' + clave);
  return json({ ok: true, clave: clave });
}
