import React, { useEffect, useState } from "react";
import { Editor, createEditor, Transforms, Text, Element, Range } from "slate";

import parse from "html-react-parser";
import { useParams, useLocation, useNavigate } from "react-router-dom";

import { htmlEscape } from "escape-goat";

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

  const getDocument = () => {
    const document = localStorage.getItem(id);
    console.log(document)

    if (document) {
      const documentValue = JSON.parse(document);

      const template = localStorage.getItem(documentValue.templateId);

      if (template) {
        const templateValue = JSON.parse(template);
        const documentHtml = serializeToHtml(
          templateValue,
          documentValue.documentFields
        );

        setCurrentDocumentHtml(documentHtml);
        console.log(currentDocumentHtml);
      }
    }
  };

  return (
    <div>
      {currentDocumentHtml && (
        <div style={{ margin: 10, borderColor: "red" }}>
          {parse(currentDocumentHtml)}
        </div>
      )}
    </div>
  );
};

export default ViewDocuments;
