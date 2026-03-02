# 🪙 CryptoPlace

A modern, real-time cryptocurrency tracking web application built with React. Browse top cryptocurrencies, view live prices, interactive charts, and detailed market data — all in a sleek dark-themed UI.

![React](https://img.shields.io/badge/React-19-blue?logo=react)
![Vite](https://img.shields.io/badge/Vite-8-purple?logo=vite)
![License](https://img.shields.io/badge/License-MIT-green)

---

## ✨ Features

- **Live Crypto Prices** — Real-time data from the CoinGecko API
- **Search & Filter** — Instantly search through all available cryptocurrencies
- **Multi-Currency Support** — Toggle between USD, EUR, and INR
- **Interactive Charts** — 10-day price history with Google Charts line graphs
- **Detailed Coin Pages** — Market rank, price, market cap, 24h high/low
- **Responsive Design** — Fully optimized for desktop, tablet, and mobile
- **Modern UI** — Dark gradient theme with glassmorphism cards and smooth animations

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| [React 19](https://react.dev/) | UI framework |
| [Vite 8](https://vitejs.dev/) | Build tool & dev server |
| [React Router v7](https://reactrouter.com/) | Client-side routing |
| [React Google Charts](https://www.react-google-charts.com/) | Price history charts |
| [CoinGecko API](https://www.coingecko.com/en/api) | Cryptocurrency market data |

---

## 📁 Project Structure

```
cryptoplace/
├── public/
├── src/
│   ├── assets/              # Images & icons
│   ├── components/
│   │   ├── Footer/          # Footer with links & social icons
│   │   ├── LineChart/       # Google Charts price graph
│   │   └── Navbar/          # Sticky navbar with currency selector & hamburger menu
│   ├── context/
│   │   └── CoinContext.jsx  # Global state for coins & currency
│   ├── pages/
│   │   ├── Home.jsx         # Homepage with hero section & crypto table
│   │   ├── Home.css
│   │   ├── Coin.jsx         # Individual coin detail page
│   │   └── Coin.css
│   ├── App.jsx              # Root component with routing
│   ├── index.css            # Global styles
│   └── main.jsx             # Entry point
├── index.html
├── package.json
└── vite.config.js
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- A free [CoinGecko API key](https://www.coingecko.com/en/api) (Demo tier)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/cryptoplace.git
   cd cryptoplace
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the project root:

   ```env
   VITE_CG_API_KEY=your_coingecko_api_key_here
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

5. **Open in browser**

   Navigate to `http://localhost:5173`

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

---

## 📱 Pages

### Home (`/`)
- Hero section with search bar and autocomplete suggestions
- Top 10 cryptocurrencies table with rank, price, 24h change, and market cap
- Color-coded price changes (green for positive, red for negative)

### Coin Detail (`/coin/:coinid`)
- Coin image and name displayed side-by-side with a detailed stats table
- 10-day interactive price chart spanning the full page width
- Key metrics: Market Rank, Current Price, Market Cap, 24h High, 24h Low

---

## 🎨 Design Highlights

- **Dark gradient background** — Deep purple to dark teal (`#0b004e` → `#1d152f` → `#002834`)
- **Glassmorphism cards** — Semi-transparent backgrounds with subtle borders
- **Purple accent** — `#7927ff` used for buttons, spinners, highlights
- **Outfit font** — Clean, modern typography from Google Fonts
- **Smooth animations** — Slide-up entrance effects with staggered delays
- **Custom scrollbar** — Purple-themed to match the palette
- **Sticky navbar** — Blurred glass header with animated mobile hamburger menu

---

## 🔑 Environment Variables

| Variable | Description |
|---|---|
| `VITE_CG_API_KEY` | Your CoinGecko Demo API key |

> Get a free API key at [coingecko.com/en/api](https://www.coingecko.com/en/api)

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

Built with 💜 using React & CoinGecko API
