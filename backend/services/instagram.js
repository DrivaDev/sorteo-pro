const axios = require('axios');

const GRAPH_BASE = 'https://graph.instagram.com';
const FB_BASE    = 'https://graph.facebook.com/v19.0';

// Extrae el shortcode de una URL de Instagram
function extractShortcode(url) {
  const match = url.match(/instagram\.com\/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/);
  return match ? match[1] : null;
}

// Obtiene el ID de la media a partir del shortcode usando la API de Instagram Business
async function getMediaIdFromUrl(postUrl, accessToken) {
  const shortcode = extractShortcode(postUrl);
  if (!shortcode) throw new Error('URL de Instagram inválida');

  // Busca en las medias del usuario la que coincida con la URL
  let nextUrl = `${GRAPH_BASE}/me/media?fields=id,shortcode,like_count,comments_count&limit=50&access_token=${accessToken}`;
  while (nextUrl) {
    const { data } = await axios.get(nextUrl);
    const found = (data.data || []).find(m => m.shortcode === shortcode);
    if (found) return found.id;
    nextUrl = data.paging?.next || null;
  }
  throw new Error('Publicación no encontrada en tu cuenta. Asegurate de que la publicación pertenezca a tu cuenta conectada.');
}

// Obtiene todos los comentarios de una publicación (con paginación)
async function getAllComments(mediaId, accessToken) {
  const comments = [];
  let nextUrl = `${GRAPH_BASE}/${mediaId}/comments?fields=id,text,username,timestamp,from&limit=100&access_token=${accessToken}`;
  while (nextUrl) {
    const { data } = await axios.get(nextUrl);
    comments.push(...(data.data || []));
    nextUrl = data.paging?.next || null;
  }
  return comments;
}

// Obtiene la cantidad de likes de una publicación
// Nota: la API de Instagram Business no expone la lista de likers, solo el count.
// Para sorteos por like se usa el conteo y se avisa al usuario.
async function getMediaInfo(mediaId, accessToken) {
  const { data } = await axios.get(
    `${GRAPH_BASE}/${mediaId}?fields=id,like_count,comments_count,media_url,timestamp&access_token=${accessToken}`
  );
  return data;
}

/**
 * Aplica los filtros y devuelve la lista de participantes válidos.
 * @param {string} postUrl
 * @param {object} filters
 * @param {string} accessToken
 * @returns {{ participants: Array, mediaInfo: object, warning: string|null }}
 */
async function getParticipants(postUrl, filters, accessToken) {
  const mediaId = await getMediaIdFromUrl(postUrl, accessToken);
  const mediaInfo = await getMediaInfo(mediaId, accessToken);

  // Todos los comentarios
  const rawComments = await getAllComments(mediaId, accessToken);

  // Mapa: username → { username, comments: [], liked: false }
  const map = new Map();

  for (const c of rawComments) {
    const u = (c.username || c.from?.username)?.toLowerCase();
    if (!u) continue;
    if (!map.has(u)) map.set(u, { username: u, comments: [], liked: false });
    map.get(u).comments.push(c.text || '');
  }

  let warning = null;

  // Aplicar filtros
  let candidates = [...map.values()];

  // Excluir cuentas específicas
  if (filters.excludeAccounts?.length) {
    const excluded = filters.excludeAccounts.map(a => a.toLowerCase().replace('@', ''));
    candidates = candidates.filter(p => !excluded.includes(p.username));
  }

  // Filtro: que contenga keyword
  if (filters.requiredKeyword?.trim()) {
    const kw = filters.requiredKeyword.trim().toLowerCase();
    candidates = candidates.filter(p =>
      p.comments.some(c => c.toLowerCase().includes(kw))
    );
  }

  // Filtro: menciones mínimas
  if (filters.minMentions > 0) {
    const mentionRegex = /@[\w.]+/g;
    candidates = candidates.filter(p =>
      p.comments.some(c => {
        const mentions = c.match(mentionRegex) || [];
        return mentions.length >= filters.minMentions;
      })
    );
  }

  // Filtro: sin duplicados (ya está implícito en el mapa por username)
  // Si noDuplicates es false, se pueden contar múltiples comentarios como entradas
  let finalParticipants;
  if (!filters.noDuplicates) {
    // Cada comentario es una entrada
    finalParticipants = [];
    for (const p of candidates) {
      for (let i = 0; i < p.comments.length; i++) {
        finalParticipants.push({ username: p.username, commentCount: p.comments.length, liked: false });
      }
    }
  } else {
    finalParticipants = candidates.map(p => ({
      username: p.username,
      commentCount: p.comments.length,
      liked: false,
    }));
  }

  // Nota sobre likers: la Graph API de Instagram no expone la lista de usuarios que dieron like.
  // Solo está disponible el conteo total. Informamos esto al usuario.
  if (filters.likers || filters.commentersAndLikers) {
    warning = 'La API de Instagram no permite obtener la lista de usuarios que dieron like a una publicación. El filtro por likes no puede aplicarse automáticamente. Podés usar el sorteo manual para cargar la lista de participantes a mano.';
    if (filters.commentersAndLikers) {
      // Devolvemos solo comentaristas con la advertencia
    }
  }

  return { participants: finalParticipants, mediaInfo, warning };
}

module.exports = { getParticipants, extractShortcode };
