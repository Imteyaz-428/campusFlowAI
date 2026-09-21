import {
    LayoutDashboard,
    FileText,
    Bot,
    LogOut,
    X,
    ClipboardCheck,
    CreditCard,
    UserCircle,
  } from "lucide-react";
  
  import {
    useLocation,
    useNavigate,
  } from "react-router-dom";
  
  function ApplicantSidebar({
    mobileOpen,
    onClose,
  }) {
    const navigate = useNavigate();
    const location = useLocation();
  
    const menuItems = [
        {
          name: "Dashboard",
          path: "/applicant/dashboard",
          icon: LayoutDashboard,
        },
        {
          name: "My Application",
          path: "/applicant/application",
          icon: ClipboardCheck,
        },
        {
          name: "Documents",
          path: "/applicant/documents",
          icon: FileText,
        },
        {
          name: "Fees & Payments",
          path: "/applicant/fees",
          icon: CreditCard,
        },
        {
          name: "Profile",
          path: "/applicant/profile",
          icon: UserCircle,
        },
        {
          name: "AI Assistant",
          path: "/applicant/chat",
          icon: Bot,
        },
      ];
  
    const handleNavigate = (path) => {
      navigate(path);
  
      if (onClose) {
        onClose();
      }
    };
  
    const handleLogout = () => {
      localStorage.removeItem("applicant_token");
      localStorage.removeItem("applicant_application_number");
      localStorage.removeItem("applicant_organization_slug");
  
      navigate("/applicant/login", {
        replace: true,
      });
    };
  
    return (
      <>
        {/* ======================================================
            MOBILE OVERLAY
        ====================================================== */}
  
        {mobileOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            onClick={onClose}
          />
        )}
  
        {/* ======================================================
            SIDEBAR
        ====================================================== */}
  
        <aside
          className={`
            fixed inset-y-0 left-0 z-50
            flex w-64 flex-col
            border-r border-gray-200
            bg-white
            shadow-sm
  
            lg:relative
            lg:z-0
            lg:translate-x-0
  
            ${
              mobileOpen
                ? "translate-x-0"
                : "-translate-x-full"
            }
  
            transition-transform duration-300
          `}
        >
  
          {/* ====================================================
              BRAND
          ==================================================== */}
  
          <div className="flex h-20 shrink-0 items-center justify-between border-b border-gray-200 px-5">
  
            <div>
  
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                CampusFlow AI
              </p>
  
              <h1 className="text-lg font-bold text-gray-900">
                Applicant Portal
              </h1>
  
            </div>
  
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
            >
              <X size={20} />
            </button>
  
          </div>
  
  
          {/* ====================================================
              NAVIGATION
          ==================================================== */}
  
          <nav className="flex-1 p-3">
  
            <p className="mb-3 px-3 pt-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Portal
            </p>
  
            <div className="space-y-1">
  
              {menuItems.map((item) => {
  
                const Icon = item.icon;
  
                const active =
                  location.pathname === item.path;
  
                return (
                  <button
                    key={item.path}
                    type="button"
                    onClick={() =>
                      handleNavigate(item.path)
                    }
                    className={`
                      flex w-full items-center gap-3
                      rounded-xl px-3 py-3
                      text-sm font-medium
                      transition
  
                      ${
                        active
                          ? "bg-gray-900 text-white"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      }
                    `}
                  >
  
                    <Icon size={19} />
  
                    <span>
                      {item.name}
                    </span>
  
                  </button>
                );
  
              })}
  
            </div>
  
          </nav>
  
  
          {/* ====================================================
              BOTTOM
          ==================================================== */}
  
          <div className="border-t border-gray-200 p-3">
  
            <div className="mb-2 rounded-xl bg-gray-50 px-3 py-3">
  
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                Account Type
              </p>
  
              <p className="mt-1 text-sm font-semibold text-gray-900">
                Applicant
              </p>
  
            </div>
  
  
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-gray-600 transition hover:bg-red-50 hover:text-red-600"
            >
  
              <LogOut size={19} />
  
              <span>
                Logout
              </span>
  
            </button>
  
          </div>
  
        </aside>
      </>
    );
  }
  
  export default ApplicantSidebar;