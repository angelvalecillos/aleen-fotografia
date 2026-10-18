/* GET /api/sesion  — quién ha entrado y si el almacenamiento responde.
   El panel lo usa al abrirse: si devuelve 401, la sesión no vale. */

import { identidad } from '../_lib/access.js';
import { json, noAutorizado } from '../_lib/comun.js';

export async function onRequestGet(context) {
  var quien = await identidad(context.request, context.env);
  if (!quien) return noAutorizado();

  return json({
    email: quien.email,
    almacenamiento: !!context.env.FOTOS,
    urlFotos: String(context.env.FOTOS_URL || '').replace(/\/+$/, '')
  });
}
