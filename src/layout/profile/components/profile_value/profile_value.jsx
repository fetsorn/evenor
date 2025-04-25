import { ContentEditable } from "@bigmistqke/solid-contenteditable";
import { onRecordEdit } from "@/store/index.js";

export function ProfileValue(props) {
  return (
    <>
      <span className={`editable-${props.branch}`}>{props.branch} - </span>

      <ContentEditable
        textContent={props.value}
        onTextContent={(content) => onRecordEdit(props.path, content)}
        style={{ display: "inline-block", "min-width": "4rem" }}
      />

      <> </>
    </>
  );
}
