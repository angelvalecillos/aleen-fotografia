/* ==============================================================
   Private panel for Eyelean Medina.

   It edits the same content the site loads: it fetches it from
   /api/contenido, shows it in forms and sends it back to
   /api/guardar. Photos are compressed in the browser before they
   are uploaded (a 4 MB photo ends up around 250 KB), so the
   storage never fills up.

   None of this is public: the server checks the session on every
   call and turns away anyone not on the email list.
   ============================================================== */
(function () {
  'use strict';

  var C = null;             // current content
  var URL_FOTOS = '';       // public base for the uploaded photos
  var sucio = false;        // there are unsaved changes
  var TECLA_AVISO = null;   // timer for the floating notice

  var MAX_LADO = 1920;      // longest side the photo is reduced to
  var CALIDAD = 0.85;       // JPEG quality

  /* Loose texts that can be edited, with their label. */
  var CAMPOS_TEXTO = [
    { clave: 'svc.kicker', etiqueta: 'Services · small label' },
    { clave: 'svc.title', etiqueta: 'Services · heading' },
    { clave: 'svc.sub', etiqueta: 'Services · intro' },
    { clave: 'proc.kicker', etiqueta: 'How I work · small label' },
    { clave: 'proc.title', etiqueta: 'How I work · heading' },
    { clave: 'proc.sub', etiqueta: 'How I work · intro' },
    { clave: 'port.title', etiqueta: 'Portfolio · heading' },
    { clave: 'port.sub', etiqueta: 'Portfolio · intro' },
    { clave: 'who.title', etiqueta: "Who it's for · heading" },
    { clave: 'faq.kicker', etiqueta: 'Questions · small label' },
    { clave: 'faq.title', etiqueta: 'Questions · heading' },
    { clave: 'ct.title', etiqueta: 'Contact · heading' }
  ];

  var NOMBRE_IDIOMA = { es: 'Spanish', en: 'English' };

  /* ---------- Helpers ---------- */

  function $(sel) { return document.querySelector(sel); }

  function esc(v) {
    return String(v === undefined || v === null ? '' : v)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* Reads and writes inside C using paths like "fotos.0.titulo.es". */
  function leer(obj, ruta) {
    var partes = ruta.split('.');
    var o = obj;
    for (var i = 0; i < partes.length; i++) {
      if (o === undefined || o === null) return '';
      o = o[partes[i]];
    }
    return o === undefined || o === null ? '' : o;
  }

  function poner(obj, ruta, valor) {
    var partes = ruta.split('.');
    var o = obj;
    for (var i = 0; i < partes.length - 1; i++) {
      if (o[partes[i]] === undefined || o[partes[i]] === null) {
        o[partes[i]] = /^\d+$/.test(partes[i + 1]) ? [] : {};
      }
      o = o[partes[i]];
    }
    o[partes[partes.length - 1]] = valor;
  }

  function vacio(v) {
    return Array.isArray(v) ? v.length === 0 : String(v).trim() === '';
  }

  function mover(lista, desde, hasta) {
    if (hasta < 0 || hasta >= lista.length) return;
    var tmp = lista[desde];
    lista[desde] = lista[hasta];
    lista[hasta] = tmp;
  }

  /* The content keeps photos as paths relative to the site root
     ("img/…"), but the panel lives in /panel/: they have to be
     resolved against the root or the thumbnails come out broken. */
  function urlFoto(u) {
    u = String(u === undefined || u === null ? '' : u);
    if (/^https?:/i.test(u) || u.charAt(0) === '/') return u;
    return '/' + u.replace(/^\.?\//, '');
  }

  function hora() {
    return new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  }

  function aviso(texto, malo) {
    var caja = $('#aviso');
    caja.textContent = texto;
    caja.hidden = false;
    caja.className = 'aviso' + (malo ? ' malo' : '');
    clearTimeout(TECLA_AVISO);
    TECLA_AVISO = setTimeout(function () { caja.hidden = true; }, malo ? 7000 : 3500);
  }

  function estado(texto, malo) {
    var e = $('#estado');
    e.textContent = texto;
    e.className = 'estado' + (malo ? ' sucio' : '');
  }

  function marcarSucio(v) {
    sucio = v;
    var boton = $('#guardar');
    boton.disabled = !v;
    estado(v ? 'You have unsaved changes' : 'Everything saved at ' + hora());
  }

  /* ---------- Network ---------- */

  async function pedir(url, opciones) {
    var r = await fetch(url, opciones || {});
    var tipo = r.headers.get('Content-Type') || '';
    var datos = null;
    if (tipo.indexOf('application/json') === 0) {
      try { datos = await r.json(); } catch (e) { datos = null; }
    }
    if (!r.ok) {
      var error = new Error((datos && datos.error) ? datos.error : ('Error ' + r.status));
      error.estado = r.status;
      throw error;
    }
    return datos;
  }

  /* ---------- Forms ---------- */

  function campoTexto(ruta, etiqueta, idioma, marca) {
    return '<label class="campo"><span>' + esc(etiqueta) + ' <b>' + esc(idioma) + '</b></span>' +
      '<input type="text" data-ruta="' + esc(ruta) + '" value="' + esc(leer(C, ruta)) + '"' +
      (marca ? ' placeholder="' + esc(marca) + '"' : '') + '></label>';
  }

  function campoArea(ruta, etiqueta, idioma, tipo) {
    var valor = leer(C, ruta);
    if (tipo === 'lineas') valor = Array.isArray(valor) ? valor.join('\n') : '';
    return '<label class="campo"><span>' + esc(etiqueta) + ' <b>' + esc(idioma) + '</b></span>' +
      '<textarea data-ruta="' + esc(ruta) + '"' +
      (tipo ? ' data-tipo="' + esc(tipo) + '"' : '') + '>' + esc(valor) + '</textarea></label>';
  }

  function cabeceraTarjeta(titulo, accion, i) {
    return '<div class="tarjeta-cab"><strong>' + esc(titulo) + '</strong>' +
      '<button type="button" class="boton peligro" data-accion="' + accion + '" data-i="' + i + '">Remove</button></div>';
  }

  /* Translate buttons for a group of Spanish/English pairs. You write
     the text in one language, press the arrow, and the other side is
     filled in with the translation; what you wrote is left untouched.
     Nothing is published until you press Save changes. */
  function botonesIdioma(rutas) {
    return '<div class="idiomas">' +
      '<span class="idiomas-txt">Translate into the other language:</span>' +
      '<button type="button" class="boton idioma" data-accion="idioma-traducir" data-rutas="' + esc(rutas) + '" data-dir="es-en">Translate ES &#8594; EN</button>' +
      '<button type="button" class="boton idioma" data-accion="idioma-traducir" data-rutas="' + esc(rutas) + '" data-dir="en-es">Translate EN &#8594; ES</button>' +
    '</div>';
  }

  /* ---------- Rendering ---------- */

  function pintarFotos() {
    var caja = $('#listaFotos');
    if (!C.fotos.length) {
      caja.innerHTML = '<li class="ayuda">There are no photos in the portfolio yet.</li>';
      return;
    }
    var h = '';
    C.fotos.forEach(function (f, i) {
      h += '<li class="foto">' +
        '<img src="' + esc(urlFoto(f.archivo)) + '" alt="" loading="lazy" width="300" height="200">' +
        '<div class="foto-datos">' +
          '<div class="dos">' +
            campoTexto('fotos.' + i + '.titulo.es', 'Title', 'ES') +
            campoTexto('fotos.' + i + '.titulo.en', 'Title', 'EN') +
          '</div>' +
          '<div class="dos">' +
            campoArea('fotos.' + i + '.alt.es', 'Description (for people who cannot see the photo)', 'ES') +
            campoArea('fotos.' + i + '.alt.en', 'Description (for people who cannot see the photo)', 'EN') +
          '</div>' +
          botonesIdioma('fotos.' + i + '.titulo,fotos.' + i + '.alt') +
        '</div>' +
        '<div class="foto-botones">' +
          '<span class="num">Photo ' + (i + 1) + ' of ' + C.fotos.length + '</span>' +
          '<button type="button" class="boton suave" data-accion="foto-arriba" data-i="' + i + '"' +
            (i === 0 ? ' disabled' : '') + '>Move up</button>' +
          '<button type="button" class="boton suave" data-accion="foto-abajo" data-i="' + i + '"' +
            (i === C.fotos.length - 1 ? ' disabled' : '') + '>Move down</button>' +
          '<button type="button" class="boton peligro" data-accion="foto-borrar" data-i="' + i + '">Delete</button>' +
        '</div>' +
      '</li>';
    });
    caja.innerHTML = h;
  }

  function pintarServicios() {
    var h = '';
    C.servicios.forEach(function (s, i) {
      h += '<div class="tarjeta">' +
        cabeceraTarjeta('Service ' + (i + 1), 'svc-borrar', i) +
        '<div class="dos">' +
          campoTexto('servicios.' + i + '.titulo.es', 'Name', 'ES') +
          campoTexto('servicios.' + i + '.titulo.en', 'Name', 'EN') +
        '</div>' +
        '<div class="dos">' +
          campoTexto('servicios.' + i + '.precio.es', 'Price (optional)', 'ES', 'Desde 60 €') +
          campoTexto('servicios.' + i + '.precio.en', 'Price (optional)', 'EN', 'From €60') +
        '</div>' +
        '<div class="dos">' +
          campoArea('servicios.' + i + '.texto.es', 'Description', 'ES') +
          campoArea('servicios.' + i + '.texto.en', 'Description', 'EN') +
        '</div>' +
        '<div class="dos">' +
          campoArea('servicios.' + i + '.puntos.es', "What's included (one line per item)", 'ES', 'lineas') +
          campoArea('servicios.' + i + '.puntos.en', "What's included (one line per item)", 'EN', 'lineas') +
        '</div>' +
        botonesIdioma('servicios.' + i + '.titulo,servicios.' + i + '.precio,servicios.' + i + '.texto,servicios.' + i + '.puntos') +
      '</div>';
    });
    $('#listaServicios').innerHTML = h;

    var he = '';
    C.extras.forEach(function (e, i) {
      he += '<div class="tarjeta">' +
        cabeceraTarjeta('Line ' + (i + 1), 'extra-borrar', i) +
        campoArea('extras.' + i + '.es', 'Text', 'ES') +
        campoArea('extras.' + i + '.en', 'Text', 'EN') +
        botonesIdioma('extras.' + i) +
      '</div>';
    });
    $('#listaExtras').innerHTML = he;
  }

  function pintarPreguntas() {
    var h = '';
    C.faq.forEach(function (q, i) {
      h += '<div class="tarjeta">' +
        cabeceraTarjeta('Question ' + (i + 1), 'faq-borrar', i) +
        '<div class="dos">' +
          campoTexto('faq.' + i + '.p.es', 'Question', 'ES') +
          campoTexto('faq.' + i + '.p.en', 'Question', 'EN') +
        '</div>' +
        '<div class="dos">' +
          campoArea('faq.' + i + '.r.es', 'Answer', 'ES') +
          campoArea('faq.' + i + '.r.en', 'Answer', 'EN') +
        '</div>' +
        botonesIdioma('faq.' + i + '.p,faq.' + i + '.r') +
      '</div>';
    });
    $('#listaFaq').innerHTML = h;
  }

  function pintarTextos() {
    var h = '';
    CAMPOS_TEXTO.forEach(function (c) {
      h += '<div class="tarjeta">' +
        '<div class="tarjeta-cab"><strong>' + esc(c.etiqueta) + '</strong></div>' +
        '<div class="dos">' +
          campoTexto('textos.' + c.clave + '.es', 'Text', 'ES') +
          campoTexto('textos.' + c.clave + '.en', 'Text', 'EN') +
        '</div>' +
        botonesIdioma('textos.' + c.clave) +
      '</div>';
    });
    $('#listaTextos').innerHTML = h;
  }

  function pintar() {
    pintarFotos();
    pintarServicios();
    pintarPreguntas();
    pintarTextos();
  }

  /* ---------- Loading ---------- */

  function traerContenido() {
    return new Promise(function (resolver, rechazar) {
      var s = document.createElement('script');
      s.src = '/api/contenido?v=' + Date.now();
      s.onload = function () {
        var datos = window.CONTENIDO;
        if (datos && typeof datos === 'object') resolver(datos);
        else rechazar(new Error('the content is not in the expected format'));
      };
      s.onerror = function () { rechazar(new Error('no answer from the server')); };
      document.head.appendChild(s);
    });
  }

  function prepararEnMemoria() {
    C.fotos = Array.isArray(C.fotos) ? C.fotos : [];
    C.servicios = Array.isArray(C.servicios) ? C.servicios : [];
    C.extras = Array.isArray(C.extras) ? C.extras : [];
    C.faq = Array.isArray(C.faq) ? C.faq : [];
    C.textos = (C.textos && typeof C.textos === 'object') ? C.textos : {};

    CAMPOS_TEXTO.forEach(function (c) {
      if (!C.textos[c.clave]) C.textos[c.clave] = { es: '', en: '' };
    });
  }

  function fallar(mensaje, esSesion) {
    $('#cargando').hidden = true;
    var caja = $('#fallo');
    caja.hidden = false;
    caja.innerHTML = esSesion
      ? 'Your session is no longer valid. <a href="/panel/">Sign in again</a> with the code that arrives by email.'
      : esc(mensaje);
  }

  async function iniciar() {
    var sesion;
    try {
      sesion = await pedir('/api/sesion');
    } catch (e) {
      if (e.estado === 401) return fallar('', true);
      return fallar('The session could not be checked: ' + e.message);
    }

    $('#quien').textContent = sesion.email || '';
    URL_FOTOS = sesion.urlFotos || '';

    if (!sesion.almacenamiento) {
      return fallar('Storage is missing: check the project settings.');
    }

    try {
      C = await traerContenido();
    } catch (e) {
      return fallar('The content could not be loaded: ' + e.message);
    }

    prepararEnMemoria();
    pintar();

    $('#cargando').hidden = true;
    $('#principal').hidden = false;
    $('#barra').hidden = false;
    estado('Everything saved');

    if (sesion.urlFotos) return;
    aviso('Heads up: the public address for the photos is missing.', true);
  }

  /* ---------- Saving ---------- */

  async function guardar(silencioso) {
    var boton = $('#guardar');
    boton.disabled = true;
    estado('Saving…');

    try {
      await pedir('/api/guardar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contenido: C })
      });
      sucio = false;
      boton.disabled = true;
      estado('Everything saved at ' + hora());
      if (!silencioso) aviso('Changes are live on the site.');
      return true;
    } catch (e) {
      boton.disabled = false;
      estado('Could not save', true);
      aviso('Could not save: ' + e.message, true);
      return false;
    }
  }

  /* ---------- Photos ---------- */

  function comprimir(archivo, lado, calidad) {
    return new Promise(function (resolver, rechazar) {
      var img = new Image();
      var url = URL.createObjectURL(archivo);

      img.onload = function () {
        var w = img.naturalWidth;
        var h = img.naturalHeight;
        var escala = Math.min(1, lado / Math.max(w, h));
        var nw = Math.max(1, Math.round(w * escala));
        var nh = Math.max(1, Math.round(h * escala));

        var lienzo = document.createElement('canvas');
        lienzo.width = nw;
        lienzo.height = nh;
        lienzo.getContext('2d').drawImage(img, 0, 0, nw, nh);

        lienzo.toBlob(function (blob) {
          URL.revokeObjectURL(url);
          if (blob) resolver({ blob: blob, w: nw, h: nh });
          else rechazar(new Error('the image could not be processed'));
        }, 'image/jpeg', calidad);
      };

      img.onerror = function () {
        URL.revokeObjectURL(url);
        rechazar(new Error('the image could not be read'));
      };

      img.src = url;
    });
  }

  function claveDeUrl(url) {
    if (!URL_FOTOS) return null;
    var base = URL_FOTOS.replace(/\/+$/, '') + '/f/';
    if (String(url).indexOf(base) !== 0) return null;
    var clave = String(url).slice(base.length);
    return /^[a-f0-9]{16}\.(jpg|png|webp|avif)$/.test(clave) ? clave : null;
  }

  async function subirArchivos(archivos) {
    var lista = Array.prototype.slice.call(archivos || []);
    if (!lista.length) return;

    var prog = $('#progreso');
    prog.hidden = false;
    var subidas = 0;

    for (var i = 0; i < lista.length; i++) {
      var f = lista[i];
      prog.textContent = 'Preparing ' + (i + 1) + ' of ' + lista.length + ': ' + f.name;

      try {
        var img = await comprimir(f, MAX_LADO, CALIDAD);

        prog.textContent = 'Uploading ' + (i + 1) + ' of ' + lista.length + ': ' + f.name;

        var fd = new FormData();
        fd.append('archivo', img.blob, 'foto.jpg');
        fd.append('w', img.w);
        fd.append('h', img.h);

        var r = await pedir('/api/foto', { method: 'POST', body: fd });

        C.fotos.push({
          archivo: r.url,
          w: r.w || img.w,
          h: r.h || img.h,
          titulo: { es: '', en: '' },
          alt: { es: '', en: '' }
        });
        subidas++;
      } catch (e) {
        aviso('Could not upload ' + f.name + ': ' + e.message, true);
      }
    }

    prog.hidden = true;

    if (subidas) {
      pintarFotos();
      var publicado = await guardar(true);
      if (publicado) {
        aviso(subidas === 1 ? 'Photo uploaded and live.' : subidas + ' photos uploaded and live.');
      } else {
        marcarSucio(true);
        aviso('The photo is in the panel, but it could not be published.', true);
      }
    }
  }

  async function borrarFoto(i) {
    var f = C.fotos[i];
    if (!f) return;
    if (!confirm('Delete photo ' + (i + 1) + ' from the portfolio?\n\nThis cannot be undone.')) return;

    C.fotos.splice(i, 1);
    pintarFotos();

    /* The list without the photo is published first. If saving fails it
       is put back: that way the site never shows a broken image. */
    if (!await guardar(true)) {
      C.fotos.splice(i, 0, f);
      pintarFotos();
      aviso('Not deleted: the change could not be saved.', true);
      return;
    }

    /* It is off the site now, so the file can go. If this failed, all
       that would be left is a loose file, with no effect on the site. */
    var clave = claveDeUrl(f.archivo);
    if (clave) {
      try {
        await pedir('/api/foto?clave=' + encodeURIComponent(clave), { method: 'DELETE' });
      } catch (e) {
        aviso('The photo is off the site, but the file could not be deleted.', true);
        return;
      }
    }

    aviso('Photo deleted.');
  }

  /* ---------- Traducir de un idioma al otro ---------- */

  /* Prepara la lista de textos que hay que traducir. Si el campo es una
     lista (los puntos de un servicio), se traduce línea por línea para
     que no se pueda perder ni mezclar ningún punto. */
  function textosATraducir(rutas, desde) {
    var encargos = [];
    rutas.forEach(function (ruta) {
      var valor = leer(C, ruta + '.' + desde);
      if (vacio(valor)) return;
      if (Array.isArray(valor)) {
        valor.forEach(function (linea, k) {
          if (!vacio(linea)) encargos.push({ ruta: ruta, linea: k, texto: String(linea) });
        });
      } else {
        encargos.push({ ruta: ruta, linea: null, texto: String(valor) });
      }
    });
    return encargos;
  }

  /* Escribe en el campo que ya está en pantalla, sin repintar el panel
     entero: así no se pierde el sitio donde estabas. */
  function refrescarCampo(ruta) {
    var el = document.querySelector('[data-ruta="' + ruta + '"]');
    if (!el) return;
    var v = leer(C, ruta);
    el.value = Array.isArray(v) ? v.join('\n') : String(v === undefined || v === null ? '' : v);
  }

  /* Google trata un título suelto como si fuera una frase: a veces lo
     devuelve en minúscula («Beach wedding» -> «boda en la playa») y a
     veces le añade un punto final que el original no tenía. Aquí se le
     devuelve el aire del original.
     Lo mismo está en functions/api/traducir.js: si se toca uno, hay que
     tocar el otro. */
  function arreglarAire(salida, original) {
    var s = String(salida === undefined || salida === null ? '' : salida);
    if (!s) return s;

    var orig = String(original === undefined || original === null ? '' : original).trim();

    var p = orig.charAt(0);
    if (p && p === p.toUpperCase() && p !== p.toLowerCase() &&
        s.charAt(0) === s.charAt(0).toLowerCase() && s.charAt(0) !== s.charAt(0).toUpperCase()) {
      s = s.charAt(0).toUpperCase() + s.slice(1);
    }

    var teniaPunto = /[.!?…:]$/.test(orig);
    if (!teniaPunto && /[.!?]$/.test(s.trim()) && s.trim().length > 1) {
      s = s.replace(/[.!?]+$/, '');
    }

    return s.trim();
  }

  /* El traductor público de Google, sin clave ni contratar nada. Se le
     llama desde el propio navegador (el método del proyecto
     iglesia-traductor): la petición sale por la conexión de quien usa
     el panel, que es lo que Google atiende. Desde los servidores de
     Cloudflare Google la rechaza, y ese fue el fallo del primer intento.
     Google permite llamarle desde cualquier web (Access-Control-Allow-
     Origin: *), así que no hace falta nada más. */
  function traducirConGoogle(texto, desde, hasta) {
    var url = 'https://translate.googleapis.com/translate_a/single' +
      '?client=gtx&dt=t' +
      '&sl=' + encodeURIComponent(desde) +
      '&tl=' + encodeURIComponent(hasta) +
      '&q=' + encodeURIComponent(texto);

    return fetch(url)
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (datos) {
        if (!datos || !datos[0]) throw new Error('un formato que no conozco');
        return arreglarAire(datos[0].map(function (trozo) {
          return (trozo && typeof trozo[0] === 'string') ? trozo[0] : '';
        }).join(''), texto);
      });
  }

  /* Plan B: si la red de quien usa el panel no dejara hablar con Google
     (un filtro del trabajo, por ejemplo), se intenta por nuestro propio
     servidor, que hace lo mismo. */
  function traducirPorLaApi(textos, desde) {
    return fetch('/api/traducir', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ desde: desde, textos: textos })
    }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }).then(function (datos) {
      if (!datos || !Array.isArray(datos.textos) || datos.textos.length !== textos.length) {
        throw new Error('respuesta incompleta');
      }
      return datos.textos.map(function (t) {
        return String(t === undefined || t === null ? '' : t);
      });
    });
  }

  /* Traduce la lista de textos y devuelve otra lista en el mismo orden. */
  async function traducirTextos(textos, desde, hasta) {
    try {
      return await Promise.all(textos.map(function (t) {
        return t.trim() === '' ? '' : traducirConGoogle(t, desde, hasta);
      }));
    } catch (e) {
      console.warn('traducir (directo con Google):', e && e.message);
      return await traducirPorLaApi(textos, desde);
    }
  }

  async function traducirGrupo(rutas, desde, hasta, boton) {
    var encargos = textosATraducir(rutas, desde);
    if (!encargos.length) {
      aviso('Nothing to translate: the ' + NOMBRE_IDIOMA[desde] + ' side is empty.', true);
      return;
    }

    var caja = boton.closest('.idiomas');
    var botones = caja ? caja.querySelectorAll('.boton.idioma') : [boton];
    var rotulo = boton.innerHTML;
    botones.forEach(function (b) { b.disabled = true; });
    boton.innerHTML = 'Translating&#8230;';

    try {
      var dichos = await traducirTextos(encargos.map(function (e) { return e.texto; }), desde, hasta);

      var tocadas = {};
      encargos.forEach(function (e, k) {
        var dicho = String(dichos[k] === undefined || dichos[k] === null ? '' : dichos[k]).trim();
        if (dicho === '') return;

        if (e.linea === null) {
          poner(C, e.ruta + '.' + hasta, dicho);
        } else {
          var lista = leer(C, e.ruta + '.' + hasta);
          if (!Array.isArray(lista)) {
            lista = [];
            poner(C, e.ruta + '.' + hasta, lista);
          }
          lista[e.linea] = dicho;
        }
        tocadas[e.ruta] = true;
      });

      Object.keys(tocadas).forEach(function (ruta) { refrescarCampo(ruta + '.' + hasta); });
      marcarSucio(true);
      aviso('Translated from ' + NOMBRE_IDIOMA[desde] + ' into ' + NOMBRE_IDIOMA[hasta] +
            '. Check it and press Save changes.');
    } catch (e) {
      /* Si el traductor no contesta, no se toca nada y se dice claro. */
      var mio = String((e && e.message) || '');
      if (mio) console.warn('traducir:', mio);
      aviso('The translation service did not answer. Nothing has changed.' +
            (mio ? ' (' + mio + ')' : ''), true);
    } finally {
      boton.innerHTML = rotulo;
      botones.forEach(function (b) { b.disabled = false; });
    }
  }

  /* ---------- Events ---------- */

  document.addEventListener('input', function (e) {
    var el = e.target;
    if (!el || !el.dataset || !el.dataset.ruta) return;

    var valor = el.value;
    if (el.dataset.tipo === 'lineas') {
      valor = valor.split('\n')
        .map(function (s) { return s.trim(); })
        .filter(function (s) { return s !== ''; });
    }

    poner(C, el.dataset.ruta, valor);
    marcarSucio(true);
  });

  $('#tabs').addEventListener('click', function (e) {
    var boton = e.target.closest('[data-tab]');
    if (!boton) return;
    var destino = boton.dataset.tab;

    this.querySelectorAll('[data-tab]').forEach(function (b) {
      b.setAttribute('aria-selected', String(b.dataset.tab === destino));
    });
    document.querySelectorAll('[data-panel]').forEach(function (s) {
      s.hidden = s.dataset.panel !== destino;
    });
  });

  document.addEventListener('click', function (e) {
    var boton = e.target.closest('[data-accion]');
    if (!boton) return;

    var accion = boton.dataset.accion;
    var i = parseInt(boton.dataset.i, 10);

    if (accion === 'foto-arriba') { mover(C.fotos, i, i - 1); pintarFotos(); marcarSucio(true); }
    else if (accion === 'foto-abajo') { mover(C.fotos, i, i + 1); pintarFotos(); marcarSucio(true); }
    else if (accion === 'foto-borrar') { borrarFoto(i); }

    else if (accion === 'idioma-traducir') {
      var dir = boton.dataset.dir || 'es-en';
      traducirGrupo(
        (boton.dataset.rutas || '').split(',').filter(Boolean),
        dir.slice(0, 2),
        dir.slice(3, 5),
        boton
      );
    }

    else if (accion === 'svc-add') {
      C.servicios.push({ titulo: { es: '', en: '' }, precio: { es: '', en: '' }, texto: { es: '', en: '' }, puntos: { es: [], en: [] } });
      pintarServicios(); marcarSucio(true);
    } else if (accion === 'svc-borrar') {
      if (!confirm('Remove service ' + (i + 1) + '?')) return;
      C.servicios.splice(i, 1); pintarServicios(); marcarSucio(true);
    }

    else if (accion === 'extra-add') {
      C.extras.push({ es: '', en: '' });
      pintarServicios(); marcarSucio(true);
    } else if (accion === 'extra-borrar') {
      if (!confirm('Remove line ' + (i + 1) + '?')) return;
      C.extras.splice(i, 1); pintarServicios(); marcarSucio(true);
    }

    else if (accion === 'faq-add') {
      C.faq.push({ p: { es: '', en: '' }, r: { es: '', en: '' } });
      pintarPreguntas(); marcarSucio(true);
    } else if (accion === 'faq-borrar') {
      if (!confirm('Remove question ' + (i + 1) + '?')) return;
      C.faq.splice(i, 1); pintarPreguntas(); marcarSucio(true);
    }
  });

  $('#guardar').addEventListener('click', function () { guardar(false); });

  /* Uploading photos: button, file input and drag over the zone. */
  $('#elegir').addEventListener('click', function () { $('#archivos').click(); });

  $('#archivos').addEventListener('change', function (e) {
    subirArchivos(e.target.files);
    e.target.value = '';
  });

  var zona = $('#zonaSubir');
  ['dragenter', 'dragover'].forEach(function (tipo) {
    zona.addEventListener(tipo, function (e) {
      e.preventDefault();
      zona.classList.add('encima');
    });
  });
  ['dragleave', 'drop'].forEach(function (tipo) {
    zona.addEventListener(tipo, function (e) {
      e.preventDefault();
      zona.classList.remove('encima');
    });
  });
  zona.addEventListener('drop', function (e) {
    if (e.dataTransfer && e.dataTransfer.files) subirArchivos(e.dataTransfer.files);
  });

  window.addEventListener('beforeunload', function (e) {
    if (!sucio) return;
    e.preventDefault();
    e.returnValue = '';
  });

  iniciar();
})();
