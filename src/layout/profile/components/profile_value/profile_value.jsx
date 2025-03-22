import { ContentEditable } from "@bigmistqke/solid-contenteditable";

export function ProfileValue(props) {
  return (
    <span>
      {props.branch} is
      <span> </span>
      <ContentEditable
        textContent={props.value}
        onTextContent={(content) => props.onValueChange(content)}
        style={{ display: "inline-block", "min-width": "4rem" }}
      />
    </span>
  );
}
