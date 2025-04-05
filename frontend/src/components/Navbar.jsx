import { useState, useEffect, useRef } from "react";
import { motion, useScroll } from "framer-motion";
import {
  Menu,
  X,
  Home,
  Info,
  Send,
  KeyRound,
  LayoutDashboard,
  Shield,
  User,
  LogOut,
  Bell,
  MessageSquare,
  Calendar
} from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { useNavigate, useLocation, Link } from "react-router-dom";
import Notifications from "../components/Notifications";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showDesktopNotifications, setShowDesktopNotifications] =
    useState(false);
  const [showMobileNotifications, setShowMobileNotifications] = useState(false);
  const { scrollY } = useScroll();
  const { isAuthenticated, isAdmin, logout, checkAuth } = useAuthStore(
    (state) => state
  );
  const navigate = useNavigate();
  const location = useLocation();
  const desktopNotificationsRef = useRef(null);
  const mobileNotificationsRef = useRef(null);

  useEffect(() => {
    return scrollY.on("change", () => setIsScrolled(scrollY.get() > 20));
  }, [scrollY]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Close notifications panel when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        desktopNotificationsRef.current &&
        !desktopNotificationsRef.current.contains(event.target)
      ) {
        setShowDesktopNotifications(false);
      }
      if (
        mobileNotificationsRef.current &&
        !mobileNotificationsRef.current.contains(event.target) &&
        !event.target.closest(".mobile-notifications-trigger")
      ) {
        setShowMobileNotifications(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [desktopNotificationsRef, mobileNotificationsRef]);

  const handleLogoClick = () => {
    if (isAuthenticated) {
      navigate("/xfeed");
    } else {
      navigate("/");
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const toggleDesktopNotifications = () => {
    setShowDesktopNotifications(!showDesktopNotifications);
  };

  const toggleMobileNotifications = (e) => {
    e.stopPropagation();
    setShowMobileNotifications(!showMobileNotifications);
    // Keep the menu open when showing notifications
  };

  const closeMobileNotifications = () => {
    setShowMobileNotifications(false);
  };

  const navItemsBeforeLogin = [
    { name: "Home", href: "/", icon: <Home className="w-4 h-4" /> },
    { name: "About", href: "/about", icon: <Info className="w-4 h-4" /> },
    { name: "Contact", href: "/contact", icon: <Send className="w-4 h-4" /> },
    { name: "Login", href: "/login", icon: <KeyRound className="w-4 h-4" /> },
  ];

  const navItemsAfterLogin = [
    { name: "XFeed", href: "/xfeed", icon: <Home className="w-4 h-4" /> },
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      name: "Chat",
      href: "/chat",
      icon: <MessageSquare className="w-4 h-4" />,
    },
    {
      name: "Sessions",
      href: "/sessions",
      icon: <Calendar className="w-4 h-4" />,
    },
    { name: "Profile", href: "/profile", icon: <User className="w-4 h-4" /> },
    {
      name: "Logout",
      onClick: handleLogout,
      icon: <LogOut className="w-4 h-4" />,
    },
  ];

  // Add admin link for admin users
  if (isAuthenticated && isAdmin) {
    navItemsAfterLogin.splice(4, 0, {
      name: "Admin",
      href: "/admin",
      icon: <Shield className="w-4 h-4" />,
    });
  }

  // Use the last known authentication state during loading
  const navigationItems = isAuthenticated
    ? navItemsAfterLogin
    : navItemsBeforeLogin;

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled ? "bg-white/60 backdrop-blur-lg shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Left side */}
          <div
            className="flex items-center cursor-pointer"
            onClick={handleLogoClick}
          >
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Skill</h1>
            <img src="images/logo.png" alt="Swap Icon" className="w-6 h-6 sm:w-8 sm:h-8" />
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Change</h1>
          </div>

          {/* Desktop Navigation - Right side */}
          <div className="hidden md:flex ml-auto items-center space-x-4 lg:space-x-8">
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
                      ? "w-full opacity-100"
                      : "w-0 opacity-0 group-hover:w-1/2 group-hover:opacity-100"
                  }`}
                />
              </Link>
            ))}

            {/* Add Notifications component after all navigation items on desktop */}
            {isAuthenticated && (
              <div className="relative" ref={desktopNotificationsRef}>
                <button
                  onClick={toggleDesktopNotifications}
                  className="relative p-1.5 rounded-full text-gray-700 hover:text-violet-400 transition-colors focus:outline-none"
                  aria-label="Notifications"
                >
                  <Bell className="w-6 h-6" />
                  <div className="absolute -top-1 -right-1">
                    <Notifications inMobileMenu={true} />
                  </div>
                </button>

                {showDesktopNotifications && (
                  <div className="absolute right-0 top-12 w-72 sm:w-80 md:w-96 bg-white rounded-xl shadow-xl border border-gray-200 max-h-[80vh] overflow-hidden z-50">
                    <Notifications isOpen={true} />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile menu button - WITHOUT notifications */}
          <div className="md:hidden flex items-center">
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
        className={`md:hidden overflow-hidden ${
          isOpen
            ? "bg-white/60 backdrop-blur-md border border-white/20 shadow-lg"
            : "bg-transparent"
        }`}
      >
        <div className="px-3 sm:px-4 pt-2 pb-3 space-y-1">
          {navigationItems.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              onClick={(e) => {
                if (item.onClick) item.onClick(e);
                setIsOpen(false);
              }}
              className={`flex items-center gap-2 text-gray-700 hover:text-violet-400 px-3 py-2 rounded-md
                ${
                  location.pathname === item.href
                    ? "bg-violet-400/20 text-violet-600"
                    : ""
                }`}
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

          {/* Add Notifications item to mobile menu */}
          {isAuthenticated && (
            <div
              onClick={toggleMobileNotifications}
              className={`mobile-notifications-trigger flex items-center justify-between w-full px-3 py-2 rounded-md text-gray-700 hover:text-violet-400 hover:bg-gray-50 cursor-pointer ${
                showMobileNotifications
                  ? "bg-violet-400/20 text-violet-600"
                  : ""
              }`}
            >
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                <span>Notifications</span>
              </div>
              <div className="relative">
                <Notifications inMobileMenu={true} />
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Mobile Notifications Panel - Fixed Overlay */}
      {showMobileNotifications && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex justify-center items-center p-3 sm:p-4"
          onClick={closeMobileNotifications}
        >
          <div
            ref={mobileNotificationsRef}
            className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">Notifications</h3>
              <button
                onClick={closeMobileNotifications}
                className="p-1.5 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div
              className="overflow-y-auto"
              style={{ maxHeight: "calc(90vh - 4rem)" }}
            >
              <Notifications isOpen={true} />
            </div>
          </div>
        </div>
      )}
    </motion.nav>
  );
};

export default Navbar;
