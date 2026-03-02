import Navbar from './components/Navbar/Navbar'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Coin from './pages/Coin'
import CoinContextProvider from './context/CoinContext'
import Footer from './components/Footer/Footer'

function App() {
  return (
    <div className="app">
      <BrowserRouter>
        <CoinContextProvider>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/coin/:coinid" element={<Coin />} />
          </Routes>
          <Footer />
        </CoinContextProvider>
      </BrowserRouter>
    </div>
  )
}

export default App
