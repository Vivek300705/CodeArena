import React from 'react';
import { useCountUp } from '../hooks/useCountUp';

const CountUp = ({ end, duration = 2000, prefix = '', suffix = '', className = '' }) => {
  const { count, elementRef } = useCountUp(end, duration);

  return (
    <span ref={elementRef} className={`font-mono ${className}`}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
};

export default CountUp;
