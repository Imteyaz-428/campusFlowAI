import { useState } from "react";
import { Upload } from "lucide-react";
import toast from "react-hot-toast";
import { uploadDocument } from "../../services/document";

function UploadBox({ onUpload }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) {
      toast.error("Select a PDF first");
      return;
    }

    try {
      setLoading(true);

      await uploadDocument(file);

      toast.success("Document uploaded");

      setFile(null);

      onUpload();
    } catch (err) {
      toast.error(
        err.response?.data?.detail ||
          "Upload failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">

      <label className="cursor-pointer">

        <input
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={(e) =>
            setFile(e.target.files[0])
          }
        />

        <span className="border rounded-lg px-4 py-2 hover:bg-gray-50">
          {file ? file.name : "Choose PDF"}
        </span>

      </label>

      <button
        onClick={handleUpload}
        disabled={loading}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
      >
        <Upload size={18} />

        {loading ? "Uploading..." : "Upload"}
      </button>

    </div>
  );
}

export default UploadBox;