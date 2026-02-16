// src/components/AccessDenied.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const AccessDenied = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white  flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        {/* Warning Icon */}
        <div className="text-6xl mb-4">⛔</div>
        
        {/* Title */}
        <h1 className="text-3xl font-bold text-red-600 mb-4">
          Lama Ogola  
        </h1>
        
        {/* Message */}
        <p className="text-lg text-gray-800 font-semibold mb-2">
          Lama Ogola inad Systemkan wax ka badashid Ogolaanshiyo La'aan.
        </p>
        
        <p className="text-gray-600 mb-6">
          Fadlan La xidhiidh Maamulka Sare.
        </p>
        
        {/* Contact Info */}
        <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-red-500 mb-6">
          <p className="text-sm text-gray-600">
            Please contact your system administrator if you believe this is an error.
          </p>
        </div>
        
        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button 
            onClick={() => navigate('/signIn')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-full font-medium transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
          >
            Go Back
          </button>
          <button 
            onClick={() => navigate('/')}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full font-medium transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccessDenied;