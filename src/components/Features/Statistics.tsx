import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import './features.css';

interface StatsData {
  total_users: number;
  active_users: number;
  total_revenue: number;
  orders_today: number;
  growth_rate: number;
  server_status: string;
}

const Statistics: React.FC = () => {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [backendBranch, setBackendBranch] = useState<string>('');

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/statistics.php');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setStats(data.stats);
      setBackendBranch(data.branch || 'unknown');
      setLastUpdate(new Date().toLocaleTimeString());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch statistics');
      console.error('Error fetching statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !stats) {
    return (
      <div className="feature-container">
        <div className="loading">Loading statistics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="feature-container">
        <div className="error">Error: {error}</div>
        <button onClick={fetchStats} className="retry-btn">Retry</button>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="feature-container">
        <div className="error">No data available</div>
      </div>
    );
  }

  return (
    <div className="feature-container">
      <div className="feature-header">
        <h2>📊 Dashboard Statistics</h2>
        <p>Real-time system metrics and analytics</p>
        <div className="stats-meta">
          <div className="backend-info">
            <span className="backend-label">📡 Backend:</span>
            <span className="backend-value">{backendBranch}</span>
          </div>
          <button onClick={fetchStats} className="refresh-btn" disabled={loading}>
            🔄 {loading ? 'Refreshing...' : 'Refresh'}
          </button>
          {lastUpdate && (
            <span className="last-update">Last updated: {lastUpdate}</span>
          )}
        </div>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👤</div>
          <div className="stat-content">
            <div className="stat-label">Total Users</div>
            <div className="stat-value">{stats.total_users.toLocaleString()}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-label">Active Users</div>
            <div className="stat-value">{stats.active_users.toLocaleString()}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className="stat-label">Total Revenue</div>
            <div className="stat-value">${stats.total_revenue.toLocaleString()}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <div className="stat-label">Orders Today</div>
            <div className="stat-value">{stats.orders_today.toLocaleString()}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <div className="stat-label">Growth Rate</div>
            <div className="stat-value">{stats.growth_rate}%</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🖥️</div>
          <div className="stat-content">
            <div className="stat-label">Server Status</div>
            <div className={`stat-value status-${stats.server_status.toLowerCase()}`}>
              {stats.server_status}
            </div>
          </div>
        </div>
      </div>

      <div className="chart-placeholder">
        <h3>📉 Revenue Trend</h3>
        <div className="chart-mock">
          <div className="bar" style={{ height: '60%' }}></div>
          <div className="bar" style={{ height: '75%' }}></div>
          <div className="bar" style={{ height: '65%' }}></div>
          <div className="bar" style={{ height: '85%' }}></div>
          <div className="bar" style={{ height: '90%' }}></div>
          <div className="bar" style={{ height: '95%' }}></div>
          <div className="bar" style={{ height: '100%' }}></div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;

