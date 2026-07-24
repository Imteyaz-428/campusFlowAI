import { Routes, Route } from "react-router-dom";

import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import Dashboard from "../pages/Dashboard/Dashboard";
import Documents from "../pages/Documents/Documents";
import Chat from "../pages/Chat/Chat";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/documents" element={<Documents />} />
      <Route path="/chat" element={<Chat />} />
    </Routes>
  );
}

export default AppRoutes;