import React, { useEffect, useState } from "react";
import { Editor, createEditor, Transforms, Text, Element, Range } from "slate";

import parse from "html-react-parser";
import { useParams, useLocation, useNavigate } from "react-router-dom";

import { htmlEscape } from "escape-goat";
import { fetchSingleDocument } from "../services/api_calls";

const ViewDocuments = () => {
  let { id } = useParams();
  console.log(id);





  const serializeToHtml = (nodes, fields) => {
    return nodes.map((n) => serializeToHtmlHelper(n, fields)).join("");
  };

  const serializeToHtmlHelper = (node, fields) => {
    if (Text.isText(node)) {
      let textHtml = htmlEscape(node.text);

      if (node.code) {
        textHtml = `<code>${textHtml}</code>`;
      } else {
        if (node.bold) {
          textHtml = `<strong>${textHtml}</strong>`;
        }

        if (node.italic) {
          textHtml = `<em>${textHtml}</em>`;
        }
      }

      return textHtml;
    }

    const children = node.children
      .map((n) => serializeToHtmlHelper(n, fields))
      .join("");

    switch (node.type) {
      case "field":
        return `<span style="fontWeight:bold; backgroundColor:yellow;">${
          fields.find((fieldProps) => {
            return fieldProps.fieldId === node.id;
          })?.fieldValue
        }</span>`;
      default:
        return `<p>${children}</p>`;
    }
  };
  const [currentDocumentHtml, setCurrentDocumentHtml] = useState();
  useEffect(() => {
    getDocument();
  }, []);

  // const getDocument = () => {
  //   const document = localStorage.getItem(id);
  //   console.log(document)

  //   if (document) {
  //     const documentValue = JSON.parse(document);

  //     const template = localStorage.getItem(documentValue.templateId);

  //     if (template) {
  //       const templateValue = JSON.parse(template);
  //       const documentHtml = serializeToHtml(
  //         templateValue,
  //         documentValue.documentFields
  //       );

  //       setCurrentDocumentHtml(documentHtml);
  //       console.log(currentDocumentHtml);
  //     }
  //   }
  // };

  const getDocument = async () => {
    await fetchSingleDocument(id)
      .then((res) => {

        console.log(res);

      const documentHtml = serializeToHtml(
        JSON.parse(res.data.template.content),
          res.data.documentFields
        );

        setCurrentDocumentHtml(documentHtml);
        console.log(currentDocumentHtml);
      })
      .catch((error) => {
        console.log("Error:", error);
      });
  };

  return (
    <div className="flex justify-center items-center">
    {currentDocumentHtml && (
        <div className="m-10 border border-red-500 p-4 rounded-lg relative">
            {parse(currentDocumentHtml)}

            {/* Close or Go Back Button */}
            {/* <button 
                // onClick={handleClose} // Define 'handleClose' function to close or go back
                className="absolute top-0 right-0 m-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
                Close
            </button> */}
        </div>
    )}
</div>

  );
};

export default ViewDocuments;
