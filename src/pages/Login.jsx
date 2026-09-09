import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import './Auth.css';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-terminal">
                <div className="auth-brand">
                    <div className="auth-logo-box">
                        <img src={logo} alt="CryptoPlace" style={{width:'32px', height:'32px', filter:'brightness(0) invert(1)'}} />
                    </div>
                    <h2>CryptoPlace</h2>
                    <p>Crypto tracking, watchlists & portfolio simulation</p>
                </div>

                <div className="auth-tabs">
                    <div className="auth-tab active">Sign In</div>
                    <Link to="/register" className="auth-tab">Create Account</Link>
                </div>

                {error && (
                    <div className="auth-error">{error}</div>
                )}

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="auth-form-group">
                        <label>EMAIL ADDRESS</label>
                        <input 
                            type="email" 
                            placeholder="your@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                        />
                    </div>
                    <div className="auth-form-group">
                        <label>PASSWORD</label>
                        <div className="input-wrap">
                            <input 
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete="current-password"
                            />
                            <button 
                                type="button" 
                                className="show-pw-btn" 
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? 'HIDE' : 'SHOW'}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="auth-btn-primary" disabled={loading}>
                        {loading ? 'Signing In...' : 'Sign In →'}
                    </button>
                </form>

                <div className="auth-footer">
                    Don't have an account? <Link to="/register">Create one</Link>
                </div>
            </div>
        </div>
    );
}

export default Login;
