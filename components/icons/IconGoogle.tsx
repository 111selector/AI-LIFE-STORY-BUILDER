
import React from 'react';

const IconGoogle: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M21.35 11.1h-9.35v2.55h5.49c-.23 1.62-1.39 3.53-5.49 3.53-3.27 0-5.99-2.7-5.99-6s2.72-6 5.99-6c1.86 0 3.09.79 3.8 1.5l2.06-2.06C18.15 3.29 15.63 2 12 2 6.48 2 2 6.48 2 12s4.48 10 10 10c5.77 0 9.6-4.06 9.6-9.82 0-.74-.07-1.38-.15-2.08z" />
  </svg>
);

export default IconGoogle;
