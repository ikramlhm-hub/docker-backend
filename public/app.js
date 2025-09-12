let jwt = null;
let currentUser = null;

async function fetchJson(url, opts = {}) {
  if (!opts.headers) opts.headers = {};
  if (jwt) opts.headers.Authorization = `Bearer ${jwt}`;
  opts.headers["Cache-Control"] = "no-cache"; // évite les 304

  const r = await fetch(url, opts);

  if (!r.ok) {
    const errText = await r.text();
    console.error(`❌ Erreur HTTP ${r.status} pour ${url}:`, errText);
    alert(`Erreur ${r.status} lors de l'appel à ${url}`);
    throw new Error(`HTTP ${r.status} - ${url}`);
  }

  try {
    return await r.json();
  } catch (err) {
    console.error("❌ Impossible de parser JSON:", err);
    return null;
  }
}

async function loadUsers() {
  const users = await fetchJson("/api/users");
  const sel = document.getElementById("userSelect");
  sel.innerHTML = "";
  users.forEach(u => {
    const o = document.createElement("option");
    o.value = u.email;
    o.textContent = `${u.firstname} ${u.lastname} — ${u.email}`;
    sel.appendChild(o);
  });
}

async function requestLogin() {
  const email = document.getElementById("userSelect").value;
  if (!email) return alert("Sélectionnez un utilisateur");

  const res = await fetchJson("/api/auth/request-login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  });

  if (res && res.token) {
    const token = prompt("Collez ici le token affiché par le backend :");
    if (token) await loginWithToken(token);
  } else {
    alert("Erreur lors de la demande de login");
  }
}

async function loginWithToken(token) {
  const res = await fetchJson(`/api/auth/login/${token}`, { method: "POST" });
  if (res && res.token) {
    jwt = res.token;
    currentUser = res.user;
    document.getElementById("me").textContent =
      `Connecté: ${currentUser.firstname} ${currentUser.lastname}`;
    document.getElementById("submitTrack").style.display = "block";
    await loadSessions();
  } else {
    alert(res?.error || "Erreur login");
  }
}

async function loadSessions() {
  const sessions = await fetchJson("/api/sessions");
  const sel = document.getElementById("sessionSelect");
  sel.innerHTML = "";

  if (!sessions || sessions.length === 0) {
    const o = document.createElement("option");
    o.value = "";
    o.textContent = "Aucune session disponible";
    sel.appendChild(o);
    return;
  }

  sessions.forEach(s => {
    const o = document.createElement("option");
    o.value = s.id;
    o.textContent = `${s.subject} — ${s.teacher || "?"} — ${s.classroom || ""}`;
    sel.appendChild(o);
  });
}

async function loadTracks() {
  const sessionId = document.getElementById("sessionSelect").value;
  if (!sessionId) {
    alert("Veuillez sélectionner une session");
    return;
  }

  const tracks = await fetchJson(`/api/tracks/session/${sessionId}`);
  if (!tracks) return;

  const tbody = document.querySelector("#tracksTable tbody");
  tbody.innerHTML = "";

  tracks.forEach(t => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${t.title}</td>
      <td>${t.artist}</td>
      <td>${t.submittedBy?.firstname || ""} ${t.submittedBy?.lastname || ""}</td>
      <td>${t.votesCount}</td>
      <td><button data-id="${t.id}">Voter</button></td>`;
    tbody.appendChild(tr);
  });

  // attach vote handlers
  tbody.querySelectorAll("button").forEach(b => {
    b.addEventListener("click", async (e) => {
      const id = e.target.dataset.id;
      const res = await fetchJson("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackId: id })
      });
      if (res?.error) alert(res.error);
      else loadTracks();
    });
  });
}

async function submitTrack() {
  const title = document.getElementById("title").value;
  const artist = document.getElementById("artist").value;
  const sessionId = document.getElementById("sessionSelect").value;

  if (!title || !artist) return alert("Titre et artiste requis");
  if (!sessionId) return alert("Veuillez sélectionner une session");

  const res = await fetchJson("/api/tracks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, title, artist })
  });

  if (res?.error) {
    alert(res.error);
    return;
  }

  document.getElementById("title").value = "";
  document.getElementById("artist").value = "";
  loadTracks();
}

// Bind
document.getElementById("btnLogin").addEventListener("click", requestLogin);
document.getElementById("loadTracks").addEventListener("click", loadTracks);
document.getElementById("submitTrackBtn").addEventListener("click", submitTrack);

// Initial load
loadUsers();
loadSessions();
