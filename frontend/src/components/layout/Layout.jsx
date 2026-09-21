import { useState } from "react";

import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

import { useAuth } from "../../context/AuthContext";

function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const {
    user: currentUser,
    loading,
  } = useAuth();

  return (
    <div className="h-screen bg-gray-100">

      {/* Sticky Navbar */}
      <Navbar
        currentUser={currentUser}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Body */}
      <div className="flex h-[calc(100vh-64px)]">

        {/* Sidebar */}
        <Sidebar
          currentUser={currentUser}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">

          <div className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8">

            {loading ? (
              <div className="flex min-h-[60vh] items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900" />

                  <p className="text-sm text-gray-500">
                    Loading CampusFlow...
                  </p>
                </div>
              </div>
            ) : (
              children
            )}

          </div>

        </main>

      </div>

    </div>
  );
}

export default Layout;