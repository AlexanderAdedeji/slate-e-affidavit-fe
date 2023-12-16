import React, {
  useRef,
  useMemo,
  useEffect,
  useCallback,
  useState,
} from "react";
import "../App.css";
import { Editor, createEditor, Transforms, Text, Element, Range } from "slate";

import { Slate, Editable, withReact } from "slate-react";

import { nanoid } from "nanoid";

import { withHistory } from "slate-history";

import { htmlEscape } from "escape-goat";
import parse from "html-react-parser";

import { Toolbar } from "../component/Toolbar";

// import { initialValue } from "./InitialValue";

const UserFlow = ({ initialValue, renderElement, renderLeaf, editor }) => {
  const [isAdmin, setIsAdmin] = useState(true);

  const [fieldsIds, setFieldsIds] = useState([]);
  const [nextFieldOrder, setNextFieldOrder] = useState(0);

  const [currentDocumentHtml, setCurrentDocumentHtml] = useState();

  const templateIdRef = useRef();

  const getTemplatesIds = () => {
    const templatesIds = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);

      if (key && key.startsWith("template -")) {
        templatesIds.push(key);
      }
    }
    return templatesIds;
  };

  const getDocumentsIds = () => {
    const documentsIds = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);

      if (key && key.startsWith("document -")) {
        documentsIds.push(key);
      }
    }
    return documentsIds;
  };

  const saveDocument = () => {
    const documentFields = [];

    for (const fieldId of fieldsIds) {
      for (const node of editor.children) {
        if (Element.isElement(node)) {
          for (const childNode of node.children) {
            if (
              Element.isElement(childNode) &&
              childNode.type === "field" &&
              childNode.id === fieldId
            ) {
              documentFields.push({
                fieldId: fieldId,
                fieldValue: childNode.content,
              });
            }
          }
        }
      }
    }

    const document = {
      templateId: templateIdRef.current,
      documentFields,
    };

    const d = new Date();
    const dFormat = `${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}_${d.getDate()}-${
      d.getMonth() + 1
    }-${d.getFullYear()}`;
    localStorage.setItem(`document - ${dFormat}`, JSON.stringify(document));
  };

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

  return (
    <Slate
      editor={editor}
      value={initialValue}
      onChange={(value) => {
        console.log(value);
        const fieldsElements = [];

        for (const node of value) {
          if (Element.isElement(node)) {
            for (const childNode of node.children) {
              if (Element.isElement(childNode) && childNode.type === "field") {
                fieldsElements.push(childNode);
              }
            }
          }
        }

        fieldsElements.sort((a, b) => a.order - b.order);
        setFieldsIds(fieldsElements.map((field) => field.id));

        const isAstChange = editor.operations.some(
          (op) => "set_selection" !== op.type
        );
        if (isAstChange) {
          // Save the value to Local Storage.
          const content = JSON.stringify(value);
          localStorage.setItem("content", content);
        }
      }}
    >

      <button
        style={{ margin: 10, borderColor: "red" }}
        onClick={() => setIsAdmin((isAdmin) => !isAdmin)}
      >
        {isAdmin ? "Change to End User" : "Change to Admin"}
      </button>

      <span>
        <button onClick={() => saveDocument()}>Save document</button>
      </span>

      {/* {
          <div>
            {getTemplatesIds().map((templateId) => (
              <div>
                <button
                  style={{ borderColor: "blue", backgroundColor: "white" }}
                  key={templateId}
                  onClick={() => {
                    templateIdRef.current = templateId;
                    const template = localStorage.getItem(templateIdRef.current);
  
                    if (template) {
                      const templateValue = JSON.parse(template);
  
                      // Get initial total nodes to prevent deleting affecting the loop
                      let totalNodes = editor.children.length;
  
                      // No saved content, don't delete anything to prevent errors
                      if (templateValue.length <= 0) return;
  
                      // Remove every node except the last one
                      // Otherwise SlateJS will return error as there's no content
                      for (let i = 0; i < totalNodes - 1; i++) {
                        console.log(i);
                        Transforms.removeNodes(editor, {
                          at: [totalNodes - i - 1],
                        });
                      }
  
                      // Add content to SlateJS
                      for (const value of templateValue) {
                        Transforms.insertNodes(editor, value, {
                          at: [editor.children.length],
                        });
                      }
  
                      // Remove the last node that was leftover from before
                      Transforms.removeNodes(editor, {
                        at: [0],
                      });
                    }
                  }}
                >
                  {templateId}
                </button>
              </div>
            ))}
          </div>
        } */}
      {/* <div>
          {getDocumentsIds().map((documentId) => (
            <div>
              <button
                key={documentId}
                style={{ borderColor: "green", backgroundColor: "white" }}
                onClick={() => {
                  const document = localStorage.getItem(documentId);
  
                  if (document) {
                    const documentValue = JSON.parse(document);
  
                    const template = localStorage.getItem(
                      documentValue.templateId
                    );
  
                    if (template) {
                      const templateValue = JSON.parse(template);
                      const documentHtml = serializeToHtml(
                        templateValue,
                        documentValue.documentFields
                      );
  
                      setCurrentDocumentHtml(documentHtml);
                    }
                  }
                }}
              >
                {documentId}
              </button>
            </div>
          ))}
        </div> */}

      <Toolbar />
      <div className="container">
        <Editable
          className="editorArea"
          renderElement={renderElement}
          renderLeaf={renderLeaf}
        />

        <div className="inputArea">
          {fieldsIds.map((fieldId) => (
            <input
              key={fieldId}
              type="text"
              className="field"
              onChange={(e) => {
                Transforms.setNodes(
                  editor,
                  { content: e.target.value },
                  {
                    at: [],
                    match: (node) =>
                      Element.isElement(node) &&
                      node.type === "field" &&
                      node.id === fieldId,
                  }
                );
              }}
            />
          ))}
        </div>
      </div>
      {currentDocumentHtml && (
        <div style={{ margin: 10, borderColor: "red" }}>
          {parse(currentDocumentHtml)}
        </div>
      )}
    </Slate>
  );
};

export default UserFlow;
