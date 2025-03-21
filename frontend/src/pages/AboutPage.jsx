import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const About = () => {

  return (
    <div className="min-h-screen bg-gray-50 pt-16 sm:pt-20">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative min-h-[85vh] flex items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8 bg-gray-50"
      >
        {/* Background Elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-gray-200/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-gray-300/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-blue-100/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>

        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6 text-center lg:text-left"
            >
              <div className="inline-block px-4 py-1.5 rounded-full bg-gradient-to-r  from-blue-500/10 to-purple-500/10 text-blue-600 text-sm font-medium">
                About SkillXchange
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900">
                Where Skills Meet 
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-blue-600 ml-2">
                  Opportunity
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto lg:mx-0">
                Join our vibrant community where passionate individuals connect, share knowledge, and grow together in a supportive environment.
              </p>
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <Link to="/signup">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-3 bg-blue-400 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Get Started
                  </motion.button>
                </Link>
              </div>
            </motion.div>

            {/* Image/Stats Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="/images/herooooo.png"
                  alt="SkillXchange Community"
                  className="w-full object-cover rounded-2xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-400/40 to-transparent"></div>
              </div>
              
              {/* Stats Cards */}
              <div className="absolute -bottom-6 left-4 right-4 grid grid-cols-3 gap-4">
                {[
                  { label: "Active Users", value: "10K+" },
                  { label: "Skills Shared", value: "5K+" },
                  { label: "Success Rate", value: "95%" }
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + (index * 0.1) }}
                    className="bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-lg"
                  >
                    <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Features Grid */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="py-20 px-4 sm:px-6 lg:px-8 relative bg-gray-50"
      >
        <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-5"></div>
        <div className="container mx-auto max-w-7xl relative">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Why Choose SkillXchange?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Experience a platform designed to make skill sharing seamless and rewarding
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                whileHover={{ 
                  y: -8,
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  transition: { duration: 0.2 }
                }}
                className="p-8 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-white/80 to-white/40 border border-white/20"
              >
                <div className="w-14 h-14 mb-6 rounded-xl bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-2xl text-white shadow-lg">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
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
                className="bg-gradient-to-r from-indigo-500 to-violet-500 text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition duration-300"
              >
                Get Started
              </motion.button>
            </Link>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

const features = [
  {
    icon: "🎯",
    title: "Smart Matching",
    description: "Our AI-powered system connects you with the perfect learning partners"
  },
  {
    icon: "🔄",
    title: "Skill Exchange",
    description: "Trade your expertise for skills you want to learn"
  },
  {
    icon: "📈",
    title: "Track Progress",
    description: "Monitor your learning journey with detailed analytics"
  },
  {
    icon: "🤝",
    title: "Community",
    description: "Join a supportive network of lifelong learners"
  },
  {
    icon: "🔒",
    title: "Secure Platform",
    description: "Your data and interactions are protected"
  },
  {
    icon: "⭐",
    title: "Quality Assurance",
    description: "Verified reviews and ratings system"
  }
];

export default About;
