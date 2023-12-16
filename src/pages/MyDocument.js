import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const MyDocument = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);

  const getDocumentsIds = () => {
    const documentsIds = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);

      if (key && key.startsWith("document -")) {
        documentsIds.push(key);
      }
    }
    setDocuments(documentsIds);
  };
  useEffect(() => {
    getDocumentsIds();
  }, []);
  return (
    <div>
      {documents.length > 0 ? (
        documents.map((document_id) => {
          return (
            <p
              onClick={() =>
                navigate(`/view-document/${document_id}`)
              }
            >
              {document_id}
            </p>
          );
        })
      ) : (
        <div className="min-h-screen border text-center align-center">
          <h2>No Documents</h2>
        </div>
      )}

      <button onClick={() => navigate("/templates")}>
        Create New Document
      </button>
    </div>
  );
};

export default MyDocument;
