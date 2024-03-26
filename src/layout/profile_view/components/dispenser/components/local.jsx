import React from "react";

export const schemaLocal = {
  local_tag: {
    trunk: "tags",
    description: {
      en: "Local archive tag",
      ru: "Тег локального архива",
    },
  },
  local_path: {
    trunk: "local_tag",
    task: "directory",
    description: {
      en: "Path to asset archive",
      ru: "Путь к локальному архиву",
    },
  },
};

export function Local({ branchRecord }) {
  // TODO: add path picker
  return <p>{branchRecord.local_path}</p>;
}
