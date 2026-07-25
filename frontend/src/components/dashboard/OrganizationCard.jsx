import {
    Building2,
    User,
    Mail,
  } from "lucide-react";
  
  function OrganizationCard({
    user,
  }) {
    if (!user) return null;
  
    const isAdmin = user.role === "admin";
  
    return (
      <div className="bg-white rounded-xl shadow p-6">
  
        <h2 className="text-xl font-semibold mb-5">
          {isAdmin ? "Organization" : "My Profile"}
        </h2>
  
        <div className="space-y-5">
  
          {!isAdmin && (
            <div className="flex items-center gap-3">
              <User size={22} className="text-blue-600" />
  
              <div>
                <p className="text-sm text-gray-500">
                  Name
                </p>
  
                <p className="font-semibold">
                  {user.name}
                </p>
              </div>
            </div>
          )}
  
          <div className="flex items-center gap-3">
  
            <Building2
              size={22}
              className="text-green-600"
            />
  
            <div>
              <p className="text-sm text-gray-500">
                Organization
              </p>
  
              <p className="font-semibold">
                {user.organization.name}
              </p>
            </div>
  
          </div>
  
          <div className="flex items-center gap-3">
  
            <User
              size={22}
              className="text-purple-600"
            />
  
            <div>
  
              <p className="text-sm text-gray-500">
                Role
              </p>
  
              <p className="font-semibold capitalize">
                {user.role}
              </p>
  
            </div>
  
          </div>
  
          <div className="flex items-center gap-3">
  
            <Mail
              size={22}
              className="text-red-500"
            />
  
            <div>
  
              <p className="text-sm text-gray-500">
                Email
              </p>
  
              <p className="font-semibold">
                {user.email}
              </p>
  
            </div>
  
          </div>
  
        </div>
  
      </div>
    );
  }
  
  export default OrganizationCard;