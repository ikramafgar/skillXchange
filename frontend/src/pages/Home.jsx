/* eslint-disable no-unused-vars */
import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom"; // Corrected import for Link
import Footer from "../components/Footer";

function Home() {
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

  return (
    <div>
      {/* Hero Section */}
      <motion.section
        className="bg-gradient-to-r from-gray-100 via-blue-50 to-gray-100 min-h-screen flex items-center px-6 md:px-12 lg:px-24 relative overflow-hidden"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        {/* Abstract Shapes */}
        <motion.div
          className="absolute inset-0 pointer-events-none flex justify-center items-center"
          variants={fadeInVariants}
        >
          <motion.div
            className="absolute w-[500px] h-[500px] bg-yellow-600 opacity-60 blur-3xl rounded-full"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 6, repeat: Infinity }}
          ></motion.div>
          <motion.div
            className="absolute w-[400px] h-[400px] bg-pink-400 opacity-20 blur-2xl rounded-full"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 7, repeat: Infinity }}
          ></motion.div>
        </motion.div>

        <motion.div
          className="flex flex-col-reverse lg:flex-row items-center w-full gap-12 relative z-10"
          variants={staggerContainer}
        >
          {/* Content Section */}
          <motion.div
            className="text-center lg:text-left lg:w-1/2"
            variants={textVariants}
          >
            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-800 leading-tight tracking-tight">
              Unlock New Skills with{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">
                SkillXChange
              </span>
            </h1>
            <p className="mt-6 text-2xl md:text-3xl text-gray-700 mb-6 font-bold leading-relaxed">
              Join a community where skills are shared, learned, and exchanged.
              Grow your expertise and help others succeed.
            </p>
            <div className="mt-8 flex justify-center lg:justify-start gap-6">
              <Link to="/login">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  className="bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-blue-600 transition duration-300"
                >
                  Get Started
                </motion.button>
              </Link>
              <Link to="/about">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition duration-300"
                >
                  Learn More
                </motion.button>
              </Link>
            </div>
          </motion.div>

          {/* Image Section */}
          <motion.div
            className="lg:w-1/2 flex justify-center"
            variants={fadeInVariants}
          >
            <motion.img
              src="images/hero.png"
              alt="SkillXchange Illustration"
              className="w-full max-w-md lg:max-w-full rounded-lg "
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
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
            <div className="w-20 h-20 mb-6 bg-gradient-to-r from-yellow-400 to-red-500 text-white rounded-full flex items-center justify-center text-3xl font-extrabold shadow-lg">
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
            <div className="w-20 h-20 mb-6 bg-gradient-to-r from-yellow-400 to-red-500 text-white rounded-full flex items-center justify-center text-3xl font-extrabold shadow-lg">
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
            <div className="w-20 h-20 mb-6 bg-gradient-to-r from-yellow-400 to-red-500 text-white rounded-full flex items-center justify-center text-3xl font-extrabold shadow-lg">
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
                className="bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-blue-600 transition duration-300"
              >
                Get Started
              </motion.button>
            </Link>
            <Link to="/about">
              <motion.button
                whileHover={{ scale: 1.1 }}
                className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition duration-300"
              >
                Learn More
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

export default Home;
