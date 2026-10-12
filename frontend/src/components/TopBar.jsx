import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, User, Check, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

export const TopBar = ({ title }) => {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
      setUnreadCount(res.data.filter((n) => !n.is_read).length);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const markAllRead = async () => {
    try {
      await api.put('/notifications/mark-all-read');
      setNotifications(notifications.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header className="top-bar">
      <div>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>{title}</h1>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {/* Notifications Icon & Popover */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            style={{
              position: 'relative',
              padding: '8px',
              borderRadius: '8px',
              color: '#64748b',
              backgroundColor: '#f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  background: '#ef4444',
                  color: 'white',
                  borderRadius: '50%',
                  width: '18px',
                  height: '18px',
                  fontSize: '11px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifMenu && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                marginTop: '12px',
                width: '340px',
                background: 'white',
                borderRadius: '12px',
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15)',
                border: '1px solid #e2e8f0',
                padding: '16px',
                zIndex: 60,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Notifications</span>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 600 }}>
                    Mark all read
                  </button>
                )}
              </div>

              <div style={{ maxHeight: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {notifications.length === 0 ? (
                  <p style={{ fontSize: '0.85rem', color: '#94a3b8', textAlign: 'center', padding: '16px 0' }}>No notifications</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '8px',
                        background: n.is_read ? '#f8fafc' : '#eff6ff',
                        borderLeft: n.is_read ? '3px solid transparent' : '3px solid #2563eb',
                      }}
                    >
                      <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#1e293b' }}>{n.title}</div>
                      <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '3px' }}>{n.message}</div>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '6px' }}>
                        {new Date(n.created_at).toLocaleDateString()} {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Info Capsule */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#dbeafe', color: '#1e40af', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
            {user?.full_name ? user.full_name[0] : 'U'}
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b' }}>{user?.full_name}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Role: <span style={{ fontWeight: 600, color: '#2563eb' }}>{user?.role}</span></div>
          </div>
        </div>
      </div>
    </header>
  );
};
