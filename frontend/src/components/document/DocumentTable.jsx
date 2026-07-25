import DocumentRow from "./DocumentRow";
import EmptyState from "./EmptyState";

function DocumentTable({
  documents,
  totalDocuments,
  currentPage,
  totalPages,
  setCurrentPage,
  onDelete,
}) {
  if (totalDocuments === 0) {
    return <EmptyState />;
  }

  const start =
    (currentPage - 1) * 8 + 1;

  const end =
    start + documents.length - 1;

  return (
    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">

      <div className="flex items-center justify-between px-6 py-5 border-b">

        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            {totalDocuments} Documents
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Showing {start}–{end} of {totalDocuments}
          </p>
        </div>

      </div>

      <div className="divide-y">

        {documents.map((document) => (
          <DocumentRow
            key={document.id}
            document={document}
            onDelete={onDelete}
          />
        ))}

      </div>

      {totalPages > 1 && (

        <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">

          <button
            onClick={() =>
              setCurrentPage(currentPage - 1)
            }
            disabled={currentPage === 1}
            className="px-4 py-2 border rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <span className="text-sm text-gray-500">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() =>
              setCurrentPage(currentPage + 1)
            }
            disabled={currentPage === totalPages}
            className="px-4 py-2 border rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next
          </button>

        </div>

      )}

    </div>
  );
}

export default DocumentTable;