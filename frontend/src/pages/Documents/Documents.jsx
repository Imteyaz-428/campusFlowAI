import { useState } from "react";
import toast from "react-hot-toast";

import Layout from "../../components/layout/Layout";
import { uploadDocument } from "../../services/document";

function Documents() {
  const [file, setFile] = useState(null);

  const handleUpload = async () => {
    if (!file) {
      toast.error("Select a PDF first.");
      return;
    }

    try {
      await uploadDocument(file);

      toast.success("Document uploaded successfully.");

      setFile(null);
    } catch (err) {
      toast.error(
        err.response?.data?.detail || "Upload failed."
      );
    }
  };

  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-8">
        Documents
      </h1>

      <div className="bg-white rounded-xl shadow p-6 max-w-2xl">

        <input
          type="file"
          accept=".pdf"
          onChange={(e) => setFile(e.target.files[0])}
          className="mb-4"
        />

        <button
          onClick={handleUpload}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg"
        >
          Upload
        </button>

      </div>
    </Layout>
  );
}

export default Documents;