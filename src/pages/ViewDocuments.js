import React, {useState} from 'react';
import parse from "html-react-parser";

const ViewDocuments = () => {
    const [currentDocumentHtml, setCurrentDocumentHtml] = useState();
  return (
    <div>ViewDocuments


{currentDocumentHtml && (
        <div style={{ margin: 10, borderColor: "red" }}>
          {parse(currentDocumentHtml)}
        </div>
      )}
    </div>
  )
}

export default ViewDocuments