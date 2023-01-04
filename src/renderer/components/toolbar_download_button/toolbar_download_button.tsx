import React from "react";

export default function ButtonRepoDownload({ onDownload: any }) {
  return (
    <button
      type="button"
      title={t("list.button.download")}
      onClick={onDownload}
    >
      ⬇
    </button>
  );
}
