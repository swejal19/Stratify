import React from 'react';
import './Loader.css';

export const Loader = () => {
  return (
    <div className="loader-overlay">
      <div className="loader-card">
        <div className="spinner-ring"></div>
        <div className="loader-text-container">
          <h2 className="loader-title">Stratify</h2>
          <p className="loader-subtitle">Preparing your ambitions...</p>
        </div>
      </div>
    </div>
  );
};
