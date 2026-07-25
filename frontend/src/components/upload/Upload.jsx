import { useRef, useState } from "react";
import {
  UploadCloud,
  FileText,
  X,
  Loader2,
} from "lucide-react";

import { uploadDocument } from "../../services/document";

function UploadCard() {
  const [files, setFiles] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);

  const inputRef = useRef(null);

  const addFiles = (selectedFiles) => {
    const pdfFiles = Array.from(selectedFiles).filter(
      (file) => file.type === "application/pdf"
    );

    setFiles((prev) => [...prev, ...pdfFiles]);
  };

  const handleChoose = (e) => {
    addFiles(e.target.files);
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);

    addFiles(e.dataTransfer.files);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    try {
      setLoading(true);

      for (const file of files) {
        await uploadDocument(file);
      }

      alert("Documents uploaded successfully.");

      setFiles([]);
    } catch (err) {
      console.error(err);

      alert(
        err.response?.data?.detail ||
          "Failed to upload documents."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        multiple
        hidden
        onChange={handleChoose}
      />

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`rounded-2xl border-2 border-dashed p-12 transition ${
          dragging
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 bg-white"
        }`}
      >
        <div className="flex flex-col items-center">
          <div className="mb-6 rounded-full bg-blue-50 p-5">
            <UploadCloud
              size={44}
              className="text-blue-600"
            />
          </div>

          <h2 className="text-2xl font-semibold">
            Drag & Drop PDF Files
          </h2>

          <p className="mt-3 max-w-lg text-center text-gray-500">
            Drag one or more PDF documents here or choose
            them from your computer.
          </p>

          <button
            type="button"
            disabled={loading}
            onClick={() => inputRef.current.click()}
            className="mt-8 rounded-xl bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Choose PDF
          </button>

          <p className="mt-4 text-sm text-gray-400">
            PDF only • Maximum 10 MB per file
          </p>
        </div>
      </div>

      {files.length > 0 && (
        <div className="rounded-2xl border bg-white shadow-sm">
          <div className="border-b px-6 py-4">
            <h3 className="text-lg font-semibold">
              Selected Files
            </h3>
          </div>

          <div className="divide-y">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between px-6 py-4"
              >
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-red-50 p-3">
                    <FileText
                      size={22}
                      className="text-red-600"
                    />
                  </div>

                  <div>
                    <p className="font-medium">
                      {file.name}
                    </p>

                    <p className="text-sm text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={loading}
                  onClick={() => removeFile(index)}
                  className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <X size={18} />
                </button>
              </div>
            ))}
          </div>

          <div className="flex justify-end border-t px-6 py-5">
            <button
              type="button"
              disabled={loading}
              onClick={handleUpload}
              className="flex items-center gap-2 rounded-xl bg-green-600 px-6 py-3 font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading && (
                <Loader2
                  size={18}
                  className="animate-spin"
                />
              )}

              {loading
                ? "Uploading..."
                : "Upload Documents"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default UploadCard;