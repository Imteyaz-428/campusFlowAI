import { useEffect, useState } from "react";

import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

import { me } from "../../services/auth";

function Layout({ children }) {
  const [currentUser, setCurrentUser] = useState(null);

  // Mobile sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await me();
        setCurrentUser(user);
      } catch (err) {
        console.log(err);
      }
    };

    loadUser();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <div className="flex">

        {/* Sidebar */}
        <Sidebar
          currentUser={currentUser}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-x-hidden p-4 md:p-6 lg:p-8">

          <div className="mx-auto max-w-7xl">
            {children}
          </div>

        </main>

      </div>

    </div>
  );
}

export default Layout;