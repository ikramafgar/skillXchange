// eslint-disable-next-line no-unused-vars
import React, { useState } from "react";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="backdrop-blur-lg bg-white/10 shadow-md fixed  flex  w-full z-50 rounded-lg">
      <div className=" flex justify-between gap-10  px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <a href="/" className="text-2xl font-bold text-blue-600">
              SkillXchange
            </a>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex  space-x-8 items-center">
            <a
              href="/"
              className="text-gray-700 hover:text-blue-500 font-medium transition"
            >
              Home
            </a>
            <a
              href="#features"
              className="text-gray-700 hover:text-blue-500 font-medium transition"
            >
              Features
            </a>
            <a
              href="#about"
              className="text-gray-700 hover:text-blue-500 font-medium transition"
            >
              About
            </a>
            <a
              href="#contact"
              className="text-gray-700 hover:text-blue-500 font-medium transition"
            >
              Contact
            </a>
          
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden">
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
                      ? "M6 18L18 6M6 6l12 12"
                      : "M4 6h16M4 12h16m-7 6h7"
                  }
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-4 pt-2 pb-3 space-y-1 sm:px-3">
            <a
              href="/"
              className="block text-gray-700 hover:text-blue-500 font-medium transition"
            >
              Home
            </a>
            <a
              href="#features"
              className="block text-gray-700 hover:text-blue-500 font-medium transition"
            >
              Features
            </a>
            <a
              href="#about"
              className="block text-gray-700 hover:text-blue-500 font-medium transition"
            >
              About
            </a>
            <a
              href="#contact"
              className="block text-gray-700 hover:text-blue-500 font-medium transition"
            >
              Contact
            </a>
            <a
              href="/signup"
              className="block bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600 transition"
            >
              Get Started
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
