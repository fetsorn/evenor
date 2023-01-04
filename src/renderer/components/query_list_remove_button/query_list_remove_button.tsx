import { useEffect, useState, useMemo } from "react";

export default function QueryList() {
  return (
    <a
      title={t("header.button.remove", { field: prop })}
      onClick={() => removeQuery(prop)}
      style={{ marginLeft: "5px", color: "red", cursor: "pointer" }}
    >
      X
    </a>
  );
}
