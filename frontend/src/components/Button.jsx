import React from 'react';

const Spinner = () => (
  <svg className="animate-spin h-5 w-5 mr-2 text-white inline-block" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
  </svg>
);

const Button = ({ children, onClick, type = 'button', disabled = false, variant = 'primary', loading = false }) => {
  const baseStyles = 'py-2 px-4 font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition duration-300 transform hover:scale-105 shadow-lg relative overflow-hidden';

  const variants = {
    primary: 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white hover:from-indigo-600 hover:to-pink-600 focus:ring-indigo-400',
    secondary: 'bg-gradient-to-r from-green-400 to-blue-500 text-white hover:from-green-500 hover:to-blue-600 focus:ring-green-400',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {loading && <Spinner />}
      <span className={loading ? 'opacity-70' : ''}>{children}</span>
    </button>
  );
};

export default Button;
