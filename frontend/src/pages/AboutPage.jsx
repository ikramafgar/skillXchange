const About = () => {
  return (
    <div className="relative bg-gradient-to-br from-white via-gray-50 to-gray-100 min-h-screen text-gray-900 flex items-center justify-center">
      {/* Background abstract shapes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-400 opacity-30 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-pink-400 opacity-25 blur-[100px] rounded-full"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 px-6 py-16 md:px-20 max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 mt-20">
        {/* Image Section */}
        <div className="w-full md:w-1/2 flex justify-center">
          <img
            src="images/about.png"
            alt="Skill Exchange"
            className="w-full h-auto max-w-lg rounded-lg shadow-lg transform hover:scale-105 transition duration-300"
          />
        </div>

        {/* Text Section */}
        <div className="w-full md:w-1/2 text-center md:text-left space-y-6">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-700 tracking-tight leading-tight">
            About Us
          </h1>
          <p className="mt-4 text-gray-700 font-semibold text-lg md:text-xl max-w-2xl mx-auto">
            We are a platform dedicated to skill exchange, empowering individuals to learn, share, and grow together.
          </p>
          <p className="text-gray-700 leading-relaxed font-medium mb-6">
            At SkillXchange, we believe that everyone has something valuable to share. Whether you&apos;re looking to learn a new skill, teach others, or collaborate, our platform connects individuals with diverse skills, fostering mutual growth and personal development.
          </p>

          {/* Call to Action */}
          <div className="mt-8">
            <p className="text-gray-700 leading-relaxed font-medium mb-6">
              Ready to join us? Let&apos;s make learning and sharing skills a part of your journey.
            </p>
            <a
              href="/signup"
              className="bg-blue-400 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-blue-600 transition duration-300"
            >
              Join Now
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
