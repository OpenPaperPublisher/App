import { Pages } from "../constants";
import { useState, useEffect } from "react";
import { invoke } from '@tauri-apps/api'
const PAGE_FOLDERS = Pages.PAGE_FOLDERS;

const Home = ({ dispatch }: any) => {

    const [authUrl, setAuthUrl] = useState("");

    //We need to wrap this in useEffect so it only happens on first render, otherwise, on state change, react would rerender again and loop
    useEffect(() => {
        invoke('get_auth_url').then((url) => {
            setAuthUrl(url as string);
        })
    }, []);

    return (
        <div className="mt-10 w-full max-w-sm p-6 m-auto bg-white rounded-md shadow-md border border-gray-100">
            <h1 className="text-3xl font-semibold text-center text-gray-700 ">
                Get Started
            </h1>

            <p className="mt-4">
                To start using Open Paper Publisher, link your Dropbox account.
            </p>

            <div className="flex items-center mt-6 -mx-2">
                <a
                    className="flex items-center justify-center w-full px-6 py-2 mx-2 text-sm font-medium text-white transition-colors duration-200 transform bg-blue-500 rounded-md hover:bg-blue-400 focus:bg-blue-400 focus:outline-none"
                    href={authUrl}
                    target="_blank"
                >
                    <span className="hidden mx-2 sm:inline">Connect Your Dropbox</span>
                </a>
            </div>

            <div className="flex items-center mt-6 -mx-2">
                <input className='rounded-md w-full px-1' type='text' id="auth-code" placeholder='Paste authentication code here' />
                <button className='rounded-md px-1 border-2' onClick={() => {
                    const code: string = (document.getElementById("auth-code") as HTMLInputElement).value;
                    invoke('finalize_auth', { code })
                        .catch((err) => console.error(err))
                        .then(() => {
                            invoke('upsert_template');
                            dispatch({ type: PAGE_FOLDERS });
                        }
                        );
                }}>Submit</button>
            </div>
        </div >
    );
};

export default Home;
