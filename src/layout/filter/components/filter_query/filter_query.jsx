import { onSearch } from "@/store/index.js";

export function FilterQuery(props) {
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
        onInput={(e) => onSearch(props.field, e.target.value)}
      />

      <Show when={canDelete(props.field)} fallback={<></>}>
        <button onClick={() => onSearch(props.field, undefined)}>X </button>
      </Show>
    </span>
  );
}
