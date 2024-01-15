import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchDocuments } from "../services/api_calls";

const DocumentCard = ({ title, description, count }) => {
  return (
    <div className="max-w-sm rounded overflow-hidden shadow-lg p-4 m-2">
      <div className="px-6 py-4">
        <div className="font-bold text-xl mb-2">{title}</div>
        <p className="text-gray-700 text-base">{description}</p>
      </div>
      <div className="px-6 pt-4 pb-2">
        {count && (
          <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
            {count}
          </span>
        )}
      </div>
    </div>
  );
};

const MyDocument = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);

  const getDocument = async () => {
    await fetchDocuments()
      .then((res) => {
        setDocuments(res.data);
        console.log(res);
      })
      .catch((error) => {
        console.log("Error:", error);
      });
  };
  useEffect(() => {
    getDocument();
    // getDocumentsIds();
  }, []);
  return (
    <div>
      <div>
        <nav className="flex justify-between items-center p-4 bg-gray-800 text-white">
          <h1 className="text-lg font-semibold">My Documents</h1>
          <button
            onClick={() => navigate("/templates")}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Create New
          </button>
        </nav>

        <div className="p-4">
          {documents.length > 0 ? (
            <div className="flex flex-wrap justify-start">
              {documents.map((doc) => (
                <div onClick={() => navigate(`/view-document/${doc.id}`)}>
                  <DocumentCard
                    key={doc.id}
                    title={"doc.title"}
                    description={"doc.description"}
                    count={"doc.count"}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center mt-10">
              <img
                src="path_to_no_documents_image.jpg" // Replace with the path to your image
                alt="No Documents"
                className="w-1/3 mx-auto mb-4"
              />
              <h2 className="text-xl font-semibold">No Documents</h2>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyDocument;
