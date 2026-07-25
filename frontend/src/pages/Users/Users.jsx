import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import Layout from "../../components/layout/Layout";
import UserTable from "../../components/users/UserTable";
import AddUserModal from "../../components/users/AddUserModal";

import {
  getUsers,
  createUser,
  deleteUser,
} from "../../services/user";

import { me } from "../../services/auth";

function Users() {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      toast.error("Failed to load users");
    }
  };

  const loadCurrentUser = async () => {
    try {
      
      const user = await me();
      setCurrentUser(user);

      if (user.role === "admin") {
        await loadUsers();
      }
    } catch (err) {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const handleCreate = async (form) => {
    try {
      await createUser(form);
      toast.success("User created");
      loadUsers();
    } catch (err) {
      toast.error("Failed to create user");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user?")) {
      return;
    }

    try {
      await deleteUser(id);
      toast.success("User deleted");
      loadUsers();
    } catch (err) {
      toast.error("Failed to delete user");
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-20">
          Loading...
        </div>
      </Layout>
    );
  }

  if (currentUser?.role !== "admin") {
    return (
      <Layout>
        <div className="bg-white rounded-xl shadow p-10 text-center">

          <h2 className="text-2xl font-bold mb-3">
            Access Denied
          </h2>

          <p className="text-gray-500">
            Only organization administrators can manage team members.
          </p>

        </div>
      </Layout>
    );
  }

  return (
    <Layout>

      <div className="flex items-center justify-between mb-8">

        <div>

          <h1 className="text-3xl font-bold">
            Team Members
          </h1>

          <p className="text-gray-500 mt-2">
            Manage users in your organization.
          </p>

        </div>

        <button
          onClick={() => setOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg"
        >
          Add User
        </button>

      </div>

      <UserTable
        users={users}
        currentUserId={currentUser.id}
        isAdmin={true}
        onDelete={handleDelete}
      />

      <AddUserModal
        open={open}
        onClose={() => setOpen(false)}
        onCreate={handleCreate}
      />

    </Layout>
  );
}

export default Users;