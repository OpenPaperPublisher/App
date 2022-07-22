import { useEffect, useState } from "react";
import { useSpring, animated } from "react-spring";

const fakeSingleMetadataApiResponse = async (documentId) => {
  return {
    id: documentId,
    title: "Document Title",
    metadata: { published: "Draft" }
  };
};

const Drawer = ({ show, documentId }) => {
  const props = useSpring({
    left: show ? window.innerWidth - 500 : window.innerWidth,
    position: "absolute",
    top: 0,
    height: "100vh",
    width: "500px"
  });

  const [document, setDocument] = useState(null);

  useEffect(() => {
    fakeSingleMetadataApiResponse(documentId).then(
      ({ id, title, metadata }) => {
        setDocument({ id, title, metadata });
      }
    );
  }, [documentId]);

  return (
    <animated.div
      style={props}
      className="bg-white border-l-2 border-gray-200 p-4"
    >
      {document && <h3>{document["title"]}</h3>}
    </animated.div>
  );
};

export default Drawer;
