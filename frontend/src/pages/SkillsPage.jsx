import { useEffect, useState } from 'react';
import axios from 'axios';

import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-hot-toast';
import { 
  Search, 
  Users, 
  Star,
  MapPin,
  Briefcase,
  TrendingUp,
  Eye
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import UserProfileModal from './UserProfilePage';

function Skills() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('main'); // 'main', 'trending', 'featured'
  const [selectedUserId, setSelectedUserId] = useState(null);

  const { user: loggedInUser } = useAuthStore();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('/api/users');
        setUsers(response.data);
      } catch (error) {
        toast.error('Failed to fetch users');
        console.error('Error fetching users:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Left Sidebar Component
  const TrendingSection = () => (
    <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
      <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-blue-500" />
        Trending Skills
      </h2>
      <div className="space-y-3">
        {['React', 'Python', 'UI/UX Design', 'Machine Learning', 'Data Science'].map((skill, index) => (
          <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
            <span className="font-medium text-gray-700">{skill}</span>
            <span className="text-sm text-gray-500">+{Math.floor(Math.random() * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );

  // Right Sidebar Component
  const FeaturedSkillsSection = () => (
    <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
      <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
        <Star className="w-5 h-5 text-blue-500" />
        Featured Skills
      </h2>
      <div className="space-y-4">
        {[
          { name: 'Web Development', level: 'Advanced', users: 120 },
          { name: 'Digital Marketing', level: 'Intermediate', users: 85 },
          { name: 'Graphic Design', level: 'All Levels', users: 200 },
          { name: 'Data Analysis', level: 'Beginner', users: 150 }
        ].map((skill, index) => (
          <div key={index} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <h3 className="font-semibold text-gray-800">{skill.name}</h3>
            <div className="flex justify-between mt-2 text-sm">
              <span className="text-blue-600">{skill.level}</span>
              <span className="text-gray-500">{skill.users} learners</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Main Content Section - Single User Card
  const MainContent = () => {
    const user = filteredUsers[0]; // Display only the first user
    if (!user) return <div className="text-center text-gray-600">No users found</div>;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow duration-300 max-w-2xl mx-auto"
      >
        <div className="p-6">
          <div className="flex flex-col items-center">
            {/* Profile Picture */}
            <div className="mb-4">
              <img
                src={user.profilePic || 'https://via.placeholder.com/80'}
                alt={user.name}
                className="w-24 h-24 rounded-full object-cover shadow-md border-2 border-gray-100"
              />
            </div>

            {/* User Info */}
            <div className="text-center w-full">
              <h3 className="font-bold text-xl text-gray-800 mb-1">{user.name}</h3>
              <p className="text-gray-600 text-sm mb-3">{user.title || 'Skill Enthusiast'}</p>
              
              {/* Location and Work */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4 text-sm">
                {user.location && (
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{user.location}</span>
                  </div>
                )}
                {user.work && (
                  <div className="flex items-center text-gray-600">
                    <Briefcase className="w-4 h-4 mr-1" />
                    <span>{user.work}</span>
                  </div>
                )}
              </div>

              {/* Skills */}
              <div className="mb-6">
                <div className="flex flex-wrap gap-2 justify-center">
                  {user.skills?.slice(0, 4).map((skill, index) => (
                    <span 
                      key={index} 
                      className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                  {user.skills?.length > 4 && (
                    <span className="px-3 py-1 bg-gray-50 text-gray-600 rounded-full text-xs font-medium">
                      +{user.skills.length - 4} more
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons - Full width on mobile, auto width on larger screens */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md mx-auto">
                <button
                  onClick={() => visitProfile(user._id)}
                  className="flex items-center justify-center gap-2 px-6 py-2.5 bg-white border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 transition-colors duration-300 text-sm font-medium w-full"
                >
                  <Eye className="w-4 h-4" />
                  <span>View Profile</span>
                </button>
                <button
                  onClick={() => handleConnect(user._id)}
                  className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-300 text-sm font-medium w-full"
                >
                  <Users className="w-4 h-4" />
                  <span>Connect</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const visitProfile = (userId) => {
    setSelectedUserId(userId);
  };

  const handleConnect = async (userId) => {
    try {
      await axios.post(`/api/connections/request`, { userId });
      toast.success('Connection request sent!');
    } catch (error) {
      toast.error('Failed to send connection request');
      console.error('Error connecting:', error);
    }
  };

  const filteredUsers = users.filter(user =>
    user._id !== loggedInUser?._id && 
    (user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     user.skills?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  if (isLoading) return <LoadingSpinner />;

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'trending':
        return <div className="md:hidden"><TrendingSection /></div>;
      case 'featured':
        return <div className="md:hidden"><FeaturedSkillsSection /></div>;
      default:
        return <MainContent />;
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 pt-16 pb-20">
        {/* Search Bar */}
        <div className="sticky top-16 z-20 py-4 backdrop-blur-lg bg-white/70">
          <div className="max-w-7xl mx-auto px-4">
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search skills or users..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-12 pr-4 py-3 border-0 rounded-full bg-white shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300"
              />
            </div>
          </div>
        </div>

        {/* Main Layout */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex gap-8">
            {/* Left Sidebar - Hidden on mobile */}
            <div className="hidden md:block w-80">
              <div className="sticky top-36">
                <TrendingSection />
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {renderActiveSection()}
            </div>

            {/* Right Sidebar - Hidden on mobile */}
            <div className="hidden md:block w-80">
              <div className="sticky top-36">
                <FeaturedSkillsSection />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t md:hidden">
          <div className="flex justify-around items-center h-16">
            <button 
              onClick={() => setActiveSection('main')} 
              className={`flex flex-col items-center ${activeSection === 'main' ? 'text-blue-500' : 'text-gray-600'}`}
            >
              <Users className="w-6 h-6" />
              <span className="text-xs mt-1">Users</span>
            </button>
            <button 
              onClick={() => setActiveSection('trending')} 
              className={`flex flex-col items-center ${activeSection === 'trending' ? 'text-blue-500' : 'text-gray-600'}`}
            >
              <TrendingUp className="w-6 h-6" />
              <span className="text-xs mt-1">Trending</span>
            </button>
            <button 
              onClick={() => setActiveSection('featured')} 
              className={`flex flex-col items-center ${activeSection === 'featured' ? 'text-blue-500' : 'text-gray-600'}`}
            >
              <Star className="w-6 h-6" />
              <span className="text-xs mt-1">Featured</span>
            </button>
          </div>
        </div>
      </div>
      <UserProfileModal 
        userId={selectedUserId}
        isOpen={!!selectedUserId}
        onClose={() => setSelectedUserId(null)}
      />
    </>
  );
}

export default Skills;
