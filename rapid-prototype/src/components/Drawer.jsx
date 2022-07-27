import { useEffect, useState } from "react";
import { useSpring, animated } from "react-spring";
import { useForm } from "react-hook-form";

const fakeDocuments = [
  { name: "Document 1", id: "1", metadata: { status: "draft", author: "Tom" } },
  {
    name: "Document 2",
    id: "2",
    metadata: { status: "published", author: "Fred" }
  },
  {
    name: "Document 3",
    id: "3",
    metadata: { status: "published", author: "Jane" }
  }
];

const fakeSingleMetadataApiResponse = async (documentId) => {
  const [document] = fakeDocuments.filter(({ id }) => documentId === id);
  return { document };
};

const fakeSaveMetadata = async (metadata) => {
  return { status: "ok" };
};

const Drawer = ({ show, documentId, setActiveDocumentId }) => {
  const { register, handleSubmit } = useForm({
    defaultValues: {
      status: "draft"
    }
  });
  const onSubmit = (data) => {
    fakeSaveMetadata(data).then(() => {
      setActiveDocumentId(null);
    });
  };

  const props = useSpring({
    left: show ? window.innerWidth - 500 : window.innerWidth,
    position: "absolute",
    top: 0,
    height: "100vh",
    width: "500px"
  });

  const [document, setDocument] = useState(null);

  useEffect(() => {
    if (documentId === null) return;
    fakeSingleMetadataApiResponse(documentId).then(
      ({
        document: {
          id,
          name,
          metadata: { author }
        }
      }) => {
        setDocument({ id, name, metadata: { author } });
      }
    );
  }, [documentId]);

  return (
    <animated.div
      style={props}
      className="bg-white border-l-2 border-gray-200 p-4"
    >
      <div className="cursor-pointer" onClick={() => setActiveDocumentId(null)}>
        Close
      </div>
      {document && (
        <h3 className="text-2xl font-bold text-gray-800">{document["name"]}</h3>
      )}
      <form className="mt-10" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label for="author" className="text-gray-700">
            Author
          </label>
          <input
            id="author"
            type="text"
            className="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-200 rounded-md focus:border-blue-400 focus:ring-blue-300 focus:ring-opacity-40 focus:outline-none focus:ring"
            {...register("author")}
            defaultValue={
              document && document.metadata ? document.metadata.author : null
            }
          />
        </div>
        <input
          type="submit"
          value="Update Metadata"
          className="mt-10 px-4 py-2 font-medium tracking-wide text-white capitalize transition-colors duration-200 transform bg-blue-600 rounded-md hover:bg-blue-500 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-80"
        />
      </form>
    </animated.div>
  );
};

export default Drawer;
