/* ==============================================================
   Verificación del login de Cloudflare Access.

   Access deja en cada petición autenticada una cabecera con un JWT
   firmado (Cf-Access-Jwt-Assertion). Aquí se comprueba la firma
   contra los certificados de Cloudflare, que el token no esté
   caducado y que el correo sea uno de los autorizados.

   Por qué se verifica aquí y no basta con Access: el proyecto también
   responde en *.pages.dev, y esa dirección no puede protegerse con
   Access. Si no comprobáramos el token, cualquiera podría llamar a
   /api/guardar por ahí y escribir en la web.

   Sin JWT válido -> null: no hay acceso.
   ============================================================== */

/* Caché de los certificados de Access (por instancia del Worker). */
var cacheJwks = { claves: null, expira: 0 };

/* Atajo SOLO para pruebas locales. Se exige que el host sea localhost,
   de modo que aunque alguien definiera DEV_EMAIL en producción, no
   serviría de nada. */
function esLocal(hostname) {
  return hostname === 'localhost' || hostname === '127.0.0.1' ||
         hostname === '0.0.0.0' || hostname.slice(-10) === '.localhost';
}

/* base64url -> Uint8Array */
function aBytes(trozo) {
  var s = trozo.replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  var bin = atob(s);
  var bytes = new Uint8Array(bin.length);
  for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function aTexto(trozo) {
  return new TextDecoder().decode(aBytes(trozo));
}

async function certificados(dominio) {
  var ahora = Date.now();
  if (cacheJwks.claves && cacheJwks.expira > ahora) return cacheJwks.claves;

  var r = await fetch('https://' + dominio + '/cdn-cgi/access/certs');
  if (!r.ok) throw new Error('Access no respondió (' + r.status + ')');

  var datos = await r.json();
  cacheJwks.claves = datos.keys || datos.public_certs || [];
  cacheJwks.expira = ahora + 3600000;
  return cacheJwks.claves;
}

/* Devuelve { email, sub } si la petición viene de una sesión válida
   y autorizada; null en cualquier otro caso. */
export async function identidad(request, env) {
  var url = new URL(request.url);

  /* Pruebas locales: wrangler pages dev no tiene Access delante. */
  if (esLocal(url.hostname) && env.DEV_EMAIL) {
    return { email: String(env.DEV_EMAIL).toLowerCase(), sub: 'local' };
  }

  var token = request.headers.get('Cf-Access-Jwt-Assertion');
  if (!token) return null;

  var partes = token.split('.');
  if (partes.length !== 3) return null;

  var cabecera, cuerpo;
  try {
    cabecera = JSON.parse(aTexto(partes[0]));
    cuerpo = JSON.parse(aTexto(partes[1]));
  } catch (e) {
    return null;
  }

  if (cabecera.alg !== 'RS256') return null;
  if (!env.TEAM_DOMAIN) return null;

  var claves;
  try {
    claves = await certificados(env.TEAM_DOMAIN);
  } catch (e) {
    return null;
  }

  var jwk = null;
  for (var i = 0; i < claves.length; i++) {
    if (claves[i].kid === cabecera.kid) { jwk = claves[i]; break; }
  }
  if (!jwk) return null;

  var clave, valida;
  try {
    clave = await crypto.subtle.importKey(
      'jwk', jwk,
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false, ['verify']
    );
    valida = await crypto.subtle.verify(
      'RSASSA-PKCS1-v1_5', clave, aBytes(partes[2]),
      new TextEncoder().encode(partes[0] + '.' + partes[1])
    );
  } catch (e) {
    return null;
  }
  if (!valida) return null;

  /* Caducidad y emisor. */
  var ahora = Math.floor(Date.now() / 1000);
  if (cuerpo.exp && cuerpo.exp < ahora) return null;
  if (cuerpo.nbf && cuerpo.nbf > ahora + 60) return null;
  if (cuerpo.iss !== 'https://' + env.TEAM_DOMAIN) return null;

  /* Audiencia: el identificador de la aplicación de Access. Evita que
     valga un token emitido para otra aplicación del mismo equipo. */
  if (env.POLICY_AUD) {
    var aud = Array.isArray(cuerpo.aud) ? cuerpo.aud : [cuerpo.aud];
    if (aud.indexOf(env.POLICY_AUD) === -1) return null;
  }

  /* Lista blanca de correos: quien no esté aquí, no entra. */
  var correo = String(cuerpo.email || '').toLowerCase();
  if (env.CORREO_AUTORIZADO) {
    var permitidos = env.CORREO_AUTORIZADO.split(',')
      .map(function (s) { return s.trim().toLowerCase(); })
      .filter(Boolean);
    if (permitidos.indexOf(correo) === -1) return null;
  }

  return { email: correo, sub: cuerpo.sub || '' };
}
