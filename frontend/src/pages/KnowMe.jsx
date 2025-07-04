import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Button from '../components/Button';

function KnowMe() {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
        <h1 className="text-6xl font-extrabold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-6 drop-shadow-lg animate-gradient-move">
          Welcome to ClubHub
        </h1>
        <p className="text-2xl text-gray-200 max-w-2xl mx-auto mb-10 animate-fade-in-slow">
          Connect, collaborate, and create with <span className="font-bold text-indigo-300">ClubHub</span> – the ultimate platform for building vibrant communities around your passions.
        </p>
        <div className="space-x-6">
          <Button onClick={() => navigate('/login')} variant="primary">
            Login
          </Button>
          <Button onClick={() => navigate('/register')} variant="secondary">
            Sign Up
          </Button>
        </div>
      </div>
    </Layout>
  );
}

export default KnowMe;
