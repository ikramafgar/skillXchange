import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';


function Skills() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { user: loggedInUser } = useAuthStore();

  useEffect(() => {
    axios.get('/api/users')
      .then(response => setUsers(response.data))
      .catch(error => console.error('Error fetching users:', error));
  }, []);

  const visitProfile = (userId) => {
    navigate(`/profile/${userId}`);
  };

  const filteredUsers = users.filter(user =>
    user._id !== loggedInUser?._id && user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen pt-24 flex flex-col items-center">
      
      <div className="mb-8 flex justify-center items-center space-x-4">
        {loggedInUser && (
          <img src={loggedInUser.profilePic || 'https://via.placeholder.com/40'} 
               alt={loggedInUser.name} 
               className="w-12 h-12 rounded-full" />
        )}
        <input
          type="text"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md px-4 py-2 border bg-white border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>
      <div className="flex justify-center items-center w-full">
        {filteredUsers.map(user => (
          <motion.div 
            key={user._id} 
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg flex flex-col items-start space-y-4 w-full max-w-xl"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center">
                <img 
                  src={user.profilePic || 'https://via.placeholder.com/64'} 
                  alt={user.name} 
                  className="w-16 h-16 rounded-full object-cover mr-4" 
                />
                <div>
                  <h2 className="text-2xl font-semibold text-gray-800">{user.name}</h2>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap space-x-3 mt-3">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg transition-all duration-300 hover:bg-blue-700 focus:ring-2 focus:ring-blue-400">
                Connect
              </button>
              <button 
                className="bg-green-500 text-white px-4 py-2 rounded-lg transition-all duration-300 hover:bg-green-600 focus:ring-2 focus:ring-green-400"
                onClick={() => visitProfile(user._id)}
              >
                Visit Profile
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default Skills;
