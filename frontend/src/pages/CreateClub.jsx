import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Button from '../components/Button';

function CreateClub() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'PUBLIC',
    category: ''
  });
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
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication token not found');

      const response = await fetch('http://localhost:8080/api/clubs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to create club');

      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-lg mx-auto bg-white/10 backdrop-blur-lg p-10 rounded-2xl shadow-2xl border border-white/20 mt-12 animate-fade-in">
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent text-center mb-8">
          Create a New Club
        </h1>
        {error && (
          <div className="bg-red-600/90 text-white p-3 rounded-md text-center mb-6 animate-shake">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="relative">
            <input
              name="name"
              type="text"
              required
              className="peer w-full px-3 py-3 bg-gray-800/80 border border-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-transparent"
              placeholder="Club Name"
              value={formData.name}
              onChange={handleChange}
            />
            <label className="absolute left-3 top-3 text-gray-400 transition-all duration-200 peer-focus:-top-5 peer-focus:text-xs peer-focus:text-indigo-400 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 pointer-events-none">
              Club Name
            </label>
          </div>
          <div className="relative">
            <textarea
              name="description"
              required
              className="peer w-full px-3 py-3 bg-gray-800/80 border border-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-transparent resize-none"
              placeholder="Club Description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
            />
            <label className="absolute left-3 top-3 text-gray-400 transition-all duration-200 peer-focus:-top-5 peer-focus:text-xs peer-focus:text-indigo-400 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 pointer-events-none">
              Club Description
            </label>
          </div>
          <div className="flex gap-4">
            <div className="relative w-1/2">
              <select
                name="type"
                required
                className="peer w-full px-3 py-3 bg-gray-800/80 border border-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={formData.type}
                onChange={handleChange}
              >
                <option value="PUBLIC">Public</option>
                <option value="PRIVATE">Private</option>
              </select>
              <label className="absolute left-3 top-3 text-gray-400 text-xs pointer-events-none">
                Type
              </label>
            </div>
            <div className="relative w-1/2">
              <input
                name="category"
                type="text"
                required
                className="peer w-full px-3 py-3 bg-gray-800/80 border border-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-transparent"
                placeholder="Category"
                value={formData.category}
                onChange={handleChange}
              />
              <label className="absolute left-3 top-3 text-gray-400 transition-all duration-200 peer-focus:-top-5 peer-focus:text-xs peer-focus:text-indigo-400 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 pointer-events-none">
                Category
              </label>
            </div>
          </div>
          <Button type="submit" disabled={isLoading} loading={isLoading} variant="primary" className="w-full">
            Create Club
          </Button>
        </form>
      </div>
    </Layout>
  );
}

export default CreateClub;
