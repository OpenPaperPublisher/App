import { useState, useEffect, SetStateAction, Children, PropsWithChildren } from 'react'
import logo from './logo.svg'
import './App.css'
import { invoke } from '@tauri-apps/api'
import template from './template.json'
import { exportPath } from './config.json'

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
      setAuthUrl(url as string);
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
  property_groups: Array<PropertyGroup>, //TODO: Determine the type of the property groups (or if it even is an array)
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
  property_groups: Array<TemplateType>, //TODO: Determine the type of the property groups (or if it even is an array)
}

interface FieldType {
  name: string,
  description: string,
  type: { ".tag": string },
}
interface TemplateType {
  name: string,
  description: string,
  fields: Array<FieldType>,
}
interface PropertyField {
  name: string,
  value: string,
}
interface PropertyGroup {
  template_id: string,
  fields: Array<PropertyField>
}


function checkForExistingValue(File: FileType, value: string): string | null {
  if (File.property_groups != null) {
    let properties: PropertyGroup = File.property_groups[0];
    if (properties != null) {
      let field: PropertyField | undefined = properties.fields.find((field) => { return field.name === value });
      if (field) {
        return field.value;
      }
    }
  }
  return null;
}

const MainPage = (props: BaseParams) => {

  const defaultDirectory: string = ""; //TODO: implement way for user to set default directory
  const [selectedFile, setSelectedFile] = useState<FileType | null>(null); //The selected file name
  const [baseDir, setBaseDir] = useState(defaultDirectory);
  const [baseDirFileData, setBaseDirData] = useState<Array<FolderType | FileType> | null>(null);

  let exportFilePaths: Array<string> = [];

  useEffect(() => {
    invoke('upsert_template').catch((err) => console.error(err));
    listSubfiles("");
  }, []);

  function listSubfiles(target: string) {
    exportFilePaths = [];
    setBaseDir(target);
    setBaseDirData(null);
    setSelectedFile(null);
    invoke('list_target_dir', { target }).then((result) => {

      let data = result as Array<FolderType | FileType>;

      setBaseDirData(data);

    }).catch((err) => console.error(err));
  }

  function refreshFolder() {

    invoke('list_target_dir', { target: baseDir }).then((result) => {

      let data = result as Array<FolderType | FileType>;

      setBaseDirData(data);

    }).catch((err) => console.error(err));
  }

  return (
    < div className='flex h-[100vh] flex-col text-white'>
      <div className='text-[2vw] font-bold font-lg px-52 pt-52'>
        <h1>Dropbox Documents</h1>
      </div>
      <div className='break py-20' />
      <div className='flex flex-auto overflow-y-hidden'>
        <div className="FileListAndButton flex flex-col">
          <div className='List of Files flex-col py-10 h-[100%] pl-5 bg-slate-900 w-80 overflow-y-auto whitespace-nowrap noScrollBar'>
            <div className='PathList flex overflow-x-auto'>
              📂
              <p className="px-2 cursor-pointer underline" onClick={() => {
                listSubfiles(defaultDirectory);
              }}>
                Dropbox
              </p>
              {
                baseDir.split('/').map((element) => {
                  if (element == "") return; //the first element can be empty
                  return (
                    <div className='flex'>
                      <p>/</p>
                      <p className="px-2 cursor-pointer underline" onClick={() => {
                        listSubfiles(baseDir.substring(0, baseDir.indexOf("/" + element) + ("/" + element).length))
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
                if (datum['.tag'] === "file" && datum.name.endsWith('.paper')) {
                  exportFilePaths.push(datum.path_lower);
                  return <FileComponent key={datum.path_lower} file={datum as FileType} setFile={setSelectedFile} />
                }
                else if (datum['.tag'] === "folder") {
                  return <FolderComponent key={datum.path_lower} folder={datum as FolderType} callList={listSubfiles} />
                }
              })
            }
          </div>
          <button className="bg-purple-500 mt-10 px-2 rounded-md h-5 mb-10 flex-grow-0 self-center" onClick={() => {
            invoke('export_folder', { exportPath: exportPath, filePaths: exportFilePaths }).catch((err) => console.error(err)); //TODO: implement way for user to specify their target directory when exporting
          }}>
            Export Folder
          </button>
        </div>
        <PropertiesViewer selectedFile={selectedFile} refresh={refreshFolder} />
      </div>
    </div >
  )
};

const PropertiesViewer = (props: { selectedFile: FileType | null, refresh: Function }) => {

  const [propertyValues, setPropertyValues] = useState(new Map(template.fields.map(({ name }) => [name, propogateProp(name)])));

  function propogateProp(name: string): string {
    if (props.selectedFile != null && props.selectedFile.property_groups != null && props.selectedFile.property_groups[0] != null) {
      return (props.selectedFile.property_groups[0].fields.find((field) => { return field.name == name }) as PropertyField).value;
    }
    return "";
  }

  return (
    <div className="Properties Viewer bg-zinc-700 w-fit flex-1 pt-3 flex flex-col justify-start items-center overflow-x-hidden overflow-y-auto">

      {props.selectedFile != null ? props.selectedFile.name : ""}

      {props.selectedFile != null ? template.fields.map((field) => {
        let existingValue = checkForExistingValue(props.selectedFile as FileType, field.name);
        return <TemplateFieldComponent key={props.selectedFile!.name + ":" + field.name} field={field as FieldType} existingValue={existingValue} setPropertyValues={setPropertyValues} />;
      })
        :
        ("Select a file to view it's properties")
      }

      {props.selectedFile != null ?
        <button className="bg-purple-500 mt-10 px-2 py-5 content-center text-center place-content-center rounded-md h-5 mb-10"
          onClick={() => {
            let properties: Array<PropertyField> = Array<PropertyField>();
            propertyValues.forEach((value, key) => {
              properties.push({ name: key, value });
            })
            invoke('set_file_properties', { target: props.selectedFile?.path_lower, properties: properties }).then(() => { props.refresh() }).catch((err) => { console.error(err) });
          }}
        >
          Apply properties
        </button>
        : ""}

    </div >
  )
}

const ErrorPage = () => {
  return (
    <div>Error, this page occurs when the app attemps to swap to a page that doesn't exist. Please open an issue if you ever see this page</div>
  )
}

//The 'bottom level' component that actually contains a single dropbox file's information
const FileComponent = (props: { file: FileType, setFile: React.Dispatch<SetStateAction<FileType | null>> }) => {



  return (
    <div className='FileComponent cursor-pointer overflow-ellipsis overflow-hidden underline hover:bg-slate-800 focus:bg-slate-700'
      onClick={() => {
        props.setFile(props.file);
      }}>
      <img />
      📄{props.file.name}
    </div>
  )

}

//A Recursive component which should be able to render branching levels of documents
const FolderComponent = (props: { folder: FolderType, callList: Function }) => {

  return (
    <div className='FolderComponent flex overflow-ellipsis overflow-hidden hover:bg-slate-800 focus:bg-slate-700 cursor-pointer' onDoubleClick={() => props.callList(props.folder.path_lower)}>
      📁
      {props.folder.name}
    </div>
  )

}


const TemplateFieldComponent = (props: { field: FieldType, existingValue: string | null, setPropertyValues: React.Dispatch<SetStateAction<Map<string, string>>> }) => {

  return (
    <div className='TemplateFieldComponent my-5'>
      {props.field.name + ": "}
      <input className="px-2 text-black" placeholder={"Value not set"} defaultValue={props.existingValue ? props.existingValue : ""}
        onChange={(event) => {
          props.setPropertyValues((prev) => new Map(prev).set(props.field.name, event.target.value));
        }}
      />
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
