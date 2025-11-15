import React, { useState, useEffect } from 'react';
import '../styles/BuyerMarketplace.css';

const BuyerMarketplace = () => {
  const [commodity, setCommodity] = useState('');
  const [district, setDistrict] = useState('');
  const [market, setMarket] = useState('');
  const [districts, setDistricts] = useState([]);
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [priceHistory, setPriceHistory] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loadingMarkets, setLoadingMarkets] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [availableCommodities, setAvailableCommodities] = useState([]);

  // Load favorites from localStorage and fetch available commodities
  useEffect(() => {
    const saved = localStorage.getItem('buyerFavorites');
    if (saved) {
      try {
        setFavorites(JSON.parse(saved));
      } catch (err) {
        console.error('Error loading favorites:', err);
        setFavorites([]);
      }
    }
    
    // Fetch available commodities from backend
    fetchAvailableCommodities();
  }, []);

  // Fetch available commodities from backend
  const fetchAvailableCommodities = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/commodities');
      if (response.ok) {
        const data = await response.json();
        setAvailableCommodities(data.commodities || []);
      } else {
        // Fallback to default list if API fails
        setAvailableCommodities(getDefaultCommodities());
      }
    } catch (error) {
      console.error('Error fetching commodities:', error);
      // Fallback to default list
      setAvailableCommodities(getDefaultCommodities());
    }
  };

  // Default commodities list as fallback
  const getDefaultCommodities = () => [
    { id: 'bajra', name: '🌾 Bajra', color: 'green', icon: '🌾' },
    { id: 'brinjal', name: '🍆 Brinjal', color: 'purple', icon: '🍆' },
    { id: 'cabbage', name: '🥬 Cabbage', color: 'green', icon: '🥬' },
    { id: 'chikoo', name: '🍈 Chikoo', color: 'brown', icon: '🍈' },
    { id: 'cotton', name: '🧵 Cotton', color: 'blue', icon: '🧵' },
    { id: 'grapes', name: '🍇 Grapes', color: 'purple', icon: '🍇' },
    { id: 'greenchilli', name: '🌶️ Green Chilli', color: 'red', icon: '🌶️' },
    { id: 'jowar', name: '🌾 Jowar', color: 'amber', icon: '🌾' },
    { id: 'mangos', name: '🥭 Mangoes', color: 'orange', icon: '🥭' },
    { id: 'onion', name: '🧅 Onion', color: 'purple', icon: '🧅' },
    { id: 'orange', name: '🍊 Orange', color: 'orange', icon: '🍊' },
    { id: 'papaya', name: '🍈 Papaya', color: 'orange', icon: '🍈' },
    { id: 'rice', name: '🍚 Rice', color: 'white', icon: '🍚' },
    { id: 'tomato', name: '🍅 Tomato', color: 'red', icon: '🍅' },
    { id: 'wheat', name: '🌾 Wheat', color: 'amber', icon: '🌾' }
  ];

  // Fetch districts when commodity changes
  useEffect(() => {
    if (commodity) {
      fetchDistricts(commodity);
    } else {
      setDistricts([]);
      setDistrict('');
      setMarkets([]);
      setMarket('');
    }
  }, [commodity]);

  // Fetch markets when district changes
  useEffect(() => {
    if (district) {
      fetchMarkets(district);
    } else {
      setMarkets([]);
      setMarket('');
    }
  }, [district]);

  const fetchDistricts = async (commodity) => {
    try {
      setError('');
      setDistricts([]);
      setDistrict('');
      setMarkets([]);
      setMarket('');
      
      const response = await fetch(`http://127.0.0.1:5000/api/districts/${commodity}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to fetch districts: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
        setDistricts([]);
      } else {
        setDistricts(data.districts || []);
        if (data.districts.length === 0) {
          setError(`No districts available for ${commodity}`);
        }
      }
    } catch (err) {
      setError('Error loading districts: ' + err.message);
      setDistricts([]);
    }
  };

  const fetchMarkets = async (district) => {
    try {
      setError('');
      setMarkets([]);
      setMarket('');
      setLoadingMarkets(true);
      
      const response = await fetch(`http://127.0.0.1:5000/api/markets/${district}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to fetch markets: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
        setMarkets([]);
      } else {
        setMarkets(data.markets || []);
        if (data.markets.length === 0) {
          setError(`No markets available for ${district}`);
        }
      }
    } catch (err) {
      setError('Error loading markets: ' + err.message);
      setMarkets([]);
    } finally {
      setLoadingMarkets(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!commodity || !district || !market) {
      setError('Please fill all fields');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('http://127.0.0.1:5000/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commodity, district, market }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
        // Add to price history
        setPriceHistory(prev => [data, ...prev.slice(0, 9)]);
      } else {
        setError(data.error || 'Prediction failed');
      }
    } catch (err) {
      setError('Connection error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const addToFavorites = () => {
    if (!result) return;
    
    const newFavorite = {
      id: Date.now(),
      commodity: result.commodity,
      district: result.district,
      market: result.market,
      predictedPrice: result.predicted_price,
      timestamp: new Date().toISOString()
    };
    
    const newFavorites = [newFavorite, ...favorites.filter(f =>
      !(f.commodity === result.commodity && f.district === result.district && f.market === result.market)
    ).slice(0, 4)];
    
    setFavorites(newFavorites);
    localStorage.setItem('buyerFavorites', JSON.stringify(newFavorites));
  };

  const removeFromFavorites = (id) => {
    const newFavorites = favorites.filter(fav => fav.id !== id);
    setFavorites(newFavorites);
    localStorage.setItem('buyerFavorites', JSON.stringify(newFavorites));
  };

  const resetForm = () => {
    setCommodity('');
    setDistrict('');
    setMarket('');
    setDistricts([]);
    setMarkets([]);
    setResult(null);
    setError('');
  };

  const clearError = () => {
    setError('');
  };

  // Mock data for featured products with images - updated to match available commodities
  const featuredProducts = [
    {
      id: 1,
      name: "Fresh Tomatoes",
      commodity: "tomato",
      image: "🍅",
      rating: 4.8,
      reviews: 128,
      available: "500 kg",
      freshness: "Harvested: 1 day ago",
      qualityScore: 92,
      price: "₹42/kg",
      farmer: "Green Valley Farms",
      location: "Pune, Maharashtra",
      delivery: "Free delivery",
      verified: true
    },
    {
      id: 2,
      name: "Organic Onions",
      commodity: "onion",
      image: "🧅",
      rating: 3.9,
      reviews: 89,
      available: "1000 kg",
      freshness: "Harvested: 3 days ago",
      qualityScore: 89,
      price: "₹28/kg",
      farmer: "Organic Harvest Co.",
      location: "Nashik, Maharashtra",
      delivery: "Free delivery",
      verified: true
    },
    {
      id: 3,
      name: "Premium Wheat",
      commodity: "wheat",
      image: "🌾",
      rating: 5.0,
      reviews: 64,
      available: "50 quintals",
      freshness: "Quality: 98% Pure",
      qualityScore: 96,
      price: "₹2,100/quintal",
      farmer: "Golden Fields Agro",
      location: "Amravati, Maharashtra",
      delivery: "Free delivery",
      verified: true
    },
    {
      id: 4,
      name: "Fresh Brinjal",
      commodity: "brinjal",
      image: "🍆",
      rating: 4.3,
      reviews: 76,
      available: "300 kg",
      freshness: "Harvested: 2 days ago",
      qualityScore: 85,
      price: "₹35/kg",
      farmer: "Vegetable Paradise",
      location: "Nagpur, Maharashtra",
      delivery: "Free delivery",
      verified: true
    },
    {
      id: 5,
      name: "Sweet Mangoes",
      commodity: "mangos",
      image: "🥭",
      rating: 4.9,
      reviews: 203,
      available: "200 kg",
      freshness: "Season's Best",
      qualityScore: 94,
      price: "₹65/kg",
      farmer: "Mango King Orchards",
      location: "Ratnagiri, Maharashtra",
      delivery: "Free delivery",
      verified: true
    },
    {
      id: 6,
      name: "Fresh Cabbage",
      commodity: "cabbage",
      image: "🥬",
      rating: 4.2,
      reviews: 45,
      available: "400 kg",
      freshness: "Harvested: 1 day ago",
      qualityScore: 88,
      price: "₹22/kg",
      farmer: "Green Leaf Farms",
      location: "Satara, Maharashtra",
      delivery: "Free delivery",
      verified: true
    }
  ];

  return (
    <div className="buyer-marketplace-new">
      <div className="container">
        {/* Header Section */}
        <div className="marketplace-header-new">
          <h1>Buyer Marketplace</h1>
          <div className="search-bar-container">
            <input
              type="text"
              className="search-bar"
              placeholder="Search crops, farmers, or locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="search-btn">🔍</button>
          </div>
        </div>

        {/* Prediction Row */}
        <div className="prediction-row">
          {/* Prediction Form Card */}
          <div className="prediction-form-card">
            <div className="card-header">
              <h2>🎯 Get Price Prediction</h2>
              <p>Get AI-powered price forecasts for agricultural commodities</p>
            </div>
            
            <form onSubmit={handleSubmit} className="prediction-form-new">
              <div className="form-group-new">
                <label>Select Commodity</label>
                <select
                  value={commodity}
                  onChange={(e) => {
                    setCommodity(e.target.value);
                    clearError();
                  }}
                  required
                >
                  <option value="">Choose commodity</option>
                  {availableCommodities.map((comm) => (
                    <option key={comm.id} value={comm.id}>
                      {comm.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group-new">
                <label>Select District</label>
                <select
                  value={district}
                  onChange={(e) => {
                    setDistrict(e.target.value);
                    clearError();
                  }}
                  required
                  disabled={!commodity}
                >
                  <option value="">
                    {commodity ? 'Select district' : 'First select commodity'}
                  </option>
                  {districts.map((dist) => (
                    <option key={dist.id} value={dist.id}>{dist.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group-new">
                <label>Select Market</label>
                <select
                  value={market}
                  onChange={(e) => {
                    setMarket(e.target.value);
                    clearError();
                  }}
                  required
                  disabled={!district || loadingMarkets}
                >
                  <option value="">
                    {loadingMarkets ? 'Loading markets...' : 
                     !district ? 'First select district' : 
                     'Select market'}
                  </option>
                  {markets.map((mkt) => (
                    <option key={mkt.id} value={mkt.id}>{mkt.name}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="predict-btn-new"
                disabled={loading || !commodity || !district || !market}
              >
                {loading ? (
                  <>
                    <span className="loading-spinner"></span>
                    Predicting...
                  </>
                ) : (
                  '🎯 Get Prediction'
                )}
              </button>

              {error && (
                <div className="error-message-new">
                  <span>⚠️</span> 
                  <div className="error-text">{error}</div>
                  <button onClick={clearError} className="clear-error-new">×</button>
                </div>
              )}
            </form>
          </div>

          {/* Prediction Result Card */}
          {result && (
            <div className="prediction-result-card">
              <div className="card-header">
                <h2>💰 Prediction Result</h2>
                <button onClick={addToFavorites} className="favorite-btn-new">
                  ⭐ Save Prediction
                </button>
              </div>

              <div className="prediction-content">
                <div className="price-display">
                  <div className="price-amount">₹{result.predicted_price}</div>
                  <div className="price-unit">per quintal</div>
                </div>

                <div className="prediction-details">
                  <div className="detail-item">
                    <span className="detail-label">Commodity:</span>
                    <span className="detail-value">{result.commodity_display || result.commodity}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Market:</span>
                    <span className="detail-value">{result.market}, {result.district}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Prediction Date:</span>
                    <span className="detail-value">{result.prediction_date}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Confidence Score:</span>
                    <span className="detail-value confidence-high">94% Accurate</span>
                  </div>
                </div>

                <div className="prediction-actions">
                  <button className="action-btn secondary">
                    📈 View Price Trend
                  </button>
                  <button className="action-btn secondary">
                    🔔 Set Price Alert
                  </button>
                  <button onClick={resetForm} className="action-btn primary">
                    🔄 New Prediction
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Favorites Sidebar */}
          <div className="favorites-sidebar">
            <div className="sidebar-header">
              <h3>⭐ Favorites</h3>
              <span className="favorites-count">{favorites.length}</span>
            </div>
            
            <div className="favorites-list-new">
              {favorites.length > 0 ? (
                favorites.map(fav => (
                  <div key={fav.id} className="favorite-item-new">
                    <div className="fav-content">
                      <div className="fav-commodity">{fav.commodity}</div>
                      <div className="fav-location">{fav.district}</div>
                      <div className="fav-price">₹{fav.predictedPrice}</div>
                    </div>
                    <button 
                      onClick={() => removeFromFavorites(fav.id)} 
                      className="remove-fav-btn"
                      title="Remove from favorites"
                    >
                      ×
                    </button>
                  </div>
                ))
              ) : (
                <div className="empty-favorites">
                  <div className="empty-icon">⭐</div>
                  <p>No favorites yet</p>
                  <span>Your saved predictions will appear here</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Featured Products Section */}
        <div className="featured-products-section">
          <div className="section-header">
            <h2>Featured Products</h2>
            <p>Fresh produce from verified farmers across Maharashtra</p>
          </div>

          <div className="products-grid">
            {featuredProducts.map(product => (
              <div key={product.id} className="product-card">
                <div className="product-image">
                  <div className="product-emoji">{product.image}</div>
                  {product.verified && <div className="verified-badge">✓ Verified</div>}
                </div>

                <div className="product-content">
                  <div className="product-header">
                    <h3>{product.name}</h3>
                    <div className="rating-badge">
                      <span className="star">⭐</span>
                      <span className="rating-value">{product.rating}</span>
                      <span className="reviews">({product.reviews})</span>
                    </div>
                  </div>

                  <div className="farmer-info">
                    <span className="farmer-name">{product.farmer}</span>
                    <span className="location">📍 {product.location}</span>
                  </div>

                  <div className="product-details">
                    <div className="detail-row">
                      <span className="detail-label">Available:</span>
                      <span className="detail-value">{product.available}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Freshness:</span>
                      <span className="detail-value freshness-good">{product.freshness}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">AI Quality Score:</span>
                      <span className="detail-value quality-score">{product.qualityScore}/100</span>
                    </div>
                  </div>

                  <div className="delivery-badge">
                    🚚 {product.delivery}
                  </div>

                  <div className="product-footer">
                    <div className="price-section">
                      <div className="price">{product.price}</div>
                    </div>
                    <button className="contact-btn">
                      📞 Contact Farmer
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Access Commodity Grid */}
        <div className="commodity-grid-section">
          <div className="section-header">
            <h2>All Available Commodities</h2>
            <p>Click on any commodity to start price prediction</p>
          </div>
          
          <div className="commodity-grid">
            {availableCommodities.map(comm => (
              <div 
                key={comm.id} 
                className={`commodity-card ${commodity === comm.id ? 'active' : ''}`}
                onClick={() => setCommodity(comm.id)}
              >
                <div className="commodity-icon">{comm.icon}</div>
                <div className="commodity-name">{comm.name.split(' ')[1] || comm.name}</div>
                <div className="commodity-status">
                  {districts.length > 0 && commodity === comm.id ? 
                    `${districts.length} districts available` : 'Click to view districts'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerMarketplace;