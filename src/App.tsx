import { Dispatch, useReducer } from "react";
import { Pages } from "./constants";
import Home from "./pages/Home";
import Folders from "./pages/Folders";
import Documents from "./pages/Documents";

type Crumb =
  | {
    page: Pages,
    name: string,
  }
  | {
    name: string,
  }
type State =
  | {
    type: Pages.PAGE_FOLDERS,
    Component: typeof Folders,
    breadcrumbs: Crumb[],
  }
  | {
    type: Pages.PAGE_DOCUMENTS,
    Component: typeof Documents,
    folderPath: string,
    breadcrumbs: Crumb[],
  }
  | {
    type: Pages.PAGE_HOME,
    Component: typeof Home,
  }

type Action =
  | { type: Pages.PAGE_FOLDERS }
  | { type: Pages.PAGE_DOCUMENTS; folderPath: string; }
  | { type: Pages.PAGE_HOME }


const initialState: State = {
  type: Pages.PAGE_HOME,
  Component: Home,
};


const homeCrumb: Crumb = { page: Pages.PAGE_HOME, name: "Home" };


const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case Pages.PAGE_HOME:
      return { ...state, type: Pages.PAGE_HOME, Component: Home };
    case Pages.PAGE_FOLDERS:
      return {
        ...state,
        type: Pages.PAGE_FOLDERS,
        Component: Folders,
        breadcrumbs: [homeCrumb, { name: "Folders" }]
      };
    case Pages.PAGE_DOCUMENTS:
      return {
        ...state,
        type: Pages.PAGE_DOCUMENTS,
        Component: Documents,
        folderPath: action.folderPath,
        breadcrumbs: [
          homeCrumb,
          { page: Pages.PAGE_FOLDERS, name: "Folders" },
          { name: "Documents" }
        ]
      };
    default:
      throw new Error();
  }
};

const App = () => {
  const [state, dispatch]: [State, Dispatch<Action>] = useReducer(reducer, initialState);
  const { Component }: any = state; // Cast to any but this is safe

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 h-full">
        <div className="container mx-auto">
          <header className="p-2">
            <h1 className="text-3xl font-semibold text-gray-800">
              Open Paper Publisher
            </h1>
          </header>
          <Component dispatch={dispatch} {...state} />
        </div>
      </main>
      <footer className="p-2">
        <a href="https://github.com/OpenPaperPublisher" target="_blank">
          Git Repo
        </a>
      </footer>
    </div>
  );
};

export default App;
