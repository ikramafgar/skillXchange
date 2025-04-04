import React, { useEffect, useState } from 'react';
import { useSessionStore } from '../../store/sessionStore';
import SessionCard from './SessionCard';
import { compareDesc } from 'date-fns';

const SessionList = ({ onSessionClick = null }) => {
  const { sessions, fetchSessions, isLoading, error } = useSessionStore();
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [filter, setFilter] = useState('upcoming');

  useEffect(() => {
    // Fetch sessions on component mount
    fetchSessions().catch(console.error);
  }, [fetchSessions]);

  // Apply filtering whenever sessions or filter change
  useEffect(() => {
    if (!sessions || sessions.length === 0) {
      setFilteredSessions([]);
      return;
    }

    const now = new Date();
    let filtered = [];

    switch (filter) {
      case 'upcoming':
        filtered = sessions.filter(
          session => new Date(session.startTime) > now && session.status === 'scheduled'
        );
        // Sort by start time ascending (next up first)
        filtered.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
        break;
      case 'past':
        filtered = sessions.filter(
          session => new Date(session.endTime) < now || session.status === 'completed'
        );
        // Sort by start time descending (most recent first)
        filtered.sort((a, b) => compareDesc(new Date(a.startTime), new Date(b.startTime)));
        break;
      case 'cancelled':
        filtered = sessions.filter(session => session.status === 'cancelled');
        // Sort by start time descending (most recent first)
        filtered.sort((a, b) => compareDesc(new Date(a.startTime), new Date(b.startTime)));
        break;
      default:
        // All sessions, sorted by start time descending (most recent first)
        filtered = [...sessions].sort((a, b) => compareDesc(new Date(a.startTime), new Date(b.startTime)));
    }

    setFilteredSessions(filtered);
  }, [sessions, filter]);

  if (isLoading && sessions.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error && sessions.length === 0) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-4 max-w-2xl mx-auto">
        <p>{error}</p>
        <button 
          onClick={() => fetchSessions()} 
          className="text-red-600 underline mt-2"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <h2 className="text-2xl font-medium text-gray-800">Your Sessions</h2>
        
        <div className="inline-flex rounded-lg shadow-sm bg-white border border-gray-200 p-1" role="group">
          <button
            type="button"
            onClick={() => setFilter('upcoming')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              filter === 'upcoming'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            Upcoming
          </button>
          <button
            type="button"
            onClick={() => setFilter('past')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              filter === 'past'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            Past
          </button>
          <button
            type="button"
            onClick={() => setFilter('cancelled')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              filter === 'cancelled'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            Cancelled
          </button>
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            All
          </button>
        </div>
      </div>
      
      {filteredSessions.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center border border-gray-100 shadow-sm">
          <svg
            className="mx-auto h-12 w-12 text-gray-300"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-800">No {filter} sessions found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {filter === 'upcoming'
              ? 'You have no upcoming sessions. Schedule a new session to get started.'
              : filter === 'past'
              ? 'You have no past sessions.'
              : filter === 'cancelled'
              ? 'You have no cancelled sessions.'
              : 'You have no sessions. Schedule a new session to get started.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSessions.map(session => (
            <div 
              key={session._id} 
              onClick={onSessionClick ? () => onSessionClick(session) : undefined}
              className={onSessionClick ? 'cursor-pointer' : ''}
            >
              <SessionCard session={session} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SessionList;