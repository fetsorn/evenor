import React, { useRef } from "react";
import styles from "./input_contenteditable.module.css";
import ContentEditable from "react-contenteditable";

export function InputContenteditable({ branch, value, onFieldChange }) {
  // requires ref for hooks
  // https://github.com/lovasoa/react-contenteditable/issues/161
  const contentEditable = useRef();

  return (
    <span className={styles.content}>
      <ContentEditable
        innerRef={contentEditable}
        id="textarea"
        className={styles.textarea}
        html={value}
        onChange={({ target: { value } }) => onFieldChange(branch, value)}
        tagName="span"
      />
    </span>
  );
}
