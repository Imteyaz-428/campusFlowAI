import { FileText } from "lucide-react";

function EmptyState() {
  return (
    <div className="bg-white rounded-xl shadow p-10 text-center">

      <FileText
        size={60}
        className="mx-auto text-gray-400 mb-4"
      />

      <h2 className="text-2xl font-semibold mb-2">
        No Documents Found
      </h2>

      <p className="text-gray-500">
        Upload your first PDF to start chatting with your documents.
      </p>

    </div>
  );
}

export default EmptyState;