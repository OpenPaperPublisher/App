import React, { useEffect, useState } from "react";
import { invoke } from '@tauri-apps/api'
import Breadcrumbs from "./components/Breadcrumbs";
import Table from "./components/Table";
import { Pages } from "../constants";
import { File, Folder } from "../dropbox_types";

const PAGE_DOCUMENTS = Pages.PAGE_DOCUMENTS;

const Folders = ({ breadcrumbs, dispatch }: any) => {
    const [folders, setFolders] = useState<Folder[]>([]);

    useEffect(() => {
        invoke('list_folders_in_dir', { target: "" }).then((folders) => setFolders(folders as Folder[]));
    }, []);

    return (
        <div>
            <Breadcrumbs paths={breadcrumbs} dispatch={dispatch} />
            <h2 className="text-3xl font-bold text-gray-800 md:text-2xl mb-4">
                Folders
            </h2>

            <Table headers={["Folder Name"]}>
                {folders.map(({ path_lower, name }) => (
                    <tr key={path_lower} className="text-gray-700">
                        <td className="px-4 py-3">
                            <div className="flex items-center text-sm">
                                <div
                                    className="cursor-pointer"
                                    onClick={() => {
                                        dispatch({ type: PAGE_DOCUMENTS, folderPath: path_lower });
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