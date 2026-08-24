import React, { useEffect, useState } from 'react'
import './Navbar.css'
import logo from '../../assets/logo.png'
import { useContext } from 'react'
import { CoinContext } from '../../context/CoinContext'
import arrow_icon from '../../assets/arrow_icon.png'
import { Link } from 'react-router-dom'

function Navbar() {
  const {setCurrency} = useContext(CoinContext);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const resizeHandler = () => {
      if (window.innerWidth > 800) {
        setMenuOpen(false);
      }
    };

    window.addEventListener('resize', resizeHandler);
    return () => window.removeEventListener('resize', resizeHandler);
  }, []);

  const currencyHandler = (e) => {
    switch(e.target.value){
      case 'usd':{
        setCurrency({ name:'usd', symbol:'$' });
        break;
      }
      case 'eur':{
        setCurrency({ name:'eur', symbol:'€' });
        break;
      }
      case 'inr':{
        setCurrency({ name:'inr', symbol:'₹' });
        break;
      }
      default:{
        setCurrency({ name:'usd', symbol:'$' });
        break;
      }
    }
  }

  return (
    <nav className='navbar'>
      <Link to={"/"} className="nav-logo">
        <img src={logo} alt="Logo" />
      </Link>

      <ul className={menuOpen ? "nav-links active" : "nav-links"}>
        <li><Link to={'/'} onClick={() => setMenuOpen(false)}>Home</Link></li>
        <li><a href="#" onClick={() => setMenuOpen(false)}>Features</a></li>
        <li><a href="#" onClick={() => setMenuOpen(false)}>Pricing</a></li>
        <li><a href="#" onClick={() => setMenuOpen(false)}>Blog</a></li>
      </ul>

      {menuOpen && <div className="nav-overlay" onClick={() => setMenuOpen(false)}></div>}

      <div className="nav-right">
        <select name="currency" onChange={currencyHandler}>
          <option value="usd">USD</option>
          <option value="eur">EUR</option>
          <option value="inr">INR</option>
        </select>
        <button className="nav-btn">
          Sign Up <img src={arrow_icon} alt="" />
        </button>
      </div>

      <button className={menuOpen ? "hamburger active" : "hamburger"} onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu" type="button">
        <span></span>
        <span></span>
        <span></span>
      </button>
    </nav>
  )
}

export default Navbar
