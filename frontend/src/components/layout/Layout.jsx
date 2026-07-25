import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import { me } from "../../services/auth";

function Layout({ children }) {
  const [currentUser, setCurrentUser] = useState(null);

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
    <div className="h-screen flex bg-gray-100 overflow-hidden">
      <Sidebar currentUser={currentUser} />

      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
}

export default Layout;