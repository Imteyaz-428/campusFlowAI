function PageHeader({
    title,
    subtitle,
    action,
  }) {
    return (
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {title}
          </h1>
  
          {subtitle && (
            <p className="text-gray-500 mt-2">
              {subtitle}
            </p>
          )}
        </div>
  
        {action && (
          <div>
            {action}
          </div>
        )}
      </div>
    );
  }
  
  export default PageHeader;