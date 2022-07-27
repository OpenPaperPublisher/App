import React, { useEffect, useState } from "react";
import { invoke } from '@tauri-apps/api'
import Breadcrumbs from "./components/Breadcrumbs";
import Table from "./components/Table";
import { Pages } from "../constants";
import { File, Folder } from "../dropbox_types";

const PAGE_DOCUMENTS = Pages.PAGE_DOCUMENTS;

const listFolder = async (): Promise<Folder[]> => {
    let metadata = await invoke('list_target_dir', { target: "" })
    let list: Folder[] = (metadata as Array<File | Folder>).filter((data) => { return data[".tag"] === "folder" }) as Folder[];
    return list;
};

const Folders = ({ breadcrumbs, dispatch }: any) => {
    const [folders, setFolders] = useState<Folder[]>([]);

    useEffect(() => {
        listFolder().then((folders) => setFolders(folders));
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