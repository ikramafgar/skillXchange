import { useState } from "react";
import { Camera, Mail, Phone, MapPin, Github, Linkedin, Edit } from "lucide-react";

const ProfilePage = () => {
  const [userData, setUserData] = useState({
    name: "",
    bio: "",
    skillsToLearn: "",
    skillsToTeach: "",
    skillLevel: "Beginner",
    email: "johndoe@example.com",
    phone: "",
    location: "",
    github: "",
    linkedin: "",
    profilePic: "https://via.placeholder.com/150",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setUserData({ ...userData, profilePic: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-50 flex items-center justify-center px-4  overflow-hidden ">
       {/* Overlay Effects */}
       <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-yellow-400 opacity-40 blur-3xl rounded-full"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-400 opacity-30 blur-2xl rounded-full"></div>
      </div>
      <div className=" p-6 w-full max-w-2xl mt-10">
        <h1 className="text-2xl font-semibold text-center text-gray-700 mb-6">
          Welcome, {userData.name}!
        </h1>
        <div className="flex flex-col items-center">
          {/* Profile Picture */}
          <div className="relative mb-6">
            <img
              src={userData.profilePic}
              alt="Profile"
              className="w-32 h-32 rounded-full border-4 border-gray-300 object-cover"
            />
            <label className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full cursor-pointer hover:bg-blue-600">
              <input
                type="file"
                className="hidden"
                onChange={handleProfilePicChange}
              />
              <Camera size={18} />
            </label>
          </div>

          {/* Form */}
          <form className="w-full space-y-4">
            {/* Bio */}
            <div className="flex items-center gap-2">
              <Edit size={18} className="text-gray-500" />
              <label className="text-gray-600 font-medium">Bio</label>
            </div>
            <textarea
              name="bio"
              value={userData.bio}
              onChange={handleInputChange}
              placeholder="Write a brief introduction about yourself..."
              className="w-full px-4 py-2 border bg-gray-100 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none resize-none"
              rows="3"
            ></textarea>

            {/* Skills to Learn */}
            <div>
              <label className="flex items-center gap-2 text-gray-600 font-medium">
                <Edit size={18} className="text-gray-500" /> Skills to Learn
              </label>
              <input
                type="text"
                name="skillsToLearn"
                value={userData.skillsToLearn}
                onChange={handleInputChange}
                placeholder="E.g., React, Tailwind CSS"
                className="w-full px-4 py-2 border bg-gray-100 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />
            </div>

            {/* Skills to Teach */}
            <div>
              <label className="flex items-center gap-2 text-gray-600 font-medium">
                <Edit size={18} className="text-gray-500" /> Skills to Teach
              </label>
              <input
                type="text"
                name="skillsToTeach"
                value={userData.skillsToTeach}
                onChange={handleInputChange}
                placeholder="E.g., Node.js, Python"
                className="w-full px-4 py-2 border bg-gray-100 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />
            </div>

            {/* Skill Level */}
            <div>
              <label className="flex items-center gap-2 text-gray-600 font-medium">
                <Edit size={18} className="text-gray-500" /> Skill Level
              </label>
              <select
                name="skillLevel"
                value={userData.skillLevel}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border bg-gray-100 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            {/* Contact Information */}
            <div>
              <label className="flex items-center gap-2 text-gray-600 font-medium">
                <Mail size={18} className="text-gray-500" /> Email
              </label>
              <input
                type="email"
                name="email"
                value={userData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border bg-gray-100 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-gray-600 font-medium">
                <Phone size={18} className="text-gray-500" /> Phone
              </label>
              <input
                type="text"
                name="phone"
                value={userData.phone}
                onChange={handleInputChange}
                placeholder="E.g., +1234567890"
                className="w-full px-4 py-2 border bg-gray-100 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />
            </div>

            {/* Location */}
            <div>
              <label className="flex items-center gap-2 text-gray-600 font-medium">
                <MapPin size={18} className="text-gray-500" /> Location
              </label>
              <input
                type="text"
                name="location"
                value={userData.location}
                onChange={handleInputChange}
                placeholder="E.g., New York, USA"
                className="w-full px-4 py-2 border bg-gray-100 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />
            </div>

            {/* Social Links */}
            <div>
              <label className="flex items-center gap-2 text-gray-600 font-medium">
                <Github size={18} className="text-gray-500" /> GitHub
              </label>
              <input
                type="text"
                name="github"
                value={userData.github}
                onChange={handleInputChange}
                placeholder="GitHub Profile URL"
                className="w-full px-4 py-2 border bg-gray-100 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-gray-600 font-medium">
                <Linkedin size={18} className="text-gray-500" /> LinkedIn
              </label>
              <input
                type="text"
                name="linkedin"
                value={userData.linkedin}
                onChange={handleInputChange}
                placeholder="LinkedIn Profile URL"
                className="w-full px-4 py-2 border bg-gray-100 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />
            </div>

            {/* Save Button */}
            <button
              type="button"
              className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-200 shadow-md"
            >
              Save Changes
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
