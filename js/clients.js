import { api } from "./api.js";

// ===============================
// FUNÇÃO AUXILIAR (COLOCA AQUI)
// ===============================
function formatDateWithStatus(date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const d = new Date(date);
    d.setHours(0, 0, 0, 0);

    const formatted = d.toLocaleDateString();

    if (d < today) {
        return `🔴 ${formatted}`;
    } else if (d.getTime() === today.getTime()) {
        return `🟡 ${formatted}`;
    } else {
        return `🟢 ${formatted}`;
    }
}

const modal = document.getElementById("client-modal");
const form = document.getElementById("client-form");

// ===============================
// MODAL
// ===============================
export function openClientModal() {
    document.getElementById("client-modal").classList.add("is-active");
}

export function closeClientModal() {
    document.getElementById("client-modal").classList.remove("is-active");
}

// ===============================
// CRIAR CLIENTE
// ===============================
export async function createClient(event) {
    event.preventDefault();

    const name = document.getElementById("client-name").value;
    const phone = document.getElementById("client-phone").value;
    const email = document.getElementById("client-email").value;
    const regionInterest = document.getElementById("client-region").value;

    const errorElement = document.getElementById("clientError");

    if (!name || !phone || !email) {
        errorElement.innerText = "Preencha todos os campos obrigatórios";
        return;
    }

    try {
        await api.post("/clients", {
            name,
            phone,
            email,
            regionInterest
        });

        // sucesso
        closeClientModal();

        document.getElementById("client-form").reset();
        errorElement.innerText = "";

        loadClients();

    } catch (error) {
        console.error(error);
        errorElement.innerText = "Erro ao cadastrar cliente";
    }
}

// ===============================
// LISTAR CLIENTES
// ===============================
export async function loadClients() {
    const tableBody = document.getElementById("clientsTableBody");
    if (!tableBody) return;

    try {
        const clients = await api.get("/clients");

        clients.sort((a, b) => {
            const today = new Date();
            today.setHours(0,0,0,0);

            const getPriority = (client) => {
                if (!client.nextUpdate) return 4;

                const d = new Date(client.nextUpdate);
                d.setHours(0,0,0,0);

                if (d < today) return 1;
                if (d.getTime() === today.getTime()) return 2;
                return 3;
            };

            return getPriority(a) - getPriority(b);
        });

        tableBody.innerHTML = "";

        if (!clients.length) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="has-text-centered">
                        Nenhum cliente cadastrado
                    </td>
                </tr>
            `;
            return;
        }

        clients.forEach(client => {
            const row = document.createElement("tr");

            const today = new Date();
today.setHours(0, 0, 0, 0);

let nextUpdateDate = null;

if (client.nextUpdate) {
    nextUpdateDate = new Date(client.nextUpdate);
    nextUpdateDate.setHours(0, 0, 0, 0);
}

            row.innerHTML = `
    <td><strong>${client.name}</strong></td>
    <td>${client.phone || "-"}</td>
    <td>${client.email}</td>
    <td>${client.regionInterest || "-"}</td>

    <td>
        ${client.nextUpdate 
            ? formatDateWithStatus(client.nextUpdate) 
            : "-"}
    </td>

    <td>
        <div class="select is-small">
            <select onchange="updatePipeline('${client.id}', this.value)">
                <option value="frio" ${client.pipeline === "frio" ? "selected" : ""}>Frio</option>
                <option value="morno" ${client.pipeline === "morno" ? "selected" : ""}>Morno</option>
                <option value="quente" ${client.pipeline === "quente" ? "selected" : ""}>Quente</option>
            </select>
        </div>
    </td>

    <td>
        <button class="button is-small is-info" onclick="openEditClientModal('${client.id}')">
            Atualizar
        </button>

        <button class="button is-small is-link" onclick="openClientActionsModal('${client.id}')">
            Follow-up
        </button>

        <button class="button is-small is-danger" onclick="deleteClient('${client.id}')">
            Excluir
        </button>
    </td>
`;

if (nextUpdateDate) {
    if (nextUpdateDate < today) {
        // 🔴 ATRASADO
        row.style.borderLeft = "5px solid red";
    } else if (nextUpdateDate.getTime() === today.getTime()) {
        // 🟡 HOJE
        row.style.borderLeft = "5px solid orange";
    } else {
        // 🟢 FUTURO
        row.style.borderLeft = "5px solid green";
    }
}
if (client.pipeline === "quente") {
    row.style.backgroundColor = "#fc8a48"; // laranja claro
}

if (client.pipeline === "morno") {
    row.style.backgroundColor = "#ffd76a"; // amarelo claro
}

if (client.pipeline === "frio") {
    row.style.backgroundColor = "#5bbafd"; // azul claro
}

            tableBody.appendChild(row);
        });

    } catch (error) {
        console.error(error);
    }
}
export async function updatePipeline(id, pipeline) {
    try {
        await api.put(`/clients/${id}`, { pipeline });

        showSuccessModal("Pipeline atualizado!");

        loadClients();

    } catch (error) {
        console.error(error);
        alert("Erro ao atualizar pipeline");
    }
}

// ===============================
// DELETAR CLIENTE
// ===============================
export async function deleteClient(id) {

    showConfirmModal("Deseja excluir este cliente?", async () => {
        try {
            await api.delete(`/clients/${id}`);

            showSuccessModal("Cliente removido!");

            loadClients();

        } catch (error) {
            console.error(error);
            showErrorModal("Erro ao excluir cliente");
        }
    });

}

// ===============================
// EDITAR CLIENTE
// ===============================

export async function openEditClientModal(id) {
    try {
        const client = await api.get(`/clients/${id}`);

        document.getElementById("editClientId").value = id;
        document.getElementById("edit-name").value = client.name;
        document.getElementById("edit-phone").value = client.phone;
        document.getElementById("edit-email").value = client.email;
        document.getElementById("edit-region").value = client.regionInterest;

        document.getElementById("editClientModal").classList.add("is-active");

    } catch (error) {
        console.error(error);
        alert("Erro ao carregar cliente");
    }
}

export function closeEditClientModal() {
    document.getElementById("editClientModal").classList.remove("is-active");
}

export async function updateClient() {
    const id = document.getElementById("editClientId").value;

    const name = document.getElementById("edit-name").value;
    const phone = document.getElementById("edit-phone").value;
    const email = document.getElementById("edit-email").value;
    const regionInterest = document.getElementById("edit-region").value;

    try {
        await api.put(`/clients/${id}`, {
            name,
            phone,
            email,
            regionInterest
        });

        showSuccessModal("Cliente atualizado com sucesso!");

        closeEditClientModal();
        loadClients();

    } catch (error) {
        console.error(error);
        alert("Erro ao atualizar cliente");
    }
}

// ===============================
// EXPORT PARA HTML
// ===============================
window.openClientModal = openClientModal;
window.closeClientModal = closeClientModal;
window.createClient = createClient;
window.loadClients = loadClients;
window.deleteClient = deleteClient;
window.openClientActionsModal = openClientActionsModal;
window.closeClientActionsModal = closeClientActionsModal;
window.addNote = addNote;
window.setNextUpdate = setNextUpdate;
window.openEditClientModal = openEditClientModal;
window.closeEditClientModal = closeEditClientModal;
window.updateClient = updateClient;
window.showSuccessModal = showSuccessModal;
window.closeSuccessModal = closeSuccessModal;
window.updatePipeline = updatePipeline;
window.showConfirmModal = showConfirmModal;
window.closeConfirmModal = closeConfirmModal;

// ===============================
// ABRIR MODAL DE AÇÕES (FOLLOW-UP)
// ===============================
export function openClientActionsModal(clientId) {
    document.getElementById("clientActionModal").classList.add("is-active");
    document.getElementById("selectedClientId").value = clientId;

    // 🔥 NOVO
    loadClientNotes(clientId);
}

export function closeClientActionsModal() {
    document.getElementById("clientActionModal").classList.remove("is-active");
}


// ===============================
// ADICIONAR NOTA
// ===============================
export async function addNote() {
    const clientId = document.getElementById("selectedClientId").value;
    const note = document.getElementById("clientNote").value;

    if (!note) {
        alert("Digite uma nota");
        return;
    }

    try {
        await api.post(`/clients/${clientId}/notes`, { note });

        showSuccessModal("Nota adicionada!");
        document.getElementById("clientNote").value = "";

        // 🔥 atualizar histórico automaticamente
loadClientNotes(clientId);

    } catch (error) {
        console.error(error);
        alert("Erro ao adicionar nota");
    }
}

// ===============================
// CARREGAR HISTÓRICO DE NOTAS
// ===============================
export async function loadClientNotes(clientId) {
    try {
        const notes = await api.get(`/clients/${clientId}/notes`);

        const container = document.getElementById("clientNotesHistory");

        container.innerHTML = "";

        if (!notes.length) {
            container.innerHTML = `<p class="has-text-grey">Nenhuma interação registrada</p>`;
            return;
        }

        notes.reverse().forEach(note => {
            const div = document.createElement("div");

            div.className = "mb-2 p-2";
            div.style.borderBottom = "1px solid #eee";

            div.innerHTML = `
                <p>${note.note}</p>
                <small class="has-text-grey">
                    ${new Date(note.createdAt).toLocaleString()}
                </small>
            `;

            container.appendChild(div);
        });

    } catch (error) {
        console.error(error);
    }
}

// ===============================
// DEFINIR PRÓXIMA ATUALIZAÇÃO
// ===============================
export async function setNextUpdate() {
    const clientId = document.getElementById("selectedClientId").value;
    const date = document.getElementById("nextUpdate").value;

    if (!date) {
        alert("Selecione uma data");
        return;
    }

    try {
        await api.post(`/clients/${clientId}/next-update`, {
            date
        });

      showSuccessModal("Próxima atualização definida!");

    } catch (error) {
        console.error(error);
        alert("Erro ao definir atualização");
    }
}

// ===============================
// MODAL DE SUCESSO
// ===============================
export function showSuccessModal(message) {
    document.getElementById("successMessage").innerText = message;
    document.getElementById("successModal").classList.add("is-active");
}

export function closeSuccessModal() {
    document.getElementById("successModal").classList.remove("is-active");
}

let confirmCallback = null;

// ===============================
// ABRIR MODAL DE CONFIRMAÇÃO
// ===============================
export function showConfirmModal(message, onConfirm) {
    document.getElementById("confirmMessage").innerText = message;
    document.getElementById("confirmModal").classList.add("is-active");

    confirmCallback = onConfirm;
}

// ===============================
// FECHAR MODAL
// ===============================
export function closeConfirmModal() {
    document.getElementById("confirmModal").classList.remove("is-active");
    confirmCallback = null;
}

// ===============================
// BOTÃO CONFIRMAR
// ===============================
document.getElementById("confirmOkBtn").onclick = () => {
    if (confirmCallback) {
        confirmCallback();
    }
    closeConfirmModal();
};

