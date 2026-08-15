import React, { useState, useEffect } from 'react';

export default function App() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchUsers = async (query = '') => {
    try {
      setLoading(true);
      setError(null);
      const url = query ? `/api/admin/users?q=${encodeURIComponent(query)}` : '/api/admin/users';
      const res = await fetch(url);
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
    fetchUsers();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers(search);
  };

  const toggleVerification = async (user) => {
    try {
      setUpdatingId(user.id);
      const newStatus = !user.verified;
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
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

  return (
    <div style={{ maxWidth: '900px', margin: '40px auto', padding: '0 20px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '900' }}>X-Reply Agent Admin</h1>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#71767b' }}>User Authorization & Status Control Panel</p>
        </div>
        <button 
          onClick={() => fetchUsers(search)} 
          style={{ background: 'rgba(255,255,255,0.06)', color: '#e7e9ea', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '8px 14px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
        >
          Refresh List
        </button>
      </header>

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
  );
}
