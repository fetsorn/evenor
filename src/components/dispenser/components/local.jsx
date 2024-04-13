import React from "react";

export const schemaLocal = {
  local_tag: {
    trunk: "repo",
    task: "dispenser",
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
  return (
    <div>
      <p>Local</p>
      <p>{branchRecord.local_path}</p>
    </div>
  );
}
