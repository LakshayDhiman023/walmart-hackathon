import React from 'react';

const logo = (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="18" cy="18" r="18" fill="#0071ce" />
    <text x="50%" y="55%" textAnchor="middle" fill="#ffc220" fontSize="18" fontWeight="bold" dy=".3em">W*</text>
  </svg>
);

const Header = () => {
  return (
    <header className="sticky top-0 z-40 bg-white shadow flex items-center justify-between px-4 sm:px-8 py-3 border-b border-gray-200">
      <div className="flex items-center gap-3">
        <span className="w-10 h-10 flex items-center justify-center rounded-full bg-[#0071CE]/10">
          {logo}
        </span>
        <span className="text-xl sm:text-2xl font-bold text-[#1F2937] tracking-tight select-none">
          RetailPulse: <span className="text-[#FFC220]">Walmart Hackathon 2025</span>
        </span>
      </div>
    </header>
  );
};

export default Header; 