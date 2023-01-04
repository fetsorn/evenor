import React from "react";

export default function TimelineSelectButton({
  event: any,
  index: any,
  onEntrySelect: any,
}) {
  return (
    <button
      className={styles.star}
      style={{ backgroundColor: colorExtension(event) }}
      type="button"
      onClick={() => onSelect(event, index + 1)}
      title={event?.FILE_PATH}
      id={event?.UUID}
      key={event}
    >
      {index + 1}
    </button>
  );
}
