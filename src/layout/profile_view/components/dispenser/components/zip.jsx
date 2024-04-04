import React from "react";
import { API } from "../../../../../api/index.js";

export const schemaZip = {
  zip_tag: {
    trunk: "repo",
    type: "object",
    description: {
      en: "Zip archive tag",
      ru: "Тег zip архива",
    },
  },
};

export function Zip({ baseRecord }) {
  async function onZip() {
    const api = new API(baseRecord.UUID);

    await api.zip();
  }
  return (
    <button type="button" onClick={onZip}>
      ⬇️
    </button>
  );
}
