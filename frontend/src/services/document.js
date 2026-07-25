import api from "./api";

export const uploadDocument = (file) => {
  const formData = new FormData();

  formData.append("file", file);

  return api.post("/documents/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};