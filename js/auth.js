import { api } from "./api.js";

// ===============================
// CONTROLE DE TIPO (broker/client)
// ===============================
let registerType = "client";

// ===============================
// LOGIN
// ===============================
export async function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const data = await api.post("/auth/login", {
            email,
            password
        });
        console.log("LOGIN RESPONSE:", data);

        // salva token
localStorage.setItem("token", data.token);

// 👇 AQUI (NOVO)
localStorage.setItem("user", JSON.stringify(data.user));

const role = data?.user?.role;

if (role === "broker") {
  window.location.href = "dashboard.broker.html";
} else if (role === "client") {
  window.location.href = "dashboard.clients.html";
} else {
  console.error("Tipo de usuário inválido");
}

    } catch (error) {
        console.error(error);
        document.getElementById("error").innerText = "Email ou senha inválidos";
    }
}

// ===============================
// ABRIR MODAL REGISTRO
// ===============================
export function openRegister(type) {
    registerType = type;

    document.getElementById("registerModal").classList.add("is-active");

    // mostra/oculta CRECI
    if (type === "broker") {
        document.getElementById("creciField").style.display = "block";
    } else {
        document.getElementById("creciField").style.display = "none";
    }
}

// ===============================
// FECHAR MODAL
// ===============================
export function closeModal() {
    document.getElementById("registerModal").classList.remove("is-active");
}

// ===============================
// REGISTRAR
// ===============================
export async function register() {
    const name = document.getElementById("regName").value;
    const email = document.getElementById("regEmail").value;
    const password = document.getElementById("regPassword").value;
    const creci = document.getElementById("regCreci").value;

    if (!name || !email || !password || (registerType === "broker" && !creci)) {
        document.getElementById("registerError").innerText = "Preencha todos os campos";
        return;
    }

    try {
        if (registerType === "broker") {
            await api.post("/auth/register-broker", {
                name,
                email,
                password,
                creci
            });
        } else {
            await api.post("/auth/register-client", {
                name,
                email,
                password
            });
        }

        closeModal();
        openSuccessModal();

    } catch (error) {
        console.error(error);
        const message = error?.error || error?.message || "Erro ao registrar";

    document.getElementById("registerError").innerText = ` ${message}`;
}

}

// ===============================
// MODAL SUCESSO
// ===============================
function openSuccessModal() {
    document.getElementById("successModal").classList.add("is-active");
}

export function closeSuccessModal() {
    document.getElementById("successModal").classList.remove("is-active");
}

export function goToLogin() {
    closeSuccessModal();
}

// ===============================
// EXPORT PARA HTML (onclick)
// ===============================
window.login = login;
window.openRegister = openRegister;
window.closeModal = closeModal;
window.register = register;
window.closeSuccessModal = closeSuccessModal;
window.goToLogin = goToLogin;