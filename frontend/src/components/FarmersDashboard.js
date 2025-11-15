import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import '../styles/FarmersDashboard.css';

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

  const API_BASE_URL = 'http://127.0.0.1:5000/api';

  useEffect(() => {
    checkBackendConnection();
    fetchDistricts();
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
      const response = await fetch(`${API_BASE_URL}/districts/bajra`);
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
        const response = await fetch(`${API_BASE_URL}/districts/${commodity}`);
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
      const response = await fetch(`${API_BASE_URL}/markets/${districtId}`);
      
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
      const farmerResponse = await fetch(`${API_BASE_URL}/farmers`, {
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
      Object.entries(cropForm).forEach(([key, value]) => {
        if (value !== null && value !== '') {
          formData.append(key.replace(/([A-Z])/g, '_$1').toLowerCase(), value);
        }
      });
      formData.append('farmer_id', farmerId);

      const productResponse = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        body: formData
      });

      if (productResponse.ok) {
        alert('Product added successfully!');
        resetForms();
        setStep(1);
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

  return (
    <div className="farmers-dashboard">
      <div className="container">
        {/* Status Bar */}
        <div className="status-bar">
          <div className={`status-indicator ${backendStatus === 'connected' ? 'connected' : 'error'}`}>
            <div className="status-dot"></div>
            {backendStatus === 'connected' ? 'Connected' : 'Server Offline'}
            {backendStatus === 'connected' && districts.length > 0 && ` • ${districts.length} districts`}
          </div>
        </div>

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
    </div>
  );
};

export default FarmersDashboard;