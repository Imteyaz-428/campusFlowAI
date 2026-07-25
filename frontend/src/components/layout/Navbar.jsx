import { User } from "lucide-react";

function Navbar({ currentUser }) {
  return (
    <header className="h-16 bg-white border-b px-8 flex items-center justify-between">

      <div>
        <h1 className="text-xl font-semibold text-gray-900">
          Enterprise RAG Platform
        </h1>

        <p className="text-sm text-gray-500">
          AI Knowledge Management System
        </p>
      </div>

      <div className="flex items-center gap-3">

        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
          <User
            size={18}
            className="text-gray-600"
          />
        </div>

        <div className="text-right">

          <p className="font-medium text-gray-900">
            {currentUser?.username || "User"}
          </p>

          <p className="text-sm text-gray-500 capitalize">
            {currentUser?.role || ""}
          </p>

        </div>

      </div>

    </header>
  );
}

export default Navbar;