import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import './Auth.css';

function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { register } = useContext(AuthContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }
        setLoading(true);
        try {
            await register(email, password);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
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
                    <Link to="/login" className="auth-tab">Sign In</Link>
                    <button className="auth-tab active" type="button">Create Account</button>
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
                        <div className='input-wrap-auth'>
                            <input 
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Min. 6 characters"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete="new-password"
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
                            id="rememberReg" 
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                        />
                        <label htmlFor="rememberReg" style={{ textTransform: 'none', fontWeight: '500', color: '#cbd5e1', letterSpacing: 'normal', fontSize: '13px', cursor: 'pointer' }}>
                            Remember device for 30 days
                        </label>
                    </div> */}

                    <button type="submit" className="auth-btn-primary" disabled={loading}>
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

                <div className="auth-footer">
                    Already have an account? <Link to="/login">Sign in</Link>
                </div>
            </div>
        </div>
    );
}

export default Register;
