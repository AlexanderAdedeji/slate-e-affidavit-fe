import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchTemplates } from "../services/api_calls";

const TemplateCard = ({ title, onClick, price }) => {
  console.log(title);
  return (
    <div
      className="max-w-sm rounded overflow-hidden shadow-lg bg-white m-2 hover:bg-gray-50 cursor-pointer"
      onClick={onClick}
    >
      <div className="px-6 py-4">
        <div className="font-bold text-xl mb-2">{title}</div>
      </div>

      <hr></hr>
      <div className="px-6 pt-4 pb-2 text-right">
        {price && (
          <span className="inline-block text-right bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
            ₦{price}
          </span>
        )}
      </div>
    </div>
  );
};
const Templates = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);


  const getTemplates = async () => {
    await fetchTemplates()
      .then((res) => {
        console.log(res);
        setTemplates(res.data);
      })
      .catch((error) => {
        console.log("Error:", error);
      });
  };

  useEffect(() => {
    getTemplates();
  }, []);
  return (
    <div>
      <nav className="flex justify-between items-center p-4 bg-gray-800 text-white">
        <h1 className="text-lg font-semibold">My Templates</h1>
      </nav>
      <div className="p-4">
        {templates.length > 0 ? (
          <div className="flex flex-wrap justify-start">
            {" "}
            {/* Aligned to start */}
            {templates.map((template) => (
              <TemplateCard
                key={template.id}
                title={template.name}
                price={template.price}
                onClick={() => navigate(`/create_document/${template.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <h2 className="text-xl font-semibold">No Templates</h2>
              {/* Optionally, include an image or icon to indicate "No Templates" */}
              <img
                src="path_to_no_templates_image.jpg" // Replace with the path to your image
                alt="No Templates"
                className="mx-auto my-4 w-1/3" // Adjust size as needed
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Templates;
