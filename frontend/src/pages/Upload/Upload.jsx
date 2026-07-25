import Layout from "../../components/layout/Layout";
import UploadCard from "../../components/upload/Upload";

function Upload() {
  return (
    <Layout>
      <div className="mx-auto max-w-6xl">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Upload Documents
          </h1>

          <p className="mt-2 text-gray-500">
            Upload PDF documents to build your organization's knowledge base.
          </p>
        </div>

        <UploadCard />

      </div>
    </Layout>
  );
}

export default Upload;