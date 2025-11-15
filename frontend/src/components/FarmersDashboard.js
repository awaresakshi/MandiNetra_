import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import '../styles/FarmersDashboard.css';

// Import farmer image - make sure to add this image to your project
// You can download a farmer using phone image and place it in your assets folder
import farmerImage from '../assets/upscalemedia-transformed.jpeg'; // Add this image to your project

const FarmersDashboard = () => {
  const { t, i18n } = useTranslation();
  
  const [cropForm, setCropForm] = useState({
    cropName: '',
    cropType: '',
    quantity: '',
    unit: 'kg',
    expectedPrice: '',
    district: '',
    market: '',
    harvestDate: '',
    cropImage: null
  });
  
  const [farmerForm, setFarmerForm] = useState({
    name: '',
    phone: '',
    district: '',
    taluka: ''
  });
  
  const [districts, setDistricts] = useState([]);
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [backendStatus, setBackendStatus] = useState('checking');
  const [products, setProducts] = useState([]);

  const API_BASE_URL = 'http://127.0.0.1:5000';

  useEffect(() => {
    checkBackendConnection();
    fetchDistricts();
    fetchRecentProducts();
  }, []);

  const checkBackendConnection = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/');
      setBackendStatus(response.ok ? 'connected' : 'error');
    } catch (error) {
      setBackendStatus('error');
    }
  };

  const fetchDistricts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/districts/bajra`);
      if (response.ok) {
        const data = await response.json();
        setDistricts(data.districts || []);
      } else {
        await fetchDistrictsFallback();
      }
    } catch (error) {
      await fetchDistrictsFallback();
    }
  };

  const fetchDistrictsFallback = async () => {
    try {
      const commodities = ['tomato', 'onion', 'wheat', 'rice'];
      for (const commodity of commodities) {
        const response = await fetch(`${API_BASE_URL}/api/districts/${commodity}`);
        if (response.ok) {
          const data = await response.json();
          if (data.districts?.length > 0) {
            setDistricts(data.districts);
            break;
          }
        }
      }
    } catch (error) {
      console.error('All district fetches failed');
    }
  };

  const fetchMarkets = async (district) => {
    try {
      const districtId = districts.find(d => d.name === district)?.id || district;
      const response = await fetch(`${API_BASE_URL}/api/markets/${districtId}`);
      
      if (response.ok) {
        const data = await response.json();
        setMarkets(data.markets || []);
      } else {
        setMarkets([]);
      }
    } catch (error) {
      setMarkets([]);
    }
  };

  // Fetch recent products from the database
  const fetchRecentProducts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/recent`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      } else {
        // Fallback to all products if recent endpoint doesn't exist
        const allProductsResponse = await fetch(`${API_BASE_URL}/api/products`);
        if (allProductsResponse.ok) {
          const allData = await allProductsResponse.json();
          setProducts(allData.products?.slice(0, 6) || []);
        }
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  useEffect(() => {
    if (cropForm.district) {
      fetchMarkets(cropForm.district);
    } else {
      setMarkets([]);
    }
  }, [cropForm.district]);

  const handleFarmerInputChange = (field, value) => {
    setFarmerForm(prev => ({ ...prev, [field]: value }));
  };

  const handleCropInputChange = (field, value) => {
    setCropForm(prev => ({
      ...prev,
      [field]: value,
      ...(field === 'district' && { market: '' })
    }));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        alert('Please select a valid image file (JPEG, PNG, or WEBP)');
        return;
      }
      
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      
      setCropForm(prev => ({ ...prev, cropImage: file }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (backendStatus !== 'connected') {
      alert('Cannot connect to server. Please make sure the backend is running.');
      return;
    }
    
    setLoading(true);

    try {
      let farmerId;
      const farmerResponse = await fetch(`${API_BASE_URL}/api/farmers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(farmerForm)
      });

      if (farmerResponse.ok) {
        const farmerData = await farmerResponse.json();
        farmerId = farmerData.farmer_id;
      } else {
        const errorData = await farmerResponse.json();
        if (errorData.farmer_id) {
          farmerId = errorData.farmer_id;
        } else {
          throw new Error(errorData.error || 'Failed to create farmer');
        }
      }

      const formData = new FormData();
      
      // Append all crop form fields
      formData.append('crop_name', cropForm.cropName);
      formData.append('crop_type', cropForm.cropType);
      formData.append('quantity', cropForm.quantity);
      formData.append('unit', cropForm.unit);
      formData.append('expected_price', cropForm.expectedPrice);
      formData.append('district', cropForm.district);
      formData.append('market', cropForm.market);
      formData.append('harvest_date', cropForm.harvestDate);
      formData.append('farmer_id', farmerId);
      
      // Append image file if exists
      if (cropForm.cropImage) {
        formData.append('crop_image', cropForm.cropImage);
      }

      const productResponse = await fetch(`${API_BASE_URL}/api/products`, {
        method: 'POST',
        body: formData
      });

      if (productResponse.ok) {
        alert('Product added successfully!');
        resetForms();
        setStep(1);
        // Refresh the products list after adding new product
        fetchRecentProducts();
      } else {
        const errorData = await productResponse.json();
        throw new Error(errorData.error || 'Failed to add product');
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForms = () => {
    setFarmerForm({ name: '', phone: '', district: '', taluka: '' });
    setCropForm({
      cropName: '', cropType: '', quantity: '', unit: 'kg',
      expectedPrice: '', district: '', market: '', harvestDate: '', cropImage: null
    });
    const fileInput = document.getElementById('cropImageUpload');
    if (fileInput) fileInput.value = '';
  };

  const nextStep = () => {
    if (!farmerForm.name || !farmerForm.phone || !farmerForm.district) {
      alert('Please fill all required farmer details');
      return;
    }
    setStep(2);
  };

  const prevStep = () => setStep(1);

  const cropOptions = [
    'Tomato', 'Onion', 'Potato', 'Wheat', 'Rice', 'Bajra', 'Cotton', 
    'Sugarcane', 'Chikoo', 'Grapes', 'Mango', 'Orange', 'Papaya', 
    'Moong Dal', 'Mustard', 'Chickpea'
  ];

  const cropTypeOptions = [
    'Vegetable', 'Fruit', 'Grain', 'Pulse', 'Oilseed', 'Fiber', 'Commercial'
  ];

  // Calculate freshness based on harvest date
  const calculateFreshness = (harvestDate) => {
    if (!harvestDate) return 'Recently harvested';
    
    const harvest = new Date(harvestDate);
    const today = new Date();
    const diffTime = Math.abs(today - harvest);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Harvested: 1 day ago';
    if (diffDays <= 7) return `Harvested: ${diffDays} days ago`;
    if (diffDays <= 30) return `Harvested: ${Math.ceil(diffDays / 7)} weeks ago`;
    return `Harvested: ${Math.ceil(diffDays / 30)} months ago`;
  };

  // Generate random quality score (for demo purposes)
  const generateQualityScore = () => {
    return Math.floor(Math.random() * 20) + 80; // 80-100
  };

  // Generate random rating (for demo purposes)
  const generateRating = () => {
    return (Math.random() * 0.7 + 4.3).toFixed(1); // 4.3-5.0
  };

  // Generate random review count (for demo purposes)
  const generateReviewCount = () => {
    return Math.floor(Math.random() * 100) + 50; // 50-150
  };

  // Get image URL - handles both stored images and new uploads
  const getImageUrl = (product) => {
    if (product.image_url) {
      return `${API_BASE_URL}${product.image_url}`;
    }
    return null;
  };

  return (
    <div className="farmers-dashboard">
      <div className="dashboard-container">
        {/* Status Bar */}
        <div className="status-bar">
          <div className={`status-indicator ${backendStatus === 'connected' ? 'connected' : 'error'}`}>
            <div className="status-dot"></div>
            {backendStatus === 'connected' ? 'Connected' : 'Server Offline'}
            {backendStatus === 'connected' && districts.length > 0 && ` • ${districts.length} districts`}
          </div>
        </div>

        <div className="dashboard-content">
          {/* Left Side - Form */}
          <div className="form-section">
            {/* Progress Steps */}
            <div className="progress-steps-container">
              <div className={`step ${step >= 1 ? 'active' : ''}`}>
                <div className="step-icon">👨‍🌾</div>
                <span>Farmer Details</span>
              </div>
              <div className="step-connector"></div>
              <div className={`step ${step >= 2 ? 'active' : ''}`}>
                <div className="step-icon">🌱</div>
                <span>Crop Details</span>
              </div>
            </div>

            {/* Main Form Card */}
            <div className="form-card">
              <div className="card-header">
                <h1>
                  {step === 1 ? 'Add Farmer Details' : 'Add Crop Details'}
                </h1>
                <div className="step-badge">Step {step} of 2</div>
              </div>

              <div className="card-body">
                {backendStatus !== 'connected' && (
                  <div className="warning-banner">
                    <strong>Backend Server Not Running!</strong>
                    <p>Please start your Flask backend server on http://127.0.0.1:5000</p>
                  </div>
                )}
                
                <form onSubmit={handleSubmit}>
                  
                  {/* Step 1: Farmer Details */}
                  {step === 1 && (
                    <div className="form-grid">
                      <div className="section-title">
                        <span className="section-icon">👤</span>
                        Farmer Information
                      </div>

                      <div className="input-group">
                        <label>Full Name *</label>
                        <input
                          type="text"
                          placeholder="Enter your full name"
                          value={farmerForm.name}
                          onChange={(e) => handleFarmerInputChange('name', e.target.value)}
                          required
                        />
                      </div>

                      <div className="input-group">
                        <label>Phone Number *</label>
                        <input
                          type="tel"
                          placeholder="Enter 10-digit phone number"
                          value={farmerForm.phone}
                          onChange={(e) => handleFarmerInputChange('phone', e.target.value)}
                          required
                          pattern="[0-9]{10}"
                          maxLength="10"
                        />
                        <span className="input-hint">10-digit mobile number without country code</span>
                      </div>

                      <div className="input-group">
                        <label>District *</label>
                        <select
                          value={farmerForm.district}
                          onChange={(e) => handleFarmerInputChange('district', e.target.value)}
                          required
                        >
                          <option value="">Select District</option>
                          {districts.map((district) => (
                            <option key={district.id} value={district.name}>
                              {district.name}
                            </option>
                          ))}
                        </select>
                        <span className="input-hint">{districts.length} districts available</span>
                      </div>

                      <div className="input-group">
                        <label>Taluka (Optional)</label>
                        <input
                          type="text"
                          placeholder="Enter taluka name"
                          value={farmerForm.taluka}
                          onChange={(e) => handleFarmerInputChange('taluka', e.target.value)}
                        />
                      </div>

                      <div className="form-actions">
                        <button
                          type="button"
                          className="btn-primary"
                          onClick={nextStep}
                          disabled={backendStatus !== 'connected' || districts.length === 0}
                        >
                          Next: Crop Details →
                        </button>
                        {districts.length === 0 && backendStatus === 'connected' && (
                          <div className="warning-text">
                            No districts available. Please check if the commodity models are loaded correctly.
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Step 2: Crop Details */}
                  {step === 2 && (
                    <div className="form-grid">
                      <div className="section-title">
                        <span className="section-icon">🌾</span>
                        Crop Information
                      </div>

                      <div className="input-group">
                        <label>Crop Name *</label>
                        <select
                          value={cropForm.cropName}
                          onChange={(e) => handleCropInputChange('cropName', e.target.value)}
                          required
                        >
                          <option value="">Select Crop Name</option>
                          {cropOptions.map(crop => (
                            <option key={crop} value={crop}>{crop}</option>
                          ))}
                        </select>
                      </div>

                      <div className="input-group">
                        <label>Crop Type *</label>
                        <select
                          value={cropForm.cropType}
                          onChange={(e) => handleCropInputChange('cropType', e.target.value)}
                          required
                        >
                          <option value="">Select Crop Type</option>
                          {cropTypeOptions.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>

                      <div className="input-group">
                        <label>Quantity *</label>
                        <div className="quantity-input">
                          <input
                            type="number"
                            placeholder="Enter quantity"
                            value={cropForm.quantity}
                            onChange={(e) => handleCropInputChange('quantity', e.target.value)}
                            required
                            min="0"
                            step="0.01"
                          />
                          <select
                            value={cropForm.unit}
                            onChange={(e) => handleCropInputChange('unit', e.target.value)}
                          >
                            <option value="kg">kg</option>
                            <option value="quintal">Quintal</option>
                          </select>
                        </div>
                        <span className="input-hint">
                          {cropForm.unit === 'quintal' ? '1 Quintal = 100 kg' : 'Enter weight in kilograms'}
                        </span>
                      </div>

                      <div className="input-group">
                        <label>Expected Price (₹) *</label>
                        <div className="price-input">
                          <span className="currency-symbol">₹</span>
                          <input
                            type="number"
                            placeholder="Expected price per unit"
                            value={cropForm.expectedPrice}
                            onChange={(e) => handleCropInputChange('expectedPrice', e.target.value)}
                            required
                            min="0"
                            step="0.01"
                          />
                          <span className="unit-display">/{cropForm.unit}</span>
                        </div>
                        <span className="input-hint">Expected selling price per {cropForm.unit}</span>
                      </div>

                      <div className="input-group">
                        <label>District for Sale *</label>
                        <select
                          value={cropForm.district}
                          onChange={(e) => handleCropInputChange('district', e.target.value)}
                          required
                        >
                          <option value="">Select District</option>
                          {districts.map((district) => (
                            <option key={district.id} value={district.name}>
                              {district.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="input-group">
                        <label>Market *</label>
                        <select
                          value={cropForm.market}
                          onChange={(e) => handleCropInputChange('market', e.target.value)}
                          required
                          disabled={!cropForm.district || markets.length === 0}
                        >
                          <option value="">
                            {!cropForm.district 
                              ? 'First select district' 
                              : markets.length === 0 
                                ? 'No markets available' 
                                : 'Select Market'
                            }
                          </option>
                          {markets.map((market) => (
                            <option key={market.id} value={market.name}>
                              {market.name}
                            </option>
                          ))}
                        </select>
                        {cropForm.district && markets.length === 0 && (
                          <span className="warning-text">
                            No markets found for {cropForm.district}
                          </span>
                        )}
                      </div>

                      <div className="input-group">
                        <label>Harvest Date *</label>
                        <input
                          type="date"
                          value={cropForm.harvestDate}
                          onChange={(e) => handleCropInputChange('harvestDate', e.target.value)}
                          required
                          max={new Date().toISOString().split('T')[0]}
                        />
                        <span className="input-hint">Select the date when the crop was harvested</span>
                      </div>

                      <div className="input-group">
                        <label>Crop Photo (Optional)</label>
                        <div className="image-upload">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            id="cropImageUpload"
                          />
                          <label htmlFor="cropImageUpload" className="upload-area">
                            {cropForm.cropImage ? (
                              <div className="image-preview">
                                <img
                                  src={URL.createObjectURL(cropForm.cropImage)}
                                  alt="Crop preview"
                                />
                                <button
                                  type="button"
                                  className="remove-image"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setCropForm(prev => ({ ...prev, cropImage: null }));
                                  }}
                                >
                                  ×
                                </button>
                              </div>
                            ) : (
                              <div className="upload-placeholder">
                                <div className="upload-icon">📷</div>
                                <p>Click to upload crop image</p>
                                <span>JPG, PNG, WEBP (Max 5MB)</span>
                              </div>
                            )}
                          </label>
                        </div>
                      </div>

                      {/* Form Summary */}
                      <div className="summary-card">
                        <h3>Product Summary</h3>
                        <div className="summary-grid">
                          <div className="summary-item">
                            <span>Farmer:</span>
                            <strong>{farmerForm.name}</strong>
                          </div>
                          <div className="summary-item">
                            <span>Phone:</span>
                            <strong>{farmerForm.phone}</strong>
                          </div>
                          <div className="summary-item">
                            <span>Crop:</span>
                            <strong>{cropForm.cropName || 'Not selected'}</strong>
                          </div>
                          <div className="summary-item">
                            <span>Type:</span>
                            <strong>{cropForm.cropType || 'Not selected'}</strong>
                          </div>
                          <div className="summary-item">
                            <span>Quantity:</span>
                            <strong>{cropForm.quantity ? `${cropForm.quantity} ${cropForm.unit}` : 'Not entered'}</strong>
                          </div>
                          <div className="summary-item">
                            <span>Price:</span>
                            <strong>{cropForm.expectedPrice ? `₹${cropForm.expectedPrice}/${cropForm.unit}` : 'Not entered'}</strong>
                          </div>
                          <div className="summary-item">
                            <span>Location:</span>
                            <strong>{cropForm.district && cropForm.market ? `${cropForm.district}, ${cropForm.market}` : 'Not selected'}</strong>
                          </div>
                        </div>
                      </div>

                      <div className="form-actions">
                        <div className="action-buttons">
                          <button type="button" className="btn-secondary" onClick={prevStep}>
                            ← Back
                          </button>
                          <button
                            type="submit"
                            className="btn-primary"
                            disabled={loading || backendStatus !== 'connected' || !cropForm.market}
                          >
                            {loading ? (
                              <>
                                <div className="spinner"></div>
                                Adding Product...
                              </>
                            ) : (
                              'Add Product to Marketplace'
                            )}
                          </button>
                        </div>
                        <span className="action-hint">
                          Your product will be visible to buyers across the platform
                        </span>
                      </div>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>

          {/* Right Side - Farmer Image */}
          <div className="image-section">
            <div className="farmer-image-container">
              <img 
                src={farmerImage} 
                alt="Farmer using smartphone to manage crops"
                className="farmer-image"
              />
            </div>
          </div>
        </div>

        {/* Recent Products Section - Always visible below the form */}
        <div className="products-section">
          <div className="section-header">
            <h2 className="section-title">Recent Commodities</h2>
            <span className="section-subtitle">Latest products added by farmers</span>
          </div>
          
          {products.length > 0 ? (
            <div className="products-grid">
              {products.map((product, index) => {
                const imageUrl = getImageUrl(product);
                
                return (
                  <div key={product.product_id || index} className="product-card">
                    <div className="product-image">
                      {imageUrl ? (
                        <img 
                          src={imageUrl} 
                          alt={product.crop_name}
                          onError={(e) => {
                            // If image fails to load, show placeholder
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      
                      {/* Always show placeholder, but hide if image loads successfully */}
                      <div 
                        className="product-image-placeholder"
                        style={{ display: imageUrl ? 'none' : 'flex' }}
                      >
                        <span>🌱</span>
                      </div>
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

export default FarmersDashboard;