import React, {
  useRef,
  useMemo,
  useEffect,
  useCallback,
  useState,
} from "react";
import "../App.css";
import { Editor, createEditor, Transforms, Text, Element, Range } from "slate";
import {  toast } from "react-toastify";

import { Slate, Editable, withReact } from "slate-react";

import { nanoid } from "nanoid";

import { withHistory } from "slate-history";


import { htmlEscape } from "escape-goat";
import { createDocument, fetchSingleTemplate } from "../services/api_calls";

import { Toolbar } from "../component/Toolbar";
import { useParams, useNavigate } from "react-router-dom";

const UserFlow = ({ renderElement, renderLeaf, editor }) => {
 const navigate = useNavigate()
  let { id } = useParams();
  console.log(id);
  const [stateValue, setStateValue] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {});
  const editorValue = useMemo(() => stateValue, [stateValue]);

  const [fieldsIds, setFieldsIds] = useState([]);

  const templateIdRef = useRef();
  templateIdRef.current = id;

  useEffect(() => {
    setLoading(true);
    const getTemplate = async () => {
      try {
        const res = await fetchSingleTemplate(id);
        console.log(res);
        const parsedContent = JSON.parse(res.data.content);

        setStateValue(parsedContent);
        setLoading(false); // Set the fetched content as stateValue
      } catch (error) {
        console.error("Error fetching template:", error);
        setLoading(false);
      }
    };

    getTemplate();
  }, [id]);
  console.log({ stateValue });
  const saveDocument = async () => {
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

    const dataToSend = {
      name: "",
      template_id:templateIdRef.current,
      date: dFormat,
      document: document,
    };
    await createDocument(dataToSend)
      .then((res) => {
        console.log(res);
        toast.success("Document created successfully!")
        navigate("/my-documents");
      })
      .catch((error) => {
        console.log(error);
        toast.error("Something went wrong!")
      });
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

  return loading ? (
    "Loading"
  ) : (
    <Slate
      editor={editor}
      value={editorValue}
      onChange={(newValue) => {
        console.log(newValue);
        setStateValue(newValue);
        const fieldsElements = [];

        for (const node of newValue) {
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
          const content = JSON.stringify(newValue);
          localStorage.setItem("content", content);
        }
      }}
    >
      <div className="flex h-screen">
        {/* Editor Section */}
        <div className="flex flex-col flex-1 p-4 bg-white">
          <div className="flex items-center p-2 border-b">
            {/* Toolbar like the one beneath the "Untitled document" */}
            <Toolbar />
          </div>
          <div className="flex-grow p-4">
            {/* Editor like the "Untitled document" section */}
            <Editable
              renderElement={renderElement}
              renderLeaf={renderLeaf}
              className="w-full h-full bg-gray-100 p-4 rounded shadow-inner"
              placeholder="Type or paste (Ctrl+V) your text here or upload a document."
            />
          </div>
        </div>

        {/* Assistant Section */}
        <div className="w-1/3 p-4 bg-gray-50">
          <div className="flex flex-col h-full">
            {/* Similar to "Hide Assistant" section */}
            <div className="mb-4">
              <h2 className="text-lg font-semibold">All suggestions</h2>
              {/* Placeholder for assistant functionality */}
            </div>
            <div className="flex-grow">
              {/* Inputs like the "Generative AI" section */}
              {fieldsIds.map((fieldId) => (
                <input
                  key={fieldId}
                  type="text"
                  className="field mb-2 p-2 border border-gray-300 rounded w-full"
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
            <div className="text-center p-4">
              <button
                onClick={() => saveDocument()}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Save Document
              </button>
            </div>
          </div>
        </div>
      </div>
    </Slate>
  );
};

export default UserFlow;
