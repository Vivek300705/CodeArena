import { useEffect, useState } from 'react';

export function TypewriterSubtitle({ text }) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed('');
    setDone(false);
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        setDone(true);
      }
    }, 55);
    return () => clearInterval(interval);
  }, [text]);

  return (
    <div style={{
      fontFamily: "'Space Mono', monospace",
      fontSize: '13px',
      color: '#8FAABF',
      letterSpacing: '0.05em',
      margin: '4px 0 24px',
      minHeight: '20px'
    }}>
      {`> `}
      <span>{displayed}</span>
      {/* Blinking cursor until typing finishes */}
      {!done && (
        <span style={{
          display: 'inline-block',
          width: '8px',
          height: '13px',
          background: '#FF6B35',
          marginLeft: '2px',
          verticalAlign: 'text-bottom',
          animation: 'blink 0.7s step-end infinite'
        }} />
      )}
    </div>
  );
}
