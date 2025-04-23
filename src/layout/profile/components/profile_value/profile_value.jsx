import { ContentEditable } from "@bigmistqke/solid-contenteditable";

export function ProfileValue(props) {
  return (
    <ContentEditable
      textContent={props.value}
      onTextContent={(content) => props.onValueChange(content)}
      style={{ display: "inline-block", "min-width": "4rem" }}
    />
  );
}
