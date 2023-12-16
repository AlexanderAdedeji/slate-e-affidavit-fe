import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Templates = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);

  const getTemplatesIds = () => {
    const templatesIds = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);

      if (key && key.startsWith("template -")) {
        templatesIds.push(key);
      }
    }
    setTemplates(templatesIds);
  };
  useEffect(() => {
    getTemplatesIds();
  }, []);
  return (
    <div>
      {templates.length > 0 ? (
        templates.map((template_id) => {
          return (
            <h2 onClick={() => navigate(`/create_document/${template_id}`)}>{template_id}</h2>
          );
        })
      ) : (
        <div className="min-h-screen border text-center align-center">
          <h2>No Templates</h2>
        </div>
      )}
    </div>
  );
};

export default Templates;
