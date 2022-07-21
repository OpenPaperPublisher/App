import { useReducer } from "react";
import Home from "./pages/Home";
import Folders from "./pages/Folders";
import { PAGE_HOME, PAGE_FOLDERS } from "./constants";

const initialState = { type: PAGE_HOME, Component: Home };

const reducer = (state, action) => {
  switch (action.type) {
    case PAGE_HOME:
      return { ...state, Component: Home };
    case PAGE_FOLDERS:
      return {
        ...state,
        Component: Folders,
        breadcrumbs: [{ page: PAGE_HOME, name: "Home" }, { name: "Folders" }]
      };
    default:
      throw new Error();
  }
};

const App = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { Component } = state;

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
