import { motion } from "framer-motion";

const About = () => {
 
  const sectionVariants = {
    hidden: { opacity: 0, scale: 0.98 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 60,
        damping: 15,
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const elementVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 80,
        damping: 14,
      },
    },
  };

  const imageVariants = {
    hidden: { scale: 1.2, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { duration: 1.5, ease: "easeOut" },
    },
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-white via-gray-50 to-gray-100 text-gray-900 overflow-hidden px-2 sm:px-4 md:px-6 lg:px-12 xl:px-20 py-4 sm:py-6 md:py-8 lg:py-10">
      {/* Background Effects  */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1.5, opacity: 0.15 }}
          transition={{ duration: 2.5, ease: "easeOut" }}
          className="absolute top-0 left-1/4 w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 bg-gradient-to-tr from-purple-300 to-cyan-300 blur-3xl rounded-full"
        />
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1.3, opacity: 0.1 }}
          transition={{ duration: 2.5, ease: "easeOut", delay: 0.3 }}
          className="absolute bottom-0 right-1/4 w-48 h-48 sm:w-64 sm:h-64 md:w-72 md:h-72 lg:w-80 lg:h-80 bg-gradient-to-bl from-pink-300 to-blue-300 blur-3xl rounded-full"
        />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20viewBox=%220%200%20200%20200%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter%20id=%22noiseFilter%22%3E%3CfeTurbulence%20type=%22fractalNoise%22%20baseFrequency=%220.65%22%20numOctaves=%223%22%20stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect%20width=%22100%25%22%20height=%22100%25%22%20filter=%22url(%23noiseFilter)%22%20opacity=%220.03%22/%3E%3C/svg%3E')]" />
      </div>

      {/* Main Section */}
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-6xl mx-auto pt-12 sm:pt-16 md:pt-20 lg:pt-24 pb-8 sm:pb-12 md:pb-16 lg:pb-20 grid grid-cols-1 md:grid-cols-5 gap-6 sm:gap-8 md:gap-10 lg:gap-12"
      >
        {/* Right Column - Image + Card (moved above for small screens) */}
        <div className="md:col-span-2 relative flex justify-center mt-6 sm:mt-8 md:mt-0 order-1 md:order-2">
          <motion.div
            variants={imageVariants}
            className="relative w-full max-w-[250px] xs:max-w-[280px] sm:max-w-[320px] md:max-w-[360px] lg:max-w-[400px] rounded-2xl overflow-hidden shadow-xl ring-1 ring-gray-300/50"
          >
            <motion.img
              src="images/herooooo.png"
              alt="Skill Exchange"
              className="w-full h-48 xs:h-56 sm:h-64 md:h-72 lg:h-80 object-cover"
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.5 }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-blue-400/20 to-transparent" />
          </motion.div>

          <motion.div
            variants={elementVariants}
            className="absolute -bottom-4 sm:-bottom-6 md:-bottom-8 left-0 sm:left-2 md:left-4 lg:left-8 bg-white/90 backdrop-blur-md border border-gray-200/50 rounded-xl p-3 sm:p-4 md:p-5 w-56 sm:w-64 md:w-72 lg:w-80 shadow-lg"
            whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
          >
            <p className="text-gray-700 text-xs sm:text-sm md:text-base font-medium">
              &ldquo;SkillXchange blends cutting-edge tech with human connection, creating a space where skills evolve and communities thrive.&quot;
            </p>
            <p className="text-gray-500 text-xs mt-2 italic">— The Vision</p>
          </motion.div>
        </div>

        {/* Left Column - Text */}
        <div className="md:col-span-3 flex flex-col justify-center space-y-4 sm:space-y-6 md:space-y-8 order-2 md:order-1">
          <motion.h1
            variants={elementVariants}
            className="text-3xl xs:text-4xl sm:text-5xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight"
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600 animate-text-shimmer">
              SkillXChange
            </span>
            <br />
            <span className="text-gray-700">Unleashed</span>
          </motion.h1>
          
          <motion.h2
            variants={elementVariants}
            className="text-xl xs:text-2xl sm:text-3xl md:text-3xl lg:text-4xl font-bold tracking-tight leading-tight text-gray-600"
          >
            Join Our Community
          </motion.h2>

          <motion.p
            variants={elementVariants}
            className="text-sm xs:text-base sm:text-lg md:text-lg lg:text-xl text-gray-600 font-medium leading-relaxed"
          >
            At SkillXchange, we believe that learning is a shared journey. Our platform brings together passionate individuals from diverse backgrounds, creating a vibrant community where knowledge flows freely. Whether you&apos;re a seasoned expert or just starting out, SkillXchange provides the tools and connections to help you grow, collaborate, and achieve your goals.
          </motion.p>
          <motion.div variants={elementVariants}>
            <motion.a
              href="/signup"
              className="inline-block w-full sm:w-auto bg-blue-400 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-base sm:text-lg font-semibold text-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="relative z-10">Join the Future</span>
              <motion.span
                className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 opacity-0 group-hover:opacity-100"
                initial={{ scale: 0 }}
                transition={{ duration: 0.3 }}
              />
            </motion.a>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
};

export default About;
