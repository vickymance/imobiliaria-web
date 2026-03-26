const API_URL = "http://localhost:3000";
const user = JSON.parse(localStorage.getItem("user"));
const isClient = user?.role === "client";

const token = localStorage.getItem("token");

const params = new URLSearchParams(window.location.search);
const propertyId = params.get("id");

let currentProperty = null;

// 🔥 estado principal
let editableImages = [];

// 🔥 viewer
let viewerImages = [];
let currentIndex = 0;

loadProperty();


// =======================
// 🔍 VALIDAR IMAGEM REAL
// =======================

function isImageValid(url){
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}


// =======================
// LOAD PROPERTY
// =======================

async function loadProperty(){

  const response = await fetch(
    `${API_URL}/properties/${propertyId}`,
    {
      headers:{ Authorization:`Bearer ${token}` }
    }
  );

  const property = await response.json();

  // 🔥 valida imagens REALMENTE
  const validImages = [];

  for (let img of (property.images || [])){
    if (!img) continue;

    const isValid = await isImageValid(img);

    if (isValid){
      validImages.push(img);
    }
  }

  property.images = validImages;

  currentProperty = property;

  renderGallery(validImages);
  renderDetails(property);

}


// =======================
// GALERIA
// =======================

function renderGallery(images){

  if (!images || !Array.isArray(images)) return;

  const mainImage = document.getElementById("mainImage");
  const gallery = document.getElementById("gallery");

  gallery.innerHTML = "";

  if(images.length === 0){
    mainImage.src = "https://picsum.photos/800/400";
    return;
  }

  mainImage.src = images[0];

  images.forEach((img, index) => {

    const image = document.createElement("img");

    image.src = img;

    image.style.width = "90px";
    image.style.height = "70px";
    image.style.objectFit = "cover";
    image.style.borderRadius = "6px";
    image.style.cursor = "pointer";

    image.onclick = () => {
      openViewer(images, index);
    };

    gallery.appendChild(image);

  });

}


// =======================
// DETALHES
// =======================

function formatPrice(price){
  return new Intl.NumberFormat('pt-BR', {
    style:'currency',
    currency:'BRL',
    maximumFractionDigits:0
  }).format(price);
}

function renderDetails(property){

  const actions = document.querySelector(".property-actions");

if (isClient && actions) {
  actions.style.display = "none";
}

  const container = document.getElementById("propertyDetails");

  container.innerHTML = `
    <h2 class="title is-4">${property.type}</h2>
    <p class="has-text-grey">📍 ${property.neighborhood} - ${property.city}</p>

    <div class="property-price">${formatPrice(property.price)}</div>

    <div class="property-info">
      <p>🛏 Quartos: ${property.bedrooms || "-"}</p>
<p>📐 Tamanho: ${property.size ? property.size + " m²" : "-"}</p>
<p>🏠 Rua: ${property.street || "-"}</p>
    </div>
  `;
}


// =======================
// MODAL EDIT
// =======================

function openEditPropertyModal(){

  document.getElementById("editPropertyModal")
  .classList.add("is-active");

  document.getElementById("editPrice").value =
  currentProperty.price;

  document.getElementById("editBedrooms").value =
  currentProperty.bedrooms;

  editableImages = [...(currentProperty.images || [])];

  renderEditableImages();

  document.getElementById("editImages")
  .onchange = previewImages;

}

function closeEditPropertyModal(){
  document.getElementById("editPropertyModal")
  .classList.remove("is-active");
}


// =======================
// EDITAR IMAGENS
// =======================

function renderEditableImages(){

  const container = document.getElementById("imagePreview");

  container.innerHTML = "";

  editableImages.forEach((img, index) => {

    const wrapper = document.createElement("div");

    wrapper.style.display = "inline-block";
    wrapper.style.position = "relative";
    wrapper.style.margin = "5px";

    const image = document.createElement("img");

    image.src = img;

    image.style.width = "80px";
    image.style.height = "60px";
    image.style.objectFit = "cover";
    image.style.borderRadius = "6px";

    // 🔥 destaque se quebrada
    image.onerror = function () {
      image.style.opacity = "0.3";
      image.style.border = "2px solid red";
    };

    // ⭐ principal
    const starBtn = document.createElement("button");

    starBtn.innerText = "⭐";

    starBtn.style.position = "absolute";
    starBtn.style.bottom = "0";
    starBtn.style.left = "0";

    starBtn.onclick = () => {
      const selected = editableImages.splice(index, 1)[0];
      editableImages.unshift(selected);
      renderEditableImages();
    };

    // ❌ remover
    const removeBtn = document.createElement("button");

    removeBtn.innerText = "✖";

    removeBtn.style.position = "absolute";
    removeBtn.style.top = "0";
    removeBtn.style.right = "0";
    removeBtn.style.background = "red";
    removeBtn.style.color = "white";
    removeBtn.style.border = "none";
    removeBtn.style.cursor = "pointer";

    removeBtn.onclick = () => {
      editableImages.splice(index, 1);
      renderEditableImages();
    };

    wrapper.appendChild(image);
    wrapper.appendChild(starBtn);
    wrapper.appendChild(removeBtn);

    container.appendChild(wrapper);
  });

}


// =======================
// UPLOAD
// =======================

async function previewImages(event){

  const files = event.target.files;

  for (let file of files){

    const base64 = await convertToBase64(file);

    editableImages.push(base64);
  }

  renderEditableImages();
}

function convertToBase64(file){
  return new Promise((resolve, reject)=>{
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = ()=> resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}


// =======================
// SALVAR
// =======================

async function updateProperty(){

  const updatedData = {
    price: Number(document.getElementById("editPrice").value),
    bedrooms: Number(document.getElementById("editBedrooms").value),
    images: editableImages
  };

  await fetch(`${API_URL}/properties/${propertyId}`,{
    method:"PUT",
    headers:{
      "Content-Type":"application/json",
      Authorization:`Bearer ${token}`
    },
    body:JSON.stringify(updatedData)
  });

  closeEditPropertyModal();
  loadProperty();
}


// =======================
// 🧹 LIMPAR QUEBRADAS
// =======================

window.removeBrokenImages = async function(){

  const valid = [];

  for (let img of editableImages){

    const ok = await isImageValid(img);

    if (ok) valid.push(img);
  }

  editableImages = valid;

  renderEditableImages();
};


// =======================
// VIEWER
// =======================

function openViewer(images, index){

  const viewer = document.getElementById("imageViewer");
  const img = document.getElementById("viewerImage");

  if (!viewer || !img) return;

  viewerImages = images;
  currentIndex = index;

  img.src = viewerImages[currentIndex];

  viewer.classList.add("is-active");
}

window.nextImage = function(){

  currentIndex = (currentIndex + 1) % viewerImages.length;

  document.getElementById("viewerImage").src =
  viewerImages[currentIndex];
};

window.prevImage = function(){

  currentIndex =
  (currentIndex - 1 + viewerImages.length) % viewerImages.length;

  document.getElementById("viewerImage").src =
  viewerImages[currentIndex];
};

window.closeViewer = function(){

  document.getElementById("imageViewer")
  .classList.remove("is-active");
};


// =======================
// DELETE
// =======================

function deleteProperty(){
  document.getElementById("deleteModal")
  .classList.add("is-active");
}

function closeDeleteModal(){
  document.getElementById("deleteModal")
  .classList.remove("is-active");
}

async function confirmDeleteProperty(){

  await fetch(`${API_URL}/properties/${propertyId}`,{
    method:"DELETE",
    headers:{ Authorization:`Bearer ${token}` }
  });

 if (user?.role === "broker") {
  window.location.href = "dashboard.broker.html";
} else {
  window.location.href = "dashboard.clients.html";
}
}

window.goBackToDashboard = function () {

  const user = JSON.parse(localStorage.getItem("user"));

  if (user?.role === "broker") {
    window.location.href = "dashboard.broker.html";
  } else {
    window.location.href = "dashboard.clients.html";
  }

};