// eslint-disable-next-line no-unused-vars
import React from 'react';

const About = () => {
  return (
    <div className="relative bg-white min-h-screen text-gray-900 flex items-center justify-center">
      {/* Background abstract shapes */}
      <div className="absolute inset-0 pointer-events-none flex justify-center items-center">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-300 opacity-40 blur-3xl rounded-full"></div>
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-pink-400 opacity-20 blur-2xl rounded-full"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 px-6 py-12 md:px-16 max-w-6xl mx-auto flex flex-col md:flex-row items-center md:items-start">
        {/* Image Section */}
        <div className="flex-shrink-0 w-full md:w-1/2 mb-8 md:mb-0">
          <img
            src="images/about.png"
            alt="Skill Exchange"
            className="w-full h-auto rounded-lg "
          />
        </div>

        {/* Text Section */}
        <div className="w-full md:w-1/2 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-6 text-gray-800">
            About Us
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-6 font-bold">
            We are a platform dedicated to skill exchange, empowering individuals to learn, share, and grow together.
          </p>
          <p className="text-2xl md:text-3xl text-gray-700 mb-6  leading-relaxed">
            At SkillXchange, we believe that everyone has something valuable to share. Whether you&apos;re looking to learn a new skill, teach others, or collaborate, our platform connects individuals with diverse skills, fostering mutual growth and personal development.
          </p>

          {/* Call to Action */}
          <div className="mt-12">
            <p className="text-xl md:text-2xl mb-4 font-bold">
              Ready to join us? Let&apos;s make learning and sharing skills a part of your journey.
            </p>
            <a
              href="/signup"
              className="inline-block bg-yellow-400 text-gray-800 py-3 px-6 rounded-full hover:bg-yellow-500 transition duration-300 font-medium"
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
