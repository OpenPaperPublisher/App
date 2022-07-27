import React, { useEffect, useState } from "react";
import Breadcrumbs from "./components/Breadcrumbs";
import Table from "./components/Table";
import { Pages } from "../constants";

const PAGE_DOCUMENTS = Pages.PAGE_DOCUMENTS;

const fakeFolderApiResponse = async () => {
    return {
        folders: [
            { name: "Folder A", id: "A" },
            { name: "Folder B", id: "B" },
            { name: "Folder C", id: "C" }
        ]
    };
};

const Folders = ({ breadcrumbs, dispatch }: any) => {
    const [folders, setFolders] = useState([]);

    useEffect(() => {
        fakeFolderApiResponse().then(({ folders }) => setFolders(folders as any));
    }, []);

    return (
        <div>
            <Breadcrumbs paths={breadcrumbs} dispatch={dispatch} />
            <h2 className="text-3xl font-bold text-gray-800 md:text-2xl mb-4">
                Folders
            </h2>

            <Table headers={["Folder Name"]}>
                {folders.map(({ id, name }) => (
                    <tr key={id} className="text-gray-700">
                        <td className="px-4 py-3">
                            <div className="flex items-center text-sm">
                                <div
                                    className="cursor-pointer"
                                    onClick={() => {
                                        dispatch({ type: PAGE_DOCUMENTS, folderId: id });
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
export default Folders;