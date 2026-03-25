import React from 'react';

const ForgeCard = ({ children, className = '', ...props }) => {
  return (
    <div className={`forge-card ${className}`} {...props}>
      {children}
    </div>
  );
};

export default ForgeCard;
