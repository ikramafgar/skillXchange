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
  Calendar,
  ChevronDown
} from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { useNavigate, useLocation, Link } from "react-router-dom";
import Notifications from "../components/Notifications";

// Enhanced default profile image as base64 string with a colorful, modern design
const DEFAULT_PROFILE_IMAGE = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImEiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiM4QjVDRjYiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiM3QzNBRUQiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjEwMCIgZmlsbD0idXJsKCNhKSIvPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjgwIiByPSI0MCIgZmlsbD0iI0YzRjRGNiIvPjxwYXRoIGQ9Ik0xNjAgMTgwYzAtMzMuMTM3LTI2Ljg2My02MC02MC02MHMtNjAgMjYuODYzLTYwIDYwIiBmaWxsPSIjRjNGNEY2Ii8+PC9zdmc+";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showDesktopNotifications, setShowDesktopNotifications] =
    useState(false);
  const [showMobileNotifications, setShowMobileNotifications] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [profileImageError, setProfileImageError] = useState(false);
  const { scrollY } = useScroll();
  const { isAuthenticated, isAdmin, logout, checkAuth, user } = useAuthStore(
    (state) => state
  );
  const navigate = useNavigate();
  const location = useLocation();
  const desktopNotificationsRef = useRef(null);
  const mobileNotificationsRef = useRef(null);
  const profileDropdownRef = useRef(null);

  useEffect(() => {
    return scrollY.on("change", () => setIsScrolled(scrollY.get() > 20));
  }, [scrollY]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Reset profile image error state when user changes
  useEffect(() => {
    setProfileImageError(false);
  }, [user?.profilePic]);

  // Close notifications panel and profile dropdown when clicking outside
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
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target) &&
        !event.target.closest(".profile-dropdown-trigger")
      ) {
        setShowProfileDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [desktopNotificationsRef, mobileNotificationsRef, profileDropdownRef]);

  const handleLogoClick = () => {
    if (isAuthenticated) {
      navigate("/main");
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

  const toggleDesktopNotifications = (e) => {
    e?.stopPropagation();
    setShowDesktopNotifications(!showDesktopNotifications);
    // Don't close the profile dropdown when opening notifications
    //setShowProfileDropdown(false); 
  };

  const toggleMobileNotifications = (e) => {
    e.stopPropagation();
    setShowMobileNotifications(!showMobileNotifications);
    // Keep the menu open when showing notifications
  };

  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
    // Close notifications if profile dropdown is opened
    //setShowDesktopNotifications(false);
  };

  const closeMobileNotifications = () => {
    setShowMobileNotifications(false);
  };

  const closeProfileDropdown = () => {
    setShowProfileDropdown(false);
  };
  
  // Navigation handling with better mobile support
  const handleNavigation = (href, onClick) => {
    if (onClick) {
      onClick();
    } else if (href) {
      navigate(href);
    }
    setIsOpen(false);
  };

  const handleImageError = () => {
    setProfileImageError(true);
  };

  const navItemsBeforeLogin = [
    { name: "Home", href: "/", icon: <Home className="w-4 h-4" /> },
    { name: "About", href: "/about", icon: <Info className="w-4 h-4" /> },
    { name: "Contact", href: "/contact", icon: <Send className="w-4 h-4" /> },
    { name: "Login", href: "/login", icon: <KeyRound className="w-4 h-4" /> },
  ];

  // Modified navItemsAfterLogin to remove profile and logout which will be in the dropdown
  const navItemsAfterLogin = [
    { name: "Main", href: "/main", icon: <Home className="w-4 h-4" /> },
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      name: "Sessions",
      href: "/sessions",
      icon: <Calendar className="w-4 h-4" />,
    },
  ];

  // Add admin link for admin users
  if (isAuthenticated && isAdmin) {
    navItemsAfterLogin.splice(2, 0, {
      name: "Admin",
      href: "/admin",
      icon: <Shield className="w-4 h-4" />,
    });
  }

  // Use the last known authentication state during loading
  const navigationItems = isAuthenticated
    ? navItemsAfterLogin
    : navItemsBeforeLogin;

  // Profile dropdown items
  const profileDropdownItems = [
    {
      name: "Profile",
      href: "/profile",
      icon: <User className="w-4 h-4" />,
      onClick: () => closeProfileDropdown(),
    },
    {
      name: "Chat",
      href: "/chat",
      icon: <MessageSquare className="w-4 h-4" />,
      onClick: () => closeProfileDropdown(),
    },
    {
      name: "Notifications",
      icon: <Bell className="w-4 h-4" />,
      onClick: (e) => {
        e.preventDefault();
        toggleDesktopNotifications(e);
      },
    },
    {
      name: "Logout",
      icon: <LogOut className="w-4 h-4" />,
      onClick: () => {
        closeProfileDropdown();
        handleLogout();
      },
    },
  ];

  // Get profile image source with fallback
  const getProfileImageSrc = () => {
    if (profileImageError || !user?.profilePic) {
      return DEFAULT_PROFILE_IMAGE;
    }
    return user.profilePic;
  };

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
                className={`flex items-center gap-2 text-gray-700 font-bold hover:text-violet-500 transition-colors relative group`}
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
                  className={`absolute -bottom-1 left-0 h-1 bg-violet-500 rounded-full transition-all duration-300 ${
                    location.pathname === item.href
                      ? "w-full opacity-100"
                      : "w-0 opacity-0 group-hover:w-1/2 group-hover:opacity-100"
                  }`}
                />
              </Link>
            ))}

            {/* Profile Picture and Dropdown */}
            {isAuthenticated && (
              <div className="relative" ref={profileDropdownRef}>
                <button
                  onClick={toggleProfileDropdown}
                  className="profile-dropdown-trigger flex items-center gap-2 text-gray-700 hover:text-violet-500 transition-colors focus:outline-none group"
                  aria-label="User Profile"
                >
                  <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-violet-300 shadow-md bg-gray-50 flex items-center justify-center group-hover:border-violet-400 transition-all duration-200 hover:shadow-violet-100">
                    <img 
                      src={getProfileImageSrc()} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                      onError={handleImageError}
                    />
                  </div>
                  <ChevronDown className="w-4 h-4 group-hover:text-violet-500" />
                </button>

                {showProfileDropdown && (
                  <div className="absolute right-0 top-12 w-56 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50 animate-fadeIn">
                    <div className="p-3 border-b border-gray-100 bg-gradient-to-r from-violet-50 to-indigo-50">
                      <div className="flex flex-col">
                        <h3 className="font-semibold text-gray-800">{user?.name || "User"}</h3>
                        <p className="text-xs text-gray-500 truncate">{user?.email || ""}</p>
                      </div>
                    </div>
                    <div className="py-2">
                      {profileDropdownItems.map((item) => (
                        <Link
                          key={item.name}
                          to={item.href || "#"}
                          onClick={item.onClick}
                          className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-violet-50 transition-colors group"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-violet-500 group-hover:text-violet-600 transition-colors p-1.5 bg-violet-50 rounded-full group-hover:bg-violet-100">{item.icon}</span>
                            <span className="font-medium">{item.name}</span>
                          </div>
                          {item.name === "Notifications" && (
                            <div className="w-5 h-5">
                              <Notifications inMobileMenu={true} />
                            </div>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notifications Panel */}
                {showDesktopNotifications && (
                  <div 
                    ref={desktopNotificationsRef}
                    className="absolute right-0 top-12 w-72 sm:w-80 md:w-96 bg-white rounded-xl shadow-xl border border-gray-200 max-h-[80vh] overflow-hidden z-50 animate-fadeIn"
                  >
                    <div className="flex justify-between items-center p-3 border-b border-gray-100 bg-gradient-to-r from-violet-50 to-indigo-50">
                      <h3 className="font-semibold text-gray-800">Notifications</h3>
                      <button
                        onClick={(e) => toggleDesktopNotifications(e)}
                        className="p-1.5 rounded-full bg-white text-gray-500 hover:bg-gray-100 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <Notifications isOpen={true} />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            {isAuthenticated && (
              <div className="relative mr-2">
                <button
                  onClick={toggleMobileNotifications}
                  className="mobile-notifications-trigger relative p-1.5 rounded-full text-gray-700 hover:text-violet-500 transition-colors focus:outline-none"
                  aria-label="Notifications"
                >
                  <Bell className="w-6 h-6" />
                  <div className="absolute -top-1 -right-1">
                    <Notifications inMobileMenu={true} />
                  </div>
                </button>
              </div>
            )}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-violet-500 transition-colors"
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
            ? "bg-white/90 backdrop-blur-md border border-white/20 shadow-lg"
            : "bg-transparent"
        }`}
      >
        <div className="px-3 sm:px-4 pt-2 pb-3 space-y-1">
          {/* Display user profile info at the top of mobile menu if authenticated */}
          {isAuthenticated && (
            <div className="flex items-center gap-3 px-3 py-3 border-b border-gray-100 mb-2 bg-gradient-to-r from-violet-50 to-indigo-50 rounded-lg">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-violet-300 shadow-md bg-white flex items-center justify-center">
                <img 
                  src={getProfileImageSrc()} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                  onError={handleImageError}
                />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">{user?.name || "User"}</h3>
                <p className="text-xs text-gray-500 truncate">{user?.email || ""}</p>
              </div>
            </div>
          )}

          {/* Regular navigation items */}
          {navigationItems.map((item) => (
            <div
              key={item.name}
              onClick={() => handleNavigation(item.href, item.onClick)}
              className={`flex items-center gap-2 text-gray-700 hover:text-violet-500 px-3 py-2.5 rounded-md cursor-pointer transition-colors
                ${
                  location.pathname === item.href
                    ? "bg-violet-500/10 text-violet-600 font-medium"
                    : ""
                }`}
            >
              <motion.div
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-3"
              >
                <span className="p-1.5 bg-violet-50 rounded-full">{item.icon}</span>
                <span>{item.name}</span>
              </motion.div>
            </div>
          ))}

          {/* Add profile dropdown items to mobile navigation when authenticated */}
          {isAuthenticated && (
            <>
              {/* Profile link */}
              <div
                onClick={() => handleNavigation("/profile")}
                className={`flex items-center gap-2 text-gray-700 hover:text-violet-500 px-3 py-2.5 rounded-md cursor-pointer transition-colors
                  ${location.pathname === "/profile" ? "bg-violet-500/10 text-violet-600 font-medium" : ""}`}
              >
                <motion.div
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-3"
                >
                  <span className="p-1.5 bg-violet-50 rounded-full"><User className="w-4 h-4" /></span>
                  <span>Profile</span>
                </motion.div>
              </div>
              
              {/* Chat link */}
              <div
                onClick={() => handleNavigation("/chat")}
                className={`flex items-center gap-2 text-gray-700 hover:text-violet-500 px-3 py-2.5 rounded-md cursor-pointer transition-colors
                  ${location.pathname === "/chat" ? "bg-violet-500/10 text-violet-600 font-medium" : ""}`}
              >
                <motion.div
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-3"
                >
                  <span className="p-1.5 bg-violet-50 rounded-full"><MessageSquare className="w-4 h-4" /></span>
                  <span>Chat</span>
                </motion.div>
              </div>
              
              {/* Notifications link */}
              <div
                onClick={toggleMobileNotifications}
                className={`flex items-center justify-between w-full px-3 py-2.5 rounded-md text-gray-700 hover:text-violet-500 hover:bg-violet-50 cursor-pointer transition-colors ${
                  showMobileNotifications ? "bg-violet-500/10 text-violet-600 font-medium" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="p-1.5 bg-violet-50 rounded-full"><Bell className="w-4 h-4" /></span>
                  <span>Notifications</span>
                </div>
                <div className="relative">
                  <Notifications inMobileMenu={true} />
                </div>
              </div>
              
              {/* Logout link - Fix conflicting hover classes */}
              <div
                onClick={handleLogout}
                className="flex items-center gap-2 text-gray-700 px-3 py-2.5 rounded-md cursor-pointer transition-colors hover:bg-red-50 hover:text-red-500"
              >
                <motion.div
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-3"
                >
                  <span className="p-1.5 bg-red-50 rounded-full"><LogOut className="w-4 h-4" /></span>
                  <span>Logout</span>
                </motion.div>
              </div>
            </>
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
            className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gradient-to-r from-violet-50 to-indigo-50">
              <h3 className="font-semibold text-gray-800">Notifications</h3>
              <button
                onClick={closeMobileNotifications}
                className="p-1.5 rounded-full bg-white text-gray-500 hover:bg-gray-100 transition-colors"
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

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }
        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out forwards;
        }
      `}</style>
    </motion.nav>
  );
};

export default Navbar;
