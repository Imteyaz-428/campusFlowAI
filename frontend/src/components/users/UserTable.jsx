import {
  Eye,
  Pencil,
  Trash2,
  Shield,
  GraduationCap,
  UserRound,
} from "lucide-react";

function UserTable({
  users,
  currentUserId,
  onView,
  onEdit,
  onDelete,
}) {
 
  // EMPTY STATE
 

  if (!users || users.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center">

        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">

          <UserRound
            size={25}
            className="text-gray-500"
          />

        </div>

        <h3 className="text-lg font-semibold text-gray-900">
          No users found
        </h3>

        <p className="mt-1 text-sm text-gray-500">
          Try changing your search or filter.
        </p>

      </div>
    );
  }

 
  // ROLE STYLE
 

  const getRoleStyle = (role) => {
    switch (String(role).toLowerCase()) {
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

 
  // ROLE ICON
 

  const RoleIcon = ({ role }) => {
    switch (String(role).toLowerCase()) {
      case "admin":
        return <Shield size={14} />;

      case "teacher":
        return <GraduationCap size={14} />;

      case "student":
        return <UserRound size={14} />;

      default:
        return <UserRound size={14} />;
    }
  };

 
  // ORGANIZATION
 

  const getOrganizationName = (user) => {
    return (
      user.organization?.name ||
      user.organization?.organization_name ||
      user.organization?.code ||
      "—"
    );
  };

 
  // RENDER
 

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

      <div className="overflow-x-auto">

        <table className="w-full min-w-[760px]">

          {/* ==================================================
              HEADER
          ================================================== */}

          <thead className="border-b border-gray-200 bg-gray-50">

            <tr>

              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                User
              </th>

              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Email
              </th>

              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Role
              </th>

              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Organization
              </th>

              <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                Actions
              </th>

            </tr>

          </thead>

          {/* ==================================================
              BODY
          ================================================== */}

          <tbody className="divide-y divide-gray-100">

            {users.map((user) => {

              const isCurrentUser =
                Number(user.id) ===
                Number(currentUserId);

              return (
                <tr
                  key={user.id}
                  className="transition hover:bg-gray-50"
                >

                  {/* USER */}

                  <td className="px-6 py-4">

                    <div className="flex items-center gap-3">

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-900 text-sm font-semibold text-white">

                        {user.name
                          ? user.name
                              .charAt(0)
                              .toUpperCase()
                          : "U"}

                      </div>

                      <div className="min-w-0">

                        <div className="flex items-center gap-2">

                          <p className="truncate font-medium text-gray-900">
                            {user.name || "Unnamed User"}
                          </p>

                          {isCurrentUser && (
                            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600">
                              You
                            </span>
                          )}

                        </div>

                        <p className="text-xs text-gray-500">
                          ID #{user.id}
                        </p>

                      </div>

                    </div>

                  </td>

                  {/* EMAIL */}

                  <td className="px-6 py-4">

                    <span className="text-sm text-gray-700">
                      {user.email || "—"}
                    </span>

                  </td>

                  {/* ROLE */}

                  <td className="px-6 py-4">

                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${getRoleStyle(
                        user.role
                      )}`}
                    >

                      <RoleIcon role={user.role} />

                      {user.role
                        ? String(user.role)
                            .charAt(0)
                            .toUpperCase() +
                          String(user.role).slice(1)
                        : "—"}

                    </span>

                  </td>

                  {/* ORGANIZATION */}

                  <td className="px-6 py-4">

                    <span className="text-sm text-gray-700">
                      {getOrganizationName(user)}
                    </span>

                  </td>

                  {/* ACTIONS */}

                  <td className="px-6 py-4">

                    <div className="flex justify-end gap-2">

                      {/* VIEW */}

                      <button
                        type="button"
                        onClick={() => onView(user)}
                        title="View user"
                        className="rounded-lg border border-gray-200 p-2 text-gray-600 transition hover:border-gray-300 hover:bg-gray-100 hover:text-gray-900"
                      >
                        <Eye size={17} />
                      </button>

                      {/* EDIT */}

                      <button
                        type="button"
                        onClick={() => onEdit(user)}
                        title="Edit user"
                        className="rounded-lg border border-gray-200 p-2 text-gray-600 transition hover:border-gray-300 hover:bg-gray-100 hover:text-gray-900"
                      >
                        <Pencil size={17} />
                      </button>

                      {/* DELETE */}

                      <button
                        type="button"
                        onClick={() => onDelete(user)}
                        disabled={isCurrentUser}
                        title={
                          isCurrentUser
                            ? "You cannot delete your own account"
                            : "Delete user"
                        }
                        className="rounded-lg border border-red-100 p-2 text-red-500 transition hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <Trash2 size={17} />
                      </button>

                    </div>

                  </td>

                </tr>
              );
            })}

          </tbody>

        </table>

      </div>

    </div>
  );
}

export default UserTable;