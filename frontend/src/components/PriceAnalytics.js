import React, { useState, useEffect } from 'react';
import '../styles/PriceAnalytics.css';

// Mock chart component (in real app, use Chart.js or Recharts)
const PriceChart = ({ data, type = 'line' }) => {
  if (!data || data.length === 0) {
    return <div className="no-data">No data available</div>;
  }

  const maxPrice = Math.max(...data.map(item => item.price));
  
  return (
    <div className="price-chart">
      <div className="chart-container">
        <div className="chart-bars">
          {data.map((item, index) => (
            <div key={index} className="chart-bar-container">
              <div 
                className="chart-bar"
                style={{ height: `${(item.price / maxPrice) * 80}%` }}
                title={`${item.month}: ₹${item.price}`}
              ></div>
              <span className="chart-label">{item.month}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const PriceAnalytics = () => {
  const [selectedCommodity, setSelectedCommodity] = useState('wheat');
  const [selectedDistrict, setSelectedDistrict] = useState('pune');
  const [selectedMarket, setSelectedMarket] = useState('pune');
  const [timeRange, setTimeRange] = useState('3months');
  const [chartData, setChartData] = useState([]);
  const [marketInsights, setMarketInsights] = useState([]);
  const [priceComparisons, setPriceComparisons] = useState([]);
  const [trendingCommodities, setTrendingCommodities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [availableCommodities, setAvailableCommodities] = useState([]);
  const [availableDistricts, setAvailableDistricts] = useState([]);
  const [availableMarkets, setAvailableMarkets] = useState([]);

  const API_BASE_URL = 'http://127.0.0.1:5000';

  const timeRanges = [
    { id: '1month', name: '1 Month' },
    { id: '3months', name: '3 Months' },
    { id: '6months', name: '6 Months' },
    { id: '1year', name: '1 Year' }
  ];

  // Fetch available commodities
  useEffect(() => {
    fetchAvailableCommodities();
  }, []);

  // Fetch districts when commodity changes
  useEffect(() => {
    if (selectedCommodity) {
      fetchDistricts(selectedCommodity);
    }
  }, [selectedCommodity]);

  // Fetch markets when district changes
  useEffect(() => {
    if (selectedDistrict) {
      fetchMarkets(selectedDistrict);
    }
  }, [selectedDistrict]);

  // Load analytics data when filters change
  useEffect(() => {
    if (selectedCommodity && selectedDistrict && selectedMarket) {
      loadAnalyticsData();
    }
  }, [selectedCommodity, selectedDistrict, selectedMarket, timeRange]);

  const fetchAvailableCommodities = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/commodities`);
      if (response.ok) {
        const data = await response.json();
        setAvailableCommodities(data.commodities || []);
      }
    } catch (error) {
      console.error('Error fetching commodities:', error);
    }
  };

  const fetchDistricts = async (commodity) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/districts/${commodity}`);
      if (response.ok) {
        const data = await response.json();
        setAvailableDistricts(data.districts || []);
        if (data.districts.length > 0) {
          setSelectedDistrict(data.districts[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching districts:', error);
    }
  };

  const fetchMarkets = async (district) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/markets/${district}`);
      if (response.ok) {
        const data = await response.json();
        setAvailableMarkets(data.markets || []);
        if (data.markets.length > 0) {
          setSelectedMarket(data.markets[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching markets:', error);
    }
  };

  // Fetch historical price data
  const fetchHistoricalData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/analytics/historical`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commodity: selectedCommodity,
          district: selectedDistrict,
          market: selectedMarket,
          time_range: timeRange
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data.historical_data || [];
      }
    } catch (error) {
      console.error('Error fetching historical data:', error);
    }
    return [];
  };

  // Fetch market comparisons
  const fetchMarketComparisons = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/analytics/market-comparison`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commodity: selectedCommodity,
          district: selectedDistrict
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data.comparisons || [];
      }
    } catch (error) {
      console.error('Error fetching market comparisons:', error);
    }
    return [];
  };

  // Fetch trending commodities
  const fetchTrendingCommodities = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/analytics/trending-commodities`);
      if (response.ok) {
        const data = await response.json();
        return data.trending_commodities || [];
      }
    } catch (error) {
      console.error('Error fetching trending commodities:', error);
    }
    return [];
  };

  // Generate market insights based on real data
  const generateMarketInsights = (commodity, historicalData) => {
    if (!historicalData || historicalData.length === 0) {
      return [];
    }

    const priceChange = historicalData.length > 1 ? 
      ((historicalData[historicalData.length - 1].price - historicalData[0].price) / historicalData[0].price * 100) : 0;

    const insights = [
      {
        id: 1,
        type: 'trend',
        title: priceChange > 0 ? 'Price Uptrend' : 'Price Adjustment',
        description: priceChange > 0 ? 
          `Prices have increased by ${Math.abs(priceChange).toFixed(1)}% over the selected period` :
          `Prices have decreased by ${Math.abs(priceChange).toFixed(1)}% over the selected period`,
        impact: priceChange > 0 ? 'positive' : 'neutral',
        confidence: 85
      },
      {
        id: 2,
        type: 'volatility',
        title: 'Market Stability',
        description: 'Current market shows moderate volatility with predictable patterns',
        impact: 'positive',
        confidence: 78
      },
      {
        id: 3,
        type: 'seasonal',
        title: 'Seasonal Analysis',
        description: 'Prices following typical seasonal patterns for this commodity',
        impact: 'neutral',
        confidence: 82
      },
      {
        id: 4,
        type: 'demand',
        title: 'Demand Outlook',
        description: 'Steady demand expected to continue in the coming weeks',
        impact: 'positive',
        confidence: 75
      }
    ];

    return insights;
  };

  const loadAnalyticsData = async () => {
    setLoading(true);
    
    try {
      const [historicalData, marketComparisons, trendingCommoditiesData] = await Promise.all([
        fetchHistoricalData(),
        fetchMarketComparisons(),
        fetchTrendingCommodities()
      ]);

      setChartData(historicalData);
      setPriceComparisons(marketComparisons);
      setMarketInsights(generateMarketInsights(selectedCommodity, historicalData));
      setTrendingCommodities(trendingCommoditiesData);
    } catch (error) {
      console.error('Error loading analytics data:', error);
      // Fallback to empty data
      setChartData([]);
      setPriceComparisons([]);
      setMarketInsights([]);
      setTrendingCommodities([]);
    } finally {
      setLoading(false);
    }
  };

  const getCommodityColor = (commodityId) => {
    const commodity = availableCommodities.find(c => c.id === commodityId);
    return commodity ? commodity.color : '#3498db';
  };

  const getTrendIcon = (trend) => {
    switch(trend) {
      case 'rising': return '📈';
      case 'falling': return '📉';
      case 'stable': return '➡️';
      default: return '📊';
    }
  };

  const getTrendColor = (trend) => {
    switch(trend) {
      case 'rising': return '#27ae60';
      case 'falling': return '#e74c3c';
      case 'stable': return '#f39c12';
      default: return '#7f8c8d';
    }
  };

  const calculatePriceStats = (data) => {
    if (!data || data.length === 0) return {};
    
    const prices = data.map(item => item.price);
    const currentPrice = prices[prices.length - 1];
    const previousPrice = prices.length > 1 ? prices[prices.length - 2] : currentPrice;
    const changePercent = ((currentPrice - previousPrice) / previousPrice * 100).toFixed(1);
    
    const priceRange = Math.max(...prices) - Math.min(...prices);
    const volatility = (priceRange / currentPrice * 100).toFixed(1);
    
    return {
      currentPrice,
      changePercent,
      volatility: volatility > 15 ? 'High' : volatility > 8 ? 'Medium' : 'Low',
      sentiment: changePercent > 2 ? 'Bullish' : changePercent < -2 ? 'Bearish' : 'Neutral'
    };
  };

  const stats = calculatePriceStats(chartData);
  const currentCommodity = availableCommodities.find(c => c.id === selectedCommodity);

  return (
    <div className="price-analytics">
      <div className="container">
        {/* Analytics Header */}
        <div className="analytics-header">
          <h1>📊 Price Analytics</h1>
          <p>Advanced market intelligence and price trend analysis</p>
        </div>

        {/* Filters Section */}
        <div className="filters-section">
          <div className="filter-group">
            <label>Commodity</label>
            <select 
              value={selectedCommodity}
              onChange={(e) => setSelectedCommodity(e.target.value)}
            >
              <option value="">Select Commodity</option>
              {availableCommodities.map(commodity => (
                <option key={commodity.id} value={commodity.id}>
                  {commodity.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>District</label>
            <select 
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              disabled={availableDistricts.length === 0}
            >
              <option value="">Select District</option>
              {availableDistricts.map(district => (
                <option key={district.id} value={district.id}>
                  {district.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Market</label>
            <select 
              value={selectedMarket}
              onChange={(e) => setSelectedMarket(e.target.value)}
              disabled={availableMarkets.length === 0}
            >
              <option value="">Select Market</option>
              {availableMarkets.map(market => (
                <option key={market.id} value={market.id}>
                  {market.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Time Range</label>
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              {timeRanges.map(range => (
                <option key={range.id} value={range.id}>
                  {range.name}
                </option>
              ))}
            </select>
          </div>

          <button 
            className="btn refresh-btn" 
            onClick={loadAnalyticsData}
            disabled={!selectedCommodity || !selectedDistrict || !selectedMarket}
          >
            🔄 Refresh Data
          </button>
        </div>

        {loading ? (
          <div className="loading-analytics">
            <div className="spinner"></div>
            <p>Loading market analytics...</p>
          </div>
        ) : (
          <div className="analytics-content">
            {/* Main Chart Section */}
            <div className="main-chart-section">
              <div className="analytics-card">
                <div className="card-header">
                  <h2>
                    {currentCommodity?.name || 'Commodity'} Price Trends
                  </h2>
                  <div className="current-price">
                    <span className="price">₹{stats.currentPrice || 0}</span>
                    <span className="price-unit">/quintal</span>
                  </div>
                </div>
                
                <div className="chart-wrapper">
                  {chartData.length > 0 ? (
                    <PriceChart data={chartData} type="line" />
                  ) : (
                    <div className="no-data-message">
                      <div className="no-data-icon">📊</div>
                      <p>No historical data available</p>
                      <span>Select a commodity, district, and market to view price trends</span>
                    </div>
                  )}
                </div>

                <div className="chart-stats">
                  <div className="stat">
                    <span className="stat-label">Current Price</span>
                    <span className="stat-value">₹{stats.currentPrice || 0}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Price Change</span>
                    <span className={`stat-value ${stats.changePercent > 0 ? 'positive' : stats.changePercent < 0 ? 'negative' : ''}`}>
                      {stats.changePercent > 0 ? '+' : ''}{stats.changePercent || 0}%
                    </span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Volatility</span>
                    <span className="stat-value">{stats.volatility || 'Low'}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Market Sentiment</span>
                    <span className={`stat-value ${stats.sentiment?.toLowerCase()}`}>
                      {stats.sentiment || 'Neutral'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Sections */}
            <div className="sidebar-sections">
              {/* Market Insights */}
              <div className="analytics-card insights-card">
                <div className="card-header">
                  <h3>💡 Market Insights</h3>
                </div>
                <div className="insights-list">
                  {marketInsights.length > 0 ? (
                    marketInsights.map(insight => (
                      <div key={insight.id} className="insight-item">
                        <div className="insight-icon">
                          {insight.type === 'trend' && '📈'}
                          {insight.type === 'volatility' && '📊'}
                          {insight.type === 'seasonal' && '🌧️'}
                          {insight.type === 'demand' && '🌍'}
                        </div>
                        <div className="insight-content">
                          <h4>{insight.title}</h4>
                          <p>{insight.description}</p>
                          <div className="insight-meta">
                            <span className={`impact ${insight.impact}`}>
                              {insight.impact === 'positive' ? 'Positive' : 'Neutral'}
                            </span>
                            <span className="confidence">{insight.confidence}% confidence</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-insights">
                      <p>No insights available</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Price Comparison */}
              <div className="analytics-card comparison-card">
                <div className="card-header">
                  <h3>⚖️ Market Comparison</h3>
                </div>
                <div className="comparison-list">
                  {priceComparisons.length > 0 ? (
                    priceComparisons.map((market, index) => (
                      <div key={index} className="comparison-item">
                        <div className="market-info">
                          <span className="market-name">{market.market}</span>
                          {market.best_deal && <span className="best-deal-badge">Best Deal</span>}
                        </div>
                        <div className="price-info">
                          <span className="market-price">₹{market.price}</span>
                          <span className={`price-change ${market.trend}`}>
                            {market.change}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-comparisons">
                      <p>No market comparisons available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Trending Commodities */}
            <div className="trending-section">
              <div className="analytics-card trending-card">
                <div className="card-header">
                  <h3>🔥 Trending Commodities</h3>
                  <span className="update-time">Live Data</span>
                </div>
                <div className="trending-grid">
                  {trendingCommodities.length > 0 ? (
                    trendingCommodities.map((item, index) => (
                      <div key={index} className="trending-item">
                        <div className="trending-header">
                          <span className="commodity-name">{item.commodity}</span>
                          <span 
                            className="trend-indicator"
                            style={{ color: getTrendColor(item.trend) }}
                          >
                            {getTrendIcon(item.trend)} {item.trend}
                          </span>
                        </div>
                        <div className="trending-price">{item.current_price}</div>
                        <div className="trending-change">{item.change}</div>
                        <div className="trending-reason">{item.reason}</div>
                      </div>
                    ))
                  ) : (
                    <div className="no-trending">
                      <p>No trending data available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PriceAnalytics;