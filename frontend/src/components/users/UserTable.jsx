import UserRow from "./UserRow";
import EmptyUsers from "./EmptyUsers";

function UserTable({
  users,
  currentUserId,
  onDelete,
  isAdmin,
}) {

  if (users.length === 0) {
    return <EmptyUsers />;
  }

  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">

      <table className="w-full">

        <thead className="bg-gray-100">

          <tr>

            <th className="px-6 py-4 text-left">
              Name
            </th>

            <th className="px-6 py-4 text-left">
              Email
            </th>

            <th className="px-6 py-4 text-left">
              Role
            </th>

            <th className="px-6 py-4 text-right">
              Action
            </th>

          </tr>

        </thead>

        <tbody>

          {users.map((user) => (
            <UserRow
              key={user.id}
              user={user}
              currentUserId={currentUserId}
              onDelete={onDelete}
              isAdmin={isAdmin}
            />
          ))}

        </tbody>

      </table>

    </div>
  );
}

export default UserTable;