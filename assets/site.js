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
  function init() { bindInputs(); document.querySelectorAll('[data-tally]').forEach(tally); themeButton(); }
  document.addEventListener('DOMContentLoaded', init);
  return { get, set, toast, copy, download, bindInputs, toggleTheme, setTheme, currentTheme };
})();
