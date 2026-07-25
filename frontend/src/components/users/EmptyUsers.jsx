import { Users } from "lucide-react";

function EmptyUsers() {
  return (
    <div className="bg-white rounded-xl shadow p-12 text-center">

      <Users
        size={60}
        className="mx-auto text-gray-400 mb-5"
      />

      <h2 className="text-2xl font-semibold mb-2">
        No Team Members
      </h2>

      <p className="text-gray-500">
        There are no users in your organization yet.
      </p>

    </div>
  );
}

export default EmptyUsers;