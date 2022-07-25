import React, { useEffect, useState } from "react";
import Breadcrumbs from "../components/Breadcrumbs";
import Table from "../components/Table";
import Drawer from "../components/Drawer";
import PublishDrawer from "../components/PublishDrawer";

const fakeDocumentsApiResponse = async (folderId) => {
  return {
    documents: [
      { name: "Document 1", id: "1", status: "draft" },
      { name: "Document 2", id: "2", status: "published" },
      { name: "Document 3", id: "3", status: "published" }
    ]
  };
};

const Documents = ({ breadcrumbs, dispatch, folderId }) => {
  const [documents, setDocuments] = useState([]);
  const [activeDocumentId, setActiveDocumentId] = useState(null);
  const [publishDrawOpen, togglePublishDrawer] = useState(false);

  useEffect(() => {
    fakeDocumentsApiResponse(folderId).then(({ documents }) =>
      setDocuments(documents)
    );
  }, [folderId]);

  return (
    <div>
      <Breadcrumbs paths={breadcrumbs} dispatch={dispatch} />
      <div className="flex mb-4">
        <h2 className="shrink-0 text-3xl font-bold text-gray-800 md:text-2xl self-center">
          Documents
        </h2>
        <button
          className="ml-4 text-sm px-2 py-1 font-medium tracking-wide text-white capitalize transition-colors duration-200 transform bg-blue-600 rounded-md hover:bg-blue-500 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-80"
          onClick={() => togglePublishDrawer(!publishDrawOpen)}
        >
          Publish Documents to Local
        </button>
      </div>
      <Table headers={["Document Title"]}>
        {documents.map(({ id, name }) => (
          <tr key={id} className="text-gray-700">
            <td className="px-4 py-3">
              <div className="flex items-center text-sm">
                <div
                  className="cursor-pointer"
                  onClick={() => {
                    if (activeDocumentId === null) {
                      setActiveDocumentId(id);
                    } else if (activeDocumentId === id) {
                      setActiveDocumentId(null);
                    } else {
                      setActiveDocumentId(null);
                      setActiveDocumentId(id);
                    }
                  }}
                >
                  {name}
                </div>
              </div>
            </td>
          </tr>
        ))}
      </Table>

      <Drawer
        show={activeDocumentId !== null}
        documentId={activeDocumentId}
        setActiveDocumentId={setActiveDocumentId}
      />

      <PublishDrawer
        show={publishDrawOpen === true}
        folderId={folderId}
        togglePublishDrawer={togglePublishDrawer}
      />
    </div>
  );
};

export default Documents;
