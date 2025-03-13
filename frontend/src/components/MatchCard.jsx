import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Star,
  MapPin,
  Briefcase,
  Eye,
  Award,
  Clock,
  Zap,
  Globe
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useConnectionStore } from '../store/connectionStore';
import { toast } from 'react-hot-toast';

const MatchCard = ({ match, onViewProfile }) => {
  const { user: loggedInUser } = useAuthStore();
  const connectionStore = useConnectionStore();
  
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
    } catch (error) {
      toast.error('An unexpected error occurred', { 
        position: 'top-center',
        duration: 4000 
      });
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow duration-300 h-full flex flex-col"
    >
      {/* Match Score Indicator */}
      <div className="w-full bg-gray-100 h-1.5">
        <div 
          className="h-full bg-blue-500" 
          style={{ width: `${scorePercentage}%` }}
        />
      </div>
      
      <div className="p-4 lg:p-5 flex-1 flex flex-col">
        {/* Match Type Badge */}
        <div className="flex justify-between items-start mb-3">
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${matchTypeInfo.color}`}>
            {matchTypeInfo.label}
          </span>
          <span className="text-sm font-semibold text-blue-600">{scorePercentage}% Match</span>
        </div>
        
        <div className="flex flex-col items-center flex-1">
          {/* Profile Picture */}
          <div className="mb-3">
            <img
              src={matchedUser.profilePic || 'https://via.placeholder.com/80'}
              alt={matchedUser.name}
              className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover shadow-md border-2 border-gray-100"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/80';
              }}
            />
          </div>

          {/* User Info */}
          <div className="text-center w-full flex-1 flex flex-col">
            <h3 className="font-bold text-base lg:text-lg text-gray-800 mb-1 truncate">{matchedUser.name}</h3>
            <p className="text-gray-600 text-xs lg:text-sm mb-2 truncate">{matchedUser.title || 'Skill Enthusiast'}</p>
            
            {/* Location and Work */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mb-3 text-xs">
              {matchedUser.location && (
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-3 h-3 mr-1" />
                  <span className="truncate max-w-[100px]">{matchedUser.location}</span>
                </div>
              )}
              {matchedUser.work && (
                <div className="flex items-center text-gray-600">
                  <Briefcase className="w-3 h-3 mr-1" />
                  <span className="truncate max-w-[100px]">{matchedUser.work}</span>
                </div>
              )}
            </div>
            
            {/* Match Details */}
            <div className="mb-4 flex-1">
              {matchType === 'direct' && (
                <div className="flex flex-col gap-2 text-xs text-center">
                  <div className="flex items-center justify-center gap-1">
                    <span className="font-medium text-gray-700">You learn:</span>
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full font-medium">
                      {skillToLearn?.name || 'A skill'}
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <span className="font-medium text-gray-700">You teach:</span>
                    <span className="px-2 py-0.5 bg-green-50 text-green-600 rounded-full font-medium">
                      {skillToTeach?.name || 'A skill'}
                    </span>
                  </div>
                </div>
              )}
              
              {matchType === 'alternative' && (
                <div className="flex flex-col gap-2 text-xs text-center">
                  {skillToLearn && (
                    <div className="flex items-center justify-center gap-1">
                      <span className="font-medium text-gray-700">You learn:</span>
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full font-medium">
                        {skillToLearn.name}
                      </span>
                    </div>
                  )}
                  {skillToTeach && (
                    <div className="flex items-center justify-center gap-1">
                      <span className="font-medium text-gray-700">You teach:</span>
                      <span className="px-2 py-0.5 bg-green-50 text-green-600 rounded-full font-medium">
                        {skillToTeach.name}
                      </span>
                    </div>
                  )}
                </div>
              )}
              
              {matchType === 'similar' && (
                <div className="flex flex-col gap-2 text-xs text-center">
                  <div className="flex items-center justify-center gap-1">
                    <span className="font-medium text-gray-700">Similar to what you want:</span>
                    <span className="px-2 py-0.5 bg-purple-50 text-purple-600 rounded-full font-medium">
                      {skillToLearn?.name || 'A similar skill'}
                    </span>
                  </div>
                </div>
              )}
              
              {matchType === 'group' && (
                <div className="flex flex-col gap-2 text-xs text-center">
                  <span className="font-medium text-gray-700">Group Exchange:</span>
                  <div className="flex items-center justify-center gap-1 flex-wrap">
                    {groupChain?.map((user, index) => (
                      <React.Fragment key={user._id}>
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-600 rounded-full font-medium truncate max-w-[80px]">
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
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 mb-4 text-xs">
              {scoreComponents && (
                <>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-500" />
                    <span className="text-gray-600">Skill: {Math.round(scoreComponents.exactSkillMatch)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-blue-500" />
                    <span className="text-gray-600">Time: {Math.round(scoreComponents.availabilityOverlap)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-red-500" />
                    <span className="text-gray-600">Location: {Math.round(scoreComponents.locationProximity)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Globe className="w-3 h-3 text-green-500" />
                    <span className="text-gray-600">Mode: {Math.round(scoreComponents.preferredModeMatch)}</span>
                  </div>
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 w-full mt-auto">
              <button
                onClick={() => onViewProfile(matchedUser._id)}
                className="flex items-center justify-center gap-1 px-2 py-1.5 md:px-3 md:py-2 bg-white border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 transition-colors duration-300 text-xs md:text-sm font-medium w-full whitespace-nowrap"
              >
                <Eye className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                <span>View Profile</span>
              </button>
              <button
                onClick={handleConnect}
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
  );
};

export default MatchCard; 