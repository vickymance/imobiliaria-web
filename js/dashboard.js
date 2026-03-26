import { api } from "./api.js";
let user = null;

try {
  const storedUser = localStorage.getItem("user");
  user = storedUser ? JSON.parse(storedUser) : null;
} catch (e) {
  console.warn("Erro ao ler user do localStorage");
  user = null;
}

const isClient = user?.role === "client";

// ===============================
// INIT
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  const title = document.getElementById("dashboardTitle");

  if (title) {
    title.innerText =
      isClient ? "VMR Consultoria Imobiliária" : "Plataforma do Corretor";
  }

  if (isClient) {
  const propertiesSection = document.getElementById("propertiesSection");
  const clientsSection = document.getElementById("clientsSection");

  if (propertiesSection) propertiesSection.style.display = "block";
  if (clientsSection) clientsSection.style.display = "none";
}

  applyUserView();
  loadProperties();
});

// ===============================
// AJUSTE DE VIEW (CLIENTE vs CORRETOR)
// ===============================
function applyUserView() {
  const title = document.getElementById("dashboardTitle");
  const subtitle = document.getElementById("dashboardSubtitle");
  const clientsTab = document.getElementById("clientsTab");
  const createBtn = document.getElementById("createPropertyBtn");
  const tabProperties = document.getElementById("tabProperties");
  const listBtn = document.querySelector(".button.is-primary");
  const listPropertiesBtn = document.querySelector("button[onclick='loadProperties()']");

  // título
  if (title) {
    title.innerText = isClient
      ? "VRM Consultoria Imobiliária"
      : "Plataforma do Corretor";
  }

  // subtítulo
  if (subtitle) {
    subtitle.innerText = isClient
      ? "Explore nossos imóveis"
      : "Gerencie os imóveis disponíveis no sistema.";
  }

  // esconder aba clientes
  if (isClient && clientsTab) {
    clientsTab.style.display = "none";
  }

  // esconder botão criar imóvel
  if (isClient && createBtn) {
    createBtn.style.display = "none";
  }
// esconder aba de imóveis
  if (isClient && tabProperties) {
  tabProperties.style.display = "none";
}
// esconde o botão de listar imóveis
if (isClient && listBtn) {
  listBtn.style.display = "none";
}
// mostra os cards de imóveis diretamente
if (isClient && listPropertiesBtn) {
  listPropertiesBtn.style.display = "none";
}
}

// ===============================
// CARREGAR IMÓVEIS
// ===============================
async function loadProperties() {
  try {
    const properties = await api.get("/properties");

    renderProperties(properties);
  } catch (error) {
    console.error("Erro ao carregar imóveis:", error);
  }
}

// ===============================
// RENDERIZAR LISTA
// ===============================
function renderProperties(properties) {
 const container = document.getElementById("propertiesList");

  if (!container) return;

  container.innerHTML = "";

  properties.forEach((property) => {
    const card = createPropertyCard(property);
    container.appendChild(card);
  });
}

// ===============================
// CRIAR CARD DE IMÓVEL
// ===============================
function createPropertyCard(property) {
  const div = document.createElement("div");
  div.className = "column is-one-third";

  // imagem
  const image =
    property.images && property.images.length > 0
      ? property.images[0]
      : "https://via.placeholder.com/300";

  // tipo
  const type = property.type || "Imóvel";

  // localização
  const city = property.city || "-";
  const neighborhood = property.neighborhood || "-";

  // detalhes (sem undefined)
  const details = [];

  if (property.bedrooms) details.push(`${property.bedrooms} quartos`);
  if (property.size) details.push(`${property.size} m²`);

  const info =
    details.length > 0
      ? details.join(" • ")
      : "Informações não disponíveis";

  // preço formatado
  const price = property.price
    ? formatCurrency(property.price)
    : "-";

  div.innerHTML = `
    <div class="card">
      <div class="card-image">
        <figure class="image is-4by3">
          <img src="${image}" alt="Imagem do imóvel">
        </figure>
      </div>

      <div class="card-content">
        <p class="title is-5">${type}</p>

        <p class="subtitle is-6">
          ${neighborhood} - ${city}
        </p>

        <p class="is-size-7 has-text-grey">
          ${info}
        </p>

        <p class="has-text-success has-text-weight-bold mt-2">
          ${price}
        </p>

        <button class="button is-link is-fullwidth mt-3"
          onclick="goToProperty(${property.id})">
          Ver detalhes
        </button>
      </div>
    </div>
  `;

  return div;
}

// ===============================
// FORMATAR MOEDA
// ===============================
function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

// ===============================
// IR PARA DETALHE DO IMÓVEL
// ===============================
window.goToProperty = function (id) {
  window.location.href = `property.html?id=${id}`;
};

// ===============================
// LOGOUT
// ===============================
window.logout = function () {
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  window.location.href = "index.html";
};

// ===============================
// AJUSTES VISUAIS POR PERFIL
// ===============================

(function () {
  const user = JSON.parse(localStorage.getItem("user"));
const isClient = user?.role === "client";

if (isClient) {
  // 🔥 Remove aba Clientes
  const tabClients = document.getElementById("tabClients");
  if (tabClients) tabClients.remove();
}

if (isClient) {
  const btn = document.querySelector("button.is-success");
  if (btn) btn.remove();
}

    // 🔥 Remove botão cadastrar imóvel
    const createBtn = document.querySelector("button[onclick='openCreatePropertyModal()']");
    if (createBtn) {
      createBtn.remove();
    }

    // 🔥 Ajusta título
   const title = document.getElementById("dashboardTitle");
if (title) {
  title.innerText = "VMR Consultoria Imobiliária";
}

    // 🔥 Ajusta subtítulo
    const subtitle = document.getElementById("dashboardSubtitle");
    if (subtitle) {
      subtitle.innerText = "Explore nossos imóveis e descubra seu novo lar";
    }
  }
);

// ===============================
// CONTROLE DE ABAS (Imóveis / Clientes)
// ===============================
window.showTab = function (tab) {
  const propertiesSection = document.getElementById("propertiesSection");
  const clientsSection = document.getElementById("clientsSection");

  const tabProperties = document.getElementById("tabProperties");
  const tabClients = document.getElementById("tabClients");

  if (tab === "properties") {
    if (propertiesSection) propertiesSection.style.display = "block";
    if (clientsSection) clientsSection.style.display = "none";

    if (tabProperties) tabProperties.classList.add("is-active");
    if (tabClients) tabClients.classList.remove("is-active");
  }

  if (tab === "clients") {
    if (propertiesSection) propertiesSection.style.display = "none";
    if (clientsSection) clientsSection.style.display = "block";

    if (tabClients) tabClients.classList.add("is-active");
    if (tabProperties) tabProperties.classList.remove("is-active");

    loadClients();
  }
  
};

