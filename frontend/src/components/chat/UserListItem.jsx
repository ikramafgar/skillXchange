import PropTypes from 'prop-types';

const UserListItem = ({ user, handleFunction }) => {
  const defaultAvatar = 'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg';
  
  return (
    <div
      className="flex items-center p-3 mb-2 cursor-pointer bg-gray-100 hover:bg-blue-100 rounded-lg transition-colors"
      onClick={handleFunction}
    >
      <img
        className="w-10 h-10 rounded-full mr-3 object-cover border border-gray-200"
        src={user.profilePicture || defaultAvatar}
        alt={user.name}
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = defaultAvatar;
        }}
      />
      <div>
        <p className="font-medium">{user.name}</p>
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