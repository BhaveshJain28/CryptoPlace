import React, { useState } from 'react'
import './Navbar.css'
import logo from '../../assets/logo.png'
import { useContext } from 'react'
import { CoinContext } from '../../context/CoinContext'
import arrow_icon from '../../assets/arrow_icon.png'
import { Link } from 'react-router-dom'

function Navbar() {
  const {setCurrency} = useContext(CoinContext);
  const [menuOpen, setMenuOpen] = useState(false);

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
        <Link to={'/'} onClick={() => setMenuOpen(false)}><li>Home</li></Link>
        <li onClick={() => setMenuOpen(false)}>Features</li>
        <li onClick={() => setMenuOpen(false)}>Pricing</li>
        <li onClick={() => setMenuOpen(false)}>Blog</li>
      </ul>

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

      <div className={menuOpen ? "hamburger active" : "hamburger"} onClick={() => setMenuOpen(!menuOpen)}>
        <span></span>
        <span></span>
        <span></span>
      </div>
    </nav>
  )
}

export default Navbar
