// ✅ Utilitaire Fetch JSON avec gestion des erreurs
async function fetchJson(url, opts = {}) {
  const r = await fetch(url, opts);
  if (!r.ok) throw new Error(`Erreur ${r.status}`);
  return r.json();
}

// 🧍 Charger la liste des utilisateurs au démarrage
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const users = await fetchJson("/api/users");
    const sel = document.getElementById("userSelect");
    sel.innerHTML = `<option value="">Sélectionnez votre compte</option>`; // reset propre

    users.forEach(u => {
      const o = document.createElement("option");
      o.value = u.email;
      o.textContent = `${u.firstname} ${u.lastname} — ${u.email}`;
      sel.appendChild(o);
    });
  } catch (err) {
    document.getElementById("error").textContent = "❌ Impossible de charger les utilisateurs.";
    console.error("Erreur chargement users:", err);
  }
});

// 🔐 Gestion de la connexion
document.getElementById("loginBtn").addEventListener("click", async () => {
  const email = document.getElementById("userSelect").value;
  const errorDiv = document.getElementById("error");
  errorDiv.textContent = "";

  if (!email) {
    errorDiv.textContent = "Veuillez sélectionner un utilisateur.";
    return;
  }

  try {
    // 1️⃣ Demander un token magique au backend
    const res = await fetchJson("/api/auth/request-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });

    if (!res.token) {
      errorDiv.textContent = "Erreur lors de la demande de connexion.";
      return;
    }

    // 2️⃣ En dev : on colle directement le token
    const token = prompt("Collez le token affiché par le backend :", res.token);
    if (!token) return;

    // 3️⃣ Vérifier le token
    const loginRes = await fetchJson(`/api/auth/login/${token}`, { method: "POST" });
    if (loginRes?.token) {
      localStorage.setItem("jwt", loginRes.token);
      localStorage.setItem("user", JSON.stringify(loginRes.user));
      window.location.href = "/index.html"; // ✅ redirection explicite vers la playlist
    } else {
      errorDiv.textContent = loginRes?.error || "Erreur de connexion.";
    }
  } catch (err) {
    console.error("Erreur login:", err);
    errorDiv.textContent = "Erreur lors de la connexion.";
  }
});
