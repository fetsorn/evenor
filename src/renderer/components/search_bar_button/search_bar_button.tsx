import { useEffect, useState, useMemo } from "react";

export default function SearchBarButton() {
  return (
    <Button type="button" title={t("header.button.search")} onClick={addQuery}>
      🔎
    </Button>
  );
}
