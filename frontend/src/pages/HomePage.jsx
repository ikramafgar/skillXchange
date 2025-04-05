import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Footer from "../components/Footer";

function HomePage() {
  const location = useLocation();
  // Check for account deleted query parameter
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    if (queryParams.get('accountDeleted') === 'true') {
      toast.success('Your account has been successfully deleted.', {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
      // Clean up URL after showing notification
      window.history.replaceState({}, document.title, '/');
    }
  }, [location]);

  // Variants for animations
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.8, ease: "easeOut" },
    },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.5 } },
  };

  const staggerContainer = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.2 } },
  };

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
    hover: {
      scale: 1.05,
      y: -10,
      boxShadow:
        "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
      },
    },
    tap: {
      scale: 0.98,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 20,
      },
    },
  };

  return (
    <div className="bg-white">
      <ToastContainer />
      {/* Hero Section */}
      <motion.section
        className="relative min-h-screen flex items-center bg-gradient-to-b from-gray-50 to-white overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[#F8FAFC] [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
          <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter opacity-70"></div>
          <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter opacity-70"></div>
        </div>

        {/* Content Container */}
        <div className="relative container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 py-16 sm:py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className="max-w-xl mx-auto lg:mx-0 text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
              >
                <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-600">
                  <span className="relative flex h-2 w-2 mr-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500"></span>
                  </span>
                  Transform Your Skills Today
                </span>

                <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900">
                  Unlock Your
                  <span className="block mt-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Full Potential
                  </span>
                </h1>

                <p className="mt-6 text-lg sm:text-xl leading-relaxed text-gray-600">
                  Connect with experts, share knowledge, and master new skills in a vibrant community dedicated to mutual growth and success.
                </p>

                <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link to="/register">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                    >
                      Get Started Free
                      <svg className="ml-2 -mr-1 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </motion.button>
                  </Link>
                  <Link to="/about">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border-2 border-gray-200 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
                    >
                      Learn More
                      <svg className="ml-2 -mr-1 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </motion.button>
                  </Link>
                </div>

                {/* Trust Indicators */}
                <div className="mt-12 pt-8 border-t border-gray-100">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">10K+</div>
                      <div className="mt-1 text-sm text-gray-500">Active Users</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">4.9/5</div>
                      <div className="mt-1 text-sm text-gray-500">User Rating</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">50+</div>
                      <div className="mt-1 text-sm text-gray-500">Skills</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Image/Illustration Section */}
            <motion.div
              className="relative lg:block"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              <div className="relative">
                {/* Feature Cards */}
                <div className="space-y-4">
                  {[
                    {
                      icon: "💻",
                      title: "Programming",
                      desc: "Learn coding from experts",
                      color: "bg-blue-50 border-blue-100",
                    },
                    {
                      icon: "🎨",
                      title: "Design",
                      desc: "Master creative skills",
                      color: "bg-purple-50 border-purple-100",
                    },
                    {
                      icon: "🎵",
                      title: "Music",
                      desc: "Learn instruments online",
                      color: "bg-pink-50 border-pink-100",
                    },
                  ].map((card, index) => (
                    <motion.div
                      key={index}
                      className={`relative p-6 rounded-xl border ${card.color} backdrop-blur-sm`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + index * 0.2 }}
                      whileHover={{ y: -5 }}
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-2xl">{card.icon}</span>
                        <div>
                          <h3 className="font-semibold text-gray-900">{card.title}</h3>
                          <p className="text-sm text-gray-600">{card.desc}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Key Features Section */}
      <motion.section
        className="py-24 sm:py-32 lg:py-40 bg-gradient-to-b from-[#F6F8FC] via-white to-[#F8F9FF] relative overflow-hidden"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        {/* Enhanced Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-0 w-96 h-96 bg-purple-200/20 rounded-full filter blur-3xl transform rotate-12 animate-pulse"></div>
          <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-blue-200/20 rounded-full filter blur-3xl transform -rotate-12 animate-pulse"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(248,250,252,0.8)_0%,transparent_100%)]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            className="text-center mb-24"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <motion.span 
              className="inline-block px-4 py-1.5 mb-4 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-600 text-sm font-medium"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              Explore Our Features
            </motion.span>
            <h2 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-blue-600 to-purple-600 mb-6">
              Powerful Features for
              <br />
              Seamless Skill Exchange
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Experience a revolutionary way to learn and teach with our cutting-edge platform features
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              {
                title: "AI-Powered Skill Matching",
                description: "Our intelligent algorithm analyzes your profile to connect you with the perfect learning partners based on skill compatibility and learning goals.",
                icon: "🤝",
                gradient: "from-blue-500 to-indigo-500",
                highlights: ["Smart Matching", "Compatibility Score", "Personalized Suggestions"]
              },
              {
                title: "Interactive Virtual Classrooms",
                description: "Engage in real-time learning sessions with HD video, screen sharing, and collaborative tools for an immersive learning experience.",
                icon: "👨‍🏫",
                gradient: "from-indigo-500 to-purple-500",
                highlights: ["HD Video Calls", "Screen Sharing", "Interactive Whiteboard"]
              },
              {
                title: "Advanced Skill Analytics",
                description: "Track your progress with detailed analytics, skill growth metrics, and personalized learning recommendations.",
                icon: "📊",
                gradient: "from-purple-500 to-pink-500",
                highlights: ["Progress Tracking", "Skill Metrics", "Growth Analysis"]
              },
              {
                title: "Thriving Community Hub",
                description: "Join topic-specific groups, participate in discussions, and build lasting connections with fellow learners.",
                icon: "👥",
                gradient: "from-pink-500 to-rose-500",
                highlights: ["Group Discussions", "Resource Sharing", "Community Events"]
              },
              {
                title: "Smart Scheduling System",
                description: "Automatically find the perfect time slots that work for both parties across different time zones.",
                icon: "⏰",
                gradient: "from-rose-500 to-orange-500",
                highlights: ["timezone", "Calendar Sync", "Smart Reminders"]
              },
              {
                title: "Trust & Verification",
                description: "Our comprehensive review system and skill verification process ensures quality learning experiences.",
                icon: "⭐",
                gradient: "from-orange-500 to-yellow-500",
                highlights: ["Verified Reviews", "Skill Badges", "Trust Score"]
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={cardVariants}
                whileHover="hover"
                whileTap="tap"
                className="group relative bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100"
              >
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-500"
                  style={{
                    backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))`,
                    "--tw-gradient-from": "#3B82F6",
                    "--tw-gradient-to": "#8B5CF6",
                  }}
                ></div>

                {/* Icon Container */}
                <div className={`w-16 h-16 mb-6 rounded-2xl bg-gradient-to-br ${feature.gradient} p-0.5 transform group-hover:scale-110 transition-transform duration-500`}>
                  <div className="w-full h-full bg-white rounded-xl flex items-center justify-center text-3xl">
                    {feature.icon}
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors duration-300">
                  {feature.title}
                </h3>

                <p className="text-gray-600 mb-6 group-hover:text-gray-700 transition-colors duration-300">
                  {feature.description}
                </p>

                {/* Highlights */}
                <div className="space-y-2">
                  {feature.highlights.map((highlight, idx) => (
                    <div key={idx} className="flex items-center text-sm text-gray-500 group-hover:text-gray-600">
                      <span className="mr-2 text-blue-500">✓</span>
                      {highlight}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* How It Works Section */}
      <motion.section
        className="relative bg-gradient-to-br from-[#F8F9FF] via-white to-[#F6F8FC] py-16 sm:py-24 lg:py-32 overflow-hidden"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        {/* Enhanced Background Elements with SVG Patterns */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('/patterns/dots.svg')] opacity-[0] bg-repeat"></div>
          <div className="absolute bottom-0 left-0 right-0 h-64">
            <img src="/patterns/wave.svg" alt="" className="w-full h-full object-cover opacity-50" />
          </div>
          <div className="absolute top-1/4 -left-32 w-64 h-64">
            <img src="/patterns/blob.svg" alt="" className="w-full h-full object-contain opacity-30 animate-float" />
          </div>
          <div className="absolute bottom-1/4 -right-32 w-64 h-64 transform rotate-180">
            <img src="/patterns/blob.svg" alt="" className="w-full h-full object-contain opacity-30 animate-float-delayed" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-transparent to-white/60"></div>
        </div>

        <style>
          {`
            @keyframes float {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-20px); }
            }
            @keyframes float-delayed {
              0%, 100% { transform: translateY(0px) rotate(180deg); }
              50% { transform: translateY(-20px) rotate(180deg); }
            }
            .animate-float {
              animation: float 6s ease-in-out infinite;
            }
            .animate-float-delayed {
              animation: float-delayed 6s ease-in-out infinite;
              animation-delay: 3s;
            }
          `}
        </style>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            className="text-center mb-24"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <motion.span
              className="inline-block px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-600 text-sm font-medium mb-4"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              Your Path to Success
            </motion.span>
            <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-blue-600 to-purple-600 mb-6">
              How SkillXchange Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Follow these simple steps to embark on your learning journey and unlock your full potential
            </p>
          </motion.div>

          {/* Modern Journey Steps */}
          <div className="relative">
            {/* Enhanced Connection Line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 via-purple-200 to-pink-200 hidden lg:block transform translate-x-[-50%]">
              <div className="absolute top-0 left-1/2 w-3 h-3 bg-blue-400 rounded-full transform -translate-x-1/2 animate-bounce"></div>
              <div className="absolute bottom-0 left-1/2 w-3 h-3 bg-pink-400 rounded-full transform -translate-x-1/2 animate-bounce"></div>
            </div>

            {[
              {
                step: "01",
                title: "Create Your Profile",
                description: "Start your journey by creating a personalized profile that showcases your skills and learning aspirations.",
                icon: "🚀",
                color: "from-blue-500 to-indigo-500",
                details: [
                  { icon: "📝", text: "Quick sign-up with email or Google" },
                  { icon: "🎯", text: "Add skills you want to learn and teach" },
                  { icon: "📸", text: "Upload profile photo and set preferences" }
                ],
                image: "/images/steps/create-profile.svg",
                stats: [
                  { value: "2 min", label: "Setup Time" },
                  { value: "100%", label: "Free" }
                ]
              },
              {
                step: "02",
                title: "Discover Perfect Matches",
                description: "Our AI-powered matching system connects you with ideal learning partners based on your goals and preferences.",
                icon: "🔍",
                color: "from-indigo-500 to-purple-500",
                details: [
                  { icon: "🤝", text: "Browse compatible skill partners" },
                  { icon: "⚡", text: "Use advanced filters for better matches" },
                  { icon: "👥", text: "View detailed user profiles and ratings" }
                ],
                image: "/images/steps/discover-matches.svg",
                stats: [
                  { value: "93%", label: "Match Rate" },
                  { value: "24/7", label: "Available" }
                ]
              },
              {
                step: "03",
                title: "Connect & Schedule",
                description: "Easily connect with your matches and schedule convenient learning sessions that fit your schedule.",
                icon: "💬",
                color: "from-purple-500 to-pink-500",
                details: [
                  { icon: "✉️", text: "Send personalized connection requests" },
                  { icon: "💭", text: "Chat and discuss learning goals" },
                  { icon: "📅", text: "Schedule convenient learning sessions" }
                ],
                image: "/images/steps/connect-schedule.svg",
                stats: [
                  { value: "1-Click", label: "Scheduling" },
                  { value: "Global", label: "Coverage" }
                ]
              },
              {
                step: "04",
                title: "Learn & Share Knowledge",
                description: "Engage in interactive learning sessions using our suite of collaborative tools and features.",
                icon: "📚",
                color: "from-pink-500 to-rose-500",
                details: [
                  { icon: "🎓", text: "Engage in interactive learning sessions" },
                  { icon: "🎯", text: "Share your expertise with others" },
                  { icon: "🛠️", text: "Use built-in learning tools" }
                ],
                image: "/images/steps/learn-share.svg",
                stats: [
                  { value: "HD", label: "Video Quality" },
                  { value: "Live", label: "Interaction" }
                ]
              },
              {
                step: "05",
                title: "Grow & Achieve",
                description: "Track your progress, earn recognition, and build lasting connections in our community.",
                icon: "🏆",
                color: "from-rose-500 to-orange-500",
                details: [
                  { icon: "📊", text: "Track your learning progress" },
                  { icon: "🎖️", text: "Earn skill badges and certifications" },
                  { icon: "🌐", text: "Build your professional network" }
                ],
                image: "/images/steps/grow-achieve.svg",
                stats: [
                  { value: "∞", label: "Growth" },
                  { value: "Real", label: "Results" }
                ]
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                className="relative mb-16 last:mb-0" // Reduced margin bottom from mb-20
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
              >
                <div className={`flex flex-col lg:flex-row items-center gap-4 lg:gap-8 ${
                  index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                }`}>
                  {/* Enhanced Content Side */}
                  <div className="lg:w-1/2">
                    <motion.div 
                      className="bg-white rounded-lg p-5 shadow-lg hover:shadow-xl transition-all duration-500"
                      whileHover={{ y: -2 }}
                    >
                      {/* Step Header */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${step.color} p-0.5 transform hover:scale-105 transition-transform duration-500`}>
                          <div className="w-full h-full bg-white rounded-lg flex items-center justify-center text-xl">
                            {step.icon}
                          </div>
                        </div>
                        <div>
                          <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Step {step.step}</span>
                          <h3 className="text-lg font-bold text-gray-900 mt-0.5">{step.title}</h3>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                        {step.description}
                      </p>

                      {/* Enhanced Details */}
                      <ul className="space-y-1.5 mb-3">
                        {step.details.map((detail, idx) => (
                          <motion.li 
                            key={idx} 
                            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-50 transition-colors duration-300"
                            whileHover={{ x: 2 }}
                          >
                            <span className="text-base">{detail.icon}</span>
                            <span className="text-sm text-gray-700">{detail.text}</span>
                          </motion.li>
                        ))}
                      </ul>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-100">
                        {step.stats.map((stat, idx) => (
                          <div key={idx} className="text-center">
                            <div className="text-base font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                              {stat.value}
                            </div>
                            <div className="text-xs text-gray-500">{stat.label}</div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </div>

                  {/* Enhanced Image Side - Updated sizing */}
                  <div className="lg:w-1/2">
                    <motion.div 
                      className="relative rounded-lg overflow-hidden bg-white p-4 shadow-lg group hover:shadow-xl transition-all duration-500"
                      whileHover={{ scale: 1.01 }}
                    >
                      {/* SVG Container with reduced aspect ratio */}
                      <div className="relative w-full aspect-[3/2] bg-gradient-to-br from-gray-50 to-white rounded-lg overflow-hidden">
                        <img
                          src={step.image}
                          alt={step.title}
                          className="w-full h-full object-contain p-2 transform group-hover:scale-102 transition-transform duration-700"
                        />
                        
                        {/* Floating Labels */}
                        <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full text-xs font-medium text-blue-600 opacity-0 group-hover:opacity-100 transform -translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                          {step.title}
                        </div>
                        <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full text-xs font-medium text-purple-600 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                          Step {step.step}/05
                        </div>
                      </div>

                      {/* Decorative Elements - Reduced size */}
                      <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <div className="absolute -top-2 -left-2 w-12 h-12 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </motion.div>
                  </div>
                </div>

                {/* Step Connector - Enhanced */}
                {index < 4 && (
                  <div className="hidden lg:block absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-1/2">
                    <div className="w-px h-8 bg-gradient-to-b from-blue-200 to-transparent"></div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Call to action */}
      <motion.section
        className="relative bg-gradient-to-br from-[#F6F8FC] via-white to-[#F8F9FF] py-16 sm:py-20 px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 text-gray-700"
        whileInView={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 50 }}
        transition={{ duration: 0.7 }}
      >
        {/* Update overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/80 via-blue-50/30 to-white/80"></div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold leading-tight">
            Transform Your Skills Today
          </h2>
          <p className="mt-6 text-lg md:text-xl font-medium text-gray-700 max-w-3xl mx-auto">
            Join the SkillXchange platform and take the first step towards
            learning and growing with a vibrant community of learners and
            professionals.
          </p>
          <div className="mt-8 flex justify-center lg:justify-center gap-6">
            <Link to="/login">
              <motion.button
                whileHover={{ scale: 1.1 }}
                className="bg-blue-400 text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition duration: 300"
              >
                Get Started
              </motion.button>
            </Link>
          </div>
        </div>
      </motion.section>

      {/* Footer Section */}
      <Footer />
    </div>
  );
}

export default HomePage;
