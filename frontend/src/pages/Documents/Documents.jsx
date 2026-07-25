import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import toast from "react-hot-toast";

import Layout from "../../components/layout/Layout";
import PageHeader from "../../components/common/PageHeader";
import UploadBox from "../../components/document/UploadBox";
import DocumentTable from "../../components/document/DocumentTable";

import {
  getDocuments,
  deleteDocument,
} from "../../services/document";

function Documents() {
  const [documents, setDocuments] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);

  const documentsPerPage = 8;

  const loadDocuments = async () => {
    try {
      const data = await getDocuments();
      setDocuments(data);
    } catch (err) {
      toast.error("Failed to load documents");
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this document?")) {
      return;
    }

    try {
      await deleteDocument(id);
      toast.success("Document deleted");
      loadDocuments();
    } catch (err) {
      toast.error("Failed to delete document");
    }
  };

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const matchSearch =
        doc.original_filename
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        doc.title
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchStatus =
        status === "all" ||
        doc.status === status;

      return matchSearch && matchStatus;
    });
  }, [documents, search, status]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, status]);

  const totalPages = Math.ceil(
    filteredDocuments.length / documentsPerPage
  );

  const startIndex =
    (currentPage - 1) * documentsPerPage;

  const paginatedDocuments =
    filteredDocuments.slice(
      startIndex,
      startIndex + documentsPerPage
    );

  return (
    <Layout>
      <PageHeader
        title="Documents"
        subtitle="Manage your organization's knowledge base."
       
      />

      <div className="bg-white border rounded-xl shadow-sm p-5 mb-6">

        <div className="grid md:grid-cols-2 gap-4">

          <div className="relative">

            <Search
              size={18}
              className="absolute left-3 top-3.5 text-gray-400"
            />

            <input
              type="text"
              placeholder="Search documents..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="w-full rounded-lg border pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

          </div>

          <select
            value={status}
            onChange={(e) =>
              setStatus(e.target.value)
            }
            className="rounded-lg border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">
              All Status
            </option>

            <option value="completed">
              Completed
            </option>

            <option value="processing">
              Processing
            </option>
          </select>

        </div>

      </div>

      <DocumentTable
        documents={paginatedDocuments}
        totalDocuments={filteredDocuments.length}
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
        onDelete={handleDelete}
      />

    </Layout>
  );
}

export default Documents;