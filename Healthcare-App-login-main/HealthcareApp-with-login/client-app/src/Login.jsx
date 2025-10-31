// client-app/src/Login.jsx
import React, { useState } from 'react';
import axios from 'axios';

const SERVER_BASE_URL = "http://localhost:7000"; // Use your local or Render URL

const Login = ({ onLoginSuccess, onSwitchToRegister }) => {
    const [formData, setFormData] = useState({
        identifier: '', // Can be username or email
        password: ''
    });
    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        try {
            const response = await axios.post(`${SERVER_BASE_URL}/api/login`, formData);
            
            // If login is successful, call the prop function
            onLoginSuccess(response.data.user); 
        } catch (error) {
            const msg = error.response?.data?.status || 'Login failed.';
            setMessage(`Error: ${msg}`);
        }
    };

    return (
        <div className="card p-4 mx-auto" style={{ maxWidth: '450px' }}>
            <h2 className="text-center mb-4">User Login</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <input
                        type="text"
                        name="identifier"
                        className="form-control"
                        placeholder="Username or Email"
                        value={formData.identifier}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="mb-3">
                    <input
                        type="password"
                        name="password"
                        className="form-control"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>
                <button type="submit" className="btn btn-success w-100 mb-3">Login</button>
            </form>
            {message && <div className="alert alert-danger mt-3">{message}</div>}
            <p className="text-center mt-3">
                Don't have an account? <span className="text-primary" style={{cursor: 'pointer'}} onClick={onSwitchToRegister}>Register here</span>
            </p>
        </div>
    );
};

export default Login;