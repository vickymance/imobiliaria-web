# 🏠 CRM Imobiliário

Sistema completo de CRM imobiliário com autenticação JWT, gestão de imóveis e clientes, e frontend integrado.

---

## 🚀 Tecnologias

### Backend (`imobiliaria-api`)
- Node.js
- Express
- JWT
- Swagger (OpenAPI)

### Frontend (`imobiliaria-web`)
- HTML, CSS (Bulma)
- JavaScript (Vanilla)
- Fetch API

---

## 📁 Estrutura do Projeto

### Backend
```
src/
├── controllers/
├── routes/
├── services/
├── middleware/
├── database/
├── resources/
└── server.js
```

### Frontend
```
imobiliaria-web/
├── index.html
├── dashboard.broker.html
├── dashboard.clients.html
├── property.html
├── js/
└── css/
```

---

## ⚙️ Setup do Projeto

### 1. Clonar repositórios
```bash
git clone <repo-backend>
git clone <repo-frontend>
```

### 2. Backend
```bash
cd imobiliaria-api
npm install
npm run dev
```

Servidor:
```
http://localhost:3000
```

Swagger:
```
http://localhost:3000/api-docs
```

---

### 3. Frontend
Abrir diretamente:
```
index.html
```

Ou usar Live Server (VSCode)

---

## 🔐 Autenticação

- Login: `POST /auth/login`
- Token salvo em `localStorage`
- Header:
```
Authorization: Bearer TOKEN
```

---

## 📡 Principais Endpoints

### Auth
- `POST /auth/register-broker`
- `POST /auth/register-client`
- `POST /auth/login`

### Properties
- `GET /properties`
- `POST /properties`
- `PUT /properties/:id`
- `DELETE /properties/:id`

### Clients
- `GET /clients`
- `POST /clients`
- `PUT /clients/:id`
- `DELETE /clients/:id`

### Follow-up
- `POST /clients/:id/notes`
- `POST /clients/:id/next-update`

---

## 🧠 Funcionalidades

- CRUD de imóveis
- CRUD de clientes
- Follow-up com histórico
- Pipeline (Frio, Morno, Quente)
- Controle de prioridade
- Upload e galeria de imagens
- Dashboards por perfil (Cliente / Corretor)

## 👨‍💻 Autor

Projeto desenvolvido como portfólio.
