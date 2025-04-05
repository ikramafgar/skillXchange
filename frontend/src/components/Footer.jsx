import { Heart } from "lucide-react";

function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-200 py-8 sm:py-10 px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
          {/* Logo and About */}
          <div className="lg:w-1/3 space-y-4">
            {/* Logo */}
            <div className="flex text-center">
              <a href="/">
                <div className="flex justify-center items-center">
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-100">Skill</h1>
                  <img src="images/logos.png" alt="Swap Icon" className="w-6 h-6 sm:w-8 sm:h-8 rounded-full" />
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-100">Change</h1>
                </div>
              </a>
            </div>
            <p className="text-gray-400 text-sm sm:text-base">
              Empowering individuals to learn, share, and grow by connecting
              through skill-based exchanges.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="/" className="hover:text-blue-500 text-sm sm:text-base">
                  Home
                </a>
              </li>
              <li>
                <a href="/about" className="hover:text-blue-500 text-sm sm:text-base">
                  About
                </a>
              </li>
              <li>
                <a href="/contact" className="hover:text-blue-500 text-sm sm:text-base">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Social Media and Contact */}
          <div className="lg:w-1/3 space-y-4">
            <h3 className="text-lg font-semibold text-white">Follow Us</h3>
            <div className="flex space-x-4">
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
            <p className="text-gray-400 text-sm sm:text-base">
              Built with{" "}
              <Heart className="inline-block text-red-500 w-4 h-4 sm:w-5 sm:h-5 mx-1" /> in the City of Flowers, Peshawar.
            </p>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="mt-8 border-t border-gray-700 pt-4 text-center text-gray-500 text-xs sm:text-sm">
          © {new Date().getFullYear()} SkillXchange. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default Footer;
