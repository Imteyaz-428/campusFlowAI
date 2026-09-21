import { useEffect, useState } from "react";
import {
  X,
  Pencil,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";

function EditUserModal({
  isOpen,
  onClose,
  user,
  onUpdate,
}) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);


  // LOAD USER


  useEffect(() => {
    if (isOpen && user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        password: "",
      });

      setShowPassword(false);
      setLoading(false);
    }
  }, [isOpen, user]);


  // INPUT CHANGE


  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };


  // SUBMIT


  const handleSubmit = async (event) => {
    event.preventDefault();

    const name = formData.name.trim();
    const email = formData.email.trim();

    if (!name) {
      alert("Name is required.");
      return;
    }

    if (!email) {
      alert("Email is required.");
      return;
    }

    if (
      formData.password &&
      formData.password.length < 8
    ) {
      alert(
        "New password must contain at least 8 characters."
      );
      return;
    }

    const payload = {
      name,
      email,
    };

    // Password is optional.
    if (formData.password) {
      payload.password = formData.password;
    }

    try {
      setLoading(true);

      await onUpdate(user.id, payload);

      onClose();
    } catch (error) {
      // Error is handled by parent.
    } finally {
      setLoading(false);
    }
  };


  // DON'T RENDER


  if (!isOpen || !user) {
    return null;
  }


  // RENDER


  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">

      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">

        {/* ====================================================
            HEADER
        ==================================================== */}

        <div className="flex items-center justify-between border-b px-6 py-5">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-900">
              <Pencil
                size={18}
                className="text-white"
              />
            </div>

            <div>

              <h2 className="text-lg font-bold text-gray-900">
                Edit User
              </h2>

              <p className="text-sm text-gray-500">
                Update account information
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

        <form onSubmit={handleSubmit}>

          <div className="space-y-5 p-6">

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
                disabled={loading}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
              />

            </div>

            {/* ROLE - READ ONLY */}

            <div>

              <label className="mb-2 block text-sm font-medium text-gray-700">
                Role
              </label>

              <input
                type="text"
                value={
                  user.role
                    ? String(user.role)
                        .charAt(0)
                        .toUpperCase() +
                      String(user.role).slice(1)
                    : "—"
                }
                disabled
                className="w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm text-gray-500"
              />

              <p className="mt-1.5 text-xs text-gray-500">
                Role changes require a dedicated administrative
                workflow.
              </p>

            </div>

            {/* PASSWORD */}

            <div>

              <label className="mb-2 block text-sm font-medium text-gray-700">
                New Password
                <span className="ml-1 font-normal text-gray-400">
                  (optional)
                </span>
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
                  placeholder="Leave empty to keep current password"
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

          </div>

          {/* ==================================================
              FOOTER
          ================================================== */}

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
                ? "Saving..."
                : "Save Changes"}

            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default EditUserModal;