import React, { useEffect, useState } from 'react'
import './Navbar.css'
import logo from '../../assets/logo.png'
import { useContext } from 'react'
import { CoinContext } from '../../context/CoinContext'
import { AuthContext } from '../../context/AuthContext'
import { Link, useLocation } from 'react-router-dom'

function Navbar() {
  const { setCurrency } = useContext(CoinContext);
  const { token, user, logout } = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const resizeHandler = () => {
      if (window.innerWidth > 800) {
        setMenuOpen(false);
      }
    };
    window.addEventListener('resize', resizeHandler);
    return () => window.removeEventListener('resize', resizeHandler);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path) => location.pathname === path;

  const currencyHandler = (e) => {
    switch (e.target.value) {
      case 'usd': setCurrency({ name: 'usd', symbol: '$' }); break;
      case 'eur': setCurrency({ name: 'eur', symbol: '€' }); break;
      case 'inr': setCurrency({ name: 'inr', symbol: '₹' }); break;
      default:    setCurrency({ name: 'usd', symbol: '$' }); break;
    }
  }

  return (
    <nav className='navbar'>
      <Link to="/" className="nav-logo" aria-label="CryptoPlace Home">
        <img src={logo} alt="CryptoPlace" />
        <span className="nav-brand-name">CryptoPlace</span>
      </Link>

      {menuOpen && <div className="nav-overlay" onClick={() => setMenuOpen(false)}></div>}

      <ul className={menuOpen ? 'nav-links active' : 'nav-links'}>
        <li className={isActive('/') ? 'nav-link-item active' : 'nav-link-item'}>
          <Link to='/'>Markets</Link>
        </li>
        {token && (
          <>
            <li className={isActive('/watchlist') ? 'nav-link-item active' : 'nav-link-item'}>
              <Link to='/watchlist'>Watchlist</Link>
            </li>
            <li className={isActive('/portfolio') ? 'nav-link-item active' : 'nav-link-item'}>
              <Link to='/portfolio'>Portfolio</Link>
            </li>
          </>
        )}
      </ul>

      <div className="nav-right">
        <select name="currency" onChange={currencyHandler} aria-label="Select currency">
          <option value="usd">USD</option>
          <option value="eur">EUR</option>
          <option value="inr">INR</option>
        </select>

        {token ? (
          <div className="nav-user-menu">
            <span className="nav-user-email" title={user?.email}>
              {user?.email ? user.email.split('@')[0] : 'Account'}
            </span>
            <button className="nav-btn nav-btn-outline" onClick={logout}>
              Logout
            </button>
          </div>
        ) : (
          <div className="nav-auth-btns">
            <Link to="/login" className="nav-btn nav-btn-ghost">Sign In</Link>
            <Link to="/register" className="nav-btn nav-btn-primary">Sign Up</Link>
          </div>
        )}
      </div>

      <button
        className={menuOpen ? 'hamburger active' : 'hamburger'}
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle navigation menu"
        aria-expanded={menuOpen}
        type="button"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
    </nav>
  )
}

export default Navbar
