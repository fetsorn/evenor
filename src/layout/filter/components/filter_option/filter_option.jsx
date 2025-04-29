import { onSearch } from "@/store/index.js";

export function FilterOption(props) {
  return (
    <button onClick={() => onSearch(props.field, "")}>{props.field}</button>
  );
}
