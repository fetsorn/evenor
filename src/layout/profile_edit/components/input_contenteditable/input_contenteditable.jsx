import React, { useRef } from "react";
import styles from "./input_contenteditable.module.css";
import ContentEditable from "react-contenteditable";

export function InputContenteditable({ branch, value, onFieldChange }) {
  const contentEditable = useRef();

  return (
    <ContentEditable
      innerRef={contentEditable}
      style={{ textDecoration: "underline" }}
      html={value}
      onChange={({ target: { value } }) => onFieldChange(branch, value)}
      tagName="span"
    />
  );
}
