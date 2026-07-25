function StatCard({
    title,
    value,
    icon,
    color,
  }) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
  
        <div className="flex items-center justify-between">
  
          <div className="flex-1">
  
            <p className="text-sm text-gray-500">
              {title}
            </p>
  
            <h2 className="mt-2 text-3xl font-bold text-gray-900 break-words">
              {value}
            </h2>
  
          </div>
  
          <div
            className={`w-14 h-14 rounded-xl flex items-center justify-center ${color}`}
          >
            {icon}
          </div>
  
        </div>
  
      </div>
    );
  }
  
  export default StatCard;