/* ==============================================================
   CONTENIDO EDITABLE — aleen-fotografia (Eyelean Medina)

   Este archivo lo reescribe el panel privado (/panel) cada vez que
   Eyelean guarda. Está a propósito en .js y no en .json para que la
   web siga funcionando abriendo index.html directamente desde el
   disco, sin servidor y sin conexión.

   La copia que ves aquí es el RESPALDO: si no hay internet o el
   almacenamiento falla, la web se queda con esta y nunca se ve en
   blanco. Cuando está publicada, la web carga la versión viva desde
   el almacenamiento y esta pasa a segundo plano.

   No editar a mano salvo emergencia: se cambia desde el panel.
   El objeto de abajo es JSON estricto (la API lo lee y lo reescribe).
   ============================================================== */
window.CONTENIDO = {
  "actualizado": "2026-10-18",
  "fotos": [
    {
      "archivo": "img/eyelean-avatar.jpg",
      "titulo": { "es": "Retrato editorial", "en": "Editorial portrait" },
      "alt": {
        "es": "Eyelean, retrato editorial en blanco y negro",
        "en": "Eyelean, black-and-white editorial portrait"
      },
      "w": 800,
      "h": 800
    },
    {
      "archivo": "img/canva-44520a1277cd4faa96c5f62efe45a9d2.jpg",
      "titulo": { "es": "Retrato", "en": "Portrait" },
      "alt": {
        "es": "Retrato en blanco y negro con flash directo",
        "en": "Black-and-white flash portrait"
      },
      "w": 800,
      "h": 800
    },
    {
      "archivo": "img/canva-0f84298d5f6843ca8de2fabad9d31d44.jpg",
      "titulo": { "es": "Maternidad", "en": "Maternity" },
      "alt": {
        "es": "Silueta de embarazada junto a la ventana, en blanco y negro",
        "en": "Pregnant silhouette by a window, in black and white"
      },
      "w": 799,
      "h": 577
    },
    {
      "archivo": "img/canva-6ba0a42b26234c97351197fc18d080fa.jpg",
      "titulo": { "es": "Pareja", "en": "Couples" },
      "alt": {
        "es": "Pareja embarazada en un columpio de porche, en blanco y negro",
        "en": "Expecting couple on a porch swing, in black and white"
      },
      "w": 799,
      "h": 626
    },
    {
      "archivo": "img/canva-3e686cd843d3db3b9d87db9ff8aa4807.jpg",
      "titulo": { "es": "Lifestyle", "en": "Lifestyle" },
      "alt": {
        "es": "Pareja mirando ecografías frente a letras luminosas JOY",
        "en": "Couple holding ultrasound photos in front of JOY light letters"
      },
      "w": 533,
      "h": 800
    }
  ],
  "servicios": [
    {
      "titulo": { "es": "Retrato y moda", "en": "Portrait & fashion" },
      "precio": { "es": "", "en": "" },
      "texto": {
        "es": "Sesión editorial, book personal y lookbook. Dirección de pose, vestuario y locación.",
        "en": "Editorial shoots, personal books & lookbooks. Pose, styling & location direction."
      },
      "puntos": {
        "es": ["Exterior o interior", "15 a 30 fotos editadas", "Guía de poses incluida"],
        "en": ["Outdoors or indoors", "15–30 edited photos", "Pose guide included"]
      }
    },
    {
      "titulo": { "es": "Producto para tiendas", "en": "Shop product" },
      "precio": { "es": "", "en": "" },
      "texto": {
        "es": "Fondo limpio, bodegón y lifestyle para Etsy, Shopify e Instagram Shop.",
        "en": "Clean backgrounds, styled stills & lifestyle for Etsy, Shopify & Instagram Shop."
      },
      "puntos": {
        "es": ["Fondo blanco y creativo", "Detalle y escala", "Lotes de 10, 25 o 50"],
        "en": ["White + creative background", "Detail & scale shots", "Batches of 10, 25 or 50"]
      }
    },
    {
      "titulo": { "es": "Contenido para redes", "en": "Social content" },
      "precio": { "es": "", "en": "" },
      "texto": {
        "es": "Foto y vídeo vertical para Reels y TikTok, en formato 4:5 y 9:16.",
        "en": "Vertical photo & video for Reels & TikTok, in 4:5 & 9:16."
      },
      "puntos": {
        "es": ["Foto y clip vertical", "Retoque natural en 24 h", "Plan mensual disponible"],
        "en": ["Photo + vertical clip", "Natural retouch in 24 h", "Monthly plan available"]
      }
    }
  ],
  "extras": [
    {
      "es": "<strong>Vídeo y 360°</strong> — clip de producto y mini fashion film.",
      "en": "<strong>Video & 360°</strong> — product clips & mini fashion films."
    },
    {
      "es": "<strong>Retoque</strong> — piel natural e igualado de color por lote.",
      "en": "<strong>Retouching</strong> — natural skin & batch color matching."
    },
    {
      "es": "<strong>Sesión Wanderer</strong> — en viaje o locación especial, cuéntame tu ruta.",
      "en": "<strong>Wanderer shoot</strong> — on trips or special locations, tell me your route."
    }
  ],
  "faq": [
    {
      "p": { "es": "¿Cómo reservo?", "en": "How do I book?" },
      "r": {
        "es": "Usa el botón de reserva o escríbeme por Instagram <span translate=\"no\">(@oye.pendejo)</span>. Cuéntame idea, fecha y ciudad y te mando plan y precio en 24 h.",
        "en": "Use the booking button or message me on Instagram <span translate=\"no\">(@oye.pendejo)</span>. Tell me your idea, date & city and I’ll send plan & pricing within 24 h."
      }
    },
    {
      "p": { "es": "¿Cuánto tardas en entregar?", "en": "How fast is delivery?" },
      "r": {
        "es": "Adelanto de 3 a 5 fotos en 48 h y galería completa en unos 7 días.",
        "en": "3–5 photo preview in 48 h, full gallery in about 7 days."
      }
    },
    {
      "p": { "es": "¿Haces fotos para tiendas?", "en": "Do you shoot for shops?" },
      "r": {
        "es": "Sí, fondo limpio y creativo con estilo consistente por lote. Pide lote de 10, 25 o 50 fotos.",
        "en": "Yes — clean & creative backgrounds with consistent batch style. Ask for a 10, 25 or 50-photo batch."
      }
    },
    {
      "p": { "es": "¿Viajas?", "en": "Do you travel?" },
      "r": {
        "es": "Sí. Fuera de mi ciudad sumamos viáticos. Cuéntame tu ruta y lo planeamos.",
        "en": "Yes. Outside my city we add travel costs. Tell me your route and we’ll plan it."
      }
    }
  ],
  "textos": {
    "svc.kicker": { "es": "Servicios", "en": "Services" },
    "svc.title": { "es": "Tres formas de trabajar conmigo", "en": "Three ways to work with me" },
    "svc.sub": {
      "es": "Del retrato al producto: tú traes la idea, yo pongo luz, dirección y edición.",
      "en": "From portrait to product: you bring the idea, I bring light, direction and editing."
    },
    "proc.kicker": { "es": "Cómo trabajo", "en": "How I work" },
    "proc.title": { "es": "Reserva simple, entrega rápida, sin vueltas.", "en": "Simple booking, fast delivery, no fuss." },
    "proc.sub": {
      "es": "Sesión de 1 a 3 h con presupuesto claro y entrega digital. Recojo tu idea, fotografiamos, edito y te entrego listo para publicar.",
      "en": "1–3 h shoots with clear pricing and digital delivery. I take your idea, we shoot, I edit and deliver ready to post."
    },
    "port.title": { "es": "Trabajo reciente", "en": "Recent work" },
    "port.sub": { "es": "Sesiones hechas por Eyelean.", "en": "Sessions shot by Eyelean." },
    "who.title": { "es": "Para quién es (y para quién no)", "en": "Who it’s for (and who it isn’t)" },
    "faq.kicker": { "es": "Preguntas frecuentes", "en": "FAQ" },
    "faq.title": { "es": "Antes de reservar", "en": "Before booking" },
    "ct.title": { "es": "Cuéntame tu idea y te respondo en 24 h.", "en": "Tell me your idea — I reply within 24 h." }
  }
};
