import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CreateClub from './pages/CreateClub';
import RequestedClubs from './pages/RequestedClubs';
import Club from './pages/Club';
import Post from './pages/Post';
import KnowMe from './pages/KnowMe';

// Placeholder import for Event management page (to be created)
// import ClubEvents from './pages/ClubEvents';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create-club" element={<CreateClub />} />
        <Route path="/requested-clubs" element={<RequestedClubs />} />
        <Route path="/club/:id" element={<Club />} />
        <Route path="/club/:id/post" element={<Post />} />
        <Route path="/about" element={<KnowMe />} />
        <Route path="/" element={<KnowMe />} />
        {/* <Route path="/club/:id/chat" element={<ClubChat />} /> */}
        {/* <Route path="/club/:id/events" element={<ClubEvents />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
