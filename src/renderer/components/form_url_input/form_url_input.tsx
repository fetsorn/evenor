import React from "react";

export default function ListUrlInput({ formUrl: any }) {
  return (
    <input
      className={styles.input}
      type="text"
      value={formUrl}
      title={t("list.field.url")}
      onChange={(e) => setUrl(e.target.value)}
    />
  );
}
