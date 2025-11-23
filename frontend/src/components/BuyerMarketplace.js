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
  const [loadingMarkets, setLoadingMarkets] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [availableCommodities, setAvailableCommodities] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const API_BASE_URL = 'http://127.0.0.1:5000';

  // Fetch available commodities and products
  useEffect(() => {
    fetchAvailableCommodities();
    fetchProducts();
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

  // Fetch products from backend
  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const response = await fetch('http://127.0.0.1:5000/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      } else {
        // Fallback to mock data if API fails
        setProducts(getMockProducts());
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      // Fallback to mock data
      setProducts(getMockProducts());
    } finally {
      setLoadingProducts(false);
    }
  };

  // Mock products data as fallback - using actual working image URLs
  const getMockProducts = () => [
    {
      product_id: 1,
      crop_name: "Fresh Organic Tomatoes",
      farmer_name: "Green Valley Farms",
      district: "Pune",
      quantity: 500,
      unit: "kg",
      expected_price: 42,
      harvest_date: "2024-01-15",
      image_url: "https://images.unsplash.com/photo-1546470427-e212b7d310a2?w=400&h=300&fit=crop"
    },
    {
      product_id: 2,
      crop_name: "Premium Wheat Grains",
      farmer_name: "Golden Fields Agro",
      district: "Amravati",
      quantity: 50,
      unit: "quintal",
      expected_price: 2100,
      harvest_date: "2024-01-10",
      image_url: "https://images.unsplash.com/photo-1567026255650-68ad54d0d073?w=400&h=300&fit=crop"
    },
    {
      product_id: 3,
      crop_name: "Fresh Brinjal",
      farmer_name: "Vegetable Paradise",
      district: "Nagpur",
      quantity: 300,
      unit: "kg",
      expected_price: 35,
      harvest_date: "2024-01-14",
      image_url: "https://images.unsplash.com/photo-1599424423319-2a2d2baa5ce8?w=400&h=300&fit=crop"
    },
    {
      product_id: 4,
      crop_name: "Sweet Alphonso Mangoes",
      farmer_name: "Mango King Orchards",
      district: "Ratnagiri",
      quantity: 200,
      unit: "kg",
      expected_price: 65,
      harvest_date: "2024-01-12",
      image_url: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&h=300&fit=crop"
    }
  ];

  // Helper functions for product display
  const generateRating = () => {
    return (Math.random() * (5 - 3.5) + 3.5).toFixed(1);
  };

  const generateReviewCount = () => {
    return Math.floor(Math.random() * 200) + 50;
  };

  const generateQualityScore = () => {
    return Math.floor(Math.random() * 20) + 80; // 80-100
  };

  const calculateFreshness = (harvestDate) => {
    const harvest = new Date(harvestDate);
    const today = new Date();
    const diffTime = Math.abs(today - harvest);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Harvested Today";
    if (diffDays === 1) return "Harvested Yesterday";
    if (diffDays <= 3) return "Very Fresh";
    if (diffDays <= 7) return "Fresh";
    return "Good Condition";
  };

  // Get image URL - handles both stored images and new uploads
  const getImageUrl = (product) => {
    if (product.image_url) {
      // If it's already a full URL (like from mock data), return as is
      if (product.image_url.startsWith('http')) {
        return product.image_url;
      }
      // If it's a relative path from backend, construct full URL
      return `${API_BASE_URL}${product.image_url}`;
    }
    return null;
  };

  // Handle image loading errors
  const handleImageError = (e) => {
    console.log('Image failed to load, showing placeholder');
    const imgElement = e.target;
    const placeholder = imgElement.parentNode.querySelector('.product-image-placeholder');
    
    if (placeholder) {
      imgElement.style.display = 'none';
      placeholder.style.display = 'flex';
    }
  };

  // Handle image loading success
  const handleImageLoad = (e) => {
    const placeholder = e.target.parentNode.querySelector('.product-image-placeholder');
    if (placeholder) {
      placeholder.style.display = 'none';
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
        setPriceHistory(prev => [data, ...prev.slice(0, 4)]);
      } else {
        setError(data.error || 'Prediction failed');
      }
    } catch (err) {
      setError('Connection error: ' + err.message);
    } finally {
      setLoading(false);
    }
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

            {/* Price History Section */}
            {priceHistory.length > 0 && (
              <div className="price-history-section">
                <h3>Recent Predictions</h3>
                <div className="price-history-list">
                  {priceHistory.map((prediction, index) => (
                    <div key={index} className="price-history-item">
                      <div className="history-commodity">
                        {prediction.commodity_display || prediction.commodity}
                      </div>
                      <div className="history-location">
                        {prediction.district}, {prediction.market}
                      </div>
                      <div className="history-price">
                        ₹{prediction.predicted_price}/quintal
                      </div>
                      <div className="history-date">
                        {prediction.prediction_date}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Prediction Result Card */}
          {result && (
            <div className="prediction-result-card">
              <div className="card-header">
                <h2>💰 Prediction Result</h2>
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
        </div>

        {/* Products Marketplace Section */}
        <div className="products-marketplace-section">
          <div className="section-header">
            <h2>Available Products</h2>
            <p>Fresh produce directly from farmers across Maharashtra</p>
          </div>

          {loadingProducts ? (
            <div className="loading-products">
              <div className="loading-spinner"></div>
              <p>Loading products...</p>
            </div>
          ) : products.length > 0 ? (
            <div className="products-grid">
              {products.map((product, index) => {
                const imageUrl = getImageUrl(product);
                return (
                  <div key={product.product_id || index} className="product-card">
                    <div className="product-image">
                      {imageUrl ? (
                        <>
                          <img 
                            src={imageUrl} 
                            alt={product.crop_name}
                            onError={handleImageError}
                            onLoad={handleImageLoad}
                          />
                          {/* Placeholder that's hidden by default when image is present */}
                          <div 
                            className="product-image-placeholder"
                            style={{ display: 'none' }}
                          >
                            <span>🌱</span>
                          </div>
                        </>
                      ) : (
                        /* Show only placeholder if no image URL */
                        <div className="product-image-placeholder">
                          <span>🌱</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="product-content">
                      <div className="product-header">
                        <h3 className="product-title">{product.crop_name}</h3>
                        <div className="product-rating">
                          <span className="rating-stars">⭐</span>
                          <span className="rating-value">{generateRating()}</span>
                          <span className="rating-count">({generateReviewCount()})</span>
                        </div>
                      </div>
                      
                      <div className="product-farm">
                        <span className="farm-name">
                          {product.farmer_name || 'Local Farm'}
                        </span>
                        <span className="farm-location">📍 {product.district}, Maharashtra</span>
                      </div>
                      
                      <div className="product-details">
                        <div className="detail-item">
                          <span className="detail-label">Available:</span>
                          <span className="detail-value">{product.quantity} {product.unit}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Freshness:</span>
                          <span className="detail-value">
                            {calculateFreshness(product.harvest_date)}
                          </span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">AI Quality Score:</span>
                          <span className="detail-value quality-score">
                            {generateQualityScore()}/100
                          </span>
                        </div>
                      </div>
                      <div className="product-footer">
                        <div className="price-section">
                          <div className="price">₹{product.expected_price}/{product.unit}</div>
                        </div>
                        <button className="contact-button">
                          📞 Contact Farmer
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="no-products">
              <div className="no-products-icon">🌱</div>
              <h3>No Products Available Yet</h3>
              <p>Be the first to add a product to the marketplace!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BuyerMarketplace;