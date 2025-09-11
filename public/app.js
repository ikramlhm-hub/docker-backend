let jwt = null;
let currentUser = null;


async function fetchJson(url, opts={}) {
  if (!opts.headers) opts.headers = {};
  if (jwt) opts.headers.Authorization = `Bearer ${jwt}`;
  const r = await fetch(url, opts);
  return r.json();
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
  const res = await fetchJson("/api/tracks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, title, artist })
  });
  document.getElementById("title").value = "";
  document.getElementById("artist").value = "";
  loadTracks();
}

// bind
document.getElementById("btnLogin").addEventListener("click", login);
document.getElementById("loadTracks").addEventListener("click", loadTracks);
document.getElementById("submitTrackBtn").addEventListener("click", submitTrack);

loadUsers();
loadSessions();