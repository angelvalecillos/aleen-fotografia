/* POST /api/guardar  — guarda el contenido editado en el panel.

   Recibe { contenido: {...} }, lo limpia (solo se admiten los campos
   que la web sabe pintar) y lo escribe en el almacenamiento como
   contenido.js, que es justo lo que carga la web. Antes de sobrescribir
   guarda una copia de la versión anterior en copias/antes.js. */

import { identidad } from '../_lib/access.js';
import { json, noAutorizado, sinAlmacen, serializarContenido } from '../_lib/comun.js';

var MAX = { fotos: 60, servicios: 12, extras: 8, faq: 30 };
var MAX_TEXTO = 4000;

function texto(v) {
  if (typeof v !== 'string') return '';
  return v.length > MAX_TEXTO ? v.slice(0, MAX_TEXTO) : v;
}

/* Objeto bilingüe: { es, en } */
function idiomas(v) {
  v = v && typeof v === 'object' ? v : {};
  return { es: texto(v.es), en: texto(v.en) };
}

/* Lista bilingüe de cadenas: { es: [...], en: [...] } */
function idiomasLista(v) {
  v = v && typeof v === 'object' ? v : {};
  var limpia = function (l) {
    if (!Array.isArray(l)) return [];
    return l.slice(0, 20).map(texto).filter(function (s) { return s !== ''; });
  };
  return { es: limpia(v.es), en: limpia(v.en) };
}

function lista(v, tope) {
  return Array.isArray(v) ? v.slice(0, tope) : [];
}

function numero(v, alt) {
  var n = parseInt(v, 10);
  return (isFinite(n) && n > 0 && n < 20000) ? n : alt;
}

/* Reconstruye el contenido admitiendo solo lo previsto. */
function normalizar(datos) {
  datos = datos && typeof datos === 'object' ? datos : {};

  var fotos = lista(datos.fotos, MAX.fotos).map(function (f) {
    f = f && typeof f === 'object' ? f : {};
    var foto = {
      archivo: texto(f.archivo),
      titulo: idiomas(f.titulo),
      alt: idiomas(f.alt)
    };
    var w = numero(f.w, 0), h = numero(f.h, 0);
    if (w) foto.w = w;
    if (h) foto.h = h;
    return foto;
  }).filter(function (f) { return f.archivo !== ''; });

  var servicios = lista(datos.servicios, MAX.servicios).map(function (s) {
    s = s && typeof s === 'object' ? s : {};
    return {
      titulo: idiomas(s.titulo),
      precio: idiomas(s.precio),
      texto: idiomas(s.texto),
      puntos: idiomasLista(s.puntos)
    };
  });

  var extras = lista(datos.extras, MAX.extras).map(function (e) {
    return idiomas(e);
  });

  var faq = lista(datos.faq, MAX.faq).map(function (q) {
    q = q && typeof q === 'object' ? q : {};
    return { p: idiomas(q.p), r: idiomas(q.r) };
  });

  var textos = {};
  var origen = (datos.textos && typeof datos.textos === 'object') ? datos.textos : {};
  Object.keys(origen).forEach(function (k) {
    if (k.length > 60) return;
    textos[k] = idiomas(origen[k]);
  });

  return {
    actualizado: new Date().toISOString().slice(0, 10),
    fotos: fotos,
    servicios: servicios,
    extras: extras,
    faq: faq,
    textos: textos
  };
}

export async function onRequestPost(context) {
  var quien = await identidad(context.request, context.env);
  if (!quien) return noAutorizado();
  if (!context.env.FOTOS) return sinAlmacen();

  var cuerpo;
  try {
    cuerpo = await context.request.json();
  } catch (e) {
    return json({ error: 'El cuerpo no es JSON válido' }, 400);
  }

  var datos = cuerpo && cuerpo.contenido;
  if (!datos || typeof datos !== 'object') {
    return json({ error: 'Falta el contenido' }, 400);
  }

  var limpio = normalizar(datos);
  var archivo = serializarContenido(limpio);

  if (archivo.length > 512 * 1024) {
    return json({ error: 'El contenido es demasiado grande' }, 413);
  }

  /* Copia de seguridad de lo que había, por si hay que volver atrás. */
  var anterior = await context.env.FOTOS.get('contenido.js');
  if (anterior) {
    var textoAnterior = await anterior.text();
    await context.env.FOTOS.put('copias/antes.js', textoAnterior, {
      httpMetadata: { contentType: 'application/javascript; charset=utf-8', cacheControl: 'no-store' }
    });
  }

  await context.env.FOTOS.put('contenido.js', archivo, {
    httpMetadata: {
      contentType: 'application/javascript; charset=utf-8',
      cacheControl: 'public, max-age=30'
    }
  });

  return json({ ok: true, guardado: limpio.actualizado, correo: quien.email });
}
