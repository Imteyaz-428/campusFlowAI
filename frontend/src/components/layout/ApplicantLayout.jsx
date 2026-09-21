import { useState } from "react";
import { Menu } from "lucide-react";

import ApplicantSidebar from "./ApplicantSidebar";

function ApplicantLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* ======================================================
          DESKTOP / MOBILE SIDEBAR
      ====================================================== */}

      <ApplicantSidebar
        mobileOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* ======================================================
          MAIN AREA
      ====================================================== */}

      <div className="flex min-w-0 flex-1 flex-col">

        {/* Mobile Header */}

        <div className="flex h-16 shrink-0 items-center border-b border-gray-200 bg-white px-4 lg:hidden">

          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
          >
            <Menu size={22} />
          </button>

          <div className="ml-3">

            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              CampusFlow AI
            </p>

            <p className="text-sm font-bold text-gray-900">
              Applicant Portal
            </p>

          </div>

        </div>

        {/* Page */}

        <main className="min-w-0 flex-1 p-4 md:p-6">
          {children}
        </main>

      </div>

    </div>
  );
}

export default ApplicantLayout;