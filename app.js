const events = [
  ["333","3x3x3 Cube"],["222","2x2x2 Cube"],["444","4x4x4 Cube"],["555","5x5x5 Cube"],["666","6x6x6 Cube"],["777","7x7x7 Cube"],
  ["333bf","3x3x3 Blindfolded"],["333fm","3x3x3 Fewest Moves"],["333oh","3x3x3 One-Handed"],["clock","Clock"],["minx","Megaminx"],
  ["pyram","Pyraminx"],["skewb","Skewb"],["sq1","Square-1"],["444bf","4x4x4 Blindfolded"],["555bf","5x5x5 Blindfolded"],["333mbf","3x3x3 Multi-Blind"],["fto","Face-Turning Octahedron"]
];
const app = document.querySelector("#app"), storeKey = "dh-recons";
const getEntries = () => JSON.parse(localStorage.getItem(storeKey) || "[]");
const setEntries = entries => localStorage.setItem(storeKey, JSON.stringify(entries));
const eventName = id => events.find(e => e[0] === id)?.[1] || "Event";
function tps(time, moves) { const seconds = Number(String(time).replace(/[^0-9.]/g, "")); return seconds && moves ? (moves / seconds).toFixed(2) : "—"; }
function home() { app.innerHTML = '<div class="event-grid">' + events.map(([id,name]) => '<button class="event" data-event="' + id + '">' + name + '</button>').join("") + '</div>'; app.querySelectorAll("[data-event]").forEach(b => b.onclick = () => location.hash = "#/event/" + b.dataset.event); }
function list(id) {
  const name = eventName(id), entries = getEntries().filter(x => x.event === id);
  app.innerHTML = `<a class="back" href="#/">← Events</a><div class="event-title"><h1>${name}</h1></div>` + (entries.length ? '<div class="table-wrap"><table><thead><tr><th>Solver name</th><th>Time</th><th>Move count</th><th>TPS</th><th>Method</th><th>Date</th><th>Competition</th></tr></thead><tbody>' + entries.map(x => `<tr data-id="${x.id}"><td>${escapeHtml(x.solver)}</td><td>${escapeHtml(x.time)}</td><td>${x.moves}</td><td>${tps(x.time,x.moves)}</td><td>${escapeHtml(x.method)}</td><td>${x.date}</td><td>${escapeHtml(x.competition)}</td></tr>`).join("") + '</tbody></table></div>' : '<p class="empty">No reconstructions yet.</p>');
  app.querySelectorAll("[data-id]").forEach(row => row.onclick = () => location.hash = "#/recon/" + row.dataset.id);
}
function decodeCubingNotation(value) { return (value || "").replaceAll("_", " ").replaceAll("-", "'").replace(/\s+/g, " ").trim(); }
function extractCubingLink(link) {
  try {
    const url = new URL(link);
    if (url.hostname !== "alg.cubing.net") return null;
    return { scramble:decodeCubingNotation(url.searchParams.get("setup")), recon:decodeCubingNotation(url.searchParams.get("alg")) };
  } catch { return null; }
}
function form(id) { const template = document.querySelector("#entry-template").content.cloneNode(true); app.innerHTML = `<a class="back" href="#/event/${id}">← ${eventName(id)}</a><div class="entry"><h1>New recon</h1></div>`; app.querySelector(".entry").append(template); const form = app.querySelector("form"), source = form.elements.source; source.onchange = () => { const parsed = extractCubingLink(source.value); if (parsed) { form.elements.scramble.value = parsed.scramble; form.elements.recon.value = parsed.recon; } }; form.querySelector(".cancel").onclick = () => location.hash = "#/event/" + id; form.onsubmit = e => { e.preventDefault(); const d = Object.fromEntries(new FormData(form)), entries = getEntries(); entries.push({ ...d, id:crypto.randomUUID(), event:id, moves:Number(d.moves) }); setEntries(entries); location.hash = "#/event/" + id; }; }
function recon(id) { const x = getEntries().find(entry => entry.id === id); if (!x) return home(); app.innerHTML = `<a class="back" href="#/event/${x.event}">← ${eventName(x.event)}</a><article class="entry"><h1>${escapeHtml(x.solver)}</h1><div class="meta"><div><strong>${escapeHtml(x.time)}</strong>Time</div><div><strong>${x.moves}</strong>Move count</div><div><strong>${tps(x.time,x.moves)}</strong>TPS</div><div><strong>${escapeHtml(x.method)}</strong>Method</div><div><strong>${x.date}</strong>Date</div><div><strong>${escapeHtml(x.competition)}</strong>Competition</div></div>${x.scramble ? '<section class="block"><h2>Scramble</h2><pre>' + escapeHtml(x.scramble) + '</pre></section>' : ''}<section class="block"><h2>Recon</h2><pre>${escapeHtml(x.recon)}</pre></section><section class="block"><a href="${escapeAttr(x.source)}" target="_blank" rel="noreferrer">Alpha Cubing</a></section></article>`; }
function escapeHtml(v) { const d=document.createElement("div"); d.textContent=v || ""; return d.innerHTML; } function escapeAttr(v) { return String(v || "").replace(/"/g, "&quot;"); }
function route() { const p=location.hash.slice(2).split("/"); if(p[0] === "event") list(p[1]); else if(p[0] === "recon") recon(p[1]); else home(); } addEventListener("hashchange",route); route();

