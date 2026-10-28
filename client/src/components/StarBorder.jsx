import React from 'react';
import './StarBorder.css';

const StarBorder = ({ children, className = '' }) => {
  return (
    <div className={`star-border-container ${className}`}>
      <div className="star-border-inner">
        {children}
      </div>
    </div>
  );
};

export default StarBorder;
