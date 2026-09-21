import { NavLink } from "react-router-dom";
import { ClipboardCheck } from "lucide-react";
import {
  LayoutDashboard,
  GraduationCap,
  ClipboardList,
  FileCheck,
  CreditCard,
  Ticket,
  Bot,
  Users,
  Settings,
  LogOut,
  X,
  UserRound,
} from "lucide-react";

import { removeToken } from "../../utils/token";


function Sidebar({
  currentUser,
  sidebarOpen,
  setSidebarOpen,
}) {

  // ==============================================================
  // LOGOUT
  // ==============================================================

  const logout = () => {
    removeToken();
    window.location.href = "/";
  };


  // ==============================================================
  // CLOSE SIDEBAR
  // ==============================================================

  const closeSidebar = () => {
    setSidebarOpen(false);
  };


  // ==============================================================
  // CURRENT USER ROLE
  // ==============================================================

  const role =
    currentUser?.role?.toLowerCase();


  // ==============================================================
  // ADMIN NAVIGATION
  // ==============================================================

  const adminMenu = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Students",
      path: "/students",
      icon: GraduationCap,
    },
    {
      name: "Applications",
      path: "/applications",
      icon: ClipboardList,
    },
    {
      name: "Documents",
      path: "/documents",
      icon: FileCheck,
    },
    {
      name: "Fees",
      path: "/fees",
      icon: CreditCard,
    },
    {
      name: "Tickets",
      path: "/tickets",
      icon: Ticket,
    },
    {
      name: "AI Assistant",
      path: "/chat",
      icon: Bot,
    },
    {
      name: "Users",
      path: "/users",
      icon: Users,
    },
    {
      name: "Settings",
      path: "/settings",
      icon: Settings,
    },
    {
      name: "Onboarding",
      path: "/admin-onboarding",
      icon: ClipboardCheck,
    }
  ];


  // ==============================================================
  // TEACHER NAVIGATION
  // ==============================================================

  const teacherMenu = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Applications",
      path: "/applications",
      icon: ClipboardList,
    },
    {
      name: "Documents",
      path: "/documents",
      icon: FileCheck,
    },
    {
      name: "Tickets",
      path: "/tickets",
      icon: Ticket,
    },
    {
      name: "AI Assistant",
      path: "/chat",
      icon: Bot,
    },
    {
      name: "Settings",
      path: "/settings",
      icon: Settings,
    },
  ];


  // ==============================================================
  // STUDENT NAVIGATION
  // ==============================================================

  const studentMenu = [
    {
      name: "Dashboard",
      path: "/student-dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Admission",
      path: "/admission",
      icon: ClipboardList,
    },
    {
      name: "Documents",
      path: "/student-documents",
      icon: FileCheck,
    },
    {
      name: "Fees",
      path: "/student-fees",
      icon: CreditCard,
    },
    {
      name: "Onboarding",
      path: "/onboarding",
      icon: GraduationCap,
    },
    {
      name: "Tickets",
      path: "/student-tickets",
      icon: Ticket,
    },
    {
      name: "AI Assistant",
      path: "/student-chat",
      icon: Bot,
    },
    {
      name: "Settings",
      path: "/settings",
      icon: Settings,
    },
  ];


  // ==============================================================
  // SELECT MENU BASED ON ROLE
  // ==============================================================

  let menu = adminMenu;

  if (role === "teacher") {
    menu = teacherMenu;
  }

  if (role === "student") {
    menu = studentMenu;
  }


  // ==============================================================
  // RENDER
  // ==============================================================

  return (
    <>
      {/* ==========================================================
          MOBILE OVERLAY
      ========================================================== */}

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={closeSidebar}
        />
      )}


      {/* ==========================================================
          SIDEBAR
      ========================================================== */}

      <aside
        className={`
          fixed
          inset-y-0
          left-0
          z-50
          flex
          w-64
          flex-col
          border-r
          bg-white
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
          md:flex
          md:h-full
          md:shrink-0
          md:translate-x-0
        `}
      >

        {/* ========================================================
            MOBILE HEADER
        ======================================================== */}

        <div className="flex items-center justify-between border-b px-6 py-5 md:hidden">

          <div>

            <h1 className="text-xl font-bold text-gray-900">
              CampusFlow AI
            </h1>

            <p className="text-sm text-gray-500">
              Campus Automation
            </p>

          </div>


          <button
            onClick={closeSidebar}
            className="rounded-lg p-2 hover:bg-gray-100"
            aria-label="Close sidebar"
          >

            <X size={22} />

          </button>

        </div>


        {/* ========================================================
            BRAND
        ======================================================== */}

        <div className="hidden border-b px-6 py-6 md:block">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900">

              <GraduationCap
                size={22}
                className="text-white"
              />

            </div>


            <div>

              <h1 className="font-bold text-gray-900">
                CampusFlow AI
              </h1>

              <p className="text-xs text-gray-500">
                Campus Automation
              </p>

            </div>

          </div>

        </div>


        {/* ========================================================
            NAVIGATION
        ======================================================== */}

        <nav className="flex-1 overflow-y-auto px-4 py-5">

          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Workspace
          </p>


          <div className="space-y-1">

            {menu.map((item) => {

              const Icon = item.icon;

              return (

                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={closeSidebar}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 rounded-xl px-4 py-3 transition-all ${
                      isActive
                        ? "bg-gray-900 font-semibold text-white shadow-sm"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`
                  }
                >

                  {({ isActive }) => (

                    <>

                      <Icon
                        size={20}
                        className={
                          isActive
                            ? "text-white"
                            : "text-gray-500 group-hover:text-gray-900"
                        }
                      />

                      <span>
                        {item.name}
                      </span>

                    </>

                  )}

                </NavLink>

              );

            })}

          </div>

        </nav>


        {/* ========================================================
            USER SECTION
        ======================================================== */}

        <div className="shrink-0 border-t p-4">

          <div className="mb-4 flex items-center gap-3">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-100">

              <UserRound
                size={20}
                className="text-gray-700"
              />

            </div>


            <div className="min-w-0">

              <p className="truncate font-medium text-gray-900">

                {currentUser?.full_name ||
                  currentUser?.name ||
                  currentUser?.email ||
                  "User"}

              </p>


              <p className="text-sm capitalize text-gray-500">

                {role || "user"}

              </p>

            </div>

          </div>


          {/* ======================================================
              LOGOUT
          ====================================================== */}

          <button
            onClick={logout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 py-2.5 text-red-600 transition hover:bg-red-50"
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