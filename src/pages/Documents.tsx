import React, { useEffect, useState } from "react";
import { invoke } from '@tauri-apps/api'
import Breadcrumbs from "./components/Breadcrumbs";
import Table from "./components/Table";
import Drawer from "./components/Drawer";
import PublishDrawer from "./components/PublishDrawer";
import { File, Folder } from "../dropbox_types";

const Documents = ({ breadcrumbs, dispatch, folderPath }: any) => {
    const [documents, setDocuments] = useState<File[]>([]);
    const [activeDocument, setActiveDocument] = useState<File | null>(null);
    const [publishDrawOpen, togglePublishDrawer] = useState(false);

    useEffect(() => {
        invoke('list_files_in_dir', { target: folderPath as string }).then((documents) => {
            console.log(documents as File[]);
            setDocuments(documents as File[]);
        }
        );
    }, [folderPath]);

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
                {documents.map((document) => (
                    <tr key={document.path_lower} className="text-gray-700">
                        <td className="px-4 py-3">
                            <div className="flex items-center text-sm">
                                <div
                                    className="cursor-pointer"
                                    onClick={() => {
                                        if (activeDocument === null) {
                                            setActiveDocument(document);
                                        } else if (activeDocument === document) {
                                            setActiveDocument(null);
                                        } else {
                                            setActiveDocument(null);
                                            setActiveDocument(document);
                                        }
                                    }}
                                >
                                    {document.name}
                                </div>
                            </div>
                        </td>
                    </tr>
                ))}
            </Table>

            <Drawer
                show={activeDocument !== null}
                document={activeDocument}
                setActiveDocument={setActiveDocument}
            />

            <PublishDrawer
                show={publishDrawOpen === true}
                folderPath={folderPath}
                togglePublishDrawer={togglePublishDrawer}
            />
        </div>
    );
};

export default Documents;
