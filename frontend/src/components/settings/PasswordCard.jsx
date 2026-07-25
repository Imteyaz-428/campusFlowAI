import { useState } from "react";
import { Lock, KeyRound } from "lucide-react";
import { changePassword } from "../../services/user";

function PasswordCard() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [isChanging, setIsChanging] = useState(false);

  const resetForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleCancel = () => {
    resetForm();
    setIsChanging(false);
  };

  const handleUpdatePassword = async () => {
    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      alert("Please fill all fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      await changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });

      alert("Password updated successfully.");

      resetForm();
      setIsChanging(false);
    } catch (err) {
      console.error(err);

      alert(
        err.response?.data?.detail ||
          "Failed to update password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">

      <div className="flex items-center justify-between border-b px-6 py-5">

        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-red-100 p-2">
            <Lock
              size={20}
              className="text-red-600"
            />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Change Password
            </h2>

            <p className="text-sm text-gray-500">
              Update your account password.
            </p>
          </div>
        </div>

        {!isChanging && (
          <button
            onClick={() => setIsChanging(true)}
            className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-gray-50"
          >
            <KeyRound size={16} />
            Change Password
          </button>
        )}

      </div>

      {isChanging && (
        <div className="space-y-6 p-6">

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Current Password
            </label>

            <input
              type="password"
              value={currentPassword}
              onChange={(e) =>
                setCurrentPassword(e.target.value)
              }
              placeholder="Enter current password"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              New Password
            </label>

            <input
              type="password"
              value={newPassword}
              onChange={(e) =>
                setNewPassword(e.target.value)
              }
              placeholder="Enter new password"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Confirm Password
            </label>

            <input
              type="password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
              placeholder="Confirm new password"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="flex justify-end gap-3">

            <button
              onClick={handleCancel}
              className="rounded-xl border border-gray-300 px-6 py-3 font-medium transition hover:bg-gray-100"
            >
              Cancel
            </button>

            <button
              onClick={handleUpdatePassword}
              disabled={loading}
              className="rounded-xl bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Updating..."
                : "Update Password"}
            </button>

          </div>

        </div>
      )}

    </div>
  );
}

export default PasswordCard;