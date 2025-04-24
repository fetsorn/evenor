import { onSearch } from "@/store/index.js";
import { ContentEditable } from "@bigmistqke/solid-contenteditable";

export function FilterQuery(props) {
  // TODO base and sortby as spoiler options.

  const canDelete = (field) => field !== ".sortBy" && field !== "_";

  return (
    <span>
      <span>{props.field}: </span>

      <ContentEditable
        id={`filter-${props.field}`}
        textContent={props.value}
        onTextContent={(content) => onSearch(props.field, content)}
        style={{ display: "inline-block", "min-width": "4rem" }}
      />

      <span> </span>

      <Show when={canDelete(props.field)} fallback={<></>}>
        <a onClick={() => onSearch(props.field, undefined)}>X </a>
      </Show>
    </span>
  );
}
