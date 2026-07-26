import { FileText } from "lucide-react";

function CitationList({ citations }) {
  if (!citations?.length) {
    return null;
  }

  return (
    <div className="mt-4 border-t border-gray-200 pt-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
        Sources
      </p>

      <div className="flex flex-col gap-2">
      {citations.slice(0, 2).map((citation, index) => (
          <div
            key={index}
            className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700"
          >
            <FileText size={16} className="text-gray-500" />

            <span className="truncate font-medium">
              {citation.document}
            </span>

            <span className="text-gray-400">•</span>

            <span className="text-gray-500">
              Chunk {citation.chunk_index}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CitationList;