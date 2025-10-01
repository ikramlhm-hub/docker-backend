let jwt = null;
let currentUser = null;
let allTracks = [];
let votingOpen = false;

/* 🔐 Vérification login */
document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("jwt");
  const user = localStorage.getItem("user");
  if (!token || !user) {
    window.location.href = "/login.html";
    return;
  }
  jwt = token;
  currentUser = JSON.parse(user);

  initTimer();
  loadSessions();
});

/* 🚪 Déconnexion */
document.getElementById("logout").addEventListener("click", () => {
  localStorage.removeItem("jwt");
  localStorage.removeItem("user");
  window.location.href = "/login.html";
});

/* 📡 Utilitaire fetch JSON */
async function fetchJson(url, opts = {}) {
  if (!opts.headers) opts.headers = {};
  if (jwt) opts.headers.Authorization = `Bearer ${jwt}`;
  opts.headers["Cache-Control"] = "no-cache";

  const r = await fetch(url, opts);
  if (!r.ok) throw new Error(`Erreur ${r.status}`);
  return r.json();
}

/* 📅 Charger les sessions du jour */
async function loadSessions() {
  const sessions = await fetchJson("/api/sessions");
  const today = new Date().toISOString().slice(0, 10);
  const todaySessions = sessions.filter(s => s.date.startsWith(today));

  const sel = document.getElementById("sessionSelect");
  sel.innerHTML = "";
  if (todaySessions.length === 0) {
    const o = document.createElement("option");
    o.textContent = "Aucune session aujourd'hui";
    o.disabled = true;
    sel.appendChild(o);
    return;
  }

  todaySessions.forEach(s => {
    const o = document.createElement("option");
    o.value = s.id;
    o.textContent = `${s.subject} (${s.classroom})`;
    sel.appendChild(o);
  });

  sel.addEventListener("change", loadTracks);
  sel.value = todaySessions[0].id;
  loadTracks();
}

/* 🎶 Charger les morceaux d'une session */
async function loadTracks() {
  const sessionId = document.getElementById("sessionSelect").value;
  if (!sessionId) return;
  const tracks = await fetchJson(`/api/tracks/session/${sessionId}`);
  allTracks = tracks;
  renderTracks(tracks);
}

/* 📝 Rendu des morceaux dans la grille */
function renderTracks(tracks) {
  const grid = document.getElementById("trackGrid");
  grid.innerHTML = "";

  const query = document.getElementById("searchInput").value.toLowerCase();
  tracks
    .filter(t =>
      t.title.toLowerCase().includes(query) ||
      t.artist.toLowerCase().includes(query)
    )
    .forEach(t => {
      const div = document.createElement("div");
      div.className = "track";
      div.innerHTML = `
        <div class="title">"${t.title}"<br><span>${t.artist}</span></div>
        <div class="vote">
          <button class="like" data-id="${t.id}" ${votingOpen ? "" : "disabled"}>👍</button>
          <span class="count">${t.votesCount}</span>
        </div>
      `;
      div.querySelector(".like").addEventListener("click", async () => {
        if (!votingOpen) return;
        await voteTrack(t.id);
      });
      grid.appendChild(div);
    });
}

/* 🗳️ Voter pour un morceau */
async function voteTrack(trackId) {
  try {
    await fetchJson("/api/votes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trackId })
    });
    loadTracks();
  } catch (err) {
    console.error("Erreur lors du vote:", err);
  }
}

/* ➕ Soumettre un morceau */
document.getElementById("submitTrackBtn").addEventListener("click", async () => {
  const title = document.getElementById("title").value.trim();
  const artist = document.getElementById("artist").value.trim();
  const sessionId = document.getElementById("sessionSelect").value;

  if (!title || !artist) {
    alert("Veuillez remplir tous les champs");
    return;
  }

  await fetchJson("/api/tracks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, title, artist })
  });

  document.getElementById("title").value = "";
  document.getElementById("artist").value = "";
  loadTracks();
});

/* 🔍 Recherche en direct */
document.getElementById("searchInput").addEventListener("input", () => {
  renderTracks(allTracks);
});

/* ⏰ Timer de votes (9h–12h / 14h–17h) */
function initTimer() {
  const timerDiv = document.getElementById("timer");

  function updateTimer() {
    const now = new Date();
    const morningStart = new Date(); morningStart.setHours(9, 0, 0, 0);
    const morningEnd = new Date(); morningEnd.setHours(12, 0, 0, 0);
    const afternoonStart = new Date(); afternoonStart.setHours(14, 0, 0, 0);
    const afternoonEnd = new Date(); afternoonEnd.setHours(17, 0, 0, 0);

    let remaining = null;
    if (now >= morningStart && now <= morningEnd) {
      remaining = morningEnd - now;
      votingOpen = true;
    } else if (now >= afternoonStart && now <= afternoonEnd) {
      remaining = afternoonEnd - now;
      votingOpen = true;
    } else {
      votingOpen = false;
    }

    if (remaining !== null) {
      const hrs = Math.floor(remaining / 3600000);
      const mins = Math.floor((remaining % 3600000) / 60000);
      const secs = Math.floor((remaining % 60000) / 1000);
      timerDiv.textContent = `${hrs.toString().padStart(2,"0")}:${mins.toString().padStart(2,"0")}:${secs.toString().padStart(2,"0")}`;
    } else {
      timerDiv.textContent = "--:--";
    }
  }

  updateTimer();
  setInterval(updateTimer, 1000);
}
