import { useEffect, useState } from "react";
import { useSpring, animated } from "react-spring";
import { useForm, Controller } from "react-hook-form";
import DatePicker from "react-datepicker";

const inputClasses =
  "block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-200 rounded-md focus:border-blue-400 focus:ring-blue-300 focus:ring-opacity-40 focus:outline-none focus:ring";

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
  const { register, handleSubmit, control } = useForm({
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
          metadata: { author, status, categories, publish_date }
        }
      }) => {
        setDocument({
          id,
          name,
          metadata: { author, status, categories, publish_date }
        });
      }
    );
  }, [documentId]);

  return (
    <animated.div
      style={props}
      className="bg-white border-l-2 border-gray-200 p-4"
    >
      <div className="flex">
        {document && (
          <h3 className="grow text-2xl font-bold text-gray-800">
            {document["name"]}
          </h3>
        )}
        <div
          className="shrink-0 cursor-pointer"
          onClick={() => setActiveDocumentId(null)}
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
      </div>
      <form className="mt-10 pr-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label for="author" className="text-gray-700">
            Author
          </label>
          <input
            id="author"
            type="text"
            className={inputClasses}
            {...register("author")}
            value={
              document && document.metadata ? document.metadata.author : null
            }
          />
        </div>

        <div className="mt-4">
          <label for="status" className="text-gray-700">
            Status
          </label>
          <select
            id="status"
            className={inputClasses}
            {...register("status", { required: true })}
            value={
              document && document.metadata ? document.metadata.status : null
            }
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>

        <div className="mt-4">
          <label for="status" className="text-gray-700">
            Publish Date
          </label>
          <Controller
            control={control}
            name="publish_date"
            render={({ field }) => (
              <DatePicker
                placeholderText="Select date"
                onChange={(date) => field.onChange(date)}
                className={inputClasses}
                selected={
                  document && document.metadata
                    ? document.metadata.publish_date
                    : null
                }
              />
            )}
          />
        </div>

        <div className="mt-4">
          <label for="categories" className="text-gray-700">
            Categories (one per line)
          </label>
          <textarea
            id="categories"
            className={inputClasses}
            {...register("categories")}
            value={
              document && document.metadata
                ? document.metadata.categories
                : null
            }
          />
        </div>

        <div className="mt-4">
          <label for="tags" className="text-gray-700">
            Tags (one per line)
          </label>
          <textarea
            id="tags"
            className={inputClasses}
            {...register("tags")}
            value={
              document && document.metadata
                ? document.metadata.categories
                : null
            }
          />
        </div>

        <div className="mt-4">
          <label for="template" className="text-gray-700">
            Display Template
          </label>
          <input
            id="template"
            type="text"
            className={inputClasses}
            {...register("template")}
            value={
              document && document.metadata ? document.metadata.template : null
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
