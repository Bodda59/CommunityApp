import React from 'react';

const Card = ({ children, onClick, avatar }) => {
  return (
    <div
      onClick={onClick}
      className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-white/20 transition-all duration-300 hover:scale-105 hover:shadow-3xl hover:border-indigo-400/40 cursor-pointer group relative overflow-hidden"
    >
      {avatar && (
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-10">
          {avatar}
        </div>
      )}
      <div className="relative z-20">{children}</div>
      <div className="absolute inset-0 rounded-2xl pointer-events-none group-hover:bg-gradient-to-br group-hover:from-indigo-500/10 group-hover:to-pink-500/10 transition-all duration-300" />
    </div>
  );
};

export default Card;
