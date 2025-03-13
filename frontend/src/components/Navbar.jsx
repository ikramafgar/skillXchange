import { useState, useEffect } from "react";
import { motion, useScroll } from "framer-motion";
import {
  Menu,
  X,
  Layers,
  Home,
  Info,
  Send,
  KeyRound,
  LayoutDashboard,
} from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { useNavigate, useLocation, Link } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();
  const { isAuthenticated, logout, checkAuth } = useAuthStore((state) => state);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    return scrollY.on("change", () => setIsScrolled(scrollY.get() > 20));
  }, [scrollY]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleLogoClick = () => {
    if (isAuthenticated) {
      navigate('/skills');
    } else {
      navigate('/');
    }
  };

  const navItemsBeforeLogin = [
    { name: "Home", href: "/", icon: <Home className="w-4 h-4" /> },
    { name: "About", href: "/about", icon: <Info className="w-4 h-4" /> },
    { name: "Contact", href: "/contact", icon: <Send className="w-4 h-4" /> },
    { name: "Login", href: "/login", icon: <KeyRound className="w-4 h-4" /> },
  ];

  const navItemsAfterLogin = [
    { name: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
    { name: "Skills", href: "/skills", icon: <Layers className="w-4 h-4" /> },
  ];

  // Use the last known authentication state during loading
  const navigationItems = isAuthenticated ? navItemsAfterLogin : navItemsBeforeLogin;

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? "bg-white/60 backdrop-blur-lg shadow-lg" : "bg-transparent"}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-24">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Left side */}
          <div className="flex items-center cursor-pointer" onClick={handleLogoClick}>
            <h1 className="text-2xl font-bold text-gray-800">Skill</h1>
            <img src="images/logo.png" alt="Swap Icon" className="w-8 h-8" />
            <h1 className="text-2xl font-bold text-gray-800">Change</h1>
          </div>

          {/* Desktop Navigation - Right side */}
          <div className="hidden md:flex ml-auto items-center space-x-8">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={item.onClick}
                className={`flex items-center gap-2 text-gray-700 font-bold hover:text-violet-400 transition-colors relative group`}
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2"
                >
                  {item.icon}
                  <span>{item.name}</span>
                </motion.div>
                {/* Modern underline effect */}
                <span
                  className={`absolute -bottom-1 left-0 h-1 bg-violet-400 rounded-full transition-all duration-300 ${
                    location.pathname === item.href 
                      ? 'w-full opacity-100' 
                      : 'w-0 opacity-0 group-hover:w-1/2 group-hover:opacity-100'
                  }`}
                />
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-violet-400"
            >
              {isOpen ? <X /> : <Menu />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <motion.div
        initial={false}
        animate={isOpen ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
        className={`md:hidden overflow-hidden ${
          isOpen 
            ? 'bg-white/60 backdrop-blur-md border border-white/20 shadow-lg' 
            : 'bg-transparent'
        }`}
      >
        <div className="px-2 pt-2 pb-3 space-y-1">
          {navigationItems.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              onClick={(e) => {
                if (item.onClick) item.onClick(e);
                setIsOpen(false);
              }}
              className={`flex items-center gap-2 text-gray-700 hover:text-violet-400 px-3 py-2 rounded-md
                ${location.pathname === item.href ? 'bg-violet-400/20 text-violet-600' : ''}`}
            >
              <motion.div
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2"
              >
                {item.icon}
                <span>{item.name}</span>
              </motion.div>
            </Link>
          ))}
        </div>
      </motion.div>
    </motion.nav>
  );
};

export default Navbar;