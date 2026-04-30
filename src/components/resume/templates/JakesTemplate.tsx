'use client';

import React from 'react';

export default function JakesTemplate({ data }: { data?: any }) {
  return (
    <div
      style={{
        width: '794px',
        minHeight: '1123px',
        background: 'white',
        color: 'black',
        fontFamily: 'sans-serif',
        padding: '30px',
        boxSizing: 'border-box',
      }}
    >
      <h1 style={{ textAlign: 'center' }}>{data?.fullName || 'John Doe'}</h1>
      <p style={{ textAlign: 'center' }}>Jakes Template Placeholder</p>
    </div>
  );
}
