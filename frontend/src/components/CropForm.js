import React, { useState } from 'react';
import './CropRecommendation.css'; // Import the CSS

const CropForm = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    N: '', P: '', K: '',
    temperature: '', humidity: '',
    ph: '', rainfall: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="crop-form-container">
      <h3>Enter Soil & Weather Parameters</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="input-group">
            <label>Nitrogen (N):</label>
            <input 
              type="number" 
              name="N" 
              value={formData.N} 
              onChange={handleChange} 
              required 
              step="0.1"
              placeholder="e.g., 90"
            />
          </div>
          
          <div className="input-group">
            <label>Phosphorus (P):</label>
            <input 
              type="number" 
              name="P" 
              value={formData.P} 
              onChange={handleChange} 
              required 
              step="0.1"
              placeholder="e.g., 42"
            />
          </div>
          
          <div className="input-group">
            <label>Potassium (K):</label>
            <input 
              type="number" 
              name="K" 
              value={formData.K} 
              onChange={handleChange} 
              required 
              step="0.1"
              placeholder="e.g., 43"
            />
          </div>
          
          <div className="input-group">
            <label>Temperature (°C):</label>
            <input 
              type="number" 
              name="temperature" 
              value={formData.temperature} 
              onChange={handleChange} 
              required 
              step="0.1"
              placeholder="e.g., 20.8"
            />
          </div>
          
          <div className="input-group">
            <label>Humidity (%):</label>
            <input 
              type="number" 
              name="humidity" 
              value={formData.humidity} 
              onChange={handleChange} 
              required 
              step="0.1"
              placeholder="e.g., 82"
            />
          </div>
          
          <div className="input-group">
            <label>pH Level:</label>
            <input 
              type="number" 
              name="ph" 
              value={formData.ph} 
              onChange={handleChange} 
              required 
              step="0.1" 
              min="0" 
              max="14"
              placeholder="e.g., 6.5"
            />
          </div>
          
          <div className="input-group">
            <label>Rainfall (mm):</label>
            <input 
              type="number" 
              name="rainfall" 
              value={formData.rainfall} 
              onChange={handleChange} 
              required 
              step="0.1"
              placeholder="e.g., 202.9"
            />
          </div>
        </div>
        
        <button 
          type="submit" 
          disabled={loading} 
          className="submit-btn"
        >
          {loading ? (
            <>
              ⏳ Analyzing Soil Data...
            </>
          ) : (
            '🌱 Get Crop Recommendation'
          )}
        </button>
      </form>
      
      <div className="help-text">
        <p><strong>💡 Tip:</strong> Use realistic values for accurate predictions</p>
        <p className="example-values">Example: N=90, P=42, K=43, Temp=20.8°C, Humidity=82%, pH=6.5, Rainfall=202.9mm</p>
      </div>
    </div>
  );
};

export default CropForm;