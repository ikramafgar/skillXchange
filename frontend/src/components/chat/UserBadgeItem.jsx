import PropTypes from 'prop-types';

const UserBadgeItem = ({ user, handleFunction }) => {
  return (
    <div className="flex items-center bg-blue-500 text-white text-sm px-2 py-1 rounded-md">
      {user.name}
      <button 
        className="ml-1 hover:text-gray-200"
        onClick={handleFunction}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

UserBadgeItem.propTypes = {
  user: PropTypes.object.isRequired,
  handleFunction: PropTypes.func.isRequired,
};

export default UserBadgeItem; 