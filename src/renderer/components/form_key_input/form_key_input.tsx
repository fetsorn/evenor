import React from "react";

export default function ListTokenInput({ formToken: any }) {
  return (
    <input
      className={styles.input}
      type="password"
      value={formToken}
      title={t("list.field.token")}
      onChange={(e) => setToken(e.target.value)}
    />
  );
}
