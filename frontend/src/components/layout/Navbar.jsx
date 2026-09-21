import { User, Menu, GraduationCap } from "lucide-react";

function Navbar({
  currentUser,
  setSidebarOpen,
}) {
  return (
    <header className="sticky top-0 z-50 h-16 border-b bg-white shadow-sm">

      <div className="flex h-full items-center justify-between px-4 md:px-6 lg:px-8">

        {/* Left */}
        <div className="flex items-center gap-3">

          {/* Mobile Menu */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 transition hover:bg-gray-100 md:hidden"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>

          {/* Brand */}
          <div className="flex items-center gap-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-900 md:hidden">
              <GraduationCap
                size={18}
                className="text-white"
              />
            </div>

            <div>
              <h1 className="text-lg font-bold text-gray-900 md:text-xl">
                CampusFlow AI
              </h1>

              <p className="hidden text-sm text-gray-500 md:block">
                Intelligent Campus Process Automation
              </p>
            </div>

          </div>

        </div>


        {/* Right */}
        <div className="flex items-center gap-3">

          {/* User Avatar */}
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">

            <User
              size={19}
              className="text-gray-700"
            />

          </div>


          {/* User Information */}
          <div className="hidden text-right sm:block">

            <p className="font-semibold text-gray-900">
              {currentUser?.full_name ||
                currentUser?.name ||
                currentUser?.email ||
                "User"}
            </p>

            <p className="text-sm capitalize text-gray-500">
              {currentUser?.role || "User"}
            </p>

          </div>

        </div>

      </div>

    </header>
  );
}

export default Navbar;