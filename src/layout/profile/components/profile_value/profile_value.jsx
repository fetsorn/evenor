import { onRecordEdit } from "@/store/index.js";

// https://css-tricks.com/auto-growing-inputs-textareas/
function calcHeight(value) {
  let numberOfLineBreaks = (value.match(/\n/g) || []).length;

  // min-height + lines x line-height + padding + border
  let newHeight = 0 + numberOfLineBreaks * 20 + 12 + 2;

  return newHeight;
}

export function ProfileValue(props) {
  return (
    <>
      <label for={`profile-${props.branch}`}>{props.branch} - </label>

      <textarea
        id={`profile-${props.branch}`}
        value={props.value}
        onInput={(e) => onRecordEdit(props.path, e.target.value)}
        style={{ height: `${calcHeight(props.value)}px` }}
      />
    </>
  );
}
