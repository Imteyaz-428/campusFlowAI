import api from "./api";

export const uploadDocument = async (file) => {
  const formData = new FormData();

  formData.append("file", file);

  const res = await api.post(
    "/documents/upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return res.data;
};

export const getDocuments = async () => {
  const res = await api.get("/documents");

  return res.data;
};

export const deleteDocument = async (documentId) => {
  const res = await api.delete(
    `/documents/${documentId}`
  );

  return res.data;
};