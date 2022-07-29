import { useState } from "react";
import { useSpring, animated } from "react-spring";

const fakeWriteDocumentsResponse = async (folderId, path) => {
  return { status: "ok" };
};

const PublishDrawer = ({ show, folderId, togglePublishDrawer }) => {
  const props = useSpring({
    left: show ? window.innerWidth - 500 : window.innerWidth,
    position: "absolute",
    top: 0,
    height: "100vh",
    width: "500px"
  });

  const [path, setPath] = useState(null);

  return (
    <animated.div
      style={props}
      className="bg-white border-l-2 border-gray-200 p-4"
    >
      <div
        className="cursor-pointer float-right"
        onClick={() => togglePublishDrawer(false)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </div>

      <form className="mt-4">
        <div>
          <label className="block">Choose a local folder</label>
          <input type="file" name="path" webkitdirectory directory multiple />
        </div>
        <div>
          <button
            className="mt-4 text-sm px-2 py-1 font-medium tracking-wide text-white capitalize transition-colors duration-200 transform bg-blue-600 rounded-md hover:bg-blue-500 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-80"
            onClick={() => {
              fakeWriteDocumentsResponse(folderId, path).then(({ status }) => {
                console.log(status);
              });
            }}
          >
            Write Dropbox HTML Files
          </button>
        </div>
      </form>
    </animated.div>
  );
};

export default PublishDrawer;
