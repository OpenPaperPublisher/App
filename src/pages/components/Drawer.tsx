import { useEffect, useState } from "react";
import { useSpring, animated } from "react-spring";
import { invoke } from "@tauri-apps/api";
import { useForm } from "react-hook-form";
import { OPMproperties, Property } from "../../dropbox_types";

const inputClasses =
  "block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-200 rounded-md focus:border-blue-400 focus:ring-blue-300 focus:ring-opacity-40 focus:outline-none focus:ring";


const Drawer = ({
  show,
  documentId,
  setActiveDocument
}: {
  show: boolean;
  documentId: String | null;
  setActiveDocument: any;
}) => {
  const { register, handleSubmit, control } = useForm<OPMproperties>({
    defaultValues: {
      status: "draft"
    }
  });

  const [metadata, setMetadata] = useState({});

  useEffect(() => {
    if (documentId === null) return;
    invoke("get_file_properties", { path: documentId as string }).then(
      (metatada: any) => {
        if ("propert_groups" in metatada && metatada["propert_groups"].length === 1) {
            const data: Array<Property> = metadata["property_groups"];
        //   console.log(documents as File[]);
        //   setDocuments(documents as File[]);
      }
    );
  }, [documentId]);

  const onSubmit = (data: OPMproperties) => {
    const metadata: Array<Property> = Object.entries(data).map((datum) => {
      if (datum[0] === "publish_date") {
        let prop: Property = {
          name: datum[0],
          value: datum[1] ? (datum[1] as Date).toDateString() : ""
        };
        return prop;
      }
      let prop: Property = { name: datum[0], value: datum[1] as string };
      return prop;
    });

    if (document) {
      if (document.property_groups && document.property_groups.length > 0)
        document.property_groups[0].fields = metadata;
      invoke("set_file_properties", {
        target: document.path_lower,
        properties: metadata
      });
    }

    setActiveDocument(null);
  };

  const props = useSpring({
    left: show ? window.innerWidth - 500 : window.innerWidth,
    position: "absolute",
    top: 0,
    height: "100vh",
    width: "500px"
  });

  const hasProperty =
    document &&
    document.property_groups &&
    document.property_groups.length > 0 &&
    document.property_groups[0];

  const checkForValue = (name: String): string | undefined => {
    if (!hasProperty) return undefined;
    let prop = document.property_groups[0].fields.find((property) => {
      property.name = name as string;
    });
    if (prop) return prop.value;
    return undefined;
  };

  return (
    <animated.div
      style={props as any}
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
          onClick={() => setActiveDocument(null)}
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
          <label htmlFor="author" className="text-gray-700">
            Author
          </label>
          <input
            id="author"
            type="text"
            className={inputClasses}
            {...register("author")}
            value={checkForValue("author")}
          />
        </div>

        <div className="mt-4">
          <label htmlFor="status" className="text-gray-700">
            Status
          </label>
          <select
            id="status"
            className={inputClasses}
            {...register("status", { required: true })}
            value={checkForValue("status")}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>

        <div className="mt-4">
          <label htmlFor="categories" className="text-gray-700">
            Categories (one per line)
          </label>
          <textarea
            id="categories"
            className={inputClasses}
            {...register("categories")}
            value={checkForValue("categories")}
          />
        </div>

        <div className="mt-4">
          <label htmlFor="tags" className="text-gray-700">
            Tags (one per line)
          </label>
          <textarea
            id="tags"
            className={inputClasses}
            {...register("tags")}
            value={checkForValue("tags")}
          />
        </div>

        <div className="mt-4">
          <label htmlFor="template" className="text-gray-700">
            Display Template
          </label>
          <input
            id="template"
            type="text"
            className={inputClasses}
            {...register("template")}
            value={checkForValue("template")}
          />
        </div>

        <input
          type="submit"
          value="Update Metadata"
          className="mt-10 px-4 py-2 hover:cursor-pointer font-medium tracking-wide text-white capitalize transition-colors duration-200 transform bg-blue-600 rounded-md hover:bg-blue-500 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-80"
        />
      </form>
    </animated.div>
  );
};

export default Drawer;
