import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from 'features/auth/context/AuthContext'
import { notificationService } from 'features/audit/services/notificationService'

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifs, setNotifs] = useState([]);
  const [unread, setUnread] = useState(0);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUser, setShowUser] = useState(false);
  const ref = useRef(null);

  useEffect(() => { fetchNotifs(); }, []);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) { setShowNotifs(false); setShowUser(false); } };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchNotifs = async () => {
    try {
      const data = await notificationService.getAll();
      setNotifs(data || []);
      setUnread((data || []).filter(n => !n.read).length);
    } catch {}
  };

  const handleRead = async (id) => {
    try {
      await notificationService.markRead(id);
      setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      setUnread(prev => Math.max(0, prev - 1));
    } catch {}
  };

  const timeAgo = (d) => {
    const s = Math.floor((Date.now() - new Date(d)) / 1000);
    if (s < 60) return 'just now';
    if (s < 3600) return `${Math.floor(s/60)}m ago`;
    if (s < 86400) return `${Math.floor(s/3600)}h ago`;
    return `${Math.floor(s/86400)}d ago`;
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2 font-bold text-blue-700 text-lg tracking-tight">
          <span className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">TF</span>
          TaskFlow
        </Link>

        <div className="flex items-center gap-2" ref={ref}>
          {/* Notifications */}
          <div className="relative">
            <button onClick={() => { setShowNotifs(!showNotifs); setShowUser(false); fetchNotifs(); }}
              className="relative p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unread > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </button>

            {showNotifs && (
              <div className="absolute right-0 mt-1 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                  <span className="font-semibold text-sm text-gray-900">Notifications</span>
                  {unread > 0 && <span className="text-xs text-blue-600 font-medium">{unread} unread</span>}
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifs.length === 0
                    ? <p className="text-sm text-gray-400 text-center py-8">No notifications</p>
                    : notifs.slice(0,10).map(n => (
                        <div key={n.id} onClick={() => !n.read && handleRead(n.id)}
                          className={`px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${!n.read ? 'bg-blue-50/60' : ''}`}>
                          <div className="flex gap-2">
                            {!n.read && <div className="w-2 h-2 mt-1.5 bg-blue-500 rounded-full flex-shrink-0" />}
                            <div className={!n.read ? '' : 'ml-4'}>
                              <p className="text-sm text-gray-700">{n.message}</p>
                              <p className="text-xs text-gray-400 mt-0.5">{timeAgo(n.createdAt)}</p>
                            </div>
                          </div>
                        </div>
                      ))
                  }
                </div>
              </div>
            )}
          </div>

          {/* User menu */}
          <div className="relative">
            <button onClick={() => { setShowUser(!showUser); setShowNotifs(false); }}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="w-7 h-7 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-bold">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-gray-700 hidden sm:block">{user?.username}</span>
              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showUser && (
              <div className="absolute right-0 mt-1 w-52 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-900">{user?.username}</p>
                  <p className="text-xs text-gray-400">{user?.email}</p>
                </div>
                <Link to="/dashboard" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                  My Projects
                </Link>
                <button onClick={() => { logout(); navigate('/login'); }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

