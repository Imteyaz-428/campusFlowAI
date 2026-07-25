import { useNavigate } from "react-router-dom";
import { removeToken } from "../../utils/token";

function Navbar() {
  const navigate = useNavigate();

  const logout = () => {
    removeToken();
    navigate("/");
  };

  return (
    <div className="h-16 border-b flex justify-between items-center px-6">
      <h2 className="text-xl font-semibold">
        Enterprise RAG Platform
      </h2>

      <button
        onClick={logout}
        className="bg-red-500 text-white px-4 py-2 rounded"
      >
        Logout
      </button>
    </div>
  );
}

export default Navbar;