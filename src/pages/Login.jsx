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
                {/* <div className="auth-top-bar">
                    <div className="status-left">
                        <div className="status-dot"></div>
                        SYSTEM • ONLINE
                    </div>
                    <div>TLS 1.3 | AES-256</div>
                </div> */}

                <div className="auth-brand">
                    <img src={logo} alt="Cryptoplace" />
                    <p>Crypto tracking, watchlists & portfolio simulation</p>
                </div>

                <div className="auth-tabs">
                    <button className="auth-tab active" type="button">Sign In</button>
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
                        <div className="input-wrap-auth">
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
                                tabIndex="-1"
                            >
                                {showPassword ? 'HIDE' : 'SHOW'}
                            </button>
                        </div>
                    </div>

                    {/* <div className="remember-row">
                        <input 
                            type="checkbox" 
                            id="remember" 
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                        />
                        <label htmlFor="remember" style={{ textTransform: 'none', fontWeight: '500', color: '#cbd5e1', letterSpacing: 'normal', fontSize: '13px', cursor: 'pointer' }}>
                            Remember device for 30 days
                        </label>
                    </div> */}

                    <button type="submit" className="auth-btn-primary" disabled={loading}>
                        {loading ? 'Signing In...' : 'Sign In'}
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
