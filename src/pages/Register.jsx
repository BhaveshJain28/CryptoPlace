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
                <div className="auth-brand">
                    <div className="auth-logo-box">
                        <img src={logo} alt="CryptoPlace" style={{width:'32px', height:'32px', filter:'brightness(0) invert(1)'}} />
                    </div>
                    <h2>CryptoPlace</h2>
                    <p>Crypto tracking, watchlists & portfolio simulation</p>
                </div>

                <div className="auth-tabs">
                    <Link to="/login" className="auth-tab">Sign In</Link>
                    <div className="auth-tab active">Create Account</div>
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
                            >
                                {showPassword ? 'HIDE' : 'SHOW'}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="auth-btn-primary" disabled={loading}>
                        {loading ? 'Creating Account...' : 'Create Account →'}
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
