import { useEffect, useState } from 'react';
import { useConnectionStore } from '../store/connectionStore';
import { useMatchStore } from '../store/matchStore';
import { toast } from 'react-hot-toast';
import axios from '../utils/axios'; 


import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { 
  Search, 
  Users, 
  Star,
  MapPin,
  Briefcase,
  TrendingUp,
  Eye,
  RefreshCw,
  Filter,
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import UserProfileModal from './UserProfilePage';
import MatchCard from '../components/MatchCard';

function Main() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('main'); // 'main', 'trending', 'featured'
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [activeMatchType, setActiveMatchType] = useState('all'); // 'all', 'direct', 'alternative', 'similar', 'group'

  const { user: loggedInUser } = useAuthStore();
  const matchStore = useMatchStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // If user is logged in, fetch matches
        if (loggedInUser) {
          try {
            // Try to fetch matches for the authenticated user
            await matchStore.getMatches();
          } catch (error) {
            console.error('Error fetching matches:', error);
            // If there's an error, try with explicit user ID
            if (loggedInUser._id) {
              await matchStore.getMatches(loggedInUser._id);
            }
          }
        }
        
        // Also fetch all users as fallback
        const response = await axios.get('/api/users');
        setUsers(response.data);
      } catch (error) {
        toast.error('Failed to fetch data');
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    
    // Cleanup
    return () => {
      matchStore.clearMatches();
    };
  }, [loggedInUser]);

  // Left Sidebar Component
  const TrendingSection = () => (
    <div className="bg-white rounded-xl shadow-md p-4 lg:p-5 space-y-3">
      <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-blue-500" />
        Trending Skills
      </h2>
      <div className="space-y-2">
        {['React', 'Python', 'UI/UX Design', 'Machine Learning', 'Data Science'].map((skill, index) => (
          <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors">
            <span className="font-medium text-sm text-gray-700">{skill}</span>
            <span className="text-xs text-gray-500">+{Math.floor(Math.random() * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );

  // Right Sidebar Component
  const FeaturedSkillsSection = () => (
    <div className="bg-white rounded-xl shadow-md p-4 lg:p-5 space-y-3">
      <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
        <Star className="w-4 h-4 text-blue-500" />
        Featured Skills
      </h2>
      <div className="space-y-3">
        {[
          { name: 'Web Development', level: 'Advanced', users: 120 },
          { name: 'Digital Marketing', level: 'Intermediate', users: 85 },
          { name: 'Graphic Design', level: 'All Levels', users: 200 },
          { name: 'Data Analysis', level: 'Beginner', users: 150 }
        ].map((skill, index) => (
          <div key={index} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <h3 className="font-semibold text-sm text-gray-800">{skill.name}</h3>
            <div className="flex justify-between mt-1 text-xs">
              <span className="text-blue-600">{skill.level}</span>
              <span className="text-gray-500">{skill.users} learners</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Match Filter Component
  const MatchFilterSection = () => (
    <div className="bg-white rounded-xl shadow-md p-4 lg:p-5 space-y-3 mb-4">
      <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
        <Filter className="w-4 h-4 text-blue-500" />
        Filter Matches
      </h2>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveMatchType('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            activeMatchType === 'all' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Matches
        </button>
        <button
          onClick={() => setActiveMatchType('direct')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            activeMatchType === 'direct' 
              ? 'bg-green-500 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Perfect Matches
        </button>
        <button
          onClick={() => setActiveMatchType('alternative')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            activeMatchType === 'alternative' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          One-Way Matches
        </button>
        <button
          onClick={() => setActiveMatchType('similar')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            activeMatchType === 'similar' 
              ? 'bg-purple-500 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Similar Skills
        </button>
        <button
          onClick={() => setActiveMatchType('group')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            activeMatchType === 'group' 
              ? 'bg-amber-500 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Group Exchanges
        </button>
      </div>
      <div className="flex justify-end">
        <button
          onClick={() => handleGenerateMatches()}
          className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-xs font-medium"
          disabled={matchStore.isLoading}
        >
          <RefreshCw className={`w-3 h-3 ${matchStore.isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Matches</span>
        </button>
      </div>
    </div>
  );

  // Main Content Section - Multiple User Cards in a Grid
  const MainContent = () => {
    // If user is logged in, show matches
    if (loggedInUser?._id) {
      const filteredMatches = activeMatchType === 'all' 
        ? matchStore.matches 
        : matchStore.filterMatchesByType(activeMatchType);
      
      // Filter by search term if provided
      const searchFilteredMatches = searchTerm 
        ? filteredMatches.filter(match => 
            match.matchedUser.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            match.skillToLearn?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            match.skillToTeach?.name?.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : filteredMatches;
      
      if (searchFilteredMatches.length === 0) {
        return (
          <div className="text-center py-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-4">
              <Users className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No matches found</h3>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              {matchStore.matches.length === 0 
                ? "We couldn't find any matches for you. Try updating your skills or generating matches."
                : "No matches found with the current filters. Try changing your search or filter criteria."}
            </p>
            <button
              onClick={() => handleGenerateMatches()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Generate Matches</span>
            </button>
          </div>
        );
      }
      
      return (
        <>
          <MatchFilterSection />
          <div className="flex flex-col items-center gap-6">
            {searchFilteredMatches.map((match) => (
              <div key={match._id} className="w-full max-w-[280px]">
                <MatchCard 
                  match={match} 
                  onViewProfile={visitProfile} 
                />
              </div>
            ))}
          </div>
          {searchFilteredMatches.length > 0 && (
            <div className="mt-6 flex justify-center">
              <p className="text-sm text-gray-600">
                Showing {searchFilteredMatches.length} matches
              </p>
            </div>
          )}
        </>
      );
    }
    
    // If user is not logged in, show all users
    if (filteredUsers.length === 0) {
      return (
        <div className="text-center text-gray-600 py-8">
          No users found
        </div>
      );
    }

    return (
      <div className="flex justify-center items-start">
        {filteredUsers.map((user, index) => (
          <div key={user._id} className={index === 0 ? "block w-full max-w-[280px] mx-auto" : "hidden"}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow duration-300 h-full flex flex-col"
            >
              <div className="p-4 lg:p-5 flex-1 flex flex-col">
                <div className="flex flex-col items-center flex-1">
                  {/* Profile Picture */}
                  <div className="mb-3">
                    <img
                      src={user.profilePic || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"%3E%3Crect width="80" height="80" fill="%23e2e8f0"/%3E%3Ctext x="50%25" y="50%25" font-family="Arial" font-size="20" fill="%2394a3b8" text-anchor="middle" dominant-baseline="middle"%3E%3F%3C/text%3E%3C/svg%3E'}
                      alt={user.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"%3E%3Crect width="80" height="80" fill="%23e2e8f0"/%3E%3Ctext x="50%25" y="50%25" font-family="Arial" font-size="20" fill="%2394a3b8" text-anchor="middle" dominant-baseline="middle"%3E%3F%3C/text%3E%3C/svg%3E';
                      }}
                    />
                  </div>

                  {/* User Info */}
                  <div className="text-center w-full flex-1 flex flex-col">
                    <h3 className="font-bold text-base lg:text-lg text-gray-800 mb-1 truncate">{user.name}</h3>
                    <p className="text-gray-600 text-xs lg:text-sm mb-2 truncate">{user.title || 'Skill Enthusiast'}</p>
                    
                    {/* Location and Work */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mb-3 text-xs">
                      {user.location && (
                        <div className="flex items-center text-gray-600">
                          <MapPin className="w-3 h-3 mr-1" />
                          <span className="truncate max-w-[100px]">{user.location}</span>
                        </div>
                      )}
                      {user.work && (
                        <div className="flex items-center text-gray-600">
                          <Briefcase className="w-3 h-3 mr-1" />
                          <span className="truncate max-w-[100px]">{user.work}</span>
                        </div>
                      )}
                    </div>

                    {/* Skills */}
                    <div className="mb-4 flex-1">
                      <div className="flex flex-wrap gap-1 justify-center">
                        {user.skills?.slice(0, 3).map((skill, index) => (
                          <span 
                            key={index} 
                            className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-xs font-medium truncate max-w-[90px]"
                          >
                            {skill}
                          </span>
                        ))}
                        {user.skills?.length > 3 && (
                          <span className="px-2 py-0.5 bg-gray-50 text-gray-600 rounded-full text-xs font-medium">
                            +{user.skills.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2 w-full mt-auto">
                      <button
                        onClick={() => visitProfile(user._id)}
                        className="flex items-center justify-center gap-1 px-2 py-1.5 md:px-3 md:py-2 bg-white border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 transition-colors duration-300 text-xs md:text-sm font-medium w-full whitespace-nowrap"
                      >
                        <Eye className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                        <span>View Profile</span>
                      </button>
                      <button
                        onClick={() => handleConnect(user._id, user.name)}
                        className="flex items-center justify-center gap-1 px-2 py-1.5 md:px-3 md:py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-300 text-xs md:text-sm font-medium w-full whitespace-nowrap"
                      >
                        <Users className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                        <span>Connect</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        ))}
      </div>
    );
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const visitProfile = (userId) => {
    setSelectedUserId(userId);
  };

  const handleConnect = async (userId, userName) => {
    try {
      if (!loggedInUser) {
        toast.error('You must be logged in to connect with users', {
          position: 'top-center',
          duration: 3000
        });
        return;
      }

      // Show immediate feedback toast when button is clicked
      const toastId = toast.loading('Sending connection request...', { position: 'top-center' });
      
      const connectionStore = useConnectionStore.getState();
      
      try {
        const response = await connectionStore.sendConnectionRequest(userId);
        
        // Dismiss the loading toast
        toast.dismiss(toastId);
        
        // If the connection already exists, the store will handle the toast
        // But if it's a new connection, show a success toast here
        if (!response.alreadyExists) {
          toast.success(`Connection request sent to ${userName}!`, {
            position: 'top-center',
            duration: 4000,
            style: {
              borderRadius: '10px',
              background: '#f0f9ff',
              color: '#0369a1',
              border: '1px solid #bae6fd',
            },
          });
        }
      } catch (error) {
        // Dismiss the loading toast
        toast.dismiss(toastId);
        
        // Show error toast if not already shown by the store
        if (!error.message.includes('already exists')) {
          toast.error(`Error: ${error.message}`, { 
            position: 'top-center',
            duration: 4000 
          });
        }
      }
    } catch  {
      toast.error('An unexpected error occurred', { 
        position: 'top-center',
        duration: 4000 
      });
    }
  };

  const handleGenerateMatches = async () => {
    if (!loggedInUser) {
      toast.error('You must be logged in to generate matches', {
        position: 'top-center',
        duration: 3000
      });
      return;
    }
    
    // Show loading toast
    const toastId = toast.loading('Generating matches...', { position: 'top-center' });
    
    try {
      // Check if user has skills
      if ((!loggedInUser.skillsToLearn || loggedInUser.skillsToLearn.length === 0) && 
          (!loggedInUser.skillsToTeach || loggedInUser.skillsToTeach.length === 0)) {
        toast.dismiss(toastId);
        toast.error('Please add skills to your profile before generating matches', {
          position: 'top-center',
          duration: 4000
        });
        return;
      }
      
      // Generate matches using the authenticated user endpoint
      const matches = await matchStore.generateMatches();
      
      toast.dismiss(toastId);
      
      if (!matches || matches.length === 0) {
        toast.error('No matches found. Try adding more skills to your profile.', {
          position: 'top-center',
          duration: 4000
        });
      } else {
        toast.success(`Found ${matches.length} matches!`, {
          position: 'top-center',
          duration: 3000
        });
      }
    } catch (error) {
      toast.dismiss(toastId);
      console.error('Error generating matches:', error);
      
      if (error.response?.status === 404) {
        toast.error('User not found. Please try logging in again.', {
          position: 'top-center',
          duration: 4000
        });
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message, {
          position: 'top-center',
          duration: 4000
        });
      } else {
        toast.error('Failed to generate matches. Please try again later.', {
          position: 'top-center',
          duration: 4000
        });
      }
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
        return <div className="lg:hidden"><TrendingSection /></div>;
      case 'featured':
        return <div className="lg:hidden"><FeaturedSkillsSection /></div>;
      default:
        return <MainContent />;
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 pt-16 pb-20">
        {/* Search Bar */}
        <div className="sticky top-16 z-20 py-3 backdrop-blur-lg bg-white/70">
          <div className="max-w-8xl mx-auto px-4">
            <div className="relative max-w-4xl mx-auto">
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
        <div className="max-w-8xl mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row gap-6 xl:gap-8">
            {/* Left Sidebar - Hidden on mobile and tablet */}
            <div className="hidden lg:block lg:w-64 xl:w-72 flex-shrink-0">
              <div className="sticky top-32">
                <TrendingSection />
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {renderActiveSection()}
            </div>

            {/* Right Sidebar - Hidden on mobile and tablet */}
            <div className="hidden lg:block lg:w-64 xl:w-72 flex-shrink-0">
              <div className="sticky top-32">
                <FeaturedSkillsSection />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg lg:hidden z-30">
          <div className="flex justify-around items-center h-14">
            <button 
              onClick={() => setActiveSection('main')} 
              className={`flex flex-col items-center ${activeSection === 'main' ? 'text-blue-500' : 'text-gray-600'}`}
            >
              <Users className="w-5 h-5" />
              <span className="text-xs mt-0.5">Users</span>
            </button>
            <button 
              onClick={() => setActiveSection('trending')} 
              className={`flex flex-col items-center ${activeSection === 'trending' ? 'text-blue-500' : 'text-gray-600'}`}
            >
              <TrendingUp className="w-5 h-5" />
              <span className="text-xs mt-0.5">Trending</span>
            </button>
            <button 
              onClick={() => setActiveSection('featured')} 
              className={`flex flex-col items-center ${activeSection === 'featured' ? 'text-blue-500' : 'text-gray-600'}`}
            >
              <Star className="w-5 h-5" />
              <span className="text-xs mt-0.5">Featured</span>
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

export default Main;
