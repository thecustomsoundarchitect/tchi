// ---------------------------------------------------------------
// Settings awaiting Tammy's decisions. Each is a one-line change.
// ---------------------------------------------------------------
// Question 2: how many separate days a move must be completed
// before it counts as passed. 1 = timer finished once.
const PASS_DAYS_REQUIRED = 1;

// Question 3 and 6: phone numbers for the one-tap group text.
// Example: "+14165550111,+14165550222". Empty string still works:
// Messages opens with the note written and Mom picks the recipients.
const FAMILY_PHONES = "";

// Question 1: image source per move. "thumbnail" shows the real
// still from that move's verified video. Swappable for art files.
const IMAGE_MODE = "thumbnail";

const STORE_KEY = "taichi.v1";

// ------------------------- state ------------------------------
function load() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY)) || { passes: {}, days: [] }; }
  catch (e) { return { passes: {}, days: [] }; }
}
function save(state) { localStorage.setItem(STORE_KEY, JSON.stringify(state)); }
let state = load();

function todayStr() {
  const d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}
function passCount(moveId) { return (state.passes[moveId] || []).length; }
function movePassed(move) { return passCount(move.id) >= PASS_DAYS_REQUIRED; }
function weekPassed(weekData) { return weekData.moves.every(movePassed); }
function currentWeek() {
  for (const w of PROGRAM) { if (!weekPassed(w)) return w; }
  return PROGRAM[PROGRAM.length - 1];
}
function weekUnlocked(weekData) {
  const idx = PROGRAM.indexOf(weekData);
  return idx === 0 || weekPassed(PROGRAM[idx - 1]);
}
function doneToday(move) { return (state.passes[move.id] || []).includes(todayStr()); }
function recordPass(move) {
  const list = state.passes[move.id] || (state.passes[move.id] = []);
  if (!list.includes(todayStr())) list.push(todayStr());
  save(state);
}
function dayCompletedToday() { return state.days.some(d => d.date === todayStr()); }
function recordDay(weekNum) {
  if (!dayCompletedToday()) { state.days.push({ date: todayStr(), week: weekNum }); save(state); }
}

// ---------------------- watercolor flowers ---------------------
const FLOWER_PALETTES = [
  ["#E8A0B4", "#A33E60"], ["#C3A8D8", "#6D3A6B"], ["#F2C09A", "#B96A3B"],
  ["#A8C8B0", "#4C7A57"], ["#E8B8C8", "#8E4468"]
];
function flowerSVG(seed, size) {
  const [petal, heart] = FLOWER_PALETTES[seed % FLOWER_PALETTES.length];
  let petals = "";
  for (let i = 0; i < 6; i++) {
    petals += `<ellipse cx="50" cy="26" rx="13" ry="22" fill="${petal}" fill-opacity="0.75" transform="rotate(${i * 60} 50 50)"/>`;
  }
  return `<svg viewBox="0 0 100 100" width="${size}" height="${size}" role="img" aria-label="Flower">
    ${petals}<circle cx="50" cy="50" r="11" fill="${heart}" fill-opacity="0.9"/></svg>`;
}

// ------------------------- screens -----------------------------
const screens = ["today", "practice", "reward", "garden", "library"];
function show(name) {
  for (const s of screens) document.getElementById("screen-" + s).hidden = (s !== name);
  window.scrollTo(0, 0);
  if (name === "today") renderToday();
  if (name === "garden") renderGarden();
  if (name === "library") renderLibrary();
}
document.querySelectorAll("[data-go]").forEach(el => {
  el.addEventListener("click", () => { stopTimer(); show(el.dataset.go); });
});

// ------------------------- today -------------------------------
function renderToday() {
  const week = currentWeek();
  document.getElementById("today-date").textContent =
    new Date().toLocaleDateString("en-CA", { weekday: "long", month: "long", day: "numeric" });
  const status = document.getElementById("today-status");
  const detail = document.getElementById("today-detail");
  const btn = document.getElementById("btn-start");
  if (dayCompletedToday()) {
    status.textContent = "Today's practice is complete.";
    btn.textContent = "Practice again, just for joy";
    detail.textContent = "Anything extra today is a bonus.";
  } else {
    status.textContent = `Week ${week.week}: ${week.title}`;
    btn.textContent = "Start today's practice";
    const mins = Math.round(week.moves.reduce((s, m) => s + m.duration, 0) / 60);
    detail.textContent = `${week.moves.length} gentle moves, about ${mins} minutes.`;
  }
  const mini = document.getElementById("garden-mini");
  const weekDays = state.days.filter(d => d.week === week.week);
  let html = "";
  for (let i = 0; i < 7; i++) {
    html += i < weekDays.length ? flowerSVG(i, 52) : '<span class="bloom-empty"></span>';
  }
  mini.innerHTML = html;
}

// ------------------------ practice -----------------------------
let session = null; // { moves, index, singleMove }
let timer = null;   // { remaining, total, handle, running }
let wakeLock = null;

document.getElementById("btn-start").addEventListener("click", () => {
  const week = currentWeek();
  let startIdx = week.moves.findIndex(m => !doneToday(m));
  if (startIdx < 0 || dayCompletedToday()) startIdx = 0;
  session = { moves: week.moves, index: startIdx, weekNum: week.week, singleMove: false };
  show("practice");
  renderMove();
});

function renderMove() {
  const move = session.moves[session.index];
  document.getElementById("practice-progress").textContent =
    session.singleMove ? move.name : `Move ${session.index + 1} of ${session.moves.length}`;
  document.getElementById("move-name").textContent = move.name;
  const img = document.getElementById("move-image");
  img.src = IMAGE_MODE === "thumbnail" ? `https://i.ytimg.com/vi/${move.video}/hqdefault.jpg` : `img/${move.id}.jpg`;
  img.alt = "Demonstration of " + move.name;
  const steps = document.getElementById("move-steps");
  steps.innerHTML = move.steps.map(s => `<li>${s}</li>`).join("");
  const vid = document.getElementById("btn-video");
  vid.href = `https://www.youtube.com/watch?v=${move.video}`;
  vid.textContent = "Watch the video for this move";
  setupTimer(move.duration);
  document.getElementById("move-done-overlay").hidden = true;
}

const RING_LEN = 2 * Math.PI * 88;
function paintTimer() {
  const mm = Math.floor(timer.remaining / 60);
  const ss = String(timer.remaining % 60).padStart(2, "0");
  document.getElementById("timer-text").textContent = `${mm}:${ss}`;
  const ring = document.getElementById("ring-fill");
  ring.style.strokeDasharray = RING_LEN;
  ring.style.strokeDashoffset = RING_LEN * (1 - timer.remaining / timer.total);
}
function setupTimer(seconds) {
  stopTimer();
  timer = { remaining: seconds, total: seconds, handle: null, running: false };
  document.getElementById("btn-timer").textContent = "Start the timer";
  paintTimer();
}
function stopTimer() {
  if (timer && timer.handle) clearInterval(timer.handle);
  if (timer) timer.running = false;
  if (wakeLock) { wakeLock.release().catch(() => {}); wakeLock = null; }
}
document.getElementById("btn-timer").addEventListener("click", async () => {
  if (!timer) return;
  if (timer.running) {
    stopTimer();
    document.getElementById("btn-timer").textContent = "Keep going";
    return;
  }
  timer.running = true;
  document.getElementById("btn-timer").textContent = "Pause";
  try { if (navigator.wakeLock) wakeLock = await navigator.wakeLock.request("screen"); } catch (e) {}
  timer.handle = setInterval(() => {
    timer.remaining -= 1;
    paintTimer();
    if (timer.remaining <= 0) { stopTimer(); moveFinished(); }
  }, 1000);
});

function chime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [523.25, 659.25].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = freq;
      osc.connect(gain); gain.connect(ctx.destination);
      const t = ctx.currentTime + i * 0.35;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.25, t + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.1);
      osc.start(t); osc.stop(t + 1.2);
    });
  } catch (e) {}
}

let advanceHandle = null;
function moveFinished() {
  const move = session.moves[session.index];
  recordPass(move);
  chime();
  document.getElementById("move-done-overlay").hidden = false;
  const last = session.singleMove || session.index >= session.moves.length - 1;
  document.getElementById("btn-next-move").textContent = last ? "Finish" : "Next move";
  advanceHandle = setTimeout(advance, 3500);
}
document.getElementById("btn-next-move").addEventListener("click", advance);
function advance() {
  if (advanceHandle) { clearTimeout(advanceHandle); advanceHandle = null; }
  const overlay = document.getElementById("move-done-overlay");
  if (overlay.hidden) return;
  overlay.hidden = true;
  if (session.singleMove) { show("library"); return; }
  if (session.index >= session.moves.length - 1) {
    recordDay(session.weekNum);
    renderReward();
    show("reward");
  } else {
    session.index += 1;
    renderMove();
  }
}

// ------------------------- reward ------------------------------
function renderReward() {
  const total = state.days.length;
  document.getElementById("reward-line").textContent =
    `Day ${total} finished. Week ${session.weekNum}, done beautifully.`;
  document.getElementById("reward-flower").innerHTML = flowerSVG(total, 150);
  const msg = encodeURIComponent(
    `Mom here. I just finished day ${total} of my tai chi (Week ${session.weekNum}). Feeling proud of myself.`);
  document.getElementById("btn-sms").href = `sms:${FAMILY_PHONES}?&body=${msg}`;
}

// ------------------------- garden ------------------------------
function renderGarden() {
  const wrap = document.getElementById("garden-beds");
  wrap.innerHTML = "";
  PROGRAM.forEach((weekData, wi) => {
    const unlocked = weekUnlocked(weekData);
    const days = state.days.filter(d => d.week === weekData.week);
    const passedMoves = weekData.moves.filter(movePassed).length;
    const bed = document.createElement("div");
    bed.className = "garden-bed" + (unlocked ? "" : " locked");
    let inner = `<div class="bed-title"><h2>Week ${weekData.week}: ${weekData.title}</h2>` +
      `<span class="count">${passedMoves} of ${weekData.moves.length} moves passed</span></div>`;
    if (unlocked) {
      inner += '<div class="garden-row">';
      for (let i = 0; i < Math.max(days.length, 1); i++) {
        inner += i < days.length ? flowerSVG(wi * 3 + i, 52) : '<span class="bloom-empty"></span>';
      }
      inner += "</div>";
    } else {
      inner += `<p class="bed-locked-note">Finish Week ${weekData.week - 1} to open this bed.</p>`;
    }
    bed.innerHTML = inner;
    wrap.appendChild(bed);
  });
}

// ------------------------- library -----------------------------
function renderLibrary() {
  const wrap = document.getElementById("library-list");
  wrap.innerHTML = "";
  PROGRAM.filter(weekUnlocked).forEach(weekData => {
    const h = document.createElement("h2");
    h.className = "lib-week-title";
    h.textContent = `Week ${weekData.week}: ${weekData.title}`;
    wrap.appendChild(h);
    weekData.moves.forEach(move => {
      const b = document.createElement("button");
      b.className = "lib-move";
      b.innerHTML = `<span>${move.name}</span>` +
        (movePassed(move) ? '<span class="passed">Passed</span>' : "");
      b.addEventListener("click", () => {
        session = { moves: [move], index: 0, weekNum: weekData.week, singleMove: true };
        show("practice");
        renderMove();
      });
      wrap.appendChild(b);
    });
  });
}

// ------------------------- boot --------------------------------
show("today");
