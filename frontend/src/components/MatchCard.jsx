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
  User
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useConnectionStore } from '../store/connectionStore';
import { toast } from 'react-hot-toast';

const MatchCard = ({ match, onViewProfile }) => {
  const { user: loggedInUser } = useAuthStore();
  const connectionStore = useConnectionStore();
  const [imageError, setImageError] = useState(false);
  
  const {
    matchedUser,
    matchType,
    score,
    scoreComponents,
    skillToLearn,
    skillToTeach,
    groupChain
  } = match;

  // Debug log to see the data structure
  console.log('MatchCard matchedUser:', matchedUser);
  console.log('MatchCard matchedUser profile:', matchedUser?.profile);
  console.log('MatchCard matchedUser role:', matchedUser?.role);
  console.log('MatchCard matchedUser profile role:', matchedUser?.profile?.role);

  // Format score as percentage
  const scorePercentage = Math.round(score);
  
  // Get match type label
  const getMatchTypeLabel = () => {
    switch (matchType) {
      case 'direct':
        return { label: 'Perfect Match', color: 'bg-green-100 text-green-700' };
      case 'alternative':
        return { label: 'One-Way Match', color: 'bg-blue-100 text-blue-700' };
      case 'similar':
        return { label: 'Similar Skill', color: 'bg-purple-100 text-purple-700' };
      case 'group':
        return { label: 'Group Exchange', color: 'bg-amber-100 text-amber-700' };
      default:
        return { label: 'Match', color: 'bg-gray-100 text-gray-700' };
    }
  };
  
  const matchTypeInfo = getMatchTypeLabel();
  
  // Get user role
  const getUserRole = () => {
    const role = matchedUser?.profile?.role;
    console.log('User role:', role);
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
      className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow duration-300 h-full flex flex-col w-full"
    >
      {/* Match Score Indicator */}
      <div className="w-full bg-gray-100 h-1.5">
        <div 
          className="h-full bg-blue-500" 
          style={{ width: `${scorePercentage}%` }}
        />
      </div>
      
      <div className="p-4 flex-1 flex flex-col">
        {/* Match Type Badge */}
        <div className="flex justify-between items-start mb-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${matchTypeInfo.color}`}>
            {matchTypeInfo.label}
          </span>
          <span className="text-sm font-semibold text-blue-600">{scorePercentage}% Match</span>
        </div>
        
        <div className="flex flex-col items-center flex-1">
          {/* Profile Picture */}
          <div className="mb-4 relative w-20 h-20">
            {imageError || !matchedUser.profile?.profilePic ? (
              <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-100 shadow-md">
                <User className="w-10 h-10 text-gray-400" />
              </div>
            ) : (
              <img
                src={matchedUser.profile.profilePic}
                alt={matchedUser.name}
                className="w-full h-full rounded-full object-cover shadow-md border-2 border-gray-100"
                onError={() => setImageError(true)}
              />
            )}
          </div>

          {/* User Info */}
          <div className="text-center w-full flex-1 flex flex-col">
            <h3 className="font-bold text-lg text-gray-800 mb-1">{matchedUser.name}</h3>
            <p className="text-gray-600 text-sm mb-4">
              {getUserRole() === 'both' 
                ? 'Learner & Teacher' 
                : getUserRole() === 'learner' 
                  ? 'Learner' 
                  : getUserRole() === 'teacher' 
                    ? 'Teacher' 
                    : 'Skill Enthusiast'}
            </p>
            
            {/* Match Details */}
            <div className="mb-5 flex-1">
              <div className="flex flex-col gap-3 text-sm text-center">
                {/* Show skills to learn */}
                {shouldShowLearnSkill() && (
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <span className="font-medium text-gray-700">You learn:</span>
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full font-medium truncate max-w-[150px]">
                      {skillToLearn?.name || 'A skill'}
                    </span>
                  </div>
                )}
                
                {/* Show skills to teach */}
                {shouldShowTeachSkill() && (
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <span className="font-medium text-gray-700">You teach:</span>
                    <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full font-medium truncate max-w-[150px]">
                      {skillToTeach?.name || 'A skill'}
                    </span>
                  </div>
                )}
              </div>
              
              {matchType === 'similar' && (
                <div className="flex flex-col gap-3 text-sm text-center">
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <span className="font-medium text-gray-700">Similar to what you want:</span>
                    <span className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full font-medium truncate max-w-[150px]">
                      {skillToLearn?.name || 'A similar skill'}
                    </span>
                  </div>
                </div>
              )}
              
              {matchType === 'group' && (
                <div className="flex flex-col gap-3 text-sm text-center">
                  <span className="font-medium text-gray-700">Group Exchange:</span>
                  <div className="flex items-center justify-center gap-1 flex-wrap">
                    {groupChain?.map((user, index) => (
                      <React.Fragment key={user._id}>
                        <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full font-medium truncate max-w-[100px]">
                          {user.name}
                        </span>
                        {index < groupChain.length - 1 && (
                          <span className="text-gray-400">→</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Match Score Components */}
            <div className="grid grid-cols-2 gap-x-3 gap-y-2 mb-5 text-sm">
              {scoreComponents && (
                <>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber-500" />
                    <span className="text-gray-600">Skill: {Math.round(scoreComponents.exactSkillMatch)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span className="text-gray-600">Time: {Math.round(scoreComponents.availabilityOverlap)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-red-500" />
                    <span className="text-gray-600">Location: {Math.round(scoreComponents.locationProximity)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Globe className="w-4 h-4 text-green-500" />
                    <span className="text-gray-600">Mode: {Math.round(scoreComponents.preferredModeMatch)}</span>
                  </div>
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 w-full mt-auto">
              <button
                onClick={() => onViewProfile(matchedUser._id)}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-white border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 transition-colors duration-300 text-sm font-medium w-full"
              >
                <Eye className="w-4 h-4 flex-shrink-0" />
                <span>View Profile</span>
              </button>
              <button
                onClick={handleConnect}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-300 text-sm font-medium w-full"
              >
                <Users className="w-4 h-4 flex-shrink-0" />
                <span>Connect</span>
              </button>
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
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      role: PropTypes.string,
      profile: PropTypes.shape({
        role: PropTypes.string,
        profilePic: PropTypes.string
      })
    }).isRequired,
    matchType: PropTypes.string.isRequired,
    score: PropTypes.number.isRequired,
    scoreComponents: PropTypes.object,
    skillToLearn: PropTypes.object,
    skillToTeach: PropTypes.object,
    groupChain: PropTypes.array
  }).isRequired,
  onViewProfile: PropTypes.func.isRequired
};

export default MatchCard; 