/* eslint-disable no-unused-vars */
import React from "react";

function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-200 py-10 px-6 md:px-12 lg:px-24">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
        {/* Logo and About */}
        <div className="lg:w-1/3">
          <h2 className="text-2xl font-bold text-white">SkillXchange</h2>
          <p className="mt-4 text-gray-400">
            Empowering individuals to learn, share, and grow by connecting
            through skill-based exchanges.
          </p>
        </div>

        {/* Navigation Links */}
        <div className="lg:w-1/3 flex flex-col sm:flex-row justify-between gap-8">
          <div>
            <h3 className="text-lg font-semibold text-white">Quick Links</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <a href="#" className="hover:text-blue-500">
                  Home
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-500">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-500">
                  Features
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-500">
                  Contact
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Support</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <a href="#" className="hover:text-blue-500">
                  FAQs
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-500">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-500">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-500">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Social Media and Contact */}
        <div className="lg:w-1/3">
          <h3 className="text-lg font-semibold text-white">Follow Us</h3>
          <div className="flex mt-4 space-x-4">
            <a href="#" className="text-gray-400 hover:text-blue-500">
              <i className="fab fa-facebook-f"></i>
            </a>
            <a href="#" className="text-gray-400 hover:text-blue-500">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="#" className="text-gray-400 hover:text-blue-500">
              <i className="fab fa-instagram"></i>
            </a>
            <a href="#" className="text-gray-400 hover:text-blue-500">
              <i className="fab fa-linkedin-in"></i>
            </a>
          </div>
          <p className="mt-4 text-gray-400">
            Contact us:{" "}
            <a
              href="mailto:support@skillxchange.com"
              className="text-blue-500 hover:underline"
            >
              support@skillxchange.com
            </a>
          </p>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="mt-8 border-t border-gray-700 pt-4 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} SkillXchange. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;
