import Navbar from './components/Navbar/Navbar'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Coin from './pages/Coin'
import CoinContextProvider from './context/CoinContext'
import AuthContextProvider, { AuthContext } from './context/AuthContext'
import Footer from './components/Footer/Footer'
import Login from './pages/Login'
import Register from './pages/Register'
import Watchlist from './pages/Watchlist'
import Portfolio from './pages/Portfolio'
import WatchlistContextProvider from './context/WatchlistContext'
import { useContext } from 'react'

const ProtectedRoute = ({ children }) => {
  const { token } = useContext(AuthContext);
  const location = useLocation();
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
};

function App() {
  return (
    <div className="app">
      <BrowserRouter>
        <AuthContextProvider>
          <CoinContextProvider>
            <WatchlistContextProvider>
              <Navbar />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/coin/:coinid" element={<ProtectedRoute><Coin /></ProtectedRoute>} />
                <Route path="/watchlist" element={<ProtectedRoute><Watchlist /></ProtectedRoute>} />
                <Route path="/portfolio" element={<ProtectedRoute><Portfolio /></ProtectedRoute>} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
              </Routes>
              <Footer />
            </WatchlistContextProvider>
          </CoinContextProvider>
        </AuthContextProvider>
      </BrowserRouter>
    </div>
  )
}

export default App
