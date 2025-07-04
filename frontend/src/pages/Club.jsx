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
  const [requestStatus, setRequestStatus] = useState(null); // null, 'PENDING', 'ACCEPTED', 'REJECTED'
  const [requests, setRequests] = useState([]); // membership requests
  const [members, setMembers] = useState([]); // club members
  const [showRequests, setShowRequests] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [modal, setModal] = useState(null); // {type, data}
  const [events, setEvents] = useState([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', description: '', startTime: '', endTime: '', location: '' });
  const [eventError, setEventError] = useState('');
  const [eventLoading, setEventLoading] = useState(false);
  const [rsvps, setRsvps] = useState({}); // { [eventId]: { counts: {GOING: 0, NOT_GOING: 0, MAYBE: 0}, userStatus: null } }
  const [rsvpLists, setRsvpLists] = useState({}); // { [eventId]: [rsvp, ...] }
  const [rsvpLoading, setRsvpLoading] = useState({}); // { [eventId]: boolean }
  const [rsvpError, setRsvpError] = useState({}); // { [eventId]: string }
  const [voterModal, setVoterModal] = useState(null); // {eventId, status, voters: []} or null
  const [eventDeleteLoading, setEventDeleteLoading] = useState({}); // { [eventId]: boolean }
  const [eventDeleteError, setEventDeleteError] = useState({}); // { [eventId]: string }
  const { id } = useParams();
  const navigate = useNavigate();
  const userId = Number(localStorage.getItem('userId'));

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
        // If admin, fetch requests and members
        if (clubData.admin) {
          fetchRequestsAndMembers(token);
        }
        // If not a member, check for pending membership request (for private clubs)
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
    // eslint-disable-next-line
  }, [id]);

  // Fetch requests and members for admin
  const fetchRequestsAndMembers = async (token) => {
    try {
      // Requests
      const reqRes = await fetch(`http://localhost:8080/api/memberships/club/${id}/requests`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (reqRes.ok) {
        const allRequests = await reqRes.json();
        setRequests(allRequests);
      }
      // Members (simulate: fetch all users with accepted status for this club)
      const clubRes = await fetch(`http://localhost:8080/api/clubs/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (clubRes.ok) {
        const clubData = await clubRes.json();
        setMembers(clubData.members || []); // expects backend to return members array
      }
    } catch (e) {
      // ignore
    }
  };

  // Accept/Reject membership request
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

  // Promote member to admin
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
      // If the current user promoted themselves, re-fetch club data to update admin UI
      if (userId === userId) {
        // Re-fetch club data
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

  // Kick member
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

  // Edit/Delete post (assume endpoints exist)
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

  // Fetch membership request status for private clubs
  const fetchMembershipRequestStatus = async (token, clubId) => {
    try {
      // Get all requests for the user
      const response = await fetch('http://localhost:8080/api/memberships/user/me', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) return;
      const requests = await response.json();
      const req = requests.find(r => r.clubId === Number(clubId));
      if (req) setRequestStatus(req.status);
    } catch (e) {
      // ignore
    }
  };

  // Handle follow/join/request
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

  // Fetch events on load
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
          // Fetch RSVPs for each event
          for (const event of data) {
            fetchEventRsvps(event.id);
          }
        }
      } catch (e) {}
    };
    fetchEvents();
  }, [id]);

  // Fetch RSVPs for an event
  const fetchEventRsvps = async (eventId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:8080/api/events/${eventId}/rsvps`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        console.log('fetchEventRsvps:', eventId, data, 'userId:', userId); // Debug
        setRsvpLists(prev => ({ ...prev, [eventId]: data }));
        // Count by status
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

  // Create event (admin only)
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
      // Refresh events
      const data = await res.json();
      setEvents(prev => [...prev, data]);
    } catch (err) {
      setEventError(err.message || 'Failed to create event');
    } finally {
      setEventLoading(false);
    }
  };

  // RSVP to event
  const handleRsvp = async (eventId, status) => {
    setRsvpLoading(prev => ({ ...prev, [eventId]: true }));
    setRsvpError(prev => ({ ...prev, [eventId]: '' }));
    try {
      const token = localStorage.getItem('token');
      console.log('RSVP: sending', { eventId, status });
      const res = await fetch(`http://localhost:8080/api/events/${eventId}/rsvp?status=${status}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      console.log('RSVP: response', res.status);
      if (!res.ok) {
        let msg = 'Failed to RSVP';
        try { msg = await res.text(); } catch {}
        console.log('RSVP: error', msg);
        setRsvpError(prev => ({ ...prev, [eventId]: msg }));
        return;
      }
      fetchEventRsvps(eventId);
    } catch (e) {
      console.log('RSVP: network error', e);
      setRsvpError(prev => ({ ...prev, [eventId]: 'Network error' }));
    } finally {
      setRsvpLoading(prev => ({ ...prev, [eventId]: false }));
    }
  };

  // Add a helper to group RSVPs by status
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

  return (
    <Layout>
      <div className="max-w-3xl mx-auto mt-10 bg-white/10 rounded-2xl shadow-2xl p-8 animate-fade-in">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-indigo-300">{club?.name || 'Club'}</h1>
        </div>
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
        ) : club ? (
          <div className="space-y-10 animate-fade-in">
            <Card
              avatar={
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-400 to-pink-400 flex items-center justify-center text-3xl font-bold text-white shadow-lg border-4 border-white/30">
                  {club.name[0]}
                </div>
              }
            >
              <h2 className="text-3xl font-semibold text-white mb-4">{club.name}</h2>
              <p className="text-gray-300 mb-4">{club.description}</p>
              <div className="flex gap-2 mb-4">
                <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-indigo-500/30 text-indigo-200">
                  {club.type}
                </span>
                <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-pink-500/30 text-pink-200">
                  {club.category}
                </span>
              </div>
              {/* Membership actions */}
              {!club.member && (
                <div className="mt-6 flex flex-col items-center">
                  {club.type === 'PUBLIC' && (
                    <Button
                      variant="secondary"
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
                        <Button variant="secondary" disabled loading>
                          Request Pending
                        </Button>
                      ) : requestStatus === 'ACCEPTED' ? (
                        <span className="text-green-400 font-semibold">Request Accepted</span>
                      ) : requestStatus === 'REJECTED' ? (
                        <div className="flex flex-col items-center">
                          <span className="text-red-400 font-semibold mb-2">Request Rejected</span>
                          <Button
                            variant="secondary"
                            onClick={handleJoin}
                            loading={actionLoading}
                            disabled={actionLoading}
                          >
                            Request to Join Again
                          </Button>
                          <span className="text-xs text-gray-400 mt-1">You were previously rejected from this club.</span>
                        </div>
                      ) : (
                        <Button
                          variant="secondary"
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
                    <div className="text-red-400 mt-2 animate-shake">{actionError}</div>
                  )}
                </div>
              )}
              {/* Show create post if admin and member */}
              {club.admin && club.member && (
                <div className="mt-6">
                  <Button onClick={() => navigate(`/club/${id}/post`)} variant="primary">
                    Create Post
                  </Button>
                </div>
              )}
            </Card>
            {/* Admin Panel */}
            {club && club.admin && (
              <div className="bg-white/10 rounded-xl p-6 mb-10 shadow-xl animate-fade-in">
                <h2 className="text-2xl font-bold text-indigo-300 mb-4">Admin Panel</h2>
                <div className="flex gap-6 mb-4">
                  <Button variant={showRequests ? 'primary' : 'secondary'} onClick={() => setShowRequests(!showRequests)}>
                    Membership Requests
                  </Button>
                  <Button variant={showMembers ? 'primary' : 'secondary'} onClick={() => setShowMembers(!showMembers)}>
                    Members
                  </Button>
                </div>
                {showRequests && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">Pending Requests</h3>
                    {requests.length === 0 ? (
                      <div className="text-gray-400">No pending requests.</div>
                    ) : (
                      <ul className="space-y-2">
                        {requests.map(req => (
                          <li key={req.id} className="flex items-center justify-between bg-gray-900/60 rounded-lg px-4 py-2">
                            <span>
                              <span className="font-semibold text-indigo-200">{req.fullName}</span>
                              <span className="ml-2 text-gray-400 text-sm">{req.email}</span>
                            </span>
                            <div className="flex gap-2">
                              <Button variant="primary" onClick={() => handleProcessRequest(req.id, true)} loading={actionLoading}>Accept</Button>
                              <Button variant="secondary" onClick={() => handleProcessRequest(req.id, false)} loading={actionLoading}>Reject</Button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
                {showMembers && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Members</h3>
                    {members.length === 0 ? (
                      <div className="text-gray-400">No members found.</div>
                    ) : (
                      <ul className="space-y-2">
                        {members.map(m => (
                          <li key={m.id} className="flex items-center justify-between bg-gray-900/60 rounded-lg px-4 py-2">
                            <span>
                              <span className="font-semibold text-indigo-200">{m.fullName}</span>
                              <span className="ml-2 text-gray-400 text-sm">{m.email}</span>
                              {m.admin && <span className="ml-2 text-xs bg-indigo-500/40 text-indigo-100 px-2 py-1 rounded">Admin</span>}
                            </span>
                            <div className="flex gap-2">
                              {!m.admin && <Button variant="primary" onClick={() => handlePromote(m.id)} loading={actionLoading}>Make Admin</Button>}
                              {(m.id !== userId && (!m.admin || (m.admin && !club.admin))) && (
                                <Button variant="secondary" onClick={() => handleKick(m.id)} loading={actionLoading}>Kick</Button>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
                {actionError && <div className="text-red-400 mt-2 animate-shake">{actionError}</div>}
              </div>
            )}
            {/* Only show posts if member or public */}
            {(club.member || club.type === 'PUBLIC') && (
              <div>
                <h3 className="text-2xl font-semibold text-white mb-6">Club Posts</h3>
                {posts.length === 0 ? (
                  <p className="text-gray-400 text-center">No posts yet.</p>
                ) : (
                  <div className="space-y-6">
                    {posts.map((post) => (
                      <Card key={post.id}>
                        <h4 className="text-xl font-medium text-white mb-1">{post.title}</h4>
                        <p className="text-gray-300 mb-2">{post.content}</p>
                        {post.link && (
                          <a
                            href={post.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-400 hover:text-indigo-300 underline"
                          >
                            {post.link}
                          </a>
                        )}
                        <div className="flex gap-2 mt-2">
                          <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-indigo-500/30 text-indigo-200">
                            {post.type}
                          </span>
                          {post.eventDateTime && (
                            <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-pink-500/30 text-pink-200">
                              Event: {new Date(post.eventDateTime).toLocaleString()}
                            </span>
                          )}
                        </div>
                        {/* Edit/Delete controls for admin */}
                        {club.admin && (
                          <div className="flex gap-2 mt-4">
                            {/* <Button variant="primary" onClick={() => setModal({type: 'edit', data: post})}>Edit</Button> */}
                            <Button variant="secondary" onClick={() => handleDeletePost(post.id)} loading={actionLoading}>Delete</Button>
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
            <div className="mt-8">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-2xl font-bold text-indigo-400">Events</h2>
                {club && club.admin && (
                  <Button onClick={() => setShowEventModal(true)} variant="primary">+ Create Event</Button>
                )}
              </div>
              {events.length === 0 ? (
                <div className="text-gray-400">No events yet.</div>
              ) : (
                <div className="space-y-4">
                  {events.map(event => {
                    const grouped = groupRsvpsByStatus(rsvpLists[event.id]);
                    return (
                      <Card key={event.id}>
                        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                          <div>
                            <div className="font-semibold text-lg text-indigo-200">{event.title}</div>
                            <div className="text-gray-300">{event.description}</div>
                            <div className="text-gray-400 text-sm">{event.location} | {event.startTime ? new Date(event.startTime).toLocaleString() : ''} - {event.endTime ? new Date(event.endTime).toLocaleString() : ''}</div>
                            <div className="text-xs text-gray-500">Created by: {event.createdBy?.name || event.createdBy?.username}</div>
                          </div>
                          <div className="mt-4 md:mt-0 md:text-right w-full md:w-auto">
                            {/* RSVP counts and voters */}
                            {['GOING', 'MAYBE', 'NOT_GOING'].map(status => (
                              <div key={status} className="mb-2">
                                <span className={
                                  status === 'GOING' ? 'text-green-400' :
                                  status === 'MAYBE' ? 'text-yellow-400' :
                                  'text-red-400'
                                }>
                                  {status === 'GOING' ? 'Going' : status === 'MAYBE' ? 'Maybe' : 'Not Going'}: {rsvps[event.id]?.counts?.[status] ?? 0}
                                </span>
                                {/* Admin: show voters */}
                                {club && club.admin && grouped[status] && grouped[status].length > 0 && (
                                  <>
                                    <Button
                                      size="xs"
                                      variant="secondary"
                                      className="ml-2"
                                      onClick={() => setVoterModal({ eventId: event.id, status, voters: grouped[status] })}
                                    >
                                      View Voters
                                    </Button>
                                  </>
                                )}
                              </div>
                            ))}
                            {/* RSVP buttons, vertical */}
                            {club && club.member && (
                              <div className="flex flex-col gap-2 mt-2">
                                <span className="text-sm">Your RSVP: <b>{rsvps[event.id]?.userStatus ? rsvps[event.id].userStatus : 'None'}</b></span>
                                <Button size="sm" onClick={() => handleRsvp(event.id, 'GOING')} disabled={rsvpLoading[event.id]}>Going</Button>
                                <Button size="sm" onClick={() => handleRsvp(event.id, 'MAYBE')} disabled={rsvpLoading[event.id]}>Maybe</Button>
                                <Button size="sm" onClick={() => handleRsvp(event.id, 'NOT_GOING')} disabled={rsvpLoading[event.id]}>Not Going</Button>
                                {rsvpError[event.id] && <span className="text-red-400 text-xs mt-1">{rsvpError[event.id]}</span>}
                              </div>
                            )}
                          </div>
                        </div>
                        {club.admin && (
                          <Button
                            size="xs"
                            variant="danger"
                            className="ml-2"
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
          </div>
        ) : (
          <div className="text-center text-gray-400 text-lg animate-fade-in">Club not found.</div>
        )}
      </div>
      {/* Event creation modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-8 rounded-xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-indigo-200">Create Event</h2>
            <input
              className="w-full mb-3 px-3 py-2 rounded bg-gray-800 text-white focus:outline-none"
              placeholder="Title"
              value={newEvent.title}
              onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
            />
            <textarea
              className="w-full mb-3 px-3 py-2 rounded bg-gray-800 text-white focus:outline-none"
              placeholder="Description"
              value={newEvent.description}
              onChange={e => setNewEvent({ ...newEvent, description: e.target.value })}
            />
            <input
              className="w-full mb-3 px-3 py-2 rounded bg-gray-800 text-white focus:outline-none"
              placeholder="Location"
              value={newEvent.location}
              onChange={e => setNewEvent({ ...newEvent, location: e.target.value })}
            />
            <input
              className="w-full mb-3 px-3 py-2 rounded bg-gray-800 text-white focus:outline-none"
              type="datetime-local"
              value={newEvent.startTime}
              onChange={e => setNewEvent({ ...newEvent, startTime: e.target.value })}
            />
            <input
              className="w-full mb-3 px-3 py-2 rounded bg-gray-800 text-white focus:outline-none"
              type="datetime-local"
              value={newEvent.endTime}
              onChange={e => setNewEvent({ ...newEvent, endTime: e.target.value })}
            />
            {eventError && <div className="text-red-400 mb-2">{eventError}</div>}
            <div className="flex gap-2 mt-4">
              <Button onClick={handleCreateEvent} variant="primary" disabled={eventLoading}>Create</Button>
              <Button onClick={() => setShowEventModal(false)} variant="secondary">Cancel</Button>
            </div>
          </div>
        </div>
      )}
      {/* Voter Modal for Admins */}
      {voterModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setVoterModal(null)}>
          <div className="bg-gray-900 p-8 rounded-xl w-full max-w-md relative" onClick={e => e.stopPropagation()}>
            <button className="absolute top-2 right-2 text-gray-400 hover:text-white" onClick={() => setVoterModal(null)}>&times;</button>
            <h2 className="text-xl font-bold mb-4 text-indigo-200">Voters for {voterModal.status === 'GOING' ? 'Going' : voterModal.status === 'MAYBE' ? 'Maybe' : 'Not Going'}</h2>
            {voterModal.voters.length === 0 ? (
              <div className="text-gray-400">No voters.</div>
            ) : (
              <ul className="space-y-2">
                {voterModal.voters.map(u => (
                  <li key={u.id} className="flex items-center gap-2 bg-gray-800 rounded px-3 py-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-700 flex items-center justify-center text-white font-bold text-sm">
                      {u.name ? u.name[0] : u.username[0]}
                    </div>
                    <span className="font-semibold text-indigo-100">{u.name || u.username}</span>
                    <span className="text-xs text-gray-400">@{u.username}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
}

export default Club;
