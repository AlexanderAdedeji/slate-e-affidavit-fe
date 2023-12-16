import React, {
  useRef,
  useMemo,
  useEffect,
  useCallback,
  useState,
} from "react";
import "./App.css";
import AdminFlow from "./pages/AdminFlow";
import { Editor, createEditor, Transforms, Text, Element, Range } from "slate";

import { Slate, Editable, withReact } from "slate-react";

import { nanoid } from "nanoid";

import { withHistory } from "slate-history";

import { htmlEscape } from "escape-goat";
import parse from "html-react-parser";

import { Toolbar } from "./component/Toolbar";
import UserFlow from "./pages/UserFlow";

import { Routes, Route } from "react-router-dom";
import MyDocument from "./pages/MyDocument";
import Templates from "./pages/Templates";
import ViewDocuments from "./pages/ViewDocuments";
import LandingPage from "./pages/LandingPage";

// import { initialValue } from "./InitialValue";

const isAdminState = {
  isAdmin: true,
};

const withFields = (editor) => {
  const { isInline, isVoid } = editor;

  editor.isInline = (element) => {
    return element.type === "field" ? true : isInline(element);
  };

  editor.isVoid = (element) => {
    return element.type === "field" ? true : isVoid(element);
  };

  return editor;
};

const App = () => {
  const [isAdmin, setIsAdmin] = useState(true);
  const [editor] = useState(() =>
    withFields(withReact(withHistory(createEditor())))
  );

  useEffect(() => {
    isAdminState.isAdmin = isAdmin;
  }, [isAdmin]);

  const [fieldsIds, setFieldsIds] = useState([]);
  const [nextFieldOrder, setNextFieldOrder] = useState(0);

  const [currentDocumentHtml, setCurrentDocumentHtml] = useState();

  const templateIdRef = useRef();

  const initialValue = useMemo(
    () =>
      JSON.parse(localStorage.getItem("content")) || [
        {
          type: "paragraph",
          children: [{ text: "A line of text in a paragraph." }],
        },
      ],
    []
  );

  const renderElement = useCallback(({ attributes, children, element }) => {
    console.log("element.align = " + element.align);
    switch (element.type) {
      case "field":
        return (
          <span
            {...attributes}
            contentEditable={false}
            style={{ fontWeight: "bold", backgroundColor: "yellow" }}
          >
            {children}
            {element.content}
          </span>
        );
      case "h1":
        return (
          <h2 style={{ textAlign: element.align }} {...attributes}>
            {children}
          </h2>
        );
      case "h2":
        return (
          <h3 style={{ textAlign: element.align }} {...attributes}>
            {children}
          </h3>
        );
      default:
        return (
          <p style={{ textAlign: element.align }} {...attributes}>
            {children}
          </p>
        );
    }
  }, []);

  const renderLeaf = useCallback((props) => {
    return <Leaf {...props} />;
  }, []);

  // const saveDocument = () => {
  //   const documentFields = [];

  //   for (const fieldId of fieldsIds) {
  //     for (const node of editor.children) {
  //       if (Element.isElement(node)) {
  //         for (const childNode of node.children) {
  //           if (
  //             Element.isElement(childNode) &&
  //             childNode.type === "field" &&
  //             childNode.id === fieldId
  //           ) {
  //             documentFields.push({
  //               fieldId: fieldId,
  //               fieldValue: childNode.content,
  //             });
  //           }
  //         }
  //       }
  //     }
  //   }

  //   const document = {
  //     templateId: templateIdRef.current,
  //     documentFields,
  //   };

  //   const d = new Date();
  //   const dFormat = `${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}_${d.getDate()}-${
  //     d.getMonth() + 1
  //   }-${d.getFullYear()}`;
  //   localStorage.setItem(`document - ${dFormat}`, JSON.stringify(document));
  // };

  // const serializeToHtml = (nodes, fields) => {
  //   return nodes.map((n) => serializeToHtmlHelper(n, fields)).join("");
  // };

  // const serializeToHtmlHelper = (node, fields) => {
  //   if (Text.isText(node)) {
  //     let textHtml = htmlEscape(node.text);

  //     if (node.code) {
  //       textHtml = `<code>${textHtml}</code>`;
  //     } else {
  //       if (node.bold) {
  //         textHtml = `<strong>${textHtml}</strong>`;
  //       }

  //       if (node.italic) {
  //         textHtml = `<em>${textHtml}</em>`;
  //       }
  //     }

  //     return textHtml;
  //   }

  //   const children = node.children
  //     .map((n) => serializeToHtmlHelper(n, fields))
  //     .join("");

  //   switch (node.type) {
  //     case "field":
  //       return `<span style="fontWeight:bold; backgroundColor:yellow;">${
  //         fields.find((fieldProps) => {
  //           return fieldProps.fieldId === node.id;
  //         })?.fieldValue
  //       }</span>`;
  //     default:
  //       return `<p>${children}</p>`;
  //   }
  // };

  const Leaf = ({ attributes, leaf, children }) => {
    if (leaf.bold) {
      console.log("leaf.bold = " + leaf.bold);
      children = <strong>{children}</strong>;
    }

    if (leaf.code) {
      children = <code>{children}</code>;
    }

    if (leaf.italic) {
      children = <em>{children}</em>;
    }

    if (leaf.underline) {
      children = <u>{children}</u>;
    }
    return (
      <span
        {...attributes}
        contentEditable={
          isAdminState.isAdmin
            ? true
            : leaf.editable !== undefined && leaf.editable
        }
        style={{
          backgroundColor:
            leaf.editable !== undefined && leaf.editable
              ? "lightblue"
              : undefined,
        }}
      >
        {children}
      </span>
    );
  };

  return (
    <>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage/>} />
          <Route path="/my-documents" element={<MyDocument />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/view-document/:id" element={<ViewDocuments />} />
          <Route
            path="/create_document/:id"
            element={
              <UserFlow
                initialValue={initialValue}
                renderElement={renderElement}
                renderLeaf={renderLeaf}
                editor={editor}
              />
            }
          />
          <Route
            path="/create-template/"
            element={
              <AdminFlow
                initialValue={initialValue}
                renderElement={renderElement}
                renderLeaf={renderLeaf}
                editor={editor}
              />
            }
          />
        </Routes>
      </div>
    </>
  );
};

export default App;
