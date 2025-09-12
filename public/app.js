let jwt = null;
let currentUser = null;


async function fetchJson(url, opts = {}) {
  opts.headers = opts.headers || {};
  opts.credentials = "include";
  if (!opts.headers["Content-Type"] && opts.body) opts.headers["Content-Type"] = "application/json";
  const r = await fetch(url, opts);
  return r.json();
}

async function checkAuthOnLoad() {
  const res = await fetchJson("/api/auth/me"); // cookie envoyé automatiquement
  if (res.user) {
    currentUser = res.user;
    document.getElementById("me").textContent = `Connecté: ${currentUser.firstname} ${currentUser.lastname}`;
    document.getElementById("submitTrack").style.display = "block";
  }
}

window.addEventListener("load", async () => {
  await loadUsers();    // si tu veux la liste
  await checkAuthOnLoad();
  await loadSessions();
});



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
    body: JSON.stringify({ email })
  });
  // en dev on reçoit le token dans la réponse et on le colle ensuite
  if (res.token) {
    const token = prompt("Token (collez le token renvoyé par le serveur) :", res.token);
    if (token) await loginWithToken(token);
  } else {
    alert("Erreur lors de la demande de login");
  }
}

async function loginWithToken(token) {
  // IMPORTANT: credentials included by fetchJson, server will set cookie
  const res = await fetchJson(`/api/auth/login/${token}`, { method: "POST" });
  if (res.user) {
    currentUser = res.user;
    document.getElementById("me").textContent = `Connecté: ${currentUser.firstname} ${currentUser.lastname}`;
    document.getElementById("submitTrack").style.display = "block";
  } else {
    alert(res.error || "Erreur login");
  }
}


async function login() {
  const email = document.getElementById("userSelect").value;
  const res = await fetchJson("/api/users/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  });
  if (res.token) {
    jwt = res.token;
    currentUser = res.user;
    document.getElementById("me").textContent = `Connecté: ${currentUser.firstname} ${currentUser.lastname}`;
    document.getElementById("submitTrack").style.display = "block";
    await loadSessions();
  } else alert("Erreur login");
}

async function logout() {
  await fetchJson("/api/users/logout", { method: "POST" });
  document.location.reload();
}

async function loadSessions() {
  const sessions = await fetchJson("/api/sessions");
  const sel = document.getElementById("sessionSelect");
  sel.innerHTML = "";
  sessions.forEach(s => {
    const o = document.createElement("option");
    o.value = s.id;
    o.textContent = `${s.subject} — ${s.teacher || "?"} — ${s.room || ""}`;
    sel.appendChild(o);
  });
}

async function loadTracks() {
  const sessionId = document.getElementById("sessionSelect").value;
  const tracks = await fetchJson(`/api/tracks/session/${sessionId}`);
  const tbody = document.querySelector("#tracksTable tbody");
  tbody.innerHTML = "";
  tracks.forEach(t => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${t.title}</td><td>${t.artist}</td><td>${t.submittedBy?.firstname || ""} ${t.submittedBy?.lastname || ""}</td><td>${t.votesCount}</td>
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
      if (res.error) alert(res.error);
      else loadTracks();
    });
  });
}

async function submitTrack() {
  const title = document.getElementById("title").value;
  const artist = document.getElementById("artist").value;
  const sessionId = document.getElementById("sessionSelect").value;
  if (!title || !artist) return alert("Titre et artiste requis");
  console.log({ sessionId, title, artist });
  const res = await fetchJson("/api/tracks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, title, artist })
  });
  console.log(res);
  document.getElementById("title").value = "";
  document.getElementById("artist").value = "";
  loadTracks();
}

// bind
document.getElementById("btnLogin").addEventListener("click", requestLogin);
document.getElementById("loadTracks").addEventListener("click", loadTracks);
document.getElementById("submitTrackBtn").addEventListener("click", submitTrack);

loadUsers();
loadSessions();