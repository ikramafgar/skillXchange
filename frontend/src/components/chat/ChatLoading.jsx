const ChatLoading = () => {
  return (
    <div className="space-y-3">
      {Array(4)
        .fill()
        .map((_, index) => (
          <div key={index} className="flex items-center p-3 animate-pulse">
            <div className="w-10 h-10 rounded-full bg-gray-300 mr-3"></div>
            <div className="flex-1">
              <div className="h-2.5 bg-gray-300 rounded-full w-24 mb-2.5"></div>
              <div className="h-2 bg-gray-300 rounded-full w-32"></div>
            </div>
          </div>
        ))}
    </div>
  );
};

export default ChatLoading; 