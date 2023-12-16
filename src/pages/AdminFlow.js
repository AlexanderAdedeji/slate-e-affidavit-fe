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



import { htmlEscape } from "escape-goat";


import { Toolbar } from "../component/Toolbar";




const AdminFlow = ({ initialValue, renderElement, renderLeaf, editor }) => {

  const [fieldsIds, setFieldsIds] = useState([]);
  const [nextFieldOrder, setNextFieldOrder] = useState(0);

//   const [currentDocumentHtml, setCurrentDocumentHtml] = useState();

//   const templateIdRef = useRef();

  const turnIntoField = () => {
    if (!editor.selection || Range.isCollapsed(editor.selection)) return;
    // Check if there this is already a field

    const [match] = Editor.nodes(editor, {
      match: (n) => Element.isElement(n) && n.type === "field",
    });

    if (match) return;

    // Insert field element
    const fieldContent = Editor.string(editor, editor.selection);
    const fieldId = nanoid();

    Transforms.insertNodes(editor, {
      type: "field",
      id: fieldId,
      content: fieldContent,
      order: nextFieldOrder,
      children: [{ text: "" }],
    });

    setNextFieldOrder((order) => order + 1);
    setFieldsIds((ids) => [...ids, fieldId]);
  };

  const turnIntoEditable = () => {
    if (!editor.selection || Range.isCollapsed(editor.selection)) return;

    Transforms.setNodes(
      editor,
      { editable: true },
      { match: (n) => Text.isText(n), split: true }
    );
  };

  const turnIntoReadonly = () => {
    if (!editor.selection || Range.isCollapsed(editor.selection)) return;

    Transforms.setNodes(
      editor,
      { editable: false },
      { match: (n) => Text.isText(n), split: true }
    );
  };

  const saveTemplate = () => {
    const d = new Date();
    const dFormat = `${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}_${d.getDate()}-${
      d.getMonth() + 1
    }-${d.getFullYear()}`;

    localStorage.setItem(
      `template - ${dFormat}`,
      JSON.stringify(editor.children)
    );
    console.log(editor.children);
  };

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

        <span>
          <button style={{ margin: 10 }} onClick={() => turnIntoField()}>
            Turn into field
          </button>
          <button style={{ margin: 10 }} onClick={() => turnIntoEditable()}>
            Turn into editable
          </button>
          <button style={{ margin: 10 }} onClick={() => turnIntoReadonly()}>
            Turn into readonly
          </button>
          <button style={{ margin: 10 }} onClick={() => saveTemplate()}>
            Save Template
          </button>
        </span>
    

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
      {/* {currentDocumentHtml && (
        <div style={{ margin: 10, borderColor: "red" }}>
          {parse(currentDocumentHtml)}
        </div>
      )} */}
    </Slate>
  );
};

export default AdminFlow;
