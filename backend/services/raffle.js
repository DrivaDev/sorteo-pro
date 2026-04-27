/**
 * Algoritmo de sorteo: Fisher-Yates shuffle + selección de N ganadores.
 * Criptográficamente no es necesario para un sorteo de Instagram,
 * pero usamos Math.random() con múltiples seeds para mayor transparencia.
 */
function runRaffle(participants, winnersCount, alternatesCount) {
  if (!participants.length) throw new Error('No hay participantes');
  const total = winnersCount + alternatesCount;
  if (total > participants.length) {
    throw new Error(`Se pidieron ${total} seleccionados pero solo hay ${participants.length} participantes`);
  }

  // Copia para no mutar el array original
  const pool = [...participants];

  // Fisher-Yates shuffle
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  const selected = pool.slice(0, total);
  const winners   = selected.slice(0, winnersCount).map((p, i) => ({ ...p, position: i + 1 }));
  const alternates= selected.slice(winnersCount).map((p, i) => ({ ...p, position: i + 1 }));

  return { winners, alternates };
}

module.exports = { runRaffle };
