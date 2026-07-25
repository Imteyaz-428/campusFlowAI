import { Trash2 } from "lucide-react";

function UserRow({
  user,
  currentUserId,
  onDelete,
  isAdmin,
}) {
  const isCurrentUser = user.id === currentUserId;

  return (
    <tr className="border-b hover:bg-gray-50">

      <td className="px-6 py-4">
        {user.name}
      </td>

      <td className="px-6 py-4">
        {user.email}
      </td>

      <td className="px-6 py-4">

        <span
          className={`px-3 py-1 rounded-full text-sm ${
            user.role === "admin"
              ? "bg-blue-100 text-blue-700"
              : user.role === "manager"
              ? "bg-yellow-100 text-yellow-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {user.role}
        </span>

      </td>

      <td className="px-6 py-4 text-right">

        {isCurrentUser ? (
          <span className="text-sm text-gray-400">
            You
          </span>
        ) : isAdmin ? (
          <button
            onClick={() => onDelete(user.id)}
            className="text-red-500 hover:text-red-700"
          >
            <Trash2 size={18} />
          </button>
        ) : (
          <span className="text-gray-400">
            —
          </span>
        )}

      </td>

    </tr>
  );
}

export default UserRow;