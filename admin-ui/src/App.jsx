import React, { useState, useEffect } from 'react';

const ALLOWED_ADMINS = ['hanzlaahmad100@gmail.com', 'hbilawal590@gmail.com'];

export default function App() {
  const [adminToken, setAdminToken] = useState(() => sessionStorage.getItem('admin_token') || '');
  const [adminEmail, setAdminEmail] = useState(() => sessionStorage.getItem('admin_email') || '');
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  // Notice State
  const [notice, setNotice] = useState({ title: '', description: '', buttonText: '', buttonUrl: '', enabled: false });
  const [noticeLoading, setNoticeLoading] = useState(false);
  const [noticeSaving, setNoticeSaving] = useState(false);
  const [noticeMsg, setNoticeMsg] = useState(null);

  // Parse token from Google OAuth redirect URL query
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get('token');
    const emailFromUrl = params.get('email');

    if (tokenFromUrl) {
      const cleanEmail = (emailFromUrl || '').toLowerCase().trim();
      setAdminToken(tokenFromUrl);
      setAdminEmail(cleanEmail);
      sessionStorage.setItem('admin_token', tokenFromUrl);
      sessionStorage.setItem('admin_email', cleanEmail);

      // Clean URL params
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const fetchNotice = async (tokenToUse = adminToken) => {
    if (!tokenToUse) return;
    try {
      setNoticeLoading(true);
      const res = await fetch('/api/admin?type=notice', {
        headers: { 'Authorization': `Bearer ${tokenToUse}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.notice) {
          setNotice({
            title: data.notice.title || '',
            description: data.notice.description || '',
            buttonText: data.notice.buttonText || '',
            buttonUrl: data.notice.buttonUrl || '',
            enabled: Boolean(data.notice.enabled)
          });
        }
      }
    } catch (err) {
      console.error('Failed to fetch notice:', err);
    } finally {
      setNoticeLoading(false);
    }
  };

  const fetchUsers = async (query = '', tokenToUse = adminToken) => {
    if (!tokenToUse) return;
    try {
      setLoading(true);
      setError(null);
      const url = query ? `/api/admin?q=${encodeURIComponent(query)}` : '/api/admin';
      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${tokenToUse}`
        }
      });

      if (res.status === 401 || res.status === 403) {
        const data = await res.json().catch(() => ({}));
        setAdminToken('');
        sessionStorage.removeItem('admin_token');
        sessionStorage.removeItem('admin_email');
        throw new Error(data.error || 'Unauthorized Google account access.');
      }

      if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch users`);
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adminToken) {
      fetchUsers(search, adminToken);
      fetchNotice(adminToken);
    }
  }, [adminToken]);

  const handleSaveNotice = async (e) => {
    e.preventDefault();
    try {
      setNoticeSaving(true);
      setNoticeMsg(null);
      const res = await fetch('/api/admin?type=notice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          type: 'notice',
          ...notice
        })
      });

      if (!res.ok) throw new Error('Failed to save notice');
      const data = await res.json();
      if (data.notice) {
        setNotice({
          title: data.notice.title || '',
          description: data.notice.description || '',
          buttonText: data.notice.buttonText || '',
          buttonUrl: data.notice.buttonUrl || '',
          enabled: Boolean(data.notice.enabled)
        });
        setNoticeMsg({ type: 'success', text: '✓ Broadcast notice saved successfully!' });
      }
    } catch (err) {
      setNoticeMsg({ type: 'error', text: `⚠️ Error: ${err.message}` });
    } finally {
      setNoticeSaving(false);
    }
  };

  const handleGoogleLogin = () => {
    const redirectUrl = `${window.location.origin}/admin`;
    window.location.href = `/api/auth?redirect_uri=${encodeURIComponent(redirectUrl)}`;
  };

  const handleLogout = () => {
    setAdminToken('');
    setAdminEmail('');
    sessionStorage.removeItem('admin_token');
    sessionStorage.removeItem('admin_email');
    setUsers([]);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers(search);
  };

  const toggleVerification = async (user) => {
    try {
      setUpdatingId(user.id);
      const newStatus = !user.verified;
      const res = await fetch(`/api/admin?id=${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ verified: newStatus })
      });

      if (!res.ok) throw new Error('Failed to update status');
      const data = await res.json();

      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, verified: data.user.verified } : u));
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString(undefined, {
      dateStyle: 'short',
      timeStyle: 'short'
    });
  };

  if (!adminToken) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0b141d', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#fff', padding: '20px' }}>
        <div style={{ background: '#15202b', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '24px', padding: '36px', maxWidth: '440px', width: '100%', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', textAlign: 'center' }}>
          
          <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: 'rgba(29,161,242,0.15)', border: '1px solid rgba(29,161,242,0.3)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', color: '#1da1f2', fontSize: '24px' }}>
            🛡️
          </div>
          
          <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '900', letterSpacing: '-0.02em' }}>Admin Authentication</h2>
          <p style={{ margin: '8px 0 24px', fontSize: '13px', color: '#71767b', lineHeight: '1.5' }}>
            Sign in with Google to manage user authorizations and status.
          </p>

          <button
            onClick={handleGoogleLogin}
            style={{
              width: '100%',
              padding: '14px 20px',
              background: '#ffffff',
              color: '#000000',
              border: 'none',
              borderRadius: '12px',
              fontWeight: '800',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              transition: 'all 0.2s'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            Sign in with Google
          </button>

          {error && (
            <div style={{ marginTop: '16px', padding: '12px 14px', background: 'rgba(224,36,94,0.15)', border: '1px solid #e0245e', color: '#e0245e', borderRadius: '10px', fontSize: '12px', textAlign: 'left' }}>
              ⚠️ {error}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0b141d', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#fff', padding: '40px 20px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '900' }}>X-Reply Agent Admin</h1>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#71767b' }}>
              User Authorization & Status Control Panel
              {adminEmail && <span style={{ marginLeft: '12px', color: '#1da1f2', fontWeight: 'bold' }}>({adminEmail})</span>}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => fetchUsers(search)}
              style={{ background: 'rgba(255,255,255,0.06)', color: '#e7e9ea', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '8px 14px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
            >
              Refresh List
            </button>
            <button
              onClick={handleLogout}
              style={{ background: 'rgba(224,36,94,0.12)', color: '#e0245e', border: '1px solid rgba(224,36,94,0.3)', borderRadius: '8px', padding: '8px 14px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
            >
              Sign Out
            </button>
          </div>
        </header>

        {/* System Notice Broadcast Card */}
        <div style={{ background: '#15202b', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '16px', padding: '20px', marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '18px' }}>📢</span>
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '800' }}>Broadcast Extension Notice</h2>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '700', color: notice.enabled ? '#17bf63' : '#71767b' }}>
              <input
                type="checkbox"
                checked={notice.enabled}
                onChange={(e) => setNotice(prev => ({ ...prev, enabled: e.target.checked }))}
                style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#17bf63' }}
              />
              {notice.enabled ? '✓ Notice Active' : '○ Notice Disabled'}
            </label>
          </div>

          <form onSubmit={handleSaveNotice} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#71767b', marginBottom: '6px' }}>Notice Title</label>
              <input
                type="text"
                placeholder="e.g. 🚀 Version 4.0 Update Released!"
                value={notice.title}
                onChange={(e) => setNotice(prev => ({ ...prev, title: e.target.value }))}
                style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: '#fff', fontSize: '13px', outline: 'none' }}
              />
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#71767b', marginBottom: '6px' }}>Notice Description</label>
              <textarea
                placeholder="Describe what users should know..."
                value={notice.description}
                onChange={(e) => setNotice(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: '#fff', fontSize: '13px', outline: 'none', resize: 'vertical' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#71767b', marginBottom: '6px' }}>Button Label (CTA)</label>
              <input
                type="text"
                placeholder="e.g. View Full Details"
                value={notice.buttonText}
                onChange={(e) => setNotice(prev => ({ ...prev, buttonText: e.target.value }))}
                style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: '#fff', fontSize: '13px', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#71767b', marginBottom: '6px' }}>Button Target URL</label>
              <input
                type="url"
                placeholder="e.g. https://x.com/your_handle"
                value={notice.buttonUrl}
                onChange={(e) => setNotice(prev => ({ ...prev, buttonUrl: e.target.value }))}
                style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: '#fff', fontSize: '13px', outline: 'none' }}
              />
            </div>

            <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
              <button
                type="submit"
                disabled={noticeSaving}
                style={{
                  background: '#1da1f2',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '10px 20px',
                  fontWeight: '800',
                  fontSize: '13px',
                  cursor: noticeSaving ? 'not-allowed' : 'pointer',
                  opacity: noticeSaving ? 0.6 : 1
                }}
              >
                {noticeSaving ? 'Saving Notice...' : 'Save & Broadcast Notice'}
              </button>

              {noticeMsg && (
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: noticeMsg.type === 'success' ? '#17bf63' : '#e0245e' }}>
                  {noticeMsg.text}
                </span>
              )}
            </div>
          </form>
        </div>

        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
          <input
            type="text"
            placeholder="Search users by email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, padding: '12px 16px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: '#fff', fontSize: '13px', outline: 'none' }}
          />
          <button
            type="submit"
            style={{ background: '#1da1f2', color: '#fff', border: 'none', borderRadius: '10px', padding: '12px 20px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}
          >
            Search
          </button>
        </form>

        {error && (
          <div style={{ padding: '12px 16px', background: 'rgba(224,36,94,0.15)', border: '1px solid #e0245e', color: '#e0245e', borderRadius: '10px', marginBottom: '20px', fontSize: '13px' }}>
            ⚠️ {error}
          </div>
        )}

        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <th style={{ padding: '14px 16px', color: '#71767b', fontWeight: 'bold' }}>Email</th>
                <th style={{ padding: '14px 16px', color: '#71767b', fontWeight: 'bold' }}>Status</th>
                <th style={{ padding: '14px 16px', color: '#71767b', fontWeight: 'bold' }}>Joined</th>
                <th style={{ padding: '14px 16px', color: '#71767b', fontWeight: 'bold' }}>Last Login</th>
                <th style={{ padding: '14px 16px', color: '#71767b', fontWeight: 'bold', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: '#71767b' }}>
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: '#71767b' }}>
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map(user => (
                  <tr key={user.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '14px 16px', fontWeight: '600' }}>
                      {user.email}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {user.verified ? (
                        <span style={{ background: 'rgba(23,191,99,0.15)', color: '#17bf63', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          ✓ Verified
                        </span>
                      ) : (
                        <span style={{ background: 'rgba(244,93,34,0.15)', color: '#f45d22', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          ○ Pending
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '14px 16px', color: '#71767b', fontSize: '12px' }}>
                      {formatDate(user.createdAt)}
                    </td>
                    <td style={{ padding: '14px 16px', color: '#71767b', fontSize: '12px' }}>
                      {formatDate(user.lastLogin)}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <button
                        disabled={updatingId === user.id}
                        onClick={() => toggleVerification(user)}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '8px',
                          border: 'none',
                          fontWeight: '800',
                          fontSize: '12px',
                          cursor: updatingId === user.id ? 'not-allowed' : 'pointer',
                          opacity: updatingId === user.id ? 0.5 : 1,
                          background: user.verified ? 'rgba(220,38,38,0.15)' : 'rgba(29,161,242,0.18)',
                          color: user.verified ? '#f87171' : '#1da1f2'
                        }}
                      >
                        {updatingId === user.id ? 'Updating...' : (user.verified ? 'Disable' : 'Verify')}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
