<div align="center">
  <h1>🪙 CryptoPlace</h1>
  <p><strong>A Next-Generation Cryptocurrency Portfolio & Market Tracker</strong></p>
  
  [![React 19](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://react.dev)
  [![Vite 8](https://img.shields.io/badge/Vite-8-purple?style=for-the-badge&logo=vite)](https://vitejs.dev)
  [![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](#)
  [![Status](https://img.shields.io/badge/Status-Active-success?style=for-the-badge)](#)
</div>

---

## 🌟 What is CryptoPlace?

**CryptoPlace** isn't just another coin tracker. It is a highly polished, responsive, and real-time cryptocurrency dashboard designed for the modern web. Built with React and powered by the CoinGecko API, it allows users to monitor global market trends, dive deep into specific assets, and simulate personal crypto portfolios in a beautiful, glassmorphic dark-themed environment.

---

## ✨ Features That Stand Out

- ⚡ **Real-Time Telemetry:** Live pricing, 24h highs/lows, and market caps directly from the CoinGecko API.
- 📱 **100% Fluid Responsiveness:** A layout that looks as gorgeous on an iPhone SE as it does on a 4K monitor. Horizontal scrollable data tables and smart stacking grids.
- 📊 **Interactive Market Charts:** Deep-dive into 10-day historical trends using React Google Charts.
- 💼 **Simulated Portfolios:** Build a virtual portfolio and see your holdings, all-time P&L, and asset allocations.
- 🛡️ **Secure Authentication:** Full backend integration with JWT for saving personalized watchlists and user preferences.
- 🎨 **Premium Glassmorphism UI:** Built with custom vanilla CSS, utilizing vibrant gradients, deep space backgrounds, and micro-animations.

---

## 🏗️ Architecture & Tech Stack

We keep our stack modern, fast, and scalable.

### Frontend
- **Framework:** React 19 (Hooks-heavy architecture)
- **Tooling:** Vite 8 (Lightning fast HMR)
- **Routing:** React Router v7
- **Styling:** Vanilla CSS 3 (CSS Variables, Flexbox/Grid, Media Queries)
- **Visualization:** React Google Charts
- **Icons:** Inline SVGs / Lucide

### Backend (Separated)
- **Runtime:** Node.js / Express
- **Database:** MongoDB (User data & Watchlists)
- **Auth:** JWT (JSON Web Tokens)
- **External Data Source:** [CoinGecko V3 API](https://www.coingecko.com/en/api)

---

## 🚀 Zero-to-Hero Quick Start

Want to run CryptoPlace on your local machine? It takes less than 3 minutes.

### 1. Prerequisites
- **Node.js** v18+ installed.
- A **MongoDB URI** (local or MongoDB Atlas).
- A free **CoinGecko API Key** (Demo tier works great!).

### 2. Clone the Repository
```bash
git clone https://github.com/your-username/cryptoplace.git
cd cryptoplace
```

### 3. Install Dependencies
CryptoPlace is split into two halves. You need to install packages for both.
```bash
# Install frontend deps
npm install

# Install backend deps
cd backend
npm install
cd ..
```

### 4. Setup Environment Variables
Duplicate the `.env.example` files and configure your keys.

**Frontend (`/.env`)**
```env
VITE_API_URL=http://localhost:5000/api
VITE_CG_API_KEY=your_coingecko_api_key_here
```

**Backend (`/backend/.env`)**
```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/cryptoplace
JWT_SECRET=generate_a_random_secure_string
COINGECKO_BASE_URL=https://api.coingecko.com/api/v3
CG_API_KEY=your_coingecko_api_key_here
```

### 5. Fire it up! 🔥
Open two terminal instances at the root of the project:

```bash
# Terminal 1: Boot the backend API
cd backend
npm start
```

```bash
# Terminal 2: Boot the Vite frontend
npm run dev
```

Browse to `http://localhost:5173` and you're officially running CryptoPlace!

---

## 📁 Directory Roadmap

A quick glance at how the frontend is structured to help you navigate the codebase:

```text
cryptoplace/
├── src/
│   ├── assets/           # Static images, icons, branding
│   ├── components/       # Reusable UI (Navbar, Footer, Charts, Sparklines)
│   ├── context/          # React Context providers (Auth, CoinData, Watchlist)
│   ├── pages/            # Core views (Home, Coin, Portfolio, Watchlist, Auth)
│   ├── utils/            # Helper functions (CSV Export, Formatters)
│   ├── App.jsx           # Routing definition
│   └── index.css         # Global design tokens and root styles
└── backend/              # Node/Express API logic
```

---

## 📜 Cheat Sheet: Available Scripts

Inside the root (frontend) directory:

| Command | What it does |
|---|---|
| `npm run dev` | Spins up the Vite dev server with Hot Module Replacement. |
| `npm run build` | Compiles the React app into highly optimized static assets in `/dist`. |
| `npm run preview` | Serves the `/dist` folder to preview the production build locally. |
| `npm run lint` | Runs ESLint to catch syntax/hook violations. Keep the build clean! |

---

## 🤝 How to Contribute

CryptoPlace thrives on community contributions. Whether it's fixing a UI bug, adding a new feature, or improving documentation, we'd love your help!

1. **Fork** the repo on GitHub.
2. **Clone** your fork locally.
3. Create a **new branch** (`git checkout -b feature/amazing-new-feature`).
4. **Commit** your changes (`git commit -m 'Added an amazing new feature'`).
5. **Push** your branch (`git push origin feature/amazing-new-feature`).
6. Submit a **Pull Request**!

---

## 📄 License

This project is open-sourced software licensed under the [MIT License](LICENSE).

<br/>
<div align="center">
  <i>Built with 💜 by developers, for developers.</i>
</div>
