import { onSearch } from "@/store/index.js";

export function FilterOption(props) {
  return (
    <a onClick={() => onSearch(props.field, "")}>
      {props.field}
      <span> </span>
    </a>
  );
}
