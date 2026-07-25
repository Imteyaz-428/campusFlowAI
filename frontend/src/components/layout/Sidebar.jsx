import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <div className="w-64 h-screen bg-gray-900 text-white p-5">
      <h1 className="text-2xl font-bold mb-8">
        Enterprise RAG
      </h1>

      <div className="flex flex-col gap-4">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/documents">Documents</Link>
        <Link to="/chat">Chat</Link>
      </div>
    </div>
  );
}

export default Sidebar;