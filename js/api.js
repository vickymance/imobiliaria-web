const API_URL = "http://localhost:3000";

// FUNÇÃO BASE (CORE)
async function request(endpoint, method = "GET", body = null) {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}${endpoint}`, {
        method,
        headers: {
            "Content-Type": "application/json",
            "Authorization": token ? `Bearer ${token}` : ""
        },
        body: body ? JSON.stringify(body) : null
    });

    const data = await response.json(); // 👈 MUITO IMPORTANTE

    if (!response.ok) {
        throw data; // 👈 AGORA VOCÊ MANTÉM { error: "..." }
    }

    return data;
}

// OBJETO API
export const api = {
    get: (endpoint) => request(endpoint, "GET"),
    post: (endpoint, body) => request(endpoint, "POST", body),
    put: (endpoint, body) => request(endpoint, "PUT", body),
    delete: (endpoint) => request(endpoint, "DELETE")
};