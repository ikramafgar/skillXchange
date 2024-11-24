/* eslint-disable no-unused-vars */
import React from "react";
import Footer from "../components/Footer";

function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-gray-100 via-blue-50 to-gray-100 min-h-screen flex items-center px-6 md:px-12 lg:px-24 relative overflow-hidden">
        {/* Abstract Shapes */}
        <div className="absolute inset-0 pointer-events-none flex justify-center items-center">
          <div className="absolute w-[500px] h-[500px] bg-yellow-600 opacity-60 blur-3xl rounded-full"></div>
          <div className="absolute w-[400px] h-[400px] bg-pink-400 opacity-20 blur-2xl rounded-full"></div>
        </div>

        <div className="flex flex-col-reverse lg:flex-row items-center w-full gap-12 relative z-10">
          {/* Content Section */}
          <div className="text-center lg:text-left lg:w-1/2">
            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-800 leading-tight tracking-tight">
              Unlock New Skills with{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">
                SkillXchange
              </span>
            </h1>
            <p className="mt-6 text-2xl md:text-3xl text-gray-700 mb-6 font-bold leading-relaxed">
              Join a community where skills are shared, learned, and exchanged.
              Grow your expertise and help others succeed.
            </p>
            <div className="mt-8 flex justify-center lg:justify-start gap-6">
              <button className="bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-blue-600 transition duration-300">
                Get Started
              </button>
              <button className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition duration-300">
                Learn More
              </button>
            </div>
          </div>

          {/* Image Section */}
          <div className="lg:w-1/2 flex justify-center">
            <img
              src="images/hero.png"
              alt="SkillXchange Illustration"
              className="w-full max-w-md lg:max-w-full rounded-lg "
            />
          </div>
        </div>
      </section>
      {/* How It Works Section */}
      <section className="relative bg-gradient-to-r from-blue-50 via-white to-blue-50 py-16 px-6 md:px-12 lg:px-24 overflow-hidden">
        {/* Abstract Blobs for Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-30 w-72 h-72 bg-blue-400 opacity-40 blur-3xl rounded-full"></div>
          <div className="absolute bottom-10 right-20 w-64 h-64 bg-pink-400 opacity-20 blur-2xl rounded-full"></div>
        </div>

        <div className="text-center relative z-10 mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-800 tracking-tight">
            How It Works
          </h2>
          <p className="mt-4 text-gray-600 font-bold text-lg md:text-xl">
            Start your journey by following these simple steps.
          </p>
        </div>

        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3 relative z-10">
          {/* Step 1 */}
          <div className=" p-8 rounded-lg shadow-lg outline-dotted outline-2 outline-offset-2 hover:shadow-xl transition-transform transform hover:scale-105 text-center">
            <div className="w-16 h-16 mx-auto mb-6 flex  items-center justify-center bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full text-2xl font-bold">
              1
            </div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">
              Create an Account
            </h3>
            <p className="text-gray-600 leading-relaxed font-semibold">
              Sign up for SkillXchange and build your professional profile to
              showcase your skills and interests.
            </p>
          </div>

          {/* Step 2 */}
          <div className=" p-8 rounded-lg outline-dotted outline-2 outline-offset-2 shadow-lg hover:shadow-xl transition-transform transform hover:scale-105 text-center">
            <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full text-2xl font-bold">
              2
            </div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">
              Find a Match
            </h3>
            <p className="text-gray-600 leading-relaxed font-semibold">
              Search for people who want to learn what you offer or have the
              skills you&apos;re looking for.
            </p>
          </div>

          {/* Step 3 */}
          <div className=" p-8 rounded-lg shadow-lg outline-dotted outline-2 outline-offset-2 hover:shadow-xl transition-transform transform hover:scale-105 text-center">
            <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full text-2xl font-bold">
              3
            </div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">
              Start Learning
            </h3>
            <p className="text-gray-600 leading-relaxed font-semibold">
              Connect, exchange skills, and grow your knowledge while helping
              others succeed.
            </p>
          </div>
        </div>
      </section>

      <section className="relative bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 py-16 px-6 md:px-12 lg:px-24 text-white">
        <div className="relative z-10 max-w-7xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Ready to Elevate Your Skills?
          </h2>
          <p className="mt-4 text-lg md:text-xl text-gray-200">
            Join a thriving community of learners and professionals. Build your
            expertise and share your knowledge with SkillXchange.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <button className="py-3 px-6 text-lg font-semibold bg-white text-blue-600 rounded-lg shadow-lg hover:bg-gray-100 transition-all">
              Get Started
            </button>
            <button className="py-3 px-6 text-lg font-semibold border-2 border-white rounded-lg shadow-lg hover:bg-white hover:text-blue-600 transition-all">
              Learn More
            </button>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}

export default Home;
