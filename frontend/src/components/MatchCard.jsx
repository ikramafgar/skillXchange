import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { 
  Users, 
  Star,
  MapPin,
  Eye,
  Clock,
  Globe,
  User,
  Sparkles,
  CheckCircle
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useConnectionStore } from '../store/connectionStore';
import { toast } from 'react-hot-toast';

const MatchCard = ({ match, onViewProfile }) => {
  const { user: loggedInUser } = useAuthStore();
  const connectionStore = useConnectionStore();
  const [imageError, setImageError] = useState(false);
  
  // Check if match and matchedUser exist before destructuring
  if (!match || !match.matchedUser) {
    console.error('Invalid match data:', match);
    return (
      <div className="bg-white rounded-xl shadow-md overflow-hidden p-4 h-full flex items-center justify-center">
        <p className="text-red-500">Error: Invalid match data</p>
      </div>
    );
  }

  const {
    matchedUser,
    matchType,
    score,
    scoreComponents,
    skillToLearn,
    skillToTeach,
    groupChain
  } = match;

  // Format score as percentage
  const scorePercentage = Math.round(score);
  
  // Get match type label
  const getMatchTypeLabel = () => {
    switch (matchType) {
      case 'direct':
        return { 
          label: 'Perfect Match', 
          color: 'bg-gradient-to-r from-green-50 to-emerald-50 text-emerald-600',
          icon: <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
        };
      case 'alternative':
        return { 
          label: 'One-Way Match', 
          color: 'bg-gradient-to-r from-blue-50 to-sky-50 text-blue-600',
          icon: <Users className="w-3.5 h-3.5 text-blue-500" />
        };
      case 'similar':
        return { 
          label: 'Similar Skill', 
          color: 'bg-gradient-to-r from-purple-50 to-violet-50 text-violet-600',
          icon: <Star className="w-3.5 h-3.5 text-violet-500" />
        };
      case 'group':
        return { 
          label: 'Group Exchange', 
          color: 'bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-600',
          icon: <Users className="w-3.5 h-3.5 text-amber-500" />
        };
      default:
        return { 
          label: 'Match', 
          color: 'bg-gradient-to-r from-gray-50 to-slate-50 text-slate-600',
          icon: <Users className="w-3.5 h-3.5 text-slate-500" />
        };
    }
  };
  
  const matchTypeInfo = getMatchTypeLabel();
  
  // Get user role
  const getUserRole = () => {
    const role = matchedUser?.profile?.role;
    return role;
  };
  
  const handleConnect = async () => {
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
      
      try {
        const response = await connectionStore.sendConnectionRequest(matchedUser._id);
        
        // Dismiss the loading toast
        toast.dismiss(toastId);
        
        // If the connection already exists, the store will handle the toast
        // But if it's a new connection, show a success toast here
        if (!response.alreadyExists) {
          toast.success(`Connection request sent to ${matchedUser.name}!`, {
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
  
  // Determine if we should show skills
  const shouldShowLearnSkill = () => {
    return skillToLearn && (getUserRole() === 'learner' || getUserRole() === 'both' || matchType === 'direct' || matchType === 'alternative');
  };
  
  const shouldShowTeachSkill = () => {
    return skillToTeach && (getUserRole() === 'teacher' || getUserRole() === 'both' || matchType === 'direct' || matchType === 'alternative');
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:border-gray-200 transition-all duration-300 h-full flex flex-col w-full"
    >
      {/* Match Score Indicator */}
      <div className="w-full bg-gray-50 h-1">
        <div 
          className={`h-full ${scorePercentage >= 80 ? 'bg-gradient-to-r from-blue-400 to-indigo-500' : 'bg-blue-500'}`} 
          style={{ width: `${scorePercentage}%` }}
        />
      </div>
      
      <div className="px-5 py-4 flex-1 flex flex-col">
        {/* Match Type Badge */}
        <div className="flex justify-between items-center mb-5">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${matchTypeInfo.color} border border-gray-100`}>
            {matchTypeInfo.icon}
            <span>{matchTypeInfo.label}</span>
          </div>
          <div className="flex items-center">
            <span className="text-xs font-medium px-2 py-1 bg-blue-50 text-blue-600 rounded-full">
              {scorePercentage}% Match
            </span>
          </div>
        </div>
        
        <div className="flex flex-col items-center flex-1">
          {/* Profile Picture */}
          <div className="mb-4 relative w-20 h-20">
            {imageError || !matchedUser?.profile?.profilePic ? (
              <div className="w-full h-full rounded-full bg-gradient-to-r from-gray-100 to-gray-50 flex items-center justify-center border border-gray-100 shadow-sm">
                <User className="w-10 h-10 text-gray-400" />
              </div>
            ) : (
              <img
                src={matchedUser.profile.profilePic}
                alt={matchedUser.name || 'User'}
                className="w-full h-full rounded-full object-cover shadow-sm border-2 border-white ring-1 ring-gray-100"
                onError={() => setImageError(true)}
              />
            )}
          </div>

          {/* User Info */}
          <div className="text-center w-full flex-1 flex flex-col">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <h3 className="font-semibold text-lg text-gray-800">{matchedUser.name || 'User'}</h3>
              {/* Verification badge */}
              {(matchedUser?.profile?.verificationStatus === "approved" || matchedUser?.verificationStatus === "approved") && (
                <span 
                  className="inline-flex bg-blue-500 text-white p-1 rounded-full"
                  title="Verified Teacher"
                >
                  <CheckCircle size={14} />
                </span>
              )}
            </div>
            <p className="text-gray-500 text-xs font-medium uppercase tracking-wide mb-4">
              {getUserRole() === 'both' 
                ? 'Learner & Teacher' 
                : getUserRole() === 'learner' 
                  ? 'Learner' 
                  : getUserRole() === 'teacher' 
                    ? 'Teacher' 
                    : 'Skill Enthusiast'}
            </p>
            
            {/* Match Details */}
            <div className="mb-5 flex-1 flex flex-col justify-center">
              <div className="flex flex-col gap-2.5 text-sm text-center">
                {/* Show skills to learn */}
                {shouldShowLearnSkill() && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-wrap items-center justify-center gap-2"
                  >
                    <span className="text-xs font-medium text-gray-500">You learn:</span>
                    <span className="px-3 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 rounded-full text-xs font-medium border border-blue-100 truncate max-w-[150px]">
                      {skillToLearn?.name || 'A skill'}
                    </span>
                  </motion.div>
                )}
                
                {/* Show skills to teach */}
                {shouldShowTeachSkill() && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="flex flex-wrap items-center justify-center gap-2"
                  >
                    <span className="text-xs font-medium text-gray-500">You teach:</span>
                    <span className="px-3 py-1 bg-gradient-to-r from-green-50 to-emerald-50 text-green-600 rounded-full text-xs font-medium border border-green-100 truncate max-w-[150px]">
                      {skillToTeach?.name || 'A skill'}
                    </span>
                  </motion.div>
                )}
              </div>
              
              {matchType === 'similar' && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="flex flex-col gap-2.5 text-sm text-center mt-2.5"
                >
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <span className="text-xs font-medium text-gray-500">Similar to what you want:</span>
                    <span className="px-3 py-1 bg-gradient-to-r from-purple-50 to-violet-50 text-purple-600 rounded-full text-xs font-medium border border-purple-100 truncate max-w-[150px]">
                      {skillToLearn?.name || 'A similar skill'}
                    </span>
                  </div>
                </motion.div>
              )}
              
              {matchType === 'group' && groupChain && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="flex flex-col gap-2.5 text-sm text-center mt-2.5"
                >
                  <span className="text-xs font-medium text-gray-500">Group Exchange:</span>
                  <div className="flex items-center justify-center gap-1 flex-wrap">
                    {groupChain.map((user, index) => (
                      <React.Fragment key={user?._id || index}>
                        <span className="px-3 py-1 bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-600 rounded-full text-xs font-medium border border-amber-100 truncate max-w-[100px]">
                          {user?.name || `User ${index+1}`}
                        </span>
                        {index < groupChain.length - 1 && (
                          <span className="text-gray-300">→</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
            
            {/* Match Score Components */}
            {scoreComponents && (
              <div className="grid grid-cols-2 gap-x-3 gap-y-2 mb-5 px-2">
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-center gap-2 bg-gradient-to-r from-amber-50 to-amber-50/30 rounded-lg px-2.5 py-1.5"
                >
                  <Star className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-xs text-gray-600 font-medium">Skill: {Math.round(scoreComponents.exactSkillMatch || 0)}</span>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-blue-50/30 rounded-lg px-2.5 py-1.5"
                >
                  <Clock className="w-3.5 h-3.5 text-blue-500" />
                  <span className="text-xs text-gray-600 font-medium">Time: {Math.round(scoreComponents.availabilityOverlap || 0)}</span>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center gap-2 bg-gradient-to-r from-red-50 to-red-50/30 rounded-lg px-2.5 py-1.5"
                >
                  <MapPin className="w-3.5 h-3.5 text-red-500" />
                  <span className="text-xs text-gray-600 font-medium">Location: {Math.round(scoreComponents.locationProximity || 0)}</span>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="flex items-center gap-2 bg-gradient-to-r from-green-50 to-green-50/30 rounded-lg px-2.5 py-1.5"
                >
                  <Globe className="w-3.5 h-3.5 text-green-500" />
                  <span className="text-xs text-gray-600 font-medium">Mode: {Math.round(scoreComponents.preferredModeMatch || 0)}</span>
                </motion.div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 w-full mt-auto">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onViewProfile(matchedUser._id)}
                className="flex items-center justify-center gap-2 px-3 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-300 text-xs font-medium w-full"
              >
                <Eye className="w-3.5 h-3.5 flex-shrink-0" />
                <span>View Profile</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleConnect}
                className="flex items-center justify-center gap-2 px-3 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-colors duration-300 text-xs font-medium w-full shadow-sm"
              >
                <Users className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Connect</span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Add PropTypes validation
MatchCard.propTypes = {
  match: PropTypes.shape({
    matchedUser: PropTypes.shape({
      _id: PropTypes.string,
      name: PropTypes.string,
      role: PropTypes.string,
      verificationStatus: PropTypes.string,
      profile: PropTypes.shape({
        role: PropTypes.string,
        profilePic: PropTypes.string,
        verificationStatus: PropTypes.string
        
      })
    }),
    matchType: PropTypes.string,
    score: PropTypes.number,
    scoreComponents: PropTypes.object,
    skillToLearn: PropTypes.object,
    skillToTeach: PropTypes.object,
    groupChain: PropTypes.array
  }).isRequired,
  onViewProfile: PropTypes.func.isRequired
};

export default MatchCard; 