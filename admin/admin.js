// Change ce mot de passe avant de publier l'admin.
const LOCAL_PASSWORD = "Nanabinta@60";

const loginCard = document.getElementById("loginCard");
const dashboard = document.getElementById("dashboard");
const localPassword = document.getElementById("localPassword");
const webAppUrl = document.getElementById("webAppUrl");
const adminToken = document.getElementById("adminToken");
const leadCount = document.getElementById("leadCount");
const lastProfile = document.getElementById("lastProfile");
const leadRows = document.getElementById("leadRows");

let leads = [];

function saveAdminSettings() {
  localStorage.setItem("schic_admin_url", webAppUrl.value.trim());
  localStorage.setItem("schic_admin_token", adminToken.value.trim());
  localStorage.setItem("schic_admin_logged", "true");
}

function loadAdminSettings() {
  webAppUrl.value = localStorage.getItem("schic_admin_url") || "";
  adminToken.value = localStorage.getItem("schic_admin_token") || "";
  if (localStorage.getItem("schic_admin_logged") === "true") showDashboard();
}

function showDashboard() {
  loginCard.classList.add("hidden");
  dashboard.classList.remove("hidden");
  fetchLeads();
}

document.getElementById("loginBtn").onclick = () => {
  if (localPassword.value !== LOCAL_PASSWORD) {
    alert("Mot de passe local incorrect.");
    return;
  }
  if (!webAppUrl.value.trim() || !adminToken.value.trim()) {
    alert("Ajoute le Web App URL et le token admin.");
    return;
  }
  saveAdminSettings();
  showDashboard();
};

document.getElementById("logoutBtn").onclick = () => {
  localStorage.removeItem("schic_admin_logged");
  dashboard.classList.add("hidden");
  loginCard.classList.remove("hidden");
};

document.getElementById("refreshBtn").onclick = fetchLeads;

async function fetchLeads() {
  const url = localStorage.getItem("schic_admin_url");
  const token = localStorage.getItem("schic_admin_token");
  if (!url || !token) return;

  try {
    const res = await fetch(`${url}?action=listLeads&adminToken=${encodeURIComponent(token)}`);
    const data = await res.json();
    if (!data.ok) {
      alert(data.error || "Erreur pendant le chargement.");
      return;
    }
    leads = data.leads || [];
    renderLeads();
  } catch (error) {
    alert("Impossible de charger les leads. Vérifie le Web App URL, le token admin et le déploiement Apps Script.");
    console.error(error);
  }
}

function renderLeads() {
  leadCount.textContent = leads.length;
  lastProfile.textContent = leads.length ? (leads[leads.length - 1].profile || "—") : "—";
  leadRows.innerHTML = "";

  leads.slice().reverse().forEach((lead) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${escapeHtml(lead.date || "")}</td>
      <td>${escapeHtml(lead.name || "")}</td>
      <td>${escapeHtml(lead.contact || "")}</td>
      <td>${escapeHtml(lead.country || "")}</td>
      <td>${escapeHtml(lead.profile || "")}</td>
      <td>${escapeHtml(String(lead.score || ""))}</td>
      <td>${escapeHtml(lead.priority || "")}</td>
    `;
    leadRows.appendChild(tr);
  });
}

document.getElementById("exportBtn").onclick = () => {
  if (!leads.length) {
    alert("Aucun lead à exporter.");
    return;
  }
  const headers = Object.keys(leads[0]);
  const csv = [
    headers.join(","),
    ...leads.map((lead) =>
      headers.map((h) => `"${String(lead[h] || "").replaceAll('"', '""')}"`).join(",")
    )
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "schicchat-leads.csv";
  link.click();
  URL.revokeObjectURL(url);
};

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

loadAdminSettings();
