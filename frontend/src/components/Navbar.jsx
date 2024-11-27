// eslint-disable-next-line no-unused-vars
import React, { useState } from "react";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="backdrop-blur-lg bg-white/10 shadow-md fixed w-full z-50 rounded-lg py-5  px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl w-full mx-auto flex justify-between items-center">
        {/* Hamburger Menu */}
        <div className="flex items-center">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-gray-700 hover:text-blue-500 focus:outline-none"
          >
            <svg
              className="h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d={
                  isMobileMenuOpen
                    ? "M6 18L18 6M6 6l12 12" // Close icon
                    : "M4 6h16M4 12h16m-7 6h7" // Hamburger icon
                }
              />
            </svg>
          </button>
        </div>

        {/* Logo */}
        <div className="flex-1 text-center">
          <a href="/" className="text-2xl font-bold text-blue-600">
            SkillXChange
          </a>
        </div>

        {/* Login Button */}
        <div className="hidden md:flex items-center space-x-4">
          <a
            href="/login"
            className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600 transition"
          >
            Login
          </a>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`${
          isMobileMenuOpen ? "block" : "hidden"
        } md:hidden bg-white p-4 rounded-lg shadow-lg`}
      >
        <div className="space-y-4">
          <a
            href="/"
            className="block text-gray-700 hover:text-blue-500 font-medium"
          >
            Home
          </a>
          <a
            href="#features"
            className="block text-gray-700 hover:text-blue-500 font-medium"
          >
            Features
          </a>
          <a
            href="/about"
            className="block text-gray-700 hover:text-blue-500 font-medium"
          >
            About
          </a>
          <a
            href="/contact"
            className="block text-gray-700 hover:text-blue-500 font-medium"
          >
            Contact
          </a>
          <a
            href="/login"
            className="block bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600 transition"
          >
            Login
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
