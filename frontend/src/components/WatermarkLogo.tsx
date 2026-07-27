import React from 'react';
import watermarkImage from './watermark.png';

export const WatermarkLogo: React.FC = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.09] select-none z-0">
      <img
        src={watermarkImage}
        alt="Watermark Logo"
        style={{
          width: '340px',
          height: '340px',
          objectFit: 'contain',
        }}
      />
    </div>
  );
};
