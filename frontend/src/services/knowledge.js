import api from "./api";


// COLLEGE KNOWLEDGE BASE


// Get all organization knowledge documents
export const getKnowledgeDocuments = async () => {
  const response = await api.get("/admin/knowledge");
  return response.data;
};


// Upload a college knowledge document
export const uploadKnowledgeDocument = async (file) => {
  const formData = new FormData();

  formData.append("file", file);

  const response = await api.post(
    "/admin/knowledge/upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};


// Delete a college knowledge document
export const deleteKnowledgeDocument = async (
  documentId
) => {
  const response = await api.delete(
    `/admin/knowledge/${documentId}`
  );

  return response.data;
};