import { Routes, Route } from "react-router-dom";

import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import Dashboard from "../pages/Dashboard/Dashboard";
import Documents from "../pages/Documents/Documents";
import Chat from "../pages/Chat/Chat";
import Signup from "../pages/Signup/Signup";
import ProtectedRoute from "./ProtectedRoute";
import Users from "../pages/Users/Users";
import Upload from "../pages/Upload/Upload";
import Settings from "../pages/Settings/Settings";


function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/upload" element={<Upload />}/>
      <Route path="/documents" element={<Documents />} />
      <Route path="/chat" element={<Chat />} />
      <Route path="/signup" element={<Signup/>} />
      <Route path="/users" element={ <ProtectedRoute> <Users /> </ProtectedRoute> }/>
      <Route path="/users"element={<ProtectedRoute> <Users /> </ProtectedRoute> }/>
      <Route path="/settings" element={<Settings />}/>
    </Routes>
  );
}

export default AppRoutes;