import { useEffect, useState } from "react";
import { User, Pencil } from "lucide-react";
import {
  getCurrentUser,
  updateUser,
} from "../../services/user";

function ProfileCard() {
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const data = await getCurrentUser();

      setUser(data);
      setName(data.name);
    } catch (err) {
      console.error(err);
      alert("Failed to load profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      alert("Name is required.");
      return;
    }

    try {
      setSaving(true);

      const updatedUser = await updateUser(user.id, {
        name,
      });

      setUser(updatedUser);
      setName(updatedUser.name);

      alert("Profile updated successfully.");

      setIsEditing(false);
    } catch (err) {
      console.error(err);

      alert(
        err.response?.data?.detail ||
          "Failed to update profile."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setName(user.name);
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-blue-100 p-2">
            <User
              size={20}
              className="text-blue-600"
            />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Profile Information
            </h2>

            <p className="text-sm text-gray-500">
              Update your personal information.
            </p>
          </div>
        </div>

        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            <Pencil size={16} />
            Edit Profile
          </button>
        )}
      </div>

      <div className="space-y-6 p-6">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Full Name
          </label>

          {isEditing ? (
            <input
              type="text"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          ) : (
            <div className="rounded-xl bg-gray-50 px-4 py-3 text-gray-900">
              {user.name}
            </div>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Email Address
          </label>

          <div className="rounded-xl bg-gray-100 px-4 py-3 text-gray-500">
            {user.email}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Role
          </label>

          <div className="rounded-xl bg-gray-100 px-4 py-3 text-gray-500">
            {user.role.charAt(0).toUpperCase() +
              user.role.slice(1)}
          </div>
        </div>

        {isEditing && (
          <div className="flex justify-end gap-3">
            <button
              onClick={handleCancel}
              className="rounded-xl border border-gray-300 px-6 py-3 font-medium hover:bg-gray-100"
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-xl bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {saving
                ? "Saving..."
                : "Save Changes"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfileCard;