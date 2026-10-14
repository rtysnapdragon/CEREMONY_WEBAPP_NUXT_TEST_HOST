// utils/printLetter.ts
// ─────────────────────────────────────────────────────────────────────────────
// Isolated letter-printing utility.
// Opens a minimal popup window with only the LetterDocument HTML + styles,
// triggers print, then closes.  Works from any component/page.
//
// Usage:
//   import { printLetter } from '~/utils/printLetter'
//   printLetter(letterData)
//
// The util renders the letter to a standalone HTML string so NO DOM node from
// the current page leaks into the printout.
// ─────────────────────────────────────────────────────────────────────────────

import type { LetterData } from '~/composables/useLetterData'

// ── Template-specific CSS vars injected at print time ─────────────────────
function templateVars(letter: LetterData): string {
  const border =
    letter.template === 'royal'  ? '#d4af37'
    : letter.template === 'modern' ? '#333'
    : '#c8a882'

  return `
    --lt-primary: ${letter.primaryColor};
    --lt-bg:      ${letter.bgColor};
    --lt-border:  ${border};
  `
}

// ── Format date for display ───────────────────────────────────────────────
function fmtDateEn(iso: string): string {
  if (!iso) return ''
  try {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    }).format(new Date(iso))
  } catch { return iso }
}

// ── Build full schedule HTML ──────────────────────────────────────────────
function scheduleHtml(letter: LetterData): string {
  return letter.schedule.map((item, i) => `
    <div class="ld-schedule-item">
      <div class="ld-sched-head">
        <span class="ld-sched-num">${i + 1}</span>
        <div>
          <div class="ld-sched-day">${item.day}</div>
          <div class="ld-sched-time">⏱ ${item.time}</div>
        </div>
      </div>
      <p class="ld-sched-prog">${item.programKm.replace(/\n/g, '<br>')}</p>
    </div>
  `).join('')
}

// ── Full HTML document string ─────────────────────────────────────────────
function buildHtml(letter: LetterData): string {
  return `<!DOCTYPE html>
<html lang="km">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>${letter.titleKm}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link href="https://fonts.googleapis.com/css2?family=Battambang:wght@300;400;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&display=swap" rel="stylesheet"/>
  <style>
    /* ── Reset ── */
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    body{
      font-family:'Battambang','NotoSansKhmer',serif;
      background:#fff;
      color:#2c1810;
      -webkit-print-color-adjust:exact;
      print-color-adjust:exact;
    }

    /* ── CSS custom props ── */
    :root{ ${templateVars(letter)} }

    /* ── Page layout ── */
    .ld-root{
      background: var(--lt-bg,#fdf6ef);
      color: #2c1810;
      font-size:13px;
      line-height:1.8;
      padding:32px 28px 40px;
      max-width:640px;
      margin:0 auto;
    }

    /* ── Template variants ── */
    ${letter.template === 'royal' ? `
      .ld-root{background:#1a0a2e;color:#f0e6c8;}
      .ld-title{color:#d4af37;}
      .ld-heart{color:#d4af37;}
    ` : ''}

    /* ── Decorative borders ── */
    .ld-top-border,.ld-bottom-border{
      height:3px;
      background:linear-gradient(90deg,transparent,var(--lt-primary,#c0392b),transparent);
      margin:0 -28px;
    }
    .ld-top-border{margin-bottom:28px;}
    .ld-bottom-border{margin-top:28px;}

    /* ── Header ── */
    .ld-header{text-align:center;margin-bottom:22px;}
    .ld-subtitle{font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:var(--lt-primary,#c0392b);margin-bottom:8px;opacity:.8;}
    .ld-title{font-size:22px;font-weight:700;color:var(--lt-primary,#c0392b);margin:8px 0 12px;}
    .ld-ornament{display:flex;align-items:center;gap:10px;justify-content:center;margin:8px 0;opacity:.55;}
    .ld-orn-line{flex:1;max-width:80px;height:1px;background:var(--lt-primary,#c0392b);}
    .ld-orn-lotus{font-size:14px;color:var(--lt-primary,#c0392b);}

    /* ── Section ── */
    .ld-section{margin-bottom:20px;}
    .ld-section-heading{display:flex;align-items:center;gap:10px;font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--lt-primary,#c0392b);margin-bottom:12px;}
    .ld-sh-line{flex:1;height:1px;background:var(--lt-primary,#c0392b);opacity:.3;}

    /* ── Opening ── */
    .ld-opening{text-align:center;font-size:12px;padding:0 8px;}

    /* ── Couple ── */
    .ld-couple{display:grid;grid-template-columns:1fr auto 1fr;gap:14px;padding:14px;border:1px solid rgba(192,57,43,.15);border-radius:10px;background:rgba(0,0,0,.025);}
    .ld-party{text-align:center;}
    .ld-party-role{font-size:9px;text-transform:uppercase;letter-spacing:.12em;color:var(--lt-primary,#c0392b);opacity:.7;}
    .ld-party-name-km{font-size:15px;font-weight:700;color:var(--lt-primary,#c0392b);}
    .ld-party-name-en{font-size:11px;opacity:.6;}
    .ld-party-parents{font-size:10px;opacity:.75;}
    .ld-party-address{font-size:10px;opacity:.6;margin-top:3px;line-height:1.4;}
    .ld-couple-divider{display:flex;align-items:center;justify-content:center;padding-top:28px;}
    .ld-heart{font-size:22px;color:var(--lt-primary,#c0392b);}

    /* ── Event box ── */
    .ld-event-box{text-align:center;padding:16px;border:1px solid rgba(192,57,43,.2);border-radius:10px;background:rgba(192,57,43,.04);}
    .ld-event-title{font-size:15px;font-weight:700;color:var(--lt-primary,#c0392b);margin-bottom:3px;}
    .ld-event-date-en{font-size:10px;opacity:.6;margin-bottom:10px;}
    .ld-divider-thin{height:1px;background:rgba(192,57,43,.2);margin:8px auto;width:60%;}
    .ld-venue-name{font-size:13px;font-weight:600;margin-bottom:3px;}
    .ld-venue-addr{font-size:11px;opacity:.7;margin-bottom:8px;}
    .ld-map-btn{display:inline-block;padding:5px 12px;border:1px solid rgba(192,57,43,.35);border-radius:999px;font-size:11px;color:var(--lt-primary,#c0392b);}

    /* ── Schedule ── */
    .ld-schedule-item{border:1px solid rgba(192,57,43,.15);border-radius:8px;padding:10px 12px;margin-bottom:8px;background:rgba(0,0,0,.02);}
    .ld-sched-head{display:flex;align-items:flex-start;gap:8px;margin-bottom:6px;}
    .ld-sched-num{width:20px;height:20px;border-radius:50%;background:rgba(192,57,43,.12);color:var(--lt-primary,#c0392b);font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
    .ld-sched-day{font-size:12px;font-weight:700;color:var(--lt-primary,#c0392b);}
    .ld-sched-time{font-size:10px;opacity:.65;}
    .ld-sched-prog{font-size:11px;line-height:1.7;opacity:.85;}

    /* ── RSVP ── */
    .ld-rsvp{font-size:12px;}
    .ld-contacts{margin-top:8px;font-weight:600;font-size:12px;color:var(--lt-primary,#c0392b);}

    /* ── Footer ── */
    .ld-footer{text-align:center;margin-top:8px;}
    .ld-closing{font-size:12px;opacity:.75;margin-bottom:12px;}
    .ld-signatures{display:flex;align-items:center;justify-content:center;gap:12px;font-size:14px;font-weight:700;color:var(--lt-primary,#c0392b);}

    /* ── Print media ── */
    @media print{
      body{margin:0;}
      .ld-root{padding:20px 24px 28px;max-width:100%;}
      @page{margin:10mm;size:A4;}
    }
  </style>
</head>
<body>
  <div class="ld-root">
    <div class="ld-top-border"></div>

    <div class="ld-header">
      <div class="ld-ornament">
        <span class="ld-orn-line"></span>
        <span class="ld-orn-lotus">❧</span>
        <span class="ld-orn-line"></span>
      </div>
      <p class="ld-subtitle">ពិធីមង្គលការ / Wedding Invitation</p>
      <h1 class="ld-title">${letter.titleKm}</h1>
      <div class="ld-ornament">
        <span class="ld-orn-line"></span>
        <span class="ld-orn-lotus">❧</span>
        <span class="ld-orn-line"></span>
      </div>
    </div>

    <div class="ld-section ld-opening"><p>${letter.openingKm.replace(/\n/g, '<br>')}</p></div>

    <div class="ld-section ld-couple">
      <div class="ld-party">
        <div class="ld-party-role">ក្រូម</div>
        <div class="ld-party-name-km">${letter.groomNameKm}</div>
        <div class="ld-party-name-en">${letter.groomNameEn}</div>
        <div class="ld-party-parents">${letter.groomFatherKm}<br>${letter.groomMotherKm}</div>
        <div class="ld-party-address">${letter.groomAddressKm}</div>
      </div>
      <div class="ld-couple-divider"><span class="ld-heart">♡</span></div>
      <div class="ld-party">
        <div class="ld-party-role">花嫁</div>
        <div class="ld-party-name-km">${letter.brideNameKm}</div>
        <div class="ld-party-name-en">${letter.brideNameEn}</div>
        <div class="ld-party-parents">${letter.brideFatherKm}<br>${letter.brideMotherKm}</div>
        <div class="ld-party-address">${letter.brideAddressKm}</div>
      </div>
    </div>

    <div class="ld-section ld-event-box">
      <div class="ld-event-title">📅 ${letter.weddingDateKm}</div>
      <div class="ld-event-date-en">${fmtDateEn(letter.weddingDateEn)}</div>
      <div class="ld-divider-thin"></div>
      <div class="ld-venue-name">${letter.venueKm}</div>
      <div class="ld-venue-addr">${letter.venueAddressKm}</div>
      ${letter.mapUrl ? `<a class="ld-map-btn" href="${letter.mapUrl}">📍 មើលផែនទី / View Map</a>` : ''}
    </div>

    <div class="ld-section">
      <div class="ld-section-heading">
        <span class="ld-sh-line"></span>
        <span>កម្មវិធីពិធីការ / Ceremony Schedule</span>
        <span class="ld-sh-line"></span>
      </div>
      ${scheduleHtml(letter)}
    </div>

    <div class="ld-section ld-rsvp">
      <div class="ld-section-heading">
        <span class="ld-sh-line"></span>
        <span>ការបញ្ជាក់ / RSVP</span>
        <span class="ld-sh-line"></span>
      </div>
      <p>${letter.rsvpNoteKm.replace(/\n/g, '<br>')}</p>
      <div class="ld-contacts">📞 ${letter.contacts}</div>
    </div>

    <div class="ld-footer">
      <div class="ld-ornament">
        <span class="ld-orn-line"></span>
        <span class="ld-orn-lotus">❧</span>
        <span class="ld-orn-line"></span>
      </div>
      <p class="ld-closing">${letter.closingKm}</p>
      <div class="ld-signatures">
        <span>${letter.groomNameKm}</span>
        <span>❤</span>
        <span>${letter.brideNameKm}</span>
      </div>
      <div class="ld-bottom-border"></div>
    </div>
  </div>

  // <script>
  //   window.onload = function() {
  //     window.print()
  //     setTimeout(function() { window.close() }, 800)
  //   }
  // <\/script>
</body>
</html>`
}

// ── Public API ────────────────────────────────────────────────────────────

/**
 * Print only the letter template in a clean popup.
 * No sidebars, no toolbars, no nav — just the letter.
 *
 * @param letter  Reactive or plain LetterData object
 * @param title   Optional popup window title (defaults to letter.titleKm)
 */
export function printLetter(letter: LetterData, title?: string): void {
  if (typeof window === 'undefined') return

  const html  = buildHtml(letter)
  const popup = window.open('', title ?? letter.titleKm, 'width=720,height=960,scrollbars=yes')
  if (!popup) {
    console.warn('[printLetter] Popup blocked. Allow popups for this site.')
    return
  }
  popup.document.open()
  popup.document.write(html)
  popup.document.close()
}

/**
 * Download the letter as a standalone HTML file.
 * Useful if the user wants to save/share offline.
 */
export function downloadLetterHtml(letter: LetterData, filename = 'wedding-invitation.html'): void {
  const html = buildHtml(letter)
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export {
  buildHtml
}