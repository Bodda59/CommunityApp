import React from 'react';
import { Link } from 'react-router-dom';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-indigo-950 text-white relative overflow-x-hidden">
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/40 via-transparent to-transparent animate-gradient-move" />
      </div>
      <header className="bg-gray-900/80 backdrop-blur-md shadow-2xl sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link to="/dashboard" className="text-3xl font-extrabold bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent tracking-tight">
            ClubHub
          </Link>
          <nav className="space-x-4">
            <Link to="/dashboard" className="text-gray-300 hover:text-white transition duration-300 font-medium">
              Dashboard
            </Link>
            <Link to="/create-club" className="text-gray-300 hover:text-white transition duration-300 font-medium">
              Create Club
            </Link>
            <Link to="/requested-clubs" className="text-gray-300 hover:text-white transition duration-300 font-medium">
              Requested Clubs
            </Link>
          </nav>
        </div>
      </header>
      <main className="py-16 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          {children}
        </div>
      </main>
      <footer className="bg-gray-900/90 py-8 mt-12 relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-400">
          <p>© 2025 ClubHub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
