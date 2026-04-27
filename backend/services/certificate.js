const PDFDocument = require('pdfkit');

const ORANGE = '#EA580C';
const DARK   = '#9A3412';
const ACCENT = '#FED7AA';
const BG     = '#FFF7ED';
const TEXT   = '#1C1917';
const GRAY   = '#78716c';

function formatDate(d) {
  return new Date(d).toLocaleString('es-AR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

/**
 * Genera el PDF del acta de sorteo y lo escribe en el stream `res`.
 */
function generateCertificate(raffle, res) {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });
  doc.pipe(res);

  const W = doc.page.width;

  // ── Header ──────────────────────────────────────────────
  doc.rect(0, 0, W, 100).fill(DARK);
  doc.fontSize(26).fillColor('#fff').font('Helvetica-Bold')
    .text('SORTEO PRO', 50, 28, { align: 'center' });
  doc.fontSize(11).fillColor('rgba(255,255,255,0.75)').font('Helvetica')
    .text('Acta de sorteo certificada', 50, 60, { align: 'center' });

  // ── Título del sorteo ────────────────────────────────────
  doc.moveDown(2);
  doc.fontSize(20).fillColor(DARK).font('Helvetica-Bold')
    .text(raffle.title, { align: 'center' });

  // Línea separadora
  doc.moveDown(0.5);
  doc.moveTo(50, doc.y).lineTo(W - 50, doc.y).strokeColor(ACCENT).lineWidth(1.5).stroke();
  doc.moveDown(0.8);

  // ── Datos del sorteo ─────────────────────────────────────
  const infoY = doc.y;
  doc.fontSize(10).fillColor(GRAY).font('Helvetica');

  const rows = [
    ['Tipo de sorteo',      raffle.type === 'instagram' ? 'Instagram' : 'Manual'],
    ['Fecha de ejecución',  formatDate(raffle.executedAt)],
    ['Total participantes', String(raffle.participantCount)],
    ['Ganadores',           String(raffle.winnersCount)],
    ['Suplentes',           String(raffle.alternatesCount)],
  ];

  if (raffle.instagramPostUrl) {
    rows.splice(1, 0, ['Publicación', raffle.instagramPostUrl]);
  }

  for (const [label, value] of rows) {
    doc.fillColor(GRAY).font('Helvetica').text(`${label}:  `, { continued: true });
    doc.fillColor(TEXT).font('Helvetica-Bold').text(value);
    doc.moveDown(0.2);
  }

  // Filtros aplicados (solo Instagram)
  if (raffle.type === 'instagram' && raffle.filters) {
    doc.moveDown(0.5);
    doc.fillColor(GRAY).font('Helvetica').fontSize(10).text('Filtros aplicados:');
    const f = raffle.filters;
    const applied = [];
    if (f.commenters)          applied.push('Comentaristas');
    if (f.likers)              applied.push('Usuarios que dieron like');
    if (f.commentersAndLikers) applied.push('Comentaristas Y likes');
    if (f.minMentions > 0)     applied.push(`Mínimo ${f.minMentions} menciones`);
    if (f.requiredKeyword)     applied.push(`Keyword: "${f.requiredKeyword}"`);
    if (f.noDuplicates)        applied.push('Sin duplicados');
    if (f.excludeAccounts?.length) applied.push(`Excluidos: @${f.excludeAccounts.join(', @')}`);
    for (const a of applied) {
      doc.fillColor(ORANGE).font('Helvetica').fontSize(9).text(`  ✓  ${a}`);
    }
  }

  doc.moveDown(0.8);
  doc.moveTo(50, doc.y).lineTo(W - 50, doc.y).strokeColor(ACCENT).lineWidth(1.5).stroke();
  doc.moveDown(0.8);

  // ── Ganadores ────────────────────────────────────────────
  doc.fontSize(14).fillColor(DARK).font('Helvetica-Bold').text('🏆  Ganadores');
  doc.moveDown(0.4);
  for (const w of raffle.winners) {
    doc.rect(50, doc.y, W - 100, 26).fill('#FFF7ED').stroke(ACCENT);
    doc.fillColor(ORANGE).font('Helvetica-Bold').fontSize(11)
      .text(`#${w.position}`, 60, doc.y - 20);
    doc.fillColor(TEXT).font('Helvetica').fontSize(11)
      .text(`@${w.username}`, 90, doc.y - 20);
    doc.moveDown(0.5);
  }

  // ── Suplentes ────────────────────────────────────────────
  if (raffle.alternates?.length) {
    doc.moveDown(0.5);
    doc.fontSize(14).fillColor(DARK).font('Helvetica-Bold').text('🔄  Suplentes');
    doc.moveDown(0.4);
    for (const a of raffle.alternates) {
      doc.rect(50, doc.y, W - 100, 26).fill('#f5f5f4').stroke('#e7e5e4');
      doc.fillColor(GRAY).font('Helvetica-Bold').fontSize(11)
        .text(`#${a.position}`, 60, doc.y - 20);
      doc.fillColor(TEXT).font('Helvetica').fontSize(11)
        .text(`@${a.username}`, 90, doc.y - 20);
      doc.moveDown(0.5);
    }
  }

  // ── Lista de participantes ───────────────────────────────
  if (raffle.participants?.length <= 200) {
    doc.addPage();
    doc.fontSize(14).fillColor(DARK).font('Helvetica-Bold')
      .text(`Lista de participantes (${raffle.participantCount})`);
    doc.moveDown(0.5);
    const cols = 3;
    const colW = (W - 100) / cols;
    let col = 0, startX = 50, curY = doc.y;
    for (const p of raffle.participants) {
      if (col === cols) { col = 0; curY += 16; }
      if (curY > doc.page.height - 80) {
        doc.addPage();
        curY = 50;
        col = 0;
      }
      doc.fillColor(GRAY).font('Helvetica').fontSize(8)
        .text(`@${p.username}`, startX + col * colW, curY, { width: colW - 4, ellipsis: true });
      col++;
    }
  }

  // ── Footer ───────────────────────────────────────────────
  const pages = doc.bufferedPageRange();
  for (let i = 0; i < pages.count; i++) {
    doc.switchToPage(pages.start + i);
    doc.fontSize(8).fillColor('#a8a29e').font('Helvetica')
      .text(
        `Generado por Sorteo Pro · Desarrollado por Driva Dev · drivadev.com · ${formatDate(new Date())}`,
        50, doc.page.height - 35,
        { align: 'center', width: W - 100 }
      );
  }

  doc.end();
}

module.exports = { generateCertificate };
