import { useEffect, useMemo, useState } from "react";

import {
  Users as UsersIcon,
  Shield,
  GraduationCap,
  UserRound,
  Plus,
  Search,
  RefreshCw,
  Loader2,
  AlertCircle,
  X,
} from "lucide-react";

import Layout from "../../components/layout/Layout";

import UserTable from "../../components/users/UserTable";
import AddUserModal from "../../components/users/AddUserModal";
import EditUserModal from "../../components/users/EditUserModal";
import UserDetailsModal from "../../components/users/UserDetailsModal";

import {
  getUsers,
  getCurrentUser,
  createUser,
  updateUser,
  deleteUser,
} from "../../services/user";


// ================================================================
// ERROR MESSAGE HELPER
// ================================================================

const getErrorMessage = (
  error,
  fallback = "Something went wrong."
) => {
  const detail =
    error?.response?.data?.detail;

  if (Array.isArray(detail)) {
    return detail
      .map((item) => item?.msg || "Invalid value.")
      .join(", ");
  }

  if (typeof detail === "string") {
    return detail;
  }

  if (error?.message) {
    return error.message;
  }

  return fallback;
};


// ================================================================
// USERS PAGE
// ================================================================

function Users() {


  // STATE


  const [users, setUsers] = useState([]);

  const [currentUser, setCurrentUser] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [roleFilter, setRoleFilter] =
    useState("all");

  const [showAddModal, setShowAddModal] =
    useState(false);

  const [showEditModal, setShowEditModal] =
    useState(false);

  const [showDetailsModal, setShowDetailsModal] =
    useState(false);

  const [selectedUser, setSelectedUser] =
    useState(null);

  const [actionLoading, setActionLoading] =
    useState(false);



  // LOAD CURRENT USER


  const loadCurrentUser = async () => {
    try {
      const data = await getCurrentUser();

      setCurrentUser(data);

      return data;
    } catch (error) {
      throw error;
    }
  };



  // LOAD USERS


  const loadUsers = async (showRefresh = false) => {

    try {

      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const current = currentUser ||
        await loadCurrentUser();

      const role =
        String(current?.role || "")
          .toLowerCase();

      if (role !== "admin") {
        setUsers([]);
        return;
      }

      const data = await getUsers();

      setUsers(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (error) {

      console.error(
        "Failed to load users:",
        error
      );

      setError(
        getErrorMessage(
          error,
          "Unable to load users."
        )
      );

    } finally {

      setLoading(false);
      setRefreshing(false);

    }
  };



  // INITIAL LOAD


  useEffect(() => {
    loadUsers();
  }, []);



  // FILTER USERS


  const filteredUsers = useMemo(() => {

    const normalizedSearch =
      search.trim().toLowerCase();

    return users.filter((user) => {

      const matchesSearch =
        !normalizedSearch ||
        String(user.name || "")
          .toLowerCase()
          .includes(normalizedSearch) ||
        String(user.email || "")
          .toLowerCase()
          .includes(normalizedSearch) ||
        String(user.id || "")
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesRole =
        roleFilter === "all" ||
        String(user.role || "")
          .toLowerCase() === roleFilter;

      return (
        matchesSearch &&
        matchesRole
      );
    });

  }, [
    users,
    search,
    roleFilter,
  ]);



  // STATISTICS


  const statistics = useMemo(() => {

    const total = users.length;

    const admins = users.filter(
      (user) =>
        String(user.role || "")
          .toLowerCase() === "admin"
    ).length;

    const teachers = users.filter(
      (user) =>
        String(user.role || "")
          .toLowerCase() === "teacher"
    ).length;

    const students = users.filter(
      (user) =>
        String(user.role || "")
          .toLowerCase() === "student"
    ).length;

    return {
      total,
      admins,
      teachers,
      students,
    };

  }, [users]);



  // CREATE USER


  const handleCreateUser = async (data) => {

    try {

      setActionLoading(true);
      setError("");

      await createUser(data);

      await loadUsers(true);

      setShowAddModal(false);

    } catch (error) {

      console.error(
        "Failed to create user:",
        error
      );

      const message =
        getErrorMessage(
          error,
          "Unable to create user."
        );

      setError(message);

      throw error;

    } finally {

      setActionLoading(false);

    }
  };



  // UPDATE USER


  const handleUpdateUser = async (
    userId,
    data
  ) => {

    try {

      setActionLoading(true);
      setError("");

      await updateUser(
        userId,
        data
      );

      await loadUsers(true);

      setSelectedUser(null);
      setShowEditModal(false);

    } catch (error) {

      console.error(
        "Failed to update user:",
        error
      );

      const message =
        getErrorMessage(
          error,
          "Unable to update user."
        );

      setError(message);

      throw error;

    } finally {

      setActionLoading(false);

    }
  };



  // DELETE USER


  const handleDeleteUser = async (user) => {

    if (!user) {
      return;
    }

    if (
      Number(user.id) ===
      Number(currentUser?.id)
    ) {
      setError(
        "You cannot delete your own account."
      );

      return;
    }

    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${user.name}"?\n\nThis action cannot be undone.`
      );

    if (!confirmed) {
      return;
    }

    try {

      setActionLoading(true);
      setError("");

      await deleteUser(user.id);

      await loadUsers(true);

    } catch (error) {

      console.error(
        "Failed to delete user:",
        error
      );

      setError(
        getErrorMessage(
          error,
          "Unable to delete user."
        )
      );

    } finally {

      setActionLoading(false);

    }
  };



  // VIEW USER


  const handleViewUser = (user) => {

    setSelectedUser(user);
    setShowDetailsModal(true);

  };



  // EDIT USER


  const handleEditUser = (user) => {

    setSelectedUser(user);
    setShowEditModal(true);

  };



  // CLOSE MODALS


  const closeDetailsModal = () => {

    setShowDetailsModal(false);
    setSelectedUser(null);

  };


  const closeEditModal = () => {

    setShowEditModal(false);
    setSelectedUser(null);

  };



  // CLEAR ERROR


  const clearError = () => {
    setError("");
  };



  // LOADING SCREEN


  if (loading) {

    return (
      <Layout>

        <div className="flex min-h-[70vh] items-center justify-center">

          <div className="text-center">

            <Loader2
              size={32}
              className="mx-auto animate-spin text-gray-400"
            />

            <p className="mt-3 text-sm font-medium text-gray-500">
              Loading users...
            </p>

          </div>

        </div>

      </Layout>
    );
  }



  // ACCESS DENIED


  const currentRole =
    String(currentUser?.role || "")
      .toLowerCase();

  if (currentRole !== "admin") {

    return (
      <Layout>

        <div className="flex min-h-[70vh] items-center justify-center p-6">

          <div className="max-w-md rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">

            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">

              <Shield
                size={26}
                className="text-red-500"
              />

            </div>

            <h2 className="text-xl font-bold text-gray-900">
              Access Denied
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Only administrators can access user
              management.
            </p>

          </div>

        </div>

      </Layout>
    );
  }



  // MAIN PAGE


  return (
    <Layout>

      <div className="space-y-6 p-4 md:p-6 lg:p-8">

        {/* ========================================================
            PAGE HEADER
        ======================================================== */}

        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

          <div>

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900">

                <UsersIcon
                  size={21}
                  className="text-white"
                />

              </div>

              <div>

                <h1 className="text-2xl font-bold text-gray-900">
                  Users
                </h1>

                <p className="mt-0.5 text-sm text-gray-500">
                  Manage campus accounts and access
                </p>

              </div>

            </div>

          </div>

          <button
            type="button"
            onClick={() => {
              setError("");
              setShowAddModal(true);
            }}
            className="flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800"
          >
            <Plus size={18} />
            Add User
          </button>

        </div>


        {/* ========================================================
            ERROR
        ======================================================== */}

        {error && (

          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">

            <AlertCircle
              size={19}
              className="mt-0.5 shrink-0 text-red-500"
            />

            <div className="min-w-0 flex-1">

              <p className="text-sm font-medium text-red-800">
                {error}
              </p>

            </div>

            <button
              type="button"
              onClick={clearError}
              className="rounded-lg p-1 text-red-500 hover:bg-red-100"
            >
              <X size={17} />
            </button>

          </div>

        )}


        {/* ========================================================
            STATISTICS
        ======================================================== */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          {/* TOTAL */}

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm font-medium text-gray-500">
                  Total Users
                </p>

                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {statistics.total}
                </p>

              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100">

                <UsersIcon
                  size={21}
                  className="text-gray-700"
                />

              </div>

            </div>

          </div>


          {/* ADMINS */}

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm font-medium text-gray-500">
                  Admins
                </p>

                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {statistics.admins}
                </p>

              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50">

                <Shield
                  size={21}
                  className="text-purple-600"
                />

              </div>

            </div>

          </div>


          {/* TEACHERS */}

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm font-medium text-gray-500">
                  Teachers
                </p>

                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {statistics.teachers}
                </p>

              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">

                <GraduationCap
                  size={21}
                  className="text-blue-600"
                />

              </div>

            </div>

          </div>


          {/* STUDENTS */}

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm font-medium text-gray-500">
                  Students
                </p>

                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {statistics.students}
                </p>

              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50">

                <UserRound
                  size={21}
                  className="text-green-600"
                />

              </div>

            </div>

          </div>

        </div>


        {/* ========================================================
            SEARCH + FILTER
        ======================================================== */}

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">

          <div className="flex flex-col gap-3 lg:flex-row">

            {/* SEARCH */}

            <div className="relative flex-1">

              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search by name, email, or user ID..."
                className="w-full rounded-xl border border-gray-200 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
              />

            </div>


            {/* ROLE FILTER */}

            <select
              value={roleFilter}
              onChange={(event) =>
                setRoleFilter(event.target.value)
              }
              className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 lg:w-48"
            >

              <option value="all">
                All Roles
              </option>

              <option value="admin">
                Admins
              </option>

              <option value="teacher">
                Teachers
              </option>

              <option value="student">
                Students
              </option>

            </select>


            {/* REFRESH */}

            <button
              type="button"
              onClick={() => loadUsers(true)}
              disabled={refreshing}
              title="Refresh users"
              className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >

              <RefreshCw
                size={17}
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />

              <span className="hidden sm:inline">
                Refresh
              </span>

            </button>

          </div>

          {/* RESULT COUNT */}

          <div className="mt-3 flex items-center justify-between">

            <p className="text-xs text-gray-500">

              Showing{" "}

              <span className="font-semibold text-gray-700">
                {filteredUsers.length}
              </span>

              {" "}of{" "}

              <span className="font-semibold text-gray-700">
                {users.length}
              </span>

              {" "}users

            </p>

            {(search || roleFilter !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setRoleFilter("all");
                }}
                className="text-xs font-medium text-gray-600 hover:text-gray-900"
              >
                Clear filters
              </button>
            )}

          </div>

        </div>


        {/* ========================================================
            USER TABLE
        ======================================================== */}

        <UserTable
          users={filteredUsers}
          currentUserId={currentUser?.id}
          onView={handleViewUser}
          onEdit={handleEditUser}
          onDelete={handleDeleteUser}
        />


        {/* ========================================================
            MODALS
        ======================================================== */}

        <AddUserModal
          isOpen={showAddModal}
          onClose={() =>
            setShowAddModal(false)
          }
          onCreate={handleCreateUser}
        />

        <EditUserModal
          isOpen={showEditModal}
          onClose={closeEditModal}
          user={selectedUser}
          onUpdate={handleUpdateUser}
        />

        <UserDetailsModal
          isOpen={showDetailsModal}
          onClose={closeDetailsModal}
          user={selectedUser}
        />


        {/* ========================================================
            GLOBAL ACTION LOADING
        ======================================================== */}

        {actionLoading && (
          <div className="pointer-events-none fixed bottom-6 right-6 z-[120]">

            <div className="flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-sm font-medium text-white shadow-xl">

              <Loader2
                size={17}
                className="animate-spin"
              />

              Processing...

            </div>

          </div>
        )}

      </div>

    </Layout>
  );
}

export default Users;