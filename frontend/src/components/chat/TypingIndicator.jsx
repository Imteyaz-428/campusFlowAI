function TypingIndicator() {
    return (
      <div className="flex justify-start mb-5">
  
        <div className="bg-white border shadow-sm rounded-2xl rounded-bl-md px-4 py-3">
  
          <div className="text-xs font-semibold text-gray-500 mb-2">
            AI Assistant
          </div>
  
          <div className="flex items-center gap-1">
  
            <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
  
            <div
              className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
              style={{ animationDelay: "0.15s" }}
            ></div>
  
            <div
              className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
              style={{ animationDelay: "0.3s" }}
            ></div>
  
          </div>
  
        </div>
  
      </div>
    );
  }
  
  export default TypingIndicator;