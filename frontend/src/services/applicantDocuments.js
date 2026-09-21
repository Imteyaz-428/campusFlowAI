import applicantApi from "./applicantApi";


// GET MY DOCUMENTS


export const getMyDocuments = async () => {
  const response = await applicantApi.get(
    "/campus/documents/me"
  );

  return response.data;
};



// UPLOAD MY DOCUMENT


export const uploadMyDocument = async (
  documentType,
  file
) => {
  const formData = new FormData();

  formData.append(
    "document_type",
    documentType
  );

  formData.append(
    "file",
    file
  );

  const response = await applicantApi.post(
    "/campus/documents/me/upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};