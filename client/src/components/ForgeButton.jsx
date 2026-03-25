import React from 'react';

const ForgeButton = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseClass = variant === 'primary' ? 'btn-primary' : 'btn-secondary';
  return (
    <button className={`${baseClass} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default ForgeButton;
