import { useEffect, useState } from "react";
import {
  X,
  UserPlus,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";

function AddUserModal({
  isOpen,
  onClose,
  onCreate,
}) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "teacher",

    program: "",
    department: "",
    academic_year: "",
    semester: "",
    phone: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // ==========================================================
  // RESET FORM
  // ==========================================================

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "teacher",

        program: "",
        department: "",
        academic_year: "",
        semester: "",
        phone: "",
      });

      setShowPassword(false);
      setLoading(false);
    }
  }, [isOpen]);

  // ==========================================================
  // INPUT CHANGE
  // ==========================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ==========================================================
  // SUBMIT
  // ==========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    const name = formData.name.trim();
    const email = formData.email.trim();
    const password = formData.password;

    if (!name) {
      alert("Please enter the user's name.");
      return;
    }

    if (!email) {
      alert("Please enter the user's email.");
      return;
    }

    if (!password) {
      alert("Please enter a password.");
      return;
    }

    if (password.length < 8) {
      alert("Password must contain at least 8 characters.");
      return;
    }

    if (formData.role === "student" && !formData.program.trim()) {
      alert("Program is required when creating a student.");
      return;
    }

    const payload = {
      name,
      email,
      password,
      role: formData.role,
    };

    // --------------------------------------------------------
    // STUDENT-SPECIFIC FIELDS
    // --------------------------------------------------------

    if (formData.role === "student") {
      payload.program = formData.program.trim();

      if (formData.department.trim()) {
        payload.department = formData.department.trim();
      }

      if (formData.academic_year.trim()) {
        payload.academic_year =
          formData.academic_year.trim();
      }

      if (formData.semester.trim()) {
        payload.semester =
          formData.semester.trim();
      }

      if (formData.phone.trim()) {
        payload.phone =
          formData.phone.trim();
      }
    }

    try {
      setLoading(true);

      await onCreate(payload);

      onClose();
    } catch (error) {
      // Error is handled by parent.
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // DON'T RENDER
  // ==========================================================

  if (!isOpen) {
    return null;
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">

        {/* ====================================================
            HEADER
        ==================================================== */}

        <div className="flex items-center justify-between border-b px-6 py-5">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-900">
              <UserPlus
                size={20}
                className="text-white"
              />
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Add User
              </h2>

              <p className="text-sm text-gray-500">
                Create a new campus account
              </p>
            </div>

          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
          >
            <X size={20} />
          </button>

        </div>

        {/* ====================================================
            FORM
        ==================================================== */}

        <form
          onSubmit={handleSubmit}
          className="max-h-[75vh] overflow-y-auto"
        >

          <div className="space-y-6 p-6">

            {/* ==================================================
                BASIC INFORMATION
            ================================================== */}

            <div>

              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
                Account Information
              </h3>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                {/* NAME */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Full Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter full name"
                    autoComplete="name"
                    disabled={loading}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
                  />
                </div>

                {/* EMAIL */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Email
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter email address"
                    autoComplete="email"
                    disabled={loading}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
                  />
                </div>

                {/* PASSWORD */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Password
                  </label>

                  <div className="relative">

                    <input
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Minimum 8 characters"
                      autoComplete="new-password"
                      disabled={loading}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 pr-12 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (previous) => !previous
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>

                  </div>
                </div>

                {/* ROLE */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Role
                  </label>

                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
                  >
                    <option value="teacher">
                      Teacher
                    </option>

                    <option value="admin">
                      Admin
                    </option>

                    <option value="student">
                      Student
                    </option>
                  </select>
                </div>

              </div>

            </div>

            {/* ==================================================
                STUDENT INFORMATION
            ================================================== */}

            {formData.role === "student" && (
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">

                <div className="mb-4">

                  <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700">
                    Student Information
                  </h3>

                  <p className="mt-1 text-xs text-gray-500">
                    These details are used to create the student's
                    Student and Admission records.
                  </p>

                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                  {/* PROGRAM */}

                  <div className="md:col-span-2">

                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Program
                      <span className="ml-1 text-red-500">
                        *
                      </span>
                    </label>

                    <input
                      type="text"
                      name="program"
                      value={formData.program}
                      onChange={handleChange}
                      placeholder="e.g. B.Tech Artificial Intelligence"
                      disabled={loading}
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
                    />

                  </div>

                  {/* DEPARTMENT */}

                  <div>

                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Department
                    </label>

                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      placeholder="e.g. CSE"
                      disabled={loading}
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
                    />

                  </div>

                  {/* ACADEMIC YEAR */}

                  <div>

                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Academic Year
                    </label>

                    <input
                      type="text"
                      name="academic_year"
                      value={formData.academic_year}
                      onChange={handleChange}
                      placeholder="e.g. 2026-27"
                      disabled={loading}
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
                    />

                  </div>

                  {/* SEMESTER */}

                  <div>

                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Semester
                    </label>

                    <input
                      type="text"
                      name="semester"
                      value={formData.semester}
                      onChange={handleChange}
                      placeholder="e.g. 1"
                      disabled={loading}
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
                    />

                  </div>

                  {/* PHONE */}

                  <div>

                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Phone
                    </label>

                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter phone number"
                      autoComplete="tel"
                      disabled={loading}
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
                    />

                  </div>

                </div>

              </div>
            )}

          </div>

          {/* ====================================================
              FOOTER
          ==================================================== */}

          <div className="flex justify-end gap-3 border-t bg-gray-50 px-6 py-4">

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
            >

              {loading && (
                <Loader2
                  size={17}
                  className="animate-spin"
                />
              )}

              {loading
                ? "Creating..."
                : "Create User"}

            </button>

          </div>

        </form>

      </div>
    </div>
  );
}

export default AddUserModal;