import React from "react";

export default function HeaderBackButton() {
  return (
    <Button
      type="button"
      title={t("header.button.back")}
      onClick={() => navigate(-1)}
    >
      &lt;=
    </Button>
  );
}
