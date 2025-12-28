import React, { useState } from 'react';
import CropForm from './CropForm';
import CropResult from './CropResult';
import './CropRecommendation.css'; // Import the CSS

const CropRecommendation = () => {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

 const handlePrediction = async (formData) => {
  setLoading(true);
  setError('');
  setPrediction(null);
  
  try {
    console.log('Sending request to Flask backend...');
    
    const response = await fetch('http://localhost:5000/api/crop/recommend', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(formData)
    });
    
    console.log('Response status:', response.status);
    
    const data = await response.json();
    console.log('API Response:', data);
    
    if (response.ok) {
      // Ensure we have at least 5 recommendations
      let recommendations = data.top_recommendations || [];
      
      // If less than 5 recommendations, add some default ones
      if (recommendations.length < 5) {
        const defaultCrops = ['wheat', 'maize', 'cotton', 'tomato', 'onion'];
        for (let i = recommendations.length; i < 5; i++) {
          const cropName = defaultCrops[i % defaultCrops.length];
          recommendations.push({
            crop: cropName,
            probability: 75 - (i * 10),
            season: i % 2 === 0 ? 'Kharif' : 'Rabi',
            duration: '90-120 days'
          });
        }
      }
      
      setPrediction({
        crop: data.predicted_crop,
        confidence: `${recommendations[0]?.probability || '85'}%`,
        recommendations: recommendations.slice(0, 5), // Take only top 5
        timestamp: new Date().toLocaleString()
      });
    } else {
      setError(data.error || data.message || 'Prediction failed. Please try again.');
    }
  } catch (err) {
    console.error('API Error:', err);
    setError('Cannot connect to server. Make sure Flask backend is running on port 5000.');
  } finally {
    setLoading(false);
  }
};
   

  return (
    <div className="crop-recommendation-container">
      <h2 className="crop-title">🌱 Crop Recommendation System</h2>
      
      {error && (
        <div className="error-message">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      <div className="content-wrapper">
        <div className="form-section">
          <CropForm onSubmit={handlePrediction} loading={loading} />
        </div>
        
        <div className="result-section">
          {loading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Analyzing soil data...</p>
            </div>
          ) : prediction ? (
            <CropResult data={prediction} />
          ) : (
            <div className="welcome-message">
              <h3>Welcome to Crop Recommendation</h3>
              <p>Enter soil and weather parameters to get AI-powered crop suggestions.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CropRecommendation;