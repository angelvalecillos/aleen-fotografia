// Sin dependencias. Menú móvil + formulario + conmutador de idioma ES/EN.
(function(){
  /* Dirección pública del almacenamiento (fotos y contenido vivo).
     Se rellena al publicar. Si se deja vacía, la web tira solo de la
     copia local de contenido.js y sigue funcionando desde el disco. */
  var FOTOS_URL = 'https://fotos.eyeleanphotography.com/';

  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');
  if(burger && nav){
    burger.addEventListener('click', function(){
      var open = nav.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.addEventListener('click', function(e){
      if(e.target.tagName === 'A'){ nav.classList.remove('open'); burger.setAttribute('aria-expanded','false'); }
    });
  }

  // Diccionario ES/EN. Las claves coinciden con data-i18n del HTML.
  // data-i18n: texto · data-i18n-html: con marcas · -ph: placeholder · -alt: alt · -aria: aria-label
  var T = {
    es: {
      _title: 'Eyelean Medina — Retrato Auténtico en 35 mm',
      _meta: 'Eyelean Medina — retrato editorial, moda, producto y contenido para redes. Estética de película, entrega rápida y trato directo. Reserva tu sesión.',
      _langBtn: 'EN', _langLabel: 'Cambiar a inglés',
      _formDone: 'Copia y envíame esto por Instagram @oye.pendejo: ',
      _formLead: 'Hola Eyelean, soy ',
      _formType: 'Tipo: ', _formIdea: '. Idea: ',
      skip: 'Saltar al contenido', nav: 'Navegación principal', burger: 'Abrir menú',
      'nav.home': 'Inicio', 'nav.services': 'Servicios', 'nav.portfolio': 'Portfolio',
      'nav.process': 'Proceso', 'nav.faq': 'Preguntas', 'nav.book': 'Reservar sesión',
      'hero.kicker': 'Fotógrafa freelance de retrato, producto y social',
      'ban.title': 'Trabaja conmigo', 'ban.label': 'Correo',
      'ban.alt': 'Eyelean Medina frente a una cortina roja, con blusa blanca de encaje',
      'hero.title': 'Retrato que parece de película, gente que se reconoce.',
      'hero.lead': 'Soy <strong>Eyelean Medina</strong> <span translate="no">(@oye.pendejo)</span> — retrato editorial, moda, producto y vídeo vertical para personas y marcas pequeñas. Luz natural, dirección tranquila y edición con grano, no plástico.',
      'hero.cta1': 'Reservar sesión', 'hero.cta2': 'Ver servicios',
      'hero.m1': 'Respuesta en 24 h', 'hero.m2': 'Exterior, estudio o a domicilio',
      'hero.m3': 'Entrega lista para Instagram y TikTok',
      'hero.alt': 'Eyelean Medina, autorretrato en blanco y negro con grano de película',
      'hero.figures': '<strong>126</strong> publicaciones y <strong>633</strong> seguidores en Instagram',
      stats: 'Sellos de la casa',
      'stats.1t': 'Auténtico', 'stats.1s': 'retrato real, sin poses falsas',
      'stats.2t': 'Artístico', 'stats.2s': 'dirección de arte y color',
      'stats.3s': 'exterior, viaje y lifestyle', 'stats.4s': 'respuesta y presupuesto',
      'svc.kicker': 'Servicios', 'svc.title': 'Tres formas de trabajar conmigo',
      'svc.sub': 'Del retrato al producto: tú traes la idea, yo pongo luz, dirección y edición.',
      'proc.kicker': 'Cómo trabajo', 'proc.title': 'Reserva simple, entrega rápida, sin vueltas.',
      'proc.sub': 'Sesión de 1 a 3 h con presupuesto claro y entrega digital. Recojo tu idea, fotografiamos, edito y te entrego listo para publicar.',
      'proc.s1': '<strong>Reserva.</strong> Escríbeme por Instagram o el formulario. Respondo en 24 h.',
      'proc.s2': '<strong>Preproducción.</strong> Moodboard, locación, vestuario y fecha.',
      'proc.s3': '<strong>Sesión.</strong> De 1 a 3 horas, ambiente relajado y dirigido.',
      'proc.s4': '<strong>Entrega.</strong> Galería en línea, en alta y para redes.',
      'proc.btn': 'Pedir fecha en 24 h',
      'proc.f1t': 'Para tiendas', 'proc.f1p': 'Fondo blanco y guías tipo Amazon o Shopify.',
      'proc.f2t': 'Identidad visual', 'proc.f2p': 'Cuido tu estética en cada foto, nada genérico.',
      'proc.f3t': 'Rápida', 'proc.f3p': 'Adelanto en 48 h, galería completa en unos 7 días.',
      'proc.f4t': 'Cercana', 'proc.f4p': 'Trato directo conmigo, sin intermediarios.',
      'port.title': 'Trabajo reciente',
      'port.sub': 'Sesiones de Eyelean tomadas de su sitio Canva y Linktree.',
      'port.empty': 'Tu sesión aquí', 'port.emptysub': 'Reserva tu fecha',
      'port.b1': 'Ver más en Instagram', 'port.b2': 'Ver sitio Canva',
      'who.title': 'Para quién es (y para quién no)',
      'who.p1': '<strong>Trabajo con</strong> personas (retrato, book, maternidad, graduación, pareja), marcas pequeñas, tiendas, restaurantes, maquillistas, músicos y creadores que necesitan imagen constante.',
      'who.p2': '<strong>No hago</strong> bodas completas de 10 h ni eventos masivos. Mi formato es la sesión íntima y el producto a pequeña escala.',
      'who.q1': '“Necesitaba fotos que no parecieran posadas. Eyelean dirigió todo y salieron naturales.”<cite> — Clienta de retrato</cite>',
      'who.q2': '“Las fotos subieron el nivel de mi tienda. Limpias y con estilo.”<cite> — Tienda en línea</cite>',
      'faq.kicker': 'Preguntas frecuentes', 'faq.title': 'Antes de reservar',
      'ct.kicker': 'Contacto', 'ct.title': 'Cuéntame tu idea y te respondo en 24 h.',
      'ct.canva': 'Sitio Canva', 'ct.all': 'Todos los enlaces',
      'ct.name': 'Nombre*', 'ct.namePh': 'Tu nombre…',
      'ct.contact': 'Instagram o correo*', 'ct.contactPh': '@usuaria o correo…',
      'ct.type': 'Tipo de sesión*',
      'ct.o1': 'Retrato / book', 'ct.o2': 'Moda / editorial', 'ct.o3': 'Producto para tienda',
      'ct.o4': 'Contenido para redes (mensual)', 'ct.o5': 'Wanderer / exterior',
      'ct.idea': 'Cuéntame tu idea*', 'ct.ideaPh': 'Fecha tentativa, ciudad, fotos que necesitas…',
      'ct.submit': 'Reservar sesión',
      'ct.hint': 'Al enviar se abre Instagram con tu mensaje listo. Página estática, sin servidor.',
      'foot.line': '© 2026 Eyelean Medina — auténtico, artístico, wanderer',
      'foot.home': 'Inicio'
    },
    en: {
      _title: 'Eyelean Medina — Authentic 35 mm Portraits',
      _meta: 'Eyelean Medina — editorial portrait, fashion, product & social content. Film aesthetic, fast delivery, direct contact. Book your shoot.',
      _langBtn: 'ES', _langLabel: 'Switch to Spanish',
      _formDone: 'Copy this and send it to me on Instagram @oye.pendejo: ',
      _formLead: 'Hi Eyelean, I’m ',
      _formType: 'Type: ', _formIdea: '. Idea: ',
      skip: 'Skip to content', nav: 'Main navigation', burger: 'Open menu',
      'nav.home': 'Home', 'nav.services': 'Services', 'nav.portfolio': 'Portfolio',
      'nav.process': 'Process', 'nav.faq': 'FAQ', 'nav.book': 'Book a session',
      'hero.kicker': 'Freelance photographer: portrait, product & social',
      'ban.title': 'Work with me', 'ban.label': 'Email',
      'ban.alt': 'Eyelean Medina in front of a red curtain, wearing a white lace top',
      'hero.title': 'Portraits that look like film, people who recognize themselves.',
      'hero.lead': 'I’m <strong>Eyelean Medina</strong> <span translate="no">(@oye.pendejo)</span> — editorial portrait, fashion, product & vertical video for people and small brands. Natural light, calm direction, grainy edits, never plastic.',
      'hero.cta1': 'Book a session', 'hero.cta2': 'See services',
      'hero.m1': 'Replies within 24 h', 'hero.m2': 'Outdoors, studio or at home',
      'hero.m3': 'Delivered ready for Instagram & TikTok',
      'hero.alt': 'Eyelean Medina, black-and-white self-portrait with film grain',
      'hero.figures': '<strong>126</strong> posts and <strong>633</strong> followers on Instagram',
      stats: 'House hallmarks',
      'stats.1t': 'Authentic', 'stats.1s': 'real portraits, no fake poses',
      'stats.2t': 'Artistic', 'stats.2s': 'art direction & color',
      'stats.3s': 'outdoors, travel & lifestyle', 'stats.4s': 'quote within 24 h',
      'svc.kicker': 'Services', 'svc.title': 'Three ways to work with me',
      'svc.sub': 'From portrait to product: you bring the idea, I bring light, direction and editing.',
      'proc.kicker': 'How I work', 'proc.title': 'Simple booking, fast delivery, no fuss.',
      'proc.sub': '1–3 h shoots with clear pricing and digital delivery. I take your idea, we shoot, I edit and deliver ready to post.',
      'proc.s1': '<strong>Booking.</strong> Message me on Instagram or via the form. I reply within 24 h.',
      'proc.s2': '<strong>Pre-production.</strong> Moodboard, location, styling & date.',
      'proc.s3': '<strong>Shoot.</strong> 1–3 relaxed, directed hours.',
      'proc.s4': '<strong>Delivery.</strong> Online gallery, full-res & social sizes.',
      'proc.btn': 'Get a date within 24 h',
      'proc.f1t': 'For shops', 'proc.f1p': 'White backgrounds & Amazon/Shopify-style guides.',
      'proc.f2t': 'Visual identity', 'proc.f2p': 'I protect your aesthetic in every photo — nothing generic.',
      'proc.f3t': 'Fast', 'proc.f3p': 'Preview in 48 h, full gallery in about 7 days.',
      'proc.f4t': 'Personal', 'proc.f4p': 'You deal with me directly, no middlemen.',
      'port.title': 'Recent work',
      'port.sub': 'Eyelean’s sessions, from her Canva site & Linktree.',
      'port.empty': 'Your session here', 'port.emptysub': 'Book your date',
      'port.b1': 'See more on Instagram', 'port.b2': 'See Canva site',
      'who.title': 'Who it’s for (and who it isn’t)',
      'who.p1': '<strong>I work with</strong> people (portraits, books, maternity, graduation, couples), small brands, shops, restaurants, makeup artists, musicians & creators who need constant imagery.',
      'who.p2': '<strong>I don’t do</strong> full 10‑hour weddings or massive events. My format is intimate shoots & small-scale product.',
      'who.q1': '“I needed photos that didn’t look posed. Eyelean directed everything and they came out natural.”<cite> — Portrait client</cite>',
      'who.q2': '“The photos leveled up my shop. Clean and stylish.”<cite> — Online shop</cite>',
      'faq.kicker': 'FAQ', 'faq.title': 'Before booking',
      'ct.kicker': 'Contact', 'ct.title': 'Tell me your idea — I reply within 24 h.',
      'ct.canva': 'Canva site', 'ct.all': 'All links',
      'ct.name': 'Name*', 'ct.namePh': 'Your name…',
      'ct.contact': 'Instagram or email*', 'ct.contactPh': '@user or email…',
      'ct.type': 'Shoot type*',
      'ct.o1': 'Portrait / book', 'ct.o2': 'Fashion / editorial', 'ct.o3': 'Shop product',
      'ct.o4': 'Social content (monthly)', 'ct.o5': 'Wanderer / outdoors',
      'ct.idea': 'Tell me your idea*', 'ct.ideaPh': 'Tentative date, city, photos you need…',
      'ct.submit': 'Book a session',
      'ct.hint': 'Submitting opens Instagram with your message ready. Static page, no server.',
      'foot.line': '© 2026 Eyelean Medina — authentic, artistic, wanderer',
      'foot.home': 'Home'
    }
  };

  /* ============================================================
     CONTENIDO EDITABLE (contenido.js → window.CONTENIDO)
     Lo que Eyelean cambia desde /panel vive ahí. Aquí se vuelca a
     las mismas claves del diccionario y se pintan las listas.
     Si contenido.js falta o no hay red, el HTML se queda como está.
     ============================================================ */
  var C = window.CONTENIDO || {};
  var IDIOMAS = ['es', 'en'];

  function esc(v) {
    return String(v === undefined || v === null ? '' : v)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function arr(v) { return Array.isArray(v) ? v : []; }
  function val(o, L) { return (o && o[L] !== undefined && o[L] !== null) ? o[L] : ''; }
  function dosDigitos(n) { return (n < 10 ? '0' : '') + n; }

  function pintarServicios(datos) {
    var caja = document.getElementById('listaServicios');
    if (!caja) return;
    var h = '';
    for (var i = 0; i < datos.length; i++) {
      h += '<article class="card">'
        + '<h3 data-i18n="svc.' + i + '.titulo">' + esc(val(datos[i].titulo, 'es')) + '</h3>'
        + '<p class="precio" data-i18n="svc.' + i + '.precio"></p>'
        + '<p data-i18n="svc.' + i + '.texto">' + esc(val(datos[i].texto, 'es')) + '</p>'
        + '<ul data-i18n-html="svc.' + i + '.puntos"></ul>'
        + '</article>';
    }
    caja.innerHTML = h;
  }

  function pintarExtras(datos) {
    var caja = document.getElementById('listaExtras');
    if (!caja) return;
    var h = '';
    for (var i = 0; i < datos.length; i++) {
      h += '<li data-i18n-html="extra.' + i + '"></li>';
    }
    caja.innerHTML = h;
  }

  function pintarFaq(datos) {
    var caja = document.getElementById('listaFaq');
    if (!caja) return;
    var h = '';
    for (var i = 0; i < datos.length; i++) {
      h += '<details' + (i === 0 ? ' open' : '') + '>'
        + '<summary data-i18n="faq.' + i + '.p"></summary>'
        + '<p data-i18n-html="faq.' + i + '.r"></p></details>';
    }
    caja.innerHTML = h;
  }

  function pintarFotos(datos) {
    var caja = document.getElementById('hojaContactos');
    if (!caja) return;
    var h = '';
    for (var i = 0; i < datos.length; i++) {
      var f = datos[i];
      if (!f || !f.archivo) continue;
      h += '<figure class="frame">'
        + '<span class="fn">' + dosDigitos(i + 1) + '</span>'
        + '<img src="' + esc(f.archivo) + '" data-i18n-alt="foto.' + i + '.alt"'
        + ' alt="' + esc(val(f.alt, 'es')) + '"'
        + (f.w ? ' width="' + esc(f.w) + '"' : '')
        + (f.h ? ' height="' + esc(f.h) + '"' : '')
        + ' loading="lazy">'
        + '<figcaption data-i18n="foto.' + i + '.titulo"></figcaption>'
        + '</figure>';
    }
    /* Marco vacío: ocupa el hueco siguiente e invita a reservar. */
    h += '<a class="frame frame-empty" href="#contacto">'
      + '<span class="fn">' + dosDigitos(datos.length + 1) + '</span>'
      + '<span class="empty-txt" data-i18n="port.empty"></span>'
      + '<span class="empty-sub" data-i18n="port.emptysub"></span></a>';
    caja.innerHTML = h;
  }

  /* Vuelca el contenido a las claves del diccionario y pinta las listas. */
  function montarContenido() {
    var i, j, k, L, html, puntos;

    for (i = 0; i < IDIOMAS.length; i++) {
      L = IDIOMAS[i];
      var textos = C.textos || {};
      for (k in textos) {
        /* Un campo vacío no borra el texto: se queda el original.
           Evita que un descuido deje un título en blanco. */
        if (textos[k] && typeof textos[k][L] === 'string' && textos[k][L].trim() !== '') {
          T[L][k] = textos[k][L];
        }
      }
    }

    var servicios = arr(C.servicios);
    for (i = 0; i < servicios.length; i++) {
      for (j = 0; j < IDIOMAS.length; j++) {
        L = IDIOMAS[j];
        T[L]['svc.' + i + '.titulo'] = val(servicios[i].titulo, L);
        T[L]['svc.' + i + '.texto'] = val(servicios[i].texto, L);
        T[L]['svc.' + i + '.precio'] = val(servicios[i].precio, L);
        puntos = arr(val(servicios[i].puntos, L));
        html = '';
        for (k = 0; k < puntos.length; k++) html += '<li>' + esc(puntos[k]) + '</li>';
        T[L]['svc.' + i + '.puntos'] = html;
      }
    }

    var extras = arr(C.extras);
    for (i = 0; i < extras.length; i++) {
      T.es['extra.' + i] = extras[i] && extras[i].es ? extras[i].es : '';
      T.en['extra.' + i] = extras[i] && extras[i].en ? extras[i].en : '';
    }

    var faq = arr(C.faq);
    for (i = 0; i < faq.length; i++) {
      T.es['faq.' + i + '.p'] = val(faq[i].p, 'es'); T.en['faq.' + i + '.p'] = val(faq[i].p, 'en');
      T.es['faq.' + i + '.r'] = val(faq[i].r, 'es'); T.en['faq.' + i + '.r'] = val(faq[i].r, 'en');
    }

    var fotos = arr(C.fotos);
    for (i = 0; i < fotos.length; i++) {
      T.es['foto.' + i + '.titulo'] = val(fotos[i].titulo, 'es');
      T.en['foto.' + i + '.titulo'] = val(fotos[i].titulo, 'en');
      T.es['foto.' + i + '.alt'] = val(fotos[i].alt, 'es');
      T.en['foto.' + i + '.alt'] = val(fotos[i].alt, 'en');
    }

    pintarServicios(servicios);
    pintarExtras(extras);
    pintarFaq(faq);
    pintarFotos(fotos);
  }

  /* Trae el contenido vivo guardado desde el panel. Solo en la web
     publicada: al abrir el archivo desde el disco no hay nada que traer
     y se queda la copia local. Si falla, no se toca nada. */
  function traerContenidoVivo() {
    if (!FOTOS_URL) return;
    if (window.location.protocol.indexOf('http') !== 0) return;
    var s = document.createElement('script');
    s.src = FOTOS_URL + 'contenido.js?v=' + Date.now();
    s.onerror = function () { /* sin red: se queda la copia local */ };
    s.onload = function () {
      if (window.CONTENIDO) {
        C = window.CONTENIDO;
        montarContenido();
        applyLang(lang);
      }
    };
    document.head.appendChild(s);
  }

  montarContenido();

  var langBtn = document.getElementById('langBtn');
  var lang = 'es';
  try {
    var q = new URLSearchParams(window.location.search).get('lang');
    var saved = window.localStorage.getItem('eyelean-lang');
    if (q === 'es' || q === 'en') lang = q;
    else if (saved === 'es' || saved === 'en') lang = saved;
  } catch (e) { lang = 'es'; }

  function applyLang(l){
    lang = (l === 'en') ? 'en' : 'es';
    var d = T[lang];
    document.documentElement.lang = lang;
    document.title = d._title;
    var meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', d._meta);
    var els = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < els.length; i++) {
      var k = els[i].getAttribute('data-i18n');
      if (d[k] !== undefined) els[i].textContent = d[k];
    }
    var htmls = document.querySelectorAll('[data-i18n-html]');
    for (var j = 0; j < htmls.length; j++) {
      var kh = htmls[j].getAttribute('data-i18n-html');
      if (d[kh] !== undefined) htmls[j].innerHTML = d[kh];
    }
    var phs = document.querySelectorAll('[data-i18n-ph]');
    for (var p = 0; p < phs.length; p++) {
      var kp = phs[p].getAttribute('data-i18n-ph');
      if (d[kp] !== undefined) phs[p].setAttribute('placeholder', d[kp]);
    }
    var alts = document.querySelectorAll('[data-i18n-alt]');
    for (var a = 0; a < alts.length; a++) {
      var ka = alts[a].getAttribute('data-i18n-alt');
      if (d[ka] !== undefined) alts[a].setAttribute('alt', d[ka]);
    }
    var arias = document.querySelectorAll('[data-i18n-aria]');
    for (var r = 0; r < arias.length; r++) {
      var kr = arias[r].getAttribute('data-i18n-aria');
      if (d[kr] !== undefined) arias[r].setAttribute('aria-label', d[kr]);
    }
    if (langBtn) {
      langBtn.textContent = d._langBtn;
      langBtn.setAttribute('aria-label', d._langLabel);
    }
    try { window.localStorage.setItem('eyelean-lang', lang); } catch (e) {}
  }

  if (langBtn) {
    langBtn.addEventListener('click', function(){ applyLang(lang === 'es' ? 'en' : 'es'); });
  }
  applyLang(lang);

  var form = document.getElementById('bookForm');
  if(form){
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var d = new FormData(form);
      var t = T[lang];
      var txt = t._formLead + d.get('nombre') + ' (' + d.get('contacto') + '). '
        + t._formType + d.get('tipo') + t._formIdea + d.get('mensaje');
      document.getElementById('formMsg').textContent = t._formDone + txt;
      window.open('https://instagram.com/oye.pendejo', '_blank');
    });
  }

  // Último paso: si la web está publicada, repinta con lo guardado en el panel.
  traerContenidoVivo();
})();
