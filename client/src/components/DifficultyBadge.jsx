import React from 'react';

const DifficultyBadge = ({ difficulty, className = '' }) => {
  const norm = difficulty?.toLowerCase() || 'easy';
  let badgeClass = 'badge-easy';
  let label = 'EASY';
  
  if (norm === 'medium') {
    badgeClass = 'badge-medium';
    label = 'MEDIUM';
  } else if (norm === 'hard') {
    badgeClass = 'badge-hard';
    label = 'HARD';
  }

  return (
    <span className={`${badgeClass} ${className}`}>
      {label}
    </span>
  );
};

export default DifficultyBadge;
