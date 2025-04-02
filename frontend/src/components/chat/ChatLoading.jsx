const ChatLoading = () => {
  return (
    <div className="space-y-4 p-1">
      {Array(4)
        .fill()
        .map((_, index) => (
          <div key={index} className="flex items-center p-3 animate-pulse rounded-xl bg-gray-50">
            <div className="w-12 h-12 rounded-full bg-gray-200 mr-3 flex-shrink-0"></div>
            <div className="flex-1">
              <div className="flex justify-between">
                <div className="h-3 bg-gray-200 rounded-full w-24 mb-2.5"></div>
                <div className="h-2 bg-gray-200 rounded-full w-10"></div>
              </div>
              <div className="h-2.5 bg-gray-200 rounded-full w-32 mt-2"></div>
            </div>
          </div>
        ))}
    </div>
  );
};

export default ChatLoading; 