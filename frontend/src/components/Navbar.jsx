// eslint-disable-next-line no-unused-vars
import React, { useState } from "react";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="backdrop-blur-lg bg-white/10 shadow-md fixed top-5 left-1/2 transform -translate-x-1/2 w-[90%] md:w-[70%] lg:w-[50%] max-w-screen-xl z-50 rounded-2xl border-solid border-[1px] border-gray-300 ring-zinc-300 py-2 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl w-full mx-auto flex justify-between items-center gap-3">
        {/* Logo */}
        <div className="flex text-center">
          <a href="/" className="text-lg lg:text-xl font-bold text-blue-600 ">
            <div className="w-16 h-12  flex justify-center items-center">
              <img
                className="w-full h-auto scale-150 object-contain"
                src="./images/logoblack.png"
                alt="Skill Logo"
              />
            </div>
          </a>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex space-x-6 items-center">
          <a
            href="/"
            className="text-gray-700 hover:text-blue-500 font-medium px-4 py-2 border-solid border-[1px] border-gray-300 rounded-lg bg-white transition flex items-center gap-2"
          >
            <i className="fas fa-home"></i> Home
          </a>
          <a
            href="/about"
            className="text-gray-700 hover:text-blue-500 font-medium px-4 py-2 border-solid border-[1px] border-gray-300  rounded-lg bg-white transition flex items-center gap-2"
          >
            <i className="fas fa-info-circle"></i> About
          </a>
          <a
            href="/contact"
            className="text-gray-700 hover:text-blue-500 font-medium px-4 py-2 border-solid border-[1px] border-gray-300  rounded-lg bg-white transition flex items-center gap-2"
          >
            <i className="fas fa-envelope"></i> Contact
          </a>
          <a
            href="/login"
            className="text-lg lg:text-xl text-blue-500 font-medium flex items-center"
          >
            Login
          </a>
        </div>

        {/* Hamburger Menu */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-gray-700 hover:text-blue-500 focus:outline-none"
          >
            <i
              className={`fas ${
                isMobileMenuOpen ? "fa-times" : "fa-bars"
              } text-lg`}
            ></i>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`${
          isMobileMenuOpen ? "block" : "hidden"
        } md:hidden bg-white p-4 mt-2 rounded-lg shadow-lg`}
      >
        <div className="space-y-4">
          <a
            href="/"
            className=" text-gray-700 hover:text-blue-500 font-medium flex items-center gap-2"
          >
            <i className="fas fa-home"></i> Home
          </a>
          <a
            href="/about"
            className=" text-gray-700 hover:text-blue-500 font-medium flex items-center gap-2"
          >
            <i className="fas fa-info-circle"></i> About
          </a>
          <a
            href="/contact"
            className=" text-gray-700 hover:text-blue-500 font-medium flex items-center gap-2"
          >
            <i className="fas fa-envelope"></i> Contact
          </a>
          <a
            href="/login"
            className=" bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600 transition flex items-center gap-2"
          >
            Login
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
