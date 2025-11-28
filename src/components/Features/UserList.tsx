import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import './features.css';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
}

const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [backendBranch, setBackendBranch] = useState<string>('');
  const [userCount, setUserCount] = useState<number>(0);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/users.php');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setUsers(data.users || []);
      setBackendBranch(data.backend_branch || 'unknown');
      setUserCount(data.count || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleStatusToggle = async (userId: number) => {
    try {
      const response = await api.post('/users.php', {
        action: 'toggle_status',
        user_id: userId,
      });
      
      if (!response.ok) {
        throw new Error('Failed to toggle status');
      }
      
      // Refresh the user list
      await fetchUsers();
    } catch (err) {
      console.error('Error toggling status:', err);
      alert('Failed to toggle user status');
    }
  };

  if (loading) {
    return (
      <div className="feature-container">
        <div className="loading">Loading users...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="feature-container">
        <div className="error">Error: {error}</div>
        <button onClick={fetchUsers} className="retry-btn">Retry</button>
      </div>
    );
  }

  return (
    <div className="feature-container">
      <div className="feature-header">
        <h2>👥 User Management</h2>
        <p>Manage user accounts and permissions</p>
        <div className="header-actions">
          <div className="backend-info">
            <span className="backend-label">📡 Backend:</span>
            <span className="backend-value">{backendBranch}</span>
            <span className="user-count">({userCount} users)</span>
          </div>
          <button onClick={fetchUsers} className="refresh-btn">🔄 Refresh</button>
        </div>
      </div>
      
      <div className="user-list">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`role-badge role-${user.role.toLowerCase()}`}>
                    {user.role}
                  </span>
                </td>
                <td>
                  <span className={`status-badge status-${user.status.toLowerCase()}`}>
                    {user.status}
                  </span>
                </td>
                <td>
                  <button
                    onClick={() => handleStatusToggle(user.id)}
                    className="action-btn"
                  >
                    Toggle Status
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserList;

