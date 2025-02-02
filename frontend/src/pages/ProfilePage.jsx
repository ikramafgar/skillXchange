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
        <div className="absolute top-20 left-10 w-96 h-96 bg-yellow-400 opacity-40 blur-3xl rounded-full"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-400 opacity-30 blur-2xl rounded-full"></div>
      </div>

      <div className="p-6 w-full max-w-2xl mt-10">
        <ToastContainer />
        <h1 className="text-2xl font-semibold text-center text-gray-700 mb-6">
          Welcome, {formData.name || "User"}!
        </h1>

        <div className="flex flex-col items-center">
          {/* Profile Picture */}
          <div className="relative mb-6">
            <img
              src={formData.profilePic || "/default-profile-pic.jpg"}
              alt="Profile"
              className="w-32 h-32 rounded-full border-4 border-gray-300 object-cover"
            />
            {editMode && (
              <label className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full cursor-pointer hover:bg-blue-600">
                <input
                  type="file"
                  className="hidden"
                  onChange={handleProfilePicChange}
                />
                <Camera size={18} />
              </label>
            )}
          </div>

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
            <div className="w-full space-y-4">
              {/* Display fields */}
              <div className="flex items-center gap-2">
                <UserCheck size={18} className="text-gray-500" />
                <p className="text-gray-600">{formData.bio || "N/A"}</p>
              </div>

              {formData.role === 'learner' && (
                <div className="flex items-center gap-2">
                  <Book size={18} className="text-gray-500" />
                  <p className="text-gray-600">
                    {formData.skillsToLearn || "N/A"}
                  </p>
                </div>
              )}

              {(formData.role === 'teacher' || formData.role === 'both') && (
                <>
                  <div className="flex items-center gap-2">
                    <Lightbulb size={18} className="text-gray-500" />
                    <p className="text-gray-600">
                      {formData.skillsToTeach || "N/A"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <UserCheck size={18} className="text-gray-500" />
                    <p className="text-gray-600">
                      Verification Status: {formData.verificationStatus || "N/A"}
                    </p>
                  </div>
                </>
              )}

              <div className="flex items-center gap-2">
                <Star size={18} className="text-gray-500" />
                <p className="text-gray-600">{formData.skillLevel || "N/A"}</p>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={18} className="text-gray-500" />
                <p className="text-gray-600">{formData.email || "N/A"}</p>
              </div>

              <div className="flex items-center gap-2">
                <Phone size={18} className="text-gray-500" />
                <p className="text-gray-600">{formData.phone || "N/A"}</p>
              </div>

              <div className="flex items-center gap-2">
                <MapPin size={18} className="text-gray-500" />
                <p className="text-gray-600">{formData.location || "N/A"}</p>
              </div>

              <div className="flex items-center gap-2">
                <Github size={18} className="text-gray-500" />
                <a
                  href={formData.github || "#"}
                  className="text-blue-500 hover:underline"
                >
                  {formData.github || "N/A"}
                </a>
              </div>

              <div className="flex items-center gap-2">
                <Linkedin size={18} className="text-gray-500" />
                <a
                  href={formData.linkedin || "#"}
                  className="text-blue-500 hover:underline"
                >
                  {formData.linkedin || "N/A"}
                </a>
              </div>

              <button
                onClick={() => setEditMode(true)}
                className="w-full bg-indigo-500 text-white py-2 rounded-lg hover:bg-indigo-600 transition duration-200 shadow-md"
              >
                <Edit className="w-4 h-4 mr-2 inline-block" />
                Edit Profile
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
