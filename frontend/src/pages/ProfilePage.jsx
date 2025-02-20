import { ToastContainer, toast } from "react-toastify";
import { useEffect, useState } from "react";
import { useProfileStore } from "../store/ProfileStore";
import LoadingSpinner from "../components/LoadingSpinner";
import {
  Camera,
  Mail,
  Book,
  Lightbulb,
  UserCheck,
  Star,
  Phone,
  MapPin,
  Github,
  Linkedin,
  Edit,
} from "lucide-react";

const ProfilePage = () => {
  const {
    profile,
    isLoading,
    error,
    editMode,
    fetchProfile,
    updateProfile,
    setEditMode,
  } = useProfileStore();

  const [formData, setFormData] = useState({});

  // Fetch profile data on component mount
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Update local form data when profile changes
  useEffect(() => {
    if (profile) {
      setFormData(profile);
    }
  }, [profile]);

  // Handle form field changes
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(formData);
      setEditMode(false); // Exit edit mode
      toast.success("Profile updated successfully!", {
        position: "top-center",
      });
    } catch {
      toast.error("Error updating profile. Please try again.", {
        position: "top-center",
      });
    }
  };

  // Handle profile picture upload
  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setFormData({ ...formData, profilePic: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  // Loading and error states

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="text-center text-red-500">{error}</div>;
  if (!profile) return null;

  return (
    <div className="relative min-h-screen bg-gray-50 flex items-center justify-center px-4 overflow-hidden">
      {/* Overlay Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-yellow-300 opacity-20 blur-3xl rounded-full"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-400 opacity-30 blur-2xl rounded-full"></div>
      </div>

      <div className="p-6 w-full max-w-2xl mt-10">
        <ToastContainer />
        
        <div className="flex flex-col items-center">
          {/* Form or Display Mode */}
          {editMode ? (
            <form onSubmit={handleSubmit} className="w-full space-y-4">
              {/* Role selection at the top */}
              <div>
                <label className="flex items-center gap-2 text-gray-600 font-medium">
                  <UserCheck size={18} className="text-gray-500" /> Role
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border bg-gray-100 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                >
                  <option value="teacher">Teacher</option>
                  <option value="learner">Learner</option>
                  <option value="both">Both</option>
                </select>
              </div>
              {(formData.role === 'teacher' || formData.role === 'both') && (
                <>
                  <div>
                    <label className="flex items-center gap-2 text-gray-600 font-medium">
                      <Camera size={18} className="text-gray-500" /> Upload Certificates
                    </label>
                    <input
                      type="file"
                      name="certificates"
                      onChange={handleProfilePicChange}
                      className="w-full px-4 py-2 border bg-gray-100 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                      multiple
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-gray-600 font-medium">
                      <Camera size={18} className="text-gray-500" /> Upload Experience Certificate
                    </label>
                    <input
                      type="file"
                      name="experienceCertificate"
                      onChange={handleProfilePicChange}
                      className="w-full px-4 py-2 border bg-gray-100 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                    />
                  </div>
                </>
              )}
              {/* Editable fields */}
              <div>
                <label className="flex items-center gap-2 text-gray-600 font-medium">
                  <UserCheck size={18} className="text-gray-500" />
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border bg-gray-100 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none resize-none"
                  rows="3"
                ></textarea>
              </div>
              {/* Skills to Learn */}
              {formData.role === 'learner' && (
                <div>
                  <label className="flex items-center gap-2 text-gray-600 font-medium">
                    <Book size={18} className="text-gray-500" /> Skills to Learn
                  </label>
                  <input
                    type="text"
                    name="skillsToLearn"
                    value={formData.skillsToLearn}
                    onChange={handleInputChange}
                    placeholder="E.g., React, Tailwind CSS"
                    className="w-full px-4 py-2 border bg-gray-100 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  />
                </div>
              )}

              {/* Skills to Teach */}
              {(formData.role === 'teacher' || formData.role === 'both') && (
                <div>
                  <label className="flex items-center gap-2 text-gray-600 font-medium">
                    <Lightbulb size={18} className="text-gray-500" /> Skills to
                    Teach
                  </label>
                  <input
                    type="text"
                    name="skillsToTeach"
                    value={formData.skillsToTeach}
                    onChange={handleInputChange}
                    placeholder="E.g., Node.js, Python"
                    className="w-full px-4 py-2 border bg-gray-100 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  />
                </div>
              )}

              {/* Skill Level */}
              <div>
                <label className="flex items-center gap-2 text-gray-600 font-medium">
                  <Star size={18} className="text-gray-500" /> Skill Level
                </label>
                <select
                  name="skillLevel"
                  value={formData.skillLevel}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border bg-gray-100 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 text-gray-600 font-medium">
                  <Mail size={18} className="text-gray-500" />
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border bg-gray-100 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-gray-600 font-medium">
                  <Phone size={18} className="text-gray-500" />
                  Phone
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border bg-gray-100 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-gray-600 font-medium">
                  <MapPin size={18} className="text-gray-500" /> Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border bg-gray-100 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-gray-600 font-medium">
                  <Github size={18} className="text-gray-500" />
                  GitHub Link
                </label>
                <input
                  type="url"
                  name="github"
                  value={formData.github}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border bg-gray-100 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-gray-600 font-medium">
                  <Linkedin size={18} className="text-gray-500" />
                  LinkedIn Link
                </label>
                <input
                  type="url"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border bg-gray-100 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-200 shadow-md"
              >
                Save Changes
              </button>
            </form>
          ) : (
            <div className="w-full bg-white rounded-2xl shadow-xl overflow-hidden">
              {/* Main Profile Content */}
              <div className="p-6">
                {/* Profile Header */}
                <div className="flex flex-col sm:flex-row gap-6 items-start mb-8">
                  <div className="relative">
                    <img
                      src={formData.profilePic || "/default-profile-pic.jpg"}
                      alt="Profile"
                      className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-gray-100 object-cover shadow-lg"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-800">{formData.name || "User"}</h2>
                        <p className="text-gray-600">{formData.role ? formData.role.charAt(0).toUpperCase() + formData.role.slice(1) : "N/A"}</p>
                        <p className="text-gray-500 flex items-center gap-1 mt-1">
                          <MapPin size={14} className="text-gray-400" />
                          {formData.location || "N/A"}
                        </p>
                      </div>
                      <button
                        onClick={() => setEditMode(true)}
                        className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition duration-200 shadow-md flex items-center gap-2 w-full sm:w-auto justify-center"
                      >
                        <Edit size={16} />
                        Edit Profile
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bio Section */}
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <p className="text-gray-700 leading-relaxed">{formData.bio || "No bio added yet"}</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-indigo-500">{formData.skillLevel || "N/A"}</p>
                    <p className="text-gray-600 text-sm">Skill Level</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-indigo-500">
                      {formData.role === 'teacher' || formData.role === 'both' ? 'Teacher' : 'Learner'}
                    </p>
                    <p className="text-gray-600 text-sm">Role</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-indigo-500">
                      {formData.verificationStatus || "Pending"}
                    </p>
                    <p className="text-gray-600 text-sm">Status</p>
                  </div>
                </div>

                {/* Skills Section */}
                <div className="space-y-6">
                  {formData.role === 'learner' && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <Book size={18} className="text-indigo-500" />
                        Skills to Learn
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {(formData.skillsToLearn || "").split(',').map((skill, index) => (
                          <span key={index} className="bg-white px-3 py-1 rounded-full text-sm text-gray-700 border border-gray-200">
                            {skill.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {(formData.role === 'teacher' || formData.role === 'both') && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <Lightbulb size={18} className="text-indigo-500" />
                        Skills to Teach
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {(formData.skillsToTeach || "").split(',').map((skill, index) => (
                          <span key={index} className="bg-white px-3 py-1 rounded-full text-sm text-gray-700 border border-gray-200">
                            {skill.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Contact Information */}
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <a href={`mailto:${formData.email}`} className="flex items-center gap-2 bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
                    <Mail size={18} className="text-indigo-500 flex-shrink-0" />
                    <span className="text-gray-700 truncate">{formData.email || "N/A"}</span>
                  </a>
                  <a href={`tel:${formData.phone}`} className="flex items-center gap-2 bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
                    <Phone size={18} className="text-indigo-500 flex-shrink-0" />
                    <span className="text-gray-700 truncate">{formData.phone || "N/A"}</span>
                  </a>
                </div>

                {/* Social Links */}
                <div className="mt-6 flex flex-wrap gap-4">
                  {formData.github && (
                    <a
                      href={formData.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-900 transition-colors"
                    >
                      <Github size={18} />
                      GitHub
                    </a>
                  )}
                  {formData.linkedin && (
                    <a
                      href={formData.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
                    >
                      <Linkedin size={18} />
                      LinkedIn
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
