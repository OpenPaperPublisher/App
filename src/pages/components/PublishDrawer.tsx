import { useState } from "react";
import { useSpring, animated } from "react-spring";
import { invoke } from '@tauri-apps/api';
import { open } from '@tauri-apps/api/dialog';

const PublishDrawer = ({ show, folderPath, togglePublishDrawer }: any) => {
    const props = useSpring({
        left: show ? window.innerWidth - 500 : window.innerWidth,
        position: "absolute",
        top: 0,
        height: "100vh",
        width: "500px"
    });

    const [path, setPath] = useState<String | null>(null);

    return (
        <animated.div
            style={props as any}
            className="bg-white border-l-2 border-gray-200 p-4"
        >
            <div
                className="cursor-pointer"
                onClick={() => togglePublishDrawer(false)}
            >
                Close
            </div>
            <form className="mt-4" onSubmit={(e) => { e.preventDefault() }}>
                <div>
                    <input type="button" className="hover:cursor-pointer" value="Select Local Folder" onClick={() => {
                        open({ directory: true }).then((result) => {
                            if (result) {
                                setPath(result as string);
                            }
                        })
                    }} />
                    <br></br>
                    {path ? <text>Selected Path: {path}</text> : null}
                </div>
                <div>
                    <button
                        className="mt-4 text-sm px-2 py-1 font-medium tracking-wide text-white capitalize transition-colors duration-200 transform bg-blue-600 rounded-md hover:bg-blue-500 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-80"
                        onClick={() => {
                            if (!path) return;
                            invoke("export_folder", { folderPath: (folderPath as String), exportPath: path }).then((status) => {
                                console.log(status);
                            });
                        }}
                    >
                        Write Dropbox HTML Files
                    </button>
                </div>
            </form>
        </animated.div >
    );
};

export default PublishDrawer;
