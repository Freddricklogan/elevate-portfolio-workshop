/* Shared helpers: local persistence, toast, copy/download, simple tallies. Per-browser only (no server). */
window.PW = (function () {
  const KEY = 'elevate-portfolio-workshop';
  function load() { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { return {}; } }
  function save(obj) { try { localStorage.setItem(KEY, JSON.stringify(obj)); } catch (e) {} }
  function get(k, d) { const s = load(); return (k in s) ? s[k] : d; }
  function set(k, v) { const s = load(); s[k] = v; save(s); }
  function toast(msg) {
    let t = document.querySelector('.toast');
    if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 1800);
  }
  function copy(text) {
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(() => toast('Copied'));
    else { const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); toast('Copied'); }
  }
  function download(name, text) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type: 'text/plain' })); a.download = name; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 500);
  }
  /* Bind every [data-store] input to localStorage */
  function bindInputs(root) {
    (root || document).querySelectorAll('[data-store]').forEach(el => {
      const k = el.getAttribute('data-store');
      if (el.type === 'checkbox') { el.checked = !!get(k, false); el.addEventListener('change', () => set(k, el.checked)); }
      else { el.value = get(k, ''); el.addEventListener('input', () => set(k, el.value)); }
    });
  }
  /* Simple tally widget: <div data-tally="id" data-options="A|B|C"></div> */
  function tally(el) {
    const id = el.getAttribute('data-tally'); const opts = el.getAttribute('data-options').split('|');
    let counts = get('tally-' + id, {}); opts.forEach(o => counts[o] = counts[o] || 0);
    const render = () => {
      const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
      el.innerHTML = '<div class="vote">' + opts.map(o => `<button data-o="${o}">${o} <b>${counts[o]}</b></button>`).join('') +
        `<button data-o="__reset" class="small" style="border-color:#aaa;color:#666">Reset</button></div>` +
        opts.map(o => `<div style="margin:8px 0 2px;font-size:14px"><span>${o}</span> <span style="float:right">${Math.round(counts[o] / total * 100)}%</span></div><div class="bar"><i style="width:${counts[o] / total * 100}%"></i></div>`).join('');
      el.querySelectorAll('button').forEach(b => b.onclick = () => {
        const o = b.getAttribute('data-o');
        if (o === '__reset') { opts.forEach(x => counts[x] = 0); } else counts[o]++;
        set('tally-' + id, counts); render();
      });
    };
    render();
  }
  /* Theme: light / dark, remembered per browser; follows the system until chosen */
  const TKEY = 'elevate-portfolio-theme';
  function currentTheme() { const a = document.documentElement.getAttribute('data-theme'); if (a) return a; return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; }
  function setTheme(t) { document.documentElement.setAttribute('data-theme', t); try { localStorage.setItem(TKEY, t); } catch (e) {} document.querySelectorAll('.theme-btn').forEach(b => b.textContent = t === 'dark' ? '☀ Light' : '☾ Dark'); }
  function toggleTheme() { setTheme(currentTheme() === 'dark' ? 'light' : 'dark'); }
  try { const t = localStorage.getItem(TKEY); if (t) document.documentElement.setAttribute('data-theme', t); } catch (e) {}
  function themeButton() {
    const nav = document.querySelector('.topbar nav'); if (!nav) return;
    const b = document.createElement('button'); b.className = 'theme-btn'; b.type = 'button'; b.title = 'Switch light / dark';
    b.textContent = currentTheme() === 'dark' ? '☀ Light' : '☾ Dark'; b.onclick = toggleTheme; nav.appendChild(b);
  }

  /* Sessions: config.sessions compared with the clock in America/Chicago. A session is past once its end time passes. */
  const TZ = 'America/Chicago';
  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  function nowKey() { /* "YYYY-MM-DDTHH:MM" as read on a Chicago clock */
    try {
      const p = {}; new Intl.DateTimeFormat('en-US', { timeZone: TZ, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).formatToParts(new Date()).forEach(x => p[x.type] = x.value);
      return p.year + '-' + p.month + '-' + p.day + 'T' + (p.hour === '24' ? '00' : p.hour) + ':' + p.minute;
    } catch (e) { return new Date().toISOString().slice(0, 16); }
  }
  function ymd(s) { const a = String(s.date).split('-').map(Number); return { y: a[0], m: a[1], d: a[2], dow: new Date(Date.UTC(a[0], a[1] - 1, a[2])).getUTCDay() }; }
  function t12(t) { const a = String(t || '0:00').split(':').map(Number); let h = a[0]; const ap = h >= 12 ? 'p.m.' : 'a.m.'; h = h % 12 || 12; return { s: h + ':' + String(a[1] || 0).padStart(2, '0'), ap }; }
  function timeRange(s) { const a = t12(s.start), b = t12(s.end); return (a.ap === b.ap ? a.s : a.s + ' ' + a.ap) + '–' + b.s + ' ' + b.ap; }
  function longDate(s) { const o = ymd(s); return DAYS[o.dow] + ', ' + MONTHS[o.m - 1] + ' ' + o.d + ', ' + o.y; }
  function endKey(s) { return s.date + 'T' + (s.end || '23:59'); }
  function sessions() {
    const C = window.PW_CONFIG || {}; const now = nowKey();
    const all = (Array.isArray(C.sessions) ? C.sessions : []).filter(s => s && /^\d{4}-\d{2}-\d{2}$/.test(String(s.date)))
      .slice().sort((a, b) => endKey(a).localeCompare(endKey(b)));
    const past = all.filter(s => endKey(s) < now), upcoming = all.filter(s => !(endKey(s) < now));
    return { all, past, upcoming, next: upcoming[0] || null, now };
  }
  function sessionText(n) {
    const C = window.PW_CONFIG || {}; const teams = C.teamsUrl ? ' · Teams' : '';
    if (!n) return { long: 'Next workshop: TBD', weekday: 'Next workshop', datetime: 'TBD', date: 'TBD', time: 'TBD', doors: 'Date and room to be announced', where: '', wherex: '', day: 'TBD', month: 'Next', year: 'workshop', held: '' };
    const o = ymd(n), st = t12(n.start), date = MONTHS[o.m - 1] + ' ' + o.d + ', ' + o.y, room = n.room || '';
    return {
      long: longDate(n) + ' · ' + timeRange(n) + (n.doors ? ' (doors ' + n.doors + ')' : '') + (room ? ' · ' + room : ''),
      weekday: DAYS[o.dow], date, datetime: date + ' · ' + st.s + ' ' + st.ap, time: timeRange(n),
      doors: (n.doors ? 'Doors open ' + n.doors : '') + (C.teamsUrl ? (n.doors ? ' · ' : '') + 'or join on Teams' : ''),
      where: room, wherex: room + teams, day: String(o.d).padStart(2, '0'), month: MONTHS[o.m - 1], year: String(o.y),
      held: 'Held ' + longDate(n) + (room ? ' · ' + room : '')
    };
  }
  function renderSessions() {
    const S = sessions(), C = window.PW_CONFIG || {}, v = sessionText(S.next);
    document.querySelectorAll('[data-session]').forEach(el => { const k = el.getAttribute('data-session'); if (k in v) { el.textContent = v[k]; el.classList.toggle('tbd', !S.next); } });
    document.querySelectorAll('[data-when]').forEach(el => { const w = el.getAttribute('data-when'); el.hidden = w === 'upcoming' ? !S.next : !!S.next; });
    document.querySelectorAll('[data-past-list]').forEach(ul => { ul.innerHTML = S.past.slice().reverse().map(s => '<li>' + sessionText(s).held + '</li>').join(''); });
    document.querySelectorAll('[data-past]').forEach(el => { el.hidden = !S.past.length; });
    document.querySelectorAll('[data-year]').forEach(el => { el.textContent = S.now.slice(0, 4); });
    if (!S.next) document.querySelectorAll('[data-checkin]').forEach(el => {
      if (el.querySelector('.checkin-wait')) return;
      [...el.children].forEach(c => { c.hidden = true; });
      const m = document.createElement(el.getAttribute('data-checkin') === 'btn' ? 'span' : 'p'); m.className = 'checkin-wait'; m.textContent = 'Check-in opens at the next session'; el.appendChild(m);
    });
    /* Legacy single-event fields, derived so older pages and the handout export keep working */
    C.eventDate = S.next ? longDate(S.next) : 'Next workshop: TBD';
    C.eventTime = S.next ? timeRange(S.next) + (S.next.doors ? ' (doors ' + S.next.doors + ')' : '') : '';
    C.eventRoom = S.next ? (S.next.room || '') : '';
    return S;
  }
  function init() { renderSessions(); bindInputs(); document.querySelectorAll('[data-tally]').forEach(tally); themeButton(); }
  document.addEventListener('DOMContentLoaded', init);
  return { get, set, toast, copy, download, bindInputs, toggleTheme, setTheme, currentTheme, sessions, renderSessions, sessionText };
})();
