const API = "http://localhost:3000";

let properties = [];
let filteredProperties = [];

// =======================
// LISTAR IMÓVEIS
// =======================

window.loadProperties = async function () {

  const token = localStorage.getItem("token");

  try {

    const response = await fetch(`${API}/properties`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await response.json();

    console.log("Imóveis recebidos da API:", data);

    if (!Array.isArray(data)) {
      console.error("Resposta inválida:", data);
      throw new Error("Resposta não é array");
    }

    properties = data;
    filteredProperties = data;

    renderProperties();

  } catch (error) {

    console.error(error);

    document.getElementById("propertiesList").innerHTML =
      `<div class="notification is-danger">
        Erro ao carregar imóveis
      </div>`;
  }

};

// =======================
// FORMATAR PREÇO
// =======================

function formatPrice(price) {

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(price);

}

// =======================
// RENDER
// =======================

function renderProperties() {

  const container = document.getElementById("propertiesList");

  if (!filteredProperties || filteredProperties.length === 0) {

    container.innerHTML =
      `<div class="notification is-warning">
        Nenhum imóvel encontrado.
      </div>`;

    return;
  }

  let html = "";

  filteredProperties.forEach(property => {

 const image =
  property.images && property.images.length > 0
    ? property.images[0]
    : property.image
    ? property.image
    : "https://picsum.photos/400/200";

    const id =
      property.id ||
      property._id ||
      property.propertyId ||
      property.ID;

    const details = [];

if (property.bedrooms !== undefined && property.bedrooms !== null) {
  details.push(`${property.bedrooms} quartos`);
}

if (property.size !== undefined && property.size !== null) {
  details.push(`${property.size} m²`);
}

    const info =
      details.length > 0
        ? details.join(" • ")
        : "Informações não disponíveis";

    html += `
    
    <div class="column is-4">

      <div class="property-card">

        <img class="property-image"
        src="${image}">

        <div class="property-content">

          <h3 class="title is-5">
          ${property.type || "Imóvel"}
          </h3>

          <p class="property-location">
          ${property.neighborhood || "-"} - ${property.city || "-"}
          </p>

          <p>
${info}
</p>

<p class="is-size-7 has-text-grey">
${property.type || ""} • ID: ${property.id || ""}
</p>

          <div class="property-price">
          ${formatPrice(property.price)}
          </div>

          <div class="property-actions">

          <button class="button is-link is-fullwidth"
          onclick="viewProperty('${id}')">

          Ver detalhes

          </button>

          </div>

        </div>

      </div>

    </div>
    `;

  });

  container.innerHTML = html;

}

// =======================
// VER DETALHES
// =======================

window.viewProperty = function (id) {

  if (!id) {
    alert("ID do imóvel não encontrado");
    return;
  }

  window.location.href = `property.html?id=${id}`;

};

// =======================
// FILTROS
// =======================

window.applyFilters = function () {

  const city =
    document.getElementById("filterCity").value.toLowerCase();

  const neighborhood =
    document.getElementById("filterNeighborhood").value.toLowerCase();

  filteredProperties = properties.filter(p => {

    return (

      (!city || p.city.toLowerCase().includes(city)) &&

      (!neighborhood || p.neighborhood.toLowerCase().includes(neighborhood))

    );

  });

  renderProperties();

};

// =======================
// MODAL
// =======================

window.openCreatePropertyModal = function () {

  document
    .getElementById("createPropertyModal")
    .classList.add("is-active");

};

window.closeCreatePropertyModal = function () {

  document
    .getElementById("createPropertyModal")
    .classList.remove("is-active");

};

// =======================
// CRIAR IMÓVEL (FIX)
// =======================

window.createProperty = async function () {

  const token = localStorage.getItem("token");

  const data = {

    city: document.getElementById("city").value,
    neighborhood: document.getElementById("neighborhood").value,
    street: document.getElementById("street").value,
    size: Number(document.getElementById("size").value),
bedrooms: Number(document.getElementById("bedrooms").value),
    type: document.getElementById("type").value,
    price: Number(document.getElementById("price").value),

    images: document.getElementById("image").value
      ? [document.getElementById("image").value]
      : []

  };

  try {

    const response = await fetch(`${API}/properties`, {
      method: "POST", // 🔥 ESSENCIAL
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      alert("Erro ao criar imóvel");
      return;
    }

    closeCreatePropertyModal();

    loadProperties();

  } catch (error) {

    console.error(error);

  }

};