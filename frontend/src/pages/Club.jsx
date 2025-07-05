import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';

function Club() {
  const [club, setClub] = useState(null);
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  const [requestStatus, setRequestStatus] = useState(null);
  const [requests, setRequests] = useState([]);
  const [members, setMembers] = useState([]);
  const [showRequests, setShowRequests] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [modal, setModal] = useState(null);
  const [events, setEvents] = useState([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', description: '', startTime: '', endTime: '', location: '' });
  const [eventError, setEventError] = useState('');
  const [eventLoading, setEventLoading] = useState(false);
  const [rsvps, setRsvps] = useState({});
  const [rsvpLists, setRsvpLists] = useState({});
  const [rsvpLoading, setRsvpLoading] = useState({});
  const [rsvpError, setRsvpError] = useState({});
  const [voterModal, setVoterModal] = useState(null);
  const [eventDeleteLoading, setEventDeleteLoading] = useState({});
  const [eventDeleteError, setEventDeleteError] = useState({});
  const [polls, setPolls] = useState([]);
  const [pollsLoading, setPollsLoading] = useState(true);
  const [pollsError, setPollsError] = useState('');
  const [showCreatePoll, setShowCreatePoll] = useState(false);
  const [createPollData, setCreatePollData] = useState({ question: '', options: ['', ''], closesAt: '', isAnonymous: false });
  const [createPollLoading, setCreatePollLoading] = useState(false);
  const [createPollError, setCreatePollError] = useState('');
  const [voteLoading, setVoteLoading] = useState({});
  const [voteError, setVoteError] = useState({});
  const [userVoted, setUserVoted] = useState({});
  const { id } = useParams();
  const navigate = useNavigate();
  const userId = Number(localStorage.getItem('userId'));
  const [selectedTab, setSelectedTab] = useState('posts');

  useEffect(() => {
    const fetchClubAndPosts = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }
        const [clubResponse, postsResponse] = await Promise.all([
          fetch(`http://localhost:8080/api/clubs/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` },
          }),
          fetch(`http://localhost:8080/api/posts/club/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` },
          }),
        ]);
        if (!clubResponse.ok) throw new Error('Failed to fetch club details');
        if (!postsResponse.ok) throw new Error('Failed to fetch posts');
        const clubData = await clubResponse.json();
        const postsData = await postsResponse.json();
        setClub(clubData);
        setPosts(postsData);
        if (clubData.admin) {
          fetchRequestsAndMembers(token);
        }
        if (!clubData.member && clubData.type === 'PRIVATE') {
          await fetchMembershipRequestStatus(token, id);
        }
      } catch (err) {
        setError(err.message || 'Something went wrong.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchClubAndPosts();
  }, [id]);

  const fetchRequestsAndMembers = async (token) => {
    try {
      const reqRes = await fetch(`http://localhost:8080/api/memberships/club/${id}/requests`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (reqRes.ok) {
        const allRequests = await reqRes.json();
        setRequests(allRequests);
      }
      const clubRes = await fetch(`http://localhost:8080/api/clubs/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (clubRes.ok) {
        const clubData = await clubRes.json();
        setMembers(clubData.members || []);
      }
    } catch (e) {}
  };

  const handleProcessRequest = async (requestId, accept) => {
    setActionLoading(true);
    setActionError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/memberships/process/${requestId}?accept=${accept}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to process request');
      setRequests(requests.filter(r => r.id !== requestId));
    } catch (err) {
      setActionError(err.message || 'Failed to process request');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePromote = async (userId) => {
    setActionLoading(true);
    setActionError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/memberships/make-admin`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, clubId: id }),
      });
      if (!response.ok) throw new Error('Failed to promote member');
      setMembers(members.map(m => m.id === userId ? { ...m, admin: true } : m));
      if (userId === userId) {
        setIsLoading(true);
        try {
          const clubResponse = await fetch(`http://localhost:8080/api/clubs/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          if (clubResponse.ok) {
            const clubData = await clubResponse.json();
            setClub(clubData);
          }
        } finally {
          setIsLoading(false);
        }
      }
    } catch (err) {
      setActionError(err.message || 'Failed to promote member');
    } finally {
      setActionLoading(false);
    }
  };

  const handleKick = async (userId) => {
    setActionLoading(true);
    setActionError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/memberships/kick?clubId=${id}&adminId=${userId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to kick member');
      setMembers(members.filter(m => m.id !== userId));
    } catch (err) {
      setActionError(err.message || 'Failed to kick member');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeletePost = async (postId) => {
    setActionLoading(true);
    setActionError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/posts/delete/${postId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to delete post');
      setPosts(posts.filter(p => p.id !== postId));
    } catch (err) {
      setActionError(err.message || 'Failed to delete post');
    } finally {
      setActionLoading(false);
    }
  };

  const fetchMembershipRequestStatus = async (token, clubId) => {
    try {
      const response = await fetch('http://localhost:8080/api/memberships/user/me', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) return;
      const requests = await response.json();
      const req = requests.find(r => r.clubId === Number(clubId));
      if (req) setRequestStatus(req.status);
    } catch (e) {}
  };

  const handleJoin = async () => {
    setActionLoading(true);
    setActionError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');
      const response = await fetch(`http://localhost:8080/api/memberships/club/${id}/join`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || 'Failed to join/follow club');
      }
      const data = await response.json();
      if (club.type === 'PUBLIC') {
        setClub({ ...club, member: true });
      } else {
        setRequestStatus(data.status);
      }
    } catch (err) {
      setActionError(err.message || 'Failed to join/follow club');
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:8080/api/events/club/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setEvents(data);
          for (const event of data) {
            fetchEventRsvps(event.id);
          }
        }
      } catch (e) {}
    };
    fetchEvents();
  }, [id]);

  const fetchEventRsvps = async (eventId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:8080/api/events/${eventId}/rsvps`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setRsvpLists(prev => ({ ...prev, [eventId]: data }));
        const counts = { GOING: 0, NOT_GOING: 0, MAYBE: 0 };
        let userStatus = null;
        data.forEach(rsvp => {
          if (rsvp.user && String(rsvp.user.id) === String(userId)) userStatus = rsvp.status;
          if (rsvp.status) counts[rsvp.status] = (counts[rsvp.status] || 0) + 1;
        });
        setRsvps(prev => ({ ...prev, [eventId]: { counts, userStatus } }));
      }
    } catch (e) {}
  };

  const handleCreateEvent = async () => {
    setEventLoading(true);
    setEventError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:8080/api/events/club/${id}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newEvent,
          startTime: newEvent.startTime ? new Date(newEvent.startTime).toISOString() : null,
          endTime: newEvent.endTime ? new Date(newEvent.endTime).toISOString() : null,
        }),
      });
      if (!res.ok) throw new Error('Failed to create event');
      setShowEventModal(false);
      setNewEvent({ title: '', description: '', startTime: '', endTime: '', location: '' });
      const data = await res.json();
      setEvents(prev => [...prev, data]);
    } catch (err) {
      setEventError(err.message || 'Failed to create event');
    } finally {
      setEventLoading(false);
    }
  };

  const handleRsvp = async (eventId, status) => {
    setRsvpLoading(prev => ({ ...prev, [eventId]: true }));
    setRsvpError(prev => ({ ...prev, [eventId]: '' }));
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:8080/api/events/${eventId}/rsvp?status=${status}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) {
        let msg = 'Failed to RSVP';
        try { msg = await res.text(); } catch {}
        setRsvpError(prev => ({ ...prev, [eventId]: msg }));
        return;
      }
      fetchEventRsvps(eventId);
    } catch (e) {
      setRsvpError(prev => ({ ...prev, [eventId]: 'Network error' }));
    } finally {
      setRsvpLoading(prev => ({ ...prev, [eventId]: false }));
    }
  };

  const groupRsvpsByStatus = (rsvpList = []) => {
    const grouped = { GOING: [], MAYBE: [], NOT_GOING: [] };
    rsvpList.forEach(rsvp => {
      if (rsvp.status && grouped[rsvp.status]) {
        grouped[rsvp.status].push(rsvp.user);
      }
    });
    return grouped;
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event? This cannot be undone.')) return;
    setEventDeleteLoading(prev => ({ ...prev, [eventId]: true }));
    setEventDeleteError(prev => ({ ...prev, [eventId]: '' }));
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:8080/api/events/${eventId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) {
        let msg = 'Failed to delete event';
        try { msg = await res.text(); } catch {}
        setEventDeleteError(prev => ({ ...prev, [eventId]: msg }));
        return;
      }
      setEvents(prev => prev.filter(e => e.id !== eventId));
    } catch (e) {
      setEventDeleteError(prev => ({ ...prev, [eventId]: 'Network error' }));
    } finally {
      setEventDeleteLoading(prev => ({ ...prev, [eventId]: false }));
    }
  };

  const fetchPolls = async () => {
    setPollsLoading(true);
    setPollsError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:8080/api/polls/club/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch polls');
      const data = await res.json();
      setPolls(data);
      const votedMap = {};
      data.forEach(poll => {
        if (poll.options.some(opt => Array.isArray(opt.voterIds) && opt.voterIds.includes(userId))) {
          votedMap[poll.pollId] = true;
        }
      });
      setUserVoted(votedMap);
    } catch (e) {
      setPollsError(e.message || 'Failed to fetch polls');
    } finally {
      setPollsLoading(false);
    }
  };

  useEffect(() => {
    fetchPolls();
    const interval = setInterval(fetchPolls, 30000);
    return () => clearInterval(interval);
  }, [id]);

  const handleVote = async (pollId, optionId) => {
    setVoteLoading(prev => ({ ...prev, [pollId]: true }));
    setVoteError(prev => ({ ...prev, [pollId]: '' }));
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:8080/api/polls/${pollId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ optionId }),
      });
      if (!res.ok) {
        let msg = 'Could not vote.';
        try { msg = await res.text(); } catch {}
        throw new Error(msg);
      }
      setUserVoted(prev => ({ ...prev, [pollId]: true }));
      fetchPolls();
    } catch (e) {
      setVoteError(prev => ({ ...prev, [pollId]: e.message || 'Could not vote.' }));
    } finally {
      setVoteLoading(prev => ({ ...prev, [pollId]: false }));
    }
  };

  const handleCreatePoll = async () => {
    setCreatePollLoading(true);
    setCreatePollError('');
    try {
      if (!createPollData.question || createPollData.options.some(opt => !opt)) {
        throw new Error('Fill all fields');
      }
      const token = localStorage.getItem('token');
      const payload = {
        ...createPollData,
        closesAt: createPollData.closesAt ? new Date(createPollData.closesAt).toISOString() : null,
      };
      const res = await fetch(`http://localhost:8080/api/polls/club/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        let msg = 'Could not create poll.';
        try { msg = await res.text(); } catch {}
        throw new Error(msg);
      }
      setShowCreatePoll(false);
      setCreatePollData({ question: '', options: ['', ''], closesAt: '', isAnonymous: false });
      fetchPolls();
    } catch (e) {
      setCreatePollError(e.message || 'Could not create poll.');
    } finally {
      setCreatePollLoading(false);
    }
  };

  const handleDeletePoll = async (pollId) => {
    setVoteLoading(prev => ({ ...prev, [pollId]: true }));
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:8080/api/polls/${pollId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete poll');
      fetchPolls();
    } catch (e) {
      alert(e.message || 'Failed to delete poll');
    } finally {
      setVoteLoading(prev => ({ ...prev, [pollId]: false }));
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto mt-12 p-6 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">{club?.name || 'Club'}</h1>
          <Button 
            onClick={() => navigate('/dashboard')} 
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
          >
            Back to Dashboard
          </Button>
        </div>
        {error && (
          <div className="bg-red-500/90 text-white p-4 rounded-lg mb-6 animate-pulse">
            {error}
          </div>
        )}
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <svg className="animate-spin h-8 w-8 text-indigo-500" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
          </div>
        ) : club ? (
          <div className="space-y-8">
            <Card className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                  {club.name[0]}
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-white">{club.name}</h2>
                  <p className="text-gray-300 text-sm">{club.description}</p>
                </div>
              </div>
              <div className="flex gap-2 mb-4">
                <span className="pxibb-3 py-1 text-xs font-semibold rounded-full bg-indigo-600/30 text-indigo-100">
                  {club.type}
                </span>
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-purple-600/30 text-purple-100">
                  {club.category}
                </span>
              </div>
              {!club.member && (
                <div className="mt-6 flex flex-col items-start gap-2">
                  {club.type === 'PUBLIC' && (
                    <Button
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg"
                      onClick={handleJoin}
                      loading={actionLoading}
                      disabled={actionLoading}
                    >
                      Follow
                    </Button>
                  )}
                  {club.type === 'PRIVATE' && (
                    <>
                      {requestStatus === 'PENDING' ? (
                        <Button 
                          className="bg-gray-600 text-white px-4 py-2 rounded-lg cursor-not-allowed"
                          disabled 
                          loading
                        >
                          Request Pending
                        </Button>
                      ) : requestStatus === 'ACCEPTED' ? (
                        <span className="text-green-400 font-semibold">Request Accepted</span>
                      ) : requestStatus === 'REJECTED' ? (
                        <div className="flex flex-col gap-2">
                          <span className="text-red-400 font-semibold">Request Rejected</span>
                          <Button
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg"
                            onClick={handleJoin}
                            loading={actionLoading}
                            disabled={actionLoading}
                          >
                            Request to Join Again
                          </Button>
                          <span className="text-xs text-gray-400">You were previously rejected from this club.</span>
                        </div>
                      ) : (
                        <Button
                          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg"
                          onClick={handleJoin}
                          loading={actionLoading}
                          disabled={actionLoading}
                        >
                          Request to Join
                        </Button>
                      )}
                    </>
                  )}
                  {actionError && (
                    <div className="text-red-400 text-sm">{actionError}</div>
                  )}
                </div>
              )}
              {club.admin && club.member && (
                <div className="mt-6">
                  <Button 
                    onClick={() => navigate(`/club/${id}/post`)} 
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
                  >
                    Create Post
                  </Button>
                </div>
              )}
            </Card>
            {club && club.admin && (
              <Card className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Admin Panel</h2>
                <div className="flex gap-4 mb-4">
                  <Button 
                    className={`${showRequests ? 'bg-indigo-600' : 'bg-gray-700'} hover:bg-indigo-700 text-white px-4 py-2 rounded-lg`}
                    onClick={() => setShowRequests(!showRequests)}
                  >
                    Membership Requests
                  </Button>
                  <Button 
                    className={`${showMembers ? 'bg-indigo-600' : 'bg-gray-700'} hover:bg-indigo-700 text-white px-4 py-2 rounded-lg`}
                    onClick={() => setShowMembers(!showMembers)}
                  >
                    Members
                  </Button>
                </div>
                {showRequests && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-white mb-2">Pending Requests</h3>
                    {requests.length === 0 ? (
                      <div className="text-gray-400">No pending requests.</div>
                    ) : (
                      <ul className="space-y-2">
                        {requests.map(req => (
                          <li key={req.id} className="flex items-center justify-between bg-gray-700/50 rounded-lg px-4 py-2">
                            <span>
                              <span className="font-semibold text-white">{req.fullName}</span>
                              <span className="ml-2 text-gray-400 text-sm">{req.email}</span>
                            </span>
                            <div className="flex gap-2">
                              <Button 
                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg"
                                onClick={() => handleProcessRequest(req.id, true)} 
                                loading={actionLoading}
                              >
                                Accept
                              </Button>
                              <Button 
                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg"
                                onClick={() => handleProcessRequest(req.id, false)} 
                                loading={actionLoading}
                              >
                                Reject
                              </Button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
                {showMembers && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Members</h3>
                    {members.length === 0 ? (
                      <div className="text-gray-400">No members found.</div>
                    ) : (
                      <ul className="space-y-2">
                        {members.map(m => (
                          <li key={m.id} className="flex items-center justify-between bg-gray-700/50 rounded-lg px-4 py-2">
                            <span>
                              <span className="font-semibold text-white">{m.fullName}</span>
                              <span className="ml-2 text-gray-400 text-sm">{m.email}</span>
                              {m.admin && <span className="ml-2 text-xs bg-indigo-600/50 text-indigo-100 px-2 py-1 rounded">Admin</span>}
                            </span>
                            <div className="flex gap-2">
                              {!m.admin && (
                                <Button 
                                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-lg"
                                  onClick={() => handlePromote(m.id)} 
                                  loading={actionLoading}
                                >
                                  Make Admin
                                </Button>
                              )}
                              {(m.id !== userId && (!m.admin || (m.admin && !club.admin))) && (
                                <Button 
                                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg"
                                  onClick={() => handleKick(m.id)} 
                                  loading={actionLoading}
                                >
                                  Kick
                                </Button>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
                {actionError && <div className="text-red-400 mt-2">{actionError}</div>}
              </Card>
            )}
            <div className="flex justify-center gap-2 mb-6 border-b border-gray-700">
              {[
                { key: 'posts', label: 'Posts' },
                { key: 'events', label: 'Events' },
                { key: 'polls', label: 'Polls' },
              ].map(tab => (
                <button
                  key={tab.key}
                  className={`px-6 py-2 font-semibold text-sm transition-colors duration-200
                    ${selectedTab === tab.key 
                      ? 'border-b-2 border-indigo-500 text-indigo-400' 
                      : 'text-gray-400 hover:text-indigo-300'}`}
                  onClick={() => setSelectedTab(tab.key)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            {selectedTab === 'posts' && (
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Club Posts</h3>
                {posts.length === 0 ? (
                  <p className="text-gray-400 text-center">No posts yet.</p>
                ) : (
                  <div className="space-y-4">
                    {posts.map((post) => (
                      <Card key={post.id} className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-6">
                        <h4 className="text-lg font-medium text-white mb-2">{post.title}</h4>
                        <p className="text-gray-300 mb-3">{post.content}</p>
                        {post.link && (
                          <a
                            href={post.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-400 hover:text-indigo-300 underline text-sm"
                          >
                            {post.link}
                          </a>
                        )}
                        <div className="flex gap-2 mt-3">
                          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-indigo-600/30 text-indigo-100">
                            {post.type}
                          </span>
                          {post.eventDateTime && (
                            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-purple-600/30 text-purple-100">
                              Event: {new Date(post.eventDateTime).toLocaleString()}
                            </span>
                          )}
                        </div>
                        {club.admin && (
                          <div className="flex gap-2 mt-4">
                            <Button
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg"
                              onClick={() => {
                                if (window.confirm('Are you sure you want to delete this post?')) handleDeletePost(post.id);
                              }}
                              loading={actionLoading}
                            >
                              Delete
                            </Button>
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
            {selectedTab === 'events' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-white">Events</h2>
                  {club && club.admin && (
                    <Button 
                      onClick={() => setShowEventModal(true)} 
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg"
                    >
                      + Create Event
                    </Button>
                  )}
                </div>
                {events.length === 0 ? (
                  <div className="text-gray-400">No events yet.</div>
                ) : (
                  <div className="space-y-4">
                    {events.map(event => {
                      const grouped = groupRsvpsByStatus(rsvpLists[event.id]);
                      return (
                        <Card key={event.id} className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-6">
                          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                            <div>
                              <div className="font-semibold text-lg text-white">{event.title}</div>
                              <div className="text-gray-300 text-sm">{event.description}</div>
                              <div className="text-gray-400 text-sm">{event.location} | {event.startTime ? new Date(event.startTime).toLocaleString() : ''} - {event.endTime ? new Date(event.endTime).toLocaleString() : ''}</div>
                              <div className="text-xs text-gray-500">Created by: {event.createdBy?.name || event.createdBy?.username}</div>
                            </div>
                            <div className="mt-4 md:mt-0 md:text-right w-full md:w-auto">
                              {['GOING', 'MAYBE', 'NOT_GOING'].map(status => (
                                <div key={status} className="mb-2">
                                  <span className={
                                    status === 'GOING' ? 'text-green-400' :
                                    status === 'MAYBE' ? 'text-yellow-400' :
                                    'text-red-400'
                                  }>
                                    {status === 'GOING' ? 'Going' : status === 'MAYBE' ? 'Maybe' : 'Not Going'}: {rsvps[event.id]?.counts?.[status] ?? 0}
                                  </span>
                                  {club && club.admin && grouped[status] && grouped[status].length > 0 && (
                                    <Button
                                      className="ml-2 bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded-lg text-xs"
                                      onClick={() => setVoterModal({ eventId: event.id, status, voters: grouped[status] })}
                                    >
                                      View Voters
                                    </Button>
                                  )}
                                </div>
                              ))}
                              {club && club.member && (
                                <div className="flex flex-col gap-2 mt-2">
                                  <span className="text-sm text-gray-300">Your RSVP: <b>{rsvps[event.id]?.userStatus ? rsvps[event.id].userStatus : 'None'}</b></span>
                                  <Button 
                                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm"
                                    onClick={() => handleRsvp(event.id, 'GOING')} 
                                    disabled={rsvpLoading[event.id]}
                                  >
                                    Going
                                  </Button>
                                  <Button 
                                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded-lg text-sm"
                                    onClick={() => handleRsvp(event.id, 'MAYBE')} 
                                    disabled={rsvpLoading[event.id]}
                                  >
                                    Maybe
                                  </Button>
                                  <Button 
                                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-sm"
                                    onClick={() => handleRsvp(event.id, 'NOT_GOING')} 
                                    disabled={rsvpLoading[event.id]}
                                  >
                                    Not Going
                                  </Button>
                                  {rsvpError[event.id] && <span className="text-red-400 text-xs mt-1">{rsvpError[event.id]}</span>}
                                </div>
                              )}
                            </div>
                          </div>
                          {club.admin && (
                            <Button
                              className="mt-4 bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded-lg text-xs"
                              onClick={() => handleDeleteEvent(event.id)}
                              loading={eventDeleteLoading[event.id]}
                            >
                              Delete Event
                            </Button>
                          )}
                          {eventDeleteError[event.id] && <span className="text-red-400 text-xs ml-2">{eventDeleteError[event.id]}</span>}
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
            {selectedTab === 'polls' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-white">Polls</h2>
                  {club && club.admin && (
                    <Button 
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg"
                      onClick={() => setShowCreatePoll(true)}
                    >
                      Create Poll
                    </Button>
                  )}
                </div>
                {pollsLoading ? (
                  <div className="text-gray-400">Loading polls...</div>
                ) : pollsError ? (
                  <div className="text-red-500">{pollsError}</div>
                ) : (
                  <div>
                    {polls.length === 0 && <div className="text-gray-400">No polls yet.</div>}
                    {polls.map((poll, idx) => {
                      const closesAtDate = poll.closesAt ? new Date(poll.closesAt) : null;
                      const isOpen = !closesAtDate || closesAtDate > new Date();
                      return (
                        <Card 
                          key={poll.pollId} 
                          className={`bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 ${idx > 0 ? 'mt-6' : ''}`}
                        >
                          <div className="font-semibold text-lg text-white mb-2">{poll.question}</div>
                          <div className="mb-3">
                            {isOpen ? (
                              <span className="text-green-400 font-semibold">
                                Open{closesAtDate ? ` until ${closesAtDate.toLocaleString()}` : ''}
                              </span>
                            ) : (
                              <span className="text-red-400 font-semibold">Closed</span>
                            )}
                          </div>
                          {isOpen && userVoted[poll.pollId] && (
                            <Button
                              className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded-lg mb-3"
                              onClick={() => setUserVoted(prev => ({ ...prev, [poll.pollId]: false }))}
                            >
                              Change Vote
                            </Button>
                          )}
                          {poll.isClosed || userVoted[poll.pollId] ? (
                            <div>
                              <div className="mb-2 text-sm text-gray-400">Results:</div>
                              {poll.options.map(opt => (
                                <div key={opt.id} className="flex items-center mb-2">
                                  <span className="w-2/3 text-gray-200">{opt.text}</span>
                                  <span className="ml-2 font-bold text-indigo-400">{opt.voteCount}</span>
                                  <div className="ml-4 w-1/3 bg-gray-700 rounded h-3">
                                    <div
                                      className="bg-indigo-500 h-3 rounded"
                                      style={{ width: poll.totalVotes ? `${(opt.voteCount / poll.totalVotes) * 100}%` : '0%' }}
                                    ></div>
                                  </div>
                                </div>
                              ))}
                              <div className="text-xs text-gray-500">Total votes: {poll.totalVotes}</div>
                            </div>
                          ) : (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {poll.options.map(opt => (
                                <Button
                                  key={opt.id}
                                  className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded-lg flex items-center"
                                  disabled={voteLoading[poll.pollId]}
                                  onClick={() => handleVote(poll.pollId, opt.id)}
                                >
                                  {opt.text}
                                  <span className="ml-2 text-xs text-indigo-400">({opt.voteCount})</span>
                                </Button>
                              ))}
                              {voteError[poll.pollId] && <div className="text-red-400 text-xs mt-2 w-full">{voteError[poll.pollId]}</div>}
                            </div>
                          )}
                          {club && club.admin && (
                            <Button
                              className="mt-4 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg"
                              onClick={() => {
                                if (window.confirm('Are you sure you want to delete this poll?')) handleDeletePoll(poll.pollId);
                              }}
                            >
                              Delete Poll
                            </Button>
                          )}
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-gray-400 text-lg">Club not found.</div>
        )}
      </div>
      {showEventModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-8 rounded-xl w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">Create Event</h2>
            <input
              className="w-full mb-3 px-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Title"
              value={newEvent.title}
              onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
            />
            <textarea
              className="w-full mb-3 px-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Description"
              value={newEvent.description}
              onChange={e => setNewEvent({ ...newEvent, description: e.target.value })}
            />
            <input
              className="w-full mb-3 px-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Location"
              value={newEvent.location}
              onChange={e => setNewEvent({ ...newEvent, location: e.target.value })}
            />
            <input
              className="w-full mb-3 px-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              type="datetime-local"
              value={newEvent.startTime}
              onChange={e => setNewEvent({ ...newEvent, startTime: e.target.value })}
            />
            <input
              className="w-full mb-3 px-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              type="datetime-local"
              value={newEvent.endTime}
              onChange={e => setNewEvent({ ...newEvent, endTime: e.target.value })}
            />
            {eventError && <div className="text-red-400 mb-2">{eventError}</div>}
            <div className="flex gap-2 mt-4">
              <Button 
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg"
                onClick={handleCreateEvent} 
                disabled={eventLoading}
              >
                Create
              </Button>
              <Button 
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
                onClick={() => setShowEventModal(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
      {voterModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={() => setVoterModal(null)}>
          <div className="bg-gray-800 p-8 rounded-xl w-full max-w-md relative" onClick={e => e.stopPropagation()}>
            <button 
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl" 
              onClick={() => setVoterModal(null)}
            >
              ×
            </button>
            <h2 className="text-xl font-bold text-white mb-4">Voters for {voterModal.status === 'GOING' ? 'Going' : voterModal.status === 'MAYBE' ? 'Maybe' : 'Not Going'}</h2>
            {voterModal.voters.length === 0 ? (
              <div className="text-gray-400">No voters.</div>
            ) : (
              <ul className="space-y-2">
                {voterModal.voters.map(u => (
                  <li key={u.id} className="flex items-center gap-2 bg-gray-700/50 rounded-lg px-3 py-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                      {u.name ? u.name[0] : u.username[0]}
                    </div>
                    <span className="font-semibold text-white">{u.name || u.username}</span>
                    <span className="text-xs text-gray-400">@{u.username}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
      {showCreatePoll && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-8 rounded-xl w-full max-w-md relative">
            <button 
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl" 
              onClick={() => setShowCreatePoll(false)}
            >
              ×
            </button>
            <h3 className="text-xl font-bold text-white mb-4">Create Poll</h3>
            <input
              className="w-full mb-3 px-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Question"
              value={createPollData.question}
              onChange={e => setCreatePollData({ ...createPollData, question: e.target.value })}
            />
            {createPollData.options.map((opt, idx) => (
              <input
                key={idx}
                className="w-full mb-2 px-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder={`Option ${idx + 1}`}
                value={opt}
                onChange={e => {
                  const newOpts = [...createPollData.options];
                  newOpts[idx] = e.target.value;
                  setCreatePollData({ ...createPollData, options: newOpts });
                }}
              />
            ))}
            <Button
              className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded-lg mb-3"
              onClick={() => setCreatePollData({ ...createPollData, options: [...createPollData.options, ''] })}
            >
              Add Option
            </Button>
            <input
              type="datetime-local"
              className="w-full mb-3 px-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={createPollData.closesAt}
              onChange={e => setCreatePollData({ ...createPollData, closesAt: e.target.value })}
            />
            <label className="flex items-center mb-3 text-gray-200">
              <input
                type="checkbox"
                checked={createPollData.isAnonymous}
                onChange={e => setCreatePollData({ ...createPollData, isAnonymous: e.target.checked })}
                className="mr-2 rounded text-indigo-500 focus:ring-indigo-500"
              />
              Anonymous Voting
            </label>
            {createPollError && <div className="text-red-400 mb-2">{createPollError}</div>}
            <div className="flex justify-end gap-2">
              <Button 
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
                onClick={() => setShowCreatePoll(false)}
              >
                Cancel
              </Button>
              <Button 
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg"
                onClick={handleCreatePoll} 
                disabled={createPollLoading}
              >
                {createPollLoading ? 'Creating...' : 'Create'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default Club;
