import React, { useState, useEffect } from 'react';
import './App.css';
import './i18n'; // Import i18n configuration
import Header from './components/Header';
import FarmersDashboard from './components/FarmersDashboard';
import BuyerMarketplace from './components/BuyerMarketplace';
import PriceAnalytics from './components/PriceAnalytics';

function App() {
  const [activeTab, setActiveTab] = useState('farmers');

  // Set initial language from localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferred-language');
    if (savedLanguage) {
      // i18n will handle this automatically due to our configuration
    }
  }, []);

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'farmers':
        return <FarmersDashboard />;
      case 'buyers':
        return <BuyerMarketplace />;
      case 'analytics':
        return <PriceAnalytics />;
      case 'settings':
        return (
          <div className="settings-page">
            <h2>Settings & Alerts</h2>
            <p>Settings page coming soon...</p>
          </div>
        );
      default:
        return <FarmersDashboard />;
    }
  };

  return (
    <div className="App">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="main-content">
        {renderActiveTab()}
      </main>
    </div>
  );
}

export default App;