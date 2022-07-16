import { useState, useEffect, SetStateAction } from 'react'
import logo from './logo.svg'
import './App.css'
import { invoke } from '@tauri-apps/api'


const Pages = {
  AuthPage: 'AuthPage',
  MainPage: 'MainPage',
  ErrorPage: 'ErrorPage',
}

interface BaseParams {
  setState: (state: string) => void,
}
const AuthPage = (props: BaseParams) => {

  const [authUrl, setAuthUrl] = useState("");

  //We need to wrap this in useEffect so it only happens on first render, otherwise, on state change, react would rerender again and loop
  useEffect(() => {
    invoke('get_auth_url').then((url) => {
      setAuthUrl(String(url));
    })
  }, []);


  return (
    <div className='text-center font-mono font-bold text-zinc-300'>
      <header className='flex align-center justify-center flex-col min-h-[100%] space-y-10'>
        <img className='h-[40vmin] pointer-events-none animate-[spin_20s_linear_infinite] mx-auto' src={logo} alt="logo" />
        <p>
          <a
            id="auth_url"
            className='text-[5vh] p-2 rounded-lg text-white underline bg-cyan-400 border-white hover:bg-cyan-500 hover:border-zinc-100} border-4'
            href={authUrl}
            target="_blank"
          >
            Obtain Auth Key
          </a>
        </p>
        <p className='space-x-4'>
          <input className='rounded-md px-1 min-w-[20vw] text-slate-700' type='text' id="auth-code" placeholder='Paste authentication code here' />
          <button className='bg-cyan-200 rounded-md px-1 text-slate-700 border-slate-500 border-2  ' onClick={() => {
            const code: string = (document.getElementById("auth-code") as HTMLInputElement).value;
            invoke('finalize_auth', { code })
              .catch((err) => console.error(err))
              .then(() => props.setState(Pages.MainPage));
          }}>Submit</button>
        </p>
        <p>
          Edit <code>App.tsx</code> and save to test HMR updates.
        </p>
      </header>
    </div >
  )
};

interface FileType {
  '.tag': string,
  client_modified: string,
  id: string,
  name: string,
  property_groups: Array<any>, //TODO: Determine the type of the property groups (or if it even is an array)
  path_display: string,
  path_lower: string,
  size: number,
}
interface FolderType {
  '.tag': string,
  id: string,
  name: string,
  path_display: string,
  path_lower: string,
  property_groups: Array<any>, //TODO: Determine the type of the property groups (or if it even is an array)
}
const MainPage = (props: BaseParams) => {

  const [baseDir, setBaseDir] = useState("");
  const [baseDirFileData, setBaseDirData] = useState<Array<FolderType | FileType> | null>(null);

  useEffect(() => {
    invoke('upsert_template').catch((err) => console.error(err));
    listSubfiles("");
  }, []);

  function listSubfiles(target: string) {
    setBaseDir(target);
    setBaseDirData(null);
    invoke('list_target_dir', { target }).then((result) => {

      let data = result as Array<FolderType | FileType>;

      setBaseDirData(data);

    }).catch((err) => console.error(err));
  }


  return (
    < div className='text-white'>
      <div className='text-[2vw] font-bold font-lg px-52 pt-52'>
        <h1>Dropbox Documents</h1>
      </div>
      <div className='break py-20' />
      <div className='flex'>
        <div className='List of Files py-10 pl-5 bg-slate-900 w-80 h-[50vh] overflow-y-auto whitespace-nowrap noScrollBar'>
          <div className='flex overflow-x-auto'>
            {
              baseDir.split('/').map((element) => {
                if (element == "") return; //the first element can be empty
                return (
                  <div className='flex'>
                    <p>/</p>
                    <p className="px-2 cursor-pointer underline" onClick={() => {
                      listSubfiles(baseDir.substring(0, baseDir.indexOf("/" + element)))
                    }}>
                      {element}
                    </p>
                  </div>
                )
              })
            }
          </div>
          {
            baseDirFileData?.map((datum) => {
              if (datum['.tag'] === "file") {
                return <FileComponent file={datum as FileType} />
              }
              else if (datum['.tag'] === "folder") {
                return <FolderComponent folder={datum as FolderType} callList={listSubfiles} />
              }
            })
          }
        </div>
      </div>
    </div>
  )
};

const ErrorPage = () => {
  return (
    <div>Error, this page occurs when the app attemps to swap to a page that doesn't exist. Please open an issue if you ever see this page</div>
  )
}

//The 'bottom level' component that actually contains a single dropbox file's information
const FileComponent = (props: { file: FileType }) => {

  return (
    <div className='FileComponent cursor-pointer overflow-ellipsis underline hover:bg-slate-700' onClick={() => { console.log("test") }}>
      <img />
      📄{props.file.name}
    </div>
  )

}

//A Recursive component which should be able to render branching levels of documents
const FolderComponent = (props: { folder: FolderType, callList: Function }) => {

  const [subFiles, setSubFiles] = useState<Array<FolderType | FileType> | null>(null);

  function listSubfiles() {
    invoke('list_target_dir', { target: props.folder.path_lower }).then((result) => {

      let data = result as Array<FolderType | FileType>;

      setSubFiles(data);

    }).catch((err) => console.error(err));
  }

  return (
    <div className='FolderComponent cursor-default'>
      <div className='flex hover:bg-slate-600'>
        <div className='cursor-pointer' onDoubleClick={() => props.callList(props.folder.path_lower)}>
          {subFiles ? "📂" : "📁"}
        </div>

        {props.folder.name}

        <button className='px-2' onClick={() => { if (!subFiles) { listSubfiles() } else setSubFiles(null) }}>
          {subFiles ? "🔽" : "▶"}
        </button>
      </div>
      <div className='Subfiles px-5'> {
        subFiles?.map((datum) => {
          if (datum['.tag'] === "file") {
            return <FileComponent file={datum as FileType} />
          }
          else if (datum['.tag'] === "folder") {
            return <FolderComponent folder={datum as FolderType} callList={props.callList} />
          }
        })
      }
      </div>
    </div>
  )

}

function App() {

  const [state, setState] = useState(Pages.AuthPage);

  //depending on the state of the app (set through an enum, the app will display a specific page)
  switch (state) {
    case Pages.AuthPage:
      return <AuthPage setState={setState} />;
    case Pages.MainPage:
      return <MainPage setState={setState} />;
    default:
      return <ErrorPage />
  }

}

export default App
