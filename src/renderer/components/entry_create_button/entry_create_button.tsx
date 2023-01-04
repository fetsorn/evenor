import React from "react";

export default function EntryCreateButton() {
  return (
    <>
      {/* this comes from Row */}
      <div
        className={styles.add}
        title={t("line.button.add")}
        onClick={() => addEvent(data.date, data.events.length + 1)}
      >
        +
      </div>
      {/* this comes from timeline */}
      <button
        className={rowStyles.star}
        style={{ backgroundColor: "blue" }}
        type="button"
        onClick={() => addEvent("", "1")}
        title={t("line.button.add")}
        key="addevent"
      >
        +
      </button>
    </>
  );
}
