import React from "react";

export default function ButtonRepoCreate({ onCreate: any }) {
  return (
    <Button
      type="button"
      title={t("list.button.new")}
      onClick={onCreate}
    ></Button>
  );
}
