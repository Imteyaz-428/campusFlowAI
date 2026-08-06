import { useEffect, useState } from "react";

import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

import { me } from "../../services/auth";

function Layout({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
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

            {children}

          </div>

        </main>

      </div>

    </div>
  );
}

export default Layout;