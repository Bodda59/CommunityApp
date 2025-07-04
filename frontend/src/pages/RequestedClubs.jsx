import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';

function RequestedClubs() {
  const [clubs, setClubs] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRequestedClubs = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Authentication token not found');

        const response = await fetch('http://localhost:8080/api/clubs/getRequestedClubs', {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!response.ok) throw new Error('Failed to fetch requested clubs');

        const data = await response.json();
        setClubs(data);
      } catch (err) {
        setError(err.message || 'An error occurred.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequestedClubs();
  }, []);

  return (
    <Layout>
      <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent text-center mb-10 animate-fade-in">
        Requested Clubs
      </h1>
      {error && (
        <div className="bg-red-600/90 text-white p-3 rounded-md text-center mb-6 animate-shake">
          {error}
        </div>
      )}
      <div className="flex justify-end mb-8">
        <Button onClick={() => navigate('/dashboard')} variant="primary">
          Back to Dashboard
        </Button>
      </div>
      {isLoading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <svg className="animate-spin h-8 w-8 text-indigo-400" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
        </div>
      ) : clubs.length === 0 ? (
        <div className="text-center text-gray-400 text-lg animate-fade-in">
          No requested clubs found.
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 animate-fade-in">
          {clubs.map((club) => (
            <Card
              key={club.id}
              avatar={
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-400 to-pink-400 flex items-center justify-center text-2xl font-bold text-white shadow-lg border-4 border-white/30">
                  {club.name[0]}
                </div>
              }
            >
              <h2 className="text-2xl font-semibold text-white mb-2">{club.name}</h2>
              <p className="text-gray-300 mb-2">{club.description}</p>
              <div className="flex gap-2 mt-2">
                <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-indigo-500/30 text-indigo-200">
                  {club.type}
                </span>
                <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-pink-500/30 text-pink-200">
                  {club.category}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </Layout>
  );
}

export default RequestedClubs;
