import React from 'react';
import { useTranslation } from 'react-i18next';
import '../styles/Header.css';

const Header = ({ activeTab, setActiveTab }) => {
  const { t, i18n } = useTranslation();

  const languages = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
    { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' }
  ];

  const handleLanguageChange = (languageCode) => {
    i18n.changeLanguage(languageCode);
    // Save to backend user preference if user is logged in
    localStorage.setItem('preferred-language', languageCode);
  };

  const getCurrentLanguage = () => {
    return languages.find(lang => lang.code === i18n.language) || languages[0];
  };

  return (
    <header className="app-header">
      {/* Language Switcher */}
      <div className="header-language-switcher">
        <div className="language-dropdown">
          <button className="language-current">
            <span className="language-flag">{getCurrentLanguage().flag}</span>
            <span className="language-code">{getCurrentLanguage().code.toUpperCase()}</span>
          </button>
          <div className="language-dropdown-menu">
            {languages.map((lang) => (
              <button
                key={lang.code}
                className={`language-option ${i18n.language === lang.code ? 'active' : ''}`}
                onClick={() => handleLanguageChange(lang.code)}
              >
                <span className="language-flag">{lang.flag}</span>
                <span className="language-name">{lang.nativeName}</span>
                <span className="language-english">({lang.name})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Big Hero Image Section */}
      <div className="hero-section">
        <div className="hero-overlay">
          <div className="hero-content">
            <div className="logo-section">
              <h1 className="main-title">
                <span className="eye-symbol">👁️</span>
                {t('header.title')}
              </h1>
              <p className="tagline">{t('header.tagline')}</p>
              <p className="subtagline">{t('header.subtagline')}</p>
              
              <div className="hero-buttons">
                <button className="hero-btn direct-farm">
                  {t('header.directFarm')}
                </button>
                <button className="hero-btn ai-powered">
                  {t('header.aiPowered')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="navigation-tabs">
        <div className="nav-container">
          <button 
            className={`nav-tab ${activeTab === 'farmers' ? 'active' : ''}`}
            onClick={() => setActiveTab('farmers')}
          >
            <span className="nav-icon">👨‍🌾</span>
            <span className="nav-text">{t('navigation.farmers')}</span>
          </button>

          <button 
            className={`nav-tab ${activeTab === 'buyers' ? 'active' : ''}`}
            onClick={() => setActiveTab('buyers')}
          >
            <span className="nav-icon">🛒</span>
            <span className="nav-text">{t('navigation.buyers')}</span>
          </button>

          <button 
            className={`nav-tab ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <span className="nav-icon">📊</span>
            <span className="nav-text">{t('navigation.analytics')}</span>
          </button>

          <button 
            className={`nav-tab ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <span className="nav-icon">⚙️</span>
            <span className="nav-text">{t('navigation.settings')}</span>
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Header;