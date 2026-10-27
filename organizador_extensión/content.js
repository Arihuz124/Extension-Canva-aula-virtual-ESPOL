(async () => {
  if (location.pathname !== "/") return; // solo en el Tablero

  const store = {
    get: (k) => new Promise(r => chrome.storage.local.get(k, v => r(v[k]))),
    set: (k, v) => chrome.storage.local.set({ [k]: v })
  };

  let colors = (await store.get("colors")) || {};
  let hiddenIds = new Set((await store.get("hiddenIds")) || []);
  let showHiddenList = (await store.get("showHiddenList")) || false;
  const selected = new Set(); // varias materias a la vez
  let courses = [];

  const palette = ["#e74c3c","#3498db","#27ae60","#f39c12","#9b59b6","#16a085","#e67e22","#34495e"];

  try {
    const res = await fetch("/api/v1/courses?enrollment_state=active&per_page=100", { credentials: "same-origin" });
    const text = (await res.text()).replace(/^while\(1\);/, "");
    courses = JSON.parse(text).filter(c => c.name);
  } catch (e) { console.error("Organizador: no pude cargar cursos", e); return; }

  courses.forEach((c, i) => { if (!colors[c.id]) colors[c.id] = palette[i % palette.length]; });
  store.set("colors", colors);

  const EYE_OPEN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>';
  const EYE_CLOSED = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.9 10.9 0 0 1 12 19C5 19 1 12 1 12a18.5 18.5 0 0 1 5.06-5.94M9.9 4.24A9.1 9.1 0 0 1 12 5c7 0 11 7 11 7a18.5 18.5 0 0 1-2.16 3.19M14.12 14.12a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';

  // ----- UI -----
  const tab = document.createElement("button");
  tab.id = "oe-tab"; tab.textContent = "Mis materias";
  const panel = document.createElement("div");
  panel.id = "oe-panel";
  document.body.append(panel, tab);
  tab.onclick = () => panel.classList.toggle("oe-hidden");

  const cleanName = c => c.name.replace(/\s*-\s*II? ?PAO.*$/i, "");

  function toggleHidden(id) {
    if (hiddenIds.has(id)) hiddenIds.delete(id);
    else { hiddenIds.add(id); selected.delete(id); }
    store.set("hiddenIds", [...hiddenIds]);
    renderPanel(); apply();
  }

  function eyeButton(c, isHidden) {
    const b = document.createElement("button");
    b.className = "oe-eye";
    b.title = isHidden ? "Mostrar materia" : "Ocultar materia";
    b.innerHTML = isHidden ? EYE_CLOSED : EYE_OPEN;
    b.onclick = e => { e.stopPropagation(); toggleHidden(c.id); };
    return b;
  }

  function colorInput(c) {
    const input = document.createElement("input");
    input.type = "color"; input.value = colors[c.id];
    input.onclick = e => e.stopPropagation();
    input.oninput = () => { colors[c.id] = input.value; store.set("colors", colors); apply(); };
    return input;
  }

  function renderPanel() {
        panel.innerHTML = '<div id="oe-counter">' + (panel.dataset.txt || "") + '</div><h3>Mis materias</h3>';

    const all = document.createElement("div");
    all.className = "oe-row oe-all" + (selected.size === 0 ? " oe-active" : "");
    all.innerHTML = '<input type="color"><span>Todas</span>';
    all.onclick = () => { selected.clear(); renderPanel(); apply(); };
    panel.appendChild(all);

    const visible = courses.filter(c => !hiddenIds.has(c.id));
    const hidden = courses.filter(c => hiddenIds.has(c.id));

    visible.forEach(c => {
      const row = document.createElement("div");
      row.className = "oe-row" + (selected.has(c.id) ? " oe-active" : "");
      const name = document.createElement("span");
      name.textContent = cleanName(c);
      row.append(colorInput(c), name, eyeButton(c, false));
      row.onclick = () => {
        selected.has(c.id) ? selected.delete(c.id) : selected.add(c.id);
        renderPanel(); apply();
      };
      panel.appendChild(row);
    });

    if (hidden.length) {
      const toggle = document.createElement("div");
      toggle.className = "oe-hidden-toggle";
      toggle.innerHTML = `<span>Ocultos (${hidden.length})</span><span>${showHiddenList ? "▲" : "▼"}</span>`;
      toggle.onclick = () => { showHiddenList = !showHiddenList; store.set("showHiddenList", showHiddenList); renderPanel(); };
      panel.appendChild(toggle);

      if (showHiddenList) {
        const list = document.createElement("div");
        list.className = "oe-hidden-list";
        hidden.forEach(c => {
          const row = document.createElement("div");
          row.className = "oe-row";
          const name = document.createElement("span");
          name.textContent = cleanName(c);
          row.append(name, eyeButton(c, true));
          list.appendChild(row);
        });
        panel.appendChild(list);
      }
    }
  }

  // ----- Filtro y color -----
  const norm = s => (s || "").toUpperCase().replace(/\s+/g, " ");

  function courseOf(el) {
    const a = el.querySelector('a[href*="/courses/"]');
    if (a) {
      const m = a.getAttribute("href").match(/\/courses\/(\d+)/);
      if (m) return courses.find(c => String(c.id) === m[1]);
    }
    const txt = norm(el.textContent);
    return courses.find(c => txt.includes(norm(c.name)));
  }

  function apply() {
    const items = document.querySelectorAll('[class*="PlannerItem-styles__root"], [class*="CompletedItemsFacade"]');
    items.forEach(el => {
      const wrap = el.closest("li") || el;
      const c = courseOf(el);
      if (c) {
        el.style.borderLeft = "8px solid " + colors[c.id];
        el.style.background = colors[c.id] + "1f";
      }
      const hideIt =
        (c && hiddenIds.has(c.id)) ||
        (selected.size > 0 && (!c || !selected.has(c.id)));
      wrap.classList.toggle("oe-hide", hideIt);
    });
        let pending = 0;
    items.forEach(el => {
      const box = el.querySelector('input[type="checkbox"]');
      const wrap = el.closest("li") || el;
      if (box && !box.checked && !wrap.classList.contains("oe-hide")) pending++;
    });
    const txt = pending === 1 ? "Hay 1 tarea pendiente" : `Hay ${pending} tareas pendientes`;
    panel.dataset.txt = txt;
    const counter = document.getElementById("oe-counter");
    if (counter) counter.textContent = txt;
  }
  // crear bucle para "ver mas" de tareas
  renderPanel();
  let t;
  new MutationObserver(() => { clearTimeout(t); t = setTimeout(apply, 250); })
    .observe(document.body, { childList: true, subtree: true });
  apply();
    (async () => {
    const MAX_CLICKS = 5;
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    const findBtn = () => [...document.querySelectorAll("button")]
      .find(b => /cargar más/i.test(b.textContent));
    for (let i = 0; i < MAX_CLICKS; i++) {
      let btn = null;
      for (let w = 0; w < 10 && !(btn = findBtn()); w++) await sleep(500);
      if (!btn) break;
      btn.click();
      await sleep(1500);
    }
  })();
})();
