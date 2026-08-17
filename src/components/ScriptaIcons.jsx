import React from 'react';

/**
 * Custom Personalized SVG Icons for Scripta
 * Geometric, crisp aesthetic harmonized with the Scripta logo
 */

export function IconScriptaPen({ size = 18, className = '' }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path 
        d="M19.07 4.93a3 3 0 0 0-4.24 0L3.8 15.96a1 1 0 0 0-.27.5l-1.5 5a1 1 0 0 0 1.23 1.23l5-1.5a1 1 0 0 0 .5-.27L19.07 9.17a3 3 0 0 0 0-4.24z" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      <path 
        d="M13.5 6.5l4 4M7.5 16.5l1.5-1.5" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
      />
    </svg>
  );
}

export function IconScriptaGrid({ size = 18, className = '' }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect x="3" y="3" width="7.5" height="7.5" rx="2" stroke="currentColor" strokeWidth="2" />
      <rect x="13.5" y="3" width="7.5" height="7.5" rx="2" stroke="currentColor" strokeWidth="2" />
      <rect x="3" y="13.5" width="7.5" height="7.5" rx="2" stroke="currentColor" strokeWidth="2" />
      <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export function IconScriptaChisel({ size = 18, className = '' }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path 
        d="M12 2l2.5 5.5L20 10l-4.5 4 1.5 6L12 17l-5 3 1.5-6L4 10l5.5-2.5L12 2z" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
    </svg>
  );
}

export function IconScriptaCompass({ size = 18, className = '' }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <polygon points="15.5 8.5 13.5 13.5 8.5 15.5 10.5 10.5 15.5 8.5" fill="currentColor" opacity="0.85" />
    </svg>
  );
}
