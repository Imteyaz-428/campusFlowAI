import {
    X,
    UserRound,
    Shield,
    Mail,
    Building2,
    Hash,
  } from "lucide-react";
  
  function UserDetailsModal({
    isOpen,
    onClose,
    user,
  }) {
    if (!isOpen || !user) {
      return null;
    }
  
    const role = user.role
      ? String(user.role)
      : "—";
  
    const formattedRole =
      role !== "—"
        ? role.charAt(0).toUpperCase() +
          role.slice(1)
        : "—";
  
    const organizationName =
      user.organization?.name ||
      user.organization?.organization_name ||
      user.organization?.code ||
      "—";
  
    const getRoleStyle = () => {
      switch (role.toLowerCase()) {
        case "admin":
          return "bg-purple-100 text-purple-700";
  
        case "teacher":
          return "bg-blue-100 text-blue-700";
  
        case "student":
          return "bg-green-100 text-green-700";
  
        default:
          return "bg-gray-100 text-gray-700";
      }
    };
  
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
  
        <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
  
          {/* ====================================================
              HEADER
          ==================================================== */}
  
          <div className="flex items-center justify-between border-b px-6 py-5">
  
            <div className="flex items-center gap-3">
  
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-100">
  
                <UserRound
                  size={21}
                  className="text-gray-700"
                />
  
              </div>
  
              <div>
  
                <h2 className="text-lg font-bold text-gray-900">
                  User Details
                </h2>
  
                <p className="text-sm text-gray-500">
                  Account information
                </p>
  
              </div>
  
            </div>
  
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
            >
              <X size={20} />
            </button>
  
          </div>
  
          {/* ====================================================
              USER PROFILE
          ==================================================== */}
  
          <div className="p-6">
  
            <div className="mb-6 flex items-center gap-4">
  
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-900 text-xl font-bold text-white">
                {user.name
                  ? user.name
                      .charAt(0)
                      .toUpperCase()
                  : "U"}
              </div>
  
              <div className="min-w-0">
  
                <h3 className="truncate text-xl font-bold text-gray-900">
                  {user.name || "Unnamed User"}
                </h3>
  
                <p className="truncate text-sm text-gray-500">
                  {user.email || "—"}
                </p>
  
              </div>
  
            </div>
  
            {/* ==================================================
                DETAILS
            ================================================== */}
  
            <div className="space-y-3">
  
              {/* ROLE */}
  
              <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
  
                <div className="flex items-center gap-3">
  
                  <Shield
                    size={18}
                    className="text-gray-500"
                  />
  
                  <span className="text-sm text-gray-600">
                    Role
                  </span>
  
                </div>
  
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${getRoleStyle()}`}
                >
                  {formattedRole}
                </span>
  
              </div>
  
              {/* EMAIL */}
  
              <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
  
                <div className="flex items-center gap-3">
  
                  <Mail
                    size={18}
                    className="text-gray-500"
                  />
  
                  <span className="text-sm text-gray-600">
                    Email
                  </span>
  
                </div>
  
                <span className="max-w-[60%] truncate text-sm font-medium text-gray-900">
                  {user.email || "—"}
                </span>
  
              </div>
  
              {/* ORGANIZATION */}
  
              <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
  
                <div className="flex items-center gap-3">
  
                  <Building2
                    size={18}
                    className="text-gray-500"
                  />
  
                  <span className="text-sm text-gray-600">
                    Organization
                  </span>
  
                </div>
  
                <span className="max-w-[60%] truncate text-sm font-medium text-gray-900">
                  {organizationName}
                </span>
  
              </div>
  
              {/* USER ID */}
  
              <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
  
                <div className="flex items-center gap-3">
  
                  <Hash
                    size={18}
                    className="text-gray-500"
                  />
  
                  <span className="text-sm text-gray-600">
                    User ID
                  </span>
  
                </div>
  
                <span className="text-sm font-semibold text-gray-900">
                  #{user.id}
                </span>
  
              </div>
  
            </div>
  
          </div>
  
          {/* ====================================================
              FOOTER
          ==================================================== */}
  
          <div className="flex justify-end border-t bg-gray-50 px-6 py-4">
  
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
            >
              Close
            </button>
  
          </div>
  
        </div>
  
      </div>
    );
  }
  
  export default UserDetailsModal;