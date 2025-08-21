import { onRecordEdit } from "@/store/index.js";
import styles from "./profile_value.module.css";

function calcWidth(value, textarea) {
  const defaultWidth = 50;

  // we will need parent's width later
  const noParent = textarea === undefined || textarea.parentElement === null;

  // if no value or parent, return default height
  if (value === undefined || noParent) return defaultWidth;

  let lines = value.split(/[\n\r]/).map((s) => s.length);

  const longestLine = Math.max(...lines) + 1;

  const style = window.getComputedStyle(textarea, null).getPropertyValue('font-size');

  const fontSize = parseFloat(style);

  // a letter is thinner than its font size
  const characterWidth = Math.round(fontSize * 0.65);

  // number-of-characters x character-width
  const lineWidth = longestLine * characterWidth;

  console.log(lineWidth);

  return Math.max(lineWidth, defaultWidth);
}

// https://css-tricks.com/auto-growing-inputs-textareas/
function calcHeight(value, textarea) {
  // 14 is default input height
  const defaultHeight = 14;

  // we will need parent's width later
  const noParent = textarea === undefined || textarea.parentElement === null;

  // if no value or parent, return default height
  if (value === undefined || noParent) return defaultHeight;

  const parentWidth = textarea.parentElement.getBoundingClientRect().width;

  // for some reason first newline is \\n and all subsequent are \n
  // probably broken until newline escape in csvs is fixed
  const lines = value.split(/[\n\r]/);

  // if any single line is longer than parent width,
  // divide line length by parent width
  // and add height to contain wrapped text
  const numberOfWrapBreaks = lines.reduce((withLine, line) => {
    const lineWidth = calcWidth(line, textarea);

    console.log(line, lineWidth, lineWidth / parentWidth)

    const wrap = Math.floor(lineWidth / parentWidth);

    return withLine + wrap;
  }, 0);

  const numberOfLineBreaks = lines.length;

  const numberOfLines = numberOfLineBreaks + numberOfWrapBreaks;

  const lineHeight = 20;

  // lines x line-height
  const rawHeight = numberOfLines * lineHeight;

  // min-height + padding + border
  const newHeight = 0 + rawHeight + 12 + 2;

  return newHeight;
}

// TODO write a common calc function

export function ProfileValue(props) {
  let textarea;

  return (
    <>
      <label for={`profile-${props.branch}`}>{props.branch} - </label>

      <textarea
        id={`profile-${props.branch}`}
        onInput={async (event) => {
          const { selectionStart, selectionEnd, selectionDirection } =
            event.currentTarget;

          /* TODO remove this escape after csvs is fixed */
          const escaped = event.target.value.replace("\n", "\\n");

          await onRecordEdit(props.path, escaped);

          /* TODO remove this unescape after csvs is fixed */
          const raw = props.value.replace("\\n", "\n");

          event.currentTarget.value = raw;

          // https://github.com/solidjs/solid/discussions/416#discussioncomment-6833805
          //event.currentTarget.setSelectionRange(
          //  selectionStart,
          //  selectionEnd,
          //  selectionDirection || "none",
          //);
        }}
        className={styles.input}
        ref={textarea}
        style={{
          height: `${calcHeight(props.value, textarea)}px`,
          width: `${calcWidth(props.value, textarea)}px`,
        }}
      >
        {props.value.replace("\\n", "\n")}
        {/* TODO remove this unescape after csvs if fixed */}
      </textarea>
    </>
  );
}
