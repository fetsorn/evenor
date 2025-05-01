import { onRecordEdit } from "@/store/index.js";

// https://css-tricks.com/auto-growing-inputs-textareas/
function calcHeight(value) {
  if (value === undefined) return 14;

  let numberOfLineBreaks = (value.match(/\n/g) || []).length;

  // min-height + lines x line-height + padding + border
  let newHeight = 0 + numberOfLineBreaks * 20 + 12 + 2;

  return newHeight;
}

function calcWidth(value) {
  if (value === undefined) return 14;

  let lines = value.split(/\n?\r/).map((s) => s.length);

  let length = Math.max(...lines);

  let maxWidth = 40;

  // min-width + lines x character-width + padding + border
  let newWidth = 0 + Math.min(maxWidth, length) * 0.75 + 2 + 1;

  return newWidth;
}

export function ProfileValue(props) {
  return (
    <>
      <label for={`profile-${props.branch}`}>{props.branch} - </label>

      <textarea
        id={`profile-${props.branch}`}
        onInput={async (event) => {
          const { selectionStart, selectionEnd, selectionDirection } =
            event.currentTarget;

          await onRecordEdit(props.path, event.target.value);

          event.currentTarget.value = props.value;

          // https://github.com/solidjs/solid/discussions/416#discussioncomment-6833805
          //event.currentTarget.setSelectionRange(
          //  selectionStart,
          //  selectionEnd,
          //  selectionDirection || "none",
          //);
        }}
        style={{
          height: `${calcHeight(props.value)}px`,
          width: `${calcWidth(props.value)}rem`,
        }}
      >
        {props.value}
      </textarea>
    </>
  );
}
