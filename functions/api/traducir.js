/* POST /api/traducir — traduce los textos del panel de un idioma al otro.
   ==============================================================
   Recibe { textos: ["...", "..."], desde: "es" | "en" } y devuelve
   { textos: ["...", "..."] } en el otro idioma, en el mismo orden.

   Usa el traductor público de Google, sin clave y sin contratar nada:
   el mismo método que el proyecto iglesia-traductor, que ya funciona
   en producción. Aquí solo se traducen las frases del panel (títulos,
   descripciones, puntos de un servicio), así que el uso es mínimo.

   Los textos se traducen por separado (una petición por texto) y no en
   un bloque: así una línea de una lista no se puede mezclar con otra.
   ============================================================== */

import { identidad } from '../_lib/access.js';
import { json, noAutorizado } from '../_lib/comun.js';

/* Límites de cordura: el panel nunca manda más que esto. */
var MAX_TEXTOS = 12;
var MAX_LARGO = 2000;

/* Google trata un título suelto como si fuera una frase: a veces lo
   devuelve en minúscula y a veces le añade un punto final. Aquí se le
   devuelve el aire del original, que es lo que espera quien escribe un
   título o el punto de una lista. */
function arreglarAire(salida, original) {
  var s = String(salida || '');
  if (!s) return s;

  var orig = String(original || '').trim();

  /* Mayúscula inicial si el original la llevaba. */
  var p = orig.charAt(0);
  if (p && p === p.toUpperCase() && p !== p.toLowerCase() &&
      s.charAt(0) === s.charAt(0).toLowerCase() && s.charAt(0) !== s.charAt(0).toUpperCase()) {
    s = s.charAt(0).toUpperCase() + s.slice(1);
  }

  /* Sin punto final si el original no lo tenía. */
  var teniaPunto = /[.!?…:]$/.test(orig);
  var sobraPunto = /[.!?]$/.test(s.trim());
  if (!teniaPunto && sobraPunto && s.trim().length > 1) {
    s = s.replace(/[.!?]+$/, '');
  }

  return s.trim();
}

async function traducirUno(texto, desde, hasta) {
  var url = 'https://translate.googleapis.com/translate_a/single' +
    '?client=gtx&dt=t' +
    '&sl=' + encodeURIComponent(desde) +
    '&tl=' + encodeURIComponent(hasta) +
    '&q=' + encodeURIComponent(texto);

  /* Cabeceras de navegador: sin ellas Google es más propenso a
     despachar mal una petición que llega desde un servidor. */
  var res = await fetch(url, {
    headers: {
      'Accept': 'application/json,text/plain,*/*',
      'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
      'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'
    }
  });
  if (!res.ok) throw new Error('el traductor contestó ' + res.status);

  var datos = await res.json();

  /* La respuesta viene troceada: [[[traducido, original, ...], ...], ...] */
  if (!Array.isArray(datos) || !Array.isArray(datos[0])) {
    throw new Error('respuesta con un formato que no conozco');
  }

  return arreglarAire(datos[0].map(function (trozo) {
    return (Array.isArray(trozo) && typeof trozo[0] === 'string') ? trozo[0] : '';
  }).join(''), texto);
}

export async function onRequestPost(context) {
  var quien = await identidad(context.request, context.env);
  if (!quien) return noAutorizado();

  var cuerpo;
  try {
    cuerpo = await context.request.json();
  } catch (e) {
    return json({ error: 'Petición no válida' }, 400);
  }

  var textos = cuerpo && cuerpo.textos;
  if (!Array.isArray(textos) || textos.length === 0) {
    return json({ error: 'No hay textos que traducir' }, 400);
  }
  if (textos.length > MAX_TEXTOS) {
    return json({ error: 'Demasiados textos de una vez' }, 400);
  }

  var desde = cuerpo.desde === 'en' ? 'en' : 'es';
  var hasta = desde === 'es' ? 'en' : 'es';

  for (var i = 0; i < textos.length; i++) {
    if (String(textos[i] === undefined || textos[i] === null ? '' : textos[i]).length > MAX_LARGO) {
      return json({ error: 'Un texto es demasiado largo' }, 400);
    }
  }

  try {
    var salidas = await Promise.all(textos.map(function (t) {
      var limpio = String(t === undefined || t === null ? '' : t);
      /* Un hueco vacío se queda vacío, sin gastar una petición. */
      if (limpio.trim() === '') return Promise.resolve('');
      return traducirUno(limpio, desde, hasta);
    }));
    return json({ textos: salidas });
  } catch (e) {
    return json({
      error: 'El traductor no respondió' +
        (e && e.message ? ' (' + e.message + ')' : '')
    }, 502);
  }
}
