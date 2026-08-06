import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  Users,
  Upload,
  Shield,
  Settings,
  LogOut,
  X,
} from "lucide-react";

import { removeToken } from "../../utils/token";

function Sidebar({
  currentUser,
  sidebarOpen,
  setSidebarOpen,
}) {
  const logout = () => {
    removeToken();
    window.location.href = "/";
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const menu = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Upload",
      path: "/upload",
      icon: Upload,
    },
    {
      name: "Documents",
      path: "/documents",
      icon: FileText,
    },
    {
      name: "AI Chat",
      path: "/chat",
      icon: MessageSquare,
    },
    {
      name: "Settings",
      path: "/settings",
      icon: Settings,
    },
  ];

  if (currentUser?.role === "admin") {
    menu.push({
      name: "Team",
      path: "/users",
      icon: Users,
    });
  }

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={closeSidebar}
        />
      )}

      <aside
        className={`
          fixed
          top-0
          left-0
          z-50
          h-screen
          w-64
          bg-white
          border-r
          flex
          flex-col
          transform
          transition-transform
          duration-300

          ${
            sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }

          md:static
          md:translate-x-0
          md:flex
          md:h-auto
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-6 border-b">

          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Enterprise RAG
            </h1>

            <p className="text-sm text-gray-500">
              Knowledge Platform
            </p>
          </div>

          {/* Mobile Close Button */}
          <button
            onClick={closeSidebar}
            className="md:hidden"
          >
            <X size={22} />
          </button>

        </div>

        {/* Menu */}
        <nav className="flex-1 px-4 py-6">

          <div className="space-y-2">

            {menu.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={closeSidebar}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-4 py-3 transition ${
                      isActive
                        ? "bg-blue-50 text-blue-700 font-semibold"
                        : "text-gray-700 hover:bg-gray-100"
                    }`
                  }
                >
                  <Icon size={20} />

                  <span>{item.name}</span>
                </NavLink>
              );
            })}

          </div>

        </nav>

        {/* User Section */}
        <div className="border-t p-5">

          <div className="flex items-center gap-3 mb-5">

            <div className="h-11 w-11 rounded-full bg-blue-100 flex items-center justify-center">

              <Shield
                size={20}
                className="text-blue-700"
              />

            </div>

            <div>

              <p className="font-medium text-gray-900">
                {currentUser?.username}
              </p>

              <p className="text-sm text-gray-500 capitalize">
                {currentUser?.role}
              </p>

            </div>

          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 rounded-lg border border-red-200 py-2.5 text-red-600 hover:bg-red-50 transition"
          >
            <LogOut size={18} />

            Logout
          </button>

        </div>

      </aside>
    </>
  );
}

export default Sidebar;