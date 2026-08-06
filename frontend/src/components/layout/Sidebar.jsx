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
          inset-y-0
          left-0
          z-50
          w-64
          bg-white
          border-r
          flex
          flex-col
          transform
          transition-transform
          duration-300
          ease-in-out

          ${
            sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }

          md:relative
          md:translate-x-0
          md:flex
          md:h-full
          md:shrink-0
        `}
      >
        {/* Mobile Header Only */}
        <div className="flex items-center justify-between px-6 py-5 border-b md:hidden">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Enterprise RAG
            </h1>

            <p className="text-sm text-gray-500">
              Knowledge Platform
            </p>
          </div>

          <button onClick={closeSidebar}>
            <X size={22} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-4">

          <div className="space-y-2">

            {menu.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={closeSidebar}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-4 py-3 transition-all ${
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
        <div className="border-t p-4 shrink-0">

          <div className="flex items-center gap-3 mb-4">

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