import { PAGE_FOLDERS } from "../constants";

const Home = ({ dispatch }) => (
  <div className="mt-10 w-full max-w-sm p-6 m-auto bg-white rounded-md shadow-md border border-gray-100">
    <h1 className="text-3xl font-semibold text-center text-gray-700 ">
      Get Started
    </h1>

    <p className="mt-4">
      To start using Open Paper Publisher, link your Dropbox account.
    </p>

    <div className="flex items-center mt-6 -mx-2">
      <button
        type="button"
        className="flex items-center justify-center w-full px-6 py-2 mx-2 text-sm font-medium text-white transition-colors duration-200 transform bg-blue-500 rounded-md hover:bg-blue-400 focus:bg-blue-400 focus:outline-none"
        onClick={() => {
          dispatch({ type: PAGE_FOLDERS });
        }}
      >
        <span className="hidden mx-2 sm:inline">Connect Your Dropbox</span>
      </button>
    </div>
  </div>
);

export default Home;
