import PropTypes from 'prop-types';

const UserListItem = ({ user, handleFunction }) => {
  const defaultAvatar = 'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg';
  
  return (
    <div
      className="flex items-center p-3 mb-2 cursor-pointer bg-gray-50 hover:bg-indigo-50 rounded-lg transition-colors shadow-sm"
      onClick={handleFunction}
    >
      <div className="relative">
        <img
          className="w-10 h-10 rounded-full mr-3 object-cover border-2 border-white shadow-sm"
          src={user.profilePicture || defaultAvatar}
          alt={user.name}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = defaultAvatar;
          }}
        />
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white"></span>
      </div>
      <div>
        <p className="font-medium text-gray-800">{user.name}</p>
        <p className="text-xs text-gray-500">{user.email}</p>
      </div>
    </div>
  );
};

UserListItem.propTypes = {
  user: PropTypes.object.isRequired,
  handleFunction: PropTypes.func.isRequired,
};

export default UserListItem; 