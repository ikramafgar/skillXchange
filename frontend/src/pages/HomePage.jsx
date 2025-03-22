import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Footer from "../components/Footer";
import {
  FaDatabase,
  FaJs,
  FaJava,
  FaPython,
  FaReact,
  FaMusic,
  FaCamera,
  FaPen,
  FaLanguage,
  FaComments,
  FaCode,
  FaHtml5,
  FaCss3,
  FaNodeJs,
  FaGitAlt,
  FaDocker,
  FaAws,
  FaChartLine,
  FaMobileAlt,
  FaPaintBrush,
  FaVideo,
  FaBusinessTime,
  FaCalculator,
  FaCloud,
  FaGamepad,
  FaGlobe,
  FaLightbulb,
  FaRocket,
  FaServer,
  FaShieldAlt,
  FaTools,
  FaUserTie,
} from "react-icons/fa";

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

  const textVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { delay: 0.2, duration: 0.8, ease: "easeOut" },
    },
  };

  const fadeInVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { delay: 0.5, duration: 1 },
    },
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

  const skillIcons = [
    { icon: <FaDatabase />, label: "Data Science", color: "text-blue-500" },
    { icon: <FaJs />, label: "JavaScript", color: "text-yellow-500" },
    { icon: <FaJava />, label: "Java", color: "text-red-500" },
    { icon: <FaPython />, label: "Python", color: "text-green-500" },
    { icon: <FaReact />, label: "React", color: "text-cyan-500" },
    { icon: <FaMusic />, label: "Music", color: "text-purple-500" },
    { icon: <FaCamera />, label: "Photography", color: "text-pink-500" },
    { icon: <FaPen />, label: "Writing", color: "text-orange-500" },
    { icon: <FaLanguage />, label: "Languages", color: "text-indigo-500" },
    { icon: <FaComments />, label: "Communication", color: "text-teal-500" },
    { icon: <FaCode />, label: "Programming", color: "text-blue-400" },
    { icon: <FaHtml5 />, label: "HTML", color: "text-orange-500" },
    { icon: <FaCss3 />, label: "CSS", color: "text-blue-600" },
    { icon: <FaNodeJs />, label: "Node.js", color: "text-green-600" },
    { icon: <FaGitAlt />, label: "Git", color: "text-red-600" },
    { icon: <FaDocker />, label: "Docker", color: "text-blue-300" },
    { icon: <FaAws />, label: "AWS", color: "text-yellow-600" },
    { icon: <FaChartLine />, label: "Data Analysis", color: "text-green-400" },
    { icon: <FaMobileAlt />, label: "Mobile Dev", color: "text-purple-400" },
    { icon: <FaPaintBrush />, label: "Design", color: "text-pink-400" },
    { icon: <FaVideo />, label: "Video Editing", color: "text-red-400" },
    { icon: <FaBusinessTime />, label: "Business", color: "text-indigo-400" },
    { icon: <FaCalculator />, label: "Finance", color: "text-green-500" },
    { icon: <FaCloud />, label: "Cloud Computing", color: "text-blue-200" },
    { icon: <FaGamepad />, label: "Game Dev", color: "text-purple-500" },
    { icon: <FaGlobe />, label: "Web Development", color: "text-blue-500" },
    { icon: <FaLightbulb />, label: "Innovation", color: "text-yellow-400" },
    { icon: <FaRocket />, label: "Startups", color: "text-red-500" },
    { icon: <FaServer />, label: "DevOps", color: "text-gray-500" },
    { icon: <FaShieldAlt />, label: "Cybersecurity", color: "text-green-600" },
    { icon: <FaTools />, label: "Tools", color: "text-gray-600" },
    { icon: <FaUserTie />, label: "Leadership", color: "text-indigo-500" },
  ];

  const marqueeVariants = {
    animate: {
      x: [0, -4000],
      transition: {
        x: {
          repeat: Infinity,
          repeatType: "loop",
          duration: 80,
          ease: "linear",
        },
      },
    },
  };

  return (
    <div className="bg-white">
      <ToastContainer />
      {/* Hero Section */}
      <motion.section
        className="bg-[#FAFAFA] min-h-screen flex items-start justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden pt-24"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        {/* Background Image */}
        {/* <motion.div
          className="absolute inset-0 w-full h-full"
          variants={fadeInVariants}
        >
          <motion.img
            src="images/Hero.png"
            alt="SkillXchange Illustration"
            className="w-full h-full object-cover opacity-25 mix-blend-multiply"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </motion.div> */}
        {/* Abstract Shapes */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          variants={fadeInVariants}
        >
          {/* Circle 1 - Left Side */}
          <motion.div
            className="absolute w-[300px] h-[300px] bg-purple-400 opacity-40 blur-3xl rounded-full -left-20 top-1/3"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 6, repeat: Infinity }}
          ></motion.div>

          {/* Circle 2 - Center */}
          <motion.div
            className="absolute w-[400px] h-[400px] bg-indigo-300 opacity-30 blur-3xl rounded-full"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 7, repeat: Infinity }}
          ></motion.div>

          {/* Circle 3 - Right Side */}
          <motion.div
            className="absolute w-[250px] h-[250px] bg-violet-400 opacity-40 blur-3xl rounded-full -right-20 bottom-1/4"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 8, repeat: Infinity }}
          ></motion.div>
        </motion.div>

        {/* Content Section */}
        <motion.div
          className="relative z-10 text-center max-w-4xl mx-auto w-full px-4 sm:px-6"
          variants={textVariants}
        >
          {/* Tagline */}
          <div className="bg-white bg-opacity-20 backdrop-blur-lg border border-blue-500/40 text-gray-700 font-semibold py-2 px-6 rounded-full mb-6 inline-block text-sm md:text-base shadow-2xl hover:shadow-xl transition-shadow duration-300">
            🚀 Your #1 Platform for Skills Sharing
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 leading-tight tracking-tight text-center">
            Unlock New Skills with{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600 animate-text-shimmer">
              SkillXChange.
            </span>
          </h1>

          {/* Subheading */}
          <p className="mt-6 text-lg sm:text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed font-semibold tracking-tight">
            Join our vibrant community where skills are currency. Learn, teach,
            and grow together in a space designed for mutual success.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
            <Link to="/login" className="flex-1 sm:flex-none">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto bg-blue-400 text-white px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-lg font-semibold"
              >
                Get Started
              </motion.button>
            </Link>
            <Link to="/about" className="flex-1 sm:flex-none">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto bg-white/90 backdrop-blur-sm text-gray-700 px-8 py-4 rounded-xl border-2 border-gray-200 hover:border-blue-200 shadow-sm hover:shadow-md transition-all duration-300 text-lg font-semibold"
              >
                Learn More
              </motion.button>
            </Link>
          </div>

          {/* Skill Icons Marquee */}
          <motion.div className="mt-6  overflow-hidden relative w-full before:absolute before:left-0 before:top-0 before:h-full before:w-8 sm:before:w-16  before:z-20 after:absolute after:right-0 after:top-0 after:h-full after:w-8 sm:after:w-16  after:z-20">
            <motion.div
              className="inline-flex space-x-8 sm:space-x-12 py-3"
              variants={marqueeVariants}
              animate="animate"
            >
              {[...skillIcons, ...skillIcons].map((skill, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center shrink-0"
                >
                  <div
                    className={`text-3xl  ${skill.color} hover:scale-110 transition-transform duration-300`}
                  >
                    {skill.icon}
                  </div>
                  <p className="mt-2 text-sm sm:text-base md:text-lg text-gray-600 font-medium">
                    {skill.label}
                  </p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Key Features Section */}
      <motion.section
        className="py-24 bg-gradient-to-b from-[#F6F8FC] to-white relative overflow-hidden"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        {/* Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-72 h-72 bg-purple-200/30 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-200/30 rounded-full filter blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div className="text-center mb-20" variants={textVariants}>
            <span className="inline-block px-4 py-1.5 mb-4 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-600 text-sm font-medium">
              Explore Our Features
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-gray-800 bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
              Key Features
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover what makes SkillXchange the perfect platform for your
              learning journey
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={staggerContainer}
          >
            {[
              {
                title: "Skill Matching",
                description:
                  "Advanced algorithm to connect you with perfect learning partners",
                icon: "🤝",
                gradient: "from-blue-500 to-indigo-500",
              },
              {
                title: "Virtual Classrooms",
                description:
                  "Interactive online spaces for seamless knowledge sharing",
                icon: "👨‍🏫",
                gradient: "from-indigo-500 to-purple-500",
              },
              {
                title: "Skill Tracking",
                description:
                  "Monitor your progress and growth with detailed analytics",
                icon: "📊",
                gradient: "from-purple-500 to-pink-500",
              },
              {
                title: "Community Support",
                description:
                  "Connect with like-minded learners in our vibrant community",
                icon: "👥",
                gradient: "from-pink-500 to-rose-500",
              },
              {
                title: "Flexible Schedule",
                description:
                  "Learn at your own pace with customizable time slots",
                icon: "⏰",
                gradient: "from-rose-500 to-orange-500",
              },
              {
                title: "Verified Reviews",
                description:
                  "Transparent feedback system for quality assurance",
                icon: "⭐",
                gradient: "from-orange-500 to-yellow-500",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                whileHover="hover"
                whileTap="tap"
                viewport={{ once: true }}
                className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100"
              >
                {/* Gradient Background on Hover */}
                <div
                  className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-5 transition-opacity duration-300"
                  style={{
                    backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))`,
                    "--tw-gradient-from": "#3B82F6",
                    "--tw-gradient-to": "#8B5CF6",
                  }}
                ></div>

                {/* Content */}
                <div className="relative z-10">
                  <div
                    className={`w-16 h-16 mb-6 rounded-xl bg-gradient-to-r ${feature.gradient} p-0.5`}
                  >
                    <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                      <span className="text-3xl transform group-hover:scale-110 transition-transform duration-300">
                        {feature.icon}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">
                    {feature.title}
                  </h3>

                  <p className="text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* How It Works Section */}
      <motion.section
        className="relative bg-gradient-to-br from-[#F8F9FF] to-white py-32 px-6 md:px-12 lg:px-24 overflow-hidden"
        variants={containerVariants}
        animate="visible"
        exit="exit"
      >
        <motion.div
          className="text-center relative z-10 mb-24"
          variants={textVariants}
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-600 text-sm font-medium mb-4">
            How It Works
          </span>
          <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 mb-4">
            Swap Skills, Grow Together!
          </h2>
          <p className="text-lg text-gray-600">
            Follow these simple steps to get started
          </p>
        </motion.div>

        {/* Journey Steps Container */}
        <div className="max-w-7xl mx-auto relative">
          {/* Steps */}
          <motion.div
            className="space-y-16 relative z-10"
            variants={staggerContainer}
          >
            {[
              {
                step: "01",
                title: "Sign Up & Create a Profile",
                icon: "🚀",
                color: "from-indigo-500 to-violet-500",
                details: [
                  "Register with your email or Google account",
                  "Set up your profile with skills you offer and skills you want to learn",
                  "Add a profile picture and location for better connections",
                ],
              },
              {
                step: "02",
                title: "Explore & Find Matches",
                icon: "🔍",
                color: "from-violet-500 to-purple-500",
                details: [
                  "Browse through other users' profiles based on skills",
                  "Use smart filters to find the perfect match",
                  "View user ratings, reviews, and compatibility scores",
                ],
              },
              {
                step: "03",
                title: "Connect & Chat",
                icon: "💬",
                color: "from-purple-500 to-fuchsia-500",
                details: [
                  "Send a connection request to users you want to swap skills with",
                  "Use the built-in chat feature to discuss learning preferences and schedules",
                  "Schedule sessions online or in person",
                ],
              },
              {
                step: "04",
                title: "Start Learning & Teaching",
                icon: "📚",
                color: "from-fuchsia-500 to-pink-500",
                details: [
                  "Engage in skill-swapping sessions with your matched partners",
                  "Exchange knowledge in a fun, interactive way",
                  "Track your progress and get feedback",
                ],
              },
              {
                step: "05",
                title: "Earn Badges & Grow Your Network",
                icon: "🏆",
                color: "from-pink-500 to-rose-500",
                details: [
                  "Complete sessions to earn credibility and badges",
                  "Get positive reviews and level up your profile",
                  "Keep expanding your skills and connections",
                ],
              },
            ].map((step, index) => (
              <motion.div
                key={index}
                className="relative"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <div
                  className={`bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 lg:w-[60%] ${
                    index % 2 === 0 ? "lg:ml-0" : "lg:ml-[40%]"
                  }`}
                >
                  {/* Step Number & Icon */}
                  <div className="flex items-center gap-4 mb-6">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-r ${step.color} flex items-center justify-center text-2xl shadow-lg`}
                    >
                      {step.icon}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-500">
                        Step {step.step}
                      </span>
                      <h3 className="text-xl font-bold text-gray-900">
                        {step.title}
                      </h3>
                    </div>
                  </div>

                  {/* Details */}
                  <ul className="space-y-3">
                    {step.details.map((detail, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-indigo-500 mt-1">🔹</span>
                        <span className="text-gray-600">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Call to action */}
      <motion.section
        className="relative bg-gradient-to-br from-[#F6F8FC] via-white to-[#F8F9FF] py-20 px-8 md:px-16 lg:px-24 text-gray-700"
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
                className="bg-blue-400 text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition duration-300"
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
