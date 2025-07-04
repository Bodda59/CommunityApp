import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Button from '../components/Button';

function Register() {
  const [formData, setFormData] = useState({ username: '', password: '', fullName: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8080/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Registration failed');

      navigate('/login');
    } catch (err) {
      setError(err.message || 'An error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto bg-white/10 backdrop-blur-lg p-10 rounded-2xl shadow-2xl border border-white/20 mt-12 animate-fade-in">
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent text-center mb-8">
          Create Account
        </h1>
        {error && (
          <div className="bg-red-600/90 text-white p-3 rounded-md text-center mb-6 animate-shake">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="relative">
            <input
              name="username"
              type="text"
              required
              className="peer w-full px-3 py-3 bg-gray-800/80 border border-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-transparent"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
            />
            <label className="absolute left-3 top-3 text-gray-400 transition-all duration-200 peer-focus:-top-5 peer-focus:text-xs peer-focus:text-indigo-400 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 pointer-events-none">
              Username
            </label>
          </div>
          <div className="relative">
            <input
              name="fullName"
              type="text"
              required
              className="peer w-full px-3 py-3 bg-gray-800/80 border border-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-transparent"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={handleChange}
            />
            <label className="absolute left-3 top-3 text-gray-400 transition-all duration-200 peer-focus:-top-5 peer-focus:text-xs peer-focus:text-indigo-400 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 pointer-events-none">
              Full Name
            </label>
          </div>
          <div className="relative">
            <input
              name="password"
              type="password"
              required
              className="peer w-full px-3 py-3 bg-gray-800/80 border border-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-transparent"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
            />
            <label className="absolute left-3 top-3 text-gray-400 transition-all duration-200 peer-focus:-top-5 peer-focus:text-xs peer-focus:text-indigo-400 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 pointer-events-none">
              Password
            </label>
          </div>
          <Button type="submit" disabled={isLoading} loading={isLoading} variant="primary" className="w-full">
            Register
          </Button>
        </form>
        <div className="text-center mt-6 text-gray-300">
          Already have an account?{' '}
          <span className="text-indigo-400 hover:underline cursor-pointer" onClick={() => navigate('/login')}>
            Login
          </span>
        </div>
      </div>
    </Layout>
  );
}

export default Register;
