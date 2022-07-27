import { useEffect, useState } from "react";
import { useSpring, animated } from "react-spring";

const fakeDocuments = [
    { name: "Document 1", id: "1", metadata: { status: "Draft" } },
    { name: "Document 2", id: "2", metadata: { status: "Published" } },
    { name: "Document 3", id: "3", metadata: { status: "Published" } }
];

const fakeSingleMetadataApiResponse = async (documentId: any) => {
    const [document] = fakeDocuments.filter(({ id }) => documentId === id);
    return { document };
};

const Drawer = ({ show, documentId, setActiveDocumentId }: any) => {
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
            ({ document: { id, name, metadata } }) => {
                setDocument({ id, name, metadata } as any);
            }
        );
    }, [documentId]);

    return (
        <animated.div
            style={props as any}
            className="bg-white border-l-2 border-gray-200 p-4"
        >
            <div className="cursor-pointer" onClick={() => setActiveDocumentId(null)}>
                Close
            </div>
            {document && <h3>{document["name"]}</h3>}
            {document && <p>{document["status"]}</p>}
        </animated.div>
    );
};

export default Drawer;
