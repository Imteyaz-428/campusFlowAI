import { useNavigate } from "react-router-dom";
import {
  Upload,
  MessageSquare,
  Users,
  ChevronRight,
} from "lucide-react";

function QuickActions({ isAdmin }) {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl border shadow-sm h-full">
      <div className="px-5 py-4 border-b">
        <h2 className="text-xl font-semibold text-gray-900">
          Quick Actions
        </h2>

        <p className="text-sm text-gray-500 mt-1">
          Frequently used actions
        </p>
      </div>

      <div className="p-4 space-y-3">

        <button
          onClick={() => navigate("/documents")}
          className="w-full flex items-center justify-between rounded-xl border p-4 hover:border-blue-500 hover:bg-blue-50 transition-all"
        >
          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <Upload
                size={18}
                className="text-blue-600"
              />
            </div>

            <div className="text-left">
              <p className="font-medium text-gray-900">
                Upload Document
              </p>

              <p className="text-xs text-gray-500">
                Add PDFs to your knowledge base
              </p>
            </div>

          </div>

          <ChevronRight
            size={18}
            className="text-gray-400"
          />
        </button>

        <button
          onClick={() => navigate("/chat")}
          className="w-full flex items-center justify-between rounded-xl border p-4 hover:border-purple-500 hover:bg-purple-50 transition-all"
        >
          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
              <MessageSquare
                size={18}
                className="text-purple-600"
              />
            </div>

            <div className="text-left">
              <p className="font-medium text-gray-900">
                Start AI Chat
              </p>

              <p className="text-xs text-gray-500">
                Ask questions about your documents
              </p>
            </div>

          </div>

          <ChevronRight
            size={18}
            className="text-gray-400"
          />
        </button>

        {isAdmin && (
          <button
            onClick={() => navigate("/users")}
            className="w-full flex items-center justify-between rounded-xl border p-4 hover:border-green-500 hover:bg-green-50 transition-all"
          >
            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <Users
                  size={18}
                  className="text-green-600"
                />
              </div>

              <div className="text-left">
                <p className="font-medium text-gray-900">
                  Manage Team
                </p>

                <p className="text-xs text-gray-500">
                  Invite and manage organization users
                </p>
              </div>

            </div>

            <ChevronRight
              size={18}
              className="text-gray-400"
            />
          </button>
        )}

      </div>
    </div>
  );
}

export default QuickActions;