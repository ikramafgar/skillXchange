import { useState, useEffect } from "react";
import { motion, useScroll } from "framer-motion";
import {
  Menu,
  X,
  Layers,
  Cpu,
  Send,
  Home,
  Info,
  MessageCircle,
  KeyRound,
} from "lucide-react"; // Added icons
import { useAuthStore } from "../store/authStore"; // Import the authStore

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();
  const { isAuthenticated, login, logout, checkAuth } = useAuthStore(
    (state) => state
  ); // Access state and actions from the authStore

  useEffect(() => {
    checkAuth(); // Check authentication status on load
    return scrollY.onChange(() => setIsScrolled(scrollY.get() > 20));
  }, [scrollY, checkAuth]);

  const navItemsBeforeLogin = [
    { name: "Home", href: "/", icon: <Home className="w-4 h-4" /> },
    { name: "About", href: "/about", icon: <Info className="w-4 h-4" /> },
    { name: "Contact", href: "/contact", icon: <Send className="w-4 h-4" /> },
    {
      name: "Login",
      href: "/login",
      icon: <KeyRound className="w-4 h-4" />,
      onClick: () => login("email@example.com", "password"),
    }, // For testing, add login functionality
  ];

  const navItemsAfterLogin = [
    { name: "Skills", href: "/skills", icon: <Layers className="w-4 h-4" /> },
    { name: "Profile", href: "/profile", icon: <Cpu className="w-4 h-4" /> },
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: <Cpu className="w-4 h-4" />,
    },
    {
      name: "Messages",
      href: "/messages",
      icon: <MessageCircle className="w-4 h-4" />,
    },
    {
      name: "Logout",
      href: "/",
      icon: <X className="w-4 h-4" />,
      onClick: logout,
    },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled ? "bg-white/60 backdrop-blur-lg shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-24">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Left side */}
          <a href="/">
            <div className="flex items-center ">
              <h1 className="text-2xl font-bold text-gray-800">Skill</h1>
              <img src="images/swap.svg" alt="Swap Icon" className="w-8 h-8" />
              <h1 className="text-2xl font-bold text-gray-800">Change</h1>
            </div>
          </a>

          {/* Desktop Navigation - Right side */}
          <div className="hidden md:flex ml-auto items-center space-x-8">
            {(isAuthenticated ? navItemsAfterLogin : navItemsBeforeLogin).map(
              (item) => (
                <motion.a
                  key={item.name}
                  href={item.href}
                  onClick={item.onClick}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 text-gray-700 font-bold hover:text-violet-400 transition-colors"
                >
                  {item.icon}
                  <span>{item.name}</span>
                </motion.a>
              )
            )}
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
        animate={
          isOpen ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }
        }
        className="md:hidden overflow-hidden bg-blur"
      >
        <div className="px-2 pt-2 pb-3 space-y-1">
          {(isAuthenticated ? navItemsAfterLogin : navItemsBeforeLogin).map(
            (item) => (
              <motion.a
                key={item.name}
                href={item.href}
                onClick={item.onClick}
                whileTap={{ scale: 0.95 }}
                className="items-center gap-2 text-gray-700 hover:text-violet-400 block px-3 py-2"
              >
                {item.icon}
                <span>{item.name}</span>
              </motion.a>
            )
          )}
        </div>
      </motion.div>
    </motion.nav>
  );
};

export default Navbar;
