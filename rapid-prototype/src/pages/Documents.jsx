import React, { useEffect, useState } from "react";
import Breadcrumbs from "../components/Breadcrumbs";
import Table from "../components/Table";

const fakeDocumentApiResponse = async (folderId) => {
  return {
    documents: [
      { name: "Document 1", id: "1" },
      { name: "Document 2", id: "2" },
      { name: "Document 1", id: "3" }
    ]
  };
};

const Documents = ({ breadcrumbs, dispatch, folderId }) => {
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    fakeDocumentApiResponse(folderId).then(({ documents }) =>
      setDocuments(documents)
    );
  }, [folderId]);

  return (
    <div>
      <Breadcrumbs paths={breadcrumbs} dispatch={dispatch} />
      <h2 className="text-3xl font-bold text-gray-800 md:text-2xl mb-4">
        Documents
      </h2>
      <Table headers={["Document Title"]}>
        {documents.map(({ id, name }) => (
          <tr key={id} className="text-gray-700">
            <td className="px-4 py-3">
              <div className="flex items-center text-sm">
                <div
                  className="cursor-pointer"
                  onClick={() => {
                    console.log("drawer...");
                  }}
                >
                  {name}
                </div>
              </div>
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
};

export default Documents;
