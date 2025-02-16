import { motion } from "framer-motion";
import { Link } from "react-router-dom";
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

  const staggerItem = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
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
    <div>
      {/* Hero Section */}
      <motion.section
        className="bg-gradient-to-r from-gray-50 via-blue-50 to-gray-50 min-h-screen flex items-start justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden pt-24 "
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
            className="absolute w-[300px] h-[300px] bg-blue-400 opacity-60 blur-3xl rounded-full -left-20 top-1/3"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 6, repeat: Infinity }}
          ></motion.div>

          {/* Circle 2 - Center */}
          <motion.div
            className="absolute w-[400px] h-[400px] bg-blue-200 opacity-30 blur-3xl rounded-full"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 7, repeat: Infinity }}
          ></motion.div>

          {/* Circle 3 - Right Side */}
          <motion.div
            className="absolute w-[250px] h-[250px] bg-blue-500 opacity-50 blur-3xl rounded-full -right-20 bottom-1/4"
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

      {/* How It Works Section */}
      <motion.section
        className="relative bg-gradient-to-r from-gray-100 via-blue-50 to-gray-100 py-16 px-6 md:px-12 lg:px-24 overflow-hidden"
        variants={containerVariants}
        animate="visible"
        exit="exit"
        whileInView={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 50 }}
        transition={{ duration: 0.7 }}
      >
        <motion.div
          className="text-center relative z-10 mb-16"
          variants={textVariants}
        >
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-700 tracking-tight leading-tight">
            How It Works
          </h2>
          <p className="mt-4 text-gray-700 font-semibold text-lg md:text-xl max-w-2xl mx-auto">
            Embark on your journey with us. Follow these easy steps to begin
            your experience.
          </p>
        </motion.div>

        <motion.div
          className="grid gap-12 md:grid-cols-2 lg:grid-cols-3 relative z-10"
          variants={staggerContainer}
        >
          {/* Step 1 */}
          <motion.div
            className="relative flex flex-col items-center text-center transform transition-all duration-500  rounded-lg py-5 hover:scale-105 hover:shadow-2xl hover:rotate-2"
            variants={staggerItem}
          >
            <div className="w-20 h-20 mb-6 bg-gradient-to-r from-blue-400 to-blue-500 text-white rounded-full flex items-center justify-center text-3xl font-extrabold shadow-lg">
              1
            </div>
            <h3 className="text-2xl font-semibold text-gray-700 mb-4">
              Sign Up & Join
            </h3>
            <p className="text-gray-700 leading-relaxed font-medium mb-6">
              Sign up, create your profile, and become part of the SkillXchange
              community!
            </p>
          </motion.div>

          {/* Step 2 */}
          <motion.div
            className="relative flex flex-col items-center text-center transform transition-all duration-500 hover:scale-105 rounded-lg py-5 hover:shadow-2xl hover:rotate-2"
            variants={staggerItem}
          >
            <div className="w-20 h-20 mb-6 bg-gradient-to-r from-blue-400 to-blue-500 text-white rounded-full flex items-center justify-center text-3xl font-extrabold shadow-lg">
              2
            </div>
            <h3 className="text-2xl font-semibold text-gray-700 mb-4">
              Browse & Choose
            </h3>
            <p className="text-gray-700 leading-relaxed font-medium mb-6">
              Explore and select the skills you want to learn or offer. Match
              with like-minded people.
            </p>
          </motion.div>

          {/* Step 3 */}
          <motion.div
            className="relative flex flex-col items-center text-center transform transition-all duration-500 hover:scale-105 rounded-lg py-5 hover:shadow-2xl hover:rotate-2"
            variants={staggerItem}
          >
            <div className="w-20 h-20 mb-6 bg-gradient-to-r from-blue-400 to-blue-500 text-white rounded-full flex items-center justify-center text-3xl font-extrabold shadow-lg">
              3
            </div>
            <h3 className="text-2xl font-semibold text-gray-700 mb-4">
              Exchange & Grow
            </h3>
            <p className="text-gray-700 leading-relaxed font-medium mb-6">
              Exchange skills, grow your knowledge, and build connections that
              last.
            </p>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Call to action */}
      <motion.section
        className="relative bg-cover bg-center py-20 px-8 md:px-16 lg:px-24 text-gray-700"
        whileInView={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 50 }}
        transition={{ duration: 0.7 }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-100 via-blue-50 to-gray-200"></div>

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
                className="bg-blue-400 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-blue-600 transition duration-300"
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
