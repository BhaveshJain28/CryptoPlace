import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import Navbar from './components/Navbar/Navbar'
import { BrowserRouter , Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Coin from './pages/Coin'
function App() {
  const [count, setCount] = useState(0)

  return (
    
    <div className="app">
      <Navbar/>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/coin/:coinid" element={<Coin />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
