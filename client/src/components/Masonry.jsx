import React from 'react';
import './Masonry.css';

const Masonry = ({ items = [], renderItem }) => {
  return (
    <div className="masonry-grid">
      {items.map((item, idx) => (
        <div key={idx} className="masonry-item">
          {renderItem ? renderItem(item, idx) : item}
        </div>
      ))}
    </div>
  );
};

export default Masonry;
