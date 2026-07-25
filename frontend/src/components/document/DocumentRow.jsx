import { FileText, Trash2 } from "lucide-react";

function DocumentRow({
  document,
  onDelete,
}) {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) {
      return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition">

      <div className="flex items-center gap-4 min-w-0">

        <div className="bg-blue-50 rounded-lg p-2">

          <FileText
            size={22}
            className="text-blue-600"
          />

        </div>

        <div className="min-w-0">

          <h3 className="font-medium text-gray-900 truncate">
            {document.original_filename}
          </h3>

          <p className="text-sm text-gray-500 mt-1">
            {formatSize(document.file_size)}
            {" • "}
            {formatDate(document.uploaded_at)}
          </p>

        </div>

      </div>

      <div className="flex items-center gap-5">

        <span
          className={`flex items-center gap-2 text-sm font-medium ${
            document.status === "completed"
              ? "text-green-600"
              : "text-yellow-600"
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              document.status === "completed"
                ? "bg-green-500"
                : "bg-yellow-500"
            }`}
          />

          {document.status.charAt(0).toUpperCase() +
            document.status.slice(1)}
        </span>

        <button
          onClick={() => onDelete(document.id)}
          className="p-2 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition"
        >
          <Trash2 size={18} />
        </button>

      </div>

    </div>
  );
}

export default DocumentRow;