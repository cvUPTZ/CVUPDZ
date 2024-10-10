// components/Header.js
import React from 'react';
import { Link } from 'react-router-dom';

function Header() {
  return (
    <header className="sticky top-0 bg-white shadow-md z-50">
      <nav className="container mx-auto px-6 py-3">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-gray-800">CV_UP</Link>
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/#services" className="text-gray-800 hover:text-blue-600">Services</Link>
            <Link to="/#job-search" className="text-gray-800 hover:text-blue-600">Job Search</Link>
            <Link to="/#success-stories" className="text-gray-800 hover:text-blue-600">Success Stories</Link>
            <Link to="/#blog" className="text-gray-800 hover:text-blue-600">Blog</Link>
            <Link to="/#contact" className="text-gray-800 hover:text-blue-600">Contact</Link>
            <Link to="/cv-builder" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Build CV</Link>
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Header;
