import React, { useState, useEffect } from 'react';
import '../styles/ActualPricesComponent.css'

const ActualPricesComponent = ({ commodity, district, predictedPrice, onClose }) => {
  const [actualPrices, setActualPrices] = useState([]);
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [priceTrend, setPriceTrend] = useState([]);
  const [activeTab, setActiveTab] = useState('prices');

  const API_BASE_URL = 'http://127.0.0.1:5000';

  // Fetch actual prices when component mounts or commodity changes
  useEffect(() => {
    if (commodity) {
      fetchActualPrices();
      fetchPriceTrend();
    }
  }, [commodity, district]);

  const fetchActualPrices = async () => {
    if (!commodity) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/actual-prices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commodity, district })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch actual prices');
      }

      const data = await response.json();
      setActualPrices(data.sources || []);
      
      // If we have predicted price, do comparison
      if (predictedPrice) {
        fetchPriceComparison(data.sources);
      }
    } catch (err) {
      setError('Error loading actual prices: ' + err.message);
      console.error('Fetch error:', err);
      // Generate mock data for demo
      setActualPrices(generateMockPrices());
    } finally {
      setLoading(false);
    }
  };

  const fetchPriceComparison = async (prices) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/price-comparison`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commodity,
          district,
          predicted_price: predictedPrice
        })
      });

      if (response.ok) {
        const data = await response.json();
        setComparison(data.comparison);
      }
    } catch (err) {
      console.error('Comparison error:', err);
      // Generate mock comparison
      setComparison(generateMockComparison(prices));
    }
  };

  const fetchPriceTrend = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/price-trend/${commodity}`);
      if (response.ok) {
        const data = await response.json();
        setPriceTrend(data.trend || []);
      }
    } catch (err) {
      console.error('Trend error:', err);
      setPriceTrend(generateMockTrend());
    }
  };

  // Helper functions for demo/fallback
  const generateMockPrices = () => {
    return [
      {
        source: "Government Mandi Portal",
        price: Math.floor(Math.random() * 500) + 2000,
        unit: "Quintal",
        date: new Date().toISOString().split('T')[0],
        reliability: "Official",
        market: "Pune Market Yard"
      },
      {
        source: "Agmarknet",
        price: Math.floor(Math.random() * 500) + 1950,
        unit: "Quintal",
        date: new Date().toISOString().split('T')[0],
        reliability: "Verified",
        market: "APMC Market"
      },
      {
        source: "Local Market Survey",
        price: Math.floor(Math.random() * 600) + 1900,
        unit: "Quintal",
        date: new Date().toISOString().split('T')[0],
        reliability: "Survey Data",
        market: "Local Market"
      }
    ];
  };

  const generateMockComparison = (prices) => {
    if (!prices || prices.length === 0) return null;
    
    const avg = prices.reduce((sum, p) => sum + p.price, 0) / prices.length;
    const diff = predictedPrice - avg;
    const diffPercent = (Math.abs(diff) / avg) * 100;
    
    let accuracy = "High";
    let color = "green";
    
    if (diffPercent > 15) {
      accuracy = "Low";
      color = "red";
    } else if (diffPercent > 8) {
      accuracy = "Moderate";
      color = "orange";
    }
    
    return {
      predicted_price: predictedPrice,
      average_actual: Math.round(avg),
      difference: Math.round(diff),
      difference_percentage: Math.round(diffPercent * 10) / 10,
      accuracy_level: accuracy,
      color: color
    };
  };

  const generateMockTrend = () => {
    const trend = [];
    const basePrice = 2200;
    
    for (let i = 30; i > 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      trend.push({
        date: date.toISOString().split('T')[0],
        price: basePrice + Math.floor(Math.random() * 200) - 100,
        unit: "Quintal"
      });
    }
    
    return trend;
  };

  const getReliabilityBadgeColor = (reliability) => {
    switch(reliability) {
      case 'Official': return '#10b981';
      case 'Verified': return '#3b82f6';
      case 'Survey Data': return '#f59e0b';
      case 'Direct Source': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="actual-prices-component">
      <div className="prices-header">
        <div className="header-left">
          <h2>📊 Current Market Prices</h2>
          <p className="commodity-info">
            {commodity ? `${commodity.charAt(0).toUpperCase() + commodity.slice(1)} in ${district || 'Maharashtra'}` : 'Select a commodity'}
          </p>
        </div>
        <div className="header-right">
          <button onClick={fetchActualPrices} className="refresh-btn">
            🔄 Refresh
          </button>
          {onClose && (
            <button onClick={onClose} className="close-btn">
              ×
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="prices-tabs">
        <button 
          className={`tab-btn ${activeTab === 'prices' ? 'active' : ''}`}
          onClick={() => setActiveTab('prices')}
        >
          📈 Current Prices
        </button>
        <button 
          className={`tab-btn ${activeTab === 'comparison' ? 'active' : ''}`}
          onClick={() => setActiveTab('comparison')}
        >
          ⚖️ Price Comparison
        </button>
        <button 
          className={`tab-btn ${activeTab === 'trend' ? 'active' : ''}`}
          onClick={() => setActiveTab('trend')}
        >
          📊 Price Trend
        </button>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Fetching live market prices...</p>
        </div>
      ) : error ? (
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <p>{error}</p>
          <button onClick={fetchActualPrices} className="retry-btn">
            Retry
          </button>
        </div>
      ) : (
        <>
          {/* Current Prices Tab */}
          {activeTab === 'prices' && (
            <div className="prices-content">
              <div className="price-summary">
                <div className="summary-item">
                  <div className="summary-label">Average Market Price</div>
                  <div className="summary-value">
                    {actualPrices.length > 0 
                      ? formatCurrency(actualPrices.reduce((sum, p) => sum + p.price, 0) / actualPrices.length)
                      : '--'}
                  </div>
                  <div className="summary-unit">per Quintal</div>
                </div>
                
                <div className="summary-item">
                  <div className="summary-label">Price Range</div>
                  <div className="summary-value">
                    {actualPrices.length > 0
                      ? `${formatCurrency(Math.min(...actualPrices.map(p => p.price)))} - ${formatCurrency(Math.max(...actualPrices.map(p => p.price)))}`
                      : '--'}
                  </div>
                  <div className="summary-unit">Market Variation</div>
                </div>
              </div>

              <div className="sources-list">
                <h3>Price Sources</h3>
                {actualPrices.map((price, index) => (
                  <div key={index} className="source-card">
                    <div className="source-header">
                      <div className="source-name">{price.source}</div>
                      <div 
                        className="source-reliability"
                        style={{ backgroundColor: getReliabilityBadgeColor(price.reliability) }}
                      >
                        {price.reliability}
                      </div>
                    </div>
                    
                    <div className="source-details">
                      <div className="source-price-info">
                        <div className="source-price">{formatCurrency(price.price)}</div>
                        <div className="source-unit">/{price.unit}</div>
                      </div>
                      
                      <div className="source-meta">
                        <div className="source-market">
                          <span className="market-icon">🏪</span>
                          {price.market}
                        </div>
                        <div className="source-date">
                          <span className="date-icon">📅</span>
                          {price.date}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Price Comparison Tab */}
          {activeTab === 'comparison' && predictedPrice && comparison && (
            <div className="comparison-content">
              <div className="comparison-card">
                <div className="comparison-header">
                  <h3>AI Prediction vs Market Reality</h3>
                  <div className={`accuracy-badge ${comparison.color}`}>
                    {comparison.accuracy_level} Accuracy
                  </div>
                </div>
                
                <div className="price-comparison-grid">
                  <div className="comparison-item prediction">
                    <div className="comparison-label">Your AI Prediction</div>
                    <div className="comparison-price">
                      {formatCurrency(comparison.predicted_price)}
                    </div>
                    <div className="comparison-unit">per Quintal</div>
                  </div>
                  
                  <div className="comparison-item actual">
                    <div className="comparison-label">Market Average</div>
                    <div className="comparison-price">
                      {formatCurrency(comparison.average_actual)}
                    </div>
                    <div className="comparison-unit">per Quintal</div>
                  </div>
                </div>
                
                <div className="difference-display">
                  <div className="difference-label">
                    {comparison.difference > 0 ? 'Overestimated by' : 'Underestimated by'}
                  </div>
                  <div className={`difference-value ${comparison.color}`}>
                    {formatCurrency(Math.abs(comparison.difference))} 
                    <span className="difference-percentage">
                      ({Math.abs(comparison.difference_percentage)}%)
                    </span>
                  </div>
                </div>
                
                <div className="accuracy-meter">
                  <div className="meter-label">Prediction Accuracy</div>
                  <div className="meter-bar">
                    <div 
                      className="meter-fill"
                      style={{ 
                        width: `${100 - Math.min(comparison.difference_percentage, 30)}%`,
                        backgroundColor: comparison.color
                      }}
                    ></div>
                  </div>
                  <div className="meter-values">
                    <span>Low</span>
                    <span>Moderate</span>
                    <span>High</span>
                    <span>Very High</span>
                  </div>
                </div>
              </div>
              
              <div className="insights-section">
                <h4>📋 Insights</h4>
                <ul className="insights-list">
                  <li>
                    <span className="insight-icon">💡</span>
                    {comparison.difference_percentage < 5 
                      ? "Your prediction is very close to market prices!"
                      : comparison.difference_percentage < 10
                      ? "Good prediction! Consider seasonal trends for better accuracy."
                      : "Consider checking recent market trends for better accuracy."}
                  </li>
                  <li>
                    <span className="insight-icon">📅</span>
                    Prices may vary based on harvest season, weather, and demand
                  </li>
                  <li>
                    <span className="insight-icon">📍</span>
                    {district ? `Local ${district} prices may differ from state average` 
                              : 'Prices vary significantly by region'}
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Price Trend Tab */}
          {activeTab === 'trend' && priceTrend.length > 0 && (
            <div className="trend-content">
              <div className="trend-header">
                <h3>30-Day Price Trend</h3>
                <div className="trend-stats">
                  <div className="trend-stat">
                    <div className="stat-label">Current</div>
                    <div className="stat-value">
                      {formatCurrency(priceTrend[priceTrend.length - 1].price)}
                    </div>
                  </div>
                  <div className="trend-stat">
                    <div className="stat-label">30-Day Change</div>
                    <div className={`stat-value ${priceTrend[priceTrend.length - 1].price > priceTrend[0].price ? 'positive' : 'negative'}`}>
                      {priceTrend[priceTrend.length - 1].price > priceTrend[0].price ? '+' : ''}
                      {(((priceTrend[priceTrend.length - 1].price - priceTrend[0].price) / priceTrend[0].price) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="trend-chart">
                <div className="chart-container">
                  {priceTrend.map((day, index) => {
                    const maxPrice = Math.max(...priceTrend.map(p => p.price));
                    const minPrice = Math.min(...priceTrend.map(p => p.price));
                    const range = maxPrice - minPrice;
                    const height = range > 0 
                      ? ((day.price - minPrice) / range) * 100 
                      : 50;
                    
                    return (
                      <div key={index} className="chart-bar-container">
                        <div 
                          className="chart-bar"
                          style={{ height: `${height}%` }}
                          title={`${day.date}: ${formatCurrency(day.price)}`}
                        ></div>
                        <div className="chart-label">
                          {index % 5 === 0 ? day.date.split('-')[2] : ''}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className="trend-details">
                <div className="trend-observation">
                  <span className="observation-icon">🔍</span>
                  <div className="observation-text">
                    {priceTrend[priceTrend.length - 1].price > priceTrend[0].price
                      ? 'Prices are trending upwards over the last 30 days'
                      : 'Prices are trending downwards over the last 30 days'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
      
      {/* Footer Actions */}
      <div className="prices-footer">
        <div className="footer-info">
          <span className="info-icon">ℹ️</span>
          <span>Prices updated daily from multiple sources</span>
        </div>
        <div className="footer-actions">
          <button className="footer-btn secondary">
            📈 View Detailed Report
          </button>
          <button className="footer-btn primary">
            🔔 Set Price Alert
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActualPricesComponent;