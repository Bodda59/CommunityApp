import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';

function Dashboard() {
  const [clubs, setClubs] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [clubOfWeek, setClubOfWeek] = useState(null);
  const navigate = useNavigate();
  const searchTimeout = useRef();

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Authentication token not found');
        const response = await fetch('http://localhost:8080/api/clubs/userClubs', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to fetch clubs');
        const data = await response.json();
        setClubs(data);
        // Club of the Week: pick random
        if (data.length > 0) {
          setClubOfWeek(data[Math.floor(Math.random() * data.length)]);
        }
      } catch (err) {
        setError(err.message || 'An error occurred.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchClubs();
  }, []);

  // Debounced search on every character
  useEffect(() => {
    if (search === '') {
      setSearchResults([]);
      setSearchError('');
      setSearchLoading(false);
      return;
    }
    setSearchLoading(true);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {
      setSearchError('');
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Authentication token not found');
        const response = await fetch(`http://localhost:8080/api/clubs/search?name=${encodeURIComponent(search)}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const text = await response.text();
        let data = [];
        try {
          data = text ? JSON.parse(text) : [];
        } catch (e) {
          data = [];
        }
        setSearchResults(data);
      } catch (err) {
        setSearchError(err.message || 'Search failed.');
      } finally {
        setSearchLoading(false);
      }
    }, 350); // debounce 350ms
    return () => clearTimeout(searchTimeout.current);
  }, [search]);

  const handleSearchInput = (e) => {
    setSearch(e.target.value);
  };

  return (
    <Layout>
      <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent text-center mb-10 animate-fade-in">
        Your Clubs
      </h1>
      {/* Search Bar */}
      <form onSubmit={e => e.preventDefault()} className="flex items-center gap-4 mb-8 max-w-xl mx-auto animate-fade-in">
        <input
          type="text"
          value={search}
          onChange={handleSearchInput}
          placeholder="Search for clubs..."
          className="flex-1 px-4 py-3 rounded-lg bg-gray-800/80 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-400"
        />
        <Button type="submit" variant="primary" loading={searchLoading} disabled={searchLoading}>
          Search
        </Button>
      </form>
      {searchError && (
        <div className="bg-red-600/90 text-white p-3 rounded-md text-center mb-6 animate-shake">
          {searchError}
        </div>
      )}
      {/* Search Results */}
      {search && !searchLoading && searchResults.length === 0 && !searchError && (
        <div className="mb-12 animate-fade-in text-center text-gray-400 text-lg">No clubs found.</div>
      )}
      {searchResults.length > 0 && (
        <div className="mb-12 animate-fade-in">
          <h2 className="text-2xl font-bold text-indigo-300 mb-4">Search Results</h2>
          <div className="grid gap-8 md:grid-cols-2">
            {searchResults.map((club) => (
              <Card
                key={club.id}
                onClick={() => navigate(`/club/${club.id}`)}
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
        </div>
      )}
      
      <div className="flex justify-end mb-8 space-x-4">
        <Button onClick={() => navigate('/create-club')} variant="primary">
          + Create Club
        </Button>
        <Button onClick={() => navigate('/requested-clubs')} variant="secondary">
          Requested Clubs
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
          You are not a member of any clubs yet.
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 animate-fade-in">
          {clubs.map((club) => (
            <Card
              key={club.id}
              onClick={() => navigate(`/club/${club.id}`)}
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

export default Dashboard;
