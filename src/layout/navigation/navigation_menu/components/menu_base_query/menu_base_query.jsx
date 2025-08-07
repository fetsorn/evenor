import { onSearch } from "@/store/index.js";

export function MenuBaseQuery(props) {
  // TODO base and sortby as spoiler options.

  const canDelete = (field) => field !== ".sortBy" && field !== "_";

  return (
    <span>
      <label for={`filter-${props.field}`}>{props.field}: </label>

      <input
        type="text"
        id={`filter-${props.field}`}
        name={`filter-${props.field}`}
        value={props.value}
        onInput={async (event) => {
          const { selectionStart, selectionEnd, selectionDirection } =
            event.currentTarget;

          await onSearch(props.field, event.target.value);

          event.currentTarget.value = props.value;

          // https://github.com/solidjs/solid/discussions/416#discussioncomment-6833805
          //event.currentTarget.setSelectionRange(
          //  selectionStart,
          //  selectionEnd,
          //  selectionDirection || "none",
          //);
        }}
      />

      <Show when={canDelete(props.field)} fallback={<></>}>
        <button onClick={() => onSearch(props.field, undefined)}>X </button>
      </Show>
    </span>
  );
}
