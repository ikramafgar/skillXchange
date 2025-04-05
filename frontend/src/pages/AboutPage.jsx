import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const About = () => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.6 } }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    },
    hover: {
      y: -8,
      scale: 1.02,
      transition: { duration: 0.2 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 pt-16 sm:pt-20">
      {/* Hero Section */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative min-h-[85vh] flex items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8"
      >
        {/* Enhanced Background Elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[url('/patterns/about-pattern.svg')] opacity-[0.15]"></div>
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-200/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-purple-200/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-indigo-200/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-transparent to-white/60"></div>
        </div>

        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Enhanced Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="space-y-8 text-center lg:text-left"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="inline-block px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-600 text-sm font-medium"
              >
                <span className="relative flex items-center">
                  <span className="relative flex h-2 w-2 mr-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500"></span>
                  </span>
                  About SkillXchange
                </span>
              </motion.div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900">
                Where Skills Meet{" "}
                <span className="relative">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                    Opportunity
                  </span>
                  <motion.span
                    className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-blue-600/50 to-purple-600/50 rounded-full"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                  ></motion.span>
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Join our vibrant community where passionate individuals connect, share knowledge, and grow together in a supportive environment designed for mutual success.
              </p>

              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <Link to="/signup">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Start Your Journey
                    <motion.span 
                      className="ml-2 inline-block"
                      animate={{ x: [0, 4, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                      →
                    </motion.span>
                  </motion.button>
                </Link>
              </div>
            </motion.div>

            {/* Enhanced Image Section - Without Cards */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="relative w-full"
            >
              <motion.div 
                className="relative rounded-2xl overflow-hidden shadow-2xl mx-auto max-w-xl lg:max-w-none"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <img
                  src="/images/herooooo.png"
                  alt="SkillXchange Community"
                  className="w-full h-[300px] sm:h-[400px] lg:h-[450px] object-cover rounded-2xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-600/40 via-transparent to-transparent"></div>
                
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-gradient-to-br from-purple-400/20 to-transparent rounded-full blur-2xl"></div>
                <div className="absolute bottom-0 left-0 w-24 sm:w-32 h-24 sm:h-32 bg-gradient-to-tr from-blue-400/20 to-transparent rounded-full blur-2xl"></div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Enhanced Features Grid */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="py-32 px-4 sm:px-6 lg:px-8 relative"
      >
        {/* Enhanced Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-[0.08]"></div>
          <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-blue-50/50 to-transparent"></div>
          <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-purple-50/50 to-transparent"></div>
        </div>

        <div className="container mx-auto max-w-7xl relative">
          <div className="text-center mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="inline-block px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-600 text-sm font-medium mb-4"
            >
              Our Features
            </motion.div>
            <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-blue-600 to-purple-600 mb-6">
              Why Choose SkillXchange?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed">
              Experience a platform designed to make skill sharing seamless, rewarding, and transformative
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                whileHover="hover"
                viewport={{ once: true }}
                custom={index}
                className="group relative p-4 sm:p-6 lg:p-8 rounded-2xl bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100/50 overflow-hidden"
              >
                {/* Decorative Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white opacity-80"></div>
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>
                
                {/* Content */}
                <div className="relative">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 mb-4 sm:mb-6 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 p-0.5 transform group-hover:scale-110 transition-transform duration-300">
                    <div className="w-full h-full rounded-xl bg-white flex items-center justify-center text-xl sm:text-2xl">
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-gray-900">{feature.title}</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed group-hover:text-gray-700">{feature.description}</p>
                </div>

                {/* Hover Effect */}
                <div className="absolute -bottom-1 -left-1 -right-1 h-1 bg-gradient-to-r from-blue-600 to-purple-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Enhanced CTA Section */}
      <motion.section
        className="relative py-24 px-4 sm:px-6 lg:px-8"
        whileInView={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 50 }}
        transition={{ duration: 0.7 }}
      >
        {/* Enhanced Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 via-white to-gray-50/50"></div>
          <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-[0.08]"></div>
          <div className="absolute top-0 left-0 w-32 h-32 bg-blue-200/30 rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-200/30 rounded-full mix-blend-multiply filter blur-3xl"></div>
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-block px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-600 text-sm font-medium mb-4"
          >
            Ready to Start?
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-blue-600 to-purple-600 mb-6"
          >
            Transform Your Skills Today
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-8"
          >
            Join the SkillXchange platform and take the first step towards
            learning and growing with a vibrant community of learners and
            professionals.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex justify-center gap-4"
          >
            <Link to="/register">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Get Started Free
                <motion.span 
                  className="ml-2 inline-block"
                  animate={{ x: [0, 4, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  →
                </motion.span>
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
};

const features = [
  {
    icon: "🎯",
    title: "Smart Matching",
    description: "Our AI-powered system connects you with the perfect learning partners based on skill compatibility and learning goals."
  },
  {
    icon: "🔄",
    title: "Skill Exchange",
    description: "Trade your expertise for skills you want to learn in a fair and balanced way through our innovative platform."
  },
  {
    icon: "📈",
    title: "Track Progress",
    description: "Monitor your learning journey with detailed analytics and insights to maximize your skill development."
  },
  {
    icon: "🤝",
    title: "Community",
    description: "Join a supportive network of lifelong learners who are passionate about sharing knowledge and growing together."
  },
  {
    icon: "🔒",
    title: "Secure Platform",
    description: "Your data and interactions are protected with enterprise-grade security measures and encryption."
  },
  {
    icon: "⭐",
    title: "Quality Assurance",
    description: "Our verified reviews and ratings system ensures high-quality learning experiences for everyone."
  }
];

export default About;
