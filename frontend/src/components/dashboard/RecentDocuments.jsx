import { FileText, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

function RecentDocuments({ documents }) {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="bg-white rounded-xl border shadow-sm h-full">
      <div className="flex items-center justify-between px-6 py-5 border-b">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Recent Documents
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Your latest uploaded files
          </p>
        </div>

        <Link
          to="/documents"
          className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          View All
          <ArrowRight size={16} />
        </Link>
      </div>

      {documents.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-gray-500">
          No documents uploaded yet.
        </div>
      ) : (
        <div className="divide-y">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50">
                  <FileText
                    size={20}
                    className="text-blue-600"
                  />
                </div>

                <div className="min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {doc.original_filename}
                  </p>

                  <p className="text-sm text-gray-500">
                    {formatDate(doc.uploaded_at)}
                  </p>
                </div>
              </div>

              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                  doc.status === "completed"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {doc.status.charAt(0).toUpperCase() +
                  doc.status.slice(1)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RecentDocuments;