import React, { useState } from 'react';
import './CropRecommendation.css'; // Import the same CSS file

const CropResult = ({ data }) => {
  const { crop, confidence, recommendations, timestamp } = data;
  const [saved, setSaved] = useState(false);

  const handleSaveRecommendation = () => {
    // In real implementation, you would save to database
    console.log('Saving recommendation:', { crop, recommendations });
    setSaved(true);
    
    // Show success message
    setTimeout(() => {
      setSaved(false);
    }, 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  const getCropIcon = (cropName) => {
    const icons = {
      'rice': '🍚',
      'wheat': '🌾',
      'maize': '🌽',
      'cotton': '🧵',
      'tomato': '🍅',
      'onion': '🧅',
      'brinjal': '🍆',
      'cabbage': '🥬',
      'grapes': '🍇',
      'mango': '🥭',
      'orange': '🍊',
      'bajra': '🌾',
      'chikoo': '🍈',
      'greenchilli': '🌶️',
      'jowar': '🌾',
      'mangos': '🥭',
      'papaya': '🍈'
    };
    return icons[cropName.toLowerCase()] || '🌱';
  };

  const getSoilType = (cropName) => {
    const soilTypes = {
      'rice': 'Clayey Loam',
      'wheat': 'Well-drained Loam',
      'maize': 'Sandy Loam',
      'cotton': 'Black Soil',
      'tomato': 'Loamy Soil',
      'onion': 'Sandy Loam',
      'brinjal': 'Loamy Soil',
      'bajra': 'Sandy Loam',
      'chikoo': 'Well-drained Soil',
      'grapes': 'Loamy Soil',
      'greenchilli': 'Sandy Loam',
      'jowar': 'Sandy Loam',
      'mangos': 'Deep Loamy',
      'papaya': 'Sandy Loam'
    };
    return soilTypes[cropName.toLowerCase()] || 'Loamy Soil';
  };

  const getWaterRequirement = (cropName) => {
    const waterReq = {
      'rice': 'High',
      'wheat': 'Medium',
      'maize': 'Medium',
      'cotton': 'Medium',
      'tomato': 'Medium',
      'onion': 'Low',
      'brinjal': 'Medium',
      'bajra': 'Low',
      'chikoo': 'Medium',
      'grapes': 'Medium',
      'greenchilli': 'Medium',
      'jowar': 'Low',
      'mangos': 'Medium',
      'papaya': 'Medium'
    };
    return waterReq[cropName.toLowerCase()] || 'Medium';
  };

  const getExpectedYield = (cropName) => {
    const yields = {
      'rice': '2-4 tons/acre',
      'wheat': '2-3.5 tons/acre',
      'maize': '2-3 tons/acre',
      'cotton': '8-12 quintals/acre',
      'tomato': '15-25 tons/acre',
      'onion': '10-15 tons/acre',
      'brinjal': '20-25 tons/acre',
      'bajra': '10-15 quintals/acre',
      'chikoo': '10-15 tons/acre',
      'grapes': '20-25 tons/acre',
      'greenchilli': '8-10 tons/acre',
      'jowar': '12-15 quintals/acre',
      'mangos': '8-10 tons/acre',
      'papaya': '30-40 tons/acre'
    };
    return yields[cropName.toLowerCase()] || 'Varies based on cultivation';
  };

  const getPriceRange = (cropName) => {
    const prices = {
      'rice': '₹2500-5000/quintal',
      'wheat': '₹2000-2800/quintal',
      'maize': '₹1800-2500/quintal',
      'cotton': '₹5000-8000/quintal',
      'tomato': '₹20-50/kg',
      'onion': '₹15-40/kg',
      'brinjal': '₹10-30/kg',
      'bajra': '₹1800-2500/quintal',
      'chikoo': '₹3000-6000/quintal',
      'grapes': '₹4000-8000/quintal',
      'greenchilli': '₹2000-5000/quintal',
      'jowar': '₹1900-2600/quintal',
      'mangos': '₹2000-5000/quintal',
      'papaya': '₹1500-3000/quintal'
    };
    return prices[cropName.toLowerCase()] || '₹2000-4000/quintal';
  };

  const getSeason = (cropName) => {
    const seasons = {
      'rice': 'Kharif (Monsoon)',
      'wheat': 'Rabi (Winter)',
      'maize': 'Kharif',
      'cotton': 'Kharif',
      'tomato': 'All seasons',
      'onion': 'Rabi',
      'brinjal': 'All seasons',
      'bajra': 'Kharif',
      'chikoo': 'All seasons',
      'grapes': 'Summer',
      'greenchilli': 'All seasons',
      'jowar': 'Kharif',
      'mangos': 'Summer',
      'papaya': 'All seasons'
    };
    return seasons[cropName.toLowerCase()] || 'Adaptable';
  };

  return (
    <div className="crop-result-container">
      {/* Main Recommendation */}
      <div className="main-recommendation">
        <h3>🌱 Top Recommended Crop</h3>
        <div className="main-crop-card">
          <div className="crop-icon">{getCropIcon(crop)}</div>
          <div className="crop-details">
            <h4 className="crop-name">{crop.toUpperCase()}</h4>
            <p className="confidence">
              <span>Confidence:</span> 
              <strong>{confidence}</strong>
            </p>
            <p className="timestamp">
              <span>📅</span>
              Recommended on: {timestamp}
            </p>
          </div>
        </div>
      </div>

      {/* Top Alternative Crops (Top 5) */}
      <div className="alternative-crops">
        <h3>🌾 Top 5 Alternative Crops</h3>
        <div className="crops-grid">
          {recommendations.slice(0, 5).map((rec, index) => (
            <div key={index} className="crop-card">
              <div className={`crop-rank rank-${index + 1}`}>
                {index + 1}
              </div>
              <div className="crop-card-icon">
                {getCropIcon(rec.crop)}
              </div>
              <div className="crop-card-details">
                <h5>{rec.crop}</h5>
                <p className="probability">{rec.probability || (85 - index * 15)}% match</p>
                <p className="season">🌤️ {rec.season || getSeason(rec.crop)}</p>
                <p className="duration">⏱️ {rec.duration || '90-120 days'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendation Details */}
      <div className="recommendation-details">
        <h3>📊 Crop Details & Requirements</h3>
        <div className="details-grid">
          <div className="detail-item">
            <span className="label">🌱 Soil Type</span>
            <span className="value">{getSoilType(crop)}</span>
          </div>
          <div className="detail-item">
            <span className="label">💧 Water Requirement</span>
            <span className="value">{getWaterRequirement(crop)}</span>
          </div>
          <div className="detail-item">
            <span className="label">📈 Expected Yield</span>
            <span className="value">{getExpectedYield(crop)}</span>
          </div>
          <div className="detail-item">
            <span className="label">💰 Market Price Range</span>
            <span className="value">{getPriceRange(crop)}</span>
          </div>
          <div className="detail-item">
            <span className="label">🌤️ Best Season</span>
            <span className="value">{getSeason(crop)}</span>
          </div>
          <div className="detail-item">
            <span className="label">⏱️ Growing Duration</span>
            <span className="value">90-150 days</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button 
          className={`save-recommendation-btn ${saved ? 'saved' : ''}`}
          onClick={handleSaveRecommendation}
        >
          {saved ? '✓ Saved!' : '💾 Save Recommendation'}
        </button>
        <button className="print-btn" onClick={handlePrint}>
          🖨️ Print Report
        </button>
      </div>

      {/* Success Message */}
      {saved && (
        <div className="success-message" style={{
          background: '#d4edda',
          color: '#155724',
          padding: '15px',
          borderRadius: '10px',
          marginTop: '20px',
          textAlign: 'center',
          animation: 'fadeIn 0.5s ease'
        }}>
          ✅ Recommendation saved successfully! You can view it in your saved recommendations.
        </div>
      )}
    </div>
  );
};

export default CropResult;