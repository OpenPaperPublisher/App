import React, { useEffect, useState } from "react";
import Breadcrumbs from "../components/Breadcrumbs";

const fakeFolderApiResponse = async () => {
  return {
    folders: [
      { name: "Folder A", id: "A" },
      { name: "Folder B", id: "B" },
      { name: "Folder C", id: "C" }
    ]
  };
};

const Folders = ({ breadcrumbs, dispatch }) => {
  const [folders, setFolders] = useState([]);

  useEffect(() => {
    fakeFolderApiResponse().then(({ folders }) => setFolders(folders));
  }, []);

  return (
    <div>
      <Breadcrumbs paths={breadcrumbs} dispatch={dispatch} />
      <h2 className="text-3xl font-bold text-gray-800 md:text-2xl mb-4">
        Folders
      </h2>

      <div className="w-full mb-8 overflow-hidden rounded-lg shadow-xs">
        <div className="w-full overflow-x-auto">
          <table className="w-full whitespace-no-wrap">
            <thead>
              <tr className="text-xs font-semibold tracking-wide text-left text-gray-500 uppercase border-b bg-gray-50">
                <th className="px-4 py-3">Folder Name</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y">
              {folders.map(({ id, name }) => (
                <tr key={id} className="text-gray-700">
                  <td className="px-4 py-3">
                    <div className="flex items-center text-sm">
                      <div>{name}</div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default Folders;
