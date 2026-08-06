import { User, Menu } from "lucide-react";

function Navbar({
  currentUser,
  setSidebarOpen,
}) {
  return (
    <header className="sticky top-0 z-50 h-16 bg-white border-b shadow-sm">

      <div className="flex h-full items-center justify-between px-4 md:px-6 lg:px-8">

        {/* Left */}
        <div className="flex items-center gap-4">

          {/* Mobile Menu */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 transition hover:bg-gray-100 md:hidden"
          >
            <Menu size={22} />
          </button>

          <div>

            <h1 className="text-lg md:text-xl font-semibold text-gray-900">
              Enterprise RAG Platform
            </h1>

            <p className="hidden md:block text-sm text-gray-500">
              AI Knowledge Management System
            </p>

          </div>

        </div>

        {/* Right */}
        <div className="flex items-center gap-3">

          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">

            <User
              size={18}
              className="text-blue-700"
            />

          </div>

          <div className="hidden sm:block text-right">

            <p className="font-medium text-gray-900">
              {currentUser?.username || "User"}
            </p>

            <p className="text-sm text-gray-500 capitalize">
              {currentUser?.role || ""}
            </p>

          </div>

        </div>

      </div>

    </header>
  );
}

export default Navbar;