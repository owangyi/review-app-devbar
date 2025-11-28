import React, { useState } from 'react';
import UserList from './UserList';
import Statistics from './Statistics';
import './features.css';

const FeatureTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'statistics'>('users');

  return (
    <div className="tabs-container">
      <div className="tabs">
        <button
          className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          👥 User Management
        </button>
        <button
          className={`tab-button ${activeTab === 'statistics' ? 'active' : ''}`}
          onClick={() => setActiveTab('statistics')}
        >
          📊 Statistics
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'users' ? <UserList /> : <Statistics />}
      </div>
    </div>
  );
};

export default FeatureTabs;

